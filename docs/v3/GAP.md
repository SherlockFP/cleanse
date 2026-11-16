# GAP v3: CloverPit vs our game

Date 2026-11-16. Scope: feature gap only. Our side comes from `docs/v2/GDD.md`, `docs/v2/GPT-IDEAS.md`, and a read of `src/` file names and headers. `docs/v2/THEME-TH.md` does not exist yet, so "Thailand devil pact" is taken from the task text. Thai spirit names below are proposals, not canon.

Tags: [V] on 2+ sources or a wiki page seen this session. [S] one source only. [U] unverified (guess, conflicting sources, or a removed guide). Verdict words: BETTER, EQUAL, WEAKER, MISSING (ours relative to CloverPit).

## 0. Why the owner says "nothing like CloverPit"

GDD v2 section 18 says "No room, no phone, no ATM" on purpose. That choice now reads as the hole. The owner wants CloverPit's systems taken freely. v2 has deep charm data (124 charms, 10 families) but the layers that make CloverPit feel like a world are absent or hidden: no diegetic room objects, no phone offers, no gods, no structured 666 punishment, no run-to-run unlocks that change rules, no hidden true-ending path, no charm charges, no fusion.

Our counts (`src/core/data/*.json`): 124 charms, 24 deals, 16 curses, 20 tricks, 12 symbols, 12 patterns, 12 terms cards, 10 contracts, 6 characters, 10 hideout pieces, 43 achievements. CloverPit: "150+ items and synergies" [S, Adventure Gamers]. Raw volume is close. The gap is structure, not volume.

## 1. System by system

### 1.1 Lever and spin feel
CloverPit: a physical lever in first person. Each spin costs coins, rising with deadline: `max(1, 2*(D-1)*(1+(D-1)/5))` [S, Steam guide]. At round start you pick 7 spins with fewer Clover Tickets, or 3 spins with more tickets [V]. Coins into spins versus tickets for charms is the core tension.
Ours: SPIN button, free spin. Spin count comes from a terms card (`src/core/data/stakes.json`, `src/ui/terms.js`). Reels in `src/view/reel-view.js`. Sound id `crank_pull` in `src/audio/sfx-map.js`.
Verdict: spin choice EQUAL or BETTER (12 terms cards vs 2 options). Spin cost MISSING by design (GDD 16, store safety). Lever feel WEAKER (a button).
Build: a draggable lever on the right edge, flick down with the thumb; pull past 70% = spin, a short pull = tease. Keep spins free. Thai skin: a brass crank with a joss stick that burns shorter each spin (the burn shows spins left). One haptic tick per notch, one heavy thud at the stop.
Warning: `sfx-map.js` ids `orhan_hm`, `orhan_cough`, `deni_blip`, `postcard`, `plank_gain`, `build_hammer` look copied from another project [U: I did not check whether they are used].

### 1.2 ATM, deposit, interest
CloverPit: held coins pay for spins and restocks. Coins deposited in the ATM count toward the debt and earn interest between rounds [V]. Interest modifiers exist (Speculative +3%) [S]. Base rate: [U] (GPT-IDEAS says 7%, GDD says that conflicts; no source this session gave it). Deposit more for more spins but 1 ticket, deposit less for fewer spins and more tickets [S].
Ours: purse plus BANK sheet with slider (`src/ui/hud.js` bankSheet). 8% interest on the purse, capped at 25% of the debt. Banked coins are safe from a Scorch (GDD 6, critic pass). Charm family `ledger` (10).
Verdict: numbers BETTER (cap, keep-or-bank has a reason). Presentation WEAKER: a slider in a sheet, no object on screen.
Build: an always-visible spirit house (san phra phum) as the bank, next to the machine. Drag coins in. It shows tonight's interest forecast ("+34"). One thumb: hold to pour, release to stop. Interest ticks up as visible numbers at round end.

