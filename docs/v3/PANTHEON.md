# PANTHEON v3: the Powers of the Night Market

Status: design. Companion to `docs/v3/PROGRESSION.md`. Builds on `docs/v2/GDD.md` and `docs/v2/EFFECTS.md` (trigger, cond and effect names below are the ones from EFFECTS.md). `docs/v2/THEME-TH.md` did not exist when this was written, so story names are placeholders and the theme owner may rename them. All numbers are designed by ratio and are **not simulated**.

Owner feedback this answers: "There are no gods. There is nothing like CloverPit." CloverPit's telephone gives one call per deadline: pick 1 of 3 abilities, some red and dangerous. Here the same slot in the run is a living cast: eight Powers with a mood, a favour track, jealous rivals, blessings that change how you build, and a signature risky deal each. The devil is one of them and is still the creditor.

## 1. Rules of use (what a "power" is and is not)

- Powers are **folklore spirits and invented characters**. No real worshipped god, no Buddha, no monk, no temple, no royalty, no incense-and-prayer imitation, no named real shrine. Their "altar" in the game is a joke object: a biscuit tin with a fairy light (the **Tin**), on the machine cart. Offerings are coins and tricks and Heat, never food or drink rituals taken from real practice.
- Each power is tagged with how close its inspiration is to something people really revere. Where the risk is high, the in-game character is a **fictional figure that only borrows a mood or a prop**, and its name is not the folklore name.
- Nothing here asks the player to believe or to pray. It is a bargaining game with colourful neighbours.
- Wording rule from GDD section 16 still holds: never "bet", "wager", "stake", "casino", "slot", "jackpot", "gamble" in the player text. Say offering, favour, deal, omen, tin.

## 2. The cast at a glance

| # | Power | Domain | Style | Rival | Folklore root | Offence risk |
|---|---|---|---|---|---|---|
| 1 | Mr. Brimble | Debt, deals, paper | bored clerk | The Waiting Lady | none (original, from v2) | none |
| 2 | Auntie Beckon | Trade, shop, footfall | brisk saleswoman | Uncle Wire | Nang Kwak, the beckoning lady | high in the original, so fictional |
| 3 | Little Gold | Luck, windfalls, the Favourite | spoiled trickster child | The Moonbiter | Kuman Thong, golden child amulet | high in the original, so fictional |
| 4 | The Moonbiter | Eclipse, loss, removal | polite and starving | Little Gold | Rahu eclipse legend | high in the original, so fictional |
| 5 | Lady Lamplit | Night, Heat, dares | flirty thrill-seeker | Grandmother Tide | Krasue, floating night ghost | medium, so toned down |
| 6 | Grandmother Tide | Sea, trade routes, patience, interest | grumpy bargewoman | Lady Lamplit | Mae Yanang, ship spirit; sea folk tales | high in the original, so fictional |
| 7 | Uncle Wire | Street, shortcuts, tricks, the bench | fast-talking hustler | Auntie Beckon | Soi and spirit-house street lore, but invented | low |
| 8 | The Waiting Lady | Canals, returns, second chances | gentle and stubborn | Mr. Brimble | Mae Nak, the waiting ghost | high in the original, so fictional |

Rivalries are symmetric pairs: debt vs forgiveness, shop vs street stall, luck vs loss, fire vs water.

### Folklore research notes and the call on each

Research: web search (Wikipedia entries for Nang Kwak, Kuman Thong, Mae Nak, Mae Yanang, Krahang, Thai horror) plus general knowledge. Nang Kwak (shop-keepers' beckoning lady, often a red-dressed figure by the till, tied to a rice-goddess reading and to an old merchant's-daughter story) is actively worshipped in shops today. Kuman Thong is a spirit-child amulet that keepers treat as a living child. Mae Nak is Thailand's best-known ghost story and has a real, visited shrine. These three are **not used by name or look**. Rahu, Krasue, Phi Pop, Nang Tani and Nang Takian were not covered by the search, so the notes on them come from general knowledge and must be re-checked by a Thai reader.

