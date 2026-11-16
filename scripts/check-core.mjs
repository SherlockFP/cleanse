import assert from 'node:assert/strict';
import { makeRng, hashSeed } from '../src/core/rng.js';
import { QUOTA, tier, ledgerStepCost } from '../src/core/econ.js';
import { makeBag, bagOdds, drawGrid, findLines, findPairs, scoreSpin } from '../src/core/reel.js';
import { LINES } from '../src/core/data/lines.js';
import { newRun, spin, togglePeg, canPeg, endTide, nextTide, enterLamplight, runSummary, runHash, quotaFor } from '../src/core/run.js';
import { rollShop, buyOffer, sellTrinket, removeToken, reroll, lockOffer, priceOf, SHOP_ODDS, effectiveOdds } from '../src/core/shop.js';

const seq = (r, n) => Array.from({ length: n }, () => r.next());

// determinism
assert.deepEqual(seq(makeRng(42), 50), seq(makeRng(42), 50));
assert.notDeepEqual(seq(makeRng(42), 5), seq(makeRng(43), 5));
assert.equal(hashSeed('daily:2026-01-01'), hashSeed('daily:2026-01-01'));
assert.notEqual(hashSeed('a'), hashSeed('b'));
const r = makeRng('x');
for (let i = 0; i < 1000; i++) {
  const v = r.next(); assert.ok(v >= 0 && v < 1);
  const n = r.int(7); assert.ok(Number.isInteger(n) && n >= 0 && n < 7);
}
assert.equal(makeRng(1).weighted(['a', 'b'], [0, 1]), 'b');

// fork independence: same label same stream; consuming the parent or a sibling changes nothing
const p1 = makeRng(7), p2 = makeRng(7);
const a1 = seq(p1.fork('reel:1:1:0'), 10);
seq(p2, 100); seq(p2.fork('shop:0:0:0'), 100);
assert.deepEqual(a1, seq(p2.fork('reel:1:1:0'), 10));
assert.notDeepEqual(a1, seq(makeRng(7).fork('reel:1:1:1'), 10));
assert.notDeepEqual(a1, seq(makeRng(8).fork('reel:1:1:0'), 10));

// quota table (ECONOMY.md section 1)
const row = (c, n) => Array.from({ length: n }, (_, i) => QUOTA(i + 1, c));
assert.deepEqual(row(1, 5), [15, 30, 60, 120, 240]);
assert.deepEqual(row(12, 5), [15, 35, 70, 140, 280]);
assert.deepEqual([6, 8, 10].map((t) => QUOTA(t, 1)), [276, 365, 483]);
for (let c = 1; c <= 12; c++) assert.equal(QUOTA(1, c), 15);
assert.equal(tier(1), 1);
assert.ok(Math.abs(tier(12) - 1.165) < 1e-12);
for (let c = 1; c < 12; c++) for (let t = 1; t <= 20; t++) assert.ok(QUOTA(t, c + 1) >= QUOTA(t, c));
assert.equal(ledgerStepCost(1), 6);
assert.equal(ledgerStepCost(29), 40);

// ---- reel: hand-made grids. 'barnacle' is the filler: junk, never forms a line, pays 0.
const grid = (cells, fill = 'barnacle') => {
  const g = Array(9).fill(fill);
  for (const [i, s] of Object.entries(cells)) g[i] = s;
  return g;
};
const put = (ids, s) => Object.fromEntries(ids.map((i) => [i, s]));
const row0 = (a, b, c) => grid({ 0: a, 1: b, 2: c });

// each of the 8 lines
assert.equal(LINES.length, 8);
for (const L of LINES) {
  const f = findLines(grid(put(L.cells, 'sardine')), []);
  assert.equal(f.length, 1, L.id);
  assert.equal(f[0].id, L.id);
  assert.equal(f[0].sym, 'sardine');
  assert.equal(f[0].base, 6);
}

