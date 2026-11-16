// The Codex: everything in the game, listed from the first day. Seven tabs: Charms, Tricks, Symbols (with the Red Eye page), Deals and curses, Spirits (10 pages each),
// People and places (characters, places, endings, achievements), Fusion (all recipes; unfound ones read "Wok + Monsoon = ?"). Unfound entries are silhouettes with how to get them.
// data: { meta }. Found = meta.seenCharms, meta.chars, meta.stamps, meta.endings, meta.achievements; tricks, symbols, shapes, deals and curses count as found once a run was played;
// spirits: meta.codex.spirits[id] = { met, best, noticed, friend, patron, wrath } (pages 1, 5, 6, 7, 8 follow from it); recipes: meta.codex.fusion; meta.codex[kind][id] = 'mastered' gives a gold frame.
import { t, L, fmt } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { CHARMS, CHARM, TRICKS, SYMBOLS, PATTERNS, DEALS, CURSES, CHARS, CONTRACTS, ACHS, SPIRITS, FUSION, FAMILY, CONTRACT } from './content.js';
import { itemCard, pic, portrait } from './cards.js';
import { lockedCard } from './locked.js';

export const TABS = ['charms', 'tricks', 'symbols', 'deals', 'spirits', 'places', 'fusion'];
const PAGES = 10;
const ENDING_IDS = ['paid_in_full', 'bought_the_machine', 'new_management', 'the_refuser', 'left_luggage'];
const PLAYED = new Set(['trick', 'symbol', 'pattern', 'deal', 'curse']); // nothing records these one by one: a played run has shown them all
export const seenState = (meta, kind, id) => (typeof meta.codex?.[kind]?.[id] === 'string' ? meta.codex[kind][id] : kind === 'charm' && (meta.seenCharms ?? []).includes(id) ? 'seen'
  : PLAYED.has(kind) && (meta.stats?.runs | 0) > 0 ? 'seen' : kind === 'ach' && (meta.achievements ?? []).includes(id) ? 'owned' : kind === 'ending' && (meta.endings ?? []).includes(id) ? 'seen'
  : kind === 'char' && (meta.chars ?? []).includes(id) ? 'seen' : kind === 'place' && meta.stamps?.[id]?.bronze ? 'owned' : null);
// The 10 pages of a spirit that the core's counters can open (1 met, 5 knows you, 6 regular, 7 fan, 8 cross); the rest open as the core starts counting them.
export const pagesOf = (meta, id) => { const c = meta.codex?.spirits?.[id] ?? {}; return new Set([...(Array.isArray(c.pages) ? c.pages : []), ...(c.met ? [1] : []), ...(c.noticed > 0 ? [5] : []), ...(c.friend > 0 ? [6] : []), ...(c.patron > 0 ? [7] : []), ...(c.wrath > 0 ? [8] : [])]); };

// Home shows one number: found entries over all entries.
export function completion(meta) {
  const kinds = [['charm', CHARMS], ['trick', TRICKS], ['symbol', SYMBOLS], ['pattern', PATTERNS], ['deal', DEALS], ['curse', CURSES], ['char', CHARS], ['place', CONTRACTS], ['ach', ACHS]];
  let have = 0, total = 0;
  for (const [k, list] of kinds) for (const x of list) { total++; if (seenState(meta, k, x.id)) have++; }
  total += SPIRITS.length * PAGES + FUSION.length;
  for (const s of SPIRITS) have += pagesOf(meta, s.id).size;
  have += (meta.codex?.fusion ?? []).length;
  return { have, total, pct: total ? Math.round((have / total) * 100) : 0 };
}

