# STORE — compliance, ratings, listing

Status of the research behind this file: the Google Play gambling policy, the Apple review guidelines and the Apple age-rating definitions were read directly. Turkey, Belgium and the Netherlands rest on secondary sources. Google's loot-box rule, its Families policy page and the IARC questionnaire wording were not read; reading the real IARC questionnaire is an M0 task (ROADMAP.md). Items marked (rec) are my recommendation, not a stated store rule. This is not legal advice.

Sources:
- G1 Google Play gambling policy: https://support.google.com/googleplay/android-developer/answer/9877032
- G2 Google Play content ratings: https://support.google.com/googleplay/answer/6209544?hl=en
- A1 App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- A2 Apple age rating values and definitions: https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/
- T1 Turkey gambling law summary: https://www.bicakhukuk.com/en/gambling-gaming-and-betting-in-turkey/
- T2 Turkey digital game regulation: https://www.mondaq.com/turkey/gaming/1802102/turkey-digital-game-regulation
- B1 Belgian loot box ruling: https://gamedeveloper.com/business/belgian-gaming-commission-declares-loot-boxes-illegal
- N1 Netherlands and Belgium decisions: https://europeangaming.eu/portal/latest-news/2019/02/06/38143/the-netherlands-and-belgium-ban-pubg-loot-boxes/

## 1. Compliance checklist

| # | Rule | How the game meets it | Source |
|---|---|---|---|
| 1 | No real-money wagering, no cash or physical prizes | Coins and Planks exist only in the save file. No cash-out, no trade, no gift, no prize. | G1, A2 |
| 2 | Virtual currency cannot be exchanged for money | No exchange, no account-to-account transfer, no marketplace. | G1, A2 |
| 3 | Simulated gambling declared honestly | Answered "yes" in both questionnaires (section 2). | A1 2.3.6, G2 |
| 4 | No promotion of or link to real-money gambling | No such links, text or partners. | G1 |
| 5 | No gambling ads in a simulated-gambling app | Gambling, casino, betting and lottery categories blocked in AdMob (Blocking controls: sensitive categories) and in every mediation network. Checked again before each release. | G1 |
| 6 | Not in Kids or Families programs | Target audience set to 18+ on both stores, and the rating plan is 18+ on both (section 2). No opt-in to Designed for Families or the Kids Category. | A1 1.3, G1 |
| 7 | Odds disclosed for purchasable random items | There are none. No random item is sold or ad-gated. | A1 3.1.1 |
| 8 | No copy of another app's name, icon or look | Original title, cast, setting and art. No fruit, sevens, bars, chips, neon or casino frames. The peg mechanic and the 3x3 paper reel make it distinct, and a clipped peg is visible in every screenshot and clip. The game's own vocabulary and an item-by-item comparison with the nearest games are in `docs/originality.md` (M0 gate). | A1 4.1, 4.3(b) |
| 9 | Metadata suitable for all ages | Icon, screenshots and text show the pier, Deni and the paper reel. No money rain, no "win" claims. | A1 2.3.8 |
| 10 | Odds shown in the game (rec) | Bag screen: per-symbol percentages, line pay, the effective shop grade odds for the current pool (not nominal numbers), mercy rule, the tutorial note. | rec |
| 11 | No sale of spins or odds boosts (rec) | Spins are free. No spin, peg, trinket, coin or odds is sold or given for an ad. IAP is ad removal, cosmetics and one fixed grant of 60 Planks in the starter pack. One rewarded ad doubles a run's Planks (3 per day). Planks only speed up the boathouse (MONETIZATION.md section 5). | rec |
| 12 | IAP through store billing only | Play Billing and StoreKit through one plugin. Restore Purchases present. | A1 3.1.1 |
| 13 | Consent and tracking | Google UMP consent form for EEA, UK and Switzerland before the first ad request. iOS ATT prompt before any tracking; ads work in non-personalized mode if refused. | store and ad network terms |
| 14 | Privacy policy | Public URL, linked in both listings and in settings. | A1 5.1.1, Play policy |
| 15 | Account deletion | No account exists. "Delete my data" in settings clears the local save. | A1 5.1.1(v) |
| 16 | No near-miss device (rec) | The result is drawn before the animation and no code path changes a draw after it is made (determinism check). There is no slow-down, tick, haptic or animation on two of a kind or on a miss: every spin stops at the same times, and `check-view.mjs` asserts it. The only scripted spins are the tutorial tide of the first run, disclosed on the rules screen. | rec |
| 17 | No minor in any gambling-like scene (rec) | Deni is an adult (20) in all text and art, and her age is not stated in the listing. Before each submission, every screenshot, the icon, the feature graphic, the video and the listing text are checked: no character who is or looks under 18 appears with the reel. | rec, A1 1.3 |
| 18 | Printed odds match real odds (rec) | The shop prints the effective odds of the current pool; the sim compares printed and observed frequencies for the start pool and the full pool (ECONOMY.md assert 14). | rec |

