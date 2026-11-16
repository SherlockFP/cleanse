// Settings: language, sound and music volume, vibration, fast spin, reduced motion, and a door to How to play.
import { t, LANGS } from '../i18n.js';
import { h, btn, put } from './dom.js';

export function render(el, data, ctx) {
  const s = ctx.settings;
  const seg = (on, label, onclick) => h('button', { type: 'button', class: 'opt' + (on ? ' on' : ''), role: 'radio', 'aria-checked': String(on), onclick }, label);
  const toggle = (key, title) => h('section', {}, h('h3', {}, title),
    h('div', { class: 'seg', role: 'radiogroup', 'aria-label': title }, seg(!!s[key], t('ui.on'), () => ctx.setSettings({ [key]: true })), seg(!s[key], t('ui.off'), () => ctx.setSettings({ [key]: false }))));
  const slider = (key, title) => h('section', {}, h('label', { class: 'slider' }, h('h3', {}, title),
    h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(s[key] * 100)), 'aria-label': title, oninput: (e) => ctx.setSettings({ [key]: e.target.value / 100 }, false) })));
  put(el,
    h('h2', {}, t('ui.settings')),
    h('section', {}, h('h3', {}, t('ui.language')),
      h('div', { class: 'seg', role: 'radiogroup' }, LANGS.map((l) => seg(ctx.lang() === l, t('ui.lang' + l[0].toUpperCase() + l[1]), () => ctx.setSettings({ lang: l }))))),
    slider('sfx', t('ui.sound')), slider('music', t('ui.music')),
    toggle('haptics', t('ui.haptics')), toggle('fast', t('ui.fast')), toggle('reduceMotion', t('ui.reduceMotion')),
    btn(t('ui.howto'), () => ctx.open('howto', {})),
    h('p', { class: 'note' }, t('ui.privacyText')),
    ctx.foot(btn(t('ui.close'), ctx.close, 'primary')));
}
