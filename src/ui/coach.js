// The forced first-run tutorial (SPEC 2): a dark scrim with one hole, a pointing hand on the target, one short caption in a paper strip.
// A step advances on its own event (never a timer): the glue calls coach.event('spin'), and a tap inside the hole counts as 'tap'.
// Taps outside the hole hit the scrim and do nothing. Steps are src/tutorial.js TUTORIAL_STEPS: { id, target, gesture, caption (i18n key), until }.
// target: an anchor name, 'a or b' for one hole over two anchors, 'story/pN' for a story panel (no scrim), null for free play (caption only).
// until: an event, 'tap', or several events joined with | (the first to happen). Pure stepper first (tested in scripts/check-ui.mjs), DOM after.
import { t } from '../i18n.js';
import { h, art } from './dom.js';

const events = (s) => String(s.until).split(/[\s|]+/);
const isPanel = (target) => /^(panel |story\/)/.test(String(target));

// Once a deal was signed the green-card step is skipped (the pick already happened).
export function stepper(steps, start = 0) {
  let i = start; const seen = new Set();
  const cur = () => steps[i] ?? null;
  return {
    get index() { return i; }, get step() { return cur(); }, get done() { return i >= steps.length; }, seen,
    event(name) {
      seen.add(name);
      const s = cur();
      if (!s || !events(s).includes(name)) return false;
      i++;
      while (steps[i] && steps[i].until === 'callPick' && seen.has('deal')) i++;
      return true;
    },
    jump(to) { i = Math.max(0, Math.min(steps.length, to)); },
  };
}

// ---- overlay ----
const union = (rs) => rs.reduce((a, r) => (a ? { x: Math.min(a.x, r.x), y: Math.min(a.y, r.y), w: Math.max(a.x + a.w, r.x + r.w) - Math.min(a.x, r.x), h: Math.max(a.y + a.h, r.y + r.h) - Math.min(a.y, r.y) } : r), null);

// opts: { steps, anchor(name) -> {x,y,w,h} | null (px inside the column), vars() -> { debt, nights } for the captions, onStep(step, i), onDone() }
export function mountCoach(col, opts) {
  const ov = h('div', { class: 'coach-ov', hidden: true, 'aria-live': 'polite' });
  const blk = Array.from({ length: 4 }, () => h('div', { class: 'blk' })), ring = h('div', { class: 'hole' }), hand = art('ui/hand', 'hand'), cap = h('p', { class: 'cap' });
  ov.append(...blk, ring, hand, cap);
  col.append(ov);
  let st = null, poll = 0, idle = 0, rect = null, missing = 0;

  const rectOf = (target) => {
    if (!target || isPanel(target)) return null;
    const names = target.split(' or '), rs = [];
    for (const n of names) { const r = opts.anchor(n) ?? (n === 'lever' ? opts.anchor('spin') : null); if (r && r.w > 0) rs.push(r); }
    return union(rs);
  };
  const place = () => {
    const s = st?.step;
    if (!s) return;
    const W = col.clientWidth, H = col.clientHeight;
    rect = rectOf(s.target);
    const free = !rect, panel = isPanel(s.target);
    ov.classList.toggle('free', free); ov.hidden = panel; // story panels carry their own caption and tap
    if (!rect) { for (const b of blk) b.style.cssText = 'display:none'; ring.style.display = hand.style.display = 'none'; cap.classList.add('bottom'); cap.classList.remove('top'); missing++; cap.classList.toggle('tappable', missing > 8 && s.until === 'tap'); return; }
    missing = 0; cap.classList.remove('tappable');
    const pad = 6, x = Math.max(0, rect.x - pad), y = Math.max(0, rect.y - pad), w = Math.min(W - x, rect.w + 2 * pad), hh = Math.min(H - y, rect.h + 2 * pad);
    const set = (b, l, tp, ww, h2) => { b.style.cssText = `left:${l}px;top:${tp}px;width:${Math.max(0, ww)}px;height:${Math.max(0, h2)}px`; };
    set(blk[0], 0, 0, W, y); set(blk[1], 0, y + hh, W, H - y - hh); set(blk[2], 0, y, x, hh); set(blk[3], x + w, y, W - x - w, hh);
    Object.assign(ring.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
    Object.assign(hand.style, { display: 'block', left: x + w / 2 + 'px', top: y + hh / 2 + 'px' });
    hand.className = 'hand ' + (s.gesture === 'drag' ? 'drag' : s.gesture === 'none' ? 'hide' : 'tap');
    cap.classList.toggle('top', y + hh / 2 > H / 2); cap.classList.toggle('bottom', y + hh / 2 <= H / 2);
  };
  const show = () => {
    const s = st?.step;
    if (!s) { ov.hidden = true; return; }
    cap.textContent = t(s.caption, opts.vars?.() ?? {});
    opts.onStep?.(s, st.index);
    place();
  };
  // A tap inside the hole counts as the step's 'tap'. Listened on the document, not the column: holes over the machine sit on the canvas, a sibling
  // of the column, so a column listener never heard them (AUDIT2 1). A 'tap' step only points at a thing, so the click that follows is swallowed:
  // tapping the goal bar or the Special must not open a sheet or spend Caps behind the overlay (the auditor's stuck goal sheet).
  let swallow = 0;
  const pass = () => { swallow = performance.now() + 400; setTimeout(() => api.event('tap'), 0); };
  const onUp = (e) => {
    if (!st?.step || st.step.until !== 'tap') return;
    if (!rect) { if (!isPanel(st.step.target)) pass(); return; } // the target is gone (a hidden score line): no hole, so any tap goes on
    const b = col.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    if (x >= rect.x - 6 && x <= rect.x + rect.w + 6 && y >= rect.y - 6 && y <= rect.y + rect.h + 6) pass();
  };
  document.addEventListener('pointerup', onUp, true);
  document.addEventListener('click', (e) => { if (performance.now() < swallow) { swallow = 0; e.stopPropagation(); e.preventDefault(); } }, true);
  cap.addEventListener('click', () => { if (cap.classList.contains('tappable')) api.event('tap'); });

  const api = {
    start(steps, index = 0) {
      st = stepper(steps, index);
      clearInterval(poll); poll = setInterval(place, 120);
      ov.hidden = false; show();
    },
    event(name) {
      if (!st) return false;
      const adv = st.event(name);
      if (adv) { if (st.done) { api.stop(); opts.onDone?.(); } else show(); }
      return adv;
    },
    stop() { clearInterval(poll); st = null; ov.hidden = true; },
    get active() { return !!st; }, get step() { return st?.step ?? null; }, get index() { return st?.index ?? 0; },
    // Free play (target none): the hand shows after 8 s without a tap, on `where` (the lever, or PAY NOW when it is lit).
    idleHint(where) { clearTimeout(idle); if (!st || st.step?.target) return; idle = setTimeout(() => { const r = opts.anchor(where) ?? opts.anchor('spin'); if (r && !st?.step?.target) Object.assign(hand.style, { display: 'block', left: r.x + r.w / 2 + 'px', top: r.y + r.h / 2 + 'px' }), hand.className = 'hand tap'; }, 8000); },
    // Takes the player's last tap on this step (a skip after step 12 lives in the glue, with a confirm).
    jump(i) { if (st) { st.jump(i); show(); } },
  };
  return api;
}
