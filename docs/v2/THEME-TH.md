# THEME-TH: the Bangkok theme bible and rename map

Status: design only. Nothing in code or data is changed yet.
This file replaces the night-fair theme (moths, candles, ghost-train hideout) with the owner's concept:
**we start in Thailand, broke; we get rich through a deal with the devil; many places, lots of content.**

Hard rules for this file and for every string made from it:

- Every id stays the same: symbol, charm, deal, curse, trick, stake, contract, achievement, character, hideout, boss, bench, pattern, family, ending, art id and art file. Only names, flavour text and art subjects change.
- Rules, numbers and effects stay identical. Effect texts change only by the term swaps in section 3.
- No Buddha images, monks, temples, shrines, spirit houses, amulets, sacred thread, garlands, Loy Krathong or sky lanterns, naga, garuda, white elephants, sacred tattoos, Muay Thai sacred headbands or armbands.
- Nothing about the monarchy: no king, queen, crown, throne, royal, palace, coronation, jewels of state. The old Crown family and the Crown symbol are renamed.
- No mocking of Thai people, Thai accents or religion. Vendors, drivers and aunties are the heroes.
- No real-money gambling words: no lottery, casino, bet, wager, jackpot, slot, chips, odds. The machine is a fortune machine.
- The devil is a fictional Western-style cheeky devil who has set up shop in Bangkok. He is not a Thai religious figure.
- Thai text: natural, short, everyday Bangkok speech. Turkish text: natural, short.
- Thai UI word for "charm": stop using เครื่องราง (it reads as a Buddhist amulet). Use ไอเท็ม. Turkish keeps "Tılsım".

Native review: every Thai string below is a first draft by a non-native writer. A Thai speaker should read sections 4 to 15 before ship.

---

## 1. Title and pitch

| | en | tr | th |
|---|---|---|---|
| Title (`ui.title`) | Rags to Rubies | Sıfırdan Zirveye | จากศูนย์สู่เศรษฐี |
| Tagline (`ui.tagline`) | Broke in Bangkok. One devil, one fortune machine, one way up. | Bangkok'ta beş parasız. Bir şeytan, bir fal makinesi, tek yol yukarı. | หมดตัวกลางกรุงเทพฯ ปีศาจหนึ่งตน เครื่องดูดวงหนึ่งตู้ ทางเดียวคือขึ้น |

Pitch: Nim's family food cart burned on the first night of a new soi market. She signs a devil's paper to rebuild it. She pays his rising debts with his neon fortune machine and climbs from a street cart to a sky-bar penthouse, one Thai place at a time.

## 2. Story

### Place

Bangkok and beyond, at night. Every contract is a new place and a step up in money (section 6). The look is a real Thai night: plastic stools, stall umbrellas, string lights, tangled power lines, tuk-tuks, rain on hot asphalt, neon, then glass towers and a rooftop at the end.

### Nim (id `nim`, the player)

Nim (en Nim, tr Nim, th นิ่ม), 19. Sells grilled sticky rice, lime soda and fish balls from her family's folding cart in a small soi. On the first night of a new market the cart caught fire. Her brother Tao was at the gas burner. To rebuild she signed a paper she did not read.
Voice: dry, practical, counts every coin.
- "Sixty coins. I've haggled harder for limes."
- "You wrote this clause in a smaller font."
- "I am not lucky. I am organised."

### The devil (id `brimble`, new name **Mr. Ruby**)

| | en | tr | th |
|---|---|---|---|
| `ui.brimble` | Mr. Ruby | Bay Ruby | มิสเตอร์รูบี้ |

A tall, slim, red-skinned devil with two small horns, slicked-back hair, sunglasses at night, a loud floral shirt, a thin gold chain and white loafers. He runs one neon fortune machine on a rented spot at the edge of the night market and fixes it with tape and zip ties. He is a salesman, not a monster: menacing only because the paperwork is real. Voice: smooth, bored, polite, never shouts.
- "Three nights. Sixty coins. Or I keep the flame. Company policy."
- "That was luck. Luck is not in the contract."
- "A deal. Good for you now. Good for me later. That is what a deal is."
- "More spice? I admire that in a customer I am about to lose."
- (after a Flare-up) "The machine is fine. Your purse is lighter. Everyone learns."
- (when you refuse) "Clean hands. How dull."

Why "Ruby": red, a gem, the riches at the top of the climb, and easy to say in all three languages. It is not a religious name.

### Pip (id `pip`)

Pip (en Pip, tr Pip, th ปิ๊บ), Ruby's nephew. A tiny red imp with one chipped horn, a too-big floral shirt and flip-flops. He runs the shop stall (old "wagon") and secretly likes Nim.

### The collateral

Nim's lucky flame: a small warm flame in a glass jar on top of the machine. Miss a deadline and Ruby screws the lid shut (`devil/collect`). The run ends. Nim wakes at home: Ruby cannot afford to lose a paying customer, so he opens the jar again. He says so.

### Why she owes

The fine print. Nim signed for "one rebuilt cart, interest at the house rate". Each paid debt reveals a bigger one.

### The twist

The debt is not Nim's. The fine print names Ruby as the debtor: he owes **Head Office** (en Head Office, tr Genel Müdürlük, th สำนักงานใหญ่) for the machine, and every customer is a co-signer on his loan. The cart fire started in the machine's cheap power cable, plugged into Nim's cart, not at Tao's burner. The player learns it in pieces: ending 1, the Massage Chair lines at home, and contract 7 (Head Office flies in to Phuket).

### The three endings (ids and conditions unchanged)

| id | when | en name | tr | th | what happens |
|---|---|---|---|---|---|
| `paid_in_full` | clear c3 | Paid in Full | Borç Bitti | ปลดหนี้หมด | Nim's page is stamped in Yaowarat. She buys a new cart with a real awning. Small win: no longer broke. Ruby is back the next night with a new customer. Pip slips Nim the real contract. |
| `bought_the_machine` | clear c7 with no deal signed in that run | Bought the Machine | Makineyi Satın Aldı | ซื้อเครื่องมาเอง | Nim pays Head Office herself and owns Ruby's debt paper and the machine. Middle win: she owns a business. Ruby is free and has nowhere to go. He moves into her massage chair. |
| `new_management` | clear c10 with 5+ curses | New Management | Yeni Yönetim | ผู้บริหารคนใหม่ | Head Office promotes its best earner. On the sky-bar rooftop Nim gets the sunglasses and the gold chain. Rags to riches: penthouse, city at her feet. Ruby becomes her clerk. Last line is his: "Three nights. Sixty coins. You say it now. I've retired." |

## 3. Core terms (swap everywhere: i18n, data texts, tutorial, GDD)

Effect texts in `scripts/gen-v2-data.py` are rebuilt from these swaps only. Turkish suffixes must be re-fitted by hand (for example "Kapak" takes "-ı", "Acı" takes "-yı").

