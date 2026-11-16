// Boot, screen router and the one game loop (TECH.md section 1, ROADMAP.md M2). Glue only: rules live in core, drawing in view, text in ui.
// Order of a spin: core spin first (outcome fixed), save, then the view plays it back, then the pay beats with sounds and Deni lines.
import './ui/ui.css';
import { newRun, spin, togglePeg, endTide, nextTide, runSummary } from './core/run.js';
import { rollShop } from './core/shop.js';
import { TIDES_PER_RUN } from './core/econ.js';
import { SYMBOLS } from './core/data/symbols.js';
import { preloadArt } from './view/sprites.js';
import { initView, resize, tick, setScreen, setHud, getLayout, cellAt, setHandlers, setGrid, playSpin, showPegs, pulseCells, markCells, pulsePegs, playLines, skip, flyCoins, setDeni } from './view/view.js';
import { initUi, showScreen, hideScreen, updateHud, toast, toastText, say, setLanguage, settings } from './ui/ui.js';
import { symText } from './ui/bag.js';
import { initInput } from './input.js';
import { loadSave, writeSave } from './save.js';
import { initAudio, play, playStep, setVolumes } from './audio/audio.js';
import { t } from './i18n.js';

const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
const TUTORIAL_SEED = 162; // spin 1 is a sardine pair; pegging it and spinning again pays a line (checked in scripts/smoke.mjs)
const UNLOCKED = ['start', 'cat_basket', 'radio', 'tea_corner']; // shortcut: no meta unlocks yet (M3), so the lite pool is fixed
const DECOR = ['sardine', 'pebble', 'tea', 'pebble', 'lantern', 'pebble', 'tea', 'pebble', 'sardine']; // reel face before the first spin; not a draw
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SYM = new Map(SYMBOLS.map((s) => [s.id, s]));

let save = loadSave(), run = null, busy = false, input = null, forcedSeed = null, zeros = 0, tutorial = false, lastKey = null;
const layerOpen = () => !!document.querySelector('.layer:not([hidden])');

function persist() { save.run = run; writeSave(save); }

// ---------- view sync ----------
function syncView() {
  setScreen('game');
  setHud({ jar: run.jar, quota: run.quota, pegsMax: run.pegsMax, held: run.held });
  setGrid(run.grid ?? DECOR);
  markCells(); showPegs(run.held);
  updateHud(run);
  setDeni('idle');
  if (run.phase === 'tide' && run.spin === 0) pulsePegs();
}

function syncSpinButton() {
  if (!input) return;
  const show = !!run && run.phase === 'tide' && !layerOpen(), label = t('ui.spin');
  const disabled = busy || !run || run.spin >= run.spinsMax, left = run ? Math.max(0, run.spinsMax - run.spin) : 0;
  const sub = t(left === 1 ? 'ui.spinsLeft.one' : 'ui.spinsLeft', { n: left });
  const key = `${show}|${disabled}|${label}|${sub}`;
  if (key !== lastKey) { lastKey = key; input.setSpin({ label, sub, disabled, hidden: !show }); }
}

// ---------- flow ----------
function showRunStart() {
  run = null; busy = false; setScreen('menu'); // no reel sprites behind the menu (they showed beside the column on desktop)
  updateHud(null);
  showScreen('runstart', { firstBoot: !save.played, charts: save.runs > 0 ? undefined : [] });
}

function startRun({ trinket, chart }) {
  tutorial = !save.tutorialDone && forcedSeed == null;
  const seed = forcedSeed ?? (tutorial ? TUTORIAL_SEED : (Date.now() ^ Math.floor(Math.random() * 2 ** 31)) >>> 0);
  forcedSeed = null;
  run = newRun({ seed, installment: 1, chartId: tutorial ? null : chart, startTrinket: trinket, unlocked: UNLOCKED });
  save.eventSeen = 0; zeros = 0;
  persist();
  enterTide();
}

function enterTide() {
  hideScreen();
  syncView();
  if (run.event && run.spin === 0 && save.eventSeen !== run.tide) {
    play('event_stamp'); say('deni', 'event_intro');
    showScreen('event', { run });
    return;
  }
  if (tutorial && run.tide === 1 && run.spin === 0) input?.coach(t('ui.coachSpin'));
}

