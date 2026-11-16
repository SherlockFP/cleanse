// Shop (GDD.md section 8, TECH.md section 4). Pure. Offers are drawn from fork('shop:' + visit + ':' + reroll + ':' + slot),
// so a reroll never shifts the reel or the next shop. Actions answer { ok, ... } or { ok: false, reason }; misuse (wrong phase) throws.
import { makeRng } from './rng.js';
import { fold, chartOf } from './run.js';
import { applyTrinkets } from './trinkets.js';
import { TRINKETS } from './data/trinkets.js';
import { SYMBOLS } from './data/symbols.js';
import { PRICES, SHOP, REMOVALS_PER_RUN } from './econ.js';

const TRINKET = new Map(TRINKETS.map((t) => [t.id, t]));
const SYM = new Map(SYMBOLS.map((s) => [s.id, s]));
const SHELF_SLOTS = 5;

// Nominal roll (what the code asks the rng for before the pool trims it).
export const SHOP_ODDS = Object.freeze({
  trinket: SHOP.trinketShare, token: SHOP.tokenShare,
  grades: Object.freeze(SHOP.gradeWeights.map((w) => w / SHOP.gradeWeights.reduce((a, b) => a + b, 0))),
});

const inPool = (unlock, run) => unlock === 'start' || run.unlocked.includes(unlock);
const bagCount = (run, id) => run.bag[id] ?? 0;

// Eligible content now: unlocked, not on the shelf, tokens under their copy cap; `skip` = trinket ids already offered in this shop.
function poolOf(run, skip = []) {
  const owned = new Set(run.trinkets.map((t) => t.id));
  const trinkets = TRINKETS.filter((t) => inPool(t.unlock, run) && !owned.has(t.id) && !skip.includes(t.id));
  const tokens = SYMBOLS.filter((s) => s.price !== null && inPool(s.unlock, run) && (s.cap === null || bagCount(run, s.id) < s.cap));
  return { trinkets, tokens };
}

// Grade weights of the eligible trinkets: a grade with none is skipped and the others share its weight (GDD.md section 8).
const gradeWeights = (trinkets) => SHOP.gradeWeights.map((w, g) => (trinkets.some((t) => t.grade === g + 1) ? w : 0));

// What the shop screen prints: shares and grade odds for the current pool, as fractions.
export function effectiveOdds(run) {
  const { trinkets, tokens } = poolOf(run);
  const t = trinkets.length ? SHOP.trinketShare : 0, k = tokens.length ? SHOP.tokenShare : 0;
  const w = gradeWeights(trinkets), wsum = w.reduce((a, b) => a + b, 0) || 1;
  return { trinket: t / ((t + k) || 1), token: k / ((t + k) || 1), grades: w.map((x) => x / wsum) };
}

function drawOffer(run, label, skip) {
  const rng = makeRng(run.seed).fork(label);
  const { trinkets, tokens } = poolOf(run, skip);
  const share = [trinkets.length ? SHOP.trinketShare : 0, tokens.length ? SHOP.tokenShare : 0];
  if (!share[0] && !share[1]) return null;
  if (rng.weighted(['trinket', 'token'], share) === 'trinket') {
    const grade = rng.weighted([1, 2, 3, 4], gradeWeights(trinkets));
    const t = rng.pick(trinkets.filter((x) => x.grade === grade));
    return { kind: 'trinket', id: t.id, grade, sold: false };
  }
  return { kind: 'token', sym: rng.pick(tokens).id, sold: false };
}

const offerCount = (run) => chartOf(run).offers ?? 3;

// Fills every slot that is not locked. A carried (locked) offer from the last shop takes slot 0 if it is still legal.
function fill(run) {
  const s = run.shop;
  for (let i = 0; i < offerCount(run); i++) {
    if (s.lock === i && s.offers[i]) continue;
    // earlier slots of this draw and the locked slot: a redraw never deals a trinket that is already on the counter
    const skip = s.offers.filter((o, j) => o && (j < i || j === s.lock) && o.kind === 'trinket').map((o) => o.id);
    s.offers[i] = drawOffer(run, `shop:${s.visit}:${s.reroll}:${i}`, skip);
  }
}

export function rollShop(run) {
  if (run.phase !== 'shop') throw new Error('not in the shop');
  if (run.shop) return run.shop; // already rolled for this visit: a resume that calls again changes nothing
  const visit = run.shopVisit++;
  run.shop = { visit, reroll: 0, offers: [], lock: null, removals: 0 };
  const c = run.carry;
  run.carry = null;
  const legal = c && (c.kind === 'trinket'
    ? poolOf(run).trinkets.some((t) => t.id === c.id)
    : poolOf(run).tokens.some((t) => t.id === c.sym));
  if (legal) { run.shop.offers[0] = { ...c, sold: false }; run.shop.lock = 0; }
  fill(run);
  run.shop.lock = null; // a carried offer is an ordinary offer once it is in this shop
  fold(run, `shop:${visit}:${run.shop.offers.map((o) => o && (o.id ?? o.sym)).join(',')}`);
  return run.shop;
}

