// Daily Tide seeds and the streak calendar (GDD.md section 9). Pure: dates arrive as 'YYYY-MM-DD' strings from main.js,
// and the calendar maths below is done by hand because core never touches Date.
import { hashSeed, makeRng } from './rng.js';
import { CHARTS } from './data/charts.js';
import { EVENTS } from './data/events.js';
import { TRINKETS } from './data/trinkets.js';
import { PLANKS } from './econ.js';
import { ensureMeta } from './meta.js';

function parse(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) throw new Error('bad date ' + dateStr);
  return [+m[1], +m[2], +m[3]];
}

// Days since 1970-01-01 (Hinnant's days_from_civil).
function dayNumber(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400), yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
}
export const days = (dateStr) => dayNumber(...parse(dateStr));

// ISO week as '2026-W47'. 1970-01-01 was a Thursday; Monday = 0.
export function isoWeek(n) {
  const thursday = n - ((n + 3) % 7 + 7) % 7 + 3;
  let y = Math.floor(thursday / 365.2425) + 1970;
  while (dayNumber(y, 1, 1) > thursday) y--;
  while (dayNumber(y + 1, 1, 1) <= thursday) y++;
  return `${y}-W${String(Math.floor((thursday - dayNumber(y, 1, 1)) / 7) + 1).padStart(2, '0')}`;
}

export const dailySeed = (dateStr) => { parse(dateStr); return hashSeed('daily:' + dateStr); };

// Same date, same setup, on every device and at every unlock stage: only the start pool, an installment 1 tier, and
// a start trinket (grade 1, start pool), a chart and a creditor drawn from the date. Pass it to newRun as is.
export function dailySetup(dateStr) {
  const seed = dailySeed(dateStr), rng = makeRng(seed);
  return {
    seed, installment: 1, unlocked: ['start'],
    startTrinket: rng.fork('daily:trinket').pick(TRINKETS.filter((x) => x.grade === 1 && x.unlock === 'start')).id,
    chartId: rng.fork('daily:chart').pick(CHARTS).id,
    eventId: rng.fork('daily:event').pick(EVENTS).id,
  };
}

// Call when a Daily Tide is finished on dateStr. Counts the day once, pays Planks (Daily +5 and the 7-day streak bonus), and edits save.daily.
// A gap of exactly one missed day keeps the streak if that ISO week has not used its forgiveness yet; any longer gap restarts at 1.
// A date before the last finished day (clock moved back) changes nothing. -> { counted, streak, forgiven, planks }.
export function streakUpdate(save, dateStr) {
  ensureMeta(save);
  const d = (save.daily ??= {});
  const today = days(dateStr), last = d.lastDone ? days(d.lastDone) : null;
  if (last !== null && today <= last) return { counted: false, streak: d.streak ?? 0, forgiven: false, planks: 0 };
  let forgiven = false;
  const gap = last === null ? null : today - last;
  if (gap === 1) d.streak = (d.streak ?? 0) + 1;
  else if (gap === 2 && d.forgiveUsedWeek !== isoWeek(today - 1)) {
    d.streak = (d.streak ?? 0) + 1;
    d.forgiveUsedWeek = isoWeek(today - 1);
    forgiven = true;
  } else d.streak = 1;
  d.lastDone = dateStr;
  d.date = dateStr;
  const planks = PLANKS.dailyTide + PLANKS.streak[(d.streak - 1) % PLANKS.streak.length];
  save.planks += planks;
  return { counted: true, streak: d.streak, forgiven, planks };
}
