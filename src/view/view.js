// Renderer, orthographic camera, frame loop and the HUD that TECH.md gives to the view: lantern string (quota progress),
// Deni's clothesline (pegs left), the jar on her crate. Text and buttons (SPIN, spins left, numbers) are DOM above the canvas;
// getLayout() gives ui.js the rects to position them.
// Camera: pixel units, (0, w, h, 0), y up. Layout rects are y down; place() converts.
import * as THREE from 'three';
import { computeLayout, columnOf } from './layout.js';
import { PAL } from './palette.js';
import { getTex, getPaperTex, getGrainTex, spriteSize, tickSprites } from './sprites.js';
import { riso, setGrain } from './shaders.js';
import { Spring } from './springs.js';
import { CoinFlight } from './particles.js';
import * as reel from './reel-view.js';

export { setGrid, playSpin, showPegs, pulseCells, playLines, skip, clearWinLines } from './reel-view.js';

const LANTERNS = 5;
let renderer, scene, camera, hudGroup, L, W = 1, H = 1, screen = 'game', time = 0;
let bg, edges = [], deni, jarMesh, coinsMesh, string = null, line = null, lanterns = [], hudPegs = [], coinInst, flight, jarSp;
let offMat, onMat, coinMats = {};
let handlers = {};
const hud = { jar: 0, jarShown: 0, quota: 0, pegsMax: 3, held: [], litShown: 0, litTimer: 0 };
const PLANE = new THREE.PlaneGeometry(1, 1);
const idSeed = (id) => { let h = 5; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973; return h; };

export function setHandlers(h) { handlers = { ...handlers, ...h }; } // { lantern(n), coinLand(), stop(col) }
export const getLayout = () => L;
export const cellAt = (x, y) => (L ? L.cells.findIndex((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) : -1);

function sprite(id, order, parent = hudGroup) {
  const [w, h] = spriteSize(id), m = new THREE.Mesh(PLANE, riso(getTex(id), { seed: idSeed(id), size: Math.min(w, h) }));
  m.renderOrder = order; parent.add(m);
  return m;
}
function place(mesh, r, sx = 1, sy = 1) {
  mesh.position.set(r.x + r.w / 2, H - (r.y + r.h / 2), 0);
  mesh.scale.set(r.w * sx, r.h * sy, 1);
}
// Thin ribbon along a polyline (layout px, y down).
function ribbon(pts, t, order) {
  const n = pts.length, pos = new Float32Array(n * 6), idx = [];
  pts.forEach(([x, y], i) => {
    const [x0, y0] = pts[Math.max(0, i - 1)], [x1, y1] = pts[Math.min(n - 1, i + 1)];
    const d = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (-(y1 - y0) / d) * t / 2, ny = ((x1 - x0) / d) * t / 2;
    pos.set([x + nx, H - (y + ny), 0, x - nx, H - (y - ny), 0], i * 6);
    if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: PAL.navy, side: THREE.DoubleSide, depthTest: false }));
  m.renderOrder = order; m.frustumCulled = false; hudGroup.add(m);
  return m;
}
const dropMesh = (m) => { if (m) { hudGroup.remove(m); m.geometry.dispose(); m.material.dispose(); } };

