// Damped spring, semi-implicit Euler with fixed substeps (stable at any frame time). Same habit as msjelly.
export class Spring {
  constructor(x = 0, k = 400, c = 16) {
    this.x = x; this.v = 0; this.t = x; this.k = k; this.c = c;
  }
  step(dt) {
    if (dt > 0.05) dt = 0.05;
    const n = Math.max(1, Math.ceil(dt * 120));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.v += ((this.t - this.x) * this.k - this.v * this.c) * h;
      this.x += this.v * h;
    }
  }
  kick(v) { this.v += v; }
  settled(eps = 1e-3) { return Math.abs(this.x - this.t) < eps && Math.abs(this.v) < eps * 10; }
}
