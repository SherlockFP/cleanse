// Devil deal screen: Brimble's offers (2, 3 with Fine Print or Pip), each a boon and a named curse side by side. SIGN one or REFUSE both.
// Opened from the phone (Mr. Ruby's red card, run.callOffer is set): no REFUSE here (hang up on the call is the refusal) and Back returns to the call.
// data: { run, offers: deal[] | id[] }. Handlers: signDeal(id), dealBack(). Handlers: signDeal(id), refuseDeals(). derive(run).mustSign hides REFUSE; derive(run).refuseWick overrides the Wick for refusing.
import { t, L, coinText } from '../i18n.js';
import { h, btn, put, art } from './dom.js';
import { DEAL, CURSE, CONFIG } from './content.js';
import { model } from './model.js';

// The data text is "<boon>. Curse: <name>." in each language: the boon is what comes before the curse marker.
const boonOf = (text) => text.split(/\s*(?:Curse|Lanet|คำสาป):/)[0].trim();

export function render(el, { run, offers }, ctx) {
  const fromCall = !!run.callOffer;
  const dv = ctx.derive(run), m = model(run, dv), S = m.scale;
  if (!ctx.state.said) { ctx.state.said = true; ctx.say('brimble', 'deal'); }
  const refuseWick = dv.refuseWick ?? CONFIG.deals.refuseWick;
  const cards = (offers ?? []).map((o) => {
    const d = DEAL[o.id ?? o];
    if (!d) return null;
    const c = CURSE[d.curse];
    const curseBox = c
      ? [h('strong', {}, L(c.name)), h('span', { class: 'fx' }, coinText(c.text, S))]
      : [h('strong', {}, d.curseCount > 1 ? t('ui.randomCurses', { n: d.curseCount }) : t('ui.randomCurse'))];
    return h('article', { class: 'deal-card' },
      h('div', { class: 'deal-name' }, art(d.icon, 'ico lg'), h('strong', {}, L(d.name))),
      h('div', { class: 'deal-sides' },
        h('div', { class: 'side boon' }, h('span', { class: 'lbl' }, t('ui.boon')), h('span', { class: 'fx' }, boonOf(coinText(d.text, S)))),
        h('div', { class: 'side bane' }, h('span', { class: 'lbl' }, t('ui.curseLabel')), c && art(c.icon, 'ico'), curseBox, h('span', { class: 'note' }, t('ui.forever')))),
      h('button', { type: 'button', class: 'btn primary', 'data-anchor': 'deal.sign', onclick: () => { ctx.say('brimble', 'signed'); ctx.call('signDeal', d.id); } }, t('ui.sign')));
  });
  put(el,
    h('div', { class: 'head' }, h('h2', {}, t('ui.dealTitle')), art('devil/deal', 'devil')),
    dv.mustSign && h('p', { class: 'note tutorial' }, t('ui.mustSign')),
    h('div', { class: 'cards' }, cards),
    ctx.foot(fromCall ? h('button', { type: 'button', class: 'btn ghost', 'data-anchor': 'deal.back', onclick: () => ctx.call('dealBack') }, t('ui.back'))
      : !dv.mustSign && btn(t('ui.refuse'), () => { ctx.say('brimble', 'refuse'); ctx.call('refuseDeals'); }, 'ghost')),
    !dv.mustSign && !fromCall && h('p', { class: 'note' }, t('ui.refuseNote', { n: refuseWick })));
}
