| 10 | 1,538 | 20 | 63,202 || 9 | 1,061 | 19 | 43,588 || 8 | 732 | 18 | 30,060 || 7 | 505 | 17 | 20,731 || 6 | 348 | 16 | 14,297 || 5 | 240 | 15 | 9,860 || 4 | 120 | 14 | 6,800 || 3 | 60 | 13 | 4,690 || 2 | 30 | 12 | 3,234 || 1 | 15 | 11 | 2,231 |# SMALL LUCK PIER / Küçük Şans İskelesi — Game Design Document

Working title. Not searched in the stores or in USPTO / TürkPatent / EUIPO. Search before locking. Fallbacks: "Peg & Pier", "Deni's Pier". The Turkish title carries "Şans", which is close to the legal term for games of chance ("şans oyunları"). A Turkish title without it is prepared ("Küçük İskele"), and the lawyer is asked about the title and the listing wording, not only the mechanic (STORE.md section 3).

## 1. Pitch

Spin your grandfather's hand-cranked paper reel, peg the symbols you want to keep, and pay the harbor co-op before the tide goes out. A run takes 3 minutes. The pier, the boathouse and the story grow for weeks.

10-second rule: **Spin. Peg what you like. Spin again. Fill the lantern string before the spins run out.**

## 2. Pillars

1. **One thumb, 10 seconds to understand.** One big SPIN button, tap a cell to peg it. Nothing else is needed for the first run.
2. **The peg is the game.** Every spin ends with a choice: which cells to hold. Two of a kind is a decision the player owns. The reel never slows down, ticks or teases on a miss: every spin stops with the same timing. Pegs must add at least 40% to tide income (ECONOMY.md assert 17), or the rule is changed before any art is made.
3. **Honest reel.** Odds are the bag's content, always on screen, and the shop prints its real odds for the current pool. No hidden nudges. The one fixed sequence in the game is the tutorial tide of the first run, and the rules screen says so. No spin, peg or odds is ever sold.
4. **Soul first.** Deni talks, Orhan grumbles, the boathouse grows, neighbors move in and take jobs on the pier. Every finished run, won or lost, pays one line of story (a margin note, CONTENT.md section 8).
5. **Short run, long harbor.** Run 2-4 minutes. The story takes about 2 weeks (12 won runs). The meta lasts 3-4 weeks: boathouse, album, Daily Tide, Sunday Market, Open Season.
6. **Looks printed by hand.** Riso two-ink overprint and linocut lines on paper. No gloss, no glow.

## 3. What is different from other games in the genre

- 3x3 reel with **clothes pegs**: hold up to 3 cells for the next spin and move the pegs freely before every spin. Closest feel is a dice-hold game, not a casino slot. The peg is on screen in every screenshot and every clip.
- No wager. A spin costs nothing and never consumes coins. Coins are tips, used only to pay the quota and the shop.
- Odds are a visible bag of tokens that the player edits (add, remove).
- Warm daytime harbor, cut paper, a young woman and a gruff treasurer. No cell, no devil, no cards, no fruit, no sevens, no neon.

**The nearest games, named.** The run structure is close to three known games: Balatro (a rising target each round, a shop between rounds, five item slots, a numbered difficulty ladder, boss rounds, an endless mode), Luck Be a Landlord (a rent that rises, a symbol pool the player adds to and removes from, symbols that pay for their neighbors) and CloverPit (a 3x3 slot machine, a debt paid at deadlines, a shop between deadlines). The CloverPit points are from memory and are checked in M0. This overlap is a real risk for store review (copycat rule) and for players who know those games.

What is done about it:
- `docs/originality.md` compares the game with the three, item by item, against their wikis. It is an M0 gate (ROADMAP.md). No art or content is made before it is filled in.
- The game uses its own words: **trinket** (not charm or joker), **grade 1-4** shown as co-op stamps (not common to legendary), **installment tier** (not stake or ante), **Lamplight** (not overtime or endless), **creditor event** (not boss), **tide** (not round or deadline), **bag** and **token**.
- All 16 symbol names and 64 trinket names are checked against the three games' item lists. A clash is renamed.
- What the three do not have is the core here and is shown first everywhere: the clothes pegs held and moved by hand, no wager at all, a paper reel on a pier, and a home that is built.

