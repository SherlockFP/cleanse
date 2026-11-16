// Renderer, orthographic camera, frame loop and everything the view draws around the machine: the debt bar, the heat (risk) meter,
// the devil, the charm shelf, trick pockets, curse markers, coin burst and the big-win beat. Text and buttons are DOM above the canvas;
// getLayout() gives the UI the rects to position them.
// Camera: pixel units, (0, w, h, 0), y up. Layout rects are y down; place() converts.
import * as THREE from 'three';
import { computeLayout } from './layout.js';
import { PAL, PLUM_LIFT } from './palette.js';
import { getTex, getCaseRects, spriteSize, tickSprites, setSymbols, artVersion, refreshArt } from './sprites.js';
import { Spring } from './springs.js';
import { CoinFlight } from './particles.js';
import * as reel from './reel-view.js';

export { setGrid, playSpin, playPatterns, clearHighlights, setHeld, setTargets, pulseCells, skip, skipSpin, skipPatterns } from './reel-view.js';
export { refreshArt };

// ===== CORE ADAPTER =====================================================================================================================
// The only place that knows the shapes of core objects (docs/v2/TECH.md sections 3 and 6). If a core name or field differs, fix it here.
// `data` is { symbols[], charms[], tricks[], curses[], config } as loaded from src/data/*.json (arrays, each item has id and icon).
const byId = (list = []) => new Map(list.map((x) => [x.id, x]));
export const adapt = {
  symbols: (d) => d.symbols ?? d,                                          // symbols.json -> [{id, icon}]
  spin: (r) => ({ grid: r.grid, held: r.pinned ?? r.held ?? [] }),         // run.spin(run) result -> playSpin input
  patterns: (score) => (score?.patterns ?? []).map((p) => ({ id: p.id, cells: p.cells, sym: p.sym })), // scoreSpin result
  pay: (score) => score?.total ?? 0,
  charm: (c, m) => ({ icon: m?.get(c.id)?.icon ?? `charm/${c.id}`, rarity: m?.get(c.id)?.rarity }),
  trick: (id, m) => (id ? { icon: m?.get(id)?.icon ?? `trick/${id}` } : null),
  curse: (id, m) => ({ icon: m?.get(id)?.icon ?? `curse/${id}` }),
  heat: (run, cfg) => ({ level: run.heat ?? 0, max: cfg?.heat?.max ?? 10 }),
  debt: (run) => ({ paid: (run.banked ?? 0), goal: run.debt ?? 0 }),
};
// One call to refresh every static element from a core `run`.
export function syncRun(run, data) {
  const charms = byId(data.charms), tricks = byId(data.tricks), curses = byId(data.curses);
  setCharms(run.charms.map((c) => adapt.charm(c, charms)), run.slots ?? run.charms.length);
  setPockets(Array.from({ length: run.pockets ?? 3 }, (_, i) => adapt.trick(run.tricks?.[i], tricks)));
  setCurses((run.curses ?? []).map((id) => adapt.curse(id, curses)));
  const h = adapt.heat(run, data.config); setHeat(h.level, h.max);
  const d = adapt.debt(run); setDebt(d.paid, d.goal);
  reel.setHeld(run.pinned ?? []);
}
// ========================================================================================================================================

let renderer, scene, camera, root, L, W = 1, H = 1, time = 0, built = -1;
let bg, edges = [], bgKey = '', handlers = {}, flight, coinInst, devil, devilPose = 'devil/idle', devilTimer = 0;
const PLANE = new THREE.PlaneGeometry(1, 1);
const state = { paid: 0, goal: 0, shown: 0, heat: 0, heatMax: 10, shake: 0, shakeAmp: 0 };
const bar = {}, meter = { segs: [] };

