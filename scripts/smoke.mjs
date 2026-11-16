// Smoke: plays whole runs through the same core calls src/main.js makes (newRun, spin, togglePeg, endTide, rollShop, buy, nextTide) and
// checks that save -> reload (JSON and save.js) at every step gives the same future. No browser. node scripts/smoke.mjs
import assert from 'node:assert/strict';
import { newRun, spin, togglePeg, canPeg, endTide, nextTide, runSummary, runHash } from '../src/core/run.js';
import { rollShop, buyOffer, priceOf } from '../src/core/shop.js';
import { findPairs } from '../src/core/reel.js';
import { loadSave, writeSave, migrate, resetSave, fresh } from '../src/save.js';

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

// Save format: junk and old shapes come back as a usable save.
assert.deepEqual(migrate(null), fresh());
assert.equal(migrate({ v: 0, run: { nope: 1 } }).run, null);
assert.equal(migrate({ tutorialDone: true }).tutorialDone, true);
console.log('migrate ok');
console.log('smoke ok');
