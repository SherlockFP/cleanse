// Content check: every charm, deal, curse, trick, stake, contract, character, hideout piece and
// achievement loads, uses only known primitives and tags, has en/tr/th text, and every charm rule can
// fire in a constructed state without throwing. node scripts/check-content.mjs
import {
  CONFIG, SYM, SCORING, CHARMS, CHARM, DEALS, CURSES, CURSE, TRICKS, STAKES, CONTRACTS, CONTRACT, CHARS, HIDEOUT, ACHIEVEMENTS, ACH, PATTERN_DATA, BENCH, RARITIES,
} from '../src/core/data.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRIGGERS, COND_KEYS, EFFECT_TYPES, FLAGS, PER_KEYS, SYM_TARGETS, snapshot, fire, runEffects, addCharm } from '../src/core/effects.js';
import { newRun, pickTerms, termsOffer, useTrick, trickTarget, spin, collect } from '../src/core/run.js';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'core', 'data');
const RAW = (f, k) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f + '.json'), 'utf8'))[k];
const V2C = RAW('charms', 'charms'), V2U = RAW('curses', 'curses'), V2H = RAW('characters', 'characters'), V2S = RAW('symbols', 'symbols');
let ok = 0, bad = 0;
const t = (cond, msg) => { if (cond) ok++; else { bad++; console.log('FAIL ' + msg); } };
const LANGS = ['en', 'tr', 'th'];
const FAMILIES = CONFIG.families.map((f) => f.id);
const PATTERN_IDS = PATTERN_DATA.map((p) => p.id);
const ALL_SYMS = Object.keys(SYM);
const TRICK_OPS = ['shiftColumn', 'holdColumn', 'respinRow', 'retriggerBest', 'swapAdjacent', 'setCell', 'rerollSymbol', 'spins', 'heat', 'stash', 'luck', 'patMult', 'pickFav', 'copyAdjacent', 'loan', 'muteCurses', 'freeBench', 'saveDeadline'];
const TRICK_WHEN = ['pre', 'post', 'any', 'shop', 'auto'];
const HIDE_EFFECTS = ['none', 'startTrick', 'startCharmPick', 'shopOffers', 'benchOffers', 'foresight', 'keepCharm', 'startWick', 'seededRuns', 'refuseWick'];
const STATS = ['debtsPaid', 'contract', 'reachDebt', 'spinCoins', 'heat10Spins', 'scorches', 'cursesHeld', 'dealsSigned', 'dealsRefused', 'cleanContract', 'interestTotal', 'earlyPays', 'exactChange', 'tricksUsed', 'tricksOneSpin', 'symbolsRemoved', 'wispsOneSpin', 'luckReached', 'favPatterns', 'crownPatterns', 'familyFull', 'charmsBought', 'charmsSold', 'dailyRuns', 'charWins', 'hideout', 'patternsOneSpin', 'coinsEarned', 'fallRise'];

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
const counts = { charms: 124, deals: 24, curses: 16, tricks: 20, stakes: 12, contracts: 10, chars: 6, hideout: 10, achievements: 47 };
t(V2C.length === counts.charms && DEALS.length === counts.deals && V2U.length === counts.curses && TRICKS.length === counts.tricks, 'content counts');
t(STAKES.length === counts.stakes && CONTRACTS.length === counts.contracts && V2H.length === counts.chars && HIDEOUT.length === counts.hideout && ACHIEVEMENTS.length === counts.achievements, 'content counts (2)');
for (const list of [CHARMS, DEALS, CURSES, TRICKS, STAKES, CONTRACTS, CHARS, HIDEOUT, ACHIEVEMENTS, BENCH]) t(new Set(list.map((x) => x.id)).size === list.length, 'unique ids');
for (const s of Object.values(SYM)) text(s.name, 'symbol ' + s.id);
for (const p of PATTERN_DATA) { text(p.name, 'pattern ' + p.id); t(p.cells.every((c) => c.length === p.size), 'pattern size ' + p.id); }

