// Trinket hooks (TECH.md section 2). Pure: no DOM, no clock, no random.
// applyTrinkets(hook, state, payload) asks every trinket on state.trinkets (ids or { id, ...data }) and combines the answers:
//   onLine / onSpecial / onSpinTotal / onDraw -> steps [{ type: lineAdd | lineMul | spinAdd | spinMul, ... }] (scoreSpin applies them in fixed order)
//   onRunStart / onTideStart / onTideEnd / onShop -> { coins }
//   onQuota -> multiplier; onPrice -> { mul, free }; onRemoveToken -> { free }; onMercy -> { gap, uses }
//   onPegSupply / onPegNeed / onHoldExpire / onSpinsPerTide / onColumnRespin -> number to add
//   onPeg -> undefined
// No lite trinket uses onRunStart, onDraw, onPeg, onShop, onPegNeed, onHoldExpire or onColumnRespin: they answer the neutral value.
import { TRINKETS, HOOKS } from './data/trinkets.js';

const BY_ID = new Map(TRINKETS.map((t) => [t.id, t]));
const lineAdd = (amount) => ({ type: 'lineAdd', amount });
const lineMul = (factor) => ({ type: 'lineMul', factor });
const spinAdd = (amount) => ({ type: 'spinAdd', amount });
const spinMul = (factor) => ({ type: 'spinMul', factor });
const landedCount = (x, sym) => x.grid.filter((s, i) => s === sym && x.landed[i]).length;
const near = (i) => {
  const r = Math.floor(i / 3), c = i % 3, out = [];
  if (r > 0) out.push(i - 3);
  if (r < 2) out.push(i + 3);
  if (c > 0) out.push(i - 1);
  if (c < 2) out.push(i + 1);
  return out;
};
const onSym = (p, x) => x.line.sym === p.sym;

// id -> { hook: (params, state, payload, entry) => result }. settle: (params, entry, result) runs once after a spin (settleSpin).
export const EFFECTS = {
  salt_barrel: { onLine: (p, s, x) => (onSym(p, x) ? [lineAdd(p.add)] : []) },
  fish_cart: { onSpinTotal: (p, s, x) => (landedCount(x, p.sym) >= p.minLanded ? [spinAdd(p.add)] : []) },
  net_mender: {
    onSpecial: (p, s, x) => {
      const n = x.specials.filter((q) => q.sym === p.sym).reduce((a, q) => a + q.count, 0);
      return n ? [spinAdd(n * p.addPerAdjacent)] : [];
    },
  },
  fish_hook: { onLine: (p, s, x) => (onSym(p, x) ? [lineMul(p.mul)] : []) },
  ice_crate: {
    onLine: (p, s, x) => {
      const n = onSym(p, x) ? x.line.cells.filter((c) => x.held.includes(c) && x.grid[c] === p.sym).length : 0;
      return n ? [lineAdd(n * p.addPerHeldSym)] : [];
    },
  },
  pier_cat: {
    onLine: (p, s, x) => (onSym(p, x) ? [lineAdd(p.add)] : []),
    // Cat pays x2: the extra half of its pay is one more spin add (specials are summed before spin adds, so the result is the same).
    onSpecial: (p, s, x) => {
      const n = x.specials.filter((q) => q.sym === p.catSym).reduce((a, q) => a + q.pay, 0);
      return n ? [spinAdd(n * (p.catMul - 1))] : [];
    },
  },
  fish_scale: {
    // The bonus is read before the spin and grows after it (settle), so line order inside a spin never matters.
    onLine: (p, s, x, e) => (onSym(p, x) && e.bonus ? [lineAdd(e.bonus)] : []),
    settle: (p, e, r) => {
      const paid = r.lines.filter((l) => l.sym === p.sym && l.total > 0).length;
      e.bonus = Math.min(p.cap, (e.bonus || 0) + p.growPerPaidLine * paid);
    },
  },
  full_net: { onSpinTotal: (p, s, x) => (landedCount(x, p.sym) >= p.minLanded ? [spinAdd(p.add)] : []) },

  samovar_tap: { onLine: (p, s, x) => (onSym(p, x) ? [lineAdd(p.add)] : []) },
  lantern_oil: { onLine: (p, s, x) => (onSym(p, x) ? [lineAdd(p.add)] : []) },
  sugar_cube: {
    // A Tea glass counts once if a Lantern touches it, and only if the Tea or that Lantern landed this spin.
    onSpinTotal: (p, s, x) => {
      const n = x.grid.filter((id, i) => id === p.sym && near(i).some((j) => x.grid[j] === p.nextTo && (x.landed[i] || x.landed[j]))).length;
      return n ? [spinAdd(n * p.add)] : [];
    },
  },
  warm_rug: { onSpinTotal: (p, s, x) => (s.spin >= p.fromSpin && s.spin <= p.toSpin && x.held.length === 0 ? [spinAdd(p.add)] : []) },
  grandmas_cup: { onLine: (p, s, x) => (onSym(p, x) ? [lineMul(p.mul)] : []) },
  hearth_stone: { onTideEnd: (p, s, x) => ({ coins: Math.min(p.max, Math.floor(p.pct * x.jar)) }) }, // x.jar: after the quota, before any tide-end coins
  wick_trimmer: { onLine: (p, s, x) => (onSym(p, x) && p.lineIds.includes(x.line.id) ? [lineMul(p.mul)] : []) },
  tea_garden: {
    onSpinTotal: (p, s, x) => (p.syms.every((id) => x.lines.some((l) => l.sym === id)) ? [spinMul(p.mul)] : []),
  },

  spare_peg: { onPegSupply: (p) => p.add },
  steady_hand: { onLine: (p, s, x) => (x.line.heldCount === p.heldCells ? [lineAdd(p.add)] : []) },
  brass_peg: {
    onSpinTotal: (p, s, x) => {
      const cells = new Set(x.lines.flatMap((l) => l.cells.filter((c) => x.held.includes(c))));
      return cells.size ? [spinAdd(cells.size * p.addPerHeldCell)] : [];
    },
  },

  first_light: { onSpinTotal: (p, s) => (s.spin === p.spin ? [spinMul(p.mul)] : []) },
  tide_table: { onSpinTotal: (p, s) => (s.spin % p.everySpin === 0 ? [spinAdd(p.add)] : []) },
  dry_spell: { onSpinTotal: (p, s) => (s.prevZero ? [spinMul(p.mul)] : []) },
  night_tide: { onSpinTotal: (p, s) => (s.spin === s.spins ? [spinMul(p.mul)] : []) },
  lucky_sandal: {
    onSpinTotal: (p, s, x, e) => ((e.charges || 0) >= p.charges ? [spinAdd(p.add)] : []),
    settle: (p, e, r) => {
      if ((e.charges || 0) >= p.charges) e.charges = 0; // the charged spin used them
      else if (r.total === 0) e.charges = (e.charges || 0) + 1;
    },
  },
  slack_water: { onQuota: (p) => p.mul },
  orhans_watch: { onSpinsPerTide: (p) => p.spins, onPegSupply: (p) => p.pegs },
  second_wind: { onMercy: (p) => ({ gap: p.gap, uses: p.uses }) },

  tin_cup: { onTideStart: (p) => ({ coins: p.coins }) },
  lucky_ledger: { onPrice: (p, s, x) => (x.item.kind === 'reroll' && x.item.index < p.freeRerollsPerShop ? { free: true } : {}) },
  pebble_jar: { onLine: (p, s, x) => (onSym(p, x) ? [lineAdd(p.add)] : []) },
  skipping_stone: {
    onSpinTotal: (p, s, x) => {
      const n = Math.min(p.max, Math.floor(landedCount(x, p.sym) / p.perLanded) * p.add);
      return n ? [spinAdd(n)] : [];
    },
  },
  hagglers_cap: { onPrice: (p, s, x) => (x.item.kind === 'trinket' || x.item.kind === 'token' ? { mul: p.mul } : {}) },
  junk_cart: { onRemoveToken: (p, s, x) => (x.removalsThisShop < p.freePerShop ? { free: true } : {}) },
  kelp_pot: { onSpecial: () => [] }, // the counter step and max are read by scoringState
  sea_chest: { onTideEnd: (p, s) => ({ coins: p.coinsPerTrinket * s.trinkets.length }) },
};

