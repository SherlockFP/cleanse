// Daily run: today's fixed setup (character, contract 2, one forced terms card, one starting curse), your best and streak, and Play.
// data: { meta, today, result?: { debts, coins } }. Handlers: daily() starts the run, dailyInfo() -> { charId, contractId, termsId, curseId } (the core derives them from the date).
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHAR, CONTRACT, STAKE, CURSE, CONFIG } from './content.js';

export function render(el, { meta, today, result }, ctx) {
  const d = meta.daily ?? {}, info = ctx.h.dailyInfo?.() ?? {}, done = !!today && d.date === today && (d.done | 0) > 0;
  const row = (label, value) => h('li', {}, h('span', {}, label), h('b', {}, value));
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.dailyTitle')), art('ui/daily', 'devil')),
    h('p', { class: 'sub' }, t('ui.dailySub')),
    h('ul', { class: 'ticket' },
      info.charId && h('li', {}, t('ui.dailyToday', { char: L(CHAR[info.charId]?.name), contract: L(CONTRACT[info.contractId]?.name) })),
      info.termsId && h('li', {}, t('ui.dailyForced', { name: L(STAKE[info.termsId]?.name) })),
      info.curseId && h('li', {}, t('ui.dailyCurse', { name: L(CURSE[info.curseId]?.name) }))),
    h('ul', { class: 'ticket' },
      d.best && row(t('ui.dailyBest'), t('ui.dailyScore', { d: d.best.debts ?? 0, c: fmt(d.best.coins ?? 0) })),
      result && row(t('ui.dailyTitle'), t('ui.dailyScore', { d: result.debts ?? 0, c: fmt(result.coins ?? 0) })),
      row(t('ui.dailyStreak', { n: d.streak ?? 0 }), art('ui/star', 'ico sm'))),
    done && h('p', { class: 'note' }, t('ui.dailyDone')),
    h('p', { class: 'note' }, t('ui.dailyWax', { n: CONFIG.wax.dailyRun })),
    h('p', { class: 'note' }, t('ui.dailyLocal')),
    ctx.foot(btn(t('ui.close'), ctx.close), !done && btn(t('ui.dailyGo'), () => ctx.call('daily'), 'primary')));
}
