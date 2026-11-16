// Smoke: plays whole runs through the same core calls src/main.js makes (newRun, spin, togglePeg, endTide, rollShop, buy, nextTide) and
// checks that save -> reload (JSON and save.js) at every step gives the same future. No browser. node scripts/smoke.mjs
import assert from 'node:assert/strict';
import { newRun, spin, togglePeg, canPeg, endTide, nextTide, runSummary, runHash } from '../src/core/run.js';
import { rollShop, buyOffer, priceOf } from '../src/core/shop.js';
import { findPairs } from '../src/core/reel.js';
import { loadSave, writeSave, migrate, resetSave, fresh } from '../src/save.js';
import { grantRunRewards, build, nextBuild, unlockedPool } from '../src/core/meta.js';
import { dailySetup, streakUpdate } from '../src/core/daily.js';

const UNLOCKED = ['start', 'cat_basket', 'radio', 'tea_corner'];
const TUTORIAL_SEED = 162; // must match src/main.js

// Policy: peg the pairs, buy the first offer the jar can pay.
const pegPairs = (run) => {
  for (const c of [...run.held]) togglePeg(run, c);
  for (const c of findPairs(run.grid)) if (canPeg(run, c)) togglePeg(run, c);
};

// reload = what main.js does after a restart: through save.js (JSON in storage), then migrate.
const reload = (run) => { const s = loadSave(); s.run = run; writeSave(s); return loadSave().run; };

function playRun(seed, { reloadEvery }) {
  resetSave();
  let run = newRun({ seed, startTrinket: 'first_light', unlocked: UNLOCKED });
  const log = [];
  const maybe = () => { if (reloadEvery) run = reload(run); };
  maybe();
  while (run.phase === 'tide' || run.phase === 'shop') {
    if (run.phase === 'tide') {
      if (run.grid) { pegPairs(run); maybe(); }
      const r = spin(run); log.push(`${r.grid.join(',')}:${r.total}`);
      maybe();
      if (run.spin >= run.spinsMax) { const e = endTide(run); log.push(`end:${e.paid}:${e.mercy}`); maybe(); }
    } else {
      const s = rollShop(run); maybe(); rollShop(run); // a second roll after a resume must change nothing
      s.offers.forEach((o, i) => { if (!o.sold && priceOf(run, o) <= run.jar) buyOffer(run, i); });
      maybe();
      nextTide(run); maybe();
    }
  }
  return { hash: runHash(run), summary: runSummary(run), log };
}

let phases = { over: 0, lamplight: 0 }, deepest = 0;
for (const seed of [1, 2, 3, 7, 11, 42, 162, 1000, 31337]) {
  const a = playRun(seed, { reloadEvery: false }), b = playRun(seed, { reloadEvery: true });
  assert.deepEqual(b.log, a.log, `seed ${seed}: a resume changed the spins`);
  assert.equal(b.hash, a.hash, `seed ${seed}: a resume changed the run hash`);
  assert.equal(b.summary.coins, a.summary.coins);
  deepest = Math.max(deepest, a.summary.tide);
  phases[a.summary.won ? 'lamplight' : 'over']++;
}
assert.ok(deepest >= 2, 'no run reached the shop');
console.log(`resume determinism ok (9 seeds; ${phases.lamplight} won, ${phases.over} lost, deepest tide ${deepest})`);

// The tutorial: spin 1 is a pair, pegging it and spinning again pays a line.
{
  const run = newRun({ seed: TUTORIAL_SEED, startTrinket: 'first_light', unlocked: UNLOCKED });
  const a = spin(run), pairs = findPairs(a.grid);
  assert.equal(a.total, 0); assert.ok(pairs.length >= 2, 'tutorial spin 1 shows a pair');
  pairs.forEach((c) => assert.ok(togglePeg(run, c)));
  const b = spin(run);
  assert.ok(b.lines.length > 0 && b.total > 0, 'tutorial spin 2 pays a line');
  console.log('tutorial seed ok');
}

