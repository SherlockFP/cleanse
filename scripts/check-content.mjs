// Content check: every charm, deal, curse, trick, stake, contract, character, hideout piece and
// achievement loads, uses only known primitives and tags, has en/tr/th text, and every charm rule can
// fire in a constructed state without throwing. node scripts/check-content.mjs
import {
  CONFIG, SYM, SCORING, CHARMS, CHARM, DEALS, CURSES, CURSE, TRICKS, STAKES, CONTRACTS, CHARS, HIDEOUT, ACHIEVEMENTS, ACH, PATTERN_DATA, BENCH, RARITIES,
} from '../src/core/data.js';
import { TRIGGERS, COND_KEYS, EFFECT_TYPES, FLAGS, PER_KEYS, SYM_TARGETS, snapshot, fire, runEffects, addCharm } from '../src/core/effects.js';
import { newRun, pickTerms, termsOffer, useTrick, trickTarget, spin, collect } from '../src/core/run.js';

let ok = 0, bad = 0;
const t = (cond, msg) => { if (cond) ok++; else { bad++; console.log('FAIL ' + msg); } };
const LANGS = ['en', 'tr', 'th'];
const FAMILIES = CONFIG.families.map((f) => f.id);
const PATTERN_IDS = PATTERN_DATA.map((p) => p.id);
const ALL_SYMS = Object.keys(SYM);
const TRICK_OPS = ['shiftColumn', 'holdColumn', 'respinRow', 'retriggerBest', 'swapAdjacent', 'setCell', 'rerollSymbol', 'spins', 'heat', 'stash', 'luck', 'patMult', 'pickFav', 'copyAdjacent', 'loan', 'muteCurses', 'freeBench', 'saveDeadline'];
const TRICK_WHEN = ['pre', 'post', 'any', 'shop', 'auto'];
const HIDE_EFFECTS = ['none', 'startTrick', 'startCharmPick', 'shopOffers', 'benchOffers', 'foresight', 'keepCharm', 'startWick', 'seededRuns', 'refuseWick'];
const STATS = ['debtsPaid', 'contract', 'reachDebt', 'spinCoins', 'heat10Spins', 'scorches', 'cursesHeld', 'dealsSigned', 'dealsRefused', 'cleanContract', 'interestTotal', 'earlyPays', 'exactChange', 'tricksUsed', 'tricksOneSpin', 'symbolsRemoved', 'wispsOneSpin', 'luckReached', 'favPatterns', 'crownPatterns', 'familyFull', 'charmsBought', 'charmsSold', 'dailyRuns', 'charWins', 'hideout', 'patternsOneSpin'];

const text = (o, what) => {
  t(o && LANGS.every((l) => typeof o[l] === 'string' && o[l].trim()), what + ' has en/tr/th text');
  if (o && LANGS.every((l) => typeof o[l] === 'string')) {
    const tok = (s) => (s.match(/\{c:[\d.]+\}/g) || []).sort().join();
    t(tok(o.en) === tok(o.tr) && tok(o.en) === tok(o.th), what + ' same {c:N} tokens in every language');
  }
};
const symOK = (s, allowTargets = true) => ALL_SYMS.includes(s) || (allowTargets && SYM_TARGETS.includes(s));
const perOK = (p) => !p || PER_KEYS.includes(p) || (p.startsWith('family:') && FAMILIES.includes(p.slice(7))) || (p.startsWith('sym:') && ALL_SYMS.includes(p.slice(4)));

