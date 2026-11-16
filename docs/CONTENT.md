# CONTENT — Small Luck Pier v1.0

Data-ready tables. Ids are the keys used in `src/core/data/*.js` and in i18n (`sym.<id>`, `trinket.<id>.name`, `trinket.<id>.short`, `trinket.<id>.desc`). All numbers are starting values; `scripts/sim-balance.mjs` decides the final ones. The pay values, prices and the effect numbers of the 35 lite trinkets in sections 1-2 are the ones in `src/core/econ.js` and `src/core/data/*` (synced 2026-11-16). Symbols and trinkets that are not in the lite pool (Bottle, the Sky and Treasure families, most of the Knot family, Laundry Day and later) keep their draft effect numbers, with prices and pay values already on the econ.js scale, until their milestone.

Terms:
- "Adjacent" = 4 orthogonal neighbors. "Line pay" = the fixed pay of a 3-cell line.
- "Lands" = is drawn fresh this spin. A held (pegged) cell does not land again. "On the board" = in a cell after the spin, held or not.
- Held cells never pay on their own (GDD.md section 6): a line, an adjacency pair or a "per symbol" pay counts only if at least one of the cells involved landed this spin.
- Rounding is up, once, at the end of the spin total.
- **Trinket** (TR: biblo) is this game's word for a shelf item. **Grade** is its rank, shown as 1 to 4 co-op stamps on the card: grade 1, 2, 3, 4. Trinket price by grade: 5, 9, 14, 22 coins (econ.js). The words "charm", "joker", "common / uncommon / rare / legendary", "stake" and "overtime" are not used anywhere in the game (`docs/originality.md`).
- **Installment tier** is the quota multiplier of installments 2 and later. **Lamplight** is play after tide 5.

## 1. Symbols (16)

| id | EN | TR | Type | Line pay | Rule | Start tokens | Shop price | Unlock |
|---|---|---|---|---|---|---|---|---|
| pebble | Pebble | Çakıl | line | 4 | none | 5 | not sold | start |
| sardine | Sardine | Sardalya | line | 6 | none | 4 | 4 | start |
| tea | Tea glass | Çay bardağı | line | 7 | none | 3 | 5 | start |
| lantern | Lantern | Fener | line | 10 | none | 2 | 6 | start |
| gull | Gull | Martı | line | 14 | none | 1 | 8 | start |
| seaglass | Sea glass | Deniz camı | line | 22 | none | 0 | 10 | map_table |
| compass | Compass | Pusula | line | 34 | none | 0 | 13 | map_table |
| cormorant | Golden Cormorant | Altın Karabatak | line | 80 | max 2 tokens in a bag; the cap limits landings as well as lines | 0 | 20 | map_table |
| knot | Knot | Düğüm | wild | 12 (three Knots) | counts as any line symbol | 1 | 9 | start in bag; sold after rope_loft |
| net | Net | Ağ | special | - | pays 2 per adjacent Sardine | 0 | 6 | start |
| kelp | Kelp | Yosun | special | - | once per spin, if any Kelp lands: pay the counter once (not per Kelp), then counter +1; counter starts 1, max 5, per run | 0 | 8 | start |
| samovar | Samovar | Semaver | special | - | pays 3 per adjacent Tea glass | 0 | 7 | tea_corner |
| cat | Cat | Kedi | special | - | pays 4 per adjacent Sardine or Gull | 0 | 8 | cat_basket |
| bottle | Bottle | Şişe | special | - | when it lands: +1 peg for the rest of this tide, max +2 per tide | 0 | 5 | peg_rack |
| barnacle | Barnacle | Midye kabuğu | junk | - | pays 0 | 0 | not sold | creditor events |
| storm | Storm cloud | Fırtına bulutu | junk | - | pays 0; it and adjacent cells cannot be pegged | 0 | not sold | creditor events |

Bag rules for every symbol:
- **Copy cap:** every special symbol (Net, Kelp, Samovar, Cat, Bottle) has a maximum of 3 tokens in a bag. Golden Cormorant has a maximum of 2. The shop does not offer a token that is at its cap.
- **Token price:** the listed price, +2 for each copy of that symbol bought earlier in the run.
- **Token removal:** 3 per run, flat 26 coins each (econ.js). There is no bag minimum. Junk Cart makes the first removal of a shop free; it still uses one of the 3.

