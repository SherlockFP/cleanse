// The Red Eye (SPEC 4.3): a bad-omen symbol placed by an event, never rolled, never touched by Luck.
import { CONFIG } from './data.js';
import { stream } from './streams.js';
import { snapshot } from './effects.js';

export const EYE_CELLS = [6, 7, 8];
export const EYE_BASE = 1.5, EYE_STEP = 0.5, EYE_MAX = 6;

// Percent chance per spin. 0 on debts 1 and 2 (Storm 7: from debt 2; Postcard Staring Contest: from debt 1; its extra points come from its redEyeRate flag).
export function redEyeChance(run, mods = snapshot(run)) {
  const f = mods.flags;
  if (f.noRedEye) return 0;
  const debt = run.debtIdx + 1, staring = !!run.postcards?.includes('staring_contest');
  const first = (run.storm || 0) >= 7 ? 2 : 3;
  if (debt < first && !staring) return 0;
  let p = Math.min(EYE_MAX, EYE_BASE + EYE_STEP * (Math.max(debt, 3) - 3)) + (f.redEyeRate || 0);
  return Math.max(0, p);
}

// 1 to 3 by debt, less redEyeSoft (min 0).
export function redEyeLevel(run, mods = snapshot(run)) {
  const debt = run.debtIdx + 1;
  return Math.max(0, (debt >= 7 ? 3 : debt >= 5 ? 2 : debt >= 3 ? 1 : 0) - (mods.flags.redEyeSoft || 0));
}

// Rolls the omen stream (one draw a spin, so the stream stays in step) and returns the grid with the eyes in place, or null.
export function rollRedEye(run, grid, mods) {
  const p = redEyeChance(run, mods), hit = stream(run, 'omen').next() * 100 < p;
  if (!hit) return null;
  const g = grid.slice();
  for (const c of EYE_CELLS) g[c] = 'redeye';
  return g;
}
export const hasEye = (grid) => !!grid && grid.includes('redeye');
export const eyeInfo = (run) => { const m = snapshot(run); return { level: redEyeLevel(run, m), blessed: !!m.flags.redEyeBless }; };
