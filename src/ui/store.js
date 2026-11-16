// Store: the purchases of the soft-launch build, with the store's price. On the web every purchase is a labelled test (services/iap.js).
// Nothing here is a spin, a peg, a coin or a random item.
import { t } from '../i18n.js';
import { h, btn, put } from './dom.js';
import { getProducts, purchase, restore } from '../services/iap.js';

const WHY = { needs_remove_ads: 'iap.needsRemoveAds', use_upgrade: 'iap.useUpgrade' };

export function render(el, data, ctx) {
  const st = ctx.state;
  const load = () => getProducts().then((p) => { st.products = p; ctx.rerender(); });
  if (!st.products && !st.loading) { st.loading = true; load(); }
  const buy = async (id) => {
    const r = await purchase(id);
    if (r.ok) load(); else if (r.reason !== 'cancelled') ctx.toast(WHY[r.reason] ?? 'iap.failed');
  };
  const back = async () => {
    const r = await restore();
    ctx.toast(r.restored.length ? 'iap.restored' : 'iap.restoreNone', { n: r.restored.length });
    load();
  };
  put(el,
    h('h2', {}, t('ui.store')),
    h('div', { class: 'cards' }, (st.products ?? []).map((p) => h('article', { class: 'card' + (p.owned ? ' sold' : '') },
      h('div', { class: 'card-text' }, h('strong', {}, t(`store.${p.id}.name`)), h('span', { class: 'fx' }, t(`store.${p.id}.desc`))),
      p.owned ? h('span', { class: 'sold-mark' }, t('iap.owned'))
        : h('button', { type: 'button', class: 'btn buy ' + (p.canBuy ? 'primary' : 'dim'), 'aria-label': `${t('iap.buy')} ${p.price}`, onclick: () => buy(p.id) }, p.price)))),
    !st.products && h('p', { class: 'note' }, t('ui.loading')),
    h('p', { class: 'note' }, t('iap.fixedNote')),
    btn(t('iap.restore'), back),
    h('p', { class: 'note' }, t('iap.restoreNote')),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')),
  );
}
