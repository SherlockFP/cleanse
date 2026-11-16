// Creditor event intro: a stamped letter. data: { run }. Continue calls handlers.eventContinue().
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { EVENTS } from '../core/data/events.js';

const ORHAN = { auditor: 'event_auditor', fog_bank: 'event_fog', short_day: 'event_short', low_water: 'event_low' };

export function render(el, { run }, ctx) {
  const e = EVENTS.find((x) => x.id === run.event);
  if (!e) { ctx.close(); return; }
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('orhan', ORHAN[e.id]); }
  put(el, 
    h('div', { class: 'stamp' }, t('ui.eventStamp')),
    h('h2', {}, t(e.nameKey)),
    h('p', { class: 'sub' }, t(`event.${e.id}.who`)),
    h('p', { class: 'letter' }, t(e.descKey)),
    art('orhan/stamp', 'orhan'), // bottom left, right above his speech bubble
    ctx.foot(btn(t('ui.ok'), () => { ctx.close(); ctx.h.eventContinue?.(); }, 'primary')),
  );
}
