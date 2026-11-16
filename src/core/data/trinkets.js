// The 35 lite trinkets (CONTENT.md section 2): 22 start + Pier Cat + 4 radio Tide + 8 Hearth. Data only: core/trinkets.js reads hooks + params.
// hook: one hook name or an array of them (all from HOOKS, the TECH.md section 2 list); hook = first of hooks.
// price: list price by grade, read from econ.js PRICES. params: numbers for the effect; sym = symbol id. unlock: start | cat_basket | radio | tea_corner.
// Keys: trinket.<id>.name / .short / .desc.
import { deepFreeze } from './freeze.js';
import { PRICES } from '../econ.js';

export const HOOKS = deepFreeze([
  'onRunStart', 'onTideStart', 'onDraw', 'onLine', 'onSpecial', 'onSpinTotal', 'onPeg', 'onTideEnd', 'onShop', 'onQuota',
  'onPrice', 'onRemoveToken', 'onPegSupply', 'onPegNeed', 'onHoldExpire', 'onSpinsPerTide', 'onColumnRespin', 'onMercy',
]);

export const FAMILIES = deepFreeze(['catch', 'hearth', 'sky', 'treasure', 'knot', 'peg', 'tide', 'ledger']);

const T = (id, family, grade, en, tr, hook, params, unlock = 'start') => ({
  id, family, grade, price: PRICES.trinket[grade - 1], en, tr, hooks: [].concat(hook), hook: [].concat(hook)[0], params, unlock,
  nameKey: `trinket.${id}.name`, shortKey: `trinket.${id}.short`, descKey: `trinket.${id}.desc`,
});

