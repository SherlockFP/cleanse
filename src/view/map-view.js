// The map scene: `bg/map` fills the column and the ten places hang on it as pins along a winding path (Soi Cart at the bottom, the Sky Bar at the
// top). Pin states: locked (dim), open, current (hops), plus a bronze, silver or gold stamp for the best result there. Also the per-place
// run backgrounds: bg/c1..c10, c1 is bg/fair; a place whose art has not landed borrows bg/fair under its own tint.
import { getTex, spriteSize, hasReal } from './sprites.js';
import { Spring } from './springs.js';
import { PAL } from './palette.js';
import { place, sprite, box, Label, fitIn } from './kit.js';

// Pin centres as fractions of the map (x, y), c1..c10. A zig-zag from the south to the north.
export const PLACE_PINS = Object.freeze([
  [0.30, 0.90], [0.66, 0.81], [0.32, 0.71], [0.68, 0.62], [0.30, 0.53], [0.67, 0.44], [0.30, 0.35], [0.66, 0.27], [0.34, 0.20], [0.64, 0.13],
].map((p) => Object.freeze(p)));
export const PLACE_COUNT = PLACE_PINS.length;
const TINTS = ['#ffffff', '#ffd9a8', '#ffb8a0', '#c9b8ff', '#a8e0ff', '#d8c8b0', '#ffa8d8', '#a8c8ff', '#c8d8c0', '#e0e0ff'];
export const placeBgId = (n) => (n <= 1 ? 'bg/fair' : `bg/c${n}`);
// Which texture and tint the run background uses for place n (1..10).
export function placeBg(n) {
  n = Math.max(1, Math.min(PLACE_COUNT, n | 0 || 1));
  const id = placeBgId(n);
  return hasReal(id) || n === 1 ? { id, tint: '#ffffff' } : { id: 'bg/fair', tint: TINTS[n - 1] };
}

// Pin rects (layout px) for the places inside the column rect `col`; the map picture is covered like a background (cropped, centred).
export function pinRects(col, mapW, mapH, size) {
  const k = Math.max(col.w / mapW, col.h / mapH), w = mapW * k, h = mapH * k, x0 = col.x + (col.w - w) / 2, y0 = col.y + (col.h - h) / 2;
  return PLACE_PINS.map(([fx, fy]) => ({ x: x0 + fx * w - size / 2, y: y0 + fy * h - size, w: size, h: size })); // the tip of the pin is the point
}
const STAMPS = { bronze: 'ui/stamp_bronze', silver: 'ui/stamp_silver', gold: 'ui/stamp_gold' };

export class MapView {
  constructor(root) {
    this.bg = sprite(root, 'bg/map', 1); this.path = Array.from({ length: PLACE_COUNT - 1 }, () => box(root, PAL.bone, 2));
    this.pins = PLACE_PINS.map((_, i) => ({
      pin: sprite(root, 'ui/map_pin', 30), stamp: sprite(root, 'ui/stamp_gold', 31), num: new Label(root, 32, 96, 64), sp: new Spring(1, 320, 10), state: 'locked', medal: '', id: `c${i + 1}`,
    }));
    this.pins.forEach((p, i) => p.num.set(String(i + 1), PAL.bone, 0.8));
    this.on = false; this.cur = -1; this.time = 0; this.L = null; this.rects = [];
  }
  get visible() { return this.on; }
  show(on) { this.on = on; if (!on) this.hide(); }
  hide() { this.bg.visible = false; this.path.forEach((m) => { m.visible = false; }); this.pins.forEach((p) => { p.pin.visible = p.stamp.visible = p.num.visible = false; }); }
  layout(L) { this.L = L; }
  // places: [{id?, state: 'locked' | 'open' | 'current', medal?: 'bronze' | 'silver' | 'gold'}] in c1..c10 order.
  set(places = [], current = -1) {
    this.pins.forEach((p, i) => { const s = places[i]; p.state = s?.state ?? 'locked'; p.medal = s?.medal ?? ''; if (s?.id) p.id = s.id; });
    if (current !== this.cur) { this.cur = current; if (current >= 0) this.pins[current]?.sp.kick(10); }
  }
  // Which pin a tap hit (an index 0..9, or -1). Locked pins can be tapped too: the screen explains what unlocks them.
  pinAt(x, y) {
    let best = -1, bd = 1e9;
    this.rects.forEach((r, i) => {
      const cx = r.x + r.w / 2, cy = r.y + r.h * 0.45, d = Math.hypot(x - cx, y - cy);
      if (d < r.w * 0.8 && d < bd) { bd = d; best = i; }
    });
    return best;
  }
  update(dt) {
    if (!this.on || !this.L) return;
    this.time += dt;
    const L = this.L, H = L.screen.h, col = L.column, [mw, mh] = spriteSize('bg/map');
    const tex = getTex('bg/map'), k = Math.max(col.w / mw, col.h / mh);
    tex.repeat?.set(col.w / (mw * k), col.h / (mh * k)); tex.offset?.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
    this.bg.visible = true; place(this.bg, col, H);
    const size = Math.max(34, Math.min(col.w * 0.13, 58));
    this.rects = pinRects(col, mw, mh, size);
    const mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h * 0.45 });
    this.path.forEach((m, i) => {
      const a = mid(this.rects[i]), b = mid(this.rects[i + 1]), open = this.pins[i + 1].state !== 'locked';
      m.visible = true; m.material.opacity = open ? 0.8 : 0.25;
      m.position.set((a.x + b.x) / 2, H - (a.y + b.y) / 2, 0); m.rotation.z = Math.atan2(-(b.y - a.y), b.x - a.x);
      m.scale.set(Math.hypot(b.x - a.x, b.y - a.y), Math.max(2, size * 0.07), 1);
    });
    this.pins.forEach((p, i) => {
      p.sp.step(dt);
      const r = this.rects[i], locked = p.state === 'locked', here = p.state === 'current' || i === this.cur;
      const hop = here ? Math.abs(Math.sin(this.time * 3)) * r.h * 0.12 : 0, kx = p.sp.x;
      const f = fitIn({ ...r, y: r.y - hop }, ...spriteSize('ui/map_pin'));
      p.pin.visible = true; place(p.pin, f, H, kx, kx);
      p.pin.material.color.set(locked ? '#5a5060' : here ? '#ffe9b0' : '#ffffff');
      p.num.visible = true; place(p.num.mesh, { x: r.x + r.w * 0.2, y: r.y - hop + r.h * 0.12, w: r.w * 0.6, h: r.h * 0.4 }, H);
      p.num.mesh.material.opacity = locked ? 0.5 : 1;
      p.stamp.visible = !!p.medal;
      if (p.medal) {
        const m = STAMPS[p.medal] ?? STAMPS.bronze, t = getTex(m);
        if (p.stamp.material.map !== t) { p.stamp.material.map = t; p.stamp.material.needsUpdate = true; }
        place(p.stamp, { x: r.x + r.w * 0.55, y: r.y - hop + r.h * 0.5, w: r.w * 0.55, h: r.w * 0.55 }, H);
      }
    });
  }
}
