# EFFECTS: the effect language (v2)

Charms, curses, deals, terms cards, characters and contracts all use the same rule shape. `src/core/effects.js` is the only interpreter.

```json
{ "trigger": "onPattern", "cond": { "sym": "moth" }, "effects": [ { "type": "retrigger", "n": 1 } ] }
```

- An item has `rules: [rule, ...]`. Deals have `boon: [effect, ...]` (run once, trigger `now`). Terms cards and contracts have `effects` / `rules` as a flat effect list that is active while they apply.
- `text` is composed from the rule by `scripts/gen-v2-data.py`. Do not hand-edit text in the JSON; change the rule or the phrase table and regenerate.
- `{c:N}` inside a text means "N coins x the price scale S of the current debt". The UI prints the multiplied number.

## 1. Triggers

| trigger | fires | context given to conditions and effects |
|---|---|---|
| `passive` | never "fires"; its effects are part of the modifier snapshot while the item is held and `cond` is true | run state |
| `now` | once, when a deal is signed | run state |
| `onRunStart` | after the starting kit is given | |
| `onDebtStart` | when a debt begins | debt index |
| `onRoundStart` | after the terms card is picked, after Heat cools | |
| `onSpinStart` | after the Favourite is picked, before the roll | spin index in round |
| `onSymbolLand` | once per matching cell, cells 0 to 14 in order, after transforms | cell index, symbol |
| `onPattern` | once per paying pattern, before it pays | pattern id, cells, symbol |
| `onSpinEnd` | after all patterns paid, before the spin total is multiplied | pattern list, grid |
| `onDud` | a spin with zero paying patterns that is not a Scorch | |
| `onScorch` | a Scorch, after the purse burn | |
| `onStoke` | each tap of STOKE | |
| `onRoundEnd` | after the last spin, before interest | |
| `onInterest` | when interest of at least 1 coin is paid | amount |
| `onBank` | each bank action | amount |
| `onDebtPaid` | the debt reaches its target | rounds left, purse |
| `onBuy` / `onSell` | a charm is bought / another charm is sold | the charm |
| `onSellSelf` | this charm is sold | |
| `onReroll` | each shop reroll | |
| `onTrick` | a trick is used | trick id |
| `onDeal` / `onRefuse` | a deal is signed / all offers refused | deal id |
| `onCurse` | a curse is about to be added | curse id |

## 2. Conditions

All keys in `cond` must hold. An empty `cond` is always true.

| key | value | true when |
|---|---|---|
| `sym` | symbol id | the landing symbol or the pattern's symbol is this |
| `group` | `low`, `high` | the symbol's `group` in `symbols.json` matches |
| `zone` | `corner`, `edge`, `midrow` | cell is 0, 4, 10, 14 / in column 0 or 4 / in row 1 |
| `pattern` | pattern id | the pattern is this type |
| `minCells` | n | the pattern has n or more cells |
| `hasWisp` | true | the pattern contains at least one Wisp |
| `favoured` | true | the pattern's symbol is a Favourite of this spin |
| `minPatterns` | n | n or more patterns paid this spin (retriggers do not count) |
| `distinctMin` | n | n or more different pattern ids paid this spin |
| `heatMin` / `heatMax` | n | Heat >= n / Heat <= n at that moment |
| `cursesMin` | n | active curses >= n |
| `spinIs` | `first`, `last` | first / last spin of the round (after spin changes) |
| `countMin` | `[symbol, n]` | n or more of that symbol on the grid |
| `roundsLeftMin` | n | unused rounds when the debt is paid >= n |
| `purseMaxPct` | p | purse after paying <= p% of the debt target |
| `every` | n | a counter on this rule, kept for the run, reaches a multiple of n. It counts only firings where the other keys held |
| `chance` | p | a roll on the `fx` rng stream is under p% |
| `limit` | `round`, `debt` | the rule has not already fired this round / debt |

Check order: all plain keys, then `limit`, then `every`, then `chance`.

## 3. Effects

Common fields: `n` (amount), `scope`, `per`.

**Scope.** `spin`, `round`, `debt` make a temporary modifier that is dropped at the end of that span. With no scope: an effect on a `passive` rule lasts while the item is held; an effect on any other trigger is **permanent for the run** and stays even if the item is sold.

**Per.** The amount is multiplied by a count read at that moment:

| `per` | count |
|---|---|
| `curses` | active curses |
| `heat` | Heat |
| `family:<id>` | held charms whose `tags` include the family (this charm counts) |
| `sym:<id>` | cells on the grid showing that symbol (Wisps do not count for other symbols) |
| `emptySlots` | empty charm slots |
| `tricks` | tricks in the pockets |
| `deals` | deals signed this run |
| `stack` | this charm's charge counter |
| `removed` | symbols removed from the machine this run |
| `purse100` | floor(purse / (100 x S)), max 10 |

