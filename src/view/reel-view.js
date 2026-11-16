// Reel strips, pegs and win ink (TECH.md section 5). The outcome is computed by core before this runs: the view only plays it back.
// Pillar: every column stops at a fixed time, whatever the grid. Nothing here reads the grid to decide timing.
import * as THREE from 'three';
import { getTex, getAtlas, symbolIndex, spriteSize } from './sprites.js';
import { strip as stripMaterial, riso, inkLine } from './shaders.js';
import { Spring } from './springs.js';
import { PAL } from './palette.js';

export const STOP_TIMES = Object.freeze([0.50, 0.75, 1.00]); // seconds after SPIN, per column
export const TURBO = 0.5;
const SPEED = 16;     // tiles per second while spinning
const EASE = 0.16;    // last stretch before the stop: ease out into the result
const OVER_PX = 8;    // overshoot past the rest position
const SETTLE = 0.09;  // back from the overshoot
const BLUR = 0.07;

// The stop schedule. `grid` is accepted and ignored on purpose: no pair, miss or win may change a stop time.
export function stopSchedule(grid, opts = {}) {
  const k = opts.turbo ? TURBO : 1;
  return STOP_TIMES.map((t) => t * k);
}

// Per-cell plan for one spin. Depends only on which cells are held (a player choice) and the turbo setting, never on symbols.
export function buildTimeline(result, opts = {}) {
  const stops = stopSchedule(result.grid, opts);
  const held = new Set(result.held ?? opts.held ?? []);
  return {
    stops,
    end: stops[2] + SETTLE,
    cells: result.grid.map((target, i) => ({ i, col: i % 3, spin: !held.has(i), stopAt: stops[i % 3], target })),
  };
}

// ---------- state ----------
const cells = [];          // 9 strip cells
const pegMeshes = [];
const lineMeshes = [];
const rings = [];          // dashed coral frames around an open pair
let group = null, caseMesh = null, L = null, grid = null;
let play = null;           // { tl, t, resolve, onStop, stopped:[bool x3] }
let lineAnim = [];         // { mesh, mat, t, delay, resolve }
let shake = 0, noise = 1;
const easeOut = (u) => 1 - (1 - u) ** 3;
const easeInOut = (u) => u * u * (3 - 2 * u);
let rnd = 12345; const cosmetic = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };

export function initReel(parent) {
  group = new THREE.Group(); parent.add(group);
  const plane = new THREE.PlaneGeometry(1, 1), atlas = getAtlas();
  for (let i = 0; i < 9; i++) {
    const mat = stripMaterial(atlas), mesh = new THREE.Mesh(plane, mat);
    mesh.renderOrder = 10; group.add(mesh);
    const c = { mesh, mat, seq: mat.uniforms.uSeq.value, s: 0, mode: 'rest', sq: new Spring(1, 420, 13), cur: 0, sf: 0, s0: 0, over: 0 };
    cells.push(c);
  }
  caseMesh = new THREE.Mesh(plane, riso(getTex('reel/case'), { seed: 3, size: 512 }));
  caseMesh.renderOrder = 20; group.add(caseMesh);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(plane, riso(getTex('reel/peg'), { seed: 10 + i, size: 96 }));
    m.renderOrder = 40; m.visible = false; group.add(m);
    pegMeshes.push({ mesh: m, sp: new Spring(1, 360, 14), on: false });
  }
  // one dashed frame texture, drawn once: a UI mark, not a sprite id
  const cv = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = cv.getContext('2d');
  g.strokeStyle = PAL.coral; g.lineWidth = 7; g.setLineDash([16, 10]); g.strokeRect(6, 6, 116, 116);
  const ringMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false });
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(plane, ringMat); m.renderOrder = 35; m.visible = false; group.add(m); rings.push(m); }
  for (let i = 0; i < 8; i++) {
    const mat = inkLine(i * 7 + 1), m = new THREE.Mesh(plane, mat);
    m.renderOrder = 30; m.visible = false; group.add(m);
    lineMeshes.push({ mesh: m, mat });
  }
  return group;
}

