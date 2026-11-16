# ART_LIST (v2 lite build)

Source of truth: `art/sheets.json`. This file is the same list for people.

Technique: hand-painted gouache cut-paper sprites with a cream paper edge. Palette: deep indigo night, chili red, lime green, mango yellow, gold, warm bulb orange, coral (no pure magenta). Theme: a Bangkok night market, set in Thailand; see `docs/v2/THEME-TH.md`.

Prompt frame for every sheet: `A {cols}x{rows} grid sheet of separate sprites. ` + style line + ` Items, left to right, top to bottom: ` + numbered subjects.

Style line:

> hand-painted gouache cut-paper sprite, visible brush strokes, thick cream paper edge around each object, bold single silhouette, warm Bangkok night-market mood, palette: deep indigo night, chili red, lime green, mango yellow, gold, warm bulb orange, coral (no pure magenta), flat magenta #FF00FF background, no text, no letters, no numbers, no shadow on background, each object centered in its own cell with clear gap

Rules: one object per cell, nothing crosses a cell border, no text or numbers painted in, same light from top left. Cut with `scripts/cut-art.py` to `public/art/<id>.png` at the listed size.

Icon sharing: 124 charms use 45 `charm/*` icons (field `icon` in `charms.json`). 24 deals use 9 `deal/*` icons. 16 curses use 9 `curse/*` icons. 12 terms cards use 9 `stake/*` icons plus `ui/heat`, `ui/btn_bank`, `trick/hand_mirror`. Rarity is shown by the `ui/rarity_*` tag behind the icon, not by a new painting.

Pattern lines, numbers, meters and text are drawn by code, not painted.

## Sheet 1: `art/raw/sym_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `sym/moth` | a round green lime with one leaf |
| 2 | `sym/candle` | a bamboo skewer of three grilled fish balls |
| 3 | `sym/tooth` | a small woven bamboo sticky-rice basket with a lid |
| 4 | `sym/key` | a ripe yellow mango |
| 5 | `sym/eye` | a green young coconut with a straw |
| 6 | `sym/mask` | a spiky green durian |
| 7 | `sym/crow` | a wooden longtail boat with a long engine pole, side view |
| 8 | `sym/lantern` | a carved grey-brown wooden elephant figurine, trunk up |
| 9 | `sym/crown` | a shiny gold bar, three-quarter view |

## Sheet 2: `art/raw/sym_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `sym/wisp` | a green glowing firefly with two dot eyes |
| 2 | `sym/sigil` | a red business card with a small horned smiley, no text |
| 3 | `sym/ash` | a small black soot puff with one orange spark |
| 4 | `ui/coin` | a gold coin stamped with a small elephant |
| 5 | `ui/wick` | a crimped red bottle cap |
| 6 | `ui/wax` | a knotted red cloth money bundle |
| 7 | `ui/heat` | a red chili with a small flame at its tip |
| 8 | `ui/luck` | a green four-leaf clover |
| 9 | `ui/lock` | a steel padlock, closed |

## Sheet 3: `art/raw/charm_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/moth_jar` | a clear plastic bag of lime soda with a straw, tied with a rubber band |
| 2 | `charm/moth_wing` | a halved lime |
| 3 | `charm/cocoon` | a banana-leaf parcel tied with string |
| 4 | `charm/moth_net` | a woven bamboo basket full of limes |
| 5 | `charm/matchbox` | a red plastic gas lighter |
| 6 | `charm/coal` | a glowing lump of charcoal |
| 7 | `charm/bellows` | a woven bamboo hand fan |
| 8 | `charm/torch` | a black wok with a tall flame |
| 9 | `charm/brazier` | a round clay charcoal stove with glowing coals |

