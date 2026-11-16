// i18n gate for v2: key parity across en, tr, th, no empty value, placeholder parity, Thai text really in Thai, banned words, speech line numbering,
// every key the UI source names exists, and the data JSON has en/tr/th text everywhere. Run: node scripts/check-i18n.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { STRINGS, t, setLang, L, coinText } from '../src/i18n.js';

const { en, tr, th } = STRINGS;
const bad = [];
const fail = (m) => bad.push(m);
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

// 1. same key set in all three languages
for (const [name, tab] of [['tr', tr], ['th', th]]) {
  for (const k of Object.keys(en)) if (!(k in tab)) fail(`missing in ${name}: ${k}`);
  for (const k of Object.keys(tab)) if (!(k in en)) fail(`missing in en (${name} has it): ${k}`);
}

// 2. no empty value, same {placeholders}
for (const k of Object.keys(en)) for (const [name, tab] of [['en', en], ['tr', tr], ['th', th]]) {
  if (typeof tab[k] !== 'string' || !tab[k].trim()) fail(`empty ${name}: ${k}`);
  else if (vars(en[k]) !== vars(tab[k])) fail(`placeholders differ (${name}): ${k} (${vars(en[k])} vs ${vars(tab[k])})`);
}

// 3. Thai strings contain Thai letters (a copy of the English text means it was never translated), except names and pure placeholders
const thaiOk = new Set(['ui.langEn', 'ui.langTr', 'ui.langTh', 'ui.patMult']);
for (const k of Object.keys(th)) {
  const letters = th[k].replace(/\{\w+\}/g, '').replace(/[^\p{L}]/gu, '');
  if (letters && !thaiOk.has(k) && !/[฀-๿]/.test(th[k])) fail(`th has no Thai letters: ${k}`);
}

