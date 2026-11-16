// One ending panel and, after it, one epilogue panel for each spirit that was a Fan (Favour 8) in that run.
// data: { ending, epilogues?: spiritId[] }. Endings: paid_in_full, bought_the_machine, new_management, the_refuser, left_luggage (secret until earned; the Codex shows its requirement).
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { SPIRIT } from './content.js';
import { portrait } from './cards.js';

const face = { paid_in_full: 'devil/grin', bought_the_machine: 'devil/shock', new_management: 'devil/idle' };
const picture = { the_refuser: 'ending/the_refuser', left_luggage: 'ending/left_luggage' };

export function render(el, { ending, epilogues = [] }, ctx) {
  const i = ctx.state.i ?? -1, sp = SPIRIT[epilogues[i]];
  if (i >= 0 && sp) {
    return put(el, h('div', { class: 'head' }, h('h2', {}, t('ui.epilogueOf', { name: L(sp.name) })), portrait(sp, 8, 'devil')), h('p', { class: 'story' }, L(sp.lines?.epilogue) || t('ui.epilogueGeneric', { name: L(sp.name) })),
      ctx.foot(btn(i + 1 < epilogues.length ? t('ui.next') : t('ui.close'), () => { if (i + 1 < epilogues.length) { ctx.state.i = i + 1; ctx.rerender(); } else ctx.close(); }, 'primary')));
  }
  return put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.ending.' + ending)), art(face[ending] ?? 'devil/idle', 'devil')),
    picture[ending] && art(picture[ending], 'storyimg'),
    h('p', { class: 'story' }, t('ui.endingText.' + ending)),
    ctx.foot(btn(epilogues.length ? t('ui.next') : t('ui.close'), () => { if (epilogues.length) { ctx.state.i = 0; ctx.rerender(); } else ctx.close(); }, 'primary')));
}
