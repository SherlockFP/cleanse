# ART_LIST (v2 lite build)

Source of truth: `art/sheets.json`. This file is the same list for people.

Technique: hand-painted gouache cut-paper sprites with a cream paper edge. Palette: deep plum black `#1c1220`, candle orange `#f08a2a`, bone cream `#f1e6cf`, poison green `#7fd13b`, blood red `#b3202a`, brass yellow `#d9a62e`.

Prompt frame for every sheet: `A {cols}x{rows} grid sheet of separate sprites. ` + style line + ` Items, left to right, top to bottom: ` + numbered subjects.

Style line:

> hand-painted gouache cut-paper sprite, visible brush strokes, thick cream paper edge around each object, bold single silhouette, spooky-cute night fair, palette: deep plum black, candle orange, bone cream, poison green, blood red, brass yellow, flat magenta #FF00FF background, no text, no shadow on background, each object centered in its own cell with clear gap

Rules: one object per cell, nothing crosses a cell border, no text or numbers painted in, same light from top left. Cut with `scripts/cut-art.py` to `public/art/<id>.png` at the listed size.

Icon sharing: 104 charms use 45 `charm/*` icons (field `icon` in `charms.json`). 24 deals use 9 `deal/*` icons. 16 curses use 9 `curse/*` icons. 12 terms cards use 9 `stake/*` icons plus `ui/heat`, `ui/btn_bank`, `trick/hand_mirror`. Rarity is shown by the `ui/rarity_*` tag behind the icon, not by a new painting.

Pattern lines, numbers, meters and text are drawn by code, not painted.

## Sheet 1: `art/raw/sym_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `sym/moth` | a fat grey moth with spread wings |
| 2 | `sym/candle` | a short dripping orange candle with flame |
| 3 | `sym/tooth` | a single cream molar tooth |
| 4 | `sym/key` | an old brass key with a heart-shaped bow |
| 5 | `sym/eye` | a green glass eyeball |
| 6 | `sym/mask` | a red paper carnival half-mask |
| 7 | `sym/crow` | a black crow head in profile |
| 8 | `sym/lantern` | a round paper lantern with a grinning face, glowing orange |
| 9 | `sym/crown` | a crooked gold paper crown with three points |

## Sheet 2: `art/raw/sym_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `sym/wisp` | a poison-green ghost flame with two dot eyes |
| 2 | `sym/sigil` | a blood-red wax seal stamped with a horned circle |
| 3 | `sym/ash` | a small grey ash pile with one orange ember |
| 4 | `ui/coin` | a brass coin stamped with a moth |
| 5 | `ui/wick` | a coiled black candle wick with a glowing tip |
| 6 | `ui/wax` | a cream lump of candle wax with a thumbprint |
| 7 | `ui/heat` | a small orange flame shaped like a teardrop |
| 8 | `ui/luck` | a cream wishbone |
| 9 | `ui/lock` | a brass padlock, closed |

## Sheet 3: `art/raw/charm_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/moth_jar` | a glass jar with one moth inside |
| 2 | `charm/moth_wing` | a single torn moth wing |
| 3 | `charm/cocoon` | a silk cocoon hanging on a twig |
| 4 | `charm/moth_net` | a small butterfly net |
| 5 | `charm/matchbox` | an open matchbox with three matches |
| 6 | `charm/coal` | a glowing lump of coal |
| 7 | `charm/bellows` | a pair of leather bellows |
| 8 | `charm/torch` | a burning wooden torch |
| 9 | `charm/brazier` | a small iron brazier with fire |

## Sheet 4: `art/raw/charm_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/rag_doll` | a stitched rag doll with button eyes and one pin |
| 2 | `charm/black_cat` | a black cat sitting, arched tail |
| 3 | `charm/cracked_mirror` | a hand mirror with a cracked glass |
| 4 | `charm/rib_cage` | a small cream rib cage |
| 5 | `charm/crow_feather` | one black crow feather |
| 6 | `charm/abacus` | a wooden abacus with orange beads |
| 7 | `charm/coin_purse` | a drawstring coin purse, plum cloth |
| 8 | `charm/ledger_book` | a thick closed ledger book with a brass corner |
| 9 | `charm/clay_jar` | a round clay savings jar with a coin slot |

