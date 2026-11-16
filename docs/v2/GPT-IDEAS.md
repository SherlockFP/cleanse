# ChatGPT ideas (2026-11-16, asked by the owner). Unverified: treat as a second opinion, not as fact.

THE DEVIL'S FAIR — Slot Roguelike Game Design
Core concept: A struggling little devil operates a crooked fortune machine at a traveling night fair. You signed a pact with him. Every night you must earn enough coins to satisfy the contract, but every advantage he offers comes with a loophole.

The opportunity is to combine CloverPit's explosive combinations, Balatro's strategic planning, and the accessibility of a three-minute mobile game—while making the player feel clever rather than merely lucky.

Part 1 — How CloverPit actually plays
I'm describing the base game's core rules, incorporating the systems documented through 2026. CloverPit also received the Unholy Fusion DLC on April 9, 2026, which introduced charm fusion, additional modifiers, and new build possibilities. 

steamcommunity.com
+1

1. Run structure, debt and deadlines
CloverPit puts the player in a locked room with a slot machine, ATM, charm shop, and telephone.

The loop is:

Start with a debt target.

Spin the machine to generate coins.

Buy and combine Lucky Charms.

Deposit coins to earn interest.

Reach the debt target before the deadline.

Receive new bonuses and face a much larger debt.

Eventually escape, or fail and restart.

The first debt targets in a normal run are:

75 → 200 → 666 → 2,222 → 12,500 → 33,333 → 66,666 → 200,000 → 1,000,000.

Each deadline normally gives you three rounds to accumulate the required money. Failing triggers the death sequence and ends the run.

The important mechanic is that debt increases dramatically, forcing the player to improve the growth rate of the slot machine rather than simply earn a little more money. 

CloverPit Wiki
+1

2. Rounds and spin choices
At the beginning of a round, the player normally chooses between:

Most Spins: 7 spins, with fewer Clover Tickets awarded.

Fewer Spins: 3 spins, with more Clover Tickets awarded.

This creates a meaningful resource tradeoff: take additional opportunities to earn coins, or sacrifice spins to obtain more purchasing power for charms.

Spins also have a cost, and this cost increases as the run advances. Finishing a deadline early can reward bonus tickets for unused rounds. 

CloverPit Wiki
+1

3. Symbols, patterns and multipliers
The machine uses a 5-column × 3-row grid, containing 15 positions.

The standard symbols are:

Lemon — base value 2

Cherry — base value 2

Clover — base value 3

Bell — base value 3

Diamond — base value 5

Treasure — base value 5

Seven — base value 7

More valuable symbols generally have lower appearance probabilities.

Matching symbols in scoring patterns produces money. Patterns include horizontal, vertical, and diagonal matches, larger shapes, zigzags, the Eye, and a full-screen Jackpot.

The amount earned depends on four interacting factors:

Symbol value × Symbol multiplier × Pattern value × Pattern multiplier.

This is crucial: players can improve different parts of the same payout calculation, creating multiplicative growth.

For example, a charm that strengthens bells may combine extremely well with another charm that increases pattern multipliers and a third that makes bells appear more frequently.

Larger scoring patterns generally take precedence over smaller patterns contained within them, rather than every overlapping line paying independently. 

CloverPit Wiki
+2

4. Luck is not simply a higher jackpot probability
This is one of CloverPit's most interesting underlying systems.

Luck influences how many positions are forced to contain the same randomly selected symbol on a spin.

At 7 Luck, at least seven symbols match in identity, although they may not form a strong scoring pattern.

At 10 Luck, a paying pattern is effectively guaranteed unless the negative event overrides it.

At 15 Luck, a full matching Jackpot is guaranteed unless the 666 event intervenes.

Additional luck events can occur naturally, and the game also has a system that improves luck after consecutive unsuccessful spins.

Thus, Luck is a form of controlled symbol concentration, not a simple percentage bonus to winnings. 

CloverPit Wiki
+1

5. The bad symbol: 666
From the third deadline onward, the standard machine has a base 1.5% chance of triggering 666 on a spin.

It is separate from the ordinary Luck calculation.

Its punishment becomes worse as the run progresses:

Deadlines 3–6: lose the money earned during that round.

