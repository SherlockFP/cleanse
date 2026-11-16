import { SFX, LADDERS } from './sfx-map.js';
import { synth } from './synth.js';

let ctx = null, master = null, sfxBus = null, musicBus = null;
let vols = { master: 1, sfx: 1, music: 0.6 };
const buffers = new Map(); // id -> AudioBuffer | null (null = load failed, use synth)
const loops = new Map(); // id -> stop fn

async function load(id, e) {
  try {
    const res = await fetch(`./sfx/${e.file}`);
    if (!res.ok) throw new Error(String(res.status));
    buffers.set(id, await ctx.decodeAudioData(await res.arrayBuffer()));
  } catch {
    buffers.set(id, null);
  }
}

// Call from a user gesture (first tap). Safe to call again.
export async function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus = ctx.createGain();
  sfxBus.connect(master);
  musicBus.connect(master);
  master.connect(ctx.destination);
  setVolumes(vols);
  await Promise.all(Object.entries(SFX).filter(([, e]) => e.file).map(([id, e]) => load(id, e)));
}

export function setVolumes(v = {}) {
  vols = { ...vols, ...v };
  if (!ctx) return;
  master.gain.value = vols.master;
  sfxBus.gain.value = vols.sfx;
  musicBus.gain.value = vols.music;
}

// opts: { rate (playback multiplier), vol (0..1 multiplier), delay (s) }. Returns a stop fn, or null for one-shots played by synth.
export function play(id, opts = {}) {
  const e = SFX[id];
  if (!ctx || !e || vols.sfx <= 0) return null;
  // Audio-only jitter: Math.random is fine outside src/core.
  const rate = (opts.rate ?? 1) * e.rate * (1 + (Math.random() * 2 - 1) * e.pv);
  const vol = opts.vol ?? 1;
  const t = ctx.currentTime + (opts.delay || 0);
  const buf = buffers.get(id);
  if (!buf) {
    synth(ctx, sfxBus, id, t, { rate, vol: vol * e.vol });
    return null;
  }
  const s = ctx.createBufferSource();
  const g = ctx.createGain();
  s.buffer = buf;
  s.playbackRate.value = rate;
  s.loop = !!e.loop;
  g.gain.value = e.vol * vol;
  s.connect(g);
  g.connect(sfxBus);
  s.start(t);
  const stopFn = () => {
    try { s.stop(); } catch { /* already stopped */ }
    loops.delete(id);
  };
  if (e.loop) {
    loops.get(id)?.();
    loops.set(id, stopFn);
  }
  return stopFn;
}

export function stop(id) {
  loops.get(id)?.();
}

// Pitch ladder for win counts: n = 0, 1, 2... (reset each spin). id defaults to pay_step; lantern_light has 5 steps.
export function playStep(n, id = 'pay_step', opts = {}) {
  const lad = LADDERS[id] || LADDERS.pay_step;
  const semis = lad[Math.min(Math.max(n | 0, 0), lad.length - 1)];
  return play(id, { ...opts, rate: 2 ** (semis / 12) * (opts.rate ?? 1) });
}

// Music stub: M3 decides pack vs generative. name: 'home' | 'run' | 'lamplight' | null.
export function setMusic(name) {
  void name;
}
