// Locked items are always visible (PROGRESSION 10): a silhouette (or the name, greyed), the requirement as a plain sentence, a progress bar when it counts something,
// and the screen where it is earned. One helper for the Codex, the Notebook, the Lockers, the Map and the Home.
// Handler: progressOf(item) -> { have, need, where, text? } (core/progress.js); without it the item's own requirement text is shown without a bar.
import { t, L } from '../i18n.js';
import { h, art } from './dom.js';
import { unlockHow } from './charselect.js';
import { PLACE, CONTRACT, LESSONS, PATTERNS, SYM, NODE, ACH } from './content.js';

// One requirement of the core's progress.js ({ clear | lesson | lessons | stat+gte | stamps | lockers | storm | node | endings | ach }) as a plain sentence.
const has = (k) => t(k) !== k;
function reqOne(r) {
  if ('clear' in r) { const id = typeof r.clear === 'number' ? 'c' + r.clear : r.clear; return t('ui.req.clear', { name: L(PLACE[id]?.name) || L(CONTRACT[id]?.name) }); }
  if ('lesson' in r) return t('ui.req.lesson', { n: r.lesson, name: L(LESSONS.find((l) => l.id === r.lesson)?.name) });
  if ('lessons' in r) return t('ui.req.lessons', { n: r.lessons });
  if ('stat' in r) {
    const n = r.gte ?? 1;
    if (r.stat.startsWith('pattern:')) return t('ui.req.pattern', { name: L(PATTERNS.find((p) => p.id === r.stat.slice(8))?.name), n });
    return has('ui.stat.' + r.stat) ? t('ui.stat.' + r.stat, { n, sym: L(SYM.wisp?.name) }) : t('ui.reqUnknown');
  }
  if ('stamps' in r) return t('ui.req.stamps', { n: r.stamps, kind: r.kind ? t('ui.stamp.' + r.kind) : '' }).trim();
  if ('lockers' in r) return t('ui.req.lockers', { n: r.lockers });
  if ('storm' in r) return t('ui.req.storm', { n: r.storm });
  if ('node' in r) return t('ui.req.node', { name: L(NODE[r.node]?.name) });
  if ('endings' in r) return t('ui.req.endings', { n: r.endings });
  if ('ach' in r) return t('ui.req.ach', { name: L(ACH[r.ach]?.name) });
  return t('ui.reqUnknown');
}
const reqList = (r) => (!r || r.none ? [] : Array.isArray(r) ? r : r.all ?? r.any ?? [r]);

// The requirement sentence of any data item. Data lanes may give needsText, reqText or unlockText; the core's items carry requires / cond; v2 charms an "ach:id" unlock.
export function reqText(item, prog) {
  if (prog?.text) return L(prog.text);
  for (const k of ['needsText', 'reqText', 'unlockText']) if (item?.[k]) return L(item[k]);
  const r = item?.requires ?? item?.cond;
  if (r && !r.none) return reqList(r).map(reqOne).join(r.any ? ' / ' : ' + ');
  if (typeof item?.unlock === 'string') return unlockHow(item.unlock);
  return t('ui.reqUnknown');
}

export function progressOf(ctx, item) {
  const p = ctx.h?.progressOf?.(item);
  return p ?? { have: 0, need: 0, where: item?.where ?? null };
}

// opts: { item, icon, title (shown when the name is not secret), secret (silhouette and ???), how (the sentence, when the item carries none), cls, extra }
export function lockedCard(ctx, { item, icon, title, secret = false, how, cls = '', extra }) {
  const p = progressOf(ctx, item), pct = p.need > 1 ? Math.min(100, Math.round((p.have / p.need) * 100)) : 0;
  return h('article', { class: 'card unseen locked ' + cls },
    h('span', { class: 'pic' + (secret ? ' sil' : '') }, art(icon ?? 'ui/lock', 'ico lg'), !secret && art('ui/lock', 'ico xs lockmark')),
    h('div', { class: 'card-text' }, h('strong', {}, secret ? '???' : title),
      h('span', { class: 'note' }, t('ui.lockedBy', { how: how && !p.text ? how : reqText(item, p) })),
      p.need > 1 && h('span', { class: 'meter sm', role: 'progressbar', 'aria-valuenow': String(p.have), 'aria-valuemax': String(p.need) }, h('i', { style: `width:${pct}%` }), h('span', {}, `${p.have} / ${p.need}`)),
      p.where && h('span', { class: 'tag' }, t('ui.whereTag', { where: t('ui.where.' + p.where) })), extra));
}
