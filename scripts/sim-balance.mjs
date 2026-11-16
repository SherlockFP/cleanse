// Balance sim (ECONOMY.md sections 6-7). Plays whole runs with five bots through the real src/core modules.
// Usage: node scripts/sim-balance.mjs [runsPerBot=2000] [--lookahead N] [--k N] [--bots a,b] [--quiet]
// --bots runs only the named bots (no-build, random, greedy, bag-focus, lookahead) or result keys (nb1 rnd1 g1 g6 g12 gfull bf1 bf6 bf12 la1); the raw-reel asserts (1, 14, 15, 17) are skipped then; asserts that need a bot that did not run are skipped.
// Exits 1 if an assert fails. play-cli.mjs imports the bots from here.
import { pathToFileURL } from 'node:url';
import { makeRng, hashSeed } from '../src/core/rng.js';
import { makeBag, drawGrid } from '../src/core/reel.js';
import { newRun, spin, togglePeg, canPeg, endTide, nextTide, enterLamplight } from '../src/core/run.js';
import { rollShop, buyOffer, removeToken, reroll, priceOf, effectiveOdds } from '../src/core/shop.js';
import { applyTrinkets } from '../src/core/trinkets.js';
import { LINES } from '../src/core/data/lines.js';
import { SYMBOLS } from '../src/core/data/symbols.js';
import { TRINKETS } from '../src/core/data/trinkets.js';
import { QUOTA, TIDES_PER_RUN } from '../src/core/econ.js';
import { EVENTS } from '../src/core/data/events.js';
import { CHARTS } from '../src/core/data/charts.js';

const SYM = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));
const FULL_POOL = ['start', 'cat_basket', 'radio', 'tea_corner'];
const TFAMILY = Object.fromEntries(TRINKETS.map((t) => [t.id, t.family]));
const FIRST = TRINKETS.filter((t) => t.grade === 1 && t.unlock === 'start');

// ---------- pegs ----------
// Pairs: two cells of a line that match (same symbol or Knot). Holding the pair lets the third cell land.
function pairsOf(grid) {
  const out = [];
  for (const L of LINES) {
    for (const id of new Set(L.cells.map((i) => grid[i]))) {
      const s = SYM[id];
      if (s.type !== 'line' && s.type !== 'wild') continue;
      const cells = L.cells.filter((i) => grid[i] === id || SYM[grid[i]].type === 'wild');
      if (cells.length === 2) out.push({ v: s.pay, cells });
    }
  }
  return out;
}

function clearPegs(run) {
  for (const c of [...run.held]) togglePeg(run, c);
}

function pegWith(run, chosen) {
  for (const c of chosen) if (run.held.length < run.pegsMax && canPeg(run, c)) togglePeg(run, c);
}

export function pegGreedy(run) {
  clearPegs(run);
  const g = run.grid, chosen = new Set();
  for (const p of pairsOf(g).sort((a, b) => b.v - a.v)) {
    const add = p.cells.filter((c) => !chosen.has(c));
    if (chosen.size + add.length <= run.pegsMax) add.forEach((c) => chosen.add(c));
  }
  // a spare peg keeps a tea or better symbol in place
  [...g.keys()].filter((i) => !chosen.has(i) && SYM[g[i]].pay >= 10 && SYM[g[i]].type !== 'special')
    .sort((a, b) => SYM[g[b]].pay - SYM[g[a]].pay || a - b)
    .forEach((i) => { if (chosen.size < run.pegsMax) chosen.add(i); });
  pegWith(run, [...chosen]);
}

function pegPairsRandom(run, rng) {
  clearPegs(run);
  const ps = pairsOf(run.grid);
  while (ps.length && run.held.length < run.pegsMax) {
    const p = ps.splice(rng.int(ps.length), 1)[0];
    if (run.held.length + p.cells.filter((c) => !run.held.includes(c)).length <= run.pegsMax) pegWith(run, p.cells);
  }
}

function pegCellsRandom(run, rng) {
  clearPegs(run);
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  while (run.held.length < run.pegsMax && cells.length) pegWith(run, [cells.splice(rng.int(cells.length), 1)[0]]);
}

