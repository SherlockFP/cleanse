// Quick balance sim: a random, a greedy and a smart bot, 300 runs each (under 2 minutes).
// node scripts/sim-quick.mjs [--n 300] [--contract c1] [--char nim] [--bots random,greedy,smart] [--endless]
// SMART_BAD=<decision> makes the smart bot take the bad side of one decision, to measure what that decision is worth:
//   shop heat heat0 bankasap bankrich deal terms bench tricks order redraw skip skip0
import { makeRng } from '../src/core/rng.js';
import { CHARMS, CHARM, CONFIG, SYM, SCORING, TRICK, CONTRACT } from '../src/core/data.js';
import {
  newRun, pickTerms, termsOffer, stoke, spin, collect, endRound, bank, leaveShop, declinePawn, pawn, useTrick, redrawFavourite, redrawCost,
  canSkip, skipRound, skipReward, canContinue, continueEndless,
} from '../src/core/run.js';
import { buyCharm, buyTrick, price, canPay, sellCharm, reroll, takeWaiting, doBench, buySlot } from '../src/core/shop.js';
import { signDeal, refuseDeals } from '../src/core/deals.js';
import { setExplain, slotsOf, scaleOf, snapshot, symValueOf, symMultOf, weightOf, pocketsOf } from '../src/core/effects.js';
import { buildWeights } from '../src/core/machine.js';
import { findPatterns, PATTERN } from '../src/core/patterns.js';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';

// A bot is {terms, stokeTo, shop, deal, pawn} plus optional {beforeSpin, post, roundEnd}. rng is the bot's own stream, never the run's.
// terms may return SKIP to skip the night.
export const SKIP = '__skip';
export const BOTS = {
  random: {
    terms: (run, offer, rng) => rng.pick(offer).id,
    stokeTo: (run, rng) => rng.int(7),
    shop(run, rng) {
      for (let k = 0; k < 4; k++) if (rng.next() < 0.5) buyCharm(run, rng.int(Math.max(1, run.shop.charms.length)));
      if (rng.next() < 0.3) reroll(run);
    },
    deal: (run, rng) => (rng.next() < 0.5 ? signDeal(run, run.dealOffer[0]) : refuseDeals(run)),
    pawn: (run, rng) => (rng.next() < 0.5 ? pawn(run, 0) : declinePawn(run)),
  },
  greedy: {
    terms: (run, offer) => offer.reduce((a, b) => (b.spins > a.spins ? b : a)).id,
    stokeTo: () => 4,
    shop(run) {
      for (let i = run.waiting.length - 1; i >= 0; i--) takeWaiting(run, i);
      // dearest charm it can pay for (price is the bot's only idea of quality), until nothing fits
      for (;;) {
        if (run.charms.length >= slotsOf(run)) break;
        let best = -1, bestCost = -1;
        run.shop.charms.forEach((id, i) => {
          const p = price(run, { kind: 'charm', id });
          const cost = p.coins ? p.coins / scaleOf(run) : 100 + p.wick;
          if (canPay(run, p) && cost > bestCost) { best = i; bestCost = cost; }
        });
        if (best < 0 || !buyCharm(run, best)) break;
      }
    },
    deal: (run) => signDeal(run, run.dealOffer[0]),
    pawn: (run) => declinePawn(run),
  },
};

// ---------- smart: a decent human ----------
// It tries things out in its head: a copy of the run plays one 5-spin night on fixed practice seeds, and the coins it makes
// (Wick counted at the going rate of one spin) are the value of a choice. Shop offers, deals, terms and bench jobs are all priced
// that way against its current build. It keeps coins when interest pays better than a buy, stokes Heat to the level with the best
// expected pay after the Scorch risk, pays a debt early when the carried spins and Wick beat playing the nights out, and refuses
// deals that cost more than they give.
// SIM_DEBTS=a,b,c overrides the debts of the contract under test (tuning probe; the real numbers live in gen-v2-data.py)
if (process.env.SIM_DEBTS) for (const c of Object.values(CONTRACT)) if (c.id === (process.env.SIM_C || 'c1')) c.debts = process.env.SIM_DEBTS.split(',').map(Number);
const BAD = process.env.SMART_BAD || '';
const EVK = Number(process.env.SMART_EVK || 4); // practice nights per estimate
const clone = (r) => JSON.parse(JSON.stringify(r));
const mem = new WeakMap(); // per-run notes: average spin pay, what each symbol paid
const note = (run) => {
  let m = mem.get(run);
  if (!m) mem.set(run, (m = { spin: 0, n: 0, base: 0, sym: {} }));
  return m;
};
const spinPay = (run) => Math.max(1, note(run).n ? note(run).spin : 10 * scaleOf(run) ** 0.75);
const wickValue = (run) => spinPay(run) * 0.4; // an Hourglass turns Wick into spins 1:1, but it is seldom on offer
const roundsLeftInRun = (run) => Math.max(1, (run.endless ? 2 : CONTRACT[run.contract].debts.length - run.debtIdx - 1) * 3 + run.rounds - run.round);

