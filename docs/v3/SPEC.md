# SPEC v3: the build spec

Status: build spec. Date 2026-11-16. This file wins over `docs/v3/PANTHEON.md`, `docs/v3/PROGRESSION.md` and `docs/v3/GAP.md` where they disagree. It keeps the v2 engine (`src/core`, `docs/v2/EFFECTS.md`) and adds to it. All numbers are first-pass and **not simulated**; the sim targets in section 13 decide.

Owner feedback this answers: "I don't know how to play it. Not detailed. No progression. Very superficial. No gods. Nothing like CloverPit." Plus: "Take CloverPit's mechanics freely, do better, lots of content, start in Thailand and get rich, deal with the devil."

Inputs read: `docs/v2/GDD.md`, `docs/v2/EFFECTS.md`, `docs/v2/TECH.md`, `docs/v2/THEME-TH.md`, `docs/v3/AUDIT.md`, `docs/v3/GAP.md`, `docs/v3/PANTHEON.md`, `docs/v3/PROGRESSION.md`, `art/sheets.json`, the headers of `src/core/*.js`, `src/tutorial.js`, `src/core/data/config.json`, `charms.json`.

## 0. Names and hard rules

`docs/v2/THEME-TH.md` now exists and is the name canon. It replaces the placeholder names in PANTHEON and PROGRESSION. Ids never change.

| id / v3 doc word | UI name (en) | tr | th |
|---|---|---|---|
| `brimble` (PANTHEON "Mr. Brimble") | Mr. Ruby | Bay Ruby | มิสเตอร์รูบี้ |
| `wick` | Caps | Kapak | ฝาขวด |
| `wax` (PROGRESSION "Savings") | Stash | Birikim | เงินเก็บ |
| `heat` / Stoke | Spice / Spice Up | Acı / Acılandır | เผ็ด / เพิ่มเผ็ด |
| `ash` / Scorch | Soot / Flare-up | İs / Parlama | เขม่า / ไฟลุก |
| Favourite | the Special | Gözde | เมนูเด็ด |
| PANTHEON "Powers" | Spirits | Ruhlar | ภูตตลาด (Thai reader to confirm) |
| PANTHEON "Tin" | the Tin (biscuit tin) | Teneke | ปี๊บ |
| PROGRESSION "Monsoon 1-10" | Storm 1-10 (the hex family is already called Monsoon) | Fırtına | พายุ |
| PROGRESSION place names | THEME-TH section 6 names (Soi Cart, Train Market, Yaowarat, Khao San Rush, Pattaya Low Season, Chiang Mai Haze, Phuket Beach Club, Riverside Boutique, Sukhumvit Condo Launch, The Sky Bar) | | |
| bank | the Kiosk | Kiosk | ตู้ฝากเงิน |

Hard rules (from THEME-TH and GDD 16), checked by `check-content.mjs`:
- No Buddha, monk, temple, shrine, spirit house, amulet, sacred thread, garland, naga, garuda, white elephant, sky lantern, sacred tattoo. No king, queen, crown, throne, royal, palace. The PANTHEON "Tin" stays a biscuit tin; the call happens on a plain street phone. GAP's "spirit house bank" and "Yaksha eye" are **not** used.
- No player-facing "bet, wager, stake, casino, slot, jackpot, gamble, lottery, odds, chips".
- Spirits are invented neighbours. Folklore roots and risk calls are in PANTHEON section 2. Two looks change here to move further from real figures: Little Gold is a gold-painted wind-up tin toy (not a doll or child figure), The Waiting Lady is a canal-pier ticket collector in a poncho (no bridge, no ghost wife). A Thai reader signs off every name and line before release.

## 1. What stays, what changes in the v2 engine

Keep: 5x3 grid, symbols, patterns, scoring order (EFFECTS section 4), Spice and Soot, terms cards, charms and families, tricks, bench, deals and curses, contracts and debts, early pay, skip a night, Pawn, Endless, RNG streams, save-after-every-action.

Change:
1. **Kiosk banking (fixes AUDIT fix 2).** Interest is paid on the **Kiosk balance** (banked coins), not on the purse. Rate `config.interest.basePct` (8%), cap 25% of the debt target. Banked coins count toward the debt, are safe from a Flare-up and cannot be taken out. The purse is spending money for the stall and the Tin. One rule, no contradiction: *bank to earn, keep to spend*.
2. **Pay now.** When the Kiosk balance reaches the target, a PAY NOW stamp appears. Tapping it pays early (v2 early-pay rewards). At the deadline the purse is banked automatically, as in v2.
3. **One spin action (fixes AUDIT fix 3).** The lever and the SPIN button always spin. Scoring is automatic. If a post-spin trick is in a pocket, the result waits and a separate SCORE button appears in the pocket row; SPIN is greyed with the caption "Score first". No button ever changes meaning.
4. **Phone calls replace the bare deal screen.** Mr. Ruby's deals become his red card on the phone (section 3.4). `deals.js` still makes the offer.
5. **No raw ids on screen** (AUDIT section 6). Every chip, line and log uses `name[lang]`.
6. **Pace.** The goal bar shows "on pace" or "behind": needed per remaining spin vs average pay of the last 5 spins.
7. **Difficulty pass.** AUDIT: debt 1 of c1 is free, debt 5 a wall. Core lane retunes c1 debts with the sim (start point 80, 200, 450, 900, 1,800) to hit section 13 targets.

## 2. The first-run tutorial (forced, under 4 minutes)

Goal: by 4:00 a new player has pulled the lever, read a pattern, banked, seen the deadline, bought a charm, given an offering to a spirit and seen a devil's deal.

Rules:
- Runs once on first launch (`meta.tutorialDone == false`). Replay from Settings. No skip on the first launch.
- Fixed seed `TUTORIAL_SEED` (find a new one with `scripts/find-tutorial-seed.mjs` for v3 steps: spin 1 pays a Line of 3, spin 2 pays a Line of 4 and a Column, debt 1 is paid by night 2 for an average player).
- **One action at a time.** A dark overlay covers the screen except one hole around the target. Taps outside the hole do nothing. The pointing hand (`ui/hand`) sits on the target and plays its gesture (tap bob, or a drag-down arc for the lever).
- One sentence caption in a paper strip at the top or bottom, whichever does not cover the target. Max 12 words in en.
- A step advances on its event, never on a timer (story panels advance on a tap anywhere).
- Spirits in the first run: only Mr. Ruby, Auntie Beckon, Little Gold (PANTHEON 3.6). No Red Eye, no Honk, no Blender in run 1.

Step table (`src/tutorial.js` exports `TUTORIAL_STEPS`; each step `{id, target, gesture, caption, until}`). `target` is a layout anchor name from section 10.4. Times are expected, not enforced.

| # | t | target | gesture | caption key: en text | advances on |
|---|---|---|---|---|---|
| 1 | 0:00 | panel `story/p1` | none | `tut.p1`: Nim's cart burned on the first night of the market. | tap |
| 2 | 0:05 | panel `story/p2` | none | `tut.p2`: Mr. Ruby lent her the money. Read the small print. | tap |
| 3 | 0:10 | panel `story/p3` | none | `tut.p3`: Pay each debt in time, or he keeps her flame. | tap |
| 4 | 0:16 | `goalBar` | tap | `tut.goal`: Your debt: 80 coins in 3 nights. | tap goal bar (opens its one-line sheet, auto-closes) |
| 5 | 0:22 | `lever` | drag down | `tut.lever`: Pull the lever down to spin. | `spin` |
| 6 | 0:30 | `pattern:0` | tap | `tut.line`: Three in a row pays. Tap the line. | tap pattern chip |
| 7 | 0:36 | `scoreLine` | tap | `tut.math`: Value x symbol x shape. Longer shapes pay more. | tap |
| 8 | 0:42 | `special` | tap | `tut.special`: The Special lands more often. Luck makes it stronger. | tap |
| 9 | 0:48 | `lever` | drag down | `tut.lever2`: Spin again. | `spin` |
| 10 | 0:56 | `purse` | tap | `tut.purse`: Wins go to your purse. | tap |
| 11 | 1:02 | `spiceUp` | tap | `tut.spice`: Spice Up: more pay, but Soot. Three Soot burns your purse. | `stoke` |
| 12 | 1:08 | `lever` | drag down | `tut.lever3`: Spin with Spice. | `spin` |
| 13 | 1:18 | `kiosk` | tap | `tut.kiosk`: The Kiosk: banked coins pay the debt and earn interest. | sheet open |
| 14 | 1:24 | `kiosk.all` | tap | `tut.bankAll`: Bank it all. Coins in the Kiosk never burn. | `bank` |
| 15 | 1:30 | `kiosk.forecast` | tap | `tut.forecast`: This much interest arrives at night end. | tap |
| 16 | 1:36 | `lever` | drag down | `tut.lastSpins`: Use your last spins. | `roundEnd` (2 spins) |
| 17 | 1:55 | `nights` | tap | `tut.deadline`: One night gone. After night 3, unpaid means the jar closes. | tap |
| 18 | 2:02 | `tin.offer.coins.small` | tap | `tut.offer`: Auntie Beckon visits. A small gift wins her Favour. | `offering` (Beckon loves coins: +2, she reaches Noticed and adds a 4th charm) |
| 19 | 2:12 | `stall.charm:3` | tap | `tut.buy`: Her extra charm. Charms work on every spin. | `buy` |
| 20 | 2:20 | `stall.leave` | tap | `tut.leave`: Back to the machine. | `leaveShop` |
| 21 | 2:24 | `terms:0` | tap | `tut.terms`: Pick tonight's terms: spins and a rule. | `pickTerms` |
| 22 | 2:28 | none (free play) | none | coach line under the machine: `tut.free`: Bank when you can. PAY NOW when it lights. | `debtPaid` |
| 23 | ~3:15 | `phone` | tap | `tut.phone`: The phone rings at every new debt. Answer it. | call open |
| 24 | 3:20 | `call.card:ruby` | tap | `tut.red`: Red is Mr. Ruby: a strong deal with a curse. | deal sheet open |
| 25 | 3:28 | `deal.sign` or `deal.back` | tap (hole covers both) | `tut.deal`: Sign it, or go back. You choose. | `deal` or `dealBack` |
| 26 | 3:38 | `call.card:gold` | tap | `tut.green`: Green is a spirit's gift: safe and small. | `callPick` (skipped if a deal was signed) |
| 27 | 3:45 | `lessons` | none | `tut.done`: That is the core. Lessons show what to learn next. | tap; sets `tutorialDone` |

Free play in step 22 shows the hand only if the player is idle for 8 s (pointing at the lever, or at PAY NOW when lit). If debt 1 is not paid by the end of night 3 in the tutorial, the deadline is forgiven once with Ruby's line `tut.mercy` (the first run cannot be lost before step 27).

After the tutorial: PROGRESSION Lessons (section 1) teach Honk, tricks, bench, Blender, Red Eye, Tin rivals, one per run, with the same hand (non-forced, 1 caption, dismiss on any tap). `coachFor` no longer returns null after debt 1: it returns the **first-time line** for any system met for the first time in any debt (Red Eye, Honk, Blender, white call, Wrath, Him or Me, curse, Flare-up).

### 2.1 How to play (rewrite `src/ui/howto.js`)

Opens at the top (AUDIT bug). One card per topic, swipe or scroll. Each card: a picture built live from sprites (DOM `<img>` from `public/img/manifest.json`, so it is right in every language) plus a code-drawn diagram where noted, a title, two sentences max. Same cards are the Guide button content (PROGRESSION section 1).

| # | card | picture (sprites, drawn left to right) | diagram in code |
|---|---|---|---|
| 1 | The goal | `devil/idle`, `ui/contract`, `ui/coin` | goal bar mock: DEBT 1 of 5, 40 / 80, Night 1 of 3 |
| 2 | Pull the lever | `machine/lever` | 5x3 grid outline with arrow down |
| 3 | Shapes pay | `sym/moth` x3 on the grid | the 12 pattern shapes as mini 5x3 dot grids with their x mult |
| 4 | The math | `sym/key`, `ui/star` | "3 x 1 x 2 = 6" with each number labelled |
| 5 | The Special and Luck | `ui/favour`, `ui/luck` | bar: Special weight x (1 + Luck) |
| 6 | Spice and Soot | `ui/heat`, `sym/ash` x3 | Spice 0-10 meter, +20% each, 3 Soot = Flare-up |
| 7 | Kiosk and interest | `machine/kiosk`, `ui/interest` | "8% of banked, max 25% of the debt" with the forecast chip |
| 8 | Nights and the deadline | `ui/hourglass` (trick/hourglass), `devil/collect` | three night pips, jar lid |
| 9 | The stall | `bg/wagon`, `charm/moth_jar`, `ui/rarity_*` | rarity colours legend; family set bonus "Wok 2/3" |
| 10 | Tricks | `ui/trick_bag`, `trick/nudge` | pre-spin vs post-spin timeline |
| 11 | The phone and spirits | `ui/phone`, `spirit/beckon_calm`, `spirit/gold_calm` | green / red / white card colours; Favour pips with 2, 5, 8 marks |
| 12 | The Tin and Favour | `hide/keepsake`, `ui/favour_pip` | offering sizes table and taste icons |
| 13 | Mr. Ruby's deals and curses | `devil/deal`, `ui/curse_badge` | "you get / you carry" card |
| 14 | The Red Eye | `sym/redeye` x3 | punishment ladder by debt; gauge |
| 15 | Honk and charges | `ui/honk`, `ui/charge_on`, `ui/charge_off` | charge pips filling per night |
| 16 | The Blender | `machine/blender` | A + B = C, same-family rule |
| 17 | Keys and lockers | `ui/key_brass`, `ui/locker_shut`, `ui/luggage` | key colours legend |
| 18 | The map and ranks | `bg/map` crop, `ui/stamp_gold` | bronze / silver / gold stamp rules |

