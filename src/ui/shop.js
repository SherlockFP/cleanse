// The stall: the Tin strip on top, then tabs Charms, Cart (one pattern or symbol upgrade for the run), Tricks, Bench, Blender.
// data: { run, offers: { charms[], tricks[], bench[], cart[] } } (offer = id or { id, locked, sold }; cart offer = run.shop.upgrades[i] = { kind: 'pattern', pattern } | { kind: 'weight', sym }).
// A bought upgrade is a run.perm rule with src.kind 'cart' (patMult n on a pattern): the multiplier shown is the shape's base plus those.
// Extra handlers: buyCart(i), blendPreview(a, b), blend(a, b, pickId), offer(kind, size, target), acceptDemand(); price(item, 'cart').
// Handlers: buyCharm(i) sellCharm(slot) moveCharm(from,to) buyTrick(i) bench(i,target) buySlot() reroll() lock(i) leaveShop(),
// price(item, kind) -> { coins?, wick? } (kind: charm | sell | trick | bench | slot | reroll), watchAd('shop_reroll'), adReady(placement).
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARM, TRICK, BENCH, SYM, CURSE, CONFIG, PATTERNS } from './content.js';
import { tinStrip } from './tin.js';
import { blenderTab } from './blender.js';
import { model } from './model.js';
import { itemCard, priceChip, pic, chip } from './cards.js';

const idOf = (o) => (typeof o === 'string' ? o : o?.id);

