// Save v3 (docs/v3/SPEC.md section 9). One JSON under pact.save: { v: 3, meta, run, runAt, runDate, ads, iap, starterGranted }.
// A v2 save migrates: wax -> stash, hideout items -> Notebook Home nodes (and stay in the hideout list, which still holds their effects), cleared contracts -> bronze stamps,
// the spirits of every cleared place open; a v2 run is upgraded in place (core/run.js upgradeRun).
// meta is core/meta.js newMeta() (plus `cleared`: contract ids won). run is the plain core run: its rng streams are counted in
// run.rngState, so a reloaded run has the same future. runAt: ms when the run started (ad pacing only). runDate: the UTC day of a daily run.
// ads / iap: state objects the services edit in place.
// shortcut: localStorage only, no @capacitor/preferences (not installed); add it before a native release so the OS cannot evict the save.
import { newMeta, unlockSpirits } from './core/meta.js';
import { upgradeRun } from './core/run.js';
import { CONTRACT, CHAR, NODE, HIDE } from './core/data.js';

const KEY = 'pact.save', V1_KEY = 'slp.save.v1';
export const VERSION = 3;
const mem = {}; // fallback when storage is blocked, and in node

// lang null: the UI takes the device language until the player picks one
export const fresh = () => ({ v: VERSION, meta: (() => { const m = { ...newMeta(), cleared: [] }; m.settings.lang = null; return m; })(), run: null, runAt: 0, runDate: null, ads: {}, iap: {}, starterGranted: false });

const obj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

// Fill missing fields, drop a run that cannot be resumed.
const OBJ_KEYS = ['stats', 'daily', 'iap', 'settings', 'keys', 'codex', 'stamps', 'storm', 'devotion', 'goals'];
const ARR_KEYS = ['hideout', 'achievements', 'chars', 'contracts', 'seenCharms', 'endings', 'charWins', 'cleared', 'notebook', 'lockers', 'postcards', 'spirits', 'lessons', 'milestones', 'charmsOpen'];

// v2 -> v3 on the meta only; the generic fill below supplies every other new field.
function upgradeMeta(m, cleared) {
  m.stash = (Number(m.stash) || 0) + (Number(m.wax) || 0);
  delete m.wax;
  const mapped = (Array.isArray(m.hideout) ? m.hideout : []).map((id) => `home_${String(HIDE[id]?.order ?? 0).padStart(2, '0')}`).filter((id) => NODE[id]);
  m.notebook = [...new Set([...(Array.isArray(m.notebook) ? m.notebook : []), ...mapped])];
  m.stamps = obj(m.stamps) ? m.stamps : {};
  for (const c of Array.isArray(cleared) ? cleared : []) if (CONTRACT[c]) m.stamps[c] = { bronze: true, silver: false, gold: false };
}

// Fill missing fields, drop a run that cannot be resumed.
export function migrate(s) {
  if (!obj(s) || (s.v !== 2 && s.v !== VERSION)) return fresh();
  const base = fresh(), out = { ...base, ...s, v: VERSION, meta: { ...base.meta, ...(obj(s.meta) ? s.meta : {}) } };
  if (s.v === 2) upgradeMeta(out.meta, s.meta?.cleared ?? s.cleared);
  for (const k of OBJ_KEYS) out.meta[k] = { ...base.meta[k], ...(obj(out.meta[k]) ? out.meta[k] : {}) };
  for (const k of ARR_KEYS) if (!Array.isArray(out.meta[k])) out.meta[k] = base.meta[k];
  if (!Array.isArray(out.meta.luggage) || out.meta.luggage.length !== 4) out.meta.luggage = [null, null, null, null];
  if (s.v === 2) for (const c of out.meta.cleared) unlockSpirits(out.meta, c);
  for (const k of ['ads', 'iap']) if (!obj(out[k])) out[k] = {};
  const r = out.run;
  if (!obj(r) || (r.v !== 2 && r.v !== 3) || typeof r.seed !== 'string' || !obj(r.rngState) || !CONTRACT[r.contract] || !CHAR[r.char] || !Array.isArray(r.charms)) out.run = null;
  else out.run = upgradeRun(r);
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
