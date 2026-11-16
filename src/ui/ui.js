// DOM overlay: HUD, screen router, sheets, toasts, speech. Never imports src/core or src/view: every core call is a handler the glue passes in.
//
// initUi(handlers, savedSettings). Handlers (all optional; a missing one is simply a no-op). A handler that changes the run returns
// undefined or { ok: true }; { ok:false, reason } shows the text why.<reason>. After every handler the UI repaints the HUD and the open screen
// from the live run (showScreen data.run), so the core may mutate the run in place.
//   Run flow     startRun({ charId, contractId, daily, tutorial })   new run confirmed (home Play, ladder, Daily)
//                pickTerms(id)  stoke()  spin()  collect()  bank(amount)  useTrick(pocketIndex)  (the glue runs the tap-a-cell targeting and calls showPrompt)
//                signDeal(id)  refuseDeals()  pawn(charmIndex)  declinePawn()  leaveShop()  paidContinue()  runEndContinue()  home()  again()
//                skipNight()  collectWin()  goEndless()
//   Shop         buyCharm(i)  sellCharm(slot)  moveCharm(from, to)  buyTrick(i)  bench(i, target)  buySlot()  reroll()  lock(i)
//                price(item, kind) -> { coins?, wick? }   (kind: charm | trick | bench | slot | reroll; the core knows discounts and S)
//   Meta         buyHideout(id) -> { ok, reason }   daily() -> start the daily run   dailyInfo() -> { charId, contractId, termsId, curseId }
//   Reads        derive(run) -> overrides for the numbers the HUD prints (see model.js)
//   Ads          adReady(placement) -> bool   watchAd(placement) -> Promise<bool>   (shop_reroll, double_wax)
//   Settings     settingsChanged(settings) { lang, sfx, music, haptics, fast, reduceMotion }; also called once at init
//
// showScreen(name, data): home | charselect | ladder | terms | shop | deal | pawn | paid | endless | runend | ending | shelf | howto | collection | daily | store | settings
//   data.run is the live core run, data.meta the save meta. A screen opened with ctx.open() returns to the screen under it on close.
//   terms { run, offers }  shop { run, offers }  deal { run, offers: deal[] }  pawn { run }  paid { run, outcome: 'paid'|'saved', info }  endless { run, next }
//   runend { run, summary, result: { wax, newAchievements, unlocks }, won, ending }  ending { ending }  shelf { run, tab }
// Also exported: updateHud(run), setBusy(bool), showPrompt(key, onCancel), toast, say(who, trigger), openSheet(node), closeSheet(), hideScreen(), insets().
import { t, setLang, getLang, detectLang } from '../i18n.js';
import { h, clear, put } from './dom.js';
import { mountSpeech, say, hush, stay } from './speech.js';
import { mountHud, goalStrip } from './hud.js';
import { detailSheet } from './cards.js';
import * as home from './home.js';
import * as charselect from './charselect.js';
import * as ladder from './ladder.js';
import * as terms from './terms.js';
import * as shop from './shop.js';
import * as deal from './deal.js';
import * as pawn from './pawn.js';
import * as paid from './paid.js';
import * as endless from './endless.js';
import * as runend from './runend.js';
import * as ending from './ending.js';
import * as shelf from './shelf.js';
import * as howto from './howto.js';
import * as collection from './collection.js';
import * as daily from './daily.js';
import * as store from './store.js';
import * as settingsScreen from './settings.js';

const SCREENS = { home, charselect, ladder, terms, shop, deal, pawn, paid, endless, runend, ending, shelf, howto, collection, daily, store, settings: settingsScreen };
const IN_RUN = new Set(['terms', 'shop', 'deal', 'pawn', 'paid', 'shelf']); // these get the goal strip on top: the goal is on screen everywhere
export const settings = { lang: null, sfx: 1, music: 1, haptics: true, fast: false, reduceMotion: false };

let handlers = {}, col, layer, toasts, sheetEl, hud, cur = null, lastRun = null;

function applySettings() {
  setLang(settings.lang || detectLang());
  col.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
  handlers.settingsChanged?.({ ...settings, lang: getLang() });
}

function setSettings(patch, rerender = true) {
  Object.assign(settings, patch);
  applySettings();
  if (patch.lang) { hush(); hud.redraw(); } // a bubble in the old language goes
  if (rerender && cur) mountScreen();
}

