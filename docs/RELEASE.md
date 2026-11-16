# RELEASE — Android build and store steps for the owner (Windows)

Nothing native has been built or run on the development PC (no JDK, no Android SDK). Every step below that touches the phone, AdMob, RevenueCat or Play Console is untested until you do it. Expect to fix small things. Version numbers of tools move; where a number is given, check the linked page first.

Scope: Android only, v1.0-lite, soft launch (ROADMAP.md M5). iOS is at the end.

## 0. Before you start

- A Google account for Play Console (one-time fee, about 25 USD) and one for AdMob. Same Google account is fine.
- A real Android phone with USB debugging on, and a USB cable.
- A place to host `privacy.html` at a public URL (GitHub Pages, your own site, any static host). Play and AdMob need the URL. After `npm run build`, the file is `dist/privacy.html`.
- Fill `CONTACT_EMAIL_TODO` in `public/privacy.html` (it appears more than once). Search for it before every build.
- The package name is `appId` in `capacitor.config.json`: `com.kuroka.smallluckpier`. Play never lets you change a package name after the first upload. Change it now if you want a different one.
- New personal Play developer accounts must run a closed test with a minimum number of testers for a minimum number of days before production. Read the current rule in Play Console help before planning dates.

## 1. Install the tools

1. JDK 21 (Capacitor 8 builds with it; confirm at https://capacitorjs.com/docs/getting-started/environment-setup). In PowerShell:
   `winget install EclipseAdoptium.Temurin.21.JDK`
   Close and reopen the terminal, then `java -version` must print 21.x. If `JAVA_HOME` is empty, set it to the JDK folder (System Properties, Environment Variables).
2. Android Studio: `winget install Google.AndroidStudio`. Open it once. In the setup wizard accept the SDK install. In Settings > Languages & Frameworks > Android SDK install the SDK platform and build tools that Android Studio asks for when it opens the project.
3. Set `ANDROID_HOME` to the SDK folder (usually `C:\Users\<you>\AppData\Local\Android\Sdk`).
4. In the project folder: `npm install`.

## 2. Create the Android project

```
npm run build
npx cap add android
npx cap sync android
```

`cap add android` creates the `android/` folder (commit it). After any change to `src/` or `public/`, run `npm run cap:sync` (build + sync). To open it: `npm run cap:android`.

Check in Android Studio that Gradle sync finishes with no error before going on. First sync downloads a lot.

Icons and splash: `public/icon-512.png` is the source art. In Android Studio, right-click `app/src/main/res` > New > Image Asset to make the launcher icon (adaptive, paper-colored background `#F2E8D0`). Splash: Capacitor's default is fine for the soft launch.

## 3. AdMob

1. https://admob.google.com > Apps > Add app > Android. Not yet in Play: choose "No" for "Is the app listed on a supported store" and link it later.
2. Copy the **App ID** (looks like `ca-app-pub-1234567890123456~1234567890`, with a tilde).
3. Add two ad units to that app: **Rewarded** (name `rewarded_main`) and **Interstitial** (name `interstitial_main`). Copy each **Ad unit ID** (with a slash: `ca-app-pub-1234567890123456/1234567890`).
4. Blocking controls > Sensitive categories: block **Gambling and betting** and **Social casino games**. Also block them in every mediation network you add. Save a screenshot for M5 (`docs/` or your notes).
5. App settings > Maximum ad content rating: set to match the store rating (Mature, since the plan is 18+). Do not mark the app as child-directed.
6. Privacy & messaging: create the **European regulations** (GDPR) message and the **US state regulations** message and publish them for this app. Without a published message the consent form does not appear and ads can be limited in the EEA/UK. Use the list of vendors you actually use.
7. Paste the ids:
   - **App ID** goes in `android/app/src/main/AndroidManifest.xml`, inside `<application ...>`:
     ```xml
     <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
     ```
     While testing, Google's public sample App ID is `ca-app-pub-3940256099942544~3347511713`. Replace it with yours before the release build.
   - **Ad unit IDs** go in a file named `.env.production` in the project root (never commit it. `.gitignore` does not list it yet: add `.env.production`, `android/keystore.properties` and `*.jks` to it first):
     ```
     VITE_ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/1111111111
     VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/2222222222
     VITE_REVENUECAT_KEY=goog_XXXXXXXXXXXXXXXX
     ```
   Debug builds (`npm run dev`, `vite build --mode development`) use Google's public test ad units on their own. A production build with no ad unit id requests no ad at all, on purpose: the game never ships with test ads by mistake.
8. Later, when the app is live on Play, link it in AdMob (Apps > App settings > Link store) and publish `app-ads.txt` on your developer website if you have one.

## 4. RevenueCat (purchases)

The code uses `@revenuecat/purchases-capacitor` (privacy files assume it, STORE.md section 5).

1. https://app.revenuecat.com > new project > add an Android app with the package name above.
2. Follow RevenueCat's steps to give it Play Console service-account credentials (Play Console > Setup > API access). It takes a while for Google to activate them.
3. Copy the **public Android SDK key** (starts with `goog_`) into `.env.production` as `VITE_REVENUECAT_KEY`.
4. You do not need to create entitlements or offerings for this code: it fetches products by store id and reads the list of purchased ids. Product ids must match exactly (section 6).

## 5. Signing key and AAB

1. Make an upload key once. In a terminal in a folder **outside the repo** (for example `C:\keys\`):
   ```
   keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   Back up the `.jks` file and the passwords in two places. Never commit them.
2. Use Play App Signing (Play Console offers it when you upload the first bundle). Then Google holds the real signing key and this is only the upload key; a lost upload key can be reset through Play support, a lost app-signing key cannot.
3. Make Gradle read the key without putting passwords in the repo. In `android/` create `keystore.properties` (not committed):
   ```
   storeFile=C:\\keys\\upload-keystore.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```
   In `android/app/build.gradle` add a `signingConfigs.release` that loads those four values and set `buildTypes.release.signingConfig` to it. (Android Studio: Build > Generate Signed App Bundle does the same through a dialog if you prefer.)
4. Set `versionCode` (integer, must grow with each upload) and `versionName` in `android/app/build.gradle`.
5. Build:
   ```
   npm run build
   npx cap sync android
   cd android
   .\gradlew.bat bundleRelease
   ```
   Output: `android\app\build\outputs\bundle\release\app-release.aab`.

## 6. Play Console

1. Create app: name "Small Luck Pier", default language English (United States), Game, Free. Accept the declarations.
2. **Upload a first bundle before making products.** Play Console only lets you create in-app products after a build that includes billing is uploaded to some track. Use Testing > Internal testing > Create release > upload the `.aab`.
3. **Store listing** (Grow > Store presence > Main store listing): paste from `store/listing-en.md`. Graphics: icon 512x512, feature graphic 1024x500, 2 to 8 phone screenshots at 1080x1920 (the six frames in STORE.md section 6). Privacy policy URL: your hosted `privacy.html`. The Turkish listing (`store/listing-tr.md`) is not published until the Turkish lawyer answers (STORE.md section 3).
4. **App content** (Policy > App content): Privacy policy; Ads (yes); App access (all features available, no login); Content rating (IARC, answer from `store/content-rating.md`, write the returned ratings in the table there and in STORE.md section 2); Target audience (18 and over only); Data safety (`store/data-safety.md`); Government apps, Financial features, Health (all no or not applicable); the gambling declaration as the form words it.
5. **Countries**: Release > Production (or the test track) > Countries/regions. Leave out Turkey, South Korea and China mainland (STORE.md section 3).
6. **In-app products** (Monetize > Products > In-app products > Create product). Soft launch needs two:

   | Product ID | Name | Type | Price |
   |---|---|---|---|
   | `remove_ads` | Remove ads | one-time, non-consumable | 3.99 USD, other countries from the tier table |
   | `starter_pack` | Starter pack | one-time, non-consumable | 1.99 USD |

   IDs must match `src/services/iap.js` exactly and cannot be reused after deleting. Set each to Active. The later products (`pier_keeper`, `pier_keeper_upgrade`, `cos_reels`, `cos_deni`, `cos_harbor`) wait for soft-launch data (MONETIZATION.md section 2). Never create a consumable or a currency pack.
7. **License testers**: Settings > License testing > add the Gmail accounts of the phones you test on. Test purchases on them are free and show a test card dialog.
8. **Closed test**: Testing > Closed testing > create a track, add testers by email list, upload the `.aab`, send the opt-in link. Collect crash-free rate and where people got stuck (ROADMAP.md M5).
9. When the gates in MONETIZATION.md section 6 are read, promote to Production.

## 7. What must be tested on a real phone

Nothing below has run anywhere yet. Use a build installed from the internal or closed track, not only a USB debug build, for the purchase checks.

- [ ] App installs, starts in under 3 s, the back button does the expected thing, resume mid-spin after a kill gives the same spin.
- [ ] Age gate shows on first boot; "I am younger" stops all ads.
- [ ] In the EEA (use a VPN or the UMP debug geography) the Google consent form shows before the first ad; Settings > Ad choices reopens it. Outside the EEA, no form.
- [ ] Rewarded ads: each of the four placements shows a test ad, grants only its fixed reward, and not during a tide. Closing the ad early gives no reward. The 7 per day total and the per-placement caps hold (change the phone date by one day to see the reset).
- [ ] Interstitials: none in the first session, none before the 3rd finished run, none after a run under 60 seconds, none after a rewarded ad in the same run, at most 1 per 2 runs and 1 per 3 minutes, at most 6 per day, none inside a run, the shop or on resume. With `remove_ads` owned: none at all.
- [ ] Airplane mode: the game stays fully playable, no crash, no stuck dialog.
- [ ] Purchases with a license tester: `remove_ads` and `starter_pack` complete once; owning `remove_ads` removes interstitials; the starter pack grants its fixed 60 Planks once; Cancel at the Play dialog changes nothing.
- [ ] Reinstall (uninstall, install, Restore purchases): both entitlements come back. Progress does not come back from Restore; the settings text says so, and the save code is the way to move progress.
- [ ] Haptics on peg and win, and never on a miss or a pair that did not complete (STORE.md checklist 16).
- [ ] Privacy URL opens from Settings and from the listing. "Delete my data" clears the save.
- [ ] Turkish: switch language, check ğ ş ı İ ö ü ç on every new screen (consent, store, ad buttons).
- [ ] Before the release build: `npm run check` and `node scripts/check-services.mjs` pass; the full balance sim (`npm run sim`) result is read; AdMob blocked-categories screenshot saved; the banned-word test on the finished listing text is green.

## 8. iOS (later, ROADMAP.md M7)

Xcode only runs on macOS, so an iOS build cannot be made on this PC. Options: a borrowed Mac, a rented cloud Mac, or a cloud build service (GitHub Actions macOS runner or Codemagic) that builds from the repo. You also need the Apple Developer Program (yearly fee), an App Store Connect app record, StoreKit products with the same ids, the ATT text from STORE.md section 5 in `Info.plist` (`NSUserTrackingUsageDescription`), the AdMob iOS app and ad units (a separate app id and unit ids from Android), and TestFlight for testing on a real iPhone. `npx cap add ios` is run on the Mac.
