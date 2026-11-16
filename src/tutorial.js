// The guided first run (GDD.md section 14). No script of taps: the coach reads the run and says the one thing to do next, so a player
// who goes off the path is never stuck. Pure (core only), so scripts/smoke.mjs checks the seed without a browser.
import { snapshot } from './core/effects.js';
import { findPatterns } from './core/patterns.js';
import { applyGridEdits } from './core/machine.js';
import { TRICK } from './core/data.js';

export const TUTORIAL_SEED = 'first-night-14'; // set by scripts/find-tutorial-seed.mjs: spins 1 and 2 pay, spin 3 needs the Nudge
export const TUTORIAL_TERMS = 'steady';       // night 1 has no terms pick: five plain spins
export const TUTORIAL_CHARMS = ['moth_jar', 'tallow_stub', 'tea_leaves']; // the first wagon shows three fixed commons

// The column whose nudge (shift down by one) adds the most patterns to the result on screen, or null.
// -> { col, pocket, before, after }
export function nudgeHint(run) {
  if (run.phase !== 'post' || !run.grid) return null;
  const pocket = run.tricks.findIndex((id) => TRICK[id]?.op.type === 'shiftColumn');
  if (pocket < 0) return null;
  const mods = snapshot(run, run.grid, run.favs), g = run.grid, before = findPatterns(g, mods, run.favs).length;
  let best = null;
  for (let c = 0; c < 5; c++) {
    const after = findPatterns(applyGridEdits(g, [{ cell: c + 5, sym: g[c] }, { cell: c + 10, sym: g[c + 5] }, { cell: c, sym: g[c + 10] }]), mods, run.favs).length;
    if (after > before && (!best || after > best.after)) best = { col: c, pocket, before, after };
  }
  return best;
}

// The wagon and the deal are explained by Pip and Brimble (speech lines tutShop, tutDeal; src/main.js).
// What the coach says now: { key, cells? } or null. `seen` is a plain object the caller keeps for the run (one-time lines).
export function coachFor(run, seen = {}) {
  if (!run || run.debtIdx > 0) return null;
  const first = run.roundSerial <= 1;
  switch (run.phase) {
    case 'spin':
      if (first && run.spinInRound === 0) return { key: 'tut.spin' };
      if (first && run.spinInRound >= 3 && run.heat === 0 && !seen.stoke) return { key: 'tut.stoke' };
      return null;
    case 'post': {
      const h = nudgeHint(run);
      if (h && !seen.nudge) return { key: 'tut.nudge', cells: [h.col, h.col + 5, h.col + 10] };
      return first ? { key: 'tut.collect' } : null;
    }
    case 'roundend': return first ? { key: 'tut.end' } : null;
    case 'shop': return first ? { key: 'tut.shop' } : null;
    case 'deal': return { key: 'tut.deal' };
  }
  return null;
}
