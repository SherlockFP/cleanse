// Smoke: whole runs through the same core calls src/main.js makes, with a save -> reload through src/save.js after every decision.
// A reloaded run must have exactly the same future. Also: a deal, a curse, a wagon buy, a trick and a deadline all happen; the meta
// payout; the daily run; the save migration; the first-run seed. No browser. node scripts/smoke.mjs
import assert from 'node:assert/strict';

const disk = new Map(); // save.js reads globalThis.localStorage at call time
globalThis.localStorage = { getItem: (k) => disk.get(k) ?? null, setItem: (k, v) => disk.set(k, String(v)), removeItem: (k) => disk.delete(k) };

const { makeRng } = await import('../src/core/rng.js');
const { CHARM, DEAL } = await import('../src/core/data.js');
const { newRun, pickTerms, termsOffer, stoke, spin, collect, endRound, leaveShop, useTrick, trickTarget, summary, bank, payNow, canPayNow, honk, info } = await import('../src/core/run.js');
const { buyCharm } = await import('../src/core/shop.js');
const { blendPreview, blend, blenderOpen } = await import('../src/core/fusion.js');
const { tinVisit, offer } = await import('../src/core/spirits.js');
const { callPick } = await import('../src/core/calls.js');
const { openLocker, newMeta } = await import('../src/core/meta.js');
const { canUnlock } = await import('../src/core/progress.js');
const { LOCKER } = await import('../src/core/data.js');
const { readFileSync } = await import('node:fs');
const { hangUp, dealBack } = await import('../src/core/calls.js');
const { himOrMe } = await import('../src/core/spirits.js');
const { applyRunResult } = await import('../src/core/meta.js');
const { newDailyRun, recordDaily } = await import('../src/core/daily.js');
const { loadSave, writeSave, migrate, resetSave, fresh, VERSION } = await import('../src/save.js');
const { BOTS } = await import('./sim-quick.mjs');
const { tutorialOpening } = await import('./find-tutorial-seed.mjs');
const { TUTORIAL_SEED, TUTORIAL_CHARMS, TUTORIAL_TERMS, TUTORIAL_STEPS, coachFor } = await import('../src/tutorial.js');

let checks = 0;
const ok = (c, m) => { checks++; assert.ok(c, m); };
const eq = (a, b, m) => { checks++; assert.deepEqual(a, b, m); };