| type | fields | meaning |
|---|---|---|
| `coins` | n | purse += n x S. Flat coins are added after the spin total is multiplied. Outside a spin they are added at once |
| `symValue` | n, sym | add n to the value of `sym`. `sym` may be an id, `low`, `high`, `all`, `favoured` (the Favourite at evaluation time), `that` (the trigger's symbol), `random` (one scoring symbol picked on the `fx` stream at that moment). Value cannot go below 0 |
| `symMult` | n, sym | add n to the symbol mult (base 1) |
| `patMult` | n, pattern | add n to the pattern mult. `pattern` may be an id, `all`, `big` (5 or more cells), `this` (only the pattern in this `onPattern` call, only this pass) |
| `allMult` | n | multiply the spin total by n. All `allMult` values multiply together. On a `passive` rule it applies to every spin while the condition holds |
| `luck` | n | add n Luck. Luck is clamped to 0..12 after all sources |
| `spins` | n | add n spins to the current round (at `onRoundStart`: to the round about to start). A round never has fewer than 1 spin |
| `interest` | n | add n percentage points to the interest rate |
| `wick` | n | Wick += n |
| `heat` | n | Heat += n, clamped to floor..10 |
| `weight` | n, sym | multiply the symbol's weight by n. Weight multipliers multiply together |
| `transform` | n, from, to | after the roll, change up to n cells showing `from` into `to`, lowest cell index first |
| `place` | n, sym, zone? | after the roll, overwrite n cells with `sym`: all cells of the zone if given, else cells picked on the `fx` stream. Pinned cells and Ash from "dead centre" are not overwritten |
| `retrigger` | n | the current pattern pays again n times. At most 3 extra pays per pattern from all sources. Rules do fire again on a repeat pass, but `retrigger` effects do not |
| `trick` | n | add n random tricks while pockets have room |
| `stack` | n | add n to this charm's charge counter |
| `slot` | n | charm slots += n (1..8). If slots drop below the charms held, the player picks one to burn |
| `gainCharm` | rarity | add a random unlocked charm of that rarity. If no slot is free it waits in the shop for free |
| `gainCurse` | n | add n random curses not already held |
| `removeSymbol` | n | the player picks n scoring symbols; weight becomes 0 for the run (max 3 removed in total) |
| `flag` | flag, v | sets a named rule switch. See section 5 |

## 4. Fixed order of evaluation

**Modifier snapshot.** Built at each spin start and whenever inventory changes. Order: contract rules, character rules, curses in the order gained, deal boons in the order signed, terms card, bench work, permanent effects in the order earned, then charms left to right. Additive values add. `allMult` and `weight` multiply. For flags with a value, the last writer wins, except `scorchNeeds` (highest), `heatFloor` (highest), `shopDiscount` and `shopMarkup` (summed).

**One spin.**

1. `onSpinStart` rules. Pre-spin tricks already used are applied.
2. Pick the Favourite (or two): weighted pick among scoring symbols with weight above 0, on the `spin` stream. Skipped if a rule or trick fixed it.
3. Weights: base x bench x weight effects; Favourite x (1 + Luck); Ash = 1.2 x Heat + `ashBase`.
4. Roll each cell that is not pinned, cell 0 to 14, on the `spin` stream.
5. Fixed cells: dead centre (cell 7 becomes Ash).
6. `transform`, then `place`, in snapshot order.
7. Post-spin tricks, in the order the player uses them. Then COLLECT.
8. `onSymbolLand`, cell 0 to 14; inside a cell, snapshot order.
9. Scorch check: Ash count >= `scorchNeeds` (default 3), unless a Chili protects the spin. On a Scorch: total = 0, purse loses ceil(purse x burn%), Heat −3, `onScorch` fires, flat coins earned in steps 8 and here are still added, go to step 14.
10. Find patterns. For each pattern type in `patterns.json` order and each placement in listed order: all cells show the same scoring symbol, Wisps allowed, at least one non-Wisp. Then drop any pattern beaten by a found pattern of the same symbol whose cells contain it.
11. For each remaining pattern, in that order: fire `onPattern`, then `pay = floor(value x symMult x patMult)`. Halve it if `smallHalf` applies (3 cells), set it to 0 if `smallDead` applies, multiply by `bigX` if 4 or more cells. Repeat for retriggers.
12. `onSpinEnd`. If no pattern paid: `onDud`, pity Luck +1.
13. `total = floor(sum of pays x (1 + heatStep x Heat) x product of allMult)`. A product of allMult above 6 is soft-capped to `6 x sqrt(product / 6)`. `heatStep` is 0.15 by default.
14. purse += total + flat coins. Pity Luck resets if a pattern paid. Round and spin scopes are cleaned up. If `lastTwice` and this was the last spin, steps 8 to 14 run once more on the same grid.

**Round end.** `onRoundEnd`, then interest = min(floor(purse x rate%), floor(debt x cap%)), then `onInterest`, then the shop.

## 5. Flags

| flag | v | read by |
|---|---|---|
| `heatStep` | percent per Heat level | scoring step 13 |
| `heatNoCool`, `heatFloor`, `startHeat`, `noStoke` | -, n, n, - | run.js Heat handling |
| `scorchNeeds`, `scorchBurn` | Ash count, percent | step 9 |
| `ashBase`, `deadCentre`, `ashIsFav` | n, -, - | steps 3, 5, 10 |
| `seeNextFav`, `pickFirstFav`, `twoFavs`, `favPerRound`, `pickFav`, `hideFav` | | step 2 and the HUD |
| `fiveNeedsFour` | | step 10: a 5-cell pattern matches with one odd cell; that cell counts as a Wisp |
| `maskWild` | | step 10: Mask also matches as a Wisp |
| `smallHalf`, `smallDead`, `bigX`, `firstSpinDead`, `lastTwice` | | steps 11 to 14 |
| `noInterest`, `noInterestRound`, `interestHalf`, `interestCapX` | | round end |
| `bankX` | multiplier | bank action |
| `shopDiscount`, `shopMarkup`, `shopOffers`, `shopExtra`, `rerollDouble`, `benchDiscount`, `sellFull` | | shop.js |
| `trickPockets`, `firstTrickFree` | | run.js tricks |
| `dealOffers`, `mustSign`, `refuseWick`, `cancelCurse` | | deals.js |
| `saveDeadline`, `extraLife`, `roundsAdd`, `rounds`, `debtCut`, `debtMul` | | run.js deadline and debt setup |
| `spinsRound`, `spinsLess`, `startCurses`, `ghostHire` | | run.js round setup |

## 6. Worked examples

S is the price scale of the current debt. Heat 0 and no charms unless stated.

1. **Plain line.** Moths in cells 0, 1, 2. `2 x 1 x 1 = 2`. Total 2.
2. **Wild and beats.** Row 1 shows Tooth, Wisp, Tooth, Tooth, Eye. Line of 4 on cells 5 to 8: `3 x 1 x 2 = 6`. The two Lines of 3 inside it are beaten. Total 6.
3. **Two shapes, one cell shared.** Candles in 0, 5, 10 (Column) and 0, 6, 12 (Diagonal). Column `2 x 1 x 1 = 2`. Diagonal `2 x 1 x 1.5 = 3`. Total 5.
4. **Heat.** Heat 6, Line of 5 of Eyes: `4 x 1 x 4 = 16`. Spin total `16 x 1.9 = 30.4`, so 30.
5. **Value charm.** Tallow Stub (Candle value +2). Line of 3 of Candles: `(2 + 2) x 1 x 1 = 4`.
6. **Symbol mult and pattern mult.** Red Needle (Line of 3 mult +0.5) and Small Fry Union with two Swarm charms held (low symbols mult +0.5). Line of 3 of Moths: `2 x 1.5 x 1.5 = 4.5`, so 4.
7. **Scaling with the grid.** Night Swarm, six Moths on the grid, a Diagonal of Moths: pattern mult `1.5 + 0.25 x 6 = 3`. `2 x 1 x 3 = 6`.
8. **Retrigger and flat coins.** Dust Queen and Moth Jar, debt 3 (S = 4), five Moths landed, one Line of 3 of Moths. Line pays 2, then 2 again: 4. Moth Jar: 5 x 1 x 4 = 20 flat. Purse +24.
9. **Cross with a Wisp.** Lanterns in 2, 6, 8, 12 and a Wisp in 7. Prism (+1 to this pattern) and Lost Light (+3 value this spin) both fire. `(8 + 3) x 1 x (6 + 1) = 77`. The Halo is beaten by the Cross. Total 77.
10. **Three multipliers on the total.** Short Fuse (x2 this round), Heat 4 (x1.6), Fair Tapestry (4 or more patterns: x3). Four patterns sum to 20. `20 x 1.6 x 2 x 3 = 192`.
11. **Scorch.** Heat 8, purse 500, three Ash land. The spin pays 0. Purse loses 50 and is 450. Heat becomes 5. With Ash Cake at debt 4 (S = 8): +2 Wick and +80 coins, purse 530.
12. **Curse against boon.** Hairline Crack (3-cell patterns pay half) and Firm Handshake with two deals signed (all pattern mults +1). Line of 3 of Crows: `6 x 1 x (1 + 1) = 12`, halved to 6. A Line of 4 of Crows: `6 x 1 x (2 + 1) = 18`, not halved.
13. **Full Fair.** All 15 cells are Moths or Wisps. Paying: Full Fair 50, three Lines of 5 at 8 each (24), five Columns at 2 (10), six Diagonals at 3 (18), two Vees at 10 (20), four Sawtooths at 8 (32), Four Corners 6, Cross 12, Frame 20. Lines of 4, Lines of 3 and the Halo are beaten. Total 192 before Heat.