## Sheet 5: `art/raw/charm_c.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/stamp` | a wooden rubber stamp with red ink |
| 2 | `charm/quill` | a black feather quill pen |
| 3 | `charm/scroll` | a rolled paper scroll tied with red string |
| 4 | `charm/ink_bottle` | a squat ink bottle with a cork |
| 5 | `charm/claw_shake` | a red clawed hand held out for a handshake |
| 6 | `charm/red_ribbon` | a knotted blood-red ribbon |
| 7 | `charm/tea_cup` | a chipped tea cup with leaves at the bottom |
| 8 | `charm/crystal_ball` | a cloudy green crystal ball on a brass stand |
| 9 | `charm/star_card` | a fortune card showing one yellow star |

## Sheet 6: `art/raw/charm_d.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/comet` | a small yellow comet with a tail |
| 2 | `charm/horseshoe_nail` | a bent iron nail tied with green thread |
| 3 | `charm/spider_web` | a round spider web with a tiny spider |
| 4 | `charm/needle` | a sewing needle with red thread |
| 5 | `charm/shuttle` | a wooden loom shuttle wound with thread |
| 6 | `charm/knot` | a thick rope tied in a pretzel knot |
| 7 | `charm/wisp_bottle` | a corked bottle with a green flame inside |
| 8 | `charm/glow_jar` | a jar full of glowing green dots |
| 9 | `charm/prism` | a glass triangle prism with a green beam |

## Sheet 7: `art/raw/charm_e.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `charm/firefly` | one firefly with a glowing green tail |
| 2 | `charm/wrench` | a brass wrench |
| 3 | `charm/oil_can` | a small oil can with a long spout |
| 4 | `charm/gear` | a brass gear wheel with eight teeth |
| 5 | `charm/hammer` | a small claw hammer with a wooden handle |
| 6 | `charm/pliers` | a pair of iron pliers |
| 7 | `charm/scepter` | a short gold scepter with a red ball |
| 8 | `charm/throne` | a tiny crooked wooden throne |
| 9 | `charm/cushion` | a plum velvet cushion with gold tassels |

## Sheet 8: `art/raw/trick_a.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `trick/pin` | a big brass thumbtack |
| 2 | `trick/row_arrow` | a curled paper arrow pointing right |
| 3 | `trick/nudge` | a cream gloved hand with pointing finger |
| 4 | `trick/double_stamp` | a round red stamp reading as two tally strokes |
| 5 | `trick/swap` | two paper arrows crossing left and right |
| 6 | `trick/brush` | a paintbrush with a green tip |
| 7 | `trick/broom` | a short straw broom |
| 8 | `trick/hourglass` | a brass hourglass with orange sand |
| 9 | `trick/ice` | a melting ice cube |

## Sheet 9: `art/raw/trick_b.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `trick/chili` | one red chili pepper |
| 2 | `trick/pocket` | a sewn cloth pocket with a button |
| 3 | `trick/stencil` | a paper stencil with a moth-shaped hole |
| 4 | `trick/wish_coin` | a green coin with a hole in the middle |
| 5 | `trick/kit` | a small open tool roll with three tools |
| 6 | `trick/token` | a round wooden token with a spiral |
| 7 | `trick/horn` | a brass party horn |
| 8 | `trick/hand_mirror` | an oval hand mirror with a plum frame |
| 9 | `trick/loan_note` | a torn paper note with a red thumbprint |

## Sheet 10: `art/raw/deal.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `deal/coins` | a red claw holding a stack of three coins |
| 2 | `deal/power` | a red claw holding a lightning bolt |
| 3 | `deal/luck` | a red claw holding a wishbone |
| 4 | `deal/slot` | a red claw holding an empty picture frame |
| 5 | `deal/wild` | a red claw holding a green flame |
| 6 | `deal/time` | a red claw holding a pocket watch |
| 7 | `deal/shop` | a red claw holding a price tag |
| 8 | `deal/symbol` | a red claw holding a paper crown |
| 9 | `deal/mystery` | a red claw holding a sealed black envelope |

