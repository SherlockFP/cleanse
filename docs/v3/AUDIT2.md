# AUDIT2: first-time mobile player pass (390x844, touch, fresh storage)

Build: `npm run build`, `vite preview`, one headless muted Chrome, throwaway profile, real touch events only (CDP `Input.dispatchTouchEvent`). `?debug=1` was read for state only, with three exceptions that are listed under "Where I was confused" (item 3). Frames: `docs/v3/audit2/*.png` (257 files). Console: zero errors or exceptions across the whole session.

Played: story, the 27-step tutorial, run 1 (died debt 3, night 2, 167 short), run 2 (died debt 3, night 2, 120 short), the map, Notebook (bought Second Stool), Lockers (opened locker 1), Home, How to play (by accident).

## Where I was confused

1. **The tutorial told me to do things the game would not let me do by tapping.** Step 4 (`004-game`, `005-tap1`, `006-tap-goal`): the caption says tap the goal bar, I tapped the hole, nothing happened, tap again, nothing. Three real taps on the spotlight (195,65) did not advance. Step 6 (`018-line`, `019-line2`): "tap the pattern" the same. Steps 6, 7, 8, 10 (and 15) all say tap the highlighted thing and the highlighted thing ignores real taps. I could only move on by calling `__pact.act('tutEvent','tap')`. The tutorial is hard-blocked for a real player. The overlay listens to `pointerup` on `.ui-col`, but the hole sits over the WebGL canvas (a sibling of `.ui-col`, not a child), so taps never reach it. Only steps whose target is a DOM button (stoke, kiosk, All, offer, buy, leave, terms, phone, red card, SIGN) advance for real. This is a showstopper for every new player. The hand also points at a spot where nothing lives.
2. **The lever.** Step 5 shows a hand dragging down on a thin strip at the right edge (x about 355). My 110 px drag (`008-lever-try`) sprang back with a rattle and nothing else. A 220 px drag also did nothing: the touch is cancelled (`pointercancel` fires about 100 ms in, I logged it), so a real finger-drag on the lever never completes. The only thing that worked was a plain TAP on the strip (`016-tap-lever`), which the caption never mentions ("Pull the lever down"). I found it by accident. The big red SPIN button at the bottom is the real affordance, yet step 5 punishes tapping it by dimming it behind the scrim.
3. **The tutorial can strand you.** After a reload at step 4 (`012-after-reload`) the scrim comes back with the same dead hole. I also had to call `__pact.goto('game')` once to dismiss a stuck open "goal" state (`013-unstuck`). Three debug-hook calls were needed in total: tutEvent to advance steps 6/7/8/10/15, `goto('game')` after the kiosk sheet (`036-s16`), and a `scrollTop` set to reach the buy buttons (see 4).
4. **The first stall is below the fold.** `041-nights`, `042-stall`, `043-tip`: step 18 points at "Small tip", step 19 says buy a charm, but the charms are 400+ px down a scrolling panel with no cue. `044-scroll`: a 400 px swipe scrolled nothing (scrollTop stayed 0 of 1172) because the panel scroll eats touch only with a scripted `scrollTop`. Real swipes on the stall did not scroll for me in the tutorial because the scrim blocks them. Brutal: step 19's target is off screen and the overlay does not scroll it into view.
5. **Mixed numbers everywhere.** Home says "Three nights. Sixty coins." (`m-02-home-top`), the first debt is 90 over 2 nights, How to play shows "40 / 80, Night 1 of 3" (`n-04-notebook`). A new player is told three different goals.
6. **What is SCORE?** After spin 1 of run 1 the buttons turned into a green SCORE and a greyed "SPIN / Score first" (`r1-01`). No caption, no reason. In the tutorial it was hidden ("the guided run teaches no tricks") so run 1 is where I met it, with an unspent trick I did not understand. I tapped SCORE, got the payout, never learned why the extra step exists. Nobody explains the nudge in a way I could use: I only used it in run 2 because the pocket icon is a hand glyph (`r2-07-trick`).
7. **"Debt covered. Finish the night or pay it now."** (`058-close`): the PAY NOW button lives inside the Kiosk sheet. On the machine screen there is no PAY NOW. The tutorial caption says "PAY NOW lights up when you can pay" (`059-kiosk-ready` shows it) but nothing on the machine lights up. I had to guess the Kiosk chip.
8. **Mild, Please** (`r2-35-game`): "You cannot Spice Up", yet the SPICE UP button stays bright orange and tappable-looking. Same screen still shows the previous night's coconut win lines on the new grid with "Red Eye 0.0%", so it looks like I already won tonight.
9. **Jargon with no hook:** "Calling Card weight +100%" (Neon Sign, `r2-30-shop`), "Wok", "Tuk-tuk", "Monsoon" tags with no explanation, "Red Eye", "Beads", "HONK", "Him or Me moments", "Neighbour becomes a Regular at Favour 7". Each shop card uses a tribe word before saying what it does.
10. **"Reroll 2.6"** (`r2-17-shop`): a fractional price on the reroll button. Wrong or at best unexplained.
11. **Run-end explanations are wrong or smug.** `r2-67-walk`: "24 spins without ever spicing up" when three nights barred spice ("Mild, Please"); "1 tricks never used" when I used the nudge in run 2 and had zero tricks left. "Nim: I read everything this time. It did not help." (I read nothing; the game never makes me read.) `r1-50-end`: "1 tricks never used" is also grammatically broken.

## What felt like progress

