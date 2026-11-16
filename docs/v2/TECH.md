# TECH v2

Stack is unchanged: three.js orthographic 2D, Vite, Capacitor, plain JS ES modules, portrait, one thumb. Languages: en, tr, th.

Rule for the whole core: pure functions over a plain `run` object. No clock, no `Math.random`, no DOM, no three.js in `src/core`. Everything random goes through `src/core/rng.js`.

## 1. Keep, rewrite, delete

| path | action |
|---|---|
| `src/core/rng.js` | keep as is (`makeRng`, `fork`, `weighted`, `int`, `pick`) |
| `src/audio/*`, `public/sfx/*` | keep. Add map entries in `sfx-map.js` for: stoke, scorch, sigil, deal_sign, deal_refuse, stamp_paid, trick_use, curse_gain |
| `src/services/*` (ads, iap, consent, haptics, platform) | keep. Change the rewarded grants to `shop_reroll` and `double_wax`. Interstitial only after a run |
| `scripts/cut-art.py` | keep. It writes `public/img/<id>.png` and `public/img/manifest.json` (ART_LIST.md says `public/art`; the script is right) |
| `scripts/shots.mjs` | keep the approach (headless, muted, one GPU browser, desktop-wide and tr/th frames). Update the screen list |
| `.github` Pages workflow, `vite.config.js`, `capacitor.config.json` | keep |
| `src/view/springs.js`, `particles.js`, `shaders.js`, `palette.js` | keep. New palette values from ART_LIST.md |
| `src/view/layout.js`, `sprites.js`, `reel-view.js`, `view.js` | keep the ideas, rewrite for 5x3 (section 4) |
| `src/ui/dom.js`, `settings.js`, `store.js`, `speech.js` | keep |
| `src/save.js`, `src/i18n.js`, `src/input.js`, `src/main.js` | rewrite (save v2; i18n keeps only UI strings, item text comes from the JSON) |
| `src/core/reel.js`, `trinkets.js`, `econ.js`, `src/core/data/*` | delete |
| `src/core/run.js`, `shop.js`, `meta.js`, `daily.js` | rewrite |
| `src/ui/agegate.js`, `event.js`, `ledger.js`, `bag.js`, `album.js`, `runstart.js` | delete (replaced below) |
| `scripts/check-*.mjs`, `sim-balance.mjs`, `play-cli.mjs`, `smoke.mjs` | delete, replaced by `check-v2.mjs`, `sim-v2.mjs`, `play-cli.mjs` (new) |
| `docs/*.md` (v1) | leave; v1 is tagged `v1-pier` |

## 2. Data

- Source of truth: `scripts/gen-v2-data.py <outDir> <art/sheets.json>` writes `docs/v2/data/*.json`. It asserts counts, icon ids and cross-references.
- `npm run data` runs the generator, then copies the JSON to `src/data/`. The game imports from `src/data/` with Vite JSON imports.
- Files: `symbols`, `patterns`, `charms`, `deals`, `curses`, `tricks`, `stakes`, `contracts`, `characters`, `hideout`, `achievements`, `config`.
- Every list file is `{ "<name>": [ ... ] }`. Every `name` and `text` is `{en, tr, th}`.
- `{c:N}` in a text is replaced by `format(N * S)` at render time.

## 3. `src/core`

### `machine.js`
- `buildWeights(run, mods, favs) -> {ids, weights}`
- `pickFavourites(run, mods, rng) -> string[]`
- `rollGrid(run, mods, favs, rng) -> string[15]` (respects pinned cells, dead centre)
- `applyGridEdits(grid, edits) -> grid` (transform, place, trick edits; returns a new array)

### `patterns.js`
- `PATTERNS` (from JSON, with precomputed cell sets)
- `findPatterns(grid, mods) -> [{id, cells, sym, wisps}]` (wilds, `ashIsFav`, `maskWild`, `fiveNeedsFour`, then the "beats" filter)
- `cellsOf(id, placement)`, `zoneOf(cell) -> {corner, edge, midrow}`

