# AUDIT: the current build played by a brand-new player

Build: `dist/` as it stood (newer than `src/`, no rebuild). Headless muted Chrome, throwaway profile, 390x844 at 2x, touch emulation, English, storage cleared before run 1. Every action was a real mouse tap at a pixel position. I used `?debug=1` only to read state (spins left, phase). No console errors or exceptions in the whole session.

Frames: `docs/v3/audit/rN-NNN-label.png`, one after every action (228 files). Run 1 is r1-001 to r1-194 (first game, played to game over, then home screens). Run 2 is r1-196 to r1-225 (the `/start?run=2` flag was not used, so run 2 files keep the `r1-` prefix and continue the numbering; storage was kept so run 2 shows the returning-player flow).

Played: run 1 reached debt 5 of 5, died on night 3 (933 short), about 190 taps, roughly 25 minutes of play. Run 2 was ~35 taps, then stopped at the deal screen of debt 1.

Owner's verdict, restated: "I do not know how to play, it is not detailed, there is no progression, it is superficial, there are no gods, nothing like CloverPit." After 30 minutes I agree with every word. The build is a clean tech demo of a slot loop. It is not yet a game with a world.

---

## 1. Timeline: what the player sees, tries, and misunderstands

Format: frame, what I saw, what I tried, where it broke.

**0:00 cold open (r1-001).** No title, no menu, no story. The machine is already on screen. Top card: "Debt 1 of 5, Night 1 of 2, Spins 5", a bar "0 / 46", a sentence "Pay 46 more to clear debt 1 of 5 by the end of night 2". Under it 5 chips: a coin "0", a brown spiral "3", a wishbone "4", a sprout "+0", a rosette with a candle and an arrow. Then a flame and 10 empty boxes "Heat 0". A Brimble speech bubble: "One small debt. Take your time. Not too much."
- Confusion: I do not know who I am, where I am, why I owe 46 of what, or what the five chips are. The brown spiral looks like a worm. Nobody says the machine is a slot machine. Tapping the chips does nothing (only the rosette chip reacts, and it shows "?" or "1" with no explanation).
- A red bubble says "Tap SPIN. Three of one symbol in a row or a column pays." That is the only instruction. It is right but tiny.

**0:20 first spin (r1-002, r1-003).** Reels stop. Pay 7. A pile of white, orange, green and red lines is drawn over the board. A black label "7" sits above the machine. Brimble: "Hm. Do that again and I will have to read the contract." That line has nothing to do with what just happened.
- Confusion: the board had 3 candles in a column, but lines crossed 7 cells in 4 colours. Which line paid what? Why are some boxes green, some red, some white? No legend. The purse chip says 7, the debt bar still says 0 / 46.

**1:00 second tap (r1-004).** The big button now says COLLECT, not SPIN. A new red bubble: "Try the Nudge: tap the trick, then the lit column." A green dashed column lights up. I had not used a trick before; the Nudge icon (a pointing hand) sits bottom left in a row labelled "Tricks".
- I tapped COLLECT because it was the biggest red thing. That took the win and killed the trick window. The nudge hint was now wrong ("Use it after the reels stop" came later and the pocket was greyed out). This is a trap in the very first minute.
- Later frames show the machine auto-collecting some spins and asking COLLECT on others (r1-043 on). I could not find the rule. It cost me one real spin per two taps in two stretches (I spun when I meant to collect).

**1:30 to 3:00 first wins (r1-005 to r1-018).** Purse climbs 7, 30, 41, 54. Debt bar stays 0 / 46. "+0" on the sprout chip becomes "+2", "+3", "+4". Wick (the spiral) goes 3, 5.
- Confusion: "I have 54 coins and the debt is 46, why is the bar at 0?" The purse and the debt bar are two separate numbers. Nothing says "you must press BANK". The BANK button turned bright yellow when I could afford it, which is the only hint.
- I opened the bag icon (r1-006): an empty sheet "Your charms, 0 of 5 slots. Charms work left to right. Order matters." Empty, no example of a charm.
- Wick: I have no idea what it is for until the shop. The sprout "+N": never explained, anywhere, including How to play. I still do not know what it does. It looked like "interest per night" in the end-of-debt text but I am guessing.

