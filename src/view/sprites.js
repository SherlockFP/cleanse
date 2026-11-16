// Every sprite goes through getTex(id). For now each id is a placeholder drawn on a canvas in the ART.md palette and style
// (cream paper, navy outline, flat fills, no gradient, no glow, no shadow). One place swaps in real art: useRealArt(ids)
// loads <ART_BASE><id>.png for those ids and replaces the placeholder image in the same texture, so no caller changes.
// Ids follow public/img paths from ART.md: 'sym/pebble', 'reel/peg', 'fx/jar', 'deni/idle' ...
import * as THREE from 'three';
import { PAL } from './palette.js';
import { CASE_RECTS } from './layout.js';
import { SYMBOLS } from '../core/data/symbols.js';

export const ART_BASE = './img/';
const N = PAL.navy, P = PAL.paper;

// ---------- drawing helpers (wobbly carved outline) ----------
const hash = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 374761393) ^ Math.imul(b + 0x7f4a7c15, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const strHash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
let SEED = 1;
const wob = (i, amt = 1.6) => (hash(SEED, i) - 0.5) * 2 * amt;

function trace(c, pts, close = true) {
  c.beginPath();
  pts.forEach(([x, y], i) => { const px = x + wob(i * 2), py = y + wob(i * 2 + 1); if (i) c.lineTo(px, py); else c.moveTo(px, py); });
  if (close) c.closePath();
}
function paint(c, fill, lw = 7) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = N; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
}
const shape = (c, pts, fill, lw) => { trace(c, pts); paint(c, fill, lw); };
const ellPts = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * 6.2832) * rx, cy + Math.sin((i / n) * 6.2832) * ry]);
const ell = (c, cx, cy, rx, ry, fill, lw) => shape(c, ellPts(cx, cy, rx, ry), fill, lw);
const line = (c, pts, lw = 6, col = N) => { trace(c, pts, false); c.lineWidth = lw; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };
const dot = (c, x, y, r, fill = N) => { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = fill; c.fill(); };

// ---------- placeholder drawings ----------
const D = {};
const def = (id, w, h, draw) => { D[id] = { w, h, draw }; };

