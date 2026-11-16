// Services gate: ad caps and rules with injected dates, product list, entitlement rules, consent rules, the web stubs in node,
// i18n coverage for services, and the store listing word rules (STORE.md section 4). Run: node scripts/check-services.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { AD_CAPS } from '../src/core/econ.js';
import { STRINGS } from '../src/i18n.js';
import * as ads from '../src/services/ads.js';
import * as iap from '../src/services/iap.js';
import * as consent from '../src/services/consent.js';
import * as haptics from '../src/services/haptics.js';

let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };
const eq = (a, b, m) => { n++; assert.deepEqual(a, b, m); };

// ---- caps match MONETIZATION.md ----------------------------------------------------------------
eq({ ...AD_CAPS }, { rewardedPerDay: 7, doublePlanksPerDay: 3, skinPerDay: 1, dailyRetryPerDay: 1, postcardHintPerDay: 2, interstitialPerDay: 6, interstitialMinSeconds: 180, interstitialEveryRuns: 2 }, 'AD_CAPS');
eq(Object.keys(ads.PLACEMENTS).sort(), ['daily_retry', 'double_planks', 'postcard_hint', 'skin_day'], 'four rewarded placements only');
ok(!Object.keys(ads.PLACEMENTS).some((k) => /spin|peg|coin|trinket|reroll|odds|continue/.test(k)), 'no placement touches the reel');
ok(Object.values(ads.PLACEMENTS).reduce((a, k) => a + AD_CAPS[k], 0) === AD_CAPS.rewardedPerDay, 'placement caps add up to the daily total');

// ---- rewarded rules ----------------------------------------------------------------------------
const D1 = '2026-11-16', D2 = '2026-11-17';
const rc = (o = {}) => ({ today: D1, inRun: false, canRequestAds: true, ...o });
let a = ads.freshAds();
const redeem = (p, today = D1) => { const c = ads.rewardedCheck(a, p, rc({ today })); if (c.ok) a = ads.recordRewarded(a, p, today); return c; };
for (let i = 0; i < 3; i++) ok(redeem('double_planks').ok, `double ${i + 1}`);
eq(redeem('double_planks').reason, 'placement_cap', 'double 4th');
ok(redeem('skin_day').ok && !redeem('skin_day').ok, 'skin once a day');
ok(redeem('daily_retry').ok && !redeem('daily_retry').ok, 'retry once a day');
ok(redeem('postcard_hint').ok && redeem('postcard_hint').ok && !redeem('postcard_hint').ok, 'hint twice a day');
eq(ads.rewardedToday(a), 7, 'seven rewarded views in a day');
eq(ads.rewardedCheck({ ...ads.freshAds(), day: D1, rewarded: { double_planks: 2, skin_day: 1, daily_retry: 1, postcard_hint: 2, x: 1 } }, 'double_planks', rc()).reason, 'daily_cap', 'daily total binds on its own');
ok(ads.rewardedCheck(a, 'double_planks', rc({ today: D2 })).ok, 'new day resets');
eq(ads.rewardedCheck(ads.freshAds(), 'double_planks', rc({ inRun: true })).reason, 'in_run', 'never in a run');
eq(ads.rewardedCheck(ads.freshAds(), 'double_planks', rc({ canRequestAds: false })).reason, 'no_consent', 'consent');
eq(ads.rewardedCheck(ads.freshAds(), 'keepsake', rc()).reason, 'unknown_placement', 'removed Keepsake stays out');
ok(ads.rewardedCheck(ads.freshAds(), 'double_planks', rc({ removeAds: true })).ok, 'remove_ads does not remove reward ads');

