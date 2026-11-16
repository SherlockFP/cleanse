// A run: contract, debts, rounds, spins, tricks, banking, interest, deadline, endings, save/resume.
// phase: 'terms' -> 'spin' -> ('post') -> 'spin' ... -> 'roundend' -> 'shop' -> 'terms'
//        debt paid: 'deal' -> 'shop' -> 'terms'; deadline missed: 'pawn' | 'ended'.
import { CONFIG, RARITIES, CHARM, CHARMS, CHAR, CONTRACT, STAKE, STAKES, TRICK, SYM, SCORING } from './data.js';
import { stream } from './streams.js';
import {
  snapshot, fire, runEffects, endSpan, scaleOf, slotsOf, pocketsOf, scoreSpin, setHeat, addTrick, addCharm, burnCharm, addCurse, luckOf,
} from './effects.js';
import { pickFavourites, rollGrid, rollRow, rollCells, applySpinEdits, applyGridEdits, COLS } from './machine.js';
import { openShop } from './shop.js';
import { offerDeals } from './deals.js';
import { hideoutEffects, availableCharms } from './meta.js';

export { scaleOf };
export const phase = (run) => run.phase;
export const saveRun = (run) => JSON.stringify(run);
export const loadRun = (s) => JSON.parse(s);

export function newRun({ seed = 'run', contractId = 'c1', charId = 'nim', meta = null, daily = null } = {}) {
  const ch = CHAR[charId];
  const hide = meta ? hideoutEffects(meta) : {};
  const run = {
    v: 2, seed: String(seed), rngState: {}, contract: contractId, char: charId, daily: !!daily,
    debtIdx: 0, debt: 0, banked: 0, round: 0, rounds: 3, roundSerial: 0, spinsLeft: 0, spinInRound: 0,
    phase: 'terms', purse: CONFIG.start.coins, wick: ch.start.wick + (hide.startWick || 0), heat: 0, pity: 0,
    charms: [], slots: ch.start.slots, tricks: [], pockets: CONFIG.start.trickPockets, stash: null, pinned: [],
    curses: [], deals: [], dealsSeen: [], refused: 0, perm: [], temp: [], bench: {}, removed: [],
    terms: null, termsOffer: null, grid: null, favs: [], nextFavs: null, shop: null, dealOffer: null,
    flagsUsed: { pawn: false, extraLife: false }, stats: {}, counters: {},
    pool: meta ? availableCharms(meta) : CHARMS.filter((c) => !c.unlock).map((c) => c.id),
    hide, debtAdj: 0, pendingRemove: 0, waiting: [], starSym: null, roundFav: null, noScorch: false, spinFx: {},
    freeBench: 0, lock: null, seen: [], forcedTerms: daily?.forcedTerms || null, startPick: null, result: null,
    shopExtra: false, slotBought: false, trickFree: 0, tricksSpin: 0, adReroll: 0, lastDeadline: null,
  };
  for (const id of ch.start.charms) addCharm(run, id);
  if (meta && hide.keepCharm && meta.keepsake && !run.charms.some((c) => c.id === meta.keepsake)) addCharm(run, meta.keepsake);
  for (const id of ch.start.tricks) addTrick(run, id);
  for (let i = 0; i < (hide.startTrick || 0); i++) addTrick(run);
  if (hide.startCharmPick) {
    const rng = stream(run, 'fx');
    const list = CHARMS.filter((c) => c.rarity === 'common' && run.pool.includes(c.id) && !run.charms.some((x) => x.id === c.id));
    run.startPick = [];
    while (run.startPick.length < hide.startCharmPick && list.length) run.startPick.push(list.splice(rng.int(list.length), 1)[0].id);
  }
  const n = ch.start.curses + (snapshot(run).flags.startCurses || 0);
  for (let i = 0; i < n; i++) addCurse(run, 'random');
  if (daily?.curse) addCurse(run, daily.curse);
  fire(run, 'onRunStart', {});
  startDebt(run);
  return run;
}

export function pickStartCharm(run, id) {
  if (!run.startPick?.includes(id) || run.charms.length >= slotsOf(run)) return false;
  addCharm(run, id);
  run.startPick = null;
  return true;
}