## 2. Age rating answers

The game has no wager: a spin costs nothing and no coin is ever staked. It still shows a reel with payouts, and both stores name virtual slot machines as simulated gambling. Answer as simulated gambling. Do not try for an exemption.

**Apple (App Store Connect age rating questionnaire)**

| Question area | Answer |
|---|---|
| Simulated gambling | Yes, frequent |
| Gambling (real money) | No |
| Loot boxes | No |
| Contests | No |
| Violence, sexual content, profanity, horror, drugs, alcohol, tobacco | None (tea only) |
| Medical or wellness topics | No |
| Unrestricted web access | No |
| User-generated content, messaging, chat | No |
| Advertising | Yes |
| In-app purchases | Yes |
| Parental controls, age assurance | No |

Expected result: 18+ worldwide for frequent simulated gambling (A2). Korea 19+ and a GRAC classification number is needed there. Australia R 18+. Brazil A18. If Apple accepts "infrequent" on appeal the rating would be 13+, but plan for 18+. This is an inference from A2, not a confirmed outcome.

**Google Play (IARC questionnaire, category: Game)**

| Question area | Answer |
|---|---|
| Simulated gambling | Yes |
| Real gambling, cash payouts | No |
| Violence, fear, sexuality, language, drugs | No |
| Users can interact or exchange content | No |
| Shares location | No |
| Digital purchases | Yes |
| Random paid items | No |

Expected result: not known. G2 suggests ESRB Teen / PEGI 12 for simulated gambling, but the IARC form was not read and newer rating rules are stricter for simulated gambling. Read the real IARC questionnaire in M0 and answer from it.

**The plan is the strictest outcome: 18+ on both stores.** The listing says "For adults", the target audience is 18+, and the app does not ask for a lower rating on Google than on Apple. If IARC returns a lower rating for some region, the target audience and the listing stay 18+, so one build does not carry two messages.

**Ratings returned by the stores** (fill in before M5 starts; a blank row blocks the soft launch):

| Store / board | Rating returned | Date |
|---|---|---|
| Apple | | |
| IARC generic | | |
| ESRB | | |
| PEGI | | |
| USK | | |
| ClassInd (Brazil) | | |

**Web demo:** the itch.io demo serves the same reel to any visitor, so it opens with an 18+ notice and an age confirmation tap. Without that gate the demo is not published (MONETIZATION.md section 7).

**Reach risk:** an 18+ rating is a real cost for a hybrid-casual game and for its ad fill. The honest lever is content, not the form: the reel has no casino signs, no wager, a hold mechanic and no near-miss device. The question to put to Apple is whether a no-wager reel counts as simulated gambling. This is a blocking M0 gate, together with the AdMob policy check for simulated-gambling apps: both answers are on file in writing before art starts, and with them the decision whether a non-reel presentation is needed. Do not answer "no" on a guess.

## 3. Countries

