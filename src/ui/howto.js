// How to play: 18 cards (SPEC 2.1), one topic each, swipe or scroll. Every card has a picture built live from sprites (so it is right in every language),
// a diagram drawn in code, a title and two sentences. Cards 11 to 18 show a lock and their name until that system was met once (meta.met[key]); no spoilers.
// data: { meta?, card? }: card = index to open on (the Guide buttons in a run open the card of the thing you tapped). The same cards are the Guide.
import { t, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { PATTERNS, CONFIG, CONTRACT } from './content.js'; // the diagram shows the real first debt and night count (AUDIT2 5)

const mini = (cells, on = 'on') => h('span', { class: 'mini', 'aria-hidden': 'true' }, Array.from({ length: 15 }, (_, i) => h('i', { class: cells.includes(i) ? on : '' })));
const lab = (txt) => h('span', { class: 'lc-label' }, txt);
const box = (...kids) => h('div', { class: 'dg' }, kids);
const eq = (parts) => h('div', { class: 'dg eq' }, parts.map((p) => (typeof p === 'string' ? h('span', { class: 'op' }, p) : h('span', { class: 'term' }, h('b', {}, p[0]), lab(p[1])))));
const pips = (n, on, cls = '') => h('span', { class: 'pipsn ' + cls }, Array.from({ length: n }, (_, i) => h('i', { class: i < on ? 'now' : '' })));
const tags = (...xs) => h('span', { class: 'tags' }, xs.map((x) => h('span', { class: 'tag' + (x[1] ? ' ' + x[1] : '') }, x[0])));

// key: the meta.met flag that unlocks a card (null = always open); pics: sprite ids; dg: the code-drawn diagram
// Which systems the player has met, read from the lifetime counters the core keeps (no flags of its own): a card with a key opens the first time its system showed up.
export const metOf = (m = {}) => { const s = m.stats ?? {}, n = (k) => s[k] | 0; return { phone: n('calls') + n('hangUps') > 0, tin: n('offerings') + n('visits') > 0, deal: n('dealsSigned') + n('dealsRefused') > 0, redeye: (m.codex?.redEye | 0) > 0, honk: n('honks') > 0, blender: n('blends') > 0 || n('debtsPaid') >= 2, lockers: (m.lockers ?? []).length > 0 || Object.values(m.keys ?? {}).some((k) => k > 0), map: !!m.stamps?.c1?.bronze, ...m.met }; };
export const CARDS = [
  { key: null, pics: ['devil/idle', 'ui/contract', 'ui/coin'], dg: () => box(h('div', { class: 'meter' }, h('i', { style: 'width:50%' }), h('span', {}, `${fmt(Math.round(CONTRACT.c1.debts[0] / 2))} / ${fmt(CONTRACT.c1.debts[0])}`)), h('span', { class: 'goal-row' }, h('b', {}, t('ui.debtOf', { n: 1, m: CONTRACT.c1.debts.length })), h('span', {}, t('ui.nightOf', { n: 1, m: CONTRACT.c1.rounds })))) },
  { key: null, pics: ['machine/lever'], dg: () => box(mini(Array.from({ length: 15 }, (_, i) => i)), h('span', { class: 'arrow' }, '↓')) },
  { key: null, pics: ['sym/moth', 'sym/moth', 'sym/moth'], dg: () => h('div', { class: 'minis' }, PATTERNS.map((p) => h('span', { class: 'mp' }, mini(p.cells[0]), h('b', {}, '×' + fmt(p.mult))))) },
  { key: null, pics: ['sym/key', 'ui/star'], dg: () => eq([['3', t('ui.hcValue')], '×', ['1', t('ui.hcSym')], '×', ['2', t('ui.hcShape')], '=', ['6', t('ui.hcPays')]]) },
  { key: null, pics: ['ui/favour', 'ui/luck'], dg: () => eq([[t('ui.hcWeight'), t('ui.fav')], '×', ['1 + ' + t('ui.luck'), t('ui.luck')]]) },
  { key: null, pics: ['ui/heat', 'sym/ash', 'sym/ash', 'sym/ash'], dg: () => box(h('span', { class: 'heat' }, h('span', { class: 'segs' }, Array.from({ length: CONFIG.heat.max }, (_, i) => h('i', { class: i < 4 ? 'on' : '' })))), tags(['+20% / ' + t('ui.heat')], [t('ui.hcSoot3'), 'bad'])) },
  { key: null, pics: ['machine/kiosk', 'ui/interest'], dg: () => box(tags([`${CONFIG.interest.basePct}% ${t('ui.hcOfBanked')}`], [t('ui.hcMax', { n: CONFIG.interest.capPctOfDebt }), 'good']), h('span', { class: 'lchip kiosk' }, h('span', { class: 'lc-top' }, art('ui/interest', 'ico xs'), h('b', {}, '60'), h('em', {}, '+5')), lab(t('ui.kiosk')))) },
  { key: null, pics: ['trick/hourglass', 'devil/collect'], dg: () => box(pips(3, 2), tags([t('ui.hcJar'), 'bad'])) },
  { key: null, pics: ['bg/wagon', 'charm/moth_jar', 'ui/rarity_rare'], dg: () => box(tags([t('ui.rarity.common')], [t('ui.rarity.uncommon'), 'good'], [t('ui.rarity.rare'), 'rare'], [t('ui.rarity.legendary'), 'leg']), tags([`${t('ui.hcSet')} 2/3`, 'good'])) },
  { key: null, pics: ['ui/trick_bag', 'trick/nudge'], dg: () => box(tags([t('ui.whenPre'), 'good'], ['→'], [t('ui.hcSpinWord')], ['→'], [t('ui.whenPost'), 'good'])) },
  { key: 'phone', pics: ['ui/phone', 'spirit/beckon_calm', 'spirit/gold_calm'], dg: () => box(tags([t('ui.card.green'), 'good'], [t('ui.card.red'), 'bad'], [t('ui.card.white')]), h('span', { class: 'pips big' }, Array.from({ length: 10 }, (_, i) => h('i', { class: 'on' + ([1, 4, 7].includes(i) ? ' mark' : '') })))) },
  { key: 'tin', pics: ['hide/keepsake', 'ui/favour_pip'], dg: () => h('div', { class: 'dg' }, tags([`${t('ui.size.small')} +1`], [`${t('ui.size.medium')} +3`], [`${t('ui.size.large')} +6`]), tags([t('ui.tasteLoved') + ' ×2', 'good'], [t('ui.tasteFine') + ' ×1'], [t('ui.tasteMeh') + ' ×½'], [t('ui.tasteHated'), 'bad'])) },
  { key: 'deal', pics: ['devil/deal', 'ui/curse_badge'], dg: () => box(h('div', { class: 'deal-sides' }, h('div', { class: 'side boon' }, lab(t('ui.youGet')), h('b', {}, '+')), h('div', { class: 'side bane' }, lab(t('ui.youCarry')), h('b', {}, '−')))) },
  { key: 'redeye', pics: ['sym/redeye', 'sym/redeye', 'sym/redeye'], dg: () => box(tags([t('ui.redEyeL1')], [t('ui.redEyeL2'), 'bad'], [t('ui.redEyeL3'), 'bad']), h('span', { class: 'rb redeye' }, art('sym/redeye', 'ico xs'), t('ui.redEyeGauge', { n: '2.0' }))) },
  { key: 'honk', pics: ['ui/honk', 'ui/charge_on', 'ui/charge_off'], dg: () => box(h('span', { class: 'charges' }, ['ui/charge_on', 'ui/charge_on', 'ui/charge_off'].map((i) => art(i, 'ico sm'))), tags(['+1 / ' + t('ui.hcNight')])) },
  { key: 'blender', pics: ['machine/blender'], dg: () => eq([['A', ''], '+', ['B', ''], '=', ['C', '']]) },
  { key: 'lockers', pics: ['ui/key_brass', 'ui/locker_shut', 'ui/luggage'], dg: () => box(['brass', 'silver', 'red'].map((k) => h('span', { class: 'chip key-' + k }, art('ui/key_' + k, 'ico xs'), h('b', {}, t('ui.key.' + k))))) },
  { key: 'map', pics: ['bg/map', 'ui/stamp_gold'], dg: () => box(['bronze', 'silver', 'gold'].map((k) => h('span', { class: 'stampl' }, art('ui/stamp_' + k, 'ico sm'), lab(t('ui.hcStamp.' + k))))) },
];

export function render(el, data, ctx) {
  const met = metOf(data.meta);
  let i = ctx.state.card ?? data.card ?? 0;
  const open = (c) => c.key == null || !!met[c.key];
  const go = (n) => { ctx.state.card = Math.max(0, Math.min(CARDS.length - 1, n)); ctx.rerender(); };
  i = Math.max(0, Math.min(CARDS.length - 1, i));
  const c = CARDS[i], n = i + 1, ok = open(c);
  put(el,
    h('div', { class: 'row-between' }, h('h2', {}, t('ui.howTitle')), h('span', { class: 'note' }, `${n} / ${CARDS.length}`)),
    h('article', { class: 'hcard' + (ok ? '' : ' shut'), 'data-anchor': 'howto.card' },
      h('div', { class: 'hc-pics' }, c.pics.map((p) => art(p, 'hc-ico'))),
      h('h3', {}, ok ? t(`ui.hc.${n}.title`) : [art('ui/lock', 'ico xs'), ' ', t(`ui.hc.${n}.title`)]),
      ok ? [h('p', { class: 'fx big' }, t(`ui.hc.${n}.text`)), c.dg()] : h('p', { class: 'note' }, t('ui.hcLocked'))),
    h('div', { class: 'dots', role: 'tablist' }, CARDS.map((x, k) => h('button', { type: 'button', class: 'dot' + (k === i ? ' on' : '') + (open(x) ? '' : ' shut'), role: 'tab', 'aria-selected': String(k === i), 'aria-label': String(k + 1), onclick: () => go(k) }))),
    ctx.foot(btn(t('ui.back'), () => (i > 0 ? go(i - 1) : ctx.close()), 'ghost'), i < CARDS.length - 1 ? btn(t('ui.next'), () => go(i + 1), 'primary') : btn(t('ui.close'), ctx.close, 'primary')));
}