function startDebt(run) {
  const mods = snapshot(run);
  const base = CONTRACT[run.contract].debts[run.debtIdx];
  run.debt = Math.max(1, Math.ceil(base * (1 + (mods.flags.debtMul || 0) / 100) * (1 + run.debtAdj / 100) - 1e-9));
  run.debtAdj = 0;
  run.banked = 0;
  run.round = 0;
  run.rounds = (mods.flags.rounds ?? CONTRACT[run.contract].rounds) + (mods.flags.roundsAdd || 0);
  run.stats.reachDebt = Math.max(run.stats.reachDebt || 0, run.debtIdx + 1);
  fire(run, 'onDebtStart', { debtIdx: run.debtIdx });
}

// After a deal is signed or refused (or none offered): next debt, then its first shop.
export function nextDebt(run) {
  run.debtIdx++;
  startDebt(run);
  openShop(run);
}

export function leaveShop(run) {
  if (run.phase !== 'shop') return false;
  run.shop = null;
  run.phase = 'terms';
  run.termsOffer = null;
  termsOffer(run);
  return true;
}

// ---------- terms and round start ----------

export function termsOffer(run) {
  if (!run.termsOffer) {
    if (run.forcedTerms && run.roundSerial === 0) run.termsOffer = [run.forcedTerms];
    else {
      const rng = stream(run, 'terms');
      const pool = STAKES.filter((s) => s.minDebt <= run.debtIdx + 1);
      const ids = [];
      while (ids.length < 3 && pool.length) {
        const s = rng.weighted(pool, pool.map((p) => p.weight));
        ids.push(s.id);
        pool.splice(pool.indexOf(s), 1);
      }
      run.termsOffer = ids;
    }
  }
  return run.termsOffer.map((id) => STAKE[id]);
}

export function needsBurn(run) {
  return Math.max(0, run.charms.length - slotsOf(run));
}

// A player who ignores a pending choice gets the cheapest option so the run never stalls.
function autoResolve(run) {
  while (needsBurn(run) > 0) {
    let worst = 0;
    run.charms.forEach((c, i) => { if (RARITIES.indexOf(CHARM[c.id].rarity) <= RARITIES.indexOf(CHARM[run.charms[worst].id].rarity)) worst = i; });
    burnCharm(run, worst);
  }
  while (run.pendingRemove > 0) {
    const left = SCORING.filter((s) => !run.removed.includes(s)).sort((a, b) => SYM[a].value - SYM[b].value);
    if (run.removed.length >= CONFIG.start.removedSymbolsMax || !left.length) { run.pendingRemove = 0; break; }
    run.removed.push(left[0]);
    run.stats.symbolsRemoved = (run.stats.symbolsRemoved || 0) + 1;
    run.pendingRemove--;
  }
}

export function pickTerms(run, id) {
  if (run.phase !== 'terms' || !termsOffer(run).some((s) => s.id === id)) return false;
  autoResolve(run);
  const st = STAKE[id];
  run.terms = id;
  run.termsOffer = null;
  run.roundSerial++;
  const mods = snapshot(run);
  if (!mods.flags.heatNoCool) setHeat(run, run.heat - CONFIG.heat.coolAtRoundStart, mods);
  if (mods.flags.startHeat) setHeat(run, Math.max(run.heat, mods.flags.startHeat), mods);
  if (mods.flags.noStoke) run.heat = mods.flags.heatFloor || 0;
  run.spinsLeft = Math.max(1, st.spins - (mods.flags.spinsLess || 0) + (mods.flags.spinsRound || 0));
  const events = runEffects(run, { kind: 'terms', id }, st.effects, {}, true);
  events.push(...fire(run, 'onRoundStart', {}));
  run.spinsLeft = Math.max(1, run.spinsLeft);
  run.spinInRound = 0;
  run.phase = 'spin';
  prepareSpin(run);
  return events;
}

function prepareSpin(run) {
  const mods = snapshot(run);
  if (run.nextFavs) { run.favs = run.nextFavs; run.nextFavs = null; }
  else run.favs = pickFavourites(run, mods);
  if (mods.flags.seeNextFav) run.nextFavs = pickFavourites(run, mods);
}

