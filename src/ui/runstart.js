// New run (from run 2; run 1 starts on the pier): free start trinket -> tide chart, once charts are open -> Start. A long press on a trinket opens its full rule.
// data: { trinkets?: ids, charts?: ids, seed? }. Handler: startRun({ trinket, chart }) with chart null for no chart.
import { t } from '../i18n.js';
import { h, btn, put, art, hold } from './dom.js';
import { TRINKETS } from '../core/data/trinkets.js';
import { CHARTS } from '../core/data/charts.js';

const TR = new Map(TRINKETS.map((x) => [x.id, x]));

// Default offer: the first three cheap start trinkets. The caller should pass a seeded pick when it has one.
const defaultTrinkets = () => TRINKETS.filter((x) => x.grade === 1 && x.unlock === 'start').slice(0, 3).map((x) => x.id);

export function render(el, data, ctx) {
  const st = ctx.state;
  const trinkets = (data.trinkets ?? defaultTrinkets()).map((id) => TR.get(id)).filter(Boolean);
  st.trinket ??= trinkets[0]?.id ?? null; st.chart ??= null; // preselected: Start works on the first tap
  const charts = (data.charts ?? CHARTS.map((c) => c.id)).map((id) => CHARTS.find((c) => c.id === id)).filter(Boolean);
  const pick = (key, val) => () => { st[key] = val; ctx.rerender(); };
  const opt = (on, onclick, title, text, icon) => h('button', { type: 'button', class: 'opt' + (on ? ' on' : ''), role: 'radio', 'aria-checked': String(on), onclick },
    icon && art(icon, 'ico'), h('strong', {}, title), text && h('span', {}, text));
  if (!st.said) { st.said = true; ctx.say('deni', 'run_start'); }
  const shut = () => { st.sheet = null; ctx.rerender(); };
  const x = TR.get(st.sheet);
  const sheet = x && h('div', { class: 'scrim', onclick: (e) => { if (e.target === e.currentTarget) shut(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-label': t(x.nameKey) },
      h('button', { type: 'button', class: 'btn x', 'aria-label': t('ui.close'), onclick: shut }, '\u00d7'),
      art(`trinket/${x.id}`, 'ico big'), h('span', { class: 'tag' }, t('ui.grade', { n: x.grade })), h('h3', {}, t(x.nameKey)), h('p', {}, t(x.descKey))));
  put(el, 
    h('div', { class: 'head' },
      h('h2', {}, t('ui.runStart')),
      art('deni/idle', 'deni')),
    h('section', {},
      h('h3', {}, t('ui.pickTrinket')),
      h('div', { class: 'opts', role: 'radiogroup' }, trinkets.map((x) => hold(opt(st.trinket === x.id, pick('trinket', x.id), t(x.nameKey), t(x.shortKey), `trinket/${x.id}`), () => { st.sheet = x.id; ctx.rerender(); })))),
    charts.length > 0 && h('section', {}, // no charts open yet: no empty choice
      h('h3', {}, t('ui.pickChart')),
      h('div', { class: 'opts', role: 'radiogroup' },
        opt(st.chart === null, pick('chart', null), t('ui.chartNone')),
        charts.map((c) => opt(st.chart === c.id, pick('chart', c.id), t(c.nameKey), t(c.descKey))))),
    ctx.foot(btn(t('ui.start'), () => {
      if (!st.trinket) { ctx.toast('ui.pickTrinket'); return; }
      ctx.close();
      ctx.h.startRun({ trinket: st.trinket, chart: st.chart });
    }, 'primary big' + (st.trinket ? '' : ' dim'))),
    ctx.over(sheet),
  );
}