// y-down layout rect -> y-up scene position (camera is (0,w,h,0)).
function place(mesh, r, H, sx = 1, sy = 1) {
  mesh.position.set(r.x + r.w / 2, H - (r.y + r.h / 2), 0);
  mesh.scale.set(r.w * sx, r.h * sy, 1);
}

export function layoutReel(layout) {
  L = layout;
  const H = layout.screen.h;
  place(caseMesh, layout.case, H);
  cells.forEach((c, i) => place(c.mesh, layout.cells[i], H, 1 / c.sq.x, c.sq.x));
  pegMeshes.forEach((p, i) => { if (p.on) placePeg(p, i); });
  rings.forEach((m, i) => place(m, layout.cells[i], H, 1.1, 1.1));
  if (grid) setGrid(grid);
}
const cellCenter = (i) => ({ x: L.cells[i].x + L.cells[i].w / 2, y: L.cells[i].y + L.cells[i].h / 2 });

function placePeg(p, i) {
  const r = L.cells[i], H = L.screen.h, [sw, sh] = spriteSize('reel/peg'), pw = r.w * 0.62, ph = pw * (sh / sw);
  p.mesh.position.set(r.x + r.w * 0.5, H - r.y, 0); // clipped on the frame bar above the cell, so the symbol under it stays readable
  p.mesh.rotation.z = -0.06;
  p.base = [pw, ph];
}

function rest(c, symId) {
  c.mode = 'rest'; c.s = 0; c.cur = symbolIndex(symId);
  c.seq.fill(c.cur); c.mat.uniforms.uScroll.value = 0; c.mat.uniforms.uBlur.value = 0;
}

export function setGrid(g) {
  grid = g;
  if (!cells.length) return;
  g.forEach((id, i) => rest(cells[i], id));
}

export function getGrid() { return grid; }

// Plays the spin: unpegged cells scroll, each column stops on its fixed time, the result tile arrives last.
// opts: { turbo, onStop(col) }. Resolves when the last column has settled.
export function playSpin(result, opts = {}) {
  if (play) skip();
  clearLines(); markCells();
  const tl = buildTimeline(result, opts);
  const prev = grid;
  grid = result.grid;
  tl.cells.forEach((p) => {
    const c = cells[p.i];
    if (!p.spin) { rest(c, prev ? prev[p.i] : p.target); return; }
    for (let k = 0; k < 12; k++) c.seq[k] = k === 0 ? c.cur : Math.floor(cosmetic() * getAtlas().count);
    c.mode = 'spin'; c.s = 0;
  });
  return new Promise((resolve) => { play = { tl, t: 0, resolve, onStop: opts.onStop, stopped: [false, false, false] }; });
}

// Jump to the final grid at once (player skip). Same end state as a played spin.
export function skip() {
  if (!play) return;
  const { tl, resolve } = play; play = null;
  tl.cells.forEach((p) => rest(cells[p.i], p.target));
  resolve();
}

function stepCell(c, p, t, dt) {
  const cellH = L.cells[p.i].h, u = c.mat.uniforms;
  if (c.mode === 'spin') {
    if (t >= p.stopAt - EASE) {
      c.mode = 'ease'; c.s0 = c.s;
      c.sf = Math.max(Math.ceil(c.s + SPEED * EASE * 0.5), Math.ceil(c.s) + 1); // the landing tile is at least one tile ahead, so it is never visible yet
      c.seq[c.sf % 12] = symbolIndex(p.target);
      c.over = OVER_PX / cellH;
    } else { c.s += SPEED * dt; u.uBlur.value = BLUR; }
  }
  if (c.mode === 'ease') {
    const k = Math.min(1, (t - (p.stopAt - EASE)) / EASE);
    c.s = c.s0 + (c.sf + c.over - c.s0) * easeOut(k);
    u.uBlur.value = BLUR * (1 - k);
    if (t >= p.stopAt) c.mode = 'settle';
  }
  if (c.mode === 'settle') {
    const k = Math.min(1, (t - p.stopAt) / SETTLE);
    c.s = c.sf + c.over * (1 - easeInOut(k)); u.uBlur.value = 0;
    if (k >= 1) { rest(c, p.target); return; }
  }
  u.uScroll.value = c.s;
}

