# TECH — Small Luck Pier

Stack: three.js (orthographic 2D, sprites and shaders), Vite, Capacitor 8, plain JS (ES modules), no framework. Same layout and habits as `C:\Users\Admin\Desktop\Kuroka\msjelly`. Portrait only.

## 1. Folder layout

```
sans/
  index.html
  package.json            scripts: dev, build, preview, check, cap:sync, cap:android, cap:ios
  vite.config.js
  capacitor.config.json   appId com.kuroka.smallluckpier (placeholder), webDir dist
  docs/                   these files, originality.md, licenses/ (INDEX.csv + one folder per pack)
  art/raw/                ChatGPT sheets; art/_contact.png
  public/
    img/                  cut sprites and ink-mask atlases (ART.md), reel/case_rects.json
    sfx/                  .ogg + .m4a from itch.io packs (left out of the web demo build)
    music/                loops, if a pack is used
    privacy.html, manifest.webmanifest, icon.svg
  src/
    main.js               boot, screen router, glue between core, view, ui, audio
    save.js               load, save, migrate
    i18n.js               EN and TR strings, t()
    input.js              pointer to actions (tap, long-press, crank drag)
    core/                 pure logic, no DOM, no three.js, no Date, no Math.random
      rng.js
      data/symbols.js, trinkets.js, charts.js, events.js, unlocks.js, lines.js
      reel.js
      trinkets.js
      run.js
      shop.js
      meta.js
      daily.js
      econ.js
    view/                 three.js
      view.js, layout.js, palette.js, shaders.js, reel-view.js, particles.js, springs.js, home-view.js
    ui/                   DOM overlays
      ui.js, ui.css, shop.js (with trinket inspect), bag.js, ledger.js, home.js, album.js, track.js, store.js, settings.js, speech.js, share.js,
      runstart.js (first boot, free pick, chart pick), event.js (creditor intro, lamplight choice), daily.js, market.js, wardrobe.js
    audio/
      audio.js, sfx-map.js, synth.js, music.js, music-data.js
    services/             native bridges, each with a web stub
      ads.js, iap.js, consent.js, haptics.js
  scripts/
    check-core.mjs, check-content.mjs, check-econ.mjs, check-i18n.mjs, check-view.mjs,
    check-audio.mjs, check-art.mjs, sim-balance.mjs, smoke.mjs, shots.mjs, play-lib.mjs, cut-art.py
  qa/                     frames from shots.mjs
  store/                  listing text, screenshots, feature graphic
  android/, ios/
```

## 2. Modules and public functions

### core (pure, deterministic)