### 1.3 The phone and calls (green, red, holy)
CloverPit:
- The phone rings at deadline start. Pick up and choose 1 of 3 power-ups. Rarity: Uncommon 15% less likely than Common, Rare 35%, Ultra Rare 60%, Legendary 75% [S].
- Rerolls: reroll cost starts at (deadline - 1) and rises by 1 per reroll, reset each deadline [S].
- Green examples: coin boost, +1 charm slot (once), store discounts, permanent +1 on a symbol [S].
- Red (evil) calls: red text, lower voice. They start when 666 or Super 666 is unlocked, or the last round of the previous deadline scored a 666 [V]. Guaranteed at the start of deadline 3 [S, Fandom]. Offers: double tickets or coins with the other set to 0, free charms, halved base chances of symbols [S].
- Skipping a red call: each red-call deadline you skip gives one mark on the 666 floppy disk [V]. After three marks, the next call turns white (holy), the phone becomes holy and the key transforms for the true ending [S, from a guide Steam flagged as removed, so [U] on exact steps]. Holy options: Symbols Multiplier +3, Patterns Multiplier +1, patterns trigger one more time [S].
Ours: deals after each paid debt (`src/core/deals.js`, `src/ui/deal.js`; 24 deals, 16 curses; SIGN or REFUSE; refusing gives +3 Wick). Brimble has reaction lines (4 sets).
Verdict: red call partly EQUAL (a deal is a red call) and BETTER in that boon and curse are both shown. MISSING: a recurring ritual every deadline, 3-choice green power-up calls, a 666-linked trigger, refusal tallying toward an ending, a holy flip, any caller who is not the devil.
Build (biggest gap):
- "Spirit line": a coin-phone shrine that rings at every debt start. Green callers: merchant spirits (Nang Kwak: coins, slots, discounts). Red: Brimble and other devils (strong boon, named curse). White: a god, unlocked by refusals.
- Each call shows 3 cards. Reroll costs Wick. One thumb: swipe to pick, hold to confirm.
- Refusal beads: a rosary of 3 beads on the HUD. Each refused red call lights one. Third bead lit, the next call is white. This replaces the flat +3 Wick.
- A Scorch (our Ash event) forces the next call red, as a 666 does in CloverPit.

### 1.4 The 666 bad symbol, punishments, exploit builds
CloverPit:
- From deadline 3. Rates conflict: ChatGPT text says 1.5% per spin; the Steam guide lists triple six up to 30%, double six 6%, single six 7.5%, any six about 14.4% [S, so [U] on the real rate]. Sixes roll last, unaffected by Luck [S].
- Punishment: deadlines 3 to 6 lose the round's earnings, deadline 7+ lose all undeposited coins [S, from ChatGPT text, [U]]. Corpse pieces appear in drawers [S].
- Exploits: Heartbreak memory card forces at least one 666 in the last round of each deadline after round three [S]; Recovery Attempt doubles the 666 rate [S]; Devious modifier +0.6% [S]. Super 666 and 999 variants exist [S]. Charms that pay on 666: [U, not confirmed this session].
Ours: Ash symbol, weight 2.0 x Heat plus curse additions. Scorch at 3+ Ash burns 10% of the purse and drops Heat by 3 (GDD 4, 5). Hex family (11 charms) and Cinder Vow, Ash Cake, Martyr's Splinter pay on curses and Scorch.
Verdict: concept BETTER (player-driven, bank is safe, exploitable). Drama WEAKER: invisible until the player pushes Heat, so a new player may never meet it; no named punishment ladder; no 666 screen moment.
Build: keep Ash. Add a Wrath eye (Yaksha eye) from debt 3, a small per-spin chance not tied to Heat, with a punishment ladder: round winnings, then purse, then a charm sealed in a niche. Always give an exploit: a Wrath charm family that pays per Wrath, a vow that doubles the rate, a white god who turns Wrath into Blessing (the 999 equivalent). Show the Wrath chance as a gauge on the machine so it is learnable.

