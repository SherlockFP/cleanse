// The run HUD: goal bar (debt, banked, night, spins, the goal sentence), stat chips, Heat meter, charm row, trick pockets, STOKE / SPIN / COLLECT / BANK.
// It never touches the core: every button calls a handler through api.call and the glue calls updateHud(run) again.
import { t, L, fmt } from '../i18n.js';
import { h, art, btn, hold, put, clear } from './dom.js';
import { model } from './model.js';
import { chip, pic, detailSheet } from './cards.js';
import { CHARM, TRICK, SYM } from './content.js';

// The one sentence that says what to do now. Used by the HUD and by the strip on top of in-run screens.
export const goalText = (m) => (m.left > 0
  ? t('ui.goal', { left: m.left, n: m.debt, m: m.debts, r: m.rounds })
  : t('ui.goalDone'));

// Compact goal bar for in-run screens (terms, wagon, deal...): the goal is on screen everywhere.
export function goalStrip(run, dv) {
  const m = model(run, dv);
  return h('div', { class: 'goal-strip' },
    h('div', { class: 'goal-row' }, h('b', {}, t('ui.debtOf', { n: m.debt, m: m.debts })), h('span', { class: 'goal-owed' }, t('ui.owed', { a: m.banked, b: m.target })), h('span', {}, t('ui.nightOf', { n: m.round, m: m.rounds }))),
    h('p', { class: 'goal' }, goalText(m)),
    dv?.boss && h('p', { class: 'goal boss' }, t('ui.boss', { name: L(dv.boss.name), rule: L(dv.boss.text) })));
}

const usable = (when, phase) => when === 'pre' ? phase === 'spin' : when === 'post' ? phase === 'post' : when === 'any' ? (phase === 'spin' || phase === 'post' || phase === 'roundend') : when === 'shop' ? phase === 'shop' : false;
const hint = { pre: 'ui.trickPre', post: 'ui.trickPost', shop: 'ui.trickShop', auto: 'ui.trickAuto', any: 'ui.trickPre' };

