// Text-mode run (ROADMAP.md M1 peg gate). Plays the real src/core in the terminal.
// node scripts/play-cli.mjs [--seed S] [--installment N] [--trinket ID] [--chart ID] [--auto BOT] [command ...]
// Commands (one per argument or per stdin line, ';' also separates):
//   peg 1 4 7    set pegs to exactly these cells (0-8, row-major); 'peg' alone lifts all pegs
//   spin         spin; after the last spin the tide is paid or the run ends
//   buy N        buy offer N (0-based)      reroll      remove SYMBOL      lock N
//   next         leave the shop for the next tide      quit
// --auto BOT plays the whole run with a sim bot: no-build, random, greedy, bag-focus, lookahead.
import { createInterface } from 'node:readline';
import { hashSeed } from '../src/core/rng.js';
import { makeBag, bagOdds } from '../src/core/reel.js';
import { newRun, spin, togglePeg, canPeg, endTide, nextTide, enterLamplight, runSummary } from '../src/core/run.js';
import { rollShop, buyOffer, removeToken, reroll, lockOffer, priceOf } from '../src/core/shop.js';
import { SYMBOLS } from '../src/core/data/symbols.js';
import { BOTS, pegGreedy, bestPick } from './sim-balance.mjs';

const argv = process.argv.slice(2);
const opt = {}, cmds = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else cmds.push(argv[i]);
}
const NAME = Object.fromEntries(SYMBOLS.map((s) => [s.id, s.en]));
const seed = /^\d+$/.test(opt.seed ?? '') ? Number(opt.seed) : hashSeed(opt.seed ?? 'play');
const run = newRun({
  seed, installment: Number(opt.installment ?? 1), chartId: opt.chart ?? null,
  startTrinket: opt.trinket ?? (opt.auto ? bestPick() : 'first_light'), unlocked: ['start', 'cat_basket', 'radio', 'tea_corner'],
});
const out = (s = '') => console.log(s);

function show() {
  if (run.phase === 'tide') {
    out(`\nTide ${run.tide}/5  spin ${run.spin}/${run.spinsMax}  jar ${run.jar}  quota ${run.quota}${run.event ? '  event ' + run.event : ''}  pegs ${run.held.length}/${run.pegsMax}`);
    if (run.grid) {
      for (let r = 0; r < 3; r++) {
        out('  ' + [0, 1, 2].map((c) => { const i = r * 3 + c; return `${i}:${(NAME[run.grid[i]] ?? run.grid[i]).padEnd(11)}${run.held.includes(i) ? '*' : ' '}`; }).join(' '));
      }
    } else out('  (no grid yet: spin first)');
    const bag = makeBag(run.bag);
    out(`  bag ${bag.size}: ` + bagOdds(bag).map((o) => `${NAME[o.id]} ${o.count} (${(o.p * 100).toFixed(0)}%)`).join(', '));
    out(`  trinkets: ${run.trinkets.map((t) => t.id).join(', ') || 'none'}`);
  } else if (run.phase === 'shop') {
    out(`\nShop after tide ${run.tide}  jar ${run.jar}  next quota ${run.quota}  trinkets: ${run.trinkets.map((t) => t.id).join(', ') || 'none'}`);
    run.shop.offers.forEach((o, i) => out(`  ${i}: ${o.sold ? '(sold)' : `${o.kind === 'trinket' ? o.id : 'token ' + o.sym}  ${priceOf(run, o)} coins`}`));
    out(`  reroll ${priceOf(run, { kind: 'reroll' })}, remove token ${priceOf(run, { kind: 'removal' })}; bag ${JSON.stringify(run.bag)}`);
  }
}

// Take the quota once the last spin is done; open the shop.
function finishTide() {
  const e = endTide(run);
  out(e.paid ? `Tide ${e.tide} paid (${e.quota})${e.mercy ? ' by mercy' : ''}${e.clutch ? ', clutch' : ''}.` : `Tide ${e.tide} failed: quota ${e.quota}, jar ${run.jar}.`);
  if (run.phase === 'shop') rollShop(run);
  if (run.phase === 'lamplight') out('Tide 5 cleared: the run is won (Lamplight is not played in this tool).');
}

function exec(line) {
  const [c, ...a] = line.trim().split(/\s+/);
  if (!c) return true;
  try {
    if (c === 'quit') return false;
    if (c === 'peg') {
      for (const h of [...run.held]) togglePeg(run, h);
      for (const x of a.map(Number)) if (!togglePeg(run, x)) out(`cannot peg ${x}`);
    } else if (c === 'spin') {
      if (run.phase !== 'tide') return out('not in a tide'), true;
      const r = spin(run);
      out(`spin ${r.spin}: +${r.total}` + (r.lines.length ? '  lines ' + r.lines.map((l) => `${l.id}=${NAME[l.sym] ?? l.sym}`).join(' ') : ''));
      if (run.spin === run.spinsMax) finishTide();
    } else if (c === 'buy') out(JSON.stringify(buyOffer(run, Number(a[0]))));
    else if (c === 'reroll') out(JSON.stringify(reroll(run)));
    else if (c === 'remove') out(JSON.stringify(removeToken(run, a[0])));
    else if (c === 'lock') out(JSON.stringify(lockOffer(run, Number(a[0]))));
    else if (c === 'next') {
      if (run.phase === 'shop') nextTide(run);
      else if (run.phase === 'lamplight') enterLamplight(run);
      else out('nothing to continue');
    } else out(`unknown command: ${c}`);
  } catch (e) {
    out('error: ' + e.message);
  }
  if (run.phase === 'over') return out('Run over: ' + JSON.stringify(runSummary(run))), false;
  if (run.phase === 'lamplight') return out(JSON.stringify(runSummary(run))), false;
  show();
  return true;
}

function auto(name) {
  const bot = BOTS[name];
  if (!bot) throw new Error('unknown bot ' + name + ' (' + Object.keys(BOTS).join(', ') + ')');
  const ctx = { buys: [] };
  show();
  while (run.phase === 'tide' || run.phase === 'shop') {
    if (run.phase === 'tide') {
      if (run.grid) { pegGreedy(run); out(`peg ${run.held.join(' ')}`); }
      if (!exec('spin')) break;
    } else {
      const n = ctx.buys.length;
      bot.shop?.(run, ctx, {});
      out('bot buys: ' + (ctx.buys.slice(n).join(', ') || 'nothing'));
      if (!exec('next')) break;
    }
  }
}

if (opt.auto) auto(opt.auto);
else {
  show();
  let go = true;
  for (const line of cmds.flatMap((c) => c.split(';'))) { go = exec(line); if (!go) break; }
  if (go && cmds.length === 0) {
    const rl = createInterface({ input: process.stdin, prompt: '> ' });
    rl.prompt();
    rl.on('line', (l) => { for (const c of l.split(';')) if (!exec(c)) { rl.close(); return; } rl.prompt(); });
  }
}
