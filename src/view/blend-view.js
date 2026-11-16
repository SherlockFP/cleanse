// The Blender: charm A and charm B slide into Pip's jug, the jug rattles, the new charm pops out on top (with the gold rim when fused).
// Drawn inside the rect the stall gives it (the canvas must be visible there). Pure timeline first.
import { getTex, spriteSize } from './sprites.js';
import { place, sprite, fitIn, easeOut, easeInOut, popScale } from './kit.js';

export const BLEND = Object.freeze({ slide: 0.45, drop: 0.15, whirl: 0.7, pop: 0.45, hold: 0.3 });
export const blendEnd = () => BLEND.slide + BLEND.drop + BLEND.whirl + BLEND.pop + BLEND.hold;

// Phase of the animation at time t: { phase, u } with u 0..1 inside the phase.
export function blendPhase(t) {
  const { slide, drop, whirl, pop, hold } = BLEND;
  const edges = [['slide', slide], ['drop', drop], ['whirl', whirl], ['pop', pop], ['hold', hold]];
  let a = 0;
  for (const [phase, d] of edges) { if (t < a + d) return { phase, u: (t - a) / d }; a += d; }
  return { phase: 'done', u: 1 };
}
// Jug rattle: off before the whirl, full during it, gone by the end. Never more than +-6% of the jug width.
export const rattleAt = (t) => {
  const { phase, u } = blendPhase(t);
  return phase === 'whirl' ? Math.sin(t * 70) * 0.06 * Math.sin(u * Math.PI) : 0;
};

export class BlendView {
  constructor(root) {
    this.jug = sprite(root, 'machine/blender', 40); this.a = sprite(root, 'charm/ember', 42); this.b = sprite(root, 'charm/ember', 42);
    this.out = sprite(root, 'charm/ember', 43); this.rim = sprite(root, 'ui/fused_rim', 44);
    this.ev = null; this.H = 1;
  }
  layout(L) { this.H = L.screen.h; this.L = L; }
  // rect: where to draw (default: the middle of the machine). a, b, out: sprite ids of the charm icons. fused: add the gold rim.
  play({ rect, a, b, out, fused = false } = {}) {
    this.skip();
    const L = this.L, r = rect ?? { x: L.case.x, y: L.case.y, w: L.case.w, h: L.case.h };
    for (const [m, id] of [[this.a, a], [this.b, b], [this.out, out]]) { m.material.map = getTex(id); m.material.needsUpdate = true; }
    return new Promise((resolve) => { this.ev = { r, t: 0, fused, resolve }; });
  }
  skip() { if (this.ev) { const res = this.ev.resolve; this.ev = null; this.clear(); res(); } }
  clear() { for (const m of [this.jug, this.a, this.b, this.out, this.rim]) m.visible = false; }
  update(dt) {
    const e = this.ev; if (!e) return;
    e.t += dt;
    const { r, t } = e, H = this.H, { phase, u } = blendPhase(t);
    if (phase === 'done') { const res = e.resolve; this.ev = null; this.clear(); res(); return; }
    // jug: as large as fits in the centre two thirds of the rect, sitting on its lower edge
    const [jw, jh] = spriteSize('machine/blender'), jr = fitIn({ x: r.x + r.w * 0.2, y: r.y + r.h * 0.1, w: r.w * 0.6, h: r.h * 0.8 }, jw, jh);
    const rat = rattleAt(t) * jr.w;
    this.jug.visible = true; place(this.jug, { ...jr, x: jr.x + rat }, H);
    const mouth = { x: jr.x + jr.w / 2 + rat, y: jr.y + jr.h * 0.18 }, ic = Math.min(r.w, r.h) * 0.2;
    const icon = (m, x, y, k, o = 1) => { m.visible = k > 0.01; m.material.opacity = o; place(m, { x: x - ic / 2, y: y - ic / 2, w: ic, h: ic }, H, k, k); };
    const inFlight = phase === 'slide' || phase === 'drop';
    const slideK = phase === 'slide' ? easeInOut(u) : 1;
    for (const [m, side] of [[this.a, -1], [this.b, 1]]) {
      if (!inFlight) { m.visible = false; continue; }
      const sx = r.x + r.w / 2 + side * r.w * 0.42, x = sx + (mouth.x - sx) * slideK, y = r.y + r.h * 0.12 + (mouth.y - (r.y + r.h * 0.12)) * slideK + (phase === 'drop' ? u * ic * 0.5 : 0);
      icon(m, x, y, phase === 'drop' ? 1 - u : 1, 1 - (phase === 'drop' ? u : 0));
    }
    const popping = phase === 'pop' || phase === 'hold';
    const pk = phase === 'pop' ? popScale(u) : 1, rise = phase === 'pop' ? easeOut(u) : 1;
    icon(this.out, mouth.x, mouth.y - rise * ic * 1.1, popping ? pk * 1.25 : 0);
    this.rim.visible = popping && e.fused;
    if (this.rim.visible) { const s = ic * 1.25 * pk * 1.15; place(this.rim, { x: mouth.x - s / 2, y: mouth.y - rise * ic * 1.1 - s / 2, w: s, h: s }, H); }
  }
}