function heatFor(run, h, mods) {
  const wt = buildWeights({ ...run, heat: h }, mods, run.favs);
  const ai = wt.ids.indexOf('ash');
  const total = wt.weights.reduce((a, b) => a + b, 0);
  const p = total ? wt.weights[ai] / total : 0;
  const need = Math.max(CONFIG.heat.scorchAsh, mods.flags.scorchNeeds || 0);
  let below = 0, c = 1; // P(fewer than `need` Ash in 15 cells)
  for (let k = 0; k < need; k++) { below += c * p ** k * (1 - p) ** (15 - k); c = (c * (15 - k)) / (k + 1); }
  return 1 - below;
}
// Heat with the best expected pay: (1 - P(scorch)) x pay at that Heat - P(scorch) x burned purse.
function bestHeat(run) {
  const mods = snapshot(run);
  if (mods.flags.noStoke) return 0;
  if (BAD === 'heat') return CONFIG.heat.max;
  if (BAD === 'heat0') return 0;
  const step = (mods.flags.heatStep ?? CONFIG.heat.payoutPerLevel * 100) / 100;
  const forge = mods.allMult.filter((r) => r.src.id === 'smiths_forge').length ? 1.08 : 1;
  const base = Math.max(1, note(run).base || spinPay(run) / 1.6);
  const burn = (mods.flags.scorchBurn || CONFIG.heat.scorchBurnPct) / 100;
  let best = run.heat, bv = -Infinity;
  for (let h = run.heat; h <= CONFIG.heat.max; h++) {
    const ps = run.noScorch ? 0 : heatFor(run, h, mods);
    const v = (1 - ps) * base * (1 + step * h) * forge ** h - ps * run.purse * burn;
    if (v > bv) { bv = v; best = h; }
  }
  return best;
}

// One practice night on a copy: coins + banked + Wick (at the going rate) gained.
function nightValue(run, mut, termsId = 'steady') {
  let tot = 0;
  const w = wickValue(run), heat = bestHeat(run);
  for (let k = 0; k < EVK; k++) {
    const c = clone(run);
    c.seed = 'ev' + k + ':' + run.debtIdx + ':' + run.round; c.rngState = {};
    c.phase = 'terms'; c.round = 0; c.rounds = 3; c.termsOffer = [termsId]; c.tut = false; c.carrySpins = 0;
    if (mut && mut(c) === false) return -Infinity;
    if (c.phase !== 'terms') { c.phase = 'terms'; c.termsOffer = [termsId]; }
    const v0 = c.purse + c.banked + c.wick * w;
    if (!pickTerms(c, termsId)) return -Infinity;
    for (let g = 0; g < 60 && (c.phase === 'spin' || c.phase === 'post'); g++) {
      if (c.phase === 'spin') { while (c.heat < heat && stoke(c)) ; spin(c); } else collect(c);
    }
    if (c.phase === 'roundend') endRound(c);
    tot += c.purse + c.banked + c.wick * w - v0;
  }
  return tot / EVK;
}

const growth = (id) => CHARM[id].rules.some((r) => r.effects.some((e) => e.type === 'stack' || (r.trigger !== 'passive' && !e.scope && ['symValue', 'symMult', 'patMult'].includes(e.type))));
// The value of holding `id` over the rest of the run; a charm that charges up is tried with the charges it should average.
function withCharm(run, id, out = -1) {
  return (c) => {
    if (out >= 0) c.charms.splice(out, 1);
    c.charms.push({ id, stack: growth(id) ? Math.min(8, Math.round(roundsLeftInRun(run) / 4)) : 0, counters: {} });
  };
}

