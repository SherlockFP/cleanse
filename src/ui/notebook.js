// The Notebook: the permanent tree, bought with Stash. Five tabs (Cart, Tin, Crew, Home, Friends). Every node is visible from the first day: bought, buyable, or greyed
// with its requirement in plain words and a progress bar. data: { meta }. meta.notebook = bought ids, meta.stash (or meta.wax before the migration).
// Handlers: buyNode(id) -> { ok, reason }, progressOf(node) -> { have, need, where }. Without notebook.json the ten Home pieces of v2 fill the Home tab.
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { NOTEBOOK, HIDEOUT } from './content.js';
import { chip } from './cards.js';
import { lockedCard, progressOf } from './locked.js';

export const TABS = ['cart', 'tin', 'crew', 'home', 'friends'];
const tabsOf = (all) => { const ids = [...new Set(all.map((n) => n.tab))]; return ids.length ? ids : TABS; }; // the data's own tabs (cart, tin, pool, crew, home)
const nodesOf = () => (NOTEBOOK.length ? NOTEBOOK : HIDEOUT.map((p) => ({ id: p.id, tab: 'home', name: p.name, text: p.text, cost: p.costWax, icon: p.icon, legacy: true })));

export function render(el, { meta }, ctx) {
  const tab = ctx.state.tab ?? nodesOf()[0]?.tab ?? 'cart', stash = meta.stash ?? meta.wax ?? 0, bought = new Set([...(meta.notebook ?? []), ...(meta.hideout ?? [])]);
  const all = nodesOf(), list = all.filter((n) => n.tab === tab);
  const met = (n) => { const p = progressOf(ctx, n); return p.need ? p.have >= p.need : !(n.needs || n.requires || n.unlock || n.req); };
  const buy = (n) => { const r = ctx.call(n.legacy ? 'buyHideout' : 'buyNode', n.id); if (r?.ok) { ctx.toast('ui.bought', { name: L(n.name) }); ctx.closeSheet(); } };
  const node = (n) => {
    const have = bought.has(n.id), ok = met(n), can = !have && ok && stash >= n.cost;
    if (!have && !ok) return lockedCard(ctx, { item: n, icon: n.icon, title: L(n.name), extra: h('span', { class: 'note' }, L(n.text)) });
    return h('button', { type: 'button', class: 'card pick node' + (have ? ' own' : can ? ' can' : ' dim'), 'data-anchor': 'node:' + n.id,
      onclick: () => ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, L(n.name)), h('p', { class: 'fx big' }, L(n.text)),
        h('p', { class: 'note' }, have ? t('ui.owned') : stash >= n.cost ? t('ui.nbCan') : t('ui.waxMore', { n: n.cost - stash })),
        h('div', { class: 'sheet-acts' }, !have && btn(`${t('ui.buy')} ${fmt(n.cost)}`, () => (can ? buy(n) : ctx.toast('why.wax')), can ? 'primary' : 'dim'), btn(t('ui.close'), ctx.closeSheet)))) },
    h('span', { class: 'pic' }, art(n.icon ?? 'ui/notebook', 'ico lg', L(n.name))),
    h('div', { class: 'card-text' }, h('strong', {}, L(n.name)), h('span', { class: 'fx' }, L(n.text))),
    h('span', { class: 'pcost' }, have ? t('ui.owned') : h('b', {}, art('ui/wax', 'ico xs'), fmt(n.cost))));
  };
  put(el,
    h('div', { class: 'row-between' }, h('h2', {}, t('ui.nbTitle')), chip('ui/wax', t('ui.waxHave', { n: stash }))),
    h('p', { class: 'note' }, t('ui.nbNote', { a: all.filter((n) => bought.has(n.id)).length, b: all.length })),
    h('div', { class: 'seg', role: 'tablist' }, tabsOf(all).map((id) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t('ui.nbTab.' + id)))),
    list.length ? h('div', { class: 'cards tree' }, list.map(node)) : h('p', { class: 'note' }, t('ui.nbEmpty')),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