// Pick the Favourite by hand: first spin of a round with a pickFirstFav rule.
export function setFavourite(run, sym) {
  const mods = snapshot(run);
  if (run.phase !== 'spin' || !mods.flags.pickFirstFav || run.spinInRound !== 0 || !SCORING.includes(sym) || run.removed.includes(sym)) return false;
  run.favs = [sym, ...run.favs.slice(1)];
  return true;
}

// Redraw the Favourite before a spin: free once per round (+ freeRedraw charms), then 1 Wick each.
export const REDRAW_WICK = 1;
export function redrawCost(run) {
  const used = run.redraws?.serial === run.roundSerial ? run.redraws.n : 0;
  return used < 1 + (snapshot(run).flags.freeRedraw || 0) ? 0 : REDRAW_WICK;
}
export function redrawFavourite(run) {
  const mods = snapshot(run);
  if (run.phase !== 'spin' || mods.flags.hideFav) return false;
  const cost = redrawCost(run);
  if (run.wick < cost) return false;
  const old = run.favs[0];
  let favs = run.favs;
  for (let k = 0; k < 6 && favs[0] === old; k++) favs = pickFavourites(run, mods);
  run.wick -= cost;
  if (run.redraws?.serial !== run.roundSerial) run.redraws = { serial: run.roundSerial, n: 0 };
  run.redraws.n++;
  run.favs = favs;
  run.stats.redraws = (run.stats.redraws || 0) + 1;
  return true;
}

export function stoke(run) {
  if (run.phase !== 'spin') return null;
  const mods = snapshot(run);
  if (mods.flags.noStoke || run.heat >= CONFIG.heat.max) return null;
  run.heat++;
  run.stats.stokes = (run.stats.stokes || 0) + 1;
  return fire(run, 'onStoke', {});
}

// ---------- tricks ----------

const TARGET = { nudge: 'col', pin: 'col', row_arrow: 'row', swap: 'pair', hand_mirror: 'pair', brush: 'cell', stencil: 'cell', pocket: 'cell', token: 'sym' };
export const trickTarget = (id) => TARGET[id] || null;
const cellOK = (c) => Number.isInteger(c) && c >= 0 && c < 15;
const adjacent = (a, b) => cellOK(a) && cellOK(b) && Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) + Math.abs((a % 5) - (b % 5)) === 1;

