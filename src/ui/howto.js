// How to play: Rules, Symbols (value and weight from the data) and Patterns (a 5x3 diagram per pattern, drawn from the data cells), and the scoring order.
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { SYMBOLS, PATTERNS } from './content.js';

// A 5x3 mini grid with the cells of the pattern's first placement lit.
const diagram = (cells) => h('span', { class: 'mini', 'aria-hidden': 'true' }, Array.from({ length: 15 }, (_, i) => h('i', { class: cells.includes(i) ? 'on' : '' })));

export function render(el, data, ctx) {
  const tab = ctx.state.tab ?? 'rules';
  const rules = [
    h('ol', { class: 'rules' }, [1, 2, 3, 4, 5, 6, 7].map((n) => h('li', {}, t('ui.rule' + n)))),
    h('section', {}, h('h3', {}, t('ui.scoreOrder')), h('ol', { class: 'rules score' }, [1, 2, 3, 4].map((n) => h('li', {}, t('ui.score' + n).replace(/^\d+\.\s*/, '')))), h('p', { class: 'note' }, t('ui.scoreBeat'))),
    h('p', { class: 'note' }, t('ui.privacyText')),
  ];
  const symbols = h('div', { class: 'cards' }, SYMBOLS.map((s) => h('article', { class: 'card sym' }, h('span', { class: 'pic' }, art(s.icon, 'ico lg')),
    h('div', { class: 'card-text' }, h('strong', {}, L(s.name)),
      s.kind === 'score' && h('span', { class: 'tags' }, h('span', { class: 'tag' }, t('ui.symValue', { n: s.value })), h('span', { class: 'tag' }, t('ui.symWeight', { n: s.weight }))),
      s.text && h('span', { class: 'fx' }, L(s.text))))));
  const patterns = h('div', { class: 'cards' }, PATTERNS.map((p) => h('article', { class: 'card pat' }, diagram(p.cells[0]),
    h('div', { class: 'card-text' }, h('strong', {}, L(p.name)),
      h('span', { class: 'tags' }, h('span', { class: 'tag good' }, t('ui.patMult', { n: fmt(p.mult) })), h('span', { class: 'tag' }, t('ui.patCells', { n: p.size })), h('span', { class: 'tag' }, t('ui.patPlaces', { n: p.cells.length })))))));
  const tabs = [['rules', 'ui.tabRules'], ['symbols', 'ui.tabSymbols'], ['patterns', 'ui.tabPatterns']];
  put(el,
    h('h2', {}, t('ui.howTitle')),
    h('div', { class: 'seg', role: 'tablist' }, tabs.map(([id, key]) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t(key)))),
    tab === 'rules' ? rules : tab === 'symbols' ? symbols : [patterns, h('p', { class: 'note' }, t('ui.scoreBeat'))],
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