function effectOK(e, what) {
  t(EFFECT_TYPES.includes(e.type), `${what}: unknown effect ${e.type}`);
  t(perOK(e.per), `${what}: bad per ${e.per}`);
  t(e.n === undefined || Number.isFinite(e.n), `${what}: n must be a number`);
  t(!e.scope || ['spin', 'round', 'debt'].includes(e.scope), `${what}: bad scope`);
  if (['symValue', 'symMult', 'weight'].includes(e.type)) t(symOK(e.sym), `${what}: bad sym ${e.sym}`);
  if (e.type === 'place') t(ALL_SYMS.includes(e.sym) && (!e.zone || ['corner', 'edge', 'midrow'].includes(e.zone)), `${what}: bad place`);
  if (e.type === 'transform') t(ALL_SYMS.includes(e.from) && (ALL_SYMS.includes(e.to) || e.to === 'favoured'), `${what}: bad transform`);
  if (e.type === 'patMult') t(['all', 'big', 'this'].includes(e.pattern) || PATTERN_IDS.includes(e.pattern), `${what}: bad pattern ${e.pattern}`);
  if (e.type === 'gainCharm') t(RARITIES.includes(e.rarity), `${what}: bad rarity`);
  if (e.type === 'flag') t(FLAGS.includes(e.flag), `${what}: unknown flag ${e.flag}`);
}
function condOK(c, what) {
  for (const k of Object.keys(c)) t(COND_KEYS.includes(k), `${what}: unknown cond ${k}`);
  if (c.sym) t(ALL_SYMS.includes(c.sym), `${what}: cond sym`);
  if (c.group) t(['low', 'mid', 'high'].includes(c.group), `${what}: cond group`);
  if (c.pattern) t(PATTERN_IDS.includes(c.pattern), `${what}: cond pattern`);
  if (c.zone) t(['corner', 'edge', 'midrow'].includes(c.zone), `${what}: cond zone`);
  if (c.spinIs) t(['first', 'last'].includes(c.spinIs), `${what}: cond spinIs`);
  if (c.countMin) t(ALL_SYMS.includes(c.countMin[0]) && c.countMin[1] > 0, `${what}: cond countMin`);
  if (c.limit) t(['round', 'debt'].includes(c.limit), `${what}: cond limit`);
  if (c.chance !== undefined) t(c.chance > 0 && c.chance <= 100, `${what}: cond chance`);
  if (c.every !== undefined) t(Number.isInteger(c.every) && c.every > 1, `${what}: cond every`);
}
function rulesOK(rules, what) {
  t(Array.isArray(rules) && rules.length > 0, what + ' has rules');
  for (const r of rules) {
    t(TRIGGERS.includes(r.trigger), `${what}: unknown trigger ${r.trigger}`);
    condOK(r.cond || {}, what);
    t(Array.isArray(r.effects) && r.effects.length > 0, what + ' rule has effects');
    for (const e of r.effects) effectOK(e, what);
  }
}

// ---------- static checks ----------
const counts = { charms: 124, deals: 24, curses: 16, tricks: 20, stakes: 12, contracts: 10, chars: 6, hideout: 10, achievements: 43 };
t(CHARMS.length === counts.charms && DEALS.length === counts.deals && CURSES.length === counts.curses && TRICKS.length === counts.tricks, 'content counts');
t(STAKES.length === counts.stakes && CONTRACTS.length === counts.contracts && CHARS.length === counts.chars && HIDEOUT.length === counts.hideout && ACHIEVEMENTS.length === counts.achievements, 'content counts (2)');
for (const list of [CHARMS, DEALS, CURSES, TRICKS, STAKES, CONTRACTS, CHARS, HIDEOUT, ACHIEVEMENTS, BENCH]) t(new Set(list.map((x) => x.id)).size === list.length, 'unique ids');
for (const s of Object.values(SYM)) text(s.name, 'symbol ' + s.id);
for (const p of PATTERN_DATA) { text(p.name, 'pattern ' + p.id); t(p.cells.every((c) => c.length === p.size), 'pattern size ' + p.id); }

