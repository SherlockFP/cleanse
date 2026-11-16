// Run state machine (TECH.md section 2, GDD.md sections 5-7). Pure.
// A run is plain JSON: JSON.parse(JSON.stringify(run)) resumes with the same future results, because every draw
// is forked from run.seed by a label (TECH.md section 4) and no rng object is stored.
// phase: 'tide' (spin and peg) -> endTide -> 'shop' -> nextTide -> 'tide' ...; after tide 5 'lamplight' (the choice) -> enterLamplight -> 'shop'; 'over'.
import { makeRng, hashSeed } from './rng.js';
import { makeBag, drawGrid, scoreSpin } from './reel.js';
import { applyTrinkets, scoringState, settleSpin } from './trinkets.js';
import { SYMBOLS } from './data/symbols.js';
import { CHARTS } from './data/charts.js';
import { EVENTS } from './data/events.js';
import { QUOTA, baseQuota, tier, SPINS_PER_TIDE, PEGS_PER_TIDE, TIDES_PER_RUN, MERCY_GAP } from './econ.js';

export const chartOf = (run) => CHARTS.find((c) => c.id === run.chartId)?.mods ?? {};
export const eventOf = (run) => EVENTS.find((e) => e.id === run.event)?.mods ?? {};

// Folds an input or an outcome into the run hash (TECH.md section 4). shop.js calls it for every shop action.
export function fold(run, str) {
  run.h = hashSeed(run.h + '|' + str);
}
export const runHash = (run) => run.h.toString(16).padStart(8, '0');

export function newRun({ seed, installment = 1, chartId = null, startTrinket = null, unlocked = ['start'], eventId = null } = {}) {
  if (chartId && !CHARTS.some((c) => c.id === chartId)) throw new Error('unknown chart ' + chartId);
  if (eventId && !EVENTS.some((e) => e.id === eventId)) throw new Error('unknown event ' + eventId);
  const base = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;
  const run = {
    v: 1, seed: base, installment, chartId, fixedEvent: eventId, unlocked: [...new Set(['start', ...unlocked])],
    h: hashSeed(`run:${base}:${installment}:${chartId}:${startTrinket}`),
    phase: 'tide', won: false, tide: 0, spin: 0, spinsMax: 0, pegsMax: 0, quota: 0, event: null,
    jar: chartOf({ chartId }).startCoins ?? 0, jarBeforeLast: 0, grid: null, held: [],
    bag: Object.fromEntries(SYMBOLS.filter((s) => s.start > 0).map((s) => [s.id, s.start])),
    trinkets: startTrinket ? [{ id: startTrinket }] : [],
    kelp: 1, prevZero: false, mercyUsed: 0, removals: 0, bought: {}, shopVisit: 0, shop: null, carry: null,
    stats: { tidesCleared: 0, clutches: 0, bestSpin: 0, coins: 0 },
  };
  startTide(run);
  return run;
}

const scoring = (run) => scoringState({
  trinkets: run.trinkets, spin: run.spin, spins: run.spinsMax, prevZero: run.prevZero, kelp: run.kelp,
  linePayMul: chartOf(run).linePayMul ?? 1, lineSkip: eventOf(run).lineSkip ?? [],
});

// Quota for a tide: econ.js value, then chart, event and trinket multipliers, one ceil. Tide 1 is never multiplied by the tier.
export function quotaFor(run, tide = run.tide) {
  const m = (chartOf(run).quotaMul ?? 1) * (eventOf(run).quotaMul ?? 1) * applyTrinkets('onQuota', run, {});
  if (m === 1) return QUOTA(tide, run.installment);
  return Math.ceil(baseQuota(tide) * (tide <= 1 ? 1 : tier(run.installment)) * m - 1e-9);
}

// Creditor event: tide 5 always, tide 3 from installment 7 (CONTENT.md section 4). A fixed event (Daily, Market) overrides the draw.
function eventFor(run) {
  const t = run.tide;
  if (!(t === TIDES_PER_RUN || (t === 3 && run.installment >= 7))) return null;
  return run.fixedEvent ?? makeRng(run.seed).fork('events:' + t).pick(EVENTS).id;
}

function startTide(run) {
  run.tide++;
  run.event = eventFor(run);
  const c = chartOf(run), e = eventOf(run);
  run.spinsMax = Math.max(1, (c.spins ?? SPINS_PER_TIDE) + applyTrinkets('onSpinsPerTide', run, {}) + (e.spinsDelta ?? 0));
  run.pegsMax = Math.max(1, (c.pegs ?? PEGS_PER_TIDE) + applyTrinkets('onPegSupply', run, {}) + (e.pegDelta ?? 0));
  run.quota = quotaFor(run);
  run.spin = 0; run.grid = null; run.held = []; run.shop = null; run.phase = 'tide';
  run.prevZero = false; // Dry Spell looks at the spin before it in the same tide
  run.jar += applyTrinkets('onTideStart', run, {}).coins;
  fold(run, `tide:${run.tide}:${run.event}:${run.quota}`);
}

const need = (run, phase) => {
  if (run.phase !== phase) throw new Error(`run is in phase ${run.phase}, not ${phase}`);
};