## 2. Trinkets (64)

Eight families of 8. The shelf holds 5.

The Effect column is the full rule. It is shown on the inspect card (tap or long-press a trinket). The card text on the shelf and in the shop is a short form of at most about 8 words, with a 3x3 example strip that shows one paying case. The name is always shown on shop cards.

Pay order never depends on shelf position (GDD.md section 6): "line pays +N" is a flat line add, "line pays xN" is a line multiplier, "+N" on a spin is a spin flat add, "pays xN in total" and "spin pays xN" are spin multipliers.

### Catch / Av (sardines, nets, cats)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| salt_barrel | Salt Barrel | Tuz Fıçısı | 1 | 5 | Sardine lines pay +5. | start |
| fish_cart | Fish Cart | Balık Arabası | 1 | 5 | If 4 or more Sardines land, +20. | start |
| net_mender | Net Mender | Ağ Tamircisi | 1 | 5 | Each Net pays 12 per adjacent Sardine instead of 2. | start |
| fish_hook | Fish Hook | Olta İğnesi | 2 | 9 | Sardine lines pay x2. | start |
| ice_crate | Ice Crate | Buz Kasası | 2 | 9 | A Sardine line completed with held Sardines pays +12 per held Sardine. | start |
| pier_cat | Pier Cat | İskele Kedisi | 2 | 9 | Each Sardine line pays +5. Each Cat pays x2. | cat_basket |
| fish_scale | Fishmonger's Scale | Balıkçı Terazisi | 3 | 14 | Each Sardine line that pays (counted per line, not per spin) adds +6 to Sardine line pay for the rest of the run, max +30. | start |
| full_net | Full Net | Dolu Ağ | 3 | 14 | If 5 or more Sardines land, +40. | start |

### Hearth / Ocak (tea, lanterns, samovar)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| samovar_tap | Samovar Tap | Semaver Musluğu | 1 | 5 | Tea glass lines pay +6. | tea_corner |
| lantern_oil | Lantern Oil | Fener Yağı | 1 | 5 | Lantern lines pay +8. | tea_corner |
| sugar_cube | Sugar Cube | Kesme Şeker | 1 | 5 | Each Tea glass adjacent to a Lantern pays +3. | tea_corner |
| warm_rug | Warm Rug | Sıcak Kilim | 1 | 5 | A spin with no peg clipped pays +6 (spins 2-6). | tea_corner |
| grandmas_cup | Grandma's Cup | Babaanne Fincanı | 2 | 9 | Tea glass lines pay x2. | tea_corner |
| hearth_stone | Hearth Stone | Ocak Taşı | 2 | 9 | After the quota is paid, +20% of the jar, max 20. | tea_corner |
| wick_trimmer | Wick Trimmer | Fitil Makası | 2 | 9 | Lantern lines in the middle row or middle column pay x3. | tea_corner |
| tea_garden | Tea Garden | Çay Bahçesi | 3 | 14 | A spin with a Tea glass line and a Lantern line pays x3 in total. | tea_corner |

### Sky / Gök (gulls, diagonals)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| kite | Kite | Uçurtma | 1 | 5 | Diagonal lines pay x1.5. | kite_shed |
| bread_crust | Bread Crust | Ekmek Kabuğu | 1 | 5 | Gull lines pay +15. | kite_shed |
| weather_vane | Weather Vane | Rüzgar Gülü | 2 | 9 | Each Gull that lands pays 2. | kite_shed |
| feather_duster | Feather Duster | Tüy Süpürge | 2 | 9 | Each Gull pays +3 per adjacent Pebble. | kite_shed |
| gull_whistle | Gull Whistle | Martı Düdüğü | 2 | 9 | If 3 or more Gulls land, +20. | kite_shed |
| updraft | Updraft | Hava Akımı | 3 | 14 | On diagonal lines, a Gull counts as wild. | kite_shed |
| cliff_nest | Cliff Nest | Yar Yuvası | 3 | 14 | Held Gulls do not need a peg. | kite_shed |
| flock | Flock | Sürü | 4 | 22 | Gull lines pay x3. | kite_shed |