| old en | old id/key | new en | tr | th | note |
|---|---|---|---|---|---|
| Wick | `ui.wick`, `wick` fields | Caps | Kapak | ฝาขวด | bottle caps, street small change |
| Wax | `ui.wax`, `costWax`, `wax` reward | Stash | Birikim | เงินเก็บ | meta money for home |
| Heat | `ui.heat` | Spice | Acı | เผ็ด | "Spice 4" / "Acı 4" / "เผ็ด 4" |
| Stoke | stoke button | Spice Up | Acılandır | เพิ่มเผ็ด | |
| Ash (symbol `ash`) | | Soot | İs | เขม่า | |
| Scorch | | Flare-up | Parlama | ไฟลุก | |
| Wisp (symbol `wisp`) | | Firefly | Ateşböceği | หิ่งห้อย | wild |
| Sigil (symbol `sigil`) | | Calling Card | Kartvizit | นามบัตร | Ruby's red card |
| Favourite | `ui.fav` | Special | Gözde | เมนูเด็ด | "the Special" |
| Mr. Brimble | `ui.brimble` | Mr. Ruby | Bay Ruby | มิสเตอร์รูบี้ | |
| Head Office | | Head Office | Genel Müdürlük | สำนักงานใหญ่ | |
| Hideout | `ui.hideout` | Home | Ev | บ้าน | |
| Pip's wagon | `ui.wagon` | Pip's stall | Pip'in tezgâhı | แผงของปิ๊บ | "in the wagon" becomes "at the stall" / "tezgâhta" / "ที่แผง" |
| charm (th only) | | charm | Tılsım | ไอเท็ม | replace every เครื่องราง |
| Full Fair (pattern `full`) | | Full Market | Tam Pazar | เต็มตลาด | |
| night fair | | night market | gece pazarı | ตลาดกลางคืน | |
| Moth, Candle, Tooth, Key, Eye, Mask, Crow, Lantern, Crown | symbols | see section 4 | | | |
| Swarm, Ember, Hex, Ledger, Pact, Omen, Stitch, Wisp, Tinker, Crown charm | families | see section 5 | | | |
| curse names in deal texts | | see section 10 | | | |

Unchanged words: coins (para, เหรียญ), Purse (Kese, ถุงเงิน), Luck, Interest, debt, deal, curse (Lanet, คำสาป), trick, bench, terms, spin.

## 4. Symbols (ids, tiers, values, weights unchanged)

| id | tier/group | new en | tr | th | art subject (`sym/<id>`) |
|---|---|---|---|---|---|
| `moth` | 1 low | Lime | Limon | มะนาว | a round green lime with one leaf |
| `candle` | 1 low | Fish Balls | Köfte Şiş | ลูกชิ้น | a bamboo skewer of three grilled fish balls |
| `tooth` | 2 low | Sticky Rice | Yapışkan Pirinç | ข้าวเหนียว | a small woven bamboo sticky-rice basket with a lid |
| `key` | 2 low | Mango | Mango | มะม่วง | a ripe yellow mango |
| `eye` | 3 mid | Coconut | Hindistan Cevizi | มะพร้าว | a green young coconut with a straw |
| `mask` | 3 mid | Durian | Durian | ทุเรียน | a spiky green durian |
| `crow` | 4 high | Longtail Boat | Uzun Kuyruklu Tekne | เรือหางยาว | a wooden longtail boat with a long engine pole, side view |
| `lantern` | 4 high | Elephant | Fil | ช้าง | a carved wooden elephant figurine, trunk up, grey-brown (never white) |
| `crown` | 5 high | Gold Bar | Külçe Altın | ทองคำแท่ง | a shiny gold bar, three-quarter view |
| `wisp` | wild | Firefly | Ateşböceği | หิ่งห้อย | a green glowing firefly with two dot eyes |
| `sigil` | special | Calling Card | Kartvizit | นามบัตร | a red business card with a small horned smiley, no text |
| `ash` | special | Soot | İs | เขม่า | a small black soot puff with one orange spark |

Special-symbol texts stay as now with the term swaps (Firefly is wild; a Calling Card gives +1 Caps; three Soot is a Flare-up).

## 5. Charm families (ids unchanged; `config.json` families)

| id | old | new en | tr | th | theme |
|---|---|---|---|---|---|
| `swarm` | Swarm | Street Food | Sokak Lezzeti | สตรีทฟู้ด | low symbols, cheap food |
| `ember` | Ember | Wok | Wok | กระทะ | Spice, charcoal, flames |
| `hex` | Hex | Monsoon | Muson | มรสุม | curses: rain, floods, bad days |
| `ledger` | Ledger | Haggle | Pazarlık | ต่อราคา | interest, savings, prices |
| `pact` | Pact | Neon | Neon | นีออน | Ruby's deals, Calling Cards |
| `omen` | Omen | Lucky | Uğur | นำโชค | Luck, the Special |
| `stitch` | Stitch | Muay Thai | Muay Thai | มวยไทย | pattern shapes as strikes |
| `wisp` | Wisp | Firefly | Ateşböceği | หิ่งห้อย | wild Fireflies |
| `tinker` | Tinker | Tuk-tuk | Tuk-tuk | ตุ๊กตุ๊ก | tricks, slots, engines |
| `crown` | Crown | Gold | Altın | ทอง | high symbols, gold |

## 6. Contracts: the climb (10 places, ids and rules unchanged)

| id | old | new en | tr | th | flavour (en) | rule tie-in |
|---|---|---|---|---|---|---|
| `c1` | The Starter Pact | The Soi Cart | Sokak Arabası | รถเข็นในซอย | One folding cart, one bulb, one soi. Start here. | starter |
| `c2` | Standard Terms | Train Market | Tren Pazarı | ตลาดรถไฟ | A real stall at the big weekend night market. | plain |
| `c3` | The Full Ledger | Yaowarat | Yaowarat | เยาวราช | Chinatown: gold shops, neon, the first real money. | ending 1 |
| `c4` | Short Wick | Khao San Rush | Khao San Telaşı | ถนนข้าวสาร | Backpackers, fast nights, short spins. | −1 spin |
| `c5` | Dry Season | Pattaya Low Season | Pattaya Ölü Sezon | พัทยาหน้าโลว์ | Beach town, empty chairs, thin interest. | interest halved |
| `c6` | Cinder Week | Chiang Mai Haze | Chiang Mai Dumanı | หมอกควันเชียงใหม่ | Night bazaar in smoke season. More Soot, bigger burns. | Soot +2, Flare-up 30% |
| `c7` | Head Office Audit | Phuket Beach Club | Phuket Plaj Kulübü | บีชคลับภูเก็ต | Head Office flies in on holiday and checks the books. | starts with a curse; ending 2 |
| `c8` | Thin Shelves | Riverside Boutique | Nehir Kıyısı Butik | บูติกริมเจ้าพระยา | Rent by the river is high and the shelf is small. | thin shop |
| `c9` | Two Nights Only | Sukhumvit Condo Launch | Sukhumvit Rezidans Açılışı | เปิดตัวคอนโดสุขุมวิท | A two-night sales event in a glass lobby. | 2 rounds per debt |
| `c10` | New Management | The Sky Bar | Gökyüzü Barı | สกายบาร์ | Sixty floors up. Whoever runs this roof runs the night. | ending 3 |

Rule texts stay the same with term swaps.

## 7. Home (old hideout): from cart corner to penthouse

`bg/hideout` becomes Nim's home. One room, shown bare; pieces fill it and tell the climb. Build order (the `order` field) reads as the rise: 1 to 3 is a corner behind the cart, 4 to 6 a rented shophouse room, 7 to 9 a condo, 10 the penthouse with Ruby in the chair. Effects unchanged.