| Country | Action | Why |
|---|---|---|
| Turkey | **Excluded. This is the default plan, not a temporary state.** Excluded in both consoles; no revenue, soft launch or UA figure counts on Turkey. A written opinion from a Turkish lawyer is asked for in M0. Owner: the developer. Decision date: the end of M1. With no written "yes" by then, Turkey stays excluded for all of v1.0 and the question is asked again only after launch. | Slot machines are banned by a separate law and gambling apps are being blocked (T1). A new digital game regulation is reported in T2. Both are secondary sources: the law numbers and texts were not read, so none is cited here. The lawyer is asked to name the primary texts. Whether a no-money reel game is caught is unverified. The developer is resident, so exposure is personal even with the storefront excluded. |
| South Korea | Exclude at launch. | GRAC classification needed for frequent simulated gambling (A2, G2). |
| Belgium, Netherlands | Ship. Optional exclusion for zero risk. | Rulings target paid random items (B1, N1); the game has none. Sources are from 2018-2019. |
| Australia, Brazil | Ship with the restricted rating. | A2. |
| China mainland | Exclude. | License regime; out of scope. |
| Everywhere else | Ship. | |

**Questions for the Turkish lawyer** (one written answer covers all):
1. Is a reel game with no money in and no money out caught by the slot machine ban or the gambling law?
2. Is the title "Küçük Şans İskelesi" a problem? "Şans" is close to the legal term "şans oyunları" (games of chance). Is the reel's Turkish name a problem?
3. Does the Turkish listing text, shown to Turkish speakers abroad, create exposure for a resident developer while the Turkish storefront is excluded?
4. Which duties apply under the digital game regulation and under KVKK (privacy), with the primary texts named?

**Turkish wording until the answer arrives:** Turkish stays as an in-game language. The Turkish store listing is not published. The prepared Turkish title without "Şans" is "Küçük İskele" (or the "Deni's Pier" fallback, "Deni'nin İskelesi"). In Turkish text the reel is "Hasan'ın Çarkı", never "Şans Çarkı".

## 4. Listing copy

Word rules for the listing (title, subtitle, short and long description, screenshot captions, video text), in EN and in the TR equivalents:

| Rule | Words |
|---|---|
| Never, in any listing field | casino, slot, slots, jackpot, bet, gamble, wager, win cash, free spins, earn, payout, Vegas, fortune |
| Never in title, subtitle, short description or captions; not used in the long description either | spin, spins ("turn" and "crank" are used) |
| Allowed in exactly one place, the "Fair play" paragraph that closes the long description | "real-money" and "prizes" |

`check-i18n.mjs` runs these rules on the listing files in `store/` only, with the one allowed paragraph matched by its key. In-game strings have their own shorter list (casino, slot, jackpot, bet, gamble, wager, cash). The test is run on the finished EN and TR text, not on a draft.

### English

**Title (30 max):** Small Luck Pier

**Subtitle, iOS (30 max):** Crank, peg, save the pier

**Short description, Play (80 max):** Crank the paper reel, peg your best symbols and save grandpa's pier.

**Long description:**

Deni owns a wrecked pier, a boathouse with no roof and her grandfather's hand-cranked paper reel. The harbor co-op wants its money. Kaptan Orhan is counting.

TURN, PEG, TURN AGAIN
Turn the crank. Like two lanterns? Clip a clothes peg on them and they stay for the next turn. Three in a line fills the lantern string. Fill it before the tide goes out.

THREE-MINUTE RUNS
Five tides, six turns each. Play it with one thumb while the tea brews.

BUILD YOUR LUCK
Pick up 64 trinkets that bend the rules: sardines that pay double, gulls that fly diagonals, a peg rack that grows. Add and remove symbols from the bag. Every percentage is on screen.

A HARBOR THAT GROWS
Collect planks. Patch the roof. Hang the lamps. Neighbors come back one by one, and the boathouse becomes a teahouse.

EVERY DAY, A NEW TIDE
One Daily Tide for the whole harbor. A Sunday Market every weekend. Twelve installments of story, and a drawer Orhan will not talk about.

PRINTED BY HAND
Two-ink riso colors, lino-cut lines, paper you can almost feel.

Fair play: the game uses virtual coins only. There is no real-money play and there are no prizes. No turn, peg, coin or odds is sold or given for an ad. Purchases are ad removal, cosmetics and one starter pack with a fixed number of planks; an optional ad can double the planks of a run. For adults.