### Treasure / Define (rare symbols)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| magnifier | Magnifier | Büyüteç | 1 | 5 | Sea glass lines pay +20. | map_table |
| coin_purse | Coin Purse | Para Kesesi | 1 | 5 | Once per spin, if a Sea glass, Compass or Golden Cormorant lands, +2. | map_table |
| chart_table | Chart Table | Harita Masası | 2 | 9 | Compass lines pay +30. | map_table |
| pocket_map | Pocket Map | Cep Haritası | 2 | 9 | Each Compass pays 4 per Sea glass on the board. | map_table |
| pawn_ticket | Pawn Ticket | Rehin Fişi | 2 | 9 | Sea glass, Compass and Golden Cormorant tokens cost 4 less. | map_table |
| cormorant_egg | Cormorant Egg | Karabatak Yumurtası | 3 | 14 | Once per spin, if a Golden Cormorant lands, +6 (not per Cormorant). | map_table |
| divers_bell | Diver's Bell | Dalgıç Çanı | 3 | 14 | The first Sea glass or Compass line of each tide pays x3. | map_table |
| golden_perch | Golden Perch | Altın Tünek | 4 | 22 | Golden Cormorant is wild. A line of only Cormorants and Knots still pays 80. | map_table |

### Knot / Düğüm (wilds, line shapes)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| spare_rope | Spare Rope | Yedek Halat | 1 | 5 | Lines that contain a Knot pay +4. | rope_loft |
| fishing_line | Fishing Line | Misina | 1 | 5 | Row lines pay +3. | rope_loft |
| mast | Mast | Direk | 1 | 5 | Column lines pay +3. | rope_loft |
| double_knot | Double Knot | Çifte Düğüm | 2 | 9 | Lines that contain a Knot pay x1.5. | rope_loft |
| anchor | Anchor | Çapa | 2 | 9 | A Knot that lands stays for the next spin without a peg, once. Then it falls off and is drawn again. | rope_loft |
| sailors_splice | Sailor's Splice | Gemici Dikişi | 3 | 14 | Three Knots pay 80 instead of 12. | rope_loft |
| crossed_ropes | Crossed Ropes | Çapraz Halat | 3 | 14 | If two paying lines share a cell, +25 (once per spin). | rope_loft |
| full_rig | Full Rig | Tam Donanım | 4 | 22 | A spin with 3 or more lines pays x2 in total. | rope_loft |

### Peg / Mandal (the hold mechanic)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| spare_peg | Spare Peg | Yedek Mandal | 1 | 5 | +1 peg per tide. | start |
| steady_hand | Steady Hand | Sabit El | 1 | 5 | A line completed with 2 pegged cells pays +3. | start |
| brass_peg | Brass Peg | Pirinç Mandal | 2 | 9 | Each pegged cell that is part of a paying line pays +4. | start |
| laundry_day | Laundry Day | Çamaşır Günü | 2 | 9 | +2 pegs per tide. | peg_rack |
| clothesline | Clothesline | Çamaşır İpi | 2 | 9 | Holding a full row needs 2 pegs instead of 3. | peg_rack |
| sticky_tar | Sticky Tar | Yapışkan Zift | 3 | 14 | The first line completed with a held cell each tide pays x2. | peg_rack |
| wishbone | Wishbone | Lades Kemiği | 3 | 14 | Once per tide, tap a column header to respin that column for free. It does not use a spin. Held cells in the column stay. Only lines that are new after the respin pay. | peg_rack |
| grandpas_pegs | Grandpa's Pegs | Dedemin Mandalları | 4 | 22 | When held cells complete a new line, +1 peg for the rest of the tide, max +3. | peg_rack |

### Tide / Gelgit (timing and mercy)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| first_light | First Light | İlk Işık | 1 | 5 | Spin 1 of each tide pays x3. | start |
| tide_table | Tide Table | Gelgit Cetveli | 1 | 5 | Every 3rd spin of a tide pays +4. | start |
| dry_spell | Dry Spell | Kurak Gün | 1 | 5 | After a spin that pays 0, the next spin pays x1.75. | start |
| night_tide | Night Tide | Gece Suyu | 1 | 5 | The last spin of each tide pays x2. | start |
| lucky_sandal | Lucky Sandal | Uğurlu Terlik | 2 | 9 | Each spin that pays 0 adds 1 charge. At 3 charges the next spin pays +30 and charges reset. The reel odds do not change. | radio |
| slack_water | Slack Water | Durgun Su | 2 | 9 | Quota -8%. | radio |
| orhans_watch | Orhan's Watch | Orhan'ın Saati | 3 | 14 | +1 spin and +1 peg per tide. | radio |
| second_wind | Second Wind | İkinci Nefes | 3 | 14 | Orhan's mercy covers a gap of up to 20 instead of 5, and can fire twice per run. | radio |