| Module | Responsibility | Public functions |
|---|---|---|
| `rng.js` | mulberry32 streams | `makeRng(seed)` -> `{next(), int(n), pick(arr), weighted(items, weights), fork(label)}`; `hashSeed(str)` |
| `data/*.js` | frozen tables from CONTENT.md | `SYMBOLS`, `TRINKETS`, `CHARTS`, `EVENTS`, `UNLOCKS`, `LINES` |
| `reel.js` | bag, draws, lines, specials | `makeBag(counts)`, `bagOdds(bag)`, `drawGrid(bag, rng, tide, spin, prevGrid, held)` (one rng fork per cell), `findLines(grid, held, ctx)` (a line of held cells only is not returned), `scoreSpin(grid, held, state)` -> `{lines, specials, trinketSteps, total, pairs}`, `findPairs(grid)` (cells to pulse after the spin; never used for timing) |
| `trinkets.js` | trinket hooks | `applyTrinkets(hook, state, payload)`; pay hooks: `onRunStart`, `onTideStart`, `onDraw`, `onLine` (flat adds and line multipliers), `onSpecial`, `onSpinTotal` (spin flat adds and spin multipliers), `onPeg`, `onTideEnd`, `onShop`, `onQuota`; rule hooks: `onPrice` (Pawn Ticket, Haggler's Cap, Lucky Ledger), `onRemoveToken` (Junk Cart), `onPegSupply` (Spare Peg, Laundry Day, Orhan's Watch, Bottle, Grandpa's Pegs), `onPegNeed` (Clothesline, Cliff Nest), `onHoldExpire` (Anchor), `onSpinsPerTide` (Orhan's Watch), `onColumnRespin` (Wishbone), `onMercy` (Second Wind). Pay hooks return typed steps (`lineAdd`, `lineMul`, `spinAdd`, `spinMul`), and `scoreSpin` applies them in the fixed order of GDD.md section 6, so shelf order cannot change a result. All 64 trinket specs are written as unit tests in `check-content.mjs` first; the hook list is frozen only when every spec fits a hook. |
| `run.js` | run state machine | `newRun({seed, installment, chartId, startTrinket, unlocked})`, `spin(run)`, `togglePeg(run, cell)`, `canPeg(run, cell)`, `useColumnRespin(run, col)`, `endTide(run)` -> `{paid, mercy, clutch, over}`, `enterLamplight(run)`, `runSummary(run)`, `runHash(run)` |
| `shop.js` | offers and services | `rollShop(run)`, `buyOffer(run, i)`, `sellTrinket(run, slot)`, `removeToken(run, symId)`, `reroll(run)`, `lockOffer(run, i)`, `priceOf(run, item)`, `SHOP_ODDS` (nominal roll), `effectiveOdds(run)` (what the shop screen prints) |
| `meta.js` | planks, boathouse, album, track, installments | `grantRunRewards(save, summary)`, `canBuild(save, id)`, `build(save, id)`, `unlockedPool(save)`, `albumProgress(save)`, `trackStep(save)`, `advanceInstallment(save)`, `tier(c)` |
| `daily.js` | seeds and calendar | `dailySeed(dateStr)`, `dailySetup(dateStr)` and `weeklySetup(isoWeek)` (both return the fixed pool, the fixed start trinket, the chart and the creditor, so unlocks never change the run), `streakUpdate(save, dateStr)`, `marketActive(dateStr)` |
| `econ.js` | every tunable number in one place | `QUOTA(t, c)`, `PRICES`, `SPINS_PER_TIDE`, `PEGS_PER_TIDE`, `MERCY_GAP`, `PLANKS`, `AD_CAPS` |

Rules: core never reads the clock; `main.js` passes the date string in. Every random choice goes through an rng passed as an argument.

### view

| Module | Responsibility | Public functions |
|---|---|---|
| `view.js` | renderer, ortho camera, resize, frame loop | `initView(canvas)`, `resize()`, `setScreen(name)`, `tick(dt)` |
| `layout.js` | portrait layout rects from width and height; desktop: 9:19.5 column centered on a paper-colored page | `computeLayout(w, h)` |
| `reel-view.js` | reel strips, pegs, win lines | `setGrid(grid)`, `playSpin(result, opts)` -> Promise, `showPegs(cells)`, `pulseCells(cells)`, `playLines(lines)`, `skip()` |
| `home-view.js` | boathouse diorama: `home/base` plus one overlay sprite per build | `setBuilds(ids)` (layer visibility), `playBuild(id)` |
| `shaders.js` | riso pass on ink masks, strip blur, ink reveal, procedural sea strip | `risoMaterial(maskTex, palette)`, `stripMaterial(atlas)`, `inkLineMaterial()`, `seaMaterial()` |
| `particles.js`, `springs.js`, `palette.js` | coins, fish, squash and stretch, colors | as in msjelly |

### ui, audio, services

| Module | Responsibility | Public functions |
|---|---|---|
| `ui/ui.js` | HUD, router for DOM screens, coach marks | `initUi(handlers)`, `showScreen(name, data)`, `updateHud(run)`, `toast(key)` |
| `ui/speech.js` | Deni and Orhan bubbles, line picker with no-repeat | `say(who, trigger, vars)` |
| `ui/share.js` | 1080x1920 card on a 2D canvas, native share sheet | `renderShareCard(summary, lang)` -> Blob, `shareCard(blob)` |
| `audio/audio.js` | WebAudio graph, sample player, pitch ladder, ducking | `initAudio()`, `play(id, opts)`, `playStep(n)`, `setMusic(state)`, `setVolumes(v)` |
| `audio/synth.js`, `music.js`, `music-data.js` | fallback synth and generative music | as in msjelly |
| `services/ads.js` | AdMob wrapper with caps | `initAds()`, `showRewarded(placement)` -> `{rewarded}`, `maybeShowInterstitial(ctx)`, `rewardedReady(placement)` |
| `services/iap.js` | products and entitlements | `initIap()`, `getProducts()`, `buy(id)`, `restore()`, `owns(id)` |
| `services/consent.js` | UMP and ATT | `ensureConsent()` -> `{personalized}` |
| `services/haptics.js` | `@capacitor/haptics` | `tick()`, `thud()`, `success()` |

