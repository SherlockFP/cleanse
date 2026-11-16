// Home: the boathouse, Planks, the next build (teal when affordable), Play as the one red button, Daily Tide, Ledger, Album, Store, Settings.
// data: { save, today }. Handlers: play(), daily(), build(id) -> { ok, reason, cost }.
// There is one finished boathouse painting and no overlay art, so progress is shown honestly: the whole house starts as a pencil
// silhouette on cream paper and each build paints its own part of the picture (7 steps: 0 to 6 builds).
import { t, plural } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { pickLine } from './speech.js';
import { BUILDS, INSTALLMENTS_LITE } from '../core/data/unlocks.js';
import { nextBuild, canBuild, hasFeature, modes, albumProgress } from '../core/meta.js';

const IMG = './img/home/boathouse_full.png';
// Painted parts per build, as polygons in percent of the picture. Together the six cover the whole picture exactly once.
const ZONES = {
  roof: [[[0, 25], [25, 25], [25, 14], [34, 14], [34, 20], [52, 15.5], [52, 0], [81, 0], [81, 19], [62, 19], [62, 33], [46, 33], [46, 41], [0, 41]]],
  stove: [[[0, 0], [34, 0], [34, 14], [25, 14], [25, 25], [0, 25]], [[0, 41], [36, 41], [36, 62], [0, 62]]], // chimney and smoke, the lit left window
  cat_basket: [[[0, 62], [36, 62], [36, 68], [43, 68], [43, 77], [55, 77], [55, 100], [0, 100]]],
  radio: [[[34, 0], [52, 0], [52, 15.5], [34, 20]], [[36, 41], [52, 41], [52, 77], [43, 77], [43, 68], [36, 68]]], // aerial, the door and bell
  tea_corner: [[[62, 19], [81, 19], [81, 33], [62, 33]], [[46, 33], [81, 33], [81, 40], [72, 40], [72, 56], [92.5, 56], [92.5, 100], [55, 100], [55, 77], [52, 77], [52, 41], [46, 41]]],
  lamp_post: [[[81, 0], [100, 0], [100, 100], [92.5, 100], [92.5, 56], [72, 56], [72, 40], [81, 40]]],
};
const clip = (pts) => `clip-path:polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(',')})`;
const mid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

// builds: ids built so far. fresh: the id built a moment ago (its part is knocked in with three hammer blows).
export function boathouse(builds, fresh = null) {
  const done = BUILDS.filter((b) => builds.includes(b.id));
  const img = (cls, style) => h('img', { class: cls, src: IMG, alt: '', draggable: 'false', style });
  const knock = fresh && ZONES[fresh] ? mid(ZONES[fresh][ZONES[fresh].length - 1]) : null;
  return h('div', { class: 'bh' + (fresh ? ' knock' : ''), role: 'img', 'aria-label': t('ui.boathouseStage', { n: done.length, m: BUILDS.length }) },
    h('div', { class: 'bh-sil' }, h('i', { style: `-webkit-mask-image:url(${IMG});mask-image:url(${IMG})` })), // the outline is drawn on the wrapper, outside the mask
    img('bh-pencil'),
    done.length === BUILDS.length && !fresh
      ? img('bh-paint') // finished: one whole picture, no seams
      : done.flatMap((b) => ZONES[b.id].map((z) => img('bh-paint' + (b.id === fresh ? ' fresh' : ''), clip(z)))),
    knock && h('img', { class: 'bh-hammer', src: './img/fx/plank.png', alt: '', style: `left:${knock[0]}%;top:${knock[1]}%` }));
}

const NAME = { deni: 'ui.deni', orhan: 'ui.orhan', sevgi: 'ui.sevgi', tekir: 'ui.tekir' };

