// Home: wealth rank, Stash, keys, the Lessons strip, the completion ring and every door (Play, Map, Notebook, Lockers, Codex, How to play, Daily, Store, Settings).
// data: { meta }. Handlers: startRun({ charId, contractId, postcards, storm, tutorial }). PLAY repeats the last place and picks; with none yet it opens the map.
import { t, L, LANGS } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { LESSONS } from './content.js';
import { chip } from './cards.js';
import { rankOf } from './map.js';
import { completion } from './codex.js';

// First launch: the story panels, then the guided run (no menu before the first spin). Later: the last setup, or the map.
export function play(meta, ctx) {
  if (!meta.tutorialDone) return ctx.open('title', {});
  if (meta.last) return ctx.call('startRun', meta.last);
  return ctx.open('map', {});
}

export function render(el, { meta }, ctx) {
  const rank = rankOf(meta), stash = meta.stash ?? meta.wax ?? 0, keys = meta.keys ?? {}, done = new Set(meta.lessons ?? []), c = completion(meta);
  const next = LESSONS.filter((l) => !done.has(l.id)).slice(0, 3);
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'home'); }
  const door = (key, screen) => btn(t(key), () => ctx.open(screen, {}));
  put(el,
    // home grows with rank: hideout, shophouse, condo, penthouse
    h('div', { class: 'map-banner' }, art(rank >= 9 ? 'bg/home_4' : rank >= 6 ? 'bg/home_3' : rank >= 3 ? 'bg/home_2' : 'bg/hideout', 'mapimg')),
    h('div', { class: 'home-head' }, h('h1', {}, t('ui.title')), h('p', { class: 'sub' }, t('ui.tagline'))),
    h('div', { class: 'row-between rankrow' },
      h('div', {}, h('span', { class: 'lc-label' }, t('ui.rankLabel')), h('b', { class: 'rank' }, t('ui.rank.' + rank))),
      h('span', { class: 'ring', style: `--p:${c.pct}`, 'aria-label': t('ui.completion', { n: c.pct }) }, h('b', {}, c.pct + '%'))),
    h('div', { class: 'chips' }, chip('ui/wax', t('ui.waxHave', { n: stash })), ['brass', 'silver', 'red'].map((k) => (keys[k] | 0) > 0 && h('span', { class: 'chip key-' + k }, art('ui/key_' + k, 'ico xs'), h('b', {}, `${t('ui.key.' + k)} ${keys[k]}`)))),
    !meta.tutorialDone && h('p', { class: 'note tutorial' }, t('ui.firstRunHint')),
    LESSONS.length > 0 && h('section', { 'data-anchor': 'lessons', class: 'lessons' }, h('div', { class: 'row-between' }, h('h3', {}, t('ui.lessonsTitle')), h('span', { class: 'note' }, t('ui.lessonsDone', { a: done.size, b: LESSONS.length }))),
      next.length ? h('ul', { class: 'ticket' }, next.map((l) => h('li', {}, h('span', {}, h('b', {}, L(l.name)), ' ', L(l.text)), h('b', {}, l.reward?.stash ? '+' + l.reward.stash : '')))) : h('p', { class: 'note' }, t('ui.lessonsAll'))),
    h('div', { class: 'doors' },
      door('ui.map', 'map'), door('ui.notebook', 'notebook'), door('ui.lockers', 'lockers'), door('ui.collection', 'collection'),
      btn(t('ui.daily'), () => ctx.open('daily', {})), btn(t('ui.howto'), () => ctx.open('howto', {})), btn(t('ui.store'), () => ctx.open('store', {})), btn(t('ui.settings'), () => ctx.open('settings', {}))),
    h('div', { class: 'seg', role: 'radiogroup', 'aria-label': t('ui.language') }, LANGS.map((l) =>
      h('button', { type: 'button', class: 'opt' + (ctx.lang() === l ? ' on' : ''), role: 'radio', 'aria-checked': String(ctx.lang() === l), onclick: () => ctx.setSettings({ lang: l }) }, t('ui.lang' + l[0].toUpperCase() + l[1])))),
    ctx.foot(btn(t('ui.play'), () => play(meta, ctx), 'primary big')));
}
