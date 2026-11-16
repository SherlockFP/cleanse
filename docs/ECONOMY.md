# ECONOMY — Small Luck Pier

Numbers marked **measured** come from `scripts/sim-balance.mjs 2000` on the real `src/core` modules (M1 tuning pass, seeded, 2,000 runs per bot, 400 for the lookahead bot). Numbers marked **target** are design goals that the script must reach by tuning. The script does not pass yet: 5 asserts fail in the 2026-11-16 run (section 8). Section 8 lists every number that changed in the M1 and M2 passes and why.

## 1. Formulas

| Name | Formula |
|---|---|
| Cell draw | P(symbol) = tokens of symbol / bag size, independent per unpegged cell |
| Line | 3 cells of one line symbol in a row, column or diagonal (8 lines); Knot is wild |
| Line pay | Pebble 4, Sardine 6, Tea glass 7, Lantern 10, Gull 14, Sea glass 22, Compass 34, Golden Cormorant 80, three Knots 12 |
| Line total | (base line pay + all flat line adds) x all line multipliers |
| Spin total | ceil((line totals + specials + spin flat adds) x spin multipliers); one ceil at the end; shelf order never matters |
| Held cells | a line, an adjacency pair or a per-symbol pay counts only if at least one of its cells landed (was drawn fresh) this spin |
| Tide | 6 spins; 3 pegs, held at once, free to move before every spin, reset each tide |
| Run | 5 tides, then optional Lamplight |
| Quota, tides 1-5 | Q(t) = round(15 x 2^(t-1)) = 15, 30, 60, 120, 240 |
| Quota, Lamplight | Q(t) = round(240 x 1.45^(t-5)), t >= 6 |
| Installment tier | S(c) = 1 + 0.015 x (c-1) for installment c = 1..12 (1.00 to 1.165); quota = ceil(Q x S) for tides 2 and later; tide 1 is always 15 |
| Jar | jar += spin total; at tide end jar -= quota; remainder carries, no cap |
| Mercy | once per run, if 1 <= quota - jar <= 5, the gap is paid |
| Trinket price | 5 / 9 / 14 / 22 (grade 1 / 2 / 3 / 4), no growth |
| Grade value target | a grade 1 trinket (5 coins) is worth about 8 coins per tide on the start bag (band 4-11); grade 2 about 10; grade 3 about 16; grade 4 defines a build. Measured values are in section 8 |
| Sell | floor(price / 2) |
| Token price | 4 to 20 per symbol, +2 per copy of that symbol bought earlier in the run |
| Token copy cap | 3 per bag for each special symbol, 2 for Golden Cormorant |
| Token removal | 20 coins flat, at most 3 removals per run (all shops, Lamplight included); no bag minimum, no price ramp. A free removal (Junk Cart) still uses one of the 3 |
| Reroll | 2 + 1 x (rerolls already done this visit) |
| Shop offer | trinket 70%, token 30%; trinket grade roll 60 / 30 / 9 / 1; a grade with no eligible trinket is skipped and the roll is redrawn among the other grades; the shop screen prints the effective odds for the current pool |
| Planks per run | 2 x tides cleared + 5 if won + 1 per clutch tide (quota reached on the last spin of the tide); first finished run +10, printed on the run end screen |
| Planks, other | Daily Tide +5; streak 2, 2, 3, 3, 4, 4, 8; Harbor Ledger 150 in total over its 30 steps; Sunday Market 25 per weekend (10 + 15 at the first two milestones); Double Planks ad x2 on a run, 3 per day |
| Boathouse total | 1,035 Planks |
| Harbor Ledger | 30 steps, step n costs 5 + floor(n x 35 / 29) XP (5 to 40), 1 XP per tide cleared |

Installment 12 quotas (tier 1.165): 15, 35, 70, 140, 280. With Orhan's Test (+10%) the last one is 308.

## 2. Base reel, measured

Start bag 16 tokens: Pebble 5, Sardine 4, Tea glass 3, Lantern 2, Gull 1, Knot 1.

| Case (6 spins, no trinket, 8,000 tides) | Coins per spin | Coins per tide | Zero-pay spins |
|---|---|---|---|
| no pegs | 4.71 | 28.3 | not measured |
| 3 pegs, greedy peg heuristic (shipping rule) | 8.33 | 50.0 | 34.4% |

