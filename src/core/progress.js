// "Show it before it is earned" (PROGRESSION 10): one pure helper that every list screen (Notebook, Lockers, Codex, Map, Home) draws locked items from.
// An item has `requires` (or `cond`, as achievements, lessons and milestones do): null | req | [req, ...] (all) | {all: []} | {any: []}.
// req shapes (the content lane's files use only these):
//   {clear: 'c3' | 3}          a place cleared (bronze stamp)            where: map
//   {lesson: n} {lessons: n}   lesson n done / n lessons done            where: home
//   {stat: key, gte: n}        a lifetime stat reached                   where: run
//   {stamps: n, kind?}         n stamps (kind: bronze | silver | gold)   where: map
//   {lockers: n}               n lockers opened                          where: lockers
//   {storm: n}                 Storm n cleared anywhere                  where: map
//   {node: id}                 a Notebook node bought                    where: notebook
//   {endings: n}               n endings seen                            where: map
//   {ach: id}                  an achievement                            where: codex

const placeId = (c) => (typeof c === 'number' ? 'c' + c : c);
const stampCount = (meta, kind) => Object.values(meta.stamps || {}).reduce((n, s) => n + (kind ? (s[kind] ? 1 : 0) : (s.bronze ? 1 : 0) + (s.silver ? 1 : 0) + (s.gold ? 1 : 0)), 0);
export const stormBest = (meta) => Math.max(0, ...Object.values(meta.storm || {}));

// -> {have, need, where}
function one(req, meta) {
  if ('clear' in req) return { have: meta.stamps?.[placeId(req.clear)]?.bronze ? 1 : 0, need: 1, where: 'map' };
  if ('lesson' in req) return { have: meta.lessons?.includes(req.lesson) ? 1 : 0, need: 1, where: 'home' };
  if ('lessons' in req) return { have: meta.lessons?.length || 0, need: req.lessons, where: 'home' };
  if ('stat' in req) return { have: meta.stats?.[req.stat] || 0, need: req.gte ?? 1, where: 'run' };
  if ('stamps' in req) return { have: stampCount(meta, req.kind), need: req.stamps, where: 'map' };
  if ('lockers' in req) return { have: meta.lockers?.length || 0, need: req.lockers, where: 'lockers' };
  if ('storm' in req) return { have: stormBest(meta), need: req.storm, where: 'map' };
  if ('node' in req) return { have: meta.notebook?.includes(req.node) ? 1 : 0, need: 1, where: 'notebook' };
  if ('endings' in req) return { have: meta.endings?.length || 0, need: req.endings, where: 'map' };
  if ('ach' in req) return { have: meta.achievements?.includes(req.ach) ? 1 : 0, need: 1, where: 'codex' };
  throw new Error('unknown requirement ' + JSON.stringify(req));
}

const reqsOf = (item) => {
  const r = item.requires ?? item.cond ?? null;
  if (!r || r.none) return [];
  return Array.isArray(r) ? r : r.all ? r.all : [r];
};

export function progressOf(item, meta) {
  const r = item.requires ?? item.cond ?? null;
  if (r && r.any) {
    const ps = r.any.map((x) => one(x, meta));
    return ps.find((p) => p.have >= p.need) || ps[0];
  }
  const ps = reqsOf(item).map((x) => one(x, meta));
  return ps.find((p) => p.have < p.need) || ps.at(-1) || { have: 1, need: 1, where: 'home' };
}

export function canUnlock(item, meta) {
  const r = item.requires ?? item.cond ?? null;
  if (r && r.any) return r.any.some((x) => { const p = one(x, meta); return p.have >= p.need; });
  return reqsOf(item).every((x) => { const p = one(x, meta); return p.have >= p.need; });
}
