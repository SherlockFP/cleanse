// Tiny DOM helpers for the overlay. Text always goes in as text nodes, never as HTML.
export function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  const add = (c) => { if (Array.isArray(c)) c.forEach(add); else if (c != null && c !== false) e.append(c); };
  kids.forEach(add);
  return e;
}

// Cut art as an <img>. Ids the art manifest does not list (setArtIds) get a code-drawn stand-in: cream paper edge, flat fill, the id's last word.
let real = new Set();
export const setArtIds = (ids) => { real = new Set(ids); };
const stubs = new Map(), FILL = ['#f08a2a', '#7fd13b', '#b3202a', '#d9a62e', '#6b4a7a'];
function stub(id) {
  if (stubs.has(id)) return stubs.get(id);
  const c = Object.assign(document.createElement('canvas'), { width: 96, height: 96 }), g = c.getContext('2d');
  if (/^ui\/(slot_empty|rarity_)/.test(id)) { stubs.set(id, c.toDataURL()); return stubs.get(id); } // frames and tag backs: nothing is better than a labelled blob
  let n = 7; for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) % 9973;
  g.fillStyle = '#f1e6cf'; g.beginPath(); g.arc(48, 48, 45, 0, 7); g.fill();
  g.fillStyle = FILL[n % FILL.length]; g.beginPath(); g.arc(48, 48, 38, 0, 7); g.fill();
  g.fillStyle = '#1c1220'; g.font = 'bold 17px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(id.split('/').pop().replace(/^btn_/, '').slice(0, 8), 48, 49, 70);
  const url = c.toDataURL(); stubs.set(id, url); return url;
}
export const art = (id, cls = 'ico') => h('img', { src: real.has(id) ? `./img/${id}.png` : stub(id), alt: '', class: cls, draggable: 'false', onerror: (e) => { if (e.target.src !== stub(id)) e.target.src = stub(id); } });

export const clear = (e) => { while (e.firstChild) e.removeChild(e.firstChild); return e; };

// Whole percentages that always add up to 100 (largest remainder). All zeros stay zeros.
export function pct(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return values.map(() => 0);
  const raw = values.map((v) => (v / sum) * 100), out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left-- > 0) out[i]++; });
  return out;
}

// A 44 px button. `dim` keeps it tappable so the tap can say why it did nothing.
export const btn = (label, onclick, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick }, label);

// Long-press (450 ms) on a button calls fn and swallows the click that follows, so a press never also taps.
export function hold(el, fn) {
  let timer = 0, fired = false;
  const stop = () => clearTimeout(timer);
  el.addEventListener('pointerdown', () => { fired = false; stop(); timer = setTimeout(() => { fired = true; fn(); }, 450); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, stop);
  el.addEventListener('click', (e) => { if (fired) { fired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  el.addEventListener('contextmenu', (e) => e.preventDefault()); // Android long-press menu
  return el;
}

// append() that skips null / false (a bare `cond && node` would print "false" as text) and flattens arrays.
export const put = (e, ...kids) => { const add = (c) => { if (Array.isArray(c)) c.forEach(add); else if (c != null && c !== false) e.append(c); }; kids.forEach(add); return e; };
