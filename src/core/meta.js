// Meta progress (TECH.md section 2): Planks, boathouse, album, installments. Pure: the functions edit the save they are given
// (fields missing from an old save are filled in) and never read the clock. The caller writes the save afterwards.
// Save fields used: planks, installment (the one being played, 1-6), paid (installments paid, 0-6), builds[], notes (unlocked), firstRunBonus,
// album { trinkets{id: 1 seen | 2 won with}, symbols[], stamps[] }, stats { runs, wins, bestTide, bestSpin, clutches }, lastRewarded.
import { PLANKS } from './econ.js';
import { BUILDS, ALBUM, INSTALLMENTS_LITE, NOTES_LITE } from './data/unlocks.js';

export { tier } from './econ.js';

export function ensureMeta(save) {
  save.planks ??= 0; save.installment ??= 1; save.paid ??= 0; save.builds ??= []; save.notes ??= 0;
  save.album ??= {}; save.album.trinkets ??= {}; save.album.symbols ??= []; save.album.stamps ??= [];
  save.stats ??= {};
  for (const k of ['runs', 'wins', 'bestTide', 'bestSpin', 'clutches']) save.stats[k] ??= 0;
  return save;
}

// Album: kind 'trinkets' (level 1 or 2), 'symbols' or 'stamps'. Unknown ids are ignored.
export function albumAdd(save, kind, id, level = 1) {
  ensureMeta(save);
  if (!ALBUM[kind].includes(id)) return;
  if (kind === 'trinkets') save.album.trinkets[id] = Math.max(save.album.trinkets[id] ?? 0, level);
  else if (!save.album[kind].includes(id)) save.album[kind].push(id);
}

// Story: installment c is paid by winning a run played at c. Lite stops at 6; after that a win pays nothing new and shows no beat.
// -> { n: installment just paid, done: all 6 paid } or null.
export function advanceInstallment(save) {
  ensureMeta(save);
  if (save.paid >= INSTALLMENTS_LITE) return null;
  save.paid++;
  save.installment = Math.min(save.paid + 1, INSTALLMENTS_LITE);
  return { n: save.paid, done: save.paid === INSTALLMENTS_LITE };
}

// Call once for every finished run (won, lost, or Lamplight stopped), with runSummary(run). Optional summary fields:
// bag (symbols in the bag at the end) and stamps (creditor event ids cleared); runSummary does not carry them, the caller adds them.
// A second call with the same summary does nothing. -> { planks, parts, firstRun, note, beat, done } or null.
export function grantRunRewards(save, summary) {
  ensureMeta(save);
  const id = `${summary.seed}:${summary.hash}`;
  if (save.lastRewarded === id) return null;
  save.lastRewarded = id;
  const first = save.firstRunBonus !== false;
  const parts = {
    perTide: PLANKS.perTideCleared * summary.tidesCleared,
    win: summary.won ? PLANKS.winBonus : 0,
    clutch: PLANKS.clutch * summary.clutches, // a clutch is a tide whose quota is reached on its last spin
    first: first ? PLANKS.firstRun : 0,
  };
  const planks = parts.perTide + parts.win + parts.clutch + parts.first;
  save.planks += planks;
  save.firstRunBonus = false;
  const s = save.stats;
  s.runs++; s.clutches += summary.clutches;
  s.bestTide = Math.max(s.bestTide, summary.tidesCleared); s.bestSpin = Math.max(s.bestSpin, summary.bestSpin);
  if (summary.won) s.wins++;
  const adv = summary.won && summary.installment === save.installment ? advanceInstallment(save) : null;
  for (const tid of summary.trinkets ?? []) albumAdd(save, 'trinkets', tid, summary.won ? 2 : 1);
  for (const sym of Object.keys(summary.bag ?? {})) albumAdd(save, 'symbols', sym);
  for (const ev of summary.stamps ?? []) albumAdd(save, 'stamps', ev);
  const note = save.notes < NOTES_LITE ? ++save.notes : null; // every finished run reads the next note, in order
  return { planks, parts, firstRun: first, note, beat: adv?.n ?? null, done: adv?.done ?? false };
}

const byId = (id) => BUILDS.find((b) => b.id === id);
export const nextBuild = (save) => BUILDS.find((b) => !(save.builds ?? []).includes(b.id)) ?? null;

// -> { ok, reason: 'built' | 'order' | 'planks' | 'unknown' | null, cost }. Builds go in the fixed order, one at a time.
export function canBuild(save, id) {
  ensureMeta(save);
  const b = byId(id);
  if (!b) return { ok: false, reason: 'unknown', cost: 0 };
  if (save.builds.includes(id)) return { ok: false, reason: 'built', cost: b.cost };
  if (nextBuild(save).id !== id) return { ok: false, reason: 'order', cost: b.cost };
  if (save.planks < b.cost) return { ok: false, reason: 'planks', cost: b.cost };
  return { ok: true, reason: null, cost: b.cost };
}

export function build(save, id) {
  const c = canBuild(save, id);
  if (!c.ok) return c;
  save.planks -= c.cost;
  save.builds.push(id);
  return c;
}

// Ids for newRun({ unlocked }): 'start' plus every built pool build.
export const unlockedPool = (save) => ['start', ...BUILDS.filter((b) => b.pool && (save.builds ?? []).includes(b.id)).map((b) => b.id)];
export const hasFeature = (save, f) => BUILDS.some((b) => b.feature === f && (save.builds ?? []).includes(b.id));

// Mode gates (CONTENT.md section 5): Lamplight after a first win, Daily Tide after run 2, Tide Charts after installment 3 is paid.
export function modes(save) {
  ensureMeta(save);
  return { lamplight: save.stats.wins >= 1, daily: save.stats.runs >= 2, charts: save.paid >= 3 };
}

// Album completion 0-100 (floor), found of total over trinkets, symbols, creditor stamps and margin notes.
export function albumProgress(save) {
  ensureMeta(save);
  const found = { trinkets: Object.keys(save.album.trinkets).length, symbols: save.album.symbols.length, stamps: save.album.stamps.length, notes: Math.min(save.notes, NOTES_LITE) };
  let count = 0, total = 0;
  for (const k of Object.keys(found)) { count += found[k]; total += ALBUM[k].length; }
  return { found, total, count, percent: Math.floor((100 * count) / total) };
}
