// The run HUD (SPEC 6.1). Top: goal bar, run bar, labelled chips, spirits row. Bottom: charm row, action row (pockets, HONK, SPIN, Spice Up, SCORE).
// Every chip has a word under its icon and a tap that says what the number is in one line. It never touches the core: buttons call handlers through api.call.
// Anchors for the tutorial (data-anchor): goalBar nights purse kiosk special spiceUp spin honk phone pocket:N charm:N.
import { t, L, fmt } from '../i18n.js';
import { h, art, btn, hold, put, clear } from './dom.js';
import { model } from './model.js';
import { lchip, pic, detailSheet, portrait, pips, stageOf } from './cards.js';
import { CHARM, TRICK, SYM, SPIRIT, FAMILY } from './content.js';
import { kioskSheet } from './kiosk.js';
import { spiritSheet } from './spirit.js';

export const goalText = (m) => (m.left > 0 ? t('ui.goal', { left: m.left, n: m.debt, m: m.debts, r: m.rounds }) : t('ui.goalDone'));

// Compact goal bar for in-run screens (terms, stall, call...): the goal is on screen everywhere.
export function goalStrip(run, dv) {
  const m = model(run, dv);
  return h('div', { class: 'goal-strip' },
    h('div', { class: 'goal-row' }, h('b', {}, t('ui.debtOf', { n: m.debt, m: m.debts })), h('span', { class: 'goal-owed' }, t('ui.owed', { a: fmt(m.banked), b: fmt(m.target) })), h('span', {}, t('ui.nightOf', { n: m.round, m: m.rounds }))),
    h('p', { class: 'goal' }, goalText(m)),
    dv?.boss && h('p', { class: 'goal boss' }, t('ui.boss', { name: L(dv.boss.name), rule: L(dv.boss.text) })));
}

const usable = (when, phase) => when === 'pre' ? phase === 'spin' : when === 'post' ? phase === 'post' : when === 'any' ? (phase === 'spin' || phase === 'post' || phase === 'roundend') : when === 'shop' ? phase === 'shop' : false;
const hint = { pre: 'ui.trickPre', post: 'ui.trickPost', shop: 'ui.trickShop', auto: 'ui.trickAuto', any: 'ui.trickPre' };
const need = (c) => CHARM[c.id]?.active?.need ?? 0;
const charge = (c) => c.charge ?? need(c); // a charm with no charge counter yet is full

