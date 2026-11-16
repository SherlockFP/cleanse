// Ads (MONETIZATION.md sections 3-5, TECH.md section 8). Rules are pure functions over a plain `ads` object (the save's `ads` field) so node can test them.
// The daily rewarded cap and the interstitial gap come from config.json (ads); the per-placement caps are below. The clock is passed in: `today` is a "YYYY-MM-DD" string, `now` is seconds.
// No interstitial inside a run; no reward ever touches spins, coins or odds (the two rewards are one free wagon reroll and Wax x2 at run end).
import { CONFIG } from '../core/data.js';
import { t } from '../i18n.js';
import { isNative, platform, modal, env, isProdBuild } from './platform.js';
import { getConsent, canRequestAds, isPersonalized } from './consent.js';
import { has as ownsProduct } from './iap.js';

export const AD_CAPS = Object.freeze({
  rewardedPerDay: CONFIG.ads.rewardedPerDay, shopRerollPerDay: 3, doubleWaxPerDay: 3,
  interstitialPerDay: 6, interstitialEveryRuns: 2, interstitialMinSeconds: CONFIG.ads.interstitialMinSeconds,
});
export const PLACEMENTS = Object.freeze({ shop_reroll: 'shopRerollPerDay', double_wax: 'doubleWaxPerDay' });
export const MIN_RUN_SECONDS = 60;      // MONETIZATION.md section 4: no interstitial after a shorter run
export const MIN_FINISHED_RUNS = 3;     // none before the 3rd finished run of an install (an ad after the 3rd is allowed)

export const freshAds = () => ({
  day: '', rewarded: {}, interstitials: 0, lastInterstitialAt: null, runsSinceInterstitial: 0,
  sessions: 0, finishedRuns: 0, lastRunSeconds: 0, rewardedSinceRun: false,
});

// ---- pure rules --------------------------------------------------------------------------------
export const rollDay = (ads, today) => (ads.day === today ? ads : { ...ads, day: today, rewarded: {}, interstitials: 0 });
export const rewardedToday = (ads) => Object.values(ads.rewarded).reduce((a, b) => a + b, 0);

// ctx: { today, inRun, canRequestAds } -> { ok, reason }
export function rewardedCheck(ads, placement, ctx) {
  const cap = PLACEMENTS[placement];
  if (!cap) return { ok: false, reason: 'unknown_placement' };
  if (ctx.inRun && placement !== 'shop_reroll') return { ok: false, reason: 'in_run' }; // the wagon reroll is the one reward offered between nights
  if (!ctx.canRequestAds) return { ok: false, reason: 'no_consent' };
  const a = rollDay(ads, ctx.today);
  if (rewardedToday(a) >= AD_CAPS.rewardedPerDay) return { ok: false, reason: 'daily_cap' };
  if ((a.rewarded[placement] ?? 0) >= AD_CAPS[cap]) return { ok: false, reason: 'placement_cap' };
  return { ok: true, reason: '' };
}
export const recordRewarded = (ads, placement, today) => {
  const a = rollDay(ads, today);
  return { ...a, rewarded: { ...a.rewarded, [placement]: (a.rewarded[placement] ?? 0) + 1 }, rewardedSinceRun: true };
};

// ctx: { today, now, inRun, slot, canRequestAds, removeAds } -> { ok, reason }. Slot is only 'after_run_end' (after the run end screen is closed).
export function interstitialCheck(ads, ctx) {
  const a = rollDay(ads, ctx.today);
  if (ctx.removeAds) return { ok: false, reason: 'remove_ads' };
  if (ctx.inRun) return { ok: false, reason: 'in_run' };
  if (ctx.slot !== 'after_run_end') return { ok: false, reason: 'bad_slot' };
  if (!ctx.canRequestAds) return { ok: false, reason: 'no_consent' };
  if (a.sessions <= 1) return { ok: false, reason: 'session_1' };
  if (a.finishedRuns < MIN_FINISHED_RUNS) return { ok: false, reason: 'too_few_runs' };
  if (a.lastRunSeconds < MIN_RUN_SECONDS) return { ok: false, reason: 'short_run' };
  if (a.rewardedSinceRun) return { ok: false, reason: 'rewarded_this_run' };
  if (a.interstitials >= AD_CAPS.interstitialPerDay) return { ok: false, reason: 'daily_cap' };
  if (a.runsSinceInterstitial < AD_CAPS.interstitialEveryRuns) return { ok: false, reason: 'every_n_runs' };
  if (a.lastInterstitialAt != null && ctx.now - a.lastInterstitialAt < AD_CAPS.interstitialMinSeconds) return { ok: false, reason: 'too_soon' };
  return { ok: true, reason: '' };
}
export const recordInterstitial = (ads, today, now) => {
  const a = rollDay(ads, today);
  return { ...a, interstitials: a.interstitials + 1, lastInterstitialAt: now, runsSinceInterstitial: 0 };
};
export const recordRunFinished = (ads, seconds) => ({ ...ads, finishedRuns: ads.finishedRuns + 1, runsSinceInterstitial: ads.runsSinceInterstitial + 1, lastRunSeconds: seconds, rewardedSinceRun: false });

// ---- module state ------------------------------------------------------------------------------
let ads = freshAds();
let onChange = () => {};
const clock = { today: () => new Date().toISOString().slice(0, 10), now: () => Date.now() / 1000 };
let removeAds = () => ownsProduct('remove_ads');
const commit = (next) => { Object.assign(ads, next); onChange(ads); };
const ctxNow = (extra = {}) => ({ today: clock.today(), now: clock.now(), canRequestAds: canRequestAds(getConsent()), removeAds: removeAds(), ...extra });