function orderCharms(run) {
  const at = (id) => run.charms.findIndex((c) => c.id === id);
  const move = (id, to) => { const i = at(id); if (i >= 0) run.charms.splice(to < 0 ? run.charms.length : to, 0, run.charms.splice(i, 1)[0]); };
  // front: Opening Act, then Lead Goose; back: Caboose Lamp, then The Closer. Bad order is the mirror image.
  const front = ['lead_goose', 'opening_act'], back = ['caboose', 'closer'];
  if (BAD === 'order') { for (const id of back) move(id, 0); for (const id of front) move(id, -1); return; }
  for (const id of front) move(id, 0);
  for (const id of back) move(id, -1);
  const u = at('understudy');
  if (u >= 0) { // the copier sits just left of the charm worth most to copy
    const base = nightValue(run);
    let best = -1, bv = -Infinity;
    run.charms.forEach((c, i) => {
      if (c.id === 'understudy' || c.id === 'closer') return;
      const v = nightValue(run, (x) => { const [s] = x.charms.splice(x.charms.findIndex((q) => q.id === 'understudy'), 1); x.charms.splice(x.charms.findIndex((q) => q.id === c.id), 0, s); });
      if (v > bv) { bv = v; best = i; }
    });
    if (best >= 0 && bv > base) { const id = run.charms[best].id; const [s] = run.charms.splice(at('understudy'), 1); run.charms.splice(at(id), 0, s); }
  }
}

function symbolRank(run) { // what the build makes from each symbol, best first
  const mods = snapshot(run);
  const pay = note(run).sym;
  return SCORING.filter((s) => !run.removed.includes(s))
    .map((s) => ({ s, v: (pay[s] || 0) + symValueOf(mods, s) * symMultOf(mods, s) * weightOf(mods, s) * SYM[s].weight }))
    .sort((a, b) => b.v - a.v).map((x) => x.s);
}

function smartShop(run) {
  const n0 = (run.stats.charmsBought || 0) + Object.values(run.bench).length + run.removed.length;
  shopOnce(run);
  note(run).bought = (run.stats.charmsBought || 0) + Object.values(run.bench).length + run.removed.length > n0 || run.charms.length < slotsOf(run);
}
function shopOnce(run) {
  for (let i = run.waiting.length - 1; i >= 0; i--) takeWaiting(run, i);
  const H = roundsLeftInRun(run), w = wickValue(run);
  const owed = Math.max(0, run.debt - run.banked);
  const nightInc = spinPay(run) * 4.5;
  const nightsLeft = run.rounds - run.round; // nights left before this debt's deadline
  const reserve = () => Math.max(0, owed - nightInc * nightsLeft * 0.8); // keep what the debt still needs
  const mods = snapshot(run);
  const rate = (CONFIG.interest.basePct + mods.interest) / 100;
  const interestRoom = () => run.purse * rate < (run.debt * CONFIG.interest.capPctOfDebt) / 100; // more coins still earn interest
  const cost = (p) => (p.coins || 0) + (p.wick || 0) * w;
  const affordable = (p) => canPay(run, p) && (p.coins || 0) <= run.purse - reserve();
  // buy when the extra pay over the nights left beats the price, and beats what the coins would earn sitting in the purse
  const worth = (gain, p) => gain * H > cost(p) * 1.2 && !(p.coins && interestRoom() && gain < p.coins * rate);
  for (let guard = 0; guard < 6; guard++) {
    const offers = run.shop.charms.map((id, i) => ({ id, i, p: price(run, { kind: 'charm', id }) })).filter((o) => affordable(o.p));
    if (!offers.length) break;
    const base = nightValue(run);
    const full = run.charms.length >= slotsOf(run);
    // first as if there were room: when nothing is worth it even then, the held charms need no pricing
    for (const o of offers) o.g = nightValue(run, withCharm(run, o.id)) - base;
    let weak = -1, weakV = Infinity;
    if (full && BAD !== 'shop') {
      if (!offers.some((o) => worth(o.g, o.p))) break;
      run.charms.forEach((c, i) => { const v = base - nightValue(run, (x) => { x.charms.splice(i, 1); }); if (v < weakV) { weakV = v; weak = i; } });
      const room = Math.max(...offers.map((o) => o.g));
      for (const o of offers) if (worth(o.g, o.p)) o.g = nightValue(run, withCharm(run, o.id, weak)) - base; else o.g = -Infinity;
      // nothing beats the weakest held charm, but the best offer is worth a slot: one per debt, for Wick
      if (!offers.some((o) => worth(o.g, o.p)) && !run.slotBought && run.wick >= CONFIG.shop.slotPriceWick && room * H > CONFIG.shop.slotPriceWick * w && buySlot(run)) continue;
    } else if (full) weak = 0;
    offers.sort((a, b) => (BAD === 'shop' ? a.g - b.g : b.g - a.g));
    const o = offers[0];
    if (BAD !== 'shop' && !worth(o.g, o.p)) break;
    if (full) sellCharm(run, weak);
    if (!buyCharm(run, run.shop.charms.indexOf(o.id))) break;
  }
  // one reroll when nothing was worth it and the price is small next to the purse
  const rp = price(run, { kind: 'reroll' });
  if (BAD !== 'shop' && run.shop.rerolls === 0 && (rp.coins || 0) < 0.1 * (run.purse - reserve()) && reroll(run)) return shopOnce(run);
  smartBench(run, H, w, reserve);
  for (const id of ['hourglass', 'double_stamp', 'horn', 'token', 'brush', 'wish_coin', 'swap', 'nudge', 'hand_mirror', 'stencil']) {
    const i = run.shop.tricks.indexOf(id);
    if (i >= 0 && run.tricks.length < pocketsOf(run) && cost(price(run, { kind: 'trick', id })) < 0.6 * spinPay(run) * 3 && (price(run, { kind: 'trick', id }).coins || 0) <= run.purse - reserve()) buyTrick(run, i);
  }
  orderCharms(run);
}