3 pegs add 76.7% to tide income on the start bag (assert 17 asks for at least 40%). With the first line pay table (3 / 6 / 10 / 15 / 25) the same reel gave 5.09 without pegs and 10.92 with pegs (+115%), which is outside the assert 1 band (7.0-8.5 with pegs). The pay table was flattened instead of scaled: pegs help rare symbols most, so a flat table keeps the no-peg income in its band (4.6-5.6) and lowers the peg income.

Tide 1 pass rate with random pegs: 93.6% at installment 1, 93.1% at installment 12 (assert 2).

Bag editing is the strongest thing in the game. Taking one rare token (Gull, Lantern, Tea glass) out of the 16-token bag raises the odds of every other symbol by about 7% and the line rate by about 20%. A lookahead bot that picks the best removal gains much more than a fixed plan, so the removal rule is a hard count, not a price ramp. Measured (400 runs per bot, bag-focus plan: Gull, then Pebbles, then Lanterns bought; greedy never removes). Without any removal the lookahead bot wins 32.5% and the bag-focus bot 3.0%:

| Removal rule | Lookahead win | Bag-focus win (installment 1) |
|---|---|---|
| none | 32.5% | 3.0% |
| 1 per run, 10 coins | 49.5% | 9.5% |
| 2 per run, 8 coins | 54.0% | 14.2% |
| 2 per run, 14 coins | 46.5% | 9.8% |
| 2 per run, 20 coins | 44.8% | 7.8% |
| 3 per run, 8 coins | 62.0% (100 runs) | 19.5% (first plan: Gull, Pebbles, Pebbles, buying Lantern and Tea) |
| 3 per run, 16 coins | 52.8% | 14.0% |
| 3 per run, 18 coins | 51.7% | 12.8% |
| 3 per run, 20 coins (ships) | 48.3% | 11.0% (12.4% in the 2,000-run run) |
| 3 per run, 22 coins | 48.5% | 9.8% |
| 3 per run, 24 coins | 44.3% | 9.8% |
| 3 per run, 30 coins | 41.8% | 7.2% |
| 3 per run, 36 coins | 38.0% | 4.5% |

The rule that ships: 3 removals per run, 20 coins flat, no bag minimum, no price ramp. Brakes that remain: the count (3), the token price growth (+2 per copy bought) and the copy cap of 3 on special symbols. No trinket removes a brake: Junk Cart makes the first removal of a shop free and it still uses one of the 3.

Result: assert 19 passes (lookahead 48.3%), assert 18 fails (bag-focus 12.4% against 15-35%; the band is widened by 2.5 standard errors, so 13.1% would pass at 2,000 runs). The conflict from the M1 pass is smaller but not gone: every price and count that kept the lookahead bot under 50% also kept the bag-focus bot under 13%. One removal adds 17 points for the lookahead bot (it picks the best token at the best time and also buys trinkets) and 6 points for the bag-focus bot. Buying Tea tokens, or rerolling for tokens, lowered the bag-focus win rate (5% with four rerolls per shop). Tuning stopped at 5 rounds as agreed; section 8 lists what is left.

## 3. Expected value per spin by tide

Installment 1 (tier 1.00), measured. "No-build" takes a random free start trinket, then never buys. "Good build" is the greedy-buyer bot.

| Tide | Quota | Needed per spin with empty jar | No-build income per tide | No-build clears tide (cumulative) | Good-build income per tide | Good-build clears tide (cumulative) |
|---|---|---|---|---|---|---|
| 1 | 15 | 2.5 | 56 | 98.1% | 62 | 97.0% |
| 2 | 30 | 5.0 | 55 | 96.0% | 89 | 92.7% |
| 3 | 60 | 10.0 | 56 | 87.5% | 100 | 86.2% |
| 4 | 120 | 20.0 | 57 | 50.2% | 106 | 70.9% |
| 5 | 240 | 40.0 | 48 | 1.3% | 98 | 27.4% |
| 6 | 348 | 58.0 | not measured | - | not measured | - |
| 8 | 732 | 122.0 | not measured | - | not measured | - |
| 10 | 1,538 | 256.3 | not measured | - | not measured | - |

Reading: income is flat after tide 3 (the shelf is full) while the quota doubles, so tide 5 is paid from the coins carried in the jar. A player who buys nothing clears tide 4 in half of the runs and almost never wins. Lamplight is not simulated (assert 9 is not built).

Spend budget (target, not measured again): a good build spends 60-70% of its surplus in the first two shops and little after tide 3.

## 4. Target win rates

