// Run end: paid or short, a short summary, one margin note line, play again.
// data: { run, noteKey?: 'note.7', planks?: number }. Handlers: again(), home() (optional).
import { t, STRINGS } from '../i18n.js';
import { h, btn, put } from './dom.js';
import { runSummary } from '../core/run.js';

export function render(el, { run, noteKey, planks }, ctx) {
  const s = runSummary(run), won = s.won;
  if (!ctx.state.said) {
    ctx.state.said = true;
    ctx.say('orhan', won ? 'win' : 'loss');
    ctx.say('deni', won ? 'win' : 'loss');
  }
  const stat = (k) => h('li', {}, k);
  put(el, 
    won && h('div', { class: 'stamp won' }, t('ui.paid')),
    h('h2', {}, won ? t('ui.runPaid') : t('ui.runLost')),
    !won && h('p', { class: 'sub' }, t('ui.jarShort', { n: Math.max(0, run.quota - run.jar) })),
    h('ul', { class: 'stats' },
      stat(t('ui.reached', { n: s.tide })),
      stat(t('ui.statTides', { n: s.tidesCleared })),
      stat(t('ui.bestSpin', { n: s.bestSpin })),
      stat(t('ui.statCoins', { n: s.coins })),
      planks != null && stat(t('ui.planksGain', { n: planks }))),
    planks != null && h('p', { class: 'note' }, t('ui.planksNote')),
    noteKey && STRINGS.en[noteKey] && h('blockquote', { class: 'margin' }, h('small', {}, t('ui.marginNote')), t(noteKey)),
    btn(t('ui.again'), () => { ctx.close(); ctx.h.again?.(); }, 'primary'),
    ctx.h.home && btn(t('ui.home'), () => { ctx.close(); ctx.h.home(); }),
  );
}
