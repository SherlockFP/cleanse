// Terms pick: 2 or 3 cards at the start of each night. data: { run, offers: stake[] | id[], skip: { text } | null }. Handlers: pickTerms(id), skipNight().
import { t, L, coinText } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { STAKE } from './content.js';
import { model } from './model.js';

export function render(el, { run, offers, skip }, ctx) {
  const m = model(run, ctx.derive(run));
  put(el,
    h('h2', {}, t('ui.termsTitle')),
    h('p', { class: 'sub' }, t('ui.termsSub')),
    h('div', { class: 'cards' }, (offers ?? []).map((o) => {
      const s = STAKE[o.id ?? o];
      if (!s) return null;
      return h('button', { type: 'button', class: 'card pick terms', onclick: () => ctx.call('pickTerms', s.id) },
        h('span', { class: 'pic' }, art(s.icon, 'ico lg')),
        h('div', { class: 'card-text' }, h('strong', {}, L(s.name)), h('span', { class: 'tags' }, h('span', { class: 'tag good' }, t('ui.spinsBadge', { n: s.spins }))), h('span', { class: 'fx' }, coinText(s.text, m.scale))));
    })),
    skip && ctx.foot(btn(t('ui.skipNight', { r: L(skip.text) }), () => ctx.call('skipNight'), 'ghost')),
    skip && h('p', { class: 'note' }, t('ui.skipNote')));
}