// wild
assert.equal(findLines(row0('knot', 'sardine', 'sardine'), [])[0].sym, 'sardine');
assert.equal(findLines(row0('knot', 'sardine', 'sardine'), [])[0].knots, 1);
assert.equal(findLines(row0('knot', 'knot', 'tea'), [])[0].base, 7);
const three = findLines(row0('knot', 'knot', 'knot'), []);
assert.equal(three[0].sym, 'knot');
assert.equal(three[0].base, 12);
assert.equal(findLines(row0('sardine', 'knot', 'tea'), []).length, 0);
assert.equal(findLines(row0('sardine', 'sardine', 'tea'), []).length, 0);
assert.equal(findLines(row0('sardine', 'sardine', 'net'), []).length, 0);
// knot in the centre completes two lines at once
assert.equal(findLines(grid({ 0: 'tea', 8: 'tea', 3: 'sardine', 5: 'sardine', 4: 'knot' }), []).length, 2);
// ctx: skipped lines, extra wild
const diag = grid(put([0, 4, 8], 'sardine'));
assert.equal(findLines(diag, [], { skip: ['diag_down'] }).length, 0);
const gullDiag = grid({ 0: 'gull', 4: 'tea', 8: 'tea' });
assert.equal(findLines(gullDiag, []).length, 0);
assert.equal(findLines(gullDiag, [], { wild: { gull: 'diag' } })[0].sym, 'tea');
assert.equal(findLines(grid({ 0: 'gull', 1: 'tea', 2: 'tea' }), [], { wild: { gull: 'diag' } }).length, 0);

// pairs
assert.deepEqual(findPairs(row0('sardine', 'sardine', 'tea')), [0, 1]);
assert.deepEqual(findPairs(row0('sardine', 'knot', 'tea')), [0, 1, 2]);
assert.deepEqual(findPairs(row0('sardine', 'sardine', 'sardine')), []);
assert.deepEqual(findPairs(row0('sardine', 'tea', 'lantern')), []);

// specials (each placed with barnacle filler)
const sardineRow = grid({ 1: 'sardine', 3: 'sardine', 4: 'net' });
assert.equal(scoreSpin(sardineRow, []).total, 4); // net: 2 per adjacent sardine
assert.equal(scoreSpin(grid({ 1: 'tea', 4: 'samovar', 5: 'tea', 7: 'tea' }), []).total, 9);
assert.equal(scoreSpin(grid({ 1: 'sardine', 4: 'cat', 3: 'gull', 5: 'tea' }), []).total, 8);
// held rules: a pair of held cells pays 0; one landed cell makes the pair count
assert.equal(scoreSpin(sardineRow, [1, 3, 4]).total, 0);
assert.equal(scoreSpin(sardineRow, [1, 4]).total, 2); // sardine 3 landed: only its pair with the net counts
// kelp: pays its counter once per spin, then +1, max 5
const kelp2 = grid({ 0: 'kelp', 8: 'kelp' });
let k = scoreSpin(kelp2, [], { kelp: 1 });
assert.equal(k.total, 1); assert.equal(k.kelp, 2);
k = scoreSpin(kelp2, [], { kelp: 3 });
assert.equal(k.total, 3); assert.equal(k.kelp, 4);
assert.equal(scoreSpin(kelp2, [], { kelp: 5 }).kelp, 5);
k = scoreSpin(kelp2, [0, 8], { kelp: 3 }); // held kelp does not land
assert.equal(k.total, 0); assert.equal(k.kelp, 3);
assert.equal(scoreSpin(kelp2, [0], { kelp: 3 }).total, 3); // the other one landed
assert.equal(scoreSpin(kelp2, [], { kelp: 2, kelpStep: 2, kelpMax: 7 }).kelp, 4);

// held-line rule
const sRow = grid(put([0, 1, 2], 'sardine'));
assert.deepEqual(findLines(sRow, [0, 1, 2]), []);
assert.equal(findLines(sRow, [0, 1]).length, 1);
assert.equal(scoreSpin(sRow, []).total, 6);
assert.equal(scoreSpin(sRow, [0, 1, 2]).total, 0); // a paid line that stays held pays nothing again
assert.equal(scoreSpin(sRow, [0, 1]).total, 6); // one landed cell: pays once, as a new line

