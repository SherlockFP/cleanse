// Pointer to actions (TECH.md section 1). The canvas gives cell taps and long-presses; SPIN and the coach mark are DOM, placed from the view layout.
// Actions go out through callbacks; nothing here knows the run.
// shortcut: no crank drag (the crank sprite has no job yet); upgrade when the crank art is placed.
const LONG_MS = 450, MOVE_PX = 10;

export function initInput({ canvas, host, cellAt, onSpin, onCell, onInspect, onFirstTouch }) {
  const spin = Object.assign(document.createElement('button'), { type: 'button', className: 'spin-btn', hidden: true });
  const coach = Object.assign(document.createElement('p'), { className: 'coach', hidden: true });
  host.append(coach, spin);
  spin.addEventListener('click', () => { onFirstTouch?.(); onSpin(); });

  let down = null;
  canvas.addEventListener('pointerdown', (e) => {
    onFirstTouch?.();
    const r = canvas.getBoundingClientRect();
    down = { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId, long: false, timer: 0 };
    const cell = cellAt(down.x, down.y);
    if (cell >= 0) down.timer = setTimeout(() => { if (down) { down.long = true; onInspect(cell); } }, LONG_MS);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const r = canvas.getBoundingClientRect();
    if (Math.hypot(e.clientX - r.left - down.x, e.clientY - r.top - down.y) > MOVE_PX) { clearTimeout(down.timer); down.moved = true; }
  });
  const end = (e) => {
    if (!down || e.pointerId !== down.id) return;
    clearTimeout(down.timer);
    const d = down; down = null;
    if (e.type === 'pointerup' && !d.long && !d.moved) {
      const cell = cellAt(d.x, d.y);
      if (cell >= 0) onCell(cell);
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && !spin.hidden && document.activeElement === document.body) { e.preventDefault(); onSpin(); }
  });

  const px = (n) => Math.round(n) + 'px';
  return {
    // L = view layout. The coach sits just above the SPIN button.
    layout(L) {
      const r = L.spin;
      Object.assign(spin.style, { left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h), fontSize: px(r.h * 0.38) });
      Object.assign(coach.style, { left: px(L.column.x + L.column.w / 2), bottom: px(L.screen.h - r.y + 12) }); // a tag 12 px above SPIN
      // DOM bits that follow the canvas: the speech strip under the lanterns, the pegs-left label under the peg line (px inside the column)
      host.style.setProperty('--speech-y', px(L.lantern.y + L.lantern.h));
      host.style.setProperty('--pegs-x', px(L.pegs.x + L.pegs.w / 2 - L.column.x));
      host.style.setProperty('--pegs-y', px(L.pegs.y + L.pegs.h + 2));
    },
    setSpin({ label, sub = '', disabled = false, hidden = false }) {
      spin.replaceChildren(label, Object.assign(document.createElement('small'), { textContent: sub }));
      spin.disabled = disabled; spin.hidden = hidden;
      coach.style.visibility = hidden ? 'hidden' : ''; // the coach tag never shows over an open screen
    },
    coach(text) { coach.textContent = text ?? ''; coach.hidden = !text; },
  };
}