export function initView(canvas) {
  THREE.ColorManagement.enabled = false; // palette and texture values are compared raw in the shaders
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(PAL.paper, 1);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 20);
  camera.position.z = 5;
  setGrain(getGrainTex(), 1);

  bg = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: getPaperTex(), depthTest: false }));
  bg.renderOrder = 0; scene.add(bg);
  for (let i = 0; i < 2; i++) {
    const e = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ color: PAL.navy, depthTest: false }));
    e.renderOrder = 1; scene.add(e); edges.push(e);
  }
  hudGroup = new THREE.Group(); scene.add(hudGroup);

  deni = sprite('deni/idle', 8);
  jarMesh = sprite('fx/jar', 9);
  coinsMesh = sprite('fx/coins_1', 8); coinsMesh.visible = false;
  coinMats = { 1: coinsMesh.material, 2: riso(getTex('fx/coins_2'), { seed: 2, size: 256 }), 3: riso(getTex('fx/coins_3'), { seed: 3, size: 256 }) };
  offMat = riso(getTex('fx/lantern_off'), { seed: 21, size: 128 });
  onMat = riso(getTex('fx/lantern_on'), { seed: 22, size: 128 });
  for (let i = 0; i < LANTERNS; i++) { const m = new THREE.Mesh(PLANE, offMat); m.renderOrder = 12; hudGroup.add(m); lanterns.push({ mesh: m, sp: new Spring(1, 300, 11), lit: false }); }
  for (let i = 0; i < 8; i++) { const m = sprite('reel/peg', 13); hudPegs.push(m); }
  jarSp = new Spring(1, 360, 12);

  coinInst = new THREE.InstancedMesh(PLANE, new THREE.MeshBasicMaterial({ map: getTex('fx/coin'), transparent: true, depthTest: false }), 48);
  coinInst.renderOrder = 60; coinInst.frustumCulled = false; coinInst.count = 0; scene.add(coinInst);
  flight = new CoinFlight(48);

  reel.initReel(scene);
  resize();
  return { renderer, scene, camera };
}