// pay order: (base + line adds) x line muls; specials; spin adds; spin muls; one ceil
const sh = {
  salt: (hook, p) => (hook === 'onLine' && p.line.sym === 'sardine' ? [{ type: 'lineAdd', amount: 4 }] : []),
  hook: (hook, p) => (hook === 'onLine' && p.line.sym === 'sardine' ? [{ type: 'lineMul', factor: 2 }] : []),
  flat: (hook) => (hook === 'onSpinTotal' ? [{ type: 'spinAdd', amount: 3 }] : []),
  mul: (hook) => (hook === 'onSpinTotal' ? [{ type: 'spinMul', factor: 1.5 }] : []),
};
const perms = (a) => (a.length < 2 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r])));
const payGrid = grid({ 0: 'sardine', 1: 'sardine', 2: 'sardine', 4: 'net' }); // line 6, net pays 2 (cell 1 is adjacent)
for (const order of perms(Object.values(sh))) {
  const apply = (hook, st, p) => order.flatMap((t) => t(hook, p));
  const r = scoreSpin(payGrid, [], { applyTrinkets: apply });
  assert.equal(r.lines[0].total, 20); // (6 + 4) x 2
  assert.equal(r.total, 38); // ceil((20 + 2 + 3) x 1.5) = ceil(37.5)
  assert.equal(r.trinketSteps.length, 4);
}
// one ceil at the end, not per line: two pebble lines x1.3 = 5.2 + 5.2 = 10.4 -> 11 (per-line ceil would give 12)
const twoRows = grid({ ...put([0, 1, 2, 3, 4, 5], 'pebble') });
const lm = { applyTrinkets: (hook) => (hook === 'onLine' ? [{ type: 'lineMul', factor: 1.3 }] : []) };
assert.equal(scoreSpin(twoRows, [], lm).total, 11);
assert.equal(scoreSpin(grid({}), []).total, 0);
assert.ok(Object.is(scoreSpin(grid({}), []).total, 0));
assert.throws(() => scoreSpin(sRow, [], { applyTrinkets: () => [{ type: 'bogus' }] }));

// bag and draws
const start = { pebble: 5, sardine: 4, tea: 3, lantern: 2, gull: 1, knot: 1 };
const bag = makeBag(start);
assert.deepEqual(makeBag({ knot: 1, gull: 1, lantern: 2, tea: 3, sardine: 4, pebble: 5 }), bag);
assert.equal(bag.size, 16);
const odds = Object.fromEntries(bagOdds(bag).map((o) => [o.id, o.p]));
assert.equal(odds.pebble, 0.3125); assert.equal(odds.gull, 0.0625);
assert.equal(bagOdds(bag).reduce((a, o) => a + o.p, 0), 1);
assert.throws(() => makeBag({ nope: 1 }));
assert.throws(() => drawGrid(makeBag({}), makeRng(1), 1, 1, null, []));

const g1 = drawGrid(bag, makeRng(5), 1, 1, null, []);
assert.deepEqual(g1, drawGrid(bag, makeRng(5), 1, 1, null, []));
assert.equal(g1.length, 9);
assert.ok(g1.every((s) => bag.ids.includes(s)));
const parent = makeRng(5); seq(parent, 50);
assert.deepEqual(g1, drawGrid(bag, parent, 1, 1, null, [])); // consuming the parent changes nothing
const g2 = drawGrid(bag, makeRng(5), 1, 2, g1, [0, 4]);
const g3 = drawGrid(bag, makeRng(5), 1, 2, g1, []);
assert.equal(g2[0], g1[0]); assert.equal(g2[4], g1[4]);
for (const i of [1, 2, 3, 5, 6, 7, 8]) assert.equal(g2[i], g3[i]); // holding never moves another cell
assert.deepEqual(drawGrid(bag, makeRng(5), 1, 2, g1, new Set([0, 4])), g2);
const seen = new Set();
for (let t = 1; t <= 5; t++) for (let s = 1; s <= 6; s++) seen.add(drawGrid(bag, makeRng(5), t, s, null, []).join());
assert.ok(seen.size > 25);
const cnt = {};
const rr = makeRng(99);
for (let t = 0; t < 2000; t++) for (const s of drawGrid(bag, rr, t, 1, null, [])) cnt[s] = (cnt[s] || 0) + 1;
assert.ok(Math.abs(cnt.pebble / 18000 - 0.3125) < 0.02);
assert.ok(Math.abs(cnt.gull / 18000 - 0.0625) < 0.01);