## 4. Character and story

**Deniz "Deni" Aydın, 20.** An adult who came back from the city when her grandfather died. Dry and quick. Talks to the reel like it is a stubborn goat. Never whines. Her jokes are how she says she is scared. She is an adult in every text and every drawing, and her age is not stated in the store listing. No minor appears in any scene with the reel.

**Kaptan Orhan**, treasurer of the harbor co-op, grandfather Hasan's old rival. Holds the pier's deed. Gruff, exact, fair.

**Jobs, not decoration.** Deni and the neighbors run the screen:
- Deni's clothesline above the shelf is the pegs-left counter. She clips a peg off the line when a cell is held and puts it back when it is released.
- The coin jar sits on her crate and shows the fill.
- The shop is Hasan's dock crate until the Tea Corner is built. After that Madam Sevgi hosts it from her stall.
- Cem rings the big-win bell once the Rope Loft is built. Before that the bell rings on its own.
- Tekir sleeps on the reel case once the Cat Basket is built and wakes on a peg hit.
- Nermin Hanım is the Auditor of the creditor event and a neighbor after the Peg Rack.
- The home screen's main button is the next build, with its Plank cost.

**Place:** Karaburun harbor (fictional small Aegean town), off-season. Sun, salt, laundry lines, tea glasses, gulls, cats.

