# Google Play Data safety form: answers

Source: docs/STORE.md section 5. Fill the form row by row from this file. Before you submit, open each vendor's own disclosure page for the exact SDK version in the build and confirm every row (AdMob: "Play data disclosure"; Firebase and RevenueCat publish theirs too). Any change to the SDK list means this file, `public/privacy.html` and both forms are redone together.

SDKs in the build: Google Mobile Ads (AdMob) with UMP, RevenueCat Purchases, Firebase Analytics, Firebase Crashlytics. If Analytics and Crashlytics are not in the soft-launch build, remove their rows and their lines in the privacy page first. If `cordova-plugin-purchase` replaces RevenueCat, the purchase row becomes "not linked" and the processor line goes.

## Top-level questions

| Question | Answer |
|---|---|
| Does the app collect or share any of the required user data types? | Yes |
| Is all of the user data collected by your app encrypted in transit? | Yes |
| Do you provide a way for users to request that their data is deleted? | Yes. Local data: "Delete my data" in Settings. Ad data: the ad network's own controls, linked in the privacy policy. Purchase data: write to the contact address on the privacy policy. |
| Is the app directed to children / Families program? | No. Target audience 18+. |

## Data types

| Data type | Collected | Shared | Purpose | Optional |
|---|---|---|---|---|
| Device or other IDs (advertising ID, app instance ID, RevenueCat app user ID) | Yes | Yes (ad networks) | Advertising or marketing, analytics, fraud prevention, app functionality | Consent in EEA, UK and Switzerland for ads and analytics |
| Approximate location (from IP, collected by the ads SDK) | Yes | Yes | Advertising or marketing | Consent in EEA, UK and Switzerland |
| App interactions (ad events, analytics events) | Yes | Yes, for ads | Advertising or marketing, analytics | Consent in EEA, UK and Switzerland |
| Crash logs and diagnostics (Crashlytics) | Yes | No | App functionality | No |
| Purchase history (store billing and RevenueCat, linked to the app user ID) | Yes | No (RevenueCat is a processor) | App functionality | No |
| Name, email, user IDs we create, address, phone, contacts, photos, videos, audio, files, messages, calendar, health, fitness, precise location, financial info, web history | No | No | | |

## Notes for the person filling the form

- "Shared" for ads means the ad SDK passes data to ad networks. Processors acting only on our behalf (RevenueCat) are not "sharing" under the Play definition; confirm in the current Play help text on the day.
- Security practices section: data is encrypted in transit; a deletion request path exists; the app follows the Play Families policy: no (not a Families app).
- Ads section of the app content page: the app contains ads: yes. Ads are blocked for the categories "Gambling and betting" and "Social casino games" in the AdMob console (checked before each release).
