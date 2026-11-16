// The spirit sheet: who they are, Favour with the 2 / 5 / 8 lines, the perks they give at each line, what they like, and the Omen if one was seen.
// ctx: { run, sheet, closeSheet }. Spirits are invented street neighbours; they never foretell results (an Omen is market gossip).
import { t, L } from '../i18n.js';
import { h, btn } from './dom.js';
import { SPIRIT } from './content.js';
import { portrait, pips, stageOf, textOf } from './cards.js';

const TASTES = ['coins', 'caps', 'spice', 'trick', 'charm', 'curse', 'skip'];
// taste multiplier -> label key (Loved 2, Fine 1, Meh 0.5, Hated below 0)
export const tasteKey = (v) => (v >= 2 ? 'ui.tasteLoved' : v >= 1 ? 'ui.tasteFine' : v > 0 ? 'ui.tasteMeh' : 'ui.tasteHated');

export function spiritSheet(ctx, id) {
  const sp = SPIRIT[id], s = ctx.run?.spirits?.[id] ?? { fav: 0 };
  if (!sp) return;
  const fav = s.fav | 0, stage = stageOf(fav);
  (ctx.openNode ?? ctx.sheet)(h('section', { class: 'sheet-card spirit', role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'sheet-head' }, portrait(sp, fav, 'devil'), h('div', {}, h('h2', {}, L(sp.name)), h('p', { class: 'note' }, t('ui.stageIs', { stage: t('ui.stageName.' + stage), n: fav })), pips(fav, true))),
    sp.hint && h('p', { class: 'fx big' }, L(sp.hint)),
    s.wrath ? h('p', { class: 'note due-note' }, t('ui.wrathOn', { n: s.wrath })) : null,
    h('h3', {}, t('ui.perks')),
    h('ul', { class: 'ticket perks' }, (sp.stages ?? []).map((st, i) => h('li', { class: stage > i ? 'got' : '' }, h('span', {}, t('ui.stageName.' + (i + 1)), ` (${st.at})`), h('b', {}, textOf(st, (st.rules ?? []).flatMap((r) => r.effects ?? []))))),
      (sp.wrath ?? []).map((w, i) => h('li', { class: 'bad' + (s.wrath > i ? ' got' : '') }, h('span', {}, t('ui.wrathName', { n: i + 1 }) + ` (${w.at})`), h('b', {}, textOf(w, (w.rules ?? []).flatMap((r) => r.effects ?? [])))))),
    sp.taste && h('div', { class: 'tags' }, TASTES.filter((k) => k in sp.taste).map((k) => h('span', { class: 'tag' + (sp.taste[k] >= 1 ? ' good' : sp.taste[k] <= 0 ? ' bad' : '') }, `${t('ui.kind.' + k)}: ${t(tasteKey(sp.taste[k]))}`))),
    ctx.run?.omenSeen?.[id] && h('p', { class: 'note' }, t('ui.omenSeen', { text: String(ctx.run.omenSeen[id]) })),
    h('div', { class: 'sheet-acts' }, btn(t('ui.close'), ctx.closeSheet))));
}