| folklore figure | who reveres it today | decision | what we keep | what we change |
|---|---|---|---|---|
| Nang Kwak | shopkeepers, with shrines and offerings | do not use. Replace with Auntie Beckon | the waving arm, trade luck, customers | she is a haunted cash-register mascot, a bobbing wave-arm on a till; no robe, no shrine, no wai gesture, not called a goddess |
| Kuman Thong | amulet keepers, serious belief; the dark version involves a dead child | do not use. Replace with Little Gold | gold, child-sized, brings small windfalls, needs treats | he is a gilded wooden toy that came alive in a charm stall; no corpse, no ritual, no red drink offering, no sacred feeding |
| Mae Nak | a real shrine in Bangkok, visited daily | do not use. Replace with The Waiting Lady | a spirit that waits for someone beside a canal | no death in childbirth, no husband, no shrine, no named real place; she waits for a ferry that owes her, and is kind |
| Rahu (eclipse swallower) | worshipped as a planet-god in Thai practice, tied to a weekday | do not use. Replace with The Moonbiter | something that nibbles the moon so the light goes out | no planet, no weekday, no deity name, no sacred image; a shy shadow with manners |
| Krasue | folk horror monster, not worshipped; gore and a stigma on women labelled with it | use as a mood only, name changed. Lady Lamplit | a floating glowing head at night | no entrails, no gore, no "woman as monster" story; she is a drifting lantern with a face and a laugh |
| Mae Yanang | sailors' ship spirit, carved prows with ritual | do not use. Replace with Grandmother Tide | a female spirit of boats and water | no carved tree, no prow ritual; a barge-woman who runs the river mouth |
| Phi Pop (flesh-eating ghost) | feared; real village accusations hurt real people | not used | n/a | accusation stories could mock rural people. Cut |
| Nang Tani, Nang Takian (tree-ladies) | light folk belief, cloths tied to trees, real trees revered | not used in the cast of 8. Reserve as a 9th power later as an invented "Mother Plantain" (growth, patience) if a ninth is wanted | tree-lady shy and protective | invented name and look; no real tree, no cloth ritual |
| Soi lore, lamp-post and spirit-house folk | spirit houses are real worship | Uncle Wire is invented from overhead wires and food carts, not from spirit houses | street cleverness | the Tin is a biscuit tin, a parody of nothing real |
| Brimble | n/a | original | n/a | n/a |

Review gate: before release, a Thai reader checks every name, look and line (the same gate as `STRINGS-REVIEW.md`). If anyone flags a power, rename or cut it; the system survives with 7.

## 3. Core rules

### 3.1 Favour (per run)

- Every power has a **Favour** score for this run, range -5 to +10, start 0 (start values can be raised by a character or the tree, see PROGRESSION).
- Favour is **shown as five small pips** next to the power's portrait in the Tin screen; a red pip row appears under 0.
- Stages: **Noticed** at 2, **Friend** at 5, **Patron** at 8. Each stage gives one blessing. Stages are never lost once reached this run unless Wrath (below) hits the power.
- **Wrath**: Favour at or below -2 gives that power's Wrath 1; at or below -5, Wrath 2. A Wrath is an active penalty until Favour is back above the line.
- Favour cap 10. Surplus above 10 turns into +1 Wick per 3 points, so offerings are never wasted.

### 3.2 Offerings (how Favour goes up)

On the Tin screen (opens after every round, before the wagon) the player may make **1 offering** (2 with the Tin Shelf home piece). An offering is one item from this table, in one of three sizes. The size sets the base Favour.

| offering | small (+1) | medium (+3) | large (+6) |
|---|---|---|---|
| Coins (percent of the current debt target) | 4% | 10% | 25% |
| Wick | 1 | 2 | 4 |
| Burn Heat | 1 level | 3 levels | 5 levels |
| Hand over a trick | none | any trick | none |
| Sell a charm at the Tin | none | none | any charm (you also get the sale price) |
| Take a named curse | none | the power's own curse (section 3.5) | none |
| Skip spins | next round -1 spin | next round -2 spins | none |

Each power has a taste for each offering: **Loved x2, Fine x1, Meh x0.5 (round up), Insult -1 Favour and the offering is lost**. Tastes are in each power's card. Players learn tastes from a one-line hint on the portrait ("likes money in the shop", "hates being cold"), and fully from the Codex page (PROGRESSION section 7).

### 3.3 Visits, calls and the audience