### Ledger / Defter (economy and bag)

| id | EN | TR | Grade | Price | Effect | Unlock |
|---|---|---|---|---|---|---|
| tin_cup | Tin Cup | Teneke Kupa | 1 | 5 | +14 coins at the start of each tide. | start |
| lucky_ledger | Lucky Ledger | Uğurlu Defter | 1 | 5 | The first two rerolls in each shop are free. | start |
| pebble_jar | Pebble Jar | Çakıl Kavanozu | 1 | 5 | Pebble lines pay +4. | start |
| skipping_stone | Skipping Stone | Sektirme Taşı | 2 | 9 | +3 for every 2 Pebbles that land, max 9 per spin. | start |
| hagglers_cap | Haggler's Cap | Pazarlıkçı Kasketi | 2 | 9 | Shop prices -30%. | start |
| junk_cart | Junk Cart | Eskici Arabası | 2 | 9 | The first token removal in each shop is free. It still uses one of your 3 removals this run. | start |
| kelp_pot | Kelp Pot | Yosun Saksısı | 2 | 9 | The Kelp counter grows +5 instead of +1, max 20. | start |
| sea_chest | Sea Chest | Sandık | 3 | 14 | +7 coins per held trinket at tide end. | start |

Start pool: 22 trinkets (Catch 7, Peg 3, Tide 4, Ledger 8). Full pool: 64. The start pool has 12 / 7 / 3 / 0 trinkets in the four grades, so the shop prints 60.6 / 30.3 / 9.1 / 0 at the start, not 60 / 30 / 9 / 1 (GDD.md section 8).

Value target per grade (ECONOMY.md section 1): a grade 1 trinket at 5 coins is worth about 8 coins per tide on the start bag (band 4-11). Peg trinkets changed with the peg rule (pegs are held at once, GDD.md section 6) and their numbers are the first thing the M1 sim re-measures.

Intended cross-family builds (the sim checks none dominates):
- Sardine wall: salt_barrel + fish_hook + net tokens + ice_crate + fish_scale.
- Tea and lantern cross: sugar_cube + tea_garden + wick_trimmer + samovar tokens.
- Diagonal gulls: kite + updraft + cliff_nest + flock.
- Wild rig: anchor + double_knot + crossed_ropes + full_rig.
- Peg engine: spare_peg + brass_peg + grandpas_pegs + bottle tokens + steady_hand.
- Pebble scrap: pebble_jar + skipping_stone + feather_duster (keeps the junk symbol useful).
- Slow and safe: tin_cup + hearth_stone + sea_chest + slack_water.

## 3. Tide Charts — run modifiers (12)

One is picked from 2 at run start from installment 4. Daily Tide and Sunday Market fix one. Every chart has a cost and a reward of about the same size, because a free buff would be picked every time. The sim holds each chart within 6 win-rate points (ECONOMY.md assert 12).

| id | EN | TR | Effect |
|---|---|---|---|
| spring_tide | Spring Tide | Bahar Suyu | Quota +20%. All line pay +25%. |
| neap_tide | Neap Tide | Ölü Su | Quota -20%. 5 spins per tide. |
| gull_season | Gull Season | Martı Mevsimi | +3 Gull tokens in the start bag. Quota +15%. |
| washing_day | Washing Day | Çamaşır Günü | 5 pegs per tide. Line pay -8%. |
| bare_line | Bare Line | Boş İp | 1 peg per tide. Start with 30 coins. Line pay +30%. |
| market_day | Market Day | Pazar Günü | Shops show 4 offers. Prices +25%. |
| lean_bag | Lean Bag | Hafif Torba | Start bag has 3 Pebbles instead of 5. Quota +20%. |
| pebble_beach | Pebble Beach | Çakıllı Koy | +2 Pebble tokens. Pebble line pay is 5. |
| lantern_festival | Lantern Festival | Fener Şenliği | +2 Lantern tokens. No Tea glass tokens in shops. Quota +10%. |
| long_evening | Long Evening | Uzun Akşam | 7 spins per tide. Quota +15%. |
| tight_shelf | Tight Shelf | Dar Raf | 3 trinket slots. Trinkets cost half. Quota -15%. |
| knotwork | Knotwork | Düğüm İşi | +1 Knot token. Diagonal lines do not pay. |

