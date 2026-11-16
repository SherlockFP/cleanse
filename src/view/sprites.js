// Every sprite goes through getTex(id). Real cut art comes from public/img (manifest.json from scripts/cut-art.py); an id with no file
// gets a code-drawn placeholder (cream paper edge, flat fill, the id's last word). The list of ids is never hardcoded: whatever the
// manifest names is loaded, and refreshArt() picks up files that arrive later. Callers see `artVersion()` change when sizes change.
import * as THREE from 'three';
import { PAL, PLUM_LIFT } from './palette.js';
import { DEFAULT_CASE } from './layout.js';

export const ART_BASE = './img/';
const REAL = new Map();     // id -> HTMLImageElement
const cache = new Map();    // id -> { tex, canvas, w, h }
let manifest = {}, caseReal = null, version = 0, symbols = [], atlas = null, atlasVersion = -1;

export const hasReal = (id) => REAL.has(id);
export const realCount = () => REAL.size;
export const artIds = () => [...REAL.keys()];
export const artVersion = () => version;
export const getCaseRects = () => caseReal ?? DEFAULT_CASE;

const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const fileOf = (id) => `${ART_BASE}${id}.${id.startsWith('bg/') ? 'jpg' : 'png'}`;
// Size of a placeholder when the manifest does not know the id yet (by prefix, so a swap-in changes little).
const DEFAULT_SIZE = { devil: [256, 384], char: [256, 256], bg: [512, 1024], ui: [192, 192], machine: DEFAULT_CASE.size };
function sizeOf(id) {
  if (REAL.has(id)) { const i = REAL.get(id); return [i.naturalWidth || i.width, i.naturalHeight || i.height]; }
  if (manifest[id]) return manifest[id];
  return DEFAULT_SIZE[id.split('/')[0]] ?? [192, 192];
}

// ---------- placeholder ----------
const FILLS = [PAL.candle, PAL.green, PAL.red, PAL.brass, '#6b4a7a'];
function blob(c, cx, cy, rx, ry, seed, fill, edge) {
  const pts = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * 6.2832, k = 1 + (((hash(seed + i) % 100) / 100) - 0.5) * 0.08;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.lineJoin = 'round'; c.lineWidth = edge * 2; c.strokeStyle = PAL.bone; c.stroke(); c.fillStyle = fill; c.fill();
}
function drawPlaceholder(c, w, h, id) {
  const [kind, name = ''] = id.split('/'), seed = hash(id), fill = FILLS[seed % FILLS.length], e = Math.max(3, w * 0.025);
  if (id === 'machine/case') {
    c.fillStyle = '#5a3a2a'; c.fillRect(0, 0, w, h);
    c.strokeStyle = PAL.brass; c.lineWidth = w * 0.02; c.strokeRect(w * 0.02, h * 0.02, w * 0.96, h * 0.96);
    c.globalCompositeOperation = 'destination-out';
    for (const [a, b, d, f] of getCaseRects().windows) c.fillRect(a * w, b * h, (d - a) * w, (f - b) * h);
    c.globalCompositeOperation = 'source-over';
    return;
  }
  if (kind === 'bg') {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1838'); g.addColorStop(1, PAL.plum);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.bone;
    for (let i = 0; i < 40; i++) { const s = hash(id + i); c.fillRect(((s % 997) / 997) * w, (((s >> 10) % 613) / 613) * h * 0.6, 2, 2); }
    return;
  }
  if (kind === 'devil' || kind === 'char') {
    blob(c, w / 2, h * 0.68, w * 0.36, h * 0.28, seed, PAL.red, e);
    blob(c, w / 2, h * 0.3, w * 0.26, h * 0.18, seed + 5, PAL.red, e);
    c.fillStyle = PAL.plum; c.fillRect(w * 0.3, h * 0.08, w * 0.4, h * 0.1);
  } else if (kind === 'ui' || kind === 'stake') {
    c.fillStyle = PAL.bone; c.fillRect(e, e, w - 2 * e, h - 2 * e); c.fillStyle = fill; c.fillRect(e * 2, e * 2, w - 4 * e, h - 4 * e);
  } else blob(c, w / 2, h / 2, w * 0.4, h * 0.4, seed, fill, e);
  c.fillStyle = PAL.plum; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `bold ${Math.round(w * 0.16)}px sans-serif`;
  c.fillText(name.slice(0, 7), w / 2, h / 2, w * 0.8);
}