export function mountHud(col, api) {
  const top = h('header', { class: 'hud-top', hidden: true }), bot = h('footer', { class: 'hud-bot', hidden: true });
  const prompt = h('div', { class: 'prompt', hidden: true, role: 'status' });
  col.append(top, bot, prompt);
  let busy = false, run = null;

  const sync = () => { // the view and the speech box read these two heights
    col.style.setProperty('--hud-top', top.hidden ? '0px' : top.offsetHeight + 'px');
    col.style.setProperty('--hud-bot', bot.hidden ? '0px' : bot.offsetHeight + 'px');
  };
  if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(sync); ro.observe(top); ro.observe(bot); }

  function bankSheet(m) {
    const max = Math.min(m.purse, m.left);
    if (max < 1) return api.toast('ui.bankNone');
    let n = max;
    const out = h('b', { class: 'big-num' }), go = btn('', () => { api.closeSheet(); api.call('bank', n); }, 'primary');
    const set = (v) => { n = Math.max(1, Math.min(max, Math.round(v))); out.textContent = fmt(n); go.textContent = t('ui.bankDo', { n: fmt(n) }); slider.value = String(n); };
    const slider = h('input', { type: 'range', min: '1', max: String(max), step: '1', value: String(max), 'aria-label': t('ui.bankTitle'), oninput: (e) => set(+e.target.value) });
    set(max);
    api.sheet(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' },
      h('h2', {}, t('ui.bankTitle')), h('p', { class: 'owed' }, t('ui.owedLeft', { n: fmt(m.left) })),
      h('div', { class: 'bank-amt' }, art('ui/coin', 'ico'), out), slider,
      h('div', { class: 'sheet-acts' }, btn(t('ui.bankHalf'), () => set(max / 2)), btn(t('ui.bankAll'), () => set(max))),
      h('p', { class: 'note' }, t('ui.bankNote')), h('div', { class: 'sheet-acts' }, go, btn(t('ui.close'), api.closeSheet))));
  }

  const inspect = (spec) => api.sheet(detailSheet(spec, api.closeSheet));

  function render(r) {
    const dv = api.derive(r), m = model(r, dv), ph = r.phase;
    const pct = m.target > 0 ? Math.min(100, Math.round((m.banked / m.target) * 100)) : 0;
    clear(top); clear(bot);
    put(top,
      h('div', { class: 'goal-row' }, h('b', {}, t('ui.debtOf', { n: m.debt, m: m.debts })), h('span', {}, t('ui.nightOf', { n: m.round, m: m.rounds })), h('span', { class: 'spins' }, t('ui.spinsN', { n: m.spins })),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('ui.settings'), onclick: () => api.show('settings', {}) }, art('ui/btn_settings', 'ico'))),
      h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(m.target), 'aria-valuenow': String(m.banked) },
        h('i', { style: `width:${pct}%` }), h('span', {}, t('ui.owed', { a: fmt(m.banked), b: fmt(m.target) }))),
      h('p', { class: 'goal' }, goalText(m)),
      h('div', { class: 'chips' },
        chip('ui/coin', fmt(m.purse), 'purse'), chip('ui/wick', fmt(m.wick)), chip('ui/luck', fmt(m.luck)), chip('ui/interest', '+' + fmt(m.interest)),
        h('button', { type: 'button', class: 'chip fav', title: t('ui.fav'), 'aria-label': ph === 'spin' && !m.favHidden ? t(dv.redrawCost ? 'ui.redrawWick' : 'ui.redrawFree', { n: dv.redrawCost }) : t('ui.fav'),
          onclick: () => { if (busy) return api.toast('why.busy'); if (ph === 'spin' && !m.favHidden) api.call('redrawFav'); } }, art('ui/favour', 'ico xs'),
          m.favHidden ? h('b', {}, '?') : m.favs.map((id) => art(SYM[id]?.icon ?? 'sym/' + id, 'ico xs')), ph === 'spin' && !m.favHidden && h('small', {}, dv.redrawCost ? '↻' + dv.redrawCost : '↻')) ),
      dv.boss && h('p', { class: 'goal boss' }, t('ui.boss', { name: L(dv.boss.name), rule: L(dv.boss.text) })),
      h('div', { class: 'heat', title: t('ui.heatLabel', { n: m.heat }) },
        art('ui/heat', 'ico xs'), h('span', { class: 'segs' }, Array.from({ length: m.heatMax }, (_, i) => h('i', { class: i < m.heat ? 'on' : '' }))),
        h('b', {}, t('ui.heatLabel', { n: m.heat })), m.heat > 0 && h('em', {}, t('ui.heatPay', { n: m.heatPct }))));

    // charm row: owned charms (tap to read), then empty slots, then the shelf and curse buttons
    const owned = r.charms ?? [], slots = r.slots ?? 5;
    const charmBtn = (c) => { const d = CHARM[c.id]; return h('button', { type: 'button', class: 'slot', 'aria-label': d?.name?.en ?? c.id,
      onclick: () => inspect({ kind: 'charm', id: c.id, S: m.scale, stack: c.stack }) }, d && pic(d.icon, d.rarity), c.stack > 0 && h('i', { class: 'badge' }, String(c.stack))); };
    const empty = Array.from({ length: Math.max(0, slots - owned.length) }, () => h('span', { class: 'slot empty', 'aria-label': t('ui.emptySlot') }, art('ui/slot_empty', 'ico lg')));
    const curses = (r.curses ?? []).length;
    const pockets = Array.from({ length: r.pockets ?? 3 }, (_, i) => {
      const id = r.tricks?.[i], d = TRICK[id];
      if (!d) return h('span', { class: 'pocket empty', 'aria-label': t('ui.pocketEmpty') });
      const ok = usable(d.when, ph);
      return hold(h('button', { type: 'button', class: 'pocket' + (ok ? '' : ' dim'), 'aria-label': d.name.en,
        onclick: () => { if (busy) return api.toast('why.busy'); if (!ok) return api.toast(hint[d.when] ?? 'ui.trickPre'); api.call('useTrick', i); } }, art(d.icon, 'ico lg')),
      () => inspect({ kind: 'trick', id, S: m.scale }));
    });
    const canSpin = ph === 'spin' && m.spins > 0, canCollect = ph === 'post', atEnd = ph === 'roundend';
    put(bot,
      h('div', { class: 'row-charms' }, owned.map(charmBtn), empty,
        h('button', { type: 'button', class: 'slot util', 'aria-label': t('ui.shelf'), onclick: () => api.show('shelf', { run: r, tab: 'charms' }) }, art('ui/trick_bag', 'ico lg')),
        h('button', { type: 'button', class: 'slot util', 'aria-label': t('ui.curses'), onclick: () => api.show('shelf', { run: r, tab: 'curses' }) }, art('ui/curse_badge', 'ico lg'), curses > 0 && h('i', { class: 'badge' }, String(curses)))),
      h('div', { class: 'row-pockets' }, h('span', { class: 'lbl' }, t('ui.pockets')), pockets),
      h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn act stoke' + (ph === 'spin' && m.canStoke ? '' : ' dim'),
          onclick: () => { if (busy) return api.toast('why.busy'); if (ph !== 'spin') return; if (!m.canStoke) return api.toast(m.stokeWhy); api.call('stoke'); } }, art('ui/btn_stoke', 'ico'), h('span', {}, t('ui.stoke'))),
        canCollect
          ? h('button', { type: 'button', class: 'btn act primary go', onclick: () => { if (!busy) api.call('collect'); } }, art('ui/collect', 'ico'), h('span', {}, t('ui.collect')))
          : atEnd ? h('button', { type: 'button', class: 'btn act primary go', onclick: () => { if (!busy) api.call('endRound'); } }, art('ui/btn_spin', 'ico'), h('span', {}, t('ui.endNight')))
          : h('button', { type: 'button', class: 'btn act primary go' + (canSpin ? '' : ' dim'), onclick: () => { if (busy) return api.toast('why.busy'); if (!canSpin) return ph === 'spin' && api.toast('ui.noSpins'); api.call('spin'); } }, art('ui/btn_spin', 'ico'), h('span', {}, t('ui.spin'))),
        h('button', { type: 'button', class: 'btn act bank' + ((ph === 'spin' || atEnd) && m.purse > 0 && m.left > 0 ? '' : ' dim'),
          onclick: () => { if (busy) return api.toast('why.busy'); if (ph === 'post') return api.toast('ui.bankAfter'); bankSheet(m); } }, art('ui/btn_bank', 'ico'), h('span', {}, t('ui.bank')), h('small', {}, t('ui.owedLeft', { n: fmt(m.left) })))));
    sync();
  }

  return {
    update(r) {
      run = r;
      const on = !!r && r.phase !== 'ended';
      top.hidden = bot.hidden = !on;
      if (on) render(r); else sync();
    },
    redraw: () => run && render(run),
    setBusy(b) { busy = !!b; col.dataset.busy = busy ? '1' : '0'; },
    // A line of instruction while the player taps a target on the machine ("Tap a column"); Cancel calls onCancel.
    showPrompt(key, onCancel) {
      clear(prompt);
      if (!key) { prompt.hidden = true; return; }
      put(prompt, h('span', {}, t(key)), btn(t('ui.cancel'), () => { prompt.hidden = true; onCancel?.(); }));
      prompt.hidden = false;
    },
    insets: () => ({ top: top.hidden ? 0 : top.offsetHeight, bottom: bot.hidden ? 0 : bot.offsetHeight }),
  };
}
