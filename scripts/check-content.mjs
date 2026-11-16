// Content tables (v1.0-lite scope: 12 symbols, 35 trinkets, 6 charts, 4 events, 8 lines) and one unit test per lite trinket.
// Full counts (16/64/...) arrive with the monthly drops.
import assert from 'node:assert/strict';
import { SYMBOLS } from '../src/core/data/symbols.js';
import { TRINKETS, HOOKS, FAMILIES } from '../src/core/data/trinkets.js';
import { LINES } from '../src/core/data/lines.js';
import { CHARTS } from '../src/core/data/charts.js';
import { EVENTS } from '../src/core/data/events.js';
import { PRICES, LINE_PAY } from '../src/core/econ.js';
import { scoreSpin } from '../src/core/reel.js';
import { applyTrinkets, scoringState, settleSpin, EFFECTS } from '../src/core/trinkets.js';
import { newRun, endTide, quotaFor } from '../src/core/run.js';
import { rollShop, priceOf, removeToken } from '../src/core/shop.js';

const deepFrozen = (o) => !o || typeof o !== 'object' || (Object.isFrozen(o) && Object.values(o).every(deepFrozen));
const unique = (a) => new Set(a).size === a.length;
const count = (a, f) => a.filter(f).length;

// counts
assert.equal(SYMBOLS.length, 12);
assert.equal(TRINKETS.length, 35);
assert.equal(CHARTS.length, 6);
assert.equal(EVENTS.length, 4);
assert.equal(LINES.length, 8);
assert.equal(HOOKS.length, 18);
for (const t of [SYMBOLS, TRINKETS, LINES, HOOKS, FAMILIES, CHARTS, EVENTS]) assert.ok(deepFrozen(t));

// unique ids
for (const t of [SYMBOLS, TRINKETS, LINES, CHARTS, EVENTS]) assert.ok(unique(t.map((x) => x.id)));
assert.ok(unique(HOOKS));

// symbols
const symIds = new Set(SYMBOLS.map((s) => s.id));
assert.equal(SYMBOLS.reduce((a, s) => a + s.start, 0), 16); // start bag
const ALIAS = { knot: 'three_knots', seaglass: 'sea_glass', cormorant: 'golden_cormorant' }; // data ids vs econ.js keys
for (const s of SYMBOLS) {
  assert.equal(s.nameKey, `sym.${s.id}`);
  assert.ok(s.en && s.tr, s.id);
  assert.ok(['line', 'wild', 'special', 'junk'].includes(s.type), s.id);
  if (s.type === 'line' || s.type === 'wild') assert.equal(s.pay, LINE_PAY[ALIAS[s.id] ?? s.id], `${s.id} pay vs econ.js`);
  else assert.equal(s.pay, 0, s.id);
  if (s.type === 'special') { assert.ok(s.rule && s.cap === 3, s.id); assert.ok(s.price !== null, s.id); }
  if (s.rule?.kind === 'adjacent') for (const t of s.rule.targets) assert.ok(symIds.has(t), `${s.id} target ${t}`);
  if (s.price !== null) assert.ok(s.price >= PRICES.tokenMin && s.price <= PRICES.tokenMax, `${s.id} price`);
  if (s.type === 'junk') assert.equal(s.price, null);
}
assert.equal(count(SYMBOLS, (s) => s.type === "line"), 5);
assert.equal(count(SYMBOLS, (s) => s.type === 'special'), 4);

