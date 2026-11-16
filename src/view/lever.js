// The lever beside the machine. `Lever` is the pure state machine (no three, no DOM): drag the knob down, release past 70% of the travel to
// spin, release before it and it springs back with a rattle (a tease, no spin). A tap spins too (accessibility), and a swipe down on the
// reels is a second way to pull it (the strip is close to the screen edge, where Android's back gesture lives). `LeverView` draws it.
import * as THREE from 'three';
import { getTex, spriteSize } from './sprites.js';
import { PAL, PLUM_LIFT } from './palette.js';
import { PLANE, place, fitIn, easeOut } from './kit.js';

export const THRESHOLD = 0.7;   // release past this share of the travel: spin
export const TICKS = 5;         // detents along the travel (haptic ticks, or audio ticks where vibration does not exist)
export const TAP_PX = 8;        // less movement than this between down and up is a tap
export const SPRING_S = 0.22;   // the knob returns over 220 ms
const SWIPE_FRAC = 0.55;        // a swipe on the reels pulls the full travel over this share of the window height

export const outcomeOf = (travel, enabled = true) => (!enabled ? 'none' : travel >= THRESHOLD ? 'spin' : travel > 0.04 ? 'tease' : 'none');

// h: { spin(), tease(), tick(n 1..TICKS), thud() }  Rects are layout px, y down.
export class Lever {
  constructor(h = {}) { this.h = h; this.strip = null; this.reels = null; this.enabled = true; this.travel = 0; this.rattle = 0; this.drag = null; this.back = null; this.ticked = 0; this.thudded = false; this.t = 0; }
  setRects(strip, reels) { this.strip = strip; this.reels = reels; }
  setEnabled(on) { this.enabled = !!on; if (!on) this.drag = null; }
  // 'strip' (the lever itself, which the canvas must swallow even when it is disabled), 'reels' (swipe zone) or null.
  hit(x, y) {
    const in_ = (r) => r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
    return in_(this.strip) ? 'strip' : in_(this.reels) ? 'reels' : null;
  }
  get busy() { return !!this.back; }
  cancel() { this.drag = null; this.travel = 0; }
  down(x, y, zone = this.hit(x, y)) {
    if (!zone || !this.enabled || this.back) return false;
    this.drag = { zone, x0: x, y0: y, moved: false, live: zone === 'strip' }; this.travel = 0; this.ticked = 0; this.thudded = false;
    return true;
  }
  move(x, y) {
    const d = this.drag; if (!d) return;
    const dx = x - d.x0, dy = y - d.y0;
    if (Math.hypot(dx, dy) > TAP_PX) d.moved = true;
    if (!d.live) { if (d.moved && dy > 0 && dy > Math.abs(dx)) d.live = true; else return; } // a swipe must be mostly downward
    const len = d.zone === 'strip' ? this.strip.h * 0.62 : this.reels.h * SWIPE_FRAC;
    this.travel = Math.max(0, Math.min(1, dy / len));
    const n = Math.min(TICKS, Math.floor(this.travel * TICKS + 1e-9));
    while (this.ticked < n) this.h.tick?.(++this.ticked);
    if (this.travel >= 1 && !this.thudded) { this.thudded = true; this.h.thud?.(); }
  }
  // Pointer up. Returns 'spin', 'tease' or 'none'. A tap on the strip counts as a full pull.
  up() {
    const d = this.drag; this.drag = null; if (!d) return 'none';
    const tap = !d.moved && d.zone === 'strip';
    if (!tap && !d.live) return 'none';
    const out = tap ? 'spin' : outcomeOf(this.travel, this.enabled);
    if (tap) { this.travel = 1; this.h.thud?.(); }
    this.back = { from: this.travel, t: 0 };
    if (out === 'spin') this.h.spin?.(); else if (out === 'tease') { this.rattle = 0.06; this.h.tease?.(); }
    return out;
  }
  step(dt) {
    this.t += dt;
    if (this.back) {
      this.back.t += dt; const u = Math.min(1, this.back.t / SPRING_S);
      this.travel = this.back.from * (1 - easeOut(u));
      if (u >= 1) { this.back = null; this.travel = 0; }
    }
    this.rattle *= Math.exp(-dt * 9);
    if (this.rattle < 0.002) this.rattle = 0;
  }
  // Where the knob is drawn, 0..1 (the rattle is a small shake on top while a tease settles).
  shown() { return Math.max(0, Math.min(1, this.travel + Math.sin(this.t * 60) * this.rattle)); }
}

export class LeverView {
  constructor(root, handlers) {
    this.lever = new Lever(handlers);
    const mk = (m, order) => { m.renderOrder = order; root.add(m); return m; };
    const basic = (o) => new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, ...o });
    this.track = mk(new THREE.Mesh(PLANE, basic({ color: PLUM_LIFT })), 22);
    this.rail = mk(new THREE.Mesh(PLANE, basic({ color: PAL.brass })), 23);
    this.knob = mk(new THREE.Mesh(PLANE, basic({ map: getTex('machine/lever') })), 24);
    this.L = null;
  }
  setVisible(v) { for (const m of [this.track, this.rail, this.knob]) m.visible = v; }
  layout(L) { this.L = L; this.lever.setRects(L.lever, L.case); }
  update(dt) {
    const L = this.L; if (!L) return;
    this.lever.step(dt);
    const s = L.lever, H = L.screen.h, k = this.lever.shown(), on = this.lever.enabled;
    const slotW = Math.max(4, s.w * 0.22);
    place(this.track, { x: s.x + (s.w - slotW) / 2, y: s.y, w: slotW, h: s.h }, H);
    place(this.rail, { x: s.x + (s.w - slotW * 0.4) / 2, y: s.y + 2, w: slotW * 0.4, h: s.h - 4 }, H);
    // the lever sprite is as wide as the strip and slides down its track
    const [sw, sh] = spriteSize('machine/lever'), kh = Math.min(s.w * (sh / sw), s.h * 0.38), f = fitIn({ x: s.x, y: 0, w: s.w, h: kh }, sw, sh);
    place(this.knob, { x: f.x, y: s.y + k * (s.h * 0.62) + (kh - f.h) * 0.5, w: f.w, h: f.h }, H);
    this.knob.material.color.set(on ? '#ffffff' : '#7a7a7a'); // greyed and still when SPIN is disabled
    this.track.material.opacity = this.rail.material.opacity = on ? 1 : 0.5;
  }
}
