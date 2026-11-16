// One ending panel. data: { ending: 'paid_in_full' | 'bought_the_machine' | 'new_management' }. Opened from the collection (and by the glue after a clear).
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';

const face = { paid_in_full: 'devil/grin', bought_the_machine: 'devil/shock', new_management: 'devil/idle' };

export function render(el, { ending }, ctx) {
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.ending.' + ending)), art(face[ending] ?? 'devil/idle', 'devil')),
    h('p', { class: 'story' }, t('ui.endingText.' + ending)),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