// ---- run, shop (M1 rows 4-6)
const NEW = (o = {}) => newRun({ seed: 11, startTrinket: 'salt_barrel', ...o });
const lastSpin = (run, jar, jarBeforeLast = jar) => { run.spin = run.spinsMax; run.jar = jar; run.jarBeforeLast = jarBeforeLast; return run; };
const toTide = (run, n) => { while (run.tide < n) { lastSpin(run, run.quota); assert.ok(endTide(run).paid); if (run.phase === 'lamplight') enterLamplight(run); nextTide(run); } return run; };

// tide 1 quota is 15 at every installment; later tides follow the tier (econ.js)
for (let c = 1; c <= 12; c++) {
  const r = newRun({ seed: 1, installment: c });
  assert.equal(r.quota, 15, `installment ${c}`);
  assert.equal(quotaFor(r, 2), QUOTA(2, c)); assert.equal(quotaFor(r, 5), QUOTA(5, c));
  assert.equal(toTide(newRun({ seed: 1, installment: c }), 2).quota, QUOTA(2, c));
}
assert.deepEqual([newRun({ seed: 1 }).spinsMax, newRun({ seed: 1 }).pegsMax, newRun({ seed: 1 }).jar], [6, 3, 0]);

// peg rules
{
  const r = NEW();
  assert.equal(canPeg(r, 0), false); // nothing to hold before the first spin
  assert.equal(togglePeg(r, 0), false);
  const a = spin(r);
  assert.equal(a.grid.length, 9); assert.equal(r.jar, a.total);
  assert.ok([0, 1, 2].every((c) => togglePeg(r, c)));
  assert.equal(canPeg(r, 3), false); // 3 pegs held at once
  assert.equal(togglePeg(r, 1), true); assert.deepEqual(r.held, [0, 2]); // free to move
  assert.equal(togglePeg(r, 5), true); assert.deepEqual(r.held, [0, 2, 5]);
  assert.equal(canPeg(r, 9), false); assert.equal(canPeg(r, 1.5), false);
  const b = spin(r);
  for (const c of [0, 2, 5]) assert.equal(b.grid[c], a.grid[c]); // held cells keep their symbol
  assert.deepEqual(b.held, [0, 2, 5]);
  assert.deepEqual(r.held, [0, 2, 5]); // pegs stay until moved: not used up
  while (r.spin < r.spinsMax) spin(r);
}
{
  const r = NEW();
  spin(r); while (r.spin < r.spinsMax) spin(r);
  assert.equal(canPeg(r, 4), false); // no peg after the last spin
  assert.throws(() => spin(r)); // no spin 7
  endTide(r); assert.throws(() => spin(r)); // not in a tide
}
{
  const r = NEW(); spin(r);
  r.event = 'fog_bank';
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => canPeg(r, c)), [0, 1, 3, 4, 6, 7]); // right column fogged
  r.event = null; r.grid = Array(9).fill('pebble'); r.grid[4] = 'storm';
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => canPeg(r, c)), [0, 2, 6, 8]); // storm and its neighbours
}

// tide flow: carry, clutch, mercy, loss
{
  const r = lastSpin(NEW(), 40, 20); // quota 15, already paid before the last spin
  assert.deepEqual(endTide(r), { paid: true, mercy: false, clutch: false, over: false, won: false, tide: 1, quota: 15 });
  assert.equal(r.jar, 25); assert.equal(r.phase, 'shop'); // the remainder carries, no cap
  nextTide(r); assert.equal(r.tide, 2); assert.equal(r.quota, 30); assert.equal(r.phase, 'tide'); assert.equal(r.spin, 0);
  assert.equal(r.jar, 25);
  const c = lastSpin(NEW(), 16, 10); // reached on the last spin
  assert.equal(endTide(c).clutch, true);
  const c2 = lastSpin(NEW(), 15, 15); // reached before the last spin
  assert.equal(endTide(c2).clutch, false);
  const m = lastSpin(NEW(), 10, 10); // gap 5: Orhan rounds up
  const mr = endTide(m);
  assert.equal(mr.mercy, true); assert.equal(mr.paid, true); assert.equal(mr.clutch, false); assert.equal(m.jar, 0); assert.equal(m.mercyUsed, 1);
  nextTide(m); lastSpin(m, m.quota - 3); // second time: once per run
  assert.deepEqual(endTide(m), { paid: false, mercy: false, clutch: false, over: true, won: false, tide: 2, quota: 30 });
  assert.equal(m.phase, 'over'); assert.throws(() => nextTide(m));
  const l = endTide(lastSpin(NEW(), 9)); // gap 6: too big
  assert.equal(l.over, true); assert.equal(l.mercy, false);
  assert.equal(endTide(lastSpin(NEW(), 14)).mercy, true); // gap 1
  assert.throws(() => endTide(NEW())); // spins left
}