def('sym/pebble', 256, 256, (c) => {
  ell(c, 128, 138, 92, 72, PAL.teal);
  for (let y = 150; y <= 190; y += 14) for (let x = 100; x <= 200; x += 14) if (((x - 128) / 82) ** 2 + ((y - 138) / 62) ** 2 < 1) dot(c, x + (y % 28 ? 7 : 0), y, 3.2);
  line(c, [[62, 120], [74, 100], [96, 88]], 6, P);
});
def('sym/sardine', 256, 256, (c) => {
  shape(c, [[196, 128], [240, 92], [236, 128], [240, 164]], PAL.teal);
  shape(c, [[96, 86], [128, 56], [150, 88]], PAL.teal);
  ell(c, 116, 128, 90, 46, PAL.teal);
  line(c, [[92, 100], [82, 128], [92, 156]], 5);
  line(c, [[110, 150], [170, 144]], 6, P);
  ell(c, 62, 118, 11, 11, PAL.coral, 4);
});
def('sym/tea', 256, 256, (c) => {
  ell(c, 128, 196, 84, 16, P);
  shape(c, [[78, 66], [178, 66], [170, 130], [148, 178], [108, 178], [86, 130]], PAL.coral);
  line(c, [[98, 84], [102, 128]], 8, P);
  line(c, [[90, 66], [166, 66]], 5);
});
def('sym/lantern', 256, 256, (c) => {
  line(c, [[92, 62], [100, 34], [128, 22], [156, 34], [164, 62]], 8);
  shape(c, [[88, 62], [168, 62], [158, 86], [98, 86]], N);
  shape(c, [[96, 86], [160, 86], [172, 172], [84, 172]], PAL.mustard);
  shape(c, [[128, 108], [144, 140], [128, 158], [112, 140]], PAL.coral, 4);
  shape(c, [[78, 172], [178, 172], [178, 200], [78, 200]], N);
});
def('sym/gull', 256, 256, (c) => {
  line(c, [[110, 176], [106, 214]], 6); line(c, [[136, 176], [140, 214]], 6);
  shape(c, [[48, 138], [20, 150], [60, 160]], P);
  ell(c, 116, 142, 74, 36, P);
  shape(c, [[92, 138], [124, 60], [190, 40], [160, 140]], P);
  line(c, [[130, 100], [160, 92]], 4); line(c, [[124, 120], [158, 112]], 4);
  ell(c, 188, 108, 22, 20, P);
  shape(c, [[205, 102], [240, 112], [205, 122]], PAL.mustard, 5);
  dot(c, 192, 102, 4);
});
def('sym/knot', 256, 256, (c) => {
  const pts = Array.from({ length: 48 }, (_, i) => { const t = (i / 48) * 6.2832; return [128 + 92 * Math.sin(t), 128 + 76 * Math.sin(t) * Math.cos(t)]; });
  line(c, [...pts, pts[0]], 38, N);
  line(c, [...pts, pts[0]], 24, PAL.mustard);
  c.setLineDash([5, 11]); line(c, [...pts, pts[0]], 4, N); c.setLineDash([]);
});
def('sym/net', 256, 256, (c) => {
  const d = [[128, 26], [230, 128], [128, 230], [26, 128]];
  trace(c, d); c.fillStyle = PAL.teal; c.fill();
  c.save(); trace(c, d); c.clip();
  for (let k = -200; k <= 200; k += 34) { line(c, [[128 + k - 128, 0], [128 + k + 128, 256]], 4); line(c, [[128 + k + 128, 0], [128 + k - 128, 256]], 4); }
  c.restore();
  trace(c, d); paint(c, null, 8);
});
def('sym/kelp', 256, 256, (c) => {
  const stalk = (x0, top, amp) => {
    const pts = []; for (let y = 238; y >= top; y -= 16) pts.push([x0 + amp * Math.sin(y / 24), y]);
    line(c, pts, 26, N); line(c, pts, 14, PAL.teal);
    pts.forEach(([x, y], i) => { if (i % 2 && i > 1) ell(c, x + (i % 4 === 1 ? -24 : 24), y, 22, 9, PAL.teal, 5); });
  };
  stalk(76, 90, 14); stalk(180, 80, 14); stalk(128, 28, 20);
});
def('sym/samovar', 256, 256, (c) => {
  shape(c, [[96, 200], [160, 200], [172, 232], [84, 232]], N);
  line(c, [[68, 120], [48, 140], [70, 160]], 8); line(c, [[188, 120], [208, 140], [186, 160]], 8);
  shape(c, [[190, 132], [222, 126], [224, 148], [190, 154]], N);
  ell(c, 128, 142, 62, 62, PAL.mustard);
  shape(c, [[84, 90], [172, 90], [152, 62], [104, 62]], PAL.mustard);
  ell(c, 128, 50, 13, 13, N);
  line(c, [[92, 120], [90, 160]], 7, P);
  line(c, [[84, 176], [172, 176]], 5);
});
def('sym/cat', 256, 256, (c) => {
  line(c, [[176, 214], [226, 206], [236, 160], [214, 140]], 22, N); line(c, [[176, 214], [226, 206], [236, 160], [214, 140]], 10, PAL.mustard);
  ell(c, 124, 172, 60, 62, PAL.mustard);
  shape(c, [[84, 78], [88, 30], [118, 58]], PAL.mustard); shape(c, [[168, 78], [164, 30], [134, 58]], PAL.mustard);
  ell(c, 126, 96, 46, 40, PAL.mustard);
  for (const x of [112, 126, 140]) line(c, [[x, 62], [x, 76]], 5);
  for (const y of [158, 182, 206]) { line(c, [[72, y], [92, y + 4]], 6); line(c, [[160, y + 4], [178, y]], 6); }
  dot(c, 110, 98, 5); dot(c, 142, 98, 5);
  shape(c, [[120, 110], [132, 110], [126, 118]], N, 3);
  line(c, [[96, 112], [64, 108]], 3); line(c, [[156, 112], [190, 108]], 3);
});
def('sym/barnacle', 256, 256, (c) => {
  ell(c, 128, 190, 98, 44, PAL.blush);
  line(c, [[58, 186], [78, 176]], 4); line(c, [[170, 204], [196, 192]], 4); line(c, [[96, 210], [116, 204]], 4);
  for (const [x, y, k] of [[84, 176, 1], [172, 174, 1], [128, 148, 1.15], [104, 200, 0.9], [156, 202, 0.9]]) {
    shape(c, [[x - 22 * k, y], [x - 11 * k, y - 46 * k], [x + 11 * k, y - 46 * k], [x + 22 * k, y]], PAL.blush, 6);
    ell(c, x, y - 46 * k, 11 * k, 5 * k, N, 0);
  }
});
def('sym/storm', 256, 256, (c) => {
  c.fillStyle = N;
  for (const [x, y, rx, ry] of [[88, 104, 46, 40], [140, 84, 52, 48], [184, 110, 40, 36]]) { trace(c, ellPts(x, y, rx, ry)); c.fill(); }
  trace(c, [[56, 118], [222, 118], [222, 146], [56, 146]]); c.fill();
  line(c, [[84, 96], [100, 80], [126, 76]], 6, P); line(c, [[70, 130], [150, 134]], 5, P);
  line(c, [[96, 176], [82, 222]], 12); line(c, [[150, 176], [136, 222]], 12);
});
def('sym/unknown', 256, 256, (c) => { ell(c, 128, 128, 80, 80, null, 8); c.setLineDash([2, 18]); line(c, ellPts(128, 128, 50, 50), 8); c.setLineDash([]); });