Deadline 7 onward: lose all currently held, undeposited coins.

It can also introduce Cadaver Pieces, creating additional consequences for the player's charm storage.

Interestingly, some charm builds actively benefit from triggering 666. Therefore, a disaster can become a resource-generation engine if the player deliberately constructs the right build. 

CloverPit Wiki
+1

6. Lucky Charms and combinations
Charms are essentially build-defining passive effects and activatable abilities.

They can:

Increase symbol values or appearance rates.

Modify Luck or scoring multipliers.

Trigger effects on spins, patterns, or 666 events.

Change interest and ticket generation.

Recharge other charms.

Manipulate symbols with special modifiers.

Trigger several additional effects through combinations.

Some charms activate automatically; others require the player's red button and have limited charges.

The true depth comes from triggers feeding into other triggers.

For instance, a symbol modifier can recharge an activated charm, allowing its effect to be used more often. A different charm might make the same symbol appear more frequently, increasing the recharge rate.

The game is not simply about collecting the highest rarity items. It is about assembling an economy of interacting effects.

In the 2026 DLC, a Surgery Machine additionally permits combining charms into powerful fusion items. 

CloverPit Wiki
+2

7. Interest and the second currency
CloverPit has two main currencies.

Coins pay debt, fund spins, and can be deposited into the ATM. Deposited money generates interest, normally starting at 7% of the deposited amount per round.

Clover Tickets purchase Lucky Charms and reroll telephone offers. They can come from rounds, skipped rounds, selling charms, and specialized effects.

This creates two competing growth engines:

Earn coins quickly through spins and multipliers.

Generate compounding value through deposits, interest, and supporting charms.

A player can sometimes earn more from a carefully built interest economy than from the machine itself. 

CloverPit Wiki
+1

8. Telephone, unlocks and permanent progression
After the first deadline, the telephone offers three possible abilities, with tickets allowing rerolls.

Ordinary calls offer helpful effects, while red calls provide stronger, often dangerous trades.

Progression includes unlocking Lucky Charms through achievements, obtaining keys to open drawers, discovering Memory Cards that alter runs, and pursuing different endings and challenges.

Memory Cards can substantially change the starting rules. The DLC expands these systems further. 

CloverPit Wiki
+2

9. What makes CloverPit compelling
I would identify five psychological and mechanical strengths:

Immediate feedback: One action produces a result, and a successful combination delivers an obvious payout.

Compounding power: An ordinary symbol can become extraordinarily valuable through accumulated effects.

Near-term tension: Each deadline forces the player to ask whether their existing build is strong enough.

Discovery: The excitement comes from realizing that two seemingly mediocre charms create a powerful interaction.

Risk inversion: Players eventually learn that certain disadvantages can be exploited and transformed into strengths.

The best moment is not simply winning a Jackpot. It is watching a machine that was barely paying anything suddenly produce absurd results because of a build the player constructed.

Where I'm uncertain
I have reasonably high confidence in the standard mechanics above, but I have not independently play-tested the current build. Exact charm counts, rarity balance, special endings, pity-system tuning, and rare DLC interactions can differ between versions. The hidden Luck scheduling details are partly documented by community reverse engineering rather than official developer documentation.

Part 2 — Weaknesses a new game could beat
These are design opportunities rather than universal criticisms. Reviews disagree about CloverPit's depth and replayability, though RNG dependence, repetition, and confusing early systems are recurring concerns. 

PC Gamer
+2

1. Too much of the player's power comes from passive randomness.

A build may be strong because the correct items appeared, not because the player solved interesting moment-to-moment decisions.

Your advantage: allow the player to intervene in the outcome through limited, tactical manipulation.

2. Early runs can feel excessively dependent on lucky offerings.

Players sometimes restart before their build really begins.

Your advantage: guarantee one viable starting strategy and make randomness determine its variation rather than its basic functionality.

3. The decisions can become less meaningful once a powerful engine is assembled.

Eventually the player may only need to keep spinning.

Your advantage: introduce changing spatial objectives and costs for overusing successful strategies.

4. Not every charm has an equally interesting role.

Some effects are primarily numerical upgrades. They are effective, but not always expressive.

Your advantage: design charms around different behaviors, targets, conditions, and timing windows.

