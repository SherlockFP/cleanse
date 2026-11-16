// Coins that arc from the win cells to the jar on a quadratic curve (TECH.md section 5). Pure JS, no three.
// Coordinates are layout px, y down. A coin with t < 0 is still waiting for its stagger delay.
const F = ['sx', 'sy', 'tx', 'ty', 'cx', 'cy', 't', 'dur'];

export class CoinFlight {
  constructor(max = 48) {
    this.max = max; this.n = 0;
    for (const f of F) this[f] = new Float32Array(max);
  }
  // srcs: [{x, y}] start points, target: {x, y}. Returns how many coins were launched.
  launch(srcs, target, count, { stagger = 0.045, dur = 0.62, arc = 0.4, rnd = Math.random } = {}) {
    let made = 0;
    for (let k = 0; k < count && this.n < this.max; k++, made++) {
      const i = this.n++, s = srcs[k % srcs.length];
      const dx = target.x - s.x, dy = target.y - s.y, d = Math.hypot(dx, dy);
      this.sx[i] = s.x + (rnd() - 0.5) * 16; this.sy[i] = s.y + (rnd() - 0.5) * 16;
      this.tx[i] = target.x + (rnd() - 0.5) * 8; this.ty[i] = target.y;
      this.cx[i] = (s.x + target.x) / 2 + (rnd() - 0.5) * d * 0.3;
      this.cy[i] = Math.min(s.y, target.y) - arc * d * (0.7 + rnd() * 0.6);
      this.t[i] = -k * stagger; this.dur[i] = dur * (0.9 + rnd() * 0.2);
    }
    return made;
  }
  // Advance; returns how many coins landed this frame.
  update(dt) {
    let landed = 0;
    for (let i = 0; i < this.n;) {
      this.t[i] += dt;
      if (this.t[i] >= this.dur[i]) {
        const j = --this.n;
        if (j !== i) for (const f of F) this[f][i] = this[f][j];
        landed++;
        continue;
      }
      i++;
    }
    return landed;
  }
  // Position of coin i into out = {x, y, u, s}; s is a 0..1 size factor (shrinks into the jar). Returns false while waiting.
  at(i, out) {
    if (this.t[i] < 0) return false;
    const u = this.t[i] / this.dur[i], e = u * u * (3 - 2 * u), m = 1 - e;
    out.x = m * m * this.sx[i] + 2 * m * e * this.cx[i] + e * e * this.tx[i];
    out.y = m * m * this.sy[i] + 2 * m * e * this.cy[i] + e * e * this.ty[i];
    out.u = u; out.s = u < 0.8 ? 1 : 1 - (u - 0.8) * 2.5;
    return true;
  }
  clear() { this.n = 0; }
}
