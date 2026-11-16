# PROGRESSION v3: from the soi corner to the tower

Status: design. Companion to `docs/v3/PANTHEON.md`. Builds on `docs/v2/GDD.md` (sections 6, 12, 13 and the 10-contract ladder), `docs/v2/data/*.json`, and the CloverPit research in `docs/v2/GPT-IDEAS.md` (drawers and keys, memory cards, telephone calls, unlock by achievement). `docs/v2/THEME-TH.md` did not exist when this was written, so story names are placeholders for the theme owner. All numbers here are designed by ratio and are **not simulated**.

Owner feedback this answers: "I don't know how to play it", "There is no progression", "It is very superficial", "start in Thailand and get rich". The plan has five parts: (a) a clear teaching path, (b) progression inside a run, (c) progression between runs, (d) a long ladder after the ending, (e) a rule that **every unlock is visible before it is earned**.

## 0. Words and currencies

| name here | meaning | v2 name |
|---|---|---|
| Savings | meta currency, earned only by playing, never sold | Wax |
| Wick | in-run second currency | Wick (unchanged) |
| Favour | per-run standing with a Power (see PANTHEON) | new |
| Devotion | lifetime relationship tier with a Power | new |
| Keys (Brass, Silver, Red) | open the Locker Wall | new (CloverPit drawers) |
| Postcards | run modifiers, chosen before a run | new (CloverPit memory cards) |
| Monsoon | ascension level, 1 to 10 | new |
| Place | one of 10 Thai locations; one contract each | contract |
| Home | the screen between runs; grows with wealth | hideout |

Player text never uses "bet", "wager", "stake", "casino", "slot", "jackpot", "gamble". Thai terms are shown where known and need a Thai reader to confirm.

## 1. How the player learns to play (the first answer to "I don't know how")

Rule: **one new idea per run for the first eight runs.** The Guide is a checklist called *Lessons* that sits at the top of the Home screen. Each lesson is a short goal with a reward. Lessons never block the game; they are a visible path, like a job ladder.

| # | Lesson | Goal in a run | Reward | Taught by |
|---|---|---|---|---|
| 1 | Spin and Patterns | Land a Line of 4 | 10 Savings | the fixed first 6 spins (GDD section 14) |
| 2 | Stoke the Heat | Spin once at Heat 3 or more | 10 Savings | pulsing STOKE |
| 3 | Bank and Interest | Bank coins and earn interest once | 10 Savings, Brass Key | BANK glow |
| 4 | Charm and Order | Own 3 charms and reorder them once | 15 Savings | wagon |
| 5 | Trick and Pocket | Use a trick after the reels stop | 15 Savings | pocket glow |
| 6 | Meet a Power | Make your first offering at the Tin | 15 Savings, Brass Key | Tin opens on the first visit |
| 7 | Sign or Refuse | Sign one deal, refuse another in a run | 20 Savings | Brimble deal |
| 8 | Reach a Stage | Get one Power to Friend (Favour 5) | 25 Savings, Silver Key | Tin pips |
| 9 | Bench | Do one bench job | 20 Savings | wagon |
| 10 | Fall and Rise | Lose a run, then clear a debt in the next | 20 Savings | home reminder |

- Each lesson appears as a chip on the run screen only until done. A lesson chip names what to do and why in one line ("Stoke adds Heat: more pay, more Ash").
- A **Guide** button on every screen opens a one-page card for that screen: what it is, what to tap, what it costs. Cards unlock as the lessons are cleared and stay in the Codex.
- Scores are always explained in the three-number line from GDD section 4.
- The first run has no menu (as GDD section 14) and uses only three Powers (Brimble, Auntie Beckon, Little Gold).

## 2. Progression in a run: what changes every few minutes

The v2 run had debts and a shop. A v3 run adds seven kinds of visible change so that a 12-minute run feels like a climb.

