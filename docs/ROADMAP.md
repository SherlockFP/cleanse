# ROADMAP — Small Luck Pier

Milestones M0-M7. Each task has a verify step. "Builder" tasks suit Sonnet agents, "QA" tasks suit Haiku agents. ChatGPT art prompts are sent from the main session only. One headless browser at a time for frames.

Lanes that can run in parallel from M1 on: **Core** (src/core + checks), **View** (three.js), **UI** (DOM + i18n), **Art** (main session + cutter), **Audio**, **Store/Legal** (owner).

## Scope and time

The full v1.0 list (64 trinkets, 12 charts, 8 events, 12 installments, about 250 sprites, 19 screens, two native platforms) does not fit one developer plus agents before a first release. The first release is **v1.0-lite** (GDD.md section 13): 35 trinkets, 12 symbols, 6 charts, 4 events, installments 1-6, 6 boathouse builds, Daily Tide, Android only. The rest ships as monthly drops after launch. Sunday Market, Harbor Ledger, cosmetic packs, wardrobe and the share card are built only after soft-launch data.

Estimates are working weeks for one developer with agents. They are guesses and are corrected at the end of each milestone.

| Milestone | Weeks | Running total |
|---|---|---|
| M0 Decisions and skeleton | 1 (the written answers may take longer; they block M2 art, not M1) | 1 |
| M1 Core rules and balance | 3 | 4 |
| M2 Playable reel and art gate | 3 | 7 |
| M3 Soul and meta (lite) | 3 | 10 |
| M4 Lite content complete and polish | 2 | 12 |
| M5 Android, money, store, soft launch | 3 (plus 2-4 weeks of soft-launch reading) | 15 |
| M6 Launch (Android) | 1 | 16 |
| M7 iOS, then monthly drops to full v1.0 | 2 for iOS; 1 week per monthly drop | |

If M1 or M2 runs over by more than half, cut lite content (charts and events first), not checks.

## M0 — Decisions and skeleton

| Task | Verify |
|---|---|
| Search the title in Google Play, App Store, USPTO, EUIPO, TürkPatent | Written note in `docs/title-check.md` with date and results; pick final title or a fallback |
| **Gate:** originality review against Balatro, Luck Be a Landlord and CloverPit, item by item from their wikis: loop, shop, vocabulary, all 16 symbol names and 64 trinket names, screen layout | `docs/originality.md` filled in and dated; every borrowed term renamed; any name clash changed in CONTENT.md |
| **Gate:** ask App Review whether a no-wager reel with no near-miss device is "simulated gambling: frequent", and read the AdMob policy for simulated-gambling apps | Both answers on file in writing; STORE.md section 2 updated; decision written down on whether a non-reel presentation is needed. Art (M2) does not start without this |
| Read the real IARC questionnaire and answer it on paper | Answers saved; expected rating in STORE.md section 2 replaced |
| Ask a Turkish lawyer the four questions in STORE.md section 3 (mechanic, title and wording, listing abroad, duties with primary texts named). Owner: the developer. Decision date: end of M1 | Written answer on file by the end of M1. With no written "yes", Turkey stays excluded for all of v1.0 and no later task waits for it |
| Check the simulated-gambling ad policy of each planned UA channel (Meta, TikTok, Google) | One line per channel in MONETIZATION.md section 6 |
| Start the sound pack research; create `docs/licenses/INDEX.csv` with one row per sound id (TECH.md section 6) | Every id has a candidate pack or is marked "synth" or "record"; license and web-redistribution columns filled for each candidate |
| Scaffold project by copying msjelly's config (package.json, vite, capacitor, scripts skeleton) | `npm run dev` shows a paper-colored canvas; `npm run build` passes |
| `core/rng.js`, `core/econ.js`, empty `scripts/check-core.mjs` wired into `npm run check` | `npm run check` exits 0 |

Parallel: title, originality, legal and store questions (owner) with scaffold (builder) and pack research (Audio lane).

## M1 — Core rules and balance (no graphics)

| Task | Verify |
|---|---|
| `core/data/*` from CONTENT.md (symbols, 22 start trinkets first) | `check-content.mjs` counts and id checks pass for the start pool |
| `core/reel.js`: bag, per-cell draw, 8 lines, wild, specials, pegs held at once, "held cells never pay on their own" | `check-core.mjs` hand-made grid cases pass, including the held-line and pay-order cases |
| **Peg playtest gate:** text-mode run in node (`scripts/play-cli.mjs`) with the start bag and no trinkets | Sim assert 17 passes (pegs add at least 40% to tide income) and a human says the peg choice matters on most spins. If not, change the peg rule or count now. No art before this passes |
| `core/run.js`: tides, quota, tier, jar, mercy, events hook, resume | Determinism and resume asserts pass; tide 1 quota is 15 at every installment |
| `core/shop.js` with the grade redraw rule and effective odds | Printed odds match observed frequency within 1 point over 1,000,000 offers, for the start pool and the full pool |
| All 64 trinket specs written as unit tests in `check-content.mjs` (tests first, no trinket code) | Every spec names its hook; a spec that fits no hook adds one. Only then is the hook list in `core/trinkets.js` frozen |
| `scripts/sim-balance.mjs` with five bots (no-build, random, greedy, bag-focus, lookahead) | Prints the per-tide table; asserts 1-5, 13-15 and 17-19 of ECONOMY.md pass after tuning; ECONOMY.md sections 2-4 replaced with sim output |
| The 13 lite trinkets beyond the start pool, 6 charts, 4 events | `check-content.mjs` unit tests pass for the lite pool; sim asserts 6-12 pass for the lite pool |