- **Visit** (every round end): one power visits the Tin. The visitor is picked by weight: powers with the highest Favour 35%, the place's local power 25%, random 40%. The visitor gives its **Omen** (free information, section 4 cards) and may state a **Demand** (optional task).
- **Audience** (every debt paid): three powers are offered, like CloverPit's call list. Pick one. For the picked power choose **Gift** or **Red Call**. The devil's own list of deals from v2 is Brimble's Red Calls and stays unchanged. Reroll the three offers for 1 Wick each (first free with Auntie Beckon at Friend).
- **Gift** (generic, flavoured per power): at Favour 0 to 4: 1 Wick; 5 to 7: 2 Wick; 8 or more: 3 Wick and one trick. Each power flavours it (a free shop reroll, a Luck token, and so on). A Gift is safe.
- **Red Call** (the signature deal, section 4): strong, with a named price like a deal. Each power has exactly one. The price is shown in full before the player agrees, as for deals. Taking a power's Red Call gives +1 Favour with that power and -1 with its rival.

### 3.4 Jealousy (rivals)

- Whenever an offering moves a power across a stage line (2, 5, 8), its rival loses 2 Favour.
- Whenever a power enters Wrath, its rival gains 1 Favour (the rival enjoys it).
- **Him or Me** event: at the moment a power reaches Patron (8) while its rival is at Friend (5) or higher, the rival appears and says one line and the game asks once: *Drop the rival* (lose all the rival's Favour, keep this power's gain, rival is silent for the rest of the run, and you get a free Gift from this power) or *Keep both* (this power's Favour is capped at 7 until the end of this debt). It is the main "choose a patron" moment of a run.
- Rivals still visit; an angry power with the player in a rival's pocket complains in its Omen line.

### 3.5 Curses by power

Each power has one **own curse** (a named permanent rule, same system as `curses.json`) that it gives in its Red Call and accepts as an offering. This keeps the hex family relevant. Own curses: Brimble: Fine Print (existing v2 curses apply); Beckon: Haggler's Shadow; Gold: Sticky Fingers; Moonbiter: Hollow Centre; Lamplit: Dark Wick; Tide: Slow Water; Wire: Short Circuit; Waiting Lady: Heavy Hands. Full effect list in section 4.

### 3.6 Run limits

- A run may reach Patron (8) with at most **2 powers**, by design. Stage 3 on all eight is not possible: the second Patron costs a rival, and the Tin has 1 to 2 offerings per round.
- The first run uses only Brimble, Auntie Beckon and Little Gold (a friendly three, with fixed tastes and no Wrath). The others arrive through the tree and the map (PROGRESSION sections 3 and 4).

### 3.7 Data and engine hooks

- New data file `gods.json` with these fields per power: `id`, `name`, `domain`, `rival`, `likes[]`, `hates[]`, `blessings[3]`, `wrath[2]`, `omen`, `demand`, `redCall`, `ownCurse`, `unlock`, `risk`.
- A blessing is a passive item "rule" like a charm, with a new condition key `favour: [powerId, min]` and `favourMax: [powerId, max]` for Wrath. Everything else uses EFFECTS.md as is. New triggers: `onOffering` (power, size, amount), `onVisit` (power), `onStage` (power, stage), `onWrath` (power).
- The Tin is a screen between the round end and the wagon (GDD flow step 4). It can be skipped in one tap.

## 4. The eight powers

Format for every card: look and voice; folklore root and risk; likes and hates; blessings at Noticed, Friend, Patron; Wrath; Omen; Demand; Red Call; own curse; jealousy line. Numbers use the GDD price scale S where they are coins. Percentages are of the player's values at that time. "Tonight" means the current round.

### 4.1 Mr. Brimble, the main creditor

- **Look and voice.** Short, pot-bellied, moth-eaten top hat, a patched tailcoat, now seen on a Bangkok soi corner with a fold-up table and a folder of paper. A foreign-looking clerk who is oddly at home in a rice-and-noodle cart street. Bored, dry, never shouts. Sample line: "A deal. Good for you now. Good for me later."
- **Domain.** Debt, deals, signatures. Sets the debt that every contract climbs. He is the reason the game exists.
- **Folklore root and risk.** None (original devil figure from GDD v2). Risk: none, but avoid horns-and-pitchfork imagery and any link to a real religion's evil figure. He is a clerk.
- **Likes (x2):** signed deals, Wick. **Fine:** coins, own curse. **Meh:** tricks. **Hates (insult):** selling a charm to him, skipping spins (waste of his paper time).
- **Favour is called "Standing".** It goes up with each signed deal (+2), each Wick offering, and each debt paid on the last night (+1). It goes down with each refused deal (-1).
- **Noticed (2): Credit.** Once per debt, in a round with at least one spin left, you may bank more than the purse by up to 15% of the debt target; the difference is added to the next debt. Effect shape: new flag `credit15`.
- **Friend (5): Preferred Rate.** Interest +3 points. Brimble's deal offers show 3 cards instead of 2.
- **Patron (8): Open Account.** Deals may be signed at any time from the Tin, not only after a debt. Each signed deal also pays +1 Wick. The cost: all curses you take from now on are shown to you only after signing (the clause is "in the smaller pen"). Design note: a real tension for the signed-everything build.
- **Wrath 1 (-2): Late Notice.** Interest is 0 until Favour is above -2. **Wrath 2 (-5): Collection.** The next time you miss a deadline there is no Pawn and no Snooze; the run ends.
- **Omen.** "Next debt: 60. Mine is bigger." He tells the exact amount of the next two debts and the next boss rule (always true, always depressing).
- **Demand.** "Sign something this round" (sign any deal before the next debt is paid). Reward +3 Favour and +2 Wick. If refused or unmet: -2 Favour.
- **Red Call: The Rollover.** The current debt's unpaid remainder is cut by 50% now. The next debt is 75% larger than its table amount. Choose well: it is a bridge for a strong engine and a trap for a weak one.
- **Own curse: Fine Print.** Every curse you take afterwards costs 1 Wick to read before you sign.
- **Jealousy.** Dislikes The Waiting Lady: "Waiting. Free of charge. How tidy." If she is Patron, his Standing blessings dim.

### 4.2 Auntie Beckon, the haunted till

- **Look and voice.** A bobbing wave-arm mascot with a smiling painted face on top of an old cash register; she can speak. Bright, fast, calls everyone "dear customer". She does not wear a robe and is not called a goddess. Sample line: "Come in, come in, nothing is cheap but everything is fair."
- **Domain.** Trade, the shop, footfall, discounts.
- **Folklore root and risk.** Nang Kwak, high. Handling in section 2: invented till-mascot, no religious look, no shrine posture, no offering with food.
- **Likes (x2):** coins spent in her shop that round (the Tin counts the shop spending of the round it follows), coins. **Fine:** Wick, sell a charm. **Meh:** Heat. **Hates:** taking a curse, haggling (rerolling more than twice in a visit).
- **Noticed (2): First Customer.** The wagon shows one extra charm offer.
- **Friend (5): Loyalty Card.** Sell price 75% instead of 50%; the first reroll in each visit is free.
- **Patron (8): Open Late.** All shop prices are 20% lower and the shop restocks one free charm per debt paid. Effect shape: new flag `shopPriceMult 0.8`.
- **Wrath 1:** Haggler's Shadow, shop prices +20%. **Wrath 2:** one charm offer fewer, and rerolls cost double.
- **Omen.** She reads the top two charm offers of the next wagon (the player sees them early and can save coins).
- **Demand.** "Buy two things." Buy at least 2 items in the next wagon. Reward +3 Favour and a free reroll next visit. If you buy nothing: -1 Favour.
- **Red Call: Closing Down Sale.** For the rest of this debt every item you sell returns 100% of its price and the wagon restocks free after each sale. After the debt is paid, the shop is **closed** (no wagon) for the next two rounds. The price is time without a shop.
- **Own curse: Haggler's Shadow.** Rerolls cost double.
- **Jealousy.** Hates Uncle Wire: "A man with a tray is not a shop." If Wire is Patron her Omen is wrong once per debt (she reads the wrong offers).

### 4.3 Little Gold, the gilded toy

- **Look and voice.** A child-sized gilded wooden doll with painted cheeks and a stitched smile, who grew bored of a charm stall shelf and now rides on the machine. Spoiled, giggly, shouts "mine!". Not a baby, not dead, not an amulet: a toy. Sample line: "Pick this one. No, not that one. I picked it."
- **Domain.** Luck, windfalls, the Favourite flag. The Luck mechanic from v2 is his.
- **Folklore root and risk.** Kuman Thong, high. Handling: do not name him that, no corpse or ritual or red drink or feeding, no sacred prayer pose, no gold-leaf rubbing on a body. The toy is brightly painted, a mascot.
- **Likes (x2):** tricks (play things), Luck spent in play. **Fine:** coins, Wick. **Meh:** Heat. **Hates:** skipping spins (no fun), selling a charm (he sulks).
- **Noticed (2): First Pick.** +1 base Luck (cap raised from 12 to 13 for this run).
- **Friend (5): Twice Pick.** The Favourite can be redrawn for free once per round in addition to the normal free redraw.
- **Patron (8): Two Faves.** Two Favourites are shown each spin, and you choose which one is active before the spin.
- **Wrath 1:** Tantrum, the Favourite is hidden. **Wrath 2:** Sticky Fingers, he takes one trick from a pocket each round.
- **Omen.** He shows the next two Favourites before you spin (cannot change them).
- **Demand.** "Let me pick." Surrender the Favourite redraw for one spin; he picks. Reward +3 Favour and +1 Luck for the round. If refused: -1 Favour.
- **Red Call: Pinky Promise.** Luck is +5 for the rest of the debt (cap 15). If the debt is not paid within **2 rounds**, he takes your highest-priced charm and goes home with it. A clean bargain with a visible price.
- **Own curse: Sticky Fingers.** One random trick is lost per debt.
- **Jealousy.** The Moonbiter: "He eats my light." If the Moonbiter is Patron, the Favourite flag dims on spin 1 of each round.

### 4.4 The Moonbiter, the polite shadow

- **Look and voice.** A round black shape on the corner of the sky, like a bite out of the moon, with a tiny voice and exquisite manners. Apologises before taking anything. Sample line: "So sorry. May I?"
- **Domain.** Eclipse, loss, removal. Pull Outs, Ash, curses as resource, hex family.
- **Folklore root and risk.** Rahu eclipse legend, high (worshipped as a planet-deity, tied to a weekday in practice). Handling: no planet, no weekday, no god-name, no deity iconography, no reference to a creation myth. A shy shadow only.
- **Likes (x2):** curses (taking his own curse), charms sold. **Fine:** Burn Heat, trick. **Meh:** coins. **Hates:** Wick (he finds it greedy).
- **Noticed (2): One Bite.** Pull Out may remove 4 symbols, not 3. The Pull Out costs 1 less Wick.
- **Friend (5): Hunger.** Each Ash that lands (see symbols) pays +1 coin x S^0.75 and counts as a Sigil for Wick.
- **Patron (8): Totality.** Once per debt, at the start of a spin, black out the centre cell: the spin is scored with that cell as an empty wild (it matches nothing but cannot hurt patterns). Patterns through the centre pay x2. Effect shape: flag `eclipseOnce`.
- **Wrath 1:** a random symbol's weight is -15% (shown). **Wrath 2:** Hollow Centre, the centre cell is dead for the round.
- **Omen.** He tells the exact count of Ash that will fall in the next spin.
- **Demand.** "Feed me." Offer a curse or a charm. Reward +4 Favour. Refuse: -1.
- **Red Call: One Bite.** Choose up to 3 symbol types to vanish from the machine **for this debt only**. All spin totals this debt x1.5. When the debt ends, he also bites one random charm; it comes back only if you pay a Wick for each.
- **Own curse: Hollow Centre.** The centre cell is dead every third spin.
- **Jealousy.** Little Gold: "A bright thing. Too bright." If Gold is Patron, Ash weight +1.

### 4.5 Lady Lamplit, the night lantern

- **Look and voice.** A paper lantern with a face, drifting at head height, glowing from within; gentle teasing voice, always slightly too close. No body, no gore, no entrails. Sample line: "Go on. One more. I won't tell."
- **Domain.** The night, Heat, dares and risk. The Heat meter is hers.
- **Folklore root and risk.** Krasue, medium: feared as a folk monster, not worshipped, but the legend carries cruel stories about women. Handling: the figure is a lantern, not a woman's severed head; no horror frame; she is a friend with an edge.
- **Likes (x2):** Burn Heat (the Heat offering is her best), Stoke taps in play. **Fine:** coins, Wick. **Meh:** tricks. **Hates:** `cold_iron` terms card, selling a charm.
- **Noticed (2): Warm Hands.** Each round starts at Heat 1.
- **Friend (5): Burning Bright.** Heat levels above 5 pay +10% each (on top of +20%). Spin up to Heat 12 (cap raised to 12 this run).
- **Patron (8): Fireproof.** A Scorch burns 5% instead of 10%, and the Scorch gives +1 Wick.
- **Wrath 1:** Dark Wick, Stoke maxes at 8. **Wrath 2:** the first spin of each round is at Heat 0 and cannot be stoked.
- **Omen.** She shows the percent chance of a Scorch at the current Heat, for the next three spins.
- **Demand.** "Dare me." Reach Heat 8 this round and survive without a Scorch. Reward +4 Favour and +3 Wick. Fail by a Scorch: lose 10% of the purse (she laughs) and -1 Favour.
- **Red Call: Midnight Run.** For the next round, Heat is locked at 10; all payouts x2. A Scorch twice that round costs you one charm slot (the slot returns at the next debt).
- **Own curse: Dark Wick.** Stoke maxes at 8 for the run.
- **Jealousy.** Grandmother Tide: "She stirs the water over my flame." If Tide is Patron, Stoke is capped at 9.

### 4.6 Grandmother Tide, the barge-woman

- **Look and voice.** A broad, weathered old woman in rubber boots and a plastic raincoat, standing on a barge in the river mouth, steady hands, always a pot of tea. Grumbles, loves routine, hates rush. Not a ship's spirit; a barge captain who has become something. Sample line: "Sit. Do it slow. The river does not hurry and it still gets there."
- **Domain.** Sea, trade routes, patience, interest (the slow money).
- **Folklore root and risk.** Mae Yanang, high (ship spirit with ritual carved prows and real reverence). Handling: invented barge-woman, no carved tree, no ship's prow ritual, no offerings of cloth or flowers.
- **Likes (x2):** coins **banked** that round (the Tin counts the amount banked since the last Tin). **Fine:** Wick, skip spins. **Meh:** tricks. **Hates:** Heat taps (Stoke offerings do not count), selling a charm.
- **Noticed (2): High Tide.** Interest +2 points.
- **Friend (5): Slack Tide.** Unused spins carry over to the next round, up to 3.
- **Patron (8): Spring Tide.** At the start of each debt, the first round has +2 spins and +4 Luck. At round end interest is paid again at half rate on coins banked this round.
- **Wrath 1:** Ebb, no interest for the whole debt. **Wrath 2:** Undertow, 5% of the purse sinks into the river each round.
- **Omen.** She shows the three terms cards of the **next** round before the current one ends (the player can plan).
- **Demand.** "Keep it cool." Finish the round at Heat 2 or less. Reward +3 Favour and a free reroll. If you Stoke above 2: -1 Favour.
- **Red Call: Cargo on Credit.** Receive 3 random charms of one family now (the family is chosen by the machine; you may refuse). At the end of the next debt you owe her one charm back (your choice); if you cannot pay, she takes your best.
- **Own curse: Slow Water.** Terms cards have one spin fewer.
- **Jealousy.** Lady Lamplit: "That girl is all sparks." If Lamplit is Patron, the Heat from Stoke only pays +15%.

### 4.7 Uncle Wire, the street hustler

- **Look and voice.** A grinning man with tangled overhead wires for hair, a food cart, a tool belt of keys and spoons, fast words, always "one shortcut". Invented from the cable-tangled Bangkok skyline. Sample line: "Friend, I have a trick, it has a hole, you have a thumb."
- **Domain.** Spirits of the street, tricks and the bench, shortcuts.
- **Folklore root and risk.** Low: invented from street life and overhead cables. The inspiration is generic city-spirit stories (not spirit houses). No cutting corners with real worshipped objects.
- **Likes (x2):** tricks handed over, tricks used that round. **Fine:** coins, Burn Heat. **Meh:** Wick. **Hates:** skipping spins, taking curses.
- **Noticed (2): Fourth Pocket.** Trick pockets +1 (4).
- **Friend (5): Odd Jobs.** Once per night, one trick is used for free (not consumed); choose after the reels stop.
- **Patron (8): Splice Hand.** Bench jobs cost 30% less and the bench offers one extra job each visit. Polish and Load apply twice on a symbol that already has the other.
- **Wrath 1:** Short Circuit, one trick pocket is jammed (locked) for the round. **Wrath 2:** he sells you out: a random trick is lost each round.
- **Omen.** He shows the next shop's bench prices and the next trick offer.
- **Demand.** "Hand me one." Give him a trick. Reward: two random tricks and +3 Favour. If refused: -1.
- **Red Call: Splice.** Choose two symbols: for the rest of the run each takes the average of their value and weight (rounded up). A 30% shock follows: lose 10% of the purse. The player sees both final numbers first and the shock chance. A build-warper.
- **Own curse: Short Circuit.** One of three trick pockets is jammed.
- **Jealousy.** Auntie Beckon: "A shop is a street with a landlord." If Beckon is Patron, the wagon's trick offers are 1 fewer.

### 4.8 The Waiting Lady, the kind ghost on the canal bridge

- **Look and voice.** A small, quiet woman in a patched rain cape, sitting on a canal bridge with a lantern, waiting for a ferry that owes her. Soft, stubborn, will not move until it arrives. No backstory about death or family; she is simply waiting, and she keeps what you give her safe until you return. Sample line: "It will come. Hold this for me, will you? I will hold yours."
- **Domain.** Canals, returns, second chances, pledges.
- **Folklore root and risk.** Mae Nak, high (the story of a waiting ghost has a real, visited shrine; the character is deeply loved and treated with reverence). Handling: no mention of childbirth, husband, war, no shrine, no named location, no "ghost wife" story, never a threat. A canal figure only.
- **Likes (x2):** pledging a charm (see Red Call), skip spins. **Fine:** Wick, coins. **Meh:** Heat. **Hates:** signed deals (her rival), tricks.
- **Noticed (2): Spare Candle.** At the start of each debt you get a Spare Candle trick if you have none.
- **Friend (5): Second Chance.** Once per run, a failed deadline is forgiven with one extra round (works with the Pawn and Snooze, but after them).
- **Patron (8): The Ferry Comes.** Pledged charms return with +1 rarity step (common to uncommon, etc.) and the first charm you pledge each debt does not lose its slot.
- **Wrath 1:** Heavy Hands, she will not hold your pledges (Red Call disabled). **Wrath 2:** she forgets you; Spare Candles burn out at the start of each debt.
- **Omen.** She tells you how many coins you are short of the current debt at the end of the round (the number that matters).
- **Demand.** "Wait with me." Skip the next night (no spins; interest and wagon still come, see GDD skip rule). Reward +4 Favour and a trick. If refused: -1.
- **Red Call: The Return Boat.** Save the state at the start of this round. At any time later in this debt you may press the Return Boat: the purse, Heat, tricks and charms go back to that start-of-round state; spins are restored. One use. Price: you take a Heavy Hands curse (pledges disabled for the rest of the run).
- **Own curse: Heavy Hands.** Cannot use pledges.
- **Jealousy.** Mr. Brimble: "He never waits." If Brimble is Patron, her Omen lies once per debt.

## 5. Design coverage and the build space

Powers and the build families they reinforce (v2 families): Brimble to pact and ledger; Beckon to ledger and tinker; Gold to omen; Moonbiter to hex, swarm and crown (via Pull Out); Lamplit to ember; Tide to ledger and wisp (steady purse); Wire to tinker and stitch; Waiting Lady to pact (refusers) and ledger. Two Patron slots per run give 28 pairs, each with a different engine and a different rival story. Combos worth testing: Gold + Wire (trick-driven Favourite play), Lamplit + Moonbiter (Ash as income), Tide + Waiting Lady (patient purse), Brimble + Beckon (spend big, borrow bigger), Moonbiter + Waiting Lady (feed, then pledge).

## 6. What is not verified

- Every blessing, wrath and Red Call number is a first pass; none was simulated.
- The Favour economy (1 to 2 offerings a round, 3 to 9 rounds a debt) assumes about 3 to 5 stage crossings per run. Verify with the bot and add Favour as a state to `sim-v2.mjs`.
- The Tin adds a screen per round; check run length (target: under 45 seconds added per round, one-tap skip).
- Names and lines need a Thai reader. Rename any power that is flagged.
