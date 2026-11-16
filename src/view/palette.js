// ART.md palette (gouache: cream, navy, tomato, teal, sunflower, pink; key names kept from the riso version). Pure JS (no three). Skins are palette swaps of the same sprites (ART.md section 3).
export const PAL = Object.freeze({
  paper: '#F4EAD2', navy: '#22304F', coral: '#D8452E', teal: '#2F8F8A', mustard: '#EDB13C', blush: '#EFA7A0',
});
// Overprint tones; the shader makes these, they are listed for reference and QA.
export const OVERPRINT = Object.freeze({ coralTeal: '#6B4A4E', mustardTeal: '#7FA05A', coralMustard: '#E0703A' });
// Index order used by the riso shader (uPal[i]).
export const INK_ORDER = Object.freeze(['paper', 'navy', 'coral', 'teal', 'mustard', 'blush']);
export const SKINS = Object.freeze({ default: PAL });

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
export const paletteArray = (pal = PAL) => INK_ORDER.map((k) => hexToRgb(pal[k]));