// ---- interstitial rules ------------------------------------------------------------------------
const base = () => ({ ...ads.freshAds(), day: D1, sessions: 2, finishedRuns: 4, runsSinceInterstitial: 2, lastRunSeconds: 150 });
const ic = (o = {}) => ({ today: D1, now: 10000, inRun: false, slot: 'after_run_end', canRequestAds: true, removeAds: false, ...o });
const why = (st, c) => ads.interstitialCheck(st, c).reason;
ok(ads.interstitialCheck(base(), ic()).ok, 'base case shows');
eq(why(base(), ic({ removeAds: true })), 'remove_ads');
eq(why(base(), ic({ inRun: true })), 'in_run');
eq(why(base(), ic({ slot: 'app_open' })), 'bad_slot');
eq(why(base(), ic({ slot: 'resume' })), 'bad_slot');
eq(why(base(), ic({ canRequestAds: false })), 'no_consent');
eq(why({ ...base(), sessions: 1 }, ic()), 'session_1');
eq(why({ ...base(), finishedRuns: 2 }, ic()), 'too_few_runs');
ok(ads.interstitialCheck({ ...base(), finishedRuns: 3 }, ic()).ok, 'after the 3rd finished run is allowed');
eq(why({ ...base(), lastRunSeconds: 59 }, ic()), 'short_run');
ok(ads.interstitialCheck({ ...base(), lastRunSeconds: 60 }, ic()).ok, '60 s is long enough');
eq(why({ ...base(), rewardedSinceRun: true }, ic()), 'rewarded_this_run');
eq(why({ ...base(), interstitials: 6 }, ic()), 'daily_cap');
ok(ads.interstitialCheck({ ...base(), interstitials: 6, day: D1 }, ic({ today: D2 })).ok, 'daily cap resets on a new day');
eq(why({ ...base(), runsSinceInterstitial: 1 }, ic()), 'every_n_runs');
eq(why({ ...base(), lastInterstitialAt: 10000 - 179 }, ic()), 'too_soon');
ok(ads.interstitialCheck({ ...base(), lastInterstitialAt: 10000 - 180 }, ic()).ok, '180 s gap is enough');
ok(ads.interstitialCheck({ ...base(), lastInterstitialAt: 0 }, ic({ now: 500 })).ok, 'timestamp 0 is a real time, 500 s later is fine');
// rewarded flag: set by a reward, cleared by the next finished run
let st = ads.recordRewarded(base(), 'double_planks', D1);
eq(why(st, ic()), 'rewarded_this_run');
st = ads.recordRunFinished(st, 120);
ok(!st.rewardedSinceRun && st.runsSinceInterstitial === 3 && st.finishedRuns === 5, 'run end clears the flag and counts');

// ---- a 20-run session, 200 s apart, in the second session --------------------------------------
{
  let s = { ...ads.freshAds(), sessions: 2 }, t0 = 5000, shown = [], rewardedRuns = 0;
  for (let run = 1; run <= 20; run++) {
    const now = t0 + run * 200;
    s = ads.recordRunFinished(s, 180);
    if (run % 5 === 0) { s = ads.recordRewarded(s, 'double_planks', D1); rewardedRuns++; }
    const c = ads.interstitialCheck(s, ic({ now }));
    if (c.ok) { s = ads.recordInterstitial(s, D1, now); shown.push(run); }
  }
  ok(shown.length > 0 && shown.length <= AD_CAPS.interstitialPerDay, `20 runs: ${shown.length} interstitials within the daily cap`);
  ok(shown.every((r, i) => i === 0 || r - shown[i - 1] >= AD_CAPS.interstitialEveryRuns), 'at least 2 runs between interstitials');
  ok(shown.every((r) => r >= 3 && r % 5 !== 0), 'none before run 3, none after a rewarded run');
  ok(s.rewarded.double_planks === rewardedRuns && ads.rewardedToday(s) <= AD_CAPS.rewardedPerDay + rewardedRuns, 'counters tracked');
}

// ---- the module with a real injected clock, web stub path --------------------------------------
{
  const state = {}; let writes = 0, day = D1;
  await ads.initAds({ state, onChange: () => { writes++; }, today: () => day, now: () => 20000, hasRemoveAds: () => false });
  eq(state.sessions, 1, 'initAds counts the session in place');
  ok(!ads.rewardedReady('double_planks', { inRun: true }) && ads.rewardedReady('double_planks'), 'rewardedReady');
  eq((await ads.showRewarded('double_planks', { inRun: true })).reason, 'in_run');
  ok((await ads.showRewarded('double_planks')).rewarded, 'web stub grants after the test ad (no DOM in node: at once)');
  eq(state.rewarded.double_planks, 1, 'the cap counter lives in the save object');
  for (let i = 0; i < 2; i++) await ads.showRewarded('double_planks');
  eq((await ads.showRewarded('double_planks')).rewarded, false, '4th double refused');
  day = D2;
  ok((await ads.showRewarded('double_planks')).rewarded, 'next injected day grants again');
  ads.noteRunFinished(200);
  eq((await ads.maybeShowInterstitial()).shown, false, 'no interstitial in session 1, on the web never');
  ok(writes > 3, 'onChange fired');
}