1. **Rung and rank.** Each paid debt moves the player up one rung of the place's ladder, and on rung 3, 5 and 7 a **rank-up** screen shows a new title and a picture change in the background of the machine (the cart gets a awning, then a stall, then a shop sign). Titles come from the place (section 3).
2. **Audience.** After each paid debt: pick 1 of 3 Powers, then Gift or Red Call (PANTHEON 3.3).
3. **Deals.** Brimble's two deals as in v2.
4. **Tin.** One offering per round (PANTHEON 3.2). Favour pips fill and Stage banners pop (Noticed, Friend, Patron).
5. **Wagon.** Charms, tricks, bench jobs.
6. **Boss rule.** Debt 3 and each last debt carry a named rule (GDD critic pass), shown as a red tag.
7. **Run ledger.** A ledger line at run end shows the Savings earned, Keys found, Codex entries opened and the lesson ticks, so each run ends with a visible score for the long game.

**Run end screen** lists, in order: debts paid, rank reached, Savings earned (3 per debt plus contract reward plus lessons plus milestones), Keys, Codex new entries (with thumbnails), Favour highlights (best Stage reached), a button for "Locker Wall" if a key was found.

## 3. The Thailand map (10 places = 10 contracts)

The map is one screen: a hand-painted strip of Thailand running from the capital south and north, with ten tags (the same hand as the Home art). Each place is a **contract**. The first is open. Each cleared place opens the next and unlocks a Power and a story beat. The map shows the whole route from day one, with the locked places greyed and a line under each naming the exact requirement.

The tone is rags to riches: a street kid with a debt to the devil on the first corner, a tycoon in a tower at the end. Real places are used only as everyday markets and ports; no temples, no royal sites, no religious festivals.

| # | Place | GDD contract (rules) | Wealth rank earned (clear) | Local Power (guaranteed in first 2 Audiences) | Local boss rule | Home changes to | Unlock on first clear |
|---|---|---|---|---|---|---|---|
| 1 | Soi Corner, Bangkok | 1 The Starter Pact (5 debts, 2 nights, shop shows 2 charms) | **Street Kid** (dek soi) | Mr. Brimble | none | a mat, a crate, a cooking pot | Uncle Wire (Power), character Tao, node row 1 |
| 2 | Yaowarat Night Market, Bangkok | 2 Standard Terms (6 debts) | **Tray Hawker** (phoo-kha dtaw) | Uncle Wire | The Auditor | a push cart, a tray, fairy lights | The Waiting Lady (Power), Silver Key |
| 3 | Floating Market, Damnoen Saduak | 3 The Full Ledger (8 debts, ending 1) | **Boat Vendor** (mae kha reua) | The Waiting Lady | The Collector | a rowboat with an awning | character Pip, Postcard slot 1, ending 1 |
| 4 | Chatuchak Weekend Market, Bangkok | 4 Short Wick (as 3, one fewer spin per card) | **Stall Owner** (jao khong ran) | Auntie Beckon | The Timekeeper | a canvas stall with a sign | Auntie Bua character, Brass Key x2 |
| 5 | Night Bazaar, Chiang Mai | 5 Dry Season (interest halved) | **Shop Owner** (tao kae) | Lady Lamplit | The Miser | a rented shop-front room | Lady Lamplit (Power), Silver Key |
| 6 | Truck Stop on the Korat Road | 6 Cinder Week (Ash +2, Scorch 20%) | **Wholesaler** (phoo kha song) | The Moonbiter | The Head Inspector | a small warehouse | The Moonbiter (Power), character Doc Rattle |
| 7 | Old Town, Phuket | 7 Head Office Audit (start with 1 curse; ending 2) | **Shophouse Owner** | Grandmother Tide | The Veiled Clerk | a two-storey shophouse | Grandmother Tide (Power), ending 2, Silver Key |
| 8 | Samui Ferry Pier | 8 Thin Shelves (3 charms, rerolls double, no lock) | **Ferry Boss** | Grandmother Tide and Lady Lamplit | The Collector | a pier office | character Old Sok, Postcard slot 2 |
| 9 | Laem Chabang Container Port | 9 Two Nights Only (2 rounds a debt) | **Shipping Magnate** | any two rivals at once | The Head Inspector | a glass-walled harbour office | Red Key x1, character Grandma Yai |
| 10 | Sathorn Tower, Bangkok | 10 New Management (2 curses, forced deal; ending 3) | **Tycoon** (jao sua) | Mr. Brimble | the full deal-boss set | a penthouse: the Home has a view of the whole map | Ending 3, Monsoon ladder unlocked, title **The One Who Signs** |