// "on pace" or "behind": needed per remaining spin against the average pay of the last 5 spins (the core gives { need, avg } or { ok }).
export const paceState = (p) => (p == null ? null : (p.behind ?? !(p.ok ?? p.avg >= p.need)) ? 'behind' : 'on');

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

  const inspect = (spec) => api.sheet(detailSheet(spec, api.closeSheet));
  const tip = (key) => api.toast(key);
  const ctx = () => ({ ...api, run, openNode: api.sheet });

  function debtSheet(m, dv) {
    api.sheet(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' },
      h('h2', {}, t('ui.debtOf', { n: m.debt, m: m.debts })),
      h('ul', { class: 'ticket' },
        h('li', {}, h('span', {}, t('ui.dsTarget')), h('b', {}, fmt(m.target))), h('li', {}, h('span', {}, t('ui.dsBanked')), h('b', {}, fmt(m.banked))),
        h('li', {}, h('span', {}, t('ui.dsLeft')), h('b', {}, fmt(m.left))), h('li', {}, h('span', {}, t('ui.dsNights')), h('b', {}, `${m.round} / ${m.rounds}`))),
      dv.boss && h('p', { class: 'goal boss' }, t('ui.boss', { name: L(dv.boss.name), rule: L(dv.boss.text) })),
      Array.isArray(dv.nextDebts) && dv.nextDebts.length > 0 && h('p', { class: 'note' }, t('ui.dsNext', { list: dv.nextDebts.map(fmt).join(', ') })),
      m.due.map((d) => h('p', { class: 'note due-note' }, t('ui.dueNote', { n: d.left ?? d.rounds }))),
      h('p', { class: 'note' }, t('ui.dsHelp')),
      h('div', { class: 'sheet-acts' }, btn(t('ui.close'), api.closeSheet))));
  }

  function spiritsRow(m, dv) {
    const list = Object.entries(m.spirits).filter(([id, s]) => s && (s.met ?? true) && !s.silent && SPIRIT[id]).sort((a, b) => (b[1].fav | 0) - (a[1].fav | 0)).slice(0, 3);
    const ringing = run.phase === 'call';
    return h('div', { class: 'spirits-row' },
      h('div', { class: 'sp-list' }, list.length ? list.map(([id, s]) => h('button', { type: 'button', class: `sp s${stageOf(s.fav | 0)}` + (s.wrath ? ' wrath' : ''), 'aria-label': `${L(SPIRIT[id].name)} ${s.fav | 0}`,
        onclick: () => spiritSheet(ctx(), id) }, portrait(SPIRIT[id], s.fav | 0, 'face sm'), h('span', { class: 'sp-name' }, L(SPIRIT[id].name)), pips(s.fav | 0)))
        : h('span', { class: 'note sp-none' }, t('ui.noSpiritsYet'))),
      h('button', { type: 'button', class: 'phone-btn' + (ringing ? ' ring' : ''), 'data-anchor': 'phone', 'aria-label': t('ui.phone'),
        onclick: () => (ringing ? api.show('phone', { run }) : tip('tip.phone')) }, art('ui/phone', 'ico'), h('span', { class: 'lc-label' }, t('ui.phone'))));
  }

  function render(r) {
    const dv = api.derive(r), m = model(r, dv), ph = r.phase, S = api.settings();
    const covered = Math.min(100, m.target > 0 ? Math.round(((m.banked + m.purse) / m.target) * 100) : 0), bankedPct = Math.min(100, m.target > 0 ? Math.round((m.banked / m.target) * 100) : 0);
    const pace = paceState(m.pace), kio = m.kiosk, nights = Array.from({ length: m.rounds }, (_, i) => h('i', { class: i + 1 < m.round ? 'done' : i + 1 === m.round ? 'now' : '' }));
    const carried = r.carried | 0;
    clear(top); clear(bot);
    put(top,
      h('div', { class: 'goalbar', 'data-anchor': 'goalBar', role: 'button', tabindex: '0', onclick: () => debtSheet(m, dv) },
        h('div', { class: 'goal-row' }, h('b', {}, t('ui.debtOf', { n: m.debt, m: m.debts })),
          pace && h('span', { class: 'pace ' + pace }, t(pace === 'on' ? 'ui.paceOn' : 'ui.paceBehind')),
          m.due.map((d) => h('span', { class: 'due' }, t('ui.dueTag', { n: d.left ?? d.rounds }))),
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('ui.settings'), onclick: (e) => { e.stopPropagation(); api.show('settings', {}); } }, art('ui/btn_settings', 'ico'))),
        h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(m.target), 'aria-valuenow': String(m.banked) },
          h('i', { class: 'purse-fill', style: `width:${covered}%` }), h('i', { style: `width:${bankedPct}%` }), h('span', {}, t('ui.owed', { a: fmt(m.banked), b: fmt(m.target) }))),
        h('p', { class: 'goal' }, goalText(m)),
        // PAY NOW sits on the machine screen, not only in the Kiosk sheet (AUDIT2 7)
        m.payNow && h('button', { type: 'button', class: 'btn primary stampbtn paynow', 'data-anchor': 'payNow', onclick: (e) => { e.stopPropagation(); if (busy) return api.toast('why.busy'); api.call('payNow'); } }, t('ui.payNow'))),
      dv.boss && h('p', { class: 'goal boss' }, t('ui.boss', { name: L(dv.boss.name), rule: L(dv.boss.text) })),
      h('div', { class: 'runbar' },
        h('button', { type: 'button', class: 'rb', 'data-anchor': 'nights', onclick: () => tip('tip.nights') }, h('span', { class: 'pipsn' }, nights), h('span', {}, t('ui.nightOf', { n: m.round, m: m.rounds }))),
        h('button', { type: 'button', class: 'rb', onclick: () => tip('tip.spins') }, h('b', {}, t('ui.spinsN', { n: m.spins })), carried > 0 && h('em', {}, t('ui.carried', { n: carried }))),
        h('button', { type: 'button', class: 'rb beads', 'aria-label': t('ui.beads'), onclick: () => tip('tip.beads') },
          Array.from({ length: 3 }, (_, i) => art(i < m.beads ? 'ui/bead_on' : 'ui/bead_off', 'ico xs')), h('span', {}, t('ui.beads'))),
        m.redEye > 0 && h('button', { type: 'button', class: 'rb redeye', onclick: () => tip('tip.redeye') }, art('sym/redeye', 'ico xs'), h('span', {}, t('ui.redEyeGauge', { n: (Math.round(m.redEye * 10) / 10).toFixed(1) })))),
      h('div', { class: 'chips2' },
        lchip({ icon: 'ui/coin', label: t('ui.purse'), value: fmt(m.purse), tip: 'tip.purse', onTip: tip, anchor: 'purse' }),
        lchip({ icon: 'ui/interest', label: t('ui.kiosk'), value: fmt(kio.balance), sub: '+' + fmt(kio.tonight), cls: 'kiosk' + (m.payNow ? ' ready' : ''), anchor: 'kiosk', onclick: () => kioskSheet(ctx(), m, dv) }),
        lchip({ icon: 'ui/wick', label: t('ui.wick'), value: fmt(m.wick), tip: 'tip.caps', onTip: tip }),
        lchip({ icon: 'ui/luck', label: t('ui.luck'), value: fmt(m.luck), tip: 'tip.luck', onTip: tip }),
        h('button', { type: 'button', class: 'lchip fav', 'data-anchor': 'special', 'aria-label': t('ui.fav'),
          onclick: () => { if (busy) return api.toast('why.busy'); if (ph === 'spin' && !m.favHidden) api.call('redrawFav'); else tip('tip.special'); } },
        h('span', { class: 'lc-top' }, m.favHidden ? h('b', {}, '?') : m.favs.map((id) => art(SYM[id]?.icon ?? 'sym/' + id, 'ico xs')), ph === 'spin' && !m.favHidden && h('small', {}, dv.redrawCost ? '↻' + dv.redrawCost : '↻')), h('span', { class: 'lc-label' }, t('ui.fav')))),
      h('button', { type: 'button', class: 'heat', title: t('ui.heatLabel', { n: m.heat }), onclick: () => tip('tip.spice') },
        h('span', { class: 'lc-label' }, t('ui.heat')), h('span', { class: 'segs' }, Array.from({ length: m.heatMax }, (_, i) => h('i', { class: i < m.heat ? 'on' : '' }))),
        h('b', {}, m.heat), m.heat > 0 && h('em', {}, t('ui.heatPay', { n: m.heatPct }))),
      spiritsRow(m, dv));

    // charm row: owned charms (tap to read) with charge pips under active ones, empty slots, then the shelf and curse buttons
    const owned = r.charms ?? [], slots = r.slots ?? 5;
    const charmBtn = (c, i) => { const d = CHARM[c.id], nd = need(c);
      return h('div', { class: 'slotwrap' }, h('button', { type: 'button', class: 'slot' + (c.relic ? ' relic' : ''), 'data-anchor': 'charm:' + i, 'aria-label': L(d?.name) || c.id,
        onclick: () => inspect({ kind: 'charm', id: c.id, S: m.scale, stack: c.stack, note: nd ? t('ui.chargeNote', { a: charge(c), b: nd }) : null }) }, d && pic(d.icon, d.rarity), c.stack > 0 && h('i', { class: 'badge' }, String(c.stack)), c.relic && h('i', { class: 'badge pin' }, '•')),
      nd > 0 && h('span', { class: 'charges' }, Array.from({ length: nd }, (_, k) => art(k < charge(c) ? 'ui/charge_on' : 'ui/charge_off', 'ico xxs')))); };
    const empty = Array.from({ length: Math.max(0, slots - owned.length) }, () => h('span', { class: 'slot empty', 'aria-label': t('ui.emptySlot') }, art('ui/slot_empty', 'ico lg')));
    const curses = (r.curses ?? []).length, fam = {};
    for (const c of owned) for (const f of new Set(CHARM[c.id]?.tags ?? [])) fam[f] = (fam[f] ?? 0) + 1;
    const sets = Object.entries(fam).filter(([, n]) => n > 1).map(([f, n]) => h('span', { class: 'tag good' }, `${L(FAMILY[f]?.name)} ${n}/3`));
    const pockets = Array.from({ length: r.pockets ?? 3 }, (_, i) => {
      const id = r.tricks?.[i], d = TRICK[id];
      if (!d) return h('span', { class: 'pocket empty', 'aria-label': t('ui.pocketEmpty') });
      const ok = usable(d.when, ph);
      return hold(h('button', { type: 'button', class: 'pocket' + (ok ? '' : ' dim'), 'data-anchor': 'pocket:' + i, 'aria-label': L(d.name),
        onclick: () => { if (busy) return api.toast('why.busy'); if (!ok) return api.toast(hint[d.when] ?? 'ui.trickPre'); api.call('useTrick', i); } }, art(d.icon, 'ico lg')),
      () => inspect({ kind: 'trick', id, S: m.scale }));
    });
    const hasActive = owned.some((c) => need(c) > 0), honkOn = ph === 'spin' && owned.some((c) => need(c) > 0 && charge(c) >= need(c));
    const canSpin = ph === 'spin' && m.spins > 0, canScore = ph === 'post', atEnd = ph === 'roundend';
    const spinBtn = canScore ? h('button', { type: 'button', class: 'btn act primary go dim', 'data-anchor': 'spin', onclick: () => { if (!busy) api.call('collect'); } }, art('ui/btn_spin', 'ico'), h('span', {}, t('ui.spin')), h('small', {}, t('ui.scoreFirst')))
      : atEnd ? h('button', { type: 'button', class: 'btn act primary go', 'data-anchor': 'spin', onclick: () => { if (!busy) api.call('endRound'); } }, art('ui/btn_spin', 'ico'), h('span', {}, t('ui.endNight')))
      : h('button', { type: 'button', class: 'btn act primary go' + (canSpin ? '' : ' dim'), 'data-anchor': 'spin', onclick: () => { if (busy) return api.toast('why.busy'); if (!canSpin) return ph === 'spin' && api.toast('ui.noSpins'); api.call('spin'); } }, art('ui/btn_spin', 'ico'), h('span', {}, t('ui.spin')));
    put(bot,
      h('div', { class: 'row-charms' }, owned.map(charmBtn), empty,
        h('button', { type: 'button', class: 'slot util', 'aria-label': t('ui.shelf'), onclick: () => api.show('shelf', { run: r, tab: 'charms' }) }, art('ui/trick_bag', 'ico lg')),
        h('button', { type: 'button', class: 'slot util', 'aria-label': t('ui.curses'), onclick: () => api.show('shelf', { run: r, tab: 'curses' }) }, art('ui/curse_badge', 'ico lg'), curses > 0 && h('i', { class: 'badge' }, String(curses)))),
      sets.length > 0 && h('div', { class: 'tags fam-line' }, sets),
      h('div', { class: 'acts' + (hasActive || canScore ? ' with4' : '') },
        h('div', { class: 'pockets' }, h('span', { class: 'lbl' }, t('ui.pockets')), h('span', { class: 'pk' }, pockets)),
        canScore ? h('button', { type: 'button', class: 'btn act score', 'data-anchor': 'score', onclick: () => { if (!busy) api.call('collect'); } }, art('ui/collect', 'ico'), h('span', {}, t('ui.score')))
          : hasActive && h('button', { type: 'button', class: 'btn act honk' + (honkOn ? '' : ' dim'), 'data-anchor': 'honk', onclick: () => { if (busy) return api.toast('why.busy'); if (honkOn) api.call('honk'); else api.toast(ph === 'spin' ? 'ui.honkEmpty' : 'ui.honkBefore'); } }, art('ui/honk', 'ico'), h('span', {}, t('ui.honk'))),
        !S.leverOnly || canScore || atEnd ? spinBtn : h('span', { class: 'lever-hint' }, t('ui.leverOnly')),
        h('button', { type: 'button', class: 'btn act stoke' + (ph === 'spin' && m.canStoke ? '' : ' dim'), 'data-anchor': 'spiceUp',
          onclick: () => { if (busy) return api.toast('why.busy'); if (ph !== 'spin') return; if (!m.canStoke) return api.toast(m.stokeWhy); api.call('stoke'); } }, art('ui/btn_stoke', 'ico'), h('span', {}, t('ui.stoke')))));
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
    openKiosk() { if (run) { const dv = api.derive(run); kioskSheet(ctx(), model(run, dv), dv); } },
    insets: () => ({ top: top.hidden ? 0 : top.offsetHeight, bottom: bot.hidden ? 0 : bot.offsetHeight }),
  };
}