### `effects.js`
- `snapshot(run) -> mods` (the modifier snapshot, order in EFFECTS.md section 4)
- `fire(run, trigger, ctx) -> events[]` (runs all rules for a trigger; mutates `run`; returns UI events)
- `checkCond(run, rule, ctx) -> boolean`
- `applyEffect(run, source, effect, ctx)`
- `scoreSpin(run, grid, favs, ctx) -> {patterns:[{id, cells, sym, value, symMult, patMult, pay, repeats}], sum, heatMult, allMult, total, flat, scorch, top3}`
- `flag(mods, name) -> value`

### `run.js`
- `newRun({seed, contractId, charId, meta, daily}) -> run`
- `phase(run) -> 'terms' | 'spin' | 'post' | 'shop' | 'deal' | 'pawn' | 'ended'`
- `termsOffer(run) -> stake[3]`, `pickTerms(run, id)`
- `stoke(run)`, `useTrick(run, pocket, target)`, `spin(run) -> spinResult` (rolls and stops at 'post' if a post trick is held), `collect(run) -> scoreResult`
- `bank(run, amount)`, `endRound(run) -> {interest}`
- `deadline(run) -> 'paid' | 'saved' | 'pawn' | 'collected'`, `pawn(run, charmIndex)`
- `summary(run) -> {debtsPaid, coins, wax, stats}`
- `scaleOf(run) -> S`

### `shop.js`
- `openShop(run) -> offers` (`{charms[], tricks[], bench[]}`; rarity odds by debt, family bias, unlock filter, locked offer carried)
- `price(run, item) -> {coins?, wick?}`
- `buyCharm(run, i)`, `sellCharm(run, slot)`, `moveCharm(run, from, to)`
- `buyTrick(run, i)`, `doBench(run, i, target)`, `buySlot(run)`
- `reroll(run)`, `toggleLock(run, i)`

### `deals.js`
- `offerDeals(run) -> deal[]` (no repeats in a run; avoids a curse already held when it can)
- `signDeal(run, id)`, `refuseDeals(run)`
- `addCurse(run, id | 'random')`, `removeCurse(run, id)`

### `meta.js`
- `newMeta() -> meta`
- `applyRunResult(meta, summary) -> {wax, newAchievements[], unlocks[]}`
- `checkAchievements(meta, stats)`, `buyHideout(meta, id)`
- `isUnlocked(meta, kind, id)`, `availableCharms(meta) -> ids`

### `daily.js`
- `dailySeed(dateUTC) -> string`, `dailySetup(seed) -> {charId, contractId:'c2', forcedTerms, curse}`
- `recordDaily(meta, date, summary)`

### RNG streams
`run.rng.fork(label)` with labels `spin`, `fx`, `terms`, `shop`, `deal`. A shop reroll never changes the next spin.

## 4. `src/view` (three.js, reuse the v1 patterns)

- `layout.js`: `computeLayout(w, h) -> {machine, grid:{x, y, cell, gap}, hud, charms, pockets, buttons}`. Grid is 5x3 inside the case window; cell size = min(window width / 5, window height / 3).
- `sprites.js`: atlas loader from `public/img/manifest.json`; `makeSprite(id)`. Same cut-paper wobble and paper-edge shader as v1.
- `reel-view.js`: five columns of three cells. `spinTo(grid, {pinned, fast})` stops columns left to right, 90 ms apart (40 ms in fast mode). `editCells(edits)` for tricks. `highlight(pattern, step)` draws the line in code (no painted lines).
- `score-view.js` (new): the three numbers per pattern, the total, the three contributor chips. Total time for a 4-pattern spin under 1.6 s; tap skips.
- `heat-view.js` (new): Heat meter, ash particles, the candle that burns down by round.
- `view.js`: scene, camera, resize, background, Brimble pose sprite (`devil/*`).

## 5. `src/ui` (DOM over the canvas)