// One run, decided by a bot with its own rng. reload = what main.js does after a restart: the run goes through the save and comes back.
function playRun(seed, botName, reload) {
  resetSave();
  let run = newRun({ seed, meta: loadSave().meta });
  const bot = BOTS[botName], rng = makeRng('bot-' + seed), log = [], ev = { deal: 0, curse: 0, buy: 0, deadline: 0, trick: 0, call: 0, tip: 0, honk: 0, blend: 0, redEye: 0 };
  const cycle = () => { if (!reload) return; const s = loadSave(); s.run = run; writeSave(s); run = loadSave().run; assert.ok(run, `${seed}: the run survives a save in phase ${s.run.phase}`); };
  cycle();
  for (let guard = 0; run.phase !== 'ended' && guard < 5000; guard++) {
    switch (run.phase) {
      case 'terms': pickTerms(run, bot.terms(run, termsOffer(run), rng)); break;
      case 'spin': {
        const to = bot.stokeTo(run, rng);
        while (run.heat < to && stoke(run)) ;
        if (info(run).canHonk && rng.next() < 0.7 && honk(run)) { ev.honk++; cycle(); } // an active charm: HONK before the spin
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
      case 'shop': {
        tinVisit(run);
        if (run.tin?.left > 0 && rng.next() < 0.5 && offer(run, 'coins', 'small').ok) { ev.tip++; cycle(); } // a tip in the Tin
        if (run.phase !== 'shop') break; // a Him or Me modal came up
        if (blenderOpen(run)) for (let a = 0; a < run.charms.length; a++) for (let b = a + 1; b < run.charms.length; b++) { // the Blender, when a pair fits
          const pv = blendPreview(run, a, b);
          if (pv.ok && run.wick >= pv.cost && rng.next() < 0.8 && blend(run, a, b, 0).ok) { ev.blend++; cycle(); a = b = 99; }
        }
        const n = run.stats.charmsBought || 0; bot.shop(run, rng); bot.tin?.(run, rng); if ((run.stats.charmsBought || 0) > n) ev.buy++; leaveShop(run); break; }
      case 'call': { const n = run.stats.calls || 0; bot.call(run, rng); if (run.phase === 'call' && guard % 7 === 6) hangUp(run); if ((run.stats.calls || 0) > n) ev.call++; break; }
      case 'himOrMe': himOrMe(run, 'keep'); break;
      case 'deal': { const c = run.curses.length, d = run.deals.length; bot.deal(run, rng); if (run.phase === 'deal') dealBack(run); if (run.deals.length > d) ev.deal++; if (run.curses.length > c) ev.curse++; break; }
      case 'pawn': bot.pawn(run, rng); break;
    }
    cycle();
  }
  eq(run.phase, 'ended', `${seed}: the run ends`);
  ev.redEye = run.redEyes | 0;
  return { log: log.join('|'), ev, sum: summary(run), run };
}

// ---- determinism across save and resume ----
const total = { deal: 0, curse: 0, buy: 0, deadline: 0, trick: 0, call: 0, tip: 0, honk: 0, blend: 0, redEye: 0 };
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
  ok(res.stash >= r.sum.stash && s.meta.stash === res.stash, 'Stash is paid once into the meta');
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
  run.tut = true; // tutorialOpening plays the opening like the guided run; the coach only speaks to a run that is one
  ok(gains[0] > 0 && gains[1] > 0, `first run: spins 1 and 2 pay (${gains})`);
  ok(hint && hint.before === 0 && hint.after > 0, 'first run: spin 3 pays only after a nudge');
  eq(coachFor(run, {}).key, 'tut.nudge', 'the coach points at the Nudge');
  eq(coachFor(run, {}).cells, [hint.col, hint.col + 5, hint.col + 10]);
  ok(useTrick(run, hint.pocket, { col: hint.col }).ok && collect(run).gain > 0, 'the nudge makes spin 3 pay');
  ok(TUTORIAL_CHARMS.every((id) => CHARM[id]?.rarity === 'common' && !CHARM[id].unlock), 'the first wagon shows three unlocked commons');
  ok(DEAL.lucky_break, 'the first deal exists');
}

// ---- lockers: keys from run payouts open a locker ----
{
  const m = newMeta();
  for (const bot of ['greedy', 'random']) for (let i = 0; i < 6; i++) applyRunResult(m, playRun(`smoke-${bot}-${i}`, bot, false).sum);
  const earned = Object.values(m.keys).reduce((a, b) => a + b, 0);
  let id = Object.keys(LOCKER).find((k) => (m.keys[LOCKER[k].key] || 0) > 0 && canUnlock(LOCKER[k], m));
  if (!id) { id = Object.keys(LOCKER).find((k) => canUnlock(LOCKER[k], m)); ok(id, 'some locker has no lock but its key'); m.keys[LOCKER[id].key] = 1; } // no key earned in 12 runs: grant one, the open itself is the check
  const before = m.keys[LOCKER[id].key], r = openLocker(m, id);
  ok(r.ok && m.lockers.includes(id) && m.keys[LOCKER[id].key] === before - 1, `locker ${id} opens with its key and uses it up`);
  ok(r.contents.charms.every((c) => m.charmsOpen.includes(c)), 'its charms join the pool');
  eq(openLocker(m, id).ok, false, 'an open locker does not open twice');
  console.log(`lockers ok: ${earned} keys earned in 12 runs, opened ${id}`);
}