const lockedBy = {};
for (const a of ACHIEVEMENTS) if (a.reward.charm) lockedBy[a.reward.charm] = (lockedBy[a.reward.charm] || 0) + 1;
for (const c of V2C) {
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
for (const c of V2U) { text(c.name, 'curse ' + c.id + ' name'); text(c.text, 'curse ' + c.id); rulesOK(c.rules, 'curse ' + c.id); }
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
for (const c of V2H) {
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
  if (rules.some((r) => r.effects.some((e) => e.per === 'redEyes'))) run.redEyes = 3; // v3: Taillight scales with Red Eyes seen
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

// ---------- v3 content (SPEC sections 3 to 8): data files made by scripts/gen-v2-data.py (scripts/v3/*.py) ----------
// These files are read straight from src/core/data: core's data.js loads them later. Allowed names are the EFFECTS.md lists plus SPEC 3.8.
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'core', 'data');
const ROOT = path.join(DIR, '..', '..', '..');
const V3_NAMES = ['spirits', 'curses_v3', 'charms_v3', 'fusion', 'symbols_v3', 'omens', 'tips', 'calls', 'codex', 'places', 'characters_v3', 'notebook', 'lessons', 'lockers', 'postcards',
  'milestones', 'storm', 'goals', 'endings', 'achievements_v3', 'cart_upgrades', 'stats'];
const D3 = {};
for (const n of V3_NAMES) {
  try { D3[n] = JSON.parse(fs.readFileSync(path.join(DIR, n + '.json'), 'utf8')); ok++; } catch (e) { t(false, `v3 file ${n}.json loads: ${e.message}`); D3[n] = {}; }
}
const A3 = JSON.parse(fs.readFileSync(path.join(ROOT, 'art', 'sheets_v3.json'), 'utf8'));
const A2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'art', 'sheets.json'), 'utf8'));
const ART_IDS = new Set([...A2.sheets.flatMap((s) => s.ids), ...A2.singles.map((s) => s.id), ...A3.sheets.flatMap((s) => s.ids), ...A3.singles.map((s) => s.id)]);

// allowed names
const V3_TRIGGERS = ['onCall', 'onPick', 'onHangUp', 'onVisit', 'onOffering', 'onStage', 'onWrath', 'onRedEye', 'onActivate', 'onFuse'];
const V3_CONDS = ['favour', 'favourMax', 'beadsMin', 'redEyesMin', 'debtMin'];
const V3_EFFECTS = ['favour', 'charge', 'liftCurse', 'loseCharm'];
const V3_FLAGS = ['noPawn', 'heatMax', 'carrySpins', 'trickFree', 'noShopN', 'noBeads', 'noRelic', 'redEyeRate', 'redEyeBless', 'redEyeSoft', 'tinOfferings', 'callCards', 'callRerollFree', 'patronAt', 'noRedEye'];
const V3_PER = ['redEyes', 'beads', 'fused'];
const SPIRIT_IDS = (D3.spirits.spirits || []).map((s) => s.id);
const ALL_TRIG = [...TRIGGERS, ...V3_TRIGGERS], ALL_COND = [...COND_KEYS, ...V3_CONDS], ALL_EFF = [...EFFECT_TYPES, ...V3_EFFECTS], ALL_FLAGS = [...FLAGS, ...V3_FLAGS];
const TRICK_IDS = TRICKS.map((x) => x.id);
const CURSE3 = D3.curses_v3.curses || [];
const CURSE_IDS = new Set([...CURSES.map((c) => c.id), ...CURSE3.map((c) => c.id)]);
const CHARMS3 = D3.charms_v3.charms || [];
const CHARM_IDS = new Set([...CHARMS.map((c) => c.id), ...CHARMS3.map((c) => c.id)]);
const STATS3 = new Set((D3.stats.stats || []).map((x) => x.id).concat(['clear', 'storm', 'lesson']));
const PLACE_IDS = CONTRACTS.map((c) => c.id);
const WHO = [...SPIRIT_IDS, 'visitor', 'rival', 'all'];

