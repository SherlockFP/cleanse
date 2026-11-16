// Riso-look materials (TECH.md section 5). Colors are passed raw (the view turns three's color management off), so palette
// values and texture values compare directly in the shader. Every material is transparent and depth-less; draw order is renderOrder.
import * as THREE from 'three';
import { PAL, paletteArray } from './palette.js';

// Shared paper grain, screen-locked. view.js calls setGrain(texture, dpr) once.
const GRAIN = { uGrain: { value: null }, uGrainPx: { value: 1 / 128 } };
export function setGrain(tex, dpr = 1) { GRAIN.uGrain.value = tex; GRAIN.uGrainPx.value = 1 / (128 * dpr); }

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const HASH = `float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`;

const RISO_FRAG = `
uniform sampler2D map;
uniform sampler2D uGrain;
uniform float uGrainPx;
uniform vec2 uOff;
uniform float uSeed;
uniform vec3 uPal[6];
varying vec2 vUv;
${HASH}
// Nearest palette ink: rgb in xyz, index in w (0 paper, 1 navy, 2 coral, 3 teal, 4 mustard, 5 blush).
vec4 nearestInk(vec3 c) {
  float best = 1e9;
  int bi = 0;
  for (int i = 0; i < 6; i++) {
    vec3 d = c - uPal[i];
    float dd = dot(d, d);
    if (dd < best) { best = dd; bi = i; }
  }
  return vec4(uPal[bi], float(bi));
}
void main() {
  vec4 a = texture2D(map, vUv);          // key line layer
  vec4 b = texture2D(map, vUv + uOff);   // fill layer, one to two pixels off the line
  vec4 ia = nearestInk(a.rgb);
  vec4 ib = nearestInk(b.rgb);
  float fillA = (ib.w < 0.5 || ib.w > 1.5) ? b.a : 0.0;
  float lineA = (ia.w > 0.5 && ia.w < 1.5) ? a.a : 0.0;
  float alpha = lineA + fillA * (1.0 - lineA);
  vec3 col = (uPal[1] * lineA + ib.rgb * fillA * (1.0 - lineA)) / max(alpha, 0.0001);
  float g = texture2D(uGrain, gl_FragCoord.xy * uGrainPx).r;
  col *= 0.88 + 0.12 * g;
  float skip = step(0.992, hash21(floor(vUv * 160.0) + uSeed));
  col = mix(col, uPal[0], skip * 0.6 * step(0.5, max(ib.w, ia.w)));
  gl_FragColor = vec4(col, alpha);
}`;

const fixedOffset = (seed) => { const a = (seed * 2.399) % 6.2832; return [Math.cos(a), Math.sin(a)]; };

// Flat-color sprite -> two-ink posterize, misregistration, grain, ink skips. offPx is fixed per sprite (no shimmer).
// Real gouache sprites are drawn as they are: a plain textured material, no posterize, no misregistration.
export let PLAIN = false;
export const setPlain = (on) => { PLAIN = on; };
export function riso(tex, { seed = 0, size = 256, palette = PAL } = {}) {
  if (PLAIN) return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
  const [ox, oy] = fixedOffset(seed + 1), px = 1.5 / size;
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: tex }, uOff: { value: new THREE.Vector2(ox * px, oy * px) }, uSeed: { value: seed % 97 },
      uPal: { value: paletteArray(palette).map((c) => new THREE.Vector3(...c)) }, ...GRAIN,
    },
    vertexShader: VERT, fragmentShader: RISO_FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  });
}
export { riso as risoMaterial };

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
export function inkLine(seed = 0, color = PAL.coral) {
  const n = parseInt(color.slice(1), 16);
  return new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: 0 }, uSeed: { value: seed }, uColor: { value: new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255) }, uPaper: { value: new THREE.Vector3(...paletteArray()[0]) } },
    vertexShader: VERT, fragmentShader: INK_FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  });
}
export { inkLine as inkLineMaterial };
