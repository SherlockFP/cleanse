// v3 core rules: the SPEC worked examples W1-W13, spirits and Favour, the Tin, the phone, the Red Eye, HONK, the Blender, cart upgrades,
// save v3 and migration, progress helper, meta (stamps, keys, lockers, Left Luggage), and the tutorial seed. node scripts/check-v3-core.mjs
import { CHARM, CHARMS, CURSES, SPIRITS, SPIRIT, POSTCARDS, STORMS, SYM, CONFIG, FUSION, LOCKERS } from '../src/core/data.js';
import { useTrick, newRun, pickTerms, termsOffer, spin, collect, endRound, leaveShop, bank, payNow, canPayNow, honk, info, summary, loadRun, saveRun, deadline, endNight } from '../src/core/run.js';
import { snapshot, scoreSpin, addCharm, applyEffect, setExplain, validateRule, liftCurse, addCurse } from '../src/core/effects.js';
import { addFavour, tinVisit, offer, acceptDemand, himOrMe, omenOf, demandCheck, scorchChance } from '../src/core/spirits.js';
import { startCall, callPick, callLook, callReroll, hangUp, dealBack, cardInfo } from '../src/core/calls.js';
import { signDeal } from '../src/core/deals.js';
import { redEyeChance, redEyeLevel, rollRedEye } from '../src/core/omen.js';
import { blendPreview, blend } from '../src/core/fusion.js';
import { openShop, buyUpgrade, upgradePrice } from '../src/core/shop.js';
import { canUnlock, progressOf } from '../src/core/progress.js';
import { newMeta, applyRunResult, openLocker, leaveLuggage, buyNode, rankOf, spiritsUpTo, buyDevotion } from '../src/core/meta.js';
import { migrate, fresh, VERSION } from '../src/save.js';
import { TUTORIAL_SEED, TUTORIAL_STEPS, TUTORIAL_TERMS } from '../src/tutorial.js';
import { tutorialOpening } from './find-tutorial-seed.mjs';
import { BOTS, playRun } from './sim-quick.mjs';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { if (ok) pass++; else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); } };
const eq = (name, a, b) => t(name, JSON.stringify(a) === JSON.stringify(b), `got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);
setExplain(true);

function mk(o = {}) {
  const run = newRun({ seed: o.seed || 'v3', charId: o.char || 'nim', contractId: o.contract || 'c1', postcards: o.postcards || [], storm: o.storm || 0, unlocked: o.unlocked });
  run.tricks = []; run.charms = []; run.curses = [];
  run.debtIdx = o.debt ?? 0; run.purse = o.purse ?? 0; run.heat = 0;
  run.phase = o.phase || 'post'; run.spinsLeft = 3; run.spinInRound = 1; run.favs = [];
  return run;
}
const G = (cells, fill = 'sigil') => { const g = new Array(15).fill(fill); for (const [sym, list] of Object.entries(cells)) for (const c of list) g[c] = sym; return g; };
const stall = (run) => { run.phase = 'shop'; openShop(run); return run; };

// ---------- data and names ----------
{
  let bad = [];
  const scan = (label, rules) => { for (const r of rules || []) for (const b of validateRule(r)) bad.push(`${label}: ${b}`); };
  for (const c of CHARMS) scan('charm ' + c.id, c.rules);
  for (const c of CURSES) scan('curse ' + c.id, c.rules);
  for (const p of POSTCARDS) scan('postcard ' + p.id, p.rules || [...(p.gain || []), ...(p.cost || [])]);
  for (const st of STORMS) scan('storm ' + st.n, st.rules);
  const eff = (label, effects) => scan(label, [{ trigger: 'now', cond: {}, effects }]);
  for (const d of SPIRITS) {
    for (const s of d.stages) scan(d.id + ' stage', s.rules);
    for (const w of d.wrath) scan(d.id + ' wrath', w.rules);
    for (const g of [...d.gifts, ...(d.white || [])]) eff(d.id + ' ' + g.id, g.effects);
    if (d.red?.boon) eff(d.id + ' red', [...d.red.boon, ...(d.red.carry || []), ...(d.red.due?.else || [])]);
  }
  t('every rule uses only names the engine knows', bad.length === 0, bad.slice(0, 6).join(' | '));
  t('8 spirits, rivals symmetric, own curses exist', SPIRITS.length === 8 && SPIRITS.every((d) => SPIRIT[SPIRIT[d.rival]?.rival ? d.rival : '']?.rival === d.id && (!d.ownCurse || CURSES.some((c) => c.id === d.ownCurse))));
  t('content counts: 172 charms, 22 curses, 13 symbols', CHARMS.length === 172 && CURSES.length === 22 && Object.keys(SYM).length === 13);
  t('24 fusion recipes, distinct pairs', FUSION.recipes.length === 24 && new Set(FUSION.recipes.map((r) => [r.a, r.b].sort().join())).size === 24);
}

// ---------- W1-W4 Favour ----------
{
  const r = mk(); r.spirits.wire.fav = 6; r.spirits.wire.stage = 5;
  applyEffect(r, { kind: 'x', id: 'x' }, { type: 'favour', n: 3, spirit: 'beckon' });
  eq('W1 beckon Noticed, rival Wire -2 (Friend kept)', [r.spirits.beckon.fav, r.spirits.beckon.stage, r.spirits.wire.fav, r.spirits.wire.stage], [3, 2, 4, 5]);
}
{
  const r = stall(mk({ phase: 'shop' })); r.spirits.gold.fav = 7; r.spirits.gold.stage = 5; r.spirits.moonbiter.fav = 5; r.spirits.moonbiter.stage = 5;
  r.tin = { key: 'k', spirit: 'gold', left: 1, demand: null }; r.tricks = ['nudge'];
  const w0 = r.wick, res = offer(r, 'trick', 'medium', 0);
  eq('W2 gold 7 + 3x2 -> capped 10, surplus 3 = +1 Caps, Patron, Him or Me', [res.gained, r.spirits.gold.fav, r.wick - w0, r.spirits.gold.stage, r.phase, r.himOrMe?.rival], [6, 10, 1, 8, 'himOrMe', 'moonbiter']);
  eq('W2 rival lost 2 for the Patron line', r.spirits.moonbiter.fav, 3);
  himOrMe(r, 'drop');
  eq('Him or Me: drop silences the rival, back to the stall', [r.spirits.moonbiter.silent, r.spirits.moonbiter.fav, r.phase], [true, 0, 'shop']);
  const r2 = stall(mk({ phase: 'shop' })); r2.spirits.gold.fav = 8; r2.spirits.gold.stage = 8; r2.himOrMe = { spirit: 'gold', rival: 'moonbiter' }; r2.himBack = 'shop'; r2.phase = 'himOrMe'; himOrMe(r2, 'keep');
  eq('Him or Me: keep caps the new Patron at 7 this debt', [r2.spirits.gold.fav, r2.spirits.gold.stage, r2.spirits.moonbiter.silent], [7, 8, false]);
}
{
  const r = mk(); for (const id of ['beckon', 'wire']) { r.spirits[id].fav = 8; r.spirits[id].stage = 8; }
  r.spirits.gold.fav = 4; addFavour(r, 'gold', 6);
  eq('W3 two Patrons: a third ends at 7', r.spirits.gold.fav, 7);
}
{
  const r = stall(mk({ phase: 'shop' })); r.tin = { key: 'k', spirit: 'moonbiter', left: 1, demand: null }; r.wick = 5;
  const res = offer(r, 'caps', 'small');
  eq('W4 Hated offering: -1 Favour, the Caps are gone', [res.insult, r.spirits.moonbiter.fav, r.wick], [true, -1, 4]);
  r.spirits.moonbiter.fav = -1; r.tin.left = 1; addFavour(r, 'moonbiter', -1);
  eq('Wrath 1 at -2 turns the blessing off, the wrath rule on', [r.spirits.moonbiter.wrath, snapshot(r).weight.some((w) => w.sym === 'ash' && w.n === 1.5)], [1, true]);
  r.tin.left = 1; r.spirits.moonbiter.fav = -4; addFavour(r, 'moonbiter', -1);
  eq('Wrath 2 at -5 (cumulative)', [r.spirits.moonbiter.wrath, !!snapshot(r).flags.deadCentre], [2, true]);
  t('rival enters Wrath: +1 to the other', r.spirits.gold.fav >= 1);
  const rs = mk({ storm: 10 }); addFavour(rs, 'gold', -1);
  eq('Storm 10: Wrath at -1', rs.spirits.gold.wrath, 1);
  eq('Storm 5: every spirit starts at -1', mk({ storm: 5 }).spirits.wire.fav, -1);
}

// ---------- W5 W6 Kiosk ----------
{
  const r = mk({ phase: 'roundend' }); r.debt = 1000; r.banked = 500;
  eq('W5 banked 500 of 1000: interest 40', [snapshot(r).interest, info(r).kiosk.tonight, info(r).kiosk.cap], [0, 40, 200]); // cap 20% of the debt (AUDIT2 critic)
  r.banked = 5000; eq('W5 banked 5000: capped at 200', info(r).kiosk.tonight, 200);
  const r2 = mk({ contract: 'c3' }); r2.purse = 300; r2.banked = 200; r2.debt = 1000; r2.perm.push({ type: 'flag', flag: 'scorchBurn', v: 20, src: { kind: 'x', id: 'x' } }); // burn 20% (c1 burns only 10%)
  scoreSpin(r2, G({ ash: [0, 1, 2] }), []);
  eq('W6 Flare-up: purse 240, banked 200', [r2.purse, r2.banked], [240, 200]);
  const r3 = mk({ phase: 'spin' }); r3.debt = 100; r3.purse = 120;
  eq('bank to earn: PAY NOW lights only at the target', [(bank(r3, 50), canPayNow(r3)), (bank(r3, 50), canPayNow(r3)), payNow(r3), r3.phase], [false, true, true, 'call']);
}

// ---------- calls, beads, white call (W7 W8) ----------
{
  const r = mk({ phase: 'roundend', debt: 1 }); r.beads = 2; r.debt = 50; r.banked = 50; r.rounds = 3; r.round = 0;
  payNow(r);
  const c0 = r.callOffer.cards;
  t('the call: 3 cards, Ruby is always red', r.phase === 'call' && c0.length === 3 && c0[0].spirit === 'brimble' && c0[0].color === 'red');
  t('run 1 spirits only: Ruby, Beckon, Gold', c0.every((c) => ['brimble', 'beckon', 'gold'].includes(c.spirit)));
  const w0 = r.wick;
  hangUp(r);
  eq('hang up without looking: no bead, no Caps', [r.beads, r.wick - w0, r.refused], [2, 0, 0]);
  // again: look at red, back out, hang up -> bead 3
  const r2 = mk({ phase: 'call' }); r2.beads = 2; r2.callOffer = { cards: [{ spirit: 'brimble', color: 'red', id: 'deals', ruby: true }, { spirit: 'gold', color: 'green', id: 'gold_burner' }], rerolls: 0, sawRed: false, white: false };
  callPick(r2, 0); const fav0 = r2.spirits.brimble.fav; dealBack(r2); const w1 = r2.wick;
  eq('opened the red sheet and backed out: still on the call', [r2.phase, r2.callOffer.sawRed], ['call', true]);
  hangUp(r2);
  eq('W7 hang up after a red look: bead 3, +3 Caps, no Favour penalty', [r2.beads, r2.wick - w1, r2.spirits.brimble.fav], [3, 3, fav0]);
  startCall(r2);
  t('W7 next call is white: the Waiting Lady alone, 3 white cards, beads reset', r2.callOffer.white && r2.callOffer.cards.length === 3 && r2.callOffer.cards.every((c) => c.color === 'white' && c.spirit === 'waiting') && r2.beads === 0);
  const bless = r2.callOffer.cards.findIndex((c) => c.id === 'white_stare');
  callPick(r2, bless);
  t('white card: redEyeBless for the run, counts toward the ending', !!snapshot(r2).flags.redEyeBless && r2.whiteTaken === 1 && r2.spirits.waiting.fav === 2);
}
{
  // green gift, red call, rival Favour, reroll, due price
  const r = mk({ phase: 'call' }); r.unlocked = ['brimble', 'beckon', 'gold']; r.callOffer = { cards: [{ spirit: 'gold', color: 'green', id: 'gold_burner' }, { spirit: 'beckon', color: 'green', id: 'beckon_cash' }], rerolls: 0, sawRed: false, white: false };
  const c0 = r.purse; callPick(r, 0);
  eq('green gift: +2 Favour (Noticed: rival -2, picked card: rival -1), effect applied, on to the next debt', [r.spirits.gold.fav, r.spirits.moonbiter.fav, snapshot(r).luck, r.phase === 'shop' || r.phase === 'terms'], [2, -3, 1 + 1 + 2, true]);
  const r2 = mk({ phase: 'call' }); r2.callOffer = { cards: [{ spirit: 'brimble', color: 'red', id: 'deals', ruby: true }, { spirit: 'gold', color: 'red', id: 'rush_order' }], rerolls: 0, sawRed: false, white: false };
  addCharm(r2, 'moth_jar'); addCharm(r2, 'neon_open'); r2.rounds = 3; r2.debt = 99;
  callPick(r2, 1);
  eq('red call: boon, +3 Favour, a due price of 2 rounds', [r2.spirits.gold.fav, r2.due.length, r2.due[0]?.left, snapshot(r2).luck], [3, 1, 2, 1 + 1 + 5]);
  // W8: unpaid after round 2 -> the priciest charm goes
  r2.round = 0; r2.rounds = 3; r2.debt = 9999; r2.debtIdx = 1; r2.due[0].debt = 2;
  const play = () => { if (r2.phase === 'shop') leaveShop(r2); pickTerms(r2, termsOffer(r2)[0].id); r2.spinsLeft = 0; r2.phase = 'roundend'; endRound(r2); };
  r2.phase = 'terms'; r2.termsOffer = null;
  play();
  t('W8 after round 1 the charm is still there', r2.charms.length === 2);
  play();
  eq('W8 debt unpaid after round 2: the highest-priced charm is removed', r2.charms.map((c) => c.id), ['moth_jar']);
  const r3 = mk({ phase: 'call' }); r3.wick = 5; r3.callOffer = { cards: [{ spirit: 'brimble', color: 'red', id: 'deals', ruby: true }, { spirit: 'gold', color: 'green', id: 'gold_burner' }], rerolls: 0, sawRed: false, white: false };
  t('reroll costs Caps, +1 each time; Ruby stays', callReroll(r3) && r3.wick === 4 && callReroll(r3) && r3.wick === 2 && r3.callOffer.cards[0].ruby);
  const r4 = mk({ phase: 'call', postcards: ['quiet_phone'] }); t('Quiet Phone: no call', (() => { r4.callOffer = null; startCall(r4); return r4.phase !== 'call'; })());
}
{
  // a signed deal through the call: Ruby Favour +5 (3 red card, 2 signing), flows on
  const r = mk({ phase: 'call' }); r.callOffer = { cards: [{ spirit: 'brimble', color: 'red', id: 'deals', ruby: true }], rerolls: 0, sawRed: false, white: false };
  callPick(r, 0);
  const id = r.dealOffer[0]; signDeal(r, id);
  eq('sign through the phone: Ruby +5 (rival Waiting: -2 per line crossed, -1 for the pick), next debt', [r.spirits.brimble.fav, r.spirits.waiting.fav, r.debtIdx, r.callOffer], [5, -5, 1, null]);
}

// ---------- the Tin ----------
{
  const r = newRun({ seed: 'tut-tin' }); r.tut = true; r.purse = 40; stall(r);
  const v = tinVisit(r);
  eq('tutorial: the first visitor is Auntie Beckon', v.spirit, 'beckon');
  const n0 = r.shop.charms.length, res = offer(r, 'coins', 'small');
  eq('one small coin gift: +2 Favour (Loved), Noticed, a 4th charm appears', [res.gained, r.spirits.beckon.stage, r.shop.charms.length - n0, r.phase], [2, 2, 1, 'shop']);
  t('only one offering a visit', !offer(r, 'coins', 'small').ok);
  t('tin visit is stable within a stall', tinVisit(r).key === v.key && r.stats.visits === 1);
  const r2 = stall(mk({ phase: 'shop' })); r2.debtIdx = 1; r2.round = 0; tinVisit(r2); t('omen is plain data', typeof r2.tin.omen === 'object');
  // omens
  const r3 = stall(mk({ phase: 'shop', unlocked: SPIRITS.map((d) => d.id) })); r3.debtIdx = 2; r3.debt = 200;
  const o = {};
  for (const d of SPIRITS) { try { o[d.id] = omenOf(r3, d.id); } catch (e) { o[d.id] = 'ERR ' + e.message; } }
  t('all 8 omens answer', SPIRITS.every((d) => o[d.id] && typeof o[d.id] === 'object'), JSON.stringify(o));
  t('Gold omen fixes the next two Specials', o.gold.favs.length === 2 && r3.favQueue.length === 2);
  r3.phase = 'terms'; r3.termsOffer = ['steady']; pickTerms(r3, 'steady');
  eq('the Special the omen showed is the Special you get', r3.favs, o.gold.favs[0]);
  t('Beckon omen: 2 offers that the stall then holds', o.beckon.charms.length === 2 && (() => { const x = stall(mk({ phase: 'shop' })); const peek = omenOf(x, 'beckon'); const again = openShop(x); return peek.charms.every((id) => again.charms.includes(id)); })());
  t('Tide omen shows the next terms and the terms pick uses them', o.tide.terms.length === 3 && (() => { const x = stall(mk({ phase: 'shop', unlocked: ['tide', 'brimble'] })); const ids = omenOf(x, 'tide').terms; leaveShop(x); return JSON.stringify(termsOffer(x).map((s) => s.id)) === JSON.stringify(ids); })());
  t('Lamplit omen: Flare-up chance', o.lamplit.perSpin >= 0 && o.lamplit.three >= o.lamplit.perSpin);
}
{
  // demands
  const r = stall(mk({ phase: 'shop', debt: 1 })); r.tin = { key: 'k', spirit: 'brimble', left: 1, demand: 'signDeal' };
  t('accept a demand once', acceptDemand(r) && !acceptDemand(r) && r.demand.id === 'signDeal');
  r.stats.dealsSigned = 1; const w0 = r.wick;
  eq('demand met: +3 Favour and its bonus', [demandCheck(r), r.spirits.brimble.fav, r.wick - w0], ['met', 3, 2]);
  const r2 = stall(mk({ phase: 'shop', debt: 1 })); r2.tin = { key: 'k', spirit: 'brimble', left: 1, demand: 'signDeal' }; acceptDemand(r2);
  eq('demand failed: Ruby -2', [demandCheck(r2), r2.spirits.brimble.fav], ['failed', -2]);
  const r3 = stall(mk({ phase: 'shop' })); r3.tricks = ['ice']; r3.tin = { key: 'k', spirit: 'wire', left: 1, demand: 'handTrick' }; acceptDemand(r3);
  t('Wire: hand over a trick now, 2 tricks back', r3.tricks.length === 2 && demandCheck(r3) === 'met');
}

// ---------- Red Eye (W9 W10) ----------
{
  const grid = G({ moth: [0, 1, 2], redeye: [6, 7, 8] });
  const r = mk({ debt: 4 }); r.roundStartPurse = 400; r.purse = 520; r.grid = grid; r.favs = ['moth'];
  const res = collect(r);
  eq('W9 Red Eye at debt 5 (level 2): spin pays 0, purse back to the round start', [res.gain, r.purse, res.redEye.level, r.redEyes, r.sinceCall.redEye], [0, 400, 2, 1, true]);
  const r2 = mk({ debt: 4 }); r2.roundStartPurse = 400; r2.purse = 520; r2.grid = grid; r2.favs = ['moth']; r2.perm.push({ type: 'flag', flag: 'redEyeSoft', v: 1, src: { kind: 'x', id: 'x' } });
  const res2 = collect(r2);
  eq('W9 with redEyeSoft 1: level 1, purse 520', [res2.gain, r2.purse, res2.redEye.level], [0, 520, 1]);
  const r3 = mk({ debt: 7 }); r3.purse = 900; r3.banked = 300; r3.roundStartPurse = 100; r3.grid = grid;
  collect(r3); eq('level 3: the purse goes to 0, the Kiosk is safe', [r3.purse, r3.banked], [0, 300]);
  const r4 = mk({ debt: 1 }); r4.purse = 50; r4.roundStartPurse = 10; r4.grid = G({ lantern: [0, 1, 2], redeye: [6, 7, 8] }); const g4 = collect(r4).gain;
  t('debts 1 to 2: nothing (the spin scores around the eyes)', g4 > 0 && r4.purse === 50 + g4 && redEyeLevel(r4) === 0 && redEyeChance(r4) === 0);
  const r5 = mk(); r5.grid = G({ crown: [0, 1, 2], lantern: [10, 11, 12], redeye: [6, 7, 8] }); r5.perm.push({ type: 'flag', flag: 'redEyeBless', src: { kind: 'x', id: 'x' } });
  const base = scoreSpin(mk(), r5.grid, []).sum;
  const res5 = collect(r5);
  eq('W10 blessed: patterns sum 20 at Spice 0, total 60', [base, res5.gain, res5.redEye.blessed], [20, 60, true]);
  const dbt = (n) => { const x = mk({ debt: n - 1 }); return redEyeChance(x); };
  eq('Red Eye chance by debt: 0, 0, 1.5, 2, 2.5, ... max 6', [dbt(1), dbt(2), dbt(3), dbt(4), dbt(5), dbt(20)], [0, 0, 1.5, 2, 2.5, 6]);
  eq('Storm 7: from debt 2; Staring Contest: from debt 1, +3 points', [redEyeChance(mk({ debt: 1, storm: 7 })), redEyeChance(mk({ debt: 0, postcards: ['staring_contest'] })), redEyeChance(mk({ debt: 4, postcards: ['staring_contest'] }))], [1.5, 4.5, 5.5]);
  const x = mk({ debt: 4, seed: 'rate' }); const mods = snapshot(x); let hits = 0; const N = 10000;
  for (let i = 0; i < N; i++) if (rollRedEye(x, new Array(15).fill('moth'), mods)) hits++;
  t('10,000 spins at debt 5: Red Eye rate within 0.3 points of 2.5%', Math.abs((hits / N) * 100 - 2.5) <= 0.3, String((hits / N) * 100));
  const y = mk({ debt: 4, seed: 'real' }); y.phase = 'spin'; y.heat = 0; let events = 0;
  for (let i = 0; i < 400; i++) { y.phase = 'spin'; y.spinsLeft = 3; y.favs = ['moth']; const s = spin(y); if (s.redEye) { events++; t('spin result carries the Red Eye', s.grid[6] === 'redeye' && s.grid[7] === 'redeye' && s.grid[8] === 'redeye'); } if (y.phase === 'post') collect(y); }
  t('real spins roll Red Eyes through the omen stream', events >= 1 && y.rngState.omen === 400, `${events} events, omen draws ${y.rngState.omen}`);
}

// ---------- HONK, W11 ----------
{
  const r = mk({ phase: 'spin' }); addCharm(r, 'bike_horn'); addCharm(r, 'fish_sauce'); r.charms[1].charge = 0; r.favs = ['moth'];
  const luck0 = snapshot(r).luck;
  const ev = honk(r);
  eq('W11 only the full charm fires: Luck +3 for the next spin only', [ev.length, snapshot(r).luck - luck0, r.charms[0].charge, r.charms[1].charge], [1, 3, 0, 0]);
  spin(r); if (r.phase === 'post') collect(r);
  eq('the Luck lasts one spin', snapshot(r).luck, luck0);
  t('nothing to fire: null', honk(r) === null);
  const r2 = mk({ phase: 'terms' }); addCharm(r2, 'bike_horn'); r2.charms[0].charge = 0; r2.termsOffer = ['steady']; r2.round = 1; pickTerms(r2, 'steady');
  eq('+1 charge per round start', r2.charms[0].charge, 1);
  const r3 = mk({ phase: 'spin' }); addCharm(r3, 'megaphone'); r3.charms[0].charge = 2; r3.favs = ['crown']; honk(r3);
  const sp = spin(r3);
  t('Megaphone places 3 of the Special', sp.grid.filter((s) => s === 'crown').length >= 3);
  const r4 = mk({ phase: 'spin' }); addCharm(r4, 'sweeper'); r4.charms[0].charge = 2; r4.heat = 10; honk(r4);
  t('Street Sweeper: no Soot this spin', (() => { const g = spin(r4).grid; return !g.includes('ash'); })());
  const r5 = mk({ phase: 'spin', postcards: ['full_charge'] }); addCharm(r5, 'bike_horn');
  t('Full Charge: one spare charge', r5.charms[0].charge === 2);
  const r6 = mk({ phase: 'spin' }); r6.perm.push({ type: 'flag', flag: 'trickFree', src: { kind: 'x', id: 'x' } }); r6.tricks = ['ice']; r6.heat = 4;
  t('trickFree: a used trick stays in the pocket', useTrick(r6, 0).ok && r6.tricks.length === 1 && r6.heat < 4);
}

// ---------- Blender, W12 W13, cart upgrades ----------
{
  const swarm = CHARMS.filter((c) => c.family === 'swarm' && c.rarity === 'common' && !c.unlock).slice(0, 2).map((c) => c.id);
  const r = stall(mk({ phase: 'shop', debt: 1 })); r.wick = 10; for (const id of swarm) addCharm(r, id);
  const pv = blendPreview(r, 0, 1);
  eq('W12 same family and rarity: 2 Caps, two uncommon swarm choices', [pv.ok, pv.kind, pv.cost, pv.outs.length, pv.outs.every((id) => CHARM[id].rarity === 'uncommon' && CHARM[id].family === 'swarm')], [true, 'same', 2, 2, true]);
  eq('the preview is stable', blendPreview(r, 0, 1).outs, pv.outs);
  const res = blend(r, 0, 1, 1);
  eq('W12 blend: pick 2nd, one slot freed, Caps paid', [res.ok, r.charms.length, r.charms[0].id === pv.outs[1], r.wick], [true, 1, true, 8]);
  const r0 = stall(mk({ phase: 'shop', debt: 0 })); for (const id of swarm) addCharm(r0, id); r0.wick = 9;
  t('Blender opens at debt 2 (debt 1 with Spare Blender, +2 Caps)', !blendPreview(r0, 0, 1).ok && blendPreview((() => { const x = stall(mk({ phase: 'shop', postcards: ['spare_blender'] })); for (const id of swarm) addCharm(x, id); return x; })(), 0, 1).cost === 4);
  const ember = CHARMS.find((c) => c.family === 'ember' && c.rarity === 'uncommon' && !c.unlock && !c.tags.includes('active')).id, hex = CHARMS.find((c) => c.family === 'hex' && c.rarity === 'rare').id;
  const r2 = stall(mk({ phase: 'shop', debt: 2 })); r2.wick = 20; addCharm(r2, ember); addCharm(r2, hex); r2.curses = ['jinx', 'dead_weight', 'short_candle'];
  const pr = blendPreview(r2, 0, 1);
  eq('W13 recipe: f_smog_wok for 5 Caps', [pr.kind, pr.outs, pr.cost], ['recipe', ['f_smog_wok'], 5]);
  const wf = blend(r2, 0, 1);
  const rec = snapshot(r2).patMult.find((m) => m.src.id === 'f_smog_wok');
  eq('W13 with 3 curses: pattern mult all +1.5; Wire +1 Favour for the first recipe', [wf.ok, rec?.n, rec?.pattern, r2.spirits.wire.fav, r2.fused], [true, 1.5, 'all', 1, ['f_smog_wok']]);
  t('legendary and fused cannot go in', (() => { const x = stall(mk({ phase: 'shop', debt: 2 })); addCharm(x, 'f_smog_wok'); addCharm(x, 'bike_jump'); return !blendPreview(x, 0, 1).ok; })());
  // cart upgrades
  const r3 = stall(mk({ phase: 'shop', debt: 0 })); r3.purse = 500;
  t('two cart upgrades a stall', r3.shop.upgrades.length === 2);
  const u = r3.shop.upgrades[0], p0 = upgradePrice(r3, u).coins, snap0 = snapshot(r3);
  t('buy an upgrade: pays, adds a patMult +1 or a weight x1.5 for the run', buyUpgrade(r3, 0) && r3.purse === 500 - p0 && (u.kind === 'pattern' ? snapshot(r3).patMult.length === snap0.patMult.length + 1 : snapshot(r3).weight.length === snap0.weight.length + 1));
  t('the same upgrade costs more the second time', upgradePrice(r3, u).coins > p0);
}

// ---------- charge/loseCharm/relics/endNight ----------
{
  const meta = newMeta(); meta.luggage = ['bike_horn', null, 'taillight', null];
  const r = newRun({ seed: 'rel', meta });
  t('Left Luggage relics sit in the charm row, cannot be sold or lost', r.relics.length === 2 && r.charms.filter((c) => c.relic).length === 2 && (() => { applyEffect(r, { kind: 'x', id: 'x' }, { type: 'loseCharm', pick: 'best' }); return r.charms.length === 2; })());
  meta.skipRelics = true; t('noRelic skips them once', newRun({ seed: 'rel2', meta }).relics.length === 0 && !meta.skipRelics);
  const r2 = mk({ phase: 'spin' }); r2.perm.push({ type: 'flag', flag: 'carrySpins', v: 3, src: { kind: 'x', id: 'x' } }); r2.spinsLeft = 4;
  t('Tide: close the night, up to 3 spins carry', endNight(r2) && r2.carrySpins === 3 && r2.phase === 'roundend');
  const r3 = mk({ phase: 'roundend' }); r3.perm.push({ type: 'flag', flag: 'noPawn', src: { kind: 'x', id: 'x' } }); addCharm(r3, 'moth_jar'); r3.debt = 999; r3.round = 2; r3.rounds = 3; r3.spinsLeft = 0;
  eq('noPawn: no Pawn offered', [deadline(r3), r3.phase], ['collected', 'ended']);
  const r4 = mk({ phase: 'terms' }); r4.perm.push({ type: 'flag', flag: 'noShopN', v: 2, src: { kind: 'x', id: 'x' } });
  r4.phase = 'roundend'; r4.spinsLeft = 0; r4.round = 0; r4.rounds = 3; r4.debt = 99; endRound(r4);
  eq('Closing Down Sale: the next stall is closed (straight to terms)', [r4.phase, r4.shop], ['terms', null]);
  r4.termsOffer = null; pickTerms(r4, termsOffer(r4)[0].id); r4.spinsLeft = 0; r4.phase = 'roundend'; endRound(r4);
  eq('...and the one after', r4.phase, 'terms');
  r4.termsOffer = null; pickTerms(r4, termsOffer(r4)[0].id); r4.spinsLeft = 0; r4.phase = 'roundend'; r4.round = 0; endRound(r4);
  eq('...then it opens again', r4.phase, 'shop');
  const r5 = mk(); applyEffect(r5, { kind: 'x', id: 'x' }, { type: 'liftCurse', n: 1 }); r5.curses = ['jinx', 'fever'];
  t('liftCurse: the player picks', liftCurse(r5, 'fever') && r5.curses.join() === 'jinx' && !liftCurse(r5, 'jinx'));
}

// ---------- endings and streams ----------
{
  const r = mk({ contract: 'c1' }); r.contract = 'c5'; r.debtIdx = 7; r.debt = 1; r.round = 2; r.rounds = 3; r.phase = 'roundend'; r.spinsLeft = 0; r.purse = 99999; r.whiteTaken = 1;
  endRound(r); eq('The Refuser: c5 or later with a white call taken', r.result.ending, 'the_refuser');
  const r2 = mk(); r2.contract = 'c10'; r2.debtIdx = 8; r2.debt = 1; r2.round = 2; r2.rounds = 3; r2.phase = 'roundend'; r2.spinsLeft = 0; r2.purse = 99999;
  r2.relics = ['f_smog_wok', 'f_gold_rims', 'f_gold_dust', 'f_lucky_chili'];
  endRound(r2); eq('Left Luggage: c10 with 4 fused relics', r2.result.ending, 'left_luggage');
}

// ---------- save v3 and migration ----------
{
  const r = mk({ phase: 'shop' }); r.stats.x = 1;
  const j = JSON.parse(JSON.stringify(r));
  for (const k of ['spirits', 'beads', 'whiteCalls', 'whiteTaken', 'redEyes', 'callOffer', 'due', 'relics', 'postcards', 'demand', 'tin', 'honkEdits', 'favQueue', 'peek', 'himQueue', 'himOrMe', 'roundStartPurse', 'recent', 'sinceCall', 'fused', 'unlocked']) delete j[k];
  j.v = 2;
  const v2 = { v: 2, meta: { wax: 55, hideout: ['cot', 'stove'], achievements: [], chars: ['nim'], contracts: ['c1', 'c2'], seenCharms: [], endings: [], stats: { debtsPaid: 7 }, charWins: ['nim'], daily: {}, iap: {}, settings: {}, tutorialDone: true, cleared: ['c1'] }, run: j, ads: {}, iap: {} };
  const m = migrate(v2);
  t('v2 save migrates to v3: Stash, stamps, spirits, keys, notebook mapped', m.v === VERSION && m.meta.stash === 55 && m.meta.wax === undefined && m.meta.stamps.c1.bronze && m.meta.spirits.includes('brimble') && m.meta.keys.brass === 0 && Array.isArray(m.meta.notebook) && m.meta.tutorialDone && m.meta.stats.debtsPaid === 7);
  t('a v2 run is upgraded in place and resumes', m.run && m.run.v === 3 && !!m.run.spirits.gold && m.run.beads === 0 && Array.isArray(m.run.relics));
  const back = loadRun(saveRun(m.run));
  eq('save then load keeps the run', back.seed, r.seed);
  eq('fresh() is v3', fresh().v, 3);
  const r1 = stall(mk({ phase: 'shop', debt: 1, seed: 'resume' })); r1.tin = null;
  const a = JSON.parse(JSON.stringify(r1)), b = loadRun(JSON.stringify(a));
  tinVisit(r1); tinVisit(b);
  eq('streams resume: the Tin visitor is the same after save and load', [b.tin.spirit, b.rngState.call], [r1.tin.spirit, r1.rngState.call]);
}

// ---------- progress helper, meta ----------
{
  const meta = newMeta();
  const items = [
    [{ requires: { clear: 'c3' } }, { have: 0, need: 1, where: 'map' }],
    [{ requires: { stat: 'tricksUsed', gte: 25 } }, { have: 0, need: 25, where: 'run' }],
    [{ requires: [{ lessons: 3 }, { clear: 'c1' }] }, { have: 0, need: 3, where: 'home' }],
    [{ cond: { stat: 'debtsPaid', gte: 5 } }, { have: 0, need: 5, where: 'run' }],
    [{ requires: { lockers: 19 } }, { have: 0, need: 19, where: 'lockers' }],
  ];
  meta.stats.tricksUsed = 17;
  items[1][1].have = 17;
  for (const [it, want] of items) eq('progressOf ' + JSON.stringify(it), progressOf(it, meta), want);
  t('canUnlock', !canUnlock(items[0][0], meta) && canUnlock({ requires: null }, meta));
  // a won run: stamps, keys, spirit unlocks, stash
  const run = newRun({ seed: 'meta', meta });
  run.result = { won: true, ending: null }; run.phase = 'ended'; run.stats.debtsPaid = 5; run.stats.reachDebt = 5;
  const out = applyRunResult(meta, summary(run));
  t('clear c1: bronze, silver (no Flare-up) and gold (no deals) stamps; brass keys; the next place opens', meta.stamps.c1.bronze && meta.stamps.c1.silver && meta.stamps.c1.gold && meta.keys.brass >= 2 && meta.contracts.includes('c2') && out.stash > 0 && rankOf(meta).n === 1);
  const key0 = meta.keys.brass, res = openLocker(meta, LOCKERS[0].id);
  t('open a locker with a brass key: 1 locked rare of a family', res.ok && meta.keys.brass === key0 - 1 && res.contents.charms.length === 1 && CHARM[res.contents.charms[0]].rarity === 'rare' && !!CHARM[res.contents.charms[0]].unlock);
  t('same locker twice: no; no key: no; extra lock: no', !openLocker(meta, LOCKERS[0].id).ok && (() => { meta.keys.silver = 0; return !openLocker(meta, LOCKERS[10].id).ok; })() && (() => { meta.keys.silver = 1; return !openLocker(meta, LOCKERS[10].id).ok; })());
  // the 30 locked charms live in lockers exactly once
  const all = LOCKERS.flatMap((l) => { const c = l.contents || {}; return [...(c.charms || [])]; });
  t('Left Luggage: leave a held charm after debt 4', leaveLuggage(meta, { debtReached: 4, heldCharms: ['moth_jar'] }, 1, 'moth_jar') && meta.luggage[1] === 'moth_jar' && !leaveLuggage(meta, { debtReached: 3, heldCharms: ['moth_jar'] }, 2, 'moth_jar'));
  meta.stash = 500; t('Notebook node: needs the requirement and the Stash', buyNode(meta, 'cart_01') && meta.stash === 480 && !buyNode(meta, 'cart_07') && meta.stash === 480);
  eq('spirits per place', [spiritsUpTo('c1').length, spiritsUpTo('c3').includes('waiting'), spiritsUpTo('c10').length], [3, true, 8]);
  const m2 = newMeta(); m2.codex.spirits.gold = { noticed: 1, friend: 0, patron: 0 }; m2.stash = 100;
  t('Devotion tier 1 gives +1 Favour at run start', buyDevotion(m2, 'gold') && newRun({ seed: 'dv', meta: m2 }).spirits.gold.fav === 1);
}

// ---------- the tutorial ----------
{
  t('27 tutorial steps, each {id, target, gesture, caption, until}', TUTORIAL_STEPS.length === 27 && TUTORIAL_STEPS.every((s) => s.id && 'target' in s && s.gesture && s.caption && s.until));
  const { gains, hint, run } = tutorialOpening(TUTORIAL_SEED);
  t('tutorial seed: spin 1 pays a Line of 3, spin 2 pays more, no Red Eye, no Soot in the opening', gains[0] > 0 && gains[1] > gains[0] && !run.grid.includes('redeye') && !run.grid.includes('ash'), JSON.stringify(gains));
}

// ---------- a whole run of every bot, no exception ----------
{
  for (const name of ['random', 'greedy', 'smart']) {
    let ok = true, err = '';
    try {
      for (let i = 0; i < (name === 'smart' ? 2 : 8); i++) {
        const run = newRun({ seed: 'bot-' + name + i, contractId: i % 2 ? 'c3' : 'c1', unlocked: spiritsUpTo(i % 2 ? 'c3' : 'c1') });
        playRun(run, BOTS[name], makeRng('b' + i), {});
        if (run.phase !== 'ended') { ok = false; err = 'stuck in ' + run.phase; }
      }
    } catch (e) { ok = false; err = e.stack.split('\n').slice(0, 3).join(' '); }
    t('bot ' + name + ' plays whole v3 runs', ok, err);
  }
}

console.log(`check-v3-core: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
