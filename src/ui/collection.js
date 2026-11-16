// Collection: achievements (with rewards), charms seen (locked ones say what opens them), endings. data: { meta }.
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { ACHS, CHARMS, CHARM, CHAR, ENDINGS } from './content.js';
import { itemCard, pic } from './cards.js';
import { unlockHow } from './charselect.js';

const reward = (r) => r.wax ? t('ui.rewardWax', { n: r.wax }) : r.charm ? t('ui.rewardCharm', { name: L(CHARM[r.charm]?.name) }) : r.char ? t('ui.rewardChar', { name: L(CHAR[r.char]?.name) }) : '';

export function render(el, { meta }, ctx) {
  const tab = ctx.state.tab ?? 'ach', got = new Set(meta.achievements ?? []), seen = new Set(meta.seenCharms ?? []), ends = new Set(meta.endings ?? []);
  const ach = [h('p', { class: 'note' }, t('ui.achCount', { a: ACHS.filter((a) => got.has(a.id)).length, b: ACHS.length })),
    h('div', { class: 'cards' }, ACHS.map((a) => h('article', { class: 'card ach' + (got.has(a.id) ? ' done' : '') },
      h('span', { class: 'pic' }, art(got.has(a.id) ? 'ui/medal' : 'ui/lock', 'ico lg')),
      h('div', { class: 'card-text' }, h('strong', {}, L(a.name)), h('span', { class: 'fx' }, L(a.text)), h('span', { class: 'tags' }, h('span', { class: 'tag good' }, reward(a.reward)))))))];
  const charms = [h('p', { class: 'note' }, t('ui.seenCount', { a: CHARMS.filter((c) => seen.has(c.id)).length, b: CHARMS.length })),
    h('div', { class: 'cards' }, CHARMS.map((c) => seen.has(c.id) ? itemCard('charm', c)
      : h('article', { class: 'card charm unseen' }, pic('ui/slot_empty', null), h('div', { class: 'card-text' }, h('strong', {}, '???'),
        h('span', { class: 'note' }, c.unlock ? t('ui.lockedBy', { how: unlockHow(c.unlock) }) : t('ui.unseen'))))))];
  const endings = h('div', { class: 'cards' }, ENDINGS.map((e) => ends.has(e.id)
    ? h('button', { type: 'button', class: 'card pick', onclick: () => ctx.open('ending', { ending: e.id }) }, h('span', { class: 'pic' }, art('ui/seal', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, t('ui.ending.' + e.id))))
    : h('article', { class: 'card unseen' }, h('span', { class: 'pic' }, art('ui/lock', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, '???'), h('span', { class: 'note' }, t('ui.noEnding'))))));
  const tabs = [['ach', 'ui.tabAch'], ['charms', 'ui.tabSeen'], ['endings', 'ui.tabEndings']];
  put(el,
    h('h2', {}, t('ui.collTitle')),
    h('div', { class: 'seg', role: 'tablist' }, tabs.map(([id, key]) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t(key)))),
    tab === 'ach' ? ach : tab === 'charms' ? charms : endings,
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
