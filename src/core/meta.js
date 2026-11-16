// Between runs: Wax, hideout, unlocks, achievements, contract ladder, endings.
import { CHARMS, CHAR, CONTRACTS, HIDE, HIDEOUT, ACHIEVEMENTS, CHARM, CONFIG } from './data.js';

// Stats that keep their best value; every other stat adds up across runs.
const MAX_STATS = new Set(['contract', 'reachDebt', 'patternsOneSpin', 'spinCoins', 'cursesHeld', 'tricksOneSpin', 'wispsOneSpin', 'luckReached', 'familyFull']);

export function newMeta() {
  return {
    wax: 0, hideout: ['cot'], achievements: [], chars: ['nim'], contracts: ['c1'], seenCharms: [], endings: [], keepsake: null,
    stats: {}, charWins: [], daily: { date: '', best: null, streak: 0, done: 0 }, iap: { noAds: false, skins: [] },
    settings: { lang: 'en', sfx: 1, music: 1, haptics: true, fast: false, reduceMotion: false }, tutorialDone: false,
  };
}

const achOwned = (meta, unlock) => !unlock || (unlock.startsWith('ach:') && meta.achievements.includes(unlock.slice(4)));

export function isUnlocked(meta, kind, id) {
  switch (kind) {
    case 'charm': return achOwned(meta, CHARM[id]?.unlock);
    case 'char': return achOwned(meta, CHAR[id]?.unlock) || meta.chars.includes(id);
    case 'contract': return meta.contracts.includes(id);
    case 'hideout': return meta.hideout.includes(id);
    case 'achievement': return meta.achievements.includes(id);
  }
  return false;
}

export const availableCharms = (meta) => CHARMS.filter((c) => isUnlocked(meta, 'charm', c.id)).map((c) => c.id);

const statValue = (meta, stats, key) => (key === 'hideout' ? meta.hideout.length : key === 'charWins' ? meta.charWins.length : key === 'dailyRuns' ? meta.daily.done : stats[key] || 0);

// Awards every achievement whose condition now holds. Returns the new ones.
export function checkAchievements(meta, stats = meta.stats) {
  const out = [];
  for (const a of ACHIEVEMENTS) {
    if (meta.achievements.includes(a.id) || statValue(meta, stats, a.cond.stat) < a.cond.gte) continue;
    meta.achievements.push(a.id);
    if (a.reward.wax) meta.wax += a.reward.wax;
    if (a.reward.char && !meta.chars.includes(a.reward.char)) meta.chars.push(a.reward.char);
    out.push({ id: a.id, reward: a.reward });
  }
  return out;
}

// summary comes from run.summary(run). Returns {wax, newAchievements, unlocks}.
export function applyRunResult(meta, summary) {
  for (const [k, v] of Object.entries(summary.stats)) {
    meta.stats[k] = MAX_STATS.has(k) ? Math.max(meta.stats[k] || 0, v) : (meta.stats[k] || 0) + v;
  }
  for (const id of summary.seen) if (!meta.seenCharms.includes(id)) meta.seenCharms.push(id);
  if (summary.won) {
    const i = CONTRACTS.findIndex((c) => c.id === summary.contract);
    const next = CONTRACTS[i + 1];
    if (next && !meta.contracts.includes(next.id)) meta.contracts.push(next.id);
    if (!meta.charWins.includes(summary.char)) meta.charWins.push(summary.char);
    if (summary.ending && !meta.endings.includes(summary.ending)) meta.endings.push(summary.ending);
  }
  meta.wax += summary.wax;
  const earned = checkAchievements(meta);
  const unlocks = [];
  for (const a of earned) {
    if (a.reward.char) unlocks.push({ kind: 'char', id: a.reward.char });
    if (a.reward.charm) unlocks.push({ kind: 'charm', id: a.reward.charm });
  }
  const waxGot = summary.wax + earned.reduce((n, a) => n + (a.reward.wax || 0), 0);
  return { wax: waxGot, newAchievements: earned, unlocks };
}

export function buyHideout(meta, id) {
  const h = HIDE[id];
  if (!h || meta.hideout.includes(id) || meta.wax < h.costWax) return false;
  meta.wax -= h.costWax;
  meta.hideout.push(id);
  checkAchievements(meta);
  return true;
}

export function hideoutEffects(meta) {
  const o = {};
  for (const id of meta.hideout) {
    const e = HIDE[id]?.effect;
    if (!e || e.type === 'none') continue;
    switch (e.type) {
      case 'startTrick': o.startTrick = e.n; break;
      case 'startCharmPick': o.startCharmPick = e.n; break;
      case 'shopOffers': o.shopOffers = e.n; break;
      case 'benchOffers': o.benchOffers = e.n; break;
      case 'foresight': o.foresight = true; o.freeRerolls = e.freeRerolls; break;
      case 'keepCharm': o.keepCharm = true; break;
      case 'startWick': o.startWick = e.n; break;
      case 'seededRuns': o.seededRuns = true; break;
      case 'refuseWick': o.refuseWick = e.n; break;
    }
  }
  return o;
}

// Keepsake Box: keep one common or uncommon charm you have seen for the next run.
export function setKeepsake(meta, id) {
  const c = CHARM[id];
  if (!meta.hideout.includes('keepsake') || !c || !['common', 'uncommon'].includes(c.rarity) || !meta.seenCharms.includes(id)) return false;
  meta.keepsake = id;
  return true;
}

export const contractUnlocked = (meta, id) => meta.contracts.includes(id);
export const WAX_PER_DEBT = CONFIG.wax.perDebtPaid;
export { HIDEOUT };
