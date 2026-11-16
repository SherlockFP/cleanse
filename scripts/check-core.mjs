// Core rules check: patterns, the EFFECTS.md worked examples, determinism, resume, money maths,
// every trigger and every effect primitive. No DOM, no browser. node scripts/check-core.mjs
import { CHARM, CHARMS, CURSE, CONFIG, SCORING } from '../src/core/data.js';
import { findPatterns } from '../src/core/patterns.js';
import { newRun, pickTerms, termsOffer, spin, collect, stoke, bank, endRound, deadline, pawn, saveRun, loadRun, scaleOf, useTrick, leaveShop, summary, setFavourite } from '../src/core/run.js';
import { snapshot, scoreSpin, addCharm, applyEffect, fire, addCurse, TRIGGERS, EFFECT_TYPES, setExplain } from '../src/core/effects.js';
import { rollGrid, applyGridEdits } from '../src/core/machine.js';
import { buyCharm, sellCharm, reroll, toggleLock, doBench, price, openShop } from '../src/core/shop.js';
import { signDeal, refuseDeals } from '../src/core/deals.js';
import { newMeta, applyRunResult, buyHideout, isUnlocked, availableCharms } from '../src/core/meta.js';
import { dailySeed, dailySetup, recordDaily, dayNum } from '../src/core/daily.js';

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => {
  if (ok) pass++;
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
};
const eq = (name, a, b) => t(name, JSON.stringify(a) === JSON.stringify(b), `got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);

// A run in the post phase with a chosen state. No tricks, so nothing waits.
function mk(o = {}) {
  const run = newRun({ seed: o.seed || 'ck', charId: o.char || 'nim', contractId: o.contract || 'c1' });
  run.tricks = [];
  run.charms = [];
  run.curses = [];
  run.debtIdx = o.debt ?? 0;
  for (const id of o.charms || []) addCharm(run, id);
  run.curses = o.curses || [];
  run.deals = o.deals || [];
  run.heat = o.heat || 0;
  run.purse = o.purse ?? 0;
  run.terms = o.terms || null;
  run.phase = 'post';
  run.spinsLeft = 3;
  run.spinInRound = 1;
  run.favs = o.favs || [];
  return run;
}
const G = (cells, fill = 'sigil') => {
  const g = new Array(15).fill(fill);
  for (const [sym, list] of Object.entries(cells)) for (const c of list) g[c] = sym;
  return g;
};
const score = (run, grid) => scoreSpin(run, grid, run.favs);
const ids = (grid, mods = { flags: {} }, favs = []) => findPatterns(grid, mods, favs).map((p) => p.id);

// ---------- 1. every pattern on a hand-made grid ----------
setExplain(true);
eq('h3', ids(G({ moth: [1, 2, 3] })), ['h3']);
eq('v3', ids(G({ moth: [1, 6, 11] })), ['v3']);
eq('d3 down', ids(G({ moth: [0, 6, 12] })), ['d3']);
eq('d3 up', ids(G({ moth: [10, 6, 2] })), ['d3']);
eq('h4 beats h3', ids(G({ moth: [5, 6, 7, 8] })), ['h4']);
eq('halo', ids(G({ moth: [2, 6, 8, 12] })), ['halo']);
eq('corners', ids(G({ moth: [0, 4, 10, 14] })), ['corners']);
eq('h5 beats h4 and h3', ids(G({ moth: [10, 11, 12, 13, 14] })), ['h5']);
eq('saw', ids(G({ moth: [0, 6, 2, 8, 4] })), ['saw']);
eq('vee (its two Diagonals pay too)', ids(G({ moth: [0, 6, 12, 8, 4] })), ['d3', 'd3', 'vee']);
eq('cross beats halo', ids(G({ moth: [2, 6, 7, 8, 12] })).sort(), ['cross', 'h3', 'v3']);
eq('frame', ids(G({ moth: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14] })).filter((x) => x === 'frame'), ['frame']);
{
  const all = ids(G({ moth: [...Array(15).keys()] }));
  t('full fair found', all.includes('full') && all.includes('frame') && !all.includes('h4') && !all.includes('h3') && !all.includes('halo'), all.join());
}
eq('wisp stands in', ids(G({ moth: [0, 2], wisp: [1] })), ['h3']);
eq('wisps alone do not pay', ids(G({ wisp: [0, 1, 2] })), []);
eq('ash blocks', ids(G({ moth: [0, 2], ash: [1] })), []);
eq('different symbols do not match', ids(G({ moth: [0, 1], candle: [2] })), []);
eq('maskWild', ids(G({ moth: [0, 2], mask: [1] }), { flags: { maskWild: true } }), ['h3']);
eq('mask alone no wild', ids(G({ moth: [0, 2], mask: [1] })), []);
eq('ashIsFav needs the favourite', ids(G({ moth: [0, 2], ash: [1] }), { flags: { ashIsFav: true } }, ['moth']), ['h3']);
eq('ashIsFav other fav', ids(G({ moth: [0, 2], ash: [1] }), { flags: { ashIsFav: true } }, ['candle']), []);
eq('fiveNeedsFour', ids(G({ moth: [0, 1, 3, 4], candle: [2] }), { flags: { fiveNeedsFour: true } }), ['h5']);
eq('fiveNeedsFour off', ids(G({ moth: [0, 1, 3, 4], candle: [2] })), []);

// ---------- 2. worked examples (EFFECTS.md section 6) ----------
{
  const r = mk(); const s = score(r, G({ moth: [0, 1, 2] }));
  eq('ex1 plain line', s.total, 2);
}
{
  const r = mk(); const s = score(r, G({ tooth: [5, 7, 8], wisp: [6], eye: [9] }));
  eq('ex2 wild and beats', [s.total, s.patterns.map((p) => p.id)], [6, ['h4']]);
}
{
  const r = mk(); const s = score(r, G({ candle: [0, 5, 10, 6, 12] }));
  eq('ex3 two shapes', [s.total, s.patterns.map((p) => p.pay)], [5, [2, 3]]);
}
{
  const r = mk({ heat: 6 }); const s = score(r, G({ eye: [0, 1, 2, 3, 4] }));
  eq('ex4 heat', s.total, 35); // 16 x (1 + 0.20 x 6)
}
{
  const r = mk({ charms: ['tallow_stub'] }); const s = score(r, G({ candle: [0, 1, 2] }));
  eq('ex5 value charm', s.total, 4);
}
{
  const r = mk({ charms: ['needle', 'small_fry_union', 'dusty_wing'] }); const s = score(r, G({ moth: [0, 1, 2] }));
  eq('ex6 symbol mult x pattern mult', s.total, 4);
}
{
  const r = mk({ charms: ['night_swarm'] }); const s = score(r, G({ moth: [0, 6, 12, 3, 10, 14] }));
  eq('ex7 scales with the grid', s.total, 6);
}
{
  const r = mk({ charms: ['dust_queen', 'moth_jar'], debt: 2 });
  t('ex8 S is 4', scaleOf(r) === 4);
  const before = r.purse;
  r.grid = G({ moth: [0, 1, 2, 4, 10] });
  const c = collect(r);
  // debt 3 is a boss debt (The Auditor: 3-cell patterns pay half); flat coins scale by S^0.75 per event: round(4^0.75) = 3
  eq('ex8 retrigger and flat coins', [c.total, c.flat, r.purse - before, c.patterns[0].repeats], [2, 15, 17, 1]);
}
{
  const r = mk({ charms: ['prism', 'lost_light'] }); const s = score(r, G({ lantern: [2, 6, 8, 12], wisp: [7] }));
  // EFFECTS.md says 77 and lists only the Cross. With the data as written (Cross beats only the Halo)
  // the Line of 3 and the Column through the Wisp pay as well, and Lost Light stacks once per pattern.
  // The Cross alone is (8+3+3+3) x 1 x (6+1) = 119.
  eq('ex9 cross with a wisp', [s.total, s.patterns.map((p) => p.id), s.patterns[2].pay], [169, ['h3', 'v3', 'cross'], 119]);
}
{
  const r = mk({ charms: ['fair_tapestry'], heat: 4, terms: 'short_fuse' }); const s = score(r, G({ eye: [1, 2, 3, 6, 7, 10, 11] }));
  eq('ex10 three multipliers', [s.sum, s.total], [20, 216]);
}
{
  const r = mk({ charms: ['ash_cake'], heat: 8, purse: 500, debt: 3 });
  t('ex11 S is 8', scaleOf(r) === 8);
  const wick = r.wick;
  r.grid = G({ ash: [0, 1, 2] }, 'tooth');
  const c = collect(r);
  // 500 - 50 burnt + Ash Cake 10 coins x 8^0.75
  eq('ex11 scorch', [c.scorch, c.total, r.heat, r.purse, r.wick - wick], [true, 0, 5, 498, 2]);
}
{
  const r = mk({ curses: ['hairline_crack'], charms: ['firm_handshake'], deals: ['quick_cash', 'muscle'] });
  const a = score(r, G({ crow: [0, 1, 2] }));
  const b = score(r, G({ crow: [0, 1, 2, 3] }));
  eq('ex12 curse against boon', [a.total, b.total], [6, 18]);
}
{
  const r = mk();
  const s = score(r, G({ moth: [...Array(15).keys()] }));
  const by = Object.fromEntries(s.patterns.map((p) => [p.id, 0]));
  for (const p of s.patterns) by[p.id] += p.pay;
  // EFFECTS.md prints 192 and lists five Columns. With the data as written, the middle Column
  // sits inside the Cross, so the sum is checked part by part here.
  eq('ex13 parts', [by.full, by.h5, by.v3, by.d3, by.vee, by.saw, by.corners, by.cross, by.frame], [50, 24, 10, 18, 20, 32, 6, 12, 20]);
  eq('ex13 total', s.total, 192);
}

// ---------- 3. heat, scorch, favourite ----------
{
  const r = mk({ heat: 8, purse: 0 }); r.grid = G({ ash: [3, 4, 5] }); const c = collect(r);
  t('scorch burns 0 of empty purse', c.scorch && r.purse === 0);
}
{
  const r = mk({ char: 'tao' });
  t('Tao heat step 20', score(r, G({ eye: [0, 1, 2, 3, 4] })).heatMult === 1);
  r.heat = 5;
  eq('Tao heat 5', score(r, G({ eye: [0, 1, 2, 3, 4] })).heatMult, 2);
}
{
  const r = mk({ charms: ['fire_eater'], heat: 8, purse: 100 }); r.grid = G({ ash: [0, 1, 2] }); const c = collect(r);
  t('fire eater: 3 ash is no scorch', !c.scorch && r.purse === 100);
}

// ---------- 4. determinism and resume ----------
function drive(run, n) {
  const log = [];
  for (let i = 0; i < n && run.phase !== 'ended'; i++) {
    switch (run.phase) {
      case 'terms': pickTerms(run, termsOffer(run)[0].id); break;
      case 'spin': if (run.heat < 2) stoke(run); log.push(spin(run).grid.join()); break;
      case 'post': log.push(collect(run).gain); break;
      case 'roundend': log.push(endRound(run).interest); break;
      case 'shop': buyCharm(run, 0); reroll(run); buyCharm(run, 1); leaveShop(run); break;
      case 'deal': refuseDeals(run); break;
      case 'pawn': run.phase = 'ended'; break;
    }
  }
  return log;
}
{
  const a = drive(newRun({ seed: 'det' }), 120), b = drive(newRun({ seed: 'det' }), 120), c = drive(newRun({ seed: 'other' }), 120);
  t('same seed same run', JSON.stringify(a) === JSON.stringify(b));
  t('other seed differs', JSON.stringify(a) !== JSON.stringify(c));
  const r1 = newRun({ seed: 'res' });
  drive(r1, 40);
  const r2 = loadRun(saveRun(r1));
  const x = drive(r1, 80), y = drive(r2, 80);
  t('resume gives identical future', JSON.stringify(x) === JSON.stringify(y) && saveRun(r1) === saveRun(r2));
  // a shop reroll never changes the next spin
  const s1 = newRun({ seed: 'rr' }), s2 = newRun({ seed: 'rr' });
  pickTerms(s1, termsOffer(s1)[0].id); pickTerms(s2, termsOffer(s2)[0].id);
  s2.phase = 'shop'; s2.shop = { charms: [], tricks: [], bench: [], rerolls: 0, freeRerolls: 9 }; reroll(s2); s2.phase = 'spin';
  t('reroll leaves the spin stream alone', s1.rngState.spin === s2.rngState.spin && spin(s1).grid.join() === spin(s2).grid.join());
}

// ---------- 5. interest, bank, deadline ----------
{
  const r = mk({ purse: 100, debt: 0 });
  r.phase = 'roundend'; r.spinsLeft = 0; r.round = 0; r.debt = 60;
  const e = endRound(r);
  eq('interest 8% of purse, cap 25% of debt', [e.interest, r.purse], [Math.min(8, 15), 108]);
  const r2 = mk({ purse: 1000 }); r2.phase = 'roundend'; r2.debt = 60; r2.spinsLeft = 0;
  eq('interest cap', endRound(r2).interest, 15);
  const r3 = mk({ purse: 100, curses: ['dead_weight'] }); r3.phase = 'roundend'; r3.debt = 60; r3.spinsLeft = 0;
  eq('no interest curse', endRound(r3).interest, 0);
  const r4 = mk({ purse: 100, char: 'sok' }); r4.phase = 'roundend'; r4.debt = 400; r4.spinsLeft = 0;
  eq('Sok interest 13%', endRound(r4).interest, 13);
}
{
  const r = mk({ purse: 70 }); r.phase = 'spin'; r.debt = 60;
  const spent = bank(r, 20);
  eq('bank partial', [spent, r.banked, r.purse, r.phase], [20, 20, 50, 'spin']);
  bank(r, 999);
  eq('bank pays and caps', [r.banked, r.purse, r.phase === 'deal' || r.phase === 'shop'], [60, 10, true]);
  t('early pay: wick and trick', r.wick > 3 && r.stats.earlyPays === 1 && r.stats.debtsPaid === 1);
}
{
  // deadline chain: paid, spare candle, cosigner, snooze, pawn, collected
  const base = () => { const r = mk({ purse: 5 }); r.phase = 'roundend'; r.spinsLeft = 0; r.debt = 60; r.round = 2; r.rounds = 3; return r; };
  let r = base(); eq('deadline missed, nothing', [endRound(r).deadline, r.phase], ['collected', 'ended']);
  r = base(); r.tricks = ['spare_candle']; eq('spare candle', [endRound(r).deadline, r.tricks.length, r.rounds, r.phase], ['saved', 0, 4, 'shop']);
  r = base(); addCharm(r, 'cosigner'); eq('cosigner', [endRound(r).deadline, r.charms.length], ['saved', 0]);
  r = base(); r.perm.push({ type: 'flag', flag: 'extraLife', src: { kind: 'deal', id: 'snooze' } });
  eq('snooze once', [endRound(r).deadline, r.flagsUsed.extraLife], ['saved', true]);
  r = base(); addCharm(r, 'moth_jar'); eq('pawn offered', [endRound(r).deadline, r.phase], ['pawn', 'pawn']);
  pawn(r, 0); eq('pawn taken', [r.charms.length, r.curses.length, r.rounds, r.phase], [0, 1, 4, 'shop']);
  r = base(); r.purse = 60; eq('deadline paid by auto bank', [endRound(r).deadline, r.banked], ['paid', 60]);
}
{
  // contract cleared and endings
  const r = mk({ contract: 'c1' }); r.contract = 'c3'; r.debtIdx = 7; r.debt = 60000; r.round = 2; r.rounds = 3; r.phase = 'roundend'; r.spinsLeft = 0; r.purse = 70000;
  endRound(r);
  eq('ending 1', [r.phase, r.result], ['ended', { won: true, ending: 'paid_in_full' }]);
  const r2 = mk(); r2.contract = 'c7'; r2.debtIdx = 7; r2.debt = 90000; r2.round = 2; r2.rounds = 3; r2.phase = 'roundend'; r2.spinsLeft = 0; r2.purse = 99999; r2.deals = ['x'];
  endRound(r2); eq('ending 2 needs no deals', r2.result.ending, null);
  const r3 = mk(); r3.contract = 'c10'; r3.debtIdx = 8; r3.debt = 1; r3.round = 2; r3.rounds = 3; r3.phase = 'roundend'; r3.spinsLeft = 0; r3.purse = 99999; r3.curses = ['dead_weight', 'short_candle', 'ash_rain', 'the_tithe', 'jinx'];
  endRound(r3); eq('ending 3 needs 5 curses', r3.result.ending, 'new_management');
}

// ---------- 6. every trigger, with a one-rule charm ----------
function probe(trigger, cond = {}, setup = () => {}, act = () => {}) {
  const run = mk();
  CHARM.__probe = { id: '__probe', name: { en: 'p' }, tags: ['swarm'], rarity: 'common', price: { coins: 1 }, rules: [{ trigger, cond, effects: [{ type: 'stack', n: 1 }] }] };
  addCharm(run, '__probe');
  setup(run);
  const inst = run.charms.find((c) => c.id === '__probe');
  act(run);
  delete CHARM.__probe;
  return inst.stack;
}
const seenTrig = new Set();
const trig = (name, got, want = 1) => { seenTrig.add(name); t('trigger ' + name, got === want, `got ${got}`); };
trig('onRunStart', probe('onRunStart', {}, () => {}, (r) => fire(r, 'onRunStart')));
trig('onDebtStart', probe('onDebtStart', {}, () => {}, (r) => fire(r, 'onDebtStart')));
trig('onRoundStart', probe('onRoundStart', {}, (r) => { r.phase = 'terms'; r.termsOffer = ['steady']; }, (r) => pickTerms(r, 'steady')));
trig('onSpinStart', probe('onSpinStart', {}, (r) => { r.phase = 'spin'; }, (r) => spin(r)));
trig('onSymbolLand', probe('onSymbolLand', { sym: 'moth' }, () => {}, (r) => score(r, G({ moth: [0, 1] }))), 2);
trig('onPattern', probe('onPattern', {}, () => {}, (r) => score(r, G({ moth: [0, 1, 2] }))));
trig('onSpinEnd', probe('onSpinEnd', {}, () => {}, (r) => score(r, G({ moth: [0, 1, 2] }))));
trig('onDud', probe('onDud', {}, () => {}, (r) => score(r, G({}))));
trig('onScorch', probe('onScorch', {}, () => {}, (r) => score(r, G({ ash: [0, 1, 2] }))));
trig('onStoke', probe('onStoke', {}, (r) => { r.phase = 'spin'; }, (r) => stoke(r)));
trig('onRoundEnd', probe('onRoundEnd', {}, (r) => { r.phase = 'roundend'; r.spinsLeft = 0; r.round = 0; r.rounds = 3; r.debt = 60; }, (r) => endRound(r)));
trig('onInterest', probe('onInterest', {}, (r) => { r.phase = 'roundend'; r.spinsLeft = 0; r.round = 0; r.rounds = 3; r.debt = 60; r.purse = 100; }, (r) => endRound(r)));
trig('onBank', probe('onBank', {}, (r) => { r.phase = 'spin'; r.debt = 60; r.purse = 10; }, (r) => bank(r, 5)));
trig('onDebtPaid', probe('onDebtPaid', {}, (r) => { r.phase = 'spin'; r.debt = 60; r.purse = 100; }, (r) => bank(r, 60)));
trig('onBuy', probe('onBuy', {}, (r) => { r.phase = 'shop'; r.shop = { charms: ['tea_leaves'], tricks: [], bench: [] }; r.purse = 99; }, (r) => buyCharm(r, 0)));
trig('onSell', probe('onSell', {}, (r) => { addCharm(r, 'tea_leaves'); }, (r) => sellCharm(r, 1)));
trig('onSellSelf', probe('onSellSelf', {}, () => {}, (r) => sellCharm(r, 0)));
trig('onReroll', probe('onReroll', {}, (r) => { r.phase = 'shop'; r.shop = { charms: [], tricks: [], bench: [], rerolls: 0, freeRerolls: 1 }; }, (r) => reroll(r)));
trig('onTrick', probe('onTrick', {}, (r) => { r.tricks = ['ice']; r.phase = 'spin'; }, (r) => useTrick(r, 0)));
trig('onDeal', probe('onDeal', {}, (r) => { r.phase = 'deal'; r.dealOffer = ['quick_cash']; }, (r) => signDeal(r, 'quick_cash')));
trig('onRefuse', probe('onRefuse', {}, (r) => { r.phase = 'deal'; r.dealOffer = ['quick_cash']; }, (r) => refuseDeals(r)), 1);
trig('onCurse', probe('onCurse', {}, () => {}, (r) => addCurse(r, 'jinx')));
{
  const r = mk({ charms: ['jinx_bead'] }); // passive and now are covered by data: charms read, deals run boons
  seenTrig.add('passive'); seenTrig.add('now');
  const r2 = mk(); r2.phase = 'deal'; r2.dealOffer = ['lucky_break']; signDeal(r2, 'lucky_break');
  t('trigger now (deal boon is permanent luck)', snapshot(r2).luck === 1 + 3 && r2.curses.includes('blindfold'));
  t('trigger passive (curse)', snapshot(mk({ curses: ['jinx'] })).luck === 1 - 2);
}
t('every trigger covered', TRIGGERS.every((x) => seenTrig.has(x)), TRIGGERS.filter((x) => !seenTrig.has(x)).join());

// ---------- 7. every effect primitive ----------
{
  const src = { kind: 'charm', id: 'x', inst: { id: 'x', stack: 0, counters: {} } };
  const E = (e, setup = () => {}, ctx = {}) => { const r = mk({ debt: 1 }); setup(r); applyEffect(r, src, e, ctx); return r; };
  const seen = new Set();
  const ef = (name, e, check, setup, ctx) => { seen.add(e.type); const r = E(e, setup, ctx); t('effect ' + name, check(r, ctx), JSON.stringify(e)); };
  ef('coins x S^0.75', { type: 'coins', n: 3 }, (r) => r.purse === Math.round(3 * 2 ** 0.75));
  ef('symValue', { type: 'symValue', n: 2, sym: 'moth' }, (r) => snapshot(r).symValue.length === 1);
  ef('symMult', { type: 'symMult', n: 0.5, sym: 'all' }, (r) => snapshot(r).symMult.length === 1);
  ef('patMult', { type: 'patMult', n: 1, pattern: 'all' }, (r) => snapshot(r).patMult.length === 1);
  ef('patMult this', { type: 'patMult', n: 2, pattern: 'this' }, (r, c) => c.thisMult === 2, () => {}, { thisMult: 0 });
  ef('allMult scope spin', { type: 'allMult', n: 2 }, (r) => r.temp.length === 1 && snapshot(r).allMult.length === 1);
  ef('luck', { type: 'luck', n: 2 }, (r) => snapshot(r).luck === 3);
  ef('spins', { type: 'spins', n: 2 }, (r) => r.spinsLeft === 5);
  ef('spins never below 1', { type: 'spins', n: -9 }, (r) => r.spinsLeft === 1);
  ef('interest', { type: 'interest', n: 3 }, (r) => snapshot(r).interest === 3);
  ef('wick', { type: 'wick', n: 2 }, (r) => r.wick === 5);
  ef('heat', { type: 'heat', n: 3 }, (r) => r.heat === 3);
  ef('weight', { type: 'weight', n: 2, sym: 'moth' }, (r) => snapshot(r).weight.length === 1);
  ef('transform', { type: 'transform', n: 1, from: 'moth', to: 'candle' }, (r, c) => c.edits.length === 1, () => {}, { edits: [] });
  ef('place', { type: 'place', n: 1, sym: 'wisp' }, (r, c) => c.edits.length === 1, () => {}, { edits: [] });
  ef('retrigger', { type: 'retrigger', n: 1 }, (r, c) => c.retrig === 1, () => {}, {});
  ef('trick', { type: 'trick', n: 1 }, (r) => r.tricks.length === 1);
  ef('stack', { type: 'stack', n: 2 }, () => src.inst.stack === 2);
  ef('slot', { type: 'slot', n: 1 }, (r) => r.slots === 6);
  ef('gainCharm', { type: 'gainCharm', rarity: 'rare' }, (r) => r.charms.length === 1 && CHARM[r.charms[0].id].rarity === 'rare', (r) => { r.pool = CHARMS.map((c) => c.id); });
  ef('gainCharm steps down', { type: 'gainCharm', rarity: 'legendary' }, (r) => r.charms.length === 1 && CHARM[r.charms[0].id].rarity === 'uncommon');
  ef('gainCurse', { type: 'gainCurse', n: 2 }, (r) => r.curses.length === 2);
  ef('removeSymbol', { type: 'removeSymbol', n: 1 }, (r) => r.pendingRemove === 1);
  ef('flag', { type: 'flag', flag: 'smallHalf' }, (r) => snapshot(r).flags.smallHalf === true);
  t('every effect primitive covered', EFFECT_TYPES.every((x) => seen.has(x)), EFFECT_TYPES.filter((x) => !seen.has(x)).join());
  // per, limit, every, chance
  const r = mk({ charms: ['pin_doll'], curses: ['jinx', 'dead_weight'], debt: 2 });
  fire(r, 'onRoundStart');
  eq('per curses and S', r.purse, Math.round(3 * 2 * 4 ** 0.75));
  const r2 = mk({ charms: ['thirteenth_stair'] });
  const sc = { found: [], steps: [], flat: 0 };
  for (let i = 0; i < 26; i++) fire(r2, 'onSpinEnd', { sc });
  eq('every 13', sc.flat, 80);
}

// ---------- 8. shop, deals, meta, daily ----------
{
  const r = newRun({ seed: 'shop' });
  r.perm.push({ type: 'flag', flag: 'shopDiscount', v: 30, src: { kind: 'deal', id: 'x' } });
  t('discount prices', price(r, { kind: 'charm', id: 'moth_jar' }).coins === Math.round(4 * 0.7));
  r.phase = 'shop'; r.shop = { charms: ['moth_jar'], tricks: [], bench: ['polish', 'purge'], rerolls: 0, freeRerolls: 0 }; r.purse = 100;
  t('buy charm', buyCharm(r, 0) && r.charms.some((c) => c.id === 'moth_jar'));
  t('sell charm gives half', sellCharm(r, 0) && r.purse > 90);
  t('bench polish', doBench(r, 0, 'moth') && r.bench.moth.value === 1 && snapshot(r).symValue.some((x) => x.sym === 'moth'));
  r.wick = 20; t('bench pull out', doBench(r, 0, 'moth') && r.removed.includes('moth'));
  const g = rollGrid(r, snapshot(r), ['candle']);
  t('removed symbol never rolls', !g.includes('moth'));
  toggleLock(r, 0);
}
{
  const r = mk(); r.perm.push({ type: 'flag', flag: 'mustSign', src: { kind: 'x', id: 'x' } }); r.phase = 'deal'; r.dealOffer = ['quick_cash'];
  t('mustSign blocks refuse', !refuseDeals(r));
  const r2 = mk(); r2.pool = CHARMS.map((c) => c.id); r2.phase = 'deal'; r2.dealOffer = ['black_envelope']; signDeal(r2, 'black_envelope');
  t('black envelope: legendary and 2 curses', r2.curses.length === 2 && r2.charms.length + r2.waiting.length === 1);
}
{
  const meta = newMeta();
  t('start unlocks', isUnlocked(meta, 'char', 'nim') && !isUnlocked(meta, 'char', 'tao') && availableCharms(meta).length === 77);
  const run = newRun({ seed: 'meta' });
  run.result = { won: true, ending: null }; run.phase = 'ended'; run.stats.debtsPaid = 5; run.stats.reachDebt = 5; run.stats.spinCoins = 1200;
  const out = applyRunResult(meta, summary(run));
  t('wax and achievements', out.wax >= 5 * 3 + 20 && meta.achievements.includes('first_debt') && meta.achievements.includes('spin_1k') && meta.contracts.includes('c2'));
  t('contract 1 unlocks Tao', meta.chars.includes('tao') && isUnlocked(meta, 'char', 'tao'));
  t('unlocked charm enters the pool', availableCharms(meta).includes('furnace_heart'));
  meta.wax = 30; t('hideout buy', buyHideout(meta, 'stove') && meta.wax === 5 && !buyHideout(meta, 'shelf'));
}
{
  eq('day numbers', dayNum('2026-03-02') - dayNum('2026-03-01'), 1);
  eq('leap day', dayNum('2028-03-01') - dayNum('2028-02-28'), 2);
  const a = dailySetup(dailySeed('2026-05-05')), b = dailySetup(dailySeed('2026-05-05'));
  eq('daily setup is stable', a, b);
  const meta = newMeta();
  const first = recordDaily(meta, '2026-05-05', { debtsPaid: 3, coins: 500 });
  const again = recordDaily(meta, '2026-05-05', { debtsPaid: 9, coins: 9999 });
  const next = recordDaily(meta, '2026-05-06', { debtsPaid: 1, coins: 1 });
  eq('daily first attempt only', [first.first, again.first, meta.daily.best.debts, next.streak, meta.daily.done], [true, false, 1, 2, 2]);
}


// ---------- 9. rule flags that change the round ----------
{
  const withFlag = (name, v, o = {}) => { const r = mk(o); r.perm.push({ type: 'flag', flag: name, v, src: { kind: 'test', id: name } }); return r; };
  const start = (r) => { r.phase = 'terms'; r.termsOffer = ['steady']; r.spinsLeft = 0; r.spinInRound = 0; pickTerms(r, 'steady'); return r; };
  let r = start(withFlag('seeNextFav', undefined)); t('seeNextFav shows the next Favourite', r.nextFavs?.length === 1);
  r = start(withFlag('twoFavs', undefined)); t('twoFavs gives two', r.favs.length === 2 && r.favs[0] !== r.favs[1]);
  r = start(withFlag('pickFirstFav', undefined)); t('pickFirstFav lets the player choose', setFavourite(r, 'eye') && r.favs[0] === 'eye');
  r = start(mk()); t('no pick without the flag', !setFavourite(r, 'eye'));
  r = withFlag('deadCentre', undefined); r.phase = 'spin'; r.favs = ['moth']; r.spinInRound = 1; r.spinsLeft = 3; r.tricks = []; r.grid = null;
  t('deadCentre', spin(r).grid[7] === 'ash');
  r = withFlag('ghostHire', undefined); r.phase = 'spin'; r.favs = ['moth']; r.spinInRound = 0; r.spinsLeft = 3; r.tricks = [];
  t('ghostHire places wisps', spin(r).grid.filter((x) => x === 'wisp').length >= 2);
  r = withFlag('firstSpinDead', undefined); r.spinInRound = 0; t('firstSpinDead', score(r, G({ moth: [0, 1, 2] })).total === 0);
  r = withFlag('lastTwice', undefined); r.spinsLeft = 1; r.grid = G({ moth: [0, 1, 2] }); { const c = collect(r); t('lastTwice scores twice', r.purse === 4 && c.second.total === 2); }
  r = withFlag('bankX', 1.25, { purse: 100 }); r.phase = 'spin'; r.debt = 1000; bank(r, 8); t('bankX counts x1.25', r.banked === 10 && r.purse === 92);
  r = withFlag('noStoke', undefined); r.phase = 'spin'; t('noStoke blocks Stoke', stoke(r) === null);
  r = withFlag('heatFloor', 3); r.heat = 0; r.phase = 'terms'; r.termsOffer = ['steady']; pickTerms(r, 'steady'); t('heatFloor holds Heat', r.heat === 3);
  r = withFlag('startHeat', 3); r.phase = 'terms'; r.termsOffer = ['steady']; pickTerms(r, 'steady'); t('startHeat', r.heat === 3);
  r = withFlag('spinsRound', 1); r.phase = 'terms'; r.termsOffer = ['steady']; pickTerms(r, 'steady'); t('spinsRound +1', r.spinsLeft === 6);
  r = withFlag('debtMul', 15); r.perm.length = 1; t('debtMul read at debt start', snapshot(r).flags.debtMul === 15);
  r = mk(); r.perm.push({ type: 'flag', flag: 'dealOffers', v: 3, src: { kind: 'test', id: 'x' } }); r.phase = 'shop'; { const sh = openShop(r); t('shop shows 4 charms', sh.charms.length === 4 && sh.tricks.length === 2 && sh.bench.length === 2); }
  r = mk({ contract: 'c8' }); r.contract = 'c8'; openShop(r); t('contract 8 shows 3 charms', r.shop.charms.length === 3 && !toggleLock(r, 0));
  r = mk(); r.phase = 'deal'; r.dealOffer = ['advance']; signDeal(r, 'advance'); t('advance: next debt 30% smaller, small print 15% larger', r.debtIdx === 1 && r.debt === Math.ceil(150 * 1.15 * 0.7 - 1e-9));
}

// ---------- critic pass: bosses, slot order, Favourite redraw, symbol growth ----------
{
  const { redrawFavourite, redrawCost } = await import('../src/core/run.js');
  const { bossOf } = await import('../src/core/effects.js');
  let r = mk({ debt: 2 }); t('debt 3 has a boss rule', bossOf(r)?.id === 'auditor' && snapshot(r).flags.smallHalf === true);
  r = mk({ debt: 1 }); t('debt 2 has no boss', bossOf(r) === null);
  r = mk({ debt: 4 }); t('last debt of c1 has a boss', !!bossOf(r));
  r = mk({ charms: ['opening_act', 'moth_jar'] }); t('Opening Act fires in the first slot', snapshot(r).allMult.length === 1);
  r = mk({ charms: ['moth_jar', 'opening_act'] }); t('Opening Act idle elsewhere', snapshot(r).allMult.length === 0);
  r = mk({ charms: ['moth_jar', 'closer'] }); t('Closer fires in the last slot', snapshot(r).allMult.length === 1);
  r = mk({ charms: ['understudy', 'tallow_stub'] }); { const s = score(r, G({ candle: [0, 1, 2] })); t('Understudy copies its right neighbour', s.total === 6); }
  r = mk({ charms: ['tallow_stub', 'understudy'] }); { const s = score(r, G({ candle: [0, 1, 2] })); t('Understudy with nothing to its right does nothing', s.total === 4); }
  r = mk({ debt: 3 }); t('symbols +1 value from debt 4', snapshot(r).symValue.some((x) => x.sym === 'all' && x.n === 1));
  r = mk(); r.phase = 'spin'; r.wick = 1; r.roundSerial = 1;
  const f0 = r.favs[0];
  t('first redraw is free', redrawCost(r) === 0 && redrawFavourite(r) && r.wick === 1 && r.favs[0] !== f0);
  t('second redraw costs 1 Wick', redrawCost(r) === 1 && redrawFavourite(r) && r.wick === 0);
  t('no Wick, no redraw', !redrawFavourite(r));
}

console.log(`check-core: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
