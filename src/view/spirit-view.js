// Spirit portraits beside the devil: up to two of the neighbours who are about this night, stacked in L.spirits. Each shows its mood
// (calm 0-4 Favour, glad 5+, cross below 0, as the Tin strip does) and hops when something happens to it. Mr. Ruby is the devil sprite
// itself (devil/idle, grin, angry), so he is routed to setDevil by the caller, not drawn here.
import { getTex, spriteSize } from './sprites.js';
import { Spring } from './springs.js';
import { place, sprite, fitIn } from './kit.js';

export const MOODS = ['calm', 'glad', 'cross'];
export const moodOf = (favour = 0) => (favour < 0 ? 'cross' : favour >= 5 ? 'glad' : 'calm');
export const portraitId = (id, mood = 'calm') => `spirit/${id}_${MOODS.includes(mood) ? mood : 'calm'}`;
export const DEVIL_POSE = { calm: 'idle', glad: 'grin', cross: 'angry' };
export const MAX_SHOWN = 2;

export class SpiritView {
  constructor(root) {
    this.L = null; this.time = 0;
    this.slots = Array.from({ length: MAX_SHOWN }, (_, i) => ({ mesh: sprite(root, 'spirit/gold_calm', 24), sp: new Spring(1, 320, 11), id: '', mood: 'calm', until: 0, tex: '', ph: i * 1.3 }));
    this.list = [];
  }
  setVisible(v) { this.vis = v; if (!v) this.slots.forEach((s) => { s.mesh.visible = false; }); }
  layout(L) { this.L = L; }
  // list: [{id, favour}] or [{id, mood}]. More than two: the first two (the caller orders by who matters tonight).
  set(list = []) {
    this.list = list.filter((s) => s.id !== 'brimble').slice(0, MAX_SHOWN).map((s) => ({ id: s.id, mood: s.mood ?? moodOf(s.favour) }));
    this.slots.forEach((s, i) => { const it = this.list[i]; if (it && it.id !== s.id) s.sp.kick(6); s.id = it?.id ?? ''; s.mood = it?.mood ?? 'calm'; s.until = 0; });
  }
  // A reaction: switch to `mood` for `secs` and hop. Returns false when that spirit is not on screen (Ruby: the caller uses setDevil).
  react(id, mood = 'glad', secs = 1.4) {
    const s = this.slots.find((x) => x.id === id); if (!s) return false;
    s.react = mood; s.until = this.time + secs; s.sp.kick(mood === 'cross' ? 4 : 9); return true;
  }
  update(dt) {
    const L = this.L; if (!L) return;
    this.time += dt;
    const r = L.spirits, H = L.screen.h, cellH = r.h / MAX_SHOWN;
    this.slots.forEach((s, i) => {
      s.sp.step(dt);
      s.mesh.visible = this.vis !== false && !!s.id;
      if (!s.mesh.visible) return;
      const mood = this.time < s.until ? s.react : s.mood, id = portraitId(s.id, mood);
      if (s.tex !== id) { s.tex = id; s.mesh.material.map = getTex(id); s.mesh.material.needsUpdate = true; }
      const cell = { x: r.x, y: r.y + i * cellH, w: r.w, h: cellH - 2 }, [sw, sh] = spriteSize(id), f = fitIn(cell, sw, sh, 0.96);
      const k = s.sp.x, bob = Math.sin(this.time * 1.5 + s.ph) * 0.012;
      place(s.mesh, f, H, k + bob, k - bob);
      s.mesh.position.y -= (f.h * (k - 1)) / 2;
    });
  }
}
