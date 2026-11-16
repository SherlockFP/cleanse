// Haptics (TECH.md section 2). Only for pegs, taps and real wins. Never on a miss or a pair that did not complete (STORE.md checklist 16).
import { isNative } from './platform.js';

let enabled = true;
export const setHapticsEnabled = (on) => { enabled = !!on; };

async function native(fn) {
  try { const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics'); await fn(Haptics, ImpactStyle, NotificationType); } catch { /* plugin missing: stay silent */ }
}
const web = (ms) => { try { globalThis.navigator?.vibrate?.(ms); } catch { /* ignore */ } };

export const tick = () => { if (!enabled) return; if (isNative()) native((H, S) => H.impact({ style: S.Light })); else web(8); };
export const thud = () => { if (!enabled) return; if (isNative()) native((H, S) => H.impact({ style: S.Heavy })); else web(25); };
export const success = () => { if (!enabled) return; if (isNative()) native((H, _S, N) => H.notification({ type: N.Success })); else web([15, 40, 15]); };