| id | old | new en | tr | th | text flavour (effect unchanged) | art subject (`hide/<id>`) |
|---|---|---|---|---|---|---|
| `cot` | Folding Cot | Cot Behind the Cart | Araba Arkası Yatak | เตียงพับหลังรถเข็น | Somewhere to sleep. Yours from the start. | a folding canvas cot with a patterned blanket |
| `stove` | Pot-belly Stove | Gas Burner | Tüplü Ocak | เตาแก๊ส | | a single-ring gas burner with a small blue tank |
| `shelf` | Crooked Shelf | Plastic Shelf | Plastik Raf | ชั้นพลาสติก | | a three-tier plastic shelf with jars |
| `lights` | String of Lanterns | String Lights | Ampul Zinciri | ไฟประดับ | | a loop of warm round bulbs on a cable |
| `workbench` | Workbench | Motorbike Bench | Motor Tezgâhı | โต๊ะช่างมอไซค์ | | a workbench with a vise and a spare scooter wheel |
| `desk` | Writing Desk | Laptop Desk | Laptop Masası | โต๊ะโน้ตบุ๊ก | | a small desk with an open laptop and a calculator |
| `keepsake` | Keepsake Box | Biscuit Tin | Bisküvi Kutusu | กล่องขนมปังปี๊บ | | a round blue butter-biscuit tin, lid closed |
| `moth_house` | Moth House | Cooler Box | Buzluk | กระติกน้ำแข็ง | Start each run with +3 Caps. | a red-and-white cooler box, lid up, bottles inside |
| `mirror` | Standing Mirror | Karaoke Set | Karaoke Seti | ชุดคาราโอเกะ | Play any run from a seed code and share yours. | a karaoke speaker with a microphone on top |
| `chair` | Brimble's Armchair | Ruby's Massage Chair | Ruby'nin Masaj Koltuğu | เก้าอี้นวดของรูบี้ | He visits. Refusing a deal gives +5 Caps, and he tells you things. | a red leather massage chair with two small horns on the headrest |

`ui.hideoutSub`: en "Your place. It grows with you. Spend Stash on it between runs." / tr "Senin yerin. Seninle büyür. Oyunlar arasında Birikim harca." / th "บ้านของเธอ โตไปพร้อมเธอ ใช้เงินเก็บแต่งระหว่างรอบ"

## 8. Characters (ids, unlocks, rules unchanged)

| id | new en | tr | th | who (new en description, mechanics text unchanged after the first sentence) | art subject |
|---|---|---|---|---|---|
| `nim` | Nim | Nim | นิ่ม | The cart girl. +1 Luck. Starts with a Nudge. | a determined 19-year-old Thai street vendor, short black bob, faded apron over a T-shirt, holding grill tongs, bust portrait |
| `tao` | Tao | Tao | เต๋า | Nim's brother. He was at the burner. Every round starts at Spice 3 and each Spice level pays +20%. | a lanky young Thai man, messy hair, soot on one cheek, sheepish grin, holding a gas lighter, bust portrait |
| `bua` | Auntie Bua | Bua Teyze | ป้าบัว | The market auntie. Knows what sells tonight. She picks the Special on the first spin of each round. One charm slot fewer. | a round cheerful Thai market auntie, floral blouse, sun visor, pencil behind her ear, holding a calculator, bust portrait |
| `rattle` | Coach Daeng | Koç Daeng | ครูแดง | Old Muay Thai cornerman. Takes a hit, gives two. Starts with one curse. Every curse gives all symbols +0.25 mult. Sticky Rice value +3. | a wiry old Thai boxing coach, grey crew cut, towel on shoulder, bottle of liniment oil in hand, bust portrait |
| `sok` | Uncle Sok | Sok Amca | อาโสก | Runs a Yaowarat pawnshop. Interest +5%. Sells charms for the full price. Starts with no Caps. | a stooped old pawnshop owner, round glasses, white undershirt, wooden abacus under his arm, bust portrait |
| `pip` | Pip | Pip | ปิ๊บ | Ruby's nephew. Six charm slots and three deals to choose from, but he starts with one curse. | a tiny red imp with one chipped horn, too-big floral shirt, flip-flops, nervous smile, bust portrait |

Note: `rattle` keeps its id. "Daeng" is a common nickname meaning "red"; ครู is the normal word for a Muay Thai coach.

## 9. Bosses, bench, patterns, endings ids

Bosses (`config.json` bosses, rules unchanged):

| id | new en | tr | th |
|---|---|---|---|
| `auditor` | The Health Inspector | Sağlık Müfettişi | คนตรวจร้าน |
| `collector` | The Rent Collector | Kira Tahsildarı | คนเก็บค่าเช่า |
| `veiled_clerk` | The Man in Shades | Siyah Gözlüklü Adam | ชายใส่แว่นดำ |
| `miser` | The Landlord | Ev Sahibi | เจ้าของตึก |
| `timekeeper` | The Night Watchman | Gece Bekçisi | ยามกะดึก |
| `head_inspector` | The Chief Inspector | Baş Müfettiş | หัวหน้าคนตรวจ |

Bench jobs (`config.json` bench):

| id | new en | tr | th |
|---|---|---|---|
| `polish` | Polish | Cilala | ขัดเงา |
| `weigh` | Stock Up | Stokla | ตุนของ |
| `gild` | Upgrade | Yükselt | อัปเกรด |
| `purge` | Pull Out | Çıkar | ดึงออก |
| `lift` | Lift a Curse | Laneti Kaldır | ปลดคำสาป |

Patterns: only `full` changes (Full Market / Tam Pazar / เต็มตลาด). The others keep their names.

## 10. Curses (16)

| id | old | new en | tr | th |
|---|---|---|---|---|
| `dead_weight` | Dead Weight | Bad Loan | Batık Kredi | หนี้เสีย |
| `short_candle` | Short Candle | Late Start | Geç Açılış | เปิดร้านสาย |
| `ash_rain` | Ash Rain | Smog | Duman | หมอกควัน |
| `the_tithe` | The Tithe | Market Fee | Pazar Payı | ค่าแผง |
| `dear_prices` | Dear Prices | Price Hike | Zam | ของขึ้นราคา |
| `blindfold` | Blindfold | Power Cut | Elektrik Kesintisi | ไฟดับ |
| `shackle` | Shackle | Tiny Stall | Dar Tezgâh | แผงแคบ |
| `hairline_crack` | Hairline Crack | Thin Margins | İnce Kâr | กำไรบาง |
| `fever` | Fever | Chili Burn | Biber Yakması | เผ็ดติดปาก |
| `moth_eaten` | Moth-eaten | Wilted | Solgun | ผักเหี่ยว |
| `cold_feet` | Cold Feet | Quiet Opening | Sessiz Açılış | เปิดร้านเงียบ |
| `smoke_hole` | Smoke Hole | Smoky Grill | Dumanlı Izgara | เตาควันโขมง |
| `small_print` | Small Print | Hidden Fees | Gizli Masraf | ค่าธรรมเนียมแฝง |
| `sticky_fingers` | Sticky Fingers | Pickpocket | Yankesici | มือล้วง |
| `jinx` | Jinx | Bad Day | Kötü Gün | วันซวย |
| `brittle_nerves` | Brittle Nerves | Short Temper | Kısa Sigorta | ใจร้อน |

## 11. Deals (24; texts name the new curses)