// ---------- sampling (greedy and lookahead values) ----------
// Plays one tide of a run that is in phase 'tide' with greedy pegs; returns the jar at the end plus end-of-tide coins.
function playTide(c) {
  while (c.spin < c.spinsMax) {
    if (c.grid) pegGreedy(c);
    spin(c);
  }
  return c.jar + applyTrinkets('onTideEnd', c, { jar: c.jar }).coins;
}

// The run after one option is applied in the open shop and the next tide has started; jar0 is taken before nextTide.
function afterOption(run, opt) {
  const c = structuredClone(run);
  if (opt) {
    const r = opt.kind === 'offer' ? buyOffer(c, opt.i) : removeToken(c, opt.sym);
    if (!r.ok) return null;
  }
  const jar0 = c.jar;
  nextTide(c);
  return { c, jar0 };
}

// Mean income of the tide that follows, over K tides with the same K seeds for every option (common random numbers).
function meanIncome({ c, jar0 }, K, tag) {
  let sum = 0;
  for (let k = 0; k < K; k++) {
    const d = structuredClone(c);
    d.seed = hashSeed(tag + ':' + k);
    sum += playTide(d) - jar0;
  }
  return sum / K;
}

const pickCache = new Map();
// Best grade 1 start trinket for the free pick, by sampled tide income on the start bag.
export function bestPick(K = 150) {
  if (!pickCache.has(K)) {
    let best = null, bv = -1;
    for (const t of FIRST) {
      const run = newRun({ seed: 1, startTrinket: t.id });
      const v = meanIncome({ c: run, jar0: run.jar }, K, 'pick');
      if (v > bv) { bv = v; best = t.id; }
    }
    pickCache.set(K, best);
  }
  return pickCache.get(K);
}

// ---------- shops ----------
const log = (ctx, s) => ctx.buys.push(s);

// Buys each affordable offer in shelf order, no thought, no reroll.
function randomShop(run, ctx) {
  run.shop.offers.forEach((o, i) => { if (o && !o.sold && priceOf(run, o) <= run.jar && buyOffer(run, i).ok) log(ctx, `${o.kind}:${o.id ?? o.sym}`); });
}

// MIN_GAIN: coins of income over the horizon an option must add (below it, sampling noise wins the pick); MARGIN: share of the next quota kept as buffer.
const MIN_GAIN = 6, MARGIN = 0.5, MAX_REROLLS = 3;
// Greedy (value by sampled income of the next tide) and lookahead (more samples, also removals).
// family: only trinkets of that family are bought (assert 8); no tokens.
function sampledShop(run, ctx, { K, H, removals, family }) {
  // values are memoised until the state changes (a buy or removal), so a reroll only prices the new offers
  let memo = new Map();
  const value = (a, key, K, tag) => { if (!memo.has(key)) memo.set(key, meanIncome(a, K, tag)); return memo.get(key); };
  for (let guard = 0; guard < 16; guard++) {
    const opts = [];
    run.shop.offers.forEach((o, i) => {
      if (o && !o.sold && priceOf(run, o) <= run.jar && (!family || (o.kind === 'trinket' && TFAMILY[o.id] === family))) opts.push({ kind: 'offer', i, price: priceOf(run, o) });
    });
    const rp = priceOf(run, { kind: 'removal' });
    if (removals && rp <= run.jar) {
      for (const id of Object.keys(run.bag)) if (SYM[id].type === 'line') opts.push({ kind: 'removal', sym: id, price: rp });
    }
    const horizon = Math.max(1, Math.min(H, TIDES_PER_RUN - run.tide));
    const nextQ = QUOTA(run.tide + 1, run.installment);
    const stateTag = `${run.seed}:${run.tide}:${run.trinkets.length}:${run.removals}:${JSON.stringify(run.bag)}`;
    const mBase = value(afterOption(run, null), 'base', K, stateTag);
    let best = null;
    for (const o of opts) {
      const a = afterOption(run, o);
      if (!a) continue;
      const m = value(a, o.kind === 'offer' ? `${run.shop.offers[o.i].id ?? run.shop.offers[o.i].sym}:${o.price}` : `rm:${o.sym}:${o.price}`, K, stateTag);
      // coins have no other use once the next quota is safe, so value is the income gain; the margin keeps the next tide clearable
      const v = (m - mBase) * horizon;
      const withMargin = run.jar - o.price + m - nextQ, baseMargin = run.jar + mBase - nextQ;
      if (v > MIN_GAIN && (withMargin >= MARGIN * nextQ || withMargin >= baseMargin) && (!best || v > best.v)) best = { ...o, v };
    }
    if (!best) {
      // nothing worth buying: a rich bot rerolls (up to MAX_REROLLS a visit) while the next quota stays safe
      const price = priceOf(run, { kind: 'reroll' });
      if (run.shop.reroll >= MAX_REROLLS || price > run.jar || run.jar - price + mBase - nextQ < MARGIN * nextQ) return;
      reroll(run); log(ctx, 'reroll');
      continue;
    }
    if (best.kind === 'offer') {
      const o = run.shop.offers[best.i];
      buyOffer(run, best.i); log(ctx, `${o.kind}:${o.id ?? o.sym}`);
    } else { removeToken(run, best.sym); log(ctx, `remove:${best.sym}`); }
    memo = new Map();
  }
}