## 4. Creditor events (8)

One at tide 5 of every run. From installment 7 a second one at tide 3. Announced at the start of the tide with a stamp and one Orhan line. The Album keeps the stamp when the tide is cleared.

| id | EN | TR | Who | Effect on that tide |
|---|---|---|---|---|
| auditor | The Auditor | Müfettiş | Nermin Hanım from the district office | 2 pegs this tide instead of 3. |
| fog_bank | Fog Bank | Sis | weather | The right column cannot be pegged. |
| gull_strike | Gull Strike | Martı Baskını | the gulls | Barnacle tokens equal to 15% of the bag size (rounded up, at least 2) are added to the bag for this tide: 3 for a 16-token bag, 2 for a 10-token bag. |
| stamp_duty | Stamp Duty | Damga Pulu | the co-op clerk | The first line of each spin pays half. |
| short_day | Short Day | Kısa Gün | the ferry timetable | 1 spin less. Quota -10%. |
| collector | The Collector | Tahsildar | Rıfat Bey | The quota is taken after spin 5. Spin 6 still feeds the jar. |
| low_water | Low Water | Çekilme | the sea | Lines in the bottom row do not pay. |
| orhans_test | Orhan's Test | Orhan'ın Sınavı | Kaptan Orhan (installment 12 only) | Quota +10%. 1 Storm cloud token in the bag. Mercy still works. |

Each event has its own allowed drop in the tide-5 pass rate (ECONOMY.md assert 11).

## 5. Unlockables (15)

| # | id | EN | TR | Cost / condition | Unlocks |
|---|---|---|---|---|---|
| 1 | roof | Patch the Roof | Çatıyı Onar | 10 Planks | Album; boathouse stage 1 |
| 2 | stove | Stove | Soba | 20 Planks | Run-start pick shows 4 trinkets instead of 3 |
| 3 | cat_basket | Cat Basket | Kedi Sepeti | 30 Planks | Cat symbol, Pier Cat trinket; neighbor: the cat Tekir |
| 4 | radio | Radio | Radyo | 45 Planks | 4 Tide trinkets; the radio plays on the home screen |
| 5 | tea_corner | Tea Corner | Çay Köşesi | 60 Planks | Hearth family (8), Samovar symbol; neighbor: Madam Sevgi |
| 6 | kite_shed | Kite Shed | Uçurtma Sundurması | 80 Planks | Sky family (8) |
| 7 | rope_loft | Rope Loft | Halat Çatısı | 100 Planks | Knot family (8), Knot token in shops; neighbor: Cem |
| 8 | map_table | Map Table | Harita Masası | 120 Planks | Treasure family (8), Sea glass, Compass, Golden Cormorant |
| 9 | peg_rack | Peg Rack | Mandal Askısı | 140 Planks | 5 Peg trinkets, Bottle symbol; neighbor: Nermin Hanım |
| 10 | lamp_post | Lamp Post | Sokak Lambası | 180 Planks | Harbor lit at night on the home screen; night sky strip in runs (cosmetic only) |
| 11 | teahouse_sign | Teahouse Sign | Çayevi Tabelası | 250 Planks | Final boathouse stage; credits postcard |
| 12 | lamplight | Lamplight | Lamba Işığı | win installment 1 | Lamplight (tides 6+) after any won run |
| 13 | daily | Daily Tide | Günün Gelgiti | finish run 2 | Daily Tide, streak and Sunday Market |
| 14 | charts | Tide Charts | Gelgit Çizelgeleri | win installment 3 | Run modifier pick |
| 15 | open_season | Open Season | Açık Sezon | win installment 12 | Installment tiers 13-20 (S = 1.48 to 1.76), Orhan on the pier |

No game mode costs Planks. Planks unlock trinket families, symbols and the look of the home. Turbo and skip are in settings from the first launch. Neighbors arrive with builds only (3, 5, 7, 9), never with installments.

Cosmetics from the Harbor Ledger track (free): reel skins "Blue Sunday", "Fairground Red", "Night Ferry"; hats "Hasan's Cap", "Paper Boat".

## 6. Character lines

Key = `line.<who>.<trigger>.<n>`. One line is shown on about 1 spin in 4, never the same line twice in a row. A line that names a neighbor is picked only when that neighbor's build exists ("needs" notes below).