const lockedBy = {};
for (const a of ACHIEVEMENTS) if (a.reward.charm) lockedBy[a.reward.charm] = (lockedBy[a.reward.charm] || 0) + 1;
for (const c of CHARMS) {
  const w = 'charm ' + c.id;
  text(c.name, w + ' name'); text(c.text, w);
  t(RARITIES.includes(c.rarity), w + ' rarity');
  t(FAMILIES.includes(c.family) && c.tags.includes(c.family) && c.tags.every((x) => FAMILIES.includes(x)), w + ' tags');
  t(typeof c.icon === 'string' && c.icon, w + ' icon');
  t(Number.isFinite(c.price.coins ?? c.price.wick), w + ' price');
  rulesOK(c.rules, w);
  if (c.unlock) t(c.unlock.startsWith('ach:') && ACH[c.unlock.slice(4)]?.reward.charm === c.id, w + ' unlock points at an achievement that gives it');
  else t(!lockedBy[c.id], w + ' is both free and an achievement reward');
}
for (const id of Object.keys(lockedBy)) t(CHARMS.some((c) => c.id === id && c.unlock === 'ach:' + ACHIEVEMENTS.find((a) => a.reward.charm === id).id), 'achievement reward charm is locked: ' + id);
for (const f of FAMILIES) t(CHARMS.some((c) => c.family === f), 'family has charms: ' + f);
for (const d of DEALS) {
  const w = 'deal ' + d.id;
  text(d.name, w + ' name'); text(d.text, w);
  t(d.boon.length > 0, w + ' boon');
  for (const e of d.boon) effectOK(e, w);
  t(d.curse === 'random' || CURSE[d.curse], w + ' curse exists');
}
for (const c of CURSES) { text(c.name, 'curse ' + c.id + ' name'); text(c.text, 'curse ' + c.id); rulesOK(c.rules, 'curse ' + c.id); }
for (const x of TRICKS) {
  const w = 'trick ' + x.id;
  text(x.name, w + ' name'); text(x.text, w);
  t(TRICK_OPS.includes(x.op.type), w + ' op ' + x.op.type);
  t(TRICK_WHEN.includes(x.when), w + ' when');
  t(Number.isFinite(x.price.coins ?? x.price.wick), w + ' price');
}
for (const s of STAKES) {
  const w = 'stake ' + s.id;
  text(s.name, w + ' name'); text(s.text, w);
  t(s.spins >= 1 && s.minDebt >= 1 && s.weight > 0, w + ' numbers');
  for (const e of s.effects) effectOK(e, w);
}
for (const c of CONTRACTS) {
  const w = 'contract ' + c.id;
  text(c.name, w + ' name'); text(c.text, w);
  t(c.debts.every((d, i) => i === 0 || d > c.debts[i - 1]), w + ' debts rise');
  t(c.unlockAfter === null || CONTRACTS.some((o) => o.id === c.unlockAfter), w + ' unlockAfter');
  for (const e of c.rules) effectOK(e, w);
  t(!c.ending || CONFIG.endings.some((e) => e.id === c.ending && e.contract === c.id), w + ' ending');
}
for (const c of CHARS) {
  const w = 'character ' + c.id;
  text(c.name, w + ' name'); text(c.text, w);
  t(c.start.tricks.every((x) => TRICKS.some((y) => y.id === x)) && c.start.charms.every((x) => CHARM[x]), w + ' start items exist');
  rulesOK(c.rules, w);
  t(!c.unlock || ACH[c.unlock.slice(4)]?.reward.char === c.id, w + ' unlock achievement gives this character');
}
for (const h of HIDEOUT) { text(h.name, 'hideout ' + h.id + ' name'); text(h.text, 'hideout ' + h.id); t(HIDE_EFFECTS.includes(h.effect.type), 'hideout effect ' + h.id); }
for (const a of ACHIEVEMENTS) {
  text(a.name, 'achievement ' + a.id + ' name'); text(a.text, 'achievement ' + a.id);
  const stat = a.cond.stat.startsWith('pattern:') ? 'patternsOneSpin' : a.cond.stat;
  t(STATS.includes(stat) && (!a.cond.stat.startsWith('pattern:') || PATTERN_IDS.includes(a.cond.stat.slice(8))), 'achievement stat ' + a.cond.stat);
  t(a.reward.wax || (a.reward.charm && CHARM[a.reward.charm]) || (a.reward.char && CHARS.some((c) => c.id === a.reward.char)), 'achievement reward ' + a.id);
}
for (const b of BENCH) { text(b.name, 'bench ' + b.id + ' name'); text(b.text, 'bench ' + b.id); }
for (const e of CONFIG.endings) t(CONTRACTS.some((c) => c.id === e.contract), 'ending contract ' + e.id);

// ---------- every rule can fire ----------
function stateFor(rules) {
  const run = newRun({ seed: 'content' });
  run.tricks = ['nudge'];
  run.purse = 300;
  run.debt = 1000;
  run.spinsLeft = 1; run.spinInRound = 0;
  for (const r of rules) {
    const c = r.cond || {};
    if (c.heatMin) run.heat = Math.max(run.heat, c.heatMin);
    if (c.heatMax !== undefined) run.heat = Math.min(run.heat, c.heatMax);
    if (c.cursesMin) for (const x of CURSES.slice(0, c.cursesMin)) run.curses.push(x.id);
    if (c.purseMaxPct) run.purse = 0;
  }
  return run;
}
function ctxFor(rule) {
  const c = rule.cond || {};
  const sym = c.sym || (c.group === 'high' ? 'crow' : c.group === 'low' ? 'moth' : c.favoured ? 'moth' : 'moth');
  const n = c.minCells || 3;
  const cells = Array.from({ length: n }, (_, i) => (i < 3 ? i : i + 2));
  const grid = new Array(15).fill('sigil');
  for (const i of cells) grid[i] = sym;
  if (c.countMin) for (let i = 0; i < c.countMin[1]; i++) grid[i + 5] = c.countMin[0];
  const need = Math.max(c.minPatterns || 1, c.distinctMin || 1);
  const ids = ['h3', 'v3', 'd3', 'h4', 'halo', 'corners'];
  const found = Array.from({ length: need }, (_, i) => ({ id: ids[i % ids.length], cells, sym, wisps: 0 }));
  const cell = c.zone === 'midrow' ? 6 : c.zone ? 0 : 3;
  return { grid, favs: c.favoured ? [sym] : ['candle'], sc: { found, steps: [], flat: 0 }, cell, sym, pattern: { id: c.pattern || 'h3', cells, sym, wisps: c.hasWisp ? 1 : 0 }, edits: [], thisMult: 0, amount: 5, roundsLeft: 2, curse: 'jinx', charm: 'moth_jar', trick: 'nudge', deal: 'quick_cash' };
}