// Bag-focus: free pick only, no trinket buys. Spends the run's 3 removals first (the lone Gull can never make a line, then Pebbles,
// the most numerous and lowest pay), then buys Lanterns. Measured: buying Tea or rerolling for tokens lowers its win rate.
function bagShop(run, ctx) {
  for (let guard = 0; guard < 20; guard++) {
    const victim = ['gull', 'pebble'].find((id) => (run.bag[id] ?? 0) > 0);
    if (victim && removeToken(run, victim).ok) { log(ctx, `remove:${victim}`); continue; }
    const i = run.shop.offers.findIndex((o) => o && !o.sold && o.kind === 'token' && o.sym === 'lantern' && priceOf(run, o) <= run.jar);
    if (i >= 0 && buyOffer(run, i).ok) { log(ctx, 'token:lantern'); continue; }
    return;
  }
}

export const BOTS = {
  'no-build': { peg: 'greedy', pick: 'random', shop: null },
  random: { peg: 'greedy', pick: 'random', shop: randomShop },
  greedy: { peg: 'greedy', pick: 'best', shop: (r, c, o) => sampledShop(r, c, { K: o.k ?? 24, H: 3, removals: false, family: o.family }) },
  'bag-focus': { peg: 'greedy', pick: 'best', shop: bagShop },
  lookahead: { peg: 'greedy', pick: 'best', shop: (r, c, o) => sampledShop(r, c, { K: o.lookK ?? 40, H: 3, removals: true }) },
};

// ---------- one run ----------
// opts: seed, installment, unlocked, pegMode override ('cells' = random cells), startTrinket, chartId, eventId (fixed creditor event), family (greedy buys that family only), lamplight (play on after tide 5), k, lookK.
export function playRun(botName, opts = {}) {
  const bot = BOTS[botName];
  if (!bot) throw new Error('unknown bot ' + botName);
  const rng = makeRng(hashSeed(`bot:${botName}:${opts.seed}`));
  const startTrinket = opts.startTrinket ?? (bot.pick === 'random' ? rng.pick(FIRST).id : bestPick());
  const run = newRun({ seed: opts.seed, installment: opts.installment ?? 1, startTrinket, unlocked: opts.unlocked ?? ['start'], chartId: opts.chartId ?? null, eventId: opts.eventId ?? null });
  const mode = opts.pegMode ?? bot.peg;
  const ctx = { buys: [] };
  const tides = [];
  let maxRatio = 0;
  while (run.phase === 'tide' || run.phase === 'lamplight') {
    if (run.phase === 'lamplight') {
      if (!opts.lamplight || run.tide >= 30) break;
      enterLamplight(run);
      rollShop(run); bot.shop?.(run, ctx, opts); nextTide(run);
    }
    const rec = { t: run.tide, quota: run.quota, income: 0, spins: 0, zero: 0, spend: 0, cleared: false, mercy: false };
    while (run.spin < run.spinsMax) {
      if (run.grid) {
        if (mode === 'greedy') pegGreedy(run);
        else if (mode === 'pairsRandom') pegPairsRandom(run, rng);
        else if (mode === 'cells') pegCellsRandom(run, rng);
      }
      const r = spin(run);
      rec.income += r.total; rec.spins++; if (r.total === 0) rec.zero++;
      maxRatio = Math.max(maxRatio, r.total / run.quota);
    }
    const e = endTide(run);
    rec.cleared = e.paid; rec.mercy = e.mercy;
    tides.push(rec);
    if (run.phase === 'shop') {
      rollShop(run);
      const before = run.jar;
      bot.shop?.(run, ctx, opts);
      rec.spend = before - run.jar;
      nextTide(run);
    }
  }
  const s = run.stats;
  return {
    won: run.won, tidesCleared: s.tidesCleared, lastTide: run.tide, tides, maxRatio, mercy: run.mercyUsed > 0, buys: ctx.buys, hash: run.h,
    planks: 2 * s.tidesCleared + (run.won ? 5 : 0) + s.clutches,
  };
}

