// Boot, screen router and the run loop (docs/v2/TECH.md). Glue only: rules live in core, drawing in view, text and buttons in ui.
// Order of a spin: core first (outcome fixed), save, then the view plays it back with sounds. Every decision is saved at once, so a
// closed app comes back in the same phase with the same future (the rng streams are counted inside the run).
// Sounds: v2 events reuse the v1 sound ids (stoke = lantern_light ladder, scorch = quota_fail, sign = event_stamp, trick = peg_on,
// curse = orhan_cough); new ids need a licence row in docs/licenses/INDEX.csv first.
import './ui/ui.css';
import { CONFIG, SYMBOLS, SYM, SCORING, CHARM, TRICK, CURSE, CONTRACT, DEAL } from './core/data.js';
import { newRun, termsOffer, pickTerms, stoke, redrawFavourite, spin, collect, bank, endRound, leaveShop, pawn, declinePawn, useTrick, trickTarget, pickStartCharm, info, summary, scaleOf, canSkip, skipReward, skipRound, canContinue, continueEndless, debtBase } from './core/run.js';
import { price, buyCharm, sellCharm, moveCharm, buyTrick, doBench, buySlot, reroll, toggleLock, takeWaiting, sellValue } from './core/shop.js';
import { signDeal, refuseDeals } from './core/deals.js';
import { snapshot, slotsOf, pocketsOf, addCharm, addTrick, addCurse, bossOf, coinScaleOf } from './core/effects.js';
import { applyRunResult, buyHideout } from './core/meta.js';
import { dailySeed, dailySetup, newDailyRun, recordDaily } from './core/daily.js';
import { initAds, adsState, noteRunFinished, rewardedReady, showRewarded, maybeShowInterstitial } from './services/ads.js';
import { initIap, has as ownsProduct } from './services/iap.js';
import { ensureConsent } from './services/consent.js';
import * as haptics from './services/haptics.js';
import { artIds } from './view/sprites.js';
import { initView, resize, tick, getLayout, cellAt, setHandlers, setInsets, setGrid, playSpin, playPatterns, clearHighlights, setHeld, setTargets, pulseCells, skip, flyCoins, bigWin, shakeScreen, setDevil, refreshArt } from './view/view.js';
import { initUi, showScreen, hideScreen, updateHud, setBusy, showPrompt, insets, toast, say, setLanguage, openSheet, closeSheet } from './ui/ui.js';
import { h, btn, art, setArtIds } from './ui/dom.js';
import { detailSheet } from './ui/cards.js';
import { initInput } from './input.js';
import { loadSave, writeSave } from './save.js';
import { initAudio, play, playStep, setVolumes } from './audio/audio.js';
import { t, L, fmt, getLang } from './i18n.js';
import { TUTORIAL_SEED, TUTORIAL_TERMS, TUTORIAL_CHARMS, coachFor } from './tutorial.js';

const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
const STARTER_WAX = 100; // the one fixed Wax grant of starter_pack (store text)
const DECOR = Array.from({ length: 15 }, (_, i) => SCORING[(i * 4 + Math.floor(i / 5)) % SCORING.length]); // reel face before the first spin; not a draw
const ALL = Array.from({ length: 15 }, (_, i) => i);
const PROMPT = { col: 'ui.promptColumn', row: 'ui.promptRow', cell: 'ui.promptCell', pair: 'ui.promptPair' };
const MACHINE = new Set(['spin', 'post', 'roundend']); // phases played on the machine; every other phase is a screen
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const save = loadSave(), meta = save.meta;
let run = null, busy = false, instant = false, input = null, forcedSeed = null, targeting = null, lastEnd = null, seen = {};
const todayUTC = () => new Date().toISOString().slice(0, 10); // the daily run is the same UTC day for everyone
const layerOpen = () => !!document.querySelector('.layer:not([hidden])');
const persist = () => { save.run = run; writeSave(save); };
const calm = () => !!meta.settings.reduceMotion;
const no = (reason = 'unknown') => { play('deny'); return { ok: false, reason }; };
const payWhy = (p) => ((p.coins || 0) > run.purse ? 'coins' : (p.wick || 0) > run.wick ? 'wick' : 'unknown');
const nameOf = (id) => L((CHARM[id] ?? TRICK[id] ?? CURSE[id] ?? SYM[id])?.name) || id;