| id | old | new en | tr | th |
|---|---|---|---|---|
| `quick_cash` | Quick Cash | Quick Cash | Hızlı Para | เงินด่วน |
| `fat_purse` | Fat Purse | Better Rate | İyi Faiz | ดอกงาม |
| `advance` | A Small Advance | A Small Advance | Küçük Avans | เบิกล่วงหน้า |
| `muscle` | Borrowed Muscle | Borrowed Muscle | Ödünç Kas | ยืมแรง |
| `overdrive` | Overdrive | Full Throttle | Son Gaz | บิดสุด |
| `big_lines` | Grand Designs | Big Dreams | Büyük Hayaller | ฝันใหญ่ |
| `lucky_break` | Lucky Break | Lucky Break | Şans Kapısı | ดวงเฮง |
| `loaded` | A Thumb on the Scale | A Thumb on the Scale | Terazide Parmak | นิ้วกดตาชั่ง |
| `star_sign` | Star Sign | Star Sign | Burç | ราศี |
| `extra_slot` | Room for One More | Room for One More | Bir Kişilik Yer | เบียดได้อีกที่ |
| `big_pockets` | Deep Pockets | Cargo Pants | Kargo Pantolon | กางเกงหลายกระเป๋า |
| `wide_shelf` | Wide Shelf | Bigger Stall | Geniş Tezgâh | แผงใหญ่ |
| `green_night` | Green Night | Firefly Season | Ateşböceği Mevsimi | หน้าหิ่งห้อย |
| `false_face` | False Face | Durian Secret (Durians are wild) | Durian Sırrı | ความลับทุเรียน |
| `ghost_hire` | Hired Ghosts | Hired Fireflies | Kiralık Ateşböcekleri | จ้างหิ่งห้อย |
| `borrowed_time` | Borrowed Time | Borrowed Time | Ödünç Zaman | ยืมเวลา |
| `long_wick` | Long Wick | Late Closing | Geç Kapanış | ปิดร้านดึก |
| `snooze` | Snooze | Snooze | Erteleme | ขอเลื่อน |
| `free_market` | Friends and Family Rate | Friends Price | Eş Dost Fiyatı | ราคาคนกันเอง |
| `backroom` | Back Room | Back Room | Arka Oda | ห้องหลังร้าน |
| `fire_sale` | Fire Sale | Clearance Sale | Tasfiye | ล้างสต็อก |
| `crowned` | Paper Coronation | Gold Plating | Altın Kaplama | ชุบทอง |
| `purge_two` | Spring Cleaning | Clear the Shelf | Rafı Boşalt | เคลียร์แผง |
| `black_envelope` | The Black Envelope | Mystery Box | Sürpriz Kutu | กล่องปริศนา |

## 12. Tricks (20)

| id | old | new en | tr | th | art subject (`trick/<id>`) |
|---|---|---|---|---|---|
| `nudge` | Nudge | Nudge | Dürtme | สะกิด | a hand with a pointing finger, cream glove |
| `pin` | Thumbtack | Clothes Peg | Mandal | ไม้หนีบ | a big wooden clothes peg |
| `row_arrow` | Do-over | Do-over | Bir Daha | เอาใหม่ | a curled paper arrow pointing right |
| `double_stamp` | Double Stamp | Buy One Get One | Bir Alana Bir | ซื้อ 1 แถม 1 | two identical red stamps side by side, no text |
| `swap` | Switcheroo | Switcheroo | Yer Değiştir | สลับที่ | two paper arrows crossing left and right |
| `brush` | Green Brush | Paintbrush | Fırça | พู่กัน | a paintbrush with a green tip |
| `broom` | Straw Broom | Grass Broom | Saman Süpürge | ไม้กวาดดอกหญ้า | a soft Thai grass broom with a bound handle |
| `hourglass` | Hourglass | Extra Time | Ek Süre | ต่อเวลา | a round kitchen timer |
| `ice` | Ice Cube | Ice Bucket | Buz Kovası | ถังน้ำแข็ง | a small steel ice bucket full of cubes |
| `chili` | Chili | Chili | Acı Biber | พริก | one red bird's-eye chili |
| `pocket` | Sleeve Pocket | Shirt Pocket | Gömlek Cebi | กระเป๋าเสื้อ | a sewn shirt pocket with a button |
| `stencil` | Stencil | Stencil | Şablon | แบบลาย | a paper stencil with a firefly-shaped hole |
| `wish_coin` | Wish Coin | Lucky Coin | Uğurlu Para | เหรียญนำโชค | a gold coin with a square hole on a red string |
| `kit` | Tool Roll | Tool Roll | Alet Rulosu | ม้วนเครื่องมือ | a small open tool roll with three tools |
| `token` | Spiral Token | Queue Ticket | Sıra Fişi | บัตรคิว | a small paper queue ticket, blank, no numbers |
| `horn` | Party Horn | Tuk-tuk Horn | Tuk-tuk Kornası | แตรตุ๊กตุ๊ก | a chrome rubber-bulb horn |
| `hand_mirror` | Hand Mirror | Pocket Mirror | Cep Aynası | กระจกพกพา | a round pink pocket mirror, open |
| `loan_note` | Thumbprint Note | IOU Slip | Borç Senedi | ใบติดหนี้ | a torn paper note with a red thumbprint |
| `salt` | Salt | Cold Towel | Soğuk Havlu | ผ้าเย็น | a rolled white cold towel in plastic wrap |
| `spare_candle` | Spare Candle | Late Pass | Mühlet | ขอผ่อนผัน | a paper slip with a red stamp and a small clock |

## 13. Terms cards (stakes, 12)

| id | old | new en | tr | th | art subject (icon) |
|---|---|---|---|---|---|
| `steady` | Steady Night | Regular Night | Normal Gece | คืนปกติ | `stake/steady`: a red plastic stool |
| `short_fuse` | Short Fuse | Rush Hour | Yoğun Saat | ชั่วโมงเร่งด่วน | `stake/short`: a lit firecracker |
| `wick_run` | Wick Run | Cap Hunt | Kapak Avı | ล่าฝาขวด | `stake/wick`: a small stack of bottle caps |
| `long_night` | Long Night | Smoky Night | Dumanlı Gece | คืนควันคลุ้ง | `stake/long`: a crescent moon behind smog |
| `lucky_draw` | Wishbone Night | Lucky Night | Şanslı Gece | คืนดวงดี | `stake/luck`: a glowing green four-leaf clover |
| `two_faces` | Two Faces | Big Orders Only | Sadece Büyük Sipariş | รับแต่ออเดอร์ใหญ่ | `stake/double`: one small plate and one big plate |
| `market_night` | Market Night | Market Night | Pazar Gecesi | คืนตลาดนัด | `stake/shop`: a striped stall umbrella |
| `cold_iron` | Cold Iron | Mild, Please | Acısız Olsun | ไม่เผ็ดนะ | `stake/cold`: a glass of iced drink with a straw |
| `wild_night` | Ghost Night | Glow Night | Işıltı Gecesi | คืนหิ่งห้อย | `stake/wild`: three green fireflies in a row |
| `hot_coals` | Hot Coals | Extra Spicy | Ekstra Acı | เผ็ดพิเศษ | `ui/heat` |
| `bank_holiday` | Collector's Day Off | Collector's Day Off | Tahsildarın İzni | คนทวงหนี้หยุด | `ui/btn_bank` |
| `mirror_night` | Mirror Night | Encore Night | Tekrar Gecesi | คืนขอซ้ำ | `trick/hand_mirror` |

## 14. Charms (all 124 in `charms.json`; the brief said 104, the data has 124)

Effects unchanged. Icons unchanged (shared icon ids as now; new icon subjects in section 16).

### Street Food (`swarm`)

