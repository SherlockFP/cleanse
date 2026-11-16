// CORE-LANE FIXTURES for the v3 data files (SPEC section 8) until the content lane's gen-v3-data.py writes the real ones.
// node scripts/fixtures/build-fixtures.mjs            writes scripts/fixtures/*.json
// node scripts/fixtures/build-fixtures.mjs --install  also copies each into src/core/data/ ONLY IF that file is missing
// Texts are English stubs ({en,tr,th} all the same string): the content lane owns the words. Rules and numbers follow SPEC 3.6, 4.4-4.8.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, '..', '..', 'src', 'core', 'data');
const T = (s) => ({ en: s, tr: s, th: s });
const R = (trigger, cond, ...effects) => ({ trigger, cond, effects });
const P = (...effects) => R('passive', {}, ...effects);
const F = (flag, v, extra = {}) => ({ type: 'flag', flag, ...(v === undefined ? {} : { v }), ...extra });
const out = {};

// ---------- symbols ----------
out['symbols_v3.json'] = { symbols: [{ id: 'redeye', name: T('Red Eye'), tier: 0, value: 0, weight: 0, kind: 'omen', group: null, icon: 'sym/redeye', text: T('Never matches. Blocks patterns.') }] };

// ---------- spirits (SPEC 3.6) ----------
const L = 2, Fi = 1, M = 0.5, H = -1;
const taste = (a) => Object.fromEntries(['coins', 'caps', 'spice', 'trick', 'charm', 'curse', 'skip'].map((k, i) => [k, a[i]]));
const stage = (at, id, ...rules) => ({ at, id, rules });
const gift = (id, icon, ...effects) => ({ id, icon, effects });
const SP = [
  { id: 'brimble', name: 'Mr. Ruby', rival: 'waiting', local: ['c1', 'c10'], unlock: { start: true }, taste: [Fi, L, M, M, H, Fi, H],
    stages: [stage(2, 'offers3', P(F('dealOffers', 3))), stage(5, 'interest3', P({ type: 'interest', n: 3 })), stage(8, 'deal_bonus', R('onDeal', {}, { type: 'wick', n: 2 }, { type: 'coins', n: 20 }))],
    wrath: [{ at: -2, rules: [P(F('noInterest'))] }, { at: -5, rules: [P(F('noPawn'))] }], gifts: [], red: { deals: true }, ownCurse: null, omen: 'nextDebts', demand: 'signDeal' },
  { id: 'beckon', name: 'Auntie Beckon', rival: 'wire', local: ['c4', 'c9'], unlock: { start: true }, taste: [L, Fi, M, Fi, Fi, H, M],
    stages: [stage(2, 'extra', P(F('shopExtra', 1))), stage(5, 'disc10', P(F('shopDiscount', 10))), stage(8, 'disc20', P(F('shopDiscount', 20)), R('onDebtPaid', {}, { type: 'gainCharm', rarity: 'common' }))],
    wrath: [{ at: -2, rules: [P(F('shopMarkup', 20))] }, { at: -5, rules: [P(F('rerollDouble'))] }],
    gifts: [gift('beckon_sale', 'deal/coins', { type: 'flag', flag: 'shopDiscount', v: 30, scope: 'debt' }), gift('beckon_more', 'deal/coins', { type: 'flag', flag: 'shopExtra', v: 2, scope: 'debt' }), gift('beckon_full', 'deal/coins', { type: 'flag', flag: 'sellFull', scope: 'debt' }), gift('beckon_coins', 'deal/coins', { type: 'coins', n: 15 })],
    red: { id: 'closing_sale', icon: 'deal/coins', boon: [{ type: 'flag', flag: 'sellFull', scope: 'debt' }, { type: 'flag', flag: 'shopDiscount', v: 50, scope: 'debt' }], carry: [F('noShopN', 2)], curse: null },
    ownCurse: 'haggler', omen: 'nextOffers', demand: 'buy2' },
  { id: 'gold', name: 'Little Gold', rival: 'moonbiter', local: ['c3'], unlock: { start: true }, taste: [Fi, Fi, M, L, H, M, H],
    stages: [stage(2, 'first_pick', P({ type: 'luck', n: 1 })), stage(5, 'twice_pick', P(F('pickFirstFav', true))), stage(8, 'two_faves', P(F('twoFavs', true)))],
    wrath: [{ at: -2, rules: [P(F('hideFav', true))] }, { at: -5, rules: [P({ type: 'luck', n: -3 })] }],
    gifts: [gift('gold_luck', 'deal/luck', { type: 'luck', n: 2, scope: 'debt' }), gift('gold_toys', 'ui/trick_bag', { type: 'trick', n: 2 }), gift('gold_peek', 'ui/favour', { type: 'flag', flag: 'seeNextFav', v: true, scope: 'debt' }), gift('gold_shine', 'ui/star', { type: 'symValue', n: 2, sym: 'favoured', scope: 'debt' })],
    red: { id: 'pinky_promise', icon: 'deal/luck', boon: [{ type: 'luck', n: 5, scope: 'debt' }], curse: null, due: { rounds: 2, else: [{ type: 'loseCharm', pick: 'best' }] } },
    ownCurse: 'sticky_fingers', omen: 'nextFavs2', demand: 'letMePick' },
  { id: 'wire', name: 'Uncle Wire', rival: 'beckon', local: ['c2', 'c9'], unlock: { c: 'c2' }, taste: [Fi, M, Fi, L, Fi, H, H],
    stages: [stage(2, 'pockets', P(F('trickPockets', 1))), stage(5, 'free_trick', P(F('firstTrickFree', true))), stage(8, 'bench30', P(F('benchDiscount', 30)), R('onDebtStart', {}, { type: 'trick', n: 1 }))],
    wrath: [{ at: -2, rules: [P(F('trickPockets', -1))] }, { at: -5, rules: [P(F('trickPockets', -1))] }],
    gifts: [gift('wire_tricks', 'ui/trick_bag', { type: 'trick', n: 2 }), gift('wire_pockets', 'ui/trick_bag', { type: 'flag', flag: 'trickPockets', v: 1, scope: 'debt' }), gift('wire_bench', 'ui/trick_bag', { type: 'flag', flag: 'benchDiscount', v: 100, scope: 'debt' }), gift('wire_charge', 'ui/honk', { type: 'charge', n: 99 })],
    red: { id: 'hot_wire', icon: 'ui/trick_bag', boon: [{ type: 'trick', n: 3 }, { type: 'flag', flag: 'trickFree', scope: 'debt' }], curse: 'short_circuit' },
    ownCurse: 'short_circuit', omen: 'benchPrices', demand: 'handTrick' },
  { id: 'waiting', name: 'The Waiting Lady', rival: 'brimble', local: ['c8'], unlock: { c: 'c3', white: true }, taste: [Fi, Fi, M, H, L, M, L],
    stages: [stage(2, 'spare', R('onDebtStart', { limit: 'debt' }, { type: 'trick', n: 1, id: 'spare_candle' })), stage(5, 'extra_life', P(F('extraLife', true))), stage(8, 'hangup_bonus', R('onHangUp', {}, { type: 'luck', n: 1 }, { type: 'wick', n: 2 }))],
    wrath: [{ at: -2, rules: [P(F('noBeads', true))] }, { at: -5, rules: [P(F('noBeads', true))] }],
    gifts: [gift('wait_spare', 'ui/trick_bag', { type: 'trick', n: 1, id: 'spare_candle' }), gift('wait_caps', 'deal/wick', { type: 'wick', n: 3 }), gift('wait_luck', 'deal/luck', { type: 'luck', n: 1 }), gift('wait_lift', 'deal/luck', { type: 'liftCurse', n: 1 })],
    red: null, white: [gift('white_value', 'ui/white_call', { type: 'symMult', n: 1, sym: 'all' }), gift('white_pat', 'ui/white_call', { type: 'patMult', n: 1, pattern: 'all' }), gift('white_bless', 'ui/white_call', F('redEyeBless', true))],
    ownCurse: 'heavy_hands', omen: 'shortfall', demand: 'waitWithMe' },
  { id: 'tide', name: 'Grandmother Tide', rival: 'lamplit', local: ['c5'], unlock: { c: 'c5' }, taste: [Fi, Fi, H, M, H, M, L],
    stages: [stage(2, 'int2', P({ type: 'interest', n: 2 })), stage(5, 'carry3', P(F('carrySpins', 3))), stage(8, 'tide_patron', R('onDebtStart', {}, { type: 'spins', n: 2 }, { type: 'luck', n: 4, scope: 'round' }))],
    wrath: [{ at: -2, rules: [P(F('interestHalf'))] }, { at: -5, rules: [P(F('noInterest'))] }],
    gifts: [gift('tide_int', 'ui/interest', { type: 'interest', n: 3, scope: 'debt' }), gift('tide_spins', 'ui/hourglass', { type: 'spins', n: 2 }), gift('tide_charge', 'ui/honk', { type: 'charge', n: 99 }), gift('tide_coins', 'deal/coins', { type: 'coins', n: 15 })],
    red: { id: 'cargo_credit', icon: 'deal/coins', boon: [{ type: 'gainCharm', rarity: 'uncommon', family: 'random', n: 2 }], curse: 'slow_water' },
    ownCurse: 'slow_water', omen: 'nextTerms', demand: 'keepCool' },
  { id: 'moonbiter', name: 'The Moonbiter', rival: 'gold', local: ['c6'], unlock: { c: 'c6' }, taste: [M, H, Fi, Fi, L, L, M],
    stages: [stage(2, 'soot_coin', R('onSymbolLand', { sym: 'ash' }, { type: 'coins', n: 1 })), stage(5, 'flare_bonus', R('onScorch', {}, { type: 'wick', n: 2 }, { type: 'patMult', n: 0.5, pattern: 'all', scope: 'round' })), stage(8, 'soot_fav', P(F('ashIsFav', true)))],
    wrath: [{ at: -2, rules: [P({ type: 'weight', n: 1.5, sym: 'ash' })] }, { at: -5, rules: [P(F('deadCentre', true))] }],
    gifts: [gift('moon_remove', 'ui/curse_badge', { type: 'removeSymbol', n: 1 }), gift('moon_lift', 'deal/luck', { type: 'liftCurse', n: 1 }), gift('moon_clean', 'sym/ash', { type: 'weight', n: 0, sym: 'ash', scope: 'debt' }), gift('moon_caps', 'deal/wick', { type: 'wick', n: 3 })],
    red: { id: 'one_bite', icon: 'sym/ash', boon: [{ type: 'removeSymbol', n: 2 }, { type: 'allMult', n: 1.5, scope: 'debt' }], curse: 'hollow_centre' },
    ownCurse: 'hollow_centre', omen: 'ashNext', demand: 'feed' },
  { id: 'lamplit', name: 'Lady Lamplit', rival: 'tide', local: ['c7'], unlock: { c: 'c7' }, taste: [Fi, Fi, L, M, H, M, M],
    stages: [stage(2, 'heat_floor', P(F('heatFloor', 1))), stage(5, 'heat_step', P(F('heatStep', 25))), stage(8, 'burn10', P(F('scorchBurn', 10)), R('onScorch', {}, { type: 'wick', n: 1 }))],
    wrath: [{ at: -2, rules: [P(F('heatMax', 8))] }, { at: -5, rules: [P(F('noStoke'))] }],
    gifts: [gift('lamp_heat', 'ui/heat', { type: 'heat', n: 3 }, { type: 'flag', flag: 'heatNoCool', scope: 'round' }), gift('lamp_burn', 'ui/heat', { type: 'flag', flag: 'scorchBurn', v: 10, scope: 'debt' }), gift('lamp_caps', 'deal/wick', { type: 'wick', n: 4 }), gift('lamp_mult', 'ui/star', { type: 'allMult', n: 1.5, scope: 'round' })],
    red: { id: 'midnight_run', icon: 'ui/heat', boon: [{ type: 'heat', n: 10 }, { type: 'flag', flag: 'heatNoCool', scope: 'round' }, { type: 'allMult', n: 2, scope: 'round' }], curse: 'dark_wick' },
    ownCurse: 'dark_wick', omen: 'scorchOdds', demand: 'dare' },
];
out['spirits.json'] = {
  spirits: SP.map((s) => ({
    id: s.id, name: T(s.name), domain: s.omen, rival: s.rival, unlock: s.unlock, local: s.local,
    portrait: { calm: `spirit/${s.id}_calm`, glad: `spirit/${s.id}_glad`, cross: `spirit/${s.id}_cross` },
    taste: taste(s.taste), hint: T('hint'),
    stages: s.stages.map((x) => ({ ...x, name: T(x.id) })), wrath: s.wrath, gifts: s.gifts.map((g) => ({ ...g, name: T(g.id) })),
    red: s.red, white: s.white || null, ownCurse: s.ownCurse, omen: s.omen, demand: s.demand,
    text: { red: T('red call') }, lines: {},
  })),
};