// ---------- machine ----------
function refreshCoach() {
  if (!input) return;
  const c = run?.tut && !targeting ? coachFor(run, seen) : null, onMachine = !!run && MACHINE.has(run.phase) && !layerOpen();
  input.coach(c ? t(c.key) : null);
  if (onMachine && !targeting) setTargets(c?.cells ?? []);
}

function syncMachine() {
  setGrid(run.grid ?? DECOR);
  setHeld(run.pinned.map((p) => p.cell));
  updateHud(run);
  refreshCoach();
}

function cancelTarget() {
  if (!targeting) return;
  targeting = null; showPrompt(null); setTargets([]); refreshCoach();
}

// "24 x 1.3 = 31": only the multipliers that are not 1.
function scoreText(sc) {
  const parts = [fmt(sc.sum)];
  if (sc.heatMult !== 1) parts.push(sc.heatMult.toFixed(2));
  if (sc.allMult !== 1) parts.push(String(Math.round(sc.allMult * 100) / 100));
  return (parts.length > 1 ? `${parts.join(' × ')} = ${fmt(sc.total)}` : fmt(sc.total)) + (sc.flat ? ` + ${fmt(sc.flat)}` : '');
}
const chipText = (c) => `${c.kind === 'heat' ? t('ui.heat') : nameOf(c.id)} +${fmt(c.gain)}`;

// Plays one scored result: pattern strokes with a rising pitch, the Scorch, coins to the debt bar, the numbers, Brimble.
async function showScore(sc) {
  const cells = [...new Set(sc.patterns.flatMap((p) => p.cells))], gain = sc.gain ?? sc.total + sc.flat;
  if (!instant && sc.patterns.length) await playPatterns(sc.patterns, { onStep: (s) => { playStep(s.p + s.k); if (s.last) haptics.tick(); } });
  if (sc.scorch) {
    play('quota_fail'); if (!calm()) shakeScreen(8);
    setDevil('grin', 1.6); toast('ui.scorched', { n: sc.burn }); say('brimble', 'scorch');
  }
  if (gain > 0) {
    const big = gain * 4 >= run.debt ? 2 : gain * 10 >= run.debt ? 1 : 0;
    flyCoins(gain, cells.length ? cells : [7]); play('coin_fly');
    input.score(scoreText(sc), sc.top3.filter((c) => c.gain > 0).map(chipText));
    if (big) { if (!calm()) bigWin(big); play('big_win'); haptics.success(); say('brimble', 'big'); } else setDevil('angry', 0.9);
  } else if (!sc.scorch) {
    input.score(t('ui.noPattern'), [], 1200); setDevil('grin', 0.9);
    if ((run.stats.spins || 0) % 3 === 0) say('brimble', 'dud');
  }
  updateHud(run);
  if (!instant) await sleep(gain > 0 ? 450 : 150);
  if (sc.second) await showScore(sc.second); // "the last spin scores twice"
}

// Runs one machine step with the buttons locked. fn returns after its animation.
async function step(fn) {
  if (busy) return;
  busy = true; setBusy(true); cancelTarget(); input.coach(null); input.score(null); setTargets([]);
  try { await fn(); } finally { busy = false; setBusy(false); }
  updateHud(run); refreshCoach();
}

const doSpin = () => (run?.phase === 'spin' && run.spinsLeft > 0 ? step(async () => {
  const held = run.pinned.map((p) => p.cell), res = spin(run);
  clearHighlights();
  persist(); // saved before the animation: closing the app cannot re-draw this spin
  if (instant) setGrid(res.grid);
  else {
    play('crank_pull');
    await playSpin({ grid: res.grid, held }, { fast: meta.settings.fast, onStop: (c) => play(`reel_stop_${1 + (c % 3)}`) });
  }
  setHeld([]);
  if (res.score) await showScore(res.score);
}) : undefined);

const doCollect = () => (run?.phase === 'post' ? step(async () => {
  const sc = collect(run);
  persist();
  await showScore(sc);
}) : undefined);

