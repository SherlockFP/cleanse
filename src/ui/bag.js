// Bag screen: every token in the bag with its real chance per square, from core bagOdds.
import { t, plural } from '../i18n.js';
import { h, pct, btn, put } from './dom.js';
import { makeBag, bagOdds } from '../core/reel.js';
import { SYMBOLS } from '../core/data/symbols.js';

const SYM = new Map(SYMBOLS.map((s) => [s.id, s]));

// One line of effect text. Line pay comes from the data table, never from a fixed string, so tuning in econ.js shows here.
export function symText(s) {
  if (s.type === 'line') return t('ui.pays', { n: s.pay });
  return t(`sym.${s.id}.rule`);
}

// The rows. onPick(symId) turns each row into a button (used by "remove a token" in the shop).
export function renderBagList(run, onPick) {
  const rows = bagOdds(makeBag(run.bag)).sort((a, b) => b.count - a.count);
  const pc = pct(rows.map((r) => r.count));
  return h('ul', { class: 'rows' }, rows.map((r, i) => {
    const s = SYM.get(r.id);
    const body = [
      h('span', { class: 'r-name' }, t(s.nameKey)),
      h('span', { class: 'r-count' }, `x${r.count}`),
      h('span', { class: 'r-pct' }, t('ui.percent', { p: pc[i] })),
      h('span', { class: 'r-fx' }, symText(s)),
    ];
    return h('li', {}, onPick ? h('button', { type: 'button', class: 'row pick', onclick: () => onPick(r.id) }, body) : h('div', { class: 'row' }, body));
  }));
}

export function render(el, { run }, ctx) {
  const size = Object.values(run.bag).reduce((a, b) => a + b, 0);
  put(el, 
    h('h2', {}, t('ui.bagTitle')),
    h('p', { class: 'sub' }, plural(size, 'ui.bagSize'), ' - ', t('ui.bagChance')),
    renderBagList(run),
    h('p', { class: 'note' }, t('ui.fairNote')),
    h('p', { class: 'note' }, t('ui.stopNote')),
    h('p', { class: 'note' }, t('ui.oddsNote')),
    h('p', { class: 'note' }, t('ui.mercyRule')),
    btn(t('ui.close'), ctx.close, 'primary'),
  );
}
