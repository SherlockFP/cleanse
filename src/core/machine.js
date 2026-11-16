// The machine: weights, Favourite, rolling the 5x3 grid, edits after the roll.
import { SYMBOLS, SYM, SCORING, CONFIG } from './data.js';
import { stream } from './streams.js';
import { weightOf, luckOf } from './effects.js';

export const COLS = 5, ROWS = 3, CELLS = 15, CENTRE = 7;
const IDS = SYMBOLS.map((s) => s.id);

export function buildWeights(run, mods, favs = []) {
  const luck = luckOf(run, mods);
  const weights = IDS.map((id) => {
    if (run.removed.includes(id)) return 0;
    let w;
    if (id === 'ash') w = CONFIG.heat.ashWeightPerLevel * run.heat + (mods.flags.ashBase || 0);
    else w = SYM[id].weight * weightOf(mods, id);
    if (favs.includes(id)) w *= 1 + luck;
    return w;
  });
  return { ids: IDS, weights };
}

// Weighted pick of the Favourite(s) among scoring symbols. Uses the `spin` stream.
export function pickFavourites(run, mods, rng = stream(run, 'spin')) {
  const f = mods.flags;
  if (f.favPerRound && run.roundFav?.serial === run.roundSerial) return [...run.roundFav.favs];
  const { ids, weights } = buildWeights(run, mods, []);
  const cand = ids.filter((id) => SYM[id].kind === 'score' && weights[ids.indexOf(id)] > 0);
  const w = cand.map((id) => weights[ids.indexOf(id)]);
  const favs = [rng.weighted(cand, w)];
  if (f.twoFavs && cand.length > 1) {
    const rest = cand.filter((c) => !favs.includes(c));
    favs.push(rng.weighted(rest, rest.map((id) => w[cand.indexOf(id)])));
  }
  if (f.pickFav && run.starSym && !favs.includes(run.starSym)) favs.push(run.starSym);
  if (f.favPerRound) run.roundFav = { serial: run.roundSerial, favs: [...favs] };
  return favs;
}

function rollCell(wt, rng) {
  return rng.weighted(wt.ids, wt.weights);
}

// Roll all 15 cells (pinned cells keep their symbol), then fixed cells.
export function rollGrid(run, mods, favs, rng = stream(run, 'spin')) {
  const wt = buildWeights(run, mods, favs);
  const grid = new Array(CELLS);
  for (const p of run.pinned) grid[p.cell] = p.sym;
  for (let c = 0; c < CELLS; c++) if (!grid[c]) grid[c] = rollCell(wt, rng);
  if (mods.flags.deadCentre) grid[CENTRE] = 'ash';
  return grid;
}

export function rollRow(run, mods, favs, grid, row, rng = stream(run, 'spin')) {
  const wt = buildWeights(run, mods, favs);
  const g = grid.slice();
  for (let c = row * COLS; c < row * COLS + COLS; c++) g[c] = rollCell(wt, rng);
  if (mods.flags.deadCentre) g[CENTRE] = 'ash';
  return g;
}

export function rollCells(run, mods, favs, grid, cells, rng = stream(run, 'spin')) {
  const wt = buildWeights(run, mods, favs);
  const g = grid.slice();
  for (const c of cells) g[c] = rollCell(wt, rng);
  if (mods.flags.deadCentre) g[CENTRE] = 'ash';
  return g;
}

export function applyGridEdits(grid, edits) {
  const g = grid.slice();
  for (const e of edits) g[e.cell] = e.sym;
  return g;
}

const ZONE = {
  corner: [0, 4, 10, 14],
  edge: [0, 4, 5, 9, 10, 14],
  midrow: [5, 6, 7, 8, 9],
};

// transform then place, in rule order. `edits` are {type, n, from, to, sym, zone}.
export function applySpinEdits(run, mods, grid, favs, edits) {
  const g = grid.slice();
  const pinned = new Set(run.pinned.map((p) => p.cell));
  const fixed = (c) => pinned.has(c) || (mods.flags.deadCentre && c === CENTRE);
  const fx = stream(run, 'fx');
  for (const e of edits) {
    if (e.type !== 'transform') continue;
    const to = e.to === 'favoured' ? favs[0] : e.to;
    let n = e.n;
    for (let c = 0; c < CELLS && n > 0; c++) if (g[c] === e.from && !fixed(c)) { g[c] = to; n--; }
  }
  for (const e of edits) {
    if (e.type !== 'place') continue;
    if (e.zone) { for (const c of ZONE[e.zone]) if (!fixed(c)) g[c] = e.sym; continue; }
    const open = [];
    for (let c = 0; c < CELLS; c++) if (!fixed(c)) open.push(c);
    for (let i = 0; i < e.n && open.length; i++) g[open.splice(fx.int(open.length), 1)[0]] = e.sym;
  }
  return g;
}
