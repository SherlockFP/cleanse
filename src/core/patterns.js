// Pattern matching on a 15-cell grid (row-major, 5 columns x 3 rows).
import { PATTERN_DATA, SYM, SCORING } from './data.js';

export const PATTERNS = PATTERN_DATA.map((p) => ({ ...p, sets: p.cells.map((c) => new Set(c)) }));
export const PATTERN = Object.fromEntries(PATTERNS.map((p) => [p.id, p]));
const BY_VALUE = [...SCORING].sort((a, b) => SYM[b].value - SYM[a].value);

export const cellsOf = (id, placement) => PATTERN[id].cells[placement];
export const zoneOf = (cell) => ({
  corner: cell === 0 || cell === 4 || cell === 10 || cell === 14,
  edge: cell % 5 === 0 || cell % 5 === 4,
  midrow: cell >= 5 && cell <= 9,
});

// Returns {sym, wisps} when every cell is `sym` or stands in for it, else null.
function matchCells(grid, cells, wilds, favs) {
  const present = new Set();
  for (const c of cells) if (SYM[grid[c]].kind === 'score') present.add(grid[c]);
  for (const sym of BY_VALUE) {
    if (!present.has(sym)) continue;
    let odd = 0, wisps = 0;
    for (const c of cells) {
      const g = grid[c];
      if (g === sym) continue;
      if (SYM[g].kind === 'wild' || (wilds.mask && g === 'mask') || (wilds.ash && g === 'ash' && favs.includes(sym))) wisps++;
      else odd++;
    }
    if (odd === 0) return { sym, wisps };
    if (odd === 1 && wilds.five && cells.length === 5) return { sym, wisps: wisps + 1 };
  }
  return null;
}

export function findPatterns(grid, mods, favs = []) {
  const f = mods?.flags || {};
  const wilds = { mask: !!f.maskWild, ash: !!f.ashIsFav, five: !!f.fiveNeedsFour };
  const out = [];
  for (const P of PATTERNS) {
    for (const cells of P.cells) {
      const m = matchCells(grid, cells, wilds, favs);
      if (m) out.push({ id: P.id, cells, sym: m.sym, wisps: m.wisps });
    }
  }
  return out.filter(
    (p) => !out.some((q) => q !== p && q.sym === p.sym && PATTERN[q.id].beats.includes(p.id) && p.cells.every((c) => q.cells.includes(c))),
  );
}