function applyTrick(pocket, target) {
  const id = run.tricks[pocket], before = run.grid, r = useTrick(run, pocket, target);
  if (!r.ok) return no(r.why === 'timing' ? 'locked' : 'target');
  if (TRICK[id].op.type === 'shiftColumn') seen.nudge = true;
  play('peg_on'); haptics.tick(); persist();
  clearHighlights();
  if (run.grid) { setGrid(run.grid); if (before) pulseCells(ALL.filter((i) => run.grid[i] !== before[i])); }
  setHeld(run.pinned.map((p) => p.cell));
  setDevil('shock', 1);
  updateHud(run); refreshCoach();
  return { ok: true };
}

function onCell(i) {
  if (busy) { skip(); return; }
  if (!targeting || i < 0 || layerOpen()) return;
  const tg = targeting, row = Math.floor(i / 5), col = i % 5;
  if (tg.kind === 'pair' && tg.a == null) { tg.a = i; setTargets(ALL.filter((j) => Math.abs(Math.floor(j / 5) - row) + Math.abs((j % 5) - col) === 1)); return; }
  const target = tg.kind === 'col' ? { col } : tg.kind === 'row' ? { row } : tg.kind === 'cell' ? { cell: i } : { a: tg.a, b: i, from: tg.a, to: i };
  cancelTarget();
  if (applyTrick(tg.pocket, target).ok === false) toast('why.target');
}

// Long-press on a cell: what that symbol is.
function onInspect(i) {
  const id = run?.grid?.[i];
  if (id && !busy && !layerOpen()) openSheet(detailSheet({ kind: 'symbol', id }, closeSheet));
}

// A sheet with one card per choice (start charm, a symbol for a trick).
function pickSheet(title, entries, pick) {
  openSheet(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, title),
    h('div', { class: 'cards' }, entries.map((e) => h('button', { type: 'button', class: 'card pick', onclick: () => { closeSheet(); pick(e.id); } },
      h('span', { class: 'pic' }, art(e.icon, 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(e.name)), e.text && h('span', { class: 'fx' }, L(e.text)))))),
    h('div', { class: 'sheet-acts' }, btn(t('ui.close'), closeSheet))));
}

// ---------- flow ----------
function showHome() {
  run = null; busy = false; targeting = null;
  updateHud(null); input?.coach(null); input?.score(null);
  showScreen('home', { meta, today: todayUTC() });
}

// Shows what the run's phase needs: a screen, or the machine.
function route() {
  if (!run) return showHome();
  for (let i = run.waiting.length - 1; i >= 0; i--) takeWaiting(run, i); // a deal's charm that waited for a free slot
  const data = { run, meta };
  switch (run.phase) {
    case 'terms': {
      const offers = termsOffer(run);
      if (run.tut && run.roundSerial === 0) { pickTerms(run, offers[0].id); persist(); return route(); } // night 1 of the first run: no pick
      showScreen('terms', { ...data, offers, skip: canSkip(run) ? skipReward(run) : null }); break;
    }
    // offers is read on every repaint, so a buy or a lock shows at once
    case 'shop': showScreen('shop', { ...data, get offers() { const s = run?.shop ?? {}; return { charms: (s.charms ?? []).map((id) => ({ id, locked: run.lock === id })), tricks: s.tricks, bench: s.bench }; } }); break;
    case 'deal': showScreen('deal', { ...data, offers: run.dealOffer }); break;
    case 'pawn': showScreen('pawn', data); break;
    case 'ended': // a cleared contract may go on: endless debts, scored by debts paid
      if (canContinue(run)) { showScreen('endless', { ...data, next: debtBase(run.contract, run.debtIdx + 1) }); break; }
      return endRun();
    default:
      hideScreen(); syncMachine();
      if (run.startPick?.length) pickSheet(t('ui.pickCharm'), run.startPick.map((id) => CHARM[id]), (id) => { pickStartCharm(run, id); persist(); updateHud(run); });
      return;
  }
  updateHud(run); refreshCoach();
  if (run.tut && run.debtIdx === 0) { // the first wagon and the first deal get one line each
    if (run.phase === 'shop' && run.roundSerial === 1) say('pip', 'tutShop');
    if (run.phase === 'deal') say('brimble', 'tutDeal');
  }
}

function begin() {
  seen = {}; lastEnd = null; save.runAt = Date.now();
  persist();
  setDevil('deal', 1.5);
  route();
  say('brimble', 'start');
}