// five tides, Lamplight, summary
{
  const r = toTide(NEW({ installment: 6 }), 5);
  assert.equal(r.quota, QUOTA(5, 6)); assert.ok(r.event);
  lastSpin(r, r.quota + 3, r.quota - 1);
  const e = endTide(r);
  assert.equal(e.won, true); assert.equal(r.phase, 'lamplight'); assert.equal(r.stats.clutches, 1);
  const s = runSummary(r);
  assert.equal(s.won, true); assert.equal(s.tidesCleared, 5); assert.equal(s.clutches, 1); assert.equal(s.over, false);
  assert.throws(() => nextTide(r));
  enterLamplight(r); assert.equal(r.phase, 'shop');
  nextTide(r); assert.equal(r.tide, 6); assert.equal(r.event, null); assert.equal(r.quota, QUOTA(6, 6));
  lastSpin(r, 0); assert.equal(endTide(r).over, true);
  assert.equal(runSummary(r).won, true); assert.equal(runSummary(r).over, true); assert.equal(runSummary(r).tidesCleared, 5);
}

// charts and events
{
  const q = (o, t = 1) => toTide(newRun({ seed: 1, ...o }), t);
  const bare = newRun({ seed: 1, chartId: 'bare_line' });
  assert.deepEqual([bare.pegsMax, bare.jar], [1, 30]);
  const neap = newRun({ seed: 1, chartId: 'neap_tide' });
  assert.deepEqual([neap.spinsMax, neap.quota], [5, 12]);
  const long = newRun({ seed: 1, chartId: 'long_evening' });
  assert.deepEqual([long.spinsMax, long.quota], [7, 18]);
  assert.equal(newRun({ seed: 1, chartId: 'spring_tide' }).quota, 18);
  assert.equal(newRun({ seed: 1, chartId: 'market_day' }).quota, 15);
  assert.throws(() => newRun({ seed: 1, chartId: 'nope' }));
  const au = q({ eventId: 'auditor' }, 5), sd = q({ eventId: 'short_day' }, 5);
  assert.equal(au.event, 'auditor'); assert.equal(au.pegsMax, 2);
  assert.deepEqual([sd.spinsMax, sd.quota], [5, 216]); // ceil(240 x .9)
  assert.equal(q({ eventId: 'low_water' }, 5).event, 'low_water');
  assert.equal(q({}, 4).event, null); // events only at tide 5 (tide 3 from installment 7)
  assert.equal(q({ installment: 7 }, 3).event !== null, true);
  const lw = q({ eventId: 'low_water' }, 5);
  lw.grid = null; lw.bag = { sardine: 1 }; // every cell a sardine: rows 0 and 1 pay, row 2 does not, columns and diagonals pay
  const lowRes = spin(lw);
  assert.ok(!lowRes.lines.some((x) => x.id === 'row2'));
  assert.ok(lowRes.lines.some((x) => x.id === 'row0') && lowRes.lines.some((x) => x.id === 'col0'));
  const ev = new Set(); for (let s = 0; s < 40; s++) ev.add(toTide(newRun({ seed: s }), 5).event);
  assert.ok(ev.size >= 3); // the creditor is drawn from the seed
}

