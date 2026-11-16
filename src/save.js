// Save v2 (docs/v2/TECH.md section 6). One JSON under pact.save: { v: 2, meta, run, runAt, runDate, ads, iap, starterGranted }.
// meta is core/meta.js newMeta() (plus `cleared`: contract ids won). run is the plain core run: its rng streams are counted in
// run.rngState, so a reloaded run has the same future. runAt: ms when the run started (ad pacing only). runDate: the UTC day of a daily run.
// ads / iap: state objects the services edit in place.
// shortcut: localStorage only, no @capacitor/preferences (not installed); add it before a native release so the OS cannot evict the save.
import { newMeta } from './core/meta.js';
import { CONTRACT, CHAR } from './core/data.js';

const KEY = 'pact.save', V1_KEY = 'slp.save.v1';
export const VERSION = 2;
const mem = {}; // fallback when storage is blocked, and in node

// lang null: the UI takes the device language until the player picks one
export const fresh = () => ({ v: VERSION, meta: (() => { const m = { ...newMeta(), cleared: [] }; m.settings.lang = null; return m; })(), run: null, runAt: 0, runDate: null, ads: {}, iap: {}, starterGranted: false });

const obj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

// Fill missing fields, drop a run that cannot be resumed.
export function migrate(s) {
  if (!obj(s) || s.v !== VERSION) return fresh();
  const base = fresh(), out = { ...base, ...s, meta: { ...base.meta, ...(obj(s.meta) ? s.meta : {}) } };
  for (const k of ['stats', 'daily', 'iap', 'settings']) out.meta[k] = { ...base.meta[k], ...(obj(out.meta[k]) ? out.meta[k] : {}) };
  for (const k of ['hideout', 'achievements', 'chars', 'contracts', 'seenCharms', 'endings', 'charWins', 'cleared']) if (!Array.isArray(out.meta[k])) out.meta[k] = base.meta[k];
  for (const k of ['ads', 'iap']) if (!obj(out[k])) out[k] = {};
  const r = out.run;
  if (!obj(r) || r.v !== 2 || typeof r.seed !== 'string' || !obj(r.rngState) || !CONTRACT[r.contract] || !CHAR[r.char] || !Array.isArray(r.charms)) out.run = null;
  return out;
}

const store = () => { try { return globalThis.localStorage ?? null; } catch { return null; } };
const read = (k) => { try { return store()?.getItem(k) ?? mem[k] ?? null; } catch { return mem[k] ?? null; } };

export function loadSave() {
  const raw = read(KEY);
  if (raw) { try { return migrate(JSON.parse(raw)); } catch { return fresh(); } }
  const s = fresh();
  // A v1 save is not carried over, except the one purchase it could hold.
  try { if (JSON.parse(read(V1_KEY) ?? 'null')?.iap?.remove_ads) { s.iap.remove_ads = true; s.meta.iap.noAds = true; } } catch { /* unreadable v1 save: ignore */ }
  return s;
}

export function writeSave(save) {
  const raw = JSON.stringify(save);
  mem[KEY] = raw;
  try { store()?.setItem(KEY, raw); } catch { /* blocked or full: the memory copy still works this session */ }
}

export function resetSave() {
  delete mem[KEY];
  try { store()?.removeItem(KEY); } catch { /* ignore */ }
  return fresh();
}
