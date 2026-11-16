// The Red Eye omen: the gauge on the trim above the window (the chance is always visible), the event itself (three red eyes in cells 6, 7, 8
// and a slow red vignette; white-gold when blessed), and the HONK horn feedback. Pure planners first (no three), meshes after.
// Never a flash: the vignette ramps over at least 0.45 s, peaks at 0.38 alpha and fades over 0.9 s.
import * as THREE from 'three';
import { PAL, PLUM_LIFT } from './palette.js';
import { PLANE, place, sprite, box, Label, clamp01, easeOut, popScale } from './kit.js';

export const EYE_CELLS = [6, 7, 8];
export const GAUGE_MAX_PCT = 6;       // the chance never goes above 6% (before redEyeRate)
export const GOLD = '#f6d77a';

export const gaugeFill = (pct, max = GAUGE_MAX_PCT) => clamp01(pct / max);
export const gaugeText = (label, pct) => `${label} ${pct.toFixed(1)}%`;

// Timeline of one Red Eye event. level: 0..3 (the punishment level), blessed: Counter-stare or the white card.
export function redEyePlan({ level = 0, blessed = false } = {}) {
  const lv = Math.max(0, Math.min(3, level | 0));
  const peak = blessed ? 0.22 : [0.15, 0.25, 0.32, 0.38][lv];
  const eyes = EYE_CELLS.map((cell, k) => ({ cell, at: k * 0.12, dur: 0.35 }));
  const vig = { in: 0.5, hold: blessed ? 0.5 : 0.6 + lv * 0.15, out: 0.9, peak, tone: blessed ? 'gold' : 'red' };
  const holdEnd = Math.max(1.3, vig.in + vig.hold);
  return { level: lv, blessed, eyes, vig, shake: blessed ? 0 : [0, 3, 5, 7][lv], total: holdEnd + vig.out * 0.5, end: holdEnd + vig.out };
}
export function vignetteAt(plan, t) {
  const v = plan.vig;
  if (t <= 0) return 0;
  if (t < v.in) return v.peak * (t / v.in);
  if (t < v.in + v.hold) return v.peak;
  return Math.max(0, v.peak * (1 - (t - v.in - v.hold) / v.out));
}

// HONK: a ring leaves the horn, a second one a beat later; each fired charm hops.
export const HONK_RINGS = [{ at: 0, dur: 0.5 }, { at: 0.14, dur: 0.5 }];
export const honkEnd = HONK_RINGS.reduce((a, r) => Math.max(a, r.at + r.dur), 0);

