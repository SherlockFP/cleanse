// DOM overlay: HUD, screen router, toasts, speech. Never imports src/view; reads the run through src/core.
//
// initUi(handlers): handlers the game passes in (all optional unless marked):
//   startRun({ trinket, chart })   new run confirmed on the run start screen (required for that screen)
//   changed(run, action, res)      after a shop call went through: action = buy | sell | reroll | lock | remove (save, sound)
//   leaveShop()                    Continue pressed in the shop (caller runs nextTide and shows the next tide)
//   eventContinue()                creditor letter dismissed
//   home()                         run end and Daily result closed (caller shows the home screen)
//   play(), daily(), build(id) -> { ok, reason, cost }   home screen buttons
//   adReady(placement) -> bool, doublePlanks(reward) -> Promise<bool>, dailyRetry() -> Promise<bool>   optional reward ads
//   age(isAdult)                   age gate answer
//   settingsChanged(settings)      { lang, volume, reduceMotion }; also called once at init with the saved values
// showScreen(name, data): 'runstart' | 'shop' | 'bag' | 'runend' | 'event' | 'settings' | 'home' | 'ledger' | 'album' | 'daily' | 'store' | 'agegate'.
// data.run is the live core run, data.save the save. A screen opened with ctx.open() goes back to the screen under it when it closes.
// updateHud(run), toast(key, vars), hideScreen(), say(who, trigger, vars).
import { t, setLang, getLang, detectLang } from '../i18n.js';
import { h, clear, art, put } from './dom.js';
import { mountSpeech, say, hush, stay } from './speech.js';
import * as runstart from './runstart.js';
import * as shop from './shop.js';
import * as bag from './bag.js';
import * as runend from './runend.js';
import * as event from './event.js';
import * as settingsScreen from './settings.js';
import * as home from './home.js';
import * as ledger from './ledger.js';
import * as album from './album.js';
import * as daily from './daily.js';
import * as store from './store.js';
import * as agegate from './agegate.js';
import { TIDES_PER_RUN } from '../core/econ.js';

const SCREENS = { runstart, shop, bag, runend, event, settings: settingsScreen, home, ledger, album, daily, store, agegate };
const KEY = 'slp.settings';
export const settings = { lang: null, volume: 1, reduceMotion: false };

let handlers = {}, col, layer, hudEl, toasts, speech, cur = null, lastRun = null;
const hudRef = {};

function load() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* blocked storage: defaults */ }
  if (saved) { try { Object.assign(settings, JSON.parse(saved)); } catch { /* bad save: defaults */ } }
  else if (typeof matchMedia === 'function') settings.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ } }

function applySettings() {
  setLang(settings.lang || detectLang());
  col.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
  handlers.settingsChanged?.({ ...settings, lang: getLang() });
}

function setSettings(patch, rerender = true) {
  Object.assign(settings, patch);
  save();
  applySettings();
  if (patch.lang) { hush(); buildHud(); if (lastRun) updateHud(lastRun); } // a bubble in the old language goes
  if (rerender && cur) mountScreen();
}

export function initUi(h0 = {}) {
  handlers = h0;
  const host = document.getElementById('ui') ?? document.body.appendChild(h('div', { id: 'ui' }));
  clear(host);
  col = h('div', { class: 'ui-col' });
  hudEl = h('header', { class: 'hud', hidden: true });
  layer = h('div', { class: 'layer', hidden: true });
  toasts = h('div', { class: 'toasts', 'aria-live': 'polite' });
  // desktop: the faded pier painting fills the page beside the column (off screen on a phone)
  const flank = (side) => h('i', { class: 'flank ' + side, style: 'background-image:url(./img/bg/pier_game.jpg)' });
  col.append(flank('l'), flank('r'), hudEl, layer, toasts);
  host.append(col);
  speech = mountSpeech(col);
  load();
  applySettings();
  buildHud();
}

