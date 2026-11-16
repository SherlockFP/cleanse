// Ledger: Orhan's book. Installments 1-6 (lite), each with its tier and, once paid, its two-sentence page. data: { save }.
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { tier } from '../core/meta.js';
import { INSTALLMENTS_LITE } from '../core/data/unlocks.js';

export function render(el, { save }, ctx) {
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('orhan', 'ledger'); }
  const rows = Array.from({ length: INSTALLMENTS_LITE }, (_, i) => i + 1).map((n) => {
    const paid = n <= save.paid, now = !paid && n === save.installment;
    return h('li', { class: 'page' + (paid ? ' paid' : now ? ' now' : ' later') },
      h('div', { class: 'page-head' },
        h('strong', {}, t('ui.installment', { n })),
        h('span', { class: 'note' }, t('ui.tier', { n: Math.round(tier(n) * 1000) / 1000 })),
        paid ? h('span', { class: 'stamp won' }, t('ui.paid')) : h('span', { class: 'tag' }, now ? t('ui.ledgerNow') : t('ui.locked2'))),
      paid && h('p', {}, t('beat.' + n)));
  });
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.ledger')), art('orhan/nod', 'deni')),
    h('p', { class: 'sub' }, save.paid >= INSTALLMENTS_LITE ? t('ui.ledgerDone') : t('ui.installmentOf', { n: save.paid + 1, m: INSTALLMENTS_LITE })),
    h('ol', { class: 'pages' }, rows),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')),
  );
}