// A saved run comes back where it stopped. A spin is already in the save (outcome and jar), so nothing is re-drawn.
function resume() {
  run = save.run;
  tutorial = !save.tutorialDone;
  if (run.phase === 'shop') { rollShop(run); syncView(); showScreen('shop', { run }); return; }
  if (run.phase === 'over' || run.phase === 'lamplight') { syncView(); endRun(); return; }
  syncView();
  if (run.spin >= run.spinsMax) { finishTide(); return; }
  enterTide();
}

async function doSpin() {
  if (busy || !run || run.phase !== 'tide' || run.spin >= run.spinsMax || layerOpen()) return;
  busy = true; input.coach(null); syncSpinButton();
  try {
    const before = run.jar, res = spin(run);
    persist(); // saved before the animation: closing the app cannot re-draw this spin
    updateHud({ ...run, jar: before });
    setHud({ held: res.held });
    play('crank_pull');
    await playSpin(res, { onStop: (col) => play(`reel_stop_${col + 1}`) });
    showPegs(run.held); setHud({ held: run.held });
    await beats(res);
    updateHud(run);
  } finally { busy = false; }
  if (run.spin >= run.spinsMax) await finishTide();
  else if (tutorial && run.tide === 1 && run.spin === 1 && run.held.length === 0) input.coach(t('ui.coachPeg'));
}

// Pay beats: pair pulse, win ink and coins, trinket ticks, Deni lines. Nothing here changes timing or odds.
async function beats(res) {
  const left = run.spin < run.spinsMax;
  if (res.trinketSteps.length) play('trinket_tick');
  if (res.total > 0) {
    zeros = 0;
    const cells = [...new Set([...res.lines.flatMap((l) => l.cells), ...res.specials.map((s) => s.cell)])];
    if (res.specials.length) pulseCells(res.specials.map((s) => s.cell));
    if (res.lines.length) await playLines(res.lines, { onLine: (k) => playStep(k) });
    else playStep(0);
    flyCoins(res.total, cells); play('coin_fly');
    setHud({ jar: run.jar });
    const big = res.total >= run.quota / 2;
    if (big) play('big_win');
    setDeni('cheer', 2.2);
    say('deni', big ? 'big_win' : 'small_win');
    await sleep(500);
    return;
  }
  setHud({ jar: run.jar });
  zeros++;
  const open = res.pairs.filter((c) => !res.held.includes(c));
  if (open.length && left) {
    pulseCells(open); markCells(open); pulsePegs(); play('pair_pulse'); setDeni('point', 2.5);
    say('deni', tutorial && run.tide === 1 ? 'tutorial_peg' : 'pair_miss');
  } else say('deni', zeros >= 3 ? 'zero_streak' : 'zero');
}

async function finishTide() {
  const gap = run.quota - run.jar, t0 = run.tide;
  const e = endTide(run);
  if (t0 === 1) save.tutorialDone = true;
  persist();
  await sleep(500);
  if (e.paid) {
    play('stamp_paid'); setDeni('cheer', 2.2);
    if (e.mercy) { toast('ui.mercyShown', { n: gap }); say('orhan', 'mercy'); say('deni', 'mercy'); }
    else { say('orhan', 'tide_paid'); say('deni', e.clutch ? 'clutch' : 'tide_paid', { n: TIDES_PER_RUN - e.tide }); }
    if (e.clutch) play('big_win');
    setHud({ jar: run.jar }); updateHud(run);
    await sleep(900);
  }
  if (run.phase === 'shop') { rollShop(run); persist(); play('shop_open'); showScreen('shop', { run }); }
  else endRun(); // over, or the first win (Lamplight is not built yet)
}

function endRun() {
  save.run = null; save.runs++; save.played = true; save.tutorialDone = true;
  writeSave(save);
  play(run.won ? 'run_win' : 'quota_fail');
  showScreen('runend', { run });
}

function onCell(i) {
  if (busy) { skip(); return; }
  if (!run || run.phase !== 'tide' || layerOpen() || !run.grid) return;
  const was = run.held.includes(i);
  if (togglePeg(run, i)) {
    persist(); input.coach(null);
    showPegs(run.held); setHud({ held: run.held }); updateHud(run);
    play(was ? 'peg_off' : 'peg_on');
    if (!was) setDeni('point', 1.2);
  } else {
    play('deny');
    if (run.held.length >= run.pegsMax) toastText(t('ui.pegsLeft', { n: 0 }));
  }
}

