// In-run rank-up. On the 2nd, 4th and 6th debt paid the machine gains an overlay: rung 1 an awning, rung 2 a stall sign, rung 3 a neon crest
// (machine/awning_1..3). `rankUp(n)` is the beat: the new piece drops in from above with a bounce, a short shake, and the caller flies coins.
import { Spring } from './springs.js';
import { place, sprite, fitIn } from './kit.js';
import { spriteSize } from './sprites.js';

export const RUNGS = 3;
export const rungOfPaid = (paid) => Math.min(RUNGS, Math.floor(paid / 2)); // debts paid in this run -> rung 0..3
export const rungIds = (n) => Array.from({ length: Math.max(0, Math.min(RUNGS, n)) }, (_, i) => `machine/awning_${i + 1}`);

// Where each piece sits, from the omen row and the grid: awning across the top, sign on the left, neon crest on the right.
export function rungRects(L, sizeOf = spriteSize) {
  const g = L.grid, gw = L.cells[4].x + g.cell - g.x, o = L.omen;
  const out = [];
  const sz = (id, w, maxH) => { const [sw, sh] = sizeOf(id); return fitIn({ x: 0, y: 0, w, h: maxH }, sw, sh); };
  const a = sz('machine/awning_1', gw * 1.04, g.cell * 0.9); out.push({ x: g.x + (gw - a.w) / 2, y: o.y + o.h * 0.5 - a.h, w: a.w, h: a.h });
  const s = sz('machine/awning_2', gw * 0.3, g.cell * 0.9); out.push({ x: g.x, y: o.y - s.h * 0.55, w: s.w, h: s.h });
  const n = sz('machine/awning_3', gw * 0.3, g.cell * 0.9); out.push({ x: g.x + gw - n.w, y: o.y - n.h * 0.55, w: n.w, h: n.h });
  return out;
}

export class RungView {
  constructor(root) {
    this.items = Array.from({ length: RUNGS }, (_, i) => ({ mesh: sprite(root, `machine/awning_${i + 1}`, 24 + i * 0.1), drop: new Spring(0, 140, 9), on: false }));
    this.L = null; this.n = 0; this.vis = true;
  }
  setVisible(v) { this.vis = v; }
  layout(L) { this.L = L; }
  // Static state, no animation (loading a save, or a new run).
  set(n) { this.n = Math.max(0, Math.min(RUNGS, n | 0)); this.items.forEach((it, i) => { it.on = i < this.n; it.drop.x = it.drop.t = it.on ? 1 : 0; it.drop.v = 0; }); }
  // The beat: rung n lands from above.
  rankUp(n) {
    n = Math.max(1, Math.min(RUNGS, n | 0));
    this.n = n; this.items.forEach((it, i) => { if (i < n - 1) { it.on = true; it.drop.x = it.drop.t = 1; } });
    const it = this.items[n - 1]; it.on = true; it.drop.x = -0.6; it.drop.v = 0; it.drop.t = 1;
  }
  update(dt) {
    const L = this.L; if (!L) return;
    const rects = rungRects(L), H = L.screen.h;
    this.items.forEach((it, i) => {
      it.drop.step(dt);
      it.mesh.visible = this.vis && it.on;
      if (!it.mesh.visible) return;
      const r = rects[i], k = it.drop.x;
      place(it.mesh, { ...r, y: r.y - (1 - k) * r.h * 1.4 }, H); // k 1 = at rest; below 1 it is still above its place
    });
  }
}
