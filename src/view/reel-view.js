// The 5x3 reels: strips, held cells, trick targets and the pattern highlight. The outcome is computed by core before this runs: the view
// only plays it back. Pillar: every column stops at a fixed time, whatever the grid. Nothing here reads the grid to decide timing.
import * as THREE from 'three';
import { getTex, getAtlas, symbolIndex, spriteSize } from './sprites.js';
import { strip as stripMaterial, inkLine } from './shaders.js';
import { Spring } from './springs.js';
import { PAL, PATTERN_COLORS, hexToRgb } from './palette.js';

export const COLS = 5, ROWS = 3, N = COLS * ROWS;
export const STOP_BASE = 0.55, STOP_GAP = 0.09;  // first column stops here, then one per 90 ms
export const FAST_BASE = 0.30, FAST_GAP = 0.04;  // fast mode
export const MAX_HIGHLIGHT = 1.5;                // seconds for the whole pattern pass of a 4-pattern spin
const SPEED = 16;     // tiles per second while spinning
const EASE = 0.16;    // last stretch before the stop: ease out into the result
const OVER_PX = 8;    // overshoot past the rest position
const SETTLE = 0.09;  // back from the overshoot
const BLUR = 0.07;

// The stop schedule. `grid` is accepted and ignored on purpose: no pair, miss or win may change a stop time.
export function stopSchedule(grid, opts = {}) {
  const [b, g] = opts.fast ? [FAST_BASE, FAST_GAP] : [STOP_BASE, STOP_GAP];
  return Array.from({ length: COLS }, (_, c) => b + c * g);
}

// Per-cell plan for one spin. Depends only on which cells are held (a player choice) and the fast setting, never on symbols.
export function buildTimeline(result, opts = {}) {
  const stops = stopSchedule(result.grid, opts);
  const held = new Set(result.held ?? opts.held ?? []);
  return {
    stops,
    end: stops[COLS - 1] + SETTLE,
    cells: result.grid.map((target, i) => ({ i, col: i % COLS, spin: !held.has(i), stopAt: stops[i % COLS], target })),
  };
}

// Highlight plan: patterns in the order core gives them (evaluation order), cells in the order of each pattern's shape.
// One step per cell. Steps shrink so the whole pass stays under maxTotal. Pure, no three.
export function highlightPlan(patterns, { maxTotal = MAX_HIGHLIGHT, step = 0.11, gap = 0.12 } = {}) {
  const total = patterns.reduce((a, p) => a + p.cells.length, 0), n = patterns.length;
  if (!total) return { steps: [], total: 0, stepDur: 0 };
  gap = Math.min(gap, (maxTotal * 0.25) / Math.max(1, n - 1)); // many patterns: the pauses shrink too
  const stepDur = Math.max(0.01, Math.min(step, (maxTotal - gap * (n - 1)) / total));
  const steps = []; let t = 0, k = 0;
  patterns.forEach((p, pi) => {
    p.cells.forEach((cell, ci) => {
      steps.push({ n: k++, p: pi, k: ci, cell, prev: ci ? p.cells[ci - 1] : -1, at: t, dur: stepDur, last: ci === p.cells.length - 1 });
      t += stepDur;
    });
    t += gap;
  });
  return { steps, total: t - gap, stepDur };
}

// ---------- state ----------
const cells = [], held = [], targets = [], rings = [], segs = [];
let group = null, caseMesh = null, L = null, grid = null, time = 0;
let play = null;           // { tl, t, resolve, onStop, stopped:[bool x5] }
let hl = null;             // { plan, t, fired, resolve, onStep, colors:[] }
let shake = 0, noise = 1;
const easeOut = (u) => 1 - (1 - u) ** 3;
const easeInOut = (u) => u * u * (3 - 2 * u);
let rnd = 12345; const cosmetic = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };

const mat = (id, color) => new THREE.MeshBasicMaterial({ map: getTex(id), transparent: true, depthTest: false, depthWrite: false, color });