// scripted play: deterministic from the state alone, so any saved state resumes identically
const ALL = ['start', 'cat_basket', 'radio', 'tea_corner'];
function step(run) {
  if (run.phase === 'tide') {
    if (run.spin >= run.spinsMax) return endTide(run);
    if (run.grid) {
      const cell = findPairs(run.grid).find((c) => !run.held.includes(c));
      if (cell !== undefined && run.held.length < run.pegsMax && togglePeg(run, cell)) return 'peg';
    }
    return spin(run);
  }
  if (run.phase === 'lamplight') return enterLamplight(run);
  if (run.phase === 'shop') {
    if (!run.shop) return rollShop(run);
    const i = run.shop.offers.findIndex((o, k) => o && !o.sold && run.jar >= priceOf(run, o) && buyOffer(run, k).ok);
    if (i >= 0) return 'buy';
    if (run.shop.reroll === 0 && run.jar >= 4 && reroll(run).ok) return 'reroll';
    const j = run.shop.offers.findIndex((o) => o && !o.sold);
    if (run.shop.lock === null && j >= 0) return lockOffer(run, j);
    return nextTide(run);
  }
  return null;
}
function play(opts, keep) {
  const run = newRun(opts), snaps = [];
  for (let n = 0; run.phase !== 'over' && n < 3000; n++) { step(run); if (keep && n % 2 === 0) snaps.push(JSON.stringify(run)); }
  assert.equal(run.phase, 'over');
  return { run, snaps };
}
{
  const o = { seed: 'daily:2026-01-01', startTrinket: 'tin_cup', unlocked: ALL, installment: 3 };
  const a = play(o), b = play(o);
  assert.equal(runHash(a.run), runHash(b.run)); // same seed, same inputs, same hash
  assert.deepEqual(a.run, b.run);
  assert.notEqual(runHash(play({ ...o, seed: 'daily:2026-01-02' }).run), runHash(a.run));
  assert.match(runHash(a.run), /^[0-9a-f]{8}$/);
  // one different input changes the hash
  const p = newRun(o); spin(p); const q = newRun(o); spin(q);
  assert.equal(runHash(p), runHash(q)); togglePeg(p, 0);
  assert.notEqual(runHash(p), runHash(q));
  // a run that is JSON and back resumes mid-tide, in the shop and mid-lock with the same future
  const full = play(o, true);
  assert.ok(full.snaps.length > 20);
  for (const snap of full.snaps) {
    const resumed = JSON.parse(snap);
    for (let n = 0; resumed.phase !== 'over' && n < 3000; n++) step(resumed);
    assert.equal(runHash(resumed), runHash(full.run));
    assert.deepEqual(resumed, full.run);
  }
  for (let s = 0; s < 25; s++) { // many seeds and charts: no throw, always ends, hash is stable
    const opt = { seed: s, installment: 1 + (s % 6), chartId: [null, 'spring_tide', 'neap_tide', 'bare_line', 'market_day', 'tight_shelf', 'long_evening'][s % 7], startTrinket: ['salt_barrel', 'spare_peg', 'first_light', 'kelp_pot'][s % 4], unlocked: ALL };
    assert.equal(runHash(play(opt).run), runHash(play(opt).run), `seed ${s}`);
  }
  // the shop and the reel are separate streams: shop actions never move the next grid
  const x = newRun({ seed: 5 }), y = newRun({ seed: 5 });
  for (const r of [x, y]) { lastSpin(r, 100); endTide(r); }
  rollShop(x); reroll(x); reroll(x); rollShop(y);
  nextTide(x); nextTide(y);
  assert.deepEqual(spin(x).grid, spin(y).grid);
}