export function setHandlers(h) { handlers = { ...handlers, ...h }; } // { coinLand(), stop(col) }
// The DOM HUD (src/ui/hud.js) draws the goal bar, Heat, charms, pockets and buttons. With its two heights set here the canvas keeps only
// the background, the devil, the machine and the coins, laid out between the bars; the canvas rows and bars stay hidden.
let insets = null;
export function setInsets(top, bottom) {
  if (insets && insets.top === top && insets.bottom === bottom) return;
  insets = { top, bottom };
  for (const row of [charmRow, pocketRow, curseRow]) for (const s of row.s) s.bg.visible = s.tag.visible = s.icon.visible = false;
  for (const m of [bar.frame, bar.back, bar.fill, meter.icon, ...meter.segs]) m.visible = false;
  if (renderer) layout();
}
export const getLayout = () => L;
export const cellAt = (x, y) => (L ? L.cells.findIndex((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) : -1);

const plain = (id, order, color = '#ffffff') => {
  const m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: getTex(id), transparent: true, depthTest: false, depthWrite: false, color }));
  m.renderOrder = order; root.add(m); return m;
};
const solid = (color, order) => {
  const m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = order; root.add(m); return m;
};
function place(mesh, r, sx = 1, sy = 1) {
  mesh.position.set(r.x + r.w / 2, H - (r.y + r.h / 2), 0);
  mesh.scale.set(r.w * sx, r.h * sy, 1);
}
// Rect of sprite `id` inside r: as large as fits, same aspect, bottom-centred (real cut art is not all one shape).
function fit(r, id, k = 1) {
  const [w, h] = spriteSize(id), s = Math.min(r.w / w, r.h / h) * k;
  return { x: r.x + (r.w - w * s) / 2, y: r.y + r.h - h * s, w: w * s, h: h * s };
}
const seedOf = (s) => { let h = 5; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };

// ---------- icon rows: charm shelf, trick pockets, curse markers ----------
class Row {
  constructor(max, { frame = true, order = 12, gap = 0.12 } = {}) {
    this.max = max; this.frame = frame; this.gap = gap; this.items = []; this.slots = 0; this.r = null;
    this.s = Array.from({ length: max }, (_, i) => ({
      bg: plain('ui/slot_empty', order), tag: plain('ui/rarity_common', order + 1), icon: plain('ui/coin', order + 2), sp: new Spring(1, 360, 11), rot: ((seedOf('r' + i) % 7) - 3) * 0.012, id: '',
    }));
  }
  set(items, slots = items.length) { this.items = items.slice(0, this.max); this.slots = Math.min(this.max, Math.max(slots, this.items.length)); this.dirty = true; }
  pulse(i) { this.s[i]?.sp.kick(9); }
  rect(r) { this.r = r; this.dirty = true; }
  update(dt) {
    if (!this.r) return;
    const n = Math.max(1, this.slots), r = this.r, g = r.h * this.gap;
    const size = Math.min(r.h, (r.w - g * (n - 1)) / n), x0 = r.x + (r.w - (size * n + g * (n - 1))) / 2, y0 = r.y + (r.h - size) / 2;
    this.s.forEach((s, i) => {
      const it = this.items[i], on = i < this.slots;
      s.sp.step(dt);
      s.bg.visible = on && this.frame && !it; s.tag.visible = on && !!it?.rarity; s.icon.visible = on && !!it;
      if (!on) return;
      const cell = { x: x0 + i * (size + g), y: y0, w: size, h: size }, k = s.sp.x;
      if (it && s.id !== it.icon + (it.rarity ?? '')) {
        s.id = it.icon + (it.rarity ?? ''); s.icon.material.map = getTex(it.icon);
        if (it.rarity) s.tag.material.map = getTex(`ui/rarity_${it.rarity}`);
      }
      place(s.bg, cell);
      if (it) {
        const f = fit(cell, it.icon, 0.86); f.y = cell.y + (cell.h - f.h) / 2;
        place(s.tag, { x: cell.x, y: cell.y, w: cell.w, h: cell.h }, 1.02 * k, 1.02 * k);
        place(s.icon, f, k, k);
        s.icon.rotation.z = s.rot + (k - 1) * 0.4; s.tag.rotation.z = -s.rot;
      }
    });
  }
}
let charmRow, pocketRow, curseRow;

export function setCharms(items, slots) { charmRow.set(items, slots); }
export const pulseCharm = (slot) => charmRow.pulse(slot);   // a charm triggered: it hops
export function setPockets(items, slots) { pocketRow.set(items, slots); }
export function setCurses(items) { curseRow.set(items); }

// ---------- debt bar and heat meter ----------
export function setDebt(paid, goal) { state.paid = paid; state.goal = goal; if (paid < state.shown) state.shown = paid; }
export function setHeat(level, max = 10) { state.heat = level; state.heatMax = max; }

