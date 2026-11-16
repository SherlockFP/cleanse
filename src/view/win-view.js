// The win sequence: each pattern is drawn (reel-view.playPatterns), the moment its last cell lights its payout pops up over the shape, and a
// running total counts up to the spin's final number. Pure planners first (no three), meshes after.
import { PAL, PATTERN_COLORS } from './palette.js';
import { highlightPlan } from './reel-view.js';
import { place, Label, clamp01, easeOut, popScale } from './kit.js';

export const COUNT_TAIL = 0.4;   // after the last pattern the total moves on to the final number (heat and charm multipliers) over this long
export const POP_LIFE = 0.95;    // a payout number lives this long: pop, rise, fade
export const HOLD = 0.7;         // the total stays this long after it arrives, then fades
export const MAX_POPS = 6;

// patterns: [{cells, pay}] in evaluation order. total: the spin's final number (may exceed the sum of pays: multipliers, flat bonuses).
export function winPlan(patterns, total, hlOpts = {}) {
  const hl = highlightPlan(patterns, hlOpts), pops = [], stops = [{ at: 0, v: 0 }];
  let cum = 0;
  for (const s of hl.steps) if (s.last) {
    const pay = Math.max(0, Math.round(patterns[s.p].pay ?? 0)), at = s.at + s.dur;
    cum += pay; pops.push({ p: s.p, at, pay, cum, cells: patterns[s.p].cells });
    stops.push({ at, v: cum });
  }
  const tail = (stops.at(-1)?.at ?? 0) + (pops.length ? 0.15 : 0);
  total = Math.max(0, Math.round(total ?? cum));
  stops.push({ at: tail + COUNT_TAIL, v: Math.max(total, cum) });
  return { pops, stops, total: stops.at(-1).v, end: tail + COUNT_TAIL, hl };
}
// The counter's value at time t: it eases up to each pattern's running sum as that pattern's payout pops, then to the total. Never goes down.
export function countAt(plan, t) {
  const s = plan.stops;
  if (t <= 0) return 0;
  for (let i = 1; i < s.length; i++) {
    if (t < s[i].at) { const a = s[i - 1], u = (t - a.at) / Math.max(1e-6, s[i].at - a.at); return Math.round(a.v + (s[i].v - a.v) * easeOut(u)); }
  }
  return s.at(-1).v;
}
export const fmt = (n) => Math.round(n).toLocaleString('en-US');

export class WinView {
  constructor(root) {
    this.pops = Array.from({ length: MAX_POPS }, () => ({ label: new Label(root, 52, 256, 96), t: 99, x: 0, y: 0, col: PAL.candle }));
    this.total = new Label(root, 54, 384, 128);
    this.L = null; this.ev = null; this.next = 0; this.time = 0;
  }
  layout(L) { this.L = L; }
  // opts: { colors, onPop({p, pay, cum}) } Resolves after the total has settled (it keeps showing for HOLD, then fades on its own).
  start(patterns, total, opts = {}) {
    this.finish();
    const plan = winPlan(patterns, total, opts.hl);
    if (!plan.pops.length && plan.total <= 0) return Promise.resolve(); // nothing to show
    return new Promise((resolve) => { this.ev = { plan, t: 0, fired: 0, resolve, colors: opts.colors ?? PATTERN_COLORS, onPop: opts.onPop, tail: 0, patterns }; });
  }
  popAt(p) {
    const e = this.ev, L = this.L, pop = e.plan.pops.find((q) => q.p === p); if (!pop) return;
    const cs = pop.cells.map((i) => L.cells[i]), n = cs.length || 1;
    const slot = this.pops[this.next++ % MAX_POPS];
    slot.x = cs.reduce((a, c) => a + c.x + c.w / 2, 0) / n; slot.y = cs.reduce((a, c) => a + c.y + c.h / 2, 0) / n - L.cells[0].h * 0.15; slot.t = 0;
    slot.col = e.colors[p % e.colors.length]; slot.label.set(`+${fmt(pop.pay)}`, slot.col, 0.66);
    e.onPop?.({ p: pop.p, pay: pop.pay, cum: pop.cum });
  }
  // Show the end state at once (a tap skips the show): every payout is dropped, the total reads its final number, then it fades.
  finish() {
    const e = this.ev; if (!e) return;
    this.ev = null; this.hidePops();
    this.tailState = { v: e.plan.total, t: 0 };
    e.resolve();
  }
  hidePops() { this.pops.forEach((s) => { s.t = 99; s.label.visible = false; }); }
  update(dt) {
    const L = this.L; if (!L) return;
    const H = L.screen.h, cell = L.cells[0].w, e = this.ev;
    let value = null, alpha = 1;
    if (e) {
      e.t += dt;
      while (e.fired < e.plan.pops.length && e.plan.pops[e.fired].at <= e.t) this.popAt(e.plan.pops[e.fired++].p);
      value = countAt(e.plan, e.t);
      if (e.t >= e.plan.end) { this.tailState = { v: e.plan.total, t: 0 }; this.ev = null; e.resolve(); value = null; }
    }
    if (value === null && this.tailState) {
      const s = this.tailState; s.t += dt;
      value = s.v; alpha = 1 - clamp01((s.t - HOLD) / 0.4);
      if (s.t >= HOLD + 0.4) this.tailState = null;
    }
    const L2 = this.total, g = L.grid, gw = L.cells[4].x + cell - g.x;
    L2.visible = value !== null && value > 0;
    if (L2.visible) {
      L2.set(fmt(value), PAL.bone, 0.7);
      const w = Math.min(gw * 0.6, cell * 3.2), h = w * (128 / 384);
      place(L2.mesh, { x: g.x + (gw - w) / 2, y: L.cells[10].y + (cell - h) / 2, w, h }, H);
      L2.mesh.material.opacity = alpha;
    }
    for (const s of this.pops) {
      s.label.visible = s.t < POP_LIFE;
      if (!s.label.visible) continue;
      s.t += dt;
      const u = s.t / POP_LIFE, w = cell * 1.5, h = w * (96 / 256), k = popScale(Math.min(1, s.t / 0.25));
      place(s.label.mesh, { x: s.x - w / 2, y: s.y - h / 2 - u * cell * 0.6, w, h }, H, k, k);
      s.label.mesh.material.opacity = 1 - clamp01((u - 0.55) / 0.45);
    }
  }
}
