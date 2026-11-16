// The Tin strip (SPEC 3.3): the top of the stall. The visiting spirit (mood by Favour), its Favour pips and Regular / Fan lines, one line of market gossip, an optional Favour ask,
// and the tips you can leave. Loved / Hated hints show from the first visit (a first experiment is never punished blind). Ignoring the strip costs zero taps.
// Reads run.tin = { spirit, left, omen (an object per the spirit's omen id, see omenText), demand (an id or null), result: 'met' | 'failed' | null } and run.demand (the ask taken).
// Handlers: offer(kind, size, target?), acceptDemand().
import { t, L, fmt } from '../i18n.js';
import { h, btn, art } from './dom.js';
import { SPIRIT, CHARM, TRICK, SYM, STAKE, BENCH, BOSS } from './content.js';
import { portrait, pips, stageOf } from './cards.js';
import { tasteKey } from './spirit.js';

export const KINDS = ['coins', 'caps', 'spice', 'trick', 'charm', 'curse', 'skip'];
const SIZES = { coins: ['small', 'medium', 'large'], caps: ['small', 'medium', 'large'], spice: ['small', 'medium', 'large'], trick: ['medium'], charm: ['large'], curse: ['medium'], skip: ['small', 'medium'] };
const BASE = { small: 1, medium: 3, large: 6 }, PCT = { small: 4, medium: 10, large: 25 }, CAPS = { small: 1, medium: 2, large: 4 }, SPICE = { small: 1, medium: 3, large: 5 };
const ICON = { coins: 'ui/coin', caps: 'ui/wick', spice: 'ui/heat', trick: 'ui/trick_bag', charm: 'ui/star', curse: 'ui/curse_badge', skip: 'ui/hourglass' };

// What a tip costs: { coins | caps | spice | trick | charm | curse | skip, n }.
export const tipCost = (kind, size, target) => (kind === 'coins' ? Math.ceil(target * PCT[size] / 100) : kind === 'caps' ? CAPS[size] : kind === 'spice' ? SPICE[size] : kind === 'skip' ? (size === 'small' ? 1 : 2) : 1);
// Favour gained: base by size times the taste, rounded up (Hated = Insult).
export const tipFavour = (sp, kind, size) => { const m = sp?.taste?.[kind] ?? 1; return m <= 0 ? null : Math.ceil(BASE[size] * m); };
// The gossip a neighbour passes on: what the core's omen object says, as one plain line.
export function omenText(id, o) {
  if (!o) return '';
  switch (id) {
    case 'nextDebts': return [(o.targets ?? []).map(fmt).join(', '), o.boss && L(BOSS[o.boss]?.name)].filter(Boolean).join(' · ');
    case 'nextOffers': return (o.charms ?? []).map((c) => L(CHARM[c]?.name)).join(', ');
    case 'nextFavs2': return (o.favs ?? []).map((s) => L(SYM[s]?.name)).join(', ');
    case 'benchPrices': return (o.jobs ?? []).map((j) => `${L(BENCH[j.id]?.name)} ${fmt(j.price?.coins ?? 0)}`).join(', ');
    case 'shortfall': return fmt(o.short ?? 0);
    case 'nextTerms': return (o.terms ?? []).map((s) => L(STAKE[s]?.name)).join(', ');
    case 'ashNext': return t('ui.gossipAsh', { n: o.expected ?? 0 });
    case 'scorchOdds': return t('ui.gossipOdds', { a: Math.round((o.perSpin ?? 0) * 100), b: Math.round((o.three ?? 0) * 100) });
    default: return '';
  }
}
export const largestTaste = (sp) => KINDS.reduce((b, k) => ((sp?.taste?.[k] ?? 1) > (sp?.taste?.[b] ?? 1) ? k : b), 'coins');

