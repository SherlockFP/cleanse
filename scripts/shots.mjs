// QA frames via raw CDP (no dependency), adapted from msjelly/scripts/shots.mjs. Run by hand after "npm run build": node scripts/shots.mjs
// ONE headless Chrome on the GPU, muted, with a throwaway profile (never the user's). It starts its own "vite preview" on a free port,
// shoots the states below at phone 390x844 and desktop 1440x900, in EN and TR, into qa/frames/, writes qa/console.json, and kills only
// the processes it started. Both children run at below-normal priority. Hard limit 12 minutes. Exit 1 on console errors, exceptions or shader errors.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import net from 'node:net';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || 'C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const FRAMES = join(ROOT, 'qa', 'frames');
const PROFILE = mkdtempSync(join(tmpdir(), 'slp-shots-'));
const procs = [];
const E = { errors: [], exceptions: [], shaderErrors: [], network: [], steps: [] };
let cdp, ORIGIN, T0 = Date.now(), done = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const killAll = () => { for (const p of procs.splice(0)) { try { spawn('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* gone */ } } };
function finish(code) {
  if (done) return; done = true;
  mkdirSync(join(ROOT, 'qa'), { recursive: true });
  writeFileSync(join(ROOT, 'qa', 'console.json'), JSON.stringify(E, null, 2));
  console.log(`done in ${((Date.now() - T0) / 1000).toFixed(1)}s: ${E.errors.length} console errors, ${E.exceptions.length} exceptions, ${E.shaderErrors.length} shader errors, ${E.network.length} failed requests, ${E.steps.length} failed steps`);
  killAll();
  setTimeout(() => { try { rmSync(PROFILE, { recursive: true, force: true, maxRetries: 3 }); } catch { /* locked temp dir */ } process.exit(code); }, 1500);
}
setTimeout(() => { console.log('hard timeout (12 min)'); finish(2); }, 12 * 60 * 1000).unref();

class CDP {
  constructor(url) { this.url = url; this.id = 0; this.cb = new Map(); this.h = new Map(); }
  open() {
    return new Promise((res, rej) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = res; this.ws.onerror = () => rej(new Error('ws error'));
      this.ws.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id) { const c = this.cb.get(d.id); if (c) { this.cb.delete(d.id); d.error ? c.rej(new Error(d.error.message)) : c.res(d.result); } }
        else for (const f of this.h.get(d.method) || []) f(d.params);
      };
    });
  }
  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = ++this.id, tm = setTimeout(() => { this.cb.delete(id); rej(new Error('cdp timeout ' + method)); }, 20000);
      this.cb.set(id, { res: (v) => { clearTimeout(tm); res(v); }, rej: (e) => { clearTimeout(tm); rej(e); } });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(ev, f) { (this.h.get(ev) || this.h.set(ev, []).get(ev)).push(f); }
}

async function ev(expr, awaitPromise = false) {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
  if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split('\n')[0]);
  return r.result.value;
}
async function waitFor(expr, ms = 10000, label = expr) {
  const t = Date.now();
  while (Date.now() - t < ms) { try { if (await ev(expr)) return; } catch { /* page busy */ } await sleep(100); }
  throw new Error('timeout waiting for ' + label);
}
async function shot(name) {
  const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(FRAMES, name + '.png'), Buffer.from(r.data, 'base64'));
  console.log('  shot ' + name);
}
const free = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
const lowPrio = (p) => { try { os.setPriority(p.pid, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* not allowed: keep normal */ } };
const click = (sel) => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('no ${sel.replace(/'/g, '')}');e.click();return true})()`);
const PAINT = 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))';

const VIEWPORTS = [['phone', 390, 844, 2, true], ['desk', 1440, 900, 1, false]];
const LANGS = ['en', 'tr'];