def('reel/cell_paper', 256, 256, (c) => {
  c.fillStyle = P; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = N; c.lineWidth = 6; c.strokeRect(8, 8, 240, 240);
});

// Case: coordinates are the case canvas (1024x1100), drawn at half size. Windows are cut out so the strips show through.
def('reel/case', 512, 550, (c) => {
  c.scale(0.5, 0.5);
  shape(c, [[60, 236], [512, 24], [964, 236]], PAL.coral, 14);
  shape(c, [[40, 236], [984, 236], [984, 268], [40, 268]], PAL.mustard, 10);
  shape(c, [[70, 268], [954, 268], [954, 1090], [70, 1090]], PAL.teal, 14);
  shape(c, [[116, 266], [908, 266], [908, 1058], [116, 1058]], PAL.mustard, 10);
  c.globalCompositeOperation = 'destination-out';
  for (const w of CASE_RECTS.cells) c.fillRect(w.x, w.y, w.w, w.h);
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = N; c.lineWidth = 9;
  for (const w of CASE_RECTS.cells) c.strokeRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
});

const peg = (open) => (c) => {
  const g = open ? 9 : 0;
  shape(c, [[26 - g, 8], [50, 8], [48, 150], [22 - g * 2, 150]], PAL.teal);
  shape(c, [[46, 8], [70 + g, 8], [74 + g * 2, 150], [48, 150]], PAL.teal);
  ell(c, 48, 66, 11, 11, PAL.mustard, 5);
};
def('reel/peg', 96, 160, peg(false));
def('reel/peg_open', 96, 160, peg(true));

def('fx/coin', 96, 96, (c) => {
  ell(c, 48, 48, 38, 38, PAL.mustard, 6);
  line(c, [[28, 52], [38, 42], [48, 52], [58, 42], [68, 52]], 5);
});
const lantern = (on) => (c) => {
  line(c, [[64, 4], [64, 26]], 5);
  shape(c, [[44, 24], [84, 24], [84, 38], [44, 38]], N);
  shape(c, [[34, 38], [94, 38], [108, 86], [94, 134], [34, 134], [20, 86]], on ? PAL.mustard : P, 6);
  line(c, [[56, 40], [48, 86], [56, 132]], 4); line(c, [[72, 40], [80, 86], [72, 132]], 4);
  if (on) shape(c, [[64, 62], [74, 90], [64, 108], [54, 90]], PAL.coral, 3);
  shape(c, [[44, 134], [84, 134], [84, 146], [44, 146]], N);
  line(c, [[64, 146], [64, 158]], 5);
};
def('fx/lantern_off', 128, 160, lantern(false));
def('fx/lantern_on', 128, 160, lantern(true));