function smartBench(run, H, w, reserve) {
  const rank = symbolRank(run);
  const base = nightValue(run);
  for (let i = run.shop.bench.length - 1; i >= 0; i--) {
    const id = run.shop.bench[i];
    const p = price(run, { kind: 'bench', id });
    if (!canPay(run, p) || (p.coins || 0) > run.purse - reserve()) continue;
    let target;
    if (id === 'lift') {
      let bv = -Infinity;
      for (const c of run.curses) { const v = nightValue(run, (x) => { x.curses = x.curses.filter((q) => q !== c); }); if (v > bv) { bv = v; target = c; } }
      if (BAD === 'bench') target = run.curses[0];
    } else if (id === 'purge') target = BAD === 'bench' ? rank[0] : rank[rank.length - 1];
    else target = BAD === 'bench' ? rank[rank.length - 1] : rank[0];
    if (!target) continue;
    const g = nightValue(run, (x) => { x.shop = { bench: [id], charms: [], tricks: [] }; x.phase = 'shop'; x.freeBench = 1; return doBench(x, 0, target); }) - base;
    if (BAD === 'bench' ? true : g * H > ((p.coins || 0) + (p.wick || 0) * w) * 1.2) doBench(run, i, target);
  }
}

function smartDeal(run) {
  const H = roundsLeftInRun(run), w = wickValue(run);
  const debtNow = (c) => c.debt;
  const value = (sign, id) => {
    const c = clone(run);
    if (sign) signDeal(c, id); else refuseDeals(c);
    if (c.phase !== 'shop') return -Infinity;
    // the night's pay over the rest of the run, minus the extra debt; Wick counted at the going rate
    const slot = (slotsOf(c) - slotsOf(run)) * 0.5 * nightValue(run) / Math.max(1, run.charms.length); // a free slot is worth half an average charm
    return (nightValue(c) + slot) * H - debtNow(c) * 1.5;
  };
  const refuse = value(false);
  const opts = run.dealOffer.map((id) => ({ id, v: value(true, id) })).sort((a, b) => b.v - a.v);
  if (BAD === 'deal') return refuse < opts.at(-1).v || snapshot(run).flags.mustSign ? refuseDeals(run) || signDeal(run, opts.at(-1).id) : signDeal(run, opts.at(-1).id);
  if (opts.length && (opts[0].v > refuse || snapshot(run).flags.mustSign)) return signDeal(run, opts[0].id);
  return refuseDeals(run);
}

