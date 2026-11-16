// Boot, screen router and the one game loop (TECH.md section 1, ROADMAP.md M2-M3). Glue only: rules live in core, drawing in view, text in ui.
// Meta loop: home -> run start -> run -> run end (Planks, margin note, ledger page through core/meta.js) -> home. Ads and purchases go through src/services.
// Order of a spin: core spin first (outcome fixed), save, then the view plays it back, then the pay beats with sounds and Deni lines.
import './ui/ui.css';
import { newRun, spin, togglePeg, endTide, nextTide, runSummary } from './core/run.js';
import { rollShop } from './core/shop.js';
import { TIDES_PER_RUN, PLANKS } from './core/econ.js';
import { SYMBOLS } from './core/data/symbols.js';
import { TRINKETS } from './core/data/trinkets.js';
import { BUILDS } from './core/data/unlocks.js';
import { ensureMeta, grantRunRewards, build, unlockedPool, hasFeature, modes } from './core/meta.js';
import { dailySetup, streakUpdate } from './core/daily.js';
import { initAds, noteRunFinished, rewardedReady, showRewarded, maybeShowInterstitial } from './services/ads.js';
import { initIap } from './services/iap.js';
import { getConsent, setAgeGate, ensureConsent } from './services/consent.js';
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
const STARTER_PLANKS = 60; // the one fixed Planks grant of starter_pack (MONETIZATION.md section 2)
const DECOR = ['sardine', 'pebble', 'tea', 'pebble', 'lantern', 'pebble', 'tea', 'pebble', 'sardine']; // reel face before the first spin; not a draw
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SYM = new Map(SYMBOLS.map((s) => [s.id, s]));

let save = loadSave(), run = null, busy = false, input = null, forcedSeed = null, zeros = 0, tutorial = false, lastKey = null, ageDone = null;
// The local day as YYYY-MM-DD: Daily Tide, the streak and the ad caps all use this phone's date.
const today = () => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
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
function showHome() {
  run = null; busy = false; setScreen('menu'); // no reel sprites behind a menu (they showed beside the column on desktop)
  updateHud(null);
  showScreen('home', { save, today: today() });
}

// The free start trinkets come from the unlocked pool; the stove build shows 4 instead of 3. Tide charts open after installment 3 is paid.
function showRunStart() {
  run = null; busy = false; setScreen('menu');
  updateHud(null);
  const pool = unlockedPool(save);
  const trinkets = TRINKETS.filter((x) => x.grade === 1 && pool.includes(x.unlock)).slice(0, hasFeature(save, 'pick4') ? 4 : 3).map((x) => x.id);
  // Cold open: the first run has no menu. It starts on the pier with the first free trinket; the pick appears from run 2.
  if (save.stats.runs === 0) { startRun({ trinket: trinkets[0], chart: null }); say('deni', 'run_start'); return; }
  showScreen('runstart', { trinkets, charts: modes(save).charts ? undefined : [] });
}

function begin(kind, setup) {
  run = newRun(setup);
  save.runKind = kind; save.runDate = kind === 'daily' ? today() : null; save.runAt = Date.now();
  save.eventSeen = 0; zeros = 0;
  persist();
  enterTide();
}

function startRun({ trinket, chart }) {
  tutorial = !save.tutorialDone && forcedSeed == null;
  const seed = forcedSeed ?? (tutorial ? TUTORIAL_SEED : (Date.now() ^ Math.floor(Math.random() * 2 ** 31)) >>> 0);
  forcedSeed = null;
  begin('story', { seed, installment: save.installment, chartId: tutorial ? null : chart, startTrinket: trinket, unlocked: unlockedPool(save) });
}

// Daily Tide: one run a day on the date's seed (core/daily.js), plus one more after the retry ad. A second tap the same day does nothing here;
// the home screen opens the result instead.
function startDaily() {
  const d = save.daily, day = today();
  if (d.played === day && d.retry !== day) return;
  if (d.retry === day) d.retry = 'used:' + day; // the retry is spent when the run starts
  tutorial = false;
  begin('daily', dailySetup(day));
  say('deni', 'daily_start');
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
  if (run.phase === 'shop') { rollShop(run); syncView(); showScreen('shop', { run, coach: save.stats.runs === 0 }); return; }
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
  if (run.phase === 'shop') { rollShop(run); persist(); play('shop_open'); showScreen('shop', { run, coach: save.stats.runs === 0 }); }
  else endRun(); // over, or the first win (shortcut: no Lamplight choice screen yet, a won run stops at tide 5)
}

