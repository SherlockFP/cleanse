// Run end: Brimble collects (what killed you, best pattern, Wax, what you unlocked) or the contract is cleared (with its ending).
// data: { run, summary: { debtsPaid, coins, wax, stats }, result: { wax, newAchievements: id[], unlocks: [{ kind: 'char'|'charm'|'hideout', id }], doubled }, won, ending }.
// summary.stats may carry { bestSpin, bestPattern: { id, pay }, scorches, dealsSigned, curses }. Handlers: again(), home(), watchAd('double_wax'), adReady(placement).
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHAR, CHARM, HIDE, ACH, PATTERNS } from './content.js';
import { model } from './model.js';

const kindKey = { char: 'ui.unlockChar', charm: 'ui.unlockCharm', hideout: 'ui.unlockHideout' };
const kindList = { char: CHAR, charm: CHARM, hideout: HIDE };

export function render(el, { run, summary = {}, result = {}, won, ending }, ctx) {
  const m = model(run, ctx.derive(run)), st = summary.stats ?? {};
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', won ? 'win' : 'lose'); if (!won) ctx.say('nim', 'lose'); }
  const row = (label, n) => n != null && h('li', {}, h('span', {}, label), h('b', {}, fmt(n)));
  const best = st.bestPattern && PATTERNS.find((p) => p.id === st.bestPattern.id);
  const wax = (result.wax ?? summary.wax ?? 0) * (result.doubled ? 2 : 1);
  const unlocks = [...(result.unlocks ?? []).map((u) => t(kindKey[u.kind] ?? 'ui.unlocked', { name: L(kindList[u.kind]?.[u.id]?.name) })),
    ...(result.newAchievements ?? []).map((id) => L(ACH[id]?.name))].filter(Boolean);
  put(el,
    h('div', { class: 'head' }, h('h2', {}, won ? t('ui.winTitle') : t('ui.lostTitle')), art(won ? 'devil/shock' : 'devil/collect', 'devil')),
    !won && h('p', { class: 'sub' }, t('ui.lostSub', { r: m.round, d: m.debt })),
    !won && m.left > 0 && h('p', { class: 'note' }, t('ui.lostShort', { n: fmt(m.left) })),
    ending && h('section', { class: 'ending-box' }, h('h3', {}, t('ui.endingUnlocked', { name: t('ui.ending.' + ending) })), h('p', {}, t('ui.endingText.' + ending))),
    h('ul', { class: 'ticket' },
      row(t('ui.statDebts'), summary.debtsPaid), summary.endless != null && row(t('ui.statEndless'), summary.endless), row(t('ui.statBest'), st.bestSpin), row(t('ui.statScorch'), st.scorches),
      row(t('ui.statDeals'), st.dealsSigned), row(t('ui.statCurses'), st.curses)),
    best && h('p', { class: 'sub' }, t('ui.bestPattern', { name: L(best.name), n: fmt(st.bestPattern.pay ?? 0) })),
    h('div', { class: 'wax-line' }, art('ui/wax', 'ico lg'), h('b', {}, t('ui.waxEarned', { n: fmt(wax) }))),
    ctx.h.adReady?.('double_wax') && !result.doubled && wax > 0 && btn(t('ads.watch.double_wax'), () => ctx.call('watchAd', 'double_wax'), 'ad'),
    unlocks.length > 0 && h('section', {}, h('h3', {}, t('ui.unlocked')), h('ul', { class: 'ticket' }, unlocks.map((u) => h('li', {}, u)))),
    ctx.foot(btn(t('ui.home'), () => ctx.call('home')), btn(t('ui.again'), () => ctx.call('again'), 'primary')));
}