// shop services
{
  const r = NEW();
  lastSpin(r, 60); endTide(r);
  assert.equal(r.phase, 'shop'); assert.equal(r.shop, null);
  const s = rollShop(r);
  assert.equal(s.offers.length, 3);
  assert.ok(s.offers.every((o) => o && !o.sold));
  assert.ok(!s.offers.some((o) => o.kind === 'trinket' && o.id === 'salt_barrel')); // no duplicate of a held trinket
  assert.equal(new Set(s.offers.filter((o) => o.kind === 'trinket').map((o) => o.id)).size, s.offers.filter((o) => o.kind === 'trinket').length);
  // prices: trinket by grade, token +2 per copy bought, flat removal price, reroll ramp
  const P = (item) => priceOf(r, item);
  assert.deepEqual(['fish_cart', 'fish_hook', 'full_net'].map((id) => P({ kind: 'trinket', id })), [5, 9, 14]);
  assert.equal(P({ kind: 'token', sym: 'sardine' }), 4);
  r.bought.sardine = 2; assert.equal(P({ kind: 'token', sym: 'sardine' }), 8);
  r.bought.sardine = 20; assert.equal(P({ kind: 'token', sym: 'sardine' }), 20); // capped at 20
  assert.deepEqual([P({ kind: 'removal' }), P({ kind: 'reroll' })], [26, 2]);
  // buy a token and a trinket; cap, shelf and coins
  const j0 = r.jar;
  s.offers[0] = { kind: 'token', sym: 'net', sold: false };
  assert.deepEqual(buyOffer(r, 0), { ok: true, price: 6 }); assert.equal(r.bag.net, 1); assert.equal(r.jar, j0 - 6); assert.equal(r.bought.net, 1);
  assert.deepEqual(buyOffer(r, 0), { ok: false, reason: 'sold' });
  s.offers[0] = { kind: 'token', sym: 'net', sold: false }; assert.equal(priceOf(r, s.offers[0]), 8); // +2 for the copy bought
  r.bag.net = 3; assert.deepEqual(buyOffer(r, 0), { ok: false, reason: 'cap' });
  s.offers[1] = { kind: 'trinket', id: 'fish_hook', grade: 2, sold: false };
  r.jar = 8; assert.deepEqual(buyOffer(r, 1), { ok: false, reason: 'coins' });
  r.jar = 9; assert.deepEqual(buyOffer(r, 1), { ok: true, price: 9 }); assert.deepEqual(r.trinkets.map((t) => t.id), ['salt_barrel', 'fish_hook']); assert.equal(r.jar, 0);
  assert.deepEqual(sellTrinket(r, 1), { ok: true, coins: 4 }); assert.equal(r.jar, 4); assert.equal(r.trinkets.length, 1);
  assert.deepEqual(sellTrinket(r, 3), { ok: false, reason: 'empty' });
  r.trinkets = ['fish_hook', 'fish_hook', 'fish_hook', 'fish_hook', 'fish_hook'].map((id) => ({ id })); r.jar = 99;
  s.offers[2] = { kind: 'trinket', id: 'full_net', grade: 3, sold: false };
  assert.deepEqual(buyOffer(r, 2), { ok: false, reason: 'shelf full' });
  // removal: flat 26 coins, 3 per run, no bag minimum
  r.jar = 120; r.bag = { pebble: 9, sardine: 4, tea: 3, lantern: 2, gull: 1, knot: 1 };
  assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 26 }); assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 26 }); assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 26 });
  assert.equal(r.removals, 3); assert.equal(r.bag.pebble, 6); assert.equal(r.jar, 120 - 78);
  assert.deepEqual(removeToken(r, 'pebble'), { ok: false, reason: 'no removals left' });
  r.removals = 2; assert.deepEqual(removeToken(r, 'net'), { ok: false, reason: 'not in bag' });
  r.bag = { gull: 1 }; assert.deepEqual(removeToken(r, 'gull'), { ok: true, price: 26 }); assert.deepEqual(r.bag, {}); // no bag floor
  // reroll ramp 2, 5, 8 and the offers change; sold slots refill
  r.jar = 50; r.shop.reroll = 0;
  const before = JSON.stringify(r.shop.offers);
  assert.deepEqual([reroll(r).price, reroll(r).price, reroll(r).price], [2, 5, 8]); assert.equal(r.jar, 35);
  assert.notEqual(JSON.stringify(r.shop.offers), before); assert.ok(r.shop.offers.every((o) => o && !o.sold));
  r.jar = 1; assert.deepEqual(reroll(r), { ok: false, reason: 'coins' });
  // lock: the locked offer survives a reroll and is carried into the next shop
  r.jar = 50;
  const keep = r.shop.offers[1];
  assert.deepEqual(lockOffer(r, 1), { ok: true, lock: 1 });
  reroll(r); assert.deepEqual(r.shop.offers[1], keep);
  lockOffer(r, 1); assert.equal(r.shop.lock, null); lockOffer(r, 1);
  nextTide(r); assert.deepEqual(r.carry, keep);
  lastSpin(r, 99, 0); endTide(r);
  const next = rollShop(r);
  assert.deepEqual(next.offers[0], keep); assert.equal(r.carry, null); assert.equal(next.lock, null);
  assert.equal(rollShop(r), next); assert.equal(r.shopVisit, 2); // a second call in the same visit deals nothing new
  // a reroll never deals the locked trinket again in another slot
  for (let s = 0; s < 40; s++) {
    const d = newRun({ seed: 500 + s }); lastSpin(d, 999); endTide(d); rollShop(d);
    const li = d.shop.offers.findIndex((o) => o.kind === 'trinket');
    if (li < 0) continue;
    lockOffer(d, li);
    for (let k = 0; k < 6; k++) { reroll(d); const ids = d.shop.offers.filter((o) => o.kind === 'trinket').map((o) => o.id); assert.equal(new Set(ids).size, ids.length, `seed ${s}`); }
  }
  assert.throws(() => rollShop(NEW())); // not in the shop
  assert.throws(() => buyOffer(NEW(), 0));
}
// chart prices
{
  const mk = (chartId) => { const r = newRun({ seed: 2, chartId }); lastSpin(r, 99); endTide(r); rollShop(r); return r; };
  const md = mk('market_day'), ts = mk('tight_shelf'), plain = mk(null);
  assert.equal(md.shop.offers.length, 4); assert.equal(plain.shop.offers.length, 3);
  assert.equal(priceOf(md, { kind: 'token', sym: 'sardine' }), 5); assert.equal(priceOf(md, { kind: 'trinket', id: 'fish_hook' }), 11); // 4 x 1.25, 9 x 1.25 = 11.25
  assert.equal(priceOf(md, { kind: 'reroll' }), 2);
  assert.equal(priceOf(ts, { kind: 'trinket', id: 'salt_barrel' }), 3); assert.equal(priceOf(ts, { kind: 'token', sym: 'sardine' }), 4);
  ts.trinkets = ['a', 'b', 'c'].map((id) => ({ id: 'fish_hook' }));
  ts.shop.offers[0] = { kind: 'trinket', id: 'salt_barrel', grade: 1, sold: false };
  assert.deepEqual(buyOffer(ts, 0), { ok: false, reason: 'shelf full' }); // 3 slots
  ts.trinkets = [{ id: 'fish_hook' }]; assert.equal(sellTrinket(ts, 0).coins, 2); // half of round(9 x 0.5) = 5
}

