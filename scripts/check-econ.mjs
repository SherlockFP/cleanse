// Meta and daily gate: Planks, builds, pools, installments, margin notes, album, daily seed, streak. Run: node scripts/check-econ.mjs
import assert from 'node:assert/strict';
import { STRINGS } from '../src/i18n.js';
import { PLANKS } from '../src/core/econ.js';
import { BUILDS, ALBUM } from '../src/core/data/unlocks.js';
import { SYMBOLS } from '../src/core/data/symbols.js';
import { TRINKETS } from '../src/core/data/trinkets.js';
import { grantRunRewards, canBuild, build, unlockedPool, hasFeature, modes, albumProgress, albumAdd, advanceInstallment, tier } from '../src/core/meta.js';
import { dailySeed, dailySetup, streakUpdate, isoWeek, days } from '../src/core/daily.js';
import { newRun, spin, runSummary } from '../src/core/run.js';

const sum = (o = {}) => ({ seed: 1, hash: 'a', won: false, tidesCleared: 0, clutches: 0, bestSpin: 0, installment: 1, trinkets: [], ...o });
let n = 0;
const run = (save, o) => grantRunRewards(save, sum({ hash: String(++n), ...o }));

// ---- Planks: 2 per tide, +5 win, +1 per clutch, first finished run +10 once, the same run never pays twice
let s = {};
let g = run(s, { tidesCleared: 2 });
assert.equal(g.planks, 14); assert.equal(g.parts.first, PLANKS.firstRun); assert.ok(g.firstRun); assert.equal(s.planks, 14);
g = run(s, { tidesCleared: 3, clutches: 1 });
assert.equal(g.planks, 7); assert.ok(!g.firstRun); assert.equal(s.planks, 21);
g = run(s, { tidesCleared: 5, won: true, clutches: 2 });
assert.equal(g.planks, 5 * 2 + 5 + 2); assert.equal(g.parts.win, 5); assert.equal(s.planks, 38);
assert.equal(grantRunRewards(s, sum({ hash: String(n), tidesCleared: 5, won: true })), null, 'same run twice pays nothing');
assert.equal(s.planks, 38);
assert.equal(run({}, { tidesCleared: 0 }).planks, 10, 'first run pays the first-day line even when it clears nothing');
assert.equal(run(s, { tidesCleared: 0 }).planks, 0);
assert.equal(s.stats.runs, 4); assert.equal(s.stats.wins, 1); assert.equal(s.stats.bestTide, 5); assert.equal(s.stats.clutches, 3);

// ---- Builds: fixed order, costs from CONTENT.md, 345 in all
assert.deepEqual(BUILDS.map((b) => [b.id, b.cost]), [['roof', 10], ['stove', 20], ['cat_basket', 30], ['radio', 45], ['tea_corner', 60], ['lamp_post', 180]]);
assert.equal(BUILDS.reduce((a, b) => a + b.cost, 0), 345);
s = { planks: 9 };
assert.equal(canBuild(s, 'roof').reason, 'planks');
assert.equal(canBuild(s, 'nope').reason, 'unknown');
s.planks = 1000;
assert.equal(canBuild(s, 'stove').reason, 'order', 'no skipping ahead');
assert.ok(build(s, 'roof').ok); assert.equal(s.planks, 990);
assert.equal(canBuild(s, 'roof').reason, 'built'); assert.equal(build(s, 'roof').ok, false); assert.equal(s.planks, 990);
assert.deepEqual(unlockedPool(s), ['start']); assert.ok(hasFeature(s, 'album')); assert.ok(!hasFeature(s, 'pick4'));
for (const b of BUILDS.slice(1)) assert.ok(build(s, b.id).ok, b.id);
assert.equal(s.planks, 1000 - 345); assert.equal(canBuild(s, 'lamp_post').reason, 'built');