### Deni

| Trigger | EN | TR |
|---|---|---|
| run_start.1 | Come on, you old box. Grandpa trusted you with the boiler money. I'm only asking for tea money. | Hadi ama kutucuk. Dedem sana kazan parasını emanet etti. Ben sadece çay parası istiyorum. |
| run_start.2 | Six turns. Be a good goat. | Altı çevirme. Uslu bir keçi ol. |
| run_start.3 | Orhan's window is open. He's listening. Behave. | Orhan'ın penceresi açık. Dinliyor. Uslu dur. |
| tutorial_peg | Two the same. Peg them. Grandpa's rule. | İkisi aynı. Mandalla. Dedemin kuralı. |
| pair_miss.1 | Two lanterns and a gull. The gull knows what it did. | İki fener, bir martı. Martı ne yaptığını biliyor. |
| pair_miss.2 | Two out of three. I can work with two. | Üçte iki. İkiyle iş yaparım. |
| pair_miss.3 | Fine. I'll peg it and we try again like adults. | Tamam. Mandallıyorum, yetişkinler gibi bir daha deniyoruz. |
| peg_hit.1 | Told you. | Dedim sana. |
| peg_hit.2 | That's what the pegs are for. | Mandal bunun için var. |
| peg_hit.3 | Grandpa carved his initials on these. Now I see why. | Dedem bunlara adını kazımış. Şimdi anladım nedenini. |
| zero.1 | Nothing. A fine collection of nothing. | Hiç. Güzel bir hiç koleksiyonu. |
| zero.2 | Pebbles. You shouldn't have. | Çakıl. Hiç gerek yoktu. |
| zero.3 | I'm not angry. I'm counting. | Kızmadım. Sayıyorum. |
| zero_streak | Three empty turns. Even the cat looked away. | Üç boş çevirme. Kedi bile başını çevirdi. |
| small_win.1 | Tea money. I'll take it. | Çay parası. Alırım. |
| small_win.2 | Sardines pay the small bills. | Küçük faturaları sardalya öder. |
| big_win.1 | Look at that! Don't get smug, box. | Şuna bak! Şımarma kutucuk. |
| big_win.2 | Ring the bell, Cem. Ring it twice. (needs rope_loft) | Çanı çal Cem. İki kere çal. |
| big_win.3 | Grandpa, are you seeing this? | Dede, görüyor musun? |
| clutch.1 | Last turn. Of course it was the last turn. | Son çevirme. Tabii ki son çevirmeydi. |
| clutch.2 | Paid. With one whole second to spare. | Ödendi. Tam bir saniye kala. |
| tide_paid.1 | Told you. Don't get smug, {n} tides to go. (tides 1-3 only) | Bak, dedim sana. Ama sevinme, daha {n} gelgit var. |
| tide_paid.2 | One more page for Orhan's ledger. | Orhan'ın defterine bir sayfa daha. |
| mercy | He rounded up. Nobody say a word. | Yuvarladı. Kimse bir şey demesin. |
| shop_enter.1 | Grandpa's crate. Hands in pockets, Deni. | Dedemin sandığı. Eller cepte Deni. |
| shop_enter.2 | What do we need, and what do I just want? | Ne lazım, ne sadece canım istiyor? |
| shop_enter.3 | Sevgi's stall. Hands in pockets, Deni. (needs tea_corner) | Sevgi'nin tezgahı. Eller cepte Deni. |
| shop_buy.1 | It'll pay for itself. Probably. | Kendini amorti eder. Herhalde. |
| shop_buy.2 | Welcome to the shelf. Make yourself useful. | Rafa hoş geldin. Bir işe yara. |
| shop_broke | The jar says no. | Kavanoz hayır diyor. |
| remove_token | Goodbye, pebble. It was never personal. | Güle güle çakıl. Kişisel değildi. |
| event_intro | Company. Stand up straight, box. | Misafir var. Dik dur kutucuk. |
| loss.1 | Not today. The pier's still standing, and so am I. | Bugün olmadı. İskele ayakta, ben de. |
| loss.2 | Short. I'll be back at first light. | Yetmedi. İlk ışıkta yine buradayım. |
| loss.3 | The box and I need to have a talk. | Kutucukla bir konuşmamız lazım. |
| win.1 | Stamp it, Kaptan. | Bas damgayı Kaptan. |
| win.2 | One less. Grandpa, one less. | Bir tane eksildi. Dede, bir tane eksildi. |
| home.1 | The roof holds. Mostly. | Çatı tutuyor. Çoğunlukla. |
| home.2 | Planks first. Curtains later. | Önce tahta. Perde sonra. |
| build_done | Hammer down. It looks like a place now. | Çekici bıraktım. Artık bir yere benziyor. |
| daily_start | Same tide for the whole harbor today. No excuses. | Bugün bütün limana aynı gelgit. Bahane yok. |
| streak | Every day this week. Even the gulls noticed. | Bu hafta her gün. Martılar bile fark etti. |
| lamplight | Paid, and still cranking. Don't tell Orhan I like this. | Ödedim, hâlâ çeviriyorum. Orhan'a sevdiğimi söylemeyin. |
| installment_12 | The drawer. All of it. You stubborn old man. | Çekmece. Hepsi. Seni inatçı ihtiyar. |