## Sheet 4: `art/raw/charm_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/rag_doll` | a broken paper umbrella with a torn panel, dripping |
| 2 | `charm/black_cat` | a thin street dog sitting, head up, howling at night |
| 3 | `charm/cracked_mirror` | a phone with a cracked screen |
| 4 | `charm/rib_cage` | a small sack of charcoal, wet at the bottom |
| 5 | `charm/crow_feather` | a wooden boat paddle |
| 6 | `charm/abacus` | a wooden abacus with red beads |
| 7 | `charm/coin_purse` | a vendor waist bag with a zip pocket |
| 8 | `charm/ledger_book` | a small spiral notebook with a pencil |
| 9 | `charm/clay_jar` | a pink ceramic piggy bank with a coin slot |

## Sheet 5: `art/raw/charm_c.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/stamp` | a wooden rubber stamp with red ink |
| 2 | `charm/quill` | a gold ballpoint pen |
| 3 | `charm/scroll` | a long curled paper receipt |
| 4 | `charm/ink_bottle` | a small pink-and-green neon sign shaped like a horned smiley, no text |
| 5 | `charm/claw_shake` | a red clawed hand held out for a handshake |
| 6 | `charm/red_ribbon` | a knotted red ribbon |
| 7 | `charm/tea_cup` | a tall glass of orange Thai iced tea with a straw |
| 8 | `charm/crystal_ball` | a white lucky cat waving one paw |
| 9 | `charm/star_card` | a red envelope with a gold edge, no text |

## Sheet 6: `art/raw/charm_d.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/comet` | a small yellow shooting star with a tail |
| 2 | `charm/horseshoe_nail` | a small green house gecko |
| 3 | `charm/spider_web` | a hanging mobile of woven palm-leaf fish |
| 4 | `charm/needle` | a rolled red hand-wrap bandage |
| 5 | `charm/shuttle` | a red boxing glove |
| 6 | `charm/knot` | a brass boxing-ring bell |
| 7 | `charm/wisp_bottle` | a corked glass bottle with green fireflies inside |
| 8 | `charm/glow_jar` | a jar full of glowing green dots |
| 9 | `charm/prism` | a bent green glow stick |

## Sheet 7: `art/raw/charm_e.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/firefly` | one firefly with a glowing green tail over a reed |
| 2 | `charm/wrench` | a chrome spanner |
| 3 | `charm/oil_can` | a small bottle of engine oil |
| 4 | `charm/gear` | a chrome gear wheel with eight teeth |
| 5 | `charm/hammer` | a small panel-beating hammer |
| 6 | `charm/pliers` | a pair of red-handled pliers |
| 7 | `charm/scepter` | a thick gold chain necklace |
| 8 | `charm/throne` | a small gold-shop glass display case with gold inside |
| 9 | `charm/cushion` | a red velvet jewellery tray |

## Sheet 8: `art/raw/trick_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `trick/pin` | a big wooden clothes peg |
| 2 | `trick/row_arrow` | a curled paper arrow pointing right |
| 3 | `trick/nudge` | a cream gloved hand with pointing finger |
| 4 | `trick/double_stamp` | two identical red stamps side by side |
| 5 | `trick/swap` | two paper arrows crossing left and right |
| 6 | `trick/brush` | a paintbrush with a green tip |
| 7 | `trick/broom` | a soft Thai grass broom with a bound handle |
| 8 | `trick/hourglass` | a round kitchen timer |
| 9 | `trick/ice` | a small steel ice bucket full of cubes |

## Sheet 9: `art/raw/trick_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `trick/chili` | one red bird's-eye chili |
| 2 | `trick/pocket` | a sewn shirt pocket with a button |
| 3 | `trick/stencil` | a paper stencil with a firefly-shaped hole |
| 4 | `trick/wish_coin` | a gold coin with a square hole on a red string |
| 5 | `trick/kit` | a small open tool roll with three tools |
| 6 | `trick/token` | a small blank paper queue ticket |
| 7 | `trick/horn` | a chrome rubber-bulb horn |
| 8 | `trick/hand_mirror` | a round pink pocket mirror, open |
| 9 | `trick/loan_note` | a torn paper note with a red thumbprint |