On the web (dev, QA shots, itch demo) every service resolves to a stub: rewarded ads grant at once, interstitials never show, purchases succeed from a debug menu.

## 3. Save format

Storage: `@capacitor/preferences` on Android and iOS (native key-value storage, which the system does not clear under storage pressure the way it can clear WebView `localStorage`). `localStorage` is the fallback on the web only. Key `slp.save.v1`, JSON.

When it is written:
- on every SPIN tap, after the grid is drawn and before the animation starts;
- on every peg change;
- on every shop action;
- at tide end and on every meta change.

So a killed app resumes at the same spin with the same result, and closing the app cannot re-draw a spin. `save.js` exports `loadSave()`, `writeSave(save)`, `migrate(save)`, `resetSave()`, `exportCode(save)`, `importCode(str)`.

There is no cloud save in v1.0. Settings has "Export save" (a text code to copy, with a checksum) and "Import save". Weeks of boathouse and album progress must not depend on one device store. A restore of purchases alone does not bring back progress, and the settings text says so.

```json
{
  "v": 1,
  "lang": "tr",
  "settings": { "sfx": 1, "music": 0.6, "haptics": true, "turbo": false, "reducedMotion": false },
  "planks": 42,
  "installment": 3,
  "builds": ["roof", "stove"],
  "album": { "trinkets": { "salt_barrel": 2 }, "symbols": ["pebble"], "postcards": [1, 4], "stamps": ["auditor"] },
  "track": { "xp": 37, "claimed": 4 },
  "cosmetics": { "owned": ["skin_brass"], "reel": "skin_brass", "hat": null },
  "daily": { "date": "2026-11-16", "best": 412, "tries": 1, "streak": 3, "lastDone": "2026-11-15", "forgiveUsedWeek": "2026-W47" },
  "market": { "week": "2026-W46", "tides": 7, "claimed": [5] },
  "stats": { "runs": 12, "wins": 1, "bestTide": 6, "bestSpin": 88, "clutches": 3 },
  "ads": { "day": "2026-11-16", "rewarded": { "double": 1 }, "interstitials": 2, "lastInterstitialAt": 0, "runsSinceInterstitial": 1 },
  "iap": { "remove_ads": false, "starter_pack": false, "pier_keeper": false, "cos_reels": false, "cos_deni": false, "cos_harbor": false },
  "notes": 12,
  "firstRunBonus": true,
  "run": null,
  "tutorial": 3
}
```

`run` holds a live run (seed, bag, trinkets, jar, tide, spin, grid, held cells, shop visit and reroll index, kelp counter, flags) so a killed app resumes at the same spin. Entitlements in `iap` are a cache; the store is asked again on boot and on Restore.

## 4. Seeded rng

- One `mulberry32` per draw, forked from the run seed by a label. No stream is consumed in sequence, so a choice by the player can never shift a later draw:
  - reel cell: `fork('reel:' + tide + ':' + spin + ':' + cell)`. Holding a cell does not change what any other cell draws, on this spin or later ones. A Wishbone respin uses `'reel:' + tide + ':' + spin + ':' + cell + ':r'`.
  - shop offer: `fork('shop:' + visit + ':' + rerollIndex + ':' + slot)`. A reroll never shifts the reel or the next shop.
  - events: `fork('events:' + tide)`. Cosmetic: `fork('cosmetic')`, the only sequential stream.
