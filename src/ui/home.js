// Home: title, Brimble's line, the hideout (ghost-train carriage, 10 pieces bought with Wax), Play, and the other doors.
// data: { meta }. Handlers: startRun({ charId, contractId, tutorial }), buyHideout(id) -> { ok, reason }.
import { t, L, LANGS, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { HIDEOUT } from './content.js';
import { chip } from './cards.js';

// Play: the very first run starts at once (no menu before the first spin); later runs pick a character and a contract only when there is a choice.
export function play(meta, ctx) {
  if (!meta.tutorialDone) return ctx.call('startRun', { tutorial: true, charId: 'nim', contractId: 'c1' });
  if ((meta.chars?.length ?? 1) > 1) return ctx.open('charselect', {});
  if ((meta.contracts?.length ?? 1) > 1) return ctx.open('ladder', { charId: meta.chars?.[0] ?? 'nim' });
  return ctx.call('startRun', { charId: meta.chars?.[0] ?? 'nim', contractId: meta.contracts?.[0] ?? 'c1' });
}

export function render(el, { meta }, ctx) {
  const owned = new Set(meta.hideout ?? ['cot']), wax = meta.wax | 0;
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'home'); }
  const tile = (p) => {
    const have = owned.has(p.id), can = !have && wax >= p.costWax;
    const buy = () => {
      const r = ctx.call('buyHideout', p.id);
      if (r?.ok) { ctx.toast('ui.bought', { name: L(p.name) }); ctx.closeSheet(); }
    };
    return h('button', { type: 'button', class: 'piece' + (have ? ' own' : can ? ' can' : ''),
      onclick: () => ctx.sheet({ kind: 'hideout', id: p.id, note: have ? t('ui.owned') : t('ui.waxMore', { n: Math.max(0, p.costWax - wax) }),
        actions: have ? [] : [{ label: `${t('ui.buy')} ${fmt(p.costWax)}`, cls: can ? 'primary' : 'dim', onclick: buy }] }) },
    art(p.icon, 'ico lg'), h('span', { class: 'pname' }, L(p.name)), h('span', { class: 'pcost' }, have ? t('ui.owned') : h('b', {}, art('ui/wax', 'ico xs'), fmt(p.costWax))));
  };
  put(el,
    h('div', { class: 'home-head' }, h('h1', {}, t('ui.title')), h('p', { class: 'sub' }, t('ui.tagline'))),
    h('section', {}, h('div', { class: 'row-between' }, h('h3', {}, t('ui.hideout')), chip('ui/wax', t('ui.waxHave', { n: wax }))),
      h('p', { class: 'note' }, t('ui.hideoutSub')),
      h('div', { class: 'pieces' }, [...HIDEOUT].sort((a, b) => a.order - b.order).map(tile))),
    !meta.tutorialDone && h('p', { class: 'note tutorial' }, t('ui.firstRunHint')),
    h('div', { class: 'doors' },
      btn(t('ui.daily'), () => ctx.open('daily', {})), btn(t('ui.collection'), () => ctx.open('collection', {})),
      btn(t('ui.howto'), () => ctx.open('howto', {})), btn(t('ui.store'), () => ctx.open('store', {})), btn(t('ui.settings'), () => ctx.open('settings', {}))),
    h('div', { class: 'seg', role: 'radiogroup', 'aria-label': t('ui.language') }, LANGS.map((l) =>
      h('button', { type: 'button', class: 'opt' + (ctx.lang() === l ? ' on' : ''), role: 'radio', 'aria-checked': String(ctx.lang() === l), onclick: () => ctx.setSettings({ lang: l }) }, t('ui.lang' + l[0].toUpperCase() + l[1])))),
    ctx.foot(btn(t('ui.play'), () => play(meta, ctx), 'primary big')));
}
