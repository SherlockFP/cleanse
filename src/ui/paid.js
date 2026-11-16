// Deadline paid: the stamp, what was left over, early-pay rewards; or "saved at the last second" when a pact item burned.
// data: { run, outcome: 'paid' | 'saved', info: { earlyRounds, wick, interest, kept, next, name } } (every info field is optional). Handler: paidContinue().
import { t, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';

export function render(el, { run, outcome, info = {} }, ctx) {
  const saved = outcome === 'saved';
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'paid'); if (!saved) ctx.say('nim', 'paid'); }
  put(el,
    h('div', { class: 'head' }, h('h2', {}, saved ? t('ui.savedTitle') : t('ui.paidTitle')), art(saved ? 'devil/shock' : 'devil/grin', 'devil')),
    !saved && h('div', { class: 'stamp', 'aria-hidden': 'true' }, art('ui/seal', 'ico lg'), h('b', {}, t('ui.paidStamp'))),
    saved && h('p', { class: 'sub' }, t('ui.savedBy', { name: info.name ?? '' })),
    h('ul', { class: 'ticket' },
      info.earlyRounds > 0 && h('li', {}, t('ui.paidEarly', { n: info.earlyRounds, w: info.wick ?? info.earlyRounds * 2 })),
      info.interest > 0 && h('li', {}, t('ui.paidInterest', { n: fmt(info.interest) })),
      info.kept > 0 && h('li', {}, t('ui.paidKept', { n: fmt(info.kept) })),
      info.next > 0 && h('li', {}, t('ui.paidNext', { n: fmt(info.next) }))),
    ctx.foot(btn(saved ? t('ui.continue') : t('ui.toDeal'), () => ctx.call('paidContinue'), 'primary')));
}
