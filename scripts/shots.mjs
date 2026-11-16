// QA frames via raw CDP (no dependency), adapted from msjelly/scripts/shots.mjs. Run by hand after "npm run build": node scripts/shots.mjs
// ONE headless Chrome on the GPU, muted, with a throwaway profile (never the user's). It starts its own "vite preview" on a free port,
// shoots the states below at phone 390x844 and desktop 1440x900, in EN, TR and TH, into qa/frames/ (emptied first), writes qa/console.json, and kills only
// the processes it started. Both children run at below-normal priority. Hard limit 12 minutes. Exit 1 on console errors, exceptions or shader errors.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import net from 'node:net';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || 'C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const FRAMES = join(ROOT, 'qa', 'frames');
const PROFILE = mkdtempSync(join(tmpdir(), 'pact-shots-'));
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
const LANGS = ['en', 'tr', 'th'];
const ONLY = process.argv.slice(2); // e.g. "phone-th desk-en": only these combos

// Every state is reached through window.__pact (src/main.js, ?debug=1): act() runs the same handlers the buttons call with the
// animations skipped; the three animated frames (mid-spin, pattern win, big win) click the real button and shoot on a timer.
async function combo(vp, w, h, dpr, mobile, lang) {
  const tag = `${vp}-${lang}`;
  const step = async (name, fn) => { try { await fn(); } catch (e) { console.log(`  step "${tag} ${name}" failed: ${e.message}`); E.steps.push(`${tag} ${name}: ${e.message}`); } };
  const snap = (name, wait = 450) => step(name, async () => { await sleep(wait); await ev(PAINT, true); await shot(`${tag}-${name}`); });
  const act = (name, arg) => ev(`__pact.act(${JSON.stringify(name)}, ${JSON.stringify(arg ?? null)})`, true);
  const state = () => ev('__pact.state()');
  const idle = (label) => waitFor('!__pact.state().busy', 10000, label);
  const go = '.hud-bot .btn.go';
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
  await cdp.send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 1 } : { enabled: false });
  await cdp.send('Storage.clearDataForOrigin', { origin: ORIGIN, storageTypes: 'all' });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }); // this PC reports "reduce", which would hide every animation from QA
  await cdp.send('Page.navigate', { url: `${ORIGIN}/?debug=1` });
  // cold open: the first run has no menu, the machine is the first thing on screen
  await waitFor("!!window.__pact && __pact.state().phase === 'spin' && __pact.state().screen === 'game'", 20000, 'first run on the machine');
  await ev(`__pact.setLang('${lang}'); 0`);
  await step('first run', async () => { const s = await state(); if (!s.tut || s.debtIdx !== 0 || s.spinsLeft !== 5) throw new Error('not the guided first run: ' + JSON.stringify(s)); });
  await snap('01-machine-idle', 900);
  await step('mid-spin', async () => { await click(go); await sleep(430); await ev(PAINT, true); await shot(`${tag}-02-mid-spin`); await idle('spin 1 done'); if ((await state()).phase !== 'post') throw new Error('spin 1 did not stop on a result'); });
  await step('pattern win', async () => { await click(go); await sleep(650); await ev(PAINT, true); await shot(`${tag}-03-pattern-win`); await idle('collect 1 done'); if (!((await state()).purse > 0)) throw new Error('spin 1 paid nothing'); });
  await step('big win', async () => {
    await act('cheat', { grid: Array(15).fill('crown'), heat: 4 });
    await click(go); await sleep(2100); await ev(PAINT, true); await shot(`${tag}-04-big-win`); await idle('big win done');
  });
  await step('trick target', async () => { await act('spin'); await click('.hud-bot .pocket:not(.empty)'); });
  await snap('05-trick-target', 400);
  await step('deadline paid', async () => { await click('.prompt .btn'); await act('collect'); const s = await act('bank'); if (s.screen !== 'paid') throw new Error('bank did not pay the debt: ' + JSON.stringify(s)); });
  await snap('06-deadline-paid', 500);
  await step('deal', async () => { const s = await act('paidContinue'); if (s.screen !== 'deal' || !s.dealOffer?.length) throw new Error('no deal: ' + s.screen); });
  await snap('07-devil-deal', 500);
  await step('sign', async () => { const d = (await state()).dealOffer[0], s = await act('signDeal', d); if (s.screen !== 'shop' || !s.curses.length || !s.deals.length) throw new Error('deal not signed: ' + JSON.stringify(s)); });
  await snap('08-shop', 2700); // after the "new curse" toast
  await step('buy', async () => { const before = await state(), s = await act('buyCharm', 0); if (s.charms.length !== before.charms.length + 1 || s.purse >= before.purse) throw new Error('buy did not go through'); });
  await snap('09-shop-bought', 300);
  await step('stakes', async () => { const s = await act('leaveShop'); if (s.screen !== 'terms' || s.terms?.length !== 3) throw new Error('no terms pick: ' + JSON.stringify(s.terms)); });
  await snap('10-stakes', 500);
  await step('charm inspect', async () => { const s = await act('pickTerms', (await state()).terms[0]); if (s.screen !== 'game') throw new Error('not on the machine'); await click('.row-charms .slot:not(.empty):not(.util)'); });
  await snap('11-charm-inspect', 400);
  await step('curses', async () => { await click('.sheet-back'); await ev("__pact.goto('shelf', { tab: 'curses' }); 0"); });
  await snap('12-curses', 400);
  // save and resume: a reload in the middle of a night comes back in the same place with the same rng counts
  await step('resume', async () => {
    await ev("__pact.goto('game'); 0"); await act('stoke'); await act('spin');
    const pick = (s) => JSON.stringify([s.seed, s.phase, s.grid, s.rngState, s.purse, s.heat, s.spinsLeft, s.charms, s.curses, s.lang]), before = pick(await state());
    await cdp.send('Page.navigate', { url: `${ORIGIN}/?debug=1` });
    await waitFor("!!window.__pact && __pact.state().screen === 'game'", 20000, 'resumed run');
    const after = pick(await state());
    if (after !== before) throw new Error(`resume differs: ${before} vs ${after}`);
  });
  await snap('13-resumed', 700);
  await step('game over', async () => { await act('cheat', { lose: true }); const s = await act('endRound'); if (s.screen !== 'runend' || s.phase !== null) throw new Error('no run end: ' + JSON.stringify(s)); });
  await step('no ad on a first loss', async () => { if (await ev("!!document.querySelector('.panel.runend .btn.ad')")) throw new Error('ad button on the first run end'); });
  await snap('14-game-over', 600);
  await step('home', async () => { const s = await act('home'); if (s.screen !== 'home' || !s.tutorialDone || !(s.wax > 0)) throw new Error('home after the first run: ' + JSON.stringify(s)); });
  await snap('15-home', 500);
  await step('character select', async () => { await ev("__pact.goto('charselect'); 0"); });
  await snap('16-character-select', 400);
  await step('contracts', async () => { await ev("__pact.goto('ladder', { charId: 'nim' }); 0"); });
  await snap('17-contracts', 400);
  await step('how to play', async () => { await ev("__pact.goto('howto'); 0"); });
  await snap('18-how-to-play', 400);
  await step('patterns', async () => { await click('.panel.howto .seg .opt:last-child'); });
  await snap('19-patterns', 300);
  await step('store', async () => { await ev("__pact.goto('store'); 0"); await waitFor("!!document.querySelector('.panel.store .card')", 5000, 'store products'); });
  await snap('20-store', 400);
  await step('daily', async () => { await ev("__pact.goto('daily'); 0"); });
  await snap('21-daily', 400);
  await step('collection', async () => { await ev("__pact.goto('collection'); 0"); });
  await snap('22-collection', 400);
  await step('settings', async () => { await ev("__pact.goto('settings'); 0"); });
  await snap('23-settings', 400);
  // run 2 is a plain run: Play goes straight in (one character, one contract), the terms pick is the first screen
  await step('run 2', async () => { await ev("__pact.goto('home'); 0"); await click('.layer .foot .btn.big'); const s = await state(); if (s.screen !== 'terms' || s.tut) throw new Error('run 2 did not open on the terms pick: ' + JSON.stringify(s)); });
  await snap('24-run2-stakes', 500);
}

async function main() {
  if (!existsSync(CHROME)) { console.error('headless shell not found: ' + CHROME); return finish(2); }
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) { console.error('dist/ missing: run npm run build first'); return finish(2); }
  mkdirSync(FRAMES, { recursive: true });
  if (!ONLY.length) for (const f of readdirSync(FRAMES)) if (f.endsWith('.png')) rmSync(join(FRAMES, f)); // frames of an older build never mix in

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
    if (ONLY.length && !ONLY.includes(`${vp}-${lang}`)) continue;
    try { await combo(vp, w, h, dpr, mobile, lang); } catch (e) { console.log(`combo ${vp}-${lang} aborted: ${e.message}`); E.steps.push(`${vp}-${lang}: ${e.message}`); }
  }
  finish(E.errors.length || E.exceptions.length || E.shaderErrors.length || E.steps.length ? 1 : 0);
}

main().catch((e) => { console.error(e); finish(1); });
