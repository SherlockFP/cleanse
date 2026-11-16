// Creditor event intro: a stamped letter. data: { run }. Continue calls handlers.eventContinue().
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { EVENTS } from '../core/data/events.js';

const ORHAN = { auditor: 'event_auditor', fog_bank: 'event_fog', short_day: 'event_short', low_water: 'event_low' };

export function render(el, { run }, ctx) {
  const e = EVENTS.find((x) => x.id === run.event);
  if (!e) { ctx.close(); return; }
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('orhan', ORHAN[e.id]); }
  const auditor = e.id === 'auditor';
  put(el,
    h('div', { class: 'stamp' }, t('ui.eventStamp')),
    h('h2', {}, t(e.nameKey)),
    h('p', { class: 'sub' }, t(`event.${e.id}.who`)),
    art(auditor ? 'npc/auditor' : 'orhan/stamp', 'orhan'), // Nermin Hanım has her own portrait; the other three letters come through Orhan
    h('p', { class: 'letter' }, t(e.descKey)),
    // the auditor's rule as a picture: the pegs of this tide, and the one she took crossed out
    auditor && h('div', { class: 'pegrow', 'aria-hidden': 'true' }, Array.from({ length: run.pegsMax + 1 }, (_, i) => h('span', { class: 'peg' + (i >= run.pegsMax ? ' off' : '') }, art('reel/peg', 'ico')))),
    ctx.foot(btn(t('ui.ok'), () => { ctx.close(); ctx.h.eventContinue?.(); }, 'primary')),
  );
}