function smartTerms(run, offer) {
  const w = wickValue(run);
  const vals = offer.map((s) => ({ id: s.id, v: nightValue(run, null, s.id) + (s.id === 'market_night' ? spinPay(run) * 2 : 0) }));
  vals.sort((a, b) => (BAD === 'terms' ? a.v - b.v : b.v - a.v));
  if (canSkip(run) && BAD !== 'skip0') {
    const r = skipReward(run);
    const rv = { skip_wick: 6 * w, skip_rare: 6 * w, skip_tricks: 4.5 * w }[r.id] ?? 0;
    const owed = run.debt - run.banked, left = run.rounds - run.round - 1; // nights left after this one
    const safe = run.purse + left * vals[0].v >= owed * 1.3;
    if (BAD === 'skip' ? canSkip(run) : safe && rv > vals[0].v) return SKIP;
  }
  return vals[0].id;
}

// Early pay: never. Every night left brings a wagon, and the wagons (charms, bench jobs) beat the carried spins, Wick and trick
// (measured on c3: paying early whenever it can drops the clear rate from 32% to 0%, paying early only with twice the debt in the purse
// to 16%). SMART_BAD=bankasap takes it every time.
// SMART_BAD=bankrich pays early only when the purse holds twice what is owed, so the shop still gets the rest.
const wantsEarlyPay = (run) => (BAD === 'bankasap' || (BAD === 'bankrich' && run.purse >= 2 * (run.debt - run.banked))) && run.debt > run.banked && run.purse >= run.debt - run.banked && run.round + 1 < run.rounds;

// What one cell edit is worth: pattern pay of the grid, quick (no triggers), 0 on a Scorch.
function quickPay(run, grid, mods) {
  if (grid.filter((s) => s === 'ash').length >= Math.max(CONFIG.heat.scorchAsh, mods.flags.scorchNeeds || 0) && !run.noScorch) return 0;
  let sum = 0;
  for (const p of findPatterns(grid, mods, run.favs)) {
    let pm = PATTERN[p.id].mult;
    for (const r of mods.patMult) if (r.pattern === 'all' || r.pattern === p.id || (r.pattern === 'big' && p.cells.length >= 5)) pm += r.n;
    sum += symValueOf(mods, p.sym) * symMultOf(mods, p.sym) * pm * (1 + (run.favs.includes(p.sym) ? 0.2 : 0));
  }
  return sum;
}
function postTricks(run) {
  if (BAD === 'tricks') return;
  for (let g = 0; g < 3; g++) {
    const mods = snapshot(run, run.grid, run.favs);
    const now = quickPay(run, run.grid, mods);
    let best = null;
    run.tricks.forEach((id, p) => {
      const T = TRICK[id];
      if (T.when !== 'post') return;
      const op = T.op.type, tries = [];
      if (op === 'shiftColumn') for (let c = 0; c < 5; c++) tries.push({ col: c });
      else if (op === 'swapAdjacent') for (let a = 0; a < 15; a++) { if (a % 5 < 4) tries.push({ a, b: a + 1 }); if (a < 10) tries.push({ a, b: a + 5 }); }
      else if (op === 'setCell') for (let c = 0; c < 15; c++) tries.push({ cell: c });
      else if (op === 'copyAdjacent') for (let a = 0; a < 15; a++) { if (a % 5 < 4) tries.push({ from: a, to: a + 1 }, { from: a + 1, to: a }); if (a < 10) tries.push({ from: a, to: a + 5 }, { from: a + 5, to: a }); }
      else if (op === 'retriggerBest') { const b = Math.max(0, ...findPatterns(run.grid, mods, run.favs).map((q) => symValueOf(mods, q.sym) * PATTERN[q.id].mult)); if (!best || b > best.g) best = { p, t: {}, g: b }; return; }
      for (const t of tries) {
        const c = { ...run, grid: run.grid.slice(), tricks: [id], pinned: [], temp: run.temp, stats: {} };
        const g = run.grid.slice();
        if (op === 'shiftColumn') { g[t.col + 5] = run.grid[t.col]; g[t.col + 10] = run.grid[t.col + 5]; g[t.col] = run.grid[t.col + 10]; }
        else if (op === 'swapAdjacent') { g[t.a] = run.grid[t.b]; g[t.b] = run.grid[t.a]; }
        else if (op === 'setCell') g[t.cell] = T.op.to === 'favoured' ? run.favs[0] : T.op.to;
        else if (op === 'copyAdjacent') g[t.to] = run.grid[t.from];
        const v = quickPay(c, g, mods) - now;
        if (!best || v > best.g) best = { p, t, g: v };
      }
    });
    if (!best || best.g < 0.25 * (note(run).base || 1)) return;
    if (!useTrick(run, best.p, best.t).ok) return;
  }
}

