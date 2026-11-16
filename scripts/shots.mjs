// QA frames via raw CDP (no dependency), adapted from msjelly/scripts/shots.mjs. Run by hand after "npm run build": node scripts/shots.mjs
// v3: the frames walk the guided first run step by step (tutorial steps 1, 4, 6, 14, 20, 23, the Tin, the phone, the deal), then the Blender, the Red Eye,
// the Kiosk, a resume, the run end and the meta screens (map with postcards, Notebook, lockers, Codex).
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
const ONLY = process.argv.slice(2);
// the Blender frame: two commons of one family (a same-family step-up)
const { CHARM, familyOf } = await import('../src/core/data.js');
const PAIR = (() => { const c = Object.values(CHARM).filter((x) => x.rarity === 'common' && !x.active && !x.unlock && familyOf(x.id)); for (const x of c) { const y = c.find((z) => z.id !== x.id && familyOf(z.id) === familyOf(x.id)); if (y) return [x.id, y.id]; } return []; })(); // e.g. "phone-th desk-en": only these combos

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
  // cold open: the title card, three story panels (a tap each), then the guided run on the machine with the tutorial overlay
  await waitFor("!!window.__pact && __pact.state().screen === 'title'", 20000, 'title card');
  await ev(`__pact.setLang('${lang}'); 0`);
  await snap('00-title', 500);
  // the guided first run (SPEC 2), driven step by step: every step must be the one expected, or the step names where it is
  const tutAt = async (n) => { const s = await state(); if (s.tutStep !== n) throw new Error(`expected tutorial step ${n}, at ${s.tutStep} (phase ${s.phase}, screen ${s.screen})`); };
  // A tap step is passed with a REAL pointer on the hole's centre (touch on phone, mouse on desktop), never the debug hook (AUDIT2 1): the
  // hole over the machine sits on the canvas, so this proves a player can pass it. With no hole (target gone), a tap mid-screen.
  const realTap = async (sel = '.coach-ov .hole') => {
    const [x, y] = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const b=e&&e.style.display!=='none'?e.getBoundingClientRect():null;return b&&b.width?[b.left+b.width/2,b.top+b.height/2]:[innerWidth/2,innerHeight/2]})()`);
    if (mobile) for (const type of ['touchStart', 'touchEnd']) await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    else for (const type of ['mousePressed', 'mouseReleased']) await cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    await sleep(120);
  };
  const tap = (n) => step(`tap ${n}`, async () => { await tutAt(n); await idle(`step ${n}`); await realTap(); const s = await state(); if (s.tutStep === n) throw new Error(`a real tap did not pass step ${n}`); });
  await step('story 1', async () => { await click('.story-panel'); await sleep(250); await tutAt(1); });
  await snap('tut01-story', 300);
  await step('story 2-3', async () => { for (let i = 0; i < 3; i++) { await click('.story-panel'); await sleep(250); } await waitFor("__pact.state().phase === 'spin' && __pact.state().screen === 'game'", 10000, 'first run on the machine'); await tutAt(4); });
  await snap('tut04-goal', 700);
  await tap(4);
  // step 5 says "Tap SPIN, or drag the lever": the SPIN button inside the hole takes a real tap
  await step('lever 1', async () => { await tutAt(5); await idle('step 5'); await realTap(go); await waitFor('__pact.state().tutStep === 6', 10000, 'a real tap on SPIN spins'); });
  await snap('tut06-pattern', 500);
  for (const n of [6, 7, 8]) await tap(n);
  await step('lever 2', async () => { await act('spin'); await tutAt(10); });
  await tap(10);
  await step('spice', async () => { await act('stoke'); await tutAt(12); await act('spin'); await tutAt(13); });
  await step('kiosk open', async () => { await click('.lchip.kiosk'); await sleep(200); await tutAt(14); });
  await snap('tut14-bank-all', 400);
  await step('bank all', async () => { await act('bank', (await state()).purse); await tutAt(15); });
  await snap('kiosk', 300);
  await tap(15);
  await step('last spins', async () => { await click('.sheet-acts .btn'); for (let i = 0; i < 6 && (await state()).phase === 'spin'; i++) await act('spin'); await tutAt(17); });
  await step('stall', async () => { await act('tutEvent', 'tap'); await waitFor("__pact.state().screen.includes('shop')", 5000, 'the stall'); await tutAt(18); });
  await snap('tin-strip', 500);
  await step('tip', async () => { await act('offer', ['coins', 'small']); await tutAt(19); const s = await act('buyCharm', 3); if (s.charms.length !== 1) throw new Error('the 4th charm was not bought'); await tutAt(20); });
  await snap('tut20-leave', 400);
  await step('terms', async () => { await act('leaveShop'); await tutAt(21); await act('pickTerms', (await state()).terms[0]); await tutAt(22); });
  await step('free play', async () => {
    for (let i = 0; i < 40 && (await state()).tutStep === 22; i++) {
      const s = await state();
      if (s.phase === 'spin' && s.banked >= s.debt) await act('payNow');
      else if (s.phase === 'spin') { await act('spin'); await act('bank', (await state()).purse); }
      else if (s.phase === 'roundend') await act('endRound');
      else if (s.screen.includes('paid')) await act('paidContinue');
    }
    await tutAt(23);
  });
  await snap('tut23-phone-rings', 500);
  await step('answer', async () => { await click('[data-anchor="phone"]'); await tutAt(24); });
  await snap('phone-call', 400);
  await step('red card', async () => { await act('callPick', (await state()).call.findIndex((c) => c.ruby)); await tutAt(25); });
  await snap('devil-deal', 400);
  await step('back, green card', async () => {
    await act('dealBack'); await tutAt(26);
    await act('callPick', (await state()).call.findIndex((c) => c.spirit === 'gold')); await tutAt(27);
    await act('tutEvent', 'tap');
    const s = await state(); if (s.tutStep !== null || !s.tutorialDone) throw new Error('tutorial did not finish: ' + JSON.stringify(s));
  });
  await snap('after-tutorial', 500);
  // after the lesson: the Blender (debt 2 on), the Red Eye, the Kiosk on the machine, then save and resume
  await step('blender', async () => {
    if (!(await state()).screen.includes('shop')) throw new Error('not in the stall after the call: ' + (await state()).screen);
    for (const id of PAIR) await act('cheat', { charm: id, wick: 30 });
    await ev("__pact.goto('shop'); 0"); await click('.panel.shop .seg .opt:last-child');
    const n = (await state()).charms.length;
    await click(`.panel.shop .cards .card.pick:nth-child(${n - 1})`); await click(`.panel.shop .cards .card.pick:nth-child(${n})`);
    await ev("document.querySelector('.panel.shop .blender')?.scrollIntoView({ block: 'start' }); 0");
  });
  await snap('blender', 400);
  await step('red eye', async () => {
    await act('leaveShop'); await act('pickTerms', (await state()).terms[0]);
    await ev("__pact.goto('game'); __pact.redEye(2); 0"); await sleep(900); await ev(PAINT, true); await shot(`${tag}-red-eye`);
  });
  await step('kiosk on the machine', async () => { await sleep(2500); await click('.lchip.kiosk'); });
  await snap('kiosk-machine', 400);
  await step('kiosk close', async () => { await click('.sheet-acts .btn'); });
  await step('resume', async () => {
    await act('stoke'); await act('spin');
    const pick = (s) => JSON.stringify([s.seed, s.phase, s.grid, s.rngState, s.purse, s.banked, s.heat, s.spinsLeft, s.charms, s.curses, s.lang]), before = pick(await state());
    await cdp.send('Page.navigate', { url: `${ORIGIN}/?debug=1` });
    await waitFor("!!window.__pact && __pact.state().screen === 'game'", 20000, 'resumed run');
    const after = pick(await state());
    if (after !== before) throw new Error(`resume differs: ${before} vs ${after}`);
  });
  await snap('resumed', 700);
  await step('game over', async () => { await act('cheat', { lose: true }); const s = await act('endRound'); if (!s.screen.includes('runend') || s.phase !== null) throw new Error('no run end: ' + JSON.stringify(s)); });
  await step('no ad on a first loss', async () => { if (await ev("!!document.querySelector('.panel.runend .btn.ad')")) throw new Error('ad button on the first run end'); });
  await snap('game-over', 600);
  await step('home', async () => { const s = await act('home'); if (!s.screen.includes('home') || !s.tutorialDone) throw new Error('home after the first run: ' + JSON.stringify(s)); });
  await snap('home', 500);
  await step('map', async () => { await ev("__pact.goto('map'); 0"); });
  await snap('map', 400);
  await step('place sheet', async () => { await click('.card.place:not(.lockedc)'); });
  await snap('postcards', 300); // the place sheet: its character, Postcards and Storm
  await step('notebook', async () => { await click('.sheet-back'); await ev("__pact.goto('notebook'); 0"); });
  await snap('notebook', 400);
  await step('lockers', async () => { await ev("__pact.goto('lockers'); 0"); });
  await snap('lockers', 400);
  await step('codex', async () => { await ev("__pact.goto('collection'); 0"); });
  await snap('codex', 400);
  await step('how to play', async () => { await ev("__pact.goto('howto'); 0"); });
  await snap('how-to-play', 400);
  await step('settings', async () => { await ev("__pact.goto('settings'); 0"); });
  await snap('settings', 400);
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