export function initReel(parent) {
  group = new THREE.Group(); parent.add(group);
  const plane = new THREE.PlaneGeometry(1, 1), atlas = getAtlas();
  for (let i = 0; i < N; i++) {
    const m = stripMaterial(atlas), mesh = new THREE.Mesh(plane, m);
    mesh.renderOrder = 10; group.add(mesh);
    cells.push({ mesh, mat: m, seq: m.uniforms.uSeq.value, s: 0, mode: 'rest', sq: new Spring(1, 420, 13), cur: 0, sf: 0, s0: 0, over: 0 });
  }
  caseMesh = new THREE.Mesh(plane, mat('machine/case', '#ffffff')); caseMesh.renderOrder = 20; group.add(caseMesh);

  // ring textures are drawn in code (UI marks, not sprites): a solid frame for pattern cells, a dashed one for trick targets
  const ringTex = (dash) => {
    const cv = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = cv.getContext('2d');
    g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineJoin = 'round'; if (dash) g.setLineDash([18, 12]);
    g.strokeRect(8, 8, 112, 112);
    return new THREE.CanvasTexture(cv);
  };
  const solid = ringTex(false), dashed = ringTex(true);
  for (let i = 0; i < N; i++) {
    const r = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: solid, transparent: true, depthTest: false, color: PAL.candle }));
    r.renderOrder = 35; r.visible = false; group.add(r); rings.push(r);
    const t = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: dashed, transparent: true, depthTest: false, color: PAL.green }));
    t.renderOrder = 36; t.visible = false; group.add(t); targets.push(t);
    const k = new THREE.Mesh(plane, mat('ui/lock', '#ffffff')); k.renderOrder = 38; k.visible = false; group.add(k); held.push(k);
  }
  for (let i = 0; i < 40; i++) {
    const m = inkLine(i * 7 + 1), mesh = new THREE.Mesh(plane, m);
    mesh.renderOrder = 30; mesh.visible = false; group.add(mesh); segs.push({ mesh, mat: m, at: 0, dur: 0, on: false });
  }
  return group;
}

// y-down layout rect -> y-up scene position (camera is (0,w,h,0)).
function place(mesh, r, H, sx = 1, sy = 1) {
  mesh.position.set(r.x + r.w / 2, H - (r.y + r.h / 2), 0);
  mesh.scale.set(r.w * sx, r.h * sy, 1);
}
const center = (i) => ({ x: L.cells[i].x + L.cells[i].w / 2, y: L.cells[i].y + L.cells[i].h / 2 });
const heldList = [], targetList = [];

