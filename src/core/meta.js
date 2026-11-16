// Between runs: Stash, Notebook, keys and lockers, Left Luggage, stamps and ranks, spirits unlocked, Devotion, lessons, achievements, endings, Storm.
// (v2 called the currency Wax and the unlock list the hideout; save v3 migrates both, see src/save.js.)
import { CHARMS, CHAR, CONTRACTS, HIDE, HIDEOUT, ACHIEVEMENTS, CHARM, CONFIG, NOTEBOOK, NODE, LOCKERS, LOCKER, POSTCARDS, LESSONS, MILESTONES, PLACES, SPIRITS, FAMILIES, familyOf } from './data.js';
import { canUnlock, progressOf, stormBest } from './progress.js';

// Stats that keep their best value; every other stat adds up across runs.
const MAX_STATS = new Set(['contract', 'reachDebt', 'patternsOneSpin', 'spinCoins', 'cursesHeld', 'tricksOneSpin', 'wispsOneSpin', 'luckReached', 'familyFull', 'favourBest']);
export const STAMP_STASH = { bronze: 0, silver: 10, gold: 15 };
export const DEVOTION = [{ cost: 30, stat: 'noticed', n: 1 }, { cost: 60, stat: 'friend', n: 3 }, { cost: 100, stat: 'patron', n: 2 }];
export const FIRST_SPIRITS = ['brimble', 'beckon', 'gold'];

export function newMeta() {
  return {
    stash: 0, hideout: ['cot'], achievements: [], chars: ['nim'], contracts: ['c1'], seenCharms: [], endings: [], keepsake: null,
    stats: {}, charWins: [], daily: { date: '', best: null, streak: 0, done: 0 }, iap: { noAds: false, skins: [] },
    settings: { lang: 'en', sfx: 1, music: 1, haptics: true, fast: false, reduceMotion: false, leverOnly: false }, tutorialDone: false,
    // v3
    keys: { brass: 0, silver: 0, red: 0 }, notebook: [], lockers: [], luggage: [null, null, null, null], postcards: [], spirits: [...FIRST_SPIRITS], devotion: {},
    codex: { fusion: [], spirits: {}, redEye: 0 }, stamps: {}, storm: {}, lessons: [], milestones: [], goals: { daily: [], weekly: [], streak: 0, freeze: 0 },
    whiteCalls: 0, charmsOpen: [], skipRelics: false, deed: false, lastLost: false,
  };
}

const achOwned = (meta, unlock) => !unlock || (unlock.startsWith('ach:') && meta.achievements.includes(unlock.slice(4)));

export function isUnlocked(meta, kind, id) {
  switch (kind) {
    case 'charm': return achOwned(meta, CHARM[id]?.unlock) || !!meta.charmsOpen?.includes(id);
    case 'char': return achOwned(meta, CHAR[id]?.unlock) || meta.chars.includes(id);
    case 'contract': return meta.contracts.includes(id);
    case 'hideout': return meta.hideout.includes(id);
    case 'achievement': return meta.achievements.includes(id);
    case 'spirit': return meta.spirits.includes(id);
    case 'postcard': return meta.postcards.includes(id);
  }
  return false;
}

export const availableCharms = (meta) => CHARMS.filter((c) => c.rarity !== 'fused' && isUnlocked(meta, 'charm', c.id)).map((c) => c.id);

const statValue = (meta, stats, key) => (key === 'hideout' ? meta.hideout.length : key === 'charWins' ? meta.charWins.length : key === 'dailyRuns' ? meta.daily.done : stats[key] || 0);

const addKey = (meta, kind, n = 1) => { meta.keys[kind] = (meta.keys[kind] || 0) + n; return { kind, n }; };

// Awards every achievement whose condition now holds. Returns the new ones.
export function checkAchievements(meta, stats = meta.stats) {
  const out = [];
  for (const a of ACHIEVEMENTS) {
    if (meta.achievements.includes(a.id) || statValue(meta, stats, a.cond.stat) < a.cond.gte) continue;
    meta.achievements.push(a.id);
    const st = a.reward.stash ?? a.reward.wax;
    if (st) meta.stash += st;
    if (a.reward.char && !meta.chars.includes(a.reward.char)) meta.chars.push(a.reward.char);
    out.push({ id: a.id, reward: a.reward });
  }
  return out;
}