export function render(el, { run, offers }, ctx) {
  const m = model(run, ctx.derive(run)), S = m.scale, tab = ctx.state.tab ?? 'charms';
  const of = offers ?? run.shop ?? {};
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('pip', 'shop'); }

  // Core price when the glue gives one, else the list price times the debt scale.
  const base = (item, kind) => {
    const p = item.price ?? {};
    return { ...(p.coins != null && { coins: p.coins * S }), ...(p.wick != null && { wick: p.wick }) };
  };
  const price = (item, kind) => ctx.h.price?.(item, kind) ?? (kind === 'sell' ? halve(base(item)) : kind === 'slot' ? { wick: CONFIG.shop.slotPriceWick } : kind === 'reroll' ? { coins: CONFIG.shop.rerollBase * S } : base(item));
  const halve = (p) => ({ ...(p.coins != null && { coins: Math.floor(p.coins * CONFIG.shop.sellPct / 100) }), ...(p.wick != null && { wick: Math.floor(p.wick * CONFIG.shop.sellPct / 100) }) });
  const can = (p) => (p.coins == null || m.purse >= p.coins) && (p.wick == null || m.wick >= p.wick);
  const why = (p) => (p.coins != null && m.purse < p.coins ? 'why.coins' : 'why.wick');
  const buyBtn = (p, fn, anchor) => h('button', { type: 'button', class: 'btn buy ' + (can(p) ? 'primary' : 'dim'), 'data-anchor': anchor, onclick: () => (can(p) ? fn() : ctx.toast(why(p))) }, t('ui.buy'));
  const sellLabel = (p) => t('ui.sell', { n: p.coins != null ? fmt(p.coins) : `${fmt(p.wick ?? 0)} ${t('ui.wick')}` });

  const picker = (title, entries, pick) => ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' },
    h('h2', {}, title),
    entries.length ? h('div', { class: 'cards' }, entries.map((e) => h('button', { type: 'button', class: 'card pick', onclick: () => { ctx.closeSheet(); pick(e.id); } },
      h('span', { class: 'pic' }, art(e.icon, 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, e.label), e.sub && h('span', { class: 'fx' }, e.sub)))))
      : h('p', { class: 'note' }, t('ui.noCurses')),
    h('div', { class: 'sheet-acts' }, btn(t('ui.close'), ctx.closeSheet))));

  const charmsTab = () => {
    const list = (of.charms ?? []).map((o, i) => {
      const c = CHARM[idOf(o)];
      if (!c) return null;
      const sold = !!o.sold, p = price(c, 'charm'), locked = !!o.locked;
      return itemCard('charm', c, { S, price: sold ? null : p, cls: sold ? 'sold' : '' },
        sold ? h('span', { class: 'sold-mark' }, t('ui.sold')) : buyBtn(p, () => ctx.call('buyCharm', i), 'stall.charm:' + i),
        !sold && h('button', { type: 'button', class: 'btn small' + (locked ? ' on' : ''), 'aria-pressed': String(locked),
          onclick: () => (m.noLock ? ctx.toast('why.noLock') : ctx.call('lock', i)) }, art('ui/lock', 'ico xs'), locked ? t('ui.unlock') : t('ui.lock')));
    });
    const mine = run.charms ?? [], slots = run.slots ?? 5;
    return [
      h('div', { class: 'cards' }, list.some(Boolean) ? list : h('p', { class: 'note' }, t('ui.shopEmpty'))),
      h('section', {}, h('h3', {}, t('ui.yourCharms', { n: mine.length, m: slots })), h('p', { class: 'note' }, t('ui.orderNote')),
        h('div', { class: 'cards' }, mine.map((c, slot) => {
          const d = CHARM[c.id];
          if (!d) return null;
          return h('article', { class: 'card charm r-' + d.rarity }, pic(d.icon, d.rarity),
            h('div', { class: 'card-text' }, h('strong', {}, L(d.name)), h('span', { class: 'fx' }, t('ui.sellFor', { n: sellLabelOnly(price(d, 'sell')) }))),
            h('div', { class: 'card-act row' },
              h('button', { type: 'button', class: 'btn small' + (slot === 0 ? ' dim' : ''), 'aria-label': t('ui.moveLeft'), onclick: () => slot > 0 && ctx.call('moveCharm', slot, slot - 1) }, '‹'),
              h('button', { type: 'button', class: 'btn small' + (slot === mine.length - 1 ? ' dim' : ''), 'aria-label': t('ui.moveRight'), onclick: () => slot < mine.length - 1 && ctx.call('moveCharm', slot, slot + 1) }, '›'),
              h('button', { type: 'button', class: 'btn small', onclick: () => ctx.call('sellCharm', slot) }, sellLabel(price(d, 'sell')))));
        }))),
      h('section', {}, h('div', { class: 'card slotbuy' }, art('ui/slot_empty', 'ico lg'),
        h('div', { class: 'card-text' }, h('strong', {}, t('ui.slotBuy')), h('span', { class: 'fx' }, t('ui.slotText'))),
        h('div', { class: 'card-act' }, priceChip(price({}, 'slot')), buyBtn(price({}, 'slot'), () => ctx.call('buySlot'))))),
    ];
  };
  const sellLabelOnly = (p) => (p.coins != null ? fmt(p.coins) : `${fmt(p.wick ?? 0)} ${t('ui.wick')}`);

  const tricksTab = () => h('div', { class: 'cards' }, (of.tricks ?? []).map((o, i) => {
    const d = TRICK[idOf(o)];
    if (!d) return null;
    const p = price(d, 'trick');
    return itemCard('trick', d, { S, price: p, cls: o.sold ? 'sold' : '' }, o.sold ? h('span', { class: 'sold-mark' }, t('ui.sold')) : buyBtn(p, () => ctx.call('buyTrick', i)));
  }));

  const benchTab = () => {
    const symbols = () => Object.values(SYM).filter((s) => s.kind === 'score' && !(run.removed ?? []).includes(s.id))
      .map((s) => ({ id: s.id, icon: s.icon, label: L(s.name), sub: t('ui.symVal', { v: s.value }) }));
    const curses = () => (run.curses ?? []).map((id) => ({ id, icon: CURSE[id]?.icon, label: L(CURSE[id]?.name), sub: L(CURSE[id]?.text) }));
    return [h('p', { class: 'note' }, t('ui.benchNote')), h('div', { class: 'cards' }, (of.bench ?? []).map((o, i) => {
      const d = BENCH[idOf(o)];
      if (!d) return null;
      const p = price(d, 'bench');
      const go = () => (d.id === 'lift' ? picker(t('ui.benchCurse'), curses(), (id) => ctx.call('bench', i, id)) : picker(t('ui.benchSymbol'), symbols(), (id) => ctx.call('bench', i, id)));
      return h('article', { class: 'card bench' + (o.sold ? ' sold' : '') }, h('span', { class: 'pic' }, art('trick/kit', 'ico lg')),
        h('div', { class: 'card-text' }, h('strong', {}, L(d.name)), h('span', { class: 'fx' }, L(d.text))),
        h('div', { class: 'card-act' }, !o.sold && priceChip(p), o.sold ? h('span', { class: 'sold-mark' }, t('ui.sold')) : buyBtn(p, go)));
    }))];
  };

  // Cart upgrades: raise one pattern's multiplier by 1 for the run, or make one symbol land more often. The build decision of the stall.
  const cartTab = () => [h('p', { class: 'note' }, t('ui.cartNote')), h('div', { class: 'cards' }, (of.cart ?? []).map((o, i) => {
    const pat = o.kind === 'pattern' ? PATTERNS.find((p) => p.id === o.pattern) : null, sym = o.kind === 'weight' ? SYM[o.sym] : null;
    if (!pat && !sym) return null;
    const p = price(o, 'cart'), now = pat ? pat.mult + (run.perm ?? []).filter((r) => r.src?.kind === 'cart' && r.pattern === pat.id && r.type === 'patMult').reduce((n, r) => n + r.n, 0) : 0;
    return h('article', { class: 'card cart' + (o.sold ? ' sold' : '') }, h('span', { class: 'pic' }, pat ? h('span', { class: 'mini big', 'aria-hidden': 'true' }, Array.from({ length: 15 }, (_, k) => h('i', { class: pat.cells[0].includes(k) ? 'on' : '' }))) : art(sym.icon, 'ico lg')),
      h('div', { class: 'card-text' }, h('strong', {}, L((pat ?? sym).name)), h('span', { class: 'fx' }, pat ? t('ui.cartPat', { a: fmt(now), b: fmt(now + 1) }) : t('ui.cartWeight', { name: L(sym.name) }))),
      h('div', { class: 'card-act' }, !o.sold && priceChip(p), o.sold ? h('span', { class: 'sold-mark' }, t('ui.sold')) : buyBtn(p, () => ctx.call('buyCart', i), 'stall.cart:' + i)));
  }))];
  const rr = price({}, 'reroll');
  const tabs = [['charms', 'ui.tabCharms'], ['cart', 'ui.tabCart'], ['tricks', 'ui.tabTricks'], ['bench', 'ui.tabBench'], ...(m.debt >= 2 || ctx.derive(run).blender ? [['blender', 'ui.tabBlender']] : [])];
  const tin = tinStrip({ ...ctx, run }, run, ctx.derive(run));
  put(el,
    h('h2', {}, t('ui.wagon')),
    h('div', { class: 'chips' }, chip('ui/coin', fmt(m.purse), 'purse'), chip('ui/wick', fmt(m.wick))),
    tin,
    h('div', { class: 'seg', role: 'tablist' }, tabs.map(([id, key]) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t(key)))),
    tab === 'charms' ? charmsTab() : tab === 'cart' ? cartTab() : tab === 'tricks' ? tricksTab() : tab === 'blender' ? blenderTab({ ...ctx, run }, run) : benchTab(),
    h('div', { class: 'row-wrap' },
      h('button', { type: 'button', class: 'btn' + (can(rr) ? '' : ' dim'), onclick: () => (can(rr) ? ctx.call('reroll') : ctx.toast(why(rr))) }, art('ui/btn_reroll', 'ico xs'), t('ui.reroll', { n: fmt(rr.coins ?? 0) })),
      ctx.h.adReady?.('shop_reroll') && btn(t('ads.watch.shop_reroll'), () => ctx.call('watchAd', 'shop_reroll'), 'ad')),
    ctx.foot(h('button', { type: 'button', class: 'btn primary', 'data-anchor': 'stall.leave', onclick: () => ctx.call('leaveShop') }, t('ui.nextNight'))));
}