"Win" = clear tide 5.

| Player model | Installment 1 | Installment 6 (tier 1.075) | Installment 12 (tier 1.165) |
|---|---|---|---|
| No-build bot (free pick only) | under 2% | 0% | 0% |
| Random-buyer bot (buys the first affordable offer, random pegs on pairs) | 10-15% | 3-6% | under 2% |
| Greedy-buyer bot (stands in for a skilled player) | 30% +/- 5 | 20% +/- 5 | 10-15% |
| Bag-focus bot (free pick only, then buys tokens and removals toward a Lantern-heavy bag) | 15-35% | not above the greedy bot | not above the greedy bot |
| Lookahead bot (for each offer, simulates about 200 tides with and without it, buys the best) | under 50% | under 40% | under 30% |

These are targets. Measured 2026-11-16 (2,000 runs per bot, 400 for lookahead; the 3-removal rule of section 2):

| Player model | Installment 1 | Installment 6 | Installment 12 |
|---|---|---|---|
| No-build bot | 1.3% | not measured | not measured |
| Random-buyer bot | 9.4% | not measured | not measured |
| Greedy-buyer bot | 27.4% (full lite pool 27.8%) | 20.1% | 12.3% |
| Bag-focus bot | 12.4% (target 15-35%: fails) | 7.8% | 2.9% |
| Lookahead bot | 48.3% | not measured | not measured |

The tier slope was cut from 0.06 to 0.04 and then to 0.015. At 0.04 the greedy bot won 2.8% at installment 12, at 0.025 it won 5.0%, at 0.015 it wins 12.3%.

- **First win by run 4-6** for a new human: random-buyer level at run 1 moving toward greedy level by run 5 gives a median first win at run 4-6. The free start trinket, the unmultiplied tide 1 and mercy are what keep run 1 from ending at tide 1.
- **30% for skilled** is the installment 1 greedy-bot number. A human who reads synergies should beat the bot by 5-10 points.
- Boathouse unlocks add variety, not raw power. The sim runs the bot with the starting pool and with the full pool; win rate difference must stay within 8 points.
- Tide 1 pass rate: 90% or higher for every bot that pegs, at every installment. The tier does not multiply tide 1, so its quota is always 15.
- Median run length for the greedy bot: 3.5-4.5 tides.

## 5. Meta pacing

| Item | Value |
|---|---|
| Planks, average run (3.5 tides, 15% wins, 1 clutch tide) | about 9 |
| Planks, day with 5 runs + Daily Tide + streak | about 50-60 |
| Planks, Harbor Ledger (150 over about 200 runs) and Sunday Market (25 per weekend) | about 7 more per day |
| Planks, same day with 3 Double Planks ads | about 27 more per day |
| Boathouse complete (1,035), no ads | day 16-22 |
| Boathouse complete, 3 Double Planks every day | day 11-14 |
| Installment 12 | 12 won runs. At win rates falling from 30% to about 12% that is about 60 runs: day 12-15 at 4-5 runs per day |
| Harbor Ledger complete (about 690 XP) | about 200 runs |

The story takes about 2 weeks, not 3-5. That is accepted. Weeks 3 and 4 are carried by the last builds, Open Season, the Album, Daily Tide and the Harbor Ledger. A player who watches every Double Planks ad finishes the boathouse at about the same time as the story.

Double Planks is capped at 3 per day. The only Planks sold for money are the 60 in the one-time starter pack, so no player can buy the boathouse.

## 6. What `scripts/sim-balance.mjs` must assert

The script imports the real `src/core` modules (no copy of the rules), uses the seeded rng and exits non-zero on any failed assert. Five bots: no-build, random-buyer, greedy-buyer, bag-focus, lookahead. Default 100,000 runs per bot (10,000 for the lookahead bot); `--fast` runs 10,000 with wider bands.