// Every finished run is paid out once through core/meta.js (Planks, margin note, album, the ledger page of a won installment), then the
// run leaves the save. A Daily Tide never pays an installment; it also counts the day for the streak.
function endRun() {
  const s = runSummary(run), isDaily = save.runKind === 'daily';
  const reward = grantRunRewards(save, { ...s, bag: run.bag, stamps: s.won && run.event ? [run.event] : [], installment: isDaily ? 0 : s.installment });
  let result = null;
  if (isDaily) {
    const d = save.daily, day = save.runDate ?? today(), st = streakUpdate(save, day);
    d.best = d.played === day ? Math.max(d.best ?? 0, s.coins) : s.coins; // after a retry the better score stays
    d.score = s.coins; d.played = day;
    result = { planks: st.planks, forgiven: st.forgiven };
    if (st.counted) play('streak');
  }
  noteRunFinished(Math.max(0, (Date.now() - (save.runAt || Date.now())) / 1000));
  save.run = null; save.runKind = null; save.played = true; save.tutorialDone = true;
  writeSave(save);
  play(run.won ? 'run_win' : 'quota_fail');
  if (reward?.planks) setTimeout(() => play('plank_gain'), 350);
  if (isDaily) showScreen('daily', { save, today: today(), reward, result });
  else showScreen('runend', { run, reward, save });
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
  // Run end closed: an interstitial only here, between runs, and only when every rule in services/ads.js allows it.
  async home() { await maybeShowInterstitial({ slot: 'after_run_end' }); showHome(); },
  play: showRunStart,
  daily: startDaily,
  build(id) {
    const r = build(save, id);
    if (r.ok) { writeSave(save); play('build_hammer'); setTimeout(() => play('build_done'), 650); }
    else play('deny');
    return r;
  },
  // Reward ads are optional buttons; the reward is fixed and never a spin, a peg, a coin or odds.
  // No ad button before the 3rd finished run: a first loss is never followed by an ad offer (GDD.md section 10).
  adReady: (placement) => save.stats.runs >= 3 && rewardedReady(placement, { inRun: !!save.run }),
  async doublePlanks(reward) {
    if (!reward || reward.doubled) return false;
    const r = await showRewarded('double_planks');
    if (!r.rewarded) { toast(r.reason === 'closed' || r.reason === 'dismissed' ? 'ads.noReward' : 'ads.unavailable'); return false; }
    reward.doubled = true; save.planks += reward.planks * (PLANKS.doubleMult - 1);
    writeSave(save); play('plank_gain');
    return true;
  },
  async dailyRetry() {
    const r = await showRewarded('daily_retry');
    if (!r.rewarded) { toast(r.reason === 'closed' || r.reason === 'dismissed' ? 'ads.noReward' : 'ads.unavailable'); return false; }
    save.daily.retry = today(); writeSave(save);
    startDaily();
    return true;
  },
  age(isAdult) { setAgeGate(isAdult); if (isAdult) { hideScreen(); ageDone?.(); } },
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
    planks: save.planks, builds: save.builds.length, paid: save.paid, notes: save.notes, runs: save.stats.runs,
  });
  window.__pier = {
    state,
    spin: () => doSpin().then(state),
    peg: (i) => { onCell(i); return run?.held ?? []; },
    goto(screen) {
      if (screen === 'runstart') return showRunStart();
      if (screen === 'home') return showHome();
      if (['ledger', 'album', 'store'].includes(screen)) return showScreen(screen, { save });
      if (screen === 'daily') return showScreen('daily', { save, today: today() });
      if (screen === 'game') { hideScreen(); return syncView(); }
      if (screen === 'shop') { rollShop(run); return showScreen('shop', { run, coach: save.stats.runs === 0 }); }
      showScreen(screen, { run });
    },
    setLang: (l) => setLanguage(l),
    seed(n) { forcedSeed = n; },
    // QA: put the save at a boathouse stage (0-6 builds) with some Planks, or patch any save field, then show home.
    home(stage, planks = 25) { save.builds = BUILDS.slice(0, stage).map((b) => b.id); save.planks = planks; writeSave(save); showHome(); return state(); },
    patch(fields) { Object.assign(save, fields); ensureMeta(save); writeSave(save); return state(); },
    daily() { hideScreen(); save.daily.played = null; startDaily(); return state(); },
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
      if (to === 'won') { hideScreen(); endRun(); } else if (run.phase === 'shop') { syncView(); rollShop(run); showScreen('shop', { run, coach: save.stats.runs === 0 }); } else enterTide();
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
  setScreen('menu');

  let last = performance.now();
  const frame = (now) => {
    tick((now - last) / 1000); last = now;
    syncSpinButton();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Age gate first (the reel is rated 18+, STORE.md section 2). A "younger" answer is kept and the game stays closed.
  if (getConsent().age !== 'adult') await new Promise((go) => { ageDone = go; showScreen('agegate', { minor: getConsent().age === 'minor' }); });
  // Services: consent before any ad request, then purchases, then ads. A failure here never stops the game.
  try {
    await ensureConsent();
    await initIap({ cache: save.iap, onChange: (owned) => {
      if (owned.starter_pack && !save.starterGranted) { save.starterGranted = true; save.planks += STARTER_PLANKS; }
      writeSave(save);
    } });
    await initAds({ state: save.ads, onChange: () => writeSave(save), today });
  } catch (e) { console.warn('services', e); }

  if (DEBUG) installDebug();
  // The first run starts at once (its first tide is the tutorial); home is the first screen from then on.
  if (save.run) resume(); else if (save.stats.runs === 0) showRunStart(); else showHome();
}
boot();