// shop odds: printed effectiveOdds match what the shop deals (ECONOMY.md assert 14), start pool, 200,000 offers
{
  assert.deepEqual([SHOP_ODDS.trinket, SHOP_ODDS.token], [0.7, 0.3]);
  assert.deepEqual(SHOP_ODDS.grades.map((x) => Math.round(x * 1000) / 10), [60, 30, 9, 1]);
  const tally = (run, visits) => {
    const kinds = { trinket: 0, token: 0 }, grades = [0, 0, 0, 0];
    for (let v = 0; v < visits; v++) { run.shop = null; for (const o of rollShop(run).offers) { kinds[o.kind]++; if (o.kind === 'trinket') grades[o.grade - 1]++; } }
    const n = kinds.trinket + kinds.token, t = kinds.trinket;
    return { n, share: t / n, grades: grades.map((x) => x / t) };
  };
  const base = newRun({ seed: 'odds', startTrinket: null });
  base.phase = 'shop';
  const eff = effectiveOdds(base);
  assert.deepEqual(eff.grades.map((x) => Math.round(x * 1000) / 10), [60.6, 30.3, 9.1, 0]); // what the shop screen prints
  assert.equal(eff.trinket, 0.7); assert.equal(eff.token, 0.3);
  const obs = tally(base, 66667);
  assert.ok(obs.n >= 200000);
  assert.ok(Math.abs(obs.share - eff.trinket) < 0.01, `trinket share ${obs.share}`);
  eff.grades.forEach((p, i) => assert.ok(Math.abs(obs.grades[i] - p) < 0.01, `grade ${i + 1}: printed ${p}, dealt ${obs.grades[i]}`));
  // a pool that lost a grade: own all three grade 3 trinkets and the odds move to 66.7 / 33.3 / 0 / 0
  const poor = newRun({ seed: 'odds2' });
  poor.phase = 'shop'; poor.trinkets = ['fish_scale', 'full_net', 'sea_chest'].map((id) => ({ id }));
  const e2 = effectiveOdds(poor);
  assert.deepEqual(e2.grades.map((x) => Math.round(x * 1000) / 10), [66.7, 33.3, 0, 0]);
  const o2 = tally(poor, 20000);
  e2.grades.forEach((p, i) => assert.ok(Math.abs(o2.grades[i] - p) < 0.01, `poor grade ${i + 1}`));
}

console.log('check-core: ok');