// target: {col} | {row} | {cell} | {a, b} | {from, to} | {sym}
export function useTrick(run, pocket, target = {}) {
  const id = run.tricks[pocket];
  if (!id) return { ok: false, why: 'empty' };
  const T = TRICK[id];
  const ph = run.phase;
  const okPhase = T.when === 'pre' ? ph === 'spin' : T.when === 'post' ? ph === 'post' : T.when === 'any' ? ph === 'spin' || ph === 'post' || ph === 'roundend' : T.when === 'shop' ? ph === 'shop' : false;
  if (!okPhase) return { ok: false, why: 'timing' };
  const op = T.op;
  const mods = snapshot(run);
  let consume = true;
  const grid = run.grid;
  const fail = (why) => ({ ok: false, why });
  switch (op.type) {
    case 'shiftColumn': {
      const c = target.col;
      if (!(c >= 0 && c < COLS)) return fail('target');
      run.grid = applyGridEdits(grid, [{ cell: c + 5, sym: grid[c] }, { cell: c + 10, sym: grid[c + 5] }, { cell: c, sym: grid[c + 10] }]);
      break;
    }
    case 'holdColumn': {
      const c = target.col;
      if (!(c >= 0 && c < COLS)) return fail('target');
      for (const cell of [c, c + 5, c + 10]) if (!run.pinned.some((p) => p.cell === cell)) run.pinned.push({ cell, sym: grid[cell] });
      break;
    }
    case 'respinRow': {
      const r = target.row;
      if (!(r >= 0 && r < 3)) return fail('target');
      run.grid = rollRow(run, mods, run.favs, grid, r);
      break;
    }
    case 'retriggerBest': run.spinFx.retriggerBest = true; break;
    case 'swapAdjacent':
      if (!adjacent(target.a, target.b)) return fail('target');
      run.grid = applyGridEdits(grid, [{ cell: target.a, sym: grid[target.b] }, { cell: target.b, sym: grid[target.a] }]);
      break;
    case 'copyAdjacent':
      if (!adjacent(target.from, target.to)) return fail('target');
      run.grid = applyGridEdits(grid, [{ cell: target.to, sym: grid[target.from] }]);
      break;
    case 'setCell': {
      if (!cellOK(target.cell)) return fail('target');
      run.grid = applyGridEdits(grid, [{ cell: target.cell, sym: op.to === 'favoured' ? run.favs[0] : op.to }]);
      break;
    }
    case 'rerollSymbol': {
      const cells = [];
      grid.forEach((s, i) => { if (s === op.sym && !(mods.flags.deadCentre && i === 7)) cells.push(i); });
      if (!cells.length) return fail('nothing');
      run.grid = rollCells(run, mods, run.favs, grid, cells);
      break;
    }
    case 'stash':
      if (!cellOK(target.cell)) return fail('target');
      if (run.stash === null) {
        run.stash = grid[target.cell];
        run.grid = rollCells(run, mods, run.favs, grid, [target.cell]);
        consume = false;
      } else {
        run.grid = applyGridEdits(grid, [{ cell: target.cell, sym: run.stash }]);
        run.stash = null;
      }
      break;
    case 'spins':
      run.spinsLeft += op.n;
      if (ph === 'roundend') { run.phase = 'spin'; prepareSpin(run); } // used after the last spin: the night goes on
      break;
    case 'heat':
      setHeat(run, run.heat + op.n, mods);
      if (op.noScorch) run.noScorch = true;
      break;
    case 'luck': run.temp.push({ scope: op.scope, rec: { type: 'luck', n: op.n, src: { kind: 'trick', id } } }); break;
    case 'patMult': run.temp.push({ scope: op.scope, rec: { type: 'patMult', n: op.n, pattern: 'all', src: { kind: 'trick', id } } }); break;
    case 'pickFav':
      if (!SCORING.includes(target.sym) || run.removed.includes(target.sym)) return fail('target');
      run.favs = [target.sym, ...run.favs.slice(1)];
      break;
    case 'loan':
      run.purse += Math.floor((run.debt * op.gainPct) / 100);
      run.debtAdj += op.nextDebtPct;
      break;
    case 'muteCurses': run.temp.push({ scope: op.scope, rec: { type: 'flag', flag: 'muteCurses', src: { kind: 'trick', id } } }); break;
    case 'freeBench': run.freeBench++; break;
    default: return fail('manual');
  }
  if (consume) {
    if (mods.flags.firstTrickFree && run.trickFree !== run.roundSerial) run.trickFree = run.roundSerial;
    else run.tricks.splice(pocket, 1);
  }
  run.stats.tricksUsed = (run.stats.tricksUsed || 0) + 1;
  run.tricksSpin++;
  return { ok: true, events: fire(run, 'onTrick', { trick: id }) };
}

// ---------- spin and collect ----------

export function spin(run) {
  if (run.phase !== 'spin' || run.spinsLeft < 1) throw new Error('cannot spin in phase ' + run.phase);
  autoResolve(run);
  const ctx = { edits: [] };
  const events = fire(run, 'onSpinStart', ctx);
  const mods = snapshot(run);
  if (mods.flags.ghostHire && run.spinInRound === 0) ctx.edits.push({ type: 'place', n: 2, sym: 'wisp' });
  let grid = rollGrid(run, mods, run.favs);
  grid = applySpinEdits(run, mods, grid, run.favs, ctx.edits);
  run.pinned = [];
  run.grid = grid;
  run.spinFx = {};
  run.tricksSpin = 0;
  run.stats.spins = (run.stats.spins || 0) + 1;
  run.phase = 'post';
  const res = { grid: run.grid, favs: run.favs, events };
  if (run.tricks.some((t) => TRICK[t].when === 'post')) return { ...res, phase: 'post' };
  res.score = collect(run);
  res.phase = run.phase;
  return res;
}