(The count "64 trinkets" is the full v1.0 number. The soft-launch listing says 35.)

### Türkçe

Not published until the lawyer answers (section 3). The title below is the working title; "Küçük İskele" replaces it if "Şans" is a problem.

**Başlık:** Küçük Şans İskelesi (yedek: Küçük İskele)

**Alt başlık (iOS):** Çevir, mandalla, iskeleyi kurtar

**Kısa açıklama (Play):** Kâğıt çarkı çevir, en iyi sembolleri mandalla, dedenin iskelesini kurtar.

**Uzun açıklama:**

Deni'nin elinde yıkık bir iskele, çatısı uçmuş bir kayıkhane ve dedesinden kalan kollu bir kâğıt çark var. Liman kooperatifi parasını istiyor. Kaptan Orhan sayıyor.

ÇEVİR, MANDALLA, YİNE ÇEVİR
Kolu çevir. İki fener hoşuna mı gitti? Mandalı tak, bir sonraki çevirmede yerinde kalsınlar. Üçü bir sıraya gelince fener ipi dolar. Sular çekilmeden ipi doldur.

ÜÇ DAKİKALIK OYUNLAR
Beş gelgit, her birinde altı çevirme. Çay demlenirken tek parmakla oyna.

ŞANSINI KENDİN KUR
Kuralları büken 64 biblo: iki kat ödeyen sardalyalar, çapraz uçan martılar, büyüyen bir mandal askısı. Torbaya sembol ekle, çıkar. Bütün yüzdeler ekranda.

BÜYÜYEN BİR LİMAN
Tahta biriktir. Çatıyı onar. Lambaları as. Komşular birer birer döner, kayıkhane çayevine dönüşür.

HER GÜN YENİ BİR GELGİT
Bütün liman için tek bir Günün Gelgiti. Her hafta sonu Pazar Kurulur. On iki taksitlik bir hikâye ve Orhan'ın konuşmak istemediği bir çekmece.

ELDE BASILMIŞ GİBİ
İki renkli riso baskı, linol oyma çizgiler, dokusu hissedilen kâğıt.

Adil oyun: oyunda yalnızca sanal para vardır. Gerçek parayla oyun ve ödül yoktur. Çevirme, mandal, oyun parası ya da oran satılmaz, reklamla da verilmez. Satın alınabilenler: reklam kaldırma, görünüm paketleri ve belirli sayıda tahta içeren tek bir başlangıç paketi. İsteğe bağlı bir reklam, bir oyunun tahtalarını ikiye katlar. Yetişkinler içindir.

**Category:** Games > Casual (Play: Casual; tag "Roguelike" if offered). Do not pick Casino.

## 5. Privacy and data safety

The game has no account, no server of its own and no chat. Data leaves the device only through the SDKs below. The list is fixed first; both store forms are then filled row by row from each vendor's published disclosure page for the exact SDK version in the build. A change to this list means both forms are filled again.

**SDK list (TECH.md section 8)**

| SDK | Job | What it adds to the forms |
|---|---|---|
| Google Mobile Ads (AdMob) + UMP | ads, consent | advertising ID, coarse location from IP, ad interactions, diagnostics |
| RevenueCat Purchases | billing, entitlements | purchase history linked to an anonymous app user ID that RevenueCat creates and keeps; RevenueCat is named as a data processor |
| Firebase Analytics | retention and funnel (soft launch and after) | app interactions, app instance ID, device and coarse region data |
| Firebase Crashlytics | crash reports | crash logs and diagnostics tied to an installation ID |

If `cordova-plugin-purchase` is used in place of RevenueCat, the purchase rows go back to "not linked" and the processor line is removed.

**Google Play Data safety form**