**3:00 banking (r1-019, r1-020).** Dialog "Pay into the debt 46 owed" with a native blue slider, Half, All, Bank 46. Tiny line: "Banked coins are safe from a Scorch but earn no interest." After banking, a full screen "Debt paid, PAID" stamp, Nim says "One down. I am counting." Then "1 nights unused: +2 Wick, 6 spins carried to the next debt and a free trick." Bad grammar, and I had not noticed any spins being "unused".
- The first debt took 8 taps. There was no way to lose.

**3:30 the devil's paper (r1-021).** The best screen in the game. Brimble, a card "Lucky Break: you get +1 Luck / you carry Blindfold: you cannot see the Favourite". SIGN, or REFUSE for +3 Wick.
- Confusion: what is Luck? What is the Favourite? Why would I want to see it? I could not judge the deal. There was exactly one offer, so no real choice.
- After signing, the rosette chip became "?" and a skull badge "1" appeared on the curse bag. The consequence is visible, good. But the player does not learn what "Favourite" was.

**4:00 first shop, Pip's wagon (r1-022 to r1-027).** Three tabs: Charms, Tricks, Bench. Purse 8, wick 7. Every charm costs 9 coins. I could not buy anything with coins (8 < 9). Pip: "Buy two. Brimble does not count the wagon." The only affordable things were bench jobs paid in wick.
- Confusion: two currencies, and the icons for them are a coin and a spiral worm. Charm tags "Hex", "Crown", "Tinker", "Swarm", "Omen" mean nothing. "Lock" and "Reroll 0" have no tooltip. I bought "Gild: one symbol mult +0.25" for 4 wick and was shown a list of the 9 symbols with their values. That was the first time I saw what a symbol is worth. The paytable is hidden inside a shop dialog.
- A dead shop on the first visit (nothing buyable with coin) is a bad first impression of the main build system.

