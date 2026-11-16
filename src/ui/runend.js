// Run end = "why you lost": the debt and night it ended on, the coins short, the three biggest missed chances from the run's own stats, one tip, then the ledger
// (Stash, keys, new Codex entries, best Favour, Lessons ticked). A run that reached debt 4 may leave one charm in Left Luggage.
// data: { run, summary: { debtsPaid, coins, wax, stats, spirits }, result: { stash, newAchievements, unlocks, doubled, keys: [{ kind, n }], lessons: [{ id }], spirits: id[], stamps: kind[] }, won, ending, meta }.
// The missed chances are read from the run's own counters (run.tricks left, stats.stokes, interestTotal, hangUps, insults, duesFailed). Handlers: again(), home(), luggage(slot, charmIndex), watchAd, adReady.
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARM, HIDE, ACH, PATTERNS, LESSONS, SPIRIT } from './content.js';
import { model } from './model.js';
import { pic } from './cards.js';

// [key, weight]: the chances a player can act on, most useful first. Counts come from what the core already keeps.
const MISSES = [['unusedTricks', 6], ['noInterest', 5], ['noSpice', 4], ['duesFailed', 3], ['insults', 2], ['hangUps', 1]];
const countOf = (k, st, run) => (k === 'unusedTricks' ? (run?.tricks?.filter(Boolean).length ?? 0) : k === 'noSpice' ? ((st.stokes | 0) === 0 ? (st.spiceSpins ?? st.spins) | 0 : 0) : k === 'noInterest' ? ((st.interestTotal | 0) === 0 && (st.banks | 0) === 0 ? st.spins | 0 : 0) : st[k] | 0);
export const missedChances = (st, run) => MISSES.map(([k, w]) => ({ k, n: countOf(k, st, run), w })).filter((m) => m.n > 0).sort((a, b) => b.w - a.w || b.n - a.n).slice(0, 3);