// ---------- curses_v3 ----------
const curse = (id, rules) => ({ id, name: T(id), icon: `curse/${id}`, rules, text: T(id) });
out['curses_v3.json'] = { curses: [
  curse('haggler', [P(F('rerollDouble'))]), curse('short_circuit', [P(F('trickPockets', -1))]), curse('heavy_hands', [P(F('noRelic'))]),
  curse('slow_water', [P(F('spinsLess', 1))]), curse('hollow_centre', [P(F('deadCentre'))]), curse('dark_wick', [P(F('heatMax', 8))]),
] };

// ---------- charms_v3 (active, red eye, fused) ----------
const ch = (id, family, rarity, price, rules, extra = {}) => ({ id, name: T(id), family, tags: [family, ...(extra.tags || [])], rarity, icon: `charm/${id}`, price: { coins: price }, unlock: null, rules, text: T(id), ...extra.rest });
const act = (id, family, rarity, need, price, ...effects) => ch(id, family, rarity, price, [R('onActivate', {}, ...effects)], { tags: ['active'], rest: { active: { need } } });
const charms = [
  act('bike_horn', 'tinker', 'common', 1, 6, { type: 'luck', n: 3, scope: 'spin' }),
  act('fish_sauce', 'ember', 'uncommon', 2, 10, { type: 'allMult', n: 2, scope: 'spin' }),
  act('ice_bucket', 'ember', 'common', 1, 5, { type: 'heat', n: -3 }),
  act('megaphone', 'omen', 'uncommon', 2, 10, { type: 'place', n: 3, sym: 'favoured' }),
  act('spare_tyre', 'tinker', 'rare', 3, 16, { type: 'spins', n: 2 }),
  act('sweeper', 'swarm', 'common', 2, 6, { type: 'weight', n: 0, sym: 'ash', scope: 'spin' }),
  act('price_gun', 'ledger', 'common', 1, 6, { type: 'coins', n: 10 }),
  act('neon_open', 'pact', 'rare', 3, 16, { type: 'patMult', n: 2, pattern: 'all', scope: 'spin' }),
  act('double_shift', 'stitch', 'rare', 3, 16, { type: 'allMult', n: 3, scope: 'spin' }, { type: 'heat', n: 2 }),
  act('wok_toss', 'ember', 'common', 1, 5, { type: 'heat', n: 3 }),
  act('calculator', 'ledger', 'uncommon', 2, 10, { type: 'interest', n: 3, scope: 'round' }),
  act('rubber_band', 'tinker', 'uncommon', 2, 10, { type: 'trick', n: 1 }),
  { ...act('coin_flip', 'omen', 'uncommon', 1, 10), rules: [R('onActivate', { chance: 50 }, { type: 'coins', n: 20 })] },
  act('gold_spray', 'crown', 'rare', 3, 16, { type: 'symValue', n: 4, sym: 'high', scope: 'spin' }),
  act('taxi_meter', 'ledger', 'uncommon', 2, 10, { type: 'wick', n: 2 }),
  act('bike_jump', 'tinker', 'legendary', 3, 28, { type: 'spins', n: 1 }, { type: 'luck', n: 2, scope: 'spin' }, { type: 'patMult', n: 2, pattern: 'big', scope: 'spin' }),
  ch('eye_drops', 'hex', 'common', 5, [P(F('redEyeSoft', 1))], { tags: ['redeye'] }),
  ch('staring', 'hex', 'uncommon', 9, [R('onRedEye', {}, { type: 'stack', n: 1 }), P({ type: 'symMult', n: 0.25, sym: 'all', per: 'stack' })], { tags: ['redeye'] }),
  ch('omen_jar', 'hex', 'uncommon', 9, [R('onRedEye', {}, { type: 'coins', n: 20 })], { tags: ['redeye'] }),
  ch('ruby_shades', 'hex', 'rare', 15, [P(F('redEyeRate', 2)), P({ type: 'allMult', n: 1.25 })], { tags: ['redeye'] }),
  ch('night_owl', 'hex', 'rare', 15, [R('onRedEye', {}, { type: 'gainCharm', rarity: 'rare' })], { tags: ['redeye'] }),
  ch('red_eye_flight', 'hex', 'uncommon', 9, [R('onRedEye', {}, { type: 'spins', n: 2 })], { tags: ['redeye'] }),
  ch('counter_stare', 'hex', 'legendary', 26, [P(F('redEyeBless', true))], { tags: ['redeye'] }),
  ch('taillight', 'hex', 'common', 5, [P({ type: 'luck', n: 1, per: 'redEyes' })], { tags: ['redeye'] }),
];
const fuse = (id, a, b, ...rules) => ({ ...ch(id, a, 'fused', 30, rules, { tags: [b, 'fused'] }) });
charms.push(
  fuse('f_skewer_cart', 'swarm', 'ember', P({ type: 'symValue', n: 2, sym: 'low' }), P({ type: 'symMult', n: 0.1, sym: 'low', per: 'heat' })),
  fuse('f_firefly_snack', 'swarm', 'wisp', R('onPattern', { group: 'low', hasWisp: true }, { type: 'retrigger', n: 1 })),
  fuse('f_street_gold', 'swarm', 'crown', R('onPattern', { group: 'low', minCells: 5 }, { type: 'coins', n: 5 })),
  fuse('f_market_scale', 'swarm', 'ledger', R('onSymbolLand', { group: 'low', every: 10 }, { type: 'interest', n: 1 })),
  fuse('f_smog_wok', 'ember', 'hex', P({ type: 'patMult', n: 0.5, pattern: 'all', per: 'curses' })),
  fuse('f_neon_grill', 'ember', 'pact', R('onScorch', {}, { type: 'wick', n: 3 }, { type: 'coins', n: 10 })),
  fuse('f_lucky_chili', 'ember', 'omen', P({ type: 'luck', n: 0.5, per: 'heat' })),
  fuse('f_ruby_umbrella', 'hex', 'pact', R('onCurse', {}, { type: 'coins', n: 15 }), R('passive', { cursesMin: 3 }, { type: 'allMult', n: 1.5 })),
  fuse('f_rainy_day_fund', 'hex', 'ledger', P({ type: 'interest', n: 1, per: 'curses' })),
  fuse('f_monsoon_gold', 'hex', 'crown', P({ type: 'symValue', n: 1, sym: 'crown', per: 'curses' })),
  fuse('f_small_print_lawyer', 'ledger', 'pact', R('onDeal', {}, { type: 'interest', n: 2 })),
  fuse('f_meter_taxi', 'ledger', 'tinker', R('onTrick', {}, { type: 'coins', n: 3 })),
  fuse('f_gold_shop', 'ledger', 'crown', R('onInterest', {}, { type: 'symValue', n: 1, sym: 'crown' })),
  fuse('f_calling_luck', 'pact', 'omen', R('onSymbolLand', { sym: 'sigil' }, { type: 'luck', n: 1, scope: 'round' })),
  fuse('f_rooftop_lease', 'pact', 'crown', R('onDeal', {}, { type: 'gainCharm', rarity: 'rare' })),
  fuse('f_lucky_combo', 'omen', 'stitch', R('onPattern', { favoured: true }, { type: 'patMult', n: 1, pattern: 'this' })),
  fuse('f_glowing_special', 'omen', 'wisp', P({ type: 'weight', n: 2, sym: 'wisp' }), P({ type: 'luck', n: 1 })),
  fuse('f_lucky_tuktuk', 'omen', 'tinker', R('onTrick', {}, { type: 'luck', n: 1, scope: 'round' })),
  fuse('f_spinning_elbow', 'stitch', 'wisp', R('onPattern', { hasWisp: true }, { type: 'patMult', n: 2, pattern: 'this' })),
  fuse('f_clinch_tool', 'stitch', 'tinker', R('onSpinEnd', { distinctMin: 3 }, { type: 'allMult', n: 2 })),
  fuse('f_golden_belt', 'stitch', 'crown', P({ type: 'patMult', n: 2, pattern: 'big' })),
  fuse('f_firefly_lamp', 'wisp', 'tinker', R('onSpinStart', {}, { type: 'place', n: 1, sym: 'wisp' })),
  fuse('f_gold_dust', 'wisp', 'crown', R('onPattern', { group: 'high', hasWisp: true }, { type: 'retrigger', n: 1 })),
  fuse('f_gold_rims', 'tinker', 'crown', P({ type: 'slot', n: 1 }), P({ type: 'symValue', n: 1, sym: 'high' })),
);
out['charms_v3.json'] = { charms };
out['fusion.json'] = { same: { cost: { common: 2, uncommon: 3, rare: 4 } }, recipe: { cost: 5 }, recipes: charms.filter((c) => c.rarity === 'fused').map((c) => ({ a: c.family, b: c.tags[1], out: c.id })) };

