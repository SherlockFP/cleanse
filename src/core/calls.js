// The phone (SPEC 3.4): a call rings after every paid debt. Cards: Mr. Ruby's red card (his deals), spirits' green gifts or red calls.
// Beads (Review fix 4.1, 4.2): a bead lights only when the player OPENED a red sheet and then hung up; hanging up costs no Favour.
// Three beads: the next call is white (the Waiting Lady, three white cards).
import { CONFIG, SPIRIT, SPIRITS } from './data.js';
import { stream } from './streams.js';
import { snapshot, fire, runEffects, addCurse } from './effects.js';
import { addFavour, live, applyGift, flushModal, STAGE_AT } from './spirits.js';
import { offerDeals } from './deals.js';
import { nextDebt } from './run.js';

export const BEADS_FOR_WHITE = 3;
export const RED_CHANCE = 0.25;
const flagsOf = (run) => snapshot(run).flags;

// card: {spirit, color: 'green'|'red'|'white', id: gift / red call / white card id, ruby?: true}
function drawCards(run) {
  const rng = stream(run, 'call'), f = flagsOf(run), total = 3 + (f.callCards || 0);
  const since = run.sinceCall || {}, allRed = !!(since.redEye || since.scorch);
  const cards = [];
  const pool = live(run).filter((d) => d.id !== 'brimble');
  if (live(run).some((d) => d.id === 'brimble')) cards.push({ spirit: 'brimble', color: 'red', id: 'deals', ruby: true });
  while (cards.length < total && pool.length) {
    const d = rng.weighted(pool, pool.map((x) => (x.local?.includes(run.contract) ? 2 : 1) * (run.spirits[x.id].stage >= STAGE_AT[1] ? 1.5 : 1)));
    pool.splice(pool.indexOf(d), 1);
    const canRed = !!d.red && d.id !== 'waiting';
    const red = canRed && !run.tut && (allRed || rng.next() < RED_CHANCE);
    if (red) cards.push({ spirit: d.id, color: 'red', id: d.red.id });
    else if (d.gifts.length) cards.push({ spirit: d.id, color: 'green', id: rng.pick(d.gifts).id });
  }
  return cards;
}

const whiteCards = (run) => (SPIRIT.waiting?.white || []).map((g) => ({ spirit: 'waiting', color: 'white', id: g.id }));

// Starts the call after a paid debt. No call (straight to the next debt) when the phone is quiet or nobody can ring.
export function startCall(run) {
  const quiet = run.postcards?.includes('quiet_phone');
  const white = !quiet && run.beads >= BEADS_FOR_WHITE && whiteCards(run).length > 0;
  const cards = quiet ? [] : white ? whiteCards(run) : drawCards(run);
  run.sinceCall = {};
  if (!cards.length) return nextDebt(run);
  if (white) { run.beads = 0; run.whiteCalls = (run.whiteCalls || 0) + 1; }
  run.callOffer = { cards, rerolls: 0, sawRed: false, white };
  run.phase = 'call';
  fire(run, 'onCall', { cards });
}

export const callOffer = (run) => run.callOffer?.cards || [];

export function cardInfo(card) {
  const d = SPIRIT[card.spirit];
  if (card.ruby) return { deals: true };
  if (card.color === 'white') return d.white.find((g) => g.id === card.id);
  if (card.color === 'red') return d.red;
  return d.gifts.find((g) => g.id === card.id);
}

// The player opens a red card's sheet (and may back out). Marks the call as "looked at red".
export function callLook(run, i) {
  const c = run.callOffer?.cards[i];
  if (run.phase !== 'call' || !c || c.color !== 'red') return false;
  run.callOffer.sawRed = true;
  return true;
}

export const rerollCost = (run) => {
  const o = run.callOffer, f = flagsOf(run);
  if (!o) return 0;
  const n = o.rerolls + (f.callRerollFree ? -1 : 0);
  return n < 0 ? 0 : (1 + n) * (run.postcards?.includes('party_line') ? 2 : 1);
};

// Redraws the cards that are not Ruby's. Costs Caps, one more each time in the same call.
export function callReroll(run) {
  const o = run.callOffer;
  if (run.phase !== 'call' || !o || o.white) return false;
  const cost = rerollCost(run);
  if (run.wick < cost) return false;
  run.wick -= cost;
  o.rerolls++;
  const keep = o.cards.filter((c) => c.ruby);
  const fresh = drawCards(run).filter((c) => !c.ruby);
  o.cards = [...keep, ...fresh].slice(0, o.cards.length);
  return true;
}

function finish(run) {
  run.callOffer = null;
  nextDebt(run);
  flushModal(run);
}

