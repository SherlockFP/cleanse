// Bag, draws, lines, specials, pay order (TECH.md section 2, GDD.md section 6). Pure.
// Grid: array of 9 symbol ids, row-major. Held: array or Set of cell indices.
import { SYMBOLS } from './data/symbols.js';
import { LINES } from './data/lines.js';

const SYM = new Map(SYMBOLS.map((s) => [s.id, s]));
const sym = (id) => {
  const s = SYM.get(id);
  if (!s) throw new Error('unknown symbol ' + id);
  return s;
};
const heldSet = (held) => new Set(held ?? []);

export function makeBag(counts) {
  for (const id of Object.keys(counts)) sym(id);
  const ids = [], weights = [];
  // SYMBOLS order, not key order, so the same counts always make the same bag.
  for (const s of SYMBOLS) {
    const n = Number(counts[s.id]) || 0;
    if (n > 0) { ids.push(s.id); weights.push(n); }
  }
  const size = weights.reduce((a, b) => a + b, 0);
  return Object.freeze({ ids: Object.freeze(ids), weights: Object.freeze(weights), size });
}

export const bagOdds = (bag) => bag.ids.map((id, i) => ({ id, count: bag.weights[i], p: bag.weights[i] / bag.size }));

// One rng fork per cell (TECH.md section 4), so holding a cell never moves another cell's draw.
export function drawGrid(bag, rng, tide, spin, prevGrid, held) {
  if (bag.size <= 0) throw new Error('empty bag');
  const h = heldSet(held);
  return Array.from({ length: 9 }, (_, i) =>
    h.has(i) && prevGrid ? prevGrid[i] : rng.fork(`reel:${tide}:${spin}:${i}`).weighted(bag.ids, bag.weights));
}

// Which symbol a line makes, or null. Knot is wild; ctx.wild = { symId: 'all' | 'diag' } adds more wilds.
function resolve(line, grid, wildMode) {
  let knots = 0;
  const real = new Set();
  const extra = [];
  for (const i of line.cells) {
    const s = sym(grid[i]);
    if (s.type === 'wild') knots++;
    else if (s.type !== 'line') return null;
    else if (wildMode[s.id] === 'all' || (wildMode[s.id] === 'diag' && line.kind === 'diag')) extra.push(s);
    else real.add(s.id);
  }
  if (real.size > 1) return null;
  if (real.size === 1) return { sym: [...real][0], knots };
  if (!extra.length) return { sym: 'knot', knots }; // three Knots
  return { sym: extra.reduce((a, b) => (b.pay > a.pay ? b : a)).id, knots };
}

// ctx.skip = line ids that do not pay (Knotwork, Low Water). A line of held cells only is not returned.
export function findLines(grid, held, ctx = {}) {
  const h = heldSet(held);
  const skip = new Set(ctx.skip ?? []);
  const out = [];
  for (const line of LINES) {
    if (skip.has(line.id)) continue;
    const r = resolve(line, grid, ctx.wild ?? {});
    if (!r) continue;
    const heldCount = line.cells.filter((i) => h.has(i)).length;
    if (heldCount === 3) continue;
    out.push({ id: line.id, kind: line.kind, index: line.index, cells: line.cells, sym: r.sym, base: sym(r.sym).pay, knots: r.knots, heldCount });
  }
  return out;
}

// Cells of two-of-a-kind in a line whose third cell does not match: pulsed to invite a peg. Never used for timing.
export function findPairs(grid) {
  const cells = new Set();
  for (const line of LINES) {
    if (resolve(line, grid, {})) continue;
    const types = line.cells.map((i) => sym(grid[i]).type);
    for (const id of new Set(line.cells.map((i) => grid[i]))) {
      if (sym(id).type !== 'line' && id !== 'knot') continue;
      const match = line.cells.filter((_, k) => grid[line.cells[k]] === id || (id !== 'knot' && types[k] === 'wild'));
      if (match.length === 2) match.forEach((i) => cells.add(i));
    }
  }
  return [...cells].sort((a, b) => a - b);
}

const neighbors = (i) => {
  const r = Math.floor(i / 3), c = i % 3, out = [];
  if (r > 0) out.push(i - 3);
  if (r < 2) out.push(i + 3);
  if (c > 0) out.push(i - 1);
  if (c < 2) out.push(i + 1);
  return out;
};

// state: { kelp (counter, default 1), kelpStep, kelpMax, lineCtx (for findLines),
//          applyTrinkets(hook, state, payload) -> steps[] (injected; reel.js never imports trinkets.js) }.
// Steps: { type: 'lineAdd', amount } | { type: 'lineMul', factor } (onLine only) | { type: 'spinAdd', amount } | { type: 'spinMul', factor }.
// Order (GDD.md section 6): per line (base + line adds) x line muls; specials in reading order; spin adds; spin muls; one ceil.
export function scoreSpin(grid, held, state = {}) {
  const h = heldSet(held);
  const heldList = [...h];
  const landed = grid.map((_, i) => !h.has(i));
  const trinketSteps = [];
  let spinAdd = 0, spinMul = 1;
  const run = (hook, payload, lineStepsOk) => {
    const steps = state.applyTrinkets ? state.applyTrinkets(hook, state, { ...payload, grid, held: heldList, landed }) ?? [] : [];
    const own = { add: 0, mul: 1 };
    for (const s of steps) {
      trinketSteps.push({ hook, ...s });
      if (s.type === 'spinAdd') spinAdd += s.amount;
      else if (s.type === 'spinMul') spinMul *= s.factor;
      else if (lineStepsOk && s.type === 'lineAdd') own.add += s.amount;
      else if (lineStepsOk && s.type === 'lineMul') own.mul *= s.factor;
      else throw new Error(`step ${s.type} not allowed in ${hook}`);
    }
    return own;
  };

  const lines = findLines(grid, held, state.lineCtx).map((line) => {
    const { add, mul } = run('onLine', { line }, true);
    return { ...line, add, mul, total: (line.base + add) * mul };
  });

  const specials = [];
  let kelp = state.kelp ?? 1;
  let kelpPaid = false;
  grid.forEach((id, i) => {
    const r = sym(id).rule;
    if (!r) return;
    if (r.kind === 'adjacent') {
      // a pair counts only if the special or the neighbor landed this spin
      const count = neighbors(i).filter((j) => r.targets.includes(grid[j]) && (landed[i] || landed[j])).length;
      if (count) specials.push({ cell: i, sym: id, count, pay: count * r.per });
    } else if (r.kind === 'counter' && landed[i] && !kelpPaid) {
      kelpPaid = true;
      const max = state.kelpMax ?? r.max;
      kelp = Math.min(kelp, max); // the counter can sit above the max after Kelp Pot is sold
      specials.push({ cell: i, sym: id, count: 1, pay: kelp });
      kelp = Math.min(max, kelp + (state.kelpStep ?? r.step));
    }
  });
  run('onSpecial', { specials }, false);

  const lineSum = lines.reduce((a, l) => a + l.total, 0);
  const specialSum = specials.reduce((a, s) => a + s.pay, 0);
  run('onSpinTotal', { lines, specials }, false);

  // 1e-9 keeps ceil from jumping on float noise; max() avoids -0.
  const total = Math.max(0, Math.ceil((lineSum + specialSum + spinAdd) * spinMul - 1e-9));
  return { lines, specials, trinketSteps, spinAdd, spinMul, total, pairs: findPairs(grid), kelp };
}