- Normal run seed: `hashSeed(installId + ':' + runIndex)`. Daily Tide: `hashSeed('daily:' + 'YYYY-MM-DD')`. Sunday Market: `hashSeed('market:' + isoWeek)`.
- Daily Tide and Sunday Market use a fixed pool (the 22 start trinkets and the start symbols) and a fixed start trinket from `dailySetup` / `weeklySetup`, so two players get the same random number for every cell and every offer, whatever they have unlocked. `check-core.mjs` plays one daily seed with two different peg and reroll scripts and compares the raw draws.
- The Daily date is the device date in v1.0, so a date change on the device can replay or skip a day. Scores are local only. A server date check is required before the v1.1 leaderboard, and is the first task of that plan.
- The tutorial tide of the first run uses one fixed seed (GDD.md section 10). It goes through the same `drawGrid`; there is no special draw code.
- The grid for a spin is drawn in full when SPIN is tapped, before any animation. The view only plays it back.
- `cosmetic` stream drives quips and particles so they never touch outcomes.
- `runHash(run)` folds seed and every input; `check-core.mjs` replays recorded inputs and compares hashes.
- Draws depend only on the seed and the labels above, and the save is written before the animation, so closing the app cannot be used to re-draw a spin.

## 5. three.js scene plan

One `WebGLRenderer`, one `OrthographicCamera` in pixel units, `antialias: false`, device pixel ratio capped at 2. Layers by `renderOrder`: background, sea strip, reel case back, strips, case front (window mask), pegs, win ink, characters, particles. HUD and text are DOM above the canvas.

**Case and cells.** The cell rects are not assumed to be a perfect grid. `layout.js` reads the 9 measured window rects and the crank pivot from `public/img/reel/case_rects.json`, which `cut-art.py` writes when it keys the case's magenta window (ART.md section 5). Skins are palette swaps of the same mask, so the rects are the same for every skin.

**Reel strips.** Each of the 9 cells is its own short vertical strip (a quad with a shader that scrolls a column of symbol tiles from the symbol atlas). Cells, not whole columns, so a pegged cell can stand still while its neighbors turn. The three cells of a column share timing.

**Spin.** On tap: unpegged strips get scroll speed `v` (uniform `uScroll` advanced per frame), with vertical blur by sampling the atlas 5 times along the scroll direction scaled by speed. The crank is one sprite rotated in code around its pivot (pivot from `reel/case_rects.json`); there are no crank frames.

**Stop.** At the column's stop time the strip is re-seeded so the result tile is the next to arrive, then eased with an overshoot spring (8 px past, back in 90 ms). A 2 px camera shake and a clack per column. Stop times: 0.50, 0.75, 1.00 s (halved in turbo).

**No near-miss slow-down.** Stop times never depend on the grid. There is no delay, tick, haptic or animation for two of a kind or for a miss. After the spin has fully stopped and paid, `findPairs(grid)` gives the cells that pulse once to invite a peg. A held pair that completes plays the peg-hit beat (peg snap, ink sweep, `haptics.success()`), which follows the result and does not delay it. `check-view.mjs` asserts that `playSpin` uses the same stop times for a set of grids with and without pairs.

**Win lines.** A quad from the first to the last cell center with `inkLineMaterial`: a coral brush texture revealed left to right by a `uReveal` uniform over 0.18 s, multiply blend so it overprints the symbols. The three cells squash and stretch (springs), value text pops in DOM, coins spawn as particles and arc to the jar on a quadratic curve.

**Riso pass.** Sprites are not stored as flat color. `cut-art.py` writes each sprite as an ink mask: R = navy line, G = coral, B = teal, A = mustard coverage, with a second small atlas for blush and for the sprite's alpha (ART.md section 5). `risoMaterial(maskTex, palette)` samples each ink channel with its own 1-2 px offset (fixed per sprite from a hash, so it does not shimmer), colors it from the palette uniform, multiplies the inks so overlaps darken as in a print, then multiplies by a tiling paper grain texture and a sparse ink-skip noise mask. Because color comes from the palette uniform, a reel skin is a different palette on the same mask, not a new painting. One shared material per atlas.

**Big win.** 80 ms pause of the tick, camera roll 3 degrees and back over 0.5 s, lantern sprites switch to lit in sequence, fish particles from the crank.

**Home.** `home/base` holds the finished ground and pier. The boathouse is `home/boathouse_base` (the wreck) plus 11 transparent overlay sprites, one per build, all cut on the same 900x900 canvas so they register without offsets. `setBuilds(ids)` turns layers on. A build plays as its overlay stamped down with a paper wobble. The sea strip is procedural (`seaMaterial`), and a gull uses one sprite with a wing flap by vertex squash.

