// UI render pass without a browser: a tiny fake DOM, the v3 data replaced by fixtures, every screen and the HUD rendered in en, tr and th.
// Fails on an exception, on printed "undefined" / "NaN" / "[object", on a raw i18n key or a raw item id on screen, and on a HUD chip with no word label.
// Also steps the tutorial overlay's stepper through all 27 steps. Run: node scripts/check-ui.mjs
import assert from 'node:assert/strict';

// ---------- fake DOM (only what src/ui touches) ----------
class Txt { constructor(s) { this.text = String(s); } }
class El {
  constructor(tag) { this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.on = {}; this._c = new Set(); this.style = { setProperty() {}, cssText: '' }; this.hidden = false; this.scrollTop = 0; this.offsetHeight = 40; this.offsetParent = {}; this.parentNode = null; }
  get className() { return [...this._c].join(' '); } set className(v) { this._c = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() { const s = this._c; return { add: (...a) => a.forEach((x) => s.add(x)), remove: (...a) => a.forEach((x) => s.delete(x)), toggle: (c, f) => ((f ?? !s.has(c)) ? s.add(c) : s.delete(c)), contains: (c) => s.has(c) }; }
  get dataset() { const d = {}; for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith('data-')) d[k.slice(5)] = v; return d; }
  get firstChild() { return this.children[0] ?? null; }
  setAttribute(k, v) { this.attrs[k] = v; if (k === 'hidden') this.hidden = true; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(ev, fn) { (this.on[ev] ??= []).push(fn); }
  _add(c) { if (typeof c === 'string' || typeof c === 'number') this.children.push(new Txt(c)); else { c.parentNode = this; this.children.push(c); } }
  append(...k) { k.forEach((c) => this._add(c)); } replaceChildren(...k) { this.children = []; this.append(...k); }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; } remove() { this.parentNode?.removeChild(this); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 844 }; }
  querySelector() { return null; } querySelectorAll() { return []; }
  getContext() { return new Proxy({}, { get: () => () => {}, set: () => true }); } toDataURL() { return 'data:,'; }
}
globalThis.document = { createElement: (t) => new El(t), documentElement: new El('html'), getElementById: () => null, body: new El('body') };
globalThis.performance ??= { now: () => Date.now() };

