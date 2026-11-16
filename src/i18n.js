// UI strings only (en, tr, th). Item, symbol, pattern and deal text comes from the data JSON ({en,tr,th} fields), read with L().
// One table: key -> [en, tr, th]. Every key has all three by construction; scripts/check-i18n.mjs also checks placeholders and wording.
// Speech lines are line.<who>.<trigger>.<n> (numbered from 1). Triggers the game can say():
//   brimble: home start stoke heatHigh scorch dud big paid deal signed refuse pawn lose win tutDeal   pip: shop tutShop   nim: start paid scorch lose
const T = {
  // ---- common ----
  "ui.title": ["Brimble's Bargain", "Brimble'ın Pazarlığı", "ข้อตกลงของบริมเบิล"],
  "ui.tagline": ["Pay a small devil's debt with his own rickety fortune machine.", "Küçük bir şeytanın borcunu onun tahta fal makinesiyle öde.", "ปลดหนี้ของปีศาจตัวน้อยด้วยเครื่องดูดวงเก่าๆ ของเขาเอง"],
  "ui.play": ["Play", "Oyna", "เล่น"], "ui.continue": ["Continue", "Devam", "ไปต่อ"], "ui.close": ["Close", "Kapat", "ปิด"], "ui.back": ["Back", "Geri", "กลับ"],
  "ui.cancel": ["Cancel", "Vazgeç", "ยกเลิก"], "ui.on": ["On", "Açık", "เปิด"], "ui.off": ["Off", "Kapalı", "ปิด"], "ui.loading": ["Loading", "Yükleniyor", "กำลังโหลด"],
  "ui.coins": ["coins", "para", "เหรียญ"], "ui.purse": ["Purse", "Kese", "ถุงเงิน"], "ui.wick": ["Wick", "Fitil", "ไส้เทียน"], "ui.wax": ["Wax", "Balmumu", "ขี้ผึ้ง"],
  "ui.luck": ["Luck", "Şans", "โชค"], "ui.heat": ["Heat", "Ateş", "ไฟ"], "ui.interest": ["Interest", "Faiz", "ดอกเบี้ย"], "ui.fav": ["Favourite", "Gözde", "ตัวโปรด"],
  "ui.favHidden": ["Hidden", "Gizli", "ซ่อนอยู่"], "ui.redrawFree": ["Tap the Favourite to redraw it: free", "Gözdeyi değiştirmek için dokun: bedava", "แตะตัวโปรดเพื่อสุ่มใหม่: ฟรี"],
  "ui.redrawWick": ["Tap the Favourite to redraw it: {n} Wick", "Gözdeyi değiştirmek için dokun: {n} Fitil", "แตะตัวโปรดเพื่อสุ่มใหม่: {n} ไส้เทียน"], "ui.boss": ["Boss debt. {name}: {rule}", "Patron borcu. {name}: {rule}", "หนี้บอส {name}: {rule}"], "ui.nim": ["Nim", "Nim", "นิ่ม"], "ui.brimble": ["Mr. Brimble", "Bay Brimble", "คุณบริมเบิล"], "ui.pip": ["Pip", "Pip", "ปิ๊บ"],
  "ui.rarity.common": ["Common", "Sıradan", "ทั่วไป"], "ui.rarity.uncommon": ["Uncommon", "Seyrek", "ไม่ธรรมดา"], "ui.rarity.rare": ["Rare", "Nadir", "หายาก"], "ui.rarity.legendary": ["Legendary", "Efsanevi", "ในตำนาน"],
  "ui.price": ["Price", "Fiyat", "ราคา"], "ui.free": ["Free", "Bedava", "ฟรี"], "ui.stack": ["Charge {n}", "Yük {n}", "สะสม {n}"],
  "why.coins": ["Not enough coins in the purse.", "Kesede yeterli para yok.", "เหรียญในถุงเงินไม่พอ"], "why.wick": ["Not enough Wick.", "Yeterli Fitil yok.", "ไส้เทียนไม่พอ"],
  "why.wax": ["Not enough Wax.", "Yeterli Balmumu yok.", "ขี้ผึ้งไม่พอ"], "why.full": ["Your shelf is full. Sell a charm first.", "Raf dolu. Önce bir tılsım sat.", "ชั้นเต็มแล้ว ขายเครื่องรางก่อน"],
  "why.max": ["Already at the maximum.", "Zaten en üstte.", "เต็มแล้ว"], "why.locked": ["Locked.", "Kilitli.", "ยังล็อกอยู่"], "why.unknown": ["That did not work.", "Olmadı.", "ไม่สำเร็จ"],
  "why.noLock": ["No locking on this contract.", "Bu sözleşmede kilitleme yok.", "สัญญานี้ล็อกของไม่ได้"],   "ui.endNight": ["END NIGHT", "GECEYİ BİTİR", "จบคืนนี้"],
  "ui.bankAfter": ["Collect first, then pay.", "Önce topla, sonra öde.", "เก็บเงินก่อน แล้วค่อยจ่าย"],
  "ui.promptPair": ["Tap two cells side by side", "Yan yana iki hücreye dokun", "แตะสองช่องที่อยู่ติดกัน"],
  "ui.scorched": ["Scorch! {n} coins burned.", "Kavruldu! {n} para yandı.", "ไหม้! เสียไป {n} เหรียญ"],
  "ui.newCurse": ["New curse: {name}", "Yeni lanet: {name}", "คำสาปใหม่: {name}"],
  "ui.pickCharm": ["Pick a charm to start with", "Başlangıç için bir tılsım seç", "เลือกเครื่องรางหนึ่งชิ้นไว้เริ่มเล่น"],
  "ui.noPattern": ["No pattern", "Desen yok", "ไม่มีลาย"],
  "why.target": ["That does nothing there.", "Orada işe yaramaz.", "ใช้ตรงนั้นไม่ได้ผล"],
  "tut.spin": ["Tap SPIN. Three of one symbol in a row or a column pays.", "ÇEVİR'e dokun. Aynı sembolden üçü yan yana ya da alt alta gelirse kazanırsın.", "แตะ หมุน สัญลักษณ์เดียวกันสามตัวเรียงแถวนอนหรือแถวตั้งจะได้เหรียญ"],
  "tut.collect": ["Tap COLLECT to take this result.", "Bu sonucu almak için TOPLA'ya dokun.", "แตะ เก็บเงิน เพื่อรับผลรอบนี้"],
  "tut.nudge": ["Try the Nudge: tap the trick, then the lit column.", "Dürtmeyi dene: numaraya, sonra parlayan sütuna dokun.", "ลองใช้สะกิด: แตะกลเม็ด แล้วแตะแถวตั้งที่สว่าง"],
  "tut.stoke": ["STOKE adds Heat: more pay, but more Ash. Three Ash burns your purse.", "KÖRÜKLE Ateş ekler: daha çok kazanç, ama daha çok Kül. Üç Kül keseni yakar.", "เติมไฟ ทำให้ไฟแรงขึ้น: จ่ายเพิ่ม แต่เถ้าก็เพิ่ม เถ้าสามกองจะเผาถุงเงิน"],
  "tut.end": ["Night over. BANK pays the debt. Coins you keep earn interest. Then END NIGHT.", "Gece bitti. ÖDE borcu kapatır. Kesede kalan para faiz kazanır. Sonra GECEYİ BİTİR.", "หมดคืนแล้ว จ่ายหนี้ เพื่อใช้หนี้ เหรียญที่เก็บไว้ได้ดอกเบี้ย จากนั้นกด จบคืนนี้"],
  "line.pip.tutShop.1": ["Charms work on their own every spin. Buy one you can pay for.", "Tılsımlar her çevirmede kendiliğinden çalışır. Paranın yettiği birini al.", "เครื่องรางทำงานเองทุกครั้งที่หมุน ซื้อชิ้นที่จ่ายไหวสักชิ้น"],
  "line.brimble.tutDeal.1": ["SIGN: a boon now and a curse for the whole run. REFUSE: three Wick, no curse.", "İMZALA: şimdi bir lütuf, oyun boyu bir lanet. REDDET: üç Fitil, lanet yok.", "เซ็น: ได้ของดีทันที แต่ติดคำสาปทั้งรอบ ปฏิเสธ: ได้ไส้เทียนสามเส้น ไม่มีคำสาป"],
"why.busy": ["Wait for the reels.", "Makine dönerken bekle.", "รอให้วงล้อหยุดก่อน"],
  // ---- home, hideout ----
  "ui.hideout": ["The Hideout", "Sığınak", "ที่ซ่อนตัว"], "ui.hideoutSub": ["An old ghost-train carriage. Spend Wax on it between runs.", "Eski bir hayalet treni vagonu. Oyunlar arasında Balmumu harca.", "ตู้รถไฟผีเก่าๆ ใช้ขี้ผึ้งแต่งระหว่างรอบเกม"],
  "ui.waxHave": ["{n} Wax", "{n} Balmumu", "ขี้ผึ้ง {n}"], "ui.buy": ["Buy", "Satın al", "ซื้อ"], "ui.owned": ["Owned", "Alındı", "เป็นของเธอแล้ว"],
  "ui.waxMore": ["{n} more Wax", "{n} Balmumu daha", "ขาดขี้ผึ้ง {n}"], "ui.bought": ["Bought: {name}", "Alındı: {name}", "ซื้อแล้ว: {name}"],
  "ui.collection": ["Collection", "Koleksiyon", "คลังสะสม"], "ui.daily": ["Daily run", "Günlük oyun", "เกมประจำวัน"], "ui.store": ["Store", "Mağaza", "ร้านค้า"],
  "ui.settings": ["Settings", "Ayarlar", "ตั้งค่า"], "ui.howto": ["How to play", "Nasıl oynanır", "วิธีเล่น"], "ui.language": ["Language", "Dil", "ภาษา"],
  "ui.langEn": ["English", "English", "English"], "ui.langTr": ["Türkçe", "Türkçe", "Türkçe"], "ui.langTh": ["ไทย", "ไทย", "ไทย"],
  "ui.firstRunHint": ["First night? Press Play. Brimble explains as you go.", "İlk gece mi? Oyna'ya bas. Brimble yolda anlatır.", "คืนแรกใช่ไหม กดเล่นได้เลย บริมเบิลจะอธิบายระหว่างทาง"],
  // ---- character, contract ----
  "ui.chooseChar": ["Who signs tonight?", "Bu gece kim imzalıyor?", "คืนนี้ใครเซ็น"], "ui.locked": ["Locked", "Kilitli", "ล็อก"], "ui.unlockBy": ["Unlock: {how}", "Açmak için: {how}", "ปลดล็อก: {how}"],
  "ui.chooseContract": ["Choose a contract", "Bir sözleşme seç", "เลือกสัญญา"], "ui.debtsN": ["{n} debts", "{n} borç", "หนี้ {n} ก้อน"], "ui.nightsPer": ["{n} nights per debt", "Borç başına {n} gece", "ก้อนละ {n} คืน"],
  "ui.reward": ["Reward: {n} Wax", "Ödül: {n} Balmumu", "รางวัล: ขี้ผึ้ง {n}"], "ui.cleared": ["Cleared", "Bitirildi", "ผ่านแล้ว"], "ui.clearFirst": ["Clear {name} first", "Önce {name} sözleşmesini bitir", "ผ่าน {name} ก่อน"],
  "ui.start": ["Start", "Başla", "เริ่ม"], "ui.endingTag": ["Ending: {name}", "Son: {name}", "ตอนจบ: {name}"],
  // ---- HUD ----
  "ui.debtOf": ["Debt {n} of {m}", "Borç {n}/{m}", "หนี้ {n} จาก {m}"], "ui.nightOf": ["Night {n} of {m}", "Gece {n}/{m}", "คืนที่ {n} จาก {m}"], "ui.spinsN": ["Spins {n}", "Çeviriş {n}", "หมุนได้ {n}"],
  "ui.owed": ["{a} / {b}", "{a} / {b}", "{a} / {b}"],
  "ui.goal": ["Pay {left} more to clear debt {n} of {m} by the end of night {r}.", "{n}/{m}. borcu kapatmak için {r}. gecenin sonuna kadar {left} daha öde.", "จ่ายอีก {left} ให้หมดหนี้ก้อนที่ {n} จาก {m} ก่อนจบคืนที่ {r}"],
  "ui.goalDone": ["Debt covered. Finish the night or pay it now.", "Borç karşılandı. Geceyi bitir ya da şimdi öde.", "หนี้ครบแล้ว เล่นให้จบคืนหรือจ่ายเลย"],
  "ui.interestNext": ["Next interest", "Sıradaki faiz", "ดอกเบี้ยรอบหน้า"], "ui.heatLabel": ["Heat {n}", "Ateş {n}", "ไฟ {n}"], "ui.heatPay": ["+{n}% pay", "+%{n} kazanç", "จ่ายเพิ่ม {n}%"],
  "ui.stoke": ["STOKE", "KÖRÜKLE", "เติมไฟ"], "ui.bank": ["BANK", "ÖDE", "จ่ายหนี้"], "ui.spin": ["SPIN", "ÇEVİR", "หมุน"], "ui.collect": ["COLLECT", "TOPLA", "เก็บเงิน"],
  "ui.owedLeft": ["{n} owed", "{n} borç", "ค้าง {n}"], "ui.stokeWhy": ["More Heat: more pay, more Ash.", "Daha çok Ateş: daha çok kazanç, daha çok Kül.", "ไฟแรงขึ้น: จ่ายเพิ่ม เถ้าเพิ่ม"],
  "ui.stokeMax": ["Heat is at the top.", "Ateş en üstte.", "ไฟสูงสุดแล้ว"], "ui.stokeNo": ["No stoking tonight.", "Bu gece körükleme yok.", "คืนนี้เติมไฟไม่ได้"],
  "ui.noSpins": ["No spins left tonight.", "Bu gece çeviriş kalmadı.", "คืนนี้หมดตาหมุนแล้ว"],
  "ui.bankTitle": ["Pay into the debt", "Borca öde", "จ่ายเข้าหนี้"], "ui.bankAll": ["All", "Hepsi", "ทั้งหมด"], "ui.bankHalf": ["Half", "Yarısı", "ครึ่งหนึ่ง"],
  "ui.bankDo": ["Bank {n}", "{n} öde", "จ่าย {n}"], "ui.bankNote": ["Banked coins are safe from a Scorch but earn no interest.", "Ödenen para Kavrulmadan korunur ama faiz getirmez.", "เหรียญที่จ่ายแล้วปลอดภัยจากไหม้เกรียม แต่ไม่ได้ดอกเบี้ย"],
  "ui.bankNone": ["Nothing in the purse to pay.", "Kesede ödenecek para yok.", "ไม่มีเหรียญในถุงให้จ่าย"],
  "ui.pockets": ["Tricks", "Numaralar", "กลเม็ด"], "ui.pocketEmpty": ["Empty pocket", "Boş cep", "กระเป๋าว่าง"],
  "ui.trickPre": ["Use it before the spin.", "Çevirmeden önce kullan.", "ใช้ก่อนหมุน"], "ui.trickPost": ["Use it after the reels stop.", "Makine durunca kullan.", "ใช้หลังวงล้อหยุด"],
  "ui.trickShop": ["Use it in the wagon.", "Arabada kullan.", "ใช้ที่รถเข็น"], "ui.trickAuto": ["It works by itself when needed.", "Gerektiğinde kendiliğinden çalışır.", "ทำงานเองเมื่อจำเป็น"],
  "ui.shelf": ["Charms", "Tılsımlar", "เครื่องราง"], "ui.curses": ["Curses", "Lanetler", "คำสาป"],
  "ui.promptColumn": ["Tap a column", "Bir sütuna dokun", "แตะแถวตั้งหนึ่งแถว"], "ui.promptRow": ["Tap a row", "Bir satıra dokun", "แตะแถวนอนหนึ่งแถว"],
  "ui.promptCell": ["Tap a cell", "Bir hücreye dokun", "แตะหนึ่งช่อง"], "ui.promptSymbol": ["Tap a symbol", "Bir sembole dokun", "แตะสัญลักษณ์"],
  // ---- terms ----
  "ui.termsTitle": ["Tonight's terms", "Bu gecenin şartları", "เงื่อนไขคืนนี้"], "ui.termsSub": ["Pick one card. It sets the spins and a rule for this night.", "Bir kart seç. Bu gecenin çeviriş sayısını ve kuralını belirler.", "เลือกหนึ่งใบ กำหนดจำนวนหมุนและกฎของคืนนี้"],
  "ui.spinsBadge": ["{n} spins", "{n} çeviriş", "หมุน {n} ตา"],
  "ui.whenPre": ["Before the spin", "Çevirmeden önce", "ก่อนหมุน"], "ui.whenPost": ["After the reels stop", "Makine durunca", "หลังวงล้อหยุด"], "ui.whenAny": ["Any time", "Her zaman", "ได้ทุกเวลา"],
  "ui.whenShop": ["In the wagon", "Arabada", "ที่รถเข็น"], "ui.whenAuto": ["Automatic", "Otomatik", "ทำงานเอง"],
  // ---- shop ----
  "ui.wagon": ["Pip's wagon", "Pip'in arabası", "รถเข็นของปิ๊บ"], "ui.tabCharms": ["Charms", "Tılsımlar", "เครื่องราง"], "ui.tabTricks": ["Tricks", "Numaralar", "กลเม็ด"], "ui.tabBench": ["Bench", "Tezgâh", "โต๊ะช่าง"],
  "ui.reroll": ["Reroll {n}", "Yenile {n}", "สุ่มใหม่ {n}"], "ui.lock": ["Lock", "Kilitle", "ล็อก"], "ui.unlock": ["Unlock", "Kilidi aç", "ปลดล็อก"], "ui.sell": ["Sell {n}", "Sat {n}", "ขาย {n}"],
  "ui.sold": ["Sold", "Satıldı", "ขายแล้ว"], "ui.slotBuy": ["Extra charm slot", "Fazladan tılsım yuvası", "ช่องเครื่องรางเพิ่ม"], "ui.slotText": ["Hold one more charm. Once per run.", "Bir tılsım daha taşı. Oyun başına bir kez.", "ถือเครื่องรางได้อีกชิ้น ครั้งเดียวต่อเกม"],
  "ui.yourCharms": ["Your charms ({n}/{m})", "Tılsımların ({n}/{m})", "เครื่องรางของเธอ ({n}/{m})"], "ui.moveLeft": ["Move left", "Sola taşı", "ย้ายซ้าย"], "ui.moveRight": ["Move right", "Sağa taşı", "ย้ายขวา"],
  "ui.orderNote": ["Charms work left to right. Order matters.", "Tılsımlar soldan sağa çalışır. Sıra önemli.", "เครื่องรางทำงานจากซ้ายไปขวา ลำดับมีผล"],
  "ui.nextNight": ["Leave the wagon", "Arabadan ayrıl", "ออกจากรถเข็น"], "ui.benchSymbol": ["Which symbol?", "Hangi sembol?", "สัญลักษณ์ไหน"], "ui.benchCurse": ["Which curse?", "Hangi lanet?", "คำสาปไหน"],
  "ui.noCurses": ["You carry no curses.", "Hiç lanetin yok.", "ยังไม่มีคำสาป"], "ui.shopEmpty": ["Nothing left on this table.", "Bu tezgâhta bir şey kalmadı.", "โต๊ะนี้ของหมดแล้ว"],
  "ui.benchNote": ["Bench work changes the machine for the rest of the run.", "Tezgâh işleri makineyi oyunun sonuna dek değiştirir.", "งานช่างเปลี่ยนเครื่องไปตลอดเกม"],
  "ui.symVal": ["value {v}", "değer {v}", "ค่า {v}"], "ui.symRemoved": ["removed", "çıkarıldı", "ถอดแล้ว"],
  // ---- deal, pawn ----
  "ui.dealTitle": ["Mr. Brimble has a paper for you", "Bay Brimble'ın sana bir kâğıdı var", "คุณบริมเบิลมีกระดาษให้เซ็น"], "ui.boon": ["You get", "Sen alırsın", "เธอได้"], "ui.curseLabel": ["You carry", "Sen taşırsın", "เธอแบก"],
  "ui.sign": ["SIGN", "İMZALA", "เซ็น"], "ui.refuse": ["REFUSE", "REDDET", "ปฏิเสธ"], "ui.refuseNote": ["Refuse both: +{n} Wick.", "İkisini de reddet: +{n} Fitil.", "ปฏิเสธทั้งสอง: ไส้เทียน +{n}"],
  "ui.mustSign": ["Under this contract you must sign one.", "Bu sözleşmede birini imzalamak zorundasın.", "สัญญานี้ต้องเซ็นหนึ่งใบ"], "ui.forever": ["Lasts the whole run.", "Oyun boyunca sürer.", "อยู่ไปตลอดเกม"],
  "ui.randomCurses": ["{n} random curses", "{n} rastgele lanet", "คำสาปสุ่ม {n} อย่าง"], "ui.randomCurse": ["A random curse", "Rastgele bir lanet", "คำสาปสุ่มหนึ่งอย่าง"],
  "ui.pawnTitle": ["The Pawn", "Rehin", "จำนำ"], "ui.pawnSub": ["You are short. Brimble gives you one more night if you burn a charm and take a random curse. Once per run.", "Eksiksin. Bir tılsımı yakıp rastgele bir lanet alırsan Brimble sana bir gece daha verir. Oyunda bir kez.", "เธอยังขาด ถ้าเผาเครื่องรางหนึ่งชิ้นและรับคำสาปสุ่ม บริมเบิลให้เพิ่มอีกหนึ่งคืน ครั้งเดียวต่อเกม"],
  "ui.pawnBurn": ["Burn it", "Yak", "เผา"], "ui.pawnDecline": ["Walk away", "Vazgeç", "ยอมแพ้"], "ui.pawnNone": ["You have no charm to burn.", "Yakacak tılsımın yok.", "ไม่มีเครื่องรางให้เผา"],
  // ---- paid, end ----
  "ui.paidTitle": ["Debt paid", "Borç ödendi", "ปลดหนี้แล้ว"], "ui.paidStamp": ["PAID", "ÖDENDİ", "จ่ายแล้ว"], "ui.paidEarly": ["{n} nights unused: +{w} Wick and a free trick.", "{n} gece kullanılmadı: +{w} Fitil ve bedava bir numara.", "เหลือ {n} คืน: ไส้เทียน +{w} และกลเม็ดฟรี"],
  "ui.paidInterest": ["Interest earned: {n}", "Kazanılan faiz: {n}", "ดอกเบี้ยที่ได้: {n}"], "ui.paidKept": ["Purse carried over: {n}", "Devreden kese: {n}", "ถุงเงินยกไป: {n}"],
  "ui.paidNext": ["Next debt: {n}", "Sıradaki borç: {n}", "หนี้ก้อนถัดไป: {n}"], "ui.toDeal": ["See Brimble's offer", "Brimble'ın teklifine bak", "ดูข้อเสนอของบริมเบิล"],
  "ui.savedTitle": ["Saved at the last second", "Son saniyede kurtuldun", "รอดในวินาทีสุดท้าย"], "ui.savedBy": ["{name} burned so you could stay.", "{name} yandı, sen kaldın.", "{name} ถูกเผาเพื่อให้เธออยู่ต่อ"],
  "ui.lostTitle": ["Brimble collects", "Brimble tahsil ediyor", "บริมเบิลมาเก็บหนี้"], "ui.lostSub": ["The snuffer comes down on night {r} of debt {d}.", "Mum söndürücü {d}. borcun {r}. gecesinde iniyor.", "ที่ดับเทียนลงมาในคืนที่ {r} ของหนี้ก้อนที่ {d}"],
  "ui.lostShort": ["You were {n} short.", "{n} eksiktin.", "เธอขาดไป {n}"], "ui.winTitle": ["Contract cleared", "Sözleşme bitti", "สัญญาจบแล้ว"],
  "ui.bestPattern": ["Best pattern: {name} for {n}", "En iyi desen: {name}, {n}", "ลายที่ดีที่สุด: {name} ได้ {n}"], "ui.statDebts": ["Debts paid", "Ödenen borç", "หนี้ที่ปลด"],
  "ui.statBest": ["Biggest spin", "En büyük çeviriş", "ตาที่ได้มากสุด"], "ui.statScorch": ["Scorches", "Kavrulma", "ไหม้เกรียม"], "ui.statDeals": ["Deals signed", "İmzalanan anlaşma", "ข้อตกลงที่เซ็น"],
  "ui.statCurses": ["Curses carried", "Taşınan lanet", "คำสาปที่แบก"], "ui.waxEarned": ["+{n} Wax", "+{n} Balmumu", "ขี้ผึ้ง +{n}"], "ui.unlocked": ["Unlocked", "Açıldı", "ปลดล็อกแล้ว"],
  "ui.unlockChar": ["Character: {name}", "Karakter: {name}", "ตัวละคร: {name}"], "ui.unlockCharm": ["Charm: {name}", "Tılsım: {name}", "เครื่องราง: {name}"], "ui.unlockHideout": ["Hideout: {name}", "Sığınak: {name}", "ที่ซ่อนตัว: {name}"],
  "ui.again": ["Again", "Tekrar", "เล่นอีก"], "ui.home": ["Home", "Ana ekran", "หน้าหลัก"], "ui.endingUnlocked": ["Ending reached: {name}", "Ulaşılan son: {name}", "ถึงตอนจบ: {name}"],
  "ui.ending.paid_in_full": ["Paid in Full", "Tamamen Ödendi", "จ่ายครบทุกบาท"], "ui.ending.bought_the_machine": ["Bought the Machine", "Makineyi Satın Aldın", "ซื้อเครื่องมาเป็นของตัวเอง"], "ui.ending.new_management": ["New Management", "Yeni Yönetim", "ผู้บริหารชุดใหม่"],
  "ui.endingText.paid_in_full": ["Nim's page is stamped and the stall is rebuilt. Brimble is back the next night with a new customer. Pip slips Nim the real contract.", "Nim'in sayfası mühürlendi, tezgâh yeniden kuruldu. Brimble ertesi gece yeni bir müşteriyle geri döndü. Pip, Nim'e asıl sözleşmeyi uzatıyor.", "หน้ากระดาษของนิ่มถูกประทับตรา แผงถูกสร้างใหม่ คืนต่อมาบริมเบิลกลับมาพร้อมลูกค้าคนใหม่ ปิ๊บแอบส่งสัญญาฉบับจริงให้นิ่ม"],
  "ui.endingText.bought_the_machine": ["Nim pays Head Office herself and owns Brimble's debt paper. He is free and has nowhere to go. He moves into the armchair.", "Nim Genel Merkez'e kendisi ödedi ve Brimble'ın borç kâğıdının sahibi oldu. Brimble özgür ama gidecek yeri yok. Koltuğa yerleşti.", "นิ่มจ่ายสำนักงานใหญ่เอง และเป็นเจ้าของตั๋วหนี้ของบริมเบิล เขาเป็นอิสระแต่ไม่มีที่ไป จึงย้ายเข้าไปนั่งเก้าอี้นวม"],
  "ui.endingText.new_management": ["Head Office promotes its best earner. Nim gets the hat and Brimble becomes her clerk. The last line is his: \"Three nights. Sixty coins. You say it, I've retired.\"", "Genel Merkez en çok kazananı terfi ettirdi. Şapka Nim'e geçti, Brimble onun katibi oldu. Son söz onun: \"Üç gece. Altmış para. Sen söyle, ben emekli oldum.\"", "สำนักงานใหญ่เลื่อนตำแหน่งคนทำเงินเก่งที่สุด นิ่มได้หมวก บริมเบิลกลายเป็นเสมียน คำสุดท้ายเป็นของเขา: \"สามคืน หกสิบเหรียญ เธอพูดสิ ฉันเกษียณแล้ว\""],
  // ---- daily ----
  "ui.dailyTitle": ["Daily run", "Günlük oyun", "เกมประจำวัน"], "ui.dailySub": ["The same pact for everyone today. Your first try counts.", "Bugün herkese aynı ahit. İlk denemen sayılır.", "วันนี้ทุกคนได้พันธสัญญาเดียวกัน ครั้งแรกของเธอเท่านั้นที่นับ"],
  "ui.dailyToday": ["Today: {char}, {contract}", "Bugün: {char}, {contract}", "วันนี้: {char}, {contract}"], "ui.dailyForced": ["First terms card: {name}", "İlk şart kartı: {name}", "ใบเงื่อนไขแรก: {name}"],
  "ui.dailyCurse": ["Starting curse: {name}", "Başlangıç laneti: {name}", "คำสาปตั้งต้น: {name}"], "ui.dailyBest": ["Best", "En iyi", "ดีที่สุด"], "ui.dailyScore": ["{d} debts, {c} coins", "{d} borç, {c} para", "หนี้ {d} ก้อน เหรียญ {c}"],
  "ui.dailyStreak": ["Streak: {n} days", "Seri: {n} gün", "ต่อเนื่อง {n} วัน"], "ui.dailyDone": ["Played today. Come back tomorrow.", "Bugün oynadın. Yarın gel.", "เล่นวันนี้แล้ว พรุ่งนี้มาใหม่"],
  "ui.dailyLocal": ["Scores stay on this phone.", "Skorlar bu telefonda kalır.", "คะแนนอยู่ในเครื่องนี้เท่านั้น"], "ui.dailyWax": ["A daily run gives +{n} Wax.", "Günlük oyun +{n} Balmumu verir.", "เกมประจำวันได้ขี้ผึ้ง +{n}"],
  "ui.dailyGo": ["Play today's run", "Bugünün oyununu oyna", "เล่นเกมวันนี้"],
  // ---- store, settings ----
  "ui.storeTitle": ["Store", "Mağaza", "ร้านค้า"], "ui.sound": ["Sound effects", "Ses efektleri", "เสียงเอฟเฟกต์"], "ui.music": ["Music", "Müzik", "เพลง"], "ui.haptics": ["Vibration", "Titreşim", "สั่น"],
  "ui.fast": ["Fast spin", "Hızlı çevirme", "หมุนเร็ว"], "ui.reduceMotion": ["Reduce motion", "Hareketi azalt", "ลดการเคลื่อนไหว"],
  "ui.privacyText": ["Your progress stays on this phone. No real money is ever won or paid out, and spins are never sold.", "İlerlemen bu telefonda kalır. Gerçek para kazanılmaz ya da ödenmez, çevirişler satılmaz.", "ความคืบหน้าอยู่ในเครื่องนี้ ไม่มีการได้หรือจ่ายเงินจริง และไม่มีการขายตาหมุน"],
  "ui.storeNote": ["Purchases remove ads or add looks. Nothing here changes spins, odds or Wax. No random items.", "Satın alımlar reklamı kaldırır ya da görünüm ekler. Hiçbiri çeviriş, olasılık ya da Balmumu vermez. Rastgele ürün yok.", "สิ่งที่ซื้อได้คือเอาโฆษณาออกหรือเพิ่มหน้าตา ไม่ได้เพิ่มตาหมุน โอกาส หรือขี้ผึ้ง ไม่มีของสุ่ม"],
  "store.remove_ads.name": ["Remove ads", "Reklamları kaldır", "เอาโฆษณาออก"], "store.remove_ads.desc": ["No ads between runs, for good. Reward ads stay optional.", "Oyunlar arasında reklam çıkmaz, kalıcı. Ödüllü reklamlar isteğe bağlı kalır.", "ไม่มีโฆษณาระหว่างรอบเกมตลอดไป โฆษณารับรางวัลยังเลือกดูได้"],
  "store.starter_pack.name": ["Starter pack", "Başlangıç paketi", "ชุดเริ่มต้น"], "store.starter_pack.desc": ["Remove ads, one machine skin and 100 Wax. Once.", "Reklamları kaldır, bir makine kılıfı ve 100 Balmumu. Tek seferlik.", "เอาโฆษณาออก สกินเครื่องหนึ่งแบบ และขี้ผึ้ง 100 ครั้งเดียว"],
  "store.cos_machine.name": ["Machine skins", "Makine kılıfları", "สกินเครื่อง"], "store.cos_machine.desc": ["New paint for the fortune machine.", "Fal makinesi için yeni boya.", "สีใหม่ให้เครื่องดูดวง"],
  "store.cos_hats.name": ["Brimble's hats", "Brimble'ın şapkaları", "หมวกของบริมเบิล"], "store.cos_hats.desc": ["Silly hats for a serious devil.", "Ciddi bir şeytan için komik şapkalar.", "หมวกตลกๆ สำหรับปีศาจจริงจัง"],
  "store.cos_wallpaper.name": ["Hideout wallpaper", "Sığınak duvar kâğıdı", "วอลเปเปอร์ที่ซ่อนตัว"], "store.cos_wallpaper.desc": ["A new look for the ghost-train carriage.", "Hayalet treni vagonuna yeni bir görünüm.", "หน้าตาใหม่ให้ตู้รถไฟผี"],
  "iap.buy": ["Buy", "Satın al", "ซื้อ"], "iap.owned": ["Owned", "Alındı", "ซื้อแล้ว"], "iap.restore": ["Restore purchases", "Satın alımları geri yükle", "กู้คืนการซื้อ"], "iap.restored": ["Restored: {n}", "Geri yüklendi: {n}", "กู้คืนแล้ว: {n}"],
  "iap.restoreNone": ["Nothing to restore.", "Geri yüklenecek bir şey yok.", "ไม่มีอะไรให้กู้คืน"], "iap.restoreNote": ["Restoring brings back purchases only.", "Geri yükleme yalnızca satın alımları getirir.", "การกู้คืนได้เฉพาะของที่ซื้อ"],
  "iap.failed": ["The purchase did not go through.", "Satın alma tamamlanmadı.", "การซื้อไม่สำเร็จ"], "iap.needsRemoveAds": ["That needs Remove ads first.", "Bunun için önce Reklamları kaldır gerekir.", "ต้องซื้อเอาโฆษณาออกก่อน"], "iap.useUpgrade": ["You own Remove ads, so buy the upgrade instead.", "Reklamları kaldır sende var, yükseltmeyi al.", "เธอมีเอาโฆษณาออกแล้ว ให้ซื้ออัปเกรดแทน"],
  "iap.testLabel": ["Test purchase", "Deneme satın alımı", "ทดลองซื้อ"], "iap.testBody": ["No money is taken. Store price: {price}.", "Para çekilmez. Mağaza fiyatı: {price}.", "ไม่มีการตัดเงิน ราคาในร้าน: {price}"], "iap.testBuy": ["Buy (test)", "Satın al (deneme)", "ซื้อ (ทดลอง)"], "iap.cancel": ["Cancel", "Vazgeç", "ยกเลิก"],
  "ads.watch.shop_reroll": ["Watch an ad: one free reroll", "Reklam izle: bir bedava yenileme", "ดูโฆษณา: สุ่มใหม่ฟรี 1 ครั้ง"], "ads.watch.double_wax": ["Watch an ad: double the Wax from this run", "Reklam izle: bu oyunun Balmumunu ikiye katla", "ดูโฆษณา: ขี้ผึ้งจากเกมนี้เป็นสองเท่า"],
  "ads.left": ["{n} left today", "Bugün {n} tane kaldı", "วันนี้เหลือ {n}"], "ads.unavailable": ["No ad is available right now. Try again later.", "Şu an gösterilecek reklam yok. Sonra tekrar dene.", "ตอนนี้ไม่มีโฆษณา ลองใหม่ภายหลัง"], "ads.noReward": ["The ad closed early, so there is no reward.", "Reklam erken kapandı, ödül yok.", "ปิดโฆษณาก่อนจบ จึงไม่ได้รางวัล"],
  "ads.testLabel": ["Test ad", "Deneme reklamı", "โฆษณาทดลอง"], "ads.testTitle": ["This is a test ad", "Bu bir deneme reklamı", "นี่คือโฆษณาทดลอง"], "ads.testBody": ["A real ad would play here. Reward in {n} s.", "Burada gerçek bir reklam oynardı. Ödül {n} sn sonra.", "โฆษณาจริงจะเล่นตรงนี้ รับรางวัลใน {n} วิ"], "ads.close": ["Close", "Kapat", "ปิด"],
  // ---- how to play, board ----
  "ui.howTitle": ["How to play", "Nasıl oynanır", "วิธีเล่น"], "ui.tabRules": ["Rules", "Kurallar", "กติกา"], "ui.tabSymbols": ["Symbols", "Semboller", "สัญลักษณ์"], "ui.tabPatterns": ["Patterns", "Desenler", "ลาย"],
  "ui.rule1": ["You owe Brimble a debt. Each debt has a few nights to pay it.", "Brimble'a bir borcun var. Her borcu ödemek için birkaç gece var.", "เธอเป็นหนี้บริมเบิล แต่ละก้อนมีไม่กี่คืนให้จ่าย"],
  "ui.rule2": ["Each night, pick one terms card. It sets the spins.", "Her gece bir şart kartı seç. Çeviriş sayısını o belirler.", "ทุกคืนเลือกใบเงื่อนไขหนึ่งใบ ใบนั้นกำหนดจำนวนหมุน"],
  "ui.rule3": ["Check the Favourite. It is more likely to land. Then spin the 5 by 3 machine.", "Gözde'ye bak. İnme ihtimali daha yüksek. Sonra 5x3 makineyi çevir.", "ดูตัวโปรด มันออกง่ายกว่า แล้วหมุนเครื่อง 5x3"],
  "ui.rule4": ["STOKE adds Heat: more pay, but more Ash. Three Ash is a Scorch and burns your purse.", "KÖRÜKLE Ateş ekler: daha çok kazanç ama daha çok Kül. Üç Kül Kavrulmadır, keseni yakar.", "เติมไฟเพิ่มไฟ: จ่ายมากขึ้นแต่เถ้าก็มากขึ้น เถ้าสามตัวคือไหม้เกรียม ถุงเงินจะไหม้"],
  "ui.rule5": ["Tricks change the result after the reels stop. Charms work on their own.", "Numaralar makine durunca sonucu değiştirir. Tılsımlar kendiliğinden çalışır.", "กลเม็ดแก้ผลหลังวงล้อหยุด เครื่องรางทำงานเอง"],
  "ui.rule6": ["Pay coins into the debt, or keep them in the purse for interest. The purse can burn.", "Parayı borca öde ya da faiz için kesede tut. Kese yanabilir.", "จ่ายเหรียญเข้าหนี้ หรือเก็บในถุงเพื่อดอกเบี้ย แต่ถุงเงินอาจไหม้"],
  "ui.rule7": ["Pay a debt and Brimble offers deals: a boon and a curse that stays. Miss a deadline and he collects.", "Bir borcu öde, Brimble anlaşma sunar: bir ödül ve kalıcı bir lanet. Vadeyi kaçırırsan tahsil eder.", "ปลดหนี้แล้วบริมเบิลเสนอข้อตกลง: ของดีหนึ่งอย่างกับคำสาปที่อยู่ถาวร พลาดกำหนดเขาก็มาเก็บ"],
  "ui.scoreOrder": ["How a spin is scored", "Bir çeviriş nasıl puanlanır", "การคิดคะแนนหนึ่งตา"],
  "ui.score1": ["1. Each pattern pays: value × symbol mult × pattern mult.", "1. Her desen öder: değer × sembol çarpanı × desen çarpanı.", "1. แต่ละลายจ่าย: ค่า × ตัวคูณสัญลักษณ์ × ตัวคูณลาย"],
  "ui.score2": ["2. Add all patterns together.", "2. Tüm desenleri topla.", "2. รวมทุกลายเข้าด้วยกัน"], "ui.score3": ["3. Multiply by Heat and any bonus.", "3. Ateş ve ek çarpanlarla çarp.", "3. คูณด้วยไฟและโบนัส"],
  "ui.score4": ["4. Add flat coins. The total goes into the purse.", "4. Sabit paraları ekle. Toplam keseye girer.", "4. บวกเหรียญคงที่ ยอดรวมเข้าถุงเงิน"], "ui.scoreBeat": ["A bigger pattern beats the smaller one inside it.", "Büyük desen, içindeki küçüğü geçersiz kılar.", "ลายใหญ่ชนะลายเล็กที่อยู่ในนั้น"],
  "ui.symValue": ["Value {n}", "Değer {n}", "ค่า {n}"], "ui.symWeight": ["Weight {n}", "Ağırlık {n}", "น้ำหนัก {n}"], "ui.patCells": ["{n} cells", "{n} hücre", "{n} ช่อง"], "ui.patMult": ["x{n}", "x{n}", "x{n}"], "ui.patPlaces": ["{n} placements", "{n} konum", "{n} ตำแหน่ง"],
  // ---- collection, shelf, sheet ----
  "ui.collTitle": ["Collection", "Koleksiyon", "คลังสะสม"], "ui.tabAch": ["Achievements", "Başarılar", "ความสำเร็จ"], "ui.tabSeen": ["Charms", "Tılsımlar", "เครื่องราง"], "ui.tabEndings": ["Endings", "Sonlar", "ตอนจบ"],
  "ui.achCount": ["{a} of {b} done", "{a}/{b} tamam", "สำเร็จ {a} จาก {b}"], "ui.seenCount": ["{a} of {b} charms seen", "{a}/{b} tılsım görüldü", "เห็นแล้ว {a} จาก {b}"], "ui.unseen": ["Not seen yet", "Henüz görülmedi", "ยังไม่เคยเห็น"],
  "ui.lockedBy": ["Locked: {how}", "Kilitli: {how}", "ล็อก: {how}"], "ui.rewardWax": ["+{n} Wax", "+{n} Balmumu", "ขี้ผึ้ง +{n}"], "ui.rewardCharm": ["Unlocks the charm {name}", "{name} tılsımını açar", "ปลดล็อกเครื่องราง {name}"], "ui.rewardChar": ["Unlocks {name}", "{name} karakterini açar", "ปลดล็อก {name}"],
  "ui.noEnding": ["Not reached yet", "Henüz ulaşılmadı", "ยังไปไม่ถึง"],
  "ui.shelfTitle": ["Your charms", "Tılsımların", "เครื่องรางของเธอ"], "ui.cursesTitle": ["Your curses", "Lanetlerin", "คำสาปของเธอ"], "ui.tricksTitle": ["Your tricks", "Numaraların", "กลเม็ดของเธอ"],
  "ui.emptySlot": ["Empty slot", "Boş yuva", "ช่องว่าง"], "ui.noCurseYet": ["No curses. Brimble is disappointed.", "Hiç lanet yok. Brimble hayal kırıklığında.", "ยังไม่มีคำสาป บริมเบิลผิดหวัง"], "ui.slotsN": ["{a} of {b} slots", "{a}/{b} yuva", "ใช้ {a} จาก {b} ช่อง"],
  "ui.tapInspect": ["Tap an item to read it.", "Okumak için bir öğeye dokun.", "แตะไอเทมเพื่ออ่าน"], "ui.family": ["Family: {name}", "Aile: {name}", "สาย: {name}"], "ui.sellFor": ["Sell for {n}", "{n} karşılığında sat", "ขายได้ {n}"],
  "ui.curseHeld": ["A curse. It stays until the run ends.", "Bir lanet. Oyun bitene dek kalır.", "คำสาป อยู่จนจบเกม"], "ui.dealOnce": ["Taken from a deal.", "Bir anlaşmadan geldi.", "มาจากข้อตกลง"],
  // ---- speech lines ----
  "line.brimble.home.1": ["Three nights. Sixty coins. Or I take the candle. Company policy.", "Üç gece. Altmış para. Yoksa mumu alırım. Şirket politikası.", "สามคืน หกสิบเหรียญ ไม่งั้นฉันเอาเทียนไป นโยบายบริษัท"],
  "line.brimble.home.2": ["Back already? The paperwork missed you.", "Yine mi geldin? Evraklar seni özledi.", "กลับมาแล้วเหรอ เอกสารคิดถึงเธอนะ"], "line.brimble.home.3": ["The machine is fine. It is held together with string, but fine.", "Makine iyi. İpla tutuyor ama iyi.", "เครื่องไม่เป็นไร ผูกด้วยเชือกอยู่ แต่ไม่เป็นไร"],
  "line.brimble.start.1": ["Sixty coins. Take your time. Not too much.", "Altmış para. Acele etme. Çok da etme.", "หกสิบเหรียญ ค่อยๆ ทำ แต่อย่าช้านัก"], "line.brimble.start.2": ["Sign here. No, the small print is for me.", "Buraya imzala. Hayır, dipnot benim.", "เซ็นตรงนี้ ไม่ใช่ ตัวเล็กๆ นั่นของฉัน"],
  "line.brimble.stoke.1": ["More Heat. I like a customer with ambition.", "Daha çok Ateş. Hırslı müşteriyi severim.", "ไฟแรงขึ้นอีก ฉันชอบลูกค้ามีความทะเยอทะยาน"], "line.brimble.stoke.2": ["Warm in here, isn't it?", "Buralar ısındı, değil mi?", "ในนี้ร้อนขึ้นนะ จริงไหม"],
  "line.brimble.heatHigh.1": ["You're pushing the Heat. I admire that in a customer I am about to lose.", "Ateşi zorluyorsun. Kaybetmek üzere olduğum müşteride bunu takdir ederim.", "เธอเร่งไฟแรงนะ ฉันชื่นชมลูกค้าที่กำลังจะหลุดมือ"], "line.brimble.heatHigh.2": ["That is a lot of Heat. The machine is fine. Probably.", "Bu çok Ateş. Makine iyi. Muhtemelen.", "ไฟแรงมากเลย เครื่องไม่เป็นไร คงงั้น"],
  "line.brimble.scorch.1": ["The machine is fine. Your purse is lighter. Everyone learns.", "Makine iyi. Kesen hafifledi. Herkes öğrenir.", "เครื่องไม่เป็นไร ถุงเงินเธอเบาลง ทุกคนต้องเรียนรู้"], "line.brimble.scorch.2": ["Ash. Such a shame. I will keep the ash.", "Kül. Çok yazık. Külü ben alırım.", "เถ้า น่าเสียดาย เถ้านั่นฉันเก็บเอง"],
  "line.brimble.dud.1": ["Nothing. It happens. Ask the candle.", "Hiçbir şey. Olur. Muma sor.", "ไม่ได้อะไรเลย เกิดขึ้นได้ ไปถามเทียนดู"], "line.brimble.dud.2": ["That was luck. Luck is not in the contract.", "Bu şanstı. Şans sözleşmede yok.", "นั่นคือโชค โชคไม่อยู่ในสัญญา"],
  "line.brimble.big.1": ["Hm. Do that again and I will have to read the contract.", "Hm. Bir daha yaparsan sözleşmeyi okumam gerekecek.", "อืม ทำแบบนั้นอีกฉันต้องไปอ่านสัญญาแล้ว"], "line.brimble.big.2": ["Lovely. Officially I did not see it.", "Güzel. Resmen görmedim.", "สวยมาก ทางการแล้วฉันไม่เห็น"],
  "line.brimble.paid.1": ["Paid. I will pretend I am pleased.", "Ödendi. Memnunmuş gibi yapacağım.", "จ่ายแล้ว ฉันจะทำเป็นดีใจ"], "line.brimble.paid.2": ["Stamped. On to the next page.", "Mühürlendi. Sıradaki sayfaya.", "ประทับตราแล้ว ไปหน้าถัดไป"], "line.brimble.paid.3": ["Early? You are making me look bad.", "Erken mi? Beni kötü gösteriyorsun.", "เร็วขนาดนี้เหรอ เธอทำให้ฉันดูแย่นะ"],
  "line.brimble.deal.1": ["A deal. Good for you now. Good for me later. That is what a deal is.", "Bir anlaşma. Şimdi sana iyi. Sonra bana iyi. Anlaşma dediğin bu.", "ข้อตกลง ตอนนี้ดีกับเธอ ทีหลังดีกับฉัน ข้อตกลงก็แบบนี้"], "line.brimble.deal.2": ["Read it. Or don't. Most don't.", "Oku. Ya da okuma. Çoğu okumaz.", "อ่านก็ได้ ไม่อ่านก็ได้ ส่วนใหญ่ไม่อ่านกัน"], "line.brimble.deal.3": ["I wrote this clause in a smaller pen on purpose.", "Bu maddeyi bilerek daha küçük kalemle yazdım.", "ข้อนี้ฉันจงใจเขียนด้วยปากกาเล็กกว่า"],
  "line.brimble.signed.1": ["Pleasure. I mean it, for once.", "Memnuniyetle. Bu sefer gerçekten.", "ยินดี ครั้งนี้พูดจริง"], "line.brimble.signed.2": ["Signed. No take-backs. Company policy.", "İmzalandı. Geri dönüş yok. Şirket politikası.", "เซ็นแล้ว คืนไม่ได้ นโยบายบริษัท"],
  "line.brimble.refuse.1": ["Clean hands. How dull.", "Temiz eller. Ne sıkıcı.", "มือสะอาด น่าเบื่อจริง"], "line.brimble.refuse.2": ["Refused. I will keep the pen warm.", "Reddedildi. Kalemi sıcak tutarım.", "ปฏิเสธเหรอ ฉันจะเก็บปากกาไว้ให้อุ่น"],
  "line.brimble.pawn.1": ["One more night, for one small fee. You will barely notice.", "Bir gece daha, küçük bir ücretle. Fark bile etmezsin.", "อีกหนึ่งคืน แลกค่าธรรมเนียมนิดเดียว เธอแทบไม่รู้สึก"], "line.brimble.pawn.2": ["Burn something you love. It is the only currency I trust.", "Sevdiğin bir şeyi yak. Güvendiğim tek para birimi bu.", "เผาของที่เธอรัก มันเป็นเงินตราเดียวที่ฉันเชื่อใจ"],
  "line.brimble.lose.1": ["Three nights. Sixty coins. Or I take the candle. I did say.", "Üç gece. Altmış para. Yoksa mumu alırım. Söylemiştim.", "สามคืน หกสิบเหรียญ ไม่งั้นเอาเทียน ฉันบอกแล้ว"], "line.brimble.lose.2": ["Do not look at me like that. I will relight it. You are a paying customer.", "Bana öyle bakma. Yeniden yakacağım. Ödeme yapan müşterisin.", "อย่ามองฉันแบบนั้น ฉันจะจุดให้ใหม่ เธอเป็นลูกค้าที่จ่ายเงิน"], "line.brimble.lose.3": ["The snuffer is not personal. It is stationery.", "Söndürücü kişisel değil. Kırtasiye.", "ที่ดับเทียนไม่ใช่เรื่องส่วนตัว มันคือเครื่องเขียน"],
  "line.brimble.win.1": ["Paid in full. I have never seen that. Do not tell Head Office.", "Tamamen ödendi. Hiç görmemiştim. Genel Merkez'e söyleme.", "จ่ายครบ ไม่เคยเห็นมาก่อน อย่าบอกสำนักงานใหญ่"], "line.brimble.win.2": ["You won. I will deny it.", "Kazandın. Reddedeceğim.", "เธอชนะ ฉันจะปฏิเสธ"],
  "line.pip.shop.1": ["Everything is half-price, if the price is doubled first.", "Her şey yarı fiyat, fiyatı önce ikiye katlarsan.", "ของทุกอย่างลดครึ่งราคา ถ้าขึ้นราคาเป็นสองเท่าก่อน"], "line.pip.shop.2": ["Buy two. Brimble does not count the wagon.", "İki tane al. Brimble arabayı saymıyor.", "ซื้อสองชิ้นเลย บริมเบิลไม่นับรถเข็น"], "line.pip.shop.3": ["That one hums. It is either good or haunted.", "Şu mırıldanıyor. Ya iyi ya da perili.", "อันนั้นฮัมเพลงได้ ไม่ดีก็ผีสิง"],
  "line.nim.start.1": ["Sixty coins. I've paid more for worse.", "Altmış para. Daha kötüsüne daha fazlasını ödedim.", "หกสิบเหรียญ ฉันเคยจ่ายแพงกว่านี้กับของแย่กว่า"], "line.nim.start.2": ["I am not lucky. I am organised.", "Şanslı değilim. Düzenliyim.", "ฉันไม่ได้โชคดี ฉันแค่จัดการเป็น"],
  "line.nim.paid.1": ["One down. I am counting.", "Biri bitti. Sayıyorum.", "ไปหนึ่งก้อน ฉันนับอยู่"], "line.nim.paid.2": ["You wrote this clause in a smaller pen.", "Bu maddeyi daha küçük kalemle yazmışsın.", "ข้อนี้คุณเขียนด้วยปากกาเล็กกว่า"],
  "line.nim.scorch.1": ["That was my money.", "O benim paramdı.", "นั่นเงินของฉัน"], "line.nim.scorch.2": ["Noted. Never again. Probably.", "Not aldım. Bir daha asla. Herhalde.", "จดไว้แล้ว ไม่ทำอีก คงงั้น"],
  "line.nim.lose.1": ["Fine. Light it again. I'll do it better.", "Peki. Yeniden yak. Daha iyisini yapacağım.", "ก็ได้ จุดใหม่เถอะ รอบหน้าฉันทำดีกว่านี้"], "line.nim.lose.2": ["I read everything this time. It did not help.", "Bu sefer hepsini okudum. Yardımı olmadı.", "รอบนี้ฉันอ่านทุกบรรทัด ก็ไม่ช่วยอะไร"],
};

