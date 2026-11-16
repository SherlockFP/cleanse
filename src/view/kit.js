// Small helpers the v3 overlays share: a y-down layout rect placed in the y-up scene, sprite and code-drawn label meshes.
import * as THREE from 'three';
import { getTex } from './sprites.js';
import { PAL } from './palette.js';

export const PLANE = new THREE.PlaneGeometry(1, 1);
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const easeOut = (u) => 1 - (1 - clamp01(u)) ** 3;
export const easeInOut = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
export const popScale = (u) => { u = clamp01(u); return u >= 1 ? 1 : easeOut(u) * (1 + Math.sin(u * Math.PI) * 0.28); }; // 0 -> 1.28 -> 1, one soft overshoot

export function place(mesh, r, H, sx = 1, sy = 1) {
  mesh.position.set(r.x + r.w / 2, H - (r.y + r.h / 2), 0);
  mesh.scale.set(r.w * sx, r.h * sy, 1);
}
export function sprite(parent, id, order, color = '#ffffff') {
  const m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: getTex(id), transparent: true, depthTest: false, depthWrite: false, color }));
  m.renderOrder = order; m.visible = false; parent.add(m); return m;
}
export function box(parent, color, order) {
  const m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = order; m.visible = false; parent.add(m); return m;
}
export function setMap(mesh, id) { const t = getTex(id); if (mesh.material.map !== t) { mesh.material.map = t; mesh.material.needsUpdate = true; } }
// Rect of an `sw` x `sh` picture inside r: as large as fits, bottom-centred.
export function fitIn(r, sw, sh, k = 1) {
  const s = Math.min(r.w / sw, r.h / sh) * k;
  return { x: r.x + (r.w - sw * s) / 2, y: r.y + r.h - sh * s, w: sw * s, h: sh * s };
}

// Text drawn in code (numbers and short labels). The canvas is repainted only when the text or colour changes.
export class Label {
  constructor(parent, order, w = 256, h = 96) {
    this.canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.generateMipmaps = false; this.tex.minFilter = THREE.LinearFilter;
    this.mesh = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthTest: false, depthWrite: false }));
    this.mesh.renderOrder = order; this.mesh.visible = false; parent.add(this.mesh); this.key = '';
  }
  set(text, color = PAL.bone, size = 0.62) {
    const key = text + color + size; if (key === this.key) return; this.key = key;
    const { canvas: cv } = this, g = cv.getContext('2d'), px = Math.round(cv.height * size);
    g.clearRect(0, 0, cv.width, cv.height);
    g.font = `bold ${px}px Mitr, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = Math.max(4, px * 0.2); g.strokeStyle = PAL.plum; g.strokeText(text, cv.width / 2, cv.height / 2 + px * 0.04, cv.width * 0.96);
    g.fillStyle = color; g.fillText(text, cv.width / 2, cv.height / 2 + px * 0.04, cv.width * 0.96);
    this.tex.needsUpdate = true;
  }
  set visible(v) { this.mesh.visible = v; }
  get visible() { return this.mesh.visible; }
}