Cards 11 to 18 show a lock and their Lesson name until that system was met once (no spoilers, but the card title is visible).

## 3. The Spirits (pantheon)

### 3.1 Cast

Eight spirits. Look, voice, folklore root and sample lines come from PANTHEON section 4 with the two look changes in section 0. Rival pairs are symmetric.

| id | UI name | domain | rival | portrait ids (calm, glad, cross) | unlocked |
|---|---|---|---|---|---|
| `brimble` | Mr. Ruby | debt, deals | `waiting` | `devil/idle`, `devil/grin`, `devil/angry` (existing) | start |
| `beckon` | Auntie Beckon | the stall, prices | `wire` | `spirit/beckon_*` | start |
| `gold` | Little Gold | Luck, the Special | `moonbiter` | `spirit/gold_*` | start |
| `wire` | Uncle Wire | tricks, the bench | `beckon` | `spirit/wire_*` | entering c2 |
| `waiting` | The Waiting Lady | second chances, the white call | `brimble` | `spirit/waiting_*` | entering c3 (first run that reaches it) or a white call |
| `tide` | Grandmother Tide | interest, patience | `lamplit` | `spirit/tide_*` | entering c5 |
| `moonbiter` | The Moonbiter | Soot, removal, curses | `gold` | `spirit/moonbiter_*` | entering c6 |
| `lamplit` | Lady Lamplit | Spice, dares | `tide` | `spirit/lamplit_*` | entering c7 |

Each place has a **local spirit** (always one of the three cards on its first call, 25% of Tin visits): c1 brimble, c2 wire, c3 gold, c4 beckon, c5 tide, c6 moonbiter, c7 lamplit, c8 waiting, c9 the rival pair beckon and wire, c10 brimble. Entering a place unlocks its local spirit for good (`meta.spirits`).

### 3.2 Favour

- Per run, per spirit. Range -5 to +10, start 0, plus Devotion tier 1 (+1) and Postcards.
- Stages: **Noticed** at 2, **Friend** at 5, **Patron** at 8. Reaching a stage applies its blessing for the rest of the run. Stages are kept if Favour drops, except while in Wrath.
- **Wrath 1** at Favour <= -2, **Wrath 2** at <= -5. Active while below the line. While in Wrath, that spirit's blessings are off.
- Above 10, every 3 surplus points become +1 Caps.
- **Patron limit 2.** While two spirits are Patron, every other spirit's Favour is capped at 7.
- Favour sources, all in one place (`src/core/spirits.js: addFavour(run, id, n, why)`):

| source | Favour |
|---|---|
| pick its green card on a call | +2 |
| pick its red card on a call | +3 |
| pick a card of its rival | -1 |
| Tin offering | base by size (small 1, medium 3, large 6) x taste, rounded up; Insult: -1 and the offering is lost |
| Demand met / refused or failed | +3 / -1 (Ruby: -2) |
| its rival crosses a stage line (2, 5, 8) upward | -2 |
| its rival enters Wrath | +1 |
| sign a deal (Ruby only) | +2 (on top of the card pick) |
| hang up on a call with Ruby's card (Ruby only) | -1 |

- Taste multipliers: Loved 2, Fine 1, Meh 0.5, Hated = Insult.

### 3.3 The Tin (offerings and visits, every round end)

The Tin is a strip at the top of the stall screen, not its own screen (keeps round length down). It shows the visiting spirit's portrait (mood by Favour: calm 0-4, glad 5+, cross below 0), its Favour pips, its Omen line, its Demand (if any) and the offering buttons.

- **Visitor pick** on the `call` stream: highest-Favour unlocked spirit 35%, the place's local spirit 25%, a random unlocked spirit 40%. In run 1 only `brimble`, `beckon`, `gold`.
- **Offerings per stall visit:** 1 (`tinOfferings` flag adds; Notebook `tin_01` gives +1).
- **Offering table** (size sets base Favour; buttons greyed when not affordable):