// ---------- fixtures: v3 data the content lane has not written yet ----------
const nm = (en, tr, th) => ({ en, tr: tr ?? en, th: th ?? en });
const effect = (type, n, extra = {}) => ({ type, n, ...extra });
const NAMES = { brimble: nm('Mr. Ruby', 'Bay Ruby', 'มิสเตอร์รูบี้'), gold: nm('Tin Tom', 'Teneke Tom', 'ทอมปี๊บ'), wire: nm('Cable Joe', 'Kablo Joe', 'โจสายไฟ'), waiting: nm('Pier Pam', 'İskele Pam', 'แพมท่าเรือ') };
const spirit = (id, rival, local, extra = {}) => ({
  id, name: NAMES[id], domain: 'x', rival, unlock: id === 'brimble' ? { start: true } : {}, local, portrait: { calm: `spirit/${id}_calm`, glad: `spirit/${id}_glad`, cross: `spirit/${id}_cross` },
  taste: { coins: 2, caps: 1, spice: 0.5, trick: 1, charm: 0, curse: 1, skip: 0.5 }, hint: nm('Likes coins.', 'Paradan hoşlanır.', 'ชอบเหรียญ'),
  stages: [{ at: 2, rules: [{ effects: [effect('luck', 1)] }] }, { at: 5, rules: [{ effects: [effect('interest', 2)] }] }, { at: 8, rules: [{ effects: [effect('wick', 2)] }] }],
  wrath: [{ at: -2, rules: [{ effects: [{ type: 'flag', flag: 'x' }] }] }, { at: -5, rules: [{ effects: [effect('luck', -3)] }] }],
  gifts: [{ id: id + '_g', icon: 'deal/luck', effects: [effect('luck', 2)] }], red: { id: id + '_r', icon: 'deal/luck', boon: [effect('luck', 5)], curse: null, due: { rounds: 2, else: [effect('loseCharm', 1)] } },
  omen: 'nextTerms', lines: { meet: nm('Hello.') }, ...extra,
});
const FIX = {
  'spirits.json': { spirits: [spirit('brimble', 'waiting', ['c1', 'c10'], { gifts: [], red: { deals: true } }), spirit('gold', 'moonbiter', ['c3']), spirit('wire', 'beckon', ['c2']), spirit('waiting', 'brimble', ['c8'], { red: null, white: [{ id: 'w1', icon: 'ui/white_call', effects: [effect('symMult', 1)] }] })] },
  'charms_v3.json': { charms: [{ id: 'bike_horn', name: nm('Bike Horn'), icon: 'charm/bike_horn', rarity: 'common', tags: ['tinker'], text: nm('Honk: Luck +3 next spin.'), price: { coins: 6 }, active: { need: 1 } }, { id: 'f_smog_wok', name: nm('Smog Wok'), icon: 'charm/f_smog_wok', rarity: 'fused', tags: ['ember', 'hex'], text: nm('Shapes +0.5 per curse.') }] },
  'fusion.json': { same: { cost: { common: 2, uncommon: 3, rare: 4 } }, recipes: [{ a: 'ember', b: 'hex', out: 'f_smog_wok' }, { a: 'swarm', b: 'ember', out: 'f_none' }] },
  'places.json': { places: [] },
  'notebook.json': { nodes: [{ id: 'cart_01', tab: 'cart', name: nm('Second Stool'), text: nm('Pick 1 of 2 starting tricks.'), cost: 20, icon: 'ui/notebook' }, { id: 'cart_03', tab: 'cart', name: nm('Spare Bag'), text: nm('Cheaper slot.'), cost: 45, icon: 'ui/notebook', needsText: nm('Clear Soi Cart.') }, { id: 'tin_01', tab: 'tin', name: nm('Tin Shelf'), text: nm('2 tips a visit.'), cost: 40, icon: 'ui/notebook' }] },
  'lockers.json': { lockers: Array.from({ length: 20 }, (_, i) => ({ id: 'l' + (i + 1), key: ['brass', 'silver', 'red'][i < 10 ? 0 : i < 17 ? 1 : 2], contents: ['moth_jar'] })) },
  'postcards.json': { postcards: [{ id: 'rainy_day', name: nm('Rainy Day'), gain: nm('+1 Luck'), cost: nm('-1 spin'), icon: 'post/rainy_day' }] },
  'lessons.json': { lessons: [{ id: 'l1', name: nm('Spin and shapes'), text: nm('Land a Line of 4.'), reward: 10 }, { id: 'l2', name: nm('Spice'), text: nm('Spin at Spice 3.'), reward: 10 }] },
  'storm.json': { storms: [] }, 'endings.json': { endings: [{ id: 'the_refuser' }, { id: 'left_luggage' }] },
};
globalThis.__DATA_V3 = FIX;

const { STRINGS, setLang, t, L } = await import('../src/i18n.js');
const C = await import('../src/ui/content.js');
const { h, setArtIds } = await import('../src/ui/dom.js');
setArtIds([]);
const { stepper } = await import('../src/ui/coach.js');
const { TUTORIAL_STEPS } = await import('../src/tutorial.js'); // the core lane's 27 steps
await import('../src/ui/ui.js'); // the whole module graph links
const S = {};
for (const n of ['home', 'map', 'notebook', 'lockers', 'codex', 'howto', 'title', 'phone', 'himorme', 'runend', 'ending', 'shop', 'paid', 'deal', 'settings', 'terms', 'shelf']) S[n] = await import(`../src/ui/${n}.js`);
const { mountHud } = await import('../src/ui/hud.js');
const { kioskSheet } = await import('../src/ui/kiosk.js');
const { missedChances } = S.runend;

let checks = 0;
const ok = (c, m) => { checks++; assert.ok(c, m); };

