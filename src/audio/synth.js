// WebAudio fallback for every sfx id. synth(ctx, dest, id, t, { rate, vol }) schedules at time t; returns false for an unknown id.
// Audio code, not src/core: Math.random for the noise buffer is fine here.
const noiseBufs = new WeakMap();
export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function noiseBuf(ctx) {
  let b = noiseBufs.get(ctx);
  if (!b) {
    const sr = ctx.sampleRate || 44100;
    b = ctx.createBuffer(1, sr | 0, sr);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBufs.set(ctx, b);
  }
  return b;
}

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

export function tone(ctx, dest, { f, t, a = 0.004, d = 0.2, type = 'sine', v = 0.3, f2, drop = 0.1, lp }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + Math.min(d, drop));
  env(g, t, a, v, d);
  let n = o;
  if (lp) {
    const l = ctx.createBiquadFilter();
    l.type = 'lowpass';
    l.frequency.value = lp;
    o.connect(l);
    n = l;
  }
  n.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + a + d + 0.05);
}

export function noise(ctx, dest, { t, d = 0.1, v = 0.2, type = 'bandpass', f = 2000, f2, q = 1, a = 0.003 }) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf(ctx);
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  const g = ctx.createGain();
  env(g, t, a, v, d);
  s.connect(fl);
  fl.connect(g);
  g.connect(dest);
  s.start(t, Math.random() * 0.5);
  s.stop(t + a + d + 0.05);
}

const clack = (c, o, t, v, f, r) => {
  tone(c, o, { f: f * r, f2: f * 0.5 * r, t, d: 0.06, v, drop: 0.04 });
  noise(c, o, { t, d: 0.03, v: v * 0.6, f: 2500 * r, type: 'bandpass', q: 2 });
};
const mar = (c, o, t, v, m, d = 0.4) => {
  tone(c, o, { f: mtof(m), t, d, v });
  tone(c, o, { f: mtof(m) * 4, t, d: d * 0.2, v: v * 0.3, a: 0.001 });
};
const stamp = (c, o, t, v) => {
  tone(c, o, { f: 110, f2: 45, t, d: 0.22, v, drop: 0.15 });
  noise(c, o, { t, d: 0.08, v: v * 0.5, type: 'lowpass', f: 900 });
};