- Thai terms in the rank column are transliterations that need a native read. The English title is the one the UI uses until confirmed. Never use the title of a person of religious office or of royal rank.
- Each place has a short story page (the **place card**) of three lines shown on entry and kept in the Codex: who the street kid meets, what the local Power wants, a joke.
- The map shows a **fame meter** (a tiny coin-and-stamp counter per place): bronze (cleared), silver (cleared with no Scorch), gold (cleared with no deals signed). Each stamp adds Savings and fills a Codex page; the total of stamps (30) feeds a milestone.
- Endings stay as in the GDD (1 Paid in Full, 2 Bought the Machine, 3 New Management). Their trigger rules are the GDD's. A new Power-linked epilogue panel per Power shows after ending 3 if the Power reached Patron in that run (8 panels).

## 4. The persistent unlock tree (spend Savings)

One screen: **The Notebook**, a notebook with five tabs. A node is a boxed entry with a cost, a requirement, and a one-line effect. **All nodes are visible from the start**; locked nodes are drawn greyed with the requirement in plain text and a progress bar if it counts something. A node cannot be bought until its requirement is met (it shows the exact missing piece). This is the main "unlock, then use" loop and the answer to "no progression".

Income reference (unverified): 3 Savings per debt, plus the place reward (20 at place 1 to 250 at place 10), plus lessons, stamps and milestones. A casual first week (about 15 runs) should earn about 400 Savings; the full tree costs about 3,700. Aim: first node reachable after run 1 (20 Savings).

### 4.1 Tab 1: Cart (starting rules; options, not flat power)

| id | name | cost | requires | effect |
|---|---|---|---|---|
| cart_01 | Second Stool | 20 | none | choose 1 of 2 starting tricks |
| cart_02 | Tip Jar | 30 | lesson 3 | the first wagon has one free reroll |
| cart_03 | Spare Bag | 45 | clear place 1 | extra charm slot costs 8 Wick not 10 |
| cart_04 | Starter Shelf | 60 | clear place 2 | choose 1 of 3 common charms at run start |
| cart_05 | Loan Slip | 70 | 3 deals signed in total | start with 3 Wick |
| cart_06 | Night Pass | 90 | clear place 3 | skip-a-night once more per run |
| cart_07 | Postcard Stand | 100 | clear place 3 | one Postcard slot (see 5.3) |
| cart_08 | Back Pocket | 130 | 25 tricks used | fourth trick pocket, but each trick costs 1 Wick to buy |
| cart_09 | Fresh Start | 160 | clear place 5 | a second Postcard slot |
| cart_10 | Lucky Coin | 220 | 5 gold stamps | choose the starting Favourite for the first spin of the run |

### 4.2 Tab 2: Tin (the Powers)

| id | name | cost | requires | effect |
|---|---|---|---|---|
| tin_01 | Tin Shelf | 40 | meet a Power (lesson 6) | 2 offerings per round |
| tin_02 | Taste Note | 25 | 5 offerings made | Powers' tastes show as icons in the Tin (loved, meh, hates) |
| tin_03 | Rival Chalk | 50 | one Him or Me event seen | rivals are connected by a line on the Tin screen |
| tin_04 | Second Audience | 120 | clear place 4 | after a debt, pick 1 of 4 Powers (not 3) |
| tin_05 | Patron Memory | 150 | a Power at Patron 3 times | choose a Power: its Patron stage arrives at Favour 7 |
| tin_06 | Red Phone | 200 | 5 Red Calls taken | reroll an Audience for 1 Wick once per debt |
| tin_07 | Devotion tiers | see 4.4 | per Power | per-Power ladder |

### 4.3 Tab 3: Pool (the charm, trick and deal pool)

