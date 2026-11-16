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

  const hudH = Math.round(Math.min(48, H * 0.055)); // DOM row: tide and jar text (ui.css .hud)
  const lanternH = Math.round(H * 0.07);
  const top = r(X, 0, W, hudH + lanternH); // text row, then the lantern string
  const lantern = r(X + W * 0.04, hudH, W * 0.92, lanternH * 0.95);

  const spinH = Math.min(96, Math.max(56, Math.round(H * 0.1)));
  const spinW = Math.round(Math.min(W * 0.62, spinH * 3.4)); // Bag and Settings sit beside it
  const spin = r(Math.round(X + (W - spinW) / 2), H - spinH - Math.round(H * 0.035), spinW, spinH);

  // The case takes what is left above the lower band (Deni, clothesline, jar).
  const [cw0, ch0] = caseRects.size, aspect = ch0 / cw0;
  const lowerMin = Math.round(H * 0.185);
  const speechPad = 58 + gap; // a two-line speech strip (ui.css .bubble: 40 px text, 12 px padding, 6 px line) sits between the lanterns and the case roof
  const caseMaxH = spin.y - gap - (top.h + gap + speechPad) - lowerMin - gap;
  const cw = Math.min(W * 0.94, caseMaxH / aspect), chh = cw * aspect;
  const spare = Math.max(0, caseMaxH - chh);
  const kase = r(X + (W - cw) / 2, top.h + gap + speechPad + spare * 0.3, cw, chh);
  const s = cw / cw0;
  const cells = caseRects.cells.map((c) => r(kase.x + c.x * s, kase.y + c.y * s, c.w * s, c.h * s));

  const bandTop = kase.y + chh + gap, bandBot = spin.y - gap, bandH = bandBot - bandTop;
  const dH = Math.min(bandH, W * 0.5), dW = Math.min(W * 0.3, dH * 0.7); // slot a little wider than her idle pose (about 0.43 wide per tall)
  const deni = r(X + W * 0.03, bandBot - dH, dW, dH);
  const jW = Math.min(W * 0.3, bandH * 0.64), jH = jW / 0.8; // jar sprite is 256x320
  const jar = r(X + W * 0.97 - jW, bandBot - jH, jW, jH);
  const px0 = deni.x + deni.w + W * 0.02, px1 = jar.x - W * 0.02;
  const pegs = r(px0, bandTop + bandH * 0.06, px1 - px0, Math.min(H * 0.085, bandH * 0.42)); // clothesline peg counter: the spare pegs hang down from the line

  return { screen: r(0, 0, w, h), column: col, scale: W / 390, top, lantern, case: kase, cells, deni, pegs, jar, spin };
}

// Rects that must not overlap each other (cells live inside the case and are checked separately).
export const EXCLUSIVE = ['top', 'case', 'deni', 'pegs', 'jar', 'spin'];