// trinkets
const GRADE_COUNT = [16, 13, 6, 0];
const FAMILY_COUNT = { catch: 8, hearth: 8, peg: 3, tide: 8, ledger: 8 };
for (const t of TRINKETS) {
  assert.ok(FAMILIES.includes(t.family), t.id);
  assert.ok([1, 2, 3, 4].includes(t.grade), t.id);
  assert.equal(t.price, PRICES.trinket[t.grade - 1], `${t.id} price vs grade`);
  assert.ok(t.hooks.length && t.hooks.every((h) => HOOKS.includes(h)), `${t.id} names an unknown hook`);
  assert.equal(t.hook, t.hooks[0]);
  assert.deepEqual(Object.keys(EFFECTS[t.id] ?? {}).filter((k) => k !== 'settle').sort(), [...t.hooks].sort(), `${t.id} handlers vs hooks`);
  assert.ok(t.params && typeof t.params === 'object', t.id);
  if (t.params.sym) assert.ok(symIds.has(t.params.sym), `${t.id} sym`);
  assert.equal(t.nameKey, `trinket.${t.id}.name`);
  assert.equal(t.shortKey, `trinket.${t.id}.short`);
  assert.equal(t.descKey, `trinket.${t.id}.desc`);
  assert.ok(t.en && t.tr, t.id);
  assert.ok(['start', 'cat_basket', 'radio', 'tea_corner'].includes(t.unlock), t.id);
}
for (const g of [1, 2, 3, 4]) assert.equal(count(TRINKETS, (t) => t.grade === g), GRADE_COUNT[g - 1], `grade ${g}`);
for (const f of FAMILIES) assert.equal(count(TRINKETS, (t) => t.family === f), FAMILY_COUNT[f] ?? 0, f);

// lines: 3 rows, 3 columns, 2 diagonals, every cell in 2-4 lines
assert.deepEqual(['row', 'col', 'diag'].map((k) => count(LINES, (l) => l.kind === k)), [3, 3, 2]);
for (const l of LINES) assert.ok(l.cells.length === 3 && unique(l.cells) && l.cells.every((c) => c >= 0 && c < 9), l.id);
for (let c = 0; c < 9; c++) assert.ok([2, 3, 4].includes(count(LINES, (l) => l.cells.includes(c))), `cell ${c}`);

// start pool: 22 trinkets, 12 / 7 / 3 / 0 by grade (CONTENT.md section 2)
assert.equal(count(TRINKETS, (t) => t.unlock === 'start'), 22);
assert.deepEqual([1, 2, 3, 4].map((g) => count(TRINKETS, (t) => t.unlock === 'start' && t.grade === g)), [12, 7, 3, 0]);

// charts and events
for (const c of CHARTS) assert.ok(c.en && c.tr && c.mods && c.nameKey === `chart.${c.id}.name`, c.id);
for (const e of EVENTS) assert.ok(e.en && e.tr && e.mods && e.nameKey === `event.${e.id}.name`, e.id);
assert.deepEqual(CHARTS.map((c) => c.id), ['spring_tide', 'neap_tide', 'bare_line', 'market_day', 'tight_shelf', 'long_evening']);
assert.deepEqual(EVENTS.map((e) => e.id), ['auditor', 'fog_bank', 'short_day', 'low_water']);

// ---- one unit test per lite trinket: state in, expected coins out. 'barnacle' is the filler: junk, pays 0.
const g = (cells) => { const a = Array(9).fill('barnacle'); for (const [i, v] of Object.entries(cells)) a[i] = v; return a; };
const at = (ids, v) => Object.fromEntries(ids.map((i) => [i, v]));
const pay = (trinkets, grid, held = [], st = {}) => scoreSpin(grid, held, scoringState({ trinkets, ...st })).total;
const tested = new Set();
const unit = (id, fn) => { tested.add(id); fn(id); };
const sardineRow = g(at([0, 1, 2], 'sardine')); // one line, base 6
const lanternRow1 = g(at([3, 4, 5], 'lantern')); // one line, base 10
const shop = (opts) => { const r = newRun({ seed: 7, ...opts }); r.phase = 'shop'; rollShop(r); return r; };

