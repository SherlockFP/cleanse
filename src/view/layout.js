// Portrait layout from window size. Pure JS (no three, no DOM). All rects are {x, y, w, h} in CSS px, origin top-left of the window.
// Desktop rule: a window wider than 0.6 x its height gets a centered column of 9:19.5; the rest is background. Phones use the whole window.
//
// Top to bottom: hud (DOM text + canvas debt bar), curses, stage (heat meter | speech | devil), machine case with the 5x3 window,
// charm shelf, trick pockets, buttons (STOKE | SPIN/COLLECT | BANK).

// Placeholder for public/img/machine/case_rects.json (written by cut-art.py): case canvas size in px and 15 window rects as
// fractions [x0, y0, x1, y1] of the case, row-major. computeLayout(w, h, rects) takes the real file once it exists.
const CW = 1024, CH = 740, CELL = 164, GAP = 12, X0 = (CW - (5 * CELL + 4 * GAP)) / 2, Y0 = 120; // a low header: the stand-in case gives the cells the room
export const DEFAULT_CASE = Object.freeze({
  size: Object.freeze([CW, CH]),
  windows: Object.freeze(Array.from({ length: 15 }, (_, i) => {
    const x = X0 + (i % 5) * (CELL + GAP), y = Y0 + Math.floor(i / 5) * (CELL + GAP);
    return Object.freeze([x / CW, y / CH, (x + CELL) / CW, (y + CELL) / CH]);
  })),
});

export const DESIGN_ASPECT = 9 / 19.5;
export const PHONE_MAX_ASPECT = 0.6; // w / h at or below this: use the whole window
export const COLS = 5, ROWS = 3;

export function columnOf(w, h) {
  const cw = w / h <= PHONE_MAX_ASPECT ? w : Math.min(w, h * DESIGN_ASPECT);
  return { x: (w - cw) / 2, y: 0, w: cw, h };
}

const r = (x, y, w, h) => ({ x, y, w, h });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function computeLayout(w, h, caseRects = DEFAULT_CASE, ins = null) {
  const col = columnOf(w, h), X = col.x, W = col.w, H = h;
  const g = Math.max(3, Math.round(H * 0.007)), pad = Math.round(W * 0.03);

  // Bottom stack first, so the SPIN button always sits in the bottom third.
  const btnH = clamp(Math.round(H * 0.1), 64, 96), margin = Math.round(H * 0.022);
  const btnY = H - margin - btnH;
  const spinW = Math.round(Math.max(160, Math.min(W * 0.5, btnH * 2.8)));
  const sideW = Math.floor((W - 2 * pad - spinW - 2 * g) / 2), sideH = Math.round(btnH * 0.82);
  const spin = r(Math.round(X + (W - spinW) / 2), btnY, spinW, btnH);
  const stoke = r(Math.round(X + pad), btnY + Math.round((btnH - sideH) / 2), sideW, sideH);
  const bank = r(Math.round(X + W - pad - sideW), stoke.y, sideW, sideH);
  const pockH = clamp(Math.round(H * 0.065), 40, 64);
  const pockets = r(X + pad, btnY - g - pockH, W - 2 * pad, pockH);
  const charmH = clamp(Math.round(H * 0.075), 44, 72);
  const charms = r(X + pad, pockets.y - g - charmH, W - 2 * pad, charmH);

  // Top stack.
  const hudH = clamp(Math.round(H * 0.06), 36, 56);
  const hud = r(X + pad, g, W - 2 * pad, hudH);
  const bar = ins ? r(hud.x, Math.max(2, ins.top * 0.3), hud.w, 8) : r(hud.x, hud.y + hudH * 0.62, hud.w, hudH * 0.3); // ins: where the DOM debt meter is, for the coin flight
  const cursesH = clamp(Math.round(H * 0.03), 18, 30);
  const curses = r(X + pad, hud.y + hudH + g, W - 2 * pad, cursesH);
  const floor = ins ? H - ins.bottom : charms.y, stageTop = ins ? ins.top + g : curses.y + cursesH + g;
  // When the case is width-bound (desktop column, tall phones) the height it cannot use goes to the stage, so Brimble is not tiny.
  const span = floor - stageTop, spare = Math.round(span - W * 0.98 * (caseRects.size[1] / caseRects.size[0]) - 2 * g);
  const stageH = ins ? clamp(Math.max(Math.round(span * 0.2), spare), 40, 170) : clamp(Math.max(Math.round(H * 0.1), spare), 60, 170);
  const stage = r(X + pad, stageTop, W - 2 * pad, stageH);
  const meterW = Math.min(stageH * 0.34, W * 0.1);
  const meter = r(stage.x, stage.y, meterW, stageH);
  const [dwA, dhA] = [0.62, 1]; // devil sprite is about 0.62 wide per tall
  const devW = Math.min(stageH * dwA * dhA, W * 0.32);
  const devil = r(stage.x + stage.w - devW, stage.y, devW, stageH);
  const speech = r(meter.x + meter.w + pad, stage.y, devil.x - meter.x - meter.w - 2 * pad, stageH);

  // The case takes what is left.
  const [cw0, ch0] = caseRects.size, aspect = ch0 / cw0;
  const top = stage.y + stage.h + g, avail = Math.max(60, floor - g - top);
  const cw = Math.min(W * 0.98, avail / aspect), chh = cw * aspect;
  const kase = r(X + (W - cw) / 2, top + (avail - chh) / 2, cw, chh);
  const cells = caseRects.windows.map(([a, b, c, d]) => r(kase.x + a * kase.w, kase.y + b * kase.h, (c - a) * kase.w, (d - b) * kase.h));
  const cell = cells[0].w, gap = cells[1].x - cells[0].x - cell;
  const grid = { x: cells[0].x, y: cells[0].y, cell, gap };

  return {
    screen: r(0, 0, w, h), column: col, scale: W / 390,
    machine: kase, case: kase, cells, grid, hud, bar, curses, stage, meter, speech, devil, charms, pockets,
    buttons: { spin, collect: spin, stoke, bank }, spin, stoke, bank,
  };
}

// Rects that must not overlap each other (cells live inside the case; bar inside the hud; collect shares the spin rect).
export const EXCLUSIVE = ['hud', 'curses', 'meter', 'speech', 'devil', 'case', 'charms', 'pockets', 'stoke', 'spin', 'bank'];
