// The Locker Wall: 20 dented lockers opened with Brass, Silver and Red keys (some also ask for a deed done), and 4 Left Luggage lockers under the wall.
// A charm left in Left Luggage at run end comes back next run as a relic (cannot be sold, blended or lost). Every locker is visible with what it needs.
// data: { meta }. meta.keys { brass, silver, red }, meta.lockers (opened ids), meta.luggage [charmId | null x4]. Handlers: openLocker(id) -> { ok, reason }, progressOf(item),
// lockerContents(locker) -> { charms: [id], postcards: [id], deed } (the core turns "the 2nd locked rare of a family" into ids).
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { LOCKERS, CHARM, POSTCARD } from './content.js';
import { reqText, progressOf } from './locked.js';

export const KEYS = ['brass', 'silver', 'red'];
const idOf = (l, i) => l.id ?? 'l' + (i + 1);

export function render(el, { meta }, ctx) {
  const keys = meta.keys ?? {}, opened = new Set(meta.lockers ?? []), lug = meta.luggage ?? [null, null, null, null];
  const extraMet = (l) => { const p = progressOf(ctx, l); return p.need ? p.have >= p.need : true; };
  const contents = (l) => { const c = ctx.h.lockerContents?.(l) ?? {}; return [...(c.charms ?? []).map((id) => ({ kind: 'charm', id })), ...(c.postcards ?? []).map((id) => ({ kind: 'postcard', id })), ...(c.deed ? [{ kind: 'deed' }] : [])]; };
  const sheet = (l, i) => {
    const id = idOf(l, i), open = opened.has(id), can = !open && (keys[l.key] | 0) > 0 && extraMet(l), p = progressOf(ctx, l);
    ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' },
      h('h2', {}, t('ui.lockerN', { n: i + 1 })),
      !open && h('p', { class: 'note' }, t('ui.lockerKey', { key: t('ui.key.' + l.key) })), !open && (l.needs || l.requires || l.extra) && h('p', { class: 'note' }, t('ui.lockedBy', { how: reqText(l, p) })),
      open ? h('div', { class: 'cards' }, contents(l).map((c) => { const d = c.kind === 'charm' ? CHARM[c.id] : POSTCARD[c.id]; return h('article', { class: 'card' }, art(c.kind === 'deed' ? 'ui/seal' : d?.icon ?? 'ui/postcard_back', 'ico lg'), h('div', { class: 'card-text' }, h('strong', {}, c.kind === 'deed' ? t('ui.deedName') : L(d?.name) || t('ui.unknownItem')), d?.text && h('p', {}, L(d.text)))); }))
        : h('p', { class: 'note' }, t('ui.lockerShut', { n: contents(l).length })),
      h('div', { class: 'sheet-acts' }, !open && btn(t('ui.lockerOpen'), () => { if (!can) return ctx.toast(keys[l.key] > 0 ? 'ui.lockerDeed' : 'ui.lockerNoKey'); ctx.closeSheet(); const r = ctx.call('openLocker', id); if (r?.ok) ctx.toast('ui.lockerOpened'); }, can ? 'primary' : 'dim'), btn(t('ui.close'), ctx.closeSheet))));
  };
  put(el,
    h('h2', {}, t('ui.lockersTitle')),
    h('div', { class: 'chips' }, KEYS.map((k) => h('span', { class: 'chip key-' + k }, art('ui/key_' + k, 'ico xs'), h('b', {}, `${t('ui.key.' + k)} ${keys[k] | 0}`)))),
    h('p', { class: 'note' }, t('ui.lockersNote', { a: opened.size, b: LOCKERS.length })),
    LOCKERS.length ? h('div', { class: 'locker-grid' }, LOCKERS.map((l, i) => { const open = opened.has(idOf(l, i));
      return h('button', { type: 'button', class: 'locker' + (open ? ' open' : '') + ' k-' + l.key, 'data-anchor': 'locker:' + i, 'aria-label': t('ui.lockerN', { n: i + 1 }), onclick: () => sheet(l, i) },
        art(open ? 'ui/locker_open' : 'ui/locker_shut', 'ico lg'), h('b', {}, String(i + 1)), art('ui/key_' + l.key, 'ico xs')); })) : h('p', { class: 'note' }, t('ui.nbEmpty')),
    h('section', {}, h('h3', {}, t('ui.luggageTitle')), h('p', { class: 'note' }, t('ui.luggageNote')),
      h('div', { class: 'locker-grid luggage' }, [0, 1, 2, 3].map((i) => { const c = CHARM[lug[i]];
        return h('button', { type: 'button', class: 'locker' + (c ? ' open' : ''), onclick: () => ctx.toastText(c ? t('ui.luggageHolds', { name: L(c.name) }) : t('ui.luggageEmpty')) }, art(c ? c.icon : 'ui/luggage', 'ico lg'), h('b', {}, 'L' + (i + 1))); }))),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