export function layoutReel(layout) {
  L = layout;
  const H = layout.screen.h;
  place(caseMesh, layout.caseArt ?? layout.case, H);
  cells.forEach((c, i) => place(c.mesh, layout.cells[i], H, 1 / c.sq.x, c.sq.x));
  rings.forEach((m, i) => place(m, layout.cells[i], H, 1.06, 1.06));
  targets.forEach((m, i) => place(m, layout.cells[i], H, 1.1, 1.1));
  held.forEach((m, i) => {
    const r = layout.cells[i], [w, h] = spriteSize('ui/lock'), s = r.w * 0.34;
    m.position.set(r.x + r.w * 0.8, H - (r.y + r.h * 0.2), 0); m.scale.set(s * (w / Math.max(w, h)), s * (h / Math.max(w, h)), 1);
  });
  if (grid) setGrid(grid);
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
export const getGrid = () => grid;

// Held cells show a lock and do not spin; targets get a dashed green frame that breathes (a trick is waiting for a tap).
export function setHeld(list = []) { heldList.length = 0; heldList.push(...list); held.forEach((m, i) => { m.visible = heldList.includes(i); }); }
export function setTargets(list = []) { targetList.length = 0; targetList.push(...list); targets.forEach((m, i) => { m.visible = targetList.includes(i); }); }

// Plays the spin: unheld cells scroll, each column stops on its fixed time, the result tile arrives last.
// opts: { fast, held, onStop(col) }. Resolves when the last column has settled.
export function playSpin(result, opts = {}) {
  if (play) skipSpin();
  clearHighlights();
  const tl = buildTimeline(result, { ...opts, held: result.held ?? opts.held ?? heldList });
  const prev = grid;
  grid = result.grid;
  tl.cells.forEach((p) => {
    const c = cells[p.i];
    if (!p.spin) { rest(c, prev ? prev[p.i] : p.target); return; }
    for (let k = 0; k < 12; k++) c.seq[k] = k === 0 ? c.cur : Math.floor(cosmetic() * getAtlas().count);
    c.mode = 'spin'; c.s = 0;
  });
  return new Promise((resolve) => { play = { tl, t: 0, resolve, onStop: opts.onStop, stopped: Array(COLS).fill(false) }; });
}

// Jump to the final grid at once (player skip). Same end state as a played spin.
export function skipSpin() {
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

// ---------- pattern highlight ----------
export function clearHighlights() {
  if (hl) { const r = hl.resolve; hl = null; r(); }
  rings.forEach((m) => { m.visible = false; });
  segs.forEach((s) => { s.on = false; s.mesh.visible = false; s.mat.uniforms.uReveal.value = 0; });
}

function fireStep(s, colors) {
  const col = colors[s.p % colors.length], ring = rings[s.cell];
  ring.material.color.set(col); ring.visible = true;
  cells[s.cell].sq.kick(5 + Math.min(s.k, 4));
  if (s.prev >= 0) {
    const sg = segs.find((x) => !x.on) ?? segs[0], a = center(s.prev), b = center(s.cell), H = L.screen.h, cw = L.cells[s.cell].w;
    const [r, g, bl] = hexToRgb(col); sg.mat.uniforms.uColor.value.set(r, g, bl);
    sg.mesh.position.set((a.x + b.x) / 2, H - (a.y + b.y) / 2, 0);
    sg.mesh.rotation.z = Math.atan2(-(b.y - a.y), b.x - a.x);
    sg.mesh.scale.set(Math.hypot(b.x - a.x, b.y - a.y) + cw * 0.3, cw * 0.2, 1);
    sg.at = s.at; sg.dur = s.dur; sg.on = true; sg.mesh.visible = true; sg.mat.uniforms.uReveal.value = 0;
  }
}

// patterns: [{cells:[..]}] in evaluation order. Draws each pattern's shape cell by cell with a stroke between cells.
// opts: { onStep({n, p, k, cell, last}) } is the rising-pitch hook: k is the cell's position inside its pattern, n counts all steps.
// Resolves a short hold after the last cell. The rings stay until clearHighlights().
export function playPatterns(patterns, opts = {}) {
  clearHighlights();
  const plan = highlightPlan(patterns ?? [], opts);
  if (!plan.steps.length) return Promise.resolve();
  return new Promise((resolve) => { hl = { plan, t: 0, fired: 0, resolve, onStep: opts.onStep, colors: opts.colors ?? PATTERN_COLORS, hold: opts.hold ?? 0.15 }; });
}
// Show everything at once (tap to skip). Calls no onStep.
export function skipPatterns() {
  if (!hl) return;
  const h = hl; hl = null;
  h.plan.steps.slice(h.fired).forEach((s) => fireStep(s, h.colors));
  segs.forEach((s) => { if (s.on) s.mat.uniforms.uReveal.value = 1.02; });
  h.resolve();
}
export function skip() { skipSpin(); skipPatterns(); }

export function tickReel(dt) {
  if (!cells.length || !L) return;
  time += dt;
  const H = L.screen.h;
  if (play) {
    play.t += dt;
    for (const p of play.tl.cells) if (p.spin) stepCell(cells[p.i], p, play.t, dt);
    play.tl.stops.forEach((st, col) => {
      if (!play.stopped[col] && play.t >= st) { play.stopped[col] = true; shake = 2; play.onStop?.(col); }
    });
    if (play.t >= play.tl.end) { const r = play.resolve; play = null; r(); }
  }
  cells.forEach((c, i) => { c.sq.step(dt); place(c.mesh, L.cells[i], H, 1 / c.sq.x, c.sq.x); });
  if (hl) {
    hl.t += dt;
    while (hl && hl.fired < hl.plan.steps.length && hl.plan.steps[hl.fired].at <= hl.t) {
      const s = hl.plan.steps[hl.fired++];
      fireStep(s, hl.colors); hl.onStep?.(s);
    }
    if (hl && hl.t >= hl.plan.total + hl.hold) { const r = hl.resolve; hl = null; r(); }
  }
  const t = hl?.t ?? 1e9;
  for (const s of segs) if (s.on) s.mat.uniforms.uReveal.value = Math.min(1, Math.max(0, (t - s.at) / s.dur)) * 1.02;
  const breathe = 1.1 + Math.sin(time * 5) * 0.025; // slow, small: no flicker
  targets.forEach((m, i) => { if (m.visible) place(m, L.cells[i], H, breathe, breathe); });
  shake *= Math.exp(-dt * 28);
  if (shake < 0.05) shake = 0;
}

// Camera offset in px for the clack of each column.
export function getShake() { if (!shake) return { x: 0, y: 0 }; noise = -noise; return { x: shake * noise, y: shake * 0.5 }; }
export const isPlaying = () => !!play;
export const isHighlighting = () => !!hl;
export const reelGroup = () => group;
export { spriteSize };