function checkHolder(kind, id, rules) {
  const run = stateFor(rules);
  if (kind === 'charm') addCharm(run, id);
  else if (kind === 'curse') run.curses.push(id);
  else { run.char = id; }
  const w = `${kind} ${id}`;
  const pas = rules.filter((r) => r.trigger === 'passive');
  if (pas.length) {
    const strip = (m) => JSON.stringify(m, (k, v) => (k === 'src' || k === 'grid' ? undefined : v));
    let diff = false;
    for (const hot of [false, true]) {
      const mk = (withIt) => {
        const r2 = stateFor(rules);
        if (hot) { r2.heat = 10; for (const x of CURSES.slice(0, 4)) if (x.id !== id) r2.curses.push(x.id); }
        if (kind === 'charm' && withIt) addCharm(r2, id);
        if (kind === 'curse') { r2.curses = r2.curses.filter((x) => x !== id); if (withIt) r2.curses.push(id); }
        if (kind === 'char') r2.char = withIt ? id : 'nim';
        return r2;
      };
      try { if (strip(snapshot(mk(true))) !== strip(snapshot(mk(false)))) diff = true; } catch (e) { t(false, w + ' snapshot throws: ' + e.message); }
    }
    // a copyRight charm alone has nothing to copy (check-core tests it with a neighbour)
    t(diff || kind === 'char' || rules.some((r) => r.effects.some((e) => e.flag === 'copyRight')), w + ' passive changes the snapshot');
  }
  for (const rule of rules) {
    if (rule.trigger === 'passive') continue;
    const ctx = ctxFor(rule);
    const tries = (rule.cond?.every || 1) * (rule.cond?.chance !== undefined ? 400 : 1);
    let fired = 0;
    try {
      for (let i = 0; i < tries && !fired; i++) fired += fire(run, rule.trigger, ctx).filter((e) => e.src.id === id).length;
    } catch (e) { t(false, `${w} ${rule.trigger} throws: ${e.stack.split('\n')[1]} ${e.message}`); continue; }
    t(fired > 0, `${w} ${rule.trigger} fires in a constructed state`);
  }
}
for (const c of CHARMS) checkHolder('charm', c.id, c.rules);
for (const c of CURSES) checkHolder('curse', c.id, c.rules);
for (const c of CHARS) checkHolder('char', c.id, c.rules);

// deals boons, trick ops, stakes, contracts, characters run
for (const d of DEALS) {
  try { const r = newRun({ seed: 'deal' }); r.pool = CHARMS.map((c) => c.id); runEffects(r, { kind: 'deal', id: d.id }, d.boon, {}); snapshot(r); ok++; } catch (e) { t(false, 'deal ' + d.id + ' boon throws ' + e.message); }
}
for (const x of TRICKS) {
  if (x.when === 'auto') continue;
  try {
    const r = newRun({ seed: 'trick' });
    r.tricks = [x.id];
    r.phase = x.when === 'pre' ? 'spin' : x.when === 'shop' ? 'shop' : 'post';
    r.grid = new Array(15).fill('moth'); r.grid[7] = 'ash'; r.grid[8] = 'candle'; r.favs = ['candle']; r.debt = 100; r.spinsLeft = 2;
    const tg = trickTarget(x.id);
    const target = tg === 'col' ? { col: 1 } : tg === 'row' ? { row: 1 } : tg === 'pair' ? { a: 6, b: 7, from: 7, to: 6 } : tg === 'cell' ? { cell: 7 } : tg === 'sym' ? { sym: 'eye' } : {};
    const res = useTrick(r, 0, target);
    t(res.ok, `trick ${x.id} works: ${res.why}`);
  } catch (e) { t(false, 'trick ' + x.id + ' throws ' + e.message); }
}
for (const s of STAKES) {
  try {
    const r = newRun({ seed: 'stake' });
    r.debtIdx = 2; r.debt = 400; r.termsOffer = [s.id];
    pickTerms(r, s.id);
    t(r.spinsLeft >= 1 && r.phase === 'spin', `stake ${s.id} starts a round`);
    spin(r); if (r.phase === 'post') collect(r);
  } catch (e) { t(false, 'stake ' + s.id + ' throws ' + e.message); }
}
for (const c of CONTRACTS) for (const ch of CHARS) {
  try {
    const r = newRun({ seed: 'c', contractId: c.id, charId: ch.id });
    t(r.debt === c.debts[0] || r.debt > 0, `${c.id}/${ch.id} starts`);
    pickTerms(r, termsOffer(r)[0].id);
  } catch (e) { t(false, `${c.id}/${ch.id} throws ${e.message}`); }
}
t(SCORING.length === 9, 'nine scoring symbols');

console.log(`check-content: ${ok} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
