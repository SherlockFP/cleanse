// The pedlar wagon: offers, prices, buying, selling, bench jobs, reroll, lock.
import { CHARMS, CHARM, TRICK, TRICKS, BENCH, BENCH_JOB, CONFIG, SCORING, RARITIES, STAKES } from './data.js';
import { stream } from './streams.js';
import { snapshot, scaleOf, slotsOf, pocketsOf, addCharm, addTrick, fire, fireOne, removeCurse } from './effects.js';
import { PATTERNS } from './patterns.js';

const SHOP = CONFIG.shop;

function odds(debtNo) {
  let o = SHOP.rarityOdds[0];
  for (const r of SHOP.rarityOdds) if (debtNo >= r.fromDebt) o = r;
  return RARITIES.map((k) => o[k]);
}

export function rollCharmsFor(run, count, taken) {
  const rng = stream(run, 'shop');
  const held = new Set();
  for (const c of run.charms) for (const t of CHARM[c.id].tags) held.add(t);
  const out = [];
  const skip = new Set([...taken, ...run.charms.map((c) => c.id), ...run.waiting]);
  const o = odds(run.debtIdx + 1);
  for (let i = 0; i < count; i++) {
    // a rarity with nothing left in the pool steps down (locked legendaries offer a rare), then up
    let r = RARITIES.indexOf(rng.weighted(RARITIES, o)), list = [];
    for (const k of [...RARITIES.slice(0, r + 1).reverse(), ...RARITIES.slice(r + 1)]) {
      list = CHARMS.filter((c) => c.rarity === k && run.pool.includes(c.id) && !skip.has(c.id));
      if (list.length) break;
    }
    if (!list.length) break;
    const id = rng.weighted(list, list.map((c) => (c.tags.some((t) => held.has(t)) ? SHOP.familyBias : 1))).id;
    out.push(id);
    skip.add(id);
  }
  return out;
}

// The terms cards of the next night: three weighted picks the player chooses from.
export function rollTermsFor(run) {
  const rng = stream(run, 'terms');
  const pool = STAKES.filter((s) => s.minDebt <= run.debtIdx + 1);
  const ids = [];
  while (ids.length < 3 && pool.length) {
    const s = rng.weighted(pool, pool.map((p) => p.weight));
    ids.push(s.id);
    pool.splice(pool.indexOf(s), 1);
  }
  return ids;
}

// Cart upgrades (the Review's build layer): two a stall. A pattern pays +1 mult for the run, or a symbol turns up 1.5x as often.
const UP = { patBase: 10, weightBase: 8, weightMul: 1.5, patMult: 1, step: 0.5, same: 1.6, perPattern: 3 };
const PAT_ODDS = { h3: 3, v3: 3, d3: 2, h4: 2 };
function rollUpgradesFor(run) {
  const rng = stream(run, 'shop');
  const out = [];
  const pats = PATTERNS.filter((p) => run.perm.filter((r) => r.src?.kind === 'cart' && r.pattern === p.id).length < UP.perPattern);
  const syms = SCORING.filter((x) => !run.removed.includes(x));
  while (out.length < 2) {
    if (rng.next() < 0.55 && pats.length) {
      const p = rng.weighted(pats, pats.map((q) => PAT_ODDS[q.id] || 1));
      if (!out.some((o) => o.pattern === p.id)) out.push({ kind: 'pattern', pattern: p.id });
    } else {
      const sy = rng.pick(syms);
      if (!out.some((o) => o.sym === sy)) out.push({ kind: 'weight', sym: sy });
    }
  }
  return out;
}
const upBought = (run, u) => run.perm.filter((r) => r.src?.kind === 'cart' && (u.kind === 'pattern' ? r.pattern === u.pattern : r.sym === u.sym && r.type === 'weight')).length;
// Each upgrade of the same pattern or symbol costs 1.6x more, and every upgrade bought this run raises the next by half its base again.
const upTotal = (run) => run.perm.filter((r) => r.src?.kind === 'cart').length;
export const upgradePrice = (run, u, mods = snapshot(run)) => ({ coins: Math.max(1, Math.round((u.kind === 'pattern' ? UP.patBase : UP.weightBase) * scaleOf(run) * UP.same ** upBought(run, u) * (1 + UP.step * upTotal(run)) * pricePct(mods, 'upgrade'))) });
export function buyUpgrade(run, i) {
  const u = run.shop?.upgrades?.[i];
  if (!u || !pay(run, upgradePrice(run, u))) return false;
  const src = { kind: 'cart', id: 'upgrade' };
  run.perm.push(u.kind === 'pattern' ? { type: 'patMult', n: UP.patMult, pattern: u.pattern, src } : { type: 'weight', n: UP.weightMul, sym: u.sym, src });
  run.shop.upgrades.splice(i, 1);
  run.stats.upgrades = (run.stats.upgrades || 0) + 1;
  run.stats.itemsBought = (run.stats.itemsBought || 0) + 1;
  return true;
}