// Lessons and milestones read the same stats; a lesson pays Stash and sometimes a key.
export function checkLessons(meta) {
  const out = [];
  for (const l of LESSONS) {
    if (meta.lessons.includes(l.id) || !canUnlock(l, meta)) continue;
    meta.lessons.push(l.id);
    if (l.reward?.stash) meta.stash += l.reward.stash;
    const keys = [];
    if (l.reward?.key) keys.push(addKey(meta, l.reward.key));
    if ([3, 6].includes(l.id)) keys.push(addKey(meta, 'brass'));
    if (l.id === 8) keys.push(addKey(meta, 'silver'));
    out.push({ id: l.id, keys });
  }
  return out;
}
export function checkMilestones(meta) {
  const out = [];
  for (const m of MILESTONES) if (!meta.milestones.includes(m.id) && canUnlock(m, meta)) { meta.milestones.push(m.id); out.push(m.id); }
  return out;
}

// ---------- places, spirits, ranks ----------

const placeIdx = (id) => CONTRACTS.findIndex((c) => c.id === id);
// Spirits a place brings: its local ones and the one it unlocks (SPEC 3.1).
export function unlockSpirits(meta, contractId) {
  const out = [];
  for (const d of SPIRITS) {
    if (meta.spirits.includes(d.id)) continue;
    if (d.local?.includes(contractId) || d.unlock?.c === contractId) { meta.spirits.push(d.id); out.push(d.id); }
  }
  return out;
}
// Every spirit open by the time a place is reached (for sims and tests without a meta).
export const spiritsUpTo = (contractId) => SPIRITS.filter((d) => d.unlock?.start || d.local?.some((c) => placeIdx(c) <= placeIdx(contractId)) || (d.unlock?.c && placeIdx(d.unlock.c) <= placeIdx(contractId))).map((d) => d.id);

// The wealth rank is the rank of the furthest place cleared in a row from the first.
export function rankOf(meta) {
  let n = 0;
  while (n < PLACES.length && meta.stamps[PLACES[n].id]?.bronze) n++;
  return { n, place: n ? PLACES[n - 1].id : null, rank: n ? PLACES[n - 1].rank : null };
}
export const stampTotal = (meta) => Object.values(meta.stamps).reduce((n, s) => n + (s.bronze ? 1 : 0) + (s.silver ? 1 : 0) + (s.gold ? 1 : 0), 0);
export const stormOpen = (meta, n) => (n === 1 ? !!meta.stamps.c10?.bronze : stormBest(meta) >= n - 1);

// ---------- the run result ----------