## Sheet 10: `art/raw/deal.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `deal/coins` | a stack of three coins |
| 2 | `deal/power` | a red boxing glove |
| 3 | `deal/luck` | a small lucky cat |
| 4 | `deal/slot` | an empty picture frame |
| 5 | `deal/wild` | a glowing green firefly |
| 6 | `deal/time` | a pocket watch |
| 7 | `deal/shop` | a price tag |
| 8 | `deal/symbol` | a gold bar |
| 9 | `deal/mystery` | a sealed black gift box with a red bow |

## Sheet 11: `art/raw/curse.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `curse/weight` | a black iron weight with a ring |
| 2 | `curse/candle` | a cracked alarm clock |
| 3 | `curse/ash` | a grey smog cloud with red eyes |
| 4 | `curse/tax` | a coin with a bite taken out |
| 5 | `curse/price` | a price tag with a red arrow up |
| 6 | `curse/blind` | a dark unplugged light bulb |
| 7 | `curse/chain` | three links of black chain |
| 8 | `curse/crack` | a cracked plastic plate |
| 9 | `curse/fever` | a red thermometer about to burst |

## Sheet 12: `art/raw/ui_a.png` (3x3, cut to 256 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/btn_spin` | a big round red push button with a chrome rim |
| 2 | `ui/btn_bank` | a steel cash-box slot with an arrow down |
| 3 | `ui/btn_shop` | a pink plastic shopping bag |
| 4 | `ui/btn_reroll` | two curled arrows forming a circle |
| 5 | `ui/btn_sell` | a paper price tag on a string |
| 6 | `ui/btn_settings` | a chrome cog |
| 7 | `ui/btn_ad` | a paper film ticket with a play triangle |
| 8 | `ui/btn_close` | a red painted X |
| 9 | `ui/btn_stoke` | a round red button with a chili painted on it |

## Sheet 13: `art/raw/stake.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `stake/steady` | a red plastic stool |
| 2 | `stake/short` | a lit firecracker |
| 3 | `stake/wick` | a small stack of bottle caps |
| 4 | `stake/long` | a crescent moon behind grey smog |
| 5 | `stake/luck` | a glowing green four-leaf clover |
| 6 | `stake/double` | one small plate and one big plate |
| 7 | `stake/shop` | a striped stall umbrella |
| 8 | `stake/cold` | a glass of iced drink with a straw |
| 9 | `stake/wild` | three green fireflies in a row |

## Sheet 14: `art/raw/hide.png` (3x3, cut to 256 px)

| # | id | subject |
|---|---|---|
| 1 | `hide/cot` | a folding canvas cot with a patterned blanket |
| 2 | `hide/stove` | a single-ring gas burner with a small blue tank |
| 3 | `hide/shelf` | a three-tier plastic shelf with jars |
| 4 | `hide/lights` | a loop of warm round bulbs on a cable |
| 5 | `hide/workbench` | a workbench with a vise and a spare scooter wheel |
| 6 | `hide/desk` | a small desk with an open laptop and a calculator |
| 7 | `hide/keepsake` | a round blue biscuit tin, lid closed |
| 8 | `hide/moth_house` | a red-and-white cooler box, lid up, bottles inside |
| 9 | `hide/mirror` | a karaoke speaker with a microphone on top |

## Sheet 15: `art/raw/ui_c.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/rarity_common` | a cream paper tag, blank |
| 2 | `ui/rarity_uncommon` | a green paper tag, blank |
| 3 | `ui/rarity_rare` | an orange paper tag, blank |
| 4 | `ui/rarity_legendary` | a red paper tag with gold edge, blank |
| 5 | `hide/chair` | a red leather massage chair with two small horns on the headrest |
| 6 | `ui/medal` | a gold medal on a red ribbon |
| 7 | `ui/daily` | a tear-off calendar page with a moon |
| 8 | `trick/salt` | a rolled white cold towel in plastic wrap |
| 9 | `trick/spare_candle` | a paper slip with a red stamp and a small clock |