// ---- products and entitlements -----------------------------------------------------------------
const want = { remove_ads: [3.99, 149.99], starter_pack: [1.99, 79.99], pier_keeper: [7.99, 299.99], pier_keeper_upgrade: [4.99, 179.99], cos_reels: [2.99, 119.99], cos_deni: [2.99, 119.99], cos_harbor: [2.99, 119.99] };
eq(iap.PRODUCTS.map((p) => p.id), Object.keys(want), 'seven product ids');
ok(iap.PRODUCTS.every((p) => p.type === 'non_consumable' && p.usd === want[p.id][0] && p.try === want[p.id][1]), 'all non-consumable, default prices match MONETIZATION.md');
eq(iap.PRODUCTS.filter((p) => p.lite).map((p) => p.id), ['remove_ads', 'starter_pack'], 'soft launch ships two');
ok(!iap.PRODUCTS.some((p) => /spin|peg|coin|plank|odds|crate|chest|pack_\d/.test(p.id) && p.id !== 'starter_pack'), 'no currency or random product');
ok(iap.owns({ pier_keeper: true }, 'remove_ads') && !iap.owns({}, 'remove_ads'), 'pier_keeper includes remove_ads');
eq(iap.canBuy({}, 'remove_ads').ok, true); eq(iap.canBuy({ remove_ads: true }, 'remove_ads').reason, 'already_owned');
eq(iap.canBuy({}, 'pier_keeper_upgrade').reason, 'needs_remove_ads'); eq(iap.canBuy({ remove_ads: true }, 'pier_keeper_upgrade').ok, true);
eq(iap.canBuy({ remove_ads: true }, 'pier_keeper').reason, 'use_upgrade'); eq(iap.canBuy({ pier_keeper: true }, 'pier_keeper_upgrade').reason, 'already_owned');
eq(iap.canBuy({}, 'coins_500').reason, 'unknown_product');
eq(iap.grant({ remove_ads: true }, 'pier_keeper_upgrade'), { remove_ads: true, pier_keeper: true }, 'upgrade grants pier_keeper');
eq(iap.ownedFromStore(['remove_ads', 'starter_pack:base', 'junk']), { remove_ads: true, starter_pack: true }, 'store ids map to entitlements');
{
  const cache = { starter_pack: true };
  await iap.initIap({ cache });
  ok(!iap.has('remove_ads'), 'web stub starts empty (node has no localStorage)');
  eq((await iap.purchase('remove_ads')).reason, 'cancelled', 'no DOM in node: the test dialog does not confirm, nothing is granted');
  eq((await iap.purchase('pier_keeper_upgrade')).reason, 'needs_remove_ads');
  eq((await iap.restore()).restored, [], 'web restore lists owned ids');
  const list = await iap.getProducts();
  eq(list.map((p) => p.id), ['remove_ads', 'starter_pack'], 'getProducts is the soft-launch list');
  eq((await iap.getProducts({ all: true })).length, 7);
}

// ---- consent -----------------------------------------------------------------------------------
{
  const f = consent.freshConsent();
  ok(consent.canRequestAds(f, false) && !consent.canRequestAds(consent.applyAgeGate(f, false), false), 'web: only a minor answer blocks');
  ok(!consent.canRequestAds(f, true), 'native: no ad before the age gate');
  const adult = consent.applyAgeGate(f, true);
  ok(!consent.canRequestAds(adult, true), 'native: adult but UMP unsettled blocks');
  ok(!consent.canRequestAds(consent.applyUmp(adult, 'REQUIRED'), true), 'native: consent required but not given blocks');
  ok(consent.canRequestAds(consent.applyUmp(adult, 'OBTAINED'), true) && consent.canRequestAds(consent.applyUmp(adult, 'NOT_REQUIRED'), true), 'native: obtained or not required opens');
  ok(!consent.canRequestAds(consent.applyUmp(consent.applyAgeGate(f, false), 'OBTAINED'), true), 'a minor never gets ads, even with UMP consent');
  ok(!consent.isPersonalized({ ...consent.applyUmp(adult, 'OBTAINED'), att: 'denied' }, true), 'ATT refusal means non-personalized');
  eq(consent.applyUmp(adult, 'weird').ads, 'unknown');
  ok((await consent.ensureConsent()).needsAgeGate, 'ensureConsent asks for the age gate first');
  ok(!(await consent.setAgeGate(false)).canRequestAds, 'age gate: minor');
  ok((await consent.setAgeGate(true)).canRequestAds, 'age gate: adult');
  eq(await consent.showPrivacyOptions(), false, 'web has no privacy options form');
}
haptics.tick(); haptics.thud(); haptics.success(); haptics.setHapticsEnabled(false); haptics.tick(); n++;