function startRun({ charId = 'nim', contractId = 'c1', tutorial = false } = {}) {
  const tut = tutorial && !meta.tutorialDone && forcedSeed == null;
  const seed = String(forcedSeed ?? (tut ? TUTORIAL_SEED : `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`)); // a seed, not a draw
  forcedSeed = null;
  run = newRun({ seed, contractId: CONTRACT[contractId] ? contractId : 'c1', charId, meta });
  if (tut) { run.tut = true; run.forcedTerms = TUTORIAL_TERMS; }
  save.runDate = null;
  begin();
}

// Debt paid (or the deadline saved by a pact item): the stamp screen, then the deal, the wagon or the run end.
function paid(outcome, pre, extra = {}) {
  const next = run.phase === 'deal' ? debtBase(run.contract, run.debtIdx + 1) : run.phase === 'shop' && outcome === 'paid' ? run.debt : 0;
  if (outcome === 'paid') {
    meta.tutorialDone = true; // the first debt is the lesson; a quit after it does not replay it
    if (run.tut && run.phase === 'deal' && run.debtIdx === 0 && DEAL.lucky_break) run.dealOffer = ['lucky_break']; // the first deal is one plain offer, and a good one: signing can win
  }
  persist();
  play('stamp_paid'); haptics.success(); setDevil(outcome === 'paid' ? 'grin' : 'shock', 2);
  showScreen('paid', { run, meta, outcome, info: { earlyRounds: outcome === 'paid' ? pre.unused : 0, wick: pre.unused * CONFIG.earlyPay.wickPerUnusedRound, spins: pre.unused * CONFIG.earlyPay.spinsPerUnusedRound, kept: run.purse, next, ...extra } });
  updateHud(run); refreshCoach();
}
const preOf = () => ({ unused: Math.max(0, run.rounds - run.round - 1), items: [...run.tricks, ...run.charms.map((c) => c.id)] });

// Every finished run is paid out once (Wax, achievements, unlocks, the next contract), then it leaves the save.
function endRun() {
  const ended = run, s = summary(ended), result = applyRunResult(meta, s);
  if (s.won && !meta.cleared.includes(s.contract)) meta.cleared.push(s.contract);
  if (ended.daily) result.wax += recordDaily(meta, save.runDate ?? todayUTC(), s).wax;
  meta.tutorialDone = true;
  noteRunFinished(Math.max(0, (Date.now() - (save.runAt || Date.now())) / 1000));
  run = null; save.run = null; save.runDate = null;
  writeSave(save);
  play(s.won ? 'run_win' : 'quota_fail'); setDevil(s.won ? 'shock' : 'collect', 3);
  lastEnd = {
    run: ended, meta, won: s.won, ending: s.ending, again: { charId: ended.char, contractId: ended.contract },
    summary: { ...s, stats: { ...s.stats, bestSpin: s.stats.spinCoins, curses: s.curses } },
    result: { wax: result.wax, newAchievements: result.newAchievements.map((a) => a.id), unlocks: result.unlocks, doubled: false },
  };
  updateHud(null); input.coach(null); input.score(null);
  showScreen('runend', lastEnd);
}

// ---------- ui handlers (the contract is at the top of src/ui/ui.js) ----------
const shop = (ok, sound, why) => { if (!ok) return no(why); play(sound); persist(); return undefined; };
const newCurses = (before) => { for (const id of run.curses) if (!before.includes(id)) { toast('ui.newCurse', { name: nameOf(id) }); play('orhan_cough'); } };

