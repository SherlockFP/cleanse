// Devil deals and curses.
import { DEALS, DEAL, SCORING, CONFIG } from './data.js';
import { stream } from './streams.js';
import { snapshot, fire, runEffects, addCurse, removeCurse } from './effects.js';
import { nextDebt } from './run.js';
import { dealSigned, hangUp } from './calls.js';
import { flushModal } from './spirits.js';

export { addCurse, removeCurse };

export function offerDeals(run) {
  const mods = snapshot(run);
  const n = Math.max(CONFIG.deals.offers, mods.flags.dealOffers || 0);
  const rng = stream(run, 'deal');
  if (run.tut && run.debtIdx === 0 && DEAL.lucky_break) return (run.dealOffer = ['lucky_break']); // the first deal is one plain offer, and a good one
  let pool = DEALS.filter((d) => !run.dealsSeen.includes(d.id));
  const fresh = pool.filter((d) => d.curse === 'random' || !run.curses.includes(d.curse));
  if (fresh.length >= n) pool = fresh;
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(rng.int(pool.length), 1)[0].id);
  run.dealsSeen.push(...out);
  run.dealOffer = out;
  return out;
}

// opts.sym: the symbol chosen for a "pick a symbol" boon (Star Sign).
export function signDeal(run, id, opts = {}) {
  if (run.phase !== 'deal' || !run.dealOffer?.includes(id)) return false;
  const d = DEAL[id];
  if (d.boon.some((e) => e.flag === 'pickFav')) run.starSym = SCORING.includes(opts.sym) ? opts.sym : stream(run, 'deal').pick(SCORING);
  runEffects(run, { kind: 'deal', id }, d.boon, {});
  run.deals.push(id);
  run.stats.dealsSigned = (run.stats.dealsSigned || 0) + 1;
  for (let i = 0; i < (d.curseCount || 1); i++) addCurse(run, d.curse);
  fire(run, 'onDeal', { deal: id });
  run.dealOffer = null;
  dealSigned(run);
  nextDebt(run);
  flushModal(run);
  return true;
}

// Refuse = back out of the sheet and hang up. Without a call (a bare deal phase) it is v2's refuse.
export function refuseDeals(run) {
  if (run.phase !== 'deal') return false;
  const mods = snapshot(run);
  if (mods.flags.mustSign) return false;
  if (run.callOffer) { run.callOffer.sawRed = true; run.phase = 'call'; run.dealOffer = null; return hangUp(run); }
  run.wick += Math.max(CONFIG.deals.refuseWick, run.hide?.refuseWick || 0, mods.flags.refuseWick || 0);
  run.refused++;
  run.stats.dealsRefused = (run.stats.dealsRefused || 0) + 1;
  fire(run, 'onRefuse', {});
  run.dealOffer = null;
  nextDebt(run);
  return true;
}