// Long-press on a cell says what that token does. The pay comes from the data table.
function onInspect(i) {
  const s = SYM.get(run?.grid?.[i]);
  if (s) toastText(`${t(s.nameKey)}: ${symText(s)}`);
}

// ---------- ui handlers ----------
const ui = {
  startRun,
  changed(r, action) {
    play({ buy: 'buy', sell: 'sell', reroll: 'reroll', lock: 'ui_tap', remove: 'remove_token' }[action] ?? 'ui_tap');
    persist(); setHud({ jar: run.jar }); updateHud(run);
  },
  leaveShop() { nextTide(run); persist(); enterTide(); },
  eventContinue() { save.eventSeen = run.tide; persist(); if (tutorial && run.tide === 1) input.coach(t('ui.coachSpin')); },
  again: showRunStart,
  home: showRunStart,
  settingsChanged(s) { setVolumes({ master: s.volume }); },
};

// ---------- debug hook (tests only: active with ?debug=1) ----------
function installDebug() {
  const finishWith = (jar) => { // core only: spin the tide out, force the jar (QA shortcut), take the quota
    while (run.spin < run.spinsMax) spin(run);
    if (jar === 'quota') run.jar = Math.max(run.jar, run.quota); else if (jar === 'zero') run.jar = 0;
    return endTide(run);
  };
  const state = () => ({
    screen: document.querySelector('.layer:not([hidden]) .panel')?.className.replace('panel ', '') ?? 'game', busy,
    phase: run?.phase ?? null, tide: run?.tide ?? 0, spin: run?.spin ?? 0, spinsMax: run?.spinsMax ?? 0, jar: run?.jar ?? 0, quota: run?.quota ?? 0,
    grid: run?.grid ?? null, held: run?.held ?? [], pegsMax: run?.pegsMax ?? 0, event: run?.event ?? null, hash: run ? runSummary(run).hash : null,
    won: run?.won ?? false, seed: run?.seed ?? null,
  });
  window.__pier = {
    state,
    spin: () => doSpin().then(state),
    peg: (i) => { onCell(i); return run?.held ?? []; },
    goto(screen) {
      if (screen === 'runstart') return showRunStart();
      if (screen === 'game') { hideScreen(); return syncView(); }
      if (screen === 'shop') { rollShop(run); return showScreen('shop', { run }); }
      showScreen(screen, { run });
    },
    setLang: (l) => setLanguage(l),
    seed(n) { forcedSeed = n; },
    newRun(trinket = 'first_light', chart = null) { hideScreen(); startRun({ trinket, chart }); return state(); },
    // to: 'shop' | 'event' | 'lost' | 'won' | 'tide:N'. Cheats the jar so a tide is always paid (except 'lost').
    fastForward(to) {
      if (!run) startRun({ trinket: 'first_light', chart: null });
      if (to === 'lost') { finishWith('zero'); persist(); hideScreen(); endRun(); return state(); }
      const target = /^tide:(\d)$/.test(to) ? +to.slice(5) : to === 'event' || to === 'won' ? TIDES_PER_RUN : run.tide;
      for (;;) {
        if (run.phase === 'tide' && (run.tide < target || to === 'shop' || to === 'won')) finishWith('quota');
        if (run.phase === 'shop' && run.tide < target) nextTide(run); else break;
      }
      persist();
      if (to === 'won') { hideScreen(); endRun(); } else if (run.phase === 'shop') { syncView(); rollShop(run); showScreen('shop', { run }); } else enterTide();
      return state();
    },
  };
}

// ---------- boot ----------
async function boot() {
  await preloadArt();
  const canvas = document.getElementById('c');
  initView(canvas);
  initUi(ui);
  setHandlers({ lantern: (n) => playStep(n - 1, 'lantern_light'), coinLand: () => play('coin_jar') });
  input = initInput({
    canvas, host: document.getElementById('ui'), cellAt, onSpin: doSpin, onCell, onInspect,
    onFirstTouch: () => { initAudio().then(() => setVolumes({ master: settings.volume })).catch(() => {}); },
  });
  const relayout = () => { resize(); input.layout(getLayout()); };
  window.addEventListener('resize', relayout);
  relayout();
  if (DEBUG) installDebug();
  if (save.run) resume(); else showRunStart();

  let last = performance.now();
  const frame = (now) => {
    tick((now - last) / 1000); last = now;
    syncSpinButton();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
boot();