function settle(run) {
  const sc = scoreSpin(run, run.grid, run.favs);
  const gain = sc.total + sc.flat;
  run.purse += gain;
  const st = run.stats;
  st.coinsEarned = (st.coinsEarned || 0) + gain;
  st.spinCoins = Math.max(st.spinCoins || 0, gain);
  for (const r of sc.patterns) {
    st['pattern:' + r.id] = (st['pattern:' + r.id] || 0) + 1;
    if (run.favs.includes(r.sym)) st.favPatterns = (st.favPatterns || 0) + 1;
    if (r.sym === 'crown') st.crownPatterns = (st.crownPatterns || 0) + 1;
  }
  st.patternsOneSpin = Math.max(st.patternsOneSpin || 0, sc.patterns.length);
  st.wispsOneSpin = Math.max(st.wispsOneSpin || 0, sc.wisps);
  st.tricksOneSpin = Math.max(st.tricksOneSpin || 0, run.tricksSpin);
  if (run.heat === CONFIG.heat.max) st.heat10Spins = (st.heat10Spins || 0) + 1;
  st.luckReached = Math.max(st.luckReached || 0, luckOf(run, snapshot(run, run.grid, run.favs)));
  if (sc.sigils >= 3) addTrick(run);
  if (sc.found > 0) run.pity = 0;
  else if (!sc.scorch) run.pity += CONFIG.luck.dudPity;
  run.noScorch = false;
  endSpan(run, 'spin');
  return { ...sc, gain };
}

export function collect(run) {
  if (run.phase !== 'post') throw new Error('nothing to collect in phase ' + run.phase);
  const result = settle(run);
  if (snapshot(run).flags.lastTwice && run.spinsLeft === 1) result.second = settle(run);
  run.spinsLeft--;
  run.spinInRound++;
  if (run.spinsLeft > 0) {
    run.phase = 'spin';
    prepareSpin(run);
  } else run.phase = 'roundend';
  return result;
}

// ---------- banking, interest, deadline ----------

function doBank(run, amount) {
  const mods = snapshot(run);
  const x = typeof mods.flags.bankX === 'number' ? mods.flags.bankX : 1;
  const spend = Math.min(Math.floor(amount), run.purse, Math.ceil((run.debt - run.banked) / x - 1e-9));
  if (spend < 1) return 0;
  run.purse -= spend;
  run.banked += Math.floor(spend * x + 1e-9);
  fire(run, 'onBank', { amount: spend });
  return spend;
}

export function bank(run, amount = Infinity) {
  if (run.phase !== 'spin' && run.phase !== 'roundend') return 0;
  const spent = doBank(run, amount);
  if (spent && run.banked >= run.debt) payDebt(run);
  return spent;
}

export function endRound(run) {
  if (run.phase !== 'roundend') throw new Error('round is not over');
  fire(run, 'onRoundEnd', {});
  const mods = snapshot(run);
  let rate = CONFIG.interest.basePct + mods.interest;
  if (mods.flags.interestHalf) rate /= 2;
  let interest = 0;
  if (!mods.flags.noInterest && !mods.flags.noInterestRound) {
    const cap = CONFIG.interest.capPctOfDebt * (typeof mods.flags.interestCapX === 'number' ? mods.flags.interestCapX : 1);
    interest = Math.max(0, Math.min(Math.floor((run.purse * rate) / 100 + 1e-9), Math.floor((run.debt * cap) / 100)));
  }
  run.purse += interest;
  run.stats.interestTotal = (run.stats.interestTotal || 0) + interest;
  if (interest >= 1) fire(run, 'onInterest', { amount: interest });
  run.shopExtra = !!snapshot(run).flags.shopExtra;
  endSpan(run, 'round');
  run.terms = null;
  run.favs = [];
  run.nextFavs = null;
  if (run.round + 1 < run.rounds) {
    run.round++;
    openShop(run);
    return { interest, deadline: null };
  }
  return { interest, deadline: deadline(run) };
}

function extraRound(run) {
  run.rounds++;
  run.round++;
  openShop(run);
}

