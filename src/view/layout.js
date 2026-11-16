// Portrait layout from window size. Pure JS (no three, no DOM). All rects are {x, y, w, h} in CSS px, origin top-left of the window.
// Desktop rule: a window wider than 0.6 x its height gets a centered column of 9:19.5; the rest is paper. Phones use the whole window.

// Placeholder for public/img/reel/case_rects.json (written by cut-art.py, ART.md section 5). Same shape: case canvas size and the
// nine window rects in case px, row-major. computeLayout(w, h, rects) takes the real file once it exists.
const CELL = 232, BAR = 24, X0 = 140, Y0 = 290;
export const CASE_RECTS = Object.freeze({
  size: Object.freeze([1024, 1100]),
  cells: Object.freeze(Array.from({ length: 9 }, (_, i) =>
    Object.freeze({ x: X0 + (i % 3) * (CELL + BAR), y: Y0 + Math.floor(i / 3) * (CELL + BAR), w: CELL, h: CELL }))),
});

export const DESIGN_ASPECT = 9 / 19.5;
export const PHONE_MAX_ASPECT = 0.6; // w / h at or below this: use the whole window

export function columnOf(w, h) {
  const cw = w / h <= PHONE_MAX_ASPECT ? w : Math.min(w, h * DESIGN_ASPECT);
  return { x: (w - cw) / 2, y: 0, w: cw, h };
}

const r = (x, y, w, h) => ({ x, y, w, h });

export function computeLayout(w, h, caseRects = CASE_RECTS) {
  const col = columnOf(w, h), X = col.x, W = col.w, H = h;
  const gap = Math.round(H * 0.01);

  const top = r(X, 0, W, Math.round(H * 0.095)); // lantern string and spins
  const lantern = r(X + W * 0.04, top.h * 0.1, W * 0.92, top.h * 0.85);

  const spinH = Math.min(96, Math.max(56, Math.round(H * 0.1)));
  const spinW = Math.round(Math.min(W * 0.72, spinH * 3.6));
  const spin = r(Math.round(X + (W - spinW) / 2), H - spinH - Math.round(H * 0.035), spinW, spinH);

  // The case takes what is left above the lower band (Deni, clothesline, jar).
  const [cw0, ch0] = caseRects.size, aspect = ch0 / cw0;
  const lowerMin = Math.round(H * 0.2);
  const caseMaxH = spin.y - gap - (top.h + gap) - lowerMin - gap;
  const cw = Math.min(W * 0.94, caseMaxH / aspect), chh = cw * aspect;
  const spare = Math.max(0, caseMaxH - chh);
  const kase = r(X + (W - cw) / 2, top.h + gap + spare * 0.3, cw, chh);
  const s = cw / cw0;
  const cells = caseRects.cells.map((c) => r(kase.x + c.x * s, kase.y + c.y * s, c.w * s, c.h * s));

  const bandTop = kase.y + chh + gap, bandBot = spin.y - gap, bandH = bandBot - bandTop;
  const dW = Math.min(W * 0.3, bandH * (2 / 3)), dH = dW * 1.5; // Deni sprite is 2:3
  const deni = r(X + W * 0.03, bandBot - dH, dW, dH);
  const jW = Math.min(W * 0.3, bandH * 0.64), jH = jW / 0.8; // jar sprite is 256x320
  const jar = r(X + W * 0.97 - jW, bandBot - jH, jW, jH);
  const px0 = deni.x + deni.w + W * 0.02, px1 = jar.x - W * 0.02;
  const pegs = r(px0, bandTop + bandH * 0.08, px1 - px0, Math.min(H * 0.055, bandH * 0.3)); // clothesline peg counter

  return { screen: r(0, 0, w, h), column: col, scale: W / 390, top, lantern, case: kase, cells, deni, pegs, jar, spin };
}

// Rects that must not overlap each other (cells live inside the case and are checked separately).
export const EXCLUSIVE = ['top', 'case', 'deni', 'pegs', 'jar', 'spin'];