unit('salt_barrel', (t) => { assert.equal(pay([t], sardineRow), 11); assert.equal(pay([t], g(at([0, 1, 2], 'tea'))), 7); });
unit('fish_cart', (t) => {
  const four = g(at([0, 1, 5, 7], 'sardine')); // 4 sardines, no line
  assert.equal(pay([], four), 0); assert.equal(pay([t], four), 20);
  assert.equal(pay([t], four, [0]), 0); assert.equal(pay([t], g(at([0, 1, 5, 7, 8], "sardine")), [0]), 20); // held sardines did not land
});
unit('net_mender', (t) => {
  const netG = g({ 1: 'sardine', 3: 'sardine', 4: 'net' });
  assert.equal(pay([], netG), 4); assert.equal(pay([t], netG), 8); assert.equal(pay([t], netG, [1, 3, 4]), 0);
});
unit('fish_hook', (t) => assert.equal(pay([t], sardineRow), 12));
unit('ice_crate', (t) => {
  assert.equal(pay([t], sardineRow, [0, 1]), 30); assert.equal(pay([t], sardineRow, [0]), 18); assert.equal(pay([t], sardineRow), 6);
});
unit('pier_cat', (t) => {
  const cat = g({ 0: 'sardine', 1: 'sardine', 2: 'sardine', 4: 'cat' }); // line 6 + cat 4 (one adjacent sardine)
  assert.equal(pay([], cat), 10); assert.equal(pay([t], cat), 19); // (6 + 5) + 4 x 2
});
unit('fish_scale', (t) => {
  assert.equal(pay([{ id: t, bonus: 6 }], sardineRow), 12);
  const e = { id: t }, st = scoringState({ trinkets: [e] });
  for (const want of [6, 12, 18, 24, 30, 30, 30]) { settleSpin(st, scoreSpin(sardineRow, [], st)); assert.equal(e.bonus, want); }
  assert.equal(pay([e], sardineRow), 36);
  const two = g(at([0, 1, 2, 3, 4, 5], 'sardine')), e2 = { id: t }; // two paying lines in one spin grow it by 12
  const st2 = scoringState({ trinkets: [e2] });
  settleSpin(st2, scoreSpin(two, [], st2));
  assert.equal(e2.bonus, 12);
});
unit('full_net', (t) => {
  const six = g(at([0, 1, 3, 5, 7, 8], 'sardine')); // 6 sardines, no line
  assert.equal(pay([], six), 0); assert.equal(pay([t], six), 40); assert.equal(pay([t], six, [0, 1]), 0);
});
unit('samovar_tap', (t) => assert.equal(pay([t], g(at([0, 1, 2], 'tea'))), 13));
unit('lantern_oil', (t) => assert.equal(pay([t], lanternRow1), 18));
unit('sugar_cube', (t) => {
  const tl = g({ 0: 'tea', 1: 'lantern' });
  assert.equal(pay([t], tl), 3); assert.equal(pay([t], tl, [0]), 3); assert.equal(pay([t], tl, [0, 1]), 0);
  assert.equal(pay([t], g({ 0: 'tea', 2: 'lantern' })), 0); // not adjacent
});
unit('warm_rug', (t) => {
  assert.equal(pay([t], g({}), [], { spin: 2 }), 2); assert.equal(pay([t], g({}), [], { spin: 1 }), 0);
  assert.equal(pay([t], g({}), [4], { spin: 2 }), 0);
  assert.equal(pay([t], g({}), [], { spin: 6, spins: 7 }), 2); assert.equal(pay([t], g({}), [], { spin: 7, spins: 7 }), 0); // spins 2-6 only
});
unit('grandmas_cup', (t) => assert.equal(pay([t], g(at([0, 1, 2], 'tea'))), 14));
unit('hearth_stone', (t) => {
  const end = (jar) => applyTrinkets('onTideEnd', { trinkets: [t] }, { jar }).coins;
  assert.equal(end(50), 10); assert.equal(end(0), 0); assert.equal(end(500), 20);
});
unit('wick_trimmer', (t) => {
  assert.equal(pay([t], lanternRow1), 30); assert.equal(pay([t], g(at([1, 4, 7], 'lantern'))), 30);
  assert.equal(pay([t], g(at([0, 1, 2], 'lantern'))), 10); assert.equal(pay([t], g(at([0, 4, 8], 'lantern'))), 10);
});
unit('tea_garden', (t) => {
  const both = g({ ...at([0, 1, 2], 'tea'), ...at([6, 7, 8], 'lantern') });
  assert.equal(pay([], both), 17); assert.equal(pay([t], both), 51); assert.equal(pay([t], g(at([0, 1, 2], 'tea'))), 7);
});
unit('spare_peg', (t) => { assert.equal(applyTrinkets('onPegSupply', { trinkets: [t] }), 1); assert.equal(newRun({ seed: 1, startTrinket: t }).pegsMax, 4); });
unit('steady_hand', (t) => { assert.equal(pay([t], sardineRow, [0, 1]), 9); assert.equal(pay([t], sardineRow, [0]), 6); assert.equal(pay([t], sardineRow), 6); });
unit('brass_peg', (t) => {
  assert.equal(pay([t], sardineRow, [0, 1]), 10);
  const cross = g(at([0, 1, 2, 3, 6], 'sardine')); // a row and a column share held cell 0: paid once
  assert.equal(pay([t], cross, [0]), 14);
});
unit('first_light', (t) => { assert.equal(pay([t], sardineRow, [], { spin: 1 }), 18); assert.equal(pay([t], sardineRow, [], { spin: 2 }), 6); });
unit('tide_table', (t) => { assert.equal(pay([t], g({}), [], { spin: 3 }), 4); assert.equal(pay([t], g({}), [], { spin: 6 }), 4); assert.equal(pay([t], g({}), [], { spin: 2 }), 0); });
unit('dry_spell', (t) => { assert.equal(pay([t], sardineRow, [], { prevZero: true }), 11); assert.equal(pay([t], sardineRow), 6); }); // ceil(6 x 1.75)
unit('night_tide', (t) => {
  assert.equal(pay([t], sardineRow, [], { spin: 6, spins: 6 }), 12); assert.equal(pay([t], sardineRow, [], { spin: 5, spins: 6 }), 6);
  assert.equal(pay([t], sardineRow, [], { spin: 7, spins: 7 }), 12);
});
unit('lucky_sandal', (t) => {
  assert.equal(pay([{ id: t, charges: 3 }], g({})), 30); assert.equal(pay([{ id: t, charges: 2 }], g({})), 0);
  const e = { id: t }, st = scoringState({ trinkets: [e] });
  for (const want of [1, 2, 3]) { settleSpin(st, scoreSpin(g({}), [], st)); assert.equal(e.charges, want); } // three empty spins
  const paid = scoreSpin(g({}), [], st);
  assert.equal(paid.total, 30); settleSpin(st, paid); assert.equal(e.charges, 0);
  settleSpin(st, scoreSpin(sardineRow, [], st)); assert.equal(e.charges, 0); // a paying spin adds none
});
unit('slack_water', (t) => {
  assert.equal(applyTrinkets('onQuota', { trinkets: [t] }), 0.92);
  const r = newRun({ seed: 1, startTrinket: t });
  assert.equal(r.quota, 14); assert.equal(quotaFor(r, 2), 28); // ceil(15 x .92), ceil(30 x .92)
});
unit('orhans_watch', (t) => { const r = newRun({ seed: 1, startTrinket: t }); assert.equal(r.spinsMax, 7); assert.equal(r.pegsMax, 4); });
unit('second_wind', (t) => {
  for (const [gap, mercy] of [[15, true], [20, true], [21, false]]) {
    const q = newRun({ seed: 1, startTrinket: t });
    q.spin = q.spinsMax; q.jar = q.quota - gap;
    assert.equal(endTide(q).mercy, mercy, `gap ${gap}`);
  }
  const r = newRun({ seed: 1, startTrinket: t });
  const again = (jar) => { r.phase = 'tide'; r.spin = r.spinsMax; r.quota = 30; r.jar = jar; return endTide(r); };
  assert.equal(again(12).mercy, true); assert.equal(again(12).mercy, true); // twice per run
  assert.equal(again(12).paid, false); // a third time: no
});
unit('tin_cup', (t) => { assert.equal(applyTrinkets('onTideStart', { trinkets: [t] }).coins, 8); assert.equal(newRun({ seed: 1, startTrinket: t }).jar, 8); });
unit('lucky_ledger', (t) => {
  const r = shop({ startTrinket: t });
  const costs = [];
  for (let i = 0; i < 4; i++) { costs.push(priceOf(r, { kind: 'reroll' })); r.shop.reroll++; }
  assert.deepEqual(costs, [0, 0, 4, 5]);
  assert.equal(priceOf(shop({}), { kind: 'reroll' }), 2);
});
unit('pebble_jar', (t) => assert.equal(pay([t], g(at([0, 1, 2], 'pebble'))), 8));
unit('skipping_stone', (t) => {
  assert.equal(pay([t], g(at([0, 1, 5, 7], 'pebble'))), 4); assert.equal(pay([t], g(at([0, 1, 3, 5, 7, 8], 'pebble'))), 6);
  assert.equal(pay([t], g(at([0, 1, 5], 'pebble'))), 2); assert.equal(pay([t], g(at([0, 1, 5, 7], 'pebble')), [0, 1]), 2);
});
unit('hagglers_cap', (t) => {
  const r = shop({ startTrinket: t }), plain = shop({});
  assert.equal(priceOf(plain, { kind: 'trinket', id: 'salt_barrel' }), 5); assert.equal(priceOf(r, { kind: 'trinket', id: 'salt_barrel' }), 4);
  assert.equal(priceOf(r, { kind: 'trinket', id: 'fish_hook' }), 7); assert.equal(priceOf(r, { kind: 'trinket', id: 'full_net' }), 11);
  assert.equal(priceOf(r, { kind: 'token', sym: 'lantern' }), 5); assert.equal(priceOf(r, { kind: 'reroll' }), 2);
});
unit('junk_cart', (t) => {
  const r = shop({ startTrinket: t });
  r.jar = 50;
  assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 0 }); assert.equal(r.jar, 50);
  assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 20 }); // flat price; the free one still used one of the 3 removals
  assert.deepEqual(removeToken(r, 'pebble'), { ok: true, price: 20 });
  assert.deepEqual(removeToken(r, 'pebble'), { ok: false, reason: 'no removals left' });
  const plain = shop({});
  plain.jar = 50;
  assert.deepEqual(removeToken(plain, 'pebble'), { ok: true, price: 20 });
});
unit('kelp_pot', (t) => {
  const k = g({ 0: 'kelp' });
  const r1 = scoreSpin(k, [], scoringState({ trinkets: [t], kelp: 1 }));
  assert.equal(r1.total, 1); assert.equal(r1.kelp, 3);
  assert.equal(scoreSpin(k, [], scoringState({ trinkets: [t], kelp: 6 })).kelp, 7); // max 7
  assert.equal(scoreSpin(k, [], scoringState({ trinkets: [], kelp: 3 })).kelp, 4);
  const sold = scoreSpin(k, [], scoringState({ trinkets: [], kelp: 7 })); // Kelp Pot sold with the counter at 7: back to the plain max
  assert.equal(sold.total, 5); assert.equal(sold.kelp, 5);
});
unit('sea_chest', (t) => {
  assert.equal(applyTrinkets('onTideEnd', { trinkets: [t, 'tin_cup', 'salt_barrel'] }, { jar: 0 }).coins, 9);
  assert.equal(applyTrinkets('onTideEnd', { trinkets: [t] }, { jar: 0 }).coins, 3);
});
assert.deepEqual([...tested].sort(), TRINKETS.map((t) => t.id).sort(), 'every lite trinket has a unit test');

// shelf order never changes a total: all 35 trinkets, three orders, one rich grid
{
  const all = TRINKETS.map((t) => t.id);
  const rich = g({ 0: 'sardine', 1: 'sardine', 2: 'sardine', 3: 'tea', 4: 'cat', 5: 'tea', 6: 'lantern', 7: 'lantern', 8: 'lantern' });
  const totals = [all, [...all].reverse(), [...all.slice(11), ...all.slice(0, 11)]].map((o) => pay(o, rich, [0, 1], { spin: 3, prevZero: true }));
  assert.equal(new Set(totals).size, 1);
}

// chart and event effects on pay
assert.equal(scoreSpin(sardineRow, [], scoringState({ linePayMul: 1.25 })).total, 8); // spring_tide: ceil(7.5)
const low = scoringState({ lineSkip: ['row2'] });
assert.equal(scoreSpin(g(at([6, 7, 8], 'sardine')), [], low).total, 0); // low_water: bottom row does not pay
assert.equal(scoreSpin(g(at([3, 4, 5], 'sardine')), [], low).total, 6);

console.log('check-content: ok');