**Jar and coins.** One jar sprite and three coin-pile overlays, switched by fill level. No full jar frames.

**Performance budget.** Under 60 draw calls on the game screen, 2 mask atlases of 2048x2048 (symbols and trinkets; characters and UI) plus the small blush/alpha atlases, no post-processing pass.

## 6. Audio plan

Sound effects come from itch.io packs (not Kenney-style stock). Search words on itch.io: "paper foley", "wooden mechanical foley", "ratchet", "hand-made UI sounds", "harbor ambience", "seaside foley", "rubber stamp". Every id in `sfx-map.js` has a `synth.js` fallback so the game is never silent while packs are being picked.

**Pack research starts in M0, not M2.** No single pack will cover peg snaps, stamps, a brass-band phrase, a recorded "hm", a ship's bell and jar coins, so the set comes from several packs and has to be made to sound like one.

- `docs/licenses/INDEX.csv` is the id-to-pack list. Columns: `sfx_id`, `pack`, `url`, `price`, `license`, `commercial_use` (yes/no), `redistribution_in_web_build` (yes/no/unclear), `file_in_pack`, `receipt_file`. One row per sound id in the table below. The license text and the receipt of each pack are saved in `docs/licenses/<pack>/` before any file from it enters `public/`.
- `check-audio.mjs` asserts: every real file in `public/sfx` and `public/music` maps to a row; no row has `commercial_use` other than yes; an id with no row uses the synth fallback.
- Many pack licenses forbid making the raw files downloadable. A web build exposes every file in `public/`. So the itch.io web demo is built without `public/sfx` and `public/music` and plays the synth fallbacks only, unless a pack's row says `redistribution_in_web_build = yes`.
- To make packs match: every file is trimmed, loudness-normalized to -16 LUFS, high-passed at 80 Hz, and sent through one shared short room reverb in the WebAudio graph, so room tone comes from the game and not from each pack. Exported as .ogg (Android, web) and .m4a (iOS).
- Sounds that are unlikely to exist in a pack (`orhan_hm`, `orhan_cough`, the out-of-tune `run_win` phrase) are recorded by the owner or stay synth.

| id | When | Feel |
|---|---|---|
| `crank_pull` | SPIN tap | wooden ratchet, 3 dry clicks, heavy and old, 0.25 s |
| `reel_spin` | while strips turn (loop) | soft paper flutter, like a card in bicycle spokes, quiet |
| `reel_stop_1`, `_2`, `_3` | each column stops | paper-on-wood clack, each a little lower and louder than the last |
| `pair_pulse` | a matching pair pulses after the spin has stopped | one soft paper tap, quiet; not a tension sound |
| `peg_on` | cell pegged | crisp clothes-peg snap, spring twang under it |
| `peg_off` | cell unpegged or peg falls | lighter click, small wood rattle |
| `peg_hit` | pegged pair completes | peg snap plus one bright bell tap; "told you" |
| `line_ink` | win line drawn | wet brush swipe, 0.2 s |
| `pay_step` (8 pitches) | each pay item in a spin | soft marimba or glass tap on a rising scale (pitch ladder; reset each spin) |
| `coin_fly` | coins arc to jar | 2-3 thin metal flicks, light |
| `coin_jar` | coins land | coins dropping in a glass jar, warm |
| `trinket_tick` | a trinket triggers | small brass tap, short |
| `lantern_light` (5 pitches) | each lantern on the string lights | soft match-strike into a warm chime, rising |
| `big_win` | 40+ coins or 2+ lines | ship's bell, one clear ring with a long tail, plus paper rustle burst |
| `stamp_paid` | tide paid | heavy rubber stamp on a paper pad, deep thud |
| `orhan_hm` | Orhan reacts | low wordless grunt (a recorded "hm", not a spoken line) |
| `orhan_cough` | mercy | dry throat clear |
| `deni_blip` | Deni speech bubble | 2-note soft pluck, changes pitch by mood; no voice acting |
| `event_stamp` | creditor event intro | sharper stamp plus a small drum hit, official |
| `quota_fail` | run ends | lantern string dims: descending 3 soft notes, a ledger closing; gentle |
| `run_win` | tide 5 cleared | short brass-band phrase, 4 notes, a bit out of tune, warm |
| `shop_open` | shop slides in | canvas awning flap, wooden shutter |
| `buy` | purchase | coins on a wooden counter, one paper slide |
| `sell` | sell a trinket | reverse of buy, lighter |
| `reroll` | reroll | cards shuffled once on wood |
| `remove_token` | token removed | small stone plop in water |
| `deny` | cannot afford, cannot peg | soft double knock on wood, never a buzzer |
| `ui_tap` | any button | finger tap on thick paper |
| `ui_page` | screen change | page turn |
| `build_hammer` | build starts | three hammer hits on a plank |
| `build_done` | build finished | plank drop, a happy two-note whistle |
| `plank_gain` | Planks counted | wooden clack per plank, rising |
| `postcard` | album unlock | envelope open, paper slide |
| `streak` | streak day claimed | small bicycle bell |
| `amb_harbor` | game and home (loop) | calm water on wood, a rope creak, a far gull every 10-20 s, very low |
| `amb_night` | night sky strip, Lamplight (loop) | crickets, slow water, a moored boat knock |