The v2 pool starts with 74 of 124 charms; 30 are locked (GDD section 7) and tied to achievements. In v3 they are listed in the Pool tab with their silhouette and the exact way to unlock them, so nothing is hidden.

| id | name | cost | requires | effect |
|---|---|---|---|---|
| pool_01 | Common Cabinet | 25 | none | +4 commons enter the shop pool (from the locked 30) |
| pool_02 | Uncommon Cabinet | 50 | clear place 2 | +4 uncommon charms |
| pool_03 | Rare Cabinet | 90 | clear place 4 | +3 rares |
| pool_04 | Crown Cabinet | 140 | clear place 6 | +2 legendaries |
| pool_05 | Trick Drawer | 40 | lesson 5 | +3 tricks |
| pool_06 | Deal Drawer | 60 | 5 deals signed | +4 deals (6 of 24 deals start locked) |
| pool_07 | Hex Drawer | 80 | 10 curses carried in total | +3 curses (adds hex variety) |
| pool_08 | Family Binder | 100 | 40 charms owned | pick a family: +1 charm of it in each first wagon |

### 4.4 Tab 4: Crew (characters)

| id | name | requires | starting rule | tie to Power |
|---|---|---|---|---|
| crew_01 | Nim (street kid, 19) | start | +1 Luck, a Nudge | Gold Favour 1 |
| crew_02 | Tao | clear place 1 | rounds start at Heat 3, Heat pays +20% each level, Matchbox, a Chili | Lamplit Favour 1 |
| crew_03 | Auntie Bua | reach debt 6 | picks the Favourite on spin 1 each round, 4 slots | Beckon Favour 2 |
| crew_04 | Doc Rattle | pay a debt with 4 curses | 1 curse, each curse gives all symbols +0.25 mult | Moonbiter Favour 2 |
| crew_05 | Old Sok | 5,000 interest in total | interest +5%, sells at full price, no Wick, Abacus | Tide Favour 2 |
| crew_06 | Pip | clear place 3 | 6 slots, 3 deals, 1 curse, Thumbprint Note | Brimble Favour 2 |
| crew_07 | Grandma Yai (noodle seller) | 10,000 coins banked in total | interest +2, a free bank per round | Tide Favour 3 |
| crew_08 | Beng (moped boy) | 100 tricks used | pockets 4, Wire gives a Nudge each debt | Wire Favour 3 |
| crew_09 | Pla (ring kid) | survive 20 Scorches | starts at Heat 2, Scorch gives +1 Wick | Lamplit Favour 3 |
| crew_10 | Mali (night-bus conductor) | use 3 Spare Candle or Pawn | a Spare Candle each debt | Waiting Lady Favour 3 |

Names are placeholders for the theme. Character art shows the silhouette and the "how" line before unlock.

**Devotion tiers per Power (from tab 2).** Each Power has 3 Devotion tiers bought with Savings. Tier 1 (30 Savings, reach Noticed once): start every run with +1 Favour. Tier 2 (60, reach Friend 3 times): the Power's tastes are always visible, and its Omen costs no offering. Tier 3 (100, reach Patron 2 times): the Power's Red Call has a one-line preview of the exact price on the Audience card before you tap it. The 8 Powers total 8 x 190 = 1,520 Savings.

### 4.5 Tab 5: Home (cosmetic and comfort; not power)

| id | name | cost | requires | effect |
|---|---|---|---|---|
| home_01 | Cot | 0 | start | a mat and a crate on the corner |
| home_02 | Radio | 25 | lesson 1 | background music choices (3) |
| home_03 | Lantern String | 60 | clear place 2 | home glow at night |
| home_04 | Notice Board | 80 | 3 lessons | the Lessons list becomes a wall board |
| home_05 | Tin Shelf (decor) | 100 | clear place 3 | Powers' tin tokens stand on a shelf; a pip glows when a Power is at Patron in your best run |
| home_06 | Machine Skin: Brass | 120 | 5 gold stamps | cosmetic skin |
| home_07 | Machine Skin: Neon | 150 | clear place 7 | cosmetic skin |
| home_08 | Brimble's Hat Stand | 200 | 20 deals signed | cosmetic hat set for the devil |
| home_09 | Map Frame | 250 | all places cleared | the map hangs on the wall |
| home_10 | Tower View | 400 | clear place 10 | the home window shows the skyline |

