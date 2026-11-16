// The Kiosk sheet: balance, tonight's interest, rate and cap in plain numbers; +25%, +half, ALL and hold-to-pour (no slider); PAY NOW when the balance covers the debt.
// ctx: { call, sheet, closeSheet, toast, run, derive }. Handlers: bank(amount), payNow(). Banked coins count toward the debt, earn interest and never burn.
import { t, fmt } from '../i18n.js';
import { h, art, btn, put, clear } from './dom.js';
import { model } from './model.js';

export function kioskSheet(ctx, m0) {
  const box = h('section', { class: 'sheet-card kiosk', role: 'dialog', 'aria-modal': 'true' });
  let timer = 0;
  const stop = () => { clearInterval(timer); timer = 0; };
  const live = () => model(ctx.run, ctx.derive(ctx.run));
  const put1 = (n) => { const m = live(); n = Math.max(0, Math.min(m.purse, Math.floor(n))); if (n < 1) { stop(); return ctx.toast('ui.bankNone'); } ctx.call('bank', n); paint(); return undefined; };

  function paint() {
    const m = live(), k = m.kiosk, nothing = m.purse < 1;
    const amt = (label, n, anchor) => h('button', { type: 'button', class: 'btn' + (nothing ? ' dim' : ''), 'data-anchor': anchor, onclick: () => put1(n) }, label);
    clear(box);
    put(box,
      h('div', { class: 'sheet-head' }, art('machine/kiosk', 'devil'), h('div', {}, h('h2', {}, t('ui.kioskTitle')), h('p', { class: 'note' }, t('ui.kioskSub')))),
      h('div', { class: 'kiosk-screen' },
        h('div', {}, h('span', { class: 'lc-label' }, t('ui.kBalance')), h('b', { class: 'big-num' }, fmt(k.balance))),
        h('div', { 'data-anchor': 'kiosk.forecast' }, h('span', { class: 'lc-label' }, t('ui.kTonight')), h('b', { class: 'big-num' }, '+' + fmt(k.tonight))),
        h('div', {}, h('span', { class: 'lc-label' }, t('ui.kRate')), h('b', {}, k.rate + '%')),
        h('div', {}, h('span', { class: 'lc-label' }, t('ui.kCap')), h('b', {}, fmt(k.cap)))),
      h('p', { class: 'note' }, t('ui.kioskRule', { rate: k.rate, cap: fmt(k.cap) })),
      h('p', { class: 'owed' }, t('ui.owedLeft', { n: fmt(m.left) }), ' · ', t('ui.kPurse', { n: fmt(m.purse) })),
      h('div', { class: 'row-wrap' }, amt('+25%', m.purse * 0.25, 'kiosk.q'), amt(t('ui.bankHalf'), m.purse / 2, 'kiosk.half'), amt(t('ui.bankAll'), m.purse, 'kiosk.all')),
      holdPour(m),
      m.payNow && btn(t('ui.payNow'), () => { stop(); ctx.closeSheet(); ctx.call('payNow'); }, 'primary stampbtn'),
      h('div', { class: 'sheet-acts' }, btn(t('ui.close'), () => { stop(); ctx.closeSheet(); })));
  }

  // Hold: a small stream of coins (5% of the purse a tick) until released.
  function holdPour(m) {
    const b = h('button', { type: 'button', class: 'btn pour' + (m.purse < 1 ? ' dim' : '') }, art('ui/coin', 'ico xs'), t('ui.pour'));
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); stop(); put1(Math.max(1, Math.ceil(live().purse * 0.05))); timer = setInterval(() => put1(Math.max(1, Math.ceil(live().purse * 0.05))), 150); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, stop);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    return b;
  }

  paint();
  (ctx.openNode ?? ctx.sheet)(box);
  ctx.event?.('kioskOpen');
}
