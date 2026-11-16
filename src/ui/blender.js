// Pip's blender (SPEC 4.6), a tab of the stall. Tap charm A, then charm B, read the preview, hold BLEND for 0.6 s.
// Same family and same rarity: pick 1 of 2 charms one rarity up. Two families in a recipe: that one fused charm. Legendary and fused charms cannot go in.
// Handlers: blendPreview(a, b) -> { ok, cost, kind: 'same' | 'recipe', outs: [charmId] } | { ok:false, why: closed | charms | none | recipe | owned }, blend(a, b, pickIndex).
import { t, L } from '../i18n.js';
import { h, btn, art } from './dom.js';
import { CHARM, FAMILY, FUSION } from './content.js';
import { pic } from './cards.js';

const blocked = (c) => { const d = CHARM[c.id]; return !d || d.rarity === 'legendary' || d.rarity === 'fused' || c.relic; };

export function blenderTab(ctx, run) {
  const st = ctx.state, mine = run.charms ?? [], a = st.bA, b = st.bB;
  const prev = a != null && b != null ? ctx.h.blendPreview?.(a, b) : null;
  const slotView = (i, label) => h('div', { class: 'funnel' + (i != null ? ' full' : '') }, h('span', { class: 'lc-label' }, label), i != null && mine[i] ? pic(CHARM[mine[i].id].icon, CHARM[mine[i].id].rarity) : h('span', { class: 'pic' }, art('ui/slot_empty', 'ico lg')));
  const choose = (i) => {
    if (blocked(mine[i])) return ctx.toast('ui.blendNo');
    if (a == null || (a != null && b != null)) { st.bA = i; st.bB = null; } else if (i === a) st.bA = null; else st.bB = i;
    ctx.rerender();
  };
  const fire = () => {
    if (!prev?.ok) return ctx.toast(prev?.why ? 'ui.blendWhy.' + prev.why : 'ui.blendPick');
    if (prev.kind === 'recipe' || (prev.outs ?? []).length < 2) return done(prev.outs?.[0]);
    ctx.openNode(h('section', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, t('ui.blendPickOne')),
      h('div', { class: 'cards' }, prev.outs.map((id) => h('button', { type: 'button', class: 'card pick', onclick: () => { ctx.closeSheet(); done(id); } }, pic(CHARM[id]?.icon, CHARM[id]?.rarity), h('div', { class: 'card-text' }, h('strong', {}, L(CHARM[id]?.name)), h('span', { class: 'fx' }, L(CHARM[id]?.text)))))),
      h('div', { class: 'sheet-acts' }, btn(t('ui.close'), ctx.closeSheet))));
  };
  const done = (id) => { const x = a, y = b, pick = Math.max(0, (prev?.outs ?? []).indexOf(id)); st.bA = st.bB = null; ctx.call('blend', x, y, pick); };
  // Hold 0.6 s; letting go early cancels (a tap only shows the preview).
  const go = h('button', { type: 'button', class: 'btn primary blend-btn' + (prev?.ok ? '' : ' dim'), 'data-anchor': 'blend' }, art('ui/blender', 'ico'), h('span', {}, t('ui.blend')), h('i', { class: 'fill' }));
  let timer = 0;
  go.addEventListener('pointerdown', () => { go.classList.add('holding'); timer = setTimeout(() => { go.classList.remove('holding'); fire(); }, 600); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) go.addEventListener(ev, () => { clearTimeout(timer); go.classList.remove('holding'); });
  go.addEventListener('click', () => { if (!prev?.ok) fire(); });
  const pair = prev?.ok && (prev.kind === 'recipe' ? t('ui.blendRecipe') : t('ui.blendSame'));
  return [
    h('p', { class: 'note' }, t('ui.blendNote')),
    h('div', { class: 'blender' }, slotView(a, 'A'), h('span', { class: 'plus' }, '+'), slotView(b, 'B'), h('span', { class: 'plus' }, '='), art('machine/blender', 'devil')),
    prev?.ok ? h('p', { class: 'sub' }, `${pair} · ${t('ui.blendCost', { n: prev.cost })}`) : (a != null && b != null ? h('p', { class: 'note due-note' }, t(prev?.why ? 'ui.blendWhy.' + prev.why : 'ui.blendNoPair')) : null),
    prev?.ok && prev.outs?.length === 1 && h('p', { class: 'fx' }, t('ui.blendMakes', { name: L(CHARM[prev.outs[0]]?.name) })),
    go,
    h('div', { class: 'cards' }, mine.map((c, i) => { const d = CHARM[c.id]; if (!d) return null;
      return h('button', { type: 'button', class: 'card pick' + (i === a || i === b ? ' on' : '') + (blocked(c) ? ' lockedc' : ''), onclick: () => choose(i) }, pic(d.icon, d.rarity),
        h('div', { class: 'card-text' }, h('strong', {}, L(d.name)), h('span', { class: 'tags' }, h('span', { class: 'tag' }, t('ui.rarity.' + d.rarity)), (d.tags ?? [d.family]).filter(Boolean).slice(0, 2).map((f) => h('span', { class: 'tag' }, L(FAMILY[f]?.name) || f)))));
    })),
    FUSION.length > 0 && h('p', { class: 'note' }, t('ui.recipesSeen', { n: (run.recipesFound ?? []).length, m: FUSION.length })),
  ];
}
