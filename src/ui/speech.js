// Deni and Orhan speech bubbles. Lines live in i18n as line.<who>.<trigger>.<n>; the picker never repeats the last pick.
import { t, lineCount } from '../i18n.js';
import { h } from './dom.js';

const last = new Map(); // 'who.trigger' -> last index
let box = null, timer = 0;

export function mountSpeech(parent) {
  box = h('div', { class: 'speech', 'aria-live': 'polite' });
  parent.append(box);
  return box;
}
export const hush = () => { clearTimeout(timer); box?.replaceChildren(); };
export const stay = () => clearTimeout(timer); // on a screen the line is part of the page: it stays until the next line or the next screen

// Index in 1..count that differs from `prev` when count > 1. rnd is injectable for the check.
export function pickIndex(count, prev, rnd = Math.random) {
  if (count < 1) return 0;
  if (count === 1) return 1;
  let i = 1 + Math.floor(rnd() * (count - 1));
  if (prev && i >= prev) i++; // skip the previous index, keep the draw uniform over the rest
  return i;
}

// One line for who/trigger, never the same twice in a row; null when there is none. Shows nothing (the home screen prints its lines itself).
export function pickLine(who, trigger, vars = {}) {
  const n = lineCount(who, trigger);
  if (!n) return null;
  const key = `${who}.${trigger}`, i = pickIndex(n, last.get(key));
  last.set(key, i);
  return t(`line.${who}.${trigger}.${i}`, vars);
}

// Returns the text shown, or null when that who/trigger has no lines.
export function say(who, trigger, vars = {}) {
  const text = pickLine(who, trigger, vars);
  if (text == null) return null;
  if (box) {
    const name = who === 'deni' ? t('ui.deni') : who === 'orhan' ? t('ui.orhan') : '';
    const b = h('p', { class: `bubble ${who}` }, name && h('b', {}, name), text);
    box.replaceChildren(b); // one bubble at a time
    clearTimeout(timer);
    timer = setTimeout(() => b.remove(), 3800 + text.length * 30);
  }
  return text;
}