5. The game can become difficult to read.

Multiple symbol values, triggers, modifiers, and probability adjustments create substantial information overhead.

Your advantage: show the three strongest contributing effects after every spin and let the player inspect the rest.

6. Long-term progression can dilute the item pool.

Unlocking additional items may make preferred combinations harder to assemble rather than creating clearly better choices.

Your advantage: make unlocks expand selected build families and possible strategies without simply flooding the random pool.

7. The environment offers relatively limited mechanical variation.

The room is atmospheric, but much of the strategy ultimately returns to the same slot machine.

Your advantage: make the night fair itself matter through temporary rules, visitors, stalls, weather, and devil behaviors.

8. Sudden negative events can destroy a run without providing meaningful counterplay.

The resulting tension works for horror, but can feel arbitrary.

Your advantage: telegraph major dangers and provide at least one costly way to respond.

9. The main loop was not originally designed around short, one-handed mobile sessions.

Your advantage: make the entire game playable with thumb taps and short swipes, without navigating a 3D room.

10. The narrative is more atmosphere than an evolving relationship.

Your advantage: give the devil a personality that adapts to the player's choices. His offers, insults, desperation, and attempts to cheat should reflect how the player is behaving.

Most important differentiation: Don't simply build a more elaborate CloverPit. Build a game where the slot result is the beginning of the player's decision, not the end.

Part 3 — 25 original mechanics for The Devil's Fair
First, establish the core rules
I recommend this foundation so the mechanics reinforce one another instead of becoming 25 disconnected gimmicks.

Basic game structure

Board: 5 columns × 3 rows.

Symbols: Moth, Candle, Bell, Mask, Key, and Crown.

A run contains 3 contracts, each with 4 spins: 12 spins total, targeting roughly 3 minutes.

Each contract has an escalating coin quota. Pay it after the fourth spin or the run ends.

Unspent coins carry forward after payment.

Every spin reveals several possible scoring patterns, but the player claims only one.

Each pattern has a defined multiplier. Its payout is the sum of its scoring symbols' values multiplied by that pattern's multiplier.

Players choose one starting charm and can draft more between contracts, eventually assembling a five-charm build.

Favors are a limited tactical resource, earned through special objectives and spent on tricks.

Heat measures how suspicious the devil becomes. It starts at 0 and reaches its danger threshold at 6.

One-use tricks manipulate the grid; devil deals offer powerful benefits with persistent curses.

The core five verbs should be SPIN, CLAIM, TRICK, SIGN, and SEAL.

A. Pattern manipulation and spatial strategy
1. The Claiming Finger

Rule: After a spin, the player can tap one of the highlighted winning patterns to collect its payout. All other patterns disappear without paying.

Decision: Should I take a small guaranteed reward, a rarer high-multiplier pattern, or the pattern that activates my charms?

This single rule creates much more agency than automatically scoring everything.

2. The Crooked Road

Rule: Five identical symbols arranged across the board in the positions top-left, middle of column 2, bottom-center, middle of column 4, and top-right create a ×5 pattern.

Decision: Do I manipulate the grid to complete a difficult five-cell route, or develop a build that earns smaller, reliable payouts?

3. Married Corners

Rule: If the two upper corners match each other and the two lower corners match a different symbol, the four corners form a ×4 scoring pattern.

Decision: This rewards maintaining two symbol groups rather than concentrating everything into one dominant symbol.

4. Hollow Halo

Rule: The four orthogonally adjacent cells surrounding the center must contain the same symbol, while the center itself must contain something different. This creates a ×4 pattern.

Decision: Sometimes preserving an unwanted symbol is necessary to complete a valuable combination.

5. The Toll Bridge

Rule: If the leftmost and rightmost positions of the middle row match, while the three positions between them contain three different symbols, those two matching endpoints pay at ×5.

Decision: A player specializing in this pattern wants a deliberately mixed board rather than endless identical symbols.

6. The Chalkboard Marquee

Rule: At the start of each contract, the player chooses one of two unusual patterns to activate for the next four spins. Standard three-in-a-row patterns remain available regardless.

Decision: Choose patterns that support the current build, or gamble on a higher-value pattern that requires the board to change.