- The first real spin payoff with the coin purse climbing and Mr. Ruby heckling ("Lovely. Officially I did not see it.", `r2-09-score`). Voice is the best thing here.
- The bank/interest idea: banking 30 then seeing "+2 interest" (`033-all`) is a clear, tangible rule.
- Spice meter growing with "+60% pay" and the chip "short_fuse +11" (`r1-19b`): numbers move, you feel greedy. A coconut jackpot of 80, then 104 later, genuinely woke me up (`r2-24a`).
- The Tin favour dots (`065-done`) and Pip's one-liners give the stall a pulse.
- Unlocking and buying in the Notebook: stash 137 to 117 and an "Owned" flip with a toast (`n-13-buy`).
- Debt paid stamp (`r2-27-paynow`) is a satisfying beat.

## What felt shallow

- Every choice resolves to "pick the bigger number". Terms cards, tip, red/green calls: I never had a real dilemma. I never took a red call in run 2; I hung up on it and nothing changed.
- Run 1 and 2 both ended on debt 3 (boss) at night 2 and the lose screen is a stat list. No near-miss moment, no "so close" art, no "try this next".
- Run 1 had no charm worth owning (charm shelf empty on `r1-24b`: five empty slots, 0 coins). Run 2 bought two charms and I felt zero difference; their text ("+4 coins per curse") is meaningless with no curses.
- The map is a plain scrolling list of cards (`n-02-map-scrolled`). The map art banner is an empty purple blob. Places 3 and 4 have a coloured dot that means nothing.
- Lockers give a toast and a label ("Hawkers' Club") with no description of what it does.
- The Pawn is the best-written decision in the game and is offered once, in a text-only screen with a large empty bottom.

## Placeholders and layout bugs seen in frames

- Portraits for Madam Receipt, Chef Quack, Grandma Yai, Beng, Pla, Mali are flat coloured circles (`r2-28-phone`, `r2-02-place`).
- Notebook icons for Second Stool, Tip Jar, Tin Shelf: plain gold discs (`n-06-notebook`). Ice Bucket in the stall: an orange dot (`r2-30-shop`).
- **Lockers screen is broken at 390 px** (`n-16-lockers`): the panel scrolls 780 px wide inside 368, the locker grid is clipped past the right edge, three columns never visible, and the "Opened 0 of 20" text is squeezed into a 100 px column running 11 lines. Key chips float in the middle. "Left Luggage" is off screen. Big purple circles stand in for contents.
- The opened locker sheet still says "Needs a Brass key." after it is open (`n-19`).
- Notebook sheet: a tap on the scrim silently closes it and the next tap hits Close behind it (`n-08`, `n-09`); I lost a purchase that way.
- Back from the map returns Home scrolled differently, so my next tap hit "How to play" (`n-03-back`, `n-04`).
- The coach caption sits on top of the kiosk's PAY NOW (`059-kiosk-ready`, red strip over the stamp button) and over the shelf in `r2-01`.
- Spin slowness: roughly 3.8 s per spin. Over two runs I waited about 70 spins. There is no fast-forward.

## The 12 most important fixes, ranked

1. **Make tutorial taps work.** Step targets that sit over the canvas (goalBar, pattern:N, scoreLine, special, purse, nights, lever, kiosk.forecast) must accept real taps. Mount the coach on `document`, or forward the canvas `pointerup` into `coach.event('tap')`, or put a real transparent button in the hole. Today a real player cannot pass step 4. (`src/ui/coach.js` `onUp` listens on `col` only; the hole is over `#c`.)
2. **Make the lever drag work with a finger, and teach the tap.** Find why `pointercancel` kills the drag (the touch is stolen: add `touch-action: none` on `#c` and `.ui-col` hit areas) and change step 5 to "Tap SPIN or drag the lever". Let the red SPIN button stay live through step 5.
3. **Scroll the target into view.** Steps 18 and 19 point at things below the fold. Auto-scroll the stall panel to the highlighted card, or put the tutorial charm at the top of the stall.
4. **Fix the Lockers layout** (`.locker-wall`): single column of 4 per row or a vertical scroll, keys in a row on top, text full width. Show what each locker holds and its effect ("Hawkers' Club: ...").
5. **One goal, one set of numbers.** Home banner, How to play, tutorial and the first debt must say the same thing (90 in 2 nights, not "sixty coins, three nights" or "80 / night 1 of 3").
6. **Put PAY NOW on the machine.** When the debt is covered, the goal bar becomes a glowing PAY NOW button. Kiosk stays for banking. Drop the hint that says it "lights up" if nothing does.
7. **Explain SCORE the first time** and let SPIN be tappable when a trick is unused ("Use trick or score"). Hide the SCORE step for players who own no trick.
8. **Fix the run-end "Why it went wrong" logic**: count trick use properly ("1 tricks" plural bug), ignore nights that forbid spice, drop the sarcastic Nim line when the game never asked the player to read. Replace the stat dump with one near-miss line ("120 short = one Rush Hour night").
9. **Remove placeholder dots**: portraits (Madam Receipt, Chef Quack, Grandma Yai, Beng, Pla, Mali), Notebook icons, Ice Bucket tag icon, map banner. Ship a real icon or hide the slot.
10. **Clear the previous night's grid and win lines on every new night**, and grey out SPICE UP when Mild Night forbids it.
11. **Explain tribe tags and jargon in place**: long-press or tap a tag ("Wok: charms that reward Spice"), rename "Calling Card weight +100%" to "Phone rings twice as often", and fix "Reroll 2.6".
12. **Give the choices teeth**: show two actual consequences on terms/phone cards (expected coins, risk), cut spin time (skip animation after first spin), and make the boss debt (3) teach before it kills: both runs died there on 120 to 167 short with no warning that the Warden halves 3-cell patterns until the stall text.

## Method notes

Daemon and helper scripts live in the session scratchpad, not in the repo. Nothing in `src/` or `scripts/` was edited. Frames are named by order: `0xx` tutorial, `r1-*` run 1, `r2-*` run 2, `m-*` Home, `n-*` map, notebook, lockers.
