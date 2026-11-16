// A run: contract, debts, rounds, spins, tricks, banking, interest, deadline, endings, save/resume.
// phase: 'terms' -> 'spin' -> ('post') -> 'spin' ... -> 'roundend' -> 'shop' -> 'terms'
//        debt paid: 'deal' -> 'shop' -> 'terms'; deadline missed: 'pawn' | 'ended'.
import { CONFIG, RARITIES, CHARM, CHARMS, CHAR, CONTRACT, CONTRACTS, STAKE, STAKES, TRICK, SYM, SCORING, SPIRITS, rarityRank } from './data.js';
import { stream } from './streams.js';
import {
  snapshot, fire, runEffects, endSpan, scaleOf, debtBase, slotsOf, pocketsOf, scoreSpin, setHeat, addTrick, addCharm, burnCharm, addCurse, luckOf, activate, chargeOf, chargeCap,
} from './effects.js';
import { pickFavourites, rollGrid, rollRow, rollCells, applySpinEdits, applyGridEdits, COLS } from './machine.js';
import { openShop, rollTermsFor } from './shop.js';
import { hideoutEffects, availableCharms } from './meta.js';
import { initSpirits, FIRST_RUN_SPIRITS, demandRoundEnd, demandHeat, demandPickFav, flushModal } from './spirits.js';
import { startCall, dueRoundEnd } from './calls.js';
import { rollRedEye, hasEye, eyeInfo, redEyeChance } from './omen.js';

export { scaleOf, debtBase };
export { honk as activateCharms };
export const phase = (run) => run.phase;
// The first run banks everything at step 14 and still buys at step 19: the first stall starts the purse at this much (SPEC review 2.6).
export const TUT_PURSE_FLOOR = 20;
export const saveRun = (run) => JSON.stringify(run);
export const loadRun = (s) => upgradeRun(JSON.parse(s));

// Fields v3 adds (SPEC 3.8). A v2 run is upgraded in place by filling these in.
const v3Fields = () => ({
  beads: 0, whiteCalls: 0, whiteTaken: 0, redEyes: 0, callOffer: null, due: [], relics: [], postcards: [], demand: null, tin: null, storm: 0,
  honkEdits: [], favQueue: [], peek: null, himQueue: [], himOrMe: null, himBack: null, roundStartPurse: 0, recent: [], sinceCall: {}, fused: [],
  pendingLift: 0, spinsOff: 0, blend: null,
});
export function upgradeRun(run) {
  if (run.v >= 3) return run;
  for (const [k, v] of Object.entries(v3Fields())) run[k] ??= v;
  if (!run.spirits) initSpirits(run);
  run.v = 3;
  return run;
}