This also keeps the small mobile screen readable: unusual patterns are introduced selectively instead of displaying 20 possibilities at once.

B. One-thumb cheating tools
7. Peg Crank

Rule: After a spin, tapping a column's crank moves its three symbols downward by one position, wrapping the bottom symbol to the top. Each use adds 1 Heat, and only one column can be cranked per spin.

Decision: Is completing an important pattern worth moving every symbol in that column and increasing suspicion?

8. Safety Pin

Rule: Tap one symbol to preserve it through the next spin, but that preserved symbol contributes zero coin value while still counting toward pattern completion. Only one symbol may be pinned at a time.

Decision: Sacrifice immediate value to guarantee part of a future pattern.

9. Forgery Stamp

Rule: A one-use stamp turns any selected cell into a wildcard for the current claim, but the stamped cell contributes zero value to the payout.

Decision: Spend the stamp to complete a valuable pattern now, or preserve it for a potentially decisive later spin?

10. Sleeve Snatch

Rule: Once per contract, the player can remove one symbol from the board and store it in a sleeve; on a later spin, they may replace any cell with the stored symbol, but both actions consume their spin's trick opportunity.

Decision: Is temporarily weakening the current board worth having precise control over a future one?

11. Reverse Ticket

Rule: Spend 1 Favor after revealing a spin to reroll exactly one selected row; the original row disappears permanently, and the player must keep the replacement.

Decision: Repair a poor board, or risk destroying a modest but usable result while chasing a better one?

These mechanics are particularly suited to portrait mobile play because each requires only a tap, a short swipe, or a simple tap-and-hold.

C. Risk, prediction and the devil's temper
12. The Barker's Bet

Rule: Before a spin, predict whether you will claim a line, a corner-based pattern, or a special pattern. A correct prediction earns 2 Favors; an incorrect one adds 1 Heat.

Decision: Bet on the strategy your build makes likely, or choose an ambitious prediction for a possible tactical advantage.

13. Variety Applause

Rule: Claiming different pattern families on two consecutive spins earns 1 Favor. Repeating the same family resets the sequence.

Decision: Continue exploiting your strongest pattern, or sacrifice some income to diversify and earn tactical resources?

14. The Six-Notch Suspicion Gauge

Rule: Heat ranges from 0 to 6; reaching 6 immediately turns the highest-value cell on the current board into unscorable Ash and resets Heat to 3. The player always sees the exact Heat that an action will add before committing.

Decision: How much cheating can the player afford before the devil's punishment damages the board?

Unlike a random disaster symbol, this creates visible risk that can be planned around.

15. The Devil's Shortcut

Rule: Before claiming a pattern, the player may double its coin payout and add 2 Heat. This can be used once per contract.

Decision: Take a guaranteed large payout now, or preserve the ability to cheat safely later?

D. Devil deals with lasting consequences
Every deal should be optional, understandable before signing, and visibly recorded on the contract.

16. The Scorching Signature

Rule: Receive one additional charm immediately, but at the beginning of every remaining contract the devil permanently disables one cell of your choice for that contract's first spin.

Decision: Gain an extra synergy component at the cost of consistently reduced scoring space.

17. The Stolen Name

Rule: Increase the base value of every Mask by 5 for the rest of the run, but Crown patterns can no longer be claimed.

Decision: Commit to a specialized Mask economy while permanently abandoning another potentially valuable symbol.

18. Tomorrow's Problem

Rule: Defer up to half of the current contract's unpaid quota, but add 80% of the deferred amount to the next contract's quota. The deferred portion is waived for the current settlement.

Decision: Escape an immediate failure at the cost of making the next deadline considerably harder.

This gives the small-time devil an interesting personality: his deals are technically fair but financially terrible.

E. Economy, contracts and evolving challenges
19. The Sealed Jam Jar

Rule: Between spins, seal up to 20 coins in a jar that cannot pay the current contract. The jar opens at the start of the next contract and returns its contents with a 25% bonus.

Decision: Invest for future growth, or retain enough immediate liquidity to survive?

20. The Devil's Changing Rules

Rule: At each contract transition, the player sees two announced fairground conditions and chooses one; for example, the harder condition doubles payouts from the left column but disables the center column for one spin, while the easier condition gives a modest bonus without a penalty.

