import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SFX } from '../src/audio/sfx-map.js';
import { VOICES } from '../src/audio/synth.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public/sfx');
const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const errs = [];
const refs = new Set();

for (const [id, e] of Object.entries(SFX)) {
  if (!VOICES[id]) errs.push(`${id}: no synth fallback`);
  if (e.file) {
    refs.add(e.file);
    if (!files.includes(e.file)) errs.push(`${id}: missing file public/sfx/${e.file}`);
  }
}
for (const id of Object.keys(VOICES)) if (!SFX[id]) errs.push(`synth voice ${id} not in sfx-map`);
for (const f of files) if (!refs.has(f)) errs.push(`unreferenced file public/sfx/${f}`);

const bytes = files.reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
if (bytes > 3 * 1024 * 1024) errs.push(`public/sfx is ${bytes} bytes, limit 3145728`);

// INDEX.csv: one row per id, status agrees with the map
const csv = fs.readFileSync(path.join(root, 'docs/licenses/INDEX.csv'), 'utf8').trim().split('\n').slice(1);
const rows = new Map(csv.map((l) => {
  const c = l.match(/"([^"]*)"/g).map((s) => s.slice(1, -1));
  return [c[0], c];
}));
for (const [id, e] of Object.entries(SFX)) {
  const r = rows.get(id);
  if (!r) { errs.push(`${id}: no INDEX.csv row`); continue; }
  if ((r[7] === 'synth') !== !e.file) errs.push(`${id}: INDEX.csv status ${r[7]} disagrees with sfx-map`);
}
for (const id of rows.keys()) if (!SFX[id]) errs.push(`INDEX.csv row ${id} not in sfx-map`);

console.log(`ids ${Object.keys(SFX).length}, files ${files.length}, bytes ${bytes}`);
if (errs.length) {
  console.error(errs.join('\n'));
  process.exit(1);
}
console.log('check-audio OK');
