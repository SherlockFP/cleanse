// Age gate, first boot (STORE.md section 2: the reel is rated 18+ and the web demo needs an age confirmation tap).
// data: { minor? }. Handler: age(isAdult). A "younger" answer is stored and the game stays closed.
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';

export function render(el, { minor }, ctx) {
  const st = ctx.state;
  st.minor ??= !!minor;
  put(el,
    h('div', { class: 'head' },
      h('h2', {}, t('ui.title')),
      // the language switch is here because this is the first screen a new player reads
      h('div', { class: 'seg', role: 'radiogroup', 'aria-label': t('ui.firstBoot') },
        ['en', 'tr'].map((l) => h('button', { type: 'button', class: 'opt' + (l === ctx.lang() ? ' on' : ''), role: 'radio', 'aria-checked': String(l === ctx.lang()), 'aria-label': l === 'en' ? t('ui.langEn') : t('ui.langTr'), onclick: () => ctx.setSettings({ lang: l }) }, l.toUpperCase())))),
    art('home/boathouse_full', 'hero'),
    h('div', { class: 'stamp' }, '18+'),
    st.minor ? h('p', { class: 'letter' }, t('consent.minorText')) : [h('h3', {}, t('consent.ageTitle')), h('p', {}, t('consent.ageText'))],
    !st.minor && ctx.foot(
      btn(t('consent.ageNo'), () => { st.minor = true; ctx.h.age(false); ctx.rerender(); }),
      btn(t('consent.ageYes'), () => ctx.h.age(true), 'primary')),
  );
}