const listTrinket = (run, id) => Math.max(1, Math.round(PRICES.trinket[TRINKET.get(id).grade - 1] * (chartOf(run).trinketPriceMul ?? 1)));

// item: { kind: 'trinket', id } | { kind: 'token', sym } | { kind: 'reroll' } | { kind: 'removal' }.
export function priceOf(run, item) {
  const c = chartOf(run);
  if (item.kind === 'reroll') {
    const index = run.shop?.reroll ?? 0;
    if (applyTrinkets('onPrice', run, { item: { kind: 'reroll', index } }).free) return 0;
    return PRICES.rerollBase + PRICES.rerollStep * index;
  }
  if (item.kind === 'removal') {
    if (applyTrinkets('onRemoveToken', run, { removalsThisShop: run.shop?.removals ?? 0 }).free) return 0;
    return PRICES.removal;
  }
  const base = item.kind === 'trinket'
    ? PRICES.trinket[TRINKET.get(item.id).grade - 1] * (c.trinketPriceMul ?? 1)
    : Math.min(PRICES.tokenMax, SYM.get(item.sym).price + PRICES.tokenGrowthPerCopy * (run.bought[item.sym] ?? 0));
  const mul = (c.priceMul ?? 1) * applyTrinkets('onPrice', run, { item }).mul;
  return Math.max(1, Math.round(base * mul)); // round to nearest, never free
}

const open = (run) => {
  if (run.phase !== 'shop' || !run.shop) throw new Error('shop is not open');
  return run.shop;
};
const no = (reason) => ({ ok: false, reason });
const slots = (run) => chartOf(run).slots ?? SHELF_SLOTS;

export function buyOffer(run, i) {
  const o = open(run).offers[i];
  if (!o || o.sold) return no('sold');
  const price = priceOf(run, o);
  if (run.jar < price) return no('coins');
  if (o.kind === 'trinket') {
    if (run.trinkets.length >= slots(run)) return no('shelf full');
    run.trinkets.push({ id: o.id });
  } else {
    const s = SYM.get(o.sym);
    if (s.cap !== null && bagCount(run, o.sym) >= s.cap) return no('cap');
    run.bag[o.sym] = bagCount(run, o.sym) + 1;
    run.bought[o.sym] = (run.bought[o.sym] ?? 0) + 1;
  }
  run.jar -= price;
  o.sold = true;
  fold(run, `buy:${i}:${o.id ?? o.sym}:${price}`);
  return { ok: true, price };
}

export function sellTrinket(run, slot) {
  open(run);
  const t = run.trinkets[slot];
  if (!t) return no('empty');
  const coins = Math.floor(listTrinket(run, t.id) / PRICES.sellDiv);
  run.trinkets.splice(slot, 1);
  run.jar += coins;
  fold(run, `sell:${slot}:${t.id}:${coins}`);
  return { ok: true, coins };
}

export function removeToken(run, symId) {
  const s = open(run);
  if (bagCount(run, symId) < 1) return no('not in bag');
  if (run.removals >= REMOVALS_PER_RUN) return no('no removals left');
  const price = priceOf(run, { kind: 'removal' });
  if (run.jar < price) return no('coins');
  run.jar -= price;
  run.bag[symId]--;
  if (!run.bag[symId]) delete run.bag[symId];
  run.removals++; s.removals++; // a free removal still uses one of the run's removals
  fold(run, `remove:${symId}:${price}`);
  return { ok: true, price };
}

export function reroll(run) {
  const s = open(run);
  const price = priceOf(run, { kind: 'reroll' });
  if (run.jar < price) return no('coins');
  run.jar -= price;
  s.reroll++;
  fill(run);
  fold(run, `reroll:${s.reroll}:${price}:${s.offers.map((o) => o && (o.id ?? o.sym)).join(',')}`);
  return { ok: true, price };
}

// Keep one offer for the next shop; locking the same offer again lifts the lock.
export function lockOffer(run, i) {
  const s = open(run);
  const o = s.offers[i];
  if (!o || o.sold) return no('sold');
  s.lock = s.lock === i ? null : i;
  fold(run, `lock:${s.lock}`);
  return { ok: true, lock: s.lock };
}
