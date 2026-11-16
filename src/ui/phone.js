// The phone (SPEC 3.4): rings at the start of every debt from debt 2. 3 cards (4 with a perk): Mr. Ruby's is always red, the rest are green (a neighbour's favour,
// safe) or red (a strong deal with a price). Pick one or hang up. After 3 refusals the next call is white: one neighbour alone, 3 white cards.
// data: { run } with run.callOffer = { cards, rerolls, sawRed, white }; card = { spirit, color: 'green' | 'red' | 'white', id (gift, red call or white card id), ruby? }.
// Handlers: callPick(i) (Ruby's card opens the deal screen), callReroll(), hangUp(), lookRed(i) (the player opened a red sheet: a hang-up now lights a bead).
// derive(run).callRerollCost is the core's price of a reroll.
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { SPIRIT, CURSE } from './content.js';
import { portrait, textOf, pips } from './cards.js';

export const cardsOf = (run) => run.callOffer?.cards ?? [];
const isWhite = (run) => !!run.callOffer?.white;
const giftOf = (sp, c) => sp?.gifts?.find((g) => g.id === c.id) ?? sp?.gifts?.[0];
const whiteOf = (sp, c) => sp?.white?.find((w) => w.id === c.id) ?? sp?.white?.[0];

// "You get / You carry / Due" lines of a red call.
function redLines(sp, S) {
  const r = sp?.red ?? {}, curse = CURSE[r.curse ?? sp?.ownCurse];
  return h('div', { class: 'deal-sides' },
    h('div', { class: 'side boon' }, h('span', { class: 'lbl' }, t('ui.youGet')), h('span', { class: 'fx' }, r.deals ? t('ui.rubyDeals') : textOf(r, r.boon, S))),
    h('div', { class: 'side bane' }, h('span', { class: 'lbl' }, t('ui.youCarry')),
      curse ? [h('strong', {}, L(curse.name)), h('span', { class: 'fx' }, L(curse.text))] : h('span', { class: 'fx' }, t(r.deals ? 'ui.rubyCurse' : 'ui.noCarry')),
      r.due && h('span', { class: 'note due-note' }, t('ui.dueLine', { n: r.due.rounds }), ' ', textOf(null, r.due.else, S))));
}

export function redSheet(ctx, run, c, i, S) {
  const sp = SPIRIT[c.spirit];
  ctx.h.lookRed?.(i);
  ctx.openNode(h('section', { class: 'sheet-card red', role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'sheet-head' }, portrait(sp, run.spirits?.[c.spirit]?.fav | 0, 'devil'), h('div', {}, h('h2', {}, L(sp?.red?.name) || L(sp?.name)), h('p', { class: 'note' }, L(sp?.name)))),
    redLines(sp, S),
    h('div', { class: 'sheet-acts' }, btn(t('ui.back'), ctx.closeSheet), btn(t('ui.take'), () => { ctx.closeSheet(); ctx.call('callPick', i); }, 'primary'))));
}

export function render(el, { run }, ctx) {
  const dv = ctx.derive(run), S = dv.scale ?? 1, cards = cardsOf(run), white = isWhite(run), co = run.callOffer ?? {};
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', white ? 'hangup' : 'call'); }
  const cost = dv.callRerollCost ?? 1 + (co.rerolls | 0);
  const card = (c, i) => {
    const sp = SPIRIT[c.spirit], fav = run.spirits?.[c.spirit]?.fav | 0, ruby = !!c.ruby || c.spirit === 'brimble';
    const color = white ? 'white' : c.color ?? (ruby ? 'red' : 'green'), g = color === 'green' ? giftOf(sp, c) : null, w = color === 'white' ? whiteOf(sp, c) : null;
    const body = color === 'green' ? h('span', { class: 'fx big' }, textOf(g, g?.effects, S))
      : color === 'white' ? h('span', { class: 'fx big' }, textOf(w, w?.effects, S)) : h('span', { class: 'fx' }, ruby ? t('ui.rubyDeals') : textOf(sp?.red, sp?.red?.boon, S));
    // a red card is read before it is taken: Ruby's opens the deal screen (Back returns here), the others a sheet
    const act = () => { if (color !== 'red') return ctx.call('callPick', i); if (ruby) { ctx.h.lookRed?.(i); return ctx.call('callPick', i); } return redSheet({ ...ctx, run }, run, c, i, S); };
    return h('button', { type: 'button', class: 'call-card ' + color, 'data-anchor': 'call.card:' + c.spirit, onclick: act },
      portrait(sp, fav, 'face lgp'),
      h('div', { class: 'cc-text' }, h('strong', {}, L(sp?.name) || c.spirit), h('span', { class: 'tag ' + color }, t('ui.card.' + color)), pips(fav), body),
      h('span', { class: 'cc-go' }, t(color === 'red' ? 'ui.look' : 'ui.take')));
  };
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t(white ? 'ui.whiteCall' : 'ui.callTitle')), art(white ? 'ui/white_call' : 'devil/phone', 'devil')),
    h('p', { class: 'sub' }, t(white ? 'ui.whiteSub' : 'ui.callSub')),
    h('div', { class: 'beadrow', 'aria-label': t('ui.beads') }, Array.from({ length: 3 }, (_, i) => art(i < (run.beads | 0) ? 'ui/bead_on' : 'ui/bead_off', 'ico sm')), h('span', { class: 'note' }, t('ui.beadsNote'))),
    h('div', { class: 'cards calls' }, cards.map(card)),
    ctx.foot(btn(t('ui.hangUp'), () => ctx.call('hangUp'), 'ghost'),
      !white && btn(cost > 0 ? t('ui.rerollCaps', { n: cost }) : t('ui.rerollFree'), () => ((run.wick | 0) >= cost ? ctx.call('callReroll') : ctx.toast('why.wick')), 'warn')));
}