**Backstory:** Hasan borrowed from the co-op to buy the ferry's boiler, then died. Deni inherited a wrecked pier, a boathouse with no roof and Hasan's Reel (TR: Hasan'ın Çarkı): a painted wooden fairground box with a brass crank, bolted to the pier's end. It is never called a "fortune" or "luck" reel in any text. The debt is 12 installments.

**Structure:** each won run pays one installment. Each installment shows a 2-line story beat on the ledger screen. Every finished run, won or lost, also unlocks one margin note (CONTENT.md section 8), so no run ends with nothing to read. Neighbors arrive with boathouse builds, not with installments, so no beat below needs a neighbor to be present.

| Installment | Beat |
|---|---|
| 1 | Orhan stamps the first page. "Your grandfather was late with every one of these." |
| 2 | Deni finds Hasan's pegs in the reel case, initials carved on each. |
| 3 | Someone leaves a paper bag of warm simit on the reel case. No note. |
| 4 | Orhan returns Hasan's tea glass without a word. |
| 5 | A fishing boat ties up at the pier for one night. In the morning the rope is coiled and the pier still stands. |
| 6 | Deni learns Orhan and Hasan built the reel together in 1974. |
| 7 | Storm night. Orhan is seen checking the pier ropes at 3 a.m. |
| 8 | A letter from Hasan in the boiler room: "Ask Orhan about the drawer." |
| 9 | Orhan refuses to talk about a drawer. Raises the quota. |
| 10 | A receipt falls out of Orhan's ledger. He paid for Hasan's funeral. |
| 11 | The ferry boiler lights for the first time. |
| 12 | Twist: Orhan opens the drawer. Every payment is there, unspent. Hasan asked him to make her fight for it. The money is hers, for the teahouse. |

After 12: "Open Season" (free play with installment tiers 13-20), the boathouse becomes a teahouse, Orhan drinks tea on the pier.

## 5. Full loop

### 5.1 Run (2-4 minutes)

- A run is **5 tides**. A tide is **6 spins** and **3 pegs**.
- Run start: pick 1 of 3 shown grade 1 trinkets, free.
- Each tide: spin, peg, spin. Tips go to the jar. After spin 6 the quota is taken from the jar.
- Jar below quota: run ends. Jar at or above quota: the rest stays in the jar as shop money and carries to the next tide.
- After tides 1-4: shop (about 15 s).
- Tide 5 has a creditor event (a rule twist, see CONTENT.md).
- Win tide 5: installment paid, story beat, Planks counted. Option: continue into Lamplight (tides 6+) for score. Lamplight is open from the first won run (win installment 1); it costs no Planks.

### 5.2 Spin, second by second

| Time | Event |
|---|---|
| 0.00 s | Tap SPIN (or drag the crank down). Ratchet click. Pegged cells stay still. |
| 0.50 / 0.75 / 1.00 s | Columns 1, 2, 3 stop with a paper clack and a 2 px shake. The stop times are the same on every spin, whatever the result. |
| 1.00-1.80 s | Lines are inked in coral one by one, value pops, coins arc to the jar. Special symbols pay. Trinkets light up left to right, 0.12 s each (display order only; the pay order is fixed in section 6). |
| 1.80 s | Lantern string updates. Peg window opens: tap cells to peg, tap again to unpeg. No timer. A matching pair pulses once to invite a peg. |
| next tap on SPIN | Pegs lock, next spin. |

Tap during resolve skips to the total. Turbo (in settings from the first launch) halves all timings.

### 5.3 Meta loop (days and weeks)

Run ends -> Planks -> build Boathouse -> unlock trinket families and symbols -> new builds in the next run. Game modes are never unlocked with Planks; they open by playing (CONTENT.md section 5). Daily Tide and the streak bring the player back each day. Sunday Market runs each weekend. The Harbor Ledger track pays a reward every few tides.

## 6. Slot rules

- Grid: **3 columns x 3 rows**, 9 cells.
- **Bag:** a list of symbol tokens. Each unpegged cell draws one token at random from the bag, independently, with replacement. P(symbol) = its tokens / bag size. The bag screen shows each percentage.
- **Lines:** 8 lines (3 rows, 3 columns, 2 diagonals). A line pays when its 3 cells are the same line symbol. A Knot is wild: it counts as any line symbol. A cell can be part of several lines.
- **Line pay** is a fixed value per symbol (table below). Three Knots pay 12.
- **Special symbols** never form lines. They pay by their own rule. Adjacent means the 4 orthogonal neighbors. Every special symbol has a copy cap of 3 tokens per bag (Golden Cormorant: 2).
- **Lands:** a symbol lands when it is drawn fresh this spin. A held cell does not land again.
- **Pegs:** Deni has 3 pegs per tide. After a spin (not after the last spin of a tide), tap a cell to clip a peg on it and tap again to take it off. Up to 3 cells are held at once. A held cell keeps its symbol for the next spin. Pegs are not used up: before every spin the player is free to move them, and a cell can be held for several spins in a row. The pegs reset each tide.
- **Held cells never pay on their own.** A line pays only if at least one of its 3 cells landed this spin, so a finished line cannot be held and cashed again. An adjacency pair (Net and Sardine, and the like) and every "per symbol" pay count only if at least one of the cells landed this spin. "When it lands" effects (Bottle, the Kelp counter) do not fire for a held cell. `check-core.mjs` has a case for each of these, and one that holds a paid line for a whole tide and expects 0 from it.
- **Order of pay** (shelf order never matters):
  1. Each line: (base line pay + all flat line adds) x all line multipliers.
  2. Special symbols, in reading order.
  3. Spin flat adds.
  4. Spin multipliers on the sum.
  5. Round up once, at the end.
- **Outcome is fixed before the animation.** The view plays back a result that already exists. Every spin stops at the same times; there is no slow-down on two of a kind.

Start bag: 16 tokens.

| Symbol | Type | Line pay | Start tokens | Start odds per cell |
|---|---|---|---|---|
| Pebble | line | 4 | 5 | 31.25% |
| Sardine | line | 6 | 4 | 25.00% |
| Tea glass | line | 7 | 3 | 18.75% |
| Lantern | line | 10 | 2 | 12.50% |
| Gull | line | 14 | 1 | 6.25% |
| Sea glass | line | 22 | 0 | shop |
| Compass | line | 34 | 0 | shop |
| Golden Cormorant | line | 80 | 0 | shop |
| Knot | wild | 12 (three Knots) | 1 | 6.25% |
| Net | special | 2 per adjacent Sardine | 0 | shop |
| Samovar | special | 3 per adjacent Tea glass | 0 | shop |
| Cat | special | 4 per adjacent Sardine or Gull | 0 | shop |
| Kelp | special | once per spin, if any Kelp lands, pays its counter once (starts 1, +1 after it pays, max 5, per run) | 0 | shop |
| Bottle | special | +1 peg for the rest of the tide when it lands (max +2 per tide) | 0 | shop |
| Barnacle | junk | 0 | 0 | creditor events only |
| Storm cloud | junk | 0; it and its adjacent cells cannot be pegged | 0 | creditor events only |

Measured on the real core (start bag, no trinkets, greedy pegs): 4.71 coins per spin with no pegs, 8.33 with 3 pegs (50.0 per tide, 34.4% of spins pay nothing); 3 pegs add 76.7% (ECONOMY.md section 2).

## 7. Quota curve

`Q(t) = round(15 x 2^(t-1))` for tides 1-5. Lamplight: `Q(t) = round(240 x 1.45^(t-5))` for t >= 6. The installment tier multiplies the quota of tides 2 and later: `S(c) = 1 + 0.015 x (c-1)` (1.000 to 1.165), rounded up. Tide 1 is always 15. The numbers live in `src/core/econ.js`.

| Tide | Quota | Tide | Quota |
|---|---|---|---|
| 1 | 15 | 11 | 2,231 |
| 2 | 30 | 12 | 3,234 |
| 3 | 60 | 13 | 4,690 |
| 4 | 120 | 14 | 6,800 |
| 5 | 240 | 15 | 9,860 |
| 6 | 348 | 16 | 14,297 |
| 7 | 505 | 17 | 20,731 |
| 8 | 732 | 18 | 30,060 |
| 9 | 1,061 | 19 | 43,588 |
| 10 | 1,538 | 20 | 63,202 |

The lantern string shows jar / quota: 5 lanterns, one per 20%.

**Mercy:** once per run, if the jar is 1-5 coins short, Orhan clears his throat and rounds up. Always shown on screen and listed in the rules screen.

## 8. Shop rules

Shown after tides 1-4. Three offers and two services.

- **Offers:** 3 cards. Each card is a trinket (70%) or a symbol token (30%). Trinket grade roll: grade 1 60%, grade 2 30%, grade 3 9%, grade 4 1%. Only unlocked content appears, with no duplicates of held trinkets and no token that is at its copy cap. When a grade has no eligible trinket, it is skipped and the roll is redrawn among the other grades.
- **Printed odds are the real odds.** Each time the shop opens, the game computes the effective grade odds for the current eligible pool and prints those, not the nominal 60 / 30 / 9 / 1. With the start pool (no grade 4 trinket) the screen shows 60.6 / 30.3 / 9.1 / 0. The sim checks the printed numbers against observed draws for the start pool and the full pool (ECONOMY.md assert 14).
- **Prices (coins):** trinket 5 / 9 / 14 / 22 by grade. Symbol tokens 4-20 (CONTENT.md; the shop caps the price at 20), +2 for each copy of that symbol bought earlier in the run. No price growth per tide.
- **Trinket slots:** 5. Sell a trinket for half price, rounded down.
- **Remove a token:** 20 coins flat, at most 3 removals per run (all shops together, Lamplight included). There is no bag minimum. Junk Cart makes the first removal of a shop free; it still uses one of the 3.
- **Reroll:** 2 coins, +1 per use in the same visit.
- **Lock:** tap the pin icon to keep one offer for the next shop.
- The jar is also next tide's head start, so every purchase is a risk.
- Nothing in the shop is bought with real money or ads.

## 9. Meta, home and retention systems

**Planks** (meta currency, earned by play; one fixed grant of 60 in the starter pack; never converts to coins, spins, pegs or odds).
- 2 per tide cleared, +5 for a won run, +1 per clutch tide. **Clutch** has one meaning in every doc: the quota is reached on the last spin of the tide. A line completed with a held pair is a **peg hit**; it pays no Planks.
- First finished run: +10, printed on the run end screen as its own line ("First day on the pier: +10"). There is no hidden floor.
- Daily Tide: +5. Streak bonus per day in a 7-day cycle: 2, 2, 3, 3, 4, 4, 8.
- Harbor Ledger: 150 in total. Sunday Market: 25 per weekend.

**Boathouse** (the home screen itself, a layered paper diorama). 11 builds, 1,035 Planks total, about 16-22 days at 4-5 runs per day (11-14 with every Double Planks ad). Each build changes the diorama and unlocks content (CONTENT.md section 5). Neighbors appear at builds 3, 5, 7, 9, add a line of dialogue on the home screen and take a job in the run (section 4). The main button of the home screen is the next build.

**Album:** every trinket (seen / won with), every symbol, 24 postcards (Hasan's notes, found by play goals), 8 creditor stamps. Completion percent on the home screen.

**Daily Tide:** one seeded run per day. The draw for a cell depends only on the seed, the tide, the spin and the cell, and a shop offer only on the seed, the shop visit and the reroll index (TECH.md section 4). So two players who peg differently, or reroll a different number of times, still get the same random number for every cell and every offer; with the same bag they see the same symbols. Daily Tide and Sunday Market use a fixed pool (the 22 start trinkets and the start symbols) and a fixed start trinket, so unlocks do not change the run. One attempt, plus one retry by rewarded ad. Score = total coins. Local best and share card in v1.0. The date comes from the device clock in v1.0, so scores are personal. A server date check is required before the platform leaderboard (Play Games / Game Center) in v1.1.

**Streak:** counts days with a finished Daily Tide. One missed day per week is forgiven automatically. A broken streak restarts at day 1 with no penalty text and no paid repair.

**Sunday Market (weekly):** Friday 00:00 to Sunday 23:59 local time. A fixed Tide Chart (run modifier) and a fixed creditor. Three milestones by total tides cleared in the event: 5, 12, 20. Rewards: 10 Planks, 15 Planks, then a postcard or a cosmetic.

**Harbor Ledger (unlock track):** 30 steps, 1 XP per tide cleared, steps cost 5 to 40 XP. Rewards: 150 Planks in total, postcards, 3 reel skins, 2 hats. Free only, no paid lane.

**Three currencies, said once each to the player:** coins live inside one run (jar, quota, shop). Planks are kept between runs and build the boathouse. Ledger XP is a count of tides cleared and only moves the Harbor Ledger. Each is introduced by one sentence the first time it appears (section 10).

**Installments 2-12:** tier multiplier, and from installment 4 the player picks 1 of 2 Tide Charts at run start. From installment 7 a second creditor event appears at tide 3.

**Share card:** 1080x1920 riso-style PNG at run end: tide reached, best spin, trinkets as stamps, Daily Tide number, one Deni line. EN or TR.

## 10. Onboarding: first 5 minutes

| Time | Beat |
|---|---|
| 0:00 | No menu. Cold open on the pier. Deni: "Come on, you old box." A hand icon pulses on SPIN. |
| 0:05 | Spin 1 of the tutorial tide: two Sardines in the top row. Deni: "Peg them." Two cells glow. Only SPIN, the reel, the pegs and the lantern string are on screen. The bag button and the trinket shelf are hidden. |
| 0:12 | Player pegs both. Spin 2 completes the Sardine line. Coins fly, first lantern lights. |
| 0:25 | Spins 3-6 free play. The quota (15) is shown as the lantern string. |
| 0:50 | Orhan stamps PAID and says one line ("Hm. Again tomorrow."). Shop opens with 1 offer only: Salt Barrel, with a coach mark and a 3x3 example strip. The shelf appears when the trinket is bought. |
| 1:10 | Tide 2, normal seed from here. The bag button appears and pulses once: "This is what the reel can draw." |
| 1:10-3:00 | Tides 2-4. Shops show 3 offers from tide 2. No more coach marks. Mercy fires if needed. |
| 3:00 | Run ends (most first runs end at tide 3 or 4). Orhan says one loss line, Deni one line, and the first margin note is unlocked. Planks are counted with one sentence: "Planks stay with you. They build the boathouse." The line "First day on the pier: +10" is shown. No ad. |
| 3:15 | Home screen for the first time: wrecked boathouse. The main button is the first build, "Patch the roof" (10 Planks), which the first-run line always covers. Player builds it. Roof appears. Album unlocks. |
| 3:40 | Run 2 starts with the free 1-of-3 trinket pick. Each card has at most about 8 words and a 3x3 example strip. |
| 5:00 | End of run 2. Daily Tide tile appears on the home screen. No interstitial before run 3 ends. |

**The tutorial tide is disclosed.** Tide 1 of the first run uses one fixed seed, the same for every player. It is an ordinary draw from the start bag by the normal rng, chosen because spin 1 shows a Sardine pair and spin 2 completes it when the pair is held. Nothing is changed after the draw, and the tide can still fail if the player ignores the prompt. The rules screen and the privacy and rules page say: "The first tide of your first run is a fixed tutorial. Every spin after it is drawn from the bag." No other spin in the game is scripted. After that the first run relies on the 90% tide 1 pass rate and mercy.

**Staged reveal.** Run 1 teaches spin, peg, quota and one shop item. Bag and shelf appear at tide 2. Planks and the boathouse appear at the first run end. Ledger XP is named when the Harbor Ledger first pays. Tide Charts, creditor events and Lamplight are named when they first appear. Turbo and tap-to-skip are in settings from the first launch.

Rules for onboarding: no login, no consent wall before the first spin (consent prompt appears before the first ad request, after run 1), no store prompt, no notifications prompt until day 2. First boot shows one language choice (EN / TR) only if the device language is neither.

## 11. Pair, peg-hit, big-win and clutch beats

- **Pair (two of a kind):** there is no near-miss effect. The reel does not slow down, tick or buzz, and no animation plays on a miss. Every spin stops at 0.50 / 0.75 / 1.00 s. After the spin, the two matching cells pulse once to invite a peg, and Deni may say a line at the normal 1-in-4 rate. This was chosen because a slow-down on a possible third match is the standard tension device of real slot machines, would fire on most spins, and is what reviewers and regulators read as a gambling mechanic.
- **Peg hit:** a held pair completes. This is the only anticipation beat, and it is tied to the player's own choice: peg snap, coral ink sweep, Tekir wakes, Deni: "Told you."
- **Big win (40+ coins in a spin or 2+ lines):** 80 ms hit-stop, pier lanterns light in sequence, ship's bell (rung by Cem once he has moved in), paper fish burst from the crank, camera tilts 3 degrees.
- **Clutch clear (quota reached on the last spin of the tide):** red PAID stamp lands on Orhan's ledger, he nods, a gull passes behind him. This is the share moment.
- **Mercy:** Orhan clears his throat, pushes 1-5 coins across the desk. "Rounding. Don't tell the co-op."
- **Loss:** the lantern string dims, Orhan closes the ledger softly. Deni: one line, never self-pity. The run end screen shows the new margin note and the Planks. No offer of any kind is shown on a loss except the small Double Planks button, which is the same on a win.

## 12. Screens

1. Pier (game): sky strip with Orhan's window and lantern string (top 18%), reel 3x3 in wooden case with crank (48%), Deni's strip (14%): trinket shelf with 5 slots, her clothesline with the pegs left, the jar on her crate; SPIN button, spins left, bag button (bottom 20%).
2. Shop (slides over the reel; hosted by the dock crate, later by Sevgi).
3. Bag and odds (tokens, percentages, line pay table, rules, mercy rule, effective shop odds, the tutorial note, the "every spin stops the same" note).
4. Ledger (tide paid / run end with margin note / installment story beat).
5. Home: Boathouse diorama, next build as the main button, Daily Tide tile, Sunday Market tile, Play button.
6. Album (trinkets, symbols, postcards, margin notes, stamps).
7. Harbor Ledger track.
8. Run start (free trinket pick, Tide Chart pick from installment 4).
9. Store (IAP, restore purchases).
10. Settings (language EN/TR, sound, music, haptics, turbo, reduced motion, save export / import code, privacy, credits).
11. Share card preview.
12. Pause (resume, rules, quit run).
13. Creditor event intro (stamp, who, the rule in one line, one Orhan line).
14. Lamplight choice after a won run (continue or stop, with the next quota shown).
15. Daily Tide result (score, best, streak calendar, retry-by-ad button).
16. Sunday Market (the fixed chart and creditor, progress to the 3 milestones).
17. Wardrobe (equip reel skin and hat only; there are no outfits in v1.0).
18. Trinket inspect (full rule, 3x3 example strip, sell button; opened by tap or long-press).
19. First boot (language choice if needed; the consent prompt comes later, before the first ad request).

## 13. Definition of done

The full content is too much for one developer before the first release, so it ships in two steps (weeks in ROADMAP.md).

**v1.0-lite (soft launch, Android):**
- 12 symbols (the 8 start symbols, Cat, Samovar, Barnacle, Storm cloud), 35 trinkets (the 22 start trinkets, Pier Cat, the 4 radio Tide trinkets, the Hearth family), 6 Tide Charts (spring_tide, neap_tide, bare_line, market_day, tight_shelf, long_evening), 4 creditor events (auditor, fog_bank, short_day, low_water).
- Installments 1-6 with story beats, 18 margin notes, Lamplight, Daily Tide and streak, Album.
- 6 boathouse builds: roof, stove, cat_basket, radio, tea_corner, lamp_post (345 Planks).
- Not in lite: Sunday Market, Harbor Ledger, cosmetic packs, wardrobe, share card, iOS. They are decided after soft-launch data.

**v1.0 (full):**
- 16 symbols, 64 trinkets, 12 Tide Charts, 8 creditor events, 15 unlockables, all Deni and Orhan lines in EN and TR. The content beyond lite arrives as monthly drops (MONETIZATION.md section 7).
- 12 installments with story beats, 36 margin notes, Lamplight, Daily Tide, streak, Sunday Market, Harbor Ledger, Album, share card.

**Both:**
- `npm run check` passes: core rules, balance sim asserts (ECONOMY.md), i18n parity, economy, view, audio, smoke.
- QA frames pass at 390x844 and 1440x900, in EN and TR, for every screen in section 12 that the build contains.
- Cold start to first spin under 3 s on a mid-range Android phone. 60 fps on the reel.
- Run length median 2:30-3:30 measured in playtest. First tide pass rate 90% or higher. Pegs add at least 40% to tide income.
- Rewarded ads, interstitials with caps, IAP product ids and restore purchases work on the Android test build (iOS when the iOS milestone is taken).
- Consent flow (UMP, ATT on iOS), privacy policy URL, data safety forms, age rating answers done (STORE.md).
- Odds screen shows every symbol percentage, the effective shop grade odds, the mercy rule, the tutorial note and the equal-stop-timing note.
- Originality review done (`docs/originality.md`): no borrowed term, name or screen layout from the games it lists.
- No copyrighted or look-alike asset. All art from the project's own sheets. Sound licenses saved in `docs/licenses/`.
- Title search done in both stores and trademark databases. Legal opinion for Turkey obtained or Turkey excluded.