export function resize() {
  if (!renderer) return;
  const cv = renderer.domElement;
  W = Math.max(1, Math.round(cv.clientWidth || window.innerWidth)); H = Math.max(1, Math.round(cv.clientHeight || window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
  camera.left = 0; camera.right = W; camera.top = H; camera.bottom = 0; camera.updateProjectionMatrix();
  setGrain(getGrainTex(), dpr);
  L = computeLayout(W, H);
  layoutAll();
}

function layoutAll() {
  const paper = getPaperTex(); paper.repeat.set(W / 256, H / 256);
  place(bg, L.screen);
  const col = columnOf(W, H), narrow = col.w < W - 1;
  edges.forEach((e, i) => { e.visible = narrow; place(e, { x: i ? col.x + col.w : col.x - 2, y: 0, w: 2, h: H }); });
  reel.layoutReel(L);

  place(deni, L.deni);
  place(jarMesh, L.jar); place(coinsMesh, L.jar);

  // lantern string: a sagging line across the top strip, five lanterns hanging from it
  const r = L.lantern, sag = r.h * 0.18, y0 = r.y + r.h * 0.06, yAt = (u) => y0 + sag * (1 - (2 * u - 1) ** 2);
  dropMesh(string);
  string = ribbon(Array.from({ length: 25 }, (_, i) => [r.x + (r.w * i) / 24, yAt(i / 24)]), Math.max(2, L.scale * 2.5), 5);
  const lh = r.h * 0.72, lw = lh * 0.8;
  lanterns.forEach((l, i) => { const u = (i + 0.5) / LANTERNS; l.cx = r.x + r.w * u; l.cy = yAt(u) + lh / 2 - 2; l.lw = lw; l.lh = lh; });

  // clothesline: Deni's peg counter
  const p = L.pegs, ly = p.y + p.h * 0.12;
  dropMesh(line);
  line = ribbon(Array.from({ length: 13 }, (_, i) => [p.x + (p.w * i) / 12, ly + p.h * 0.06 * Math.sin((i / 12) * Math.PI)]), Math.max(2, L.scale * 2), 5);
  hudPegs.forEach((m) => { m.userData.h = p.h * 0.95; });
  applyHud(0);
  renderer.render(scene, camera);
}

// state: { jar, quota, pegsMax, held }. Coins already in flight keep the jar and the lanterns where they were until they land.
export function setHud(state = {}) {
  if ('quota' in state) hud.quota = state.quota;
  if ('pegsMax' in state) hud.pegsMax = state.pegsMax;
  if ('held' in state) hud.held = state.held;
  if ('jar' in state) {
    if (state.jar < hud.jar) hud.jarShown = state.jar; // a new tide or run: no animation
    hud.jar = state.jar;
    if (!flight || !flight.n) hud.jarShown = hud.jar;
  }
}

// Win beat: coins leave the given cells and arc to the jar. total only sets how many coins fly.
export function flyCoins(total, cellList = [4]) {
  if (!L || total <= 0) return;
  const srcs = cellList.map((i) => ({ x: L.cells[i].x + L.cells[i].w / 2, y: L.cells[i].y + L.cells[i].h / 2 }));
  flight.launch(srcs, { x: L.jar.x + L.jar.w / 2, y: L.jar.y + L.jar.h * 0.28 }, Math.max(3, Math.min(14, Math.ceil(total / 3))));
}

function applyHud(dt) {
  // lanterns: the lit count follows the jar one lantern at a time
  const target = hud.quota > 0 ? Math.floor(Math.min(1, hud.jarShown / hud.quota) * LANTERNS + 1e-9) : 0;
  if (hud.litShown > target) hud.litShown = target;
  else if (hud.litShown < target) {
    hud.litTimer -= dt;
    if (hud.litTimer <= 0) { hud.litShown++; hud.litTimer = 0.14; lanterns[hud.litShown - 1].sp.kick(7); handlers.lantern?.(hud.litShown); }
  } else hud.litTimer = 0;
  lanterns.forEach((l, i) => {
    l.sp.step(dt);
    l.mesh.material = i < hud.litShown ? onMat : offMat;
    l.mesh.position.set(l.cx, H - l.cy, 0);
    l.mesh.scale.set(l.lw * l.sp.x, l.lh * l.sp.x, 1);
  });
  // pegs left on the line (the others are clipped to cells)
  const p = L.pegs, free = Math.max(0, Math.min(hudPegs.length, hud.pegsMax - hud.held.length));
  hudPegs.forEach((m, i) => {
    m.visible = i < free;
    if (!m.visible) return;
    const ph = m.userData.h, pw = ph * 0.6, cx = p.x + (p.w * (i + 0.5)) / Math.max(hud.pegsMax, 1);
    m.position.set(cx, H - (p.y + p.h * 0.12 + ph * 0.45), 0); m.scale.set(pw, ph, 1);
  });
  // jar: coin pile by fill level
  const f = hud.quota > 0 ? hud.jarShown / hud.quota : 0, lvl = hud.jarShown <= 0 ? 0 : f < 0.34 ? 1 : f < 0.67 ? 2 : 3;
  coinsMesh.visible = lvl > 0;
  if (lvl) coinsMesh.material = coinMats[lvl];
  jarSp.step(dt);
  place(jarMesh, L.jar, 1, jarSp.x); place(coinsMesh, L.jar, 1, jarSp.x);
  // Deni breathes
  const b = 1 + Math.sin(time * 1.7) * 0.008;
  place(deni, L.deni, 1, b); deni.position.y -= (L.deni.h * (b - 1)) / 2;
}

const dummy = new THREE.Object3D(), pt = { x: 0, y: 0, u: 0, s: 1 };
function drawCoins() {
  let k = 0;
  const cs = L.jar.w * 0.3;
  for (let i = 0; i < flight.n; i++) {
    if (!flight.at(i, pt)) continue;
    dummy.position.set(pt.x, H - pt.y, 0); dummy.scale.set(cs * pt.s, cs * pt.s, 1); dummy.updateMatrix();
    coinInst.setMatrixAt(k++, dummy.matrix);
  }
  coinInst.count = k; coinInst.instanceMatrix.needsUpdate = true;
}

export function setScreen(name) {
  screen = name;
  const on = name === 'game';
  hudGroup.visible = on; reel.reelGroup().visible = on; coinInst.visible = on;
}
export const getScreen = () => screen;

export function tick(dt) {
  if (!renderer) return;
  dt = Math.min(Math.max(dt, 0), 0.1); time += dt;
  reel.tickReel(dt);
  tickSprites();
  const landed = flight.update(dt);
  if (landed) { jarSp.kick(2.5 * Math.min(landed, 3)); for (let i = 0; i < landed; i++) handlers.coinLand?.(); }
  if (!flight.n) hud.jarShown = hud.jar;
  applyHud(dt);
  drawCoins();
  const s = reel.getShake();
  camera.position.x = s.x; camera.position.y = s.y;
  renderer.render(scene, camera);
}
