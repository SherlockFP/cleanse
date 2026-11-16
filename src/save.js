// Save (TECH.md section 3, web part). One JSON under slp.save.v1: { v, played, tutorialDone, runs, eventSeen, run }.
// run is the plain core run, so a resume gives the same future results (every draw is forked from run.seed by a label).
// shortcut: localStorage only, no @capacitor/preferences, no export/import code yet; add both with the meta lane.
const KEY = 'slp.save.v1';
export const VERSION = 1;
const mem = {}; // fallback when storage is blocked, and in node

export const fresh = () => ({ v: VERSION, played: false, tutorialDone: false, runs: 0, eventSeen: 0, run: null });

// Fill missing fields, drop a run that cannot be resumed. Old versions get their steps here.
export function migrate(s) {
  if (!s || typeof s !== 'object') return fresh();
  const out = { ...fresh(), ...s, v: VERSION };
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