function effect3(e, w) {
  t(ALL_EFF.includes(e.type), `${w}: unknown effect ${e.type}`);
  t(!e.per || PER_KEYS.includes(e.per) || V3_PER.includes(e.per) || (e.per.startsWith('family:') && FAMILIES.includes(e.per.slice(7))) || (e.per.startsWith('sym:') && ALL_SYMS.includes(e.per.slice(4))) || (e.per.startsWith('favour:') && SPIRIT_IDS.includes(e.per.slice(7))), `${w}: bad per ${e.per}`);
  t(e.n === undefined || Number.isFinite(e.n), `${w}: n must be a number`);
  t(!e.scope || ['spin', 'round', 'debt'].includes(e.scope), `${w}: bad scope`);
  if (['symValue', 'symMult', 'weight'].includes(e.type)) t(symOK(e.sym), `${w}: bad sym ${e.sym}`);
  if (e.type === 'place') t(ALL_SYMS.includes(e.sym) || e.sym === 'favoured', `${w}: bad place sym`);
  if (e.type === 'patMult') t(['all', 'big', 'this'].includes(e.pattern) || PATTERN_IDS.includes(e.pattern), `${w}: bad pattern ${e.pattern}`);
  if (e.type === 'gainCharm') t(RARITIES.includes(e.rarity) && (!e.family || e.family === 'random' || FAMILIES.includes(e.family)), `${w}: bad gainCharm`);
  if (e.type === 'trick' && e.id) t(TRICK_IDS.includes(e.id), `${w}: unknown trick ${e.id}`);
  if (e.type === 'flag') { t(ALL_FLAGS.includes(e.flag), `${w}: unknown flag ${e.flag}`); t(e.v === undefined || e.v === true || Number.isFinite(e.v), `${w}: flag value`); }
  if (e.type === 'favour') t(Number.isFinite(e.n) && WHO.includes(e.spirit), `${w}: favour target ${e.spirit}`);
  if (e.type === 'loseCharm') t(['best', 'random'].includes(e.pick), `${w}: loseCharm pick`);
}
function cond3(c, w) {
  for (const k of Object.keys(c)) t(ALL_COND.includes(k), `${w}: unknown cond ${k}`);
  const base = Object.fromEntries(Object.entries(c).filter(([k]) => !V3_CONDS.includes(k)));
  condOK(base, w);
  for (const k of ['favour', 'favourMax']) if (c[k]) t(WHO.includes(c[k][0]) && Number.isFinite(c[k][1]), `${w}: cond ${k}`);
  for (const k of ['beadsMin', 'redEyesMin', 'debtMin']) if (c[k] !== undefined) t(Number.isInteger(c[k]) && c[k] > 0, `${w}: cond ${k}`);
}
function rules3(rules, w, allowEmpty = false) {
  t(Array.isArray(rules) && (allowEmpty || rules.length > 0), `${w} has rules`);
  for (const r of rules || []) {
    t(ALL_TRIG.includes(r.trigger), `${w}: unknown trigger ${r.trigger}`);
    cond3(r.cond || {}, w);
    t(Array.isArray(r.effects) && r.effects.length > 0, `${w} rule has effects`);
    for (const e of r.effects) effect3(e, w);
  }
}
const effs3 = (list, w) => { t(Array.isArray(list), `${w} effects list`); for (const e of list || []) effect3(e, w); };

// banned words: gambling (GDD 16, THEME-TH), worship and royal words (SPEC section 0). "charm slot" is fine.
const BAN3 = {
  en: /\b(casino|jackpot|bets?|betting|gambl\w*|wagers?|stakes?|lottery|odds|chips|offerings?|bless\w*|devotion|devoted|worship\w*|pray\w*|holy|sacred|temples?|shrines?|amulets?|monks?|buddha\w*|naga|garuda|incense|kings?|queens?|crowns?|thrones?|royal\w*|palace|gods?|goddess\w*|deity|ghosts?|foretell\w*|prophe\w*|predict\w*|slot machines?)\b/i,
  tr: /\b(kumar\w*|bahis\w*|kazino\w*|jackpot|slot machine|piyango\w*|kutsal\w*|tapınak\w*|tapınma\w*|sunak\w*|adak\w*|dua|dualar\w*|kral\w*|kraliçe\w*|taç|taht|tahtı|saray\w*|keşiş\w*|buda\w*|tanrı\w*|hayalet\w*)\b/i,
  th: /(พนัน|เดิมพัน|คาสิโน|สล็อต|แจ็คพอต|แจ็กพอต|หวย|ลอตเตอรี่|พระพุทธ|พระสงฆ์|ภิกษุ|เจดีย์|โบสถ์|ศาลเจ้า|ศาลพระภูมิ|เครื่องราง|บูชา|สังเวย|ไหว้|บวงสรวง|ถวาย|กษัตริย์|ราชา|ราชินี|มงกุฎ|บัลลังก์|พระราชวัง|โคมลอย|นาค|ครุฑ|ช้างเผือก|ธูป|ศักดิ์สิทธิ์|เทพ|ผี|วิญญาณ|ทำนาย)/,
};
const THAI = /[฀-๿]/;
let triples = 0;
function scan3(node, where) {
  if (Array.isArray(node)) return node.forEach((x, i) => scan3(x, `${where}[${x?.id ?? i}]`));
  if (node && typeof node === 'object') {
    if ('en' in node && 'tr' in node && 'th' in node && typeof node.en === 'string') {
      triples++;
      const toks = (s) => (s.match(/\{[a-z]+(:[\d.]+)?\}/g) || []).sort().join();
      for (const l of LANGS) {
        const v = node[l];
        if (typeof v !== 'string' || !v.trim()) { t(false, `empty ${l} text: ${where}`); continue; }
        t(toks(v) === toks(node.en), `${where}: placeholders differ (${l})`);
        if (BAN3[l].test(v)) t(false, `banned ${l} word in ${where}: ${v.match(BAN3[l])[0]}`);
      }
      if (node.en !== '???') t(THAI.test(node.th), `${where}: th text has no Thai letters`);
      return;
    }
    for (const [k, v] of Object.entries(node)) scan3(v, `${where}.${k}`);
  }
}
for (const n of V3_NAMES) scan3(D3[n], n);
t(triples > 1000, `v3 texts found (${triples})`);
const iconOK = (i, w) => t(!i || ART_IDS.has(i), `${w}: icon ${i} is not in art/sheets.json or art/sheets_v3.json`);

