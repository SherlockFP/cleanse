// Shared by the service stubs: native check, a guarded dynamic plugin import, and a small paper-style DOM modal for test ads and test purchases.
export const isNative = () => { try { return !!globalThis.Capacitor?.isNativePlatform?.(); } catch { return false; } };
export const platform = () => { try { return globalThis.Capacitor?.getPlatform?.() ?? 'web'; } catch { return 'web'; } };

// Dev builds (and any build without a real id) use Google's public test ad units; real ids come from env at build time (docs/RELEASE.md).
export const env = (k) => { try { return import.meta.env?.[k] || ''; } catch { return ''; } };
export const isProdBuild = () => { try { return !!import.meta.env?.PROD; } catch { return false; } };

// Resolves to {id, label} of the pressed button; `autoMs` closes it with {id:'auto'} after that time. No DOM (node): resolves {id:'auto'} at once.
export function modal({ label, title, body, buttons = [], autoMs = 0, tick }) {
  if (typeof document === 'undefined') return Promise.resolve({ id: 'auto' });
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(34,48,79,.55);';
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--paper,#F4EAD2);color:var(--ink,#22304F);border:3px solid var(--ink,#22304F);max-width:340px;width:100%;padding:18px;text-align:center;font-family:var(--body,system-ui,sans-serif);';
    const mk = (tag, css, text) => { const e = document.createElement(tag); e.style.cssText = css; e.textContent = text; card.appendChild(e); return e; };
    if (label) mk('div', 'font-size:12px;letter-spacing:.12em;text-transform:uppercase;border:2px solid var(--coral,#D8452E);color:var(--coral,#D8452E);display:inline-block;padding:2px 8px;margin-bottom:10px;', label);
    mk('h2', 'margin:0 0 8px;font-family:var(--display,inherit);', title);
    const bodyEl = mk('p', 'margin:0 0 14px;line-height:1.35;', body);
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';
    let timer = 0, iv = 0;
    const done = (r) => { clearInterval(iv); clearTimeout(timer); root.remove(); resolve(r); };
    for (const b of buttons) {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = b.text;
      el.style.cssText = `min-height:44px;padding:0 16px;font:inherit;font-weight:700;cursor:pointer;border:2px solid var(--ink,#22304F);${b.primary ? 'background:var(--coral,#D8452E);color:var(--paper,#F4EAD2);' : 'background:var(--paper2,#E9DDBF);color:var(--ink,#22304F);'}`;
      el.onclick = () => done({ id: b.id });
      row.appendChild(el);
    }
    card.appendChild(row);
    root.appendChild(card);
    document.body.appendChild(root);
    if (autoMs > 0) {
      const t0 = Date.now();
      if (tick) iv = setInterval(() => { bodyEl.textContent = tick(Math.max(0, Math.ceil((autoMs - (Date.now() - t0)) / 1000))); }, 250);
      timer = setTimeout(() => done({ id: 'auto' }), autoMs);
    }
  });
}
