// Night palette (docs/v2/ART_LIST.md). Pure JS (no three). Hex strings; hexToRgb gives 0..1 floats for shaders.
export const PAL = Object.freeze({
  plum: '#1c1220', candle: '#f08a2a', bone: '#f1e6cf', green: '#7fd13b', red: '#b3202a', brass: '#d9a62e',
});
// Slightly lifted plum for panels and empty slots on top of the background.
export const PLUM_LIFT = '#2e1f36';
// Colours cycled for pattern highlights, in evaluation order.
export const PATTERN_COLORS = Object.freeze([PAL.candle, PAL.green, PAL.brass, PAL.red, PAL.bone]);

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