// ---- i18n coverage -----------------------------------------------------------------------------
for (const lang of ['en', 'tr']) {
  const S = STRINGS[lang];
  for (const p of iap.PRODUCTS) for (const part of ['name', 'desc']) ok(S[`store.${p.id}.${part}`], `${lang} store.${p.id}.${part}`);
  for (const p of Object.keys(ads.PLACEMENTS)) ok(S[`ads.watch.${p}`], `${lang} ads.watch.${p}`);
}

// ---- store listing word rules (STORE.md section 4) ---------------------------------------------
const ALWAYS = { en: ['casino', 'slot', 'slots', 'jackpot', 'bet', 'wager', 'payout', 'vegas', 'fortune', 'earn', 'spin', 'spins'], tr: ['casino', 'kazino', 'slot', 'jackpot', 'kumar', 'kumarhane', 'bahis', 'nakit', 'şans', 'talih', 'spin'] };
const PHRASES = { en: [/win cash/, /free spins/, /gambl\w*/], tr: [/kumar\w*/, /bedava çevir\w*/] };
const FAIR_ONLY = { en: ['real-money', 'prizes', 'prize'], tr: ['gerçek para', 'ödül'] };
const lens = { title: 30, subtitle: 30, short: 80, long: 4000 };
for (const [lang, file, title] of [['en', 'store/listing-en.md', 'Small Luck Pier'], ['tr', 'store/listing-tr.md', 'Küçük İskele']]) {
  const loc = lang === 'tr' ? 'tr' : 'en';
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const parts = raw.split(/^## /m).slice(1);
  const heads = parts.map((p) => p.split('\n')[0]);
  const noteAt = heads.findIndex((h) => /^(Notes|Notlar)/.test(h));
  ok(noteAt > 4, `${file}: has a Notes section after the store text`);
  const field = (i) => parts[i].split('\n').slice(1).join('\n').trim();
  const [tTitle, tSub, tShort, tLong] = [0, 1, 2, 3].map(field);
  eq(tTitle, title, `${file}: title`);
  ok(tSub.length <= lens.subtitle && tShort.length <= lens.short && tLong.length <= lens.long, `${file}: lengths ${tSub.length}/${tShort.length}/${tLong.length}`);
  const fairRe = lang === 'tr' ? /^Adil oyun:.*$/m : /^Fair play:.*$/m;
  const fair = tLong.match(fairRe)?.[0];
  ok(fair && tLong.trimEnd().endsWith(fair), `${file}: Fair play paragraph closes the long description`);
  const store = parts.slice(0, noteAt).map((p) => p.split('\n').slice(1).join('\n')).join('\n');
  const words = (s) => (s.toLocaleLowerCase(loc).match(/[\p{L}][\p{L}'’-]*/gu) ?? []).map((w) => w.split(/['’]/)[0]);
  for (const w of words(store)) ok(!ALWAYS[lang].includes(w), `${file}: banned word "${w}"`);
  for (const re of PHRASES[lang]) ok(!re.test(store.toLocaleLowerCase(loc)), `${file}: banned phrase ${re}`);
  const rest = store.replace(fair, '').toLocaleLowerCase(loc);
  for (const w of FAIR_ONLY[lang]) ok(!rest.includes(w), `${file}: "${w}" only in the Fair play paragraph`);
  ok(/for adults|yetişkinler içindir/i.test(fair), `${file}: says it is for adults`);
}
if (fs.readFileSync('public/privacy.html', 'utf8').includes('CONTACT_EMAIL_TODO')) console.log('note: privacy.html still has CONTACT_EMAIL_TODO (replace before release)');

console.log(`check-services ok (${n} checks)`);
