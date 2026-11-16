// Shop: offers with printed odds, buy / sell / reroll / lock / remove, trinket inspect on tap.
// data: { run }. All rules and prices come from core/shop.js. Handlers: changed(run, action, res) after each core call, leaveShop() on Continue.
import { t } from '../i18n.js';
import { h, pct, btn, put } from './dom.js';
import { rollShop, effectiveOdds, priceOf, buyOffer, sellTrinket, removeToken, reroll, lockOffer } from '../core/shop.js';
import { chartOf } from '../core/run.js';
import { TRINKETS } from '../core/data/trinkets.js';
import { SYMBOLS } from '../core/data/symbols.js';
import { PRICES } from '../core/econ.js';
import { renderBagList, symText } from './bag.js';

const TR = new Map(TRINKETS.map((x) => [x.id, x]));
const SYM = new Map(SYMBOLS.map((x) => [x.id, x]));

// What a failed core call says to the player. Keys are core's reason strings.
const REASON = { coins: 'ui.notEnough', 'shelf full': 'ui.shelfFull', cap: 'ui.atCap', 'bag minimum': 'ui.bagMinN' };

// Sell value for the button. Mirrors core listTrinket / PRICES.sellDiv (core does not export it); the real coins come back from sellTrinket.
const sellValue = (run, grade) => Math.floor(Math.max(1, Math.round(PRICES.trinket[grade - 1] * (chartOf(run).trinketPriceMul ?? 1))) / PRICES.sellDiv);

// A card or sheet described the same way for trinkets and tokens.
function describe(run, o) {
  if (o.kind === 'trinket') {
    const d = TR.get(o.id);
    return { name: t(d.nameKey), tag: t('ui.grade', { n: o.grade ?? d.grade }), short: t(d.shortKey), full: t(d.descKey), grade: o.grade ?? d.grade };
  }
  const d = SYM.get(o.sym);
  return { name: t(d.nameKey), tag: t('ui.token'), short: symText(d), full: symText(d) };
}

export function render(el, { run }, ctx) {
  const s = rollShop(run), st = ctx.state;
  if (st.visit !== s.visit) { st.visit = s.visit; ctx.say('deni', 'shop_enter'); }
  const act = (action, res, say) => {
    if (res.ok) { ctx.h.changed?.(run, action, res); if (say) ctx.say('deni', say); }
    else { ctx.toast(REASON[res.reason] ?? 'ui.notEnough', { n: PRICES.bagMin }); if (res.reason === 'coins') ctx.say('deni', 'shop_broke'); }
    st.sheet = null; st.picking = false;
    ctx.rerender();
  };
  const priceTag = (n) => t('ui.price', { n });

  // ---- inspect sheet ----
  const sheet = () => {
    const x = st.sheet;
    if (!x) return null;
    const own = x.slot != null, o = own ? { kind: 'trinket', id: run.trinkets[x.slot]?.id } : s.offers[x.i];
    if (!o || (own && !o.id)) return null;
    const d = describe(run, o);
    const acts = own
      ? [btn(t('ui.sell', { n: sellValue(run, d.grade) }), () => act('sell', sellTrinket(run, x.slot)), 'warn')]
      : o.sold ? [] : [btn(`${t('ui.buy')} - ${priceTag(priceOf(run, o))}`, () => act('buy', buyOffer(run, x.i), 'shop_buy'), 'primary')];
    return h('div', { class: 'sheet', role: 'dialog', 'aria-label': d.name },
      h('span', { class: 'tag' }, d.tag), h('h3', {}, d.name), h('p', {}, d.full), acts,
      btn(t('ui.close'), () => { st.sheet = null; ctx.rerender(); }));
  };

  // ---- offers ----
  const offer = (o, i) => {
    if (!o) return null;
    const d = describe(run, o), price = priceOf(run, o), kept = s.lock === i;
    return h('article', { class: 'card' + (o.sold ? ' sold' : '') + (kept ? ' kept' : '') },
      h('button', { type: 'button', class: 'card-main', onclick: () => { st.sheet = { i }; ctx.rerender(); } },
        h('span', { class: 'tag' }, d.tag), h('strong', {}, d.name), h('span', { class: 'fx' }, d.short)),
      o.sold ? h('span', { class: 'sold-mark' }, t('ui.sold')) : [
        btn(`${t('ui.buy')} ${priceTag(price)}`, () => act('buy', buyOffer(run, i), 'shop_buy'), 'primary' + (run.jar < price ? ' dim' : '')),
        btn(kept ? t('ui.unlock') : t('ui.lock'), () => act('lock', lockOffer(run, i)), 'quiet' + (kept ? ' on' : '')),
      ]);
  };

  // ---- printed odds, straight from core effectiveOdds ----
  const eo = effectiveOdds(run), kind = pct([eo.trinket, eo.token]), grades = pct(eo.grades);
  const odds = h('section', { class: 'odds' },
    h('h3', {}, t('ui.shopOdds')),
    h('p', { class: 'note' }, t('ui.shopOddsNote')),
    h('p', {}, t('ui.oddsKind', { a: kind[0], b: kind[1] })),
    h('ul', { class: 'grades' }, grades.map((p, g) => h('li', {}, t('ui.oddsGrade', { n: g + 1, p })))));

  const rrPrice = priceOf(run, { kind: 'reroll' }), rmPrice = priceOf(run, { kind: 'removal' });
  const shelf = run.trinkets.map((x, slot) => {
    const d = describe(run, { kind: 'trinket', id: x.id });
    return h('li', {}, h('button', { type: 'button', class: 'chip', onclick: () => { st.sheet = { slot }; ctx.rerender(); } }, h('strong', {}, d.name), h('span', {}, d.short)));
  });

  if (st.picking) {
    put(el, h('h2', {}, t('ui.removeToken', { n: '' }).trim()), h('p', { class: 'sub' }, t('ui.removePick')),
      renderBagList(run, (id) => act('remove', removeToken(run, id), 'remove_token')),
      btn(t('ui.back'), () => { st.picking = false; ctx.rerender(); }));
    return;
  }
  put(el, 
    h('h2', {}, t('ui.shop')),
    h('p', { class: 'sub' }, `${t('ui.jar')}: ${run.jar}`),
    h('div', { class: 'cards' }, s.offers.map(offer)),
    h('div', { class: 'row2' },
      btn(rrPrice ? t('ui.reroll', { n: rrPrice }) : t('ui.rerollFree'), () => act('reroll', reroll(run)), run.jar < rrPrice ? 'dim' : ''),
      btn(rmPrice ? t('ui.removeToken', { n: rmPrice }) : t('ui.removeFree'), () => { st.picking = true; ctx.rerender(); }, run.jar < rmPrice ? 'dim' : '')),
    h('h3', {}, t('ui.shelf')),
    shelf.length ? h('ul', { class: 'chips' }, shelf) : h('p', { class: 'note' }, t('ui.emptyPlace')),
    odds,
    h('p', { class: 'note' }, t('ui.jarCarries')),
    h('p', { class: 'note' }, t('ui.noRealMoney')),
    btn(t('ui.continue'), () => { ctx.close(); ctx.h.leaveShop?.(); }, 'primary'),
    sheet(),
  );
}
