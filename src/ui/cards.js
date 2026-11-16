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
    sub && h('p', { class: 'note' }, sub), spec.kind === 'charm' && (item.tags ?? []).filter((f) => FAMILY[f]).map((f) => h('p', { class: 'note' }, t('fam.' + f))), stack, // what a family word means, in place (AUDIT2 9) spec.note && h('p', { class: 'note' }, spec.note),
    h('div', { class: 'sheet-acts' }, (spec.actions ?? []).map((a) => btn(a.label, a.onclick, a.cls ?? '')), btn(t('ui.close'), close)));
}


// ---- v3 pieces ----
// A labelled stat chip: icon, the number, and a word under the icon (AUDIT: no icon-only chips). `tip` is the one-line explainer a tap shows (onTip(text)).
export function lchip({ icon, label, value, sub, tip, onTip, onclick, cls = '', anchor }) {
  return h('button', { type: 'button', class: 'lchip ' + cls, 'data-anchor': anchor, 'aria-label': `${label} ${value}`, onclick: onclick ?? (() => tip && onTip?.(tip)) },
    h('span', { class: 'lc-top' }, icon && art(icon, 'ico xs'), h('b', {}, value), sub && h('em', {}, sub)), h('span', { class: 'lc-label' }, label));
}

// Spirit mood from Favour: calm 0 to 4, glad 5 and up, cross below 0 (SPEC 3.3).
export const moodOf = (fav = 0) => (fav < 0 ? 'cross' : fav >= 5 ? 'glad' : 'calm');
export const portraitId = (sp, fav = 0) => sp?.portrait?.[moodOf(fav)] ?? sp?.portrait?.calm ?? 'spirit/' + (sp?.id ?? 'x') + '_calm';
export const portrait = (sp, fav = 0, cls = 'face') => art(portraitId(sp, fav), cls, L(sp?.name));
// stage 0 none, 1 Noticed (2), 2 Friend (5), 3 Patron (8)
export const stageOf = (fav = 0) => (fav >= 8 ? 3 : fav >= 5 ? 2 : fav >= 2 ? 1 : 0);

// Favour pips. small: 5 pips (2 Favour each). big: 10 pips with the stage lines 2, 5, 8 marked; below 0 the pips go red and count down.
export function pips(fav = 0, big = false) {
  if (fav < 0) return h('span', { class: 'pips neg', 'aria-label': String(fav) }, Array.from({ length: big ? 5 : 3 }, (_, i) => h('i', { class: i < Math.min(big ? 5 : 3, -fav) ? 'on' : '' })));
  const n = big ? 10 : 5, on = big ? Math.min(10, fav) : Math.min(5, Math.ceil(fav / 2));
  return h('span', { class: 'pips' + (big ? ' big' : ''), 'aria-label': String(fav) }, Array.from({ length: n }, (_, i) => h('i', { class: (i < on ? 'on' : '') + (big && [1, 4, 7].includes(i) ? ' mark' : '') })));
}

// "Luck +2", "Coins +15": a plain line from an effects array, used only when the data carries no text of its own.
const FXK = { luck: 'ui.fx.luck', coins: 'ui.fx.coins', wick: 'ui.fx.wick', interest: 'ui.fx.interest', spins: 'ui.fx.spins', heat: 'ui.fx.heat', trick: 'ui.fx.trick', gainCharm: 'ui.fx.charm',
  symMult: 'ui.fx.symMult', patMult: 'ui.fx.patMult', allMult: 'ui.fx.allMult', removeSymbol: 'ui.fx.remove', liftCurse: 'ui.fx.lift', charge: 'ui.fx.charge', loseCharm: 'ui.fx.lose', flag: 'ui.fx.flag', favour: 'ui.fx.favour', symValue: 'ui.fx.symValue', place: 'ui.fx.place', weight: 'ui.fx.weight' };
export const fxText = (effects = [], S = 1) => effects.map((e) => t(FXK[e.type] ?? 'ui.fx.flag', { n: Math.round((e.n ?? e.v ?? 1) * (e.type === 'coins' ? S : 1) * 100) / 100 })).join(' · ');
// Text of a data entry ({ text }) or, failing that, its effects.
export const textOf = (o, effects, S = 1) => (o?.text ? coinText(o.text, S) : fxText(effects ?? o?.effects ?? o?.boon ?? [], S));
