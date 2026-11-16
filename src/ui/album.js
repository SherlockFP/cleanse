// Album: every trinket (seen / won with), symbol, creditor stamp and margin note found so far, with the completion percent. data: { save }.
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { albumProgress } from '../core/meta.js';
import { ALBUM } from '../core/data/unlocks.js';
import { TRINKETS } from '../core/data/trinkets.js';
import { SYMBOLS } from '../core/data/symbols.js';
import { EVENTS } from '../core/data/events.js';

const TR = new Map(TRINKETS.map((x) => [x.id, x])), SYM = new Map(SYMBOLS.map((x) => [x.id, x])), EV = new Map(EVENTS.map((x) => [x.id, x]));

export function render(el, { save }, ctx) {
  const p = albumProgress(save), a = save.album;
  // a found entry is a button that says its name; a missing one is an empty paper square
  const slot = (found, icon, name, cls = '') => found
    ? h('button', { type: 'button', class: 'slot ' + cls, 'aria-label': name, title: name, onclick: () => ctx.toastText(name) }, art(icon, 'ico'))
    : h('span', { class: 'slot empty', 'aria-label': t('ui.locked2') }, '?');
  const part = (key, kind, body) => h('section', {}, h('h3', {}, t(key), ' ', h('small', {}, t('ui.albumCount', { a: p.found[kind], b: ALBUM[kind].length }))), body);
  put(el,
    h('h2', {}, t('ui.albumDone', { n: p.percent })),
    part('ui.albumTrinkets', 'trinkets', [
      h('div', { class: 'slots' }, ALBUM.trinkets.map((id) => slot(a.trinkets[id], `trinket/${id}`, t(TR.get(id).nameKey), a.trinkets[id] === 2 ? 'won' : ''))),
      h('p', { class: 'note legend' }, h('i', { class: 'key' }), t('ui.seen'), h('i', { class: 'key won' }), t('ui.wonWith'))]),
    part('ui.albumSymbols', 'symbols', h('div', { class: 'slots' }, ALBUM.symbols.map((id) => slot(a.symbols.includes(id), `sym/${id}`, t(SYM.get(id).nameKey))))),
    part('ui.albumStamps', 'stamps', h('div', { class: 'stamps' }, ALBUM.stamps.map((id) => (a.stamps.includes(id)
      ? h('span', { class: 'stamp' }, t(EV.get(id).nameKey)) : h('span', { class: 'stamp empty' }, '?'))))),
    part('ui.albumNotes', 'notes', [
      h('ol', { class: 'notes' }, ALBUM.notes.slice(0, p.found.notes).map((n) => h('li', {}, t('note.' + n)))),
      p.found.notes < ALBUM.notes.length && h('p', { class: 'note' }, t('ui.notesLeft'))]),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')),
  );
}