// summary comes from run.summary(run). Returns {stash, wax, newAchievements, unlocks, keys, lessons, spirits, stamps}.
export function applyRunResult(meta, summary) {
  const keys = [], newStamps = [];
  const before = { redCalls: meta.stats.redCalls || 0 };
  for (const [k, v] of Object.entries(summary.stats)) {
    meta.stats[k] = MAX_STATS.has(k) ? Math.max(meta.stats[k] || 0, v) : (meta.stats[k] || 0) + v;
  }
  const st = summary.stats;
  meta.stats.runs = (meta.stats.runs || 0) + 1;
  meta.stats.stagesFriend = (meta.stats.stagesFriend || 0) + (st['stage:5'] || 0);
  if ((st.dealsSigned || 0) >= 1 && (st.dealsRefused || 0) >= 1) meta.stats.signRefuse = (meta.stats.signRefuse || 0) + 1;
  if (meta.lastLost && (st.debtsPaid || 0) >= 1) meta.stats.fallRise = (meta.stats.fallRise || 0) + 1;
  meta.lastLost = !summary.won;
  meta.whiteCalls += summary.whiteCalls || 0;
  for (const id of summary.seen) if (!meta.seenCharms.includes(id)) meta.seenCharms.push(id);
  // codex: spirits met, stage reached, Red Eyes, recipes found; Devotion counts
  const cx = meta.codex;
  cx.redEye += summary.redEyes || 0;
  for (const f of summary.fused || []) if (!cx.fusion.includes(f)) cx.fusion.push(f);
  for (const [id, s] of Object.entries(summary.spirits || {})) {
    const c = (cx.spirits[id] ??= { met: false, best: 0, noticed: 0, friend: 0, patron: 0, wrath: 0 });
    c.met = c.met || s.met;
    c.best = Math.max(c.best, s.stage);
    if (s.stage >= 2) c.noticed++;
    if (s.stage >= 5) c.friend++;
    if (s.stage >= 8) c.patron++;
    if (s.wrath) c.wrath++;
  }
  const newSpirits = unlockSpirits(meta, summary.contract);
  if (summary.whiteCalls && !meta.spirits.includes('waiting')) { meta.spirits.push('waiting'); newSpirits.push('waiting'); }
  const paid3 = Math.min(2, Math.floor((summary.debtsPaid || 0) / 3));
  if (paid3) keys.push(addKey(meta, 'brass', paid3));
  if (summary.won) {
    const place = PLACES.find((p) => p.contract === summary.contract);
    const stamps = (meta.stamps[summary.contract] ??= { bronze: false, silver: false, gold: false });
    const got = { bronze: true, silver: summary.scorches === 0, gold: !summary.deals };
    for (const k of Object.keys(got)) if (got[k] && !stamps[k]) { stamps[k] = true; meta.stash += STAMP_STASH[k]; newStamps.push(k); }
    if (newStamps.includes('bronze')) {
      if (place?.brassKey !== false) keys.push(addKey(meta, 'brass'));
      if (place?.silverKey) keys.push(addKey(meta, 'silver'));
    }
    if (newStamps.includes('gold') && summary.contract === 'c9') keys.push(addKey(meta, 'red'));
    if ((summary.redSpirits?.length || 0) >= 3) keys.push(addKey(meta, 'red'));
    if (summary.storm) {
      const prev = meta.storm[summary.contract] || 0;
      if (summary.storm > prev) { meta.storm[summary.contract] = summary.storm; meta.stash += 30; keys.push(addKey(meta, 'silver')); }
    }
    const i = CONTRACTS.findIndex((c) => c.id === summary.contract);
    const next = CONTRACTS[i + 1];
    if (next && !meta.contracts.includes(next.id)) meta.contracts.push(next.id);
    if (!meta.charWins.includes(summary.char)) meta.charWins.push(summary.char);
    if (summary.ending && !meta.endings.includes(summary.ending)) meta.endings.push(summary.ending);
  }
  if (before.redCalls < 5 && (meta.stats.redCalls || 0) >= 5) keys.push(addKey(meta, 'red'));
  if (summary.noRelic) meta.skipRelics = true; // Heavy Hands: no Left Luggage relic next run
  meta.stash += summary.stash ?? summary.wax;
  const earned = checkAchievements(meta);
  const lessons = checkLessons(meta);
  checkMilestones(meta);
  const unlocks = [];
  for (const a of earned) {
    if (a.reward.char) unlocks.push({ kind: 'char', id: a.reward.char });
    if (a.reward.charm) unlocks.push({ kind: 'charm', id: a.reward.charm });
  }
  const stashGot = (summary.stash ?? summary.wax) + earned.reduce((n, a) => n + (a.reward.stash ?? a.reward.wax ?? 0), 0) + newStamps.reduce((n, k) => n + STAMP_STASH[k], 0) + lessons.reduce((n, l) => n + (LESSONS.find((x) => x.id === l.id)?.reward?.stash || 0), 0);
  return { stash: stashGot, wax: stashGot, newAchievements: earned, unlocks, keys, lessons, spirits: newSpirits, stamps: newStamps };
}

// ---------- hideout (v2) and Notebook (v3): both spend Stash ----------

export function buyHideout(meta, id) {
  const h = HIDE[id];
  if (!h || meta.hideout.includes(id) || meta.stash < h.costWax) return false;
  meta.stash -= h.costWax;
  meta.hideout.push(id);
  checkAchievements(meta);
  return true;
}

// Notebook node: {id, tab, cost, requires, effect}. Buying needs the requirement met and the Stash.
export function buyNode(meta, id) {
  const n = NODE[id];
  if (!n || meta.notebook.includes(id) || !canUnlock(n, meta) || meta.stash < n.cost) return false;
  meta.stash -= n.cost;
  meta.notebook.push(id);
  const e = n.effect || {};
  if (e.packs) for (const p of e.packs) if (!meta.postcards.includes(p)) meta.postcards.push(p);
  if (e.type === 'poolAdd') { // the Pool tab: open n locked charms of a rarity
    const list = CHARMS.filter((c) => c.unlock && c.rarity === e.rarity && !isUnlocked(meta, 'charm', c.id));
    for (const c of list.slice(0, e.n)) meta.charmsOpen.push(c.id);
  }
  checkAchievements(meta);
  return true;
}
export const nodeProgress = (meta, id) => progressOf(NODE[id], meta);