const derive = (run) => handlers.derive?.(run) ?? {};

// Runs a handler, repaints, and shows why when it said no.
function call(name, ...args) {
  const r = handlers[name]?.(...args);
  const done = (res) => {
    if (res && res.ok === false) toast('why.' + (res.reason ?? 'unknown'));
    if (lastRun) hud.update(lastRun);
    if (cur) mountScreen();
    return res;
  };
  return r && typeof r.then === 'function' ? r.then(done) : done(r);
}

export function initUi(h0 = {}, saved = {}) {
  handlers = h0;
  Object.assign(settings, saved);
  const host = document.getElementById('ui') ?? document.body.appendChild(h('div', { id: 'ui' }));
  clear(host);
  col = h('div', { class: 'ui-col' });
  layer = h('div', { class: 'layer', hidden: true });
  sheetEl = h('div', { class: 'sheet', hidden: true });
  toasts = h('div', { class: 'toasts', 'aria-live': 'polite' });
  host.append(col);
  speech = mountSpeech(col);
  hud = mountHud(col, { call, say, toast, derive, sheet: openSheet, closeSheet, show: (n, d) => showScreen(n, d) });
  col.append(layer, sheetEl, toasts);
  applySettings();
}
let speech;

export function updateHud(run) { lastRun = run; hud.update(run); if (cur?.data) cur.data.run = run ?? cur.data.run; }
export const setBusy = (b) => hud.setBusy(b);
export const showPrompt = (key, onCancel) => hud.showPrompt(key, onCancel);
export const insets = () => hud.insets();

// ---- sheets (a card above everything: item detail, bank amount) ----
export function openSheet(node) {
  if (!node) return;
  const back = h('div', { class: 'sheet-back', onclick: closeSheet });
  sheetEl.replaceChildren(back, node);
  sheetEl.hidden = false;
}
export function closeSheet() { sheetEl.hidden = true; clear(sheetEl); }

// ---- screens ----
function mountScreen() {
  const keep = layer.querySelector('.panel')?.scrollTop ?? 0;
  const me = cur, { name, data, state } = cur;
  const panel = h('section', { class: `panel ${name}`, role: 'dialog', 'aria-modal': 'true', 'data-still': me.mounted }); // a repaint of the same screen does not slide in again
  me.mounted = true;
  const foot = h('footer', { class: 'foot' }), over = [];
  const ctx = {
    h: handlers, state, settings, say, toast, toastText, setSettings, lang: getLang, call,
    close: closeScreen, rerender: () => { if (cur === me) mountScreen(); }, // a late async result never repaints another screen
    open: (n, d = {}) => showScreen(n, { ...data, ...d }, me),
    sheet: (spec) => openSheet(detailSheet(spec, closeSheet)), openNode: openSheet, closeSheet,
    derive,
    foot: (...kids) => { put(foot, ...kids); return null; }, // main buttons: a footer under the scroll area
    over: (node) => { if (node) over.push(node); return null; },
  };
  SCREENS[name].render(panel, data, ctx);
  if (cur?.name !== name) return; // the screen closed itself
  if (IN_RUN.has(name) && data.run) panel.prepend(goalStrip(data.run, derive(data.run)));
  // The spoken line sits in the page under the title, so the footer is only the main buttons and the page keeps its height.
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
  hush(); closeSheet(); // a bubble or sheet from the screen before never stays on the new one
  if (data.run) lastRun = data.run;
  cur = { name, data, state: {}, back };
  mountScreen();
}

// Close button: back to the screen this one was opened from (ctx.open), or no screen at all.
function closeScreen() {
  const back = cur?.back;
  if (!back) return hideScreen();
  hush(); cur = back; mountScreen();
}

// No screen at all (the machine shows). The glue calls this; it drops any screen underneath as well.
export function hideScreen() {
  cur = null;
  hush(); closeSheet(); col.append(speech);
  clear(layer);
  layer.hidden = true;
  hud.redraw();
}

export const toast = (key, vars = {}) => toastText(t(key, vars));

export function toastText(text) {
  const el = h('p', { class: 'toast' }, text);
  while (toasts.children.length >= 2) toasts.firstChild.remove();
  toasts.append(el);
  setTimeout(() => el.remove(), 2400);
}

export { say };
export const setLanguage = (lang) => setSettings({ lang }); // for the debug hook
