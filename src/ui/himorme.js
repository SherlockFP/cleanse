// Him or Me: a spirit reached Fan (Favour 8) while its rival is a Regular or better. Two buttons, both with a named cost.
// data: { run, spirit, rival }. Handler: himOrMe('drop' | 'keep').
import { t, L } from '../i18n.js';
import { h, btn, put } from './dom.js';
import { SPIRIT } from './content.js';
import { portrait } from './cards.js';

export function render(el, { run, spirit, rival }, ctx) {
  const a = SPIRIT[spirit], b = SPIRIT[rival], fav = run.spirits?.[rival]?.fav | 0;
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.himTitle')), portrait(b, -1, 'devil')),
    h('p', { class: 'story' }, t('ui.himLine', { a: L(a?.name), b: L(b?.name) })),
    h('div', { class: 'cards' },
      h('article', { class: 'card' }, h('div', { class: 'card-text' }, h('strong', {}, t('ui.himDrop', { b: L(b?.name) })), h('span', { class: 'fx' }, t('ui.himDropText', { b: L(b?.name), a: L(a?.name) })))),
      h('article', { class: 'card' }, h('div', { class: 'card-text' }, h('strong', {}, t('ui.himKeep')), h('span', { class: 'fx' }, t('ui.himKeepText', { a: L(a?.name) }))))),
    h('p', { class: 'note' }, t('ui.himNote', { b: L(b?.name), n: fav })),
    ctx.foot(btn(t('ui.himKeep'), () => ctx.call('himOrMe', 'keep'), 'ghost'), btn(t('ui.himDrop', { b: L(b?.name) }), () => ctx.call('himOrMe', 'drop'), 'primary')));
}