// ---- the guided first run, step by step as src/main.js drives it (SPEC 2) ----
{
  const src = ['src/main.js', ...['kiosk', 'title', 'coach'].map((f) => `src/ui/${f}.js`)].map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const s of TUTORIAL_STEPS) for (const e of String(s.until).split('|')) if (e !== 'tap') ok(src.includes(`'${e}'`), `step ${s.id}: something sends '${e}'`);
  eq(TUTORIAL_STEPS.map((s) => s.id), Array.from({ length: 27 }, (_, i) => i + 1), '27 steps in order');
  const tut = (pick) => {
    const run = newRun({ seed: TUTORIAL_SEED, meta: newMeta() });
    run.tut = true; run.forcedTerms = TUTORIAL_TERMS;
    pickTerms(run, termsOffer(run)[0].id);
    const sp = () => { const r = spin(run); return r.score ?? collect(run); };
    const g1 = sp(), g2 = sp();
    return { run, g1, g2, pick, sp };
  };
  const { run, g1, g2, sp } = tut();
  ok(g1.gain > 0 && g1.patterns.some((p) => p.id === 'h3'), 'step 5: spin 1 pays a Line of 3');
  ok(g2.gain > g1.gain && g2.patterns.some((p) => p.id === 'v3'), 'step 9: spin 2 pays more, with a Column');
  ok(stoke(run), 'step 11: Spice Up'); sp();
  ok(bank(run, run.purse) > 0 && run.purse === 0, 'step 14: bank it all');
  while (run.phase === 'spin') sp();
  eq(run.phase, 'roundend', 'step 16: the night ends');
  endRound(run); eq(run.phase, 'shop', 'step 18: the stall');
  run.shop.charms = TUTORIAL_CHARMS.slice(); // what main.js does
  eq(tinVisit(run).spirit, 'beckon', 'step 18: Madam Receipt visits the Tin');
  ok(offer(run, 'coins', 'small').ok && run.shop.charms.length === 4, 'step 18: a small tip adds a 4th charm');
  ok(buyCharm(run, 3), 'step 19: the 4th charm is affordable');
  leaveShop(run); ok(pickTerms(run, termsOffer(run)[0].id), 'step 21: terms');
  for (let g = 0; run.phase !== 'call' && g < 50; g++) { // step 22: free play, bank everything, PAY NOW when lit
    if (run.phase === 'spin') { if (canPayNow(run)) payNow(run); else { sp(); bank(run, run.purse); } } else if (run.phase === 'roundend') endRound(run);
  }
  eq(run.phase, 'call', 'step 23: debt 1 paid, the phone rings');
  const cards = run.callOffer.cards;
  ok(cards.some((c) => c.ruby) && cards.some((c) => c.spirit === 'gold' && c.color === 'green'), 'step 24/26: a red Ruby card and a green Gold card');
  ok(callPick(run, cards.findIndex((c) => c.ruby)) && run.phase === 'deal', 'step 24: the red card opens the deal');
  const { dealBack: back } = await import('../src/core/calls.js');
  ok(back(run) && callPick(run, run.callOffer.cards.findIndex((c) => c.spirit === 'gold')), 'step 25/26: back, then the green card');
  // the first run cannot be lost: the worst player (Spice maxed every spin, never banks) still reaches the phone
  for (const termsAt of [0, 1, 2]) {
    const w = tut().run;
    stoke(w); while (w.phase === 'spin') { const r = spin(w); if (!r.score) collect(w); }
    endRound(w); tinVisit(w); leaveShop(w);
    for (let g = 0; !['call', 'ended', 'pawn'].includes(w.phase) && g < 300; g++) {
      if (w.phase === 'spin') { while (stoke(w)) ; const r = spin(w); if (!r.score) collect(w); }
      else if (w.phase === 'roundend') endRound(w);
      else if (w.phase === 'shop') { tinVisit(w); leaveShop(w); }
      else if (w.phase === 'terms') pickTerms(w, termsOffer(w)[termsAt].id);
    }
    eq(w.phase, 'call', `first run, worst play (terms ${termsAt}): debt 1 is still paid`);
  }
}
console.log(`smoke ok (${checks} checks)`);
