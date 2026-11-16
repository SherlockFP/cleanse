// View checks that need no WebGL: layout rects at four screen sizes, the reel stop schedule (the no-near-miss pillar) and the highlight plan.
import assert from 'node:assert/strict';
import { computeLayout, columnOf, EXCLUSIVE, DESIGN_ASPECT } from '../src/view/layout.js';
import { stopSchedule, buildTimeline, highlightPlan, STOP_GAP, FAST_GAP, MAX_HIGHLIGHT } from '../src/view/reel-view.js';
import { CoinFlight } from '../src/view/particles.js';
import { Spring } from '../src/view/springs.js';
import { PAL, PATTERN_COLORS, hexToRgb } from '../src/view/palette.js';

const EPS = 1e-6;
const inside = (a, b) => a.x >= b.x - EPS && a.y >= b.y - EPS && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS;
const overlap = (a, b) => a.x < b.x + b.w - EPS && b.x < a.x + a.w - EPS && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS;

// ---------- layout ----------
const SIZES = [[360, 640], [390, 844], [820, 1180], [1440, 900]];
for (const [w, h] of SIZES) {
  const L = computeLayout(w, h), tag = `${w}x${h}`;
  for (const n of [...EXCLUSIVE, 'bar']) {
    const r = L[n];
    assert.ok(r && [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0, `${tag}: ${n} is a real rect`);
    assert.ok(inside(r, L.screen), `${tag}: ${n} inside the screen`);
    assert.ok(inside(r, L.column), `${tag}: ${n} inside the column`);
  }
  for (let i = 0; i < EXCLUSIVE.length; i++) for (let j = i + 1; j < EXCLUSIVE.length; j++)
    assert.ok(!overlap(L[EXCLUSIVE[i]], L[EXCLUSIVE[j]]), `${tag}: ${EXCLUSIVE[i]} overlaps ${EXCLUSIVE[j]}`);
  assert.ok(inside(L.bar, L.hud), `${tag}: debt bar inside the hud`);
  assert.equal(L.buttons.collect, L.buttons.spin, `${tag}: COLLECT shares the SPIN rect`);
  assert.equal(L.machine, L.case);
  assert.equal(L.cells.length, 15);
  L.cells.forEach((c, i) => {
    assert.ok(inside(c, L.case), `${tag}: cell ${i} inside the case`);
    for (let j = i + 1; j < 15; j++) assert.ok(!overlap(c, L.cells[j]), `${tag}: cells ${i} and ${j} overlap`);
  });
  assert.ok(Math.abs(L.grid.cell - L.cells[0].w) < 1e-9 && L.grid.gap >= 0, `${tag}: grid matches the cells`);
  assert.ok(L.cells[0].x < L.cells[1].x && L.cells[0].y < L.cells[5].y && L.cells[4].x > L.cells[3].x, `${tag}: cells are row-major, 5 wide`);
  assert.ok(L.spin.y >= (2 * h) / 3 - EPS, `${tag}: SPIN in the bottom third (y ${L.spin.y.toFixed(1)} >= ${(2 * h / 3).toFixed(1)})`);
  assert.ok(L.spin.h >= 56 && L.spin.w >= 160, `${tag}: SPIN is a thumb-size target`);
  assert.ok(L.stoke.w >= 56 && L.stoke.h >= 48 && L.bank.w >= 56, `${tag}: STOKE and BANK are tappable`);
  assert.ok(L.cells[0].w >= 44, `${tag}: cells are at least 44 px (${L.cells[0].w.toFixed(1)})`);
  assert.ok(L.cells.every((c) => Math.abs(c.w - c.h) < 0.01), `${tag}: cells are square`);
  assert.ok(Math.abs(L.column.x + L.column.w / 2 - w / 2) < 0.5, `${tag}: column is centered`);
  console.log(`  ${tag}: column ${L.column.w.toFixed(0)}, case ${L.case.w.toFixed(0)}x${L.case.h.toFixed(0)}, cell ${L.cells[0].w.toFixed(0)}px, devil ${L.devil.w.toFixed(0)}x${L.devil.h.toFixed(0)}, SPIN y ${L.spin.y}`);
}
{
  const d = columnOf(1440, 900);
  assert.ok(Math.abs(d.w / d.h - DESIGN_ASPECT) < 1e-9 && d.x > 0, 'desktop: 9:19.5 column with background on both sides');
  assert.deepEqual(columnOf(390, 844), { x: 0, y: 0, w: 390, h: 844 });
  // a real case_rects.json (fractions, non-square windows) still lands inside the case
  const odd = { size: [1000, 1200], windows: Array.from({ length: 15 }, (_, i) => { const x = 0.1 + (i % 5) * 0.16, y = 0.3 + Math.floor(i / 5) * 0.1; return [x, y, x + 0.15, y + 0.09]; }) };
  const L = computeLayout(390, 844, odd);
  L.cells.forEach((c) => assert.ok(inside(c, L.case), 'custom case rects stay inside the case'));
}
console.log('layout ok');

// ---------- stop schedule: same times whatever the grid ----------
const gridA = Array(15).fill('moth'), gridB = Array.from({ length: 15 }, (_, i) => (i % 3 ? 'crown' : 'ash'));
const sa = stopSchedule(gridA), sb = stopSchedule(gridB), sf = stopSchedule(gridA, { fast: true });
assert.deepEqual(sa, sb, 'stop times do not depend on the grid');
assert.deepEqual(sa, stopSchedule(undefined), 'stop times need no grid at all');
assert.equal(sa.length, 5);
for (let c = 1; c < 5; c++) {
  assert.ok(Math.abs(sa[c] - sa[c - 1] - STOP_GAP) < 1e-9, 'columns stop 90 ms apart');
  assert.ok(Math.abs(sf[c] - sf[c - 1] - FAST_GAP) < 1e-9, 'fast mode: 40 ms apart');
}
assert.ok(sf[4] < sa[4] && sa[4] < 1.2, 'fast is faster; a spin is over in about a second');
const tl = buildTimeline({ grid: gridB, held: [2, 7] }), tl2 = buildTimeline({ grid: gridA, held: [2, 7] });
assert.deepEqual(tl.cells.map((c) => c.stopAt), tl2.cells.map((c) => c.stopAt), 'per-cell stop times ignore symbols');
tl.cells.forEach((c) => assert.equal(c.stopAt, sa[c.i % 5], 'a cell stops with its column'));
assert.deepEqual(tl.cells.filter((c) => !c.spin).map((c) => c.i), [2, 7], 'held cells do not spin');
console.log('stop schedule ok');

// ---------- highlight plan ----------
const pats = [{ cells: [0, 1, 2, 3, 4] }, { cells: [2, 6, 8, 12] }, { cells: [0, 4, 10, 14] }, { cells: [5, 6, 7] }];
const plan = highlightPlan(pats);
assert.equal(plan.steps.length, 16, 'one step per cell');
assert.deepEqual(plan.steps.slice(0, 5).map((s) => s.cell), [0, 1, 2, 3, 4], 'cells in the shape order');
assert.deepEqual(plan.steps.map((s) => s.n), [...plan.steps.keys()], 'global step counter rises');
assert.ok(plan.steps.every((s, i) => i === 0 || s.at > plan.steps[i - 1].at), 'steps are in time order');
assert.deepEqual(plan.steps.filter((s) => s.p === 1).map((s) => s.k), [0, 1, 2, 3], 'k (pitch index) rises inside a pattern');
assert.equal(plan.steps.filter((s) => s.last).length, 4, 'one last step per pattern');
assert.ok(plan.total <= MAX_HIGHLIGHT + EPS, `4 patterns in ${plan.total.toFixed(2)} s (max ${MAX_HIGHLIGHT})`);
assert.equal(highlightPlan([]).steps.length, 0);
const many = highlightPlan(Array.from({ length: 8 }, () => ({ cells: [0, 1, 2, 3, 4] })));
assert.ok(many.total <= MAX_HIGHLIGHT + EPS, 'a big pile of patterns still ends in time');
console.log(`highlight plan ok (${plan.total.toFixed(2)} s)`);

// ---------- particles, springs, palette ----------
{
  const f = new CoinFlight(8); let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  assert.equal(f.launch([{ x: 10, y: 200 }], { x: 100, y: 20 }, 5, { rnd }), 5);
  let landed = 0; for (let i = 0; i < 200; i++) landed += f.update(1 / 60);
  assert.equal(landed, 5); assert.equal(f.n, 0, 'all coins land');
  const s = new Spring(1, 360, 12); s.kick(9); for (let i = 0; i < 120; i++) s.step(1 / 60);
  assert.ok(s.settled(), 'spring settles');
  assert.equal(Object.keys(PAL).length, 6);
  for (const c of [...Object.values(PAL), ...PATTERN_COLORS]) assert.ok(/^#[0-9a-f]{6}$/i.test(c) && hexToRgb(c).every((v) => v >= 0 && v <= 1));
}
console.log('check-view ok');