// ---------- the tutorial stepper: 27 steps, advanced by their own events ----------
{
  const st = stepper(TUTORIAL_STEPS), seq = [];
  ok(TUTORIAL_STEPS.length === 27, 'the step table has 27 steps');
  for (let guard = 0; !st.done && guard < 100; guard++) {
    const s = st.step; seq.push(s.id);
    ok(!st.event('nope'), 'a wrong event does not advance');
    ok(st.event(String(s.until).split(/[\s|]+/).pop()), 'step ' + s.id + ' advances on its event');
  }
  ok(seq.length === 27 && st.done, 'all 27 steps run in order');
  const st2 = stepper(TUTORIAL_STEPS, 23);
  ok(st2.step.id === 24 && st2.event('dealSheet') && st2.step.id === 25, 'the red card step leads to the deal step');
  ok(st2.event('deal') && st2.step.id === 27, 'a signed deal skips the green card step');
  for (const s of TUTORIAL_STEPS) { setLang('en'); const words = t(s.caption, { debt: 80, nights: 3 }).split(/\s+/).length; ok(words <= 12, `en caption of ${s.id} is ${words} words`); }
}

// ---------- fixtures for a run ----------
const mkRun = (over = {}) => ({
  contract: 'c1', debt: 106, debtIdx: 2, round: 1, rounds: 3, spinsLeft: 4, phase: 'spin', heat: 3, purse: 120, banked: 60, wick: 3, luckTemp: 1, pity: 0, slots: 5, pockets: 3,
  tricks: ['nudge'], charms: [{ id: 'moth_jar', stack: 0 }, { id: 'bike_horn', charge: 0 }, { id: 'moth_wing', stack: 1, relic: true }], curses: [], favs: ['moth'], beads: 2, removed: [], carried: 2,
  spirits: { brimble: { fav: 3, met: true }, gold: { fav: 6, met: true }, wire: { fav: -2, met: true, wrath: 1 } },
  shop: { charms: ['moth_jar', 'tallow_stub'], tricks: ['nudge'], bench: ['polish'], upgrades: [{ kind: 'pattern', pattern: 'h3' }, { kind: 'weight', sym: 'moth' }] }, perm: [{ type: 'patMult', n: 1, pattern: 'h3', src: { kind: 'cart' } }],
  tin: { spirit: 'gold', left: 1, omen: { terms: ['steady'] }, demand: 'letMePick', result: 'met' },
  callOffer: { cards: [{ spirit: 'brimble', color: 'red', id: 'deals', ruby: true }, { spirit: 'gold', color: 'green', id: 'gold_g' }, { spirit: 'wire', color: 'red', id: 'wire_r' }], rerolls: 0, white: false },
  dealOffer: ['lucky_break'], ...over,
});
const meta = {
  wax: 30, stash: 30, hideout: ['cot'], contracts: ['c1', 'c2'], cleared: ['c1'], chars: ['nim'], achievements: [], seenCharms: ['moth_jar'], endings: [], tutorialDone: true, settings: {}, met: { phone: true },
  keys: { brass: 1, silver: 0, red: 0 }, notebook: ['cart_01'], lockers: ['l1'], luggage: [null, 'moth_jar', null, null], postcards: ['rainy_day'], spirits: ['brimble', 'gold'], stamps: { c1: { bronze: true } }, lessons: ['l1'],
  codex: { charm: { moth_jar: 'mastered' }, spirit: { gold: [1, 2, 3] }, fusion: ['f_smog_wok'] },
};

const base = (run, over = {}) => ({
  h: { price: (item, kind) => ({ coins: 5 }), adReady: () => false, blendPreview: () => ({ ok: true, cost: 2, kind: 'same', outs: ['moth_jar', 'tallow_stub'] }), progressOf: (it) => ({ have: 3, need: 10, where: 'run' }), tutEvent() {}, lookRed() {}, postcardSlots: () => 1, lockerContents: () => ({ charms: ['moth_jar'], postcards: ['rainy_day'], deed: false }) },
  state: {}, settings: { lang: 'en', leverOnly: false }, say: () => null, toast() {}, toastText() {}, setSettings() {}, lang: () => 'en', close() {}, rerender() {}, open() {}, call: () => undefined,
  sheet() {}, openNode() {}, closeSheet() {}, derive: () => ({ scale: 1, target: run?.debt ?? 100, kiosk: { balance: 60, tonight: 4, rate: 8, cap: 26 }, pace: { need: 20, avg: 30 }, beads: 2, redEye: 2, due: [{ rounds: 2 }], honkReady: false, spirits: run?.spirits }),
  foot: (...k) => { foot.push(...k); return null; }, over: () => null, run, ...over,
});
let foot = [];