| kind | small (+1) | medium (+3) | large (+6) |
|---|---|---|---|
| `coins` (from the purse; % of the current debt target, rounded up) | 4% | 10% | 25% |
| `caps` | 1 | 2 | 4 |
| `spice` (burn Spice levels now) | 1 | 3 | 5 |
| `trick` | - | any 1 trick | - |
| `charm` (you also get its sale price) | - | - | any 1 charm |
| `curse` (take the spirit's own curse) | - | 1 | - |
| `skip` (spins off next round) | 1 | 2 | - |

- **Omen** (free, shown on visit): one function per spirit (3.6).
- **Demand** (optional): accept with one tap; checked at the next Tin, or at once for "hand over" demands.

### 3.4 The phone (calls, every new debt)

The phone (`ui/phone` on the HUD, `machine/phone` in the scene) rings at the start of every debt from debt 2 on, right after the PAID stamp. It also replaces the v2 deal screen.

- A call shows **3 spirit cards** (4 with Notebook `tin_04` or flag `callCards`). Mr. Ruby's card is always one of them. The other two come from unlocked spirits on the `call` stream, weighted 2x for the local spirit and 1.5x for any spirit at Friend or higher.
- Card colour: Ruby is always **red**. Every other card is **green**, or **red** with 25% chance. After a Red Eye event or a Flare-up in the last debt, every card is red. The Waiting Lady's card is always green.
- **Green card** = that spirit's gift, one drawn from its 4-gift pool (3.6). Safe.
- **Red card** = that spirit's Red Call (3.6), shown like a deal: "you get / you carry / due". Ruby's red card opens the v2 deal sheet with his 2 deals (3 at his Noticed).
- **Pick one card** (green or red), or **hang up**. Picking a red card and backing out of its sheet returns to the call.
- **Reroll** the non-Ruby cards: 1 Caps, +1 per reroll in the same call (`callRerollFree` makes the first free).
- **Refusal beads.** Hanging up on a call that showed at least one red card lights one bead (3 beads on the HUD). v2's refuse reward stays: +3 Caps. Signing any red card does not clear beads.
- **White call.** When all 3 beads are lit, the next call is white: The Waiting Lady alone, with 3 white cards. Beads reset. White cards (permanent for the run): `symMult all +1`; `patMult all +1`; `flag redEyeBless` (Red Eyes no longer punish and multiply the spin by 3). Taking a white card counts toward ending 4 (section 7).
- Due prices: a red card may carry `due: {rounds, else}`. If its condition (pay the current debt within `rounds` rounds) fails, `else` effects fire at that round end. Shown as a red tag with a countdown on the goal bar.

### 3.5 Him or Me

When a spirit reaches Patron while its rival is at Friend or higher, a modal shows the rival's cross portrait and one line, then two buttons:
- **Drop {rival}**: rival Favour to 0 and silent (no visits, not on calls) for the rest of the run; you get a free green gift from the new Patron.
- **Keep both**: the new Patron's Favour is capped at 7 until the end of this debt (stage stays reached).

### 3.6 Spirit table (exact)

Shorthand: rules are EFFECTS.md rules; `scope` given where temporary. "S" scales coins as in EFFECTS. Taste order: coins / caps / spice / trick / charm / curse / skip (L Loved, F Fine, M Meh, H Hated).

| spirit | taste | Noticed (2) | Friend (5) | Patron (8) | Wrath 1 / Wrath 2 |
|---|---|---|---|---|---|
| brimble | F / L / M / M / H / F / H | `flag dealOffers 3` | `interest +3` | `onDeal: wick 2, coins 20` | `flag noInterest` / `flag noPawn` (no Pawn, no Snooze) |
| beckon | L / F / M / F / F / H / M | `flag shopExtra 1` | `flag shopDiscount 10` | `flag shopDiscount 20`; `onDebtPaid: gainCharm common` | `flag shopMarkup 20` / `flag rerollDouble` |
| gold | F / F / M / L / H / M / H | `luck +1` | `flag pickFirstFav` | `flag twoFavs` | `flag hideFav` / `luck -3` |
| wire | F / M / F / L / F / H / H | `flag trickPockets 4` | `flag firstTrickFree` | `flag benchDiscount 30`; `onDebtStart: trick 1` | `flag trickPockets 2` / `flag trickPockets 1` |
| waiting | F / F / M / H / L / M / L | `onDebtStart (limit debt): trick 1 id spare_candle` | `flag extraLife` | `onHangUp: luck 1, wick 2` | `flag noBeads` / `flag noRelic` |
| tide | F / F / H / M / H / M / L | `interest +2` | `flag carrySpins 3` | `onDebtStart: spins 2; luck 4 scope round` | `flag interestHalf` / `flag noInterest` |
| moonbiter | M / H / F / F / L / L / M | `onSymbolLand {sym: ash}: coins 1` | `onScorch: wick 2; patMult all +0.5 scope round` | `flag ashIsFav` | `weight ash x1.5` / `flag deadCentre` |
| lamplit | F / F / L / M / H / M / M | `flag heatFloor 1` | `flag heatStep 25` | `flag scorchBurn 10`; `onScorch: wick 1` | `flag heatMax 8` / `flag noStoke` |

| spirit | gift pool (green, one shown per card) | Red Call (red) | own curse (new id unless noted) | Omen | Demand |
|---|---|---|---|---|---|
| brimble | none (always red) | his v2 deals (`deals.json`) | v2 curses | `nextDebts`: next 2 targets and next boss rule | `signDeal`: sign a deal before this debt is paid. +3 Favour, +2 Caps |
| beckon | `shopDiscount 30 scope debt`; `shopExtra 2 scope debt`; `sellFull scope debt`; `coins 15` | **Closing Down Sale**: `sellFull scope debt`, `shopDiscount 50 scope debt`; carry `flag noShopN 2` (next 2 stalls closed) | `haggler`: rerolls cost double | `nextOffers`: top 2 charm offers of the next stall | `buy2`: buy 2 items at the next stall |
| gold | `luck 2 scope debt`; `trick 2`; `seeNextFav scope debt`; `symValue favoured +2 scope debt` | **Pinky Promise**: `luck 5 scope debt`; due 2 rounds, else `loseCharm best` | `sticky_fingers` (existing) | `nextFavs2`: the next 2 Specials | `letMePick`: he picks the Special for your next spin |
| wire | `trick 2`; `trickPockets 4 scope debt`; `benchDiscount 100 scope debt`; `charge 99` | **Hot-wire**: `trick 3`, `flag trickFree scope debt`; carry `short_circuit` | `short_circuit`: trick pockets 2 | `benchPrices`: next bench jobs and prices | `handTrick`: give him a trick now: 2 random tricks back |
| waiting | `trick 1 id spare_candle`; `wick 3`; `luck 1` (run); `liftCurse 1` | none (her card is always green; she is the white caller) | `heavy_hands`: no Left Luggage relic next run | `shortfall`: coins still missing at this round end if you bank all | `waitWithMe`: skip the next night |
| tide | `interest 3 scope debt`; `spins 2`; `charge 99`; `coins 15` | **Cargo on Credit**: `gainCharm uncommon family random` x2 (same family); carry `slow_water` | `slow_water`: `flag spinsLess 1` | `nextTerms`: the 3 terms cards of the next round | `keepCool`: end the next round at Spice 2 or less |
| moonbiter | `removeSymbol 1`; `liftCurse 1`; `weight ash x0 scope debt`; `wick 3` | **One Bite**: `removeSymbol 2`, `allMult 1.5 scope debt`; carry `hollow_centre` | `hollow_centre`: `flag deadCentre` | `ashNext`: Soot count of the next spin | `feed`: offer a charm or a curse at the next Tin |
| lamplit | `heat 3`, `heatNoCool scope round`; `scorchBurn 10 scope debt`; `wick 4`; `allMult 1.5 scope round` | **Midnight Run**: `heat 10`, `heatNoCool scope round`, `allMult 2 scope round`; carry `dark_wick` | `dark_wick`: `flag heatMax 8` | `scorchOdds`: Flare-up chance for the next 3 spins at current Spice | `dare`: reach Spice 8 next round with no Flare-up. Fail: lose 10% purse |

Demand reward is always +3 Favour plus the bonus named; failure -1 Favour (Ruby -2).

### 3.7 `spirits.json` (content lane)

`src/core/data/spirits.json`, `{ "spirits": [ ... ] }`, 8 entries. Every `name`, `text`, `hint` and line is `{en, tr, th}`. Example (one entry, full):

```json
{
  "id": "gold",
  "name": {"en": "Little Gold", "tr": "Küçük Altın", "th": "เจ้าทองน้อย"},
  "domain": "luck",
  "rival": "moonbiter",
  "unlock": {"start": true},
  "local": ["c3"],
  "portrait": {"calm": "spirit/gold_calm", "glad": "spirit/gold_glad", "cross": "spirit/gold_cross"},
  "taste": {"coins": 1, "caps": 1, "spice": 0.5, "trick": 2, "charm": -1, "curse": 0.5, "skip": -1},
  "hint": {"en": "Loves toys: give him tricks.", "tr": "...", "th": "..."},
  "stages": [
    {"at": 2, "id": "first_pick", "rules": [{"trigger": "passive", "cond": {}, "effects": [{"type": "luck", "n": 1}]}]},
    {"at": 5, "id": "twice_pick", "rules": [{"trigger": "passive", "cond": {}, "effects": [{"type": "flag", "flag": "pickFirstFav", "v": true}]}]},
    {"at": 8, "id": "two_faves", "rules": [{"trigger": "passive", "cond": {}, "effects": [{"type": "flag", "flag": "twoFavs", "v": true}]}]}
  ],
  "wrath": [
    {"at": -2, "rules": [{"trigger": "passive", "cond": {}, "effects": [{"type": "flag", "flag": "hideFav", "v": true}]}]},
    {"at": -5, "rules": [{"trigger": "passive", "cond": {}, "effects": [{"type": "luck", "n": -3}]}]}
  ],
  "gifts": [
    {"id": "gold_luck", "icon": "deal/luck", "effects": [{"type": "luck", "n": 2, "scope": "debt"}]},
    {"id": "gold_toys", "icon": "ui/trick_bag", "effects": [{"type": "trick", "n": 2}]},
    {"id": "gold_peek", "icon": "ui/favour", "effects": [{"type": "flag", "flag": "seeNextFav", "v": true, "scope": "debt"}]},
    {"id": "gold_shine", "icon": "ui/star", "effects": [{"type": "symValue", "n": 2, "sym": "favoured", "scope": "debt"}]}
  ],
  "red": {"id": "pinky_promise", "icon": "deal/luck",
          "boon": [{"type": "luck", "n": 5, "scope": "debt"}],
          "curse": null,
          "due": {"rounds": 2, "else": [{"type": "loseCharm", "pick": "best"}]}},
  "ownCurse": "sticky_fingers",
  "omen": "nextFavs2",
  "demand": "letMePick",
  "text": {"red": {"en": "Luck +5 this debt. Not paid in 2 nights: he takes your priciest charm.", "tr": "...", "th": "..."}},
  "lines": {"meet": {}, "gift": {}, "red": {}, "loved": {}, "insult": {}, "noticed": {}, "friend": {}, "patron": {}, "wrath": {}, "himOrMe": {}, "omenTpl": {}, "demand": {}}
}
```

- `ruby` (`brimble`) has `gifts: []` and `red: {"deals": true}`. `waiting` has `red: null` and `white: [3 white cards]`.
- `text` is composed by `scripts/gen-v3-data.py` from rules (same as v2), except `lines`, which are hand-written (12 lines x 8 spirits x 3 languages).
- New curses go in `src/core/data/curses_v3.json` (same shape as `curses.json`): `haggler`, `short_circuit`, `heavy_hands`, `slow_water`, `hollow_centre`, `dark_wick`.

### 3.8 Engine hooks: new primitives (exact list)

Everything not listed here uses EFFECTS.md unchanged. `check-content.mjs` and `check-core.mjs` must reject any name not in EFFECTS.md plus this table.

**Triggers (10)**

| trigger | fires | context |
|---|---|---|
| `onCall` | a call opens (after the PAID stamp) | cards |
| `onPick` | a call card is taken | spirit, colour (`green`, `red`, `white`) |
| `onHangUp` | the player hangs up | `hadRed` |
| `onVisit` | a spirit visits the Tin | spirit |
| `onOffering` | an offering is made | spirit, kind, size, favour gained |
| `onStage` | a spirit reaches a stage | spirit, stage (2, 5, 8) |
| `onWrath` | a spirit enters Wrath | spirit, level (1, 2) |
| `onRedEye` | a Red Eye event, after punishment | level (1 to 3) |
| `onActivate` | HONK fires this charm | the charm |
| `onFuse` | the Blender makes a charm | a, b, out |

**Conditions (5)**

| key | value | true when |
|---|---|---|
| `favour` | `[spiritId, n]` | that spirit's Favour >= n (`visitor` = the current visitor) |
| `favourMax` | `[spiritId, n]` | Favour <= n |
| `beadsMin` | n | lit beads >= n |
| `redEyesMin` | n | Red Eye events this run >= n |
| `debtMin` | n | current debt index (1-based) >= n |

**Effects (4 new, 3 extended)**

| type | fields | meaning |
|---|---|---|
| `favour` | n, spirit (`id`, `visitor`, `rival`, `all`) | add Favour through `addFavour` (stage, rival and cap rules apply) |
| `charge` | n | add n charges to every active charm, up to its `need` |
| `liftCurse` | n | the player picks n curses to remove (as bench "Lift a Curse") |
| `loseCharm` | pick (`best` = highest price, `random`) | remove a held charm; never a relic |
| `trick` (extended) | n, id? | with `id`, add that trick instead of a random one |
| `gainCharm` (extended) | rarity, family? | `family`: an id or `random` (one family drawn once per effect) |
| `place` (extended) | sym may be `favoured` | the Special at evaluation time |

**Per (4):** `favour:<id>`, `redEyes`, `beads`, `fused` (fused charms held).

**Flags (15 new)**

| flag | v | combine | read by |
|---|---|---|---|
| `noPawn` | - | | run.js deadline |
| `heatMax` | n | lowest | run.js stoke, setHeat |
| `carrySpins` | n | highest | run.js round setup: unused spins carry, up to n |
| `trickFree` | - | | run.js useTrick: not consumed |
| `noShopN` | n | summed, counts down per stall | run.js leaves round end straight to terms |
| `noBeads` | - | | spirits.js hang up |
| `noRelic` | - | | meta at run end |
| `redEyeRate` | pct points | summed | omen roll |
| `redEyeBless` | - | | Red Eye resolution |
| `redEyeSoft` | n | summed | punishment level - n (min 0) |
| `tinOfferings` | n | summed | Tin |
| `callCards` | n | summed | call size |
| `callRerollFree` | - | | call reroll |
| `patronAt` | n | lowest | stage line for Patron (default 8) |
| `noRedEye` | - | | omen roll skipped |

**Snapshot order** (EFFECTS section 4) gains: after character rules, **spirit stages and wraths** (spirits in `spirits.json` order), and after deal boons, **call boons** in the order taken. **RNG streams** add `call`, `omen`, `fuse` (save `rngState` gets the three counters).

**Run state additions** (`run.js`, saved): `spirits: {id: {fav, stage, wrath, met, silent}}`, `beads`, `whiteTaken`, `redEyes`, `callOffer`, `due: [{rounds, else, debt}]`, `relics: [charmId]`, `postcards: [id]`, `demand: {spirit, id, since}`, charm instance `charge`.

**Phases** gain `call` (between `deal`-replacement and the next debt's `terms`) and `himOrMe` (modal, any time a Patron is reached).

## 4. CloverPit-grade features, adapted

### 4.1 The lever

- On the right edge of the machine (`machine/lever` sprite). Drag the knob down with the thumb. Release past 70% of travel: spin. Release before: springs back with a small rattle (a tease, no spin).
- Tap on the knob also spins (accessibility). The SPIN button in the action row does the same thing. Setting "Lever only" hides the button.
- Feedback: 5 haptic ticks along the travel, a heavy thud at the stop, `lever_clack` sound; the knob springs back over 220 ms.
- Disabled (greyed, does not move) when SPIN is disabled (no spins, score pending, a modal is open).

### 4.2 The Kiosk (ATM-like bank, interest shown)

- A small street ATM kiosk sprite left of the machine (`machine/kiosk`) with a lit screen drawn in code: **balance**, **"+N tonight"** forecast, **rate** (8% + modifiers) and the **cap** ("max N").
- Tap the kiosk: a sheet with three buttons, **+25%**, **+half**, **ALL** of the purse, and hold-to-pour on the kiosk sprite (coins fly in a stream; release stops). No slider (AUDIT: blue native slider).
- Interest at round end: `min(floor(banked x rate%), floor(debtTarget x 25%))`, added to the Kiosk balance, ticked up in view.
- When balance >= target: PAY NOW stamp on the kiosk. Tapping it pays (early-pay rewards as v2). At the deadline the purse auto-banks, then the check.

### 4.3 The Red Eye (bad omen symbol)

New special symbol `redeye` (UI "Red Eye"; a red neon eye sign, no text). Not in the weight table; it is placed by an event.

- **Chance per spin:** 0 on debts 1 and 2. From debt 3: `1.5% + 0.5% x (debt - 3)`, max 6%, plus `redEyeRate`. Rolled on the `omen` stream after the grid roll (step 5 of EFFECTS order), **not affected by Luck**. The chance is always visible on the machine as a gauge "Red Eye 2.0%".
- **Event:** cells 6, 7, 8 become `redeye`. Red Eyes never match and block patterns through them.
- **Punishment level** by debt index (then minus `redEyeSoft`, min 0):

| level | debts | punishment |
|---|---|---|
| 0 | - | nothing (spin scores normally around the eyes) |
| 1 | 3 to 4 | this spin pays 0 |
| 2 | 5 to 6 | this spin pays 0, and the purse loses what it gained this round |
| 3 | 7+ | this spin pays 0, and the purse goes to 0 |

The Kiosk is always safe. Then `onRedEye` fires, the next call is all red, and the screen shows the red vignette and `redeye_sting`.
- **With `redEyeBless`** (white card or the Counter-stare charm): no punishment; the spin total is x3.
- **Exploit builds:** Red Eye charms (4.4), the Postcard "Staring Contest" (rate x2, +3 Caps per Red Eye), Ruby's Shades (+2% rate), and the white bless. Rate x reward is the build.

### 4.4 Active charms, charges and the HONK button

- 16 new **active** charms (`charms_v3.json`, tag `active`). Field `active: {need: 1|2|3}`. Charges start full (`charge = need`) and recharge +1 per round start. Green gifts `charge 99` refill.
- **HONK** button (`ui/honk`, a tuk-tuk horn) in the action row, left of SPIN. Enabled before a spin when at least one active charm is full. One press fires `onActivate` on **every full** active charm, left to right, and sets each to 0. Effects with `scope: "spin"` apply to the next spin.
- Charge pips (`ui/charge_on` / `ui/charge_off`) under each active charm in the charm row.

| id | name (en) | rarity | need | onActivate effects |
|---|---|---|---|---|
| `bike_horn` | Bike Horn | common | 1 | `luck 3 scope spin` |
| `fish_sauce` | Fish Sauce | uncommon | 2 | `allMult 2 scope spin` |
| `ice_bucket` | Ice Bucket | common | 1 | `heat -3` |
| `megaphone` | Megaphone | uncommon | 2 | `place 3 favoured` |
| `spare_tyre` | Spare Tyre | rare | 3 | `spins 2` |
| `sweeper` | Street Sweeper | common | 2 | `weight ash x0 scope spin` |
| `price_gun` | Price Gun | common | 1 | `coins 10` |
| `neon_open` | OPEN Sign (no text on art) | rare | 3 | `patMult all +2 scope spin` |
| `double_shift` | Double Shift | rare | 3 | `allMult 3 scope spin`, `heat 2` |
| `wok_toss` | Wok Toss | common | 1 | `heat 3` |
| `calculator` | Pocket Calculator | uncommon | 2 | `interest 3 scope round` |
| `rubber_band` | Rubber Band | uncommon | 2 | `trick 1` |
| `coin_flip` | Coin Flip | uncommon | 1 | `coins 20 chance 50` |
| `gold_spray` | Gold Spray Can | rare | 3 | `symValue high +4 scope spin` |
| `taxi_meter` | Taxi Meter | uncommon | 2 | `wick 2` |
| `bike_jump` | Motorbike Jump | legendary | 3 | `spins 1`, `luck 2 scope spin`, `patMult big +2 scope spin` |

### 4.5 Red Eye charms (8, tag `redeye`, family `hex`)

| id | name | rarity | rule |
|---|---|---|---|
| `eye_drops` | Eye Drops | common | `flag redEyeSoft 1` |
| `staring` | Staring Contest | uncommon | `onRedEye: stack 1`; passive `symMult all +0.25 per stack` |
| `omen_jar` | Bad Omen Jar | uncommon | `onRedEye: coins 20` |
| `ruby_shades` | Ruby's Shades | rare | `flag redEyeRate 2`; passive `allMult 1.25` |
| `night_owl` | Night Owl | rare | `onRedEye: gainCharm rare` |
| `red_eye_flight` | Red-eye Flight | uncommon | `onRedEye: spins 2` |
| `counter_stare` | Counter-stare | legendary | `flag redEyeBless` |
| `taillight` | Taillight | common | passive `luck 1 per redEyes` |

### 4.6 The Blender (charm fusion)

Pip's fruit blender, a tab in the stall from debt 2 (from debt 1 with the Postcard "Spare Blender").

- Drag charm A onto charm B (or tap A then B), then hold BLEND for 0.6 s.
- **Same family, same rarity** (common, uncommon or rare): pick 1 of 2 random charms of that family one rarity up (`fuse` stream). Cost 2 / 3 / 4 Caps.
- **Recipe:** one charm of family X and one of family Y, both uncommon or better, where X+Y is in `fusion.json`: makes that fused charm (rarity `fused`, gold rim `ui/fused_rim`). Cost 5 Caps.
- Legendary and fused charms cannot go in. The result takes A's slot; B's slot is freed. `onFuse` fires. First recipe found in a run: +1 Favour with Wire.
- The Codex Fusion tab lists all 24 recipes: found ones in full, unfound ones as "Wok + Monsoon = ?".
- `fusion.json`: `{ "same": {"cost": {"common": 2, "uncommon": 3, "rare": 4}}, "recipes": [{"a": "ember", "b": "hex", "out": "f_smog_wok"}] }`.

24 fused charms (`charms_v3.json`, rarity `fused`, price 30 x S for selling only):

| id | families | rule |
|---|---|---|
| `f_skewer_cart` | swarm+ember | `symValue low +2`; `symMult low +0.1 per heat` |
| `f_firefly_snack` | swarm+wisp | `onPattern {group: low, hasWisp}: retrigger 1` |
| `f_street_gold` | swarm+crown | `onPattern {group: low, minCells: 5}: coins 5` |
| `f_market_scale` | swarm+ledger | `onSymbolLand {group: low, every: 10}: interest 1` |
| `f_smog_wok` | ember+hex | `patMult all +0.5 per curses` |
| `f_neon_grill` | ember+pact | `onScorch: wick 3, coins 10` |
| `f_lucky_chili` | ember+omen | `luck 0.5 per heat` (rounded down) |
| `f_ruby_umbrella` | hex+pact | `onCurse: coins 15`; `{cursesMin: 3}: allMult 1.5` |
| `f_rainy_day_fund` | hex+ledger | `interest 1 per curses` |
| `f_monsoon_gold` | hex+crown | `symValue crown +1 per curses` |
| `f_small_print_lawyer` | ledger+pact | `onDeal: interest 2` |
| `f_meter_taxi` | ledger+tinker | `onTrick: coins 3` |
| `f_gold_shop` | ledger+crown | `onInterest: symValue crown +1` |
| `f_calling_luck` | pact+omen | `onSymbolLand {sym: sigil}: luck 1 scope round` |
| `f_rooftop_lease` | pact+crown | `onDeal: gainCharm rare` |
| `f_lucky_combo` | omen+stitch | `onPattern {favoured}: patMult this +1` |
| `f_glowing_special` | omen+wisp | `weight wisp x2`; `luck 1` |
| `f_lucky_tuktuk` | omen+tinker | `onTrick: luck 1 scope round` |
| `f_spinning_elbow` | stitch+wisp | `onPattern {hasWisp}: patMult this +2` |
| `f_clinch_tool` | stitch+tinker | `onSpinEnd {distinctMin: 3}: allMult 2` (spin) |
| `f_golden_belt` | stitch+crown | `patMult big +2` |
| `f_firefly_lamp` | wisp+tinker | `onSpinStart: place 1 wisp` |
| `f_gold_dust` | wisp+crown | `onPattern {group: high, hasWisp}: retrigger 1` |
| `f_gold_rims` | tinker+crown | `slot 1`; `symValue high +1` |

### 4.7 Keys, lockers and Left Luggage (CloverPit drawers)

**Keys** (meta, never sold): Brass, Silver, Red, sources as PROGRESSION 5.1. In a run, a found key shows as a chip on the run-end ledger.

**Locker Wall** (`lockers.json`, 20 lockers, Home screen). Replaces PROGRESSION 5.2 so the contents match the real 30 locked charms (20 rare = 2 per family, 10 legendary = 1 per family). "rare A/B" = the first/second locked rare of that family in `charms.json` order.

| # | key | extra lock | contents |
|---|---|---|---|
| 1-10 | Brass | none | rare A of swarm, ember, hex, ledger, pact, omen, stitch, wisp, tinker, crown (one each) |
| 11-15 | Silver | clear c3 | rare B, two families per locker in the same order |
| 16 | Silver | 10 Lessons done | Postcard pack II (6) |
| 17 | Silver | clear c6 | Postcard pack III (6) |
| 18 | Red | clear c7 | 5 legendaries (swarm, ember, hex, ledger, pact) |
| 19 | Red | Storm 3 clear | 5 legendaries (omen, stitch, wisp, tinker, crown) |
| 20 | Red | all 19 open | the Night Market Deed: title, Home decor, Codex page, final letter |

Achievements that unlocked these charms in v2 give Stash and keys instead.

**Left Luggage** (4 extra lockers, L1 to L4, under the wall, shown from run 1 with a tag "reach debt 4"):
- At run end, if the run reached debt 4, the player may leave one held charm in an empty Left Luggage locker (or swap one out).
- Each filled locker gives that charm as a **relic** at the next run start: it sits in the charm row, cannot be sold, Blended or lost, and returns to its locker at run end. A relic uses a slot.
- `flag noRelic` (Waiting Lady Wrath 2, `heavy_hands`) skips relics for that run.

### 4.8 Postcards (run modifier cards)

18 Postcards (`postcards.json`), chosen on the place sheet of the map before a run: 1 slot at Notebook `cart_07`, 2 at `cart_09`. Each shows its gain and its cost in full and uses only effects, flags and the `favour` effect.
- Pack I (6, from Notebook `cart_07`): PROGRESSION 5.3 #1 to #6.
- Pack II (6, locker 16): PROGRESSION #7 to #12.
- Pack III (6, locker 17):

| id | name | gain | cost |
|---|---|---|---|
| `staring_contest` | Staring Contest | `onRedEye: wick 3` | Red Eye from debt 1 at the debt-3 rate, and the whole chance doubled (`omen.js` reads the Postcard) |
| `spare_blender` | Spare Blender | Blender from debt 1 | blending costs +2 Caps |
| `party_line` | Party Line | `callCards 1` | call rerolls cost double |
| `quiet_phone` | Quiet Phone | `interest 4` | no calls this run (beads, white call off) |
| `full_charge` | Full Charge | active charms start with `need + 1` charges max | no recharge on the first round of each debt |
| `late_kiosk` | Late Kiosk | `interest 4` | PAY NOW disabled (no early pay) |

### 4.9 Endings (5 plus 8 epilogues)

| id | trigger | new |
|---|---|---|
| `paid_in_full` | clear c3 | v2 |
| `bought_the_machine` | clear c7 with no deal signed in that run | v2 |
| `new_management` | clear c10 with 5+ curses | v2 |
| `the_refuser` | clear c5 or later in a run that took 2 white calls | new: Nim hangs up on Ruby for good; the Waiting Lady's ferry arrives |
| `left_luggage` | clear c10 with all 4 Left Luggage lockers holding fused charms | new, secret: the title shows "???" with its requirement (PROGRESSION 10.2); the clue sits in Ruby's fine print in the Codex |

After any ending, one epilogue panel per spirit that was Patron in that run (8 possible, text in `spirits.json` `lines.epilogue`).

## 5. Progression

PROGRESSION sections 1, 2, 3, 4, 6, 7, 8, 9, 10 are adopted with the renames of section 0 and these changes:
- **Map** (section 3): THEME-TH places, PROGRESSION's ranks in order (Street Kid, Tray Hawker, Stall Owner, Shop Owner, Wholesaler, Shophouse Owner, Club Partner, Boutique Owner, Developer, Tycoon), local spirits as in section 3.1 here. Each place has its own background `bg/c1`..`bg/c10` (c1 reuses `bg/fair`) so the run changes scene (AUDIT fix 5). Stamps bronze / silver / gold as PROGRESSION.
- **In-run rank-up**: on the 2nd, 4th and 6th debt paid in a run, the machine gains an overlay (`machine/awning_1`..`_3`: awning, stall sign, neon) and the PAID stamp shows "Rung N".
- **Notebook** (`notebook.json`): PROGRESSION 4.1, 4.2, 4.3, 4.5 tables verbatim (Savings read as Stash); Crew 4.4 with THEME-TH names for the 6 existing characters and 4 new (`yai`, `beng`, `pla`, `mali`); Devotion 3 tiers x 8 spirits. About 74 entries in all.
- **Lessons** (`lessons.json`): PROGRESSION 1 table plus 3 rows: 11 "Honk" (fire an active charm), 12 "Blend" (make a charm), 13 "Stare it down" (survive a Red Eye with the Kiosk above half the target). Lesson 10's hand hints use the coach system of section 2.
- **Codex** (replaces `collection.js`): PROGRESSION 6 tabs plus a Fusion tab (24 recipes) and the Red Eye page; charm count 172.
- **Storm 1-10**: PROGRESSION 8 rules; Storm 5 sets every spirit to Favour -1; Storm 10 Wrath at -1 and -4; Storm 7 adds `noRedEye`-off: Red Eye from debt 2.
- **Visible locked items** (PROGRESSION 10): every list screen draws locked entries with silhouette, the requirement sentence, a progress bar for counters and the screen where it is earned. One shared helper `progress.js: canUnlock(item, meta)`, `progressOf(item, meta) -> {have, need, where}`.
- **Run end = "why you lost"** (AUDIT fix 13): debt and night, coins short, three biggest missed chances from run stats (unused tricks, spins at Spice 0, Kiosk left empty, calls hung up), one tip, then the ledger (Stash, keys, Codex new, Favour best, Lessons ticked).

## 6. Screens

| # | screen | file (lane) | new / changed |
|---|---|---|---|
| 1 | Title + story panels (first launch) | `ui/title.js` (ui) | new |
| 2 | Home (rank, Stash, keys, Lessons, completion ring, buttons: PLAY, Map, Notebook, Lockers, Codex, How to play, Settings, Store, Daily) | `ui/home.js` | changed (AUDIT fix 14) |
| 3 | Map (10 places, stamps, Storm tag, place sheet with character and Postcards, PLAY) | `ui/map.js` | new; replaces `ladder.js` and `charselect.js` entry |
| 4 | Run screen (machine) | `ui/hud.js` + view | changed (section 6.1) |
| 5 | Terms pick | `ui/terms.js` | unchanged |
| 6 | Kiosk sheet | `ui/kiosk.js` | new (replaces bankSheet) |
| 7 | Stall: Tin strip on top; tabs Charms, Tricks, Bench, Blender | `ui/shop.js`, `ui/tin.js`, `ui/blender.js` | changed / new |
| 8 | Phone call (3 cards, reroll, hang up; white variant) | `ui/phone.js` | new |
| 9 | Deal sheet (Ruby's red card) | `ui/deal.js` | changed: opened from the call |
| 10 | Red card sheet (other spirits) | `ui/phone.js` | new |
| 11 | Him or Me modal | `ui/himorme.js` | new |
| 12 | PAID stamp + rank-up | `ui/paid.js` | changed |
| 13 | Pawn | `ui/pawn.js` | unchanged |
| 14 | Run end: why you lost + ledger + Left Luggage choice | `ui/runend.js` | changed |
| 15 | Notebook (5 tabs) | `ui/notebook.js` | new; replaces `shelf.js` |
| 16 | Locker Wall + Left Luggage | `ui/lockers.js` | new |
| 17 | Codex (7 tabs) | `ui/codex.js` | new; replaces `collection.js` |
| 18 | How to play / Guide card | `ui/howto.js` | rewrite (section 2.1) |
| 19 | Endings + epilogues | `ui/ending.js` | changed |
| 20 | Daily and weekly goals | `ui/daily.js` | changed |
| 21 | Settings (adds Replay tutorial, Lever only), Store | `ui/settings.js`, `ui/store.js` | small change |
| 22 | Tutorial overlay (hole, hand, caption) | `ui/coach.js` | new |
| 23 | Item sheet (charm, trick, curse, spirit, chip explainer) | `ui/cards.js` | changed |

### 6.1 Always visible on the machine screen

Phone 390x844 (desktop: the same column centred, max width 480, side panels empty). Top to bottom:

| band | height | content | tap shows |
|---|---|---|---|
| Goal bar | 56 | `DEBT 2 of 5` - progress bar banked+purse vs target with numbers `240 / 450` - `on pace` / `behind` - due tag if any | debt sheet: target, rounds left, boss rule, next 2 debts if Ruby Omen seen |
| Run bar | 40 | `Night 2 of 3` (three pips and the jar) - `Spins 4` (tonight only; carried spins shown as `+2` with a label) - beads (3) | one-line explainer per chip |
| Purse and Kiosk | 44 | **Purse** coin chip (coins) - **Kiosk** chip (balance, `+N tonight`) - **Caps** chip | Purse: "Spend at the stall; burns on a Flare-up". Kiosk opens the sheet |
| Spirits row | 44 | up to 3 portraits (met spirits with highest Favour), each with 5 Favour pips and a stage badge; red pips under 0; phone icon at the right (rings at debt start) | spirit sheet: stage, blessings, taste hints, Omen seen |
| Machine | ~380 | case, 5x3 reels, the Special flag above the window, Luck number on the flag, Spice meter down the left (0-10 with Soot marker at the current Flare-up chance), Red Eye gauge on the top trim from debt 3, lever on the right, Kiosk sprite at bottom left | each element opens its How to play card |
| Score line | 32 | plain words: "3 Mangoes in a row: 3 x 1 x 1 = 3", total, top 3 contributor chips | full list |
| Charm row | 64 | 5 to 8 slots, charge pips under active charms, relic pin, family set count "Wok 2/3" | charm sheet |
| Action row | 88 | pockets (3-4) - HONK - **SPIN** (big) - Spice Up | - |

Every chip has a label word under the icon (AUDIT: icons-only chips). No chip shows a raw id.

## 7. Content counts to add

| content | v2 now | v3 add | v3 total | file |
|---|---|---|---|---|
| spirits | 1 (Ruby) | 7 | 8 | `spirits.json` |
| stage blessings | 0 | 24 | 24 | `spirits.json` |
| wraths | 0 | 16 | 16 | `spirits.json` |
| gifts (green) | 0 | 28 | 28 | `spirits.json` |
| Red Calls (non-Ruby) | 0 | 6 | 6 | `spirits.json` |
| white cards | 0 | 3 | 3 | `spirits.json` |
| omens / demands | 0 | 8 / 8 | 8 / 8 | `src/core/spirits.js` + texts |
| spirit lines (12 kinds + epilogue) | 0 | 104 x 3 langs | | `spirits.json` |
| charms | 124 | 16 active + 8 Red Eye + 24 fused = 48 | 172 | `charms_v3.json` |
| curses | 16 | 6 | 22 | `curses_v3.json` |
| deals | 24 | 0 | 24 | - |
| fusion recipes | 0 | 24 + same-family rule | 24 | `fusion.json` |
| symbols | 12 | 1 (`redeye`) | 13 | `symbols.json` via gen-v3 patch |
| places | 10 contracts | place data | 10 | `places.json` |
| characters | 6 | 4 | 10 | `characters_v3.json` |
| Notebook entries | 10 hideout | ~74 | ~74 | `notebook.json` |
| lockers | 0 | 20 + 4 Left Luggage | 24 | `lockers.json` |
| keys | 0 | 3 kinds | 3 | `config.json` keys section (via gen-v3) |
| Postcards | 0 | 18 | 18 | `postcards.json` |
| Lessons | 0 | 13 | 13 | `lessons.json` |
| milestones | 0 | 14 | 14 | `milestones.json` |
| Storm levels | 0 | 10 | 10 | `storm.json` |
| daily / weekly goals | 0 | 30 / 20 | 50 | `goals.json` |
| endings | 3 | 2 + 8 epilogues | 13 panels | `endings.json` |
| achievements | 43 | 20 (PROGRESSION + spirits, Red Eye, Blender, lockers) | 63 | `achievements_v3.json` |
| tutorial steps | 0 (coach) | 27 | 27 | `src/tutorial.js` |
| How to play cards | 7 lines | 18 cards | 18 | `src/ui/howto.js` |
| sprites | 167 sheet cells + 7 singles | see 7.1 | | `art/sheets.json` |

### 7.1 Art additions (merge into `art/sheets.json`)

Same style string as the file (gouache cut-paper, cream paper edge, magenta background on sheets). Spirit portraits are bust portraits, three moods each; Mr. Ruby reuses `devil/idle`, `devil/grin`, `devil/angry`. No sacred, royal or temple imagery, no text, no letters.

```json
{
  "sheets": [
    {"file": "art/raw/spirit_a.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/beckon_calm", "spirit/beckon_glad", "spirit/beckon_cross", "spirit/gold_calm"],
     "subjects": [
       "bust portrait of Auntie Beckon: an old brass cash register with a painted smiling auntie face on its top and one bobbing waving cartoon arm on a spring, price tags hanging, calm polite smile",
       "the same cash-register auntie with a painted face, drawer popped open with coins, big delighted grin, arm waving fast",
       "the same cash-register auntie with a painted face, drawer slammed shut, frowning painted eyebrows, arm folded down",
       "bust portrait of Little Gold: a small gold-painted wind-up tin toy boy with round cheeks, a big wind-up key in his back, red painted shorts, chipped paint, calm curious look"]},
    {"file": "art/raw/spirit_b.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/gold_glad", "spirit/gold_cross", "spirit/moonbiter_calm", "spirit/moonbiter_glad"],
     "subjects": [
       "the same gold-painted wind-up tin toy boy laughing, arms up, key spinning, sparks of glitter",
       "the same gold-painted wind-up tin toy boy sulking, arms crossed, cheeks puffed, key stopped",
       "bust portrait of the Moonbiter: a round soft black shadow shaped like a moon with a bite taken out, two small polite white eyes, a tiny red bow tie, calm",
       "the same round black bitten-moon shadow with a shy happy smile and a crumb of moonlight in its mouth"]},
    {"file": "art/raw/spirit_c.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/moonbiter_cross", "spirit/lamplit_calm", "spirit/lamplit_glad", "spirit/lamplit_cross"],
     "subjects": [
       "the same round black bitten-moon shadow looking hungry and annoyed, eyes narrowed, bow tie crooked",
       "bust portrait of Lady Lamplit: a big warm round light bulb with a playful painted face and a curl of electric cable like a hair curl, glowing orange, teasing half smile",
       "the same glowing light-bulb lady laughing, glowing brighter, little sparks around her",
       "the same light-bulb lady flickering dim and cross, filament frown, cable curl drooping"]},
    {"file": "art/raw/spirit_d.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/tide_calm", "spirit/tide_glad", "spirit/tide_cross", "spirit/wire_calm"],
     "subjects": [
       "bust portrait of Grandmother Tide: a broad weathered old Thai river-barge woman in a yellow plastic raincoat and rubber boots, holding an enamel tea mug, steady calm face",
       "the same old barge woman in a yellow raincoat chuckling, raising her tea mug",
       "the same old barge woman in a yellow raincoat scowling, arms folded, rain dripping from her hood",
       "bust portrait of Uncle Wire: a grinning thin man whose hair is a tangle of black overhead power cables, a tool belt of keys and spoons, a food-cart apron, calm sly smile"]},
    {"file": "art/raw/spirit_e.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/wire_glad", "spirit/wire_cross", "spirit/waiting_calm", "spirit/waiting_glad"],
     "subjects": [
       "the same cable-haired street hustler laughing, cables sparking happily, thumbs up",
       "the same cable-haired street hustler annoyed, cables tangled into a knot, arms crossed",
       "bust portrait of the Waiting Lady: a small quiet woman in a clear plastic rain poncho at an old wooden canal-boat pier, holding a ticket punch and a paper ferry ticket, gentle patient face",
       "the same pier ticket lady in a rain poncho smiling warmly, punching a ticket"]},
    {"file": "art/raw/spirit_f.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["spirit/waiting_cross", "char/yai", "char/beng", "char/pla"],
     "subjects": [
       "the same pier ticket lady in a rain poncho looking hurt and stubborn, ticket punch held tight",
       "bust portrait of Grandma Yai: a tiny elderly Thai noodle seller with a ladle, a towel over her shoulder, steam rising, sharp eyes",
       "bust portrait of Beng: a skinny teenage Thai motorbike-taxi boy in an orange numbered vest with no readable numbers, helmet under his arm, cheeky grin",
       "bust portrait of Pla: a young Thai boxer girl with taped hands, a plain towel round her neck, confident grin, no headband, no armbands"]},
    {"file": "art/raw/spirit_g.png", "cols": 2, "rows": 2, "size": 512,
     "ids": ["char/mali", "devil/phone", "char/nim_boss", "char/pip_blender"],
     "subjects": [
       "bust portrait of Mali: a tired cheerful Thai night-bus conductor woman with a metal ticket tube, uniform cap, kind eyes",
       "Mr. Ruby the slim red devil in a floral shirt and sunglasses, holding an old red phone receiver to his ear, smug smile",
       "Nim, a 19-year-old Thai woman with a short black bob, now in a sharp blazer with sunglasses pushed up, confident smile, city lights behind",
       "Pip, a tiny red imp with one chipped horn and a too-big floral shirt, pouring fruit into a big blender, tongue out in focus"]},
    {"file": "art/raw/v3_ui_a.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["sym/redeye", "ui/phone", "ui/kiosk", "ui/blender", "ui/honk", "ui/charge_on", "ui/charge_off", "ui/bead_off", "ui/bead_on"],
     "subjects": [
       "a glowing red neon sign shaped like a single wide-open eye with a tiny horn on top, no text",
       "an old red rotary telephone",
       "a small street ATM kiosk with a glowing screen and a coin slot, no text",
       "a fruit blender jug full of orange and green fruit",
       "a round rubber tuk-tuk bulb horn with a brass trumpet",
       "a small glowing yellow battery cell, full",
       "a small grey empty battery cell",
       "a plain dull wooden bead",
       "a glowing white bead with a soft halo"]},
    {"file": "art/raw/v3_ui_b.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["ui/hand", "ui/key_brass", "ui/key_silver", "ui/key_red", "ui/locker_shut", "ui/locker_open", "ui/luggage", "ui/postcard_back", "ui/map_pin"],
     "subjects": [
       "a white cartoon glove hand pointing with its index finger, bold outline",
       "an old brass key with a round bow",
       "a silver key with a square bow",
       "a red-painted key with a heart-shaped bow",
       "a small dented tin locker door with a padlock, closed",
       "the same small tin locker door swung open, empty inside",
       "a battered travel suitcase with a paper luggage tag, no text",
       "the back of a postcard with a stamp box and lines, no text",
       "a red map pin with a round head"]},
    {"file": "art/raw/v3_ui_c.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["ui/stamp_bronze", "ui/stamp_silver", "ui/stamp_gold", "ui/notebook", "ui/codex", "ui/favour_pip", "ui/wrath", "ui/white_call", "ui/fused_rim"],
     "subjects": [
       "a round bronze rubber-stamp mark with a little cart in the middle, no text",
       "a round silver rubber-stamp mark with a little shop front in the middle, no text",
       "a round gold rubber-stamp mark with a little tower in the middle, no text",
       "a school exercise notebook with a pencil clipped on, no text",
       "a fat scrapbook with tabs and photos sticking out, no text",
       "a small round paper token with a warm glow",
       "a small black storm cloud with a red lightning bolt",
       "a white rotary telephone with a soft glow",
       "an empty round gold frame ring with small rivets"]},
    {"file": "art/raw/act_a.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["charm/bike_horn", "charm/fish_sauce", "charm/ice_bucket", "charm/megaphone", "charm/spare_tyre", "charm/sweeper", "charm/price_gun", "charm/neon_open", "charm/double_shift"],
     "subjects": [
       "a chrome bicycle bell horn",
       "a glass bottle of fish sauce with a red cap, no label text",
       "a metal bucket of ice cubes",
       "a white plastic megaphone",
       "a spare motorbike tyre",
       "a street sweeper's long broom and dustpan",
       "a handheld price-tag gun",
       "a small neon shop sign shaped like an open door, no letters",
       "two coffee cups stacked, steaming"]},
    {"file": "art/raw/act_b.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["charm/wok_toss", "charm/calculator", "charm/rubber_band", "charm/coin_flip", "charm/gold_spray", "charm/taxi_meter", "charm/bike_jump", "charm/eye_drops", "charm/staring"],
     "subjects": [
       "a wok tossing noodles into the air",
       "a pocket calculator, no numbers on the screen",
       "a ball of red rubber bands",
       "a coin spinning in the air",
       "a gold spray-paint can",
       "a taxi meter box with a blank red display",
       "a small motorbike mid-jump over a puddle",
       "a small bottle of eye drops",
       "two cartoon eyes staring wide, red veins"]},
    {"file": "art/raw/eye_a.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["charm/omen_jar", "charm/ruby_shades", "charm/night_owl", "charm/red_eye_flight", "charm/counter_stare", "charm/taillight", "curse/haggler", "curse/hollow_centre", "curse/dark_wick"],
     "subjects": [
       "a glass jar holding a small glowing red eye",
       "a pair of red-lens sunglasses",
       "a small brown owl with big orange eyes",
       "a small passenger plane at night with a red light",
       "a round mirror reflecting a red eye back",
       "a red motorbike taillight glowing",
       "a shadowy hand pinching a price tag",
       "a donut with a black empty hole",
       "a light bulb with a black burnt filament"]},
    {"file": "art/raw/curse_v3.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["curse/slow_water", "curse/short_circuit", "curse/heavy_hands", "charm/f_skewer_cart", "charm/f_firefly_snack", "charm/f_street_gold", "charm/f_market_scale", "charm/f_smog_wok", "charm/f_neon_grill"],
     "subjects": [
       "a slow brown river with a snail on a leaf",
       "a sparking tangled plug socket",
       "two hands chained to a heavy suitcase",
       "a grill cart with skewers smoking on charcoal",
       "a paper cone of snacks with a firefly sitting on top",
       "a fish-ball skewer dipped in gold",
       "a market hanging scale with limes in its pan",
       "a wok in grey smog with rain drops",
       "a neon pink grill flame"]},
    {"file": "art/raw/fuse_a.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["charm/f_lucky_chili", "charm/f_ruby_umbrella", "charm/f_rainy_day_fund", "charm/f_monsoon_gold", "charm/f_small_print_lawyer", "charm/f_meter_taxi", "charm/f_gold_shop", "charm/f_calling_luck", "charm/f_rooftop_lease"],
     "subjects": [
       "a red chili with a four-leaf clover leaf",
       "a red umbrella with small horns on the tip",
       "a piggy bank under a rain cloud",
       "gold bars shining in heavy rain",
       "a magnifying glass over a tiny contract, no text",
       "a pink taxi with a coin on its roof",
       "a gold shop window with gold chains on red velvet, no text",
       "a red business card with a clover",
       "a rooftop with a key on a red ribbon"]},
    {"file": "art/raw/fuse_b.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["charm/f_lucky_combo", "charm/f_glowing_special", "charm/f_lucky_tuktuk", "charm/f_spinning_elbow", "charm/f_clinch_tool", "charm/f_golden_belt", "charm/f_firefly_lamp", "charm/f_gold_dust", "charm/f_gold_rims"],
     "subjects": [
       "two red boxing gloves with a clover between them",
       "a dinner plate glowing with a firefly over it",
       "a tuk-tuk with a clover on its hood",
       "a spinning boxing elbow pad with motion lines",
       "a wrench and a boxing glove tied together",
       "a gold champion belt with a plain round plate, no text",
       "a jar lamp full of fireflies",
       "a pile of gold dust with a firefly",
       "a shiny gold motorbike wheel rim"]},
    {"file": "art/raw/post_a.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["post/rainy_day", "post/hot_pan", "post/fresh_fish", "post/night_bus", "post/borrowed_coat", "post/short_cut", "post/crooked_scale", "post/old_photo", "post/thumb_scale"],
     "subjects": [
       "a picture postcard of a rainy soi street with umbrellas, no text",
       "a picture postcard of a hot frying pan with chilies, no text",
       "a picture postcard of fresh fish on ice at a market, no text",
       "a picture postcard of a night bus with lit windows, no text",
       "a picture postcard of a coat on a hook, no text",
       "a picture postcard of a narrow alley shortcut between buildings, no text",
       "a picture postcard of a crooked market scale, no text",
       "a picture postcard of an old faded photo of a canal pier, no text",
       "a picture postcard of a thumb pressing on a scale pan, no text"]},
    {"file": "art/raw/post_b.png", "cols": 3, "rows": 3, "size": 192,
     "ids": ["post/empty_wallet", "post/all_pocket", "post/mothers_voice", "post/staring_contest", "post/spare_blender", "post/party_line", "post/quiet_phone", "post/full_charge", "post/late_kiosk"],
     "subjects": [
       "a picture postcard of an empty open wallet, no text",
       "a picture postcard of a jacket with many bulging pockets, no text",
       "a picture postcard of an old radio on a kitchen table, no text",
       "a picture postcard of a red neon eye in a dark alley, no text",
       "a picture postcard of a fruit blender on a cart, no text",
       "a picture postcard of three old phones with tangled cords, no text",
       "a picture postcard of a phone with its receiver off the hook, no text",
       "a picture postcard of a row of glowing batteries, no text",
       "a picture postcard of a street ATM kiosk at dawn, no text"]}
  ],
  "singles": [
    {"file": "art/raw/machine_lever.png", "id": "machine/lever", "size": 512, "magenta": true, "subject": "a tall chrome crank lever on a short brass track, red ball knob at the top, taped grip, side view, standing upright"},
    {"file": "art/raw/machine_kiosk.png", "id": "machine/kiosk", "size": 512, "magenta": true, "subject": "a small battered street ATM kiosk on a stand with a dark empty screen, a coin funnel on top and a little striped awning, stickers peeling, no text"},
    {"file": "art/raw/machine_phone.png", "id": "machine/phone", "size": 512, "magenta": true, "subject": "an old red rotary phone on a small wooden shelf bolted to a cart pole, a round blue butter-biscuit tin beside it with a fairy light, no text"},
    {"file": "art/raw/machine_blender.png", "id": "machine/blender", "size": 512, "magenta": true, "subject": "a big street-stall fruit blender on a cart counter, a tall glass jug, two empty funnels feeding into it, chrome base with one big button"},
    {"file": "art/raw/machine_awning_1.png", "id": "machine/awning_1", "size": 512, "magenta": true, "subject": "a short striped red-and-white cloth awning to sit on top of a street machine, wide and shallow"},
    {"file": "art/raw/machine_awning_2.png", "id": "machine/awning_2", "size": 512, "magenta": true, "subject": "a hand-painted wooden stall sign board with string lights around it, blank, no letters"},
    {"file": "art/raw/machine_awning_3.png", "id": "machine/awning_3", "size": 512, "magenta": true, "subject": "a bright neon tube frame in pink and green shaped like a crest of stars, no letters"},
    {"file": "art/raw/bg_map.png", "id": "bg/map", "size": 1024, "magenta": false, "subject": "portrait hand-painted illustrated map of Thailand as a long strip, rivers and coastline, tiny drawn icons along a winding road: a food cart, a train market, a gold shop street, a backpacker street, a beach, misty hills, a beach club, a riverside boutique, glass condo towers, a rooftop bar; no temples, no palaces, no pins, no text"},
    {"file": "art/raw/bg_c2.png", "id": "bg/c2", "size": 1024, "magenta": false, "subject": "portrait background, a big weekend night market with rows of tents and string lights beside old railway tracks, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c3.png", "id": "bg/c3", "size": 1024, "magenta": false, "subject": "portrait background, a busy Chinatown street at night, neon signs with no letters, gold shop windows, red lanterns of a shop front, street food carts, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c4.png", "id": "bg/c4", "size": 1024, "magenta": false, "subject": "portrait background, a packed backpacker street at night with hostels, neon with no letters, street bars and fruit carts, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c5.png", "id": "bg/c5", "size": 1024, "magenta": false, "subject": "portrait background, a quiet beach-town promenade in low season, empty deck chairs, palm trees, a few lit bars, the sea at dusk, no characters, no text"},
    {"file": "art/raw/bg_c6.png", "id": "bg/c6", "size": 1024, "magenta": false, "subject": "portrait background, a northern night bazaar in hazy smoky air, orange lights glowing through haze, hills far behind, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c7.png", "id": "bg/c7", "size": 1024, "magenta": false, "subject": "portrait background, a beach club at night with a pool, cabanas, fairy lights and a dark sea, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c8.png", "id": "bg/c8", "size": 1024, "magenta": false, "subject": "portrait background, a small boutique by a wide river at night, a wooden deck, boats with lights on the water, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c9.png", "id": "bg/c9", "size": 1024, "magenta": false, "subject": "portrait background, a glass condo sales lobby at night with a scale model on a table, tall windows on city lights, empty middle, no characters, no text"},
    {"file": "art/raw/bg_c10.png", "id": "bg/c10", "size": 1024, "magenta": false, "subject": "portrait background, a rooftop sky bar sixty floors up at night, glass railing, the city spread below, empty middle, no characters, no text"},
    {"file": "art/raw/bg_home_2.png", "id": "bg/home_2", "size": 1024, "magenta": false, "subject": "portrait background, inside a rented shophouse room with a tiled floor, a folding shutter door, a ceiling fan, empty floor space, no furniture, no characters, no text"},
    {"file": "art/raw/bg_home_3.png", "id": "bg/home_3", "size": 1024, "magenta": false, "subject": "portrait background, inside a small modern condo with a balcony door and city view, wooden floor, empty floor space, no furniture, no characters, no text"},
    {"file": "art/raw/bg_home_4.png", "id": "bg/home_4", "size": 1024, "magenta": false, "subject": "portrait background, inside a penthouse with floor-to-ceiling windows over the night skyline, polished floor, empty floor space, no furniture, no characters, no text"},
    {"file": "art/raw/bg_phone.png", "id": "bg/phone", "size": 1024, "magenta": false, "subject": "portrait background, close-up of a street cart corner at night with an old red phone on a shelf and a biscuit tin with a fairy light, rain on the tarp, warm bulb light, empty middle, no characters, no text"},
    {"file": "art/raw/bg_locker.png", "id": "bg/locker", "size": 1024, "magenta": false, "subject": "portrait background, a wall of twenty numbered-style dented tin lockers with blank number plates in a back alley, four larger luggage lockers at the bottom, one bare bulb, no text"},
    {"file": "art/raw/story_p1.png", "id": "story/p1", "size": 1024, "magenta": false, "subject": "a small family food cart on fire in a narrow soi at night, a young woman with a short black bob holding grill tongs in shock, neighbours with buckets, no text"},
    {"file": "art/raw/story_p2.png", "id": "story/p2", "size": 1024, "magenta": false, "subject": "a slim red devil in a floral shirt and sunglasses holding out a paper and a gold pen to the young woman beside a burnt cart, neon fortune machine behind him, no text"},
    {"file": "art/raw/story_p3.png", "id": "story/p3", "size": 1024, "magenta": false, "subject": "a small warm flame inside a glass jar sitting on top of a neon street fortune machine, the devil's hand resting on the jar lid, no text"},
    {"file": "art/raw/ending_refuser.png", "id": "ending/the_refuser", "size": 1024, "magenta": false, "subject": "a young woman with a short black bob hanging up an old red phone at dawn while a small ferry boat arrives at a wooden canal pier, a kind lady in a poncho waving, no text"},
    {"file": "art/raw/ending_luggage.png", "id": "ending/left_luggage", "size": 1024, "magenta": false, "subject": "four open luggage lockers glowing gold in an alley, the neon fortune machine unplugged with its cable on the ground, the devil sitting on a suitcase looking surprised, no text"}
  ]
}
```

Count: 7 sheets of 4 (28 portrait and character cells) + 11 sheets of 9 (99 icon cells) + 27 singles = 154 new sprites. Content lane also writes these subjects into `docs/v2/ART_LIST.md` style notes and runs `scripts/cut-art.py`. Art is made from the main thread (memory note: subagent image prompts to ChatGPT get blocked).

## 8. Data files (content lane writes, core lane reads)

New files in `src/core/data/`, all made by a new `scripts/gen-v3-data.py` (so the other workflow's edits to `gen-v2-data.py` do not collide): `spirits.json`, `charms_v3.json`, `curses_v3.json`, `fusion.json`, `places.json`, `characters_v3.json`, `notebook.json`, `lockers.json`, `postcards.json`, `lessons.json`, `milestones.json`, `storm.json`, `goals.json`, `endings.json`, `achievements_v3.json`, plus a small `symbols_v3.json` with `redeye`. `src/core/data.js` concatenates the `_v3` lists onto the v2 lists at import. Every text is `{en, tr, th}` and composed from rules like v2.

## 9. Save v3

Key `pact.save`, `v: 3`. Migration from v2: `wax` to `stash`; `hideout` items map to Notebook Home tab ids; `contracts` cleared become bronze stamps; all else kept. New meta fields: `stash`, `keys {brass, silver, red}`, `notebook []`, `lockers []`, `luggage [4]`, `postcards []`, `spirits []` (unlocked), `devotion {}`, `codex {}`, `stamps {}`, `storm {}`, `lessons []`, `milestones []`, `goals {daily, weekly, streak, freeze}`, `whiteCalls`, `tutorialDone`. Run fields: section 3.8.

## 10. Build order: 4 lanes

Start after the current theme-rename workflow lands on `src` and `gen-v2-data.py` (or rebase on it). Each lane owns its files; a lane needing a change in another lane's file asks that lane. Builders are Sonnet agents, QA is Haiku reading frames; one headless muted GPU browser; frames at 390x844 and 1280x800, in en and tr (th spot check).

### 10.1 File ownership

| lane | owns |
|---|---|
| core | `src/core/*.js` (new: `spirits.js`, `omen.js`, `fusion.js`, `progress.js`, `calls.js`), `src/core/data.js`, `src/save.js`, `src/tutorial.js` (steps and seed logic), `scripts/check-core.mjs`, new `scripts/check-v3-core.mjs`, `scripts/sim-quick.mjs`, `scripts/play-cli.mjs`, `scripts/find-tutorial-seed.mjs` |
| ui | `src/ui/**` (all screens of section 6), `src/ui/ui.css`, `src/i18n.js` (UI strings and tutorial captions in en, tr, th), `src/main.js`, `scripts/shots.mjs`, `scripts/smoke.mjs`, `scripts/check-i18n.mjs` |
| view | `src/view/**` (new: `lever.js`, `kiosk-view.js`, `omen-view.js`, `phone-view.js`; changed `layout.js`, `view.js`, `reel-view.js`, `sprites.js`), `src/input.js`, `src/audio/**`, `public/sfx/**`, `scripts/check-view.mjs`, `scripts/check-audio.mjs` |
| content | `scripts/gen-v3-data.py`, every new JSON in section 8, `art/sheets.json`, `art/raw/*`, `public/img/*` (via `cut-art.py`), `scripts/check-content.mjs`, `docs/v3/*` |

### 10.2 Interfaces fixed up front (all lanes code against these)

- Core: `newRun` (adds `postcards`, `relics`), `phase()` adds `call`, `himOrMe`; `bank(run, amount)` (Kiosk), `payNow(run)`, `kioskForecast(run) -> {balance, tonight, rate, cap}`; `callOffer(run) -> cards[]`, `callPick(run, i)`, `callReroll(run)`, `hangUp(run)`; `tinVisit(run) -> {spirit, omen, demand}`, `offer(run, kind, size, target?)`, `acceptDemand(run)`; `honk(run) -> events`; `blendPreview(run, a, b) -> {cost, kind, outs}`, `blend(run, a, b, pick)`; `himOrMe(run, choice)`; `redEyeChance(run)`; `info(run)` gains `spirits`, `beads`, `redEyeChance`, `pace`, `due`. Spin results gain `redEye: {level, blessed}`.
- View: `layout.anchors` (named rects in CSS px): `goalBar, nights, purse, kiosk, kiosk.all, kiosk.forecast, special, spiceUp, lever, phone, honk, pattern:N, scoreLine, terms:N, stall.charm:N, stall.leave, tin.offer.<kind>.<size>, call.card:<id>, deal.sign, deal.back, lessons`. DOM anchors are added by ui with `data-anchor`; `coach.js` reads both through one `anchorRect(name)`.
- Events on the existing bus: `spin, stoke, bank, payNow, roundEnd, offering, buy, leaveShop, pickTerms, debtPaid, callOpen, callPick, hangUp, deal, dealBack, honk, blend, redEye, stage, wrath`.

### 10.3 Lanes and steps

**Core**
1. Data loading for `_v3` files with fixtures in `check-v3-core.mjs` until content step 1 lands. New primitives of section 3.8 in `effects.js`; reject unknown names. Verify: `node scripts/check-core.mjs` stays green; new worked examples W1-W4 below pass.
2. Kiosk interest on banked, PAY NOW, one-spin flow (score pending state), pace. Verify: W5, W6; `play-cli.mjs` run of c1 shows interest only from banked.
3. `spirits.js` + `calls.js`: Favour, stages, wraths, rivals, Patron limit, Him or Me, Tin, offerings, omens, demands, calls, beads, white call, due prices. Verify: W7-W10; a scripted run in `check-v3-core.mjs` reaches Noticed with Beckon from one coins offering.
4. `omen.js` (Red Eye), active charms and `honk`, `fusion.js`. Verify: W11-W13; 10,000 spins at debt 5 give Red Eye rate within 0.3 points of 2.5%.
5. `progress.js`, save v3 and migration, Left Luggage relics, Postcards, Storm, keys, lockers. Verify: a v2 save fixture migrates; `progressOf` returns the right numbers for 5 fixture items.
6. `tutorial.js` steps and new seed; sim and c1 retune. Verify: section 13 targets.

Worked examples (in `check-v3-core.mjs`, exact numbers):
- W1 `favour` effect +3 on Beckon at 0 with Wire at 6: Beckon 3 (Noticed), Wire 4 (lost 2, Friend stays reached).
- W2 Gold at 7, rival Moonbiter at 5, one trick offered (medium 3, Loved x2 = 6): 7 + 6 = 13, capped at 10, surplus 3 = +1 Caps; Patron reached; Him or Me raised.
- W3 two Patrons held: a third spirit offered +6 from 4 ends at 7.
- W4 Hated offering: Favour -1, the offered coins are gone.
- W5 banked 500, debt target 1,000, rate 8%: interest 40. Banked 5,000: interest capped at 250.
- W6 Flare-up with purse 300, banked 200, burn 20%: purse 240, banked 200.
- W7 hang up on a call with a red card, beads 2: beads 3, next call white with 3 white cards; Caps +3.
- W8 Pinky Promise taken on round 1 of a 3-round debt, debt unpaid after round 2: the highest-priced charm is removed at round 2 end.
- W9 Red Eye at debt 5 (level 2), purse 400 at round start, 520 now: spin pays 0, purse 400. With `redEyeSoft 1`: level 1, purse 520.
- W10 Red Eye with `redEyeBless`, patterns sum 20 at Spice 0: total 60.
- W11 HONK with Bike Horn (full) and Fish Sauce (1 of 2): only Bike Horn fires; Luck +3 for the next spin only.
- W12 Blend two common swarm charms: cost 2 Caps, two uncommon swarm choices, one slot freed.
- W13 Blend ember (uncommon) + hex (rare): `f_smog_wok`; with 3 curses: pattern mult all +1.5.

**UI**
1. `coach.js` overlay (hole, hand, caption, input block) driven by `TUTORIAL_STEPS` and a stub step list. Verify: smoke run taps through 27 steps with a fake run.
2. Run screen of section 6.1: chips with labels and tap explainers, spirits row, beads, Red Eye gauge label, pace, SCORE button, HONK, Kiosk sheet. Verify: frames `run-start`, `run-mid`, `kiosk-sheet` at both sizes, en and tr; Haiku checks that every chip has a word label and no raw id appears.
3. Stall with Tin strip, Blender tab; phone call, red card sheet, white call, Him or Me, PAID rank-up. Verify: frames `stall-tin`, `blender`, `call-green-red`, `call-white`, `himorme`, `paid-rung2`.
4. Map, Notebook, Lockers + Left Luggage, Codex, Home, run end "why you lost". Verify: frames `home-first`, `map`, `notebook-locked`, `lockers`, `codex-fusion`, `runend-lost`; every locked item shows a requirement sentence.
5. How to play (18 cards) and Guide buttons; i18n for all new keys in en, tr, th. Verify: `node scripts/check-i18n.mjs` (no missing keys, no banned words); frame of each card at 390x844 in tr.
6. Full first-launch play with real taps in the headless browser: tutorial ends under 4:00 and at most 40 taps; no console errors.

**View**
1. `layout.anchors` for every name in 10.2 at 390x844 and 1280x800; lever, Kiosk and phone positions in the machine layout. Verify: `check-view.mjs` asserts every anchor exists and lies inside the viewport at both sizes, and none overlap the SPIN button.
2. `lever.js`: drag, 70% threshold, spring back, tap-to-spin, disabled state, haptics. Verify: unit test of the threshold in `check-view.mjs`; frames `lever-mid`, `lever-down`.
3. Kiosk sprite with code-drawn screen numbers, hold-to-pour coin stream, interest tick-up; phone ring animation; place backgrounds and awning overlays. Verify: frames `kiosk-pour`, `phone-ring`, `bg-c3`, `awning-3`.
4. `omen-view.js`: Red Eye cells, red vignette, gauge on the trim; blessed variant in white-gold. Verify: frames `redeye-l2`, `redeye-blessed`.
5. Audio: add `lever_clack`, `lever_tease`, `kiosk_coin`, `phone_ring`, `call_red`, `call_white`, `redeye_sting`, `honk`, `blend`, `stage_up`, `wrath`; check whether `orhan_hm`, `orhan_cough`, `deni_blip`, `postcard`, `plank_gain`, `build_hammer` are used and remove the unused ones. Verify: `node scripts/check-audio.mjs`.

**Content**
1. `gen-v3-data.py` writing schema-valid stubs of every section 8 file (3 spirits, 2 recipes, 1 of each) so core and ui unblock. Verify: `node scripts/check-content.mjs` loads all files.
2. Full `spirits.json` (section 3.6 numbers, 104 lines in en; tr and th drafts), `curses_v3.json`. Verify: rivals symmetric, every own curse exists, every rule uses only allowed names.
3. `charms_v3.json` (48), `fusion.json` (24 distinct family pairs), `symbols_v3.json`. Verify: counts; no recipe pair repeats; every icon id is in `sheets.json`.
4. Progression data: places, characters_v3, notebook, lockers, postcards, lessons, milestones, storm, goals, endings, achievements_v3. Verify: locker contents equal the 30 locked charm ids exactly once; every Postcard and node cost is a number; every requirement is a known stat.
5. Art: merge the section 7.1 block into `art/sheets.json`, generate sheets from the main thread, `python scripts/cut-art.py`. Verify: `public/img/manifest.json` has every new id; contact sheet reviewed by eye for no text, no sacred or royal imagery.
6. Thai and Turkish pass and `docs/v3/STRINGS-REVIEW.md` for a native reader.

Lane dependencies: core 1 and ui 1 start at once (fixtures); ui 2 needs core 2 and view 1; ui 3 needs core 3 and content 2; ui 6 needs everything. View needs only content 5 for final art (placeholder colour boxes until then).

## 11. Not in v3 (named, skipped)

Online leaderboards, cloud save, charm stickers (GAP 1.5 modifiers), spin cost in coins, a 9th spirit, Patron costumes and Tin token skins (PROGRESSION locker 16 and 19 cosmetics, cut to keep lockers on gameplay), more patterns or symbols beyond `redeye`.

## 12. Risks

- Round length: the Tin strip and calls add taps. Target: under 45 s added per round, every new step skippable in one tap except the tutorial.
- The Kiosk rule change shifts the economy (interest on banked, not purse); all v2 balance numbers need the sim again.
- Folklore: names and looks need a Thai reader before release; if a spirit is flagged, rename or cut it; the system works with 7.
- Another workflow is editing `src` and `gen-v2-data.py` now; v3 lanes must start from its result.

## 13. Sim targets (core lane, `sim-quick.mjs`)

- c1 smart bot clear 60 to 75%; random bot 10 to 20%.
- Debt 1 of c1: median coins at the deadline at most 2x the target (AUDIT: 282 vs 46).
- Debt 5 of c1: smart bot pays it in 70 to 85% of runs that reach it.
- Favour: 3 to 5 stage crossings per run; Patron in 30 to 60% of c3 runs; never 3 Patrons.
- Red Eye: 1 to 3 events in an average c3 run.
- Run length c1: 8 to 11 minutes by spin and tap count at the sim's tap timing.

## Review

Reviewer view: CloverPit and Balatro player, mobile UX lead, Thai player. Read: this file, `PANTHEON.md` (sections 2 and 4), the places table in `PROGRESSION.md`. The Thai-risk points are my reading of the names and looks as written; a native reader has the last word, as section 0 already says.

Verdict: the machine layer is now close to CloverPit (lever, Kiosk with interest, Red Eye, phone, lockers). The weakness moved. The spec adds many meta layers and eight spirits with their own rules, but the **scoring layer has no new player decision**: the reel is still 12 symbols with Luck, and the only build tools are charms. And it is 3 to 4 times too big for one pass.

### 1. Still superficial

1. **No reel or pattern building.** CloverPit and Balatro are about reshaping the spin: add or remove symbols, level up a pattern. v3 has `removeSymbol`, `place` and `weight` as effects only; the player never buys them. Section 11 even bans new patterns and symbols. Result: every run scores the same way, only the charm numbers change.
2. **Many spirit blessings are plain numbers**: `luck +1`, `interest +2`, `interest +3`, `shopDiscount 10`. At Noticed and Friend the player feels a number, not a new way to play. Only Patron-level ones change play (`ashIsFav`, `twoFavs`, `extraLife`, `heatStep 25`).
3. **Red Eye punishment is empty for good play.** The Kiosk is always safe, and the rule is "bank to earn", so a banker loses one spin of pay at levels 1 to 3; the purse wipe in levels 2 and 3 only hits a player who keeps coins in the purse. Level 3 (debt 7+) is only reachable in places with 7+ debts (c1 has 5, c2 has 6, c3 has 8 per PROGRESSION section 3).
4. **Interest at debt 1 teaches nothing.** 8% of a 40-coin Kiosk balance is 3 coins. Tutorial steps 13 to 15 spend about 18 seconds on a number the player will not notice.
5. **Demands and Omens are 16 bespoke functions** (`letMePick`, `handTrick`, `keepCool`, `dare`, `ashNext`, `scorchOdds` ...) that each need their own evaluation code and UI, for a small effect each.
6. **Locked-item screens, 63 achievements, 50 goals, 14 milestones** give a reason to open menus, not a reason to play another debt.

### 2. A new player will not understand

1. **Five currencies and four meters on one screen**: coins (purse), Kiosk balance, Caps, Stash (meta), Favour (per spirit), plus Spice, Luck, Soot and beads. The tutorial teaches coins, Kiosk, Spice; Caps are only met in the stall; Favour first appears at step 18.
2. **Three places where spirits appear**: Spirits row, the Tin strip in the stall, the phone. Three paths to Favour (call pick, offering, Demand). The player must learn that a green card, an offering and a Demand all feed the same bar.
3. **Taste is learned by insulting.** A Hated offering costs the offering and 1 Favour, and the hint is one line of text. A new player's first experiment is punished. Show Loved and Hated icons on the Tin strip from the first visit.
4. **Hang up vs pick vs red vs green vs white vs beads** is six ideas on one screen. The tutorial covers only green and red (steps 23 to 26); beads and white calls would be a surprise.
5. **Word collisions in English**: Spice, Soot, Spin, Special, Spirits, Stash, Stall. Special and Favour sit next to each other and read as the same thing. "Rung N" on the PAID stamp collides with rank names and Storm levels.
6. **Step 14 says "bank it all", step 19 buys a charm with coins.** After banking everything the purse is 0. It works only because steps 16 and 17 add spins; the seed must guarantee purse >= the charm price at step 19. Same for step 18: the coin gift needs coins in the purse.
7. **Night count is unclear.** The tutorial and 6.1 say 3 nights; PROGRESSION section 3 gives c1 "2 nights". The spec does not state nights or debts per place, and the build depends on it.

### 3. Systems that duplicate another without adding a decision

| pair | problem | resolution |
|---|---|---|
| Tin offering, call gift, Demand | three paths to Favour and one reward | keep calls and offerings; cut Demand |
| Patron limit 2, Him or Me, rivals (-2 / +1 / -1) | three limiters on the same bar | keep rivals and Him or Me; delete the Patron limit |
| Tricks and active charms with HONK | both are "press a button before the spin, it is used up" | keep both only if HONK charms are few (8) and recharge; otherwise fold into tricks |
| Lessons, Guide cards, tutorial, first-time lines | four teaching systems | tutorial for the core, Guide cards = the Lessons list, first-time line = the Lesson trigger |
| Characters, Postcards, Storm | three "start of run modifiers" | v3.0: characters (exist) and Storm only; Postcards and 4 new characters later |
| Milestones, Achievements, Goals, Lessons | four tick-list systems | merge Milestones into Achievements; Goals later |
| Notebook, Devotion, Stash, Keys, Lockers, Left Luggage, Codex | seven meta layers for a 10-minute run | v3.0: Stash, Notebook (about 20), Codex; Keys, Lockers, Left Luggage later |
| Blender same-family upgrade vs the stall | same result as buying the rare | keep recipes only (the build decision); drop the same-family upgrade |

### 4. Contradictions and exploits

1. **Beads are free.** Ruby's card is always red and always shown, so "hung up on a call that showed a red card" is true on every hang-up. Three hang-ups give a white call: +1 to every symbol or pattern, permanently. Fix: a bead lights only when the player hangs up **after opening a red card sheet** (looked and refused), or only on Ruby's deal.
2. **Hang-up and Ruby Wrath fight.** Hang-up on Ruby's card is -1 Favour. Wrath 1 at -2 is `noInterest`, the headline v3 economy; Wrath 2 is no Pawn. Two hang-ups kill interest, so the bead system punishes the thing it rewards. Pick one: no Favour penalty for hang-ups, or beads cost nothing in Favour.
3. **The Refuser ending** (2 white calls) needs 6 hang-ups plus 2 white calls = about 8 calls, so a place with 9+ debts (calls start at debt 2). PROGRESSION has 5, 6, 8 for c1 to c3. Confirm the debt counts of c5 and later, or lower the trigger to 1 white call.
4. **"Never a threat" (PANTHEON, Waiting Lady) vs Wrath** for every spirit, including her (`noBeads`, `noRelic`). Fix by making her Wrath "she stops calling" only.
5. **Tutorial seed vs RNG.** The seed must also fix the Spice Up result at step 11 (no 3 Soot) and the forced Beckon visit at step 18. Any engine change after core step 6 breaks the seed; there is no CI check for it.
6. **Time budget.** The risk section says "45 s added per round". c1 has 5 debts with 2 or 3 nights = 10 to 15 rounds: 7 to 11 minutes added to a target run length of 8 to 11. Tin and calls cannot both fit that.

### 5. Thai cultural risk

The biggest risk is not the art, it is the **names and the verbs**.

1. **Names are glosses of the very figures PANTHEON says are not used.** "Auntie Beckon" is Nang Kwak (nang = lady, kwak = beckon) with the waving arm kept. "Little Gold" is Kuman Thong (kuman = boy, thong = gold), still a gold child figure who "likes toys" (treats are what keepers give Kuman Thong). "The Moonbiter" is the Rahu eclipse myth (Thai: Rahu mouthing the moon), including the moon with a bite. "The Waiting Lady" is Mae Nak: a woman in white-ish clothing waiting by a canal, kind, loved. The "not used by name or look" rows in PANTHEON section 2 do not hold when the English name translates the original. A Thai reader will see all four at once.
2. **The first run uses two of those four** (Beckon, Gold). The tutorial is where trust is made or lost.
3. **Offering vocabulary is worship vocabulary.** The Tin "offering" with a taste table, "blessings" at Noticed, Friend, Patron, and "Devotion" in the Notebook: this is merit-making and spirit-feeding in rule form, whatever the art. PANTHEON also says "no offering with food" and "no sacred feeding" while the offering table gives the spirit treats. Rename player-facing words: Gift or Treat (not offering), Perk (not blessing), Friendship (not Devotion), and keep the spirits as street neighbours.
4. **Spirits that tell you what comes next are the lottery-number trope** (asking a spirit for the numbers). Omens `nextFavs2`, `ashNext`, `scorchOdds` and Gold's "he picks the Special" are exactly that, in a game about luck. Reframe Omens as market gossip from a neighbour, not a spirit's foresight.
5. **White call.** White clothing and a white phone with a woman who waits has a ghost reading in Thai. Use another colour for the call, or a different caller.
6. **Thai UI names to flag**: the word for Spirits (ภูต is a Pali-register word for ghosts and spirits; avoid เจ้าที่ and เจ้า- titles, which belong to shrine spirits, and the draft name เจ้าทองน้อย has that prefix); ปี๊บ is a large tin pail, not a biscuit tin; ตู้ฝากเงิน is a deposit machine, fine for the Kiosk, while the common Thai word for an ATM is ตู้เอทีเอ็ม.
7. **Loan-shark theme.** Informal debt is a real harm for street vendors. The devil as a clerk is fine; keep Ruby's tone dry, never mocking, and keep the refusal ending kind.
8. **Thai layout.** No spaces between words (line breaks need `word-break` or `Intl.Segmenter`), tall tone marks (line-height at least 1.5), chips with a label under the icon get about 30% wider in Thai. "Max 12 words" is an English budget. Thai is "spot check" only in 10.3; it must be a full frame set at 390 for the run screen, call and tutorial.

### 6. Too big for one pass, and the cut

Size: 23 screens, 8 spirits, 154 sprites (18 sheets + 27 singles = 45 image generations, all from the main thread), 104 lines x 3 languages, 48 new charms, about 74 Notebook entries, 24 lockers, 18 Postcards, 63 achievements, 18 Guide cards, 27 tutorial steps, 10 triggers, 5 conditions, 7 effects, 15 flags, 3 RNG streams, in 4 lanes with 6 steps each.

**v3.0 (the cut):**
- Kiosk interest, PAY NOW, one-spin flow, pace, lever, phone call with **4 spirits** (Ruby, Wire, Tide, Lamplit; see section 5), green and red cards, Favour stages Noticed, Friend, Patron and Wrath; no Demand, no Patron limit, 3 Omens.
- Red Eye with 8 charms; HONK with 8 active charms.
- Tutorial of about 16 steps (change 3 below); Guide of 10 cards; run end "why you lost".
- Map with the 10 existing contracts, local spirit per place, 3 reused backgrounds with colour tints (not 9 new ones), Stash, Notebook (about 20), Codex without the Fusion tab, Lessons, Storm 1 to 5.

**v3.1:** Blender and 24 fused charms, Lockers and Left Luggage, Postcards, Keys beyond Brass, 4 more spirits after Thai sign-off, 4 new characters, Goals, white call, Storm 6 to 10, ending 5, awnings, home backgrounds.

The data-driven design in 3.7 already allows adding spirits as content only; keep it that way so v3.1 spirits need no engine work.

### 7. The 10 changes that most improve it

1. **Replace the four glossed spirits.** Ship v3.0 with Ruby, Wire, Tide, Lamplit. The first run becomes Ruby, Wire and Lamplit or Tide. Redesign Beckon, Gold, Moonbiter, Waiting as invented neighbours with no worship counterpart, or cut them. Rename "offering, blessing, Devotion". Do this before any art is generated.
2. **Add a stall item that changes the reel**: "Cart upgrade", 2 per stall: raise one pattern's multiplier by +1 for the run, or add weight to one symbol. It reuses `patMult` and `weight`, needs no new engine rule, and gives the Balatro build decision. This is the single biggest answer to "very superficial" and "nothing like CloverPit".
3. **Trim the tutorial to the core.** Keep steps 1 to 3, 5, 6, 9, 11 to 14, 16, 17, 20 to 25, 27 (about 16). Move the Tin offering (18, 19) into Lesson 1 after run 1. Add "Skip" after step 12 with a confirm; "no skip" is hostile to returning players. Add a CI check `check-tutorial-seed` to `check-v3-core.mjs` so a seed break fails the build.
4. **One Favour table, 6 sources**: call pick, offering, rival pair, Him or Me, hang-up (Ruby only), stage line. Delete Demand and the Patron limit; show Loved and Hated icons on the Tin strip.
5. **Fix beads and Ruby Wrath** (section 4 points 1 and 2): beads light only after the player opened a red sheet and backed out; no Favour penalty for hang-ups. Set the white call at 2 beads for v3.1.
6. **Set a round time budget and enforce it.** Calls: once per debt, hang up in 1 tap. Tin: appears only on the **first** night of each debt, one default "small gift" button, zero taps to ignore. Target: at most 25 s added per debt. Add a `check-flow.mjs` that counts taps and seconds per run in the sim.
7. **Fix the run screen for a real phone.** The bands add up to 748 px with no slack on 844; iOS Safari gives about 660 to 750 px, and Thai needs more height. Merge the Spirits row into one phone chip with beads; show spirits in the stall and a sheet. Move the lever knob 24 px or more off the screen edge (Android back gesture works on both edges) and give it a swipe-down on the reels as a second way. `navigator.vibrate` does not exist on iOS web, so the 5 haptic ticks need audio or visual ticks. The action row holds pockets + HONK + SPIN + Spice Up in 390 px: show HONK only when an active charm is held.
8. **Do the Thai sign-off before art**, in content step 2 (names, vocabulary, the Spirits word, ปี๊บ). Spirit portraits and the 3 story panels are the first art to go. Generate nothing for a spirit that has not passed.
9. **Put the bots in steps 2 to 4, not 6.** `sim-quick.mjs` needs policies for Kiosk, calls, Tin and HONK before any target in section 13 can be measured. Retune c1 right after the Kiosk change (core step 2), not after everything. Also state debts and nights per place in one table in this spec.
10. **Cut the meta** to the v3.0 list in section 6 and merge Lessons, Guide and first-time lines into one system. Every item cut is one less locked-item screen to build and one less thing a new player has to ask about.

### 8. Corrected build order

The order in 10.3 has these faults: the save migration is core step 5 but spirit state (3.8) is needed in core step 3; the sim bot is built last but every target needs it; the tutorial seed is last but ui 6 needs it; art (content 5) runs before Thai sign-off (content 6); the Blender, lockers and 5 progression screens sit in the same pass as the core loop.

**Gate 0 (parallel, no code):** the theme-rename lands on `src`; a Thai reader signs the 4 v3.0 spirit names, the vocabulary changes in section 5 and the Thai UI names; debts and nights per place are written into one table.

**Phase A: loop (core, view, ui in parallel)**
1. Core: save v3 and migration, run state fields (moved up from core 5), unknown-name check for effects.
2. Core: Kiosk interest, PAY NOW, one-spin flow, pace. Sim bot policies for Kiosk and PAY NOW. Verify: W5, W6; the c1 retune starts here.
3. View: anchors (view 1), lever with edge inset and swipe alternative (view 2).
4. UI: `coach.js` with a stub step list (ui 1); run screen with the merged spirits chip (ui 2), Kiosk sheet.
5. View: Kiosk sprite and pour, phone ring (view 3, placeholder boxes).

**Phase B: spirits (4 spirits)**
6. Content: stubs (content 1), then full data for the 4 spirits and their curses (content 2) after Gate 0.
7. Core: `spirits.js`, `calls.js`, offerings, Him or Me, due prices, beads (fixed per change 5). Bot policies for calls and Tin. Verify: W1, W2, W4, W7, W8 (W3 drops with the Patron limit).
8. UI: phone, red sheet, Tin strip, Him or Me, PAID stamp (ui 3).
9. Art for the 4 spirits, Ruby phone, 3 story panels, Kiosk, lever, phone (content 5, reduced).

**Phase C: Red Eye and HONK**
10. Core: `omen.js`, active charms and `honk` (8 of each); content: 8 active charms, 8 Red Eye charms. Verify: W9 to W11, Red Eye rate 2.5% at debt 5 within 0.3.
11. View: `omen-view.js`, audio.

**Phase D: first run and progression-light**
12. Core: tutorial steps (about 16), seed script and CI seed check, c1 retune to the section 13 targets.
13. UI: tutorial run in the headless browser (4:00, at most 40 taps), Guide of 10 cards, run end "why you lost", Map, Notebook, Codex, Lessons, Home. Frames in en, tr and **th** (full set) at 390x844 and 1280x800.
14. Release v3.0.

**v3.1** (own spec pass): Blender and fusion; Lockers and Left Luggage; Postcards; extra spirits after sign-off; white call; Goals; Storm 6 to 10; endings 4 and 5; awnings.

Lane ownership in 10.1 and the interfaces in 10.2 do not change; each lane builds the v3.0 subset first.