Cosmetic items are never sold for money (GDD section 16 allows cosmetics in the store but the Savings route is open to everyone).

## 5. Keys, lockers and postcards (CloverPit's drawers, made ours)

### 5.1 The Locker Wall

A wall of **20 numbered tin lockers** stands behind the cart; the wall appears in the Home screen from run 1 (with all 20 shut). Each locker has a padlock. Three key types, each a visible chip on the Home screen:

| key | colour | sources (all in-game, never sold) |
|---|---|---|
| Brass Key | bronze | first clear of each place (1), every 3 debts paid in a run (max 2 a run), lessons 3 and 6, daily goals (1 a day), weekly bonus goal |
| Silver Key | silver | milestones, place 2, 5 and 7 first clears, weekly contract clear, Monsoon clears, lesson 8 |
| Red Key | red | win a run with a Red Call from at least 3 different Powers; the 5th Red Call signed in total; a gold stamp at place 9 |

Each locker shows its contents silhouette, the key it needs, and a second line if it needs more than a key (for example "needs Red Key and a Monsoon 3 clear"). Opening is a satisfying 2-second animation: the door pops, the item is revealed in the Codex style.

### 5.2 Locker list (20)

| # | key | extra lock | contents |
|---|---|---|---|
| 1 to 6 | Brass | none | 6 locked commons from the charm list (a family each: swarm, ember, hex, ledger, pact, omen) |
| 7 to 10 | Brass | clear place 3 | 4 locked uncommons (stitch, wisp, tinker, crown) |
| 11 to 13 | Silver | none | 3 locked rare charms |
| 14 | Silver | 10 Lessons done | Postcard Pack I (4 Postcards) |
| 15 | Silver | place 6 clear | Postcard Pack II (4 Postcards) |
| 16 | Silver | 5 gold stamps | Tin Token skins (8, one per Power) |
| 17 | Red | clear place 7 | a legendary charm family (3 legendaries) |
| 18 | Red | Monsoon 3 clear | Postcard Pack III (4, the hard ones) |
| 19 | Red | Monsoon 6 clear | a Power's "Patron costume" (8 skins) |
| 20 | Red | all 19 other lockers open | the **Night Market Deed**: title, home decor, Codex page, and the final locker story (a letter) |

The 30 locked charms of GDD v2 map to lockers 1 to 13 and 17 (30 charms in all); the achievements unlock rule stays for those without a locker (the existing achievements.json keeps granting Savings).

### 5.3 Postcards

12 Postcards. A Postcard is a run modifier chosen on the contract screen (1 slot at node cart_07, 2 slots at cart_09). A Postcard has a gain and a cost, shown in full.

| # | Postcard | gain | cost |
|---|---|---|---|
| 1 | Rainy Day | +1 spin each round | debts +8% |
| 2 | Hot Pan | start at Heat 3 | Ash weight +1 |
| 3 | Fresh Fish | +4 Luck at run start | Luck falls by 1 each debt |
| 4 | Night Bus | +3 Wick at start | the first wagon is skipped |
| 5 | Borrowed Coat | +1 charm slot | Brimble's offers show only 1 deal |
| 6 | Short Cut | pay a debt with 2 rounds left for double early pay | cannot skip a night |
| 7 | Crooked Scale | Wire and Beckon Favour +2 | Tide and Waiting Lady Favour -2 |
| 8 | Old Photograph | The Waiting Lady Favour +3 | Brimble Favour -3 |
| 9 | Thumb on the Scale | one free Favourite redraw each round | the Favourite is hidden for spin 1 |
| 10 | Empty Wallet | start with 0 coins | the first debt is 30% smaller |
| 11 | All In Pocket | tricks cost nothing at the wagon | shops show only tricks |
| 12 | Mother's Voice | the first Wrath of the run is cancelled | Patron stages arrive at +1 Favour |