// ---- HUD ----
function buildHud() {
  clear(hudEl);
  const cell = (k, cls) => (hudRef[k] = h('span', { class: cls }));
  hudEl.append(
    h('div', { class: 'hud-row' }, cell('tide', 'hud-tide'), h('span', { class: 'hud-jar' }, cell('jar', ''), art('fx/coin', 'ico coin'))),
    cell('pegs', 'hud-pegs'),
    h('span', { class: 'hud-btns' },
      h('button', { type: 'button', class: 'icon', 'aria-label': t('ui.bag'), title: t('ui.bag'), onclick: () => lastRun && showScreen('bag', { run: lastRun }) }, art('trinket/sea_chest', 'ico')),
      h('button', { type: 'button', class: 'icon', 'aria-label': t('ui.settings'), title: t('ui.settings'), onclick: () => showScreen('settings', {}) }, art('reel/crank', 'ico'))));
}

export function updateHud(run) {
  lastRun = run;
  if (!run) { hudEl.hidden = true; return; }
  hudEl.hidden = false;
  const tide = run.tide > TIDES_PER_RUN ? t('ui.lamplightTide', { n: run.tide }) : t('ui.tideOf', { n: run.tide, m: TIDES_PER_RUN });
  hudRef.tide.textContent = tide;
  hudRef.jar.textContent = t('ui.jarGoal', { a: run.jar, b: run.quota });
  const inTide = run.phase === 'tide';
  hudEl.dataset.phase = run.phase;
  const pegs = Math.max(0, run.pegsMax - run.held.length); // spins left is printed on the SPIN button (main.js)
  hudRef.pegs.textContent = inTide ? t(pegs === 1 ? 'ui.pegsLeft.one' : 'ui.pegsLeft', { n: pegs }) : '';
}

// ---- screens ----
function mountScreen() {
  const keep = layer.querySelector('.panel')?.scrollTop ?? 0;
  const me = cur, { name, data, state } = cur;
  const panel = h('section', { class: `panel ${name}`, role: 'dialog', 'aria-modal': 'true', 'data-still': me.mounted }); // a repaint of the same screen does not slide in again
  me.mounted = true;
  const foot = h('footer', { class: 'foot' }), over = [];
  const ctx = {
    h: handlers, state, settings, say, toast, toastText, setSettings, lang: getLang,
    close: closeScreen, rerender: () => { if (cur === me) mountScreen(); }, // a late async result never repaints another screen
    open: (n, d = {}) => showScreen(n, d, me),
    foot: (...kids) => { put(foot, ...kids); return null; }, // main buttons: a footer under the scroll area
    over: (node) => { if (node) over.push(node); return null; }, // a sheet above the whole screen
  };
  SCREENS[name].render(panel, data, ctx);
  if (cur?.name !== name) return; // the screen closed itself (event with no event)
  // The spoken line sits in the page under the title, so the footer is only the main button and the page keeps its height.
  const head = panel.querySelector(':scope > h2, :scope > .head, :scope > .home-head');
  if (head) head.after(speech); else panel.prepend(speech);
  stay();
  layer.replaceChildren(panel, foot, ...over);
  layer.hidden = false;
  panel.scrollTop = keep;
  // Scroll cue: a small tab on the footer line while there is more page below.
  const cue = () => foot.classList.toggle('more', panel.scrollHeight - panel.scrollTop - panel.clientHeight > 12);
  panel.addEventListener('scroll', cue, { passive: true });
  panel.addEventListener('load', cue, true); // art that loads late changes the height
  cue();
}

export function showScreen(name, data = {}, back = null) {
  if (!name) return hideScreen();
  if (!SCREENS[name]) throw new Error('unknown screen ' + name);
  hush(); // a bubble from the screen before never stays on the new one
  cur = { name, data, state: {}, back };
  mountScreen();
}

// Close button: back to the screen this one was opened from (ctx.open), or no screen at all.
function closeScreen() {
  const back = cur?.back;
  if (!back) return hideScreen();
  hush(); cur = back; mountScreen();
}

// No screen at all (the reel shows). main.js calls this; it drops any screen underneath as well.
export function hideScreen() {
  cur = null;
  hush(); col.append(speech);
  clear(layer);
  layer.hidden = true;
}

export const toast = (key, vars = {}) => toastText(t(key, vars));

export function toastText(text) {
  const el = h('p', { class: 'toast' }, text);
  while (toasts.children.length >= 2) toasts.firstChild.remove();
  toasts.append(el);
  setTimeout(() => el.remove(), 2400);
}

export { say };
export const setLanguage = (lang) => setSettings({ lang }); // for the debug hook and the language switch outside the settings screen
