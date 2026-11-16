# MONETIZATION — Small Luck Pier

No income is promised here. The table in section 6 is a scenario, not a forecast: arithmetic on stated assumptions, most of them guesses. Installs are the unknown that decides everything.

## 1. Model

Hybrid-casual, free download on Google Play and the App Store.

- **Rewarded ads:** opt-in, each gives a fixed and shown reward. Never a spin, a peg, a trinket, coins in a run, a reroll or any random result. No ad reward changes what happens inside a run.
- **Interstitials:** only between runs, with hard caps.
- **IAP:** remove ads, one starter pack, one supporter bundle, three cosmetic packs. All non-consumable. No currency packs that can be bought again.

Why this split: the reel is the game, so nothing that touches the reel is sold. That keeps the game outside "paid spins" and "paid random outcomes" and clearly apart from social-casino apps, which sell chips to spin.

## 2. IAP list

Prices are starting points. TRY values are the suggested store tier, not a currency conversion; check the tier table in Play Console and App Store Connect on the day of setup.

| Product id | Type | USD | TRY | Content |
|---|---|---|---|---|
| `remove_ads` | non-consumable | 3.99 | 149.99 | No interstitials, forever. Rewarded ads stay optional. |
| `starter_pack` | non-consumable, one per account | 1.99 | 79.99 | Reel skin "Brass Sunday", hat "Captain's Cap", 60 Planks (one build of progress). Always available, no countdown. |
| `pier_keeper` | non-consumable | 7.99 | 299.99 | Remove ads + "Skin for a day" and "Postcard hint" are claimed with one tap and no ad (same daily caps) + 3 reel skins + pier flag set. Double Planks and the Daily retry still need the ad for every player, so money never buys Planks or attempts. Price drops to 4.99 / 179.99 for owners of `remove_ads` (separate product id `pier_keeper_upgrade`). |
| `cos_reels` | non-consumable | 2.99 | 119.99 | 4 reel case skins (palette swaps of the case, ART.md). |
| `cos_deni` | non-consumable | 2.99 | 119.99 | 3 hats for Deni (straw hat, beanie, headscarf). No outfits in v1.0. |
| `cos_harbor` | non-consumable | 2.99 | 119.99 | Boathouse decor set: awning, flower pots, string lights, cat bed. |

Seven product ids in total with the upgrade. Restore Purchases button in the store screen and in settings. The soft-launch build ships `remove_ads` and `starter_pack` only; the cosmetic packs and `pier_keeper` wait for soft-launch data (ROADMAP.md).

## 3. Rewarded ad placements

Each button shows the exact reward before the tap. Caps are per calendar day.

| Placement | Where | Reward | Cap |
|---|---|---|---|
| Double Planks | run end screen, a small button, the same after a win and a loss | Planks from this run x2 | 3 per day |
| Skin for a day | home screen | Wear one paid reel skin or hat until midnight | 1 per day |
| Daily retry | Daily Tide result | One more attempt at today's seed; best score counts | 1 per day |
| Postcard hint | Album | Shows the goal of one locked postcard | 2 per day |

Total rewarded cap: 7 per day. Never offered during a tide. Never offered as a way to continue a failed tide: an ad-for-spin is a paid spin in practice, and it is out.

**Removed: Keepsake.** An earlier draft had an ad on the loss screen that let the player carry one trinket from the lost run into the next run. It is out, for four reasons: the trinket could be any grade and worth more than a whole run's spend; the pool includes Spare Peg and Orhan's Watch, so it was an ad for pegs and spins; it was an offer on the loss screen; and it would have changed Daily Tide and Sunday Market scores. No replacement is planned. The start pick stays "1 of 3 grade 1 trinkets, free" for everyone.

## 4. Interstitials

- Slot: after the run end screen is closed, before the home screen.
- None in the first session, none before the 3rd finished run of an install.
- At most 1 per 3 minutes and 1 per 2 runs, whichever is stricter. Hard cap 6 per day.
- None after a run where the player watched a rewarded ad.
- None after a run shorter than 60 seconds.
- None inside a run, in the shop, on app open or on app resume.
- Skippable after 5 seconds where the network allows it.
- No banners.

## 5. Never sold, never ad-gated

