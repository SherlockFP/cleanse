// The 6 lite Tide Charts (CONTENT.md section 3). Data only; run.js and shop.js read `mods`.
// mods: quotaMul, linePayMul, spins (per tide), pegs (per tide, before trinkets), startCoins, offers (shop cards),
//       priceMul (all shop offers), trinketPriceMul (trinket offers only), slots (trinket shelf).
import { deepFreeze } from './freeze.js';

const C = (id, en, tr, mods) => ({ id, en, tr, mods, nameKey: `chart.${id}.name`, descKey: `chart.${id}.desc` });

export const CHARTS = deepFreeze([
  C('spring_tide', 'Spring Tide', 'Bahar Suyu', { quotaMul: 1.2, linePayMul: 1.25 }),
  C('neap_tide', 'Neap Tide', 'Ölü Su', { quotaMul: 0.85, spins: 5 }),
  C('bare_line', 'Bare Line', 'Boş İp', { pegs: 1, startCoins: 20 }),
  C('market_day', 'Market Day', 'Pazar Günü', { offers: 4, priceMul: 1.25 }),
  C('tight_shelf', 'Tight Shelf', 'Dar Raf', { slots: 3, trinketPriceMul: 0.5 }),
  C('long_evening', 'Long Evening', 'Uzun Akşam', { spins: 7, quotaMul: 1.15 }),
]);