export function render(el, { save, today }, ctx) {
  const st = ctx.state, nb = nextBuild(save), m = modes(save), d = save.daily ?? {};
  if (!st.lines || st.lang !== ctx.lang()) {
    // Deni always speaks; the second voice is Orhan or a neighbor who has moved in (their build is done)
    const others = ['orhan', hasFeature(save, 'tekir') && 'tekir', hasFeature(save, 'sevgi') && 'sevgi'].filter(Boolean);
    const who = others[Math.floor(Math.random() * others.length)];
    st.lang = ctx.lang();
    const stage = save.builds.length === 0 ? 'home0' : nb ? 'home' : 'home6'; // Deni talks about the house as it is now
    st.lines = [['deni', pickLine('deni', stage)], [who, pickLine(who, 'home')]];
  }
  const doBuild = () => {
    const r = ctx.h.build(nb.id);
    if (!r.ok) { ctx.toast('ui.needPlanks', { n: r.cost - save.planks }); return; }
    st.fresh = nb.id; st.lines[0] = ['deni', pickLine('deni', 'build_done')];
    setTimeout(() => { st.fresh = null; }, 1300); // a later repaint does not hammer again
    ctx.rerender();
  };
  const ok = !!nb && canBuild(save, nb.id).ok;
  const tile = (label, sub, onclick, icon, cls = '') => h('button', { type: 'button', class: 'tile ' + cls, onclick }, icon && art(icon, 'ico sm'), h('strong', {}, label), sub && h('span', {}, sub));
  // a mode that is not open yet still shows, with what opens it
  const locked = (label, why, icon) => tile(label, t(why), () => ctx.toast(why), icon, 'locked');
  const dailyDone = d.played === today && d.retry !== today;
  const streak = d.streak > 0 ? plural(d.streak, 'ui.streak') : '';
  put(el,
    h('div', { class: 'home-head' },
      h('h2', {}, t('ui.title')),
      h('span', { class: 'planks', 'aria-label': `${t('ui.planks')}: ${save.planks}` }, art('fx/plank', 'ico sm'), String(save.planks))),
    boathouse(save.builds, st.fresh),
    h('div', { class: 'home-lines' }, st.lines.filter((l) => l[1]).map(([who, text]) => h('p', { class: `bubble ${who}` }, h('b', {}, t(NAME[who])), text))),
    nb
      ? h('div', { class: 'card build' },
        h('div', { class: 'card-text' }, h('strong', {}, t('ui.nextBuild', { name: t(nb.nameKey) })), h('span', { class: 'fx' }, t(nb.descKey))),
        h('button', { type: 'button', class: 'btn buy build ' + (ok ? 'ok' : 'dim'), 'aria-label': `${t('ui.build')}: ${t('ui.buildCost', { n: nb.cost })}`, onclick: doBuild }, t('ui.build'), art('fx/plank', 'ico coin'), String(nb.cost)))
      : h('div', { class: 'card build' }, // nothing left to build: the next goal is Orhan's ledger
        h('div', { class: 'card-text' }, h('strong', {}, t('ui.homeAllBuilt')),
          h('span', { class: 'fx' }, save.paid >= INSTALLMENTS_LITE ? t('ui.ledgerDone') : t('ui.homeNextPage', { n: save.paid + 1, m: INSTALLMENTS_LITE }))),
        btn(t('ui.ledger'), () => ctx.open('ledger', { save }), 'buy')),
    h('div', { class: 'tiles' },
      !m.daily ? locked(t('ui.daily'), 'ui.dailyLock', 'fx/lantern_off') : tile(t('ui.daily'), dailyDone ? t('ui.dailyDone') : streak,
        () => (dailyDone ? ctx.open('daily', { save, today }) : ctx.h.daily()), 'fx/lantern_on'),
      tile(t('ui.ledger'), t('ui.installmentOf', { n: Math.min(save.paid + 1, INSTALLMENTS_LITE), m: INSTALLMENTS_LITE }), () => ctx.open('ledger', { save }), 'fx/coin'),
      !hasFeature(save, 'album') ? locked(t('ui.album'), 'ui.albumLock', 'trinket/sea_chest') : tile(t('ui.album'), t('ui.albumDone', { n: albumProgress(save).percent }), () => ctx.open('album', { save }), 'trinket/sea_chest'),
      tile(t('ui.store'), '', () => ctx.open('store', {}), 'fx/jar')),
    ctx.foot(
      h('button', { type: 'button', class: 'icon', 'aria-label': t('ui.settings'), title: t('ui.settings'), onclick: () => ctx.open('settings', {}) }, art('reel/crank', 'ico')),
      btn(t('ui.play'), () => { ctx.close(); ctx.h.play(); }, 'big primary')),
  );
}
