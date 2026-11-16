// The map: ten places along a hand-painted strip of Thailand, each one a contract. Wealth rank = places cleared. Each place shows its stamps (bronze cleared,
// silver cleared with no Flare-up, gold cleared with no deal signed), its local spirit and, once the ladder is open, its Storm level.
// A place sheet picks the character, the Postcards (slots come from the Notebook) and the Storm, then PLAY. Replaces ladder.js and charselect.js as the way into a run.
// data: { meta }. meta.contracts (open ids), meta.stamps { c1: { bronze, silver, gold } } (bronze = cleared), meta.storm { c1: n }, meta.chars, meta.postcards, meta.spirits.
// Handlers: startRun({ charId, contractId, postcards, storm }), postcardSlots() -> n (the Notebook decides).
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CONTRACTS, CONTRACT, PLACE, CHARS, POSTCARD, SPIRIT, RANKS } from './content.js';
import { portrait } from './cards.js';
import { unlockHow } from './charselect.js';

export const isCleared = (meta, id) => !!meta.stamps?.[id]?.bronze || (meta.cleared ?? []).includes(id);
export const rankOf = (meta) => { let n = 0; while (n < CONTRACTS.length && isCleared(meta, CONTRACTS[n].id)) n++; return Math.min(RANKS, Math.max(1, n)); };
const stampsOf = (meta, id) => meta.stamps?.[id] ?? {};
const localOf = (id) => SPIRIT[PLACE[id]?.local];
// Storm opens after the last place (stamp bronze on c10); each level needs the one before cleared somewhere.
const stormMax = (meta) => (meta.stamps?.c10?.bronze ? Math.min(10, Math.max(0, ...Object.values(meta.storm ?? {})) + 1) : 0);