const ui = {
  startRun,
  pickTerms(id) { if (!pickTerms(run, id)) return no(); play('ui_page'); persist(); route(); return undefined; },
  stoke() {
    if (busy || !stoke(run)) return no('max');
    seen.stoke = true;
    playStep(Math.min(4, Math.floor(run.heat / 2)), 'lantern_light'); haptics.tick(); setDevil('grin', 0.8);
    if (run.heat === 1 || run.heat === 7) say('brimble', run.heat >= 7 ? 'heatHigh' : 'stoke');
    persist(); refreshCoach(); return undefined;
  },
  redrawFav() { if (busy || run?.phase !== 'spin') return no(); if (!redrawFavourite(run)) return no('wick'); play('ui_page'); persist(); return undefined; },
  spin: doSpin,
  collect: doCollect,
  bank(amount) {
    const pre = preOf(), was = run.phase;
    if (busy || !bank(run, amount)) return no('coins');
    play('coin_jar');
    if (run.phase !== was) return paid('paid', pre);
    persist(); return undefined;
  },
  endRound() {
    if (busy || run.phase !== 'roundend') return undefined;
    const pre = preOf(), r = endRound(run);
    if (run.tut && run.phase === 'shop' && run.debtIdx === 0 && run.roundSerial === 1) run.shop.charms = TUTORIAL_CHARMS.filter((id) => CHARM[id]);
    if (r.deadline === 'paid') return paid('paid', pre, { interest: r.interest });
    if (r.deadline === 'saved') return paid('saved', pre, { interest: r.interest, name: nameOf(pre.items.find((id) => ![...run.tricks, ...run.charms.map((c) => c.id)].includes(id)) ?? '') });
    persist();
    if (r.interest > 0) toast('ui.paidInterest', { n: r.interest });
    if (r.deadline === null) play('shop_open');
    route(); return undefined;
  },
  skipNight() {
    if (busy || !canSkip(run)) return no();
    const r = skipRound(run);
    persist();
    if (r.interest > 0) toast('ui.paidInterest', { n: r.interest });
    play('ui_page'); route(); return undefined;
  },
  collectWin() { endRun(); },
  goEndless() { if (!continueEndless(run)) return no(); play('event_stamp'); persist(); route(); return undefined; },
  useTrick(pocket) {
    if (busy) return undefined;
    const kind = trickTarget(run.tricks[pocket]);
    if (!kind) return applyTrick(pocket, {});
    if (kind === 'sym') return pickSheet(t('ui.promptSymbol'), SCORING.filter((s) => !run.removed.includes(s)).map((s) => SYM[s]), (sym) => { applyTrick(pocket, { sym }); });
    targeting = { pocket, kind, a: null };
    input.coach(null); setTargets(ALL); showPrompt(PROMPT[kind], cancelTarget);
    return undefined;
  },
  signDeal(id) { const before = [...run.curses]; if (!signDeal(run, id)) return no(); play('event_stamp'); newCurses(before); persist(); route(); return undefined; },
  refuseDeals() { if (!refuseDeals(run)) return no('locked'); play('ui_page'); persist(); route(); return undefined; },
  pawn(i) { const before = [...run.curses]; if (!pawn(run, i)) return no(); newCurses(before); persist(); route(); return undefined; },
  declinePawn() { declinePawn(run); persist(); route(); },
  leaveShop() { leaveShop(run); persist(); route(); },
  paidContinue() { route(); },
  // Run end closed: an interstitial only here, between runs, and only when every rule in services/ads.js allows it.
  async home() { await maybeShowInterstitial({ slot: 'after_run_end' }); showHome(); },
  async again() { await maybeShowInterstitial({ slot: 'after_run_end' }); startRun(lastEnd?.again ?? {}); },

  buyCharm(i) { const id = run.shop?.charms[i]; return shop(buyCharm(run, i), 'buy', run.charms.length >= slotsOf(run) ? 'full' : id ? payWhy(price(run, { kind: 'charm', id })) : 'unknown'); },
  sellCharm: (slot) => shop(sellCharm(run, slot), 'sell'),
  moveCharm: (from, to) => shop(moveCharm(run, from, to), 'ui_tap'),
  buyTrick(i) { const id = run.shop?.tricks[i]; return shop(buyTrick(run, i), 'buy', run.tricks.length >= pocketsOf(run) ? 'full' : id ? payWhy(price(run, { kind: 'trick', id })) : 'unknown'); },
  bench(i, target) { const id = run.shop?.bench[i]; return shop(doBench(run, i, target), 'build_hammer', id && !run.freeBench ? payWhy(price(run, { kind: 'bench', id })) : 'max'); },
  buySlot: () => shop(buySlot(run), 'buy', run.slotBought || run.slots >= CONFIG.start.charmSlotsMax ? 'max' : 'wick'),
  reroll: () => shop(reroll(run), 'reroll', 'coins'),
  lock: (i) => shop(toggleLock(run, i), 'ui_tap', 'noLock'),
  price(item, kind) {
    if (kind === 'sell') return sellValue(run, { id: item.id });
    if (kind === 'reroll') return run.shop?.freeRerolls > 0 ? { coins: 0 } : price(run, { kind });
    if (kind === 'bench' && run.freeBench > 0) return { coins: 0 };
    return price(run, { kind, id: item.id });
  },

  buyHideout(id) { if (!buyHideout(meta, id)) return no('wax'); play('build_done'); writeSave(save); return { ok: true }; },
  daily() {
    const date = todayUTC();
    if (meta.daily.date === date) return no('locked');
    run = newDailyRun(date); save.runDate = date;
    begin(); return undefined;
  },
  dailyInfo() { const s = dailySetup(dailySeed(todayUTC())); return { charId: s.charId, contractId: s.contractId, termsId: s.forcedTerms, curseId: s.curse }; },

  // The numbers the screens print, from the core (flags, curses and the debt scale are its business).
  derive(r) {
    const i = info(r), f = snapshot(r).flags;
    return {
      target: r.debt, scale: coinScaleOf(r), debt: r.debtIdx + 1, debts: r.endless ? r.debtIdx + 1 : CONTRACT[r.contract].debts.length, round: Math.min(r.round + 1, r.rounds), rounds: r.rounds,
      spins: r.spinsLeft, luck: i.luck, canStoke: i.canStoke, stokeWhy: f.noStoke ? 'ui.stokeNo' : 'ui.stokeMax', favHidden: i.favHidden,
      noLock: !!f.rerollDouble, mustSign: !!f.mustSign, redrawCost: i.redrawCost, boss: bossOf(r), refuseWick: Math.max(CONFIG.deals.refuseWick, r.hide?.refuseWick || 0, f.refuseWick || 0),
    };
  },

  // Reward ads are optional buttons with a fixed reward: one free wagon reroll, or the run's Wax doubled. Never a spin, a coin or odds.
  // No offer in or right after the first run (a first loss is never followed by an ad button).
  adReady: (placement) => adsState().finishedRuns >= 2 && !run?.tut && rewardedReady(placement, { inRun: !!run }),
  async watchAd(placement) {
    const r = await showRewarded(placement, { inRun: !!run });
    if (!r.rewarded) { toast(r.reason === 'closed' || r.reason === 'dismissed' ? 'ads.noReward' : 'ads.unavailable'); return; }
    if (placement === 'shop_reroll' && run?.shop) { run.shop.freeRerolls++; persist(); }
    if (placement === 'double_wax' && lastEnd && !lastEnd.result.doubled) { lastEnd.result.doubled = true; meta.wax += lastEnd.result.wax; writeSave(save); play('plank_gain'); }
  },
  settingsChanged(s) {
    Object.assign(meta.settings, s);
    setVolumes({ sfx: s.sfx, music: s.music }); haptics.setHapticsEnabled(s.haptics);
    writeSave(save); refreshCoach();
  },
};