### 1.5 Charms, activation buttons, charges
CloverPit:
- Charms are bought with tickets. Restock costs coins; base cost 3, 6, 20, 69, 300, 1000, 2000, 7000, 43000 for deadlines 1 to 9, +cost/5 per paid restock, reset each deadline [S]. 7 rarity tiers, 100-reroll cap [S].
- Passive charms plus Red Button charms (active). Red Button charms use Charges, consume all on trigger, recharge 1 per round; a green call refills all charges; a holy call lowers charges needed by 1 [S].
- Nuclear Button makes Red Button charms fire once more (unlock: use the Red Button 3 times in a run). Exotic Matter recharges before each spin but doubles the debt on each press. Overcharging strategy via the Battery modifier [S].
- Instant charms are one-shot [S]. Charm modifiers: Florid, Avid, Ambitious, Obsessive, Gambler, Speculative, Devious [S].
Ours: 124 charms, all passive rules (`docs/v2/EFFECTS.md`). 5 slots, order matters (Understudy, Opening Act, The Closer). 20 tricks are one-use items in 3 pockets with timing pre/post.
Verdict: passive depth BETTER (families, order). Charges and an activation button MISSING (tricks are consumable, not a reusable button). Charm modifiers MISSING. Instant charms EQUAL.
Build:
- "Offering button": a big thumb button beside SPIN. About 18 to 20 of the 124 charms are tagged active with 1 to 3 charges, recharge 1 per round, refilled by a green call. Pressing it costs a Wick or 1 Heat and fires every active charm.
- Charm stickers: 6 modifiers (Lucky, Gilded, Cursed, Haunted, Blessed, Twin) rolled on shop charms from debt 2, shown as a badge. Cheap data, strong replay value.
- Charm tier-up with Wick inside a run.

### 1.6 Charm fusion (Unholy Fusion DLC)
CloverPit: launched April 9, 2026 with version 1.4 [V]. A Surgery Machine fuses charms into a stronger one [V]. Reported content: 30 fusions, 11 extra charms, 4 symbol modifiers, 7 memory cards, an extra secret finale [S; another listing says 10 charms]. $2.99 on Steam and Xbox [S]. v1.4 adds online leaderboards [V]. Exact recipes: [U, not retrieved].
Ours: bench jobs (Polish, Load, Gild, Pull Out, Lift a Curse) edit symbols, not charms. Cross-family combos exist only as hints on card text.
Verdict: MISSING.
Build: "Altar of Two" in the wagon. Drop 2 charms, get 1 fused charm. Data-driven: two same-family commons give an uncommon of that family; 30 named cross-family recipes at launch. A codex shows discovered recipes and silhouettes of undiscovered ones. Fusion gives a 15% chance of a minor curse. One thumb: drag A onto B, hold to confirm.

### 1.7 Drawers, keys, corpse pieces
CloverPit: 4 drawers under the charm store, each opened by a gold key earned from deadlines (max 1 per run) [V]. A charm left in a drawer becomes a corpse item in the next run [V]. Drawers open after deadlines 4, 5, 6, 7 [S]. Filled drawers, then a run with four corpse pieces, then the skull charm (4 tickets) [S]. Skull key needs 250,000 score; the white skull key appears at the deadline 8 quota [S]. Cold Affection memory card helps fill empty drawers [S].
Ours: nearest is the Keepsake Box (120 Wax) and the Collection screen. No carry-over of a run's charms.
Verdict: MISSING. This is the loop that ties runs into one story.
Build: "Votive niches": 4 niches in the hideout. At run end, leave one held charm in a niche. It returns next run as a relic (stronger, with a drawback). Four filled niches open the god endings. Keys (tin, silver, gold) come from contract milestones.

### 1.8 Memory cards
CloverPit: chosen at run start, expendable after one use [S]. Packs of 3 random cards bought with coins [S]. Rarity: Common, Uncommon, Rare, Epic [S]. Named: Heartbreak, Recovery Attempt, Cold Affection, Delusions of Grandeur (doubles debt, 500k ending quota), Living on the Edge (DLC: you may only insert coins after the last round) [S]. A card used to finish a bad ending gets a rainbow border [S].
Ours: 10 fixed contracts and 6 characters change rules. Nothing the player picks per run from a collection.
Verdict: WEAKER.
Build: "Vows" (sanya): single-use cards that rewrite a rule for one run. Examples: no terms pick and 6 fixed spins; start at Heat 5; Brimble absent (no deals, interest doubled). Earn from achievements and a 3-card pack after each run. 24 at launch. One vow per run, two after contract 5.