function ringTexture() {
  const cv = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = cv.getContext('2d');
  g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
  return new THREE.CanvasTexture(cv);
}
function vignetteTexture() {
  const cv = Object.assign(document.createElement('canvas'), { width: 128, height: 256 }), g = cv.getContext('2d');
  const r = g.createRadialGradient(64, 128, 40, 64, 128, 150);
  r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(1, 'rgba(255,255,255,1)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 256);
  return new THREE.CanvasTexture(cv);
}

export class OmenView {
  constructor(root) {
    this.L = null; this.pct = 0; this.label = 'Red Eye'; this.blessed = false; this.ev = null; this.honkT = -1; this.hornKick = 0; this.time = 0;
    this.back = box(root, PLUM_LIFT, 26); this.fill = box(root, PAL.red, 27); this.text = new Label(root, 28, 320, 64);
    this.eyes = EYE_CELLS.map(() => sprite(root, 'sym/redeye', 37));
    this.vig = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: vignetteTexture(), color: PAL.red, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    this.vig.renderOrder = 70; this.vig.visible = false; root.add(this.vig);
    const rt = ringTexture();
    this.rings = HONK_RINGS.map(() => { const m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: rt, color: PAL.brass, transparent: true, depthTest: false, depthWrite: false })); m.renderOrder = 45; m.visible = false; root.add(m); return m; });
    this.horn = sprite(root, 'ui/honk', 46);
    this.show = true;
  }
  setVisible(v) { this.show = v; if (!v) { this.back.visible = this.fill.visible = this.text.visible = false; this.hideEvent(); } }
  layout(L) { this.L = L; }
  // pct: the chance in percent as the omen shows it (0 on debts 1 and 2: the gauge then rests dim).
  setGauge(pct, { label, blessed } = {}) {
    this.pct = pct; if (label) this.label = label; if (blessed !== undefined) this.blessed = blessed;
    this.text.set(gaugeText(this.label, pct), this.blessed ? GOLD : PAL.bone, 0.7);
  }
  // Plays one Red Eye event. Resolves when it has faded. Calls opts.onEye(k) as each eye lands (a hook for the sting).
  play(opts = {}) {
    this.skip();
    const plan = redEyePlan(opts);
    return new Promise((resolve) => { this.ev = { plan, t: 0, resolve, onEye: opts.onEye, fired: 0 }; });
  }
  skip() { if (this.ev) { const r = this.ev.resolve; this.ev = null; this.hideEvent(); r(); } }
  hideEvent() { this.eyes.forEach((e) => { e.visible = false; }); this.vig.visible = false; }
  // The horn button was pressed: rings out from it, and the fired charm slots hop (the caller pulses those rows).
  honk() { this.honkT = 0; this.hornKick = 1; }
  update(dt, shakeOut = null) {
    const L = this.L; if (!L) return;
    this.time += dt;
    const H = L.screen.h, o = L.omen, p = 2;
    // gauge: a thin bar with the text over it, centred above the window
    const bw = Math.min(o.w, 230), br = { x: o.x + (o.w - bw) / 2, y: o.y, w: bw, h: o.h };
    this.back.visible = this.fill.visible = this.text.visible = this.show;
    place(this.back, br, H); place(this.fill, { x: br.x + p, y: br.y + p, w: Math.max(0.01, (br.w - 2 * p) * gaugeFill(this.pct)), h: br.h - 2 * p }, H);
    this.fill.material.color.set(this.blessed ? GOLD : PAL.red); this.fill.material.opacity = 0.85;
    const ts = Math.min(br.w / 320, (br.h * 1.3) / 64); // the label canvas is 320x64: keep its proportions
    place(this.text.mesh, { x: br.x + (br.w - 320 * ts) / 2, y: br.y + (br.h - 64 * ts) / 2, w: 320 * ts, h: 64 * ts }, H);
    this.vig.material.color.set(this.blessed ? GOLD : PAL.red);

    const e = this.ev;
    if (e) {
      e.t += dt;
      const pl = e.plan, gold = pl.blessed;
      pl.eyes.forEach((ey, k) => {
        const m = this.eyes[k], u = (e.t - ey.at) / ey.dur, cell = L.cells[ey.cell];
        m.visible = u >= 0 && e.t < pl.end;
        if (!m.visible) return;
        if (e.fired <= k) { e.fired = k + 1; e.onEye?.(k); }
        const breathe = 1 + Math.sin(this.time * 6) * 0.03, fade = 1 - clamp01((e.t - pl.total) / (pl.end - pl.total));
        place(m, cell, H, popScale(u) * 1.05 * breathe, popScale(u) * 1.05 * breathe);
        m.material.color.set(gold ? GOLD : '#ffffff'); m.material.opacity = fade;
      });
      const a = vignetteAt(pl, e.t);
      this.vig.visible = a > 0.001; this.vig.material.opacity = a;
      place(this.vig, L.column, H);
      if (shakeOut && pl.shake && e.t < 0.5) shakeOut(pl.shake * (1 - e.t / 0.5));
      if (e.t >= pl.end) { const r = e.resolve; this.ev = null; this.hideEvent(); r(); }
    }

    // HONK rings
    if (this.honkT >= 0) {
      this.honkT += dt;
      const h = L.honk, c = { x: h.x + h.w / 2, y: h.y + h.h / 2 };
      HONK_RINGS.forEach((r, i) => {
        const u = (this.honkT - r.at) / r.dur, m = this.rings[i];
        m.visible = u >= 0 && u < 1;
        if (m.visible) { const s = h.w * (0.8 + easeOut(u) * 1.4); place(m, { x: c.x - s / 2, y: c.y - s / 2, w: s, h: s }, H); m.material.opacity = 1 - u; }
      });
      if (this.honkT > honkEnd) { this.honkT = -1; this.rings.forEach((m) => { m.visible = false; }); }
    }
    this.hornKick *= Math.exp(-dt * 10);
    const hk = 1 + this.hornKick * 0.25;
    this.horn.visible = this.honkT >= 0 || this.hornKick > 0.02;
    if (this.horn.visible) place(this.horn, L.honk, H, hk, hk);
  }
}
