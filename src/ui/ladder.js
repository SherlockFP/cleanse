// Contract ladder (the ascension): ten contracts, each unlocked by clearing the one before. data: { meta, charId }.
// Start calls startRun({ charId, contractId }). meta.contracts = unlocked ids, meta.cleared = cleared ids (optional).
import { t, L, fmt } from '../i18n.js';
import { h, btn, put } from './dom.js';
import { CONTRACTS, CONTRACT } from './content.js';

export function render(el, { meta, charId }, ctx) {
  const open = new Set(meta.contracts ?? ['c1']), done = new Set(meta.cleared ?? []);
  const sel = ctx.state.sel ?? [...open].filter((id) => !done.has(id)).pop() ?? 'c1';
  const need = (c) => t('ui.clearFirst', { name: L(CONTRACT[c.unlockAfter]?.name) });
  put(el,
    h('h2', {}, t('ui.chooseContract')),
    h('div', { class: 'cards' }, CONTRACTS.map((c) => {
      const ok = open.has(c.id);
      return h('button', { type: 'button', class: 'card pick contract' + (sel === c.id ? ' on' : '') + (ok ? '' : ' lockedc'), 'aria-pressed': String(sel === c.id),
        onclick: () => { if (ok) { ctx.state.sel = c.id; ctx.rerender(); } else ctx.toastText(need(c)); } },
      h('span', { class: 'tier' }, String(c.tier)),
      h('div', { class: 'card-text' }, h('strong', {}, L(c.name)),
        h('span', { class: 'tags' }, h('span', { class: 'tag' }, t('ui.debtsN', { n: c.debts.length })), h('span', { class: 'tag' }, t('ui.nightsPer', { n: c.rounds })),
          done.has(c.id) && h('span', { class: 'tag good' }, t('ui.cleared')), c.ending && h('span', { class: 'tag' }, t('ui.endingTag', { name: t('ui.ending.' + c.ending) }))),
        h('span', { class: 'fx' }, L(c.text)),
        h('span', { class: 'note' }, c.debts.map(fmt).join(' · '), ' · ', t('ui.reward', { n: c.rewardWax })),
        !ok && h('span', { class: 'note' }, need(c))));
    })),
    ctx.foot(btn(t('ui.back'), ctx.close), btn(t('ui.start'), () => ctx.call('startRun', { charId, contractId: sel }), 'primary')));
}
