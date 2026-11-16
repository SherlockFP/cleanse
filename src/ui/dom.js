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

// Cut art as an <img> (trinket icons, Orhan). A missing file removes itself, so a gap in the art never shows a broken image.
export const art = (id, cls = 'ico') => h('img', { src: `./img/${id}.png`, alt: '', class: cls, draggable: 'false', onerror: (e) => e.target.remove() });

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

// append() that skips null / false (a bare `cond && node` would print "false" as text) and flattens arrays.
export const put = (e, ...kids) => { const add = (c) => { if (Array.isArray(c)) c.forEach(add); else if (c != null && c !== false) e.append(c); }; kids.forEach(add); return e; };
