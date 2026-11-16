// Daily run: same seed for everyone on a UTC date. No clock here: the caller passes 'YYYY-MM-DD'.
import { makeRng } from './rng.js';
import { CHARS, STAKES, CURSES, CONFIG } from './data.js';
import { newRun } from './run.js';

export const dailySeed = (dateUTC) => 'daily-' + dateUTC;

export function dailySetup(seed) {
  const rng = makeRng(seed);
  return {
    charId: rng.pick(CHARS).id,
    contractId: 'c2',
    forcedTerms: rng.pick(STAKES.filter((s) => s.minDebt === 1)).id,
    curse: rng.pick(CURSES).id,
  };
}

export function newDailyRun(dateUTC) {
  const seed = dailySeed(dateUTC);
  const s = dailySetup(seed);
  return newRun({ seed, contractId: s.contractId, charId: s.charId, daily: { forcedTerms: s.forcedTerms, curse: s.curse } });
}

// Days since 1970-01-01 for a 'YYYY-MM-DD' string (civil calendar maths, no Date).
export function dayNum(s) {
  let [y, m, d] = s.split('-').map(Number);
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

// Only the first attempt of a day is scored (and pays Wax). Score = debts paid, then coins.
export function recordDaily(meta, dateUTC, summary) {
  const d = meta.daily;
  const score = { debts: summary.debtsPaid, coins: summary.coins };
  if (d.date === dateUTC) return { first: false, score, wax: 0, best: d.best, streak: d.streak };
  d.streak = d.date && dayNum(dateUTC) === dayNum(d.date) + 1 ? d.streak + 1 : 1;
  d.date = dateUTC;
  d.best = score;
  d.done++;
  meta.stash = (meta.stash || 0) + CONFIG.wax.dailyRun; // v3 renamed wax to stash
  return { first: true, score, wax: CONFIG.wax.dailyRun, best: score, streak: d.streak };
}