## Sheet 16: `art/raw/ui_d.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/contract` | a long paper contract with a red ribbon |
| 2 | `ui/seal` | an empty round seal ring, gold |
| 3 | `ui/slot_empty` | a dashed cream paper square frame, empty |
| 4 | `ui/favour` | a small red rosette with a chili in the middle |
| 5 | `ui/curse_badge` | a black badge with a grey rain cloud |
| 6 | `ui/trick_bag` | a striped woven plastic market bag |
| 7 | `ui/interest` | a gold coin with a small sprout growing from it |
| 8 | `ui/collect` | a red claw screwing a lid onto a jar with a small flame |
| 9 | `ui/star` | a yellow paper star |

## Sheet 17: `art/raw/chars_a.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `char/nim` | a determined 19-year-old Thai street vendor, short black bob, faded apron over a T-shirt, holding grill tongs, bust portrait |
| 2 | `char/tao` | a lanky young Thai man, messy hair, soot on one cheek, sheepish grin, holding a gas lighter, bust portrait |
| 3 | `char/bua` | a round cheerful Thai market auntie, floral blouse, sun visor, pencil behind her ear, holding a calculator, bust portrait |
| 4 | `char/rattle` | a wiry old Thai boxing coach, grey crew cut, towel on shoulder, bottle of liniment oil in hand, bust portrait |

## Sheet 18: `art/raw/chars_b.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `char/sok` | a stooped old pawnshop owner, round glasses, white undershirt, wooden abacus under his arm, bust portrait |
| 2 | `char/pip` | a tiny red imp with one chipped horn, too-big floral shirt, flip-flops, nervous smile, bust portrait |
| 3 | `devil/idle` | Mr. Ruby: a tall slim red devil with two small horns, slicked-back hair, sunglasses, loud floral shirt, thin gold chain, white loafers, arms folded, bored look, full body |
| 4 | `devil/grin` | same devil, wide toothy grin, sunglasses pushed up, finger guns, full body |

## Sheet 19: `art/raw/devil_b.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `devil/angry` | same devil, steam from ears, stamping one loafer |
| 2 | `devil/deal` | same devil, holding out a contract and a gold pen, one eyebrow up |
| 3 | `devil/collect` | same devil, calmly screwing a lid onto a jar with a small flame inside |
| 4 | `devil/shock` | same devil, sunglasses flying off, mouth open in shock (all full body) |

## Singles

| file | id | size | magenta | subject |
|---|---|---|---|---|
| `art/raw/machine_case.png` | `machine/case` | 1024 | yes | front view of a rickety street-cart fortune machine cabinet, tall portrait shape, chrome trim and coloured neon tubes, a large empty dark window in the middle shaped 5 wide by 3 tall, a jar shelf on top, a little striped awning, taped cables, a round button socket at the bottom, no symbols, no text |
| `art/raw/bg_fair.png` | `bg/fair` | 1024 | no | portrait background, a Bangkok night market seen from the ground, rows of stall umbrellas in red and indigo, strings of warm bulbs, tangled power lines, a tuk-tuk far away, light haze, empty middle area, no characters, no text |
| `art/raw/bg_hideout.png` | `bg/hideout` | 1024 | no | portrait background, inside a small bare rented room with a concrete floor, one window showing city lights and a far-off tower, empty floor space, no furniture, no characters, no text |
| `art/raw/bg_wagon.png` | `bg/wagon` | 1024 | no | portrait background, inside a cramped market stall under a tarp, empty plastic shelves, hanging hooks, one bare bulb, indigo shadows, no characters, no text |
| `art/raw/bg_title.png` | `bg/title` | 1024 | no | portrait background, a narrow soi entrance at night, neon signs with no letters, a tangle of power lines, a parked tuk-tuk, a path leading in, city towers far behind, top third empty dark sky, no characters, no text |
| `art/raw/ui_panel.png` | `ui/panel` | 512 | yes | a plain torn-edge cream paper rectangle with a slightly darker painted border, empty, stretchable panel |
| `art/raw/ui_card.png` | `ui/card` | 512 | yes | a blank upright card-shaped cream paper card with a thin gold painted frame and a small horn mark in each corner, empty middle |

Totals: 19 sheets, 156 sprites, 7 singles.