Decision: Select the condition that interacts best with the current build rather than passively accepting a random modifier.

21. Exact Change

Rule: Finishing a contract with coins remaining equal to 10% or less of its quota awards 1 additional Favor. Larger surpluses keep their coins but receive no precision bonus.

Decision: Carefully manage payouts to earn tactical currency, or maximize profit without worrying about efficiency?

22. The Ticket Snipper

Rule: Instead of collecting a winning pattern, the player may destroy its payout to earn 1 Favor and remove 2 Heat. This consumes the entire spin's claim.

Decision: Convert a small win into resources that might enable a much larger future win.

23. The Moth Messenger

Rule: At the beginning of a contract, choose one of two errands requiring a specified symbol to appear in your claimed pattern on two different spins. Completing it grants a free upgrade to one equipped charm; failure simply forfeits the reward.

Decision: Shape your next two scoring choices around an optional long-term objective, or focus entirely on earning coins?

24. The Empty-Hand Choice

Rule: If a spin has no eligible scoring pattern, choose either 1 Favor or a reduction of 2 Heat. An unsuccessful spin can never directly generate coins through this mechanic.

Decision: Recover tactical resources after bad luck or create room for additional risky plays.

This means an unsuccessful spin still offers a meaningful interaction.

F. Meta-progression
25. The Crooked Caravan

Rule: After every run, earned Keepsakes can renovate the devil's tiny caravan, unlocking alternative starting charm sets, featured pattern pools, fairground conditions, and story encounters; upgrades never provide permanent flat coin or multiplier increases.

Decision: Build a personal repertoire of possible strategies rather than grinding numerical advantages until the game becomes trivial.

The caravan could contain a workbench, a candle-lit contract desk, an old wardrobe, a broken music box, and a wall covered in stolen fortunes.

As it improves, the devil becomes increasingly annoyed that the player's hideout looks nicer than his own business.

Part 4 — 12 charm synergy families
I would organize charms into mechanical families rather than rigid classes.

Each family below has a recognizable playstyle, but players should be rewarded for mixing families. A five-charm build containing three pieces from one family and two from another should often outperform five unrelated powerful charms.

All 48 examples are proposed original effects, not items copied from CloverPit or the other reference games. Numeric values are initial balancing suggestions.

1. Stitchcraft — Board positioning and movement
Identity: Turn small changes in symbol positions into reliable scoring opportunities.

Bent Needle: The first Peg Crank used each contract adds no Heat.

Patchwork Ribbon: Every symbol moved by a Peg Crank gains +2 value for the current spin.

Loose Hem: Claiming a five-cell pattern after using any grid-moving trick grants 1 Favor.

Thread Collector: After three total grid-moving tricks in a run, permanently increase Candle value by 2.

Synergy example: Bent Needle enables safe movement, Patchwork Ribbon makes movement more profitable, and Loose Hem helps fund additional tricks.

2. Lanternkeepers — Edge and corner domination
Identity: Specialize in patterns that touch the perimeter of the board.

Window Lantern: Symbols in the four corners contribute +2 value.

Rope of Lights: A claimed pattern containing cells on both the left and right edges gains ×1.5 payout.

Corner Bell: Completing Married Corners reduces Heat by 2.

Harbor Candle: Claiming three edge-based patterns during one contract gives the next edge-based pattern ×2 payout.

Potential builds focus on Married Corners, Toll Bridge, and other edge-based arrangements.

3. Moth Society — Symbol population and swarming
Identity: Make an apparently weak symbol progressively more useful through repeated appearances.

Dusty Wings: Every claimed Moth increases the next spin's Moth appearance weight by 10%, stacking to 50%.

Moonlit Jar: If at least five Moths appear anywhere on the board, all Moths gain +2 value for that spin.

Cocoon Purse: Every third Moth-containing claim grants 1 Favor.

Queen of Dust: After a contract in which you claimed Moths on at least three spins, permanently increase their value by 3.

This is a concentration strategy with scaling, resource generation, and a strong late-game payoff.

4. Ashbound — Make curses useful
Identity: Transform disabilities, blocked positions, and unfortunate deals into advantages.