const asEntry = (t) => (typeof t === 'string' ? { id: t } : t);

// How each hook's answers combine. `zero` is the answer when no trinket speaks.
const KIND = {
  onLine: 'steps', onSpecial: 'steps', onSpinTotal: 'steps', onDraw: 'steps',
  onRunStart: 'coins', onTideStart: 'coins', onTideEnd: 'coins', onShop: 'coins',
  onQuota: 'mul', onPrice: 'price', onRemoveToken: 'price', onMercy: 'mercy',
  onPegSupply: 'sum', onPegNeed: 'sum', onHoldExpire: 'sum', onSpinsPerTide: 'sum', onColumnRespin: 'sum',
  onPeg: 'none',
};

export function applyTrinkets(hook, state, payload = {}) {
  if (!HOOKS.includes(hook)) throw new Error('unknown hook ' + hook);
  const kind = KIND[hook];
  const answers = [];
  for (const t of state.trinkets ?? []) {
    const e = asEntry(t);
    const fn = EFFECTS[e.id]?.[hook];
    if (fn) answers.push(fn(BY_ID.get(e.id).params, state, payload, e));
  }
  switch (kind) {
    case 'steps': return answers.flat();
    case 'coins': return { coins: answers.reduce((a, r) => a + r.coins, 0) };
    case 'mul': return answers.reduce((a, r) => a * r, 1);
    case 'sum': return answers.reduce((a, r) => a + r, 0);
    case 'price': return {
      mul: answers.reduce((a, r) => a * (r.mul ?? 1), 1),
      free: answers.some((r) => r.free),
    };
    case 'mercy': return answers.reduce((a, r) => ({ gap: Math.max(a.gap, r.gap), uses: Math.max(a.uses, r.uses) }), { gap: 0, uses: 0 });
    default: return undefined;
  }
}

// State for scoreSpin: base is { trinkets, spin, spins, prevZero, kelp, linePayMul, lineSkip }.
// Adds the injected applyTrinkets, lineCtx (skipped lines, chart line-pay multiplier) and the Kelp Pot step and max.
export function scoringState(base) {
  const s = { spin: 1, spins: 6, prevZero: false, trinkets: [], ...base };
  s.applyTrinkets = (hook, st, payload) => {
    const steps = applyTrinkets(hook, st, payload);
    if (hook === 'onLine' && st.linePayMul && st.linePayMul !== 1) steps.push(lineMul(st.linePayMul));
    return steps;
  };
  s.lineCtx = { skip: base.lineSkip ?? [], wild: {} };
  for (const t of s.trinkets) {
    const p = BY_ID.get(asEntry(t).id).params;
    if (p.sym === 'kelp') { s.kelpStep = p.step; s.kelpMax = p.max; }
  }
  return s;
}

// After a spin: trinkets that count things (Fishmonger's Scale, Lucky Sandal) update their own entry. Entries must be objects.
export function settleSpin(state, result) {
  for (const e of state.trinkets) EFFECTS[e.id]?.settle?.(BY_ID.get(e.id).params, e, result);
}