## Sheet 11: `art/raw/curse.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `curse/weight` | a black iron weight with a ring |
| 2 | `curse/candle` | a burnt-out candle stub with smoke |
| 3 | `curse/ash` | a grey ash cloud with red eyes |
| 4 | `curse/tax` | a coin with a bite taken out |
| 5 | `curse/price` | a price tag with a red arrow up |
| 6 | `curse/blind` | a blindfold with a stitched eye |
| 7 | `curse/chain` | three links of black chain |
| 8 | `curse/crack` | a cracked cream bone |
| 9 | `curse/fever` | a red thermometer about to burst |

## Sheet 12: `art/raw/ui_a.png` (3x3, cut to 256 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/btn_spin` | a big round orange push button with a brass rim |
| 2 | `ui/btn_bank` | a brass coin slot plate with an arrow down |
| 3 | `ui/btn_shop` | a striped paper shopping bag |
| 4 | `ui/btn_reroll` | two curled arrows forming a circle |
| 5 | `ui/btn_sell` | a paper price tag on a string |
| 6 | `ui/btn_settings` | a brass cog |
| 7 | `ui/btn_ad` | a paper film ticket with a play triangle |
| 8 | `ui/btn_close` | a red painted X |
| 9 | `ui/btn_stoke` | a round red button with a flame painted on it |

## Sheet 13: `art/raw/stake.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `stake/steady` | a brass balance scale, level |
| 2 | `stake/short` | a lit firecracker |
| 3 | `stake/wick` | a candle wick spool |
| 4 | `stake/long` | a crescent moon with a sleepy face |
| 5 | `stake/luck` | a wishbone with a green glow |
| 6 | `stake/double` | two paper masks, one happy one sad |
| 7 | `stake/shop` | a small striped market stall |
| 8 | `stake/cold` | a snowflake cut from paper |
| 9 | `stake/wild` | three green ghost flames in a row |

## Sheet 14: `art/raw/hide.png` (3x3, cut to 256 px)

| # | id | subject |
|---|---|---|
| 1 | `hide/cot` | a folding cot with a patched blanket |
| 2 | `hide/stove` | a small pot-belly stove with a kettle |
| 3 | `hide/shelf` | a crooked wall shelf with three jars |
| 4 | `hide/lights` | a string of paper lanterns |
| 5 | `hide/workbench` | a workbench with a vise |
| 6 | `hide/desk` | a writing desk with a ledger and candle |
| 7 | `hide/keepsake` | a small locked keepsake box |
| 8 | `hide/moth_house` | a wooden bird-house for moths |
| 9 | `hide/mirror` | a tall standing mirror with a plum cloth |

## Sheet 15: `art/raw/ui_c.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/rarity_common` | a cream paper tag, blank |
| 2 | `ui/rarity_uncommon` | a green paper tag, blank |
| 3 | `ui/rarity_rare` | an orange paper tag, blank |
| 4 | `ui/rarity_legendary` | a red paper tag with gold edge, blank |
| 5 | `hide/chair` | a red velvet armchair with small horns on the back |
| 6 | `ui/medal` | a brass medal on a plum ribbon |
| 7 | `ui/daily` | a tear-off paper calendar page with a moon |
| 8 | `trick/salt` | a salt shaker pouring salt |
| 9 | `trick/spare_candle` | a tall unlit cream candle |

## Sheet 16: `art/raw/ui_d.png` (3x3, cut to 192 px)