Coal Heart: Every Ash cell gives all non-Ash cells in its row +1 value.

Burnt Invitation: The first time a cell becomes Ash each contract, receive 1 Favor.

Ember Needle: A claimed pattern adjacent to Ash earns ×1.5 payout.

Blackened Promise: If you carry at least two lasting curses, every claimed pattern gains +2 to its multiplier.

This family makes devil deals more tempting without removing their consequences.

5. Red Ledger — Savings, debt and precise payments
Identity: Build an economy around money that is saved, deferred, or spent strategically.

Copper Abacus: Sealed Jam Jar returns earn an additional 10% interest.

Receipt Mouse: Completing Exact Change grants 2 Favors instead of 1.

Pocket Accountant: Whenever a jar opens, increase Key value by 2 for the current contract.

Late-Fee Collector: For every 20 coins of debt deferred by Tomorrow's Problem, gain +1 value on all Bells for the rest of the run.

This family is about deliberate financial planning rather than maximizing every individual spin.

6. Hotheads — Manipulate the Heat meter
Identity: Become stronger as suspicion increases, while avoiding or exploiting punishment.

Red Thermometer: Patterns earn ×1.5 payout while Heat is 4 or higher.

Devil's Mittens: The first time Heat reaches 6 each contract, the destroyed cell becomes a zero-value wildcard instead of Ash.

Boiling Kettle: Each time the Heat meter resets after reaching 6, permanently add +1 to Candle value.

Smoldering Ticket: Spending a Favor while Heat is at least 4 reduces Heat by 1.

This creates a deliberate high-risk playstyle where staying near the danger threshold has advantages.

7. Maskmakers — Identity and transformation
Identity: Change what symbols mean rather than simply how much they pay.

Borrowed Face: Once per contract, treat one selected Mask as an adjacent symbol's type during scoring.

Paper Disguise: A wildcard contributes +2 value instead of zero.

Mirror Mask: If the claimed pattern contains exactly two different symbol types, gain ×1.5 payout.

False Royalty: When a Mask is changed into a Crown by any effect, increase all remaining Masks' value by 1 for the rest of the contract.

This family specializes in hybrid patterns and targeted symbol manipulation.

8. Echo Chamber — Repetition and remembered outcomes
Identity: Make previous scoring choices influence the next payout.

Old Gramophone: Repeating the same scoring pattern shape on consecutive spins adds +3 to the second payout.

Whisper Bottle: Once per contract, add 25% of the previous spin's coin payout to the current claim.

Memory Thread: If a spin scores the same symbol type as the previous claim, increase that symbol's value by 1 for the rest of the contract.

Encore Bell: Claiming the same pattern family three times in one contract grants 1 Favor and ×2 payout on the third claim.

This deliberately competes with the Variety Applause mechanic, creating different strategic directions.

9. Broken Clocks — Timing within a contract
Identity: Convert the position of a spin within the four-spin contract into an advantage.

Minute Hand: The first spin of each contract gains ×1.5 payout.

Late Candle: The fourth spin of each contract receives +3 to every scoring symbol's value.

Stolen Second: If the second spin scores nothing, the third spin grants a free Reverse Ticket.

Midnight Watch: Claiming the same symbol type on spins one and four grants 2 Favors.

The player must plan around a short sequence rather than treating every spin independently.

10. Fairground Hustlers — Favors and tactical resource spending
Identity: Make an economy from errands, predictions, and cheap tricks.

Ticket Apron: Every fourth Favor earned during a run grants one additional Favor.

Barker's Hat: A successful Barker's Bet awards 3 Favors instead of 2.

Bent Scissors: The first one-use trick each contract costs 1 fewer Favor, to a minimum of zero.

Counterfeit Ledger: Whenever you spend at least 2 Favors during one spin, increase the payout of your claimed pattern by 25%.

This family rewards active play and creates a direct relationship between resource generation and spending.

11. Hollow Stars — Rare geometries and unusual patterns
Identity: Chase difficult shapes with extraordinary payouts.

Crooked Compass: The Crooked Road requires only four of its five positions to match, but one position contributes zero value.

Glass Telescope: Every different special-pattern family claimed during the run permanently adds +1 to all special-pattern multipliers.

