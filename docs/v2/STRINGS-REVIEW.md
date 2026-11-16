# STRINGS-REVIEW (v2)

All Turkish and Thai text in `docs/v2/data/*.json` was written without a native reader. Charm, curse, deal, terms and contract texts are **composed from parts** by `scripts/gen-v2-data.py` (trigger phrase + condition phrases + effect phrases). They are correct as rules but can read stiff. Fix wording in the phrase tables of the generator, not in the JSON.

## 1. Must be read by a native speaker before launch

**Thai (launch market, highest priority).**
- Every string. Thai was written short on purpose; check that short did not become unclear.
- Composed sentences: Thai has no spaces between words and no full stop. The generator joins parts with a space and a colon. A native reader must confirm this reads naturally on a card.
- Word choices to confirm:

| term | Thai used | concern |
|---|---|---|
| Moth | แมลงเม่า | chosen for the "flies into the fire" idiom; it is a winged termite, and the sprite is a moth |
| Wisp (wild) | ผีโขมด | folk will-o'-wisp; may be regional or too scary for a cute game |
| Sigil | ตราปีศาจ | "devil's seal"; check tone |
| Favourite | ตัวโปรด | ตัวเต็ง was rejected: it is horse-racing and betting slang. Confirm ตัวโปรด reads well |
| trick | กลเม็ด | chosen over กลโกง (cheating) |
| charm | เครื่องราง | real amulets are a religious object in Thailand; confirm it is fine in a devil-pact game |
| deal / contract | ข้อตกลง / สัญญา | keep the two apart everywhere |
| Scorch | ไหม้เกรียม | tone |
| Luck | โชค, and ดวงซวย for the Jinx curse | ซวย is casual and slightly rude |
| pattern | ลาย | may read as "stripe"; alternative รูปแบบ |
| round ("night") | รอบ | the HUD says "Night"; pick one word |
| Paper Fortune | ใบเซียมซี | temple fortune slip; confirm it is not disrespectful |
| Full Fair | เต็มงาน | invented; "งานวัด" (temple fair) is used elsewhere, check the religious link |

- Character names: นิ่ม, เต๋า, ป้าบัว, ลุงสก, ปิ๊บ, หมอกรุ๊งกริ๊ง. เต๋า also means "dice": decide if that is a problem for the store. บริมเบิล is a sound spelling of Brimble.
- Thai horror and religion: the devil is a Western-style small devil. Do not mix in monks, temples or real spirit names without a native check. "Head Office" as hell's bureaucracy must not read as a real institution.

**Turkish.**
- Composed sentences use "X başına" in brackets and "ise / varsa" clauses to avoid case endings. Check for stiffness, for example: "Her desen, Güve ise: bu desen çarpanı +0.25 (ızgaradaki Güve başına)."
- Percent is written `%20` and signed values `+%50`. Decimal point is written `0.25`; Turkish uses `0,25`. The UI number formatter must handle this, not the data.
- Word choices to confirm:

| term | Turkish used | concern |
|---|---|---|
| round | el | "el" is a card-game word; alternative "gece" to match the HUD |
| spin | çeviriş | alternative "çevirme" |
| Favourite | Gözde | fine, but confirm it is not read as a person's name |
| Wisp | Cin Ateşi | invented compound |
| trick | numara | chosen over "hile" (cheat) |
| Stoke / Scorch | Körükle / Kavrulma | tone |
| pact (family) / contract | Ahit / sözleşme | "ahit" has a religious sense |
| Hex (family) | Büyü | generic "magic" |
| The Tithe | Brimble Payı | avoided "öşür" (religious tax) |
| Martyr's Splinter | Çilekeş Kıymığı | avoided "şehit" on purpose |
| rarity | sıradan, nadir, ender, efsane | nadir and ender are near synonyms |

## 2. Risky words (stores and ratings)

Never use in the game, the store page, screenshots or ad text, in any language:

| English | Turkish | Thai |
|---|---|---|
| bet, wager, stake | bahis, iddia | เดิมพัน, พนัน, แทง |
| casino, slot, slots | kumarhane, slot | คาสิโน, สล็อต |
| jackpot | jackpot, büyük ikramiye | แจ็กพอต |
| gamble, gambling | kumar | การพนัน |
| payout, odds | | อัตราต่อรอง |

- The data id `stakes.json` and the code word "stake" are internal. On screen the cards are "Terms" (Şartlar, เงื่อนไข).
- The top pattern is "Full Fair", never "jackpot". Its id is `full`.
- English texts in the JSON use "pays", "pay again" and "payout" style wording in rule text ("each Heat level pays +15% more"). Consider "gives" or "scores" before store review.
- "Luck", "spin" and "machine" are kept. They are the least risky words that still explain the game. This does not remove the simulated-gambling classification risk; it only avoids making it worse.
- "Wild" (joker in Turkish) is a card term; acceptable.
- "Devil", "curse", "soul", "blood" (Blood Ink), "grave" (Grave Dirt), "martyr": check per-country sensitivity. Thailand and Turkey are both likely fine with cartoon devils, but this was not researched. Middle East release would need a pass on all of these.
- "Head Office Audit", "Royal Tithe", "Coronation", "Paper King": in Thailand, jokes about royalty are a legal risk (lese-majeste). The Crown family (มงกุฎ, ราชากระดาษ, พิธีสวมมงกุฎ, ส่วยหลวง, บัลลังก์เอียง, ติดนิสัยเจ้า) **must be reviewed by a Thai reader and may need renaming to a fairground "king of the fair" theme or a non-royal top symbol for the Thai build.** This is the single biggest string risk for a Thailand-first launch.

## 3. Not written yet

- UI strings (buttons, HUD labels, tutorial lines, settings) and the Nim / Brimble line sets. Only English samples exist in GDD.md section 2. They need en, tr and th.
- Ending panel text.
- Store listing text for v2.

## 4. Mechanical checks the build should run

- Every `name` and `text` has non-empty en, tr, th (the generator asserts this).
- No text contains a word from the table in section 2 (add to `check-v2.mjs`).
- Longest strings fit: Thai charm text on a card at 360 px width, two lines of name, four lines of rule text.