export function render(el, { run, summary = {}, result = {}, won, ending, meta = {} }, ctx) {
  const m = model(run, ctx.derive(run)), st = summary.stats ?? {}, miss = missedChances(st, run);
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', won ? 'win' : 'lose'); if (!won) ctx.say('nim', 'lose'); }
  const row = (label, n) => n != null && h('li', {}, h('span', {}, label), h('b', {}, fmt(n)));
  const best = st.bestPattern && PATTERNS.find((p) => p.id === st.bestPattern.id);
  const wax = (result.stash ?? result.wax ?? summary.wax ?? 0) * (result.doubled ? 2 : 1);
  const unlocks = [...(result.unlocks ?? []).map((u) => t('ui.unlockedItem', { name: L((u.kind === 'charm' ? CHARM : u.kind === 'hideout' ? HIDE : {})[u.id]?.name) || u.id })), ...(result.newAchievements ?? []).map((id) => L(ACH[id]?.name))].filter(Boolean);
  const fb = Object.entries(summary.spirits ?? {}).filter(([id]) => SPIRIT[id]).sort((a, b) => b[1].fav - a[1].fav)[0], lessons = (result.lessons ?? []).map((x) => L(LESSONS.find((l) => l.id === (x.id ?? x))?.name)).filter(Boolean);
  const keys = Object.entries((result.keys ?? []).reduce((o, k) => ({ ...o, [k.kind]: (o[k.kind] | 0) + (k.n | 0) }), {})), stamps = result.stamps ?? [];
  const canLeave = !won && (run.debtIdx | 0) >= 3 && (run.charms ?? []).some((c) => !c.relic);

  const luggage = () => {
    const lug = meta.luggage ?? [null, null, null, null], held = (run.charms ?? []).map((c, i) => ({ c, i })).filter((x) => !x.c.relic && CHARM[x.c.id]);
    ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, t('ui.luggageTitle')), h('p', { class: 'note' }, t('ui.luggageNote')),
      h('div', { class: 'cards' }, held.map(({ c, i }) => h('article', { class: 'card' }, pic(CHARM[c.id].icon, CHARM[c.id].rarity), h('div', { class: 'card-text' }, h('strong', {}, L(CHARM[c.id].name))),
        h('div', { class: 'card-act row' }, [0, 1, 2, 3].map((s) => h('button', { type: 'button', class: 'btn small', onclick: () => { ctx.closeSheet(); ctx.call('luggage', s, i); } }, `L${s + 1}` + (lug[s] ? ' ↔' : ''))))))),
      h('div', { class: 'sheet-acts' }, btn(t('ui.close'), ctx.closeSheet))));
  };

  put(el,
    h('div', { class: 'head' }, h('h2', {}, won ? t('ui.winTitle') : t('ui.lostTitle')), art(won ? 'devil/shock' : 'devil/collect', 'devil')),
    !won && h('p', { class: 'sub' }, t('ui.lostSub', { r: m.round, d: m.debt })),
    !won && m.left > 0 && h('p', { class: 'owed' }, t('ui.lostShort', { n: fmt(m.left) })),
    !won && h('section', { class: 'why' }, h('h3', {}, t('ui.whyTitle')),
      miss.length ? h('ul', { class: 'ticket' }, miss.map((x) => h('li', {}, h('span', {}, t('ui.miss.' + x.k, { n: x.n })), h('b', {}, fmt(x.n))))) : h('p', { class: 'note' }, t('ui.missNone')),
      h('p', { class: 'tip-line' }, h('b', {}, t('ui.tipLabel')), ' ', t(miss[0] ? 'ui.tip.' + miss[0].k : 'ui.tip.default'))),
    ending && h('section', { class: 'ending-box' }, h('h3', {}, t('ui.endingUnlocked', { name: t('ui.ending.' + ending) })), h('p', {}, t('ui.endingText.' + ending))),
    h('ul', { class: 'ticket' },
      row(t('ui.statDebts'), summary.debtsPaid), summary.endless != null && row(t('ui.statEndless'), summary.endless), row(t('ui.statBest'), st.bestSpin), row(t('ui.statScorch'), st.scorches),
      row(t('ui.statDeals'), st.dealsSigned), row(t('ui.statCurses'), st.curses)),
    best && h('p', { class: 'sub' }, t('ui.bestPattern', { name: L(best.name), n: fmt(st.bestPattern.pay ?? 0) })),
    h('section', { class: 'ledger' }, h('h3', {}, t('ui.ledgerTitle')),
      h('div', { class: 'wax-line' }, art('ui/wax', 'ico lg'), h('b', {}, t('ui.waxEarned', { n: fmt(wax) }))),
      h('ul', { class: 'ticket' },
        keys.map(([k, n]) => h('li', {}, h('span', {}, t('ui.ledgerKey')), h('b', {}, `${t('ui.key.' + k)} +${n}`))),
        stamps.map((k) => h('li', {}, h('span', {}, t('ui.ledgerStamp')), h('b', {}, t('ui.stamp.' + k)))),
        (result.spirits ?? []).map((id) => SPIRIT[id] && h('li', {}, h('span', {}, t('ui.ledgerCodex')), h('b', {}, L(SPIRIT[id].name)))),
        fb && fb[1].fav > 0 && h('li', {}, h('span', {}, t('ui.ledgerFavour')), h('b', {}, `${L(SPIRIT[fb[0]].name)} ${fb[1].fav}`)),
        lessons.map((n) => h('li', {}, h('span', {}, t('ui.ledgerLesson')), h('b', {}, n))))),
    ctx.h.adReady?.('double_wax') && !result.doubled && wax > 0 && btn(t('ads.watch.double_wax'), () => ctx.call('watchAd', 'double_wax'), 'ad'),
    unlocks.length > 0 && h('section', {}, h('h3', {}, t('ui.unlocked')), h('ul', { class: 'ticket' }, unlocks.map((u) => h('li', {}, u)))),
    canLeave && btn(t('ui.luggageBtn'), luggage, 'warn'),
    ctx.foot(btn(t('ui.home'), () => ctx.call('home')), btn(t('ui.again'), () => ctx.call('again'), 'primary')));
}
