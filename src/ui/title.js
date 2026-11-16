// First launch: the title, then three story panels (the cart burns, Mr. Ruby lends the money, the flame goes in a jar). A tap anywhere goes on; each panel is a tutorial step.
// data: { replay? }. Handlers: storyDone() starts the run, tutEvent('tap'). A replay from Settings can be skipped; the very first launch cannot.
import { t } from '../i18n.js';
import { h, btn, put, art } from './dom.js';

const PANELS = ['story/p1', 'story/p2', 'story/p3'];

export function render(el, { replay }, ctx) {
  const i = ctx.state.i ?? -1; // -1 is the title card
  const next = () => {
    if (i >= 0) ctx.h.tutEvent?.('tap');
    if (i + 1 >= PANELS.length) return ctx.call('storyDone');
    ctx.state.i = i + 1; ctx.rerender();
    return undefined;
  };
  put(el,
    h('div', { class: 'story-panel', role: 'button', tabindex: '0', 'data-anchor': i >= 0 ? 'story/p' + (i + 1) : 'title', onclick: next, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') next(); } },
      i < 0 ? [h('h1', {}, t('ui.title')), art('devil/idle', 'devil big'), h('p', { class: 'sub' }, t('ui.tagline'))]
        : [art(PANELS[i], 'storyimg'), h('p', { class: 'story' }, t('tut.p' + (i + 1)))],
      h('p', { class: 'note tapgo' }, t('ui.tapGo'))),
    ctx.foot(replay && btn(t('ui.skip'), () => ctx.call('storyDone'), 'ghost')));
}