// ---- Pool: the ids unlockedPool returns are exactly the unlock tags the lite content uses
assert.deepEqual(unlockedPool(s), ['start', 'cat_basket', 'radio', 'tea_corner']);
const tags = new Set([...TRINKETS, ...SYMBOLS].map((x) => x.unlock));
for (const tag of tags) assert.ok(['start', 'events', 'rope_loft', ...unlockedPool(s)].includes(tag), 'content tag with no build: ' + tag);
for (const b of BUILDS.filter((x) => x.pool)) assert.ok(tags.has(b.id), 'pool build opens nothing: ' + b.id);
s = { planks: 1000 }; build(s, 'roof'); build(s, 'stove'); build(s, 'cat_basket');
assert.deepEqual(unlockedPool(s), ['start', 'cat_basket']); assert.ok(hasFeature(s, 'pick4') && hasFeature(s, 'tekir') && !hasFeature(s, 'radio'));
assert.deepEqual(newRun({ seed: 5, unlocked: unlockedPool(s), startTrinket: 'tin_cup' }).unlocked, ['start', 'cat_basket']);

// ---- Installments 1-6: a win at the current one pays it and shows its beat once; losses and other installments do not
s = {};
for (let c = 1; c <= 6; c++) {
  assert.equal(run(s, { won: false, tidesCleared: 4, installment: c }).beat, null, 'a loss pays no installment');
  assert.equal(s.installment, c);
  g = run(s, { won: true, tidesCleared: 5, installment: c });
  assert.equal(g.beat, c); assert.equal(g.done, c === 6); assert.equal(s.installment, Math.min(c + 1, 6)); assert.equal(s.paid, c);
}
assert.equal(run(s, { won: true, tidesCleared: 5, installment: 6 }).beat, null, 'the installment 6 beat shows once');
assert.equal(advanceInstallment(s), null);
s = {}; assert.equal(run(s, { won: true, installment: 3 }).beat, null, 'a win at an installment that is not the current one pays nothing');
assert.equal(tier(1), 1); assert.ok(Math.abs(tier(6) - 1.075) < 1e-9);
assert.deepEqual(modes({}), { lamplight: false, daily: false, charts: false });
assert.deepEqual(modes({ paid: 3, stats: { runs: 2, wins: 3 } }), { lamplight: true, daily: true, charts: true });

// ---- Margin notes: every finished run, won or lost, unlocks the next one, 1 to 18, then nothing
s = {};
const seen = [];
for (let i = 0; i < 20; i++) seen.push(run(s, { won: i % 2 === 0 }).note);
assert.deepEqual(seen, [...Array.from({ length: 18 }, (_, i) => i + 1), null, null]);
const keys = [...Array.from({ length: 18 }, (_, i) => `note.${i + 1}`), ...Array.from({ length: 6 }, (_, i) => `beat.${i + 1}`), ...BUILDS.flatMap((b) => [b.nameKey, b.descKey])];
for (const k of keys) for (const l of ['en', 'tr']) assert.ok(STRINGS[l][k], `${l} ${k}`);

// ---- Album 0 to 100 in a debug save
s = {};
assert.equal(albumProgress(s).percent, 0);
let last = 0;
const steps = [...ALBUM.trinkets.map((id) => ['trinkets', id]), ...ALBUM.symbols.map((id) => ['symbols', id]), ...ALBUM.stamps.map((id) => ['stamps', id])];
for (const [k, id] of steps) { albumAdd(s, k, id, 2); const p = albumProgress(s).percent; assert.ok(p >= last && p < 100, `${k} ${id} ${p}`); last = p; }
assert.ok(last > 0 && last < 100);
albumAdd(s, 'trinkets', 'not_a_trinket'); albumAdd(s, 'symbols', 'pebble'); // unknown and repeated ids change nothing
assert.equal(albumProgress(s).count, steps.length);
s.notes = 17; assert.ok(albumProgress(s).percent < 100);
s.notes = 18; assert.equal(albumProgress(s).percent, 100);
s.notes = 99; assert.equal(albumProgress(s).percent, 100);
const rr = newRun({ seed: 3, startTrinket: 'tin_cup' }); // a real run feeds the album through grantRunRewards
s = {}; grantRunRewards(s, { ...runSummary(rr), bag: rr.bag, stamps: ['auditor'] });
assert.equal(s.album.trinkets.tin_cup, 1); assert.ok(s.album.symbols.includes('pebble') && s.album.stamps.includes('auditor'));

