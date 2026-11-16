// Reads the numbers the screens print from the core run (TECH.md section 6 fields) in one place.
// handlers.derive(run) may return any of these keys to override a fallback computed here (the core knows flags and curses):
//   { target, scale, debts, debt, round, rounds, spins, luck, interest, heatPct, canStoke, stokeWhy, favHidden, noLock,
//     kiosk: { balance, tonight, rate, cap }, pace: { need, avg } | { ok }, beads (0..3), redEye (percent, 0 when off), due: [{ rounds }], honkReady, payNow }
// Assumed: run.debt is the 0-based debt index, run.round the 0-based night inside it, run.contract the contract id.
import { CONTRACT, CONFIG, scaleAt } from './content.js';

export function model(run, dv = {}) {
  const c = CONTRACT[run.contract] ?? { debts: [0], rounds: 3 };
  const di = run.debt | 0, heat = run.heat | 0, max = CONFIG.heat.max;
  const target = dv.target ?? c.debts[Math.min(di, c.debts.length - 1)] ?? 0;
  const banked = run.banked | 0, purse = run.purse | 0, left = Math.max(0, target - banked);
  const luck = dv.luck ?? Math.min(CONFIG.luck.cap, CONFIG.luck.base + (run.luckTemp | 0) + (run.pity | 0));
  return {
    target, banked, purse, left, heat, heatMax: max, luck, wick: run.wick | 0,
    scale: dv.scale ?? scaleAt(di),
    debt: dv.debt ?? di + 1, debts: dv.debts ?? c.debts.length,
    round: dv.round ?? (run.round | 0) + 1, rounds: dv.rounds ?? c.rounds,
    spins: dv.spins ?? run.spinsLeft | 0,
    // Interest is paid on the Kiosk balance (the banked coins), never on the purse: bank to earn, keep to spend.
    kiosk: dv.kiosk ?? { balance: banked, tonight: Math.min(Math.floor(banked * CONFIG.interest.basePct / 100), Math.floor(target * CONFIG.interest.capPctOfDebt / 100)), rate: CONFIG.interest.basePct, cap: Math.floor(target * CONFIG.interest.capPctOfDebt / 100) },
    interest: dv.interest ?? Math.min(Math.floor(banked * CONFIG.interest.basePct / 100), Math.floor(target * CONFIG.interest.capPctOfDebt / 100)),
    pace: dv.pace ?? null, beads: dv.beads ?? (run.beads | 0), redEye: dv.redEye ?? 0, due: dv.due ?? run.due ?? [], honkReady: !!dv.honkReady, payNow: dv.payNow ?? (target > 0 && banked >= target),
    heatPct: dv.heatPct ?? Math.round(CONFIG.heat.payoutPerLevel * 100 * heat),
    canStoke: dv.canStoke ?? heat < max, stokeWhy: dv.stokeWhy ?? (heat >= max ? 'ui.stokeMax' : 'ui.stokeNo'),
    spirits: dv.spirits ?? run.spirits ?? {}, favs: run.favs ?? [], favHidden: !!dv.favHidden, noLock: !!dv.noLock,
    phase: run.phase,
  };
}
