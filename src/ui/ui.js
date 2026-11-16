// DOM overlay: HUD, screen router, toasts, speech. Never imports src/view; reads the run through src/core.
//
// initUi(handlers): handlers the game passes in (all optional unless marked):
//   startRun({ trinket, chart })   new run confirmed on the run start screen (required for that screen)
//   changed(run, action, res)      after a shop call went through: action = buy | sell | reroll | lock | remove (save, sound)
//   leaveShop()                    Continue pressed in the shop (caller runs nextTide and shows the next tide)
//   eventContinue()                creditor letter dismissed
//   again(), home()                run end buttons
//   settingsChanged(settings)      { lang, volume, reduceMotion }; also called once at init with the saved values
// showScreen(name, data): 'runstart' | 'shop' | 'bag' | 'runend' | 'event' | 'settings'; data.run is the live core run.
// updateHud(run), toast(key, vars), hideScreen(), say(who, trigger, vars).
import { t, setLang, getLang, detectLang } from '../i18n.js';
import { h, clear } from './dom.js';
import { mountSpeech, say } from './speech.js';
import * as runstart from './runstart.js';
import * as shop from './shop.js';
import * as bag from './bag.js';
import * as runend from './runend.js';
import * as event from './event.js';
import * as settingsScreen from './settings.js';
import { TIDES_PER_RUN } from '../core/econ.js';

const SCREENS = { runstart, shop, bag, runend, event, settings: settingsScreen };
const KEY = 'slp.settings';
export const settings = { lang: null, volume: 1, reduceMotion: false };

let handlers = {}, col, layer, hudEl, toasts, cur = null, lastRun = null;
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
  if (patch.lang) { buildHud(); if (lastRun) updateHud(lastRun); }
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
  col.append(hudEl, layer, toasts);
  host.append(col);
  mountSpeech(col);
  load();
  applySettings();
  buildHud();
}

// ---- HUD ----
function buildHud() {
  clear(hudEl);
  const cell = (k, cls) => (hudRef[k] = h('span', { class: cls }));
  hudEl.append(
    h('div', { class: 'hud-row' }, cell('tide', 'hud-tide'), cell('jar', 'hud-jar')),
    h('div', { class: 'hud-row sub' }, cell('spins', 'hud-spins'), cell('pegs', 'hud-pegs'),
      h('span', { class: 'hud-btns' },
        h('button', { type: 'button', class: 'icon', onclick: () => lastRun && showScreen('bag', { run: lastRun }) }, t('ui.bag')),
        h('button', { type: 'button', class: 'icon', onclick: () => showScreen('settings', {}) }, t('ui.settings')))));
}

export function updateHud(run) {
  lastRun = run;
  if (!run) { hudEl.hidden = true; return; }
  hudEl.hidden = false;
  const tide = run.tide > TIDES_PER_RUN ? t('ui.lamplightTide', { n: run.tide }) : t('ui.tideOf', { n: run.tide, m: TIDES_PER_RUN });
  hudRef.tide.textContent = tide;
  hudRef.jar.textContent = `${t('ui.jar')} ${t('ui.jarQuota', { a: run.jar, b: run.quota })}`;
  const inTide = run.phase === 'tide';
  hudEl.dataset.phase = run.phase;
  const spins = Math.max(0, run.spinsMax - run.spin), pegs = Math.max(0, run.pegsMax - run.held.length);
  hudRef.spins.textContent = inTide ? t(spins === 1 ? 'ui.spinsLeft.one' : 'ui.spinsLeft', { n: spins }) : '';
  hudRef.pegs.textContent = inTide ? t(pegs === 1 ? 'ui.pegsLeft.one' : 'ui.pegsLeft', { n: pegs }) : '';
}

// ---- screens ----
function mountScreen() {
  const keep = layer.firstChild?.scrollTop ?? 0;
  const { name, data, state } = cur;
  const panel = h('section', { class: `panel ${name}`, role: 'dialog', 'aria-modal': 'true' });
  const ctx = {
    h: handlers, state, settings, say, toast, setSettings, lang: getLang,
    close: hideScreen, rerender: mountScreen,
  };
  SCREENS[name].render(panel, data, ctx);
  if (cur?.name !== name) return; // the screen closed itself (event with no event)
  layer.replaceChildren(panel);
  layer.hidden = false;
  panel.scrollTop = keep;
}

export function showScreen(name, data = {}) {
  if (!name) return hideScreen();
  if (!SCREENS[name]) throw new Error('unknown screen ' + name);
  cur = { name, data, state: {} };
  mountScreen();
}

export function hideScreen() {
  cur = null;
  clear(layer);
  layer.hidden = true;
}

export function toast(key, vars = {}) {
  const el = h('p', { class: 'toast' }, t(key, vars));
  while (toasts.children.length >= 2) toasts.firstChild.remove();
  toasts.append(el);
  setTimeout(() => el.remove(), 2400);
}

export { say };
