// In-app purchases (MONETIZATION.md section 2, TECH.md section 8). All non-consumable; nothing here sells spins, pegs, coins, odds or random items.
// Web stub: entitlements live in localStorage and every purchase is labelled TEST. Native: RevenueCat, products fetched by store id.
// Entitlements come from the store's purchased-product list, so no RevenueCat entitlement setup is needed beyond the products themselves.
import { t, getLang } from '../i18n.js';
import { isNative, modal, env } from './platform.js';

// usd/try are starting prices (the store's price string wins on native). `lite` = ships in the soft-launch build.
export const PRODUCTS = Object.freeze([
  { id: 'remove_ads', type: 'non_consumable', usd: 3.99, try: 149.99, lite: true },
  { id: 'starter_pack', type: 'non_consumable', usd: 1.99, try: 79.99, lite: true },
  { id: 'pier_keeper', type: 'non_consumable', usd: 7.99, try: 299.99, lite: false },
  { id: 'pier_keeper_upgrade', type: 'non_consumable', usd: 4.99, try: 179.99, lite: false }, // only for owners of remove_ads; grants pier_keeper
  { id: 'cos_reels', type: 'non_consumable', usd: 2.99, try: 119.99, lite: false },
  { id: 'cos_deni', type: 'non_consumable', usd: 2.99, try: 119.99, lite: false },
  { id: 'cos_harbor', type: 'non_consumable', usd: 2.99, try: 119.99, lite: false },
]);
const IDS = PRODUCTS.map((p) => p.id);

// ---- pure rules --------------------------------------------------------------------------------
// `owned` is a plain { id: true } object (the save's `iap` cache).
export const owns = (owned, id) => !!owned[id] || (id === 'remove_ads' && !!owned.pier_keeper); // pier_keeper includes remove_ads
export function canBuy(owned, id) {
  if (!IDS.includes(id)) return { ok: false, reason: 'unknown_product' };
  if (id === 'pier_keeper_upgrade') {
    if (owned.pier_keeper) return { ok: false, reason: 'already_owned' };
    return owned.remove_ads ? { ok: true, reason: '' } : { ok: false, reason: 'needs_remove_ads' };
  }
  if (owns(owned, id)) return { ok: false, reason: 'already_owned' };
  if (id === 'pier_keeper' && owned.remove_ads) return { ok: false, reason: 'use_upgrade' };
  return { ok: true, reason: '' };
}
export const grant = (owned, id) => ({ ...owned, [id === 'pier_keeper_upgrade' ? 'pier_keeper' : id]: true });
// Store product ids (Play may append ":base") -> entitlement object.
export const ownedFromStore = (ids) => ids.map((s) => s.split(':')[0]).reduce((o, id) => (IDS.includes(id) ? grant(o, id) : o), {});

// ---- state -------------------------------------------------------------------------------------
const WEB_KEY = 'slp.iap.test.v1';
let owned = {};
let cache = null;
let onChange = () => {};
const store = () => { try { return globalThis.localStorage ?? null; } catch { return null; } };
const setOwned = (next) => {
  owned = next;
  if (cache) { for (const k of Object.keys(cache)) delete cache[k]; Object.assign(cache, owned); }
  onChange(owned);
};
const webLoad = () => { try { return JSON.parse(store()?.getItem(WEB_KEY) ?? '{}') || {}; } catch { return {}; } };
const webSave = (o) => { try { store()?.setItem(WEB_KEY, JSON.stringify(o)); } catch { /* blocked: lasts this session via `owned` */ } };

let purchases = null;
async function sdk() {
  if (!purchases) {
    purchases = (async () => {
      const m = await import('@revenuecat/purchases-capacitor');
      const apiKey = env('VITE_REVENUECAT_KEY');
      if (!apiKey) throw new Error('no RevenueCat key');
      await m.Purchases.configure({ apiKey });
      return m;
    })();
    purchases.catch(() => { purchases = null; });
  }
  return purchases;
}