Postcards work through the EFFECTS.md flag system (`flag`, `weight`, `spins`) plus a Favour field; none touches the base data.

## 6. The Codex (collection)

One screen, six tabs. Every entry always exists; unfound entries show silhouette + label "?" + **how to get it** in plain words (where, not spoiler).

| tab | entries | states | reward |
|---|---|---|---|
| Charms | 124 | silhouette, seen (name, art), owned (full text), mastered (won a place with it 3 times, gold frame) | 25 / 50 / 75 / 100% each pay Savings (10 / 20 / 30 / 60) and a Brass Key at 50% |
| Tricks | 20 | same | Silver Key at 100% |
| Symbols and Patterns | 9 symbols + 3 specials, 12 patterns | seen, landed, landed with 5+ cells | a Postcard at 100% |
| Deals and Curses | 24 + 16 + 8 Power curses | seen, signed, survived | Brass Key at 50% |
| Powers | 8 Powers x 10 pages (see below) | each page opens by Favour or by event | Patron costume at 100% |
| People and Places | 10 characters, 10 places, 3 endings + 8 epilogues | seen, cleared, stamped | the Night Market Deed progress |

**Power pages (10 per Power).** Pages open by the event named on them: 1 meet; 2 first offering; 3 first Loved offering; 4 first Insult; 5 Noticed; 6 Friend; 7 Patron; 8 Wrath; 9 Red Call; 10 Him or Me. Each page has a short story beat and one joke. This is the "gods have personalities" layer that persists after the run.

**Completion bar.** The Home screen shows a completion ring with the total of all entries (about 380); the number is the single progress figure the player sees.

## 7. Milestones that change the Home screen

Home is a living illustration. The scene changes at fixed points so that progress is seen, not read. Each change is a visible event the player hears about once on the next Home visit.

| # | Milestone | Home change |
|---|---|---|
| 1 | Finish run 1 | a price tag appears on the first Notebook node; the Lesson list gets a pencil |
| 2 | Clear place 1 | a mat becomes a plastic stool, a radio sits on a crate |
| 3 | 10 debts paid in total | a string of lanterns above the cart |
| 4 | First Power at Patron | its tin token sits on the Tin Shelf and glows |
| 5 | Clear place 3 | the cart becomes a rowboat tied to the wall |
| 6 | 20 lockers opened (all) | the Locker Wall is gilded |
| 7 | Clear place 5 | the cart sits in a rented shop front; day/night cycle begins |
| 8 | 30 stamps | a framed map hangs on the wall |
| 9 | Monsoon 1 clear | rain on the window; an umbrella stand |
| 10 | Clear place 7 | a two-storey shophouse; Brimble's hat on a hook |
| 11 | Clear place 9 | a harbour crane in the window |
| 12 | Clear place 10 | a penthouse with the skyline; the cart is a trophy on a shelf |
| 13 | all 8 Powers at Patron at least once | the Tin Shelf is a golden shrine-like cabinet (no religious image: a glass display case of tin tokens) |
| 14 | Monsoon 10 clear | the Night Market Deed hangs framed; final screen change |

Home always shows: the current rank title, a Savings counter, three Key counts, the Lessons list, the completion ring, a map button, a Notebook button, a Locker Wall button and a PLAY button.

## 8. Ascension: Monsoon 1 to 10

After the first clear of place 10, the Monsoon ladder opens. It is the **ascension** the genre expects. Any place can be played at a Monsoon level. Monsoon N unlocks when any place is cleared at Monsoon N-1. Rules are cumulative.

| level | name | added rule |
|---|---|---|
| 1 | Rain Clouds | the first terms card of each debt has 1 spin fewer |
| 2 | Wet Roads | the wagon shows 1 charm fewer |
| 3 | Cheaper Words | each deal's curse is one step harsher |
| 4 | Flood Watch | all debts +10% |
| 5 | Wary Neighbours | every Power starts at Favour -1 |
| 6 | Heavy Rain | Scorch burns 15% (20% if the place already burns 20%) |
| 7 | Power Cut | the Tin is closed on the first round of each debt |
| 8 | Rising Water | debts +25% in total (cumulative with 4) |
| 9 | Storm Front | the boss rule also applies to every third debt |
| 10 | The Perfect Storm | start with 1 curse; Wrath thresholds are at Favour -1 and -4 |