| Data type | Collected | Shared | Purpose | Optional |
|---|---|---|---|---|
| Device or other IDs (advertising ID, app instance ID, RevenueCat app user ID) | Yes | Yes (ad networks) | Advertising, analytics, fraud prevention, app function | Consent in EEA/UK for ads and analytics |
| Approximate location (from IP, by the ads SDK) | Yes | Yes | Advertising | Consent in EEA/UK |
| App interactions (ad events, analytics events) | Yes | Yes for ads | Advertising, analytics | Consent in EEA/UK |
| Diagnostics (crash logs, Crashlytics) | Yes | No | App function | No |
| Purchase history (store billing, RevenueCat; linked to the app user ID) | Yes | No (processor only) | App function | No |
| Name, email, contacts, photos, files, messages, health, precise location | No | No | | |

Encrypted in transit: yes. Deletion request: local data is deleted in settings; ad data is handled by the ad network's own controls (linked in the policy). Confirm each row against the AdMob "Play data disclosure" page for the SDK version in the build.

**Apple privacy nutrition label**

| Data | Linked to user | Used for tracking |
|---|---|---|
| Identifiers: Device ID | No | Yes, only if ATT is allowed |
| Usage data: advertising data, product interaction (ads and analytics) | No | Yes, only if ATT is allowed |
| Location: coarse | No | Yes, only if ATT is allowed |
| Diagnostics: crash data | No | No |
| Identifiers: User ID (RevenueCat app user ID) | Yes | No |
| Purchases | Yes (linked to the RevenueCat app user ID) | No |

This label applies when the iOS milestone is taken (ROADMAP.md M7).

`NSUserTrackingUsageDescription` (EN): "This lets ad partners show ads that fit you. The game works the same if you say no." (TR): "Bu izin, reklam ortaklarının sana uygun reklam göstermesini sağlar. Hayır dersen oyun aynı şekilde çalışır."

Privacy policy page (`public/privacy.html`, EN and TR) lists: every SDK in the list above by name with what it collects and a link to its own policy, the consent choices, no account, local save and the export code, contact email, children: not directed to under 18, and the game rules note ("The first tide of your first run is a fixed tutorial. Every spin after it is drawn from the bag.").

Regimes the policy has a section for, each reviewed by the lawyer before release in that region: GDPR and UK GDPR (legal basis, rights, processors, transfers), CCPA / CPRA (no sale; opt-out of sharing for ads), and KVKK for Turkish users (explicit consent, data-controller identity and duties, transfer abroad). KVKK applies if any Turkish resident can install the game, so it is written even while Turkey is excluded and is checked in the lawyer's answer (section 3, question 4).

## 6. Screenshot plan

Six portrait frames at 1290x2796 (iOS 6.9") and 1080x1920 (Play). Real game capture inside a paper frame with one caption line. EN and TR sets. Captions follow the word rules in section 4. A clipped peg on the reel is visible in every frame: frames 3 to 6 carry the reel with a held pair as an inset or in the background, because the peg is what sets the game apart. Deni is drawn as an adult in every frame (checklist row 17).

| # | Scene | Caption EN | Caption TR |
|---|---|---|---|
| 1 | Reel at rest, two lanterns pegged, Deni leaning on the case | Peg two. Turn again. | İkisini mandalla. Yine çevir. |
| 2 | Coral line inked across the middle row, lantern string full, PAID stamp | Fill the lantern string | Fener ipini doldur |
| 3 | Shop with three trinket cards and the bag percentages visible | 64 trinkets. Every percentage shown. | 64 biblo. Bütün yüzdeler ekranda. |
| 4 | Boathouse: four build stages side by side as a torn paper strip | From wreck to teahouse | Yıkıntıdan çayevine |
| 5 | Orhan at his window with a creditor stamp, Deni's speech bubble | A gruff treasurer. A drawer he won't open. | Aksi bir veznedar. Açmadığı bir çekmece. |
| 6 | Daily Tide share card and Album page | One tide a day for the whole harbor | Bütün limana günde bir gelgit |

Preview video, 15 s: (0-3) crank and clack; (3-8) a pair, the peg clipped on, the next turn completes it; (8-12) lanterns light along the sky, coins to the jar; (12-15) PAID stamp, Orhan nods, gull behind him. No text except the title card.

Feature graphic 1024x500 and icon 1024x1024: see ART.md.