// `state` is the save's `ads` object (kept and mutated in place; onChange(state) says "write the save"). Counts one session per call: call once per boot.
export async function initAds({ state, onChange: cb, today, now, hasRemoveAds } = {}) {
  ads = state ? Object.assign(state, { ...freshAds(), ...state }) : freshAds();
  if (cb) onChange = cb;
  if (today) clock.today = today;
  if (now) clock.now = now;
  if (hasRemoveAds) removeAds = hasRemoveAds;
  commit({ ...rollDay(ads, clock.today()), sessions: ads.sessions + 1 });
  return ads;
}
export const adsState = () => ads;

// Call when a run ends (win or loss), before the run end screen's ad buttons. `seconds` = run length.
export const noteRunFinished = (seconds) => commit(recordRunFinished(ads, seconds));

// UI asks this to decide whether to draw the reward button. `inRun` must be true during a tide.
// shortcut: native returns true whenever caps and consent allow; the ad loads on tap and showRewarded reports no_fill if it fails. Preload when soft-launch data shows the wait hurts.
export const rewardedReady = (placement, { inRun = false } = {}) => rewardedCheck(ads, placement, ctxNow({ inRun })).ok;

// ---- ad unit ids -------------------------------------------------------------------------------
// Google's public test units. Release builds must carry real ids in env (docs/RELEASE.md) or no ad is requested.
const TEST_IDS = {
  android: { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' },
  ios: { rewarded: 'ca-app-pub-3940256099942544/1712485313', interstitial: 'ca-app-pub-3940256099942544/4411468910' },
};
function unitId(kind) {
  const real = env(kind === 'rewarded' ? 'VITE_ADMOB_REWARDED_ID' : 'VITE_ADMOB_INTERSTITIAL_ID');
  if (isProdBuild()) return real || null;
  return real || (TEST_IDS[platform()] ?? TEST_IDS.android)[kind];
}

let admob = null;
async function admobReady() {
  if (!admob) {
    admob = (async () => {
      const m = await import('@capacitor-community/admob');
      await m.AdMob.initialize({ initializeForTesting: !isProdBuild(), maxAdContentRating: m.MaxAdContentRating.MatureAudience, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false });
      return m;
    })();
    admob.catch(() => { admob = null; });
  }
  return admob;
}

// -> { rewarded, reason }. Any failure resolves rewarded:false.
async function nativeRewarded() {
  const adId = unitId('rewarded');
  if (!adId) return { rewarded: false, reason: 'no_ad_unit' };
  try {
    const { AdMob, RewardAdPluginEvents: E } = await admobReady();
    return await new Promise(async (resolve) => {
      let got = false;
      const hs = [];
      const end = (reason) => { hs.forEach((h) => h.remove()); resolve({ rewarded: got, reason: got ? '' : reason }); };
      hs.push(await AdMob.addListener(E.Rewarded, () => { got = true; }));
      hs.push(await AdMob.addListener(E.Dismissed, () => end('dismissed')));
      hs.push(await AdMob.addListener(E.FailedToShow, () => end('no_fill')));
      try {
        await AdMob.prepareRewardVideoAd({ adId, isTesting: !isProdBuild(), npa: !isPersonalized(getConsent()) });
        await AdMob.showRewardVideoAd();
      } catch { end('no_fill'); }
    });
  } catch { return { rewarded: false, reason: 'no_fill' }; }
}

async function nativeInterstitial() {
  const adId = unitId('interstitial');
  if (!adId) return false;
  try {
    const { AdMob, InterstitialAdPluginEvents: E } = await admobReady();
    return await new Promise(async (resolve) => {
      const hs = [];
      const end = (shown) => { hs.forEach((h) => h.remove()); resolve(shown); };
      hs.push(await AdMob.addListener(E.Dismissed, () => end(true)));
      hs.push(await AdMob.addListener(E.FailedToShow, () => end(false)));
      try {
        await AdMob.prepareInterstitial({ adId, isTesting: !isProdBuild(), npa: !isPersonalized(getConsent()) });
        await AdMob.showInterstitial();
      } catch { end(false); }
    });
  } catch { return false; }
}

// Web stub: a clearly labelled 3 second test ad, then the grant. The Close button works from the first second and gives no reward.
async function webRewarded() {
  const r = await modal({
    label: t('ads.testLabel'), title: t('ads.testTitle'), body: t('ads.testBody', { n: 3 }),
    buttons: [{ id: 'close', text: t('ads.close') }], autoMs: 3000, tick: (n) => t('ads.testBody', { n }),
  });
  return r.id === 'auto';
}

// ---- public ------------------------------------------------------------------------------------
// -> { rewarded, reason }. The caller grants the fixed reward only when rewarded is true.
export async function showRewarded(placement, { inRun = false } = {}) {
  const c = rewardedCheck(ads, placement, ctxNow({ inRun }));
  if (!c.ok) return { rewarded: false, reason: c.reason };
  const r = isNative() ? await nativeRewarded() : { rewarded: await webRewarded(), reason: 'closed' };
  if (!r.rewarded) return r;
  commit(recordRewarded(ads, placement, clock.today()));
  return { rewarded: true, reason: '' };
}

// Call after the run end screen closes. -> { shown, reason }. The web stub never shows one (TECH.md section 2).
export async function maybeShowInterstitial({ inRun = false, slot = 'after_run_end' } = {}) {
  const c = interstitialCheck(ads, ctxNow({ inRun, slot }));
  if (!c.ok) return { shown: false, reason: c.reason };
  if (!isNative()) return { shown: false, reason: 'web' };
  if (!(await nativeInterstitial())) return { shown: false, reason: 'no_fill' };
  commit(recordInterstitial(ads, clock.today(), clock.now()));
  return { shown: true, reason: '' };
}