Star Thread: Scoring Hollow Halo grants 2 Favors.

Midnight Constellation: If you claim three different special-pattern families during a run, your next special-pattern claim pays ×3.

This is the high-skill, high-ceiling family for players who enjoy solving the grid.

12. Misfortune Collectors — Turn failed outcomes into progress
Identity: Grow stronger by surviving disappointing spins and accepting controlled disadvantages.

Cracked Teacup: Every spin without a scoring claim adds +1 permanently to the value of Bells, capped at +5.

Rainy Umbrella: Choosing the Empty-Hand Favor option grants 2 Favors instead of 1.

Pity Ribbon: After two consecutive unsuccessful spins, the next eligible pattern receives ×2 payout.

Unlucky Coin: At the beginning of each contract, choose one symbol type worth zero for the first spin; if you survive the contract, that type gains +3 permanent value.

This family ensures that bad luck can become a strategy without making failure universally preferable to success.

How these 12 families combine
Three examples of particularly interesting cross-family builds:

The Burning Accountant

Ashbound + Red Ledger + Hotheads.

The player accepts dangerous contracts, invests early coins, and deliberately operates close to the Heat threshold. Blocked cells become scoring tools, while careful finances compensate for inconsistent payouts.

The Crooked Constellation

Stitchcraft + Hollow Stars + Maskmakers.

The player uses small grid manipulations and symbol transformations to create unusual patterns. This build rewards thinking several spins ahead instead of repeatedly pulling for identical symbols.

The Unlucky Showman

Misfortune Collectors + Fairground Hustlers + Broken Clocks.

Failed spins generate Favors, which fund tricks timed for later spins. What looks like a poor first half of a contract can create a very powerful fourth spin.

These builds have different identities, rather than merely representing weak, medium, and strong versions of the same strategy.

Part 5 — First three minutes of the tutorial
The goal is to explain the game in 30 seconds, demonstrate one successful strategic decision within 60 seconds, and finish the first complete run within approximately 180 seconds.

The tutorial should be interactive but use controlled first-run outcomes so the learning sequence is understandable. Normal runs use the real generation rules.

0:00–0:30 — The pact and first win
0:00–0:07 — The invitation

The game opens directly on the rickety night-fair machine. A tiny devil pops out from behind it, holding an enormous contract.

He says:

"Four spins. Twenty coins. Pay me, or your soul joins the prize shelf."

The interface shows three large elements: the 5×3 machine, "0 / 20 COINS," and "SPINS: 4."

No main menu. No lengthy cinematic.

0:07–0:16 — First spin

A large SPIN button pulses near the bottom of the screen.

The player taps it.

The machine produces three matching Candles in a horizontal row. A thick outline highlights the match.

The player taps the highlighted pattern and receives a clear payout animation.

The goal counter advances.

0:16–0:30 — Understand the objective

The devil points to the quota and remaining spin counter.

"Match symbols. Claim coins. Fill the contract before your spins run out."

A second spin shows two eligible patterns, one worth 6 coins and another worth 10.

The player taps one. The unselected pattern disappears.

A very short message reads: "One claim per spin. Choose wisely."

By 30 seconds, the player understands the goal, the main input, the scoring rule, and the existence of meaningful choices.

0:30–1:00 — First manipulation
0:30–0:43 — Teach a trick

The next board contains an almost-complete winning pattern.

A free Peg Crank is highlighted.

The devil says:

"A little nudge never hurt anyone. Except the owner."

The player taps the indicated column. Its symbols rotate down, completing a pattern.

The player claims it.

A small "+1 HEAT" appears next to the suspicion gauge.

0:43–1:00 — First contract cleared

The player completes the fourth spin and reaches the 20-coin quota.

The contract stamps itself "PAID."

A quick payout summary shows earned coins, contract payment, and remaining balance.

The devil looks disappointed.

"You're suspiciously good at this."

This is the first success moment. The player should already want to repeat the experience.

1:00–1:30 — The first build
1:00–1:13 — Choose a charm

Three large charms appear as cards in the lower half of the screen.

Each has a simple description such as:

Candles gain +2 value.

Claiming corner patterns lowers Heat.

The first trick in each contract is free.

The player chooses one.