Music: three short loops (home, run, Lamplight) with a warm small-band sound: nylon guitar or saz-like pluck, clarinet, hand drum, upright bass, at 90-100 bpm. Either one itch.io music pack with a commercial license, or the msjelly approach (`music.js` + `music-data.js` generative WebAudio). Decide in M3 after hearing the SFX in place. Music ducks 6 dB under `big_win` and speech. Music off by default if another app is playing audio.

## 7. i18n

- `src/i18n.js`: `STRINGS = { en: {...}, tr: {...} }`, `t(key, vars)`, `setLang(code)`, `plural(n, key)`. Language from the device on first boot (tr if the device language starts with "tr", else en); switch in settings.
- Keys: `ui.*`, `sym.<id>`, `trinket.<id>.name`, `trinket.<id>.short`, `trinket.<id>.desc`, `chart.<id>.*`, `event.<id>.*`, `build.<id>.*`, `line.<who>.<trigger>.<n>`, `story.<n>.<a|b>`, `postcard.<n>`, `note.<n>`, `store.<id>.*`.
- Trinket descriptions use variables from `econ.js` and the data tables (`{n}`), so a balance change never leaves stale text.
- Turkish needs: dotted and dotless i (`toLocaleUpperCase('tr')` for any caps), longer words (buttons sized for TR first), number format `1.234`.
- Fonts: one display face with full Turkish glyphs and a hand-printed look, plus a system fallback. Check ğ, ş, ı, İ, ö, ü, ç in QA frames.
- `check-i18n.mjs`: same key set in EN and TR, no empty value, every data id has name, short text (at most 8 words in EN) and full desc, every `{var}` exists in both languages. Word rules: the listing files in `store/` are tested against the STORE.md section 4 table (with "real-money" and "prizes" allowed only in the Fair play paragraph); in-game strings are tested against the shorter in-game list.

## 8. Capacitor plugins

| Need | Plugin | Notes |
|---|---|---|
| App lifecycle, back button | `@capacitor/app` | as in msjelly |
| Haptics | `@capacitor/haptics` | as in msjelly |
| Share card | `@capacitor/share` + `@capacitor/filesystem` | write PNG to cache, share the file |
| Ads | `@capacitor-community/admob` | rewarded, interstitial, UMP consent, ATT request. Confirm the release that supports Capacitor 8 before M5. |
| IAP | `@revenuecat/purchases-capacitor` (first choice) or `cordova-plugin-purchase` | Non-consumables and restore. RevenueCat creates a persistent anonymous app user ID, so purchases are "linked" in the privacy forms and RevenueCat is listed as a processor (STORE.md section 5 is written for this choice). The cordova plugin does not; if it is chosen, STORE.md section 5 is filled again. Confirm Capacitor 8 support. |
| Save | `@capacitor/preferences` | native key-value store for the save (section 3) |
| Analytics | `@capacitor-firebase/analytics` | retention and funnel events only, off until consent where consent is required; in the privacy forms |
| Crash reports | `@capacitor-firebase/crashlytics` | crash-free rate for the soft-launch gate; in the privacy forms |
| Status bar, splash | `@capacitor/status-bar`, `@capacitor/splash-screen` | paper-colored bars |