function rollTricks(run, count) {
  const rng = stream(run, 'shop');
  const pool = TRICKS.map((t) => t.id);
  const out = [];
  while (out.length < count) {
    const id = rng.pick(pool);
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function rollBenchFor(run, count) {
  const rng = stream(run, 'shop');
  const pool = BENCH.map((b) => b.id).filter((id) => (id !== 'lift' || run.curses.length) && (id !== 'purge' || run.removed.length < CONFIG.start.removedSymbolsMax));
  const out = [];
  while (out.length < count && out.length < pool.length) {
    const id = rng.pick(pool);
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function openShop(run) {
  const mods = snapshot(run);
  const f = mods.flags;
  const hide = run.hide || {};
  let n = f.shopOffers ?? hide.shopOffers ?? SHOP.charmOffers;
  const extra = Math.max(run.shopExtra ? 1 : 0, f.shopExtra === true ? 1 : f.shopExtra || 0);
  n += extra;
  n += run.earlyShop || 0;
  const lockId = run.lock && !run.charms.some((c) => c.id === run.lock) ? run.lock : null;
  const charms = lockId ? [lockId] : [];
  run.lock = lockId;
  const peek = run.peek || {};
  // what an omen already showed (Beckon's gossip) is what the stall holds
  for (const id of peek.charms || []) if (charms.length < n && !charms.includes(id) && !run.charms.some((c) => c.id === id)) charms.push(id);
  charms.push(...rollCharmsFor(run, n - charms.length, charms));
  const benchN = (hide.benchOffers || SHOP.benchOffers) + (run.earlyShop || 0);
  run.shop = {
    charms, extraGiven: extra,
    tricks: rollTricks(run, SHOP.trickOffers + (run.earlyShop || 0)),
    bench: peek.bench?.length ? peek.bench.slice(0, benchN) : rollBenchFor(run, benchN),
    upgrades: rollUpgradesFor(run),
    rerolls: 0,
    freeRerolls: (run.earlyShop || 0) + (run.shopExtra ? 1 : 0) + (hide.freeRerolls || 0) + (run.adReroll || 0) + (f.freeReroll || 0),
  };
  run.peek = null;
  run.adReroll = 0;
  run.shopExtra = false;
  run.earlyShop = 0;
  run.phase = 'shop';
  return run.shop;
}

const pricePct = (mods, kind) => {
  const f = mods.flags;
  let p = 1 + ((f.shopMarkup || 0) - (f.shopDiscount || 0)) / 100;
  if (kind === 'bench') p *= Math.max(0, 1 - (f.benchDiscount || 0) / 100);
  return Math.max(0.1, p);
};

// item: {kind:'charm'|'trick'|'bench'|'slot'|'reroll', id}. Returns {coins?, wick?}.
export function price(run, item, mods = snapshot(run)) {
  const S = scaleOf(run);
  const k = item.kind;
  if (k === 'reroll') {
    const base = SHOP.rerollBase + SHOP.rerollStep * (run.shop?.rerolls || 0);
    return { coins: Math.max(1, Math.round(base * S * (mods.flags.rerollDouble ? 2 : 1))) }; // whole coins (AUDIT2 10: "Reroll 2.6")
  }
  const base = k === 'charm' ? CHARM[item.id].price : k === 'trick' ? TRICK[item.id].price : k === 'bench' ? BENCH_JOB[item.id].price : { wick: SHOP.slotPriceWick };
  const p = pricePct(mods, k);
  const out = {};
  if (base.coins !== undefined) out.coins = base.coins === 0 || (k === 'bench' && (mods.flags.benchDiscount || 0) >= 100) ? 0 : Math.max(1, Math.round(base.coins * S * p));
  if (base.wick !== undefined) out.wick = Math.max(1, Math.round(base.wick * (k === 'slot' ? 1 : p)));
  return out;
}

export const canPay = (run, p) => (p.coins || 0) <= run.purse && (p.wick || 0) <= run.wick;
function pay(run, p) {
  if (!canPay(run, p)) return false;
  run.purse -= p.coins || 0;
  run.wick -= p.wick || 0;
  return true;
}

export function buyCharm(run, i) {
  const id = run.shop?.charms[i];
  if (!id || run.charms.length >= slotsOf(run)) return false;
  if (!pay(run, price(run, { kind: 'charm', id }))) return false;
  run.shop.charms.splice(i, 1);
  if (run.lock === id) run.lock = null;
  addCharm(run, id);
  run.stats.charmsBought = (run.stats.charmsBought || 0) + 1;
  run.stats.itemsBought = (run.stats.itemsBought || 0) + 1;
  fire(run, 'onBuy', { charm: id });
  return true;
}

// A charm that waited for a free slot (deal reward) is free.
export function takeWaiting(run, i) {
  const id = run.waiting[i];
  if (!id || run.charms.length >= slotsOf(run)) return false;
  run.waiting.splice(i, 1);
  addCharm(run, id);
  return true;
}

export function sellValue(run, inst) {
  const mods = snapshot(run);
  const pct = mods.flags.sellFull ? 1 : CONFIG.shop.sellPct / 100;
  const base = CHARM[inst.id].price;
  return base.coins !== undefined ? { coins: Math.max(1, Math.floor(base.coins * scaleOf(run) * pct)) } : { wick: Math.floor(base.wick * pct) };
}

export function sellCharm(run, slot) {
  const inst = run.charms[slot];
  if (!inst || inst.relic) return false;
  const v = sellValue(run, inst);
  run.purse += v.coins || 0;
  run.wick += v.wick || 0;
  fireOne(run, inst, 'onSellSelf', {});
  run.charms.splice(slot, 1);
  run.stats.charmsSold = (run.stats.charmsSold || 0) + 1;
  fire(run, 'onSell', { charm: inst.id });
  return true;
}

export function moveCharm(run, from, to) {
  if (from === to || !run.charms[from] || to < 0 || to >= run.charms.length) return false;
  run.charms.splice(to, 0, run.charms.splice(from, 1)[0]);
  return true;
}

export function buyTrick(run, i) {
  const id = run.shop?.tricks[i];
  if (!id || run.tricks.length >= pocketsOf(run)) return false;
  if (!pay(run, price(run, { kind: 'trick', id }))) return false;
  run.shop.tricks.splice(i, 1);
  run.stats.itemsBought = (run.stats.itemsBought || 0) + 1;
  addTrick(run, id);
  return true;
}

// target: symbol id (polish, weigh, gild, purge) or curse id (lift).
export function doBench(run, i, target) {
  const id = run.shop?.bench[i];
  if (!id) return false;
  const job = BENCH_JOB[id];
  if (job.effect.type === 'removeCurse') {
    if (!run.curses.includes(target)) return false;
  } else if (!SCORING.includes(target) && !(id === 'weigh' && (target === 'wisp' || target === 'sigil'))) return false;
  if (id === 'purge' && (run.removed.length >= CONFIG.start.removedSymbolsMax || run.removed.includes(target))) return false;
  const free = run.freeBench > 0;
  if (!free && !pay(run, price(run, { kind: 'bench', id }))) return false;
  if (free) run.freeBench--;
  if (id === 'lift') removeCurse(run, target);
  else {
    const b = (run.bench[target] ??= { value: 0, mult: 0, weight: 1 });
    if (id === 'polish') b.value += 1;
    else if (id === 'weigh') b.weight *= 1.3;
    else if (id === 'gild') b.mult += 0.25;
    else {
      run.removed.push(target);
      run.stats.symbolsRemoved = (run.stats.symbolsRemoved || 0) + 1;
    }
  }
  run.shop.bench.splice(i, 1);
  run.stats.itemsBought = (run.stats.itemsBought || 0) + 1;
  run.stats.benchJobs = (run.stats.benchJobs || 0) + 1;
  return true;
}

// Resolve a pending "pick symbols to remove" (deals).
export function removeSymbol(run, sym) {
  if (run.pendingRemove <= 0 || run.removed.includes(sym) || !SCORING.includes(sym) || run.removed.length >= CONFIG.start.removedSymbolsMax) return false;
  run.pendingRemove--;
  run.removed.push(sym);
  run.stats.symbolsRemoved = (run.stats.symbolsRemoved || 0) + 1;
  return true;
}

export function buySlot(run) {
  if (run.slotBought || run.slots >= CONFIG.start.charmSlotsMax) return false;
  if (!pay(run, price(run, { kind: 'slot' }))) return false;
  run.slots++;
  run.slotBought = true;
  return true;
}

export function reroll(run) {
  const s = run.shop;
  if (!s) return false;
  if (s.freeRerolls > 0) s.freeRerolls--;
  else if (!pay(run, price(run, { kind: 'reroll' }))) return false;
  const keep = run.lock && s.charms.includes(run.lock) ? [run.lock] : [];
  const n = s.charms.length;
  s.charms = keep.concat(rollCharmsFor(run, Math.max(0, n - keep.length), keep));
  s.tricks = rollTricks(run, s.tricks.length || SHOP.trickOffers);
  s.rerolls++;
  fire(run, 'onReroll', {});
  return true;
}

export function toggleLock(run, i) {
  const id = run.shop?.charms[i];
  if (!id || snapshot(run).flags.rerollDouble) return false;
  run.lock = run.lock === id ? null : id;
  return true;
}
