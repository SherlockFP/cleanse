// Contract cleared: stop and collect, or keep the same run going. Endless debts keep growing; the score is debts paid.
// data: { run, next }. Handlers: collectWin(), goEndless().
import { t, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';

export function render(el, { next }, ctx) {
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'win'); }
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.winTitle')), art('devil/shock', 'devil')),
    h('p', { class: 'sub' }, t('ui.endlessSub')),
    next > 0 && h('ul', { class: 'ticket' }, h('li', {}, t('ui.paidNext', { n: fmt(next) }))),
    ctx.foot(btn(t('ui.endlessStop'), () => ctx.call('collectWin')), btn(t('ui.endlessGo'), () => ctx.call('goEndless'), 'primary')));
}
