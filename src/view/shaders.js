// Reel strip and pattern stroke materials. Colors are passed raw (the view turns three's color management off), so palette
// values and texture values compare directly in the shader. Every material is transparent and depth-less; draw order is renderOrder.
import * as THREE from 'three';
import { PAL, hexToRgb } from './palette.js';

// Shared paper grain uniforms (no grain texture is set in v2).
const GRAIN = { uGrain: { value: null }, uGrainPx: { value: 1 / 128 } };

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;


const STRIP_FRAG = `
uniform sampler2D uAtlas;
uniform sampler2D uGrain;
uniform float uGrainPx;
uniform float uCols;
uniform float uRows;
uniform float uScroll;
uniform float uBlur;
uniform float uSeq[12];
varying vec2 vUv;
vec3 tileAt(float y, float fx) {
  float k = floor(y);
  float f = y - k;
  float sym = uSeq[int(mod(k, 12.0))];
  float col = mod(sym, uCols);
  float row = floor(sym / uCols);
  vec2 uv = vec2((col + clamp(fx, 0.004, 0.996)) / uCols, (uRows - row - 1.0 + clamp(f, 0.004, 0.996)) / uRows);
  return texture2D(uAtlas, uv).rgb;
}
void main() {
  float y = uScroll + vUv.y;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 5; i++) acc += tileAt(y + (float(i) - 2.0) * uBlur, vUv.x);
  acc /= 5.0;
  float g = texture2D(uGrain, gl_FragCoord.xy * uGrainPx).r;
  gl_FragColor = vec4(acc * (0.9 + 0.1 * g), 1.0);
}`;

// One per cell: a short vertical strip that scrolls a ring of 12 tiles from the symbol atlas.
// uSeq[k] = atlas tile index at ring position k; uScroll in tiles (symbols move down as it grows); uBlur = vertical blur spread in tiles.
export function strip(atlas) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAtlas: { value: atlas.tex }, uCols: { value: atlas.cols }, uRows: { value: atlas.rows },
      uScroll: { value: 0 }, uBlur: { value: 0 }, uSeq: { value: new Float32Array(12) }, ...GRAIN,
    },
    vertexShader: VERT, fragmentShader: STRIP_FRAG, transparent: false, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  });
}
export { strip as stripMaterial };

const INK_FRAG = `
uniform float uReveal;
uniform float uSeed;
uniform vec3 uColor;
uniform vec3 uPaper;
varying vec2 vUv;
void main() {
  float x = vUv.x;
  float d = abs(vUv.y - 0.5) * 2.0;
  float taper = smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.95, 1.0, x));
  float w = (0.5 + 0.07 * sin(x * 23.0 + uSeed) + 0.04 * sin(x * 57.0)) * taper;
  float core = 1.0 - smoothstep(w - 0.05, w, d);
  float outer = (1.0 - smoothstep(w + 0.2, w + 0.26, d)) * smoothstep(0.0, 0.2, taper);
  float head = 1.0 - smoothstep(uReveal - 0.02, uReveal, x);
  gl_FragColor = vec4(mix(uPaper, uColor, core), outer * head * step(0.001, uReveal));
}`;

// Coral painted stroke with a thin cream edge, opaque, revealed left to right by uReveal (0..1).
export function inkLine(seed = 0, color = PAL.candle) {
  const n = parseInt(color.slice(1), 16);
  return new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: 0 }, uSeed: { value: seed }, uColor: { value: new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255) }, uPaper: { value: new THREE.Vector3(...hexToRgb(PAL.bone)) } },
    vertexShader: VERT, fragmentShader: INK_FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  });
}
export { inkLine as inkLineMaterial };