// End of the last round: bank what is needed, then 'paid' | 'saved' | 'pawn' | 'collected'.
export function deadline(run) {
  doBank(run, Infinity);
  if (run.banked >= run.debt) { payDebt(run); return (run.lastDeadline = 'paid'); }
  const mods = snapshot(run);
  let saved = false;
  const ti = run.tricks.findIndex((t) => TRICK[t].op.type === 'saveDeadline');
  if (ti >= 0) { run.tricks.splice(ti, 1); saved = true; }
  else {
    const ci = run.charms.findIndex((c) => CHARM[c.id].rules.some((r) => r.effects.some((e) => e.flag === 'saveDeadline')));
    if (ci >= 0) { burnCharm(run, ci); saved = true; }
    else if (mods.flags.extraLife && !run.flagsUsed.extraLife) { run.flagsUsed.extraLife = true; saved = true; }
  }
  if (saved) { extraRound(run); return (run.lastDeadline = 'saved'); }
  if (!run.flagsUsed.pawn && run.charms.length) { run.phase = 'pawn'; return (run.lastDeadline = 'pawn'); }
  finish(run, false);
  return (run.lastDeadline = 'collected');
}

// The Pawn: burn one charm, take a random curse, get one more round. Once per run.
export function pawn(run, charmIndex) {
  if (run.phase !== 'pawn' || !run.charms[charmIndex]) return false;
  burnCharm(run, charmIndex);
  run.flagsUsed.pawn = true;
  addCurse(run, 'random');
  extraRound(run);
  return true;
}
export function declinePawn(run) {
  if (run.phase !== 'pawn') return false;
  finish(run, false);
  return true;
}

function payDebt(run) {
  const unused = Math.max(0, run.rounds - run.round - 1);
  const st = run.stats;
  st.debtsPaid = (st.debtsPaid || 0) + 1;
  st.cursesAtPay = Math.max(st.cursesAtPay || 0, run.curses.length);
  if (run.purse * 100 <= 10 * run.debt) st.exactChange = (st.exactChange || 0) + 1;
  if (unused > 0) {
    run.wick += unused * CONFIG.earlyPay.wickPerUnusedRound;
    for (let i = 0; i < CONFIG.earlyPay.trickPerDebt; i++) addTrick(run);
    st.earlyPays = (st.earlyPays || 0) + 1;
  }
  fire(run, 'onDebtPaid', { roundsLeft: unused, purse: run.purse });
  endSpan(run, 'debt');
  run.terms = null;
  run.spinsLeft = 0;
  run.favs = [];
  run.nextFavs = null;
  if (run.debtIdx >= CONTRACT[run.contract].debts.length - 1) return finish(run, true);
  if (!offerDeals(run).length) return nextDebt(run);
  run.phase = 'deal';
}

function endingOf(run) {
  const id = CONTRACT[run.contract].ending;
  const e = CONFIG.endings.find((x) => x.id === id);
  if (!e) return null;
  if (e.cond === 'dealsSigned == 0' && run.deals.length) return null;
  if (e.cond === 'curses >= 5' && run.curses.length < 5) return null;
  return id;
}

function finish(run, won) {
  run.phase = 'ended';
  run.result = { won, ending: won ? endingOf(run) : null };
}

// ---------- read-only helpers for the UI and the meta layer ----------

export function info(run) {
  const mods = snapshot(run);
  return {
    S: scaleOf(run), owed: run.debt - run.banked, luck: luckOf(run, mods), slots: slotsOf(run, mods), pockets: pocketsOf(run, mods),
    favHidden: !!mods.flags.hideFav, nextFavs: run.nextFavs, canStoke: run.phase === 'spin' && !mods.flags.noStoke && run.heat < CONFIG.heat.max,
    redrawCost: redrawCost(run), canPickFav: !!mods.flags.pickFirstFav && run.phase === 'spin' && run.spinInRound === 0, needsBurn: needsBurn(run), pendingRemove: run.pendingRemove,
  };
}

export function summary(run) {
  const won = !!run.result?.won;
  const debtsPaid = run.stats.debtsPaid || 0;
  const stats = { ...run.stats };
  if (won) stats.contract = CONTRACT[run.contract].tier;
  if (won && !run.deals.length) stats.cleanContract = 1;
  stats.cursesHeld = stats.cursesAtPay || 0;
  delete stats.cursesAtPay;
  return {
    won, ending: run.result?.ending || null, contract: run.contract, char: run.char, daily: run.daily, debtsPaid,
    coins: run.stats.coinsEarned || 0, wax: debtsPaid * CONFIG.wax.perDebtPaid + (won ? CONTRACT[run.contract].rewardWax : 0),
    stats, seen: run.seen, deals: run.deals.length, curses: run.curses.length, debtReached: run.debtIdx + 1,
  };
}
