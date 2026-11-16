// Save (TECH.md section 3, web part). One JSON under slp.save.v1: { v, played, tutorialDone, eventSeen, run, runKind, runDate, runAt,
// daily, ads, iap, starterGranted } plus the meta fields that core/meta.js owns (planks, installment, paid, builds, notes, album, stats).
// run is the plain core run, so a resume gives the same future results (every draw is forked from run.seed by a label).
// runKind: 'story' | 'daily'. runDate: the local day a Daily Tide was started on. runAt: ms when the run started (ad pacing only).
// daily: core/daily.js streak fields plus { played, score, best, retry } (main.js). ads / iap: state objects the services edit in place.
// shortcut: localStorage only, no @capacitor/preferences, no export/import code yet; add both before a native release.
import { ensureMeta } from './core/meta.js';

const KEY = 'slp.save.v1';
export const VERSION = 1;
const mem = {}; // fallback when storage is blocked, and in node

export const fresh = () => ensureMeta({ v: VERSION, played: false, tutorialDone: false, eventSeen: 0, run: null, runKind: null, runDate: null, runAt: 0, daily: {}, ads: {}, iap: {} });

// Fill missing fields, drop a run that cannot be resumed. Old versions get their steps here.
export function migrate(s) {
  if (!s || typeof s !== 'object') return fresh();
  const out = ensureMeta({ ...fresh(), ...s, v: VERSION });
  for (const k of ['daily', 'ads', 'iap']) if (!out[k] || typeof out[k] !== 'object') out[k] = {};
  if (typeof s.runs === 'number') { out.stats.runs = Math.max(out.stats.runs, s.runs); delete out.runs; } // the pre-meta save counted runs at the top level
  if (!out.run || typeof out.run !== 'object' || out.run.v !== 1 || typeof out.run.seed !== 'number' || !out.run.bag) out.run = null;
  return out;
}

const store = () => { try { return globalThis.localStorage ?? null; } catch { return null; } };

export function loadSave() {
  let raw = null;
  try { raw = store()?.getItem(KEY) ?? mem[KEY] ?? null; } catch { raw = mem[KEY] ?? null; }
  if (!raw) return fresh();
  try { return migrate(JSON.parse(raw)); } catch { return fresh(); }
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