export function spin(run) {
  need(run, 'tide');
  if (run.spin >= run.spinsMax) throw new Error('no spins left; call endTide');
  const held = run.grid ? run.held : [];
  run.spin++;
  if (run.spin === run.spinsMax) run.jarBeforeLast = run.jar;
  const grid = drawGrid(makeBag(run.bag), makeRng(run.seed), run.tide, run.spin, run.grid, held);
  const st = scoring(run);
  const res = scoreSpin(grid, held, st);
  settleSpin(st, res);
  run.grid = grid; run.jar += res.total; run.kelp = res.kelp; run.prevZero = res.total === 0;
  const blocked = noPegCells(run); // a Storm cloud that lands next to a peg knocks it off (GDD.md section 6)
  run.held = run.held.filter((c) => !blocked.has(c));
  run.stats.coins += res.total;
  run.stats.bestSpin = Math.max(run.stats.bestSpin, res.total);
  fold(run, `spin:${run.tide}:${run.spin}:${grid.join(',')}:${res.total}`);
  return { ...res, grid, held: [...held], tide: run.tide, spin: run.spin };
}

// Cells that cannot be pegged: the event's columns, and a Storm cloud with its neighbours (GDD.md section 6).
function noPegCells(run) {
  const out = new Set((eventOf(run).noPegCols ?? []).flatMap((col) => [col, col + 3, col + 6]));
  run.grid?.forEach((id, i) => {
    if (id !== 'storm') return;
    out.add(i);
    for (const j of [i - 3, i + 3]) if (j >= 0 && j < 9) out.add(j);
    if (i % 3 > 0) out.add(i - 1);
    if (i % 3 < 2) out.add(i + 1);
  });
  return out;
}

// True if togglePeg would change that cell: lifting a peg is always allowed; clipping needs a free peg and a legal cell.
export function canPeg(run, cell) {
  if (run.phase !== 'tide' || !run.grid || run.spin >= run.spinsMax || !Number.isInteger(cell) || cell < 0 || cell > 8) return false;
  if (run.held.includes(cell)) return true;
  return run.held.length < run.pegsMax && !noPegCells(run).has(cell);
}

export function togglePeg(run, cell) {
  if (!canPeg(run, cell)) return false;
  run.held = run.held.includes(cell) ? run.held.filter((c) => c !== cell) : [...run.held, cell].sort((a, b) => a - b);
  fold(run, `peg:${run.held.join(',')}`);
  return true;
}

// Wishbone is not in the lite pool, so no lite run has a free column respin: the answer is always "no".
export function useColumnRespin(run, col) {
  const allowed = applyTrinkets('onColumnRespin', run, {});
  return { ok: false, reason: allowed > 0 ? 'not built in lite' : 'no respin' };
}

// Mercy rule: once per run, a gap of 1..5 is paid (Second Wind: up to 20, twice).
const mercyRule = (run) => {
  const m = applyTrinkets('onMercy', run, {});
  return { gap: Math.max(MERCY_GAP, m.gap), uses: Math.max(1, m.uses) };
};

// Take the quota after the last spin. -> { paid, mercy, clutch, over, won, tide, quota }.
export function endTide(run) {
  need(run, 'tide');
  if (run.spin < run.spinsMax) throw new Error('spins left in this tide');
  const quota = run.quota, tide = run.tide;
  let paid = run.jar >= quota, mercy = false;
  if (!paid) {
    const gap = quota - run.jar, m = mercyRule(run);
    if (gap >= 1 && gap <= m.gap && run.mercyUsed < m.uses) { run.jar += gap; run.mercyUsed++; mercy = paid = true; }
  }
  if (!paid) {
    run.phase = 'over';
    fold(run, `over:${tide}`);
    return { paid: false, mercy: false, clutch: false, over: true, won: run.won, tide, quota };
  }
  const clutch = !mercy && run.jarBeforeLast < quota; // quota reached on the last spin
  run.jar -= quota;
  run.jar += applyTrinkets('onTideEnd', run, { jar: run.jar }).coins;
  run.stats.tidesCleared = tide;
  if (clutch) run.stats.clutches++;
  const first = tide === TIDES_PER_RUN && !run.won;
  if (first) run.won = true;
  run.phase = first ? 'lamplight' : 'shop';
  run.shop = null;
  fold(run, `paid:${tide}:${mercy}:${clutch}:${run.jar}`);
  return { paid: true, mercy, clutch, over: false, won: first, tide, quota };
}

// Leave the shop for the next tide. A locked offer is carried into the next shop (shop.js reads run.carry).
export function nextTide(run) {
  need(run, 'shop');
  const s = run.shop;
  run.carry = s && s.lock !== null && s.offers[s.lock] && !s.offers[s.lock].sold ? { ...s.offers[s.lock] } : null;
  startTide(run);
}

// After tide 5 is paid: continue into Lamplight (a shop, then tide 6). Stopping needs no call: read runSummary.
export function enterLamplight(run) {
  need(run, 'lamplight');
  run.phase = 'shop';
  fold(run, 'lamplight');
}

export function runSummary(run) {
  return {
    over: run.phase === 'over', won: run.won, tide: run.tide, tidesCleared: run.stats.tidesCleared,
    bestSpin: run.stats.bestSpin, clutches: run.stats.clutches, mercyUsed: run.mercyUsed, coins: run.stats.coins,
    installment: run.installment, chartId: run.chartId, seed: run.seed, trinkets: run.trinkets.map((t) => t.id), hash: runHash(run),
  };
}