| id | new en | tr | th |
|---|---|---|---|
| `moth_jar` | Lime Soda Bag | Poşet Limonata | น้ำมะนาวถุง |
| `dusty_wing` | Half a Lime | Yarım Limon | มะนาวครึ่งซีก |
| `tallow_stub` | Dipping Sauce | Acı Sos | น้ำจิ้ม |
| `patient_cocoon` | Banana Leaf Parcel | Muz Yaprağı Paketi | ห่อใบตอง |
| `moth_net` | Lime Basket | Limon Sepeti | ตะกร้ามะนาว |
| `night_swarm` | Lime Rush | Limon Akını | มะนาวยกเข่ง |
| `milk_tooth` | Rice Basket | Pirinç Sepeti | กระติบข้าว |
| `bent_key` | Green Mango | Ham Mango | มะม่วงดิบ |
| `small_fry_union` | Hawkers' Club | Seyyar Satıcılar | ชมรมแม่ค้า |
| `dust_queen` | Lime Master | Limon Ustası | เซียนมะนาว |
| `paupers_parade` | Market Boom | Pazar Bereketi | ตลาดแตก |
| `hive_mind` | Food Court | Yemek Alanı | ศูนย์อาหาร |
| `moth_mother` | Lime Tree | Limon Ağacı | ต้นมะนาว |

### Wok (`ember`)

| id | new en | tr | th |
|---|---|---|---|
| `matchbox` | Gas Lighter | Çakmak | ไฟแช็ก |
| `hot_coal` | Hot Charcoal | Kızgın Kömür | ถ่านแดง |
| `bellows` | Bamboo Fan | Bambu Yelpaze | พัดสาน |
| `torch` | Wok Flame | Wok Alevi | ไฟกระทะ |
| `brazier` | Clay Stove | Kil Ocak | เตาถ่าน |
| `fire_eater` | Iron Stomach | Demir Mide | กระเพาะเหล็ก |
| `cold_ember` | Iced Coffee | Buzlu Kahve | โอเลี้ยง |
| `kindling` | Dried Chilies | Kuru Biber | พริกแห้ง |
| `furnace_heart` | Volcano Wok | Volkan Wok | กระทะภูเขาไฟ |
| `powder_trail` | Chili Paste | Biber Ezmesi | น้ำพริก |
| `stray_spark` | Flying Spark | Uçan Kıvılcım | สะเก็ดไฟ |
| `smiths_forge` | Wok Master | Wok Ustası | เชฟกระทะเหล็ก |
| `slow_burn` | Slow Grill | Ağır Ateş Izgara | ย่างไฟอ่อน |
| `cinder_vow` | Burnt Pan | Yanık Tava | กระทะไหม้ |

### Monsoon (`hex`)

| id | new en | tr | th |
|---|---|---|---|
| `pin_doll` | Leaky Umbrella | Delik Şemsiye | ร่มรั่ว |
| `black_cat` | Black Cat | Kara Kedi | แมวดำ |
| `cracked_mirror` | Cracked Screen | Kırık Ekran | จอแตก |
| `rattle_ribs` | Charcoal Sack | Kömür Çuvalı | กระสอบถ่าน |
| `crow_feather` | Boat Paddle | Kürek | ไม้พาย |
| `ash_cake` | Rice Crust | Kıtır Pilav | ข้าวตัง |
| `scapegoat_bell` | Silver Lining | Umut Işığı | ฟ้าหลังฝน |
| `grave_dirt` | Flooded Soi | Su Basmış Sokak | ซอยน้ำท่วม |
| `jinx_bead` | Falling Coconut | Düşen Hindistan Cevizi | มะพร้าวหล่น |
| `thirteenth_stair` | Pothole | Çukur | หลุมบ่อ |
| `martyr_splinter` | Wet Matches | Islak Kibrit | ไม้ขีดเปียก |
| `witch_bottle` | Rain Jar | Yağmur Küpü | โอ่งน้ำฝน |

### Haggle (`ledger`)

| id | new en | tr | th |
|---|---|---|---|
| `abacus` | Shop Abacus | Dükkân Abaküsü | ลูกคิด |
| `coin_purse` | Waist Bag | Bel Çantası | กระเป๋าคาดเอว |
| `ledger_book` | Price Notebook | Fiyat Defteri | สมุดจดราคา |
| `clay_jar` | Piggy Bank | Kumbara | กระปุกหมู |
| `exact_change` | Exact Change | Tam Para | เงินพอดี |
| `compound_tooth` | Interest on Interest | Faizin Faizi | ดอกทบต้น |
| `penny_wise` | Born Haggler | Doğuştan Pazarlıkçı | เซียนต่อราคา |
| `brass_goose` | Money Tree | Para Ağacı | ต้นกวักเงิน |
| `early_payer` | Early Bird | Erkenci | จ่ายไว |
| `dividend_slip` | Transfer Slip | Havale Fişi | สลิปโอนเงิน |
| `gilt_ledger` | Fat Wallet | Şişkin Cüzdan | กระเป๋าตุง |
| `tally_stick` | Stamp Card | Damga Kartı | บัตรสะสมแต้ม |
| `crown_bond` | Gold Savings | Altın Birikimi | ออมทอง |

### Neon (`pact`)

| id | new en | tr | th |
|---|---|---|---|
| `notary_stamp` | Rubber Stamp | Kaşe | ตรายาง |
| `quill` | Gold Pen | Altın Kalem | ปากกาทอง |
| `fine_print` | Read the Fine Print | Satır Arası | อ่านท้ายสัญญา |
| `ink_bottle` | Neon Sign | Neon Tabela | ป้ายไฟนีออน |
| `firm_handshake` | Firm Handshake | Sıkı El Sıkışma | จับมือแน่น |
| `red_ribbon` | Red Ribbon | Kırmızı Kurdele | ริบบิ้นแดง |
| `loophole` | Loophole | Açık Kapı | ช่องโหว่ |
| `summons` | Group Chat | Grup Sohbeti | แชทกลุ่ม |
| `blood_ink` | Red Ink | Kırmızı Mürekkep | หมึกแดง |
| `paid_witness` | Paid Witness | Ücretli Tanık | พยานรับจ้าง |
| `cosigner` | Co-signer | Kefil | คนค้ำประกัน |
| `devils_due` | Ruby's Cut | Ruby'nin Payı | ส่วนแบ่งรูบี้ |

### Lucky (`omen`)

| id | new en | tr | th |
|---|---|---|---|
| `tea_leaves` | Thai Iced Tea | Tay Buzlu Çayı | ชาเย็น |
| `crystal_ball` | Lucky Cat | Şans Kedisi | แมวกวัก |
| `star_card` | Red Envelope | Kırmızı Zarf | อั่งเปา |
| `comet` | Shooting Star | Kayan Yıldız | ดาวตก |
| `bent_nail` | House Gecko | Ev Kertenkelesi | ตุ๊กแก |
| `dream_web` | Woven Fish | Örgü Balık | ปลาตะเพียนสาน |
| `second_sight` | Second Sight | Altıncı His | ตาทิพย์ |
| `fair_wind` | Cool Breeze | Serin Esinti | ลมเย็น |
| `twin_stars` | Twin Stars | İkiz Yıldız | ดาวคู่ |
| `paper_fortune` | Fortune Cookie | Fal Kurabiyesi | คุกกี้ทำนาย |
| `fixed_star` | North Star | Kutup Yıldızı | ดาวเหนือ |
| `lodestar` | Best Seller | Çok Satan | ขายดี |

### Muay Thai (`stitch`)

