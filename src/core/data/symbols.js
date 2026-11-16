// v1.0-lite symbols (CONTENT.md section 1): the 8 start symbols, Cat, Samovar, Barnacle, Storm cloud.
// pay: line pay, read from econ.js LINE_PAY (Knot: pay of three Knots). start: tokens in the start bag. price: shop token price (null = not sold).
// cap: max tokens per bag (null = none). unlock: id of the build or event that puts it in the pool.
// rule: how reel.js scores a special; adjacent = 4 orthogonal neighbors.
import { deepFreeze } from './freeze.js';
import { LINE_PAY } from '../econ.js';

export const SYMBOLS = deepFreeze([
  { id: 'pebble', nameKey: 'sym.pebble', en: 'Pebble', tr: 'Çakıl', type: 'line', pay: LINE_PAY.pebble, rule: null, start: 5, price: null, cap: null, unlock: 'start' },
  { id: 'sardine', nameKey: 'sym.sardine', en: 'Sardine', tr: 'Sardalya', type: 'line', pay: LINE_PAY.sardine, rule: null, start: 4, price: 4, cap: null, unlock: 'start' },
  { id: 'tea', nameKey: 'sym.tea', en: 'Tea glass', tr: 'Çay bardağı', type: 'line', pay: LINE_PAY.tea, rule: null, start: 3, price: 5, cap: null, unlock: 'start' },
  { id: 'lantern', nameKey: 'sym.lantern', en: 'Lantern', tr: 'Fener', type: 'line', pay: LINE_PAY.lantern, rule: null, start: 2, price: 6, cap: null, unlock: 'start' },
  { id: 'gull', nameKey: 'sym.gull', en: 'Gull', tr: 'Martı', type: 'line', pay: LINE_PAY.gull, rule: null, start: 1, price: 8, cap: null, unlock: 'start' },
  { id: 'knot', nameKey: 'sym.knot', en: 'Knot', tr: 'Düğüm', type: 'wild', pay: LINE_PAY.three_knots, rule: null, start: 1, price: 9, cap: null, unlock: 'rope_loft' },
  { id: 'net', nameKey: 'sym.net', en: 'Net', tr: 'Ağ', type: 'special', pay: 0, rule: { kind: 'adjacent', targets: ['sardine'], per: 2 }, start: 0, price: 6, cap: 3, unlock: 'start' },
  { id: 'kelp', nameKey: 'sym.kelp', en: 'Kelp', tr: 'Yosun', type: 'special', pay: 0, rule: { kind: 'counter', start: 1, step: 1, max: 5 }, start: 0, price: 8, cap: 3, unlock: 'start' },
  { id: 'samovar', nameKey: 'sym.samovar', en: 'Samovar', tr: 'Semaver', type: 'special', pay: 0, rule: { kind: 'adjacent', targets: ['tea'], per: 3 }, start: 0, price: 7, cap: 3, unlock: 'tea_corner' },
  { id: 'cat', nameKey: 'sym.cat', en: 'Cat', tr: 'Kedi', type: 'special', pay: 0, rule: { kind: 'adjacent', targets: ['sardine', 'gull'], per: 4 }, start: 0, price: 8, cap: 3, unlock: 'cat_basket' },
  { id: 'barnacle', nameKey: 'sym.barnacle', en: 'Barnacle', tr: 'Midye kabuğu', type: 'junk', pay: 0, rule: null, start: 0, price: null, cap: null, unlock: 'events' },
  { id: 'storm', nameKey: 'sym.storm', en: 'Storm cloud', tr: 'Fırtına bulutu', type: 'junk', pay: 0, rule: { kind: 'noPeg', reach: 'adjacent' }, start: 0, price: null, cap: null, unlock: 'events' },
]);