// Devotion (3 tiers per spirit, bought with Stash): tier 1 gives +1 Favour at every run start.
export function buyDevotion(meta, spiritId) {
  const tier = meta.devotion[spiritId] || 0, t = DEVOTION[tier], c = meta.codex.spirits[spiritId];
  if (!t || !c || c[t.stat] < t.n || meta.stash < t.cost) return false;
  meta.stash -= t.cost;
  meta.devotion[spiritId] = tier + 1;
  return true;
}

// What the owned hideout items and Notebook nodes do at a run start. Node effects share the hideout's names, plus
// {type:'flag', flag, v} (a permanent rule flag, listed in `flags`).
export function hideoutEffects(meta) {
  const o = { flags: [] };
  const apply = (e, id) => {
    if (!e || e.type === 'none') return;
    switch (e.type) {
      case 'startTrick': o.startTrick = (o.startTrick || 0) + e.n; break;
      case 'startCharmPick': o.startCharmPick = e.n; break;
      case 'shopOffers': o.shopOffers = e.n; break;
      case 'benchOffers': o.benchOffers = e.n; break;
      case 'foresight': o.foresight = true; o.freeRerolls = e.freeRerolls; break;
      case 'keepCharm': o.keepCharm = true; break;
      case 'startWick': o.startWick = (o.startWick || 0) + e.n; break;
      case 'seededRuns': o.seededRuns = true; break;
      case 'refuseWick': o.refuseWick = e.n; break;
      case 'postcardSlots': o.postcardSlots = (o.postcardSlots || 0) + e.n; break;
      case 'flag': o.flags.push({ flag: e.flag, v: e.v, id }); break;
    }
  };
  for (const id of meta.hideout) apply(HIDE[id]?.effect, id);
  for (const id of meta.notebook || []) apply(NODE[id]?.effect, id);
  return o;
}
export const postcardSlots = (meta) => hideoutEffects(meta).postcardSlots || 0;

// Keepsake Box: keep one common or uncommon charm you have seen for the next run.
export function setKeepsake(meta, id) {
  const c = CHARM[id];
  if (!meta.hideout.includes('keepsake') || !c || !['common', 'uncommon'].includes(c.rarity) || !meta.seenCharms.includes(id)) return false;
  meta.keepsake = id;
  return true;
}

// ---------- keys, lockers, Left Luggage ----------

// Locker contents come as charm ids, or (the first two kinds) as "the Nth locked rare of each family".
export function lockerContents(l) {
  const c = l.contents || {}, out = { charms: [...(c.charms || [])], postcards: [...(c.postcards || [])], deed: !!c.deed };
  const locked = (rarity, fam) => CHARMS.filter((x) => x.unlock && x.rarity === rarity && familyOf(x.id) === fam).map((x) => x.id);
  for (const f of c.charmsRareA || []) out.charms.push(locked('rare', f)[0]);
  for (const f of c.charmsRareB || []) out.charms.push(locked('rare', f)[1]);
  for (const f of c.charmsLegendary || []) out.charms.push(locked('legendary', f)[0]);
  out.charms = out.charms.filter(Boolean);
  return out;
}

export function openLocker(meta, id) {
  const l = LOCKER[id];
  if (!l || meta.lockers.includes(id)) return { ok: false, why: 'open' };
  if ((meta.keys[l.key] || 0) < 1) return { ok: false, why: 'key' };
  if (!canUnlock(l, meta)) return { ok: false, why: 'lock' };
  meta.keys[l.key]--;
  meta.lockers.push(id);
  const c = lockerContents(l);
  for (const ch of c.charms) if (!meta.charmsOpen.includes(ch)) meta.charmsOpen.push(ch);
  for (const p of c.postcards) if (!meta.postcards.includes(p)) meta.postcards.push(p);
  if (c.deed) meta.deed = true;
  checkMilestones(meta);
  return { ok: true, contents: c };
}

// Left Luggage: a run that reached debt 4 may leave one held charm in a locker (or swap). It comes back as a relic next run.
export function leaveLuggage(meta, summary, slot, charmId) {
  if (summary.debtReached < 4 || !(slot >= 0 && slot < 4) || !summary.heldCharms.includes(charmId)) return false;
  meta.luggage[slot] = charmId;
  return true;
}

export const contractUnlocked = (meta, id) => meta.contracts.includes(id);
export const WAX_PER_DEBT = CONFIG.wax.perDebtPaid;
export { HIDEOUT, NOTEBOOK, LOCKERS, POSTCARDS, FAMILIES };
