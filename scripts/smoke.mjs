// Smoke: whole runs through the same core calls src/main.js makes, with a save -> reload through src/save.js after every decision.
// A reloaded run must have exactly the same future. Also: a deal, a curse, a wagon buy, a trick and a deadline all happen; the meta
// payout; the daily run; the save migration; the first-run seed. No browser. node scripts/smoke.mjs
import assert from 'node:assert/strict';

const disk = new Map(); // save.js reads globalThis.localStorage at call time
globalThis.localStorage = { getItem: (k) => disk.get(k) ?? null, setItem: (k, v) => disk.set(k, String(v)), removeItem: (k) => disk.delete(k) };

const { makeRng } = await import('../src/core/rng.js');
const { CHARM, DEAL } = await import('../src/core/data.js');
const { newRun, pickTerms, termsOffer, stoke, spin, collect, endRound, leaveShop, useTrick, trickTarget, summary } = await import('../src/core/run.js');
const { applyRunResult } = await import('../src/core/meta.js');
const { newDailyRun, recordDaily } = await import('../src/core/daily.js');
const { loadSave, writeSave, migrate, resetSave, fresh, VERSION } = await import('../src/save.js');
const { BOTS } = await import('./sim-quick.mjs');
const { tutorialOpening } = await import('./find-tutorial-seed.mjs');
const { TUTORIAL_SEED, TUTORIAL_CHARMS, coachFor } = await import('../src/tutorial.js');

let checks = 0;
const ok = (c, m) => { checks++; assert.ok(c, m); };
const eq = (a, b, m) => { checks++; assert.deepEqual(a, b, m); };

// One run, decided by a bot with its own rng. reload = what main.js does after a restart: the run goes through the save and comes back.
function playRun(seed, botName, reload) {
  resetSave();
  let run = newRun({ seed, meta: loadSave().meta });
  const bot = BOTS[botName], rng = makeRng('bot-' + seed), log = [], ev = { deal: 0, curse: 0, buy: 0, deadline: 0, trick: 0 };
  const cycle = () => { if (!reload) return; const s = loadSave(); s.run = run; writeSave(s); run = loadSave().run; assert.ok(run, `${seed}: the run survives a save in phase ${s.run.phase}`); };
  cycle();
  for (let guard = 0; run.phase !== 'ended' && guard < 5000; guard++) {
    switch (run.phase) {
      case 'terms': pickTerms(run, bot.terms(run, termsOffer(run), rng)); break;
      case 'spin': {
        const to = bot.stokeTo(run, rng);
        while (run.heat < to && stoke(run)) ;
        const r = spin(run);
        log.push(r.grid.join(',') + (r.score ? '=' + r.score.gain : ''));
        break;
      }
      case 'post': { // the result waits: sometimes nudge a column first, as a player would
        const p = run.tricks.findIndex((id) => trickTarget(id) === 'col');
        if (p >= 0 && rng.next() < 0.5 && useTrick(run, p, { col: rng.int(5) }).ok) { ev.trick++; cycle(); }
        log.push('=' + collect(run).gain);
        break;
      }
      case 'roundend': { const r = endRound(run); if (r.deadline) ev.deadline++; log.push(`end:${r.interest}:${r.deadline}`); break; }
      case 'shop': { const n = run.stats.charmsBought || 0; bot.shop(run, rng); if ((run.stats.charmsBought || 0) > n) ev.buy++; leaveShop(run); break; }
      case 'deal': { const c = run.curses.length, d = run.deals.length; bot.deal(run, rng); if (run.deals.length > d) ev.deal++; if (run.curses.length > c) ev.curse++; break; }
      case 'pawn': bot.pawn(run, rng); break;
    }
    cycle();
  }
  eq(run.phase, 'ended', `${seed}: the run ends`);
  return { log: log.join('|'), ev, sum: summary(run), run };
}

// ---- determinism across save and resume ----
const total = { deal: 0, curse: 0, buy: 0, deadline: 0, trick: 0 };
let wins = 0;
for (const bot of ['greedy', 'random']) for (let i = 0; i < 6; i++) {
  const seed = `smoke-${bot}-${i}`, a = playRun(seed, bot, false), b = playRun(seed, bot, true);
  eq(b.log, a.log, `${seed}: a reload after every decision changes nothing`);
  eq(b.sum, a.sum, `${seed}: same summary`);
  for (const k of Object.keys(total)) total[k] += a.ev[k];
  if (a.sum.won) wins++;
}
for (const [k, n] of Object.entries(total)) ok(n > 0, `the smoke runs include a ${k}`);
console.log(`runs ok: 12 runs twice, ${wins} won, ${JSON.stringify(total)}`);

// ---- meta payout, save round trip ----
{
  resetSave();
  const s = loadSave(), r = playRun('smoke-meta', 'greedy', false);
  const res = applyRunResult(s.meta, r.sum);
  ok(res.wax >= r.sum.wax && s.meta.wax === res.wax, 'Wax is paid once into the meta');
  ok(r.sum.seen.every((id) => s.meta.seenCharms.includes(id)), 'seen charms reach the collection');
  writeSave(s);
  eq(loadSave(), s, 'the save comes back unchanged');
  eq(migrate(null), fresh(), 'no save: a fresh one');
  eq(migrate({ v: 1, planks: 9 }).v, VERSION, 'a v1 object is replaced');
  eq(migrate({ ...s, run: { v: 2, seed: 5 } }).run, null, 'a run that cannot resume is dropped');
  eq(migrate({ v: 2, meta: { wax: 7 } }).meta.hideout, ['cot'], 'missing meta fields are filled');
  eq(fresh().meta.settings.lang, null, 'a new player gets the device language');
  disk.clear(); resetSave();
  disk.set('slp.save.v1', JSON.stringify({ v: 1, iap: { remove_ads: true } }));
  ok(loadSave().iap.remove_ads && loadSave().meta.iap.noAds, 'the v1 remove-ads purchase is carried over');
  disk.clear();
}

// ---- daily run ----
{
  const a = newDailyRun('2026-11-16'), b = newDailyRun('2026-11-16'), c = newDailyRun('2026-11-17');
  eq(JSON.stringify(a), JSON.stringify(b), 'the daily run is the same for everyone');
  ok(JSON.stringify(a) !== JSON.stringify(c), 'another day, another run');
  const m = fresh().meta, sum = { debtsPaid: 2, coins: 300 };
  eq(recordDaily(m, '2026-11-16', sum).first, true); eq(recordDaily(m, '2026-11-16', sum).wax, 0, 'only the first try of a day pays');
  eq(recordDaily(m, '2026-11-17', sum).streak, 2, 'the streak counts days in a row');
}

// ---- the first run (src/tutorial.js) ----
{
  const { gains, hint, run } = tutorialOpening(TUTORIAL_SEED);
  ok(gains[0] > 0 && gains[1] > 0, `first run: spins 1 and 2 pay (${gains})`);
  ok(hint && hint.before === 0 && hint.after > 0, 'first run: spin 3 pays only after a nudge');
  eq(coachFor(run, {}).key, 'tut.nudge', 'the coach points at the Nudge');
  eq(coachFor(run, {}).cells, [hint.col, hint.col + 5, hint.col + 10]);
  ok(useTrick(run, hint.pocket, { col: hint.col }).ok && collect(run).gain > 0, 'the nudge makes spin 3 pay');
  ok(TUTORIAL_CHARMS.every((id) => CHARM[id]?.rarity === 'common' && !CHARM[id].unlock), 'the first wagon shows three unlocked commons');
  ok(DEAL.lucky_break, 'the first deal exists');
}
console.log(`smoke ok (${checks} checks)`);
