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

const index = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const CONFIG = config;
export const SYMBOLS = symbols.symbols, SYM = index(SYMBOLS);
export const PATTERNS = patterns.patterns;
export const CHARMS = charms.charms, CHARM = index(CHARMS);
export const DEALS = deals.deals, DEAL = index(DEALS);
export const CURSES = curses.curses, CURSE = index(CURSES);
export const TRICKS = tricks.tricks, TRICK = index(TRICKS);
export const STAKES = stakes.stakes, STAKE = index(STAKES);
export const CONTRACTS = contracts.contracts, CONTRACT = index(CONTRACTS);
export const CHARS = characters.characters, CHAR = index(CHARS);
export const HIDEOUT = hideout.hideout, HIDE = index(HIDEOUT);
export const ACHS = achievements.achievements, ACH = index(ACHS);
export const BENCH = index(config.bench);
export const FAMILY = index(config.families);
export const ENDINGS = config.endings;

// The item with this id from any of the lists above, for sheets that take { kind, id }.
export const LISTS = { charm: CHARM, trick: TRICK, curse: CURSE, deal: DEAL, stake: STAKE, symbol: SYM, hideout: HIDE, char: CHAR };

// Price scale S of debt index i (0-based): flat coin prices and {c:N} texts are multiplied by it.
// Text coins use S^0.75 like the core's coins effect (src/core/effects.js coinScaleOf).
export const scaleAt = (i) => config.priceScale[Math.min(Math.max(i | 0, 0), config.priceScale.length - 1)] ** 0.75;

// "1 coin" tags for a price object { coins?, wick? } already multiplied by the core (shop price()).
export const hasPrice = (p) => !!p && (p.coins != null || p.wick != null);
