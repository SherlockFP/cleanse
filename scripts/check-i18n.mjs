// i18n gate: EN/TR key parity, no empty value, placeholder parity, banned words, lite content coverage,
// and every literal t('key') used in src exists. Run: node scripts/check-i18n.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { STRINGS, t, setLang } from '../src/i18n.js';

const { en, tr } = STRINGS;
const bad = [];
const fail = (m) => bad.push(m);

// 1. same key set
for (const k of Object.keys(en)) if (!(k in tr)) fail(`missing in tr: ${k}`);
for (const k of Object.keys(tr)) if (!(k in en)) fail(`missing in en: ${k}`);

// 2. no empty value, 3. same {placeholders}
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
for (const k of Object.keys(en)) {
  if (typeof en[k] !== 'string' || !en[k].trim()) fail(`empty en: ${k}`);
  if (typeof tr[k] !== 'string' || !tr[k].trim()) fail(`empty tr: ${k}`);
  if (typeof en[k] === 'string' && typeof tr[k] === 'string' && vars(en[k]) !== vars(tr[k])) fail(`placeholders differ: ${k} (${vars(en[k])} vs ${vars(tr[k])})`);
}

// 4. banned words. In-game list from STORE.md section 4; plus the originality.md terms. Whole words, case-insensitive.
// The TR list is the Turkish equivalents (kumar, bahis, kazino, nakit) and "şans", which is close to the legal term "şans oyunları".
const BAN_EN = ['casino', 'slot', 'slots', 'jackpot', 'bet', 'bets', 'gamble', 'gambles', 'gambling', 'gambler', 'wager', 'wagers', 'cash', 'charm', 'charms', 'joker', 'stake', 'stakes', 'overtime', 'legendary', 'uncommon'];
const BAN_TR = ['casino', 'kazino', 'slot', 'jackpot', 'kumar', 'kumarhane', 'bahis', 'nakit', 'şans', 'şanslı', 'talih', 'fal'];
const words = (s, loc) => s.toLocaleLowerCase(loc).match(/[\p{L}]+/gu) ?? [];
const stemTr = (w) => w.split(/['’]/)[0];
for (const [k, v] of Object.entries(en)) for (const w of words(v, 'en')) if (BAN_EN.includes(w)) fail(`banned en word "${w}": ${k}`);
for (const [k, v] of Object.entries(tr)) for (const w of words(v, 'tr')) if (BAN_TR.includes(stemTr(w)) || BAN_EN.includes(w)) fail(`banned tr word "${w}": ${k}`);
// the Turkish title and reel name are fixed by STORE.md section 3
if (tr['ui.title'] !== 'Küçük İskele') fail('tr title must be "Küçük İskele"');
if (tr['ui.reel'] !== "Hasan'ın Çarkı") fail('tr reel must be "Hasan\'ın Çarkı"');

// 5. lite coverage: counts per GDD.md section 13, and every id has all its parts
const ids = (re) => new Set(Object.keys(en).map((k) => k.match(re)?.[1]).filter(Boolean));
const syms = ids(/^sym\.(\w+)$/), trinkets = ids(/^trinket\.(\w+)\.name$/), charts = ids(/^chart\.(\w+)\.name$/), events = ids(/^event\.(\w+)\.name$/), builds = ids(/^build\.(\w+)\.name$/);
const want = [['symbols', syms, 12], ['trinkets', trinkets, 35], ['charts', charts, 6], ['events', events, 4], ['builds', builds, 6]];
for (const [n, s, c] of want) if (s.size !== c) fail(`lite ${n}: expected ${c}, found ${s.size}`);
for (const id of trinkets) for (const part of ['short', 'desc']) if (!en[`trinket.${id}.${part}`]) fail(`trinket ${id} lacks ${part}`);
for (const id of syms) if (!en[`sym.${id}.rule`]) fail(`symbol ${id} lacks rule`);
for (const id of charts) if (!en[`chart.${id}.desc`]) fail(`chart ${id} lacks desc`);
for (const id of events) for (const part of ['who', 'desc']) if (!en[`event.${id}.${part}`]) fail(`event ${id} lacks ${part}`);
// card text: at most 8 words in EN (TECH.md section 7); TR may run a little longer
for (const id of trinkets) {
  const e = en[`trinket.${id}.short`].split(/\s+/).length, r = tr[`trinket.${id}.short`].split(/\s+/).length;
  if (e > 8) fail(`short >8 words (en): trinket.${id}.short`);
  if (r > 10) fail(`short >10 words (tr): trinket.${id}.short`);
}
// Deni and Orhan lines: numbered from 1 with no gaps
const lineKeys = Object.keys(en).filter((k) => k.startsWith('line.'));
const groups = {};
for (const k of lineKeys) { const m = k.match(/^line\.(\w+\.\w+)\.(\d+)$/); if (!m) fail(`bad line key: ${k}`); else (groups[m[1]] ??= []).push(+m[2]); }
for (const [g, ns] of Object.entries(groups)) if (ns.sort((a, b) => a - b).some((n, i) => n !== i + 1)) fail(`line numbers have a gap: ${g}`);
// rules screen must carry the tutorial disclosure and the printed-odds note
for (const k of ['ui.tutorialNote', 'ui.oddsNote', 'ui.stopNote', 'ui.mercyRule', 'ui.rulesOdds']) if (!en[k] || !tr[k]) fail(`rules text missing: ${k}`);
if (!/fixed tutorial\. Every spin after it is drawn from the bag\./.test(en['ui.tutorialNote'])) fail('tutorial note must match GDD.md section 10');

// 6. every literal t('key') / plural(n, 'key') in src exists (other src files may not exist yet)
const used = new Set();
const walk = (d) => {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.js') && !p.endsWith(path.join('src', 'i18n.js'))) {
      const s = fs.readFileSync(p, 'utf8');
      for (const m of s.matchAll(/\bt\(\s*'([^']+)'\s*[,)]/g)) if (!m[1].endsWith('.')) used.add(m[1]);
      for (const m of s.matchAll(/\bplural\(\s*[^,]+,\s*'([^']+)'/g)) used.add(m[1]);
    }
  }
};
walk('src');
for (const k of used) if (!(k in en) || !(k in tr)) fail(`used but missing: ${k}`);

// 7. smoke: t() fills vars, formats numbers per language, falls back to the key
setLang('tr'); assert.equal(t('ui.tideOf', { n: 1, m: 5 }), 'Gelgit 1/5'); assert.equal(t('ui.jarQuota', { a: 1234, b: 2 }), '1.234 / 2'); assert.equal(t('no.such.key'), 'no.such.key');
setLang('en'); assert.equal(t('ui.jarQuota', { a: 1234, b: 2 }), '1,234 / 2');

if (bad.length) { console.error(bad.join('\n')); console.error(`check-i18n FAILED (${bad.length})`); process.exit(1); }
console.log(`check-i18n ok (${Object.keys(en).length} keys, ${trinkets.size} trinkets, ${used.size} used keys scanned)`);