function buildBars() {
  bar.frame = solid(PAL.bone, 6); bar.back = solid(PLUM_LIFT, 7); bar.fill = solid(PAL.candle, 8); bar.sp = new Spring(1, 360, 12);
  meter.icon = plain('ui/heat', 8); meter.sp = new Spring(1, 300, 10);
  for (let i = 0; i < 12; i++) meter.segs.push(solid(PLUM_LIFT, 8));
}
function layBars() {
  const b = L.bar, p = Math.max(2, b.h * 0.14);
  place(bar.frame, b); place(bar.back, { x: b.x + p, y: b.y + p, w: b.w - 2 * p, h: b.h - 2 * p });
}
function drawBars(dt) {
  const b = L.bar, p = Math.max(2, b.h * 0.14), f = state.goal > 0 ? Math.min(1, state.shown / state.goal) : 0;
  bar.sp.step(dt);
  const w = (b.w - 2 * p) * f;
  bar.fill.visible = w > 0.5;
  place(bar.fill, { x: b.x + p, y: b.y + p, w: Math.max(w, 0.0001), h: b.h - 2 * p }, 1, bar.sp.x);
  bar.fill.material.color.set(f >= 1 ? PAL.green : PAL.candle);
  // heat meter: segments stack upward above the flame icon
  const m = L.meter, ic = Math.min(m.w * 1.3, m.h * 0.3), gap = 2, n = state.heatMax, segH = (m.h - ic - 4) / n - gap;
  meter.sp.step(dt);
  place(meter.icon, fit({ x: m.x - (ic - m.w) / 2, y: m.y + m.h - ic, w: ic, h: ic }, 'ui/heat'), meter.sp.x, meter.sp.x);
  meter.segs.forEach((s, i) => {
    s.visible = i < n;
    if (!s.visible) return;
    const lit = i < state.heat, fr = i / Math.max(1, n - 1);
    s.material.color.set(lit ? (fr < 0.4 ? PAL.brass : fr < 0.7 ? PAL.candle : PAL.red) : PLUM_LIFT);
    place(s, { x: m.x + m.w * 0.15, y: m.y + m.h - ic - 4 - (i + 1) * (segH + gap), w: m.w * 0.7, h: segH });
  });
}
const barEnd = () => ({ x: L.bar.x + (L.bar.w * (state.goal > 0 ? Math.min(1, state.paid / state.goal) : 0)), y: L.bar.y + L.bar.h / 2 });

// ---------- devil ----------
// Poses are whatever devil/<pose> art exists: idle, grin, angry, deal (also collect, shock). Back to idle after `secs`.
export function setDevil(pose = 'idle', secs = 0) {
  if (!devil) return;
  devilPose = 'devil/' + pose; devil.material.map = getTex(devilPose); devilTimer = secs; devil.userData.kick = 1;
}
function devilRect() { return fit(L.devil, devilPose); }

// ---------- effects ----------
// Win beat: coins leave the given cells and arc to the end of the debt bar. total only sets how many coins fly.
export function flyCoins(total, cellList = [7]) {
  if (!L || total <= 0) return;
  const srcs = cellList.map((i) => ({ x: L.cells[i].x + L.cells[i].w / 2, y: L.cells[i].y + L.cells[i].h / 2 }));
  flight.launch(srcs, barEnd(), Math.max(3, Math.min(20, Math.ceil(total / 4))));
}
// Big win: a screen shake and a slow warm swell of the machine. Never a flash (no full-screen colour change, no strobing).
// level 1 small, 2 big, 3 huge.
export function bigWin(level = 1) { state.shakeAmp = 3 + level * 3; state.shake = 1; reel.pulseCells(L ? L.cells.map((_, i) => i) : []); devil && setDevil(level > 1 ? 'angry' : 'grin', 1.2); }
export const shakeScreen = (amp = 6) => { state.shakeAmp = amp; state.shake = 1; };