| id | new en | tr | th |
|---|---|---|---|
| `needle` | Jab | Direkt | หมัดตรง |
| `shuttle` | Uppercut | Aparkat | หมัดเสย |
| `knot` | Roundhouse Kick | Döner Tekme | เตะเฉียง |
| `corner_tacks` | Corner Man | Köşe Adamı | พี่เลี้ยงมุม |
| `long_hem` | Long Combo | Uzun Kombo | คอมโบยาว |
| `patchwork` | Mixed Strikes | Karışık Vuruş | ออกอาวุธครบ |
| `crooked_loom` | Clinch | Klinç | จับล็อก |
| `halo_thread` | Elbow and Knee | Dirsek ve Diz | ศอกกับเข่า |
| `master_stitch` | Ring Veteran | Ring Kurdu | เซียนเวที |
| `fair_tapestry` | Knockout | Nakavt | น็อกเอาต์ |
| `pattern_book` | Training Camp | Antrenman Kampı | ค่ายมวย |

### Firefly (`wisp`)

| id | new en | tr | th |
|---|---|---|---|
| `wisp_bottle` | Firefly Bottle | Ateşböceği Şişesi | ขวดหิ่งห้อย |
| `glow_jar` | Glow Jar | Işıltı Kavanozu | โหลเรืองแสง |
| `firefly` | Canal Firefly | Kanal Ateşböceği | หิ่งห้อยริมคลอง |
| `prism` | Glow Stick | Işık Çubuğu | แท่งเรืองแสง |
| `lost_light` | Stray Glow | Kayıp Işık | แสงหลง |
| `changeling` | Switch-up | Kılık Değiştir | สลับร่าง |
| `spare_face` | Glowing Durian | Parlayan Durian | ทุเรียนเรืองแสง |
| `ghost_parade` | Firefly Boat Tour | Ateşböceği Turu | ล่องเรือดูหิ่งห้อย |
| `twin_flame` | Twin Glow | İkiz Işık | แสงคู่ |
| `green_dawn` | Mangrove Glow | Mangrov Işıltısı | แสงป่าชายเลน |
| `will_o_lamp` | Firefly Lamp | Ateşböceği Lambası | ตะเกียงหิ่งห้อย |

### Tuk-tuk (`tinker`)

| id | new en | tr | th |
|---|---|---|---|
| `wrench` | Chrome Spanner | Krom Anahtar | ประแจ |
| `oil_can` | Engine Oil | Motor Yağı | น้ำมันเครื่อง |
| `gear` | Two-stroke Engine | İki Zamanlı Motor | เครื่องสองจังหวะ |
| `hammer` | Panel Beater | Kaportacı | ช่างเคาะ |
| `pliers` | Pliers | Pense | คีม |
| `spare_parts` | Spare Parts | Yedek Parça | อะไหล่ |
| `tuned_gears` | Tuned Engine | Ayarlı Motor | เครื่องจูน |
| `polish_rag` | Chrome Polish | Krom Cilası | น้ำยาขัดเงา |
| `scrap_heap` | Used Parts Market | Hurdacı | เชียงกง |
| `clockwork_thumb` | Turbo | Turbo | เทอร์โบ |
| `understudy` | Copycat | Taklitçi | ลอกแบบ |
| `opening_act` | Front Seat | Ön Koltuk | เบาะหน้า |
| `closer` | Tail Light | Arka Lamba | ไฟท้าย |
| `tool_belt` | Tool Box | Alet Kutusu | กล่องเครื่องมือ |
| `lead_goose` | Convoy Leader | Konvoy Başı | หัวขบวน |
| `caboose` | Last in Line | Konvoy Sonu | ท้ายขบวน |

### Gold (`crown`)

| id | old | new en | tr | th |
|---|---|---|---|---|
| `scepter` | Short Scepter | Gold Chain | Altın Zincir | สร้อยทอง |
| `throne` | Crooked Throne | Gold Shop | Kuyumcu | ร้านทอง |
| `cushion` | Velvet Cushion | Velvet Tray | Kadife Tepsi | ถาดกำมะหยี่ |
| `lamplighter` | Lamplighter's Pole | Elephant Carver | Fil Oymacısı | ช่างแกะช้าง |
| `jesters_cap` | Jester's Cap | Big Spender | Eli Açık | สายเปย์ |
| `coronation` | Coronation | Gold Rush | Altına Hücum | ตื่นทอง |
| `royal_tithe` | Royal Tithe | Gold Tip | Altın Bahşiş | ทิปทอง |
| `velvet_rope` | Velvet Rope | VIP Rope | VIP İpi | เชือกกั้นวีไอพี |
| `paper_king` | Paper King | Paper Tycoon | Kâğıttan Zengin | เศรษฐีกระดาษ |
| `crown_jewels` | Crown Jewels | Gold Safe | Altın Kasası | ตู้เซฟทอง |

## 15. Achievements (43; conditions and rewards unchanged)

| id | old | new en | tr | th |
|---|---|---|---|---|
| `first_debt` | First Instalment | First Instalment | İlk Taksit | งวดแรก |
| `debts_50` | Regular Customer | Regular Customer | Müdavim | ขาประจำ |
| `contract_1` | Signed and Paid | Off the Soi | Sokaktan Çıkış | พ้นซอย |
| `contract_2` | Standard Customer | Market Regular | Pazarın Demirbaşı | ขาประจำตลาดรถไฟ |
| `contract_3` | Paid in Full | Chinatown Gold | Çin Mahallesi Altını | ทองเยาวราช |
| `contract_4` | Short Work | Backpacker Rush | Sırt Çantalı Akını | แบ็กแพ็กเกอร์บุก |
| `contract_5` | Dry Spell | Low Season Hero | Ölü Sezon Kahramanı | ฮีโร่หน้าโลว์ |
| `contract_6` | Out of the Ashes | Through the Haze | Dumanın İçinden | ฝ่าหมอกควัน |
| `contract_7` | Audited | Sand in the Books | Defterde Kum | ทรายในบัญชี |
| `contract_8` | Bare Shelves | River View | Nehir Manzarası | วิวแม่น้ำ |
| `contract_9` | Two Nights | Keys to the Condo | Dairenin Anahtarı | ได้กุญแจคอนโด |
| `contract_10` | Under New Management | Top of the City | Şehrin Tepesi | บนยอดเมือง |
| `reach_debt_6` | Deep In | In Over My Head | Boğazıma Kadar | หนี้ท่วมหัว |
| `full_fair` | The Whole Fair | The Whole Market | Bütün Pazar | เหมาทั้งตลาด |
| `cross_1` | Cross My Heart | Crossroads | Kavşak | สี่แยก |
| `vee_5` | Down and Up | Down and Up | İn Çık | ลงแล้วขึ้น |
| `frame_1` | Picture Frame | Photo Frame | Fotoğraf Çerçevesi | กรอบรูป |
| `six_patterns` | Busy Night | Busy Night | Yoğun Gece | คืนขายดี |
| `spin_1k` | Big Spin | Big Spin | Büyük Tur | หมุนใหญ่ |
| `spin_100k` | Absurd Spin | Absurd Spin | Akıl Almaz Tur | หมุนเวอร์ |
| `heat_10` | Boiling Point | Max Spice | Son Derece Acı | เผ็ดสุดขีด |
| `scorch_10` | Well Done | Well Done | İyi Pişmiş | สุกเกิน |
| `curses_4` | Bad Company | Rainy Season | Yağmur Mevsimi | หน้าฝน |
| `curses_8` | Walking Hex | Storm Chaser | Fırtına Avcısı | นักล่าพายุ |
| `deals_10` | Repeat Signer | Repeat Signer | Seri İmzacı | เซ็นไม่หยุด |
| `refuse_10` | No, Thank You | No, Thank You | Yok, Sağ Ol | ไม่เอาดีกว่า |
| `clean_contract` | Clean Hands | Clean Hands | Temiz Eller | มือสะอาด |
| `interest_total` | Money Makes Money | Money Makes Money | Para Parayı Çeker | เงินต่อเงิน |
| `early_10` | Ahead of Schedule | Ahead of Schedule | Vaktinden Önce | ก่อนกำหนด |
| `exact_change` | To the Coin | To the Last Coin | Kuruşu Kuruşuna | ไม่ขาดสักบาท |
| `tricks_50` | Light Fingers | Quick Hands | Çabuk Eller | มือไว |
| `tricks_3` | Triple Play | Triple Play | Üçlü Hamle | สามจังหวะ |
| `removed_5` | Less Is More | Less Is More | Az Çoktur | น้อยแต่มาก |
| `wisps_5` | Green Sky | Firefly Tree | Ateşböceği Ağacı | ต้นหิ่งห้อย |
| `luck_12` | Charmed Life | Born Lucky | Şanslı Doğmuş | ดวงเฮงสุดๆ |
| `fav_100` | House Favourite | House Special | Evin Gözdesi | เมนูเด็ดประจำร้าน |
| `crown_20` | Royal Habit | Gold Habit | Altın Merakı | ติดทอง |
| `family_5` | Family Business | Family Business | Aile İşi | ธุรกิจครอบครัว |
| `bought_100` | Hoarder | Hoarder | İstifçi | นักกักตุน |
| `sold_30` | Pawn Star | Pawnshop Regular | Rehinci Müdavimi | ขาประจำโรงรับจำนำ |
| `daily_7` | Seven Nights | Seven Nights | Yedi Gece | เจ็ดคืน |
| `char_wins_6` | Everyone Pays | The Whole Soi | Bütün Sokak | ทั้งซอย |
| `hideout_10` | Home at Last | Penthouse | Çatı Katı | เพนต์เฮาส์ |