// ---------- art/sheets_v3.json ----------
t(A3.sheets.length <= 14, `sheets_v3 has at most 14 sheets (${A3.sheets.length})`);
const seenArt = new Set(A2.sheets.flatMap((s) => s.ids).concat(A2.singles.map((s) => s.id)));
for (const sh of [...A3.sheets, ...A3.singles]) {
  const ids = sh.ids || [sh.id];
  t(!sh.ids || (sh.subjects.length === sh.ids.length && sh.ids.length <= sh.cols * sh.rows), `sheet ${sh.file}: subjects, ids and grid agree`);
  for (const i of ids) { t(!seenArt.has(i), `art id ${i} is unique`); seenArt.add(i); }
  for (const s of sh.subjects || [sh.subject]) {
    t(typeof s === 'string' && s.length > 10, `art subject text in ${sh.file}`);
    t(!BAN3.en.test(s) && !/\b(sky lantern|spirit house|wai)\b/i.test(s), `art subject has no sacred or royal word: ${s}`);
  }
}

// ---------- spirits ----------
const SPI = D3.spirits.spirits || [];
t(SPI.length === 8 && new Set(SPIRIT_IDS).size === 8, 'eight spirits');
const gifts = SPI.reduce((n, s) => n + s.gifts.length, 0);
t(gifts === 28, `28 gifts (${gifts})`);
t(SPI.filter((s) => s.red && !s.red.deals).length === 6, 'six non-Ruby red calls');
t(SPI.reduce((n, s) => n + s.stages.length, 0) === 24 && SPI.reduce((n, s) => n + s.wrath.length, 0) === 16, '24 stage perks and 16 wraths');
const KINDS = ['meet', 'gift', 'red', 'loved', 'insult', 'noticed', 'friend', 'patron', 'wrath', 'himOrMe', 'omenTpl', 'demand', 'epilogue'];
const TASTES = ['coins', 'caps', 'spice', 'trick', 'charm', 'curse', 'skip'];
const OM3 = D3.omens.omens || [], DM3 = D3.omens.demands || [];
for (const s of SPI) {
  const w = 'spirit ' + s.id;
  text(s.name, w + ' name'); text(s.domain, w + ' domain'); text(s.hint, w + ' hint'); text(s.text.red, w + ' red text');
  const rv = SPI.find((x) => x.id === s.rival);
  t(rv && rv.rival === s.id, `${w}: rival ${s.rival} is symmetric`);
  t(CURSE_IDS.has(s.ownCurse), `${w}: own curse ${s.ownCurse} exists`);
  t(OM3.some((o) => o.id === s.omen && o.spirit === s.id) && DM3.some((d) => d.id === s.demand && d.spirit === s.id), `${w}: omen and demand exist`);
  t(TASTES.every((k) => [2, 1, 0.5, -1].includes(s.taste[k])), `${w}: taste values`);
  t(s.stages.map((x) => x.at).join() === '2,5,8' && s.wrath.map((x) => x.at).join() === '-2,-5', `${w}: stage and wrath lines`);
  for (const st of [...s.stages, ...s.wrath]) { text(st.name, `${w} ${st.id} name`); text(st.text, `${w} ${st.id}`); rules3(st.rules, `${w} ${st.id}`); }
  for (const g of s.gifts) { text(g.name, `${w} ${g.id} name`); text(g.text, `${w} ${g.id}`); effs3(g.effects, `${w} ${g.id}`); iconOK(g.icon, `${w} ${g.id}`); }
  if (s.red && !s.red.deals) { const r = s.red; text(r.name, w + ' red name'); text(r.text, w + ' red'); effs3(r.boon, w + ' red'); effs3(r.carry, w + ' red carry'); iconOK(r.icon, w + ' red'); t(!r.curse || CURSE_IDS.has(r.curse), `${w}: red curse exists`); if (r.due) { t(r.due.rounds > 0, `${w}: due rounds`); effs3(r.due.else, w + ' due'); } }
  if (s.id === 'waiting') { t(s.red === null && s.white.length === 3, 'waiting has white cards and no red'); for (const c of s.white) { text(c.name, 'white name'); text(c.text, 'white ' + c.id); effs3(c.effects, 'white ' + c.id); iconOK(c.icon, 'white ' + c.id); } }
  for (const m of ['calm', 'glad', 'cross']) iconOK(s.portrait[m], `${w} portrait`);
  t(KINDS.every((k) => s.lines[k]), `${w}: 13 lines`);
  for (const k of KINDS) { text(s.lines[k], `${w} line ${k}`); if (k === 'omenTpl') t(LANGS.every((l) => s.lines[k][l].includes('{v}')), `${w}: omenTpl has {v}`); }
  t(s.local.every((c) => PLACE_IDS.includes(c)), `${w}: local places`);
  t(s.unlock.start === true || PLACE_IDS.includes(s.unlock.c), `${w}: unlock is {start} or {c: place}`);
}
t(SPI.find((s) => s.id === 'brimble')?.gifts.length === 0, 'Ruby has no gifts (always red)');
t(D3.calls.hangUpFavour.brimble === 0, 'hanging up on Ruby costs no Favour (Review: Wrath vs interest)');
t(D3.calls.beads.lightsWhen === 'hangUpAfterOpeningRedSheet', 'beads light only after a red sheet was opened (Review: free beads)');
for (const o of OM3) { text(o.name, 'omen ' + o.id); text(o.text, 'omen ' + o.id + ' text'); }
for (const d of DM3) { text(d.name, 'demand ' + d.id); text(d.text, 'demand ' + d.id + ' text'); effs3(d.reward.effects, 'demand ' + d.id); t(d.reward.favour === 3 && d.fail.favour === (d.spirit === 'brimble' ? -2 : -1), `demand ${d.id}: favour numbers`); }
t(OM3.length === 8 && DM3.length === 8, 'eight omens and eight demands');