// ---------- aggregate ----------
export function runMany(botName, n, opts = {}) {
  const A = {
    bot: botName, n, wins: 0, last: [], mercy: 0, planks: 0, maxRatio: 0, buys: {}, installment: opts.installment ?? 1,
    t: Array.from({ length: 40 }, () => ({ reached: 0, cleared: 0, income: 0, spins: 0, zero: 0, spend: 0 })),
  };
  const tag = `${opts.installment ?? 1}:${(opts.unlocked ?? ['x']).length}:${opts.pegMode ?? ''}`;
  for (let i = 0; i < n; i++) {
    const r = playRun(botName, { ...opts, seed: hashSeed(`sim:${botName}:${tag}:${i}`) });
    A.wins += r.won; if (r.won) A.last.push(r.lastTide);
    A.mercy += r.mercy; A.planks += r.planks; A.maxRatio = Math.max(A.maxRatio, r.maxRatio);
    r.buys.forEach((b) => { A.buys[b] = (A.buys[b] ?? 0) + 1; });
    for (const x of r.tides) {
      const T = A.t[x.t];
      T.reached++; T.cleared += x.cleared; T.income += x.income; T.spins += x.spins; T.zero += x.zero; T.spend += x.spend;
    }
  }
  A.win = A.wins / n;
  return A;
}

// ---------- raw reel measurements (asserts 1, 17) ----------
function rawTides(n, pegged) {
  let coins = 0, spins = 0, zero = 0;
  for (let i = 0; i < n; i++) {
    const run = newRun({ seed: hashSeed('raw:' + i) });
    for (let s = 0; s < run.spinsMax; s++) {
      if (pegged && run.grid) pegGreedy(run);
      const r = spin(run);
      coins += r.total; spins++; if (r.total === 0) zero++;
    }
  }
  return { perSpin: coins / spins, perTide: (coins / spins) * 6, zero: zero / spins };
}

function shopGrades(pool, shops) {
  const counts = [0, 0, 0, 0];
  let total = 0;
  for (let i = 0; i < shops; i++) {
    const run = newRun({ seed: hashSeed('shop:' + i), unlocked: pool });
    run.phase = 'shop';
    for (const o of rollShop(run).offers) if (o?.kind === 'trinket') { counts[o.grade - 1]++; total++; }
  }
  return { obs: counts.map((c) => c / total), want: effectiveOdds(newRun({ seed: 1, unlocked: pool })).grades };
}

function honestOdds(grids) {
  const run = newRun({ seed: 1 }), bag = makeBag(run.bag), n = {};
  for (let i = 0; i < grids; i++) for (const id of drawGrid(bag, makeRng(hashSeed('draw:' + i)), 1, 1, null, [])) n[id] = (n[id] ?? 0) + 1;
  let worst = 0;
  for (let k = 0; k < bag.ids.length; k++) worst = Math.max(worst, Math.abs(n[bag.ids[k]] / (grids * 9) - bag.weights[k] / bag.size));
  return worst;
}

// ---------- main ----------
const pct = (x) => (x * 100).toFixed(1) + '%';
const f1 = (x) => x.toFixed(1);