function preTricks(run) {
  if (BAD === 'tricks') return;
  for (let p = run.tricks.length - 1; p >= 0; p--) {
    const id = run.tricks[p], T = TRICK[id];
    if (T.when !== 'pre' && T.when !== 'any') continue;
    if (id === 'token') useTrick(run, p, { sym: symbolRank(run)[0] });
    else if (id === 'hourglass' || id === 'horn' || id === 'wish_coin') useTrick(run, p, {});
    else if (id === 'chili' && run.heat + 3 <= bestHeat(run) + 2) useTrick(run, p, {});
    else if (id === 'ice' && run.heat >= bestHeat(run) + 4) useTrick(run, p, {});
    else if (id === 'salt' && run.curses.length >= 2 && run.spinInRound === 0) useTrick(run, p, {});
  }
}

function redraw(run) {
  const mods = snapshot(run);
  if (mods.flags.hideFav || redrawCost(run) > 0) return;
  const rank = symbolRank(run);
  const pos = rank.indexOf(run.favs[0]);
  if (BAD === 'redraw' ? pos < rank.length / 2 : pos >= 3) redrawFavourite(run);
}

BOTS.smart = {
  terms: (run, offer) => smartTerms(run, offer),
  stokeTo: (run) => bestHeat(run),
  beforeSpin(run) {
    if (run.spinInRound === 0 && wantsEarlyPay(run)) { bank(run, run.debt - run.banked); return run.phase === 'spin'; }
    redraw(run);
    preTricks(run);
    return true;
  },
  post: (run) => postTricks(run),
  roundEnd(run) { if (wantsEarlyPay(run)) bank(run, run.debt - run.banked); },
  seen(run, r) {
    const m = note(run);
    const k = Math.min(m.n + 1, 8);
    m.spin += (r.gain - m.spin) / k;
    if (!r.scorch) m.base += (r.sum * r.allMult + r.flat - m.base) / k;
    for (const p of r.patterns) m.sym[p.sym] = (m.sym[p.sym] || 0) * 0.9 + p.pay;
    m.n++;
  },
  shop: (run) => smartShop(run),
  deal: (run) => smartDeal(run),
  pawn(run) { // burn the charm it would miss least
    let wi = 0, wv = Infinity;
    const base = nightValue(run);
    run.charms.forEach((c, i) => { const v = base - nightValue(run, (x) => { x.charms.splice(i, 1); }); if (v < wv) { wv = v; wi = i; } });
    return pawn(run, wi);
  },
};