// curses_v3
t(CURSE3.length === 6, 'six new curses');
for (const c of CURSE3) { text(c.name, 'curse ' + c.id + ' name'); text(c.text, 'curse ' + c.id); rules3(c.rules, 'curse ' + c.id); iconOK(c.icon, 'curse ' + c.id); t(!V2U.some((x) => x.id === c.id), `curse ${c.id} is new`); }

// ---------- charms_v3, fusion, symbol ----------
t(CHARMS3.length === 48 && CHARMS3.filter((c) => c.tags.includes('active')).length === 16 && CHARMS3.filter((c) => c.tags.includes('redeye')).length === 8 && CHARMS3.filter((c) => c.rarity === 'fused').length === 24, '48 charms: 16 active, 8 Red Eye, 24 fused');
t(new Set([...V2C.map((c) => c.id), ...CHARMS3.map((c) => c.id)]).size === V2C.length + 48, 'v3 charm ids are new and unique');
const NB3 = D3.notebook.nodes || [];
for (const c of CHARMS3) {
  const w = 'charm ' + c.id;
  text(c.name, w + ' name'); text(c.text, w); iconOK(c.icon, w); rules3(c.rules, w);
  t(FAMILIES.includes(c.family) && c.tags[0] === c.family && c.tags.every((x) => FAMILIES.includes(x) || ['active', 'redeye', 'fused'].includes(x)), `${w}: tags`);
  t([...RARITIES, 'fused'].includes(c.rarity) && Number.isFinite(c.price.coins ?? c.price.wick), `${w}: rarity and price`);
  if (c.tags.includes('active')) { t(c.active && [1, 2, 3].includes(c.active.need) && c.rules.some((r) => r.trigger === 'onActivate'), `${w}: active needs charges and an onActivate rule`); }
  if (c.tags.includes('redeye')) t(c.family === 'hex', `${w}: Red Eye charms are family hex`);
  if (c.unlock && c.unlock.startsWith('pool:')) t(NB3.some((n) => n.effect.type === 'poolAdd' && n.effect.rarity === c.unlock.slice(5) && n.effect.rarity === c.rarity), `${w}: a Notebook cabinet opens ${c.rarity} charms`);
  else t(c.rarity === 'fused' ? c.unlock === 'blend' && c.buyable === false : !c.unlock, `${w}: unlock`);
  if (c.unlock) text(c.unlockText, w + ' unlockText');
}
const FU = D3.fusion;
t(FU.recipes.length === 24 && new Set(FU.recipes.map((r) => [r.a, r.b].sort().join('+'))).size === 24, '24 distinct recipe pairs');
t(new Set(FU.recipes.map((r) => r.out)).size === 24, 'recipe outputs are distinct');
for (const r of FU.recipes) {
  const o = CHARMS3.find((c) => c.id === r.out);
  t(FAMILIES.includes(r.a) && FAMILIES.includes(r.b) && r.a !== r.b && o && o.rarity === 'fused' && o.fused.join() === [r.a, r.b].join(), `recipe ${r.a}+${r.b}: output exists and is fused from the pair`);
}
t(FU.same.cost.common === 2 && FU.same.cost.uncommon === 3 && FU.same.cost.rare === 4 && FU.recipeCost === 5, 'blend costs 2/3/4 and 5');
const RE = (D3.symbols_v3.symbols || [])[0];
t(RE && RE.id === 'redeye' && !V2S.some((x) => x.id === 'redeye'), 'redeye symbol is new'); if (RE) { text(RE.name, 'redeye name'); text(RE.text, 'redeye text'); iconOK(RE.icon, 'redeye'); }

