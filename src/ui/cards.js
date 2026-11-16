// Shared pieces: stat chips, price chips, item cards (rarity frame, tags, text) and the detail sheet.
import { t, L, coinText, fmt } from '../i18n.js';
import { h, art, btn } from './dom.js';
import { LISTS, FAMILY } from './content.js';

export const chip = (icon, text, cls = '') => h('span', { class: 'chip ' + cls }, icon && art(icon, 'ico xs'), h('b', {}, text));

// { coins?, wick? } -> "[coin] 12  [wick] 3"; empty object reads "Free".
export function priceChip(p, cls = '') {
  const parts = [];
  if (p?.coins != null) parts.push(h('b', { class: 'pc' }, art('ui/coin', 'ico xs'), fmt(p.coins)));
  if (p?.wick != null) parts.push(h('b', { class: 'pw' }, art('ui/wick', 'ico xs'), fmt(p.wick)));
  return h('span', { class: 'price ' + cls }, parts.length ? parts : t('ui.free'));
}

// Icon with the painted rarity tag behind it.
export const pic = (icon, rarity, cls = '') => h('span', { class: `pic ${cls}` + (rarity ? ' r-' + rarity : '') }, rarity && art(`ui/rarity_${rarity}`, 'tagbg'), art(icon, 'ico lg'));

// Family tags of a charm (its family first, a second tag when it has one).
export const tagsOf = (item) => [...new Set(item.tags ?? (item.family ? [item.family] : []))].map((id) => h('span', { class: 'tag' }, L(FAMILY[id]?.name) || id));

const whenKey = { pre: 'ui.whenPre', post: 'ui.whenPost', any: 'ui.whenAny', shop: 'ui.whenShop', auto: 'ui.whenAuto' };
export const whenTag = (trick) => trick.when && h('span', { class: 'tag when' }, t(whenKey[trick.when] ?? 'ui.whenAny'));

// opts: { S, price, extra: node[], rarity, cls }. Anything after opts goes in the action column (buttons).
export function itemCard(kind, item, opts = {}, ...acts) {
  const rarity = opts.rarity ?? item.rarity;
  const rar = rarity && h('span', { class: 'tag rar r-' + rarity }, t('ui.rarity.' + rarity));
  return h('article', { class: `card ${kind}` + (rarity ? ' r-' + rarity : '') + (opts.cls ? ' ' + opts.cls : '') },
    pic(item.icon, kind === 'charm' ? rarity : null),
    h('div', { class: 'card-text' },
      h('strong', {}, L(item.name)),
      h('span', { class: 'tags' }, rar, kind === 'charm' && tagsOf(item), kind === 'trick' && whenTag(item)),
      h('span', { class: 'fx' }, coinText(item.text, opts.S ?? 1)),
      opts.extra),
    (opts.price || acts.length) && h('div', { class: 'card-act' }, opts.price && priceChip(opts.price), acts));
}

// The tappable inspect sheet. spec: { kind, id, S, actions: [{ label, onclick, cls }], note }. close() hides it.
export function detailSheet(spec, close) {
  const item = LISTS[spec.kind]?.[spec.id];
  if (!item) return null;
  const rarity = spec.kind === 'charm' ? item.rarity : null;
  const stack = spec.stack > 0 && h('p', { class: 'note' }, t('ui.stack', { n: spec.stack }));
  const sub = spec.kind === 'curse' ? t('ui.curseHeld')
    : spec.kind === 'charm' ? (item.family && t('ui.family', { name: L(FAMILY[item.family]?.name) })) : null;
  return h('section', { class: 'sheet-card' + (rarity ? ' r-' + rarity : ''), role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'sheet-head' }, pic(item.icon, rarity), h('div', {}, h('h2', {}, L(item.name)),
      h('span', { class: 'tags' }, rarity && h('span', { class: 'tag rar r-' + rarity }, t('ui.rarity.' + rarity)), spec.kind === 'charm' && tagsOf(item), spec.kind === 'trick' && whenTag(item)))),
    h('p', { class: 'fx big' }, coinText(item.text, spec.S ?? 1)),
    sub && h('p', { class: 'note' }, sub), stack, spec.note && h('p', { class: 'note' }, spec.note),
    h('div', { class: 'sheet-acts' }, (spec.actions ?? []).map((a) => btn(a.label, a.onclick, a.cls ?? '')), btn(t('ui.close'), close)));
}