export function render(el, { meta }, ctx) {
  const tab = ctx.state.tab ?? 'charms', st = (k, id) => seenState(meta, k, id);
  const how = (item, fallback) => (item.unlock ? undefined : fallback);
  // one list: found entries as full cards (gold frame when mastered), the rest as silhouettes that say how to get them
  const list = (kind, items, full, fallbackHow, icon = (x) => x.icon) => [
    h('p', { class: 'note' }, t('ui.seenCount', { a: items.filter((x) => st(kind, x.id)).length, b: items.length })),
    h('div', { class: 'cards' }, items.map((x) => st(kind, x.id)
      ? h('div', { class: 'wrapc' + (st(kind, x.id) === 'mastered' ? ' mastered' : '') }, full(x))
      : lockedCard(ctx, { item: x, icon: icon(x), secret: true, how: how(x, fallbackHow) })))];

  const charms = list('charm', CHARMS, (c) => itemCard('charm', c, { S: 1 }), t('ui.howStall'));
  const tricks = list('trick', TRICKS, (c) => itemCard('trick', c, { S: 1 }), t('ui.howStall'));
  const symbols = [
    h('section', { class: 'redeye-page' }, h('div', { class: 'row-between' }, h('h3', {}, t('ui.redEyePage')), art('sym/redeye', 'ico lg')), h('p', { class: 'fx' }, t('ui.redEyeText')),
      h('ul', { class: 'ticket' }, [1, 2, 3].map((n) => h('li', {}, h('span', {}, t('ui.redEyeLevel', { n })), h('b', {}, t('ui.redEyeL' + n)))))),
    list('symbol', SYMBOLS, (s) => h('article', { class: 'card sym' }, h('span', { class: 'pic' }, art(s.icon, 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(s.name)), s.text && h('span', { class: 'fx' }, L(s.text)))), t('ui.howSpin')),
    list('pattern', PATTERNS, (p) => h('article', { class: 'card pat' }, h('span', { class: 'mini' }, Array.from({ length: 15 }, (_, i) => h('i', { class: p.cells[0].includes(i) ? 'on' : '' }))), h('div', { class: 'card-text' }, h('strong', {}, L(p.name)), h('span', { class: 'tag good' }, t('ui.patMult', { n: fmt(p.mult) })))), t('ui.howSpin'), () => 'ui/star')];
  const deals = [list('deal', DEALS, (d) => itemCard('trick', { ...d, when: null }, { S: 1 }), t('ui.howPhone')), h('h3', {}, t('ui.tabCurses')), list('curse', CURSES, (c) => itemCard('curse', c, { S: 1 }), t('ui.howPhone'))];
  const spirits = h('div', { class: 'cards' }, SPIRITS.map((s) => {
    const met = (meta.spirits ?? []).includes(s.id) || s.unlock?.start, pages = pagesOf(meta, s.id), place = CONTRACT[s.local?.[0]];
    return h('article', { class: 'card spiritc' + (met ? '' : ' unseen') }, met ? portrait(s, 0, 'devil') : art(s.portrait?.calm ?? 'ui/lock', 'devil sil'),
      h('div', { class: 'card-text' }, h('strong', {}, met ? L(s.name) : '???'), met ? h('span', { class: 'note' }, L(s.hint)) : h('span', { class: 'note' }, t('ui.lockedBy', { how: t('ui.spUnlock', { place: L(place?.name) || '?' }) })),
        h('span', { class: 'tags' }, Array.from({ length: PAGES }, (_, i) => h('span', { class: 'tag' + (pages.has(i + 1) ? ' good' : ' dim'), title: t('ui.page.' + (i + 1)) }, String(i + 1)))),
        h('span', { class: 'note' }, t('ui.pagesN', { a: pages.size, b: PAGES }))));
  }));
  const places = [
    h('h3', {}, t('ui.tabPeople')), list('char', CHARS, (c) => h('article', { class: 'card' }, h('span', { class: 'pic' }, art(c.icon, 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(c.name)), h('span', { class: 'fx' }, L(c.text)))), t('ui.howMap')),
    h('h3', {}, t('ui.tabPlaces')), list('place', CONTRACTS, (c) => h('article', { class: 'card' }, h('span', { class: 'tier' }, String(c.tier)), h('div', { class: 'card-text' }, h('strong', {}, L(c.name)), h('span', { class: 'fx' }, L(c.text)))), t('ui.howMap'), () => 'ui/lock'),
    h('h3', {}, t('ui.tabEndings')), h('div', { class: 'cards' }, ENDING_IDS.map((id) => ({ id })).map((e) => st('ending', e.id)
      ? h('button', { type: 'button', class: 'card pick', onclick: () => ctx.open('ending', { ending: e.id }) }, h('span', { class: 'pic' }, art('ui/seal', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, t('ui.ending.' + e.id))))
      : lockedCard(ctx, { item: e, icon: 'ui/seal', secret: true, how: t('ui.endHow.' + e.id) }))),
    h('h3', {}, t('ui.tabAch')), list('ach', ACHS, (a) => h('article', { class: 'card ach done' }, h('span', { class: 'pic' }, art('ui/medal', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, L(a.name)), h('span', { class: 'fx' }, L(a.text)))), t('ui.howRun'), () => 'ui/lock')];
  const found = new Set(meta.codex?.fusion ?? []);
  const fusion = [h('p', { class: 'note' }, t('ui.fusionNote', { a: found.size, b: FUSION.length })), h('div', { class: 'cards' }, FUSION.map((r) => {
    const fa = L(FAMILY[r.a]?.name) || r.a, fb = L(FAMILY[r.b]?.name) || r.b, out = CHARM[r.out];
    return found.has(r.out) && out ? h('article', { class: 'card charm fused' }, pic(out.icon, 'legendary'), h('div', { class: 'card-text' }, h('strong', {}, L(out.name)), h('span', { class: 'tag' }, `${fa} + ${fb}`), h('span', { class: 'fx' }, L(out.text))))
      : h('article', { class: 'card unseen' }, h('span', { class: 'pic sil' }, art(out?.icon ?? 'ui/fused_rim', 'ico lg')), h('div', { class: 'card-text' }, h('strong', {}, `${fa} + ${fb} = ?`), h('span', { class: 'note' }, t('ui.fusionHow'))));
  }))];
  const body = { charms, tricks, symbols, deals, spirits, places, fusion }[tab];
  const c = completion(meta);
  put(el,
    h('div', { class: 'row-between' }, h('h2', {}, t('ui.collTitle')), h('span', { class: 'ring', style: `--p:${c.pct}`, 'aria-label': t('ui.completion', { n: c.pct }) }, h('b', {}, c.pct + '%'))),
    h('div', { class: 'seg', role: 'tablist' }, TABS.map((id) => h('button', { type: 'button', class: 'opt' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === id), onclick: () => { ctx.state.tab = id; ctx.rerender(); } }, t('ui.cdxTab.' + id)))),
    body, ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