Achievement texts: term swaps only ("Score a Full Market", "Spin 10 times at Spice 10", "Survive 10 Flare-ups", "Land 5 Fireflies", "Score 100 patterns of the Special", "Score 20 Gold Bar patterns", "Build 10 home pieces").

## 16. Art: new subject for every id in `art/sheets.json`

Files, grids, sizes and ids stay. Only `style` and each subject change.

New `style` line:
"hand-painted gouache cut-paper sprite, visible brush strokes, thick cream paper edge around each object, bold single silhouette, warm Bangkok night-market mood, palette: deep indigo night, chili red, lime green, mango yellow, gold, warm bulb orange, coral (no pure magenta), flat magenta #FF00FF background, no text, no letters, no numbers, no shadow on background, each object centered in its own cell with clear gap"

Global art bans: no Buddha, monk, temple roof, spirit house, amulet, garland, sacred thread, crown, throne, white elephant, garuda, naga, flag, readable text.

### sym_a
`sym/moth` a round green lime with one leaf · `sym/candle` a bamboo skewer of three grilled fish balls · `sym/tooth` a small woven bamboo sticky-rice basket with a lid · `sym/key` a ripe yellow mango · `sym/eye` a green young coconut with a straw · `sym/mask` a spiky green durian · `sym/crow` a wooden longtail boat with a long engine pole, side view · `sym/lantern` a carved grey-brown wooden elephant figurine, trunk up · `sym/crown` a shiny gold bar, three-quarter view

### sym_b
`sym/wisp` a green glowing firefly with two dot eyes · `sym/sigil` a red business card with a small horned smiley, no text · `sym/ash` a small black soot puff with one orange spark · `ui/coin` a gold coin stamped with a small elephant · `ui/wick` (Caps) a crimped red bottle cap · `ui/wax` (Stash) a knotted red cloth money bundle · `ui/heat` (Spice) a red chili with a small flame at its tip · `ui/luck` a green four-leaf clover · `ui/lock` a steel padlock, closed

### charm_a (Street Food, Wok)
`charm/moth_jar` a clear plastic bag of lime soda with a straw, tied with a rubber band · `charm/moth_wing` a halved lime · `charm/cocoon` a banana-leaf parcel tied with string · `charm/moth_net` a woven bamboo basket full of limes · `charm/matchbox` a red plastic gas lighter · `charm/coal` a glowing lump of charcoal · `charm/bellows` a woven bamboo hand fan · `charm/torch` a black wok with a tall flame · `charm/brazier` a round clay charcoal stove with glowing coals

### charm_b (Monsoon, Haggle)
`charm/rag_doll` a broken paper umbrella with a torn panel, dripping · `charm/black_cat` a black cat sitting, tail curled · `charm/cracked_mirror` a phone with a cracked screen · `charm/rib_cage` a small sack of charcoal, wet at the bottom · `charm/crow_feather` a wooden boat paddle · `charm/abacus` a wooden abacus with red beads · `charm/coin_purse` a vendor waist bag with a zip pocket · `charm/ledger_book` a small spiral notebook with a pencil · `charm/clay_jar` a pink ceramic piggy bank with a coin slot

### charm_c (Neon, Lucky)
`charm/stamp` a wooden rubber stamp with red ink · `charm/quill` a gold ballpoint pen · `charm/scroll` a long curled paper receipt · `charm/ink_bottle` a small pink-and-green neon sign shaped like a horned smiley, no text · `charm/claw_shake` a red clawed hand held out for a handshake · `charm/red_ribbon` a knotted red ribbon · `charm/tea_cup` a tall glass of orange Thai iced tea with a straw · `charm/crystal_ball` a white lucky cat waving one paw · `charm/star_card` a red envelope with a gold edge, no text

### charm_d (Lucky, Muay Thai, Firefly)
`charm/comet` a small yellow shooting star with a tail · `charm/horseshoe_nail` a small green house gecko · `charm/spider_web` a hanging mobile of woven palm-leaf fish · `charm/needle` a rolled red hand-wrap bandage · `charm/shuttle` a red boxing glove · `charm/knot` a brass boxing-ring bell · `charm/wisp_bottle` a corked glass bottle with green fireflies inside · `charm/glow_jar` a jar full of glowing green dots · `charm/prism` a bent green glow stick

### charm_e (Firefly, Tuk-tuk, Gold)
`charm/firefly` one firefly with a glowing green tail over a reed · `charm/wrench` a chrome spanner · `charm/oil_can` a small bottle of engine oil · `charm/gear` a chrome gear wheel with eight teeth · `charm/hammer` a small panel-beating hammer · `charm/pliers` a pair of red-handled pliers · `charm/scepter` a thick gold chain necklace · `charm/throne` a small gold-shop glass display case with gold inside · `charm/cushion` a red velvet jewellery tray

### trick_a
`trick/pin` a big wooden clothes peg · `trick/row_arrow` a curled paper arrow pointing right · `trick/nudge` a cream gloved hand with pointing finger · `trick/double_stamp` two identical red stamps side by side · `trick/swap` two paper arrows crossing left and right · `trick/brush` a paintbrush with a green tip · `trick/broom` a soft Thai grass broom with a bound handle · `trick/hourglass` a round kitchen timer · `trick/ice` a small steel ice bucket full of cubes

### trick_b
`trick/chili` one red bird's-eye chili · `trick/pocket` a sewn shirt pocket with a button · `trick/stencil` a paper stencil with a firefly-shaped hole · `trick/wish_coin` a gold coin with a square hole on a red string · `trick/kit` a small open tool roll with three tools · `trick/token` a small blank paper queue ticket · `trick/horn` a chrome rubber-bulb horn · `trick/hand_mirror` a round pink pocket mirror, open · `trick/loan_note` a torn paper note with a red thumbprint