Parallel: trinkets by family (2 builders in lite: Hearth, and Tide + Pier Cat) once the hook list is frozen. The other 29 trinkets, 6 charts and 4 events are written in the monthly drops (M7) against the same tests. The Art lane does not start before the M0 gates and the peg gate pass.

## M2 — Playable reel on screen

| Task | Verify |
|---|---|
| **Art gate, three parts.** (1) Sheet A generated, cut to ink masks and shown in engine with the riso shader. (2) Sheet D (Deni, 8 poses): one pose cut and standing next to the reel in engine, and her face matching a sheet E portrait. (3) Boathouse: `boathouse_base` and the first overlay (roof) from the same base image, registered in `home-view`. Also measured here: the real pixel size ChatGPT returns for a "2048x2048" request | Owner looks at three phone frames and says yes or no to each. All three must be yes before any other sheet is made. A no on Deni or on the boathouse stops art, not only a no on the symbols |
| `view/layout.js`, `view.js`, `reel-view.js`: strips, stop, pegs, win ink; cell rects from `case_rects.json` | `check-view.mjs` passes; frames: mid-spin, pegged pair, win line |
| Pair pulse, peg-hit beat and big-win beat; no slow-down | Frame at pair pulse; `check-view.mjs` shows equal stop times for grids with and without pairs; grid before and after animation is identical in `smoke.mjs` |
| HUD: lantern string, Deni's clothesline as the peg counter, jar on her crate, spins, SPIN button (drawn in code), crank drag | Phone frame: all in the bottom third or top strip, nothing overlaps |
| Shop, trinket inspect and bag screens (DOM) | Frames EN and TR; odds percentages sum to 100; printed shop odds equal the effective odds |
| Synth fallback SFX for every id | `check-audio.mjs` passes |
| Tutorial tide (fixed seed, disclosed), staged reveal and coach marks | A new save reaches the first shop in under 60 s in `smoke.mjs`; the rules screen shows the tutorial note |
| Save through `@capacitor/preferences`, written on every SPIN tap and peg change; export and import code | Kill and resume mid-spin gives the same result; a code exported on one install loads on another |

Exit test: 5 people play run 1 with no help. At least 4 peg correctly by spin 3.

Parallel: View and UI lanes; after the art gate the Art lane does the lite subset of sheets B, C, D, E, F, G, H; Audio lane buys the first packs from INDEX.csv.

## M3 — Soul and meta (lite)

