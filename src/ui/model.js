// Reads the numbers the screens print from the core run (TECH.md section 6 fields) in one place.
// handlers.derive(run) may return any of these keys to override a fallback computed here (the core knows flags and curses):
//   { target, scale, debts, debt, round, rounds, spins, luck, interest, heatPct, canStoke, stokeWhy, favHidden, noLock }
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
    interest: dv.interest ?? Math.min(Math.floor(purse * CONFIG.interest.basePct / 100), Math.floor(target * CONFIG.interest.capPctOfDebt / 100)),
    heatPct: dv.heatPct ?? Math.round(CONFIG.heat.payoutPerLevel * 100 * heat),
    canStoke: dv.canStoke ?? heat < max, stokeWhy: dv.stokeWhy ?? (heat >= max ? 'ui.stokeMax' : 'ui.stokeNo'),
    favs: run.favs ?? [], favHidden: !!dv.favHidden, noLock: !!dv.noLock,
    phase: run.phase,
  };
}