### deal (Ruby's red claw holding...)
`deal/coins` a stack of three coins · `deal/power` a red boxing glove · `deal/luck` a small lucky cat · `deal/slot` an empty picture frame · `deal/wild` a glowing green firefly · `deal/time` a pocket watch · `deal/shop` a price tag · `deal/symbol` a gold bar · `deal/mystery` a sealed black gift box with a red bow

### curse
`curse/weight` a black iron weight with a ring · `curse/candle` a cracked alarm clock · `curse/ash` a grey smog cloud with red eyes · `curse/tax` a coin with a bite taken out · `curse/price` a price tag with a red arrow up · `curse/blind` a dark unplugged light bulb · `curse/chain` three links of black chain · `curse/crack` a cracked plastic plate · `curse/fever` a red thermometer about to burst

### ui_a
`ui/btn_spin` a big round red push button with a chrome rim · `ui/btn_bank` a steel cash-box slot with an arrow down · `ui/btn_shop` a pink plastic shopping bag · `ui/btn_reroll` two curled arrows forming a circle · `ui/btn_sell` a paper price tag on a string · `ui/btn_settings` a chrome cog · `ui/btn_ad` a paper film ticket with a play triangle · `ui/btn_close` a red painted X · `ui/btn_stoke` a round red button with a chili painted on it

### stake
`stake/steady` a red plastic stool · `stake/short` a lit firecracker · `stake/wick` a small stack of bottle caps · `stake/long` a crescent moon behind grey smog · `stake/luck` a glowing green four-leaf clover · `stake/double` one small plate and one big plate · `stake/shop` a striped stall umbrella · `stake/cold` a glass of iced drink with a straw · `stake/wild` three green fireflies in a row

### hide
`hide/cot` a folding canvas cot with a patterned blanket · `hide/stove` a single-ring gas burner with a small blue tank · `hide/shelf` a three-tier plastic shelf with jars · `hide/lights` a loop of warm round bulbs on a cable · `hide/workbench` a workbench with a vise and a spare scooter wheel · `hide/desk` a small desk with an open laptop and a calculator · `hide/keepsake` a round blue biscuit tin, lid closed · `hide/moth_house` a red-and-white cooler box, lid up, bottles inside · `hide/mirror` a karaoke speaker with a microphone on top

### ui_c
`ui/rarity_common` a cream paper tag, blank · `ui/rarity_uncommon` a green paper tag, blank · `ui/rarity_rare` an orange paper tag, blank · `ui/rarity_legendary` a red paper tag with gold edge, blank · `hide/chair` a red leather massage chair with two small horns on the headrest · `ui/medal` a gold medal on a red ribbon · `ui/daily` a tear-off calendar page with a moon · `trick/salt` a rolled white cold towel in plastic wrap · `trick/spare_candle` a paper slip with a red stamp and a small clock

### ui_d
`ui/contract` a long paper contract with a red ribbon · `ui/seal` an empty round seal ring, gold · `ui/slot_empty` a dashed cream paper square frame, empty · `ui/favour` (Special) a small red rosette with a chili in the middle · `ui/curse_badge` a black badge with a grey rain cloud · `ui/trick_bag` a striped woven plastic market bag · `ui/interest` a gold coin with a small sprout growing from it · `ui/collect` a red claw screwing a lid onto a jar with a small flame · `ui/star` a yellow paper star

### chars_a
`char/nim` a determined 19-year-old Thai street vendor, short black bob, faded apron over a T-shirt, holding grill tongs, bust portrait · `char/tao` a lanky young Thai man, messy hair, soot on one cheek, sheepish grin, holding a gas lighter, bust portrait · `char/bua` a round cheerful Thai market auntie, floral blouse, sun visor, pencil behind her ear, holding a calculator, bust portrait · `char/rattle` a wiry old Thai boxing coach, grey crew cut, towel on shoulder, bottle of liniment oil in hand, bust portrait

### chars_b
`char/sok` a stooped old pawnshop owner, round glasses, white undershirt, wooden abacus under his arm, bust portrait · `char/pip` a tiny red imp with one chipped horn, too-big floral shirt, flip-flops, nervous smile, bust portrait · `devil/idle` Mr. Ruby: a tall slim red devil with two small horns, slicked-back hair, sunglasses, loud floral shirt, thin gold chain, white loafers, arms folded, bored look, full body · `devil/grin` same devil, wide toothy grin, sunglasses pushed up, finger guns, full body

### devil_b
`devil/angry` same devil, steam from ears, stamping one loafer · `devil/deal` same devil, holding out a contract and a gold pen, one eyebrow up · `devil/collect` same devil, calmly screwing a lid onto a jar with a small flame inside · `devil/shock` same devil, sunglasses flying off, mouth open in shock (all full body)

### singles
- `machine/case`: front view of a rickety street-cart fortune machine cabinet, tall portrait shape, chrome trim and coloured neon tubes, a large empty dark window in the middle shaped 5 wide by 3 tall, a jar shelf on top, a little striped awning, taped cables, a round button socket at the bottom, no symbols, no text
- `bg/fair`: portrait background, a Bangkok night market seen from the ground, rows of stall umbrellas in red and indigo, strings of warm bulbs, tangled power lines, a tuk-tuk far away, light haze, empty middle area, no characters, no text
- `bg/hideout`: portrait background, inside a small bare rented room with a concrete floor, one window showing city lights and a far-off tower, empty floor space, no furniture, no characters, no text
- `bg/wagon`: portrait background, inside a cramped market stall under a tarp, empty plastic shelves, hanging hooks, one bare bulb, indigo shadows, no characters, no text
- `bg/title`: portrait background, a narrow soi entrance at night, neon signs with no letters, a tangle of power lines, a parked tuk-tuk, a path leading in, city towers far behind, top third empty dark sky, no characters, no text
- `ui/panel`: a plain torn-edge cream paper rectangle with a slightly darker painted border, empty, stretchable panel
- `ui/card`: a blank upright card-shaped cream paper card with a thin gold painted frame and a small horn mark in each corner, empty middle

## 17. Where the swaps land (for the build step)

- `scripts/gen-v2-data.py`: symbol names, family names, every charm/deal/curse/trick/stake/contract/achievement/hideout/character/boss/bench name in en, tr, th; effect texts via section 3; then regenerate `docs/v2/data` and `src/core/data`.
- `src/i18n.js`: `ui.title`, `ui.tagline`, `ui.wick`, `ui.wax`, `ui.heat`, `ui.fav`, `ui.brimble`, `ui.hideout`, `ui.hideoutSub`, `ui.wagon`, `ui.whenShop`, `ui.trickShop`, `ui.nextNight`, every th เครื่องราง, every "Brimble" / "Wick" / "Wax" / "Heat" / "Stoke" / "Scorch" / "Ash" / "Wisp" / "Sigil" / "Favourite" / "fair" / "wagon" / "ghost-train" mention, and all `line.brimble.*`, `line.pip.*`, `line.nim.*` speech in the voices of section 2.
- `src/tutorial.js`: same swaps; the intro tells the cart fire and the signature.
- `art/sheets.json` and `docs/v2/ART_LIST.md`: section 16.
- `docs/v2/GDD.md`: sections 1, 2 and 13 rewritten from sections 1, 2 and 7 here.