// ---------- debug hook (tests only: active with ?debug=1) ----------
function installDebug() {
  const state = () => ({
    screen: document.querySelector('.layer:not([hidden]) .panel')?.className.replace('panel ', '').trim() ?? (run ? 'game' : 'none'),
    busy, lang: getLang(), phase: run?.phase ?? null, seed: run?.seed ?? null, tut: !!run?.tut,
    debtIdx: run?.debtIdx ?? 0, debt: run?.debt ?? 0, banked: run?.banked ?? 0, round: run?.round ?? 0, rounds: run?.rounds ?? 0, spinsLeft: run?.spinsLeft ?? 0,
    purse: run?.purse ?? 0, wick: run?.wick ?? 0, heat: run?.heat ?? 0, grid: run?.grid ?? null, favs: run?.favs ?? [],
    charms: run?.charms.map((c) => c.id) ?? [], tricks: run?.tricks ?? [], curses: run?.curses ?? [], deals: run?.deals ?? [],
    shop: run?.shop ?? null, terms: run?.termsOffer ?? null, dealOffer: run?.dealOffer ?? null, rngState: run ? { ...run.rngState } : null, result: run?.result ?? lastEnd?.summary ?? null,
    wax: meta.wax, tutorialDone: meta.tutorialDone, contracts: meta.contracts, achievements: meta.achievements.length, finishedRuns: adsState().finishedRuns,
  });
  // QA shortcuts on the live run. grid: a rigged result waiting for COLLECT. lose: the last night ends with nothing.
  const cheat = (o = {}) => {
    if (!run) return;
    for (const k of ['purse', 'wick', 'heat', 'banked', 'spinsLeft']) if (k in o) run[k] = o[k];
    if (o.charm) addCharm(run, o.charm);
    if (o.trick) addTrick(run, o.trick);
    if (o.curse) addCurse(run, o.curse);
    if (o.grid && MACHINE.has(run.phase)) { run.grid = o.grid; run.phase = 'post'; }
    if (o.lose) { run.charms = []; run.tricks = []; run.purse = 0; run.flagsUsed.extraLife = true; run.round = run.rounds - 1; run.spinsLeft = 0; run.phase = 'roundend'; }
    persist();
    if (MACHINE.has(run.phase)) { hideScreen(); syncMachine(); } else updateHud(run);
  };
  const acts = { ...ui, cheat, trick: ({ pocket = 0, target = {} } = {}) => applyTrick(pocket, target) };
  window.__pact = {
    state,
    // One handler (the same ones the buttons call) with every animation skipped, so the result never depends on timing.
    async act(name, arg) {
      if (!acts[name]) throw new Error('unknown action ' + name);
      instant = true; skip();
      try { await acts[name](...(Array.isArray(arg) ? arg : arg == null ? [] : [arg])); } finally { instant = false; }
      return state();
    },
    goto(name, data = {}) {
      if (name === 'home') return showHome();
      if (name === 'game') { hideScreen(); if (run) syncMachine(); return undefined; }
      if (['terms', 'shop', 'deal', 'pawn'].includes(name)) return route(); // only what the run's phase allows
      return showScreen(name, { run, meta, today: todayUTC(), ...data });
    },
    setLang: (l) => setLanguage(l),
    seed(n) { forcedSeed = n; },
  };
}

