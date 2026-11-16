// The guided first run (SPEC 2). A forced 27-step script of ONE action at a time (src/ui/coach.js draws the overlay: a dark screen with one hole,
// the pointing hand, a one-sentence caption). A step advances on its event, never on a timer; story panels advance on a tap.
// Pure (core only), so scripts/check-v3-core.mjs checks the seed without a browser.
import { snapshot } from './core/effects.js';
import { findPatterns } from './core/patterns.js';
import { applyGridEdits } from './core/machine.js';
import { TRICK, CHARM } from './core/data.js';
import { TUT_PURSE_FLOOR } from './core/run.js';

export const TUTORIAL_SEED = 'first-night-14'; // set by scripts/find-tutorial-seed.mjs (v3 rules: see there)
export const TUTORIAL_TERMS = 'steady';       // night 1 has no terms pick: five plain spins
export const TUTORIAL_CHARMS = ['moth_jar', 'tallow_stub', 'tea_leaves']; // the first stall shows three fixed commons; Auntie Beckon at Noticed adds a fourth
export { TUT_PURSE_FLOOR };

// {id, target (a layout anchor, SPEC 10.2), gesture, caption (an i18n key), until (an event on the bus, or 'tap')}
const S = (id, target, gesture, caption, until) => ({ id, target, gesture, caption, until });
export const TUTORIAL_STEPS = [
  S(1, 'story/p1', 'none', 'tut.p1', 'tap'),
  S(2, 'story/p2', 'none', 'tut.p2', 'tap'),
  S(3, 'story/p3', 'none', 'tut.p3', 'tap'),
  S(4, 'goalBar', 'tap', 'tut.goal', 'tap'),
  S(5, 'lever or spin', 'drag', 'tut.lever', 'spin'),
  S(6, 'pattern:0', 'tap', 'tut.line', 'tap'),
  S(7, 'scoreLine', 'tap', 'tut.math', 'tap'),
  S(8, 'special', 'tap', 'tut.special', 'tap'),
  S(9, 'lever or spin', 'drag', 'tut.lever2', 'spin'),
  S(10, 'purse', 'tap', 'tut.purse', 'tap'),
  S(11, 'spiceUp', 'tap', 'tut.spice', 'stoke'),
  S(12, 'lever or spin', 'drag', 'tut.lever3', 'spin'),
  S(13, 'kiosk', 'tap', 'tut.kiosk', 'kioskOpen'),
  S(14, 'kiosk.all', 'tap', 'tut.bankAll', 'bank'),
  S(15, 'kiosk.forecast', 'tap', 'tut.forecast', 'tap'),
  S(16, 'lever or spin', 'drag', 'tut.lastSpins', 'roundEnd'),
  S(17, 'nights', 'tap', 'tut.deadline', 'tap'),
  S(18, 'tin.offer.coins.small', 'tap', 'tut.offer', 'offering'),
  S(19, 'stall.charm:3', 'tap', 'tut.buy', 'buy'),
  S(20, 'stall.leave', 'tap', 'tut.leave', 'leaveShop'),
  S(21, 'terms:0', 'tap', 'tut.terms', 'pickTerms'),
  S(22, null, 'none', 'tut.free', 'debtPaid'),
  S(23, 'phone', 'tap', 'tut.phone', 'callOpen'),
  S(24, 'call.card:brimble', 'tap', 'tut.red', 'dealSheet'),
  S(25, 'deal.sign', 'tap', 'tut.deal', 'deal|dealBack'),
  S(26, 'call.card:gold', 'tap', 'tut.green', 'callPick'),
  S(27, 'lessons', 'none', 'tut.done', 'tap'),
];

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

// The stall and the deal are explained by Pip and Mr. Ruby (speech lines tutShop, tutDeal; src/main.js).
// What the coach says now: { key, cells? } or null. `seen` is a plain object the caller keeps for the run (one-time lines).
// After the tutorial it returns the first-time line for a system met for the first time (Review: teaching is one system). The caller
// sets seen[sys] = true once the line was shown. -> { key: 'ft.<sys>', sys } or null.
export function firstTime(run, seen = {}) {
  const hit = (sys, on) => on && !seen[sys] && { key: 'ft.' + sys, sys };
  const honkReady = run.charms.some((c) => CHARM[c.id].active && (c.charge ?? CHARM[c.id].active.need) >= CHARM[c.id].active.need);
  return hit('score', run.phase === 'post') || hit('himormme', run.phase === 'himOrMe') || hit('white', run.phase === 'call' && run.callOffer?.white) || hit('redeye', run.redEyes > 0)
    || hit('flareup', (run.stats.scorches || 0) > 0) || hit('wrath', Object.entries(run.spirits).some(([id, x]) => x.wrath > 0 && (run.unlocked ?? []).includes(id))) || hit('honk', run.phase === 'spin' && honkReady)
    || hit('blender', run.phase === 'shop' && run.debtIdx >= 1 && run.charms.length >= 2) || hit('curse', run.curses.length > 0) || null;
}

export function coachFor(run, seen = {}) {
  if (!run) return null;
  if (run.debtIdx > 0 || !run.tut) return firstTime(run, seen);
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