- Spins, pegs, trinkets, coins inside a run, rerolls, shop offers, trinket slots, quota cuts.
- Any change to reel odds or shop grade odds.
- Any random item (no crates, no gacha, no wheel).
- Streak repair, energy, timers, skip-the-wait.
- Repeatable currency packs.
- Story chapters and game modes. No mode is unlocked with Planks either: Lamplight opens by winning installment 1, Daily Tide and Sunday Market by finishing run 2 (CONTENT.md section 5).

**What money and ads do touch, stated plainly:** the speed of the boathouse. Planks come from play, from the Double Planks ad (3 per day, for every player) and from one fixed grant of 60 in `starter_pack`. Planks unlock trinket families and symbols, which add variety; the sim keeps the win-rate gap between the start pool and the full pool within 8 points (ECONOMY.md assert 6). Money also buys ad removal and cosmetics. One ad a day gives a second Daily Tide attempt; Daily scores are personal in v1.0. The store listing says exactly this and no more (STORE.md section 4).

Dark patterns that are out: fake countdown offers, "last chance" popups, a full-screen offer on loss, daily login pressure text, pre-ticked consent, hiding the close button, selling relief from an ad load the game itself created (the interstitial caps above are low on purpose).

## 6. Revenue range, year 1

This is a scenario table, not a forecast. Every row marked (guess) has no source. Turkey is excluded from the plan (STORE.md section 3), so no Turkish traffic is in the numbers.

**Active days come from a retention curve, not from a hope.** Retention on day d is modelled as `r(d) = D1 x d^(-b)`, with b fitted to D7. Active days per install = 1 (day 0) + the sum of r(d) for d = 1 to 90.

| Curve | D1 | D7 | b | D30 (from the curve) | Active days per install |
|---|---|---|---|---|---|
| Market median (GameAnalytics 2025 via secondary summaries) | 22% | 4% | 0.88 | 1.1% | about 2.5 |
| Midway | 30% | 7% | 0.75 | 2.4% | about 3.7 |
| Top 10% | 40% | 12% | 0.62 | 4.9% | about 6.0 |

The pessimistic column uses the median curve, the good column the top 10% curve. The earlier draft used 3 / 5 / 8 active days, which put even its pessimistic case above the median.

Other inputs. Net per payer = after the 15% small-business store fee and VAT. Rewarded eCPM starts from the Appodeal 2025 ranges quoted in the research (North America 9.20-13.90, Europe 5.10-8.80, LATAM 1.90-3.75 USD); those are tier-1 figures, so the blended values below are lower and already carry a 15% cut for the 18+ rating and the blocked gambling ad categories (guess). Interstitial eCPM at half of rewarded is a guess. Fill rate is what share of ad requests gets an ad. The ad figures are what the network pays out after its own fee.

| | Pessimistic | Base | Good |
|---|---|---|---|
| Installs before the rating haircut (guess, no paid UA beyond the soft-launch test) | 2,000 | 10,000 | 60,000 |
| Haircut for the 18+ rating and ad-platform limits on simulated-gambling apps (guess) | -30% | -30% | -30% |
| Installs counted | 1,400 | 7,000 | 42,000 |
| Active days per install (table above) | 2.5 | 3.7 | 6.0 |
| Rewarded views per active day (guess) | 0.8 | 1.2 | 1.6 |
| Rewarded eCPM, blended, no Turkey | $2.50 | $4.50 | $7.00 |
| Interstitials per active day (guess) | 1.0 | 1.5 | 2.0 |
| Interstitial eCPM, blended (guess) | $1.25 | $2.25 | $3.50 |
| Fill rate (guess) | 80% | 85% | 90% |
| Ad revenue per install | $0.007 | $0.028 | $0.098 |
| Payer share (guess) | 0.3% | 0.6% | 1.0% |
| Net per payer, after store fee and VAT (guess) | $2.50 | $3.00 | $3.50 |
| IAP revenue per install | $0.008 | $0.018 | $0.035 |
| **Total, year 1** | **about $20** | **about $320** | **about $5,600** |

Ad revenue per install = active days x (rewarded views x rewarded eCPM + interstitials x interstitial eCPM) / 1000 x fill rate. Example, base: 3.7 x (1.2 x 4.50 + 1.5 x 2.25) / 1000 x 0.85 = $0.028.

