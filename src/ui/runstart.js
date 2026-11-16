// New run: (first boot: language) -> free start trinket -> tide chart -> Start.
// data: { firstBoot?, trinkets?: ids, charts?: ids, seed? }. Handler: startRun({ trinket, chart }) with chart null for no chart.
import { t } from '../i18n.js';
import { h, btn, put } from './dom.js';
import { TRINKETS } from '../core/data/trinkets.js';
import { CHARTS } from '../core/data/charts.js';

const TR = new Map(TRINKETS.map((x) => [x.id, x]));

// Default offer: the first three cheap start trinkets. The caller should pass a seeded pick when it has one.
const defaultTrinkets = () => TRINKETS.filter((x) => x.grade === 1 && x.unlock === 'start').slice(0, 3).map((x) => x.id);

export function render(el, data, ctx) {
  const st = ctx.state;
  st.trinket ??= null; st.chart ??= null;
  const trinkets = (data.trinkets ?? defaultTrinkets()).map((id) => TR.get(id)).filter(Boolean);
  const charts = (data.charts ?? CHARTS.map((c) => c.id)).map((id) => CHARTS.find((c) => c.id === id)).filter(Boolean);
  const pick = (key, val) => () => { st[key] = val; ctx.rerender(); };
  const opt = (on, onclick, title, text) => h('button', { type: 'button', class: 'opt' + (on ? ' on' : ''), role: 'radio', 'aria-checked': String(on), onclick },
    h('strong', {}, title), text && h('span', {}, text));
  if (!st.said) { st.said = true; ctx.say('deni', 'run_start'); }
  put(el, 
    h('h2', {}, t('ui.runStart')),
    data.firstBoot && h('section', {},
      h('h3', {}, t('ui.firstBoot')),
      h('div', { class: 'seg' }, ['en', 'tr'].map((l) => h('button', { type: 'button', class: 'opt' + (ctx.settings.lang === l || (!ctx.settings.lang && l === ctx.lang()) ? ' on' : ''), onclick: () => ctx.setSettings({ lang: l }) }, l === 'en' ? t('ui.langEn') : t('ui.langTr'))))),
    h('section', {},
      h('h3', {}, t('ui.pickTrinket')),
      h('div', { class: 'opts', role: 'radiogroup' }, trinkets.map((x) => opt(st.trinket === x.id, pick('trinket', x.id), t(x.nameKey), t(x.shortKey))))),
    h('section', {},
      h('h3', {}, t('ui.pickChart')),
      h('div', { class: 'opts', role: 'radiogroup' },
        opt(st.chart === null, pick('chart', null), t('ui.chartNone')),
        charts.map((c) => opt(st.chart === c.id, pick('chart', c.id), t(c.nameKey), t(c.descKey))))),
    btn(t('ui.start'), () => {
      if (!st.trinket) { ctx.toast('ui.pickTrinket'); return; }
      ctx.close();
      ctx.h.startRun({ trinket: st.trinket, chart: st.chart });
    }, 'primary' + (st.trinket ? '' : ' dim')),
  );
}
