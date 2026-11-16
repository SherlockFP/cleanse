import * as THREE from 'three';

const PAPER = 0xF2E8D0; // ART.md paper

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(PAPER, 1);
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 10);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.right = w; camera.top = h;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.addEventListener('resize', resize);
resize();