export function tinStrip(ctx, run, dv) {
  const tin = run.tin;
  const sp = tin && SPIRIT[tin.spirit];
  if (!sp) return null;
  const fav = run.spirits?.[tin.spirit]?.fav | 0, stage = stageOf(fav), left = tin.left ?? 1, target = run.debt | 0;
  const open = ctx.state.tinKind ?? largestTaste(sp);
  const afford = (kind, size) => {
    const n = tipCost(kind, size, target);
    return kind === 'coins' ? (run.purse | 0) >= n : kind === 'caps' ? (run.wick | 0) >= n : kind === 'spice' ? (run.heat | 0) >= n : kind === 'trick' ? (run.tricks ?? []).length > 0 : kind === 'charm' ? (run.charms ?? []).filter((c) => !c.relic).length > 0 : true;
  };
  const why = (kind) => (kind === 'coins' ? 'why.coins' : kind === 'caps' ? 'why.wick' : kind === 'spice' ? 'why.spice' : 'why.nothing');
  const pickOwn = (kind) => ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, t(kind === 'trick' ? 'ui.tipPickTrick' : 'ui.tipPickCharm')),
    h('div', { class: 'cards' }, (kind === 'trick' ? run.tricks.map((id, i) => ({ i, d: TRICK[id] })) : run.charms.map((c, i) => ({ i, d: CHARM[c.id], relic: c.relic }))).filter((e) => e.d && !e.relic).map((e) =>
      h('button', { type: 'button', class: 'card pick', onclick: () => { ctx.closeSheet(); ctx.call('offer', kind, kind === 'trick' ? 'medium' : 'large', e.i); } }, h('span', { class: 'pic' }, art(e.d.icon, 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(e.d.name)))))),
    h('div', { class: 'sheet-acts' }, btn(t('ui.close'), ctx.closeSheet))));
  const give = (kind, size) => {
    if (left < 1) return ctx.toast('ui.tinDone');
    if (!afford(kind, size)) return ctx.toast(why(kind));
    if (kind === 'trick' || kind === 'charm') return pickOwn(kind);
    return ctx.call('offer', kind, size);
  };
  const tasteIcon = (m) => (m >= 2 ? '♥' : m >= 1 ? '·' : m > 0 ? '–' : '✕');
  const omen = omenText(sp.omen, tin.omen), dAsk = tin.demand, dTaken = run.demand?.spirit === tin.spirit ? run.demand.id : null;
  return h('section', { class: 'tin', 'data-anchor': 'tin' },
    h('div', { class: 'tin-head' }, portrait(sp, fav, 'devil'),
      h('div', { class: 'tin-who' }, h('strong', {}, t('ui.tinVisit', { name: L(sp.name) })), h('span', { class: 'note' }, t('ui.stageIs', { stage: t('ui.stageName.' + stage), n: fav })), pips(fav, true))),
    sp.hint && h('p', { class: 'note' }, L(sp.hint)),
    omen && h('p', { class: 'gossip' }, h('b', {}, sp.omen ? t('ui.gossip.' + sp.omen) : t('ui.gossipLabel')), ' ', String(omen)),
    tin.result && h('p', { class: 'note ' + (tin.result === 'met' ? 'good' : 'due-note') }, t(tin.result === 'met' ? 'ui.askMet' : 'ui.askFailed')),
    (dAsk || dTaken) && h('div', { class: 'ask' }, h('span', {}, h('b', {}, t('ui.askLabel')), ' ', t('ui.demand.' + (dAsk ?? dTaken))), dAsk && btn(t('ui.askAccept'), () => ctx.call('acceptDemand'), 'small'), dTaken && h('span', { class: 'tag good' }, t('ui.askOn'))),
    left > 0 ? [
      h('p', { class: 'note' }, t('ui.tinLeft', { n: left })),
      h('div', { class: 'kinds' }, KINDS.map((k) => h('button', { type: 'button', class: 'kind' + (open === k ? ' on' : '') + ((sp.taste?.[k] ?? 1) <= 0 ? ' hated' : (sp.taste?.[k] ?? 1) >= 2 ? ' loved' : ''), 'aria-pressed': String(open === k),
        'aria-label': `${t('ui.kind.' + k)}: ${t(tasteKey(sp.taste?.[k] ?? 1))}`, onclick: () => { ctx.state.tinKind = k; ctx.rerender(); } },
      art(ICON[k], 'ico xs'), h('span', {}, t('ui.kind.' + k)), h('i', { class: 'taste' }, tasteIcon(sp.taste?.[k] ?? 1))))),
      h('div', { class: 'sizes' }, SIZES[open].map((s) => {
        const f = tipFavour(sp, open, s), n = tipCost(open, s, target), ok = afford(open, s);
        const what = open === 'coins' ? fmt(n) : open === 'caps' || open === 'spice' || open === 'skip' ? String(n) : '';
        return h('button', { type: 'button', class: 'btn size' + (ok ? '' : ' dim'), 'data-anchor': `tin.offer.${open}.${s}`, onclick: () => give(open, s) },
          h('span', {}, t('ui.size.' + s), what && ` ${what}`), h('small', {}, f == null ? t('ui.insult') : t('ui.favPlus', { n: f })));
      })),
      h('p', { class: 'note' }, t(tasteKey(sp.taste?.[open] ?? 1)) + ' · ' + t('ui.kindNote.' + open))]
      : h('p', { class: 'note' }, t('ui.tinDone')));
}