1. Start bag: coins per spin with no pegs is 4.6-5.6 and with 3 pegs is 7.0-8.5; zero-pay spin rate with pegs is 30-42%. (The old band, 5.5-6.5 with pegs, belonged to the old peg rule. If base income rises, the quota base in tuning step 2 rises with it.)
2. Tide 1 pass rate is at least 0.90 for the random-peg bot, at installments 1 and 12. Tide 1 is never multiplied by the tier, so the quota is 15 in both cases; the assert also checks that.
3. No-build bot (takes the free start trinket, then never buys) win rate under 0.02 at installment 1.
4. Random-buyer bot win rate 0.10-0.15 at installment 1.
5. Greedy-buyer bot win rate 0.25-0.35 at installment 1, 0.15-0.25 at installment 6, 0.10-0.15 at installment 12 (with Orhan's Test at tide 5).
6. Greedy bot with starting pool versus full pool: win rate gap 0.08 or less.
7. No single trinket: removing it from the pool changes the greedy win rate by more than 0.04 (dominance check), and every trinket is bought in at least 1% of greedy runs (dead-trinket check). Built: the dead-trinket check only, on the 35 lite trinkets in the full lite pool greedy runs. The dominance check needs the shop to exclude one item and is not built. The same dominance check runs for tokens, and names Kelp explicitly: a greedy bot that is given 3 Kelp tokens (with and without Kelp Pot) at the first shop must not gain more than 0.04 win rate, and Kelp income must stay under 20% of that bot's tide income. The same test runs for 2 Golden Cormorants with Cormorant Egg.
8. No family: a bot forced into one family wins under 0.12 or over 0.45 at installment 1. Built: greedy that buys only trinkets of one family (no tokens), full lite pool, 300 runs, for the 5 families that have lite trinkets (catch, hearth, peg, tide, ledger); the win rate must stay inside 0.12-0.45.
9. Lamplight (built: greedy plays on after tide 5, 300 runs, tide cap 30): among winning greedy runs that continue, the median last tide is 7-9; fewer than 0.5% of all runs pass tide 14 (no infinite build). A held line that pays twice, or any pay from held cells alone, fails this assert.
10. One spin never pays more than 40 x the tide quota (overflow guard).
11. (Built only as a spread check, see section 8.) Each creditor event lowers the greedy tide-5 pass rate inside its own band, never more: 5-15 points for auditor, fog_bank, gull_strike, short_day and low_water; 10-20 points for stamp_duty and collector. gull_strike is tested on a 16-token and on a 10-token bag and both must be in the band. orhans_test is exempt here; it is covered by assert 5 at installment 12.
12. Each Tide Chart moves the greedy win rate by no more than 6 points either way.
13. Mercy fires in 8-20% of runs.
14. Shop: observed grade frequencies are within 1 point of the effective distribution the shop screen prints for that pool (the redraw rule in section 1), tested separately for the start pool (60.6 / 30.3 / 9.1 / 0) and the full pool (60 / 30 / 9 / 1); observed symbol frequencies per cell are within 0.5 points of the bag percentages (honest-odds check over 1,000,000 draws).
15. Determinism: the same seed and the same inputs give the same run hash, twice.
16. Planks: average per greedy run is 8-12.
17. Pegs: on the start bag, 3 pegs raise mean tide income by at least 40% over no pegs.
18. Bag-focus bot win rate is 0.15-0.35 at installment 1 and is not above the greedy bot at installments 6 and 12. The bot spends the run's 3 removals first (the lone Gull, then Pebbles) and then buys Lanterns.
19. Lookahead bot win rate is under 0.50 at installment 1. Its most-bought item is printed, because that is the item a human will find.

`check-content.mjs` adds the grade value test: every grade 1 trinket with a flat, bag-independent effect is worth 4-8 coins per tide on the start bag.

Output: one table per bot (pass rate per tide, mean coins per spin per tide, mean spend) written to stdout, so the numbers in section 3 can be replaced with real ones.

## 7. Tuning order

1. Peg rule and peg count (assert 17), then line pay values and start bag (asserts 1, 2).
2. Quota base and growth (asserts 3-5).
3. Token removal count and price, token price growth and copy caps, with the bag-focus bot and the lookahead bot (asserts 9, 10, 18, 19).
4. Trinket numbers, one family at a time (asserts 7, 8, grade value test).
5. Tier slope (assert 5).
6. Events and charts (asserts 11, 12).

## 8. M1 tuning pass: what changed and what is open

The code and this file disagreed before this pass (the code had quota growth 1.95, line pay 2 / 4 / 7 / 10 / 17, trinket prices 6 / 10 / 16 / 26, removal 9 + 4n and bag minimum 12; this file had 1.8, 3 / 6 / 10 / 15 / 25, 8 / 14 / 22 / 35, 4 + 2n and 10). Neither set passed the sim. Both now hold the set below. GDD.md (sections 6-8) and CONTENT.md (sections 1-2) were synced to the code on 2026-11-16 (see the M2 pass below).

| Number | Before (this file) | Now | Reason |
|---|---|---|---|
| Line pay | 3 / 6 / 10 / 15 / 25, Knots 20 | 4 / 6 / 7 / 10 / 14, Knots 12 | assert 1: pegs paid 10.92 per spin, band 7.0-8.5 |
| Quota growth | 1.8 (15 to 157) | 2 (15 to 240) | asserts 3-5: income is higher with the new pegs |
| Tier slope | 0.04 | 0.015 | assert 5 at installment 12 |
| Trinket price | 8 / 14 / 22 / 35 | 5 / 9 / 14 / 22 | assert 4: the random buyer lost more coins than its trinkets paid back |
| Shop offer | 60% trinket | 70% trinket | assert 4: random token buys have a negative return |
| Token removal | 4 + 2n, floor 10 | 12 + 6n, floor 16 (replaced in the M2 pass by 3 per run at 20 coins) | assert 19 (section 2) |
| Token price growth | +2 | +2 | the code had +1; restored |

Trinket numbers changed so that the free pick and a random purchase are worth about the same (start bag, coins per tide, 3,000 tides, greedy pegs; value before the change in brackets):

| Trinket | Change | Value |
|---|---|---|
| steady_hand | +6 to +3 | 8.5 (16.9) |
| pebble_jar | +5 to +4 | 8.4 (10.5) |
| salt_barrel | +4 to +5 | 8.5 (6.8) |
| fish_cart | +8 to +20 | 7.4 (2.9) |
| first_light | x2 to x3 | 9.2 (4.6) |
| tide_table | +3 to +4 | 8.0 (6.0) |
| dry_spell | x1.5 to x1.75 | 9.3 (6.1) |
| tin_cup | 6 to 8 coins | 8.0 (6.0) |
| ice_crate | +3 to +12 per held Sardine | 7.4 (1.9) |
| wick_trimmer | x2 to x3 | 5.6 (2.8) |
| lucky_sandal | +15 to +30 | 8.9 (4.4) |
| skipping_stone | +1 (max 3) to +2 (max 6) | 9.2 (4.6) |
| fish_scale | +2 (max 12) to +6 (max 30) | 10.7 (3.7) |
| tea_garden | x2 to x3 | 5.8 (2.9) |
| full_net | 6 Sardines to 5 | 2.9 (0.4) |
| sea_chest | 2 to 3 coins per trinket | not measured (tide-end coins) |

Unchanged and measured: samovar_tap 8.1, lantern_oil 8.5, sugar_cube 8.9, night_tide 10.4, spare_peg 4.1, fish_hook 10.2, pier_cat 8.5, grandmas_cup 9.4, brass_peg 12.1, orhans_watch 16.7. The values were taken before two rule fixes (Dry Spell no longer carries a zero spin into the next tide; Warm Rug stops after spin 6), so dry_spell is a little lower now.

### M2 balance pass, 2026-11-16

| Number | Before | Now | Reason |
|---|---|---|---|
| Token removal | 12 + 6 x removals done, bag minimum 16 | 3 per run, 20 coins flat, no bag minimum | asserts 18 and 19 (section 2). `PRICES.removal` and `REMOVALS_PER_RUN` in econ.js; `removeToken` answers `no removals left` after the third |
| Junk Cart | first removal each shop free, still climbs the ramp | first removal each shop free, still uses one of the 3 | same rule, new counter |
| Bag-focus bot | removed Pebbles then Sardines, bought Lantern and Tea | removes the Gull, then Pebbles; buys Lanterns | the plan that won most under the 3-removal rule (section 2) |

Final output of `npm run sim` (node scripts/sim-balance.mjs 2000 --quiet, 1,944 s at low priority), 2026-11-16, shipping numbers. Assert 11 in this run is the first version of the check and is explained below the block.

```
ok   assert 1: start bag per spin | no pegs 4.71/spin, 3 pegs 8.33/spin, zero-pay with pegs 34.4%
ok   assert 2: tide 1 pass >= 0.90, random pegs | installment 1 93.6%, installment 12 93.1%, quota 15/15
ok   assert 3: no-build win < 0.02 | win 1.3%
ok   assert 4: random-buyer win 0.10-0.15 | win 9.4%
ok   assert 5: greedy win 25-35 / 15-25 / 10-15 (no Orhan's Test) | installment 1 27.4%, 6 20.1%, 12 12.3%
ok   assert 6: start pool vs full lite pool gap <= 0.08 | start 27.4%, full lite 27.8%
FAIL assert 7: every lite trinket bought in >= 1% of full-pool greedy runs (dead-trinket half only) | never bought enough: warm_rug, night_tide, slack_water, second_wind, lucky_ledger, hagglers_cap, junk_cart, kelp_pot
FAIL assert 8: forced single family wins 0.12-0.45 | catch 18.0%, hearth 18.0%, peg 9.3%, tide 19.0%, ledger 7.0%
FAIL assert 9: Lamplight: median last tide of winners 7-9, under 0.5% pass tide 14 | median last tide 6 (95 winners of 300), pass tide 14: 0.0%
ok   assert 10: one spin <= 40 x quota | worst spin / quota = 14.30
FAIL assert 11: first version (each forced event against the mixed baseline) | base 42.8%; auditor -0.5, fog_bank -0.5, short_day --2.7, low_water -0.9
FAIL assert 12: each chart moves greedy win by <= 6 points | spring_tide +4.3, neap_tide -9.7, bare_line -20.0, market_day -4.7, tight_shelf -19.3, long_evening -2.0
ok   assert 13: mercy fires in 8-20% of greedy runs | 9.3%
ok   assert 14: shop grade odds and honest cell odds | start pool (60.6/30.3/9.1/0.0) worst gap 0.12 pt, full lite pool (60.6/30.3/9.1/0.0) 0.12 pt, cell frequency 0.096 pt over 1,000,008 draws
ok   assert 15: same seed, same hash | 12 bot runs, each twice
ok   assert 16: planks per greedy run 8-12 | 9.3
ok   assert 17: pegs add at least 40% (GATE) | 3 pegs raise tide income 28.3 -> 50.0 = +76.7%
FAIL assert 18: bag-focus win 0.15-0.35, not above greedy at 6 and 12 | installment 1 12.4%; 6: 7.8% vs greedy 20.1%; 12: 2.9% vs greedy 12.3%
ok   assert 19: lookahead win < 0.50 | win 48.3%; most bought: reroll x2355, remove:gull x344, remove:tea x292, token:sardine x240, remove:pebble x175
sim-balance: 6 failed (1944 s)
```

The tide-5 event is always drawn by the core, so the first version of assert 11 compared a forced event with a baseline that already contains one, and could not show a drop. It was replaced by a spread check over the four lite events and re-measured alone (`--bots extra`, 758 s, same seeds): `ok assert 11: lite events: tide-5 pass within 10 points of the mean of the four (spread substitute) | mean 43.0%; auditor 42.3%, fog_bank 42.3%, short_day 45.5%, low_water 41.9%`. That run repeated asserts 8, 9 and 12 with the same numbers. A full run of the current script therefore ends with 5 failures: 7, 8, 9, 12, 18. The current script was not run end to end in one go.

What the failures say:
- **7:** eight lite trinkets are bought in under 1% of full-pool greedy runs (warm_rug, night_tide, slack_water, second_wind, lucky_ledger, hagglers_cap, junk_cart, kelp_pot). The greedy bot values only sampled income of the next tide, so effects that save coins or change the quota are invisible to it. Open for the trinket pass.
- **8:** forced into one family, greedy wins 18% (catch), 18% (hearth), 9.3% (peg, only 3 trinkets), 19% (tide), 7.0% (ledger). Peg and ledger are under 0.12. Both are support families.
- **9:** the median last tide of winners is 6: the tide-6 quota is 348 against about 100 income. No run passes tide 14. Lamplight is a short bonus, not an endless build.
- **12:** bare_line (1 peg) -20.0 and tight_shelf (3 slots) -19.3 are far outside 6 points, neap_tide -9.7 is outside. They are picked only from installment 4 on; the band or the chart numbers need a design call.

Open:

- **Assert 18 fails.** Bag-focus wins 12.4% at installment 1 (band 15-35%; 13.1% would pass at 2,000 runs). Choices: widen the band to 10-35%, raise the removal price to 24 (lookahead about 44%, bag-focus about 10%), or accept a lookahead bot near 50% at 16-18 coins. See section 2.
- Assert 7 (dominance half, Kelp and Cormorant tests) is not built: the shop has no pool-exclusion hook. Assert 11 is built only as a spread check: the real event-versus-no-event drop cannot be measured because the core always draws an event at tide 5. Asserts 7, 8, 9, 12 fail as listed above.
- Grade 3 trinkets other than orhans_watch are still under the grade value target of 16.
