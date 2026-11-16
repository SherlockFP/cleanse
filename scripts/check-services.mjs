// Services gate: ad caps and rules with injected dates, the product list, entitlement rules, consent rules, and the strings the
// services print. No browser, no SDK. Run: node scripts/check-services.mjs
import assert from 'node:assert/strict';
import { CONFIG } from '../src/core/data.js';
import { STRINGS } from '../src/i18n.js';
import * as ads from '../src/services/ads.js';
import * as iap from '../src/services/iap.js';
import * as consent from '../src/services/consent.js';

let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };
const eq = (a, b, m) => { n++; assert.deepEqual(a, b, m); };

// ---- caps match config.json and GDD section 16 ----
eq(Object.keys(ads.PLACEMENTS).sort(), [...CONFIG.ads.rewardedGrants].sort(), 'rewarded placements are the grants in config.json');
ok(!Object.keys(ads.PLACEMENTS).some((k) => /spin|coin|odds|luck|continue|round/.test(k)), 'no placement sells a spin, coins or odds');
eq(ads.AD_CAPS.rewardedPerDay, 6); eq(ads.AD_CAPS.interstitialMinSeconds, 180);

// ---- rewarded rules ----
const D1 = '2026-11-16', D2 = '2026-11-17';
const rc = (o = {}) => ({ today: D1, inRun: false, canRequestAds: true, ...o });
let a = ads.freshAds();
const redeem = (p, o) => { const c = ads.rewardedCheck(a, p, rc(o)); if (c.ok) a = ads.recordRewarded(a, p, o?.today ?? D1); return c; };
for (let i = 0; i < 3; i++) ok(redeem('double_wax').ok, `double wax ${i + 1}`);
eq(redeem('double_wax').reason, 'placement_cap');
ok(redeem('shop_reroll', { inRun: true }).ok, 'the wagon reroll is offered inside a run');
eq(ads.rewardedCheck(a, 'double_wax', rc({ inRun: true, today: D2 })).reason, 'in_run', 'double wax only after the run');
ok(redeem('shop_reroll').ok && redeem('shop_reroll').ok);
eq(redeem('shop_reroll').reason, 'daily_cap', 'six a day in all');
ok(redeem('double_wax', { today: D2 }).ok, 'caps reset the next day');
eq(ads.rewardedCheck(a, 'free_spin', rc()).reason, 'unknown_placement');
eq(ads.rewardedCheck(a, 'double_wax', rc({ canRequestAds: false, today: D2 })).reason, 'no_consent');

// ---- interstitial rules: only after a run, never early, never with remove ads, at most one per 180 s ----
const ic = (o = {}) => ({ today: D1, now: 1000, inRun: false, slot: 'after_run_end', canRequestAds: true, removeAds: false, ...o });
let b = { ...ads.freshAds(), sessions: 2 };
eq(ads.interstitialCheck(b, ic()).reason, 'too_few_runs', 'never in the first runs');
for (let i = 0; i < 3; i++) b = ads.recordRunFinished(b, 200);
ok(ads.interstitialCheck(b, ic()).ok, 'after the 3rd finished run');
eq(ads.interstitialCheck(b, ic({ inRun: true })).reason, 'in_run');
eq(ads.interstitialCheck(b, ic({ slot: 'shop' })).reason, 'bad_slot');
eq(ads.interstitialCheck(b, ic({ removeAds: true })).reason, 'remove_ads');
eq(ads.interstitialCheck({ ...b, sessions: 1 }, ic()).reason, 'session_1');
eq(ads.interstitialCheck(ads.recordRunFinished(b, 20), ic()).reason, 'short_run');
b = ads.recordInterstitial(b, D1, 1000);
b = ads.recordRunFinished(ads.recordRunFinished(b, 200), 200);
eq(ads.interstitialCheck(b, ic({ now: 1100 })).reason, 'too_soon');
ok(ads.interstitialCheck(b, ic({ now: 1181 })).ok, '180 s later');
eq(ads.interstitialCheck(ads.recordRewarded(b, 'double_wax', D1), ic({ now: 1181 })).reason, 'rewarded_this_run', 'no interstitial after a watched reward ad');

// ---- products: remove ads, starter pack, cosmetics. Nothing random, nothing that plays for you ----
const ids = iap.PRODUCTS.map((p) => p.id);
eq(ids, ['remove_ads', 'starter_pack', 'cos_machine', 'cos_hats', 'cos_wallpaper']);
ok(iap.PRODUCTS.every((p) => p.type === 'non_consumable'), 'no consumables: nothing is bought twice');
ok(iap.owns({ starter_pack: true }, 'remove_ads') && !iap.owns({}, 'remove_ads'), 'the starter pack includes remove ads');
eq(iap.canBuy({ remove_ads: true }, 'remove_ads').reason, 'already_owned');
eq(iap.canBuy({}, 'spins_10').reason, 'unknown_product');
eq(iap.ownedFromStore(['remove_ads:base', 'junk']), { remove_ads: true });
eq((await iap.getProducts()).map((p) => p.id), ['remove_ads', 'starter_pack'], 'the game lists only what exists');
for (const lang of ['en', 'tr', 'th']) for (const id of ids) ok(STRINGS[lang][`store.${id}.name`] && STRINGS[lang][`store.${id}.desc`], `${lang}: store text for ${id}`);
for (const p of Object.keys(ads.PLACEMENTS)) ok(STRINGS.en[`ads.watch.${p}`], `button text for ${p}`);

// ---- consent: no age gate; native waits for UMP ----
const c0 = consent.freshConsent();
ok(consent.canRequestAds(c0, false), 'web: test ads only, nothing to ask');
ok(!consent.canRequestAds(c0, true), 'native: no request before UMP settles');
ok(consent.canRequestAds(consent.applyUmp(c0, 'OBTAINED'), true) && consent.canRequestAds(consent.applyUmp(c0, 'NOT_REQUIRED'), true));
ok(!consent.isPersonalized({ ...consent.applyUmp(c0, 'OBTAINED'), att: 'denied' }, true), 'ATT refused: non-personalized');
ok(!('age' in c0) && !consent.setAgeGate, 'no age gate');

console.log(`check-services ok (${n} checks)`);
