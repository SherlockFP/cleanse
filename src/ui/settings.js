// Settings: language, sound volume, reduced motion, and the rules screen with the tutorial disclosure and fair-play text.
import { t } from '../i18n.js';
import { h, btn, put } from './dom.js';

export function render(el, data, ctx) {
  const s = ctx.settings;
  if (ctx.state.rules) return rules(el, ctx);
  const seg = (on, label, onclick) => h('button', { type: 'button', class: 'opt' + (on ? ' on' : ''), role: 'radio', 'aria-checked': String(on), onclick }, label);
  put(el, 
    h('h2', {}, t('ui.settings')),
    h('section', {}, h('h3', {}, t('ui.language')),
      h('div', { class: 'seg', role: 'radiogroup' }, seg(ctx.lang() === 'en', t('ui.langEn'), () => ctx.setSettings({ lang: 'en' })), seg(ctx.lang() === 'tr', t('ui.langTr'), () => ctx.setSettings({ lang: 'tr' })))),
    h('section', {}, h('label', { class: 'slider' }, h('h3', {}, t('ui.sound')),
      h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(s.volume * 100)), 'aria-label': t('ui.sound'),
        oninput: (e) => ctx.setSettings({ volume: e.target.value / 100 }, false) }))),
    h('section', {}, h('h3', {}, t('ui.reduceMotion')),
      h('div', { class: 'seg', role: 'radiogroup' }, seg(s.reduceMotion, t('ui.on'), () => ctx.setSettings({ reduceMotion: true })), seg(!s.reduceMotion, t('ui.off'), () => ctx.setSettings({ reduceMotion: false })))),
    btn(t('ui.rules'), () => { ctx.state.rules = true; ctx.rerender(); }),
    h('p', { class: 'note' }, t('ui.privacyText')),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')),
  );
}

function rules(el, ctx) {
  const lines = [1, 2, 3, 4, 5, 6, 7].map((n) => h('li', {}, t(`ui.rules${n}`)));
  put(el, 
    h('h2', {}, t('ui.rulesTitle')),
    h('ol', { class: 'rules' }, lines),
    h('p', { class: 'note' }, t('ui.rulesMercy')),
    h('h3', {}, t('ui.shopOdds')),
    h('p', { class: 'note' }, t('ui.rulesOdds')),
    h('p', { class: 'note' }, t('ui.oddsNote')),
    h('p', { class: 'note' }, t('ui.stopNote')),
    h('p', { class: 'note tutorial' }, t('ui.tutorialNote')),
    ctx.foot(btn(t('ui.back'), () => { ctx.state.rules = false; ctx.rerender(); }, 'primary')),
  );
}
