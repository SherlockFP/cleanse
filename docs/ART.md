# ART — Small Luck Pier

> **Style changed on 2026-11-16 (owner's choice after a 4-style test, `art/raw/_style_compare.jpg`): gouache cut paper replaces riso print.** Reference sheet: `art/raw/style_B_gouache.png`.
> What this overrides below: the riso technique, the two-ink colour limit per class, the misregistration and ink-mask pipeline (section 5 point 4), the riso shader, and palette-swap skins. Sprites are now plain RGBA PNG files keyed from magenta. The asset list, sheet layouts, subjects, sizes and the magenta background rule still hold.
> New consistency line (replaces section 2): "Style: the same hand-painted gouache cut-paper style as the gouache sheet in this chat. Chunky, friendly, slightly exaggerated shapes with big clear silhouettes, each object cut out with a thin uneven cream paper edge. Opaque matte paint with visible dry brush strokes, two or three tones per object, a darker painted line only where needed, no black outlines. Palette: tomato red, sea teal, sunflower yellow, deep navy, warm cream, a little pink. No gradients, no glow, no gloss, no 3D render, no drop shadows, no text."
> Palette for UI and code (sampled by eye, to be measured from the cut sprites): cream `#F4EAD2`, navy `#22304F`, tomato `#D8452E`, teal `#2F8F8A`, sunflower `#EDB13C`, pink `#EFA7A0`.

Art is generated in ChatGPT from the main session (not from subagents), cut into sprites with `scripts/cut-art.py`, then checked by eye. Raw sheets live in `art/raw/`, cut sprites in `public/img/`.

## 1. Direction

**Technique:** two-ink risograph overprint with linocut key lines, printed on uncoated cream paper. Shapes are flat cut paper. Where two inks overlap they darken, as in a real print. Colors sit 1-2 px off the line (misregistration). Shading is halftone dots or carved hatch lines, never a gradient.

**Color limit per class** (navy key line and cream paper are free in every class):

| Class | Palette colors allowed besides navy |
|---|---|
| Symbols, trinkets, icons, stamps, Tide Chart cards | at most 2 |
| Characters (Deni, Orhan, neighbors) | at most 4 |
| Reel case, backgrounds, boathouse | at most 4 |

Only palette colors exist. There is no grey, green, yellow, brown or white ink: a pebble is teal with halftone, kelp is teal, a raincoat is mustard, a moustache is navy hatch, a tabby cat is mustard with navy stripes, white is bare cream paper. Materials are drawn, not rendered: glass, brass and water are flat shapes, and shine is one bare paper stripe, never a highlight or a reflection.

**Palette**

| Name | Hex | Use |
|---|---|---|
| Paper | `#F2E8D0` | ground, UI panels |
| Ink navy | `#1E2A44` | all key lines, text |
| Coral | `#E9573F` | win lines, SPIN button, Deni's scarf, stamps |
| Teal | `#2A9D8F` | sea, pegs, Orhan's window frame |
| Mustard | `#EBB447` | coins, lanterns, brass crank |
| Blush | `#F0A9A0` | skin, sky at dusk, overlap tint |

Overprint tones made in the shader, not painted: coral over teal `#6B4A4E`, mustard over teal `#7FA05A`, coral over mustard `#E0703A`. The shader can do this because each sprite is stored as ink masks, one channel per ink, not as flat color (section 5).

**Do**
- Thick, slightly wobbly carved outlines, 6-8 px at 256 px sprite size.
- Visible paper grain and small ink skips inside flat color.
- Simple readable silhouettes: every symbol must be clear at 96 px.
- Faces with dots and one line. Deni: an adult woman of about 20, adult proportions and height, short dark hair (navy), coral scarf, navy-and-cream striped shirt, teal rolled trousers, navy rubber boots, blush skin. She must never read as a child or a teenager.
- Leave generous flat margins between sprites on a sheet.

**Do not**
- Gradients, glow, bloom, lens flare, bevels, chrome, glass shine, drop shadows, 3D render look.
- More colors than the class allows (table above), or any color outside the palette.
- Material words in prompts that invite shine: "glass", "frosted", "brass", "golden", "shiny". Say the palette color and "flat" instead.
- Any child or teenager in a scene with the reel.
- Casino imagery: fruit, sevens, bars, chips, cards, dice, neon, gold frames.
- Text inside sprites (text is DOM, for EN and TR).
- Anime or mascot gloss, big shiny eyes.
- The look, characters or symbols of any existing game.

In engine, the paper grain, the 1-2 px misregistration and the overprint darkening are a shader pass over ink masks (`src/view/shaders.js`, TECH.md section 5). That is why sheets are asked for with clean flat color: the cutter separates the inks, and the print feel is added once, the same way everywhere.

## 2. Consistency line

Paste this as the last paragraph of every prompt, unchanged:

> Style: two-colour risograph print with hand-carved linocut outlines in dark navy #1E2A44 on cream paper #F2E8D0. Flat cut-paper shapes. Only these colours: coral #E9573F, teal #2A9D8F, mustard #EBB447, blush #F0A9A0, navy, cream. Slight colour misregistration of 1-2 pixels, visible paper grain, small ink skips, halftone dots for shading. No gradients, no glow, no gloss, no 3D, no drop shadows, no text, no letters, no watermark. Hand-made, imperfect, printed look. Aegean fishing harbour, warm and plain.

For sheets add this sentence before it:

> Sprite sheet on a perfectly flat solid magenta #FF00FF background, items arranged in an even grid with wide empty gaps, nothing touching, nothing cropped, each item centred in its cell, same scale, same line weight.

Magenta is not in the palette, so the cutter can key it out. After the first accepted sheet, attach it to every later prompt as the style reference.

What the generator does not do, and what the pipeline does about it:
- It does not hold an exact grid, an exact item count or exact hex colors. The cutter does not use the grid; it finds items by connected components (section 5), and the count is checked against the name list.
- Its output is smaller than asked. A "2048x2048" request is expected to return about 1024-1536 px. The real size is measured in the M2 art gate. Until then: sheets whose sprites must be 256 px use at most a 3 by 3 grid, and a sheet with more items is split into several prompts. If a cut sprite is under its listed size, it is upscaled 2x with nearest-neighbor on the ink masks (masks are hard-edged, so this is clean), and that step is logged in `art/_contact.png`.
- Asset sizes in section 3 are target sizes after that step, not sizes the generator is trusted to give.

## 3. Asset list

Sizes are the cut sprite size in pixels. All PNG with alpha unless noted. Every file in this table has a prompt in section 4. What has no prompt is in the "made in code" table below it, and `check-art.mjs` does not look for those files.

| File | Size | Where used | Prompt |
|---|---|---|---|
| `sym/pebble.png` ... `sym/storm.png` (16 files, ids from CONTENT.md) | 256x256 | reel cells, bag screen, shop token cards | A, B |
| `trinket/<id>.png` (64 files) | 192x192 | trinket shelf, shop cards, album | C1-C8 |
| `reel/case.png` + `reel/case_rects.json` | 1024x1100 | wooden reel case, game screen; the JSON holds the 9 measured window rects and the crank pivot | G1 |
| `reel/crank.png` | 256x512 | crank, one sprite rotated in code around its pivot | G2 |
| `reel/cell_paper.png` | 256x256 | cell backing, one per cell rect | G2 |
| `reel/peg.png`, `reel/peg_open.png` | 96x160 | clothes peg on a held cell, pegs on Deni's clothesline | G2 |
| `reel/stamp_paid.png`, `reel/stamp_late.png` | 512x256 | tide end, run end (the word is drawn by DOM over a blank stamp frame) | G2 |
| `deni/idle.png`, `lean.png`, `point.png`, `cheer.png`, `wince.png`, `shrug.png`, `hammer.png`, `tea.png` | 512x768 | game screen, home, run end | D |
| `deni/face_neutral.png`, `face_grin.png`, `face_flat.png`, `face_wide.png` | 192x192 | speech bubble | E |
| `deni/hat_*.png` (6) + `deni/anchors.json` | 256x256 | cosmetics; worn on the 4 face portraits and on the home `idle` pose only, placed by a head anchor per sprite in the JSON | E |
| `orhan/window.png` | 512x384 | sky strip | backgrounds |
| `orhan/idle.png`, `nod.png`, `stamp.png`, `cough.png`, `drawer.png` | 384x384 | sky strip, ledger screen | F1 |
| `npc/sevgi.png`, `cem.png`, `nermin.png`, `rifat.png`, `tekir.png`, `tekir_sleep.png` | 384x512 | home screen, creditor events, shop host, Tekir on the reel case | F2 |
| `fx/lantern_off.png`, `lantern_on.png` | 128x160 | lantern string, 5 per row | H |
| `fx/coin.png`, `coin_edge.png` | 96x96 | coin arcs, jar | H |
| `fx/jar.png`, `fx/coins_1.png`, `coins_2.png`, `coins_3.png` | 256x320 | one empty jar and three coin-pile overlays on the same canvas | H |
| `fx/gull.png` | 256x160 | clutch gull behind Orhan, home screen; the wing flap is done in code | H |
| `fx/fish_0.png` ... `fish_2.png` | 128x96 | big-win burst | H |
| `fx/ink_line.png` | 768x64 | coral win line (stretched, 9-slice) | H |
| `fx/plank.png` | 128x64 | Planks icon and fly-in | H |
| `bg/sky_day.png`, `sky_dusk.png`, `sky_night.png` | 1080x480 | sky strip | backgrounds |
| `bg/pier_game.png` | 1080x2400 | game background behind the case | backgrounds |
| `home/base.png` | 1080x2400 | home screen ground, sea, pier | backgrounds |
| `home/boathouse_base.png` | 900x900 | the wreck, stage 0 | J0 |
| `home/build_<id>.png` (11, ids from CONTENT.md section 5) | 900x900 each, same canvas as the base | one transparent overlay per build, composited over the base | J1-J11 |
| `home/decor_awning.png`, `decor_pots.png`, `decor_lights.png`, `decor_catbed.png` | 900x900, same canvas | `cos_harbor` decor overlays (made after soft launch) | J12 |
| `event/<id>.png` (8) | 384x384 | creditor event stamps | K |
| `chart/<id>.png` (12) | 256x256 | Tide Chart cards | K |
| `ui/icons.png` cut to 24 icons | 96x96 each | bag, pin, reroll, sell, settings, sound, music, haptics, album, ledger, daily, market, share, close, back, lock, check, ad, no-ads, peg, spin, coin, plank, info | I |
| `store/icon.png` | 1024x1024, no alpha | app icon | store art |
| `store/icon_fg.png` | 1024x1024 | Android adaptive icon foreground: the icon prompt on magenta, keyed | store art |
| `store/feature.png` | 1024x500, no alpha | Play feature graphic | store art |
| `store/shot_frame_1.png` ... `shot_frame_6.png` | 1290x2796 | screenshot frames | store art |
| `store/logo_en.png`, `logo_tr.png` | 1600x600 | title lettering (hand-carved, done last, checked by a human for spelling) | store art |

**Made in code, no image file and no prompt:**

| Thing | How |
|---|---|
| SPIN button, up and down state | flat coral shape with a navy outline in CSS or SVG, the riso grain as a shared texture; the label is DOM text. It is the most-tapped element, so its size and states are fixed in `ui.css`, not left to a generated image |
| Paper panel (9-slice) | CSS border and the grain texture |
| Shop card frames, 4 grades | CSS frame, with 1 to 4 small stamp marks for the grade; family ink color on the frame edge |
| Trinket frame shapes, 8 families | one SVG shape per family behind the icon (see sheets C) |
| Postcard frame, share card backing | CSS and canvas with the grain texture |
| Reel case skins (all of them; the list is in CONTENT.md section 5 and MONETIZATION.md section 2) | palette entries in `src/view/palette.js` on the same `reel/case` ink mask. No repaint, so the window rect cannot move |
| Sea strip | procedural in `shaders.js` (`seaMaterial`); a generated tile would not be seamless |
| Crank rotation, jar fill, gull wing flap | rotation, overlay switch and vertex squash in code |
| Adaptive icon background | flat coral |
| Boathouse stages | visibility of the build overlays in `home-view.js` |

Cut from v1.0: Deni outfits (they would need a redraw of all 8 poses) and hats on action poses.

## 4. Prompts

Each prompt ends with the sheet sentence (for sheets) and the consistency line. Ask for a square 2048x2048 image unless a size is given (the real output is smaller; see section 2). Generate each sheet 2-3 times and keep the one with the cleanest gaps. Every prompt names palette colors only, never a material that shines. Numbered lists are numbered in the prompt too, so a missing or merged item is easy to see.

**Sheet A — line symbols (9).**
"A 3 by 3 grid of nine game symbols, each a single object seen from the front, bold and simple: (1) a round beach pebble in teal with halftone dots; (2) a sardine fish in teal with a coral eye; (3) a small tulip-shaped Turkish tea cup on a saucer, drawn as a flat navy outline filled with coral, one bare paper stripe on its side; (4) an old oil hand lantern in mustard; (5) a seagull standing in profile, body left as bare cream paper, mustard beak; (6) a rounded shard in flat blush with one bare paper stripe; (7) a pocket compass in flat mustard with a coral needle; (8) a cormorant bird with wings half open in flat mustard with navy hatching; (9) a thick rope in mustard tied in a figure-eight knot."

**Sheet B — special and junk symbols (7).**
"A 3 by 3 grid with seven game symbols and two empty cells: (1) a folded fishing net in teal; (2) a small samovar in flat mustard; (3) a sitting street cat in mustard with navy stripes; (4) a strand of kelp seaweed in teal; (5) a corked bottle drawn as a navy outline with a blush fill and a rolled paper inside; (6) a cluster of barnacles on a stone in blush and navy; (7) a small storm cloud in solid navy with two carved rain lines."

**Sheets C1-C8 — trinkets (8 per sheet, one family per sheet, 64 total).**
"A 3 by 3 grid of eight small harbour objects and one empty cell, each a single object with one bold silhouette, drawn like stamped icons, all in [family colors] : [numbered list]."

Rules that keep 64 icons apart at 44-60 px on the shelf:
- One family per sheet and one fixed pair of ink colors per family. The family is also shown by a frame shape drawn in code behind the icon.
- One dominant silhouette per icon. No two icons in the game use the same object: there is one rope, one peg, one cart, one cup.
- One object per list entry. No "this / that" entries.
- The icon is never the only label: the name is shown on shop cards always, and on the shelf on tap or long-press (trinket inspect).

| Sheet | Family | Colors | Frame shape (code) | Numbered list |
|---|---|---|---|---|
| C1 | Catch | coral, teal | fish oval | 1 salt_barrel: salt barrel; 2 fish_cart: two-wheel hand cart with fish; 3 net_mender: net needle with thread; 4 fish_hook: fish hook; 5 ice_crate: slatted wooden crate; 6 pier_cat: cat on a bollard; 7 fish_scale: hanging balance scale; 8 full_net: bulging net sack |
| C2 | Hearth | mustard, coral | arch | 1 samovar_tap: tap with one drop; 2 lantern_oil: oil can with a long spout; 3 sugar_cube: stack of three sugar cubes; 4 warm_rug: folded rug with a zigzag; 5 grandmas_cup: flowered teacup with a handle; 6 hearth_stone: flat stone with a flame; 7 wick_trimmer: scissors; 8 tea_garden: round table with two stools |
| C3 | Sky | teal, blush | cloud | 1 kite: diamond kite with a tail; 2 bread_crust: bread crust; 3 weather_vane: rooster weather vane; 4 feather_duster: feather duster; 5 gull_whistle: tin whistle; 6 updraft: three curled wind lines; 7 cliff_nest: nest with one egg on a rock; 8 flock: three gulls flying in a V |
| C4 | Treasure | mustard, teal | hexagon | 1 magnifier: magnifying glass drawn as a ring with a handle; 2 coin_purse: drawstring purse; 3 chart_table: tilted desk; 4 pocket_map: folded map with a dotted path; 5 pawn_ticket: paper ticket with a punched hole; 6 cormorant_egg: one spotted egg; 7 divers_bell: diving bell; 8 golden_perch: bird perch on a stand |
| C5 | Knot | teal, mustard | ring | 1 spare_rope: coil of rope on a hook (the only rope icon); 2 fishing_line: fishing float; 3 mast: mast with a crossbar; 4 double_knot: wooden toggle through two loops; 5 anchor: anchor; 6 sailors_splice: marlinspike; 7 crossed_ropes: two crossed oars; 8 full_rig: small boat under full sail |
| C6 | Peg | coral, mustard | square with clipped corners | 1 spare_peg: one clothes peg (the only plain peg icon); 2 steady_hand: open hand; 3 brass_peg: peg clipped on a coin; 4 laundry_day: laundry basket; 5 clothesline: shirt on a line; 6 sticky_tar: tar bucket with a brush; 7 wishbone: wishbone; 8 grandpas_pegs: lidded tin with two carved marks |
| C7 | Tide | teal, coral | wave-top rectangle | 1 first_light: rising sun over water; 2 tide_table: card with rows of waves; 3 dry_spell: cracked dry mud; 4 night_tide: crescent moon over a wave; 5 lucky_sandal: one sandal; 6 slack_water: buoy on flat water; 7 orhans_watch: pocket watch with a chain; 8 second_wind: bellows |
| C8 | Ledger | blush, mustard | notebook page | 1 tin_cup: tin cup; 2 lucky_ledger: closed ledger book; 3 pebble_jar: jar of pebbles; 4 skipping_stone: flat stone with ripples; 5 hagglers_cap: flat cap; 6 junk_cart: pile of old chairs tied with string; 7 kelp_pot: kelp in a pot; 8 sea_chest: small chest |

After every C sheet, all cut icons are put side by side at 48 px on the contact sheet. Any two that can be confused at that size are redrawn.

**Sheet D — Deni poses (8), two prompts of 4.**
"A 2 by 2 grid of four full-body poses of the same character: an adult woman of about 20, adult height and proportions, short dark navy hair, coral scarf, navy-and-cream striped shirt, teal rolled trousers, navy rubber boots, blush skin. Poses: [four poses]. Same proportions and same face in every pose, dots for eyes, one line for the mouth."
- D1: standing idle with hands in pockets; leaning on a wooden box with one elbow; pointing forward; cheering with one fist up.
- D2: wincing with shoulders raised; shrugging; holding a hammer; holding a tea cup.
Attach the accepted D1 to D2. Reject the sheet if she reads as a child or a teenager in any pose.

**Sheet E — faces and hats.**
E1: "A 2 by 2 grid: four head-and-shoulder portraits of the same adult woman from sheet D (neutral, grinning, flat unimpressed, wide-eyed surprise), same head size and same head position in every cell." Attach sheet D1.
E2: "A 3 by 2 grid of six hats seen from the front at the same scale, each drawn empty with no head: fisherman's flat cap in navy; captain's cap in navy and mustard; paper boat hat in bare cream; straw hat in mustard; knitted beanie in coral; headscarf in teal."
There are no outfits. After cutting, the head anchor (top-of-head point and head width) of each face portrait and of `deni/idle` is written by hand into `deni/anchors.json`.

**Sheet F — Orhan and neighbours, two prompts.**
F1: "A 3 by 2 grid of five half-body drawings of the same man and one empty cell: a gruff heavy-set treasurer of about 65 with a moustache drawn in navy hatching, navy cardigan, round reading glasses, blush skin. (1) arms crossed; (2) small nod; (3) pressing a rubber stamp; (4) coughing into a fist; (5) opening a desk drawer."
F2: "A 3 by 2 grid of six figures: (1) a cheerful baker woman of 60 with a tray of simit rings; (2) a thin fisherman of 40 with a rope over his shoulder; (3) a strict woman auditor of 50 with a clipboard; (4) a short tax collector man with a leather satchel; (5) a street cat sitting upright, mustard with navy stripes; (6) the same cat curled up asleep." All adults.

**Sheet G — reel hardware, two prompts.**
G1 (the case alone, portrait 1024x1792): "One object only, centred, seen straight from the front with no perspective: a tall painted wooden fairground box with a small roof, chipped teal and coral paint, mustard trim. In its front is one large square opening divided by two vertical and two horizontal wooden bars into nine equal square windows. Every window is filled with perfectly flat solid magenta #FF00FF, the same magenta as the background. No crank, no handle, nothing inside the windows."
The windows are keyed to alpha together with the background, so the strips show through. The cutter measures the nine window rects and writes `reel/case_rects.json`; `layout.js` uses those rects and does not assume equal squares. Reject the case if a window is not a clean rectangle or if any window's sides differ by more than 6%.
G2: "A 3 by 2 grid of parts: (1) a crank handle in flat mustard, drawn upright with its round hub at the bottom centre; (2) one square of blank cream paper with a thin navy border; (3) a wooden clothes peg closed, teal; (4) the same clothes peg open; (5) a blank rectangular rubber-stamp frame with rough edges in coral; (6) the same frame in navy."

**Sheet H — effects, two prompts.**
H1: "A 3 by 3 grid of small flat items: (1) an unlit paper lantern; (2) the same lantern lit, mustard; (3) a coin seen from the front in mustard with a simple wave mark; (4) the same coin seen from the edge; (5) a seagull flying with wings level, body bare cream; (6), (7), (8) three small paper fish in different poses, teal and coral; (9) a wooden plank in mustard."
H2: "A 2 by 2 grid, each cell the same size with the object in exactly the same place: (1) an empty jar drawn as a navy outline with one bare paper stripe; (2) only a low pile of mustard coins, no jar, placed where the bottom of the jar would be; (3) only a middle pile of coins; (4) only a tall pile of coins." Plus one single image: "a long rough brush stroke of coral ink on flat magenta."
The gull carries no coin: there is no near-miss animation in the game.

**Sheet I — icons (24).**
"A 6 by 4 grid of 24 simple stamped icons in navy only: drawstring bag, map pin, two circular arrows, price tag, gear, speaker, music note, phone with motion lines, open book, ledger, sun over a wave, market stall, share arrow, cross, back arrow, padlock, tick, play triangle in a small screen, the same screen crossed out, clothes peg, crank, coin, plank, letter i in a circle drawn as a dot and a bar."

**Sheet J — boathouse: one base and 11 overlays.**
Separate generations of "stage 1, stage 2, ..." do not stay the same size, angle or position, so the stages would jump when a build lands. The boathouse is made the other way round: finished first, then taken apart.

- J-full (single image, square): "One small wooden boathouse on a pier, three-quarter view from the left, centred, on flat magenta: a finished harbour teahouse with a patched plank roof, a stove pipe with a curl of smoke, a cat basket by the door, a radio aerial on the roof, a small tea table outside on the right, a kite shed lean-to on the left side, rope coils under the eaves, a map table visible through the open door, a peg rack with a laundry line, a street lamp post beside it, a blank hanging sign with an awning." This image is the registration master. It is not shipped.
- J0 `boathouse_base`: image edit of J-full with the instruction "Keep everything exactly where it is: same size, same angle, same outline of the walls. Remove the roof, the stove pipe, the cat basket, the aerial, the tea table, the lean-to, the rope coils, the map table, the peg rack and line, the lamp post, and the sign with the awning. Show the bare walls as a wreck with no roof."
- J1-J11 `build_<id>`: one image edit per build, each starting from J-full: "Keep the picture exactly as it is. Replace everything with flat magenta #FF00FF except [the one build's parts]." Order and parts: roof (patched roof); stove (pipe and smoke); cat_basket (basket); radio (aerial); tea_corner (table and stools); kite_shed (lean-to); rope_loft (rope coils); map_table (table in the doorway); peg_rack (rack and laundry line); lamp_post (lamp post, with a second version lit); teahouse_sign (sign and awning).
- J12 decor overlays for `cos_harbor`: the same edit method on J-full with the added items (flower pots, string lights, cat bed; the awning is recolored).
- If the image-edit route does not hold the outline, the fallback is to cut the overlays by hand from J-full in an image editor. They still come from one image.

All 12 files are saved on the same 900x900 canvas with no cropping, so they register with no offsets. `home-view.js` shows the base and turns overlays on. Reject any overlay that does not line up with J-full within 2 px when laid over it, or whose line weight differs from the base.

**Sheet K — creditor stamps (8) and Tide Chart cards (12).** Two prompts.
"A 3 by 3 grid of eight round rubber-stamp emblems, coral ink, rough edges, one empty cell: a clipboard; a fog bank; three gulls; a postage stamp; a ferry clock; a leather satchel; a low tide line with mud; a moustache with glasses."
"A 3 by 2 grid of six small square weather cards: [six of: a high wave; a flat wave; a gull flock; a full laundry line; a single peg; a market stall; a thin sack; a pebble beach; a row of lanterns; a long shadow at sunset; a narrow shelf; a knotted rope]." Two prompts of six, in the order of CONTENT.md section 3, because 256 px cards do not survive a 4 by 3 sheet.

**Backgrounds (single images, portrait 1024x1792 unless noted).**
- `bg/pier_game`: "The end of a wooden pier in a small Aegean harbour seen straight on, calm sea behind, a few boats, laundry lines between two poles, empty space in the middle where a machine will stand, empty flat sky in the top fifth."
- `home/base`: "A small harbour shore seen from the water: a wooden pier on the right, a flat empty plot on the left where a boathouse will stand, low white houses and a hill behind, calm sea in the bottom third."
- `bg/sky_day`, `sky_dusk`, `sky_night` (landscape 1792x1024, cut to strip): "A wide strip of sky over harbour rooftops with one upper-floor window with teal shutters on the left and a string for lanterns hanging across, [midday / dusk with blush sky / night with navy sky and paper stars]."
- `orhan/window` (single image on flat magenta): "One upper-floor window seen from the front, open teal shutters, a cream curtain, a plain sill, the inside left as flat navy so a figure can be placed in it."

**Store art.**
- Icon (1024x1024): "App icon, square, full bleed, no rounded corners: a single wooden clothes peg clipped on a square paper tile that shows an oil lantern, coral background, thick navy outline, very simple, readable at tiny size."
- Adaptive icon foreground: the same icon prompt with "on flat magenta #FF00FF, the peg and tile only, with a wide empty margin", keyed to alpha. The background layer is flat coral from code.
- Feature graphic (landscape, cut to 1024x500): "Wide banner: on the left an adult woman of about 20 with a coral scarf clipping a clothes peg onto a painted wooden box with a 3 by 3 window of symbols, in the middle a string of lit paper lanterns over a pier, on the right a small boathouse, calm sea, large empty sky area in the upper middle for a title."
- Screenshot frames (6, 1024x1792): "A torn cream paper border with a wide empty rectangle in the middle (flat magenta #FF00FF) and an empty band at the top for a caption, small printed decorations in the corners: [1 pegs and lanterns / 2 lantern string / 3 trinkets / 4 planks and hammer / 5 rubber stamps / 6 gulls and a sun]."
- Logo: "Hand-carved linocut lettering, the words SMALL LUCK PIER stacked in three lines, navy with coral offset shadow of 2 pixels, on flat magenta." Repeat for the Turkish title only after the lawyer's answer fixes it ("KÜÇÜK ŞANS İSKELESİ" or "KÜÇÜK İSKELE", STORE.md section 3). Check every letter and the Turkish dots by eye; redraw in a vector tool if any letter is wrong.

Store art check before every submission: a clipped peg is visible, Deni reads as an adult, and no child or teenager appears with the reel (STORE.md checklist 17).

## 5. Cutting and checks

1. `python scripts/cut-art.py art/raw/sheet_a.png --key FF00FF --key-tol 40 --despill --pad 8 --class symbol --out public/img/sym --names pebble,sardine,...` (start from msjelly's `scripts/cut-art.py`; these flags are the target interface, add what is missing). There is no `--grid` flag.
2. **Key.** A pixel is background when it is within the tolerance of magenta in hue and has high saturation (roughly R > 180, B > 180, G < 90), not on an exact hex match. Blush `#F0A9A0` has G = 169 and stays well outside this range; the cutter asserts that no pixel inside a kept sprite was keyed if its G is above 120. After keying, despill: on edge pixels, pull magenta out of the color and keep the edge alpha. A purple fringe on navy lines is a reject.
3. **Find sprites by connected components**, not by grid cells. Components of the alpha mask are merged when closer than the pad, sorted in reading order (top to bottom by row band, then left to right), and named from `--names`. If the component count is not the name count, the cutter stops and writes nothing. Order and count are then checked by eye on `art/_contact.png`, which prints each name under its sprite.
4. **Ink masks, not flat color.** For each sprite the cutter classifies every opaque pixel (alpha above 0.9) to the nearest ink: navy, coral, teal, mustard, blush, or no ink (cream). It writes a mask PNG with R = navy, G = coral, B = teal, A = mustard coverage, and a second small PNG with R = blush and G = the sprite's alpha. Edge pixels (alpha 0.9 or less) are not snapped: they keep their soft alpha and take the ink of the nearest solid pixel, which avoids the speckle and fringe that a nearest-color snap gives on anti-aliased edges. Overprint tones in the source (two inks on one pixel) set both channels. The shader recolors, offsets and multiplies the channels (TECH.md section 5). Skins are a palette swap on the same mask.
5. **Size.** If a cut sprite is smaller than its listed size, upscale the masks 2x with nearest-neighbor and log it.
6. **Special cases.** `--class case`: key the windows with the background, measure the nine window rects and the crank hub, write `reel/case_rects.json`. `--class overlay`: no trimming, keep the full canvas so overlays register with the base.
7. Reject a sprite if: magenta fringe remains, more colors than its class allows (section 1) or any pixel that classifies badly to every ink, any gradient or glow, line weight differs from sheet A by more than 30%, the silhouette is unclear at 96 px (48 px for trinkets).
8. `scripts/check-art.mjs` asserts every generated file in the asset list exists at the listed size, overlays share the base canvas, and the window rect is the same for every skin palette.
9. Contact sheet `art/_contact.png` for one-look review after every batch.
