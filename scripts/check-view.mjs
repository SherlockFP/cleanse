// View checks that need no WebGL: layout rects at four screen sizes, the reel stop schedule (the no-near-miss pillar) and the highlight plan.
import assert from 'node:assert/strict';
import { computeLayout, columnOf, EXCLUSIVE, OVERLAYS, DESIGN_ASPECT } from '../src/view/layout.js';
import { stopSchedule, buildTimeline, highlightPlan, STOP_GAP, FAST_GAP, MAX_HIGHLIGHT } from '../src/view/reel-view.js';
import { CoinFlight } from '../src/view/particles.js';
import { Spring } from '../src/view/springs.js';
import { PAL, PATTERN_COLORS, hexToRgb } from '../src/view/palette.js';
import { Lever, outcomeOf, THRESHOLD, TICKS, SPRING_S } from '../src/view/lever.js';
import { redEyePlan, vignetteAt, gaugeFill, gaugeText, EYE_CELLS } from '../src/view/omen-view.js';
import { moodOf, portraitId } from '../src/view/spirit-view.js';
import { blendPhase, blendEnd, rattleAt } from '../src/view/blend-view.js';
import { PLACE_PINS, pinRects, placeBg } from '../src/view/map-view.js';
import { rungOfPaid, rungIds, rungRects } from '../src/view/rung-view.js';
import { winPlan, countAt } from '../src/view/win-view.js';

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
  // v3 overlays: the lever strip, the Red Eye gauge and HONK. They draw on the machine but never on a cell, a button or each other.
  for (const n of [...OVERLAYS, 'honk', 'spirits']) {
    const r = L[n];
    assert.ok(r && [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0 && inside(r, L.column) && inside(r, L.screen), `${tag}: ${n} is a real rect in the column`);
  }
  for (const n of OVERLAYS) {
    for (const c of L.cells) assert.ok(!overlap(L[n], c), `${tag}: ${n} overlaps a cell`);
    for (const o of ['hud', 'curses', 'stage', 'charms', 'pockets', 'honk', 'stoke', 'spin', 'bank']) assert.ok(!overlap(L[n], L[o]), `${tag}: ${n} overlaps ${o}`);
  }
  assert.ok(!overlap(L.lever, L.omen), `${tag}: lever and omen gauge are apart`);
  assert.ok(L.lever.x > L.cells[4].x + L.cells[4].w && L.lever.x + L.lever.w <= L.column.x + L.column.w - 12 + EPS, `${tag}: lever stands right of the window, off the screen edge`);
  assert.ok(L.lever.w >= 30 && L.lever.h >= 3 * L.cells[0].h, `${tag}: lever is a thumb-wide strip as tall as the window`);
  assert.ok(L.omen.y + L.omen.h <= L.cells[0].y + EPS && L.omen.y >= L.stage.y + L.stage.h - EPS, `${tag}: omen gauge sits between the stage and the window`);
  assert.ok(L.honk.w >= 40 && L.honk.h >= 40 && !overlap(L.honk, L.pockets), `${tag}: HONK is a tappable square beside the pockets`);
  assert.ok(L.spirits.w >= 24 && L.speech.w > 40, `${tag}: spirits column and speech both have room (speech ${L.speech.w.toFixed(0)})`);
  for (const k of ['goalBar', 'lever', 'honk', 'omen', 'spirits', 'spin']) assert.ok(L.anchors[k] && inside(L.anchors[k], L.screen), `${tag}: anchor ${k}`);
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

// ---------- lever ----------
{
  const log = [], h = { spin: () => log.push('spin'), tease: () => log.push('tease'), tick: (n) => log.push('tick' + n), thud: () => log.push('thud') };
  const strip = { x: 340, y: 300, w: 36, h: 190 }, reels = { x: 0, y: 280, w: 340, h: 220 }, len = strip.h * 0.62;
  const lv = new Lever(h); lv.setRects(strip, reels);
  assert.equal(lv.hit(350, 320), 'strip'); assert.equal(lv.hit(100, 400), 'reels'); assert.equal(lv.hit(100, 10), null);
  assert.equal(outcomeOf(THRESHOLD), 'spin'); assert.equal(outcomeOf(THRESHOLD - 0.01), 'tease'); assert.equal(outcomeOf(0), 'none'); assert.equal(outcomeOf(1, false), 'none');
  // drag past 70%: spin, five ticks, one thud, springs back over 220 ms
  lv.down(350, 310); lv.move(350, 310 + len * 0.5); lv.move(350, 310 + len * 0.8); lv.move(350, 310 + len * 1.4);
  assert.deepEqual(log, ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'thud'], 'five ticks, then one thud at the stop');
  log.length = 0;
  assert.equal(lv.up(), 'spin'); assert.deepEqual(log, ['spin']);
  let t = 0; while (lv.busy && t < 1) { lv.step(1 / 60); t += 1 / 60; }
  assert.ok(t <= SPRING_S + 0.03 && lv.travel === 0, `knob is back in ${(t * 1000).toFixed(0)} ms`);
  // release at 50%: a tease, no spin
  log.length = 0; lv.down(350, 310); lv.move(350, 310 + len * 0.5); log.length = 0;
  assert.equal(lv.up(), 'tease'); assert.deepEqual(log, ['tease']); while (lv.busy) lv.step(1 / 60);
  // a tap spins
  log.length = 0; lv.down(350, 400); assert.equal(lv.up(), 'spin'); assert.ok(log.includes('spin')); while (lv.busy) lv.step(1 / 60);
  // swipe down on the reels spins; a sideways drag or a short one does not
  log.length = 0; lv.down(100, 300); lv.move(100, 300 + reels.h * 0.4); assert.equal(lv.up(), 'spin'); while (lv.busy) lv.step(1 / 60);
  log.length = 0; lv.down(100, 300); lv.move(250, 330); assert.equal(lv.up(), 'none'); assert.ok(!log.includes('spin'), 'sideways drag does not spin');
  lv.down(100, 300); lv.move(100, 300 + reels.h * 0.12); assert.equal(lv.up(), 'tease', 'a short swipe only rattles'); while (lv.busy) lv.step(1 / 60);
  // disabled: never moves
  lv.setEnabled(false); log.length = 0; assert.equal(lv.down(350, 310), false); assert.equal(lv.up(), 'none'); assert.deepEqual(log, []); assert.equal(lv.travel, 0);
  assert.equal(TICKS, 5);
}
console.log('lever ok');

