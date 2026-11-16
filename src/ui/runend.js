// Run end: paid or short, a short summary, Planks counted up, one margin note, the ledger page when an installment was paid, then home.
// data: { run, reward }. reward is what core/meta.js grantRunRewards returned (null if this run was already paid out); main.js sets
// reward.doubled after a Double Planks ad. Handlers: home(), adReady(placement), doublePlanks(reward) -> Promise<bool>.
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { runSummary } from '../core/run.js';
import { TIDES_PER_RUN } from '../core/econ.js';
import { nextBuild } from '../core/meta.js';

// "+n" counted up from the number shown before (0 on the first paint, the single total after a Double Planks ad).
function countUp(el, from, to, instant) {
  if (instant || from === to) { el.textContent = '+' + to; return; }
  let i = 0;
  const steps = 16, id = setInterval(() => { i++; el.textContent = '+' + Math.round(from + ((to - from) * i) / steps); if (i >= steps) clearInterval(id); }, 45);
  el.textContent = '+' + from;
}

// Planks from this run: the total, where it came from, and the sentence that says what Planks are.
// extra: Daily Tide and streak Planks (never doubled). ad: false hides the Double Planks button (the Daily result has its own ad).
// save: when given, the note names the next boathouse job these Planks go to.
export function planksBlock(reward, ctx, extra = 0, ad = true, save = null) {
  if (!reward) return null;
  const nb = save && nextBuild(save), name = nb && t(nb.nameKey);
  const st = ctx.state, p = reward.parts, total = reward.planks * (reward.doubled ? 2 : 1) + extra, num = h('b', {});
  countUp(num, st.shown ?? 0, total, ctx.settings.reduceMotion);
  st.shown = total;
  const canDouble = ad && !reward.doubled && reward.planks > 0 && ctx.h.adReady?.('double_planks');
  return [
    h('ul', { class: 'ticket gain' },
      h('li', {}, h('span', {}, art('fx/plank', 'ico sm'), t('ui.planks')), num),
      p.first > 0 && h('li', { class: 'part' }, t('ui.firstDay')),
      p.perTide > 0 && h('li', { class: 'part' }, t('ui.perTide', { n: p.perTide })),
      p.win > 0 && h('li', { class: 'part' }, t('ui.perWin', { n: p.win })),
      p.clutch > 0 && h('li', { class: 'part' }, t('ui.perClutch', { n: p.clutch })),
      extra > 0 && h('li', { class: 'part' }, `${t('ui.daily')}: +${extra}`),
      reward.doubled && h('li', { class: 'part' }, t('ui.planksDoubled', { n: reward.planks }))),
    h('p', { class: 'note' }, !nb ? t('ui.planksNote') : save.planks >= nb.cost ? t('ui.planksEnough', { name }) : t('ui.planksToGo', { n: nb.cost - save.planks, name })),
    canDouble && btn(t('ads.watch.double_planks'), async () => { if (await ctx.h.doublePlanks(reward)) ctx.rerender(); }, 'ad'),
  ];
}

export const noteBlock = (reward) => reward?.note && h('blockquote', { class: 'margin' }, h('small', {}, t('ui.marginNote')), t('note.' + reward.note));

export function render(el, { run, reward, save }, ctx) {
  const s = runSummary(run), won = s.won;
  if (!ctx.state.said) {
    ctx.state.said = true;
    ctx.say('orhan', won ? 'win' : 'loss');
    ctx.say('deni', won ? 'win' : 'loss');
  }
  // label left, number right. The label is the string without its number, so no new keys are needed.
  const stat = (key, n) => h('li', {}, h('span', {}, t(key, { n: '' }).replace(/[:+\s]+$/, '')), h('b', {}, String(n)));
  put(el,
    won && h('div', { class: 'stamp won' }, t('ui.paid')),
    h('div', { class: 'head' }, h('h2', {}, won ? t('ui.runPaid') : t('ui.runLost')), art(won ? 'orhan/nod' : 'orhan/arms', 'deni')),
    // where the run stopped, in the pier's own terms: the lantern string and the jar against that tide's quota
    h('div', { class: 'lanterns', role: 'img', 'aria-label': t('ui.statTides', { n: s.tidesCleared }) },
      Array.from({ length: TIDES_PER_RUN }, (_, i) => art(i < s.tidesCleared ? 'fx/lantern_on' : 'fx/lantern_off', 'ico sm'))),
    !won && h('p', { class: 'sub' }, t('ui.jarShort', { t: s.tide, a: run.jar, b: run.quota })),
    reward?.beat && h('blockquote', { class: 'margin beat' }, h('small', {}, t('ui.storyBeat', { n: reward.beat })), t('beat.' + reward.beat)),
    planksBlock(reward, ctx, 0, true, save),
    noteBlock(reward), // what the run left behind comes first; the run's own numbers are below
    h('ul', { class: 'ticket stats' },
      stat('ui.bestSpin', s.bestSpin),
      stat('ui.statCoins', s.coins)),
    ctx.foot(btn(t('ui.home'), () => { ctx.close(); ctx.h.home?.(); }, 'primary')),
  );
}