// ---------- boot ----------
async function boot() {
  await refreshArt();
  setArtIds(artIds());
  const canvas = document.getElementById('c');
  initView(canvas, { symbols: SYMBOLS });
  initUi(ui, meta.settings);
  setHandlers({ coinLand: () => play('coin_jar', { vol: 0.5 }) });
  input = initInput({
    canvas, host: document.querySelector('.ui-col'), cellAt, onCell, onInspect,
    onPrimary: () => { if (layerOpen() || !run) return; if (run.phase === 'spin') doSpin(); else if (run.phase === 'post') doCollect(); },
    onFirstTouch: () => { initAudio().then(() => setVolumes({ sfx: meta.settings.sfx, music: meta.settings.music })).catch(() => {}); },
  });
  // The machine sits between the two DOM HUD bars; their heights change with the text, so they are read again a few times a second.
  // The first debt keeps room for the coach line.
  const fit = () => { const i = insets(); setInsets(i.top ? i.top + 10 : 0, i.bottom + (run?.tut && run.debtIdx === 0 ? 70 : 0)); const lay = getLayout(); if (lay) input.layout(lay); };
  window.addEventListener('resize', () => { resize(); fit(); });
  resize(); fit();

  let last = performance.now(), n = 0;
  const frame = (now) => {
    tick((now - last) / 1000); last = now;
    if (++n % 10 === 0) fit();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Services: consent before any ad request, then purchases, then ads. A failure here never stops the game.
  try {
    await ensureConsent();
    await initIap({ cache: save.iap, onChange: () => {
      meta.iap.noAds = ownsProduct('remove_ads');
      if (ownsProduct('starter_pack') && !save.starterGranted) { save.starterGranted = true; meta.wax += STARTER_WAX; }
      writeSave(save);
    } });
    await initAds({ state: save.ads, onChange: () => writeSave(save) });
  } catch (e) { console.warn('services', e); }

  if (DEBUG) installDebug();
  // A saved run comes back where it stopped. The very first run starts at once (no menu before the first spin); home is first from then on.
  if (save.run) { run = save.run; route(); } else if (!meta.tutorialDone) startRun({ tutorial: true }); else showHome();
}
boot();