// ---------- Red Eye omen ----------
{
  assert.deepEqual(EYE_CELLS, [6, 7, 8]);
  assert.equal(gaugeFill(3), 0.5); assert.equal(gaugeFill(99), 1); assert.equal(gaugeText('Red Eye', 2), 'Red Eye 2.0%');
  for (const level of [0, 1, 2, 3]) for (const blessed of [false, true]) {
    const pl = redEyePlan({ level, blessed });
    assert.equal(pl.eyes.length, 3);
    assert.ok(pl.eyes.every((e, i) => i === 0 || e.at > pl.eyes[i - 1].at), 'eyes land one after another');
    assert.ok(pl.vig.in >= 0.45 && pl.vig.peak <= 0.38 && pl.vig.out >= 0.9, 'vignette is slow and never above 0.38: no flash');
    let prev = 0, maxStep = 0;
    for (let t = 0; t <= pl.end + 0.1; t += 1 / 60) { const a = vignetteAt(pl, t); maxStep = Math.max(maxStep, Math.abs(a - prev)); prev = a; }
    assert.ok(maxStep < 0.02, `vignette changes by at most ${maxStep.toFixed(4)} per frame`);
    assert.equal(vignetteAt(pl, pl.end + 0.01), 0);
    assert.equal(pl.vig.tone, blessed ? 'gold' : 'red');
    if (blessed) assert.equal(pl.shake, 0, 'a blessed Red Eye does not shake');
  }
  assert.ok(redEyePlan({ level: 3 }).vig.peak > redEyePlan({ level: 1 }).vig.peak && redEyePlan({ level: 3 }).shake > redEyePlan({ level: 1 }).shake, 'higher punishment, stronger beat');
}
console.log('omen ok');