export function table(A) {
  const L = [`${A.bot}, installment ${A.installment}: ${A.n} runs, win ${pct(A.win)}, planks ${f1(A.planks / A.n)}, mercy ${pct(A.mercy / A.n)}`];
  L.push('| Tide | Quota | Reached | Cleared (cumulative) | Clear given reached | Coins per spin | Income per tide | Mean spend |');
  L.push('|---|---|---|---|---|---|---|---|');
  A.t.forEach((T, t) => {
    if (t === 0 || !T.reached) return;
    L.push(`| ${t} | ${QUOTA(t, A.installment)} | ${pct(T.reached / A.n)} | ${pct(T.cleared / A.n)} | ${pct(T.cleared / T.reached)} | ${(T.income / T.spins).toFixed(2)} | ${f1(T.income / T.reached)} | ${f1(T.spend / T.reached)} |`);
  });
  return L.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const num = (flag, d) => { const i = argv.indexOf(flag); return i >= 0 ? Number(argv[i + 1]) : d; };
  const flagVals = new Set(['--lookahead', '--k', '--bots']);
  const pos = argv.filter((a, i) => !a.startsWith('--') && !flagVals.has(argv[i - 1]));
  const N = Number(pos[0] ?? 2000), LN = num('--lookahead', Math.max(100, Math.round(N / 5))), K = num('--k', 24);
  const quiet = argv.includes('--quiet');
  const only = argv.includes('--bots') ? argv[argv.indexOf('--bots') + 1].split(',') : null;
  const want = (bot) => !only || only.includes(bot);
  const out = (s) => { if (!quiet) console.log(s); };
  const results = [];
  const check = (n, name, ok, text) => results.push({ n, name, ok, text });
  // Sampling noise: bands widen by 2.5 standard errors at n runs.
  const se = (p, n) => 2.5 * Math.sqrt(Math.max(p * (1 - p), 0.0025) / n);
  const inBand = (p, lo, hi, n) => p >= lo - se(p, n) && p <= hi + se(p, n);
  const t0 = Date.now();
  const O = { k: K };

  out(`sim-balance: ${N} runs per bot (${LN} for lookahead), greedy samples K=${K}\n`);

  const rawN = Math.max(4000, N * 4);
  const r0 = !only && rawTides(rawN, false), r3 = !only && rawTides(rawN, true);
  if (!only) out(`Start bag, no trinkets, ${rawN} tides: no pegs ${f1(r0.perTide)}/tide (${r0.perSpin.toFixed(2)}/spin, zero ${pct(r0.zero)}); 3 pegs ${f1(r3.perTide)}/tide (${r3.perSpin.toFixed(2)}/spin, zero ${pct(r3.zero)})\n`);
  if (!only) check(1, 'start bag per spin', r0.perSpin >= 4.6 && r0.perSpin <= 5.6 && r3.perSpin >= 7.0 && r3.perSpin <= 8.5 && r3.zero >= 0.30 && r3.zero <= 0.42,
    `no pegs ${r0.perSpin.toFixed(2)}/spin, 3 pegs ${r3.perSpin.toFixed(2)}/spin, zero-pay with pegs ${pct(r3.zero)}`);
  const gain = !only && r3.perTide / r0.perTide - 1;
  if (!only) check(17, 'pegs add at least 40% (GATE)', gain >= 0.4, `3 pegs raise tide income ${f1(r0.perTide)} -> ${f1(r3.perTide)} = +${pct(gain)}`);

  const R = {};
  const run = (key, bot, n, o) => { if (!want(bot) && !want(key)) return; R[key] = runMany(bot, n, { ...O, ...o }); out(table(R[key]) + '\n'); };
  run('nb1', 'no-build', N, {});
  run('rnd1', 'random', N, {});
  const rp1 = want('random') && runMany('random', N, { ...O, pegMode: 'cells' });
  const rp12 = want('random') && runMany('random', N, { ...O, pegMode: 'cells', installment: 12 });
  const has = (...k) => k.every((x) => R[x]);
  run('g1', 'greedy', N, {});
  run('g6', 'greedy', N, { installment: 6 });
  run('g12', 'greedy', N, { installment: 12 });
  run('gfull', 'greedy', N, { unlocked: FULL_POOL });
  run('bf1', 'bag-focus', N, {});
  run('bf6', 'bag-focus', N, { installment: 6 });
  run('bf12', 'bag-focus', N, { installment: 12 });
  if (LN > 0) run('la1', 'lookahead', LN, { lookK: K * 3 });

  const t1 = (A) => A.t[1].cleared / A.t[1].reached;
  const noise = 2.5 * Math.sqrt(0.5 / N);
  const worst = Math.max(...Object.values(R).map((A) => A.maxRatio));
  if (rp1) check(2, 'tide 1 pass >= 0.90, random pegs', t1(rp1) >= 0.9 && t1(rp12) >= 0.9 && QUOTA(1, 1) === 15 && QUOTA(1, 12) === 15, `installment 1 ${pct(t1(rp1))}, installment 12 ${pct(t1(rp12))}, quota ${QUOTA(1, 1)}/${QUOTA(1, 12)}`);
  if (has('nb1')) check(3, 'no-build win < 0.02', R.nb1.win < 0.02, `win ${pct(R.nb1.win)}`);
  if (has('rnd1')) check(4, 'random-buyer win 0.10-0.15', inBand(R.rnd1.win, 0.10, 0.15, N), `win ${pct(R.rnd1.win)}`);
  if (has('g1', 'g6', 'g12')) check(5, "greedy win 25-35 / 15-25 / 10-15 (no Orhan's Test)", inBand(R.g1.win, 0.25, 0.35, N) && inBand(R.g6.win, 0.15, 0.25, N) && inBand(R.g12.win, 0.10, 0.15, N), `installment 1 ${pct(R.g1.win)}, 6 ${pct(R.g6.win)}, 12 ${pct(R.g12.win)}`);
  if (has('g1', 'gfull')) check(6, 'start pool vs full lite pool gap <= 0.08', Math.abs(R.g1.win - R.gfull.win) <= 0.08 + noise, `start ${pct(R.g1.win)}, full lite ${pct(R.gfull.win)}`);
  if (Object.keys(R).length) check(10, 'one spin <= 40 x quota', worst <= 40, `worst spin / quota = ${worst.toFixed(2)}`);
  if (has('g1')) check(13, 'mercy fires in 8-20% of greedy runs', inBand(R.g1.mercy / N, 0.08, 0.20, N), pct(R.g1.mercy / N));
  const a14 = !only && shopGrades(['start'], 20000), b14 = !only && shopGrades(FULL_POOL, 20000), h14 = !only && honestOdds(111112);
  const dev = (a) => Math.max(...a.obs.map((x, i) => Math.abs(x - a.want[i])));
  if (!only) check(14, 'shop grade odds and honest cell odds', dev(a14) <= 0.01 && dev(b14) <= 0.01 && h14 <= 0.005,
    `start pool (${a14.want.map((x) => (x * 100).toFixed(1)).join('/')}) worst gap ${(dev(a14) * 100).toFixed(2)} pt, full lite pool (${b14.want.map((x) => (x * 100).toFixed(1)).join('/')}) ${(dev(b14) * 100).toFixed(2)} pt, cell frequency ${(h14 * 100).toFixed(3)} pt over 1,000,008 draws`);
  let same = true;
  for (let i = 0; i < 12 && !only; i++) {
    const bot = ['greedy', 'random', 'bag-focus', 'no-build'][i % 4];
    same = same && playRun(bot, { seed: 900 + i, k: 4 }).hash === playRun(bot, { seed: 900 + i, k: 4 }).hash;
  }
  if (!only) check(15, 'same seed, same hash', same, '12 bot runs, each twice');
  if (has('g1')) check(16, 'planks per greedy run 8-12', R.g1.planks / N >= 8 && R.g1.planks / N <= 12, f1(R.g1.planks / N));
  if (has('bf1', 'bf6', 'bf12', 'g6', 'g12')) check(18, 'bag-focus win 0.15-0.35, not above greedy at 6 and 12', inBand(R.bf1.win, 0.15, 0.35, N) && R.bf6.win <= R.g6.win + noise && R.bf12.win <= R.g12.win + noise,
    `installment 1 ${pct(R.bf1.win)}; 6: ${pct(R.bf6.win)} vs greedy ${pct(R.g6.win)}; 12: ${pct(R.bf12.win)} vs greedy ${pct(R.g12.win)}`);
  const top = (A) => Object.entries(A.buys).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} x${v}`).join(', ');
  if (R.la1) check(19, 'lookahead win < 0.50', R.la1.win < 0.5, `win ${pct(R.la1.win)}; most bought: ${top(R.la1)}`);
  if (R.bf1) out(`Bag-focus most bought (installment 1): ${top(R.bf1)}`);
  if (R.g1) out(`Greedy most bought (installment 1): ${top(R.g1)}\n`);

  // ---- extra asserts (7, 8, 9, 11, 12): lite pool, M runs each, paired seeds with the same-size baseline ----
  const doExtra = !only || only.includes('extra');
  if (doExtra) {
    const M = Math.min(N, 300), noiseM = 2.5 * Math.sqrt(0.5 / M);
    const g = (o) => runMany('greedy', M, { ...O, ...o });
    const base = g({});
    out(`extra asserts: ${M} greedy runs each, baseline win ${pct(base.win)}
