// The Blender (SPEC 4.6): two charms in, one out. Same family and rarity: pick 1 of 2 one rarity up. Two families in fusion.json: a fused charm.
import { CHARM, CHARMS, RARITIES, FUSION, familyOf } from './data.js';
import { stream } from './streams.js';
import { fire } from './effects.js';
import { addFavour } from './spirits.js';

const EXTRA = 2; // Postcard Spare Blender: blending costs +2 Caps
const canBlend = (inst) => !!inst && !inst.relic && RARITIES.slice(0, 3).includes(CHARM[inst.id].rarity);
export const blenderOpen = (run) => run.debtIdx >= 1 || !!run.postcards?.includes('spare_blender');

const recipeOf = (fa, fb) => FUSION.recipes.find((r) => (r.a === fa && r.b === fb) || (r.a === fb && r.b === fa));

// -> {ok, kind: 'same'|'recipe', cost, outs: [charm ids]} or {ok:false, why}
export function blendPreview(run, a, b) {
  if (run.phase !== 'shop' || !blenderOpen(run)) return { ok: false, why: 'closed' };
  const A = run.charms[a], B = run.charms[b];
  if (a === b || !canBlend(A) || !canBlend(B)) return { ok: false, why: 'charms' };
  const ca = CHARM[A.id], cb = CHARM[B.id], fa = familyOf(A.id), fb = familyOf(B.id);
  const extra = run.postcards?.includes('spare_blender') ? EXTRA : 0;
  const owned = new Set(run.charms.map((c) => c.id));
  if (fa === fb && ca.rarity === cb.rarity) {
    const up = RARITIES[RARITIES.indexOf(ca.rarity) + 1];
    const key = `${A.id}|${B.id}|${run.roundSerial}|${run.debtIdx}`;
    if (run.blend?.key !== key) {
      const list = CHARMS.filter((c) => c.rarity === up && familyOf(c.id) === fa && !owned.has(c.id));
      const rng = stream(run, 'fuse'), outs = [];
      while (outs.length < 2 && list.length) outs.push(list.splice(rng.int(list.length), 1)[0].id);
      run.blend = { key, outs };
    }
    return run.blend.outs.length ? { ok: true, kind: 'same', cost: FUSION.same.cost[ca.rarity] + extra, outs: [...run.blend.outs] } : { ok: false, why: 'none' };
  }
  if (fa !== fb && ca.rarity !== 'common' && cb.rarity !== 'common') {
    const r = recipeOf(fa, fb);
    if (!r) return { ok: false, why: 'recipe' };
    if (owned.has(r.out)) return { ok: false, why: 'owned' };
    return { ok: true, kind: 'recipe', cost: (FUSION.recipe?.cost ?? 5) + extra, outs: [r.out] };
  }
  return { ok: false, why: 'recipe' };
}

export function blend(run, a, b, pick = 0) {
  const pv = blendPreview(run, a, b);
  if (!pv.ok || run.wick < pv.cost || !pv.outs[pick]) return { ok: false, why: pv.why || 'poor' };
  run.wick -= pv.cost;
  const out = pv.outs[pick], A = run.charms[a], B = run.charms[b];
  const inst = { id: out, stack: 0, counters: {} };
  run.charms[a] = inst;
  run.charms.splice(run.charms.indexOf(B), 1);
  if (!run.seen.includes(out)) run.seen.push(out);
  run.blend = null;
  run.stats.blends = (run.stats.blends || 0) + 1;
  if (pv.kind === 'recipe') {
    (run.fused ??= []).push(out);
    if (run.fused.length === 1) addFavour(run, 'wire', 1, 'recipe');
  }
  fire(run, 'onFuse', { a: A.id, b: B.id, out });
  return { ok: true, out, cost: pv.cost, kind: pv.kind };
}