`home.js` (hideout), `charselect.js`, `ladder.js` (contracts), `hud.js` (goal bar, purse, Wick, Luck, Favourite flag, charm row, pockets, STOKE, BANK, SPIN, COLLECT), `terms.js`, `shop.js` (tabs: charms, tricks, bench), `deal.js`, `paid.js`, `runend.js`, `board.js` (symbols and patterns), `sheet.js` (item detail), `collection.js`, `daily.js`, `settings.js`, `store.js`, `ending.js`, `tutorial.js` (scripted first run: fixed seed and a step list, GDD section 14), `speech.js` (Nim and Brimble lines).

## 6. Save format

One JSON blob in Capacitor Preferences (localStorage on web), key `pact.save`.

```json
{
  "v": 2,
  "meta": {
    "wax": 0, "hideout": ["cot"], "achievements": [], "chars": ["nim"], "contracts": ["c1"],
    "seenCharms": [], "endings": [], "keepsake": null,
    "stats": { "debtsPaid": 0, "interestTotal": 0, "dealsSigned": 0 },
    "daily": { "date": "", "best": null, "streak": 0, "done": 0 },
    "iap": { "noAds": false, "skins": [] },
    "settings": { "lang": "en", "sfx": 1, "music": 1, "haptics": true, "fast": false, "reduceMotion": false },
    "tutorialDone": false
  },
  "run": null
}
```

`run` (saved after every collect, bank, shop action and deal, so the app can be killed at any time):

```json
{
  "seed": "x", "rngState": { "spin": 0, "fx": 0, "terms": 0, "shop": 0, "deal": 0 },
  "contract": "c1", "char": "nim", "daily": false,
  "debt": 0, "round": 0, "spinsLeft": 0, "spinInRound": 0, "phase": "terms",
  "banked": 0, "purse": 0, "wick": 3, "heat": 0, "luckTemp": 0, "pity": 0,
  "charms": [ { "id": "moth_jar", "stack": 0, "counters": {}, "used": {} } ], "slots": 5,
  "tricks": ["nudge"], "pockets": 3, "stash": null, "pinned": [],
  "curses": [], "deals": [], "refused": 0, "perm": [], "bench": {}, "removed": [],
  "terms": null, "grid": null, "favs": [], "shop": null, "dealOffer": null,
  "flagsUsed": { "pawn": false, "extraLife": false },
  "stats": {}
}
```

- `rngState` stores how many draws each stream has made; on load the stream is rebuilt from the seed and advanced. (`rng.js` has no state export; add a draw counter in `run.js`, do not change `rng.js`.)
- A v1 save is ignored and replaced. v1 had no purchases to carry except `noAds`; copy that flag if the old key exists.

## 7. Checks

- `scripts/check-v2.mjs`: loads the JSON, asserts every rule uses only triggers, conditions, effects and flags listed in EFFECTS.md; runs the 13 worked examples from EFFECTS.md section 6 against `scoreSpin` and compares the numbers.
- `scripts/sim-v2.mjs`: greedy bot (buys the cheapest charm it can, Stokes to Heat 4, banks only at deadline, refuses deals), 300 runs of contract 1 and 100 of contract 3. Prints clear rate and coins per debt. Must finish in under 2 minutes.
- `scripts/play-cli.mjs`: text play of one run for debugging.
- `scripts/shots.mjs`: frames for run screen, terms, shop, deal, hideout at phone size and desktop-wide, in en, tr and th.

## 8. Build order for today

1. `patterns.js`, `machine.js`, `effects.js` with `check-v2.mjs` green on the 13 examples.
2. `run.js`, `shop.js`, `deals.js`, `play-cli.mjs`, then `sim-v2.mjs` and a first tuning pass on `config.json` and debts.
3. View: 5x3 reels, score view, HUD.
4. Shop, deal, terms screens.
5. Meta: hideout, characters, ladder, achievements, daily.
6. Tutorial script, speech lines, shots.