`);
    // 7: dead-trinket half, read from the full-lite-pool greedy runs (needs gfull)
    if (R.gfull) {
      const dead = TRINKETS.filter((t) => t.unlock === 'start' || FULL_POOL.includes(t.unlock)).filter((t) => (R.gfull.buys['trinket:' + t.id] ?? 0) / N < 0.01).map((t) => t.id);
      check(7, 'every lite trinket bought in >= 1% of full-pool greedy runs (dead-trinket half only)', dead.length === 0, dead.length ? 'never bought enough: ' + dead.join(', ') : 'all 35 bought');
    }
    // 8: greedy forced into one trinket family, full lite pool, win must stay inside 0.12-0.45
    const fam = {};
    for (const family of [...new Set(TRINKETS.map((t) => t.family))]) fam[family] = runMany('greedy', M, { ...O, unlocked: FULL_POOL, family }).win;
    check(8, 'forced single family wins 0.12-0.45', Object.values(fam).every((w) => inBand(w, 0.12, 0.45, M)), Object.entries(fam).map(([k, w]) => `${k} ${pct(w)}`).join(', '));
    // 9: Lamplight: greedy plays on after tide 5
    const lamp = runMany('greedy', M, { ...O, lamplight: true });
    const med = lamp.last.length ? lamp.last.sort((x, y) => x - y)[lamp.last.length >> 1] : 0;
    const past14 = lamp.last.filter((t) => t > 14).length / M;
    check(9, 'Lamplight: median last tide of winners 7-9, under 0.5% pass tide 14', med >= 7 && med <= 9 && past14 < 0.005, `median last tide ${med} (${lamp.last.length} winners of ${M}), pass tide 14: ${pct(past14)}`);
    // 11: the core always puts a creditor event on tide 5, so "event vs no event" cannot be measured. Substitute: force each lite
    // event on tide 5; no event may sit more than 10 points from the mean tide-5 pass rate of the four.
    const p5 = (A) => A.t[5].cleared / A.t[5].reached;
    const ev = {};
    for (const e of EVENTS) ev[e.id] = p5(g({ eventId: e.id }));
    const mean = Object.values(ev).reduce((x, y) => x + y, 0) / EVENTS.length;
    check(11, 'lite events: tide-5 pass within 10 points of the mean of the four (spread substitute)', Object.values(ev).every((p) => Math.abs(p - mean) <= 0.10 + noiseM / 2), `mean ${pct(mean)}; ` + Object.entries(ev).map(([k, p]) => `${k} ${pct(p)}`).join(', '));
    // 12: each Tide Chart moves the greedy win rate by at most 6 points
    const ch = {};
    for (const c of CHARTS) ch[c.id] = g({ chartId: c.id }).win - base.win;
    check(12, 'each chart moves greedy win by <= 6 points', Object.values(ch).every((d) => Math.abs(d) <= 0.06 + noiseM / 2), Object.entries(ch).map(([k, d]) => `${k} ${d >= 0 ? '+' : ''}${(d * 100).toFixed(1)}`).join(', '));
  }
  const NOT_DONE = {
    7: 'dominance half (remove one trinket or token from the pool, re-run greedy) not built: the shop has no pool-exclusion hook; Kelp and Cormorant tests not built',
    11: 'the 5-15 point drop versus no event cannot be measured (tide 5 always has an event); built as a spread check over the 4 lite events (stamp_duty, collector, gull_strike are not in the lite pool)',
  };
  if (only) for (const [k, A] of Object.entries(R)) console.log(`${k}: win ${pct(A.win)} (${A.n} runs)`);
  let bad = 0;
  for (const r of results.sort((a, b) => a.n - b.n)) {
    console.log(`${r.ok ? 'ok  ' : 'FAIL'} assert ${r.n}: ${r.name} | ${r.text}`);
    if (!r.ok) bad++;
  }
  for (const [n, why] of Object.entries(NOT_DONE)) out(`partial assert ${n}: ${why}`);
  console.log(`sim-balance: ${bad ? bad + ' failed' : 'ok'} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  process.exit(bad ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
