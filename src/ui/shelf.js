// Charm shelf, curse list and trick pockets for the run in progress, with a family count per charm (the synergy view). data: { run, tab }.
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARM, CURSE, TRICK, FAMILY } from './content.js';
import { itemCard } from './cards.js';
import { model } from './model.js';

export function render(el, { run, tab: t0 }, ctx) {
  const m = model(run, ctx.derive(run)), tab = ctx.state.tab ?? t0 ?? 'charms';
  const charms = run.charms ?? [], curses = run.curses ?? [], tricks = run.tricks ?? [];
  const fam = {};
  for (const c of charms) for (const f of new Set(CHARM[c.id]?.tags ?? [])) fam[f] = (fam[f] ?? 0) + 1;
  const body = tab === 'charms' ? [
    h('p', { class: 'note' }, t('ui.slotsN', { a: charms.length, b: run.slots ?? 5 }), ' ', t('ui.orderNote')),
    h('div', { class: 'tags' }, Object.entries(fam).map(([f, n]) => h('span', { class: 'tag' + (n > 1 ? ' good' : '') }, `${L(FAMILY[f]?.name)} ×${n}`))),
    h('div', { class: 'cards' }, charms.map((c) => CHARM[c.id] && itemCard('charm', CHARM[c.id], { S: m.scale, extra: c.stack > 0 && h('span', { class: 'note' }, t('ui.stack', { n: c.stack })) })),
      Array.from({ length: Math.max(0, (run.slots ?? 5) - charms.length) }, () => h('div', { class: 'card empty' }, art('ui/slot_empty', 'ico lg'), h('span', { class: 'note' }, t('ui.emptySlot'))))),
  ] : tab === 'curses'
    ? (curses.length ? h('div', { class: 'cards' }, curses.map((id) => CURSE[id] && itemCard('curse', CURSE[id], { S: m.scale }))) : h('p', { class: 'note' }, t('ui.noCurseYet')))
    : h('div', { class: 'cards' }, tricks.map((id) => TRICK[id] && itemCard('trick', TRICK[id], { S: m.scale })));
  const tabs = [['charms', 'ui.shelfTitle'], ['curses', 'ui.cursesTitle'], ['tricks', 'ui.tricksTitle']];
  put(el,
    h('div', { class: 'seg', role: 'tablist' }, tabs.map(([id, key]) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t(key)))),
    body,
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