### 1.9 Endings
CloverPit: bad ending at 250,000 with the skull key [S]. True ending: four corpse pieces plus skull, ignore red calls, roll a 666 at least once, three marks, answer a holy call, meet the deadline 8 quota for the white skull key [S, [U] guide flagged removed]. DLC adds a secret finale [S]. Endless mode [V].
Ours: 3 endings (Paid in Full, Bought the Machine, New Management), gated by contract conditions (GDD 2) plus Endless.
Verdict: count EQUAL, gating BETTER (readable). Discovery WEAKER: nothing hidden, no cross-run puzzle.
Build: 5 endings. Keep 3. Add (4) "The Refuser": refuse three red calls, take a white call. Add (5) "Fusion Finale": a fused relic in each of 4 niches at debt 8. Hide the clue in Brimble's fine print, readable only in the Collection.

### 1.10 Achievements and unlock tree
CloverPit: achievements unlock charms. Examples from Fandom: Cross after 100 Red Button uses; Nuclear Button after using the Red Button 3 times in one run [S]. Drawers unlock by deadlines [S].
Ours: 43 achievements, 30 unlock a charm, 5 a character, 8 give Wax (`src/core/data/achievements.json`, `{stat, gte}` conditions).
Verdict: count EQUAL; surface WEAKER (no visible tree, no hint of what unlocks).
Build: an unlock tree screen with locked silhouettes and a one-line hint. 20 more behavioural achievements tied to new systems (refuse 3 red calls, fuse 5 charms, fill 4 niches). Unlocking a charm shows a "try it next run" pin.

### 1.11 Run-to-run unlocks and meta
CloverPit: meta is drawers, memory cards, achievements, endings [V]. Leaderboards in 1.4 [V].
Ours: Wax, hideout (10 pieces, 1,075 Wax), 6 characters, contract ladder, local daily, Collection.
Verdict: Wax and hideout BETTER. Cross-run narrative and rule-changing unlocks WEAKER (see 1.7, 1.8). No online leaderboard (no server).
Build: shared seed codes now, leaderboard later. Make 4 of the 10 hideout pieces unlock a niche or vow slot instead of a start perk.

### 1.12 Difficulty
CloverPit: debts 75, 200, 666, 2222, 12500, 33333, 66666, 200000, 1000000, then 6,000,000 at deadline 10; later by formula, +5% per Skeleton charm [S]. Three rounds per deadline [V]. Fail = death [V]. Endless [V]. Critics: RNG-heavy, repetitive, one-note builds [S]; also "easy once synergies click" [S].
Ours: 10 contracts, debts 60 to 400,000, boss debts, Endless x2.5. Sim (GDD): smart bot clears c1 85%, c3 40.7%, c6 17.7%, c10 5.7%; random bot c1 12.7%.
Verdict: ladder BETTER. But c1 is nearly solved by a smart player, which fits "no progression, superficial" if the player feels no pressure.
Build: an ascension knob after a clear ("Heat of the Gods", 1 to 10, each level adds a rule). One named god per boss debt.

### 1.13 What is on screen at all times
CloverPit: one room: slot machine with the 666 floppy disk, ATM, phone, charm store, 4 drawers, Red Button, lever [V]. Where the goal shows: [U].
Ours: goal bar always (`DEBT 3 of 8  1,240 / 2,600  Night 2 of 3  Spins 4`), candle, Purse, Wick, Heat, Luck, Favourite, charm row, trick pockets, STOKE, BANK, SPIN (`src/ui/hud.js`).
Verdict: goal clarity BETTER. World feel WEAKER (HUD, not a place).
Build: make the HUD diegetic where it costs nothing: bank = spirit house, spirit line = phone shrine, Heat = incense, niches = votive shelf. Same data and layout, new art; numbers stay readable.

### 1.14 Sound and juice
CloverPit: lever, reel clacks, 666 sting, lower-pitched red voice, phone voices [U: no source read this session covers audio in depth].
Ours: `src/audio/synth.js`, `src/audio/sfx-map.js` (38 ids; its own header says "Nobody has listened to these picks yet"), `src/view/shaders.js`, shake on big win, coin fly, haptics, particles. No voices or phone lines.
Verdict: character WEAKER; quality [U] (no recorded listening).
Build: pitch-ladder on scoring (`pay_step` exists), a low sting for red calls, a bell sting for white, a vignette at Ash 2 of 3 ("one more and it burns"), a sound palette per god. Remove foreign ids first.