AdMob setup: test ad unit ids in debug builds; real ids from env at build time; sensitive categories "Gambling and betting" and "Social casino games" blocked in the AdMob console; max ad content rating set to match the store rating; `tagForChildDirectedTreatment` false, app not in Families.

Ad caps live in `core/econ.js` (`AD_CAPS`) and are enforced in `services/ads.js` against `save.ads`, so `check-econ.mjs` can test them without a device.

## 9. Checks

`npm run check` runs, in order:

| Script | Asserts |
|---|---|
| `sim-balance.mjs --fast` | the 19 asserts in ECONOMY.md section 6 (full run without `--fast` before each release) |
| `check-core.mjs` | line finding on hand-made grids (all 8 lines, wild cases, three Knots); peg rules: 3 held at once, free to move, a line of held cells only pays 0, a paid line held for a whole tide pays 0 from the hold, held adjacency pairs pay 0, Bottle and Kelp do not fire when held; pay order (flat line adds, line multipliers, specials, spin adds, spin multipliers, one ceil) gives the same total for every shelf order; copy caps and bag minimum 10; mercy; quota math for tides 1-20 against the GDD table and tier math (tide 1 never multiplied); determinism by run hash; two peg and reroll scripts on one daily seed give the same raw draws; save and resume mid-tide gives the same next spin |
| `check-content.mjs` | 16 symbols, 64 trinkets, 12 charts, 8 events, 15 unlocks; unique ids; prices match grade; every trinket unit-tested on one fixed grid with its expected pay; every trinket maps to a hook in the frozen list; grade value test (ECONOMY.md section 6) |
| `check-econ.mjs` | Planks formulas (clutch = quota reached on the last spin; first-run +10 once), boathouse total 1,035, track step costs, ad caps (7 rewarded per day, interstitial rules), nothing in the IAP table or the rewarded table grants coins, spins, pegs or trinkets; no unlock of a game mode costs Planks |
| `check-i18n.mjs` | section 7 |
| `check-view.mjs` | layout rects inside the screen at 360x640, 390x844, 430x932, 768x1024, 1440x900; SPIN button in the bottom third; no rect overlap; cell rects come from `case_rects.json`; stop times are the same for grids with and without pairs |
| `check-audio.mjs` | every id in `sfx-map.js` has a file or a synth fallback; every real file maps to a row in `docs/licenses/INDEX.csv` with commercial use allowed; the web demo build contains no pack file without a redistribution yes; no clipping in rendered fallbacks |
| `check-art.mjs` | every generated file in the ART.md asset list exists at its size; overlays share the base canvas size; the case window rect is the same for every skin; sprite count per sheet matches the name list |
| `smoke.mjs` | headless boot, play one scripted run to the end with no console error |

## 10. QA frames

`scripts/shots.mjs` (same approach as msjelly): one headless Chromium with GPU, muted, drives the Vite preview build through `window.__qa` hooks, writes PNGs to `qa/`. One browser at a time. Frames decide, not logs.

Matrix: 2 sizes x 2 languages x 19 states = 76 frames (the soft-launch build skips the 3 states it does not contain: Sunday Market, wardrobe, share card).

- Sizes: phone 390x844 (DPR 3) and desktop 1440x900.
- Languages: EN and TR (`?lang=tr`).
- States: cold open with coach mark; mid-spin; pair pulse after a miss; pegged pair; win line with coins; clutch PAID stamp; creditor event intro; shop; trinket inspect; bag and odds; run end (loss, with margin note); lamplight choice; home with boathouse stage 0 and stage 11; album; Daily Tide result; Sunday Market; wardrobe; store screen; share card.

QA reviewers (Haiku agents) get the frames and a checklist: text fits and is not clipped in TR, Turkish letters render, thumb zone holds SPIN, nothing glossy, palette only, odds visible on the bag screen, no banned listing word, desktop frame is a centered portrait column with no stretched art.

`scripts/play-lib.mjs` gives scripted inputs (`spin`, `peg`, `buy`, `nextTide`) for smoke and shots, with a fixed seed.