// ---------- places, characters, tips, calls, codex ----------
const PL = D3.places.places || [];
t(PL.length === 10, 'ten places');
const RANK_EN = ['Street Kid', 'Tray Hawker', 'Stall Owner', 'Shop Owner', 'Wholesaler', 'Shophouse Owner', 'Club Partner', 'Boutique Owner', 'Developer', 'Tycoon'];
PL.forEach((p, i) => {
  const c = CONTRACT[p.contract], w = 'place ' + p.id;
  t(c && p.debts === c.debts.length && p.nights === c.rounds, `${w}: debts and nights equal the contract (${p.debts}/${p.nights})`);
  t(p.rank.name.en === RANK_EN[i], `${w}: rank order`); text(p.rank.name, w + ' rank'); text(p.name, w + ' name'); text(p.home, w + ' home');
  t(p.card.length === 3, `${w}: 3 card lines`); p.card.forEach((l, j) => text(l, `${w} card ${j}`));
  iconOK(p.icon, w); iconOK(p.bg, w); iconOK(p.homeBg, w);
  t(p.local.length >= 1 && p.local.every((s) => SPIRIT_IDS.includes(s)) && p.spiritsOnEnter.every((s) => SPIRIT_IDS.includes(s)), `${w}: spirits exist`);
  t(Number.isFinite(p.firstClear.stash) && p.firstClear.keys.brass === 1, `${w}: first clear reward`);
});
t(D3.places.stamps.length === 3, 'three stamps');
const CH3 = D3.characters_v3.characters || [];
t(CH3.length === 4 && CH3.every((c) => !V2H.some((x) => x.id === c.id)), 'four new characters');
for (const c of CH3) { const w = 'character ' + c.id; text(c.name, w + ' name'); text(c.text, w); rules3(c.rules, w); iconOK(c.icon, w); t(c.start.tricks.every((x) => TRICK_IDS.includes(x)), `${w}: start tricks`); t(SPIRIT_IDS.includes(c.tie.spirit), `${w}: tie`); t(c.unlock === 'ach:crew_' + c.id && ACH['crew_' + c.id]?.reward.char === c.id, `${w}: unlocked by achievement crew_${c.id}`); t(c.rules.some((r) => r.effects.some((e) => e.type === 'favour')), `${w}: starts with Favour`); }
const TP = D3.tips;
t(TP.kinds.length === 7 && TP.sizes.length === 3 && TP.taste.length === 4, 'tips: 7 kinds, 3 sizes, 4 tastes');
for (const k of TP.kinds) { iconOK(k.icon, 'tip ' + k.id); t(TP.table[k.id] && TP.label[k.id], `tip ${k.id}: table and label`); }
t(TP.table.coins.small === 4 && TP.table.coins.medium === 10 && TP.table.coins.large === 25 && TP.sizes.map((s) => s.favour).join() === '1,3,6', 'tips numbers match SPEC 3.3');
for (const x of TP.taste) iconOK(x.icon, 'taste ' + x.id);
const CA = D3.calls;
t(CA.cards === 3 && CA.cardsMax === 4 && CA.beads.max === 3 && CA.whiteCall.cards.length === 3, 'calls numbers');
for (const k of Object.keys(CA.colours)) iconOK(CA.colours[k].icon, 'call colour ' + k);
const CX = D3.codex;
t(CX.tabs.length === 7 && CX.pages.length === 80, 'codex: 7 tabs and 80 neighbour pages');
for (const s of SPIRIT_IDS) t(CX.pages.filter((p) => p.spirit === s).map((p) => p.n).join() === '1,2,3,4,5,6,7,8,9,10', `codex pages of ${s}`);
iconOK(CX.redEye.icon, 'codex red eye');