| Task | Verify |
|---|---|
| Deni and Orhan lines by trigger, `ui/speech.js`, with the "needs build" gate for neighbor lines | `check-i18n.mjs` parity; no line repeats twice in a row in a 200-spin smoke run; no line names a neighbor who has not moved in |
| Ledger screen, installment beats 1-6, tier; margin notes 1-18 on the run end screen | Play-script wins 6 installments with a debug bot; every beat shows once; a lost run still unlocks a note |
| Home screen and boathouse (base + 6 lite overlays), next build as the main button, neighbors with their jobs (Tekir on the case, Sevgi's shop) | Frames at stage 0, 3, 6; overlays register on the base |
| Planks (first-run +10 printed, clutch rule), Album, the postcards that lite content can reach | Album percent goes 0 to 100 in a debug save; `check-econ.mjs` Planks tests pass |
| Daily Tide with the fixed pool, streak with one forgiven day, Daily result screen | Clock-injected tests in `check-econ.mjs`: same date gives same seed; missed-day rule. `check-core.mjs`: two peg scripts, same raw draws |
| Lamplight (open after the first win, with its choice screen), Tide Charts pick, creditor event intro screen | Frames for each lite event intro; sim asserts 9, 11, 12 pass for the lite pool |
| Itch.io SFX in, music decision | Every real file has a row in `docs/licenses/INDEX.csv`; `check-audio.mjs` passes; owner listens once through a run and the packs sound like one set |

Not in M3 (after soft-launch data): Sunday Market, Harbor Ledger, wardrobe, share card, installments 7-12, builds beyond the lite 6.

Parallel: Core/meta (builder A), Home view and UI (builder B), writing EN+TR (builder C, owner reviews TR), Art sheets I, J, K (lite subset) and backgrounds, Audio.

## M4 — Lite content complete and polish

| Task | Verify |
|---|---|
| All lite art cut and in | `check-art.mjs` passes for the lite list; contact sheet reviewed against ART.md do/don't |
| QA frame matrix for the lite build (16 states x 2 sizes x 2 languages = 64 frames) | Haiku QA checklist passes on phone and desktop, EN and TR |
| Full `sim-balance.mjs` (100,000 runs per bot) on the lite pool | All 19 asserts pass; ECONOMY.md tables replaced with sim output |
| Settings, pause, reduced motion, turbo, haptics | Each toggle changes behavior in a frame or a log |
| Performance pass | 60 fps and under 60 draw calls on a mid-range Android phone; cold start under 3 s |
| Anti-slop pass on all UI text and art | No filler copy, no glossy sprite, palette only |
| Record 30 clips | Files in `store/clips/` |

Exit test: 10 new players. Median run 2:30-3:30. At least 6 start a second run without being asked. First win lands in runs 4-6 for most.

## M5 — Android, money, store, soft launch

| Task | Verify |
|---|---|
| Capacitor Android build, icons, splash, back button | Installs and runs on a real phone; resume mid-spin after kill |
| AdMob: rewarded and interstitial with caps, UMP, blocked categories | Test ads show at each placement; caps hold in a 20-run session (7 rewarded per day); no ad in session 1; console screenshot of blocked categories saved |
| IAP for soft launch: `remove_ads`, `starter_pack`, restore | Test purchases on license-tester account: each entitlement applies and survives reinstall plus restore |
| Firebase Analytics and Crashlytics behind consent | Funnel events arrive; nothing is sent before consent where consent is required |
| Privacy policy EN+TR, data safety form, IARC questionnaire, from the SDK list in STORE.md section 5 | Forms filled row by row from each vendor's disclosure page; policy URL live; the ratings the stores return are written into the STORE.md section 2 table |
| Listing EN (TR only with the lawyer's yes), 6 screenshots, feature graphic, preview video | `check-i18n` word-rule test on the finished listing text; assets at the listed sizes; store-metadata check: a peg in every frame, no minor with the reel (STORE.md checklist 17) |
| Closed test (volunteers: crash-free rate and first-run clarity only) | Crash-free rate and a note per tester on where they got stuck |
| Soft launch (Android, 2-3 countries, v1.0-lite) with the fixed 200-400 USD test budget on one network whose simulated-gambling policy was checked in M0 | 300 installs or more; D1, D7, rewarded per DAU and crash-free rate read against the gates in MONETIZATION.md section 6, with the confidence band written next to each number |

Parallel: Android native (builder A), store assets (Art lane + builder B), forms and legal (owner).

## M6 — Launch (Android)

| Task | Verify |
|---|---|
| Fix what soft launch showed (first run, meta pacing, ad rewards) | Gates met, or a written decision to launch anyway |
| Decide from soft-launch data which of Sunday Market, Harbor Ledger, cosmetic packs, `pier_keeper` and the share card get built, and in which order | Written list with one reason each |
| Web demo of 3 installments on itch.io with store links, 18+ notice and age confirmation, synth sounds only | Page live; demo cannot reach ads or IAP; the demo build contains no licensed sound file; without the age gate the demo is not published |
| Android release (all countries minus exclusions) | Live; rating as recorded in STORE.md |
| Clips: 1 per day for 30 days; 30 creator emails | Posting log |
| Featuring form on Google Play | Submitted |

## M7 — iOS and monthly drops to full v1.0

The development machine is Windows. Xcode needs macOS, so iOS is its own milestone after the Android launch, not a line inside M5.

| Task | Verify |
|---|---|
| Enroll in the Apple Developer Program (yearly fee) | Account active |
| macOS build path: a cloud Mac (GitHub Actions macOS runner or Codemagic) or a borrowed Mac | A signed build is produced from the repo with no local Mac |
| iOS build, ATT prompt, StoreKit, distribution through TestFlight | Runs on a real iPhone from TestFlight; ATT refusal still serves non-personalized ads; purchases restore |
| Apple privacy label and age rating from STORE.md | Submitted; returned rating written into STORE.md |
| iOS release | Live |
| Monthly drop (repeats): about 8 trinkets, 1 boathouse build with its overlay, 1 creditor or 2 Tide Charts, the next installments and margin notes | Unit tests and sim asserts pass for the new pool; art passes `check-art.mjs`; dominance check (assert 7) passes with the new trinkets |
| The systems chosen in M6 (Sunday Market, Harbor Ledger, wardrobe, share card), one per drop | Their screens pass QA frames; clock-injected tests pass |
| v1.1 plan: server date check, then platform leaderboards for Daily Tide | Written after 2 weeks of live data |

Full v1.0 (CONTENT.md) is reached after about 4 drops.

## Order and risk

1. M0 gates (originality, App Review and AdMob answers, title) can change the plan; get them first. Turkey has a decision date (end of M1) and a default (excluded), so it blocks nothing.
2. M1 before any art: if pegs do not add 40% and do not feel like a choice in the terminal, paint will not fix it.
3. The art gate in M2 has three parts: symbols, Deni, boathouse. The owner rejects glossy AI looks, and the characters and the home carry the soul, so all three must be approved before the other sheets are made.
4. Ads and IAP last. The game must be worth keeping without them.
5. Scope: ship lite, read the data, then build the rest. Nothing in the full list is built before soft launch unless lite needs it.