| # | id | subject |
|---|---|---|
| 1 | `ui/contract` | a long paper contract with a red ribbon |
| 2 | `ui/seal` | an empty round wax-seal ring, brass |
| 3 | `ui/slot_empty` | a dashed cream paper square frame, empty |
| 4 | `ui/favour` | a small green ribbon rosette |
| 5 | `ui/curse_badge` | a black paper badge with a horned skull |
| 6 | `ui/trick_bag` | a patched cloth sack with a drawstring |
| 7 | `ui/interest` | a brass coin with a small sprout growing from it |
| 8 | `ui/collect` | a red claw closing around a candle |
| 9 | `ui/star` | a yellow paper star |

## Sheet 17: `art/raw/chars_a.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `char/nim` | Nim: a determined young woman, short black bob, oversized plum coat, holding a paper lantern on a stick, bust portrait |
| 2 | `char/tao` | Tao: a lanky young man with messy hair, singed scarf, sheepish grin, holding a burnt match, bust portrait |
| 3 | `char/bua` | Auntie Bua: a round old fortune-teller, green headscarf, big brass earrings, holding a tea cup, bust portrait |
| 4 | `char/rattle` | Doc Rattle: a thin bone-setter in a long cream coat, round dark glasses, necklace of teeth, bust portrait |

## Sheet 18: `art/raw/chars_b.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `char/sok` | Old Sok: a stooped pawnbroker with a huge abacus on his back, tiny spectacles, bust portrait |
| 2 | `char/pip` | Pip: a tiny red imp apprentice with one broken horn, too-big bow tie, nervous smile, bust portrait |
| 3 | `devil/idle` | Mr. Brimble: a short pot-bellied red devil in a moth-eaten top hat and patched tailcoat, arms folded, bored look, full body |
| 4 | `devil/grin` | Mr. Brimble: same short devil, wide toothy grin, tipping his moth-eaten top hat, full body |

## Sheet 19: `art/raw/devil_b.png` (2x2, cut to 512 px)

| # | id | subject |
|---|---|---|
| 1 | `devil/angry` | Mr. Brimble: same short devil, steam from ears, stamping one hoof, full body |
| 2 | `devil/deal` | Mr. Brimble: same short devil, holding out a contract and a quill, one eyebrow up, full body |
| 3 | `devil/collect` | Mr. Brimble: same short devil, holding a candle snuffer over a small flame, calm smile, full body |
| 4 | `devil/shock` | Mr. Brimble: same short devil, hat flying off, mouth open in shock, full body |

## Singles

| file | id | size | magenta | subject |
|---|---|---|---|---|
| `art/raw/machine_case.png` | `machine/case` | 1024 | yes | front view of a rickety wooden fortune machine cabinet, tall portrait shape, a large empty dark window in the middle shaped 5 wide by 3 tall, brass pipes, a candle shelf on top, a moth-eaten curtain trim, a round button socket at the bottom, no symbols, no text |
| `art/raw/bg_fair.png` | `bg/fair` | 1024 | no | portrait background, a small night fair seen from the ground, striped tents in plum and blood red, strings of orange lanterns, a broken ferris wheel far away, fog, empty middle area, no characters, no text |
| `art/raw/bg_hideout.png` | `bg/hideout` | 1024 | no | portrait background, inside of an abandoned ghost-train carriage used as a home, bare wooden walls, one round window with a moon, empty floor space, no furniture, no characters, no text |
| `art/raw/bg_wagon.png` | `bg/wagon` | 1024 | no | portrait background, inside a cramped pedlar wagon, empty wooden shelves, hanging hooks, one candle, plum shadows, no characters, no text |
| `art/raw/bg_title.png` | `bg/title` | 1024 | no | portrait background, a fair gate at night with a crooked arch of lanterns, moths around the lights, a path leading in, top third empty dark sky, no characters, no text |
| `art/raw/ui_panel.png` | `ui/panel` | 512 | yes | a plain torn-edge cream paper rectangle with slightly darker painted border, empty, for use as a stretchable panel |
| `art/raw/ui_card.png` | `ui/card` | 512 | yes | a blank upright playing-card-shaped cream paper card with a thin brass painted frame and a small horn mark in each corner, empty middle |

Totals: 19 sheets, 156 sprites, 7 singles.