// ---------- Notebook, lockers, postcards ----------
const NB_TYPES = ['startTrick', 'startCharmPick', 'shopOffers', 'benchOffers', 'startWick', 'postcardSlots', 'flag', 'poolAdd', 'none']; // what core/meta.js hideoutEffects and buyNode read
const LESSONS3 = D3.lessons.lessons || [];
function reqOK(r, req, w) {
  // the shapes of src/core/progress.js: {clear} {lesson} {lessons} {stat, gte} {stamps, kind?} {lockers} {storm}
  const keys = r ? Object.keys(r) : [];
  const shape = ['clear', 'lesson', 'lessons', 'stat', 'stamps', 'lockers', 'storm'].find((k) => keys.includes(k));
  t(!!shape, `${w}: requirement shape ${JSON.stringify(r)}`);
  if (shape === 'stat') t(STATS3.has(r.stat) && Number.isFinite(r.gte) && r.gte >= 1, `${w}: known stat ${r.stat}`);
  if (shape === 'clear') t(PLACE_IDS.includes(r.clear), `${w}: place ${r.clear}`);
  if (shape === 'lesson') t(LESSONS3.some((l) => l.id === r.lesson), `${w}: lesson ${r.lesson}`);
  if (['lessons', 'lockers'].includes(shape)) t(Number.isInteger(r[shape]) && r[shape] >= 1, `${w}: ${shape} count`);
  if (shape === 'storm') t(r.storm >= 1 && r.storm <= 10, `${w}: storm level`);
  if (shape === 'stamps') t(r.stamps >= 1 && (!r.kind || ['bronze', 'silver', 'gold'].includes(r.kind)), `${w}: stamps`);
  if (req) text(req, w + ' reqText');
}
t(NB3.length >= 40 && new Set(NB3.map((n) => n.id)).size === NB3.length, `Notebook has ${NB3.length} unique entries`);
t(D3.notebook.tabs.length === 5, 'five Notebook tabs');
for (const n of NB3) {
  const w = 'notebook ' + n.id;
  text(n.name, w + ' name'); text(n.text, w); text(n.reqText, w + ' reqText');
  t(D3.notebook.tabs.some((x) => x.id === n.tab) && Number.isFinite(n.cost) && n.cost >= 0, `${w}: tab and cost`);
  t(NB_TYPES.includes(n.effect.type), `${w}: effect type ${n.effect.type}`);
  if (n.requires) reqOK(n.requires, null, w);
  if (n.effect.type === 'flag') t(V3_FLAGS.includes(n.effect.flag) || FLAGS.includes(n.effect.flag), `${w}: flag ${n.effect.flag}`);
  if (n.effect.type === 'poolAdd') t(RARITIES.includes(n.effect.rarity) && n.effect.n >= 1, `${w}: poolAdd`);
  if (n.effect.packs) t(n.effect.packs.every((i) => (D3.postcards.postcards || []).some((p) => p.id === i)), `${w}: packs are postcards`);
  if (n.effect.char) t(CHARS.some((c) => c.id === n.effect.char), `${w}: character exists`);
}
t(NB3.filter((n) => n.tab === 'crew').length === 10 && NB3.filter((n) => n.tab === 'home').length === 10, 'Notebook: 10 crew, 10 home');
t((D3.spirits.devotion || []).length === 3 && D3.spirits.devotion.every((d) => d.cost > 0), 'three Friendship tiers in spirits.json');
for (const d of D3.spirits.devotion || []) { text(d.text, 'devotion text'); text(d.reqText, 'devotion req'); }
const LK3 = D3.lockers.lockers || [], LG3 = D3.lockers.luggage || [];
t(LK3.length === 20 && LG3.length === 4 && D3.lockers.keys.length === 3, '20 lockers, 4 Left Luggage, 3 keys');
const lockedIds = V2C.filter((c) => c.unlock).map((c) => c.id);
const inLockers = LK3.flatMap((l) => l.contents.charms || []);
t(inLockers.length === 30 && new Set(inLockers).size === 30 && lockedIds.length === 30 && lockedIds.every((i) => inLockers.includes(i)), 'lockers hold the 30 locked charms exactly once');
const PC3 = D3.postcards.postcards || [];
for (const l of LK3) {
  const w = 'locker ' + l.n; text(l.name, w); text(l.hint, w + ' hint'); text(l.reqText, w + ' reqText'); t(['brass', 'silver', 'red'].includes(l.key), `${w}: key`);
  if (l.requires) reqOK(l.requires, null, w);
  if (l.contents.postcards) t(l.contents.postcards.length === 6 && l.contents.postcards.every((i) => PC3.some((p) => p.id === i)), `${w}: postcards exist`);
  t(!!(l.contents.charms || l.contents.postcards || l.contents.deed), `${w}: contents`);
}
for (const k of D3.lockers.keys) { text(k.name, 'key ' + k.id); text(k.sources, 'key ' + k.id + ' sources'); iconOK(k.icon, 'key ' + k.id); }
for (const g of LG3) { text(g.name, g.id); iconOK(g.icon, g.id); reqOK({ stat: g.requires.stat, gte: g.requires.gte }, g.reqText, g.id); }
t(PC3.length === 18 && [1, 2, 3].every((p) => PC3.filter((x) => x.pack === p).length === 6), '18 postcards, 6 per pack');
const ENGINES = ['omenEarly', 'blenderFromDebt1', 'callRerollDouble', 'noCalls', 'fullCharge', 'noPayNow'];
const lockedPostcards = new Set(LK3.flatMap((l) => l.contents.postcards || []));
for (const p of PC3) {
  const w = 'postcard ' + p.id; text(p.name, w + ' name'); text(p.gain, w + ' gain'); text(p.cost, w + ' cost'); iconOK(p.icon, w); iconOK(p.back, w);
  rules3(p.gainRules, w + ' gain', true); rules3(p.costRules, w + ' cost', true);
  t(JSON.stringify(p.rules) === JSON.stringify([...p.gainRules, ...p.costRules]), `${w}: rules is gain then cost`);
  t(p.engine === undefined || ENGINES.includes(p.engine), `${w}: engine ${p.engine}`);
  t(p.gainRules.length + p.costRules.length > 0 || p.engine, `${w}: has rules or an engine tag`);
  t(p.pack === 1 || lockedPostcards.has(p.id), `${w}: packs II and III sit in lockers`);
}

