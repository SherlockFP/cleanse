// The Pawn: short at the deadline, Brimble offers one more night for one burned charm and a random curse (once per run).
// data: { run }. Handlers: pawn(charmIndex), declinePawn().
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARM } from './content.js';
import { itemCard } from './cards.js';
import { model } from './model.js';

export function render(el, { run }, ctx) {
  const m = model(run, ctx.derive(run)), mine = run.charms ?? [];
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'pawn'); }
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.pawnTitle')), art('devil/idle', 'devil')),
    h('p', { class: 'sub' }, t('ui.pawnSub')),
    h('p', { class: 'note' }, t('ui.lostShort', { n: m.left })),
    mine.length ? h('div', { class: 'cards' }, mine.map((c, i) => CHARM[c.id] && itemCard('charm', CHARM[c.id], { S: m.scale },
      h('button', { type: 'button', class: 'btn warn', onclick: () => ctx.call('pawn', i) }, t('ui.pawnBurn')))))
      : h('p', { class: 'note' }, t('ui.pawnNone')),
    ctx.foot(btn(t('ui.pawnDecline'), () => ctx.call('declinePawn'), 'ghost')));
}