def('fx/jar', 256, 320, (c) => {
  shape(c, [[60, 22], [196, 22], [196, 54], [60, 54]], PAL.mustard, 7);
  shape(c, [[70, 54], [186, 54], [186, 70], [226, 104], [226, 290], [30, 290], [30, 104], [70, 70]], null, 8);
  line(c, [[52, 112], [52, 250]], 5, P); line(c, [[42, 132], [42, 200]], 3);
});
const pile = (rows) => (c) => {
  for (let r = 0; r < rows; r++) for (const x of [-40, 0, 40]) ell(c, 128 + x + (r % 2 ? 18 : -18), 276 - r * 17, 34, 12, PAL.mustard, 5);
};
def('fx/coins_1', 256, 320, pile(2));
def('fx/coins_2', 256, 320, pile(5));
def('fx/coins_3', 256, 320, pile(8));

// Deni: adult woman, short navy hair, coral scarf, navy-and-cream striped shirt, teal rolled trousers, navy boots, blush skin.
def('deni/idle', 256, 384, (c) => {
  shape(c, [[96, 226], [126, 226], [124, 342], [94, 342]], PAL.teal); shape(c, [[130, 226], [160, 226], [162, 342], [132, 342]], PAL.teal);
  line(c, [[94, 310], [124, 310]], 5, P); line(c, [[132, 310], [162, 310]], 5, P);
  shape(c, [[86, 340], [128, 340], [132, 374], [82, 374]], N); shape(c, [[130, 340], [172, 340], [178, 374], [130, 374]], N);
  shape(c, [[88, 138], [168, 138], [172, 236], [84, 236]], P);
  for (let y = 154; y < 232; y += 16) line(c, [[87, y], [169, y]], 6);
  shape(c, [[88, 140], [64, 192], [86, 214], [102, 164]], P); shape(c, [[168, 140], [192, 192], [170, 214], [154, 164]], P);
  line(c, [[76, 176], [92, 188]], 5); line(c, [[180, 176], [164, 188]], 5);
  dot(c, 92, 222, 12, PAL.blush); dot(c, 164, 222, 12, PAL.blush);
  shape(c, [[138, 140], [170, 196], [152, 202], [128, 150]], PAL.coral);
  shape(c, [[94, 124], [162, 124], [166, 148], [90, 148]], PAL.coral);
  ell(c, 128, 94, 40, 46, N);
  ell(c, 128, 102, 31, 36, PAL.blush);
  shape(c, [[92, 84], [164, 84], [160, 62], [128, 52], [96, 62]], N);
  dot(c, 116, 102, 3.5); dot(c, 140, 102, 3.5); line(c, [[118, 120], [138, 120]], 3);
});

// ---------- textures ----------
const cache = new Map();
let version = 0, realSet = undefined; // undefined: placeholders only; Set: ids with real art; 'all': probe every id
const known = () => Object.keys(D);
export const KNOWN_IDS = known;

function drawerFor(id) {
  if (D[id]) return D[id];
  if (id.startsWith('deni/')) return D['deni/idle']; // other poses share the idle placeholder
  if (id.startsWith('sym/')) return D['sym/unknown'];
  if (id.startsWith('trinket/') || id.startsWith('ui/') || id.startsWith('fx/')) return D['sym/unknown'];
  return D['sym/unknown'];
}

function canvasFor(id) {
  const d = drawerFor(id), cv = document.createElement('canvas');
  cv.width = d.w; cv.height = d.h;
  const c = cv.getContext('2d');
  SEED = strHash(id);
  d.draw(c);
  return cv;
}

