// The effect language (docs/v2/EFFECTS.md). The only interpreter of rules.
import { SYM, SCORING, RARITIES, CHARM, CHARMS, CURSE, CURSES, CHAR, CONTRACT, STAKE, TRICKS, CONFIG } from './data.js';
import { stream } from './streams.js';
import { findPatterns, PATTERN } from './patterns.js';

export const TRIGGERS = ['passive', 'now', 'onRunStart', 'onDebtStart', 'onRoundStart', 'onSpinStart', 'onSymbolLand', 'onPattern', 'onSpinEnd', 'onDud', 'onScorch', 'onStoke', 'onRoundEnd', 'onInterest', 'onBank', 'onDebtPaid', 'onBuy', 'onSell', 'onSellSelf', 'onReroll', 'onTrick', 'onDeal', 'onRefuse', 'onCurse'];
export const COND_KEYS = ['sym', 'group', 'zone', 'pattern', 'minCells', 'hasWisp', 'favoured', 'minPatterns', 'distinctMin', 'heatMin', 'heatMax', 'cursesMin', 'spinIs', 'countMin', 'roundsLeftMin', 'purseMaxPct', 'slotIs', 'firstRound', 'every', 'chance', 'limit'];
export const EFFECT_TYPES = ['coins', 'symValue', 'symMult', 'patMult', 'allMult', 'luck', 'spins', 'interest', 'wick', 'heat', 'weight', 'transform', 'place', 'retrigger', 'trick', 'stack', 'slot', 'gainCharm', 'gainCurse', 'removeSymbol', 'flag'];
export const FLAGS = ['heatStep', 'heatNoCool', 'heatFloor', 'startHeat', 'noStoke', 'scorchNeeds', 'scorchBurn', 'ashBase', 'deadCentre', 'ashIsFav', 'seeNextFav', 'pickFirstFav', 'twoFavs', 'favPerRound', 'pickFav', 'hideFav', 'fiveNeedsFour', 'maskWild', 'smallHalf', 'smallDead', 'bigX', 'firstSpinDead', 'lastTwice', 'noInterest', 'noInterestRound', 'interestHalf', 'interestCapX', 'bankX', 'shopDiscount', 'shopMarkup', 'shopOffers', 'shopExtra', 'rerollDouble', 'benchDiscount', 'sellFull', 'trickPockets', 'firstTrickFree', 'dealOffers', 'mustSign', 'refuseWick', 'cancelCurse', 'saveDeadline', 'extraLife', 'roundsAdd', 'rounds', 'debtCut', 'debtMul', 'spinsRound', 'spinsLess', 'startCurses', 'ghostHire', 'copyRight', 'freeRedraw', 'freeReroll'];
export const PER_KEYS = ['curses', 'heat', 'emptySlots', 'tricks', 'deals', 'stack', 'removed', 'purse100'];
export const SYM_TARGETS = ['all', 'low', 'mid', 'high', 'favoured', 'that', 'random'];