There should be no rerolls, shops, rarity explanations, or extensive tutorials at this point.

1:13–1:30 — See the charm work

The next spin deliberately contains a pattern benefiting from the chosen charm.

The scoring animation distinguishes the base payout and the charm contribution.

Example: "Candles +2 → Bonus +6."

The devil comments:

"Ah. You've learned to stack the odds."

This is essential: players should immediately see why their decision mattered.

1:30–2:00 — Risk and commitment
1:30–1:43 — Show the temptation

The devil offers a stronger optional deal:

"Gain another charm now. Start future contracts with one disabled cell."

Two large buttons: SIGN and REFUSE.

The player sees exactly what each choice means.

No forced acceptance.

1:43–2:00 — Teach the risk meter

A profitable pattern appears, and the Devil's Shortcut becomes available.

The interface shows "×2 COINS, +2 HEAT" with a preview of the updated Heat gauge.

If the player declines, they claim normally. If they accept, the bigger payout and increased Heat are immediately visible.

The goal is to teach that the player controls risk, not that the game randomly punishes success.

2:00–2:30 — Show a changing strategy
2:00–2:12 — Second contract paid

The second contract ends. The player chooses another charm, ideally one that interacts with the first.

If the player selected a Candle-focused charm, offer a Candle-compatible effect alongside other viable options.

2:12–2:21 — Change the rules

The devil announces the last contract's featured condition.

"The crowd wants something crooked this time!"

The Chalkboard Marquee introduces one special pattern, with an on-board example.

2:21–2:30 — Introduce failure recovery

A controlled spin produces no eligible winning pattern.

The player chooses between gaining a Favor or reducing Heat.

The devil shrugs:

"Even a losing ticket is good for something."

The player learns that a bad result does not always mean a wasted decision.

2:30–3:00 — Final test and replay hook
2:30–2:43 — Last meaningful decision

The player approaches the final quota.

The final few spins present manageable combinations of previously taught systems: pattern selection, one-use tools, charms, and visible risk.

No new mechanics are introduced.

The final spin should be a genuine outcome based on the tutorial's controlled setup and player choices, not an unexplained last-second rescue.

2:43–2:52 — First run result

If the player succeeds, the devil reluctantly stamps the contract and reveals that the fair is only one stop on a much larger supernatural circuit.

If the player fails, the devil takes the coins and makes a comedic remark before returning them to the caravan. Either outcome grants a first Keepsake.

2:52–3:00 — The hideout

A short reveal of the Crooked Caravan shows the player's first cosmetic renovation or new starting choice.

The devil offers two visibly different strategies for the next run.

"Same machine tomorrow? Or shall we make things worse?"

The final screen shows a large PLAY AGAIN button and a small collection-progress indicator.

The tutorial ends with a clear reason to experiment rather than an advertisement or artificial wait.

Final design recommendations
For the first playable prototype, I would prioritize just six systems:

The 5×3 grid with Claiming Finger pattern selection.

A small library of unusual patterns, starting with Married Corners and Hollow Halo.

Peg Crank and Forgery Stamp as the primary tactical interventions.

A visible six-notch Heat meter.

Five charm slots with cross-family synergies.

Three escalating contracts, totaling twelve spins.

Only after that is enjoyable would I add the rest of the deals, special conditions, and hideout.

I'd also make three decisions early in development.

Keep the score transparent. Players should be able to tap their latest payout and see exactly which pattern and charms contributed to it. Massive numbers are satisfying only when their source is understandable.

Let builds become extremely powerful. Don't automatically suppress every strong synergy. Instead, give advanced players optional harder contracts and alternate victory goals. The joy of discovering a strong combination is central to this genre.

Keep everything virtual and self-contained. No real-money wagering, paid spins, purchaseable Favors, energy timers, or pressure to recover a loss. A free game can still use the visual language of gambling while functioning entirely as a strategic puzzle.

The most distinctive direction for this project is a combination of spatial pattern-solving, visible cheating risk, and devil contracts with persistent consequences.

CloverPit largely asks players to construct a machine that produces increasingly valuable outcomes. Your game can ask a more interesting question:

"The machine gave you this result. How cleverly can you cheat your way into something better—and what are you willing to owe the devil for it?"






