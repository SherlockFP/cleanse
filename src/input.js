// Pointer and keys to actions, plus the two bits of DOM that sit on the machine: the coach line and the score line.
// The canvas gives cell taps (trick targets, skip an animation) and long-presses (read a symbol). Buttons are the DOM HUD's own.
// Actions go out through callbacks; nothing here knows the run.
const LONG_MS = 450, MOVE_PX = 10;
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls, hidden: true });

export function initInput({ canvas, host, cellAt, onCell, onInspect, onPrimary, onFirstTouch }) {
  const coach = el('p', 'coach'), score = el('div', 'score-line');
  score.dataset.anchor = 'scoreLine'; // tutorial step 7 points at it
  coach.setAttribute('role', 'status');
  host.append(score, coach);
  window.addEventListener('pointerdown', () => onFirstTouch?.(), { capture: true, passive: true });

  let down = null;
  const at = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = at(e), cell = cellAt(x, y);
    down = { x, y, id: e.pointerId, long: false, moved: false, timer: 0 };
    if (cell >= 0) down.timer = setTimeout(() => { if (down) { down.long = true; onInspect(cell); } }, LONG_MS);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const [x, y] = at(e);
    if (Math.hypot(x - down.x, y - down.y) > MOVE_PX) { clearTimeout(down.timer); down.moved = true; }
  });
  const end = (e) => {
    if (!down || e.pointerId !== down.id) return;
    clearTimeout(down.timer);
    const d = down; down = null;
    if (e.type === 'pointerup' && !d.long && !d.moved) onCell(cellAt(d.x, d.y)); // -1: a tap beside the cells (still skips an animation)
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && document.activeElement === document.body) { e.preventDefault(); onPrimary(); }
  });

  let timer = 0;
  return {
    coach(text) { coach.textContent = text ?? ''; coach.hidden = !text; },
    // The numbers of one spin: "24 x 1.3 = 31" and up to three chips for what added most. Hides itself.
    score(main, chips = [], ms = 2200) {
      clearTimeout(timer);
      score.replaceChildren(Object.assign(document.createElement('b'), { textContent: main }), ...chips.map((c) => Object.assign(document.createElement('span'), { textContent: c })));
      score.hidden = !main;
      if (main) timer = setTimeout(() => { score.hidden = true; }, ms);
    },
    // Where the machine is, so both lines sit on it whatever the HUD height is (px from the top of the window).
    layout(L) {
      host.style.setProperty('--case-top', Math.round(L.case.y) + 'px');
      host.style.setProperty('--case-bot', Math.round(L.screen.h - L.case.y - L.case.h) + 'px');
    },
  };
}
