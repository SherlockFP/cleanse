// Run end: paid or short, a short summary, one margin note line, play again.
// data: { run, noteKey?: 'note.7', planks?: number }. Handlers: again(), home() (optional).
import { t, STRINGS } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { runSummary } from '../core/run.js';

export function render(el, { run, noteKey, planks }, ctx) {
  const s = runSummary(run), won = s.won;
  if (!ctx.state.said) {
    ctx.state.said = true;
    ctx.say('orhan', won ? 'win' : 'loss');
    ctx.say('deni', won ? 'win' : 'loss');
  }
  // label left, number right. The label is the string without its number, so no new keys are needed.
  const stat = (key, n) => h('li', {}, h('span', {}, t(key, { n: '' }).replace(/[:+\s]+$/, '')), h('b', {}, String(n)));
  put(el, 
    art(won ? 'orhan/nod' : 'orhan/arms', 'orhan'),
    won && h('div', { class: 'stamp won' }, t('ui.paid')),
    h('h2', {}, won ? t('ui.runPaid') : t('ui.runLost')),
    !won && h('p', { class: 'sub' }, t('ui.jarShort', { n: Math.max(0, run.quota - run.jar) })),
    h('ul', { class: 'ticket' },
      stat('ui.reached', s.tide),
      stat('ui.statTides', s.tidesCleared),
      stat('ui.bestSpin', s.bestSpin),
      stat('ui.statCoins', s.coins),
      planks != null && stat('ui.planksGain', '+' + planks)),
    planks != null && h('p', { class: 'note' }, t('ui.planksNote')),
    noteKey && STRINGS.en[noteKey] && h('blockquote', { class: 'margin' }, h('small', {}, t('ui.marginNote')), t(noteKey)),
    ctx.foot(ctx.h.home && btn(t('ui.home'), () => { ctx.close(); ctx.h.home(); }), btn(t('ui.again'), () => { ctx.close(); ctx.h.again?.(); }, 'primary')),
  );
}
