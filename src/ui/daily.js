// Daily Tide result: today's score and best, the streak, Planks, and the one optional retry ad.
// data: { save, today, reward?, result?: { planks, forgiven } }. reward and result are present right after a Daily run; from the home
// screen the same screen opens with the saved numbers only. Handlers: home(), adReady(placement), dailyRetry() -> Promise<bool>.
import { t, plural } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { planksBlock, noteBlock } from './runend.js';

export function render(el, { save, today, reward, result }, ctx) {
  const d = save.daily ?? {}, live = !!result;
  if (live && !ctx.state.said) { ctx.state.said = true; if (d.streak >= 7) ctx.say('deni', 'streak'); }
  const row = (label, n) => h('li', {}, h('span', {}, label), h('b', {}, String(n)));
  const canRetry = d.played === today && d.retry !== today && ctx.h.adReady?.('daily_retry');
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.daily')), art('deni/cheer', 'deni')),
    h('p', { class: 'sub' }, t('ui.dailyDone')),
    h('ul', { class: 'ticket' },
      row(t('ui.dailyScore', { n: '' }).trim(), d.score ?? 0),
      row(t('ui.dailyBest', { n: '' }).trim(), d.best ?? 0),
      h('li', {}, h('span', {}, plural(d.streak ?? 0, 'ui.streak')), art('fx/lantern_on', 'ico sm'))),
    live && result.forgiven && h('p', { class: 'note' }, t('ui.streakForgiven')),
    live && planksBlock(reward, ctx, result.planks, false, save),
    live && noteBlock(reward),
    h('p', { class: 'note' }, t('ui.dailyNote')),
    h('p', { class: 'note' }, t('ui.dailyLocal')),
    canRetry && btn(t('ads.watch.daily_retry'), () => ctx.h.dailyRetry(), 'ad'),
    ctx.foot(btn(live ? t('ui.home') : t('ui.close'), () => { ctx.close(); if (live) ctx.h.home?.(); }, 'primary')),
  );
}