const EN = {}, TR = {}, TH = {};
for (const [k, [e, r, h]] of Object.entries(T)) { EN[k] = e; TR[k] = r; TH[k] = h; }

export const STRINGS = { en: EN, tr: TR, th: TH };
export const LANGS = ['en', 'tr', 'th'];
let lang = 'en';

export const detectLang = () => {
  const n = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
  return /^tr/i.test(n) ? 'tr' : /^th/i.test(n) ? 'th' : 'en';
};
export const setLang = (l) => { lang = STRINGS[l] ? l : detectLang(); if (typeof document !== 'undefined') document.documentElement.lang = lang; };
export const getLang = () => lang;
export const fmt = (n) => Number(n).toLocaleString(lang); // 1,234 in English, 1.234 in Turkish
export const t = (key, vars = {}) =>
  (STRINGS[lang][key] ?? EN[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (typeof vars[k] === 'number' ? fmt(vars[k]) : (vars[k] ?? '')));
// Content from the data JSON: { en, tr, th } -> the current language, English when a language is missing.
export const L = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.en || ''));
// Data texts carry {c:N}: N coins times the price scale S of the current debt.
export const coinText = (o, S = 1) => L(o).replace(/\{c:([\d.]+)\}/g, (_, n) => fmt(Math.round(Number(n) * S)));
// Uses `<key>.one` when n is 1 and that key exists, else `<key>`; {n} is filled in.
export const plural = (n, key, vars = {}) => t(n === 1 && (key + '.one') in EN ? key + '.one' : key, { n, ...vars });
// How many variants line.<who>.<trigger>.<n> has (0 if none); the picker chooses an index and never repeats it twice in a row.
export const lineCount = (who, trigger) => { let n = 0; while (`line.${who}.${trigger}.${n + 1}` in EN) n++; return n; };
