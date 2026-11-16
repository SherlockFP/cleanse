// Haptics (TECH.md section 2). Only for taps and real wins. Never on a miss, a Scorch or a reel stop (STORE.md checklist 16).
import { isNative } from './platform.js';

let enabled = true;
export const setHapticsEnabled = (on) => { enabled = !!on; };

async function native(fn) {
  try { const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics'); await fn(Haptics, ImpactStyle, NotificationType); } catch { /* plugin missing: stay silent */ }
}
// Chrome blocks (and logs) a vibrate before the first real tap, so none is asked for until then.
const web = (ms) => { try { if (globalThis.navigator?.userActivation?.hasBeenActive !== false) globalThis.navigator?.vibrate?.(ms); } catch { /* ignore */ } };

export const tick = () => { if (!enabled) return; if (isNative()) native((H, S) => H.impact({ style: S.Light })); else web(8); };
export const success = () => { if (!enabled) return; if (isNative()) native((H, _S, N) => H.notification({ type: N.Success })); else web([15, 40, 15]); };