The good column needs top-decile retention and 60,000 installs with almost no budget. It is not the plan. The base case does not rely on a viral clip.

What moves the numbers:
1. **Installs.** With no UA budget they come from short-form video, store featuring and word of mouth. Most solo releases land in the pessimistic column.
2. **Country mix.** Tier-1 traffic pays several times more per ad than the rest. Turkey is not in the plan.
3. **Retention.** See the curve table.
4. **Age rating and ad platforms.** The plan is 18+ on both stores (STORE.md section 2). That cuts store reach and ad fill, and it limits user acquisition: Meta, TikTok and Google ads restrict simulated-gambling apps (18+ targeting, prior approval, some countries blocked; this is from memory and must be checked on each platform's current policy page before any spend). Organic short video on the same platforms may be limited or labelled too. The -30% and -15% haircuts above stand for this risk; they are guesses.
5. **Ad fill.** Gambling and casino ad categories are blocked in the mediation settings (required), which lowers eCPM.

Decision gates, measured in soft launch:
- The read needs installs, and organic installs on a new account will be a few dozen. So the soft launch has a fixed test budget of 200-400 USD on one network in 2-3 countries, after that network's simulated-gambling ad policy is checked. This is the one exception to "no paid UA before the gates".
- Target read: 300 installs or more. At 300 installs a measured D1 of 25% is known to about +/- 5 points and a D7 of 6% to about +/- 3 points (95% band). Below 200 installs the gates are not read at all.
- D1 under 25%: fix the first run before anything else.
- D7 under 6%: fix the meta (Daily Tide, boathouse pacing) before launch.
- Rewarded views per DAU under 0.8: the rewards are not wanted; change them.
- Closed-test volunteers are used only for crash-free rate and first-run clarity, never for retention.
- More paid UA only if 30-day revenue per install is above the cost per install with margin. Otherwise none.

## 7. Launch and UA plan for a solo developer

| Phase | When | Work |
|---|---|---|
| Soft launch | M5 | Android only, v1.0-lite (GDD.md section 13), 2-3 countries with cheap English-speaking traffic. Turkey is excluded. Closed test first (Google requires testers for new personal accounts; check the current rule). Fixed test budget of 200-400 USD on one network (section 6). Firebase Analytics for retention and funnel only; it is listed in the privacy forms (STORE.md section 5). |
| Clip library | M4-M6 | Record 30 vertical clips of 8-15 s from the game with no UI chrome: peg-then-hit, clutch PAID stamp, boathouse growing in time-lapse, the riso look being "printed". A clipped peg is visible in every clip. No clip shows a miss as a tease. Post 1 per day on TikTok, Shorts, Reels in EN (TR after the legal answer). |
| Store page | M5 | 6 screenshots and a 15 s preview video (ART.md). A/B test icon and first screenshot with Play store listing experiments. |
| Web demo | M6 | The Vite build runs in a browser. A 3-installment demo on itch.io with store links, behind an 18+ notice and an age confirmation tap, because it is the same reel that is rated 18+ in the stores. The demo ships the synth sounds only, so no licensed sound file is exposed (TECH.md section 6). If the age notice is not built, the demo is dropped. |
| Creators | launch | 30 short emails to small mobile and roguelike creators with a 20 s clip and a link. No paid deals. |
| Launch | M6 | Android worldwide (minus excluded countries). iOS is its own milestone after launch (M7): it needs a Mac or a cloud Mac build, the Apple Developer Program and TestFlight (ROADMAP.md). Apply for featuring through the Play Console form. |
| After launch | monthly | One content drop per month (about 8 trinkets, 1 boathouse build, 1 creditor or 2 Tide Charts) until the full v1.0 list in CONTENT.md is live. Sunday Market, Harbor Ledger, cosmetic packs and the share card are built only if soft-launch data supports them; after that, a new Sunday Market every weekend (data only, no build). |
| Paid UA | only if gates pass | Check each channel's simulated-gambling ad policy first. Small budget on one network with a clip that already works organically. Stop on the first week the return is below cost. |
| Steam | optional, later | A PC build of the same code is possible. Not planned for v1.0. |