### Kaptan Orhan

| Trigger | EN | TR |
|---|---|---|
| tide_paid.1 | Hm. | Hm. |
| tide_paid.2 | On time. Your grandfather never was. | Vaktinde. Deden hiç olmazdı. |
| tide_paid.3 | Paid. Next. | Ödendi. Sıradaki. |
| mercy | Rounding. Don't tell the co-op. | Yuvarlıyorum. Kooperatife söyleme. |
| event_auditor | The district sent an auditor. Count your pegs. | İlçeden müfettiş geldi. Mandallarını say. |
| event_fog | Fog on the right side. Can't see a thing over there. | Sağ taraf sis. Orada bir şey görünmüyor. |
| event_gulls | The gulls are on strike. Don't ask. | Martılar grevde. Sorma. |
| event_stamp | Stamp duty. Half of the first one is the state's. | Damga pulu. İlkinin yarısı devletin. |
| event_short | Ferry leaves early. So do you. | Vapur erken kalkıyor. Sen de. |
| event_collector | Rıfat collects at five. Not at six. | Rıfat beşte toplar. Altıda değil. |
| event_low | Tide's out. The bottom row is mud. | Su çekildi. Alt sıra çamur. |
| event_test | Today I watch every turn. Show me. | Bugün her çevirmeye bakıyorum. Göster bakalım. |
| loss.1 | Close the ledger. Come back tomorrow. | Defteri kapat. Yarın gel. |
| loss.2 | The deed stays in the drawer. For now. | Tapu çekmecede kalıyor. Şimdilik. |
| win | Installment received. Sit. Drink your tea. | Taksit alındı. Otur. Çayını iç. |
| installment_12 | He asked me to make you fight for it. You did. It's yours. | Onun için savaşmanı istedi benden. Savaştın. Senindir. |

### Neighbors (home screen, one line each visit)

Each neighbor appears only after their build (Tekir: cat_basket, Madam Sevgi: tea_corner, Cem: rope_loft, Nermin Hanım: peg_rack) and has a job in the run (GDD.md section 4).

| Who | EN | TR |
|---|---|---|
| Madam Sevgi | Take a simit. You can't crank on an empty stomach. | Al bir simit. Aç karnına kol çevrilmez. |
| Cem | The pier holds my boat. That's all I ask of a pier. | İskele teknemi tutuyor. İskeleden başka ne isterim. |
| Nermin Hanım | I audit. I also like your curtains. | Ben denetlerim. Perdelerini de beğendim. |
| Tekir (cat) | Mrrp. | Mırr. |

## 7. Postcards (24, Album)

Each is one sentence from Hasan, unlocked by a goal. Examples of goals: first clutch clear, 3 lines in one spin, win with 0 Pebbles in the bag, win without buying a trinket above grade 1, clear each creditor once (8 cards), finish a 7-day streak, reach tide 8, 10, 12 in Lamplight. Text is written in M4 (ROADMAP.md); keys `postcard.1` to `postcard.24`.

## 8. Margin notes (36, Album)

Every finished run, won or lost, unlocks the next margin note: one sentence in Hasan's hand, found in the margin of Orhan's ledger and shown on the run end screen. They are read in order, so every run pays one line of story even when the installment is not won. 36 notes in v1.0 (18 in the soft-launch build), keys `note.1` to `note.36`, written with the postcards.