// Each voice: (ctx, dest, t, r = rate multiplier, v = volume multiplier)
export const VOICES = {
  crank_pull: (c, o, t, r, v) => [0, 0.08, 0.16].forEach((dt) => clack(c, o, t + dt, 0.25 * v, 220, r)),
  reel_spin: (c, o, t, r, v) => noise(c, o, { t, d: 0.5, v: 0.08 * v, type: 'bandpass', f: 3000 * r, q: 0.7, a: 0.1 }),
  reel_stop_1: (c, o, t, r, v) => clack(c, o, t, 0.3 * v, 260, r),
  reel_stop_2: (c, o, t, r, v) => clack(c, o, t, 0.34 * v, 240, r * 0.94),
  reel_stop_3: (c, o, t, r, v) => clack(c, o, t, 0.4 * v, 220, r * 0.88),
  pair_pulse: (c, o, t, r, v) => noise(c, o, { t, d: 0.06, v: 0.1 * v, type: 'bandpass', f: 4000 * r, q: 1 }),
  peg_on: (c, o, t, r, v) => {
    noise(c, o, { t, d: 0.02, v: 0.3 * v, type: 'highpass', f: 3000 });
    tone(c, o, { f: 700 * r, f2: 500 * r, t, d: 0.12, v: 0.12 * v, type: 'triangle' });
  },
  peg_off: (c, o, t, r, v) => noise(c, o, { t, d: 0.04, v: 0.15 * v, type: 'bandpass', f: 1800 * r, q: 2 }),
  peg_hit: (c, o, t, r, v) => {
    noise(c, o, { t, d: 0.02, v: 0.3 * v, type: 'highpass', f: 3000 });
    mar(c, o, t + 0.03, 0.2 * v, 84, 0.5);
  },
  line_ink: (c, o, t, r, v) => noise(c, o, { t, d: 0.2, v: 0.15 * v, f: 1200 * r, f2: 3000 * r, q: 0.8, a: 0.04 }),
  pay_step: (c, o, t, r, v) => mar(c, o, t, 0.22 * v, 69 + 12 * Math.log2(r), 0.35),
  coin_fly: (c, o, t, r, v) => [0, 0.05, 0.1].forEach((dt, i) => tone(c, o, { f: (3200 + i * 300) * r, t: t + dt, d: 0.06, v: 0.06 * v, type: 'triangle' })),
  coin_jar: (c, o, t, r, v) => {
    [0, 0.04, 0.09].forEach((dt) => tone(c, o, { f: 1800 * r, t: t + dt, d: 0.18, v: 0.1 * v, type: 'triangle', lp: 4000 }));
    noise(c, o, { t, d: 0.1, v: 0.08 * v, f: 5000 });
  },
  trinket_tick: (c, o, t, r, v) => tone(c, o, { f: 1400 * r, t, d: 0.07, v: 0.15 * v, type: 'triangle' }),
  lantern_light: (c, o, t, r, v) => {
    noise(c, o, { t, d: 0.06, v: 0.08 * v, type: 'highpass', f: 4000 });
    mar(c, o, t + 0.05, 0.18 * v, 72 + 12 * Math.log2(r), 0.7);
  },
  big_win: (c, o, t, r, v) => {
    tone(c, o, { f: 660 * r, t, d: 1.6, v: 0.25 * v });
    tone(c, o, { f: 1320 * r, t, d: 1.0, v: 0.1 * v });
    noise(c, o, { t, d: 0.4, v: 0.1 * v, type: 'highpass', f: 3000 });
  },
  stamp_paid: (c, o, t, r, v) => stamp(c, o, t, 0.5 * v),
  orhan_hm: (c, o, t, r, v) => tone(c, o, { f: 140 * r, f2: 110 * r, t, a: 0.05, d: 0.35, v: 0.2 * v, type: 'sawtooth', lp: 500, drop: 0.3 }),
  orhan_cough: (c, o, t, r, v) => {
    noise(c, o, { t, d: 0.08, v: 0.25 * v, f: 1500, q: 1.5 });
    noise(c, o, { t: t + 0.12, d: 0.1, v: 0.2 * v, f: 1200, q: 1.5 });
  },
  deni_blip: (c, o, t, r, v) => {
    tone(c, o, { f: 660 * r, t, d: 0.09, v: 0.15 * v });
    tone(c, o, { f: 880 * r, t: t + 0.08, d: 0.12, v: 0.15 * v });
  },
  event_stamp: (c, o, t, r, v) => {
    stamp(c, o, t, 0.5 * v);
    noise(c, o, { t, d: 0.05, v: 0.3 * v, type: 'highpass', f: 2500 });
    tone(c, o, { f: 90, f2: 60, t: t + 0.1, d: 0.2, v: 0.3 * v });
  },
  quota_fail: (c, o, t, r, v) => [67, 64, 60].forEach((m, i) => mar(c, o, t + i * 0.22, 0.18 * v, m, 0.5)),
  run_win: (c, o, t, r, v) => [60, 64, 67, 72].forEach((m, i) => tone(c, o, { f: mtof(m) * (1 + (i % 2 ? 0.012 : -0.01)), t: t + i * 0.16, d: 0.3, v: 0.15 * v, type: 'sawtooth', lp: 1800 })),
  shop_open: (c, o, t, r, v) => noise(c, o, { t, d: 0.25, v: 0.15 * v, type: 'lowpass', f: 1500, f2: 500, a: 0.05 }),
  buy: (c, o, t, r, v) => {
    [0, 0.05].forEach((dt) => tone(c, o, { f: 2200 * r, t: t + dt, d: 0.12, v: 0.08 * v, type: 'triangle' }));
    noise(c, o, { t: t + 0.08, d: 0.12, v: 0.06 * v, f: 2500 });
  },
  sell: (c, o, t, r, v) => [0.05, 0].forEach((dt) => tone(c, o, { f: 1800 * r, t: t + dt, d: 0.1, v: 0.06 * v, type: 'triangle' })),
  reroll: (c, o, t, r, v) => noise(c, o, { t, d: 0.3, v: 0.15 * v, f: 2200 * r, q: 0.6 }),
  remove_token: (c, o, t, r, v) => tone(c, o, { f: 500 * r, f2: 180 * r, t, d: 0.14, v: 0.2 * v, drop: 0.1 }),
  deny: (c, o, t, r, v) => [0, 0.11].forEach((dt) => clack(c, o, t + dt, 0.22 * v, 160, r)),
  ui_tap: (c, o, t, r, v) => tone(c, o, { f: 500 * r, f2: 300 * r, t, d: 0.05, v: 0.2 * v, drop: 0.03 }),
  ui_page: (c, o, t, r, v) => noise(c, o, { t, d: 0.18, v: 0.12 * v, f: 2000 * r, f2: 4500 * r, q: 0.6, a: 0.04 }),
  build_hammer: (c, o, t, r, v) => [0, 0.2, 0.4].forEach((dt) => clack(c, o, t + dt, 0.4 * v, 140, r)),
  build_done: (c, o, t, r, v) => {
    clack(c, o, t, 0.4 * v, 120, r);
    tone(c, o, { f: 784, t: t + 0.12, d: 0.15, v: 0.15 * v });
    tone(c, o, { f: 1047, t: t + 0.26, d: 0.25, v: 0.15 * v });
  },
  plank_gain: (c, o, t, r, v) => clack(c, o, t, 0.3 * v, 300, r),
  postcard: (c, o, t, r, v) => noise(c, o, { t, d: 0.22, v: 0.12 * v, f: 3000 * r, f2: 1500 * r, q: 0.6, a: 0.05 }),
  streak: (c, o, t, r, v) => {
    tone(c, o, { f: 2400 * r, t, d: 0.4, v: 0.12 * v });
    tone(c, o, { f: 3600 * r, t, d: 0.25, v: 0.06 * v });
  },
  amb_harbor: (c, o, t, r, v) => noise(c, o, { t, d: 4, v: 0.06 * v, type: 'lowpass', f: 400, f2: 250, q: 0.5, a: 1 }),
  amb_night: (c, o, t, r, v) => {
    noise(c, o, { t, d: 4, v: 0.04 * v, type: 'lowpass', f: 300, a: 1 });
    [0, 0.3, 0.6].forEach((dt) => tone(c, o, { f: 4200, t: t + 1 + dt, d: 0.05, v: 0.015 * v }));
  },
};

export function synth(ctx, dest, id, t, { rate = 1, vol = 1 } = {}) {
  const f = VOICES[id];
  if (!f) return false;
  f(ctx, dest, t, rate, vol);
  return true;
}