const MOD_TYPES = new Set(['luck', 'interest', 'symValue', 'symMult', 'patMult', 'allMult', 'weight', 'flag', 'slot']);
const SUM_FLAGS = new Set(['shopDiscount', 'shopMarkup', 'trickPockets', 'spinsRound', 'roundsAdd', 'debtMul', 'spinsLess', 'startCurses', 'benchDiscount', 'refuseWick', 'freeRedraw', 'freeReroll']);
const MAX_FLAGS = new Set(['scorchNeeds', 'heatFloor', 'dealOffers', 'interestCapX']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let EXPLAIN = true;
export const setExplain = (on) => { EXPLAIN = !!on; };
export const isModType = (t) => MOD_TYPES.has(t);
export const scaleOf = (run) => CONFIG.priceScale[Math.min(run.debtIdx, CONFIG.priceScale.length - 1)];
// Flat coin effects grow slower than prices (S^0.75), so late debts are not won by a pile of flat-coin charms.
export const coinScaleOf = (run) => scaleOf(run) ** 0.75;
// The named boss rule of the current debt (contracts.json bosses -> config.json bosses), or null.
export const bossOf = (run) => {
  const b = CONTRACT[run.contract].bosses?.find((x) => x.debt === run.debtIdx);
  return b ? CONFIG.bosses.find((x) => x.id === b.boss) : null;
};
// Rules a held charm runs: a copyRight charm runs the rules of its right neighbour instead (never another copier's).
const copies = (rules) => rules.some((r) => r.effects.some((e) => e.flag === 'copyRight'));
export function rulesAt(run, i) {
  const own = CHARM[run.charms[i].id].rules;
  if (!copies(own)) return own;
  const nb = run.charms[i + 1];
  return nb && !copies(CHARM[nb.id].rules) ? CHARM[nb.id].rules : [];
}
const srcRef = (s) => ({ kind: s.kind, id: s.id });
const muted = (run) => run.temp.some((t) => t.rec.flag === 'muteCurses');

// ---------- snapshot ----------

function setFlag(mods, name, v) {
  v = v === undefined ? true : v;
  const f = mods.flags;
  if (SUM_FLAGS.has(name)) f[name] = (f[name] || 0) + v;
  else if (MAX_FLAGS.has(name)) f[name] = Math.max(f[name] || 0, v);
  else f[name] = v;
}

function addRec(mods, r, src) {
  const rec = { ...r, src };
  switch (r.type) {
    case 'luck': mods.luck += r.n; break;
    case 'interest': mods.interest += r.n; break;
    case 'slot': mods.slotMod += r.n; break;
    case 'allMult': mods.allMult.push(rec); break;
    case 'symValue': mods.symValue.push(rec); break;
    case 'symMult': mods.symMult.push(rec); break;
    case 'patMult': mods.patMult.push(rec); break;
    case 'weight': mods.weight.push(rec); break;
    case 'flag': setFlag(mods, r.flag, r.v); break;
  }
}

function perCount(run, per, ctx, src) {
  if (!per) return 1;
  if (per.startsWith('family:')) {
    const fam = per.slice(7);
    return run.charms.filter((c) => CHARM[c.id].tags.includes(fam)).length;
  }
  if (per.startsWith('sym:')) {
    const g = ctx.grid || run.grid;
    return g ? g.filter((s) => s === per.slice(4)).length : 0;
  }
  switch (per) {
    case 'curses': return run.curses.length;
    case 'heat': return run.heat;
    case 'emptySlots': return Math.max(0, slotsOf(run) - run.charms.length);
    case 'tricks': return run.tricks.length;
    case 'deals': return run.deals.length;
    case 'stack': return src?.inst?.stack || 0;
    case 'removed': return run.removed.length;
    case 'purse100': return Math.min(10, Math.floor(run.purse / (100 * coinScaleOf(run))));
  }
  return 1;
}
const amountOf = (run, e, ctx, src) => (e.n ?? 1) * perCount(run, e.per, ctx, src);

export function snapshot(run, grid = null, favs = run.favs) {
  const mods = { luck: 0, interest: 0, slotMod: 0, flags: {}, symValue: [], symMult: [], patMult: [], weight: [], allMult: [], favs: favs || [], grid };
  const cx = { grid, favs };
  const flat = (list, src) => { for (const e of list) if (MOD_TYPES.has(e.type)) addRec(mods, { ...e, n: amountOf(run, e, cx, src) }, srcRef(src)); };
  const rules = (list, src) => {
    list.forEach((rule, ri) => {
      if (rule.trigger === 'passive' && checkCond(run, rule, cx, src, ri, false)) flat(rule.effects, src);
    });
  };
  const contract = { kind: 'contract', id: run.contract };
  flat(CONTRACT[run.contract].rules, contract);
  const boss = bossOf(run);
  if (boss) flat(boss.effects, { kind: 'boss', id: boss.id });
  const up = CONFIG.symValueUpAtDebt.filter((d) => run.debtIdx >= d).length;
  if (up) addRec(mods, { type: 'symValue', n: up, sym: 'all' }, contract);
  rules(CHAR[run.char].rules, { kind: 'char', id: run.char });
  if (!muted(run)) for (const id of run.curses) rules(CURSE[id].rules, { kind: 'curse', id });
  if (run.terms) flat(STAKE[run.terms].effects, { kind: 'terms', id: run.terms });
  for (const sym in run.bench) {
    const b = run.bench[sym];
    const src = { kind: 'bench', id: sym };
    if (b.value) addRec(mods, { type: 'symValue', n: b.value, sym }, src);
    if (b.mult) addRec(mods, { type: 'symMult', n: b.mult, sym }, src);
    if (b.weight && b.weight !== 1) addRec(mods, { type: 'weight', n: b.weight, sym }, src);
  }
  for (const r of run.perm) addRec(mods, r, r.src);
  run.charms.forEach((inst, i) => rules(rulesAt(run, i), { kind: 'charm', id: inst.id, inst }));
  for (const t of run.temp) addRec(mods, t.rec, t.rec.src);
  return mods;
}

export const flag = (mods, name) => mods.flags[name];
export const luckOf = (run, mods) => clamp(CONFIG.luck.base + mods.luck + (run.pity || 0), 0, CONFIG.luck.cap);
export const slotsOf = (run, mods = snapshot(run)) => clamp(run.slots + mods.slotMod, 1, CONFIG.start.charmSlotsMax);
export const pocketsOf = (run, mods = snapshot(run)) => run.pockets + (mods.flags.trickPockets || 0);

const symMatch = (s, id, favs) =>
  s === id || (s === 'all' && SYM[id].kind === 'score') || ((s === 'low' || s === 'mid' || s === 'high') && SYM[id].group === s) || (s === 'favoured' && favs.includes(id));

export function symValueOf(mods, id, skip) {
  let v = SYM[id].value;
  for (const r of mods.symValue) if (r !== skip && symMatch(r.sym, id, mods.favs)) v += r.n;
  return Math.max(0, v);
}
export function symMultOf(mods, id, skip) {
  let v = 1;
  for (const r of mods.symMult) if (r !== skip && symMatch(r.sym, id, mods.favs)) v += r.n;
  return Math.max(0, v);
}
export function weightOf(mods, id) {
  let w = 1;
  for (const r of mods.weight) if (symMatch(r.sym, id, mods.favs)) w *= r.n;
  return w;
}
function patMultOf(mods, pat, skip) {
  let v = PATTERN[pat.id].mult;
  for (const r of mods.patMult) if (r !== skip && (r.pattern === 'all' || r.pattern === pat.id || (r.pattern === 'big' && pat.cells.length >= 5))) v += r.n;
  return v;
}

// ---------- conditions ----------

const storeOf = (run, src) => (src.inst ? src.inst.counters : (run.counters[src.kind + ':' + src.id] ??= {}));
const countSym = (grid, s) => (grid ? grid.filter((x) => x === s).length : 0);

export function checkCond(run, rule, ctx = {}, src = null, ri = 0, commit = false) {
  const c = rule.cond || {};
  const grid = ctx.grid || run.grid;
  const sym = ctx.sym ?? ctx.pattern?.sym;
  const found = ctx.sc?.found || [];
  for (const k in c) {
    const v = c[k];
    switch (k) {
      case 'sym': if (sym !== v) return false; break;
      case 'group': if (!sym || SYM[sym].group !== v) return false; break;
      case 'zone': {
        const x = ctx.cell;
        if (x === undefined) return false;
        const ok = v === 'corner' ? x === 0 || x === 4 || x === 10 || x === 14 : v === 'edge' ? x % 5 === 0 || x % 5 === 4 : x >= 5 && x <= 9;
        if (!ok) return false;
        break;
      }
      case 'pattern': if (ctx.pattern?.id !== v) return false; break;
      case 'minCells': if (!ctx.pattern || ctx.pattern.cells.length < v) return false; break;
      case 'hasWisp': if (!ctx.pattern || !(ctx.pattern.wisps > 0)) return false; break;
      case 'favoured': if (!sym || !(ctx.favs || run.favs).includes(sym)) return false; break;
      case 'minPatterns': if (found.length < v) return false; break;
      case 'distinctMin': if (new Set(found.map((p) => p.id)).size < v) return false; break;
      case 'heatMin': if (run.heat < v) return false; break;
      case 'heatMax': if (run.heat > v) return false; break;
      case 'cursesMin': if (run.curses.length < v) return false; break;
      case 'spinIs': if (v === 'first' ? run.spinInRound !== 0 : run.spinsLeft !== 1) return false; break;
      case 'countMin': if (countSym(grid, v[0]) < v[1]) return false; break;
      case 'roundsLeftMin': if ((ctx.roundsLeft ?? 0) < v) return false; break;
      case 'purseMaxPct': if (run.purse * 100 > v * run.debt) return false; break;
      case 'slotIs': {
        const i = src?.inst ? run.charms.indexOf(src.inst) : -1;
        if (i < 0 || i !== (v === 'first' ? 0 : run.charms.length - 1)) return false;
        break;
      }
      case 'firstRound': if (run.round !== 0) return false; break;
    }
  }
  if (!commit) return true;
  const st = src ? storeOf(run, src) : {};
  const lk = c.limit ? 'l' + c.limit[0] + ri : null;
  const cur = c.limit === 'round' ? run.roundSerial : run.debtIdx + 1;
  if (lk && st[lk] === cur) return false;
  if (c.every) {
    st['e' + ri] = (st['e' + ri] || 0) + 1;
    if (st['e' + ri] % c.every !== 0) return false;
  }
  if (c.chance !== undefined && stream(run, 'fx').next() * 100 >= c.chance) return false;
  if (lk) st[lk] = cur;
  return true;
}

// ---------- effects ----------

function pickScoring(run) {
  return stream(run, 'fx').pick(SCORING);
}

export function setHeat(run, v, mods = null) {
  const floor = (mods || snapshot(run)).flags.heatFloor || 0;
  run.heat = clamp(v, floor, CONFIG.heat.max);
}

export function addTrick(run, id = null) {
  if (run.tricks.length >= pocketsOf(run)) return false;
  const pool = TRICKS.filter((t) => t.when !== 'shop' && t.id !== 'loan_note');
  run.tricks.push(id || stream(run, 'fx').pick(pool).id);
  return true;
}

export function addCharm(run, id) {
  if (run.charms.some((c) => c.id === id)) return false;
  run.charms.push({ id, stack: 0, counters: {} });
  if (!run.seen.includes(id)) run.seen.push(id);
  const fam = Math.max(...CHARM[id].tags.map((t) => run.charms.filter((c) => CHARM[c.id].tags.includes(t)).length));
  run.stats.familyFull = Math.max(run.stats.familyFull || 0, fam);
  return true;
}
export function burnCharm(run, i) {
  return run.charms.splice(i, 1)[0];
}

// Gives a random pool charm of the rarity, stepping down a rarity when the pool has none (rare and
// legendary charms are all locked behind achievements at the start).
export function gainCharm(run, rarity) {
  const owned = new Set(run.charms.map((c) => c.id).concat(run.waiting));
  for (let r = RARITIES.indexOf(rarity); r >= 0; r--) {
    const list = CHARMS.filter((c) => c.rarity === RARITIES[r] && run.pool.includes(c.id) && !owned.has(c.id));
    if (!list.length) continue;
    const id = stream(run, 'fx').pick(list).id;
    if (run.charms.length < slotsOf(run)) addCharm(run, id);
    else run.waiting.push(id);
    return id;
  }
  return null;
}

export function addCurse(run, id = 'random') {
  const rng = stream(run, 'deal');
  if (id === 'random') {
    const free = CURSES.filter((c) => !run.curses.includes(c.id));
    if (!free.length) return null;
    id = rng.pick(free).id;
  } else if (run.curses.includes(id)) return null;
  const ctx = { curse: id };
  fire(run, 'onCurse', ctx);
  if (ctx.cancel) return null;
  run.curses.push(id);
  return id;
}
export function removeCurse(run, id) {
  const i = run.curses.indexOf(id);
  if (i >= 0) run.curses.splice(i, 1);
  return i >= 0;
}

function addMod(run, src, e, ctx, k) {
  const t = e.type;
  if (t === 'patMult' && e.pattern === 'this') { ctx.thisMult = (ctx.thisMult || 0) + k; return; }
  if (t === 'flag') {
    if (e.flag === 'cancelCurse') { ctx.cancel = true; return; }
    if (e.flag === 'debtCut') { run.debtAdj -= e.v; return; }
  }
  const rec = { type: t, n: t === 'allMult' ? e.n : k, src: srcRef(src) };
  for (const f of ['sym', 'pattern', 'flag', 'v', 'zone']) if (e[f] !== undefined) rec[f] = e[f];
  if (e.sym === 'random') rec.sym = pickScoring(run);
  else if (e.sym === 'that') rec.sym = ctx.sym ?? ctx.pattern?.sym ?? 'all';
  const scope = e.scope ?? (t === 'allMult' ? 'spin' : null);
  if (scope) run.temp.push({ scope, rec });
  else run.perm.push(rec);
  if (ctx.sc) ctx.sc.dirty = true;
}

export function applyEffect(run, src, e, ctx = {}) {
  const t = e.type;
  const k = amountOf(run, e, ctx, src);
  const ev = { src: srcRef(src), type: t, n: k };
  switch (t) {
    case 'coins': {
      ev.n = Math.round(k * coinScaleOf(run));
      if (ctx.sc) ctx.sc.flat += ev.n; else run.purse += ev.n;
      break;
    }
    case 'wick': run.wick += k; break;
    case 'heat': setHeat(run, run.heat + k); break;
    case 'spins': run.spinsLeft = k < 0 ? Math.max(1, run.spinsLeft + k) : run.spinsLeft + k; break;
    case 'trick': for (let i = 0; i < k; i++) addTrick(run); break;
    case 'stack': if (src.inst) src.inst.stack += k; break;
    case 'slot': run.slots = clamp(run.slots + k, 1, CONFIG.start.charmSlotsMax); break;
    case 'gainCharm': gainCharm(run, e.rarity); break;
    case 'gainCurse': for (let i = 0; i < k; i++) addCurse(run, 'random'); break;
    case 'removeSymbol': run.pendingRemove += k; break;
    case 'transform':
    case 'place':
      if (!ctx.edits) return null;
      ctx.edits.push({ ...e });
      break;
    case 'retrigger':
      if (ctx.repeat) return null;
      ctx.retrig = (ctx.retrig || 0) + k;
      (ctx.retrigSrcs ??= []).push(srcRef(src));
      break;
    default:
      if (!MOD_TYPES.has(t)) throw new Error('unknown effect ' + t);
      addMod(run, src, e, ctx, k);
  }
  return ev;
}

// Runs every rule of every held source for one trigger. Mutates run, returns UI events.
export function fire(run, trigger, ctx = {}) {
  const events = [];
  const list = [{ kind: 'char', id: run.char, rules: CHAR[run.char].rules }];
  if (!muted(run)) for (const id of run.curses) list.push({ kind: 'curse', id, rules: CURSE[id].rules });
  run.charms.forEach((inst, i) => list.push({ kind: 'charm', id: inst.id, inst, rules: rulesAt(run, i) }));
  for (const src of list) {
    src.rules.forEach((rule, ri) => {
      if (rule.trigger !== trigger || !checkCond(run, rule, ctx, src, ri, true)) return;
      for (const e of rule.effects) {
        const ev = applyEffect(run, src, e, ctx);
        if (ev) events.push({ ...ev, trigger });
      }
    });
  }
  if (ctx.sc) ctx.sc.steps.push(...events);
  return events;
}

// Fire only the rules of one charm instance (used for onSellSelf).
export function fireOne(run, inst, trigger, ctx = {}) {
  const src = { kind: 'charm', id: inst.id, inst };
  const events = [];
  CHARM[inst.id].rules.forEach((rule, ri) => {
    if (rule.trigger !== trigger || !checkCond(run, rule, ctx, src, ri, true)) return;
    for (const e of rule.effects) { const ev = applyEffect(run, src, e, ctx); if (ev) events.push({ ...ev, trigger }); }
  });
  return events;
}

// Run a flat effect list once (deal boons, terms actions).
export function runEffects(run, src, effects, ctx = {}, onlyActions = false) {
  const out = [];
  for (const e of effects) {
    if (onlyActions && MOD_TYPES.has(e.type)) continue;
    const ev = applyEffect(run, src, e, ctx);
    if (ev) out.push(ev);
  }
  return out;
}

export function endSpan(run, scope) {
  run.temp = run.temp.filter((t) => t.scope !== scope && !(scope === 'debt' && t.scope === 'round'));
}

// ---------- scoring ----------

function payParts(mods, p, thisMult, skip) {
  const value = symValueOf(mods, p.sym, skip);
  const sm = symMultOf(mods, p.sym, skip);
  const pm = patMultOf(mods, p, skip) + thisMult;
  let pay = Math.floor(value * sm * pm + 1e-9);
  const f = mods.flags;
  const n = p.cells.length;
  if (n === 3 && f.smallDead) pay = 0;
  else if (n === 3 && f.smallHalf) pay = Math.floor(pay / 2);
  if (n >= 4 && f.bigX) pay *= f.bigX === true ? 1 : f.bigX;
  return { value, sm, pm, pay };
}

export function scoreSpin(run, grid, favs, ctx = {}) {
  const sc = { found: [], flat: 0, steps: [], dirty: false, contrib: new Map() };
  let mods = snapshot(run, grid, favs);
  const refresh = () => { if (sc.dirty) { mods = snapshot(run, grid, favs); sc.dirty = false; } };
  const credit = (src, amt) => {
    if (!EXPLAIN || !(amt > 0)) return;
    const key = src.kind + ':' + src.id;
    const c = sc.contrib.get(key);
    if (c) c.gain += amt; else sc.contrib.set(key, { kind: src.kind, id: src.id, gain: amt });
  };
  const F = (trigger, c) => {
    const cx = { sc, grid, favs, ...c };
    const ev = fire(run, trigger, cx);
    for (const e of ev) if (e.type === 'coins') credit(e.src, e.n);
    refresh();
    return cx;
  };

  // step 8: landings
  let sigils = 0, wisps = 0;
  for (let cell = 0; cell < 15; cell++) {
    const sym = grid[cell];
    F('onSymbolLand', { cell, sym });
    if (sym === 'sigil') { run.wick += 1; sigils++; sc.steps.push({ type: 'wick', n: 1, src: { kind: 'sym', id: 'sigil' }, trigger: 'onSymbolLand' }); }
    if (sym === 'wisp') wisps++;
  }
  const out = (o) => ({ patterns: [], sum: 0, heatMult: 1, allMult: 1, total: 0, flat: sc.flat, scorch: false, burn: 0, steps: sc.steps, top3: [], sigils, wisps, found: 0, ...o });

  // step 9: scorch
  const need = Math.max(CONFIG.heat.scorchAsh, mods.flags.scorchNeeds || 0);
  if (countSym(grid, 'ash') >= need && !run.noScorch) {
    const pct = mods.flags.scorchBurn || CONFIG.heat.scorchBurnPct;
    const burn = Math.ceil((run.purse * pct) / 100);
    run.purse -= burn;
    setHeat(run, run.heat - CONFIG.heat.scorchHeatDrop, mods);
    run.stats.scorches = (run.stats.scorches || 0) + 1;
    sc.steps.push({ type: 'scorch', n: burn });
    F('onScorch', {});
    return out({ scorch: true, burn, flat: sc.flat });
  }

  // step 10: patterns
  const found = findPatterns(grid, mods, favs);
  sc.found = found;
  let bestIdx = -1;
  if (run.spinFx?.retriggerBest && found.length) {
    let best = -1;
    found.forEach((p, i) => { const v = payParts(mods, p, 0).pay; if (v > best) { best = v; bestIdx = i; } });
  }

  // step 11: pay
  const rows = [];
  let sum = 0;
  found.forEach((p, i) => {
    let extra = i === bestIdx ? 1 : 0;
    let row = null;
    for (let pass = 0; pass <= Math.min(3, extra); pass++) {
      const cx = F('onPattern', { pattern: p, sym: p.sym, thisMult: 0, repeat: pass > 0 });
      if (pass === 0) extra = Math.min(3, extra + (cx.retrig || 0));
      const parts = payParts(mods, p, cx.thisMult || 0);
      sum += parts.pay;
      if (EXPLAIN) {
        const recs = [...mods.symValue, ...mods.symMult, ...mods.patMult];
        for (const r of recs) {
          const hit = r.type === 'patMult' ? true : symMatch(r.sym, p.sym, mods.favs);
          if (hit) credit(r.src, parts.pay - payParts(mods, p, cx.thisMult || 0, r).pay);
        }
        if (pass > 0 && cx.retrigSrcs === undefined) { /* trick repeat */ }
        if (pass === 0 && cx.retrigSrcs) for (const s of cx.retrigSrcs) credit(s, parts.pay * Math.min(3, extra) / cx.retrigSrcs.length);
      }
      if (!row) row = { id: p.id, cells: p.cells, sym: p.sym, wisps: p.wisps, value: parts.value, symMult: parts.sm, patMult: parts.pm, pay: 0, repeats: 0 };
      else row.repeats++;
      row.pay += parts.pay;
      row.value = parts.value; row.symMult = parts.sm; row.patMult = parts.pm;
      sc.steps.push({ type: 'pattern', id: p.id, cells: p.cells, sym: p.sym, value: parts.value, symMult: parts.sm, patMult: parts.pm, pay: parts.pay, pass });
    }
    rows.push(row);
  });

  // step 12
  F('onSpinEnd', { patterns: rows });
  if (!found.length) F('onDud', {});
  refresh();

  // step 13
  const step = mods.flags.heatStep ?? CONFIG.heat.payoutPerLevel * 100;
  const heatMult = 1 + (step / 100) * run.heat;
  let allMult = 1;
  for (const r of mods.allMult) allMult *= r.n;
  let total = Math.floor(sum * heatMult * allMult + 1e-9);
  if (mods.flags.firstSpinDead && run.spinInRound === 0) total = 0;
  if (EXPLAIN) {
    credit({ kind: 'heat', id: 'heat' }, sum * (heatMult - 1));
    for (const r of mods.allMult) if (r.n > 1) credit(r.src, total - total / r.n);
  }
  const top3 = [...sc.contrib.values()].sort((a, b) => b.gain - a.gain).slice(0, 3).map((c) => ({ ...c, gain: Math.round(c.gain) }));
  return out({ patterns: rows, sum, heatMult, allMult, total, found: found.length, top3 });
}
