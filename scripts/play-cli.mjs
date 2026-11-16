// Text-mode run on the real src/core.
// node scripts/play-cli.mjs [--seed S] [--contract c1] [--char nim] [--auto greedy|random] [command ...]
// Commands (one per argument, or one per stdin line; ';' also separates):
//   terms N      pick terms card N (0-2)         stoke            +1 Heat
//   spin         spin                            collect          take the result (after post tricks)
//   use P [t]    use trick in pocket P; target t is a column/row/cell number, 'a,b' for two cells, or a symbol
//   bank [N]     bank N coins (default all)      end              end the round (interest, deadline)
//   buy N | tbuy N | reroll | lock N | sell N | bench I SYMBOL | leave      the wagon
//   sign N | refuse | pawn N | nopawn | quit
import { createInterface } from 'node:readline';
import { makeRng } from '../src/core/rng.js';
import { SYM, CHARM, DEAL, TRICK } from '../src/core/data.js';
import { newRun, pickTerms, termsOffer, stoke, spin, collect, bank, endRound, leaveShop, pawn, declinePawn, useTrick, trickTarget, info, summary } from '../src/core/run.js';
import { buyCharm, buyTrick, reroll, toggleLock, sellCharm, doBench, price } from '../src/core/shop.js';
import { signDeal, refuseDeals } from '../src/core/deals.js';
import { BOTS, playRun } from './sim-quick.mjs';

const argv = process.argv.slice(2);
const opt = {}, cmds = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else cmds.push(argv[i]);
}
const run = newRun({ seed: opt.seed ?? 'play', contractId: opt.contract ?? 'c1', charId: opt.char ?? 'nim' });
const out = (s = '') => console.log(s);
const nm = (id) => SYM[id]?.name.en ?? id;

function show() {
  const i = info(run);
  out(`\nDEBT ${run.debtIdx + 1}  ${run.banked}/${run.debt}  round ${run.round + 1}/${run.rounds}  spins ${run.spinsLeft}  [${run.phase}]`);
  out(`purse ${run.purse}  wick ${run.wick}  heat ${run.heat}  luck ${i.luck}  S x${i.S}  favourite ${i.favHidden ? '?' : run.favs.map(nm).join('+') || '-'}`);
  out(`charms ${run.charms.map((c) => c.id).join(', ') || '-'}  tricks ${run.tricks.join(', ') || '-'}  curses ${run.curses.join(', ') || '-'}`);
  if (run.grid && (run.phase === 'post' || run.phase === 'spin' || run.phase === 'roundend')) for (let r = 0; r < 3; r++) out('  ' + run.grid.slice(r * 5, r * 5 + 5).map((s) => nm(s).padEnd(8)).join(' '));
  if (run.phase === 'terms') termsOffer(run).forEach((s, k) => out(`  [${k}] ${s.name.en}: ${s.text.en}`));
  if (run.phase === 'shop') {
    run.shop.charms.forEach((id, k) => out(`  charm ${k}: ${CHARM[id].name.en} (${CHARM[id].rarity}) ${JSON.stringify(price(run, { kind: 'charm', id }))} ${CHARM[id].text.en}`));
    run.shop.tricks.forEach((id, k) => out(`  trick ${k}: ${TRICK[id].name.en} ${JSON.stringify(price(run, { kind: 'trick', id }))}`));
    run.shop.bench.forEach((id, k) => out(`  bench ${k}: ${id}`));
  }
  if (run.phase === 'deal') run.dealOffer.forEach((id, k) => out(`  deal ${k}: ${DEAL[id].name.en}: ${DEAL[id].text.en}`));
  if (run.phase === 'ended') out('RESULT ' + JSON.stringify(summary(run)));
}

function showScore(s) {
  for (const p of s.patterns) out(`  ${p.id} of ${nm(p.sym)}: ${p.value} x ${p.symMult} x ${p.patMult} = ${p.pay}${p.repeats ? ` (+${p.repeats} repeat)` : ''}`);
  if (s.scorch) out(`  SCORCH, purse burns ${s.burn}`);
  out(`  total ${s.total} (heat x${s.heatMult.toFixed(2)}) + flat ${s.flat}   top: ${s.top3.map((c) => c.id + '+' + c.gain).join(', ')}`);
}

function target(id, v) {
  const tg = trickTarget(id);
  if (!tg) return {};
  const n = Number(v);
  if (tg === 'col') return { col: n };
  if (tg === 'row') return { row: n };
  if (tg === 'cell') return { cell: n };
  if (tg === 'sym') return { sym: v };
  const [a, b] = String(v).split(',').map(Number);
  return { a, b, from: a, to: b };
}

function exec(line) {
  const [c, a, b] = line.trim().split(/\s+/);
  if (!c) return true;
  const n = Number(a);
  switch (c) {
    case 'terms': pickTerms(run, termsOffer(run)[n].id); break;
    case 'stoke': out(stoke(run) ? 'stoked' : 'cannot stoke'); break;
    case 'spin': { const r = spin(run); if (r.score) showScore(r.score); break; }
    case 'collect': showScore(collect(run)); break;
    case 'use': out(JSON.stringify(useTrick(run, n, target(run.tricks[n], b)))); break;
    case 'bank': out('banked ' + bank(run, a ? n : Infinity)); break;
    case 'end': out(JSON.stringify(endRound(run))); break;
    case 'buy': out(String(buyCharm(run, n))); break;
    case 'tbuy': out(String(buyTrick(run, n))); break;
    case 'reroll': out(String(reroll(run))); break;
    case 'lock': out(String(toggleLock(run, n))); break;
    case 'sell': out(String(sellCharm(run, n))); break;
    case 'bench': out(String(doBench(run, n, b))); break;
    case 'leave': out(String(leaveShop(run))); break;
    case 'sign': out(String(signDeal(run, run.dealOffer[n]))); break;
    case 'refuse': out(String(refuseDeals(run))); break;
    case 'pawn': out(String(pawn(run, n))); break;
    case 'nopawn': out(String(declinePawn(run))); break;
    case 'quit': return false;
    default: out('?? ' + c);
  }
  return true;
}

if (opt.auto) {
  playRun(run, BOTS[opt.auto], makeRng('cli-' + opt.auto));
  show();
  process.exit(0);
}
let go = true;
for (const line of cmds.join(' ').split(';')) { if (go) { try { go = exec(line); } catch (e) { out('error: ' + e.message); } } }
show();
if (!cmds.length && process.stdin.isTTY !== false) {
  const rl = createInterface({ input: process.stdin });
  rl.on('line', (l) => {
    for (const x of l.split(';')) { try { if (!exec(x)) { rl.close(); return; } } catch (e) { out('error: ' + e.message); } }
    show();
  });
}
