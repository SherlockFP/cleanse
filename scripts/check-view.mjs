// View checks that need no WebGL: layout rects at five screen sizes, and the reel stop schedule (the no-near-miss pillar).
import assert from 'node:assert/strict';
import { computeLayout, columnOf, EXCLUSIVE, CASE_RECTS, DESIGN_ASPECT } from '../src/view/layout.js';
import { stopSchedule, buildTimeline, STOP_TIMES, TURBO } from '../src/view/reel-view.js';
import { CoinFlight } from '../src/view/particles.js';
import { Spring } from '../src/view/springs.js';
import { PAL, INK_ORDER, hexToRgb } from '../src/view/palette.js';
import { makeRng } from '../src/core/rng.js';
import { makeBag, drawGrid, findPairs, findLines, scoreSpin } from '../src/core/reel.js';
import { SYMBOLS } from '../src/core/data/symbols.js';

const EPS = 1e-6;
const inside = (a, b) => a.x >= b.x - EPS && a.y >= b.y - EPS && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS;
const overlap = (a, b) => a.x < b.x + b.w - EPS && b.x < a.x + a.w - EPS && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS;

// ---------- layout ----------
const SIZES = [[390, 844], [360, 640], [430, 932], [768, 1024], [820, 1180], [1440, 900]];
for (const [w, h] of SIZES) {
  const L = computeLayout(w, h), tag = `${w}x${h}`;
  const names = [...EXCLUSIVE, 'lantern'];
  for (const n of names) {
    const r = L[n];
    assert.ok(r && [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0, `${tag}: ${n} is a real rect`);
    assert.ok(inside(r, L.screen), `${tag}: ${n} inside the screen`);
    assert.ok(inside(r, L.column), `${tag}: ${n} inside the column`);
  }
  for (let i = 0; i < EXCLUSIVE.length; i++) for (let j = i + 1; j < EXCLUSIVE.length; j++)
    assert.ok(!overlap(L[EXCLUSIVE[i]], L[EXCLUSIVE[j]]), `${tag}: ${EXCLUSIVE[i]} overlaps ${EXCLUSIVE[j]}`);
  assert.ok(inside(L.lantern, L.top), `${tag}: lantern string inside the top strip`);
  assert.equal(L.cells.length, 9);
  L.cells.forEach((c, i) => {
    assert.ok(inside(c, L.case), `${tag}: cell ${i} inside the case`);
    for (let j = i + 1; j < 9; j++) assert.ok(!overlap(c, L.cells[j]), `${tag}: cells ${i} and ${j} overlap`);
  });
  assert.ok(L.spin.y >= (2 * h) / 3 - EPS, `${tag}: SPIN button in the bottom third (y ${L.spin.y.toFixed(1)} >= ${(2 * h / 3).toFixed(1)})`);
  assert.ok(L.spin.h >= 56 && L.spin.w >= 160, `${tag}: SPIN is a thumb-size target`);
  assert.ok(L.cells[0].w >= 56, `${tag}: cells are at least 56 px (${L.cells[0].w.toFixed(1)})`);
  assert.ok(L.cells.every((c) => Math.abs(c.w - c.h) < 0.01), `${tag}: cells are square`);
  assert.ok(Math.abs(L.column.x + L.column.w / 2 - w / 2) < 0.5, `${tag}: column is centered`);
  console.log(`  ${tag}: column ${L.column.w.toFixed(0)} wide, case ${L.case.w.toFixed(0)}x${L.case.h.toFixed(0)}, cell ${L.cells[0].w.toFixed(0)}px, deni ${L.deni.w.toFixed(0)}x${L.deni.h.toFixed(0)}, SPIN y ${L.spin.y}`);
}
// desktop rule: a wide window is a 9:19.5 column, a phone is the whole window
{
  const d = columnOf(1440, 900);
  assert.ok(Math.abs(d.w / d.h - DESIGN_ASPECT) < 1e-9 && d.x > 0, 'desktop: 9:19.5 column with paper on both sides');
  assert.deepEqual(columnOf(390, 844), { x: 0, y: 0, w: 390, h: 844 });
  // a real case_rects.json can replace the placeholder: other window sizes still land inside the case
  const odd = { size: [1000, 1200], cells: Array.from({ length: 9 }, (_, i) => ({ x: 100 + (i % 3) * 270, y: 300 + Math.floor(i / 3) * 280, w: 250, h: 260 })) };
  const L = computeLayout(390, 844, odd);
  L.cells.forEach((c) => assert.ok(inside(c, L.case), 'custom case rects stay inside the case'));
}
console.log('layout ok');

// ---------- stop schedule: same times whatever the grid ----------
const bag = makeBag(Object.fromEntries(SYMBOLS.filter((s) => s.start > 0).map((s) => [s.id, s.start])));
const found = { pairs: null, none: ['pebble', 'sardine', 'tea', 'lantern', 'gull', 'net', 'kelp', 'cat', 'samovar'], lines: null }; // none: nine different symbols, so no pair anywhere
assert.equal(findPairs(found.none).length + findLines(found.none, []).length, 0);
for (let seed = 1; seed < 4000 && !(found.pairs && found.lines); seed++) {
  const grid = drawGrid(bag, makeRng(seed), 1, 1, null, []);
  const hasPairs = findPairs(grid).length > 0, hasLines = findLines(grid, []).length > 0;
  if (hasPairs && !hasLines) found.pairs ??= grid;
  if (hasLines) found.lines ??= grid;
}
assert.ok(found.pairs && found.none && found.lines, 'found test grids (pairs / no pairs / a win)');
console.log('  pair grid ', found.pairs.join(','), '| pairs', findPairs(found.pairs).join(','));
console.log('  plain grid', found.none.join(','));
console.log('  win grid  ', found.lines.join(','), '| total', scoreSpin(found.lines, []).total);

for (const opts of [{}, { turbo: true }]) {
  const k = opts.turbo ? TURBO : 1, want = STOP_TIMES.map((t) => t * k);
  const sched = [found.pairs, found.none, found.lines].map((g) => stopSchedule(g, opts));
  sched.forEach((s) => assert.deepEqual(s, want, 'stop times are the fixed table'));
  assert.ok(want[0] < want[1] && want[1] < want[2], 'columns stop left to right');
  for (const held of [[], [0, 4], [2, 5, 8]]) {
    const tl = [found.pairs, found.none, found.lines].map((grid) => buildTimeline({ grid, held }, opts));
    // identical per-cell plan except the landing symbol: no timing field may depend on the grid
    const strip = (t) => JSON.stringify({ stops: t.stops, end: t.end, cells: t.cells.map(({ i, col, spin, stopAt }) => ({ i, col, spin, stopAt })) });
    assert.equal(strip(tl[0]), strip(tl[1]), 'timeline with pairs equals timeline without');
    assert.equal(strip(tl[0]), strip(tl[2]), 'timeline with a win equals timeline without');
    tl[0].cells.forEach((c) => assert.equal(c.stopAt, want[c.col], 'every cell stops with its column'));
  }
}
// the same pair grid with different seeds of the surrounding grids: schedule never reads symbols
assert.deepEqual(Object.keys(buildTimeline({ grid: found.none }).cells[0]).sort(), ['col', 'i', 'spin', 'stopAt', 'target']);
console.log('stop schedule ok');

// ---------- small pure parts ----------
{
  const f = new CoinFlight(8), landedAt = [];
  assert.equal(f.launch([{ x: 10, y: 300 }], { x: 200, y: 50 }, 5), 5);
  const out = { x: 0, y: 0, u: 0, s: 1 };
  assert.equal(f.at(0, out), true); assert.equal(f.at(4, out), false, 'last coin still waits for its stagger');
  let landed = 0;
  for (let t = 0; t < 3 && f.n; t += 1 / 60) landed += f.update(1 / 60);
  assert.equal(landed, 5); assert.equal(f.n, 0, 'all coins reach the jar');
  const cap = new CoinFlight(3); assert.equal(cap.launch([{ x: 0, y: 0 }], { x: 1, y: 1 }, 9), 3, 'pool is capped');
  const sp = new Spring(1); sp.kick(6);
  for (let i = 0; i < 240; i++) sp.step(1 / 60);
  assert.ok(sp.settled(), 'spring settles');
  assert.equal(INK_ORDER.length, 6);
  assert.deepEqual(hexToRgb(PAL.navy).map((v) => Math.round(v * 255)), [30, 42, 68]);
}
console.log('check-view ok');