// ---------- spirits, blender, rank-up, map ----------
{
  assert.equal(moodOf(-1), 'cross'); assert.equal(moodOf(0), 'calm'); assert.equal(moodOf(4), 'calm'); assert.equal(moodOf(5), 'glad');
  assert.equal(portraitId('gold', 'glad'), 'spirit/gold_glad'); assert.equal(portraitId('gold', 'nonsense'), 'spirit/gold_calm');
  assert.equal(blendPhase(0).phase, 'slide'); assert.equal(blendPhase(blendEnd() + 0.01).phase, 'done');
  const order = []; for (let t = 0; t < blendEnd(); t += 0.01) { const p = blendPhase(t).phase; if (order.at(-1) !== p) order.push(p); }
  assert.deepEqual(order, ['slide', 'drop', 'whirl', 'pop', 'hold'], 'blender phases in order');
  assert.ok(blendEnd() < 2.5, 'a blend is over in under 2.5 s');
  assert.ok(Array.from({ length: 300 }, (_, i) => Math.abs(rattleAt(i / 100))).every((v) => v <= 0.06 + 1e-9) && rattleAt(0.1) === 0, 'the rattle is small and only during the whirl');
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(rungOfPaid), [0, 0, 1, 1, 2, 2, 3, 3], 'rank-up on the 2nd, 4th and 6th debt paid');
  assert.deepEqual(rungIds(2), ['machine/awning_1', 'machine/awning_2']); assert.equal(rungIds(9).length, 3);
  assert.equal(placeBg(1).id, 'bg/fair'); assert.equal(placeBg(3).id, 'bg/fair', 'no c3 art yet: the fair under a tint'); assert.notEqual(placeBg(3).tint, '#ffffff');
  assert.equal(PLACE_PINS.length, 10);
  assert.ok(PLACE_PINS.every(([x, y]) => x > 0.05 && x < 0.95 && y > 0.1 && y < 0.92) && PLACE_PINS.every((p, i) => !i || p[1] < PLACE_PINS[i - 1][1]), 'ten pins climb the map from south to north');
  for (const [w, h] of [[360, 640], [390, 844], [1440, 900]]) {
    const L = computeLayout(w, h), rs = pinRects(L.column, 512, 1024, 48);
    assert.equal(rs.length, 10);
    assert.ok(rs.every((r) => inside(r, L.column)), `${w}x${h}: every pin is fully on screen`);
    for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) assert.ok(!overlap(rs[i], rs[j]), `${w}x${h}: pins ${i} and ${j} apart`);
    const rr = rungRects(L, (id) => (id.endsWith("1") ? [512, 128] : [256, 160]));
    assert.equal(rr.length, 3); rr.forEach((r, i) => assert.ok(r.x >= L.column.x - 1 && r.x + r.w <= L.column.x + L.column.w + 1, `${w}x${h}: rung ${i} stays in the column`));
  }
}
console.log('spirits, blender, map, rung ok');

// ---------- win sequence ----------
{
  const pays = [{ cells: [0, 1, 2, 3, 4], pay: 12 }, { cells: [2, 6, 8, 12], pay: 8 }, { cells: [5, 6, 7], pay: 5 }];
  const pl = winPlan(pays, 40);
  assert.equal(pl.pops.length, 3, 'one payout pop per pattern');
  assert.deepEqual(pl.pops.map((p) => p.pay), [12, 8, 5]); assert.deepEqual(pl.pops.map((p) => p.cum), [12, 20, 25]);
  assert.ok(pl.pops.every((p, i) => i === 0 || p.at > pl.pops[i - 1].at), 'pops come in pattern order');
  const lastStep = (k) => { const st = pl.hl.steps.filter((x) => x.p === k && x.last)[0]; return st.at + st.dur; };
  pl.pops.forEach((p) => assert.ok(Math.abs(p.at - lastStep(p.p)) < 1e-9, 'a payout pops when its shape is finished'));
  assert.equal(countAt(pl, 0), 0); assert.equal(countAt(pl, pl.end + 5), 40, 'the counter ends on the spin total (40, above the sum 25: Spice and multipliers)');
  let prev = -1; for (let t = 0; t <= pl.end + 0.2; t += 1 / 60) { const v = countAt(pl, t); assert.ok(v >= prev, 'the counter only goes up'); prev = v; }
  assert.equal(countAt(pl, pl.pops[0].at + 1e-4) <= 12 && countAt(pl, pl.pops[1].at - 1e-4) >= 12 - 1, true, 'it reads the running sum between pops');
  assert.ok(pl.end <= MAX_HIGHLIGHT + 0.7, `the whole sequence ends in ${pl.end.toFixed(2)} s`);
  const none = winPlan([], 0); assert.equal(none.pops.length, 0); assert.equal(countAt(none, 9), 0);
  const flat = winPlan([], 30); assert.equal(countAt(flat, 9), 30, 'a flat bonus with no pattern still counts up');
  assert.equal(winPlan([{ cells: [0, 1, 2] }], 7).pops[0].pay, 0, 'a pattern with no pay field pops 0 instead of throwing');
}
console.log('win sequence ok');

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