// ---------- lessons, milestones, Storm, goals, endings, achievements, cart upgrades ----------
t(LESSONS3.length === 13 && LESSONS3.every((l, i) => l.id === i + 1), '13 lessons with numeric ids 1 to 13');
for (const l of LESSONS3) { const w = 'lesson ' + l.id; text(l.name, w); text(l.goal, w + ' goal'); text(l.reqText, w + ' reqText'); text(l.why, w + ' why'); text(l.firstTimeLine, w + ' first-time'); t(Number.isFinite(l.reward.stash) && !l.reward.key, `${w}: stash only (core grants the keys)`); t(l.cond && Number.isFinite(l.cond.gte) && (STATS3.has(l.cond.stat) || l.cond.stat === 'pattern:h4'), `${w}: stat ${l.cond?.stat}`); }
const MS3 = D3.milestones.milestones || [];
t(MS3.length === 14, '14 milestones');
for (const m of MS3) { text(m.name, m.id); text(m.home, m.id + ' home'); reqOK(m.requires, m.reqText, m.id); }
const ST3 = D3.storm.storms || [];
const ST_ENGINE = ['dealHarsher', 'tinClosedFirstNight', 'redEyeFromDebt', 'bossEveryThird', 'wrathAt'];
t(ST3.length === 10, 'ten Storm levels');
ST3.forEach((s, i) => { text(s.name, 'storm ' + (i + 1)); text(s.text, 'storm ' + (i + 1) + ' text'); rules3(s.rules, 'storm ' + (i + 1), true); t(Object.keys(s.engine).every((k) => ST_ENGINE.includes(k)), `storm ${i + 1}: engine keys`); t(s.n === i + 1 && s.id === 'storm_' + (i + 1), `storm ${i + 1}: n and id`); t(s.rules.length > 0 || Object.keys(s.engine).length > 0, `storm ${i + 1}: has a rule`); reqOK(s.requires, s.reqText, 'storm ' + (i + 1)); });
const GL3 = D3.goals;
t(GL3.daily.length === 30 && GL3.weekly.length === 20, '30 daily and 20 weekly goals');
for (const g of [...GL3.daily, ...GL3.weekly]) { text(g.text, 'goal ' + g.id); t(Number.isFinite(g.n) && g.n >= 1, `goal ${g.id}: n`); }
const EN3 = D3.endings.endings;
t(EN3.length === 5 && EN3.filter((e) => !e.existing).length === 2, 'five endings, two new');
for (const e of EN3) { if (!e.existing) { text(e.name, 'ending ' + e.id); text(e.text, 'ending ' + e.id + ' text'); iconOK(e.art, 'ending ' + e.id); } }
t(CONFIG.endings.every((e) => EN3.some((x) => x.id === e.id)), 'v2 endings are kept');
const AC3 = D3.achievements_v3.achievements || [];
t(AC3.length === 20 && new Set(AC3.map((a) => a.id)).size === 20 && AC3.every((a) => !ACH[a.id]), '20 new achievements');
for (const a of AC3) { text(a.name, 'achievement ' + a.id); text(a.text, 'achievement ' + a.id + ' text'); t(STATS3.has(a.cond.stat) && a.cond.gte >= 1, `achievement ${a.id}: core stat ${a.cond.stat}`); t(Number.isFinite(a.reward.stash), `achievement ${a.id}: reward`); }
const UP3 = D3.cart_upgrades.upgrades || [];
t(UP3.length === 21 && D3.cart_upgrades.offers === 2, '21 cart upgrades (12 shapes, 9 symbols), 2 per stall');
for (const u of UP3) { const w = 'cart upgrade ' + u.id; text(u.name, w + ' name'); text(u.text, w); effs3(u.effects, w); iconOK(u.icon, w); t(['patMult', 'weight'].includes(u.effects[0].type) && Number.isFinite(u.price.coins) && u.minDebt >= 1, `${w}: only patMult or weight, priced`); }
t(PATTERN_IDS.every((p) => UP3.some((u) => u.effects[0].pattern === p)), 'every pattern has an upgrade');
for (const s of SCORING) t(UP3.some((u) => u.effects[0].sym === s), `symbol ${s} has an upgrade`);

console.log(`check-content: ${ok} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