**5:00 tonight's terms (r1-027, r1-028).** Three cards: Wishbone Night 4 spins +3 Luck, Short Fuse 3 spins spin total x2, Ghost Night 4 spins wisp weight +300%. Top card then says "Spins 10". I picked Short Fuse because "x2" is obviously the strongest.
- Confusion: why 10 spins when the card said 3? (It is a pool: carried spins plus the card's spins, but it is not said anywhere.) "Round", "night" and "spin" are mixed in card text. Short Fuse (x2) is almost always the best card, so there is no real pick.

**6:00 debt 2 cleared in 3 spins (r1-029 to r1-036).** A score line "32 x 2 = 64", a chip "short_fuse +32" (raw internal id shown to the player). Purse 138 against 106 owed. I banked. Debt 2 took about 15 taps and 3 spins.
- Progress feeling: strong for 15 seconds, then nothing new happens.

**7:00 deal 2 (r1-037 to r1-039).** Two papers: Borrowed Time (+1 round per debt / debts 15% larger) and Borrowed Muscle (mult +0.5 / -2 spins on first round). I had to scroll to see the second one, and my tap on the lower SIGN signed the first one. I ended up with "debts 15% larger" without meaning to. Next debt: 258 (should have been about 220). Wording: "-2 spin" (singular), "mult", "round".

**8:00 boss debt 3, "The Auditor" (r1-039).** A red line: "Boss debt. The Auditor: 3-cell patterns pay half." That is all. No picture, no intro, no change on the machine. Debt 297, 3 nights.
- Shop prices jumped from 9 to 22 and 37 coins. I had 34. I bought Hot Coal (22): "Always, if Heat 4+: all patterns mult +0.5". Hot Coal only matters if I push Heat, a thing nobody explained.

**9:00 STOKE (r1-042, r1-043).** I tapped STOKE blind. "Heat 1, +20% pay" and Brimble: "More Heat. I like a customer with ambition." The heat bar is the only gauge on the screen. Free +20% per Heat, no cost shown. After 3 more STOKE I was at Heat 4, +80% pay. The grey piles that appeared on the reels (Ash, r1-159) are not named on screen. A Scorch happened once (Brimble: "The machine is fine. Your purse is lighter. Everyone learns.") and I could not tell what I lost.
- The risk is invisible and the reward is a flat multiplier, so the correct play is always "STOKE to 4+ and spin".

**10:00 to 14:00 debts 3 and 4 (r1-044 to r1-129).** Four to five spins per night, 2 to 3 nights. I tapped SPIN around 70 times. Decisions made: terms card (3 times), shop buys (4), deal (4). Wins of 20 to 180 coins arrive with the same animation. Brimble barks are random and unconnected: "Hm. Do that again and I will have to read the contract" after a 92x2 jackpot, "Nothing. It happens. Ask the candle" after a 36-coin win.
- I skipped two shops by accident: SPIN, STOKE, BANK, SIGN and "Leave the wagon" all sit in the same thumb zone (y 797 to 804), so a second tap on a button that just changed meaning leaves the wagon. A real player double-tapping SPIN will do the same.
- Never used: Salt, the hourglass trick, and a third trick shown as a dark green coin icon I could not even read. Tricks are optional, never required, and nothing tells you when one would help.
- End of night 3 with 175 coins in the purse and 142 owed: I pressed END NIGHT without banking and the game banked it for me and paid "Interest earned: 14". So the BANK button is optional and the whole bank/purse explanation was wasted on me. The How to play says "keep them in the purse for interest", the bank dialog says "no interest". Both are true and together they are a puzzle, not a rule.

**15:00 final boss, debt 5 "The Miser" (r1-130 to r1-188).** 1,127 coins in 3 nights. I held 5 charms: Hot Coal, Cinder Vow, Witch Bottle, Crown Bond and a bag. Per spin I made 4 to 20 coins on most spins. At Heat 6 (+120%) it was still hopeless. Reached 194 / 1,127 and lost 933 short.
- The jump from debt 4 (581) to debt 5 (1,127) with the same 5 spins per night and the same 5 charm slots has no answer in the build the player has. My charms were each +5 to +20% and the debt grew 94%.
- The Pawn screen (r1-187): "You are short. Brimble gives you one more night if you burn a charm and take a random curse." Nice idea, but I was 933 short, so one more night was useless. The offer is not gated by whether it can help.

**25:00 game over (r1-188).** "Brimble collects. Fine. Light it again. I'll do it better." Stats: Debts paid 4, Biggest spin 184, Scorches 1, Deals signed 4, Curses 5. "+17 Wax". "Unlocked: Charm: Ghost Parade, Charm: Dividend Slip, Charm: Second Sight, First Instalment, Busy Night, To the Coin, House Favourite". Buttons Home, Again.
- Seven unlocks, none with an icon or an explanation. Four of them are achievements and three are charms, mixed in one list.

**26:00 home (r1-189 to r1-194).** Title, a Brimble bubble ("Back already? The paperwork missed you."), "The Hideout, 17 Wax", 10 furniture tiles. The cheapest costs 25 Wax. Tap the stove: "Start each run with one extra random trick. 8 more Wax". Below the fold: Daily run, Collection, How to play, Store, Settings, language. A giant Play button.
- You have to scroll to find How to play. You can reach it only from home and from the gear icon.
- Progression on this screen is nine furniture pieces and the numbers 25, 40, 60, 80, 100, 120, 150, 200, 300 Wax. One run earned 17 Wax. At that rate the first piece costs 2 runs and the last costs about 25 runs, for effects like "one extra random trick".

**26:30 How to play (r1-195).** Seven numbered rules and a four-step scoring list. It opens already scrolled down (the Rules, Symbols, Patterns tabs are cut off at the top). It never mentions Wick, Luck, the sprout chip, Favourite reroll, Lock, Reroll, Bench, Hideout, or Wax. That is 7 of the 12 concepts on screen.

**27:00 run 2, returning player (r1-197 to r1-225).** Play opens straight on "Tonight's terms" with the machine hidden behind it. No hints now, no first-run bubbles. There is also a button "Skip this night: +6 Wick". I picked Wishbone Night and spun. Debt 1 (46 coins) was paid six times over in 5 spins: purse 121 after 3 spins, 147 after 5, 282 by the end of night 2.
- The first debt is a free pass in every run. Pip's shop is generous here (6 to 12 coin charms) and I bought 3 charms (Moth Mother, Night Swarm, Oil Can) with money I could have banked. Nothing said that spending the purse in the wagon reduces what I can pay the debt with.
- Tapping the first charm slot opens a clean card (Moth Mother, rarity, family "Swarm", text). That is good. But "Swarm" is just a word.

---

## 2. What means nothing to a newcomer

Screens and numbers a new player cannot read:

| Element | Why it fails |
|---|---|
| The 5 HUD chips | Icons only, not tappable, no tooltips. Wick looks like a worm. The sprout "+N" is never explained and keeps growing. |
| "Spins 14" vs card "4 spins" | A pool that includes spins carried from earlier debts. Not said. |
| Heat bar | Ten boxes and the label "Heat 0". Nothing says it is a risk dial. "Ash" and "Scorch" show up in one tutorial line and nowhere on the reels. |
| Favourite / Luck | The chip is tiny. Luck is a number "4" with a wishbone, and a second Luck inside "+3 Luck this round". |
| Win lines | Four colours, up to 20 lines drawn on a 5x3 grid, with no legend and no cell labels. |
| Score line "32 x 2 = 64" and "c1 +9" | Fine for me as a developer. A player sees a formula with ids ("short_fuse", "c1"). |
| Tags: Hex, Pact, Tinker, Ember, Swarm, Wisp, Omen, Crown, Ledger | Charm families with no explanation, no filter, no sense of "buy three Ember to win". |
| Rarity borders | Green, orange, grey frames mean Uncommon, Rare, Common. Never stated. |
| Lock, Reroll 14.4 | No tooltip. A reroll price with a decimal. |
| Bench: Pull Out, Load, Gild | The right idea (shape the machine). Text uses "weight", "mult", the player has no concept of either. |
| Boss debt | One red sentence. |
| Wax | Introduced after the death screen. |
| Unlock list | 7 names, no art, charms and achievements mixed. |
| The nine hideout tiles | Effects are only visible if you tap each one. |

---

## 3. What feels like progress, and what does not

Feels like progress:
- The PAID stamp and the Nim line after each debt. A real, small beat.
- The deal screen (SIGN / REFUSE with "you get" and "you carry"). The only screen with a decision that has a price.
- Buying a charm and seeing it appear in the bottom slots.
- A 184-coin spin. The black score label and the coin shower are good.

Does not feel like progress:
- Debts 1 to 4 each play the same: 4 or 5 spins per night, pick the best-looking terms card, bank, sign. Debt 2 and debt 3 differ only by a bigger number and a red sentence.
- The five debts are one corridor. A run is about 110 spins and 10 minutes of play with no change of place, no change of machine, no change of music or background. The backdrop in r1-001 and r1-159 is the same fair tent.
- Charms are small. Hot Coal +0.5 mult at Heat 4, Witch Bottle x1.12 per curse. Four charms did not change what a spin felt like. I never saw a build click.
- Meta progress is a list of furniture for Wax with tiny effects. 17 Wax earned, 25 needed for the first.
- Death gives a list of names. No visible goal for run 2 ("next time try X").
- Nothing carries across runs except Wax and unlocks. There is no map, no character, no god, no chapter. Run 2 felt identical to run 1 except the tutorial was gone.

---

## 4. Against the owner's complaints

| Owner said | What the build shows |
|---|---|
| "I do not know how to play" | Confirmed. One instruction line, a hidden How to play that skips half the concepts, a SPIN/COLLECT rule that changes, and a Bank step that is not needed. |
| "The game is not detailed" | The machine is 5x3, 9 normal symbols, 3 specials, 1 character, 1 devil, 1 shopkeeper, 1 backdrop. Charms are flat numbers. |
| "There is no progression" | Hideout tiles only. No map, no unlockable machines, no characters, no routes. |
| "Very superficial" | 80% of taps are SPIN. Per-spin choice is zero. |
| "There are no gods" | The only supernatural beings are Brimble and Pip (a clerk and a salesman). No pantheon, no patron, no worship, no favour system. The "devil pact" is a paper you sign four times. |
| "Nothing like CloverPit" | No rising pressure room, no escalating dread, no drawer of consumables you place before the spin, no weird caller, no shop that changes the rules. The visible dials are Heat and the purse; neither makes the spin itself scary. |
| "Start in Thailand and get rich" | Not present in this build at all. `docs/v2/THEME-TH.md` is missing. The art is a night fair with moths and candles. The word "Thailand" appears nowhere on screen (only a Thai language button). |

---

## 5. The 15 biggest fixes, ranked

Ranked by how much each one moves "I know how to play, there is something deep here, I want run 2".

1. **Teach in the first 90 seconds with a scripted prologue, not one-line bubbles.** Show the story (who you are, where, what you owe, who is the devil) on 3 to 4 panels, then drive the first spin by hand: point at the reels, then at the coin chip, then at the debt bar. Every HUD chip must be tappable and explain itself in one sentence and a picture. Move "Wick", "Luck", "Favourite", "+N", "Heat" into that teaching. (r1-001, r1-002, r1-006)
2. **Kill the purse/bank split.** One number: "Pay-in this night: X of Y". Auto-pay at the end of the night (already what the game does), show the progress bar as purse plus banked, and remove "BANK" from the main row or rename it "Pay now (optional)". Delete the contradictory "no interest / keep in purse for interest" rule or draw it on screen. (r1-019, r1-129)
3. **One consistent spin button.** Auto-collect always. SPIN is SPIN. The COLLECT step and the one extra tap per spin go away. Do not let hints change the meaning of the button. Move SPIN away from where "Leave the wagon", "SIGN" and "END NIGHT" land. (r1-004, r1-043, r1-130)
4. **Make the win readable.** One line at a time with a number floating over the cells, a plain-English list "3 Candles in a column: 7", a paytable button on the machine, and clear stale win lines the moment a new debt starts. No raw ids (`short_fuse`, `c1`) ever. (r1-003, r1-005, r1-034)
5. **Give the run a world and a route.** Replace the single corridor with a map of places (the Thailand arc: a street stall, a night market, a boat, a temple fair, a casino tower) and a different machine, backdrop and music per stop. Each stop is a chapter of 2 to 3 debts. A run should have 12 to 15 debts, not 5. (r1-001 vs r1-159 are the same scene)
6. **Add gods.** Pick a patron before each chapter or per run; each has a favour track, a boon, a price, a taboo (for example "never leave Heat at 0", "never refuse a deal"). The devil is one of them, not the only one. Gods change what the machine does, not only a multiplier. (Owner request; the build has none.)
7. **Give the player a decision every spin.** Per-spin choices: hold a cell, spend a trick, swap a symbol, redirect Heat, choose which charm fires first. CloverPit-style "drawer" consumables set before the spin. Today tricks sit unused all game. Make the first 3 debts force you to use one trick (a locked column you must unlock, a hex you must salt away). (r1-004, r1-016, tricks never used after r1-018)
8. **Fix the difficulty curve and show the pace.** Debt 1 is free (46 coins, run 2 made 282), debt 5 is a wall (1,127). Show "on pace / behind" from the debt bar (needed per remaining spin), make the charm and bench power curve match the debt curve, and test the sim at each debt with the shop the player really gets. (r1-129, r1-188, r1-204)
9. **A better first shop.** Make the first visit affordable (the player had 8 coins against a 9-coin floor), use one currency or make the second currency obvious (Wick looks like a worm), and replace tags with a visible "set bonus" ("Ember 2/3") and a short example. Tooltips on Lock and Reroll, round the decimals. (r1-022, r1-062)
10. **Make the Bench the heart of the shop.** "Gild", "Load" and "Pull Out" are the best idea in the build (you reshape the reels). Show the reel weights as a visual bar per symbol, let the player see the chance of each symbol, and show the effect of each bench job before buying. Put the paytable here too. (r1-024 to r1-026)
11. **Boss debts with a face.** The Auditor and the Miser need art, a name card before the debt, a visible machine modifier (a stamp on the reels, a rule banner) and a different reward. At present both are one line of red text. (r1-039, r1-130)
12. **Turn the pact into a ledger.** Keep the "you get / you carry" format. Add a "Pact ledger" tab showing every deal and curse, running tallies, the clause text, and a way to buy out one curse. Offer 2 to 3 real deals every time, not one. Remove "You get: +1 Luck" style deals that need Luck explained. (r1-021, r1-037, r1-074)
13. **A death that teaches.** Replace the stats list with "what killed you" (debt 5 night 3, 933 short, you never used a trick, Heat stayed at 0 for 9 spins) and a hint for the next run. Show what each unlock does with its art. Gate the Pawn rescue: only offer it if one more night could close the gap. (r1-187, r1-188)
14. **Rebuild home as a place, with progression you can read.** A hub scene, not a scroll of 10 tiles. Wax earned per run should hit the first reward in one run, and each reward must show a before/after effect. Put Play, Continue, How to play, Collection on the first screen. Fix How to play so it opens at the top and covers all concepts. (r1-189, r1-194, r1-195)
15. **Content breadth.** More symbols and more pattern shapes (4 and 5-cell shapes, scatter, cluster), special reels (a gold reel, a ghost reel), per-debt events, more than one playable character, and Brimble barks tied to what happened ("You scorched", "Big win", "Refused a deal") rather than random. Today 9 symbols, 1 devil, 1 hero, 4 bench jobs, about 40 charms in total, and barks that contradict the screen. (r1-003, r1-034, r1-153)

---

## 6. Smaller bugs and rough edges (not ranked)

- Raw ids shown in score lines: `short_fuse +10`, `c1 +9`.
- "1 nights unused" (grammar), "-2 spin" (singular).
- The sprout chip "+N" and the rosette chip have no label.
- Native blue range slider in the Bank sheet; the Settings sliders are red. Different styles.
- Stale win lines stay on the board across debts (r1-043).
- After a boss payoff, "One down. I am counting." is the same line for debt 1 and debt 3 of 5.
- "Skip this night: +6 Wick" is a free +6 Wick on a screen that hides the machine; a new player may think it is a Next button.
- A second tap on a button that has just changed meaning triggers "Leave the wagon" or END NIGHT (two shops skipped by accident).
- Scrolling a two-offer deal screen: the lower SIGN is below the fold and my tap signed the other paper (r1-038, r1-039).
- No quit-run or go-home button in the gear menu mid-run.
- How to play opens scrolled to the middle.
- Fonts and icons are strong; the art is good. The gap is explanation and depth, not polish.
- Thai and Turkish exist (language buttons). I did not play in them.

---

## 7. What I did not check

- Hideout purchases, Daily run, Store and Collection in play (only the stove tile and the home scroll).
- Desktop width and the Turkish and Thai locales.
- Characters and contracts beyond the first (there is only one character in the player flow).
- Whether charms like Matchbox, Twin Flame, Dividend Slip, Gilt Ledger make a build click. I saw them in the shop but only bought five. One more run with a deliberate synergy plan is the missing test.
- Audio (muted by design).