// ---------- scene ----------
// opts: { symbols } is the symbols.json list. Call `await preloadArt()` from sprites.js first so real art is already in.
export function initView(canvas, opts = {}) {
  THREE.ColorManagement.enabled = false; // palette and texture values are used raw
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(PAL.plum, 1);
  scene = new THREE.Scene(); root = new THREE.Group(); scene.add(root);
  camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 20); camera.position.z = 5;
  if (opts.symbols) setSymbols(adapt.symbols(opts.symbols));

  bg = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: getTex('bg/fair'), depthTest: false })); bg.renderOrder = 0; root.add(bg);
  for (let i = 0; i < 2; i++) edges.push(solid('#000000', 1));
  devil = plain('devil/idle', 8);
  charmRow = new Row(8, { order: 12 }); pocketRow = new Row(5, { order: 12 }); curseRow = new Row(8, { frame: false, order: 12, gap: 0.08 });
  buildBars();
  coinInst = new THREE.InstancedMesh(PLANE, new THREE.MeshBasicMaterial({ map: getTex('ui/coin'), transparent: true, depthTest: false }), 48);
  coinInst.renderOrder = 60; coinInst.frustumCulled = false; coinInst.count = 0; root.add(coinInst);
  flight = new CoinFlight(48);
  reel.initReel(root);
  resize();
  return { renderer, scene, camera };
}

export function resize() {
  if (!renderer) return;
  const c = renderer.domElement, w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = w; H = h;
  renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
  camera.left = 0; camera.right = w; camera.top = h; camera.bottom = 0; camera.updateProjectionMatrix();
  layout();
}

function layout() {
  L = computeLayout(W, H, getCaseRects(), insets);
  built = artVersion();
  const col = L.column, narrow = col.w < W - 1;
  // background: cover the column; outside the column it stays plum
  const id = 'bg/fair', [bw, bh] = spriteSize(id), tex = getTex(id);
  const k = Math.max(col.w / bw, H / bh); tex.repeat?.set(col.w / (bw * k), H / (bh * k)); tex.offset?.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
  place(bg, col); bg.material.map = tex;
  edges.forEach((e, i) => { e.visible = narrow; place(e, { x: i ? col.x + col.w : col.x - 3, y: 0, w: 3, h: H }); });
  reel.layoutReel(L);
  charmRow.rect(L.charms); pocketRow.rect(L.pockets); curseRow.rect(L.curses);
  layBars();
}

const dummy = new THREE.Object3D(), pt = { x: 0, y: 0, u: 0, s: 1 };
function drawCoins() {
  let k = 0;
  const cs = L.cells[0].w * 0.4;
  for (let i = 0; i < flight.n; i++) {
    if (!flight.at(i, pt)) continue;
    dummy.position.set(pt.x, H - pt.y, 0); dummy.scale.set(cs * pt.s, cs * pt.s, 1); dummy.rotation.z = pt.u * 5; dummy.updateMatrix();
    coinInst.setMatrixAt(k++, dummy.matrix);
  }
  coinInst.count = k; coinInst.instanceMatrix.needsUpdate = true;
}

export function tick(dt) {
  if (!renderer || !L) return;
  dt = Math.min(dt, 0.05); time += dt;
  tickSprites();
  if (built !== artVersion()) layout(); // real art arrived: sizes and the case windows may have changed
  reel.tickReel(dt);
  if (!insets) { charmRow.update(dt); pocketRow.update(dt); curseRow.update(dt); }

  // debt bar follows the paid amount once no coin is still flying
  if (!flight.n) state.shown += (state.paid - state.shown) * Math.min(1, dt * 7); else if (state.paid < state.shown) state.shown = state.paid;
  if (Math.abs(state.paid - state.shown) < 0.01) state.shown = state.paid;
  if (!insets) drawBars(dt);

  // devil: breathes, hops on a pose change, returns to idle
  if (devilTimer > 0 && (devilTimer -= dt) <= 0 && devilPose !== 'devil/idle') setDevil('idle');
  const dr = devilRect(), br = 1 + Math.sin(time * 1.7) * 0.01 + (devil.userData.kick ?? 0) * 0.06;
  devil.userData.kick = (devil.userData.kick ?? 0) * Math.exp(-dt * 8);
  place(devil, dr, br, br); devil.position.y -= (dr.h * (br - 1)) / 2;

  const landed = flight.update(dt);
  if (landed) { bar.sp?.kick(4 + landed); for (let i = 0; i < landed; i++) handlers.coinLand?.(); }
  drawCoins();

  // camera shake: column clacks plus the big-win beat (decaying, no colour change)
  const rs = reel.getShake(); state.shake *= Math.exp(-dt * 6);
  const bw = state.shake > 0.02 ? state.shakeAmp * state.shake * Math.sin(time * 70) : 0;
  camera.position.x = rs.x + bw; camera.position.y = rs.y + bw * 0.6;
  renderer.render(scene, camera);
}