// text of a node tree
const text = (n) => (!n ? '' : n instanceof Txt ? n.text : (n.children ?? []).map(text).join(' '));
const walk = (n, f) => { if (n instanceof Txt) return; f(n); n.children.forEach((c) => walk(c, f)); };
const run0 = mkRun();
const ids = [...Object.keys(C.CHARM), ...Object.keys(C.SPIRIT), ...Object.keys(C.TRICK), ...Object.keys(C.SYM)].filter((id) => id.includes('_') || ['brimble', 'beckon', 'moonbiter', 'lamplit'].includes(id)); // snake_case ids and spirit ids are never plain English

function render(name, data, ctxOver = {}, lang = 'en') {
  setLang(lang); foot = [];
  const el = h('section', { class: 'panel ' + name }), ctx = base(data.run ?? run0, ctxOver);
  S[name].render(el, data, ctx);
  const all = text(el) + ' ' + foot.map(text).join(' ');
  const where = `${name}@${lang}`;
  ok(!/undefined|NaN|\[object/.test(all), `${where}: prints undefined/NaN: ${all.match(/.{0,30}(undefined|NaN|\[object).{0,20}/)?.[0]}`);
  ok(!/\b(ui|tip|tut|why)\.[a-zA-Z]\w*/.test(all), `${where}: raw i18n key on screen: ${all.match(/\b(ui|tip|tut|why)\.[a-zA-Z][\w.]*/)?.[0]}`);
  if (lang === 'en') for (const id of ids) ok(!new RegExp(`(^|[\\s(])${id}([\\s).,]|$)`).test(all), `${where}: raw id "${id}" on screen`);
  return { el, ctx, all };
}

for (const lang of ['en', 'tr', 'th']) {
  const data = { run: run0, meta };
  render('home', { meta }, {}, lang); render('home', { meta: { ...meta, tutorialDone: false } }, {}, lang);
  render('map', { meta }, {}, lang); render('map', { meta: { ...meta, cleared: ['c1', 'c2', 'c10'], storm: { c1: 2 }, notebook: ['cart_07'] } }, {}, lang);
  for (const tab of ['cart', 'tin', 'crew', 'home', 'friends']) render('notebook', { meta }, { state: { tab } }, lang);
  render('lockers', { meta }, {}, lang);
  for (const tab of ['charms', 'tricks', 'symbols', 'deals', 'spirits', 'places', 'fusion']) render('codex', { meta }, { state: { tab } }, lang);
  for (let i = 0; i < 18; i++) { render('howto', { meta }, { state: { card: i } }, lang); render('howto', { meta: { ...meta, met: {} } }, { state: { card: i } }, lang); }
  for (const i of [-1, 0, 1, 2]) render('title', {}, { state: { i } }, lang);
  const phone = render('phone', data, {}, lang);
  ok(phone.all.includes(L(C.SPIRIT.brimble.name)) && phone.all.includes(L(C.SPIRIT.gold.name)), 'the call shows spirit names');
  render('phone', { run: mkRun({ callOffer: { white: true, cards: [{ spirit: 'waiting', color: 'white', id: 'w1' }] } }) }, {}, lang);
  render('himorme', { run: run0, spirit: 'gold', rival: 'wire' }, {}, lang);
  render('runend', { run: run0, summary: { debtsPaid: 2, spirits: { gold: { fav: 6 }, wire: { fav: -2 } }, stats: { hangUps: 1, spins: 9, stokes: 0, insults: 1, bestPattern: { id: 'h3', pay: 12 } } }, result: { stash: 12, newAchievements: [], unlocks: [], keys: [{ kind: 'brass', n: 1 }], lessons: [{ id: 1 }], spirits: ['gold'], stamps: ['bronze'] }, won: false, meta }, {}, lang);
  render('runend', { run: run0, summary: { debtsPaid: 5 }, result: {}, won: true, ending: 'paid_in_full', meta }, {}, lang);
  render('ending', { ending: 'the_refuser', epilogues: ['gold'] }, {}, lang); render('ending', { ending: 'left_luggage' }, { state: { i: 0 } }, lang); render('ending', { ending: 'paid_in_full', epilogues: ['gold'] }, { state: { i: 0 } }, lang);
  for (const tab of ['charms', 'cart', 'tricks', 'bench', 'blender']) render('shop', { run: run0, offers: { ...run0.shop, cart: run0.shop.upgrades } }, { state: { tab } }, lang);
  render('shop', { run: mkRun({ tin: { spirit: 'brimble', left: 0 } }), offers: { ...run0.shop, cart: run0.shop.upgrades } }, {}, lang);
  render('paid', { run: run0, outcome: 'paid', info: { rung: 1, interest: 4, kept: 10, next: 258 } }, {}, lang);
  render('deal', { run: run0, offers: run0.dealOffer }, {}, lang); render('deal', { run: { ...run0, callOffer: null }, offers: run0.dealOffer }, {}, lang);
  render('settings', {}, {}, lang);
  render('terms', { run: run0, offers: ['steady'], skip: null }, {}, lang);

  // the HUD: every chip has a word label, no raw id, the Kiosk and spirits show
  setLang(lang);
  const col = h('div', { class: 'ui-col' });
  let shown = null;
  const hud = mountHud(col, { call() {}, say() {}, toast() {}, derive: () => base(run0).derive(), sheet: (n) => { shown = n; }, closeSheet() {}, show() {}, settings: () => ({ leverOnly: false }), event() {} });
  for (const phase of ['spin', 'post', 'roundend', 'call']) {
    const r = mkRun({ phase }); hud.update(r);
    const top = col.children[0], bot = col.children[1], all = text(top) + ' ' + text(bot);
    ok(!/undefined|NaN|\[object/.test(all) && !/\b(ui|tip)\.[a-z]\w*/.test(all), `hud ${phase}@${lang}: clean text`);
    let chips = 0;
    walk(top, (e) => { if (e.className.includes('lchip')) { chips++; ok(e.children.some((c) => c.className?.includes('lc-label') && text(c).trim().length > 0), 'every chip has a word label'); } });
    ok(chips >= 5, `hud ${phase}@${lang}: purse, Kiosk, Caps, Luck, Special chips (${chips})`);
    if (lang === 'en') ok(/Purse/.test(all) && /Kiosk/.test(all) && /Caps/.test(all) && /Luck/.test(all) && /on pace/.test(all) && /Red Eye 2\.0%/.test(all), `hud ${phase}: labels, pace and Red Eye gauge`);
    if (phase === 'post' && lang === 'en') ok(/SCORE/.test(all) && /Score first/.test(all), 'post phase: SCORE button and "Score first"');
    if (phase === 'spin' && lang === 'en') ok(/HONK/.test(all), 'an active charm shows HONK');
  }
  hud.update(mkRun()); hud.openKiosk();
  ok(shown && text(shown).includes(t('ui.kioskTitle')) && text(shown).includes(t('ui.bankAll')), 'the Kiosk sheet renders its numbers and buttons (' + lang + ')');
  ok(!/undefined|NaN|\[object/.test(text(shown)), 'the Kiosk sheet prints no undefined');
}

// the missed-chance ranking
{
  const m = missedChances({ stokes: 0, spins: 9, interestTotal: 0, banks: 0, hangUps: 2, insults: 1 }, { tricks: ['nudge'] });
  ok(m.length === 3 && m[0].k === 'unusedTricks' && m[1].k === 'noInterest' && m[2].k === 'noSpice', 'the three most useful missed chances, in priority order');
}
// first-time lines the core's coach can ask for exist in all three languages
for (const k of ['himormme', 'white', 'redeye', 'flareup', 'wrath', 'honk', 'blender', 'curse']) for (const l of ['en', 'tr', 'th']) { setLang(l); ok(t('ft.' + k) !== 'ft.' + k, 'ft.' + k + ' in ' + l); }
// every v3 string has all three languages (the i18n script checks the rest)
for (const k of Object.keys(STRINGS.en)) ok(STRINGS.th[k] && STRINGS.tr[k], 'string in 3 languages: ' + k);
console.log(`check-ui ok (${checks} checks)`);
process.exit(0);