// 4. banned words (GDD section 16), whole words. The same lists apply to the data JSON texts below.
const BAN = {
  en: ['casino', 'jackpot', 'bet', 'bets', 'betting', 'gamble', 'gambles', 'gambling', 'gambler', 'wager', 'wagers', 'stake', 'stakes'],
  tr: ['casino', 'kazino', 'slot', 'jackpot', 'kumar', 'kumarhane', 'bahis'],
  th: ['พนัน', 'เดิมพัน', 'คาสิโน', 'สล็อต', 'แจ็คพอต', 'แจ็กพอต'],
};
const words = (s, loc) => s.toLocaleLowerCase(loc).match(/[\p{L}\p{M}]+/gu) ?? [];
const stemTr = (w) => w.split(/['’]/)[0];
const banned = (label, text, lang) => {
  if (lang === 'en' && /slot machines?/i.test(text)) fail(`banned en phrase "slot machine": ${label}`); // "charm slot" is fine

  if (lang === 'th') { for (const b of BAN.th) if (text.includes(b)) fail(`banned th word "${b}": ${label}`); return; }
  for (const w of words(text, lang)) if (BAN[lang].includes(lang === 'tr' ? stemTr(w) : w) || (lang === 'tr' && BAN.en.includes(w))) fail(`banned ${lang} word "${w}": ${label}`);
};
for (const [lang, tab] of [['en', en], ['tr', tr], ['th', th]]) for (const [k, v] of Object.entries(tab)) banned(k, v, lang);

// 5. speech lines: line.<who>.<trigger>.<n>, numbered from 1 without gaps, known speakers and triggers
const TRIGGERS = { brimble: ['home', 'start', 'stoke', 'heatHigh', 'scorch', 'dud', 'big', 'paid', 'deal', 'signed', 'refuse', 'pawn', 'lose', 'win', 'tutDeal'], pip: ['shop', 'tutShop'], nim: ['start', 'paid', 'scorch', 'lose'] };
const groups = {};
for (const k of Object.keys(en).filter((x) => x.startsWith('line.'))) {
  const m = k.match(/^line\.(\w+)\.(\w+)\.(\d+)$/);
  if (!m) { fail(`bad line key: ${k}`); continue; }
  if (!TRIGGERS[m[1]]?.includes(m[2])) fail(`unknown speaker or trigger: ${k}`);
  (groups[`${m[1]}.${m[2]}`] ??= []).push(+m[3]);
}
for (const [g, ns] of Object.entries(groups)) if (ns.sort((a, b) => a - b).some((n, i) => n !== i + 1)) fail(`line numbers have a gap: ${g}`);
for (const [who, trig] of Object.entries(TRIGGERS)) for (const x of trig) if (!groups[`${who}.${x}`]) fail(`no lines for ${who}.${x}`);

// 6. every key the UI source names exists. Any quoted 'ui.x' / 'why.x' / 'ads.x' / 'iap.x' / 'store.x' / 'line.x' literal counts;
// a literal that is only the start of a built key ('ui.rule' + n, 'ui.ending.' + id) is fine when some key starts with it.
const used = new Set(), usedOutside = new Set(); // outside = files other lanes own (main.js, input.js...): reported, not failed
const walk = (d) => {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.js') && !p.endsWith(path.join('src', 'i18n.js'))) {
      const s = fs.readFileSync(p, 'utf8');
      const mine = /(^|[\\/])src[\\/](ui|services)[\\/]/.test(p);
      for (const m of s.matchAll(/['`]((?:ui|why|ads|iap|store|line)\.[\w.]*)['`]/g)) (mine ? used : usedOutside).add(m[1]);
    }
  }
};
walk('src');
const keys = Object.keys(en);
for (const k of used) if (!(k in en) && !keys.some((x) => x.startsWith(k))) fail(`used but missing: ${k}`);
for (const k of usedOutside) if (!(k in en) && !keys.some((x) => x.startsWith(k))) console.warn(`warning: key used outside src/ui and src/services but missing: ${k}`);
// built keys the code relies on
for (const id of ['paid_in_full', 'bought_the_machine', 'new_management']) for (const p of ['ui.ending.', 'ui.endingText.']) if (!(p + id in en)) fail(`missing ${p}${id}`);
for (const id of ['remove_ads', 'starter_pack']) for (const p of ['name', 'desc']) if (!(`store.${id}.${p}` in en)) fail(`missing store.${id}.${p}`);
for (const l of ['En', 'Tr', 'Th']) if (!(`ui.lang${l}` in en)) fail(`missing ui.lang${l}`);
for (const r of ['common', 'uncommon', 'rare', 'legendary']) if (!(`ui.rarity.${r}` in en)) fail(`missing ui.rarity.${r}`);
for (const n of [1, 2, 3, 4, 5, 6, 7]) if (!(`ui.rule${n}` in en)) fail(`missing ui.rule${n}`);
for (const n of [1, 2, 3, 4]) if (!(`ui.score${n}` in en)) fail(`missing ui.score${n}`);

// 7. data JSON (src/data after `npm run data`, else docs/v2/data): every name and text has en, tr and th; banned words; {c:N} parity
const dataDir = ['src/data', 'docs/v2/data'].find((d) => fs.existsSync(path.join(d, 'charms.json')));
let dataTexts = 0;
if (!dataDir) fail('no data JSON found (src/data or docs/v2/data)');
else {
  const scan = (node, where) => {
    if (Array.isArray(node)) return node.forEach((x, i) => scan(x, `${where}[${node[i]?.id ?? i}]`));
    if (node && typeof node === 'object') {
      if ('en' in node && 'tr' in node && 'th' in node && typeof node.en === 'string') {
        dataTexts++;
        const cs = (s) => (s.match(/\{c:[\d.]+\}/g) ?? []).join(',');
        for (const [lang, v] of [['en', node.en], ['tr', node.tr], ['th', node.th]]) {
          if (typeof v !== 'string' || !v.trim()) fail(`empty ${lang} text: ${where}`);
          else { banned(where, v, lang); if (cs(v) !== cs(node.en)) fail(`{c:N} differs (${lang}): ${where}`); }
        }
        return;
      }
      for (const [k, v] of Object.entries(node)) scan(v, `${where}.${k}`);
    }
  };
  for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('.json'))) scan(JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')), f);
}

// 8. smoke: t() fills vars and formats numbers per language, L() falls back to English, coinText scales {c:N}
setLang('tr'); assert.equal(t('ui.owed', { a: 1234, b: 2 }), '1.234 / 2'); assert.equal(t('no.such.key'), 'no.such.key');
setLang('en'); assert.equal(t('ui.owed', { a: 1234, b: 2 }), '1,234 / 2');
setLang('th'); assert.equal(t('ui.nightOf', { n: 2, m: 3 }), 'คืนที่ 2 จาก 3'); assert.equal(L({ en: 'a', th: '' }), 'a');
setLang('en'); assert.equal(coinText({ en: 'Each: +{c:3} coins.' }, 4), 'Each: +12 coins.');

if (bad.length) { console.error(bad.slice(0, 80).join('\n')); console.error(`check-i18n FAILED (${bad.length})`); process.exit(1); }
console.log(`check-i18n ok (${keys.length} keys x 3 languages, ${used.size} used keys scanned, ${dataTexts} data texts in ${dataDir})`);