// `cache` is the save's `iap` object (kept in place, an offline copy). Web reads the test store; native asks the store again and updates the cache.
export async function initIap({ cache: c, onChange: cb } = {}) {
  cache = c ?? null;
  if (cb) onChange = cb;
  owned = { ...(cache ?? {}) };
  if (!isNative()) { setOwned(webLoad()); return owned; }
  try {
    const { Purchases } = await sdk();
    const { customerInfo } = await Purchases.getCustomerInfo();
    setOwned(ownedFromStore(customerInfo.allPurchasedProductIdentifiers));
  } catch { /* offline or not configured: the cache stays */ }
  return owned;
}

export const has = (id) => owns(owned, id);

const webPrice = (p) => (getLang() === 'tr' ? `${p.try.toFixed(2).replace('.', ',')} TL` : `$${p.usd.toFixed(2)}`);

// -> [{ id, type, price, name, desc, owned, canBuy }]. By default only the soft-launch ids; pass { all: true } for the full list.
export async function getProducts({ all = false } = {}) {
  const list = PRODUCTS.filter((p) => all || p.lite);
  let prices = {};
  if (isNative()) {
    try {
      const { Purchases, PRODUCT_CATEGORY } = await sdk();
      const { products } = await Purchases.getProducts({ productIdentifiers: list.map((p) => p.id), type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
      prices = Object.fromEntries(products.map((p) => [p.identifier.split(':')[0], p.priceString]));
    } catch { /* no store: rows still list, with the default price */ }
  }
  return list.map((p) => ({
    id: p.id, type: p.type, price: prices[p.id] ?? webPrice(p),
    name: t(`store.${p.id}.name`), desc: t(`store.${p.id}.desc`),
    owned: owns(owned, p.id), canBuy: canBuy(owned, p.id).ok,
  }));
}

// -> { ok, reason }. reason: cancelled, already_owned, needs_remove_ads, use_upgrade, unknown_product, store_error
export async function purchase(id) {
  const c = canBuy(owned, id);
  if (!c.ok) return c;
  if (!isNative()) {
    const p = PRODUCTS.find((x) => x.id === id);
    const r = await modal({
      label: t('iap.testLabel'), title: t(`store.${id}.name`), body: t('iap.testBody', { price: webPrice(p) }),
      buttons: [{ id: 'buy', text: t('iap.testBuy'), primary: true }, { id: 'cancel', text: t('iap.cancel') }],
    });
    if (r.id !== 'buy') return { ok: false, reason: 'cancelled' };
    const next = grant(owned, id);
    webSave(next);
    setOwned(next);
    return { ok: true, reason: '' };
  }
  try {
    const { Purchases, PRODUCT_CATEGORY } = await sdk();
    const { products } = await Purchases.getProducts({ productIdentifiers: [id], type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
    if (!products.length) return { ok: false, reason: 'store_error' };
    const { customerInfo } = await Purchases.purchaseStoreProduct({ product: products[0] });
    setOwned(ownedFromStore(customerInfo.allPurchasedProductIdentifiers));
    const ok = has(id === 'pier_keeper_upgrade' ? 'pier_keeper' : id);
    return { ok, reason: ok ? '' : 'store_error' };
  } catch (e) {
    return { ok: false, reason: e?.userCancelled ? 'cancelled' : 'store_error' };
  }
}

// -> { restored: [ids that are owned now] }. Restores purchases only; progress is not part of it (the settings text says so).
export async function restore() {
  if (!isNative()) { setOwned(webLoad()); return { restored: IDS.filter((id) => owns(owned, id)) }; }
  try {
    const { Purchases } = await sdk();
    const { customerInfo } = await Purchases.restorePurchases();
    setOwned(ownedFromStore(customerInfo.allPurchasedProductIdentifiers));
  } catch { return { restored: [], error: true }; }
  return { restored: IDS.filter((id) => owns(owned, id)) };
}