// ---------- progression ----------
const PLACES = [
  ['c1', 'Soi Cart', 'Street Kid', 'brimble'], ['c2', 'Train Market', 'Tray Hawker', 'wire'], ['c3', 'Yaowarat', 'Boat Vendor', 'gold'], ['c4', 'Khao San Rush', 'Stall Owner', 'beckon'],
  ['c5', 'Pattaya Low Season', 'Shop Owner', 'tide'], ['c6', 'Chiang Mai Haze', 'Wholesaler', 'moonbiter'], ['c7', 'Phuket Beach Club', 'Shophouse Owner', 'lamplit'],
  ['c8', 'Riverside Boutique', 'Ferry Boss', 'waiting'], ['c9', 'Sukhumvit Condo Launch', 'Shipping Magnate', 'beckon'], ['c10', 'The Sky Bar', 'Tycoon', 'brimble'],
];
out['places.json'] = { places: PLACES.map(([id, n, rank, local], i) => ({ id, contract: id, n: i + 1, name: T(n), rank: T(rank), local, bg: `bg/${id}`, silverKey: [2, 5, 7].includes(i + 1), brassKey: true })) };
out['characters_v3.json'] = { characters: [] };
const nb = (id, tab, cost, requires, effect) => ({ id, tab, cost, requires, effect, name: T(id), text: T(id) });
out['notebook.json'] = { nodes: [
  nb('cart_01', 'cart', 20, null, { type: 'startTrick', n: 1 }), nb('cart_02', 'cart', 30, { lesson: 3 }, { type: 'flag', flag: 'freeReroll', v: 1 }),
  nb('cart_05', 'cart', 70, { stat: 'dealsSigned', gte: 3 }, { type: 'startWick', n: 3 }), nb('cart_07', 'cart', 100, { clear: 'c3' }, { type: 'postcardSlots', n: 1 }), nb('cart_09', 'cart', 160, { clear: 'c5' }, { type: 'postcardSlots', n: 1 }),
  nb('tin_01', 'tin', 40, { lesson: 6 }, { type: 'flag', flag: 'tinOfferings', v: 1 }), nb('tin_04', 'tin', 120, { clear: 'c4' }, { type: 'flag', flag: 'callCards', v: 1 }), nb('tin_06', 'tin', 200, { stat: 'redCalls', gte: 5 }, { type: 'flag', flag: 'callRerollFree', v: true }),
  nb('pool_01', 'pool', 25, null, { type: 'poolAdd', n: 4, rarity: 'common' }), nb('pool_02', 'pool', 50, { clear: 'c2' }, { type: 'poolAdd', n: 4, rarity: 'uncommon' }),
  nb('home_02', 'home', 25, { lesson: 1 }, { type: 'none' }),
] };
const lk = (id, key, extra, contents) => ({ id, key, requires: extra, contents, name: T(id) });
const FAMS = ['swarm', 'ember', 'hex', 'ledger', 'pact', 'omen', 'stitch', 'wisp', 'tinker', 'crown'];
out['lockers.json'] = { lockers: [
  ...FAMS.map((f, i) => lk('L' + (i + 1), 'brass', null, { charmsRareA: [f] })),
  ...[0, 1, 2, 3, 4].map((i) => lk('L' + (11 + i), 'silver', { clear: 'c3' }, { charmsRareB: [FAMS[2 * i], FAMS[2 * i + 1]] })),
  lk('L16', 'silver', { lessons: 10 }, { postcards: ['rainy_day', 'hot_pan', 'fresh_fish', 'night_bus', 'borrowed_coat', 'short_cut'] }),
  lk('L17', 'silver', { clear: 'c6' }, { postcards: ['staring_contest', 'spare_blender', 'party_line', 'quiet_phone', 'full_charge', 'late_kiosk'] }),
  lk('L18', 'red', { clear: 'c7' }, { charmsLegendary: FAMS.slice(0, 5) }), lk('L19', 'red', { storm: 3 }, { charmsLegendary: FAMS.slice(5) }), lk('L20', 'red', { lockers: 19 }, { deed: true }),
] };
const pc = (id, ...rules) => ({ id, name: T(id), icon: `post/${id}`, rules, text: T(id) });
out['postcards.json'] = { postcards: [
  pc('rainy_day', P({ type: 'flag', flag: 'spinsRound', v: 1 }), P(F('debtMul', 8))), pc('hot_pan', P(F('startHeat', 3)), P({ type: 'weight', n: 1.3, sym: 'ash' })),
  pc('fresh_fish', P({ type: 'luck', n: 4 })), pc('night_bus', R('onRunStart', {}, { type: 'wick', n: 3 })), pc('borrowed_coat', P({ type: 'slot', n: 1 }), P(F('dealOffers', 1))),
  pc('short_cut'), pc('crooked_scale', R('onRunStart', {}, { type: 'favour', spirit: 'wire', n: 2 }, { type: 'favour', spirit: 'beckon', n: 2 }, { type: 'favour', spirit: 'tide', n: -2 }, { type: 'favour', spirit: 'waiting', n: -2 })),
  pc('old_photo', R('onRunStart', {}, { type: 'favour', spirit: 'waiting', n: 3 }, { type: 'favour', spirit: 'brimble', n: -3 })), pc('thumb_scale', P(F('freeRedraw', 1))),
  pc('empty_wallet', P(F('debtMul', -30))), pc('all_pocket'), pc('mothers_voice', P(F('patronAt', 9))),
  pc('staring_contest', R('onRedEye', {}, { type: 'wick', n: 3 })), pc('spare_blender'), pc('party_line', P(F('callCards', 1))),
  pc('quiet_phone', P({ type: 'interest', n: 4 })), pc('full_charge'), pc('late_kiosk', P({ type: 'interest', n: 4 })),
] };
out['lessons.json'] = { lessons: [
  [1, 'line4', 'pattern:h4'], [2, 'spice3', 'heat3Spins'], [3, 'bank', 'interestTotal'], [4, 'charms3', 'familyFull'], [5, 'trick', 'tricksUsed'], [6, 'tin', 'offerings'], [7, 'sign_refuse', 'dealsSigned'],
  [8, 'friend', 'stagesFriend'], [9, 'bench', 'benchJobs'], [10, 'fall_rise', 'fallRise'], [11, 'honk', 'honks'], [12, 'blend', 'blends'], [13, 'stare', 'staredDown'],
].map(([n, id, stat]) => ({ id: n, key: id, name: T(id), cond: { stat, gte: 1 }, reward: { stash: 10 + (n > 3 ? 5 : 0) }, text: T(id) })) };
out['milestones.json'] = { milestones: [{ id: 'run1', cond: { stat: 'runs', gte: 1 }, name: T('run1') }, { id: 'debts10', cond: { stat: 'debtsPaid', gte: 10 }, name: T('debts10') }] };
out['storm.json'] = { storms: Array.from({ length: 10 }, (_, i) => ({ n: i + 1, name: T('Storm ' + (i + 1)), rules: [] })) };

fs.mkdirSync(here, { recursive: true });
for (const [f, v] of Object.entries(out)) {
  const s = JSON.stringify(v, null, 1);
  fs.writeFileSync(path.join(here, f), s);
  if (process.argv.includes('--install')) {
    try { fs.writeFileSync(path.join(dataDir, f), s, { flag: 'wx' }); console.log('installed ' + f); } catch { /* exists: the content lane's file wins */ }
  }
}
console.log('fixtures: ' + Object.keys(out).length + ' files');