## 2. Gods (owner request, not a CloverPit feature)

CloverPit has one devil plus a white phone. The owner wants gods. Proposed pantheon, names are proposals and [U] on cultural accuracy; use folk-spirit roles, not real religious figures, and have a Thai reader check it:
- Nang Kwak (fortune): green calls, shop discounts, charm slots.
- A water spirit (Naga or Mae Thorani): interest and purse safety, shields from Scorch.
- Yaksha (wrath): the 666 equivalent, red calls with sharp curses.
- Brimble (the devil): contracts, owns the debt, boss of the ladder.
- A trickster: fusion and tricks.
- A white Great Mother: the holy call.
Each god gets a call type, a 10-charm family, a hideout shrine, a boss debt, a set of speech lines. A worship tally (whom you favoured) changes the ending. One thumb: choosing a god is a single swipe.

## 3. Build order to beat CloverPit

1. Spirit line (green, red, white calls; refusal beads; rerolls). Answers "no CloverPit" and "no gods" together.
2. Offering button and charges (about 18 active charms).
3. Fusion altar with 30 recipes and codex.
4. Votive niches, relics, keys, two hidden endings.
5. Vows (memory cards), 24 at launch.
6. Wrath eye and punishment ladder with visible gauge.
7. Diegetic HUD pass (bank as spirit house, lever drag).
8. Unlock tree screen and 20 achievements.
9. Ascension knob.
10. Audio audit: remove foreign ids, add call stings.

## 4. Where we already beat CloverPit (keep)

Visible Favourite and a pre-spin decision; all patterns pay together; 12 terms cards; interest cap and Scorch-safe bank; tricks that act after the reels stop; the symbol bench; charm slot order; named boon and curse deals; no spin cost; the "whose debt is it" twist; daily seed. Do not replace these.

## 5. Onboarding gap (owner: "I do not know how to play it")

GDD 14 teaches spin, Stoke, bank and charm in 3 minutes, then "Nothing new is taught after this". Later systems get one line at first sight. In `src/tutorial.js`, `coachFor` returns null once `run.debtIdx > 0` [from the code I read; not run]. `howto.js` has 7 rule lines. Build: a persistent one-line "do this now" under the machine for the whole run, and a "why you lost" breakdown on run end. The spirit line also teaches by ritual: every debt starts with a call that explains one new thing.

## 6. Not verified this session

- CloverPit base interest rate, real 666 rate, 666 punishment by deadline (sources conflict).
- Fusion recipes, DLC memory card list, secret finale.
- Which charms are Red Button charms beyond Ancient Coin, Weird Clock, Nuclear Button, Exotic Matter, Cross (wiki.gg pages were seen only as search snippets).
- The Fandom phone page fetch failed (HTTP 402), so call details come from the Steam guide and search snippets.
- The endings guide was flagged removed by Steam; true-ending steps are [U].
- Our code: I read file names and headers, not full logic, and did not run the game. Another workflow is editing `src`, so it may have changed.
- Thai cultural accuracy of the pantheon.

## Sources
- https://steamcommunity.com/sharedfiles/filedetails/?id=3577735332 (Mechanics Explained)
- https://steamcommunity.com/sharedfiles/filedetails/?id=3576332100 (Endings, flagged removed)
- https://cloverpit.fandom.com/wiki/The_Phone (search snippet only)
- https://adventuregamers.com/article/cloverpit-explained
- https://cloverpit.wiki.gg/wiki/Charm_Activation, /Nuclear_Button, /Exotic_Matter, /Overcharging (snippets only)
- https://jeu.video/article/cloverpit-unholy-fusion-dlc-en
- https://www.gematsu.com/2026/04/cloverpit-dlc-unholy-fusion-and-version-1-4-update-now-available
- https://www.pcgamer.com/games/roguelike/cloverpit-review
- https://trendingnow.games/reviews/cloverpit-review
