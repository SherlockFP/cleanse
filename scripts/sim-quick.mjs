// Quick balance sim: a random, a greedy and a smart bot on contract 1, 300 runs each (under 2 minutes).
// node scripts/sim-quick.mjs [--n 300] [--contract c1] [--char nim]
import { makeRng } from '../src/core/rng.js';
import { CHARMS, CHARM } from '../src/core/data.js';
import { newRun, pickTerms, termsOffer, stoke, spin, collect, endRound, bank, leaveShop, declinePawn, pawn } from '../src/core/run.js';
import { buyCharm, buyTrick, price, canPay, sellCharm, reroll, takeWaiting } from '../src/core/shop.js';
import { signDeal, refuseDeals } from '../src/core/deals.js';
import { setExplain, slotsOf, scaleOf } from '../src/core/effects.js';
import { fileURLToPath } from 'node:url';

// A bot is {terms, stokeTo, shop, deal, pawn}. rng is the bot's own stream, never the run's.
export const BOTS = {
  random: {
    terms: (run, offer, rng) => rng.pick(offer).id,
    stokeTo: (run, rng) => rng.int(7),
    shop(run, rng) {
      for (let k = 0; k < 4; k++) if (rng.next() < 0.5) buyCharm(run, rng.int(Math.max(1, run.shop.charms.length)));
      if (rng.next() < 0.3) reroll(run);
    },
    deal: (run, rng) => (rng.next() < 0.5 ? signDeal(run, run.dealOffer[0]) : refuseDeals(run)),
    pawn: (run, rng) => (rng.next() < 0.5 ? pawn(run, 0) : declinePawn(run)),
  },
  greedy: {
    terms: (run, offer) => offer.reduce((a, b) => (b.spins > a.spins ? b : a)).id,
    stokeTo: () => 4,
    shop(run) {
      for (let i = run.waiting.length - 1; i >= 0; i--) takeWaiting(run, i);
      // dearest charm it can pay for (price is the bot's only idea of quality), until nothing fits
      for (;;) {
        if (run.charms.length >= slotsOf(run)) break;
        let best = -1, bestCost = -1;
        run.shop.charms.forEach((id, i) => {
          const p = price(run, { kind: 'charm', id });
          const cost = p.coins ? p.coins / scaleOf(run) : 100 + p.wick;
          if (canPay(run, p) && cost > bestCost) { best = i; bestCost = cost; }
        });
        if (best < 0 || !buyCharm(run, best)) break;
      }
    },
    // takes the first deal offered: refusing every deal drops the clear rate by about 20 points
    deal: (run) => signDeal(run, run.dealOffer[0]),
    pawn: (run) => declinePawn(run),
  },
};
// smart: the greedy shop and deals, but Heat follows the gap to the debt, and it pays the debt off early
// once the purse holds BANK_AT x the debt. Env vars STOKE_SMART, LOW and BANK_AT tune it.
const PUSH = Number(process.env.STOKE_SMART || 5), BANK_AT = Number(process.env.BANK_AT || 99), LOW = Number(process.env.LOW || 2);
BOTS.smart = {
  ...BOTS.greedy,
  stokeTo(run) {
    const owed = run.debt - run.banked;
    if (run.purse >= owed * BANK_AT) { bank(run, owed); return 0; }
    const last = run.round + 1 >= run.rounds;
    return last ? PUSH : Math.min(PUSH, LOW);
  },
};

export function playRun(run, bot, rng, hooks = {}) {
  let guard = 0;
  while (run.phase !== 'ended' && guard++ < 5000) {
    switch (run.phase) {
      case 'terms': pickTerms(run, bot.terms(run, termsOffer(run), rng)); break;
      case 'spin': {
        const to = bot.stokeTo(run, rng);
        while (run.heat < to && stoke(run)) ;
        if (run.phase === 'spin') spin(run); // a bot that banks the debt off has left the spin phase
        break;
      }
      case 'post': collect(run); break;
      case 'roundend': endRound(run); break;
      case 'shop': bot.shop(run, rng); hooks.onShop?.(run); leaveShop(run); break;
      case 'deal': bot.deal(run, rng); break;
      case 'pawn': bot.pawn(run, rng); break;
    }
  }
  return run;
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function simulate(name, n, contract, char) {
  const bot = BOTS[name];
  const bought = Object.fromEntries(CHARMS.map((c) => [c.id, 0]));
  let wins = 0;
  const reached = [], coins = [];
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const rng = makeRng('bot-' + name + i);
    const run = newRun({ seed: 'sim-' + i, contractId: contract, charId: char });
    const owned = new Set();
    playRun(run, bot, rng, { onShop: (r) => r.charms.forEach((c) => owned.add(c.id)) });
    for (const id of owned) bought[id]++;
    if (run.result?.won) wins++;
    reached.push(run.stats.reachDebt || 1);
    coins.push(run.stats.coinsEarned || 0);
  }
  // only charms in the starting pool can be picked; the 30 locked ones would all read 0
  const sorted = Object.entries(bought).filter(([id]) => !CHARM[id].unlock).sort((a, b) => b[1] - a[1]);
  return { name, n, wins, rate: wins / n, medianDebt: median(reached), medianCoins: median(coins), top: sorted.slice(0, 10), bottom: sorted.slice(-10).reverse(), ms: Date.now() - t0 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
  const n = Number(arg('n', 300)), contract = arg('contract', 'c1'), char = arg('char', 'nim');
  setExplain(false);
  const fmt = (l) => l.map(([id, c]) => `${id}:${c}`).join(' ');
  for (const name of ['random', 'greedy', 'smart']) {
    const r = simulate(name, n, contract, char);
    console.log(`${name}: ${r.wins}/${r.n} cleared contract ${contract} (${(r.rate * 100).toFixed(1)}%), median debt reached ${r.medianDebt}, median coins ${r.medianCoins}, ${r.ms} ms`);
    console.log('  most picked : ' + fmt(r.top));
    console.log('  least picked: ' + fmt(r.bottom));
  }
}