export function newRun({ seed = 'run', contractId = 'c1', charId = 'nim', meta = null, daily = null, postcards = [], storm = 0, unlocked = null } = {}) {
  const ch = CHAR[charId];
  const hide = meta ? hideoutEffects(meta) : {};
  const run = {
    v: 3, ...v3Fields(), postcards: [...postcards], storm, seed: String(seed), rngState: {}, contract: contractId, char: charId, daily: !!daily,
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
  const base = {};
  for (const d of SPIRITS) base[d.id] = (meta?.devotion?.[d.id] >= 1 ? 1 : 0) - (storm >= 5 ? 1 : 0);
  initSpirits(run, { unlocked: unlocked || (meta?.spirits?.length ? meta.spirits : FIRST_RUN_SPIRITS), base });
  for (const f of hide.flags || []) run.perm.push({ type: 'flag', flag: f.flag, v: f.v, src: { kind: 'notebook', id: f.id } });
  if (meta?.luggage && !meta.skipRelics) {
    for (const id of meta.luggage) if (id && CHARM[id] && addCharm(run, id)) { run.charms.at(-1).relic = true; run.relics.push(id); }
  }
  if (meta) meta.skipRelics = false;
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


const closed = (run) => {
  const rec = run.perm.find((r) => r.type === 'flag' && r.flag === 'noShopN' && r.v > 0);
  if (!rec) return false;
  if (--rec.v <= 0) run.perm.splice(run.perm.indexOf(rec), 1);
  return true;
};
// Opens the stall, or (Closing Down Sale) skips it: straight to the terms of the next night.
function enterStall(run) {
  if (!closed(run)) return openShop(run);
  run.shop = null;
  run.tin = null;
  run.phase = 'terms';
  run.termsOffer = null;
  termsOffer(run);
}

function startDebt(run) {
  const mods = snapshot(run);
  const base = debtBase(run.contract, run.debtIdx);
  run.debt = Math.max(1, Math.ceil(base * (1 + (mods.flags.debtMul || 0) / 100) * (1 + run.debtAdj / 100) - 1e-9));
  run.debtAdj = 0;
  run.banked = 0;
  run.slotBought = false; // one slot can be bought per debt
  run.round = 0;
  run.rounds = (mods.flags.rounds ?? CONTRACT[run.contract].rounds) + (mods.flags.roundsAdd || 0);
  run.stats.reachDebt = Math.max(run.stats.reachDebt || 0, run.debtIdx + 1);
  fire(run, 'onDebtStart', { debtIdx: run.debtIdx });
}

// After a deal is signed or refused (or none offered): next debt, then its first shop.
export function nextDebt(run) {
  run.debtIdx++;
  startDebt(run);
  enterStall(run);
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
    else if (run.peek?.terms) { run.termsOffer = run.peek.terms; run.peek.terms = null; } // a neighbour already told you
    else run.termsOffer = rollTermsFor(run);
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
    run.charms.forEach((c, i) => { if (!c.relic && (run.charms[worst].relic || rarityRank(CHARM[c.id].rarity) <= rarityRank(CHARM[run.charms[worst].id].rarity))) worst = i; });
    burnCharm(run, worst);
  }
  if (run.pendingLift > 0) { run.curses.splice(0, run.pendingLift); run.pendingLift = 0; }
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
  run.spinsLeft = Math.max(1, st.spins - (mods.flags.spinsLess || 0) + (mods.flags.spinsRound || 0)) + (run.carrySpins || 0);
  run.carrySpins = 0;
  run.spinsLeft = Math.max(1, run.spinsLeft - (run.spinsOff || 0)); // an offering of "spins off" (the Tin)
  run.spinsOff = 0;
  run.roundStartPurse = run.purse;
  const noCharge = run.postcards.includes('full_charge') && run.round === 0; // Full Charge: no recharge on the first round of each debt
  for (const inst of run.charms) {
    const a = CHARM[inst.id].active;
    if (a && !noCharge) inst.charge = Math.min(chargeCap(run, a), chargeOf(inst) + 1);
  }
  const events = runEffects(run, { kind: 'terms', id }, st.effects, {}, true);
  events.push(...fire(run, 'onRoundStart', {}));
  run.spinsLeft = Math.max(1, run.spinsLeft);
  run.spinInRound = 0;
  run.phase = 'spin';
  prepareSpin(run);
  return events;
}

// Skip a night (never the last one of a debt): no spins, the terms screen's reward instead, then the night ends as usual.
export const canSkip = (run) => run.phase === 'terms' && run.round + 1 < run.rounds && !run.tut && !(run.forcedTerms && run.roundSerial === 0) && !run.postcards.includes('short_cut') && !snapshot(run).flags.noPawn;
export function skipReward(run) {
  const list = CONFIG.skip.rewards;
  return list[(run.roundSerial + hashCode(run.seed)) % list.length];
}
const hashCode = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
export function skipRound(run) {
  if (!canSkip(run)) return null;
  autoResolve(run);
  const r = skipReward(run);
  run.termsOffer = null;
  run.roundSerial++;
  runEffects(run, { kind: 'skip', id: r.id }, r.effects, {});
  run.stats.skips = (run.stats.skips || 0) + 1;
  run.spinsLeft = 0;
  run.phase = 'roundend';
  return endRound(run);
}

function prepareSpin(run) {
  const mods = snapshot(run);
  if (run.favQueue?.length) { run.favs = run.favQueue.shift(); run.nextFavs = null; } // a neighbour's gossip fixed it
  else if (run.nextFavs) { run.favs = run.nextFavs; run.nextFavs = null; }
  else run.favs = pickFavourites(run, mods);
  run.favs = demandPickFav(run, run.favs);
  if (mods.flags.seeNextFav) run.nextFavs = run.favQueue?.[0] ?? pickFavourites(run, mods);
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
  if (mods.flags.noStoke || run.heat >= (mods.flags.heatMax ?? CONFIG.heat.max)) return null;
  run.heat++;
  run.stats.stokes = (run.stats.stokes || 0) + 1;
  demandHeat(run);
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
  let consume = !mods.flags.trickFree;
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
  const ctx = { edits: [...(run.honkEdits || [])] }; // a HONK before the spin (Megaphone) placed its symbols
  run.honkEdits = [];
  const events = fire(run, 'onSpinStart', ctx);
  const mods = snapshot(run);
  if (mods.flags.ghostHire && run.spinInRound === 0) ctx.edits.push({ type: 'place', n: 2, sym: 'wisp' });
  let grid = rollGrid(run, mods, run.favs);
  grid = applySpinEdits(run, mods, grid, run.favs, ctx.edits);
  grid = rollRedEye(run, grid, mods) || grid; // the omen stream: never touched by Luck
  run.pinned = [];
  run.grid = grid;
  run.spinFx = {};
  run.tricksSpin = 0;
  run.stats.spins = (run.stats.spins || 0) + 1;
  if (!mods.flags.noStoke) run.stats.spiceSpins = (run.stats.spiceSpins || 0) + 1; // spins where Spice Up was allowed (run end "never spiced")
  run.phase = 'post';
  const res = { grid: run.grid, favs: run.favs, events, redEye: hasEye(run.grid) ? eyeInfo(run) : null };
  if (run.tricks.some((t) => TRICK[t].when === 'post')) return { ...res, phase: 'post' };
  res.score = collect(run);
  res.phase = run.phase;
  return res;
}

function settle(run) {
  const sc = scoreSpin(run, run.grid, run.favs);
  let gain = Math.floor(sc.total + sc.flat + 1e-9); // flat coin effects are fractional; the purse holds whole coins
  const eye = hasEye(run.grid), { level, blessed } = eye ? eyeInfo(run) : { level: 0, blessed: false };
  if (eye && blessed) gain = Math.floor((sc.total + sc.flat) * 3 + 1e-9); // Counter-stare: the Red Eye pays triple
  else if (eye && level >= 1) gain = 0;
  run.purse += gain;
  if (eye && !blessed) {
    if (level === 2) run.purse = Math.min(run.purse, run.roundStartPurse); // the purse loses what it gained this round
    if (level >= 3) run.purse = 0; // the Kiosk is always safe
  }
  const st = run.stats;
  run.recent.push(gain);
  if (run.recent.length > 5) run.recent.shift();
  if (sc.scorch) (run.sinceCall ??= {}).scorch = true;
  if (eye) {
    run.redEyes++;
    st.redEyes = (st.redEyes || 0) + 1;
    (run.sinceCall ??= {}).redEye = true;
    if (run.banked * 2 > run.debt) st.staredDown = 1;
    fire(run, 'onRedEye', { level });
  }
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
  if (run.heat >= 3) st.heat3Spins = (st.heat3Spins || 0) + 1;
  st.luckReached = Math.max(st.luckReached || 0, luckOf(run, snapshot(run, run.grid, run.favs)));
  if (sc.sigils >= 3) addTrick(run);
  if (sc.found > 0) run.pity = 0;
  else if (!sc.scorch) run.pity += CONFIG.luck.dudPity;
  run.noScorch = false;
  endSpan(run, 'spin');
  return { ...sc, gain, redEye: eye ? { level, blessed } : null };
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

// The Kiosk pays interest on what is BANKED (SPEC 1.1): bank to earn, keep to spend.
function rateOf(mods) {
  let rate = CONFIG.interest.basePct + mods.interest;
  if (mods.flags.interestHalf) rate /= 2;
  return mods.flags.noInterest || mods.flags.noInterestRound ? 0 : Math.max(0, rate);
}
const capOf = (run, mods) => Math.floor((run.debt * CONFIG.interest.capPctOfDebt * (typeof mods.flags.interestCapX === 'number' ? mods.flags.interestCapX : 1)) / 100);
function interestOf(run, mods = snapshot(run)) {
  return Math.max(0, Math.min(Math.floor((run.banked * rateOf(mods)) / 100 + 1e-9), capOf(run, mods)));
}
// What the Kiosk screen shows.
export function kioskForecast(run) {
  const mods = snapshot(run);
  return { balance: run.banked, tonight: interestOf(run, mods), rate: rateOf(mods), cap: capOf(run, mods) };
}

function doBank(run, amount) {
  const mods = snapshot(run);
  const x = typeof mods.flags.bankX === 'number' ? mods.flags.bankX : 1;
  const spend = Math.min(Math.floor(amount), run.purse, Math.ceil((run.debt - run.banked) / x - 1e-9));
  if (spend < 1) return 0;
  run.purse -= spend;
  run.banked += Math.floor(spend * x + 1e-9);
  run.stats.banks = (run.stats.banks || 0) + 1;
  fire(run, 'onBank', { amount: spend });
  return spend;
}

const BANK_PHASES = ['spin', 'roundend', 'shop', 'terms'];
export function bank(run, amount = Infinity) {
  if (!BANK_PHASES.includes(run.phase)) return 0;
  return doBank(run, amount);
}

// PAY NOW: the Kiosk holds the whole debt; pay it early (v2's early-pay rewards).
export const canPayNow = (run) => BANK_PHASES.includes(run.phase) && run.banked >= run.debt && !run.postcards.includes('late_kiosk');
export function payNow(run) {
  if (!canPayNow(run)) return false;
  payDebt(run);
  return true;
}

// Tide Friend (carrySpins): close the night early, up to n unused spins carry to the next one.
export function endNight(run) {
  const n = snapshot(run).flags.carrySpins || 0;
  if (run.phase !== 'spin' || run.tut || !n || run.spinsLeft < 1) return false;
  run.carrySpins = (run.carrySpins || 0) + Math.min(n, run.spinsLeft);
  run.spinsLeft = 0;
  run.phase = 'roundend';
  return true;
}

export function endRound(run) {
  if (run.phase !== 'roundend') throw new Error('round is not over');
  fire(run, 'onRoundEnd', {});
  const interest = interestOf(run);
  run.banked += interest; // the Kiosk pays into the Kiosk
  run.stats.interestTotal = (run.stats.interestTotal || 0) + interest;
  if (interest >= 1) fire(run, 'onInterest', { amount: interest });
  run.shopExtra = !!snapshot(run).flags.shopExtra;
  demandRoundEnd(run);
  endSpan(run, 'round');
  endSpan(run, 'spin');
  run.terms = null;
  run.favs = [];
  run.nextFavs = null;
  if (run.round + 1 < run.rounds) {
    dueRoundEnd(run);
    run.round++;
    if (run.tut && run.roundSerial === 1) run.purse = Math.max(run.purse, TUT_PURSE_FLOOR);
    enterStall(run);
    flushModal(run);
    return { interest, deadline: null };
  }
  const dl = deadline(run);
  if (dl === 'saved') dueRoundEnd(run, true);
  return { interest, deadline: dl };
}

function extraRound(run) {
  run.rounds++;
  run.round++;
  enterStall(run);
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
  if (!saved && run.tut && run.debtIdx === 0) { run.flagsUsed.mercy = true; saved = true; } // the first run cannot be lost before the lesson ends (tut.mercy): every time, not once
  if (saved) { extraRound(run); return (run.lastDeadline = 'saved'); }
  if (!run.flagsUsed.pawn && run.charms.some((c) => !c.relic) && !mods.flags.noPawn) { run.phase = 'pawn'; return (run.lastDeadline = 'pawn'); }
  finish(run, false);
  return (run.lastDeadline = 'collected');
}

// The Pawn: burn one charm, take a random curse, get one more round. Once per run.
export function pawn(run, charmIndex) {
  if (run.phase !== 'pawn' || !run.charms[charmIndex] || run.charms[charmIndex].relic) return false;
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
  const spent = run.phase === 'shop' || run.phase === 'terms' ? run.round : run.round + 1; // in the stall the night just played is already counted
  const unused = Math.max(0, run.rounds - spent);
  const st = run.stats;
  st.debtsPaid = (st.debtsPaid || 0) + 1;
  st.cursesAtPay = Math.max(st.cursesAtPay || 0, run.curses.length);
  if (run.purse * 100 <= 10 * run.debt) st.exactChange = (st.exactChange || 0) + 1;
  if (unused > 0) {
    run.wick += unused * CONFIG.earlyPay.wickPerUnusedRound;
    run.carrySpins = (run.carrySpins || 0) + unused * CONFIG.earlyPay.spinsPerUnusedRound;
    for (let i = 0; i < CONFIG.earlyPay.trickPerDebt; i++) addTrick(run);
    const interest = unused * interestOf(run); // the round ends paying early skips still pay their interest
    run.purse += interest;
    st.interestTotal = (st.interestTotal || 0) + interest;
    run.earlyShop = unused * (CONFIG.earlyPay.shopPerUnusedRound || 0); // the shop visits paying early skips come back as offers and rerolls
    st.earlyPays = (st.earlyPays || 0) + 1;
  }
  run.carrySpins = (run.carrySpins || 0) + Math.max(0, run.spinsLeft || 0); // spins left in tonight's round carry too
  fire(run, 'onDebtPaid', { roundsLeft: unused, purse: run.purse });
  endSpan(run, 'debt');
  run.terms = null;
  run.spinsLeft = 0;
  run.favs = [];
  run.nextFavs = null;
  run.due = [];
  run.shop = null;
  run.tin = null;
  if (!run.endless && run.debtIdx >= CONTRACT[run.contract].debts.length - 1) return finish(run, true);
  startCall(run); // the phone rings: Ruby's deals are his red card
}

const toDeal = startCall;

// After the contract is cleared: keep the same run going. Debts keep growing; the score is debts paid.
export const canContinue = (run) => run.phase === 'ended' && !!run.result?.won && !run.endless && !run.daily && !run.tut;
export function continueEndless(run) {
  if (!canContinue(run)) return false;
  run.endless = true;
  run.result = null;
  toDeal(run);
  return true;
}

function endingOf(run) {
  const cIdx = CONTRACTS.findIndex((c) => c.id === run.contract);
  // Left Luggage: c10 with all four luggage lockers holding fused charms. The Refuser: c5 or later and one white call taken (Review 4.3: two do not fit in the debts).
  if (run.contract === 'c10' && run.relics.length === 4 && run.relics.every((id) => CHARM[id].rarity === 'fused')) return 'left_luggage';
  if (cIdx >= 4 && run.whiteTaken >= 1) return 'the_refuser';
  const id = CONTRACT[run.contract].ending;
  const e = CONFIG.endings.find((x) => x.id === id);
  if (!e) return null;
  if (e.cond === 'dealsSigned == 0' && run.deals.length) return null;
  if (e.cond === 'curses >= 5' && run.curses.length < 5) return null;
  return id;
}

function finish(run, won) {
  won = won || !!run.endless; // an endless run has already cleared its contract
  run.phase = 'ended';
  run.result = { won, ending: won ? endingOf(run) : null };
}

// ---------- read-only helpers for the UI and the meta layer ----------

// Needed per remaining spin vs the average of the last 5 spins (a night is counted as 5 spins).
export function paceOf(run) {
  const left = run.spinsLeft + Math.max(0, run.rounds - run.round - 1) * 5;
  const owed = Math.max(0, run.debt - run.banked - run.purse);
  const need = left > 0 ? owed / left : owed;
  const avg = run.recent.length ? run.recent.reduce((a, b) => a + b, 0) / run.recent.length : 0;
  return { need, avg, behind: run.recent.length >= 2 && avg < need };
}

// HONK: press the horn; every full active charm fires. null when nothing is charged.
export function honk(run) {
  if (run.phase !== 'spin') return null;
  if (!run.charms.some((c) => CHARM[c.id].active && chargeOf(c) >= CHARM[c.id].active.need)) return null;
  const events = activate(run);
  run.stats.honks = (run.stats.honks || 0) + 1;
  return events;
}

export function info(run) {
  const mods = snapshot(run);
  return {
    spirits: Object.fromEntries(SPIRITS.map((d) => [d.id, { ...run.spirits[d.id], unlocked: run.unlocked.includes(d.id) }])), beads: run.beads, redEyeChance: redEyeChance(run, mods),
    pace: paceOf(run), due: (run.due || []).filter((d) => d.debt === run.debtIdx + 1), kiosk: kioskForecast(run), canPayNow: canPayNow(run),
    canHonk: run.phase === 'spin' && run.charms.some((c) => CHARM[c.id].active && chargeOf(c) >= CHARM[c.id].active.need),
    canEndNight: run.phase === 'spin' && !!mods.flags.carrySpins && run.spinsLeft > 0,
    S: scaleOf(run), owed: run.debt - run.banked, luck: luckOf(run, mods), slots: slotsOf(run, mods), pockets: pocketsOf(run, mods),
    favHidden: !!mods.flags.hideFav, nextFavs: run.nextFavs, canStoke: run.phase === 'spin' && !mods.flags.noStoke && run.heat < (mods.flags.heatMax ?? CONFIG.heat.max),
    redrawCost: redrawCost(run), canPickFav: !!mods.flags.pickFirstFav && run.phase === 'spin' && run.spinInRound === 0, needsBurn: needsBurn(run), pendingRemove: run.pendingRemove,
  };
}

export function summary(run) {
  const won = !!run.result?.won;
  const debtsPaid = run.stats.debtsPaid || 0;
  const stats = { ...run.stats };
  const stash = debtsPaid * CONFIG.wax.perDebtPaid + (won ? CONTRACT[run.contract].rewardWax : 0);
  const redSpirits = stats.redSpirits || [];
  delete stats.redSpirits;
  if (won) stats.contract = CONTRACT[run.contract].tier;
  if (won && !run.deals.length) stats.cleanContract = 1;
  stats.cursesHeld = stats.cursesAtPay || 0;
  delete stats.cursesAtPay;
  return {
    won, ending: run.result?.ending || null, contract: run.contract, char: run.char, daily: run.daily, debtsPaid,
    endless: run.endless ? Math.max(0, debtsPaid - CONTRACT[run.contract].debts.length) : null,
    coins: run.stats.coinsEarned || 0, stash, wax: stash,
    stats, seen: run.seen, deals: run.deals.length, curses: run.curses.length, debtReached: run.debtIdx + 1,
    // v3: what the meta layer needs (Stash, keys, Left Luggage, codex, endings)
    heldCharms: run.charms.filter((c) => !c.relic).map((c) => c.id), relics: run.relics, fused: run.fused, redEyes: run.redEyes, whiteTaken: run.whiteTaken, whiteCalls: run.whiteCalls,
    spirits: Object.fromEntries(SPIRITS.map((d) => [d.id, { fav: run.spirits[d.id].fav, stage: run.spirits[d.id].stage, wrath: run.spirits[d.id].wrath, met: run.spirits[d.id].met }])),
    redSpirits, storm: run.storm, postcards: run.postcards, noRelic: !!snapshot(run).flags.noRelic, scorches: run.stats.scorches || 0, rung: Math.floor(debtsPaid / 2),
  };
}
