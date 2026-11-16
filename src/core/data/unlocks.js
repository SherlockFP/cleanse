// v1.0-lite meta tables (CONTENT.md section 5, GDD.md section 13): the 6 boathouse builds, album entries, margin note ids.
// Build costs are in Planks (345 in all) and are bought in this order. pool: the id goes into run.unlocked and opens
// the symbols and trinkets whose `unlock` field equals it. feature: what else the build does (UI reads it through meta.hasFeature).
// Keys: build.<id>.name / .desc, note.<n>, beat.<n>.
import { deepFreeze } from './freeze.js';
import { SYMBOLS } from './symbols.js';
import { TRINKETS } from './trinkets.js';
import { EVENTS } from './events.js';

export const BUILDS = deepFreeze([
  { id: 'roof', cost: 10, pool: false, feature: 'album', nameKey: 'build.roof.name', descKey: 'build.roof.desc' },
  { id: 'stove', cost: 20, pool: false, feature: 'pick4', nameKey: 'build.stove.name', descKey: 'build.stove.desc' },
  { id: 'cat_basket', cost: 30, pool: true, feature: 'tekir', nameKey: 'build.cat_basket.name', descKey: 'build.cat_basket.desc' },
  { id: 'radio', cost: 45, pool: true, feature: 'radio', nameKey: 'build.radio.name', descKey: 'build.radio.desc' },
  { id: 'tea_corner', cost: 60, pool: true, feature: 'sevgi', nameKey: 'build.tea_corner.name', descKey: 'build.tea_corner.desc' },
  { id: 'lamp_post', cost: 180, pool: false, feature: 'night', nameKey: 'build.lamp_post.name', descKey: 'build.lamp_post.desc' },
]);

export const INSTALLMENTS_LITE = 6;
export const NOTES_LITE = 18;

// Album: trinkets and symbols are "seen" (1) or "won with" (2, trinkets only); stamps are creditor events cleared; notes follow save.notes.
// Postcards are not in lite (their text is written in M4), so they are not counted.
export const ALBUM = deepFreeze({
  trinkets: TRINKETS.map((x) => x.id),
  symbols: SYMBOLS.map((x) => x.id),
  stamps: EVENTS.map((x) => x.id),
  notes: Array.from({ length: NOTES_LITE }, (_, i) => i + 1),
});
