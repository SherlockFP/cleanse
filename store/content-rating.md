# Content rating answers

Source: docs/STORE.md section 2. The reel is a virtual slot-style device, so both stores get the honest answer: simulated gambling, yes. The plan is the strictest outcome: 18+ on both stores. This is an inference from Apple's definitions, not a confirmed result. The real IARC questionnaire must be read on the day and answered from its actual wording; if a question here has no match there, ask support instead of guessing.

## Google Play (IARC questionnaire, category: Game)

| Question area | Answer |
|---|---|
| Simulated gambling | Yes |
| Real gambling, cash payouts | No |
| Violence, fear, sexuality, language, drugs | No |
| Users can interact or exchange content | No |
| Shares location | No |
| Digital purchases | Yes |
| Random paid items | No |

Expected result: not known. STORE.md expects ESRB Teen or PEGI 12 at the lowest, and newer rules may be stricter. Target audience in Play Console stays 18+ whatever IARC returns, so one build does not carry two messages.

## Apple (App Store Connect age rating questionnaire, for the iOS milestone)

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

Expected result: 18+ worldwide. Korea 19+ (needs a GRAC classification, so Korea is excluded at launch), Australia R 18+, Brazil A18.

## Returned ratings (fill in; a blank row blocks the soft launch)

| Store / board | Rating returned | Date |
|---|---|---|
| Apple | | |
| IARC generic | | |
| ESRB | | |
| PEGI | | |
| USK | | |
| ClassInd (Brazil) | | |

Copy the returned values into docs/STORE.md section 2 as well.

## Related answers on the Play app content page

| Item | Answer |
|---|---|
| Target audience | 18 and over only. No opt-in to Designed for Families. |
| Ads | Yes, the app contains ads |
| Data safety | store/data-safety.md |
| News app, COVID-19, government app, financial features, health | No |
| Gambling apps declaration | The app is not a real-money gambling app. It offers simulated gambling content only, with no real-money play. Answer the declaration form as the form words it. |
| Countries | Exclude Turkey, South Korea, China mainland (STORE.md section 3). Belgium and the Netherlands ship, with optional exclusion for zero risk. |