export function render(el, { meta }, ctx) {
  const open = new Set(meta.contracts ?? ['c1']), doneN = CONTRACTS.filter((c) => isCleared(meta, c.id)).length, rank = rankOf(meta), stormTop = stormMax(meta), stormOpen = stormTop > 0;
  const sel = ctx.state.sel;
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'home'); }
  const nameOf = (c) => L(PLACE[c.id]?.name) || L(c.name);

  const tile = (c, i) => {
    const ok = open.has(c.id), st = stampsOf(meta, c.id), sp = localOf(c.id), met = !!sp && (meta.spirits ?? []).includes(sp.id);
    const need = c.unlockAfter && !open.has(c.id) ? t('ui.clearFirst', { name: nameOf(CONTRACT[c.unlockAfter] ?? c) }) : null;
    return h('button', { type: 'button', class: 'card pick place' + (ok ? '' : ' lockedc') + (sel === c.id ? ' on' : ''), 'data-anchor': 'place:' + c.id,
      onclick: () => (ok ? placeSheet(c) : ctx.toastText(need ?? t('ui.reqUnknown'))) },
    h('span', { class: 'tier' }, String(i + 1)),
    h('div', { class: 'card-text' }, h('strong', {}, nameOf(c)),
      h('span', { class: 'tags' }, h('span', { class: 'tag' }, t('ui.debtsN', { n: c.debts.length })), h('span', { class: 'tag' }, t('ui.nightsPer', { n: c.rounds })),
        h('span', { class: 'tag good' }, t('ui.rankEarn', { name: t('ui.rank.' + Math.min(RANKS, i + 1)) })),
        (meta.storm?.[c.id] | 0) > 0 && h('span', { class: 'tag bad' }, t('ui.stormTag', { n: meta.storm[c.id] }))),
      h('span', { class: 'note' }, ok ? t('ui.placeLocal', { name: met ? L(sp.name) : '?' }) : need)),
    h('span', { class: 'stamps', 'aria-label': t('ui.stamps') }, ['bronze', 'silver', 'gold'].map((k) => art('ui/stamp_' + k, 'ico sm' + (st[k] ? '' : ' off')))),
    sp && met && portrait(sp, 0, 'face sm'));
  };

  function placeSheet(c) {
    ctx.state.sel = c.id;
    const chars = new Set(meta.chars ?? ['nim']), st = ctx.state.pick ??= { charId: [...chars][0], cards: [], storm: 0 };
    const slots = ctx.h.postcardSlots?.() ?? 0, owned = (meta.postcards ?? []).filter((id) => POSTCARD[id]);
    const paint = () => {
      const box = h('section', { class: 'sheet-card place-sheet', role: 'dialog', 'aria-modal': 'true' });
      const redraw = () => ctx.openNode(paintBox());
      const paintBox = () => {
        box.replaceChildren();
        put(box,
          h('h2', {}, nameOf(c)), h('p', { class: 'note' }, L(PLACE[c.id]?.text) || L(c.text)),
          h('h3', {}, t('ui.chooseChar')),
          h('div', { class: 'seg' }, CHARS.map((ch) => { const okc = chars.has(ch.id);
            return h('button', { type: 'button', class: 'opt' + (st.charId === ch.id ? ' on' : '') + (okc ? '' : ' dim'), 'aria-pressed': String(st.charId === ch.id),
              onclick: () => { if (okc) { st.charId = ch.id; redraw(); } else ctx.toastText(t('ui.unlockBy', { how: unlockHow(ch.unlock) })); } }, art(ch.icon, 'ico sm'), L(ch.name)); })),
          h('p', { class: 'note' }, L(CHARS.find((x) => x.id === st.charId)?.text)),
          h('h3', {}, t('ui.postcardsTitle', { a: st.cards.length, b: slots })),
          slots === 0 ? h('p', { class: 'note' }, t('ui.postcardsNone'))
            : h('div', { class: 'cards' }, (owned.length ? owned : []).map((id) => { const p = POSTCARD[id], on = st.cards.includes(id);
              return h('button', { type: 'button', class: 'card pick' + (on ? ' on' : ''), 'aria-pressed': String(on),
                onclick: () => { if (on) st.cards = st.cards.filter((x) => x !== id); else if (st.cards.length < slots) st.cards = [...st.cards, id]; else return ctx.toast('ui.postcardsFull'); redraw(); } },
              h('span', { class: 'pic' }, art(p.icon ?? 'ui/postcard_back', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(p.name)),
                p.gain ? [h('span', { class: 'fx good' }, t('ui.pcGain', { text: L(p.gain) })), h('span', { class: 'fx bad' }, t('ui.pcCost', { text: L(p.cost) }))] : h('span', { class: 'fx' }, L(p.text)))); })),
          stormOpen && [h('h3', {}, t('ui.stormTitle')), h('div', { class: 'seg' }, Array.from({ length: stormTop + 1 }, (_, n) =>
            h('button', { type: 'button', class: 'opt' + (st.storm === n ? ' on' : ''), onclick: () => { st.storm = n; redraw(); } }, n === 0 ? t('ui.stormOff') : String(n))))],
          h('div', { class: 'sheet-acts' }, btn(t('ui.back'), ctx.closeSheet), btn(t('ui.play'), () => { ctx.closeSheet(); ctx.call('startRun', { charId: st.charId, contractId: c.id, postcards: st.cards, storm: st.storm }); }, 'primary')));
        return box;
      };
      return paintBox();
    };
    ctx.openNode(paint());
  }

  put(el,
    h('div', { class: 'map-banner' }, art('bg/map', 'mapimg'), h('div', { class: 'rankplate' }, h('span', { class: 'lc-label' }, t('ui.rankLabel')), h('b', {}, t('ui.rank.' + rank)), h('em', {}, t('ui.placesDone', { a: doneN, b: CONTRACTS.length })))),
    h('p', { class: 'note' }, t('ui.mapNote')),
    h('div', { class: 'cards mapline' }, CONTRACTS.map(tile)),
    ctx.foot(btn(t('ui.back'), ctx.close)));
}