export const TRINKETS = deepFreeze([
  // Catch / Av
  T('salt_barrel', 'catch', 1, 'Salt Barrel', 'Tuz Fıçısı', 'onLine', { sym: 'sardine', add: 5 }),
  T('fish_cart', 'catch', 1, 'Fish Cart', 'Balık Arabası', 'onSpinTotal', { sym: 'sardine', minLanded: 4, add: 20 }),
  T('net_mender', 'catch', 1, 'Net Mender', 'Ağ Tamircisi', 'onSpecial', { sym: 'net', addPerAdjacent: 2 }),
  T('fish_hook', 'catch', 2, 'Fish Hook', 'Olta İğnesi', 'onLine', { sym: 'sardine', mul: 2 }),
  T('ice_crate', 'catch', 2, 'Ice Crate', 'Buz Kasası', 'onLine', { sym: 'sardine', addPerHeldSym: 12 }),
  T('pier_cat', 'catch', 2, 'Pier Cat', 'İskele Kedisi', ['onLine', 'onSpecial'], { sym: 'sardine', add: 5, catSym: 'cat', catMul: 2 }, 'cat_basket'),
  T('fish_scale', 'catch', 3, "Fishmonger's Scale", 'Balıkçı Terazisi', 'onLine', { sym: 'sardine', growPerPaidLine: 6, cap: 30 }),
  T('full_net', 'catch', 3, 'Full Net', 'Dolu Ağ', 'onSpinTotal', { sym: 'sardine', minLanded: 5, add: 40 }),
  // Hearth / Ocak (Tea Corner)
  T('samovar_tap', 'hearth', 1, 'Samovar Tap', 'Semaver Musluğu', 'onLine', { sym: 'tea', add: 6 }, 'tea_corner'),
  T('lantern_oil', 'hearth', 1, 'Lantern Oil', 'Fener Yağı', 'onLine', { sym: 'lantern', add: 8 }, 'tea_corner'),
  T('sugar_cube', 'hearth', 1, 'Sugar Cube', 'Kesme Şeker', 'onSpinTotal', { sym: 'tea', nextTo: 'lantern', add: 3 }, 'tea_corner'),
  T('warm_rug', 'hearth', 1, 'Warm Rug', 'Sıcak Kilim', 'onSpinTotal', { fromSpin: 2, toSpin: 6, add: 2 }, 'tea_corner'),
  T('grandmas_cup', 'hearth', 2, "Grandma's Cup", 'Babaanne Fincanı', 'onLine', { sym: 'tea', mul: 2 }, 'tea_corner'),
  T('hearth_stone', 'hearth', 2, 'Hearth Stone', 'Ocak Taşı', 'onTideEnd', { pct: 0.2, max: 20 }, 'tea_corner'),
  T('wick_trimmer', 'hearth', 2, 'Wick Trimmer', 'Fitil Makası', 'onLine', { sym: 'lantern', lineIds: ['row1', 'col1'], mul: 3 }, 'tea_corner'),
  T('tea_garden', 'hearth', 3, 'Tea Garden', 'Çay Bahçesi', 'onSpinTotal', { syms: ['tea', 'lantern'], mul: 3 }, 'tea_corner'),
  // Peg / Mandal
  T('spare_peg', 'peg', 1, 'Spare Peg', 'Yedek Mandal', 'onPegSupply', { add: 1 }),
  T('steady_hand', 'peg', 1, 'Steady Hand', 'Sabit El', 'onLine', { heldCells: 2, add: 3 }),
  T('brass_peg', 'peg', 2, 'Brass Peg', 'Pirinç Mandal', 'onSpinTotal', { addPerHeldCell: 2 }),
  // Tide / Gelgit
  T('first_light', 'tide', 1, 'First Light', 'İlk Işık', 'onSpinTotal', { spin: 1, mul: 3 }),
  T('tide_table', 'tide', 1, 'Tide Table', 'Gelgit Cetveli', 'onSpinTotal', { everySpin: 3, add: 4 }),
  T('dry_spell', 'tide', 1, 'Dry Spell', 'Kurak Gün', 'onSpinTotal', { afterZeroSpin: true, mul: 1.75 }),
  T('night_tide', 'tide', 1, 'Night Tide', 'Gece Suyu', 'onSpinTotal', { lastSpin: true, mul: 2 }),
  T('lucky_sandal', 'tide', 2, 'Lucky Sandal', 'Uğurlu Terlik', 'onSpinTotal', { charges: 3, add: 30 }, 'radio'),
  T('slack_water', 'tide', 2, 'Slack Water', 'Durgun Su', 'onQuota', { mul: 0.92 }, 'radio'),
  T('orhans_watch', 'tide', 3, "Orhan's Watch", 'Orhan\'ın Saati', ['onSpinsPerTide', 'onPegSupply'], { spins: 1, pegs: 1 }, 'radio'),
  T('second_wind', 'tide', 3, 'Second Wind', 'İkinci Nefes', 'onMercy', { gap: 20, uses: 2 }, 'radio'),
  // Ledger / Defter
  T('tin_cup', 'ledger', 1, 'Tin Cup', 'Teneke Kupa', 'onTideStart', { coins: 8 }),
  T('lucky_ledger', 'ledger', 1, 'Lucky Ledger', 'Uğurlu Defter', 'onPrice', { freeRerollsPerShop: 2 }),
  T('pebble_jar', 'ledger', 1, 'Pebble Jar', 'Çakıl Kavanozu', 'onLine', { sym: 'pebble', add: 4 }),
  T('skipping_stone', 'ledger', 2, 'Skipping Stone', 'Sektirme Taşı', 'onSpinTotal', { sym: 'pebble', perLanded: 2, add: 2, max: 6 }),
  T('hagglers_cap', 'ledger', 2, "Haggler's Cap", 'Pazarlıkçı Kasketi', 'onPrice', { mul: 0.8 }),
  T('junk_cart', 'ledger', 2, 'Junk Cart', 'Eskici Arabası', 'onRemoveToken', { freePerShop: 1 }),
  T('kelp_pot', 'ledger', 2, 'Kelp Pot', 'Yosun Saksısı', 'onSpecial', { sym: 'kelp', step: 2, max: 7 }),
  T('sea_chest', 'ledger', 3, 'Sea Chest', 'Sandık', 'onTideEnd', { coinsPerTrinket: 3 }),
]);