Rewards: each Monsoon clear gives a Silver Key and 30 Savings the first time; Monsoon 3, 6, 10 give the extra lockers (18, 19, 20). A tag shows the highest Monsoon cleared per place on the map. Targets for the sim: Monsoon 10 smart-bot clear rate below 5% on place 3, so players still have a chase in a year.

## 9. Daily and weekly goals

**Daily run (as v2).** Seeded by the UTC date, fixed character, place 2, one forced terms card and one starting curse. Only the first attempt is scored. v3 additions: **three daily goals** drawn from a pool of 30 (examples: pay debt 2 with a Wire charm; reach Friend with a Power; clear a debt with no Scorch; sign 2 deals; do a bench job; finish round 3 with 0 tricks left). Each goal gives 10 Savings; completing all three gives a Brass Key. No penalty for missing a day; a **streak** of 7 gives a Silver Key and a **freeze** is awarded each week so that one missed day does not break it.

**Weekly goals.** Five goals (examples: pay 15 debts; make 25 offerings; take 3 Red Calls; open one locker; clear a place at Monsoon 2). Each goal gives 20 Savings; all five give a Silver Key.

**Weekly contract.** A seeded contract with 2 modifiers (for example "Auditor everywhere", "no Tin", "double Wick") fixed by the ISO week. Score is debts then total coins, stored locally. A shareable seed code is shown (no server, no account; the code is text players can paste to compare).

**Rules.** Dailies and weeklies do not sell time: no paid reset, no paid keys, no timer pressure; the pool is rotated so no day repeats within 30 days.

## 10. Visibility rules ("show it before it is earned")

1. Every unlockable object is **listed from the start**: charms, tricks, deals, curses, characters, places, Powers, Notebook nodes, lockers, Postcards, endings, Monsoon levels, skins.
2. A locked object shows: its silhouette; its name (except three ending titles, which show "???" but still show the requirement); the **requirement as a sentence** ("Clear Floating Market"); a **progress bar** if it is a counter ("17 of 25 tricks used"); the **screen** where it can be earned.
3. A just-unlocked object shows a toast on the screen where it happened and a glow on its Home button until viewed.
4. Locked tiles on the map, Notebook, Codex and Locker Wall use the same grey style so players learn the visual language.
5. The Pool tab lists every locked charm with its own unlock route; nothing is "random drop only".
6. A "next up" strip on Home shows the **closest three** unlocks to completion and the cost to finish each.

## 11. Build order and data

1. `places.json` (10 places: id, name, contractId, rank, localPower, boss, homeScene, unlocks). Reuses `contracts.json`.
2. `gods.json` (PANTHEON 3.7).
3. `notebook.json` (about 50 nodes: id, tab, cost, requires, effect).
4. `lockers.json` (20), `keys.json`, `postcards.json` (12).
5. `lessons.json` (10), `milestones.json` (14), `monsoon.json` (10).
6. `daily-goals.json` (30), `weekly-goals.json` (20 pool).
7. A persistent save in `localStorage` with a version and a migration (new `save.v3`): Savings, Keys, unlocked nodes, Devotion, lockers, Postcards owned, codex flags, stamps, Monsoon highs, streak. No server.
8. A `progress.js` module (pure functions: `canUnlock(node, save)`, `progressOf(node, save)`) so the UI can draw any locked item from the same data.

## 12. What is not verified

- Savings income and the 3,700-Savings tree are guesses; check against a 20-run sim.
- Monsoon rules were never run; Monsoon 10 may be unclearable or trivial.
- Locker contents map 30 charms by family; the exact charm ids need a pass against `charms.json`.
- All Thai rank titles, the Thai place-name spelling and all character names need a Thai reader.
- The Tin adds a screen per round; one-tap skip is required.