// ---- Daily seed and setup: same date, same setup, no save involved, valid for newRun
assert.equal(dailySeed('2026-11-16'), dailySeed('2026-11-16'));
assert.notEqual(dailySeed('2026-11-16'), dailySeed('2026-11-17'));
assert.deepEqual(dailySetup('2026-11-16'), dailySetup('2026-11-16'));
const spread = { t: new Set(), c: new Set(), e: new Set() };
for (let m = 1; m <= 4; m++) for (let d = 1; d <= 28; d++) {
  const su = dailySetup(`2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  assert.deepEqual(su.unlocked, ['start']); assert.equal(su.installment, 1);
  assert.equal(TRINKETS.find((x) => x.id === su.startTrinket).unlock, 'start');
  spread.t.add(su.startTrinket); spread.c.add(su.chartId); spread.e.add(su.eventId);
}
assert.ok(spread.t.size > 5 && spread.c.size === 6 && spread.e.size === 4, 'the daily varies: ' + [spread.t.size, spread.c.size, spread.e.size]);
const su = dailySetup('2026-11-16'), da = newRun(su), db = newRun(su);
spin(da); spin(db);
assert.deepEqual(da.grid, db.grid);
assert.throws(() => dailySeed('16.11.2026')); assert.throws(() => dailySetup('2026-1-6'));

// ---- Calendar maths and the streak (dates injected)
assert.equal(days('1970-01-01'), 0); assert.equal(days('2026-11-17') - days('2026-11-16'), 1); assert.equal(days('2024-03-01') - days('2024-02-28'), 2);
for (const [d, w] of [['2026-11-16', '2026-W47'], ['2026-11-22', '2026-W47'], ['2026-11-23', '2026-W48'], ['2021-01-03', '2020-W53'], ['2024-12-30', '2025-W01'], ['2026-01-01', '2026-W01']])
  assert.equal(isoWeek(days(d)), w, d);

s = {};
let u = streakUpdate(s, '2026-11-16');
assert.deepEqual([u.counted, u.streak, u.planks], [true, 1, 5 + 2]); assert.equal(s.planks, 7);
u = streakUpdate(s, '2026-11-16'); assert.deepEqual([u.counted, u.planks, s.planks], [false, 0, 7]); // a finished daily counts once a day
u = streakUpdate(s, '2026-11-17'); assert.equal(u.streak, 2); assert.equal(u.planks, 7);
u = streakUpdate(s, '2026-11-19'); // missed the 18th: forgiven, week 47 not used yet
assert.deepEqual([u.streak, u.forgiven], [3, true]); assert.equal(u.planks, 5 + 3); assert.equal(s.daily.forgiveUsedWeek, '2026-W47');
u = streakUpdate(s, '2026-11-21'); // missed the 20th, same week: not forgiven twice
assert.deepEqual([u.streak, u.forgiven], [1, false]);
u = streakUpdate(s, '2026-11-23'); // consecutive after the restart (22nd was done? no: 21 to 23 misses the 22nd, week 47 is used): restart
assert.equal(u.streak, 1);
u = streakUpdate(s, '2026-11-25'); // missed the 24th in week 48: forgiven again
assert.deepEqual([u.streak, u.forgiven], [2, true]);
u = streakUpdate(s, '2026-11-28'); assert.equal(u.streak, 1, 'two missed days break it with no penalty');
u = streakUpdate(s, '2026-11-27'); assert.deepEqual([u.counted, s.daily.streak, s.daily.lastDone], [false, 1, '2026-11-28'], 'clock moved back changes nothing');
s = {}; const got = []; // 7-day cycle of Planks: 2, 2, 3, 3, 4, 4, 8, then 2 again
for (let i = 0; i < 8; i++) got.push(streakUpdate(s, `2026-12-0${1 + i}`).planks - PLANKS.dailyTide);
assert.deepEqual(got, [2, 2, 3, 3, 4, 4, 8, 2]);
s = {}; streakUpdate(s, '2026-12-31'); assert.equal(streakUpdate(s, '2027-01-01').streak, 2); // year end
s = {}; streakUpdate(s, '2024-02-28'); assert.equal(streakUpdate(s, '2024-02-29').streak, 2); assert.equal(streakUpdate(s, '2024-03-01').streak, 3); // leap day

console.log('check-econ ok');