export function pulseCells(list) { for (const i of list) cells[i]?.sq.kick(7); }
// Frames the given cells (the open pair). Cleared by the next spin; a pegged cell loses its frame.
export function markCells(list = []) { rings.forEach((m, i) => { m.visible = list.includes(i); }); }

export function showPegs(list) {
  const on = new Set(list);
  pegMeshes.forEach((p, i) => {
    const was = p.on; p.on = on.has(i);
    p.mesh.visible = p.on;
    if (p.on) rings[i].visible = false;
    if (p.on) { placePeg(p, i); if (!was) { p.sp.x = 1.7; p.sp.v = 0; } } // a peg snaps on from a little above
  });
}

function clearLines() { lineAnim.forEach((a) => a.resolve()); lineAnim = []; lineMeshes.forEach((l) => { l.mesh.visible = false; l.mat.uniforms.uReveal.value = 0; }); }
export const clearWinLines = clearLines;

// lines: result.lines ({ cells: [a, b, c] }). Ink is drawn one line after another; cells squash and stretch as it passes.
// opts: { onLine(index) } for the brush sound. Resolves when the last stroke is complete.
export function playLines(lines, opts = {}) {
  clearLines();
  if (!lines?.length) return Promise.resolve();
  let last = null;
  const H = L.screen.h;
  lines.slice(0, lineMeshes.length).forEach((ln, k) => {
    const a = cellCenter(ln.cells[0]), b = cellCenter(ln.cells[ln.cells.length - 1]);
    const len = Math.hypot(b.x - a.x, b.y - a.y), cw = L.cells[ln.cells[0]].w, m = lineMeshes[k];
    m.mesh.position.set((a.x + b.x) / 2, H - (a.y + b.y) / 2, 0);
    m.mesh.rotation.z = Math.atan2(-(b.y - a.y), b.x - a.x);
    m.mesh.scale.set(len + cw * 0.7, cw * 0.24, 1);
    m.mat.uniforms.uReveal.value = 0; m.mesh.visible = false;
    last = new Promise((resolve) => lineAnim.push({ m, t: 0, delay: k * 0.14, resolve, cells: ln.cells, fired: false, onLine: () => opts.onLine?.(k) }));
  });
  return last;
}

export function tickReel(dt) {
  if (!cells.length || !L) return;
  const H = L.screen.h;
  if (play) {
    play.t += dt;
    for (const p of play.tl.cells) {
      if (p.spin) stepCell(cells[p.i], p, play.t, dt);
    }
    play.tl.stops.forEach((st, col) => {
      if (!play.stopped[col] && play.t >= st) { play.stopped[col] = true; shake = 2; play.onStop?.(col); }
    });
    if (play.t >= play.tl.end) { const r = play.resolve; play = null; r(); }
  }
  cells.forEach((c, i) => { c.sq.step(dt); place(c.mesh, L.cells[i], H, 1 / c.sq.x, c.sq.x); });
  pegMeshes.forEach((p) => {
    if (!p.on) return;
    p.sp.step(dt); const [w, h] = p.base ?? [10, 10];
    p.mesh.scale.set(w * p.sp.x, h * p.sp.x, 1);
  });
  lineAnim = lineAnim.filter((a) => {
    a.t += dt;
    if (a.t < a.delay) return true;
    if (!a.fired) { a.fired = true; a.m.mesh.visible = true; a.onLine(); a.cells.forEach((i) => cells[i].sq.kick(5)); }
    const k = Math.min(1, (a.t - a.delay) / 0.18);
    a.m.mat.uniforms.uReveal.value = k * 1.02;
    if (k >= 1) { a.resolve(); return false; }
    return true;
  });
  shake *= Math.exp(-dt * 28);
  if (shake < 0.05) shake = 0;
}

// Camera offset in px for the clack of each column.
export function getShake() { if (!shake) return { x: 0, y: 0 }; noise = -noise; return { x: shake * noise, y: shake * 0.5 }; }
export const isPlaying = () => !!play;
export const reelGroup = () => group;
export { spriteSize };