function loadReal(id, tex) {
  const img = new Image();
  img.onload = () => { tex.image = img; tex.needsUpdate = true; version++; };
  img.src = `${ART_BASE}${id}.png`; // a missing file just never fires onload; the placeholder stays
}

export function getTex(id) {
  let e = cache.get(id);
  if (!e) {
    const tex = new THREE.CanvasTexture(canvasFor(id));
    tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    e = { tex, w: drawerFor(id).w, h: drawerFor(id).h };
    cache.set(id, e);
    if (realSet === 'all' || (realSet && realSet.has(id))) loadReal(id, tex);
  }
  return e.tex;
}
export const spriteSize = (id) => { getTex(id); const e = cache.get(id); return [e.w, e.h]; };

// Call once with the ids that have a real file in public/img (a manifest from cut-art.py), or 'all' to try every id.
// Real files are loaded as flat-color PNG. Ink-mask decoding (ART.md section 5) is not implemented here yet.
export function useRealArt(ids) {
  realSet = ids === 'all' ? 'all' : new Set(ids);
  for (const [id, e] of cache) if (realSet === 'all' || realSet.has(id)) loadReal(id, e.tex);
}

// Tiny tiling paper grain (luminance in R, tuned for multiply) and the full paper tile.
export function getGrainTex() {
  let e = cache.get('bg/grain');
  if (!e) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d'), im = c.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) { const v = 150 + Math.floor(hash(i, 3) * 105 * (hash(i >> 3, 9) > 0.8 ? 0.5 : 1)); im.data.set([v, v, v, 255], i * 4); }
    c.putImageData(im, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.generateMipmaps = false; tex.minFilter = tex.magFilter = THREE.NearestFilter;
    e = { tex }; cache.set('bg/grain', e);
  }
  return e.tex;
}
export function getPaperTex() {
  let e = cache.get('bg/paper');
  if (!e) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d'); c.fillStyle = P; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      c.fillStyle = hash(i, 5) > 0.5 ? 'rgba(30,42,68,0.05)' : 'rgba(255,250,235,0.35)';
      c.fillRect(hash(i, 1) * 256, hash(i, 2) * 256, 1 + hash(i, 4) * 2, 1 + hash(i, 6) * 2);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.generateMipmaps = false; tex.minFilter = tex.magFilter = THREE.NearestFilter;
    e = { tex }; cache.set('bg/paper', e);
  }
  return e.tex;
}

// ---------- symbol atlas for the reel strips ----------
const TILE = 128, COLS = 4;
export const SYMBOL_IDS = SYMBOLS.map((s) => s.id);
export const symbolIndex = (id) => { const i = SYMBOL_IDS.indexOf(id); return i < 0 ? 0 : i; };
let atlas = null, atlasVersion = -1;

export function getAtlas() {
  if (!atlas) {
    const rows = Math.ceil(SYMBOL_IDS.length / COLS), cv = document.createElement('canvas');
    cv.width = COLS * TILE; cv.height = rows * TILE;
    const tex = new THREE.CanvasTexture(cv);
    tex.generateMipmaps = false; tex.minFilter = tex.magFilter = THREE.LinearFilter;
    atlas = { tex, cv, cols: COLS, rows, count: SYMBOL_IDS.length };
  }
  if (atlasVersion !== version || atlasVersion < 0) {
    const c = atlas.cv.getContext('2d');
    const back = getTex('reel/cell_paper').image;
    SYMBOL_IDS.forEach((id, i) => {
      const x = (i % COLS) * TILE, y = Math.floor(i / COLS) * TILE, pad = TILE * 0.08;
      c.drawImage(back, x, y, TILE, TILE);
      c.drawImage(getTex('sym/' + id).image, x + pad, y + pad, TILE - 2 * pad, TILE - 2 * pad);
    });
    atlas.tex.needsUpdate = true; atlasVersion = version;
  }
  return atlas;
}
// Call each frame: rebuilds the atlas when a real sprite replaced a placeholder.
export function tickSprites() { if (atlas && atlasVersion !== version) getAtlas(); }