export function playRun(run, bot, rng, hooks = {}) {
  let guard = 0;
  while (guard++ < 20000) {
    if (run.phase === 'ended') { if (hooks.endless && canContinue(run)) continueEndless(run); else break; }
    switch (run.phase) {
      case 'terms': {
        const id = bot.terms(run, termsOffer(run), rng);
        if (id === SKIP) skipRound(run); else pickTerms(run, id);
        break;
      }
      case 'spin': {
        if (bot.beforeSpin && !bot.beforeSpin(run, rng)) break;
        if (run.phase !== 'spin') break;
        const to = bot.stokeTo(run, rng);
        while (run.heat < to && stoke(run)) ;
        const r = spin(run);
        if (r.score) bot.seen?.(run, r.score);
        break;
      }
      case 'post': bot.post?.(run, rng); { const s = collect(run); bot.seen?.(run, s); } break;
      case 'roundend': bot.roundEnd?.(run, rng); if (run.phase === 'roundend') endRound(run); break;
      case 'shop': bot.shop(run, rng); hooks.onShop?.(run); leaveShop(run); break;
      case 'deal': bot.deal(run, rng); break;
      case 'pawn': bot.pawn(run, rng); break;
    }
  }
  return run;
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

// Plays runs [from, from + n) and returns the raw tallies; summarize() turns merged tallies into the printed numbers.
function play(name, from, n, contract, char, endless) {
  const bot = BOTS[name];
  const t = { n, wins: 0, reached: [], coins: [], best: [], paid: [], bought: {}, winBought: {} };
  for (let i = from; i < from + n; i++) {
    const run = newRun({ seed: 'sim-' + i, contractId: contract, charId: char });
    const owned = new Set();
    playRun(run, bot, makeRng('bot-' + name + i), { endless, onShop: (r) => r.charms.forEach((c) => owned.add(c.id)) });
    for (const id of owned) t.bought[id] = (t.bought[id] || 0) + 1;
    if (run.result?.won) { t.wins++; for (const id of [...owned, ...run.deals.map((d) => 'deal:' + d)]) t.winBought[id] = (t.winBought[id] || 0) + 1; }
    t.reached.push(run.stats.reachDebt || 1);
    t.coins.push(run.stats.coinsEarned || 0);
    t.best.push(run.stats.spinCoins || 0);
    t.paid.push(run.stats.debtsPaid || 0);
  }
  return t;
}
function summarize(name, parts, ms) {
  const n = parts.reduce((a, p) => a + p.n, 0), all = (k) => parts.flatMap((p) => p[k]);
  const bought = Object.fromEntries(CHARMS.filter((c) => !c.unlock).map((c) => [c.id, parts.reduce((a, p) => a + (p.bought[c.id] || 0), 0)]));
  const sorted = Object.entries(bought).sort((a, b) => b[1] - a[1]); // locked charms can never be picked, so they are left out
  const wins = parts.reduce((a, p) => a + p.wins, 0);
  const winShare = Object.entries(parts.reduce((m, p) => { for (const k in p.winBought) m[k] = (m[k] || 0) + p.winBought[k]; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => [k, wins ? Math.round(100 * v / wins) + '%' : '-']);
  return { winShare, name, n, wins, rate: wins / n, medianDebt: median(all('reached')), medianCoins: median(all('coins')), medianBest: median(all('best')), meanPaid: all('paid').reduce((a, b) => a + b, 0) / n, never: sorted.filter(([, v]) => !v).map(([k]) => k), top: sorted.slice(0, 10), bottom: sorted.slice(-10).reverse(), ms };
}
export function simulate(name, n, contract, char, opt = {}) {
  const t0 = Date.now();
  return summarize(name, [play(name, 0, n, contract, char, opt.endless)], Date.now() - t0);
}
// The smart bot thinks before every choice, so its runs are spread over worker threads (same seeds, same result as one thread).
async function simulateParallel(name, n, contract, char, opt = {}) {
  const W = Math.max(1, Math.min(n, os.cpus().length - 1, 12));
  if (W < 2 || name !== 'smart') return simulate(name, n, contract, char, opt);
  const t0 = Date.now(), size = Math.ceil(n / W);
  const parts = await Promise.all(Array.from({ length: W }, (_, k) => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { name, from: k * size, n: Math.max(0, Math.min(size, n - k * size)), contract, char, endless: !!opt.endless } });
    w.once('message', res); w.once('error', rej);
  })));
  return summarize(name, parts, Date.now() - t0);
}

if (!isMainThread && workerData?.name) {
  setExplain(false);
  const d = workerData;
  parentPort.postMessage(play(d.name, d.from, d.n, d.contract, d.char, d.endless));
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
  const n = Number(arg('n', 300)), contract = arg('contract', 'c1'), char = arg('char', 'nim'), endless = process.argv.includes('--endless');
  setExplain(false);
  const fmt = (l) => l.map(([id, c]) => `${id}:${c}`).join(' ');
  for (const name of arg('bots', 'random,greedy,smart').split(',')) {
    const r = await simulateParallel(name, n, contract, char, { endless });
    console.log(`${name}${BAD && name === 'smart' ? ' (bad ' + BAD + ')' : ''}: ${r.wins}/${r.n} cleared contract ${contract} (${(r.rate * 100).toFixed(1)}%), median debt reached ${r.medianDebt}, mean debts paid ${r.meanPaid.toFixed(2)}, median coins ${r.medianCoins}, median best spin ${r.medianBest}, ${r.ms} ms`);
    if (!process.argv.includes('--quiet')) {
      console.log('  most picked : ' + fmt(r.top));
      console.log('  least picked: ' + fmt(r.bottom));
      console.log('  in wins     : ' + fmt(r.winShare));
      console.log('  never       : ' + r.never.join(' '));
    }
  }
}