// A run saved after SPIN and before the animation resumes on the same grid and jar; spinning again draws the next spin, not the same.
{
  resetSave();
  let run = newRun({ seed: 5, startTrinket: 'first_light', unlocked: UNLOCKED });
  const r1 = spin(run); // main.js saves here
  const again = reload(run);
  assert.deepEqual(again.grid, r1.grid); assert.equal(again.jar, run.jar); assert.equal(again.spin, 1);
  const twin = JSON.parse(JSON.stringify(again));
  assert.deepEqual(spin(twin).grid, spin(run).grid);
  console.log('save at SPIN ok');
}

// The meta loop main.js runs: finish a run, pay it out once, build once, start the next run from the save. All through save.js.
{
  resetSave();
  const first = playRun(7, { reloadEvery: false }); // playRun resets the save, so load after it
  let save = loadSave();
  assert.equal(save.planks, 0); assert.equal(save.stats.runs, 0); assert.deepEqual(save.builds, []);
  const summary = { ...first.summary, bag: { pebble: 1 }, stamps: [] };
  const reward = grantRunRewards(save, summary);
  assert.ok(reward && reward.firstRun && reward.planks >= 10, 'the first finished run pays at least the first-day 10 Planks');
  assert.equal(reward.note, 1, 'a finished run unlocks margin note 1');
  assert.equal(grantRunRewards(save, summary), null, 'the same run is never paid twice');
  writeSave(save); save = loadSave(); // what a restart on the run end screen sees
  assert.equal(save.planks, reward.planks); assert.equal(save.stats.runs, 1); assert.equal(save.notes, 1);
  assert.equal(grantRunRewards(save, summary), null, 'still paid once after a reload');
  const roof = nextBuild(save);
  assert.equal(roof.id, 'roof');
  assert.ok(build(save, roof.id).ok, 'the first-day Planks cover the first build');
  assert.equal(build(save, roof.id).ok, false);
  writeSave(save); save = loadSave();
  assert.deepEqual(save.builds, ['roof']); assert.equal(save.planks, reward.planks - roof.cost);
  const next = newRun({ seed: 99, installment: save.installment, startTrinket: 'first_light', unlocked: unlockedPool(save) });
  assert.equal(next.installment, save.paid + 1);
  assert.ok(spin(next).grid.length === 9, 'the next run spins');
  // a won run at the current installment pays it and shows its ledger page once
  const won = grantRunRewards(save, { ...summary, seed: 100, hash: 'x', won: true, tidesCleared: 5, installment: save.installment });
  assert.equal(won.beat, 1); assert.equal(save.paid, 1); assert.equal(save.installment, 2);
  // Daily Tide: a run from the date's setup; finishing it counts the day once and never pays an installment
  const d = newRun(dailySetup('2026-11-16'));
  assert.equal(d.seed, newRun(dailySetup('2026-11-16')).seed);
  const dr = grantRunRewards(save, { ...runSummary(d), won: true, installment: 0 });
  assert.equal(dr.beat, null); assert.equal(save.paid, 1);
  const st = streakUpdate(save, '2026-11-16');
  assert.ok(st.counted && st.streak === 1 && st.planks > 0);
  assert.equal(streakUpdate(save, '2026-11-16').counted, false, 'a retry the same day adds no streak and no Planks');
  writeSave(save);
  assert.equal(loadSave().daily.streak, 1);
  assert.equal(migrate({ runs: 3 }).stats.runs, 3, 'the old top-level run count moves into stats');
  resetSave();
  console.log(`meta loop ok (first run +${reward.planks} Planks, roof built, installment 1 paid, daily counted)`);
}

// Save format: junk and old shapes come back as a usable save.
assert.deepEqual(migrate(null), fresh());
assert.equal(migrate({ v: 0, run: { nope: 1 } }).run, null);
assert.equal(migrate({ tutorialDone: true }).tutorialDone, true);
console.log('migrate ok');
console.log('smoke ok');
