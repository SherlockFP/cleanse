// Character select: six cards, locked ones say how to open them. data: { meta }. Continue goes to the contract ladder.
import { t, L } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARS, ACH } from './content.js';

// "ach:contract_1" -> the achievement name and what it asks; plain text for anything else.
export function unlockHow(code) {
  const a = ACH[String(code).replace(/^ach:/, '')];
  return a ? `${L(a.name)}. ${L(a.text)}` : String(code);
}

export function render(el, { meta, charId }, ctx) {
  const open = new Set(meta.chars ?? ['nim']);
  const sel = ctx.state.sel ?? charId ?? [...open][0];
  put(el,
    h('h2', {}, t('ui.chooseChar')),
    h('div', { class: 'cards' }, CHARS.map((c) => {
      const ok = open.has(c.id);
      return h('button', { type: 'button', class: 'card pick' + (sel === c.id ? ' on' : '') + (ok ? '' : ' lockedc'), 'aria-pressed': String(sel === c.id),
        onclick: () => { if (ok) { ctx.state.sel = c.id; ctx.rerender(); } else ctx.toastText(t('ui.unlockBy', { how: unlockHow(c.unlock) })); } },
      h('span', { class: 'pic' }, art(c.icon, 'ico lg'), !ok && art('ui/lock', 'ico xs lockmark')),
      h('div', { class: 'card-text' }, h('strong', {}, L(c.name)), h('span', { class: 'fx' }, L(c.text)), !ok && h('span', { class: 'note' }, t('ui.unlockBy', { how: unlockHow(c.unlock) }))));
    })),
    ctx.foot(btn(t('ui.back'), ctx.close), btn(t('ui.continue'), () => ctx.open('ladder', { charId: sel }), 'primary')));
}