async function combo(vp, w, h, dpr, mobile, lang) {
  const tag = `${vp}-${lang}`;
  const step = async (name, fn) => { try { await fn(); } catch (e) { console.log(`  step "${tag} ${name}" failed: ${e.message}`); E.steps.push(`${tag} ${name}: ${e.message}`); } };
  const snap = (name, wait = 500) => step(name, async () => { await sleep(wait); await ev(PAINT, true); await shot(`${tag}-${name}`); });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
  await cdp.send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 1 } : { enabled: false });
  await cdp.send('Storage.clearDataForOrigin', { origin: ORIGIN, storageTypes: 'all' });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }); // this PC reports "reduce", which would hide every animation from QA
  // The language is in the settings before the page boots, so the age gate (the first screen, before the debug hook exists) is shot in it too.
  const pre = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('slp.settings', '${JSON.stringify({ lang, volume: 1, reduceMotion: false })}'); } catch {}` });
  await cdp.send('Page.navigate', { url: `${ORIGIN}/?debug=1` });
  await waitFor("!!document.querySelector('.panel.agegate')", 20000, 'age gate'); // first boot: the 18+ question comes before anything else
  await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: pre.identifier });
  await snap('00-agegate', 400);
  await click('.layer .foot .btn.primary');
  // cold open: the first run has no run start screen, the pier is the next thing on screen
  await step('cold open', async () => { await waitFor("!!window.__pier && __pier.state().tide === 1 && __pier.state().screen === 'game'", 20000, 'tide 1 right after the age gate'); });
  await snap('02-reel-idle', 900);
  await step('mid-spin', async () => { await ev('setTimeout(() => __pier.spin(), 0); 0'); await sleep(430); await ev(PAINT, true); await shot(`${tag}-03-mid-spin`); await waitFor('!__pier.state().busy && __pier.state().spin === 1', 8000, 'spin 1 done'); });
  await snap('04-pair-pulse', 150);
  await step('peg pair', async () => { const s = await ev('__pier.state()'); if (!s.grid) throw new Error('no grid'); await ev('__pier.peg(4); __pier.peg(8); 0'); });
  await snap('05-pegged-pair', 500);
  await step('win line', async () => { await ev('__pier.spin(); 0'); await waitFor('!__pier.state().busy && __pier.state().spin === 2', 10000, 'spin 2 done'); await sleep(300); await ev(PAINT, true); await shot(`${tag}-06-win-line`); });
  await step('to shop', async () => { await ev("__pier.fastForward('shop'); 0"); await waitFor("__pier.state().screen === 'shop'", 5000, 'shop'); });
  await snap('07-shop', 600);
  await step('bag', async () => { await ev("__pier.goto('bag'); 0"); });
  await snap('08-bag', 400);
  await step('bag bottom', async () => { await ev("document.querySelector('.panel').scrollTop = 1e5; 0"); });
  await snap('08b-bag-bottom', 200);
  await step('inspect', async () => { await ev("__pier.goto('shop'); 0"); await sleep(200); await click('.panel.shop .card-main'); });
  await snap('09-trinket-inspect', 400);
  await step('event', async () => { await ev("__pier.fastForward('event'); 0"); await waitFor("__pier.state().screen === 'event'", 5000, 'event screen'); });
  await snap('10-event-intro', 500);
  await step('lost', async () => { await ev("__pier.fastForward('lost'); 0"); await waitFor("__pier.state().screen === 'runend'", 5000, 'run end'); });
  await step('no ad on a first loss', async () => { if (await ev("!!document.querySelector('.panel.runend .btn.ad')")) throw new Error('ad button on the first run end'); });
  await snap('11-runend-lost', 1200); // after the Planks count-up: first-day Planks, margin note 1, no ad button
  // Meta loop: run end -> home (stage 0) -> build the roof (hammer) -> next run -> won run end with the ledger page.
  await step('home', async () => { await click('.layer .foot .btn.primary'); await waitFor("__pier.state().screen === 'home'", 5000, 'home'); });
  await snap('15-home-stage0', 600);
  await step('build', async () => {
    const before = await ev('__pier.state()');
    await click('.panel.home .card.build .btn');
    const anim = await ev("(() => { const e = document.querySelector('.bh-hammer'), f = document.querySelector('.bh-paint.fresh'); return [e && getComputedStyle(e).animationName, f && getComputedStyle(f).animationName].join(); })()");
    if (anim !== 'bh-hammer,bh-in') throw new Error('hammer animation is not running: ' + anim);
    await sleep(100); await shot(`${tag}-16-home-build-hammer`); // inside the 0.6 s hammer animation when the capture is fast enough
    const after = await ev('__pier.state()');
    if (after.builds !== before.builds + 1 || after.planks >= before.planks) throw new Error(`build did not go through: ${JSON.stringify(after)}`);
  });
  await step('won', async () => {
    await click('.layer .foot .btn.big'); await waitFor("__pier.state().screen === 'runstart'", 5000, 'run start from home');
    await sleep(700); await ev(PAINT, true); await shot(`${tag}-01-runstart`); // the trinket pick, from run 2
    await ev("__pier.newRun(); __pier.fastForward('won'); 0"); await waitFor("__pier.state().screen === 'runend'", 8000, 'run end won');
    const s = await ev('__pier.state()');
    if (s.paid !== 1 || s.notes !== 2 || s.runs !== 2) throw new Error(`rewards not granted: ${JSON.stringify(s)}`);
  });
  await snap('12-runend-won', 1200);
  await step('ledger', async () => { await ev("__pier.goto('ledger'); 0"); });
  await snap('17-ledger', 400);
  await step('album', async () => { await ev("__pier.goto('album'); 0"); });
  await snap('18-album', 400);
  await step('daily', async () => { await ev("__pier.daily(); __pier.fastForward('lost'); 0"); await waitFor("__pier.state().screen === 'daily'", 8000, 'daily result'); });
  await snap('19-daily-result', 1200);
  await step('store', async () => { await ev("__pier.goto('store'); 0"); await waitFor("!!document.querySelector('.panel.store .card')", 5000, 'store products'); });
  await snap('20-store', 400);
  await step('home 3', async () => { await ev('__pier.home(3, 12); 0'); });
  await snap('21-home-stage3', 600);
  await step('home 6', async () => { await ev('__pier.home(6, 40); 0'); });
  await snap('22-home-stage6', 600);
  await step('settings', async () => { await click('.layer .foot .icon'); await waitFor("__pier.state().screen === 'settings'", 5000, 'settings from home'); });
  await snap('13-settings', 400);
  await step('rules', async () => { await click('.panel.settings .btn:not(.primary)'); });
  await snap('14-rules', 400);
}

async function main() {
  if (!existsSync(CHROME)) { console.error('headless shell not found: ' + CHROME); return finish(2); }
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) { console.error('dist/ missing: run npm run build first'); return finish(2); }
  mkdirSync(FRAMES, { recursive: true });

  const port = await free();
  const vite = spawn(process.execPath, [join(dirname(createRequire(import.meta.url).resolve('vite/package.json')), 'bin/vite.js'), 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  procs.push({ name: 'vite', pid: vite.pid }); lowPrio(vite);
  ORIGIN = `http://127.0.0.1:${port}`;
  let vlog = ''; vite.stdout.on('data', (d) => { vlog += d; }); vite.stderr.on('data', (d) => { vlog += d; });
  for (let i = 0; ; i++) {
    try { if ((await fetch(ORIGIN + '/')).ok) break; } catch { /* not yet */ }
    if (i > 150) { console.error('vite preview did not start: ' + vlog.slice(-400)); return finish(2); }
    await sleep(200);
  }

  const cport = await free();
  const args = [`--remote-debugging-port=${cport}`, `--user-data-dir=${PROFILE}`, '--headless', '--mute-audio', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist',
    '--window-size=1440,900', '--disable-extensions', '--disable-background-networking', '--disable-sync', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank'];
  const ch = spawn(CHROME, args, { stdio: 'ignore' });
  procs.push({ name: 'chrome', pid: ch.pid }); lowPrio(ch);
  let targets;
  for (let i = 0; ; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${cport}/json/list`)).json(); if (targets.some((t) => t.type === 'page')) break; } catch { /* not yet */ }
    if (i > 100) { console.error('browser did not start'); return finish(2); }
    await sleep(200);
  }
  cdp = new CDP(targets.find((t) => t.type === 'page').webSocketDebuggerUrl); await cdp.open();
  for (const d of ['Page', 'Runtime', 'Network', 'Log']) await cdp.send(d + '.enable');

  const note = (list, m) => { const s = m.slice(0, 300); list.push(s); if (/shader|WebGLProgram|GLSL|glCompile|glLink/i.test(s)) E.shaderErrors.push(s); };
  cdp.on('Runtime.exceptionThrown', (p) => note(E.exceptions, p.exceptionDetails.exception?.description || p.exceptionDetails.text));
  cdp.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') note(E.errors, p.args.map((a) => a.value ?? a.description ?? '').join(' ')); });
  cdp.on('Log.entryAdded', (p) => { if (p.entry.level === 'error') note(E.errors, `[${p.entry.source}] ${p.entry.text}`); });
  cdp.on('Network.responseReceived', (p) => { if (p.response.status >= 400) E.network.push(`${p.response.status} ${p.response.url}`); });

  E.renderer = await (async () => { await cdp.send('Page.navigate', { url: 'about:blank' }); await sleep(300); return ev(`(()=>{const g=document.createElement('canvas').getContext('webgl2');if(!g)return 'NO-WEBGL2';const x=g.getExtension('WEBGL_debug_renderer_info');return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):'unknown'})()`); })();
  console.log('WebGL renderer: ' + E.renderer);

  for (const [vp, w, h, dpr, mobile] of VIEWPORTS) for (const lang of LANGS) {
    try { await combo(vp, w, h, dpr, mobile, lang); } catch (e) { console.log(`combo ${vp}-${lang} aborted: ${e.message}`); E.steps.push(`${vp}-${lang}: ${e.message}`); }
  }
  finish(E.errors.length || E.exceptions.length || E.shaderErrors.length || E.steps.length ? 1 : 0);
}

main().catch((e) => { console.error(e); finish(1); });
