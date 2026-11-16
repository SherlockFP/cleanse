// Content the screens print: the data JSON (src/core/data, the same files the core reads) indexed by id, plus small shared helpers.
// All text fields are { en, tr, th }; print them with L() or, when they hold {c:N}, with coinText(text, scale).
import symbols from '../core/data/symbols.json' with { type: 'json' };
import patterns from '../core/data/patterns.json' with { type: 'json' };
import charms from '../core/data/charms.json' with { type: 'json' };
import deals from '../core/data/deals.json' with { type: 'json' };
import curses from '../core/data/curses.json' with { type: 'json' };
import tricks from '../core/data/tricks.json' with { type: 'json' };
import stakes from '../core/data/stakes.json' with { type: 'json' };
import contracts from '../core/data/contracts.json' with { type: 'json' };
import characters from '../core/data/characters.json' with { type: 'json' };
import hideout from '../core/data/hideout.json' with { type: 'json' };
import achievements from '../core/data/achievements.json' with { type: 'json' };
import config from '../core/data/config.json' with { type: 'json' };

// v3 data (docs/v3/SPEC.md section 8) is written by the content lane. A file that is not there yet is simply empty (Vite glob; in Node tests
// globalThis.__DATA_V3 = { 'spirits.json': {...} } stands in). Assumed shapes, all text fields { en, tr, th }:
//   spirits.json { spirits: [SPEC 3.7] }   charms_v3.json { charms }   curses_v3.json { curses }   fusion.json { same, recipes: [{a,b,out}] }
//   places.json { places: [{ id, contract, rank, local, ... }] }   notebook.json { nodes: [{ id, tab, name, text, cost, needs, icon }] }
//   lockers.json { lockers: [{ id, key, needs, contents }] }   postcards.json { postcards: [{ id, name, gain, cost, icon, pack }] }
//   lessons.json { lessons: [{ id, name, text, reward }] }   storm.json { storms: [{ id, name, text }] }   endings.json { endings: [{ id, trigger, text }] }
let G = {};
try { G = import.meta.glob('../core/data/{spirits,charms_v3,curses_v3,fusion,places,notebook,lockers,postcards,lessons,storm,endings,achievements_v3,characters_v3}.json', { eager: true, import: 'default' }); } catch { /* not under Vite */ }
const v3 = (name, key) => { const hit = globalThis.__DATA_V3?.[name + '.json'] ?? Object.entries(G).find(([p]) => p.endsWith('/' + name + '.json'))?.[1]; return key ? (hit?.[key] ?? []) : (hit ?? {}); };
const index = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const CONFIG = config;
export const SYMBOLS = symbols.symbols, SYM = index(SYMBOLS);
export const PATTERNS = patterns.patterns;
export const CHARMS = [...charms.charms, ...v3('charms_v3', 'charms')], CHARM = index(CHARMS);
export const DEALS = deals.deals, DEAL = index(DEALS);
export const CURSES = [...curses.curses, ...v3('curses_v3', 'curses')], CURSE = index(CURSES);
export const TRICKS = tricks.tricks, TRICK = index(TRICKS);
export const STAKES = stakes.stakes, STAKE = index(STAKES);
export const CONTRACTS = contracts.contracts, CONTRACT = index(CONTRACTS);
export const CHARS = [...characters.characters, ...v3('characters_v3', 'characters')], CHAR = index(CHARS);
export const HIDEOUT = hideout.hideout, HIDE = index(HIDEOUT);
export const ACHS = [...achievements.achievements, ...v3('achievements_v3', 'achievements')], ACH = index(ACHS);
export const SPIRITS = v3('spirits', 'spirits'), SPIRIT = index(SPIRITS);
export const FUSION = v3('fusion', 'recipes'), FUSE_COST = (v3('fusion').same ?? { cost: { common: 2, uncommon: 3, rare: 4 } }).cost;
export const PLACES = v3('places', 'places'), PLACE = index(PLACES);
export const NOTEBOOK = v3('notebook', 'nodes'), NODE = index(NOTEBOOK);
export const LOCKERS = v3('lockers', 'lockers');
export const POSTCARDS = v3('postcards', 'postcards'), POSTCARD = index(POSTCARDS);
export const LESSONS = v3('lessons', 'lessons');
export const STORMS = v3('storm', 'storms');
export const ENDINGS_V3 = v3('endings', 'endings');
export const BENCH = index(config.bench);
export const BOSS = index(config.bosses ?? []);
export const FAMILY = index(config.families);
export const ENDINGS = config.endings;

// The item with this id from any of the lists above, for sheets that take { kind, id }.
export const LISTS = { charm: CHARM, trick: TRICK, curse: CURSE, deal: DEAL, stake: STAKE, symbol: SYM, hideout: HIDE, char: CHAR, postcard: POSTCARD, spirit: SPIRIT };
export const RANKS = 10; // wealth ranks, one per place cleared (ui.rank.1 .. ui.rank.10)

// Price scale S of debt index i (0-based): flat coin prices and {c:N} texts are multiplied by it.
// Text coins use S^0.75 like the core's coins effect (src/core/effects.js coinScaleOf).
export const scaleAt = () => 1; // fallback only: the glue's derive(run).scale is the real coin scale

// "1 coin" tags for a price object { coins?, wick? } already multiplied by the core (shop price()).
export const hasPrice = (p) => !!p && (p.coins != null || p.wick != null);
