// Ads consent. v2 has no in-app age gate (virtual coins only).
// Web: no UMP, test ads only. Native: Google UMP form for EEA/UK/CH before the first ad request, iOS ATT after it; refusing ATT gives non-personalized ads.
// shortcut: own localStorage key instead of save.js (not in this lane); move it into the save when the meta lane adds consent there.
import { isNative, platform } from './platform.js';

const KEY = 'pact.consent';
const mem = {};

export const freshConsent = () => ({ ads: 'unknown', att: 'na' }); // ads: unknown | not_required | required | obtained

// Pure helpers (tested in scripts/check-services.mjs)
export const applyUmp = (c, status) => ({ ...c, ads: { NOT_REQUIRED: 'not_required', OBTAINED: 'obtained', REQUIRED: 'required' }[status] ?? 'unknown' });
// Native needs UMP settled. Web: the stub shows test ads, nothing leaves the device.
export const canRequestAds = (c, native = isNative()) => !native || c.ads === 'not_required' || c.ads === 'obtained';
export const isPersonalized = (c, native = isNative()) => canRequestAds(c, native) && c.att !== 'denied';

const store = () => { try { return globalThis.localStorage ?? null; } catch { return null; } };
export function getConsent() {
  let raw = null;
  try { raw = store()?.getItem(KEY) ?? mem[KEY] ?? null; } catch { raw = mem[KEY] ?? null; }
  try { return { ...freshConsent(), ...(raw ? JSON.parse(raw) : {}) }; } catch { return freshConsent(); }
}
function put(c) {
  const raw = JSON.stringify(c);
  mem[KEY] = raw;
  try { store()?.setItem(KEY, raw); } catch { /* blocked: memory copy lasts the session */ }
  return c;
}
const view = (c) => ({ ...c, canRequestAds: canRequestAds(c), personalized: isPersonalized(c) });

// Boot step: returns { personalized, canRequestAds, ads, att }.
export async function ensureConsent() {
  let c = getConsent();
  if (!isNative()) return view(c);
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    let info = await AdMob.requestConsentInfo();
    if (info.status === 'REQUIRED' && info.isConsentFormAvailable) info = await AdMob.showConsentForm();
    c = applyUmp(c, info.status);
    if (platform() === 'ios') {
      await AdMob.requestTrackingAuthorization();
      c = { ...c, att: (await AdMob.trackingAuthorizationStatus()).status === 'authorized' ? 'authorized' : 'denied' };
    }
  } catch { /* leave ads 'unknown': no ad is requested until a later boot settles it */ }
  return view(put(c));
}

// Settings entry "Ad choices": reopens the UMP privacy options form where the region needs one. Resolves false on the web.
export async function showPrivacyOptions() {
  if (!isNative()) return false;
  try { const { AdMob } = await import('@capacitor-community/admob'); await AdMob.showPrivacyOptionsForm(); return true; } catch { return false; }
}
