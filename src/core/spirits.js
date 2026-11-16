// Spirits (SPEC 3): Favour, stages, wraths, rivals, Patron limit, Him or Me, the Tin (visits, offerings, omens, demands).
// The street neighbours are data (data/spirits.json); the engine only knows ids. Calls live in calls.js.
import { CONFIG, SPIRITS, SPIRIT, CHARM, CONTRACT, SCORING, SYM } from './data.js';
import { stream } from './streams.js';
import { snapshot, fire, runEffects, addCurse, addTrick, setHeat, debtBase, bossOf } from './effects.js';
import { buildWeights, pickFavourites } from './machine.js';
import { rollCharmsFor, rollBenchFor, rollTermsFor, price, sellValue } from './shop.js';

export const STAGE_AT = [2, 5, 8];
export const FAVOUR_MAX = 10, FAVOUR_MIN = -5;
export const FIRST_RUN_SPIRITS = ['brimble', 'beckon', 'gold'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initSpirits(run, { unlocked = FIRST_RUN_SPIRITS, base = {} } = {}) {
  run.spirits = {};
  for (const d of SPIRITS) run.spirits[d.id] = { fav: 0, stage: 0, wrath: 0, met: false, silent: false, cap: null };
  run.unlocked = [...new Set(['brimble', ...unlocked])];
  for (const [id, n] of Object.entries(base)) if (run.spirits[id]) run.spirits[id].fav = clamp(n, FAVOUR_MIN, FAVOUR_MAX);
}

export const live = (run) => SPIRITS.filter((d) => run.unlocked.includes(d.id) && !run.spirits[d.id].silent);
const patronLine = (run) => snapshot(run).flags.patronAt ?? STAGE_AT[2];
export const wrathLines = (run) => ((run.storm || 0) >= 10 ? [-1, -4] : [-2, -5]);
const wrathOf = (run, fav) => wrathLines(run).filter((w) => fav <= w).length;
const patrons = (run, except) => SPIRITS.filter((d) => d.id !== except && run.spirits[d.id].stage >= STAGE_AT[2]).length;
export const favourCap = (run, id) => {
  const sp = run.spirits[id];
  let cap = FAVOUR_MAX;
  if (sp.stage < STAGE_AT[2] && patrons(run, id) >= 2) cap = 7;
  if (sp.cap !== null && sp.capDebt === run.debtIdx) cap = Math.min(cap, sp.cap);
  return cap;
};

// The one place Favour changes. chain=false: a rival adjustment, which never triggers more rival adjustments.
export function addFavour(run, id, n, why = '', chain = true) {
  const sp = run.spirits?.[id];
  if (!sp || sp.silent || !n) return 0;
  const before = sp.fav;
  let next = clamp(before + n, FAVOUR_MIN, FAVOUR_MAX + 99);
  if (next > FAVOUR_MAX) { run.wick += Math.floor((next - FAVOUR_MAX) / 3); next = FAVOUR_MAX; } // every 3 surplus points: +1 Caps
  next = Math.min(next, Math.max(before, favourCap(run, id)));
  sp.fav = next;
  const d = SPIRIT[id], rival = d.rival, rsp = run.spirits[rival];
  const lines = [STAGE_AT[0], STAGE_AT[1], patronLine(run)];
  const rivalFriend = !!rsp && !rsp.silent && (rsp.stage >= STAGE_AT[1] || rsp.fav >= STAGE_AT[1]);
  lines.forEach((line, i) => {
    if (before >= line || next < line) return;
    if (chain && rsp && !rsp.silent) addFavour(run, rival, -2, 'rivalStage', false);
    const nominal = STAGE_AT[i];
    if (sp.stage >= nominal) return;
    sp.stage = nominal;
    run.stats['stage:' + nominal] = (run.stats['stage:' + nominal] || 0) + 1;
    fire(run, 'onStage', { spirit: id, stage: nominal });
    if (nominal === STAGE_AT[2] && rivalFriend) (run.himQueue ??= []).push({ spirit: id, rival });
  });
  const lvl = wrathOf(run, next);
  if (lvl > sp.wrath) {
    sp.wrath = lvl;
    run.stats.wraths = (run.stats.wraths || 0) + 1;
    fire(run, 'onWrath', { spirit: id, level: lvl });
    if (chain && rsp && !rsp.silent) addFavour(run, rival, 1, 'rivalWrath', false);
  } else sp.wrath = lvl;
  run.stats.favourBest = Math.max(run.stats.favourBest || 0, next);
  if (why) { const f = (run.favSrc ??= {}); f[why] = (f[why] || 0) + (next - before); f[id + ':' + why] = (f[id + ':' + why] || 0) + (next - before); } // where Favour came from (balance telemetry)
  return next - before;
}

// ---------- Him or Me ----------

// Raise the modal when a Patron was reached while the rival stood at Friend or more. Call at the end of any player action.
export function flushModal(run) {
  if (!run.himQueue?.length || run.phase === 'himOrMe' || !['shop', 'call', 'terms', 'roundend'].includes(run.phase)) return false;
  run.himOrMe = run.himQueue.shift();
  run.himBack = run.phase;
  run.phase = 'himOrMe';
  return true;
}

export function himOrMe(run, choice) {
  const h = run.himOrMe;
  if (run.phase !== 'himOrMe' || !h) return false;
  const sp = run.spirits[h.spirit], rsp = run.spirits[h.rival];
  if (choice === 'drop') {
    rsp.fav = 0; rsp.wrath = 0; rsp.silent = true;
    const gifts = SPIRIT[h.spirit].gifts;
    if (gifts.length) applyGift(run, h.spirit, stream(run, 'call').pick(gifts));
  } else {
    sp.fav = Math.min(sp.fav, 7); sp.cap = 7; sp.capDebt = run.debtIdx;
  }
  run.stats.himOrMe = (run.stats.himOrMe || 0) + 1;
  run.himOrMe = null;
  run.phase = run.himBack;
  flushModal(run);
  return true;
}

export function applyGift(run, spiritId, g) {
  return runEffects(run, { kind: 'call', id: g.id }, g.effects, { spirit: spiritId });
}

// ---------- the Tin ----------

const TASTE = (d, kind) => d.taste[kind] ?? 1;
export const DEMAND_CHANCE = 0.35; // a visitor asks for something about a third of the time
export const OFFER_FAVOUR = { small: 1, medium: 3, large: 6 };
export const OFFER_TABLE = {
  coins: { small: 4, medium: 10, large: 25 }, caps: { small: 1, medium: 2, large: 4 }, spice: { small: 1, medium: 3, large: 5 },
  trick: { medium: 1 }, charm: { large: 1 }, curse: { medium: 1 }, skip: { small: 1, medium: 2 },
};

function pickVisitor(run) {
  const pool = live(run);
  if (run.tut && run.debtIdx === 0) return 'beckon';
  const rng = stream(run, 'call'), r = rng.next();
  if (r < 0.35) return pool.reduce((a, b) => (run.spirits[b.id].fav > run.spirits[a.id].fav ? b : a)).id;
  if (r < 0.6) {
    const local = pool.filter((d) => d.local?.includes(run.contract));
    if (local.length) return rng.pick(local).id;
  }
  return rng.pick(pool).id;
}

// One visit per stall. Returns the plain view the Tin strip draws.
export function tinVisit(run) {
  if (run.phase !== 'shop') return run.tin ? tinView(run) : null;
  const key = run.debtIdx + ':' + run.round;
  if (run.tin?.key === key) return tinView(run);
  const result = run.demand ? demandCheck(run) : null;
  const id = pickVisitor(run);
  run.spirits[id].met = true;
  const rng = stream(run, 'call');
  const offer = !run.tut && !run.demand && rng.next() < DEMAND_CHANCE ? SPIRIT[id].demand : null;
  run.tin = { key, spirit: id, left: 1 + (snapshot(run).flags.tinOfferings || 0), demand: offer, omen: null, result, hand: null };
  run.tin.omen = omenOf(run, id);
  run.stats.visits = (run.stats.visits || 0) + 1;
  fire(run, 'onVisit', { spirit: id });
  return tinView(run);
}

const tinView = (run) => ({ ...run.tin, favour: run.spirits[run.tin.spirit].fav, stage: run.spirits[run.tin.spirit].stage, wrath: run.spirits[run.tin.spirit].wrath });

// Cost of an offering, as the buttons show it. null: not offered at this size.
export function offerCost(run, kind, size) {
  const q = OFFER_TABLE[kind]?.[size];
  if (!q) return null;
  return kind === 'coins' ? Math.max(1, Math.ceil((run.debt * q) / 100 - 1e-9)) : q;
}

// target: pocket index (trick) or charm slot (charm). Returns {ok, gained, insult?, why?}.
export function offer(run, kind, size, target = 0) {
  const t = run.tin;
  if (run.phase !== 'shop' || !t || t.left < 1) return { ok: false, why: 'closed' };
  const d = SPIRIT[t.spirit], sp = run.spirits[t.spirit], q = offerCost(run, kind, size);
  if (!q) return { ok: false, why: 'size' };
  switch (kind) {
    case 'coins': if (run.purse < q) return { ok: false, why: 'poor' }; break;
    case 'caps': if (run.wick < q) return { ok: false, why: 'poor' }; break;
    case 'spice': if (run.heat < q) return { ok: false, why: 'poor' }; break;
    case 'trick': if (!run.tricks[target]) return { ok: false, why: 'none' }; break;
    case 'charm': if (!run.charms[target] || run.charms[target].relic) return { ok: false, why: 'none' }; break;
    case 'curse': if (!d.ownCurse || run.curses.includes(d.ownCurse)) return { ok: false, why: 'none' }; break;
  }
  if (kind === 'coins') run.purse -= q;
  else if (kind === 'caps') run.wick -= q;
  else if (kind === 'spice') setHeat(run, run.heat - q);
  else if (kind === 'trick') run.tricks.splice(target, 1);
  else if (kind === 'charm') {
    const inst = run.charms[target], v = sellValue(run, inst);
    run.purse += v.coins || 0; run.wick += v.wick || 0;
    run.charms.splice(target, 1);
  } else if (kind === 'curse') addCurse(run, d.ownCurse);
  else if (kind === 'skip') run.spinsOff = (run.spinsOff || 0) + q;
  t.left--;
  const taste = TASTE(d, kind);
  const insult = taste < 0;
  const gained = insult ? -1 : Math.ceil(OFFER_FAVOUR[size] * taste - 1e-9);
  addFavour(run, t.spirit, gained, 'offering');
  run.stats.offerings = (run.stats.offerings || 0) + 1;
  if (insult) run.stats.insults = (run.stats.insults || 0) + 1;
  else if (taste >= 2) run.stats.lovedOfferings = (run.stats.lovedOfferings || 0) + 1;
  fire(run, 'onOffering', { spirit: t.spirit, kind, size, favour: gained });
  if (run.demand?.id === 'feed' && run.demand.spirit === t.spirit && (kind === 'charm' || kind === 'curse')) run.demand.ok = true;
  syncShop(run);
  flushModal(run);
  return { ok: true, gained, insult };
}

// A flag gained mid-stall (shopExtra at Noticed) shows at once: one more charm in the open stall.
export function syncShop(run) {
  const s = run.shop;
  if (!s || run.phase !== 'shop') return;
  const want = (snapshot(run).flags.shopExtra || 0) - (s.extraGiven || 0);
  if (want > 0) { s.charms.push(...rollCharmsFor(run, want, s.charms)); s.extraGiven = (s.extraGiven || 0) + want; }
}

// ---------- demands ----------

const stat = (run, k) => run.stats[k] || 0;
const DEMANDS = {
  signDeal: { start: (run) => ({ base: stat(run, 'dealsSigned') }), done: (run, d) => stat(run, 'dealsSigned') > d.base, bonus: [{ type: 'wick', n: 2 }] },
  buy2: { start: (run) => ({ base: stat(run, 'itemsBought') }), done: (run, d) => stat(run, 'itemsBought') - d.base >= 2 },
  letMePick: { start: () => ({}), done: (run, d) => !!d.ok },
  handTrick: { start: () => ({}), done: (run, d) => !!d.ok },
  waitWithMe: { start: (run) => ({ base: stat(run, 'skips') }), done: (run, d) => stat(run, 'skips') > d.base },
  keepCool: { start: () => ({}), done: (run, d) => !!d.ok },
  feed: { start: () => ({}), done: (run, d) => !!d.ok },
  dare: { start: (run) => ({ base: stat(run, 'scorches'), maxHeat: run.heat }), done: (run, d) => !!d.ok, fail: (run) => { run.purse -= Math.ceil(run.purse * 0.1); } },
};

export function acceptDemand(run) {
  const t = run.tin;
  if (run.phase !== 'shop' || !t?.demand || run.demand) return false;
  const id = t.demand, D = DEMANDS[id];
  if (id === 'handTrick' && !run.tricks.length) return false;
  run.demand = { spirit: t.spirit, id, serial: run.roundSerial, ...D.start(run) };
  t.demand = null;
  if (id === 'handTrick') { run.tricks.splice(0, 1); addTrick(run); addTrick(run); run.demand.ok = true; }
  run.stats.demands = (run.stats.demands || 0) + 1;
  return true;
}

// Called at the end of every round: keepCool and dare are judged on the round that just ended (the next one after the demand was taken).
export function demandRoundEnd(run) {
  const d = run.demand;
  if (!d || run.roundSerial <= d.serial) return;
  if (d.id === 'keepCool') d.ok = run.heat <= 2;
  if (d.id === 'dare') d.ok = d.maxHeat >= 8 && stat(run, 'scorches') === d.base;
}
export function demandHeat(run) {
  if (run.demand?.id === 'dare' && run.roundSerial > run.demand.serial) run.demand.maxHeat = Math.max(run.demand.maxHeat || 0, run.heat);
}
// At the first visit after the demand: met (+3 Favour and any bonus) or failed (-1, Ruby -2).
export function demandCheck(run) {
  const d = run.demand;
  if (!d) return null;
  const D = DEMANDS[d.id];
  const met = D.done(run, d);
  run.demand = null;
  if (met) { addFavour(run, d.spirit, 3, 'demand'); if (D.bonus) runEffects(run, { kind: 'demand', id: d.id }, D.bonus, { spirit: d.spirit }); }
  else { addFavour(run, d.spirit, d.spirit === 'brimble' ? -2 : -1, 'demand'); D.fail?.(run); }
  run.stats[met ? 'demandsMet' : 'demandsFailed'] = (run.stats[met ? 'demandsMet' : 'demandsFailed'] || 0) + 1;
  return met ? 'met' : 'failed';
}

// letMePick: the next spin's Special is the spirit's choice, not the machine's.
export function demandPickFav(run, favs) {
  const d = run.demand;
  if (d?.id !== 'letMePick' || d.ok) return favs;
  d.ok = true;
  // he likes shiny small things: his pick is a Low or Mid symbol, never the best one
  const open = SCORING.filter((x) => !run.removed.includes(x) && SYM[x].group !== 'high');
  return [stream(run, 'call').pick(open.length ? open : SCORING), ...favs.slice(1)];
}

// ---------- omens: market gossip, never a result (SPEC review 5.4) ----------

export function scorchChance(run, heat) {
  const mods = snapshot(run);
  const wt = buildWeights({ ...run, heat }, mods, []);
  const ai = wt.ids.indexOf('ash'), total = wt.weights.reduce((a, b) => a + b, 0);
  const p = total ? wt.weights[ai] / total : 0;
  const need = Math.max(CONFIG.heat.scorchAsh, mods.flags.scorchNeeds || 0);
  let below = 0, c = 1;
  for (let k = 0; k < need; k++) { below += c * p ** k * (1 - p) ** (15 - k); c = (c * (15 - k)) / (k + 1); }
  return { p, chance: 1 - below, expected: 15 * p };
}

export function omenOf(run, id) {
  const peek = (run.peek ??= {});
  const nextHeat = Math.max(snapshot(run).flags.heatFloor || 0, run.heat - CONFIG.heat.coolAtRoundStart);
  switch (SPIRIT[id].omen) {
    case 'nextDebts': {
      const list = CONTRACT[run.contract].debts, out = { targets: [], boss: null };
      for (let i = run.debtIdx + 1; i <= run.debtIdx + 2; i++) out.targets.push(debtBase(run.contract, i));
      for (let i = run.debtIdx + 1; i <= run.debtIdx + 3 && !out.boss; i++) out.boss = bossOf({ contract: run.contract, debtIdx: i, endless: run.endless })?.id || null;
      return out;
    }
    case 'nextOffers': {
      peek.charms ??= rollCharmsFor(run, snapshot(run).flags.shopOffers ?? CONFIG.shop.charmOffers, []);
      return { charms: [...peek.charms].sort((a, b) => (CHARM[b].price.coins || 0) - (CHARM[a].price.coins || 0)).slice(0, 2) };
    }
    case 'nextFavs2': case 'favBoard': {
      run.favQueue ??= [];
      return { favs: fillFavs(run, 2).slice(0, 2) };
    }
    case 'benchPrices': {
      peek.bench ??= rollBenchFor(run, CONFIG.shop.benchOffers);
      return { jobs: peek.bench.map((b) => ({ id: b, price: price(run, { kind: 'bench', id: b }) })) };
    }
    case 'shortfall': return { short: Math.max(0, run.debt - run.banked - run.purse) };
    case 'nextTerms': { peek.terms ??= rollTermsFor(run); return { terms: [...peek.terms] }; }
    case 'ashNext': return { expected: Math.round(scorchChance(run, nextHeat).expected * 10) / 10 };
    case 'scorchOdds': { const c = scorchChance(run, nextHeat).chance; return { perSpin: c, three: 1 - (1 - c) ** 3 }; }
  }
  return null;
}

function fillFavs(run, n) {
  const mods = snapshot(run);
  while (run.favQueue.length < n) run.favQueue.push(pickFavourites(run, mods));
  return run.favQueue;
}