// ---------- textures ----------
function entryFor(id) {
  let e = cache.get(id);
  if (e) return e;
  const [w, h] = sizeOf(id), canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const tex = new THREE.CanvasTexture(canvas); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  e = { tex, canvas, w, h }; cache.set(id, e); paint(id, e);
  return e;
}
function paint(id, e) {
  const [w, h] = sizeOf(id);
  if (e.canvas.width !== w || e.canvas.height !== h) { e.canvas.width = w; e.canvas.height = h; }
  const c = e.canvas.getContext('2d');
  e.w = w; e.h = h; c.clearRect(0, 0, w, h);
  if (REAL.has(id)) c.drawImage(REAL.get(id), 0, 0, w, h); else drawPlaceholder(c, w, h, id);
  e.tex.needsUpdate = true;
}
export const getTex = (id) => entryFor(id).tex;
export const spriteSize = (id) => { const e = entryFor(id); return [e.w, e.h]; };
export const getCanvas = (id) => entryFor(id).canvas;

function loadImg(id) {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => { REAL.set(id, im); res(true); };
    im.onerror = () => res(false);
    im.src = fileOf(id);
  });
}
async function getJson(path) { try { const r = await fetch(path); return r.ok ? await r.json() : null; } catch { return null; } }

// Call before initView, and again (refreshArt) when new files may have landed. Repaints placeholders that now have art.
export async function refreshArt() {
  const m = await getJson(`${ART_BASE}manifest.json?v=${Date.now()}`);
  if (!m) return 0;
  manifest = m;
  const cr = m['machine/case'] ? await getJson(`${ART_BASE}machine/case_rects.json`) : null; // no case art yet: no request
  if (cr?.windows?.length === 15) caseReal = { size: cr.size ?? manifest['machine/case'] ?? DEFAULT_CASE.size, windows: cr.windows };
  const todo = Object.keys(m).filter((id) => !REAL.has(id));
  const ok = await Promise.all(todo.map((id) => loadImg(id)));
  const got = todo.filter((_, i) => ok[i]);
  for (const id of got) { const e = cache.get(id); if (e) paint(id, e); }
  if (cache.has('machine/case')) paint('machine/case', cache.get('machine/case'));
  if (got.length || caseReal) version++;
  return got.length;
}
export const preloadArt = refreshArt;

// ---------- symbol atlas for the reel strips ----------
const TILE = 128, COLS = 4;
// list: [{id, icon}] from symbols.json. The atlas has room for at least 16 tiles so the strip shader's size never changes.
export function setSymbols(list) { symbols = list.map((s) => ({ id: s.id, icon: s.icon ?? `sym/${s.id}` })); atlas = null; version++; }
export const symbolIndex = (id) => Math.max(0, symbols.findIndex((s) => s.id === id));
export const symbolCount = () => symbols.length;

export function getAtlas() {
  const rows = Math.max(4, Math.ceil(symbols.length / COLS));
  if (!atlas) {
    const canvas = Object.assign(document.createElement('canvas'), { width: TILE * COLS, height: TILE * rows });
    const tex = new THREE.CanvasTexture(canvas); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
    atlas = { tex, canvas, cols: COLS, rows, count: symbols.length };
  }
  const c = atlas.canvas.getContext('2d');
  symbols.forEach((s, i) => {
    const x = (i % COLS) * TILE, y = Math.floor(i / COLS) * TILE, src = getCanvas(s.icon), k = Math.min((TILE * 0.9) / src.width, (TILE * 0.9) / src.height);
    c.fillStyle = PLUM_LIFT; c.fillRect(x, y, TILE, TILE);
    c.drawImage(src, x + (TILE - src.width * k) / 2, y + (TILE - src.height * k) / 2, src.width * k, src.height * k);
  });
  atlas.tex.needsUpdate = true; atlasVersion = version;
  return atlas;
}
// Call each frame: redraws the atlas when real art arrived.
export function tickSprites() { if (atlas && atlasVersion !== version) getAtlas(); }