// Take a card. Ruby's opens the deal sheet (sign there, or dealBack); every other card is taken at once.
export function callPick(run, i) {
  const o = run.callOffer, c = o?.cards[i];
  if (run.phase !== 'call' || !c) return false;
  if (c.ruby) {
    o.sawRed = true;
    o.picked = i;
    if (!offerDeals(run).length) return false;
    run.phase = 'deal';
    return true;
  }
  const d = SPIRIT[c.spirit], info = cardInfo(c);
  const ctx = { spirit: c.spirit };
  if (c.color === 'red') {
    runEffects(run, { kind: 'call', id: c.id }, info.boon, ctx);
    if (info.carry) runEffects(run, { kind: 'call', id: c.id }, info.carry, ctx);
    if (info.curse) addCurse(run, info.curse);
    if (info.due) (run.due ??= []).push({ debt: run.debtIdx + 1, left: info.due.rounds, else: info.due.else, id: c.id, spirit: c.spirit });
    addFavour(run, c.spirit, 3, 'red');
    run.stats.redCalls = (run.stats.redCalls || 0) + 1;
    (run.stats.redSpirits ??= []);
    if (!run.stats.redSpirits.includes(c.spirit)) run.stats.redSpirits.push(c.spirit);
  } else {
    runEffects(run, { kind: 'call', id: c.id }, info.effects, ctx);
    addFavour(run, c.spirit, 2, 'green');
    if (c.color === 'white') run.whiteTaken = (run.whiteTaken || 0) + 1;
    run.stats.greenCalls = (run.stats.greenCalls || 0) + 1;
  }
  if (d.rival && run.spirits[d.rival] && !run.spirits[d.rival].silent) addFavour(run, d.rival, -1, 'rivalPick', false);
  run.stats.calls = (run.stats.calls || 0) + 1;
  fire(run, 'onPick', { spirit: c.spirit, colour: c.color });
  finish(run);
  return true;
}

// Back out of Ruby's deal sheet: the call is still open.
export function dealBack(run) {
  if (run.phase !== 'deal' || !run.callOffer) return false;
  if (flagsOf(run).mustSign) return false;
  run.dealOffer = null;
  run.callOffer.sawRed = true;
  run.phase = 'call';
  return true;
}

// Called by deals.signDeal once the contract is signed.
export function dealSigned(run) {
  addFavour(run, 'brimble', 5, 'deal'); // +3 for the red card, +2 for signing
  const r = SPIRIT.brimble.rival;
  if (run.spirits[r] && !run.spirits[r].silent) addFavour(run, r, -1, 'rivalPick', false);
  run.stats.redCalls = (run.stats.redCalls || 0) + 1;
  (run.stats.redSpirits ??= []);
  if (!run.stats.redSpirits.includes('brimble')) run.stats.redSpirits.push('brimble');
  fire(run, 'onPick', { spirit: 'brimble', colour: 'red' });
  run.callOffer = null;
}

// Hang up. A bead lights only if a red sheet was opened first; then v2's refuse reward (+3 Caps) is paid too.
export function hangUp(run) {
  const o = run.callOffer;
  if (run.phase !== 'call' || !o) return false;
  const f = flagsOf(run);
  if (f.mustSign && o.cards.some((c) => c.ruby)) return false;
  const hadRed = o.sawRed;
  if (hadRed && !o.white) {
    if (!f.noBeads) run.beads = Math.min(BEADS_FOR_WHITE, run.beads + 1);
    run.wick += Math.max(CONFIG.deals.refuseWick, run.hide?.refuseWick || 0, f.refuseWick || 0);
    run.refused++;
    run.stats.dealsRefused = (run.stats.dealsRefused || 0) + 1;
    fire(run, 'onRefuse', {});
  }
  fire(run, 'onHangUp', { hadRed });
  run.stats.hangUps = (run.stats.hangUps || 0) + 1;
  finish(run);
  return true;
}

// Due prices (SPEC 3.4): "pay the debt within N rounds or else". Called at each round end (final: after the deadline came up short).
export function dueRoundEnd(run, final = false) {
  if (!run.due?.length) return;
  const keep = [];
  for (const d of run.due) {
    if (d.debt !== run.debtIdx + 1) continue;
    d.left--;
    if (d.left > 0 && !(final && run.banked < run.debt)) { keep.push(d); continue; }
    runEffects(run, { kind: 'due', id: d.id }, d.else, { spirit: d.spirit });
    run.stats.duesFailed = (run.stats.duesFailed || 0) + 1;
  }
  run.due = keep;
}

export { SPIRITS, live, applyGift };
