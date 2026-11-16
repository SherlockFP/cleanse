// UI strings only (en, tr, th). Item, symbol, pattern and deal text comes from the data JSON ({en,tr,th} fields), read with L().
// One table: key -> [en, tr, th]. Every key has all three by construction; scripts/check-i18n.mjs also checks placeholders and wording.
// Speech lines are line.<who>.<trigger>.<n> (numbered from 1). Triggers the game can say():
//   brimble (Mr. Ruby): home start stoke heatHigh scorch dud big paid deal signed refuse pawn lose win tutDeal   pip: shop tutShop   nim: start paid scorch lose
import { T3 } from './ui/strings-v3.js';
const T = {
  // ---- common ----
  "ui.title": ["Rags to Rubies", "Sıfırdan Zirveye", "จากศูนย์สู่เศรษฐี"],
  "ui.tagline": ["Broke in Bangkok. One devil, one fortune machine, one way up.", "Bangkok'ta beş parasız. Bir şeytan, bir fal makinesi, tek yol yukarı.", "หมดตัวกลางกรุงเทพฯ ปีศาจหนึ่งตน ตู้ดูดวงหนึ่งตู้ ทางเดียวคือขึ้น"],
  "ui.play": ["Play", "Oyna", "เล่น"], "ui.continue": ["Continue", "Devam", "ไปต่อ"], "ui.close": ["Close", "Kapat", "ปิด"], "ui.back": ["Back", "Geri", "กลับ"],
  "ui.cancel": ["Cancel", "Vazgeç", "ยกเลิก"], "ui.on": ["On", "Açık", "เปิด"], "ui.off": ["Off", "Kapalı", "ปิด"], "ui.loading": ["Loading", "Yükleniyor", "กำลังโหลด"],
  "ui.coins": ["coins", "para", "เหรียญ"], "ui.purse": ["Purse", "Kese", "ถุงเงิน"], "ui.wick": ["Caps", "Kapak", "ฝาขวด"], "ui.wax": ["Stash", "Birikim", "เงินเก็บ"],
  "ui.luck": ["Luck", "Şans", "โชค"], "ui.heat": ["Spice", "Acı", "เผ็ด"], "ui.interest": ["Interest", "Faiz", "ดอกเบี้ย"], "ui.fav": ["Special", "Gözde", "เมนูเด็ด"],
  "ui.favHidden": ["Hidden", "Gizli", "ซ่อนอยู่"], "ui.redrawFree": ["Tap the Special to redraw it: free", "Gözdeyi değiştirmek için dokun: bedava", "แตะเมนูเด็ดเพื่อสุ่มใหม่: ฟรี"],
  "ui.redrawWick": ["Tap the Special to redraw it: {n} Caps", "Gözdeyi değiştirmek için dokun: {n} Kapak", "แตะเมนูเด็ดเพื่อสุ่มใหม่: {n} ฝาขวด"], "ui.boss": ["Boss debt. {name}: {rule}", "Patron borcu. {name}: {rule}", "บอสประจำก้อนนี้ {name}: {rule}"], "ui.nim": ["Nim", "Nim", "นิ่ม"], "ui.brimble": ["Mr. Ruby", "Bay Ruby", "เฮียรูบี้"], "ui.pip": ["Pip", "Pip", "ปิ๊บ"],
  "ui.rarity.common": ["Common", "Sıradan", "ทั่วไป"], "ui.rarity.uncommon": ["Uncommon", "Seyrek", "พิเศษ"], "ui.rarity.rare": ["Rare", "Nadir", "หายาก"], "ui.rarity.legendary": ["Legendary", "Efsanevi", "ในตำนาน"],
  "ui.price": ["Price", "Fiyat", "ราคา"], "ui.free": ["Free", "Bedava", "ฟรี"], "ui.stack": ["Charge {n}", "Yük {n}", "สะสม {n}"],
  "why.coins": ["Not enough coins in the purse.", "Kesede yeterli para yok.", "เหรียญในถุงเงินไม่พอ"], "why.wick": ["Not enough Caps.", "Yeterli Kapak yok.", "ฝาขวดไม่พอ"],
  "why.wax": ["Not enough Stash.", "Yeterli Birikim yok.", "เงินเก็บไม่พอ"], "why.full": ["Your shelf is full. Sell a charm first.", "Raf dolu. Önce bir tılsım sat.", "ชั้นเต็มแล้ว ขายไอเท็มก่อน"],
  "why.max": ["Already at the maximum.", "Zaten en üstte.", "เต็มแล้ว"], "why.locked": ["Locked.", "Kilitli.", "ยังล็อกอยู่"], "why.unknown": ["That did not work.", "Olmadı.", "ไม่สำเร็จ"],
  "why.noLock": ["No locking on this contract.", "Bu sözleşmede kilitleme yok.", "สัญญานี้ล็อกของไม่ได้"],   "ui.endNight": ["END NIGHT", "GECEYİ BİTİR", "จบคืนนี้"],
  "ui.bankAfter": ["Collect first, then pay.", "Önce topla, sonra öde.", "เก็บเงินก่อน แล้วค่อยจ่าย"],
  "ui.promptPair": ["Tap two cells side by side", "Yan yana iki hücreye dokun", "แตะสองช่องที่อยู่ติดกัน"],
  "ui.scorched": ["Flare-up! {n} coins burned.", "Parlama! {n} para yandı.", "ไฟลุก! เสียไป {n} เหรียญ"],
  "ui.newCurse": ["New curse: {name}", "Yeni lanet: {name}", "คำสาปใหม่: {name}"],
  "ui.pickCharm": ["Pick a charm to start with", "Başlangıç için bir tılsım seç", "เลือกไอเท็มหนึ่งชิ้นไว้เริ่มเล่น"],
  "ui.noPattern": ["No pattern", "Desen yok", "ไม่มีลาย"],
  "why.target": ["That does nothing there.", "Orada işe yaramaz.", "ใช้ตรงนั้นไม่ได้ผล"],
  "tut.spin": ["Tap SPIN. Three of one symbol in a row or a column pays.", "ÇEVİR'e dokun. Aynı sembolden üçü yan yana ya da alt alta gelirse kazanırsın.", "แตะ “หมุน” สัญลักษณ์เดียวกันสามตัวเรียงแถวนอนหรือแถวตั้งจะได้เหรียญ"],
  "tut.collect": ["Tap COLLECT to take this result.", "Bu sonucu almak için TOPLA'ya dokun.", "แตะ “เก็บเงิน” เพื่อรับเหรียญตานี้"],
  "tut.nudge": ["Try the Nudge: tap the trick, then the lit column.", "Dürtmeyi dene: numaraya, sonra parlayan sütuna dokun.", "ลองใช้สะกิด: แตะกลเม็ด แล้วแตะแถวตั้งที่สว่าง"],
  "tut.stoke": ["SPICE UP adds Spice: more pay, but more Soot. Three Soot is a Flare-up and burns your purse.", "ACILANDIR Acı ekler: daha çok kazanç, ama daha çok İs. Üç İs bir Parlamadır, keseni yakar.", "กด “เพิ่มเผ็ด” เพื่อเร่งไฟ: ได้เงินมากขึ้น แต่เขม่าก็มากขึ้น เขม่าครบสามตัวคือไฟลุก ถุงเงินจะไหม้"],
  "tut.end": ["Night over. BANK pays the debt. Coins you keep earn interest. Then END NIGHT.", "Gece bitti. ÖDE borcu kapatır. Kesede kalan para faiz kazanır. Sonra GECEYİ BİTİR.", "หมดคืนแล้ว กด “จ่ายหนี้” เพื่อใช้หนี้ เหรียญที่เก็บไว้ได้ดอกเบี้ย แล้วกด “จบคืนนี้”"],
  "line.pip.tutShop.1": ["Charms work on their own every spin. Buy one you can pay for.", "Tılsımlar her çevirmede kendiliğinden çalışır. Paranın yettiği birini al.", "ไอเท็มทำงานเองทุกครั้งที่หมุน ซื้อชิ้นที่จ่ายไหวสักชิ้น"],
  "line.brimble.tutDeal.1": ["SIGN: a boon now and a curse for the whole run. REFUSE: three Caps, no curse.", "İMZALA: şimdi bir lütuf, oyun boyu bir lanet. REDDET: üç Kapak, lanet yok.", "เซ็น: ได้ของดีทันที แต่ติดคำสาปทั้งรอบ ปฏิเสธ: ได้ฝาขวดสามฝา ไม่มีคำสาป"],
"why.busy": ["Wait for the reels.", "Makine dönerken bekle.", "รอให้วงล้อหยุดก่อน"],
  // ---- home, hideout ----
  "ui.hideout": ["Home", "Ev", "บ้าน"], "ui.hideoutSub": ["Your place. It grows with you. Spend Stash on it between runs.", "Senin yerin. Seninle büyür. Oyunlar arasında Birikim harca.", "บ้านของคุณ โตไปพร้อมกัน ใช้เงินเก็บแต่งระหว่างรอบ"],
  "ui.waxHave": ["{n} Stash", "{n} Birikim", "เงินเก็บ {n}"], "ui.buy": ["Buy", "Satın al", "ซื้อ"], "ui.owned": ["Owned", "Alındı", "เป็นของคุณแล้ว"],
  "ui.waxMore": ["{n} more Stash", "{n} Birikim daha", "ขาดเงินเก็บ {n}"], "ui.bought": ["Bought: {name}", "Alındı: {name}", "ซื้อแล้ว: {name}"],
  "ui.collection": ["Collection", "Koleksiyon", "คลังสะสม"], "ui.daily": ["Daily run", "Günlük oyun", "เกมประจำวัน"], "ui.store": ["Store", "Mağaza", "ร้านค้า"],
  "ui.settings": ["Settings", "Ayarlar", "ตั้งค่า"], "ui.howto": ["How to play", "Nasıl oynanır", "วิธีเล่น"], "ui.language": ["Language", "Dil", "ภาษา"],
  "ui.langEn": ["English", "English", "English"], "ui.langTr": ["Türkçe", "Türkçe", "Türkçe"], "ui.langTh": ["ไทย", "ไทย", "ไทย"],
  "ui.firstRunHint": ["First night? Press Play. Mr. Ruby explains as you go.", "İlk gece mi? Oyna'ya bas. Bay Ruby yolda anlatır.", "คืนแรกใช่ไหม กดเล่นได้เลย เฮียรูบี้จะอธิบายระหว่างทาง"],
  // ---- character, contract ----
  "ui.chooseChar": ["Who signs tonight?", "Bu gece kim imzalıyor?", "คืนนี้ใครเซ็น"], "ui.locked": ["Locked", "Kilitli", "ล็อก"], "ui.unlockBy": ["Unlock: {how}", "Açmak için: {how}", "ปลดล็อก: {how}"],
  "ui.chooseContract": ["Choose a contract", "Bir sözleşme seç", "เลือกสัญญา"], "ui.debtsN": ["{n} debts", "{n} borç", "หนี้ {n} ก้อน"], "ui.nightsPer": ["{n} nights per debt", "Borç başına {n} gece", "ก้อนละ {n} คืน"],
  "ui.reward": ["Reward: {n} Stash", "Ödül: {n} Birikim", "รางวัล: เงินเก็บ {n}"], "ui.cleared": ["Cleared", "Bitirildi", "ผ่านแล้ว"], "ui.clearFirst": ["Clear {name} first", "Önce {name} sözleşmesini bitir", "ผ่าน {name} ก่อน"],
  "ui.start": ["Start", "Başla", "เริ่ม"], "ui.endingTag": ["Ending: {name}", "Son: {name}", "ตอนจบ: {name}"],
  // ---- HUD ----
  "ui.debtOf": ["Debt {n} of {m}", "Borç {n}/{m}", "หนี้ {n} จาก {m}"], "ui.nightOf": ["Night {n} of {m}", "Gece {n}/{m}", "คืนที่ {n} จาก {m}"], "ui.spinsN": ["Spins {n}", "Çeviriş {n}", "หมุนได้ {n}"],
  "ui.owed": ["{a} / {b}", "{a} / {b}", "{a} / {b}"],
  "ui.goal": ["Pay {left} more to clear debt {n} of {m} by the end of night {r}.", "{n}/{m}. borcu kapatmak için {r}. gecenin sonuna kadar {left} daha öde.", "จ่ายอีก {left} ให้หมดหนี้ก้อนที่ {n} จาก {m} ก่อนจบคืนที่ {r}"],
  "ui.goalDone": ["Debt covered. Finish the night or pay it now.", "Borç karşılandı. Geceyi bitir ya da şimdi öde.", "หนี้ครบแล้ว เล่นให้จบคืนหรือจ่ายเลย"],
  "ui.interestNext": ["Next interest", "Sıradaki faiz", "ดอกเบี้ยรอบหน้า"], "ui.heatLabel": ["Spice {n}", "Acı {n}", "เผ็ด {n}"], "ui.heatPay": ["+{n}% pay", "+%{n} kazanç", "จ่ายเพิ่ม {n}%"],
  "ui.stoke": ["SPICE UP", "ACILANDIR", "เพิ่มเผ็ด"], "ui.bank": ["BANK", "ÖDE", "จ่ายหนี้"], "ui.spin": ["SPIN", "ÇEVİR", "หมุน"], "ui.collect": ["COLLECT", "TOPLA", "เก็บเงิน"],
  "ui.owedLeft": ["{n} owed", "{n} borç", "ค้าง {n}"], "ui.stokeWhy": ["More Spice: more pay, more Soot.", "Daha çok Acı: daha çok kazanç, daha çok İs.", "เผ็ดขึ้น: จ่ายเพิ่ม เขม่าเพิ่ม"],
  "ui.stokeMax": ["Spice is at the top.", "Acı en üstte.", "เผ็ดสุดแล้ว"], "ui.stokeNo": ["No spicing up tonight.", "Bu gece acılandırma yok.", "คืนนี้เพิ่มเผ็ดไม่ได้"],
  "ui.noSpins": ["No spins left tonight.", "Bu gece çeviriş kalmadı.", "คืนนี้หมดตาหมุนแล้ว"],
  "ui.bankTitle": ["Pay into the debt", "Borca öde", "จ่ายเข้าหนี้"], "ui.bankAll": ["All", "Hepsi", "ทั้งหมด"], "ui.bankHalf": ["Half", "Yarısı", "ครึ่งหนึ่ง"],
  "ui.bankDo": ["Bank {n}", "{n} öde", "จ่าย {n}"], "ui.bankNote": ["Banked coins are safe from a Flare-up but earn no interest.", "Ödenen para Parlamadan korunur ama faiz getirmez.", "เหรียญที่จ่ายแล้วปลอดภัยจากไฟลุก แต่ไม่ได้ดอกเบี้ย"],
  "ui.bankNone": ["Nothing in the purse to pay.", "Kesede ödenecek para yok.", "ไม่มีเหรียญในถุงให้จ่าย"],
  "ui.pockets": ["Tricks", "Numaralar", "กลเม็ด"], "ui.pocketEmpty": ["Empty pocket", "Boş cep", "กระเป๋าว่าง"],
  "ui.trickPre": ["Use it before the spin.", "Çevirmeden önce kullan.", "ใช้ก่อนหมุน"], "ui.trickPost": ["Use it after the reels stop.", "Makine durunca kullan.", "ใช้หลังวงล้อหยุด"],
  "ui.trickShop": ["Use it at the stall.", "Tezgâhta kullan.", "ใช้ที่แผง"], "ui.trickAuto": ["It works by itself when needed.", "Gerektiğinde kendiliğinden çalışır.", "ทำงานเองเมื่อจำเป็น"],
  "ui.shelf": ["Charms", "Tılsımlar", "ไอเท็ม"], "ui.curses": ["Curses", "Lanetler", "คำสาป"],
  "ui.promptColumn": ["Tap a column", "Bir sütuna dokun", "แตะแถวตั้งหนึ่งแถว"], "ui.promptRow": ["Tap a row", "Bir satıra dokun", "แตะแถวนอนหนึ่งแถว"],
  "ui.promptCell": ["Tap a cell", "Bir hücreye dokun", "แตะหนึ่งช่อง"], "ui.promptSymbol": ["Tap a symbol", "Bir sembole dokun", "แตะสัญลักษณ์"],
  // ---- terms ----
  "ui.termsTitle": ["Tonight's terms", "Bu gecenin şartları", "เงื่อนไขคืนนี้"], "ui.termsSub": ["Pick one card. It sets the spins and a rule for this night.", "Bir kart seç. Bu gecenin çeviriş sayısını ve kuralını belirler.", "เลือกหนึ่งใบ กำหนดจำนวนหมุนและกฎของคืนนี้"],
  "ui.spinsBadge": ["{n} spins", "{n} çeviriş", "หมุน {n} ตา"],
  "ui.whenPre": ["Before the spin", "Çevirmeden önce", "ก่อนหมุน"], "ui.whenPost": ["After the reels stop", "Makine durunca", "หลังวงล้อหยุด"], "ui.whenAny": ["Any time", "Her zaman", "ได้ทุกเวลา"],
  "ui.whenShop": ["At the stall", "Tezgâhta", "ที่แผง"], "ui.whenAuto": ["Automatic", "Otomatik", "ทำงานเอง"],
  // ---- shop ----
  "ui.wagon": ["Pip's stall", "Pip'in tezgâhı", "แผงของปิ๊บ"], "ui.tabCharms": ["Charms", "Tılsımlar", "ไอเท็ม"], "ui.tabTricks": ["Tricks", "Numaralar", "กลเม็ด"], "ui.tabBench": ["Bench", "Tezgâh", "โต๊ะช่าง"],
  "ui.reroll": ["Reroll {n}", "Yenile {n}", "สุ่มใหม่ {n}"], "ui.lock": ["Lock", "Kilitle", "ล็อก"], "ui.unlock": ["Unlock", "Kilidi aç", "ปลดล็อก"], "ui.sell": ["Sell {n}", "Sat {n}", "ขาย {n}"],
  "ui.sold": ["Sold", "Satıldı", "ขายแล้ว"], "ui.slotBuy": ["Extra charm slot", "Fazladan tılsım yuvası", "ช่องไอเท็มเพิ่ม"], "ui.slotText": ["Hold one more charm. Once per run.", "Bir tılsım daha taşı. Oyun başına bir kez.", "ถือไอเท็มได้อีกชิ้น ครั้งเดียวต่อเกม"],
  "ui.yourCharms": ["Your charms ({n}/{m})", "Tılsımların ({n}/{m})", "ไอเท็มของคุณ ({n}/{m})"], "ui.moveLeft": ["Move left", "Sola taşı", "ย้ายซ้าย"], "ui.moveRight": ["Move right", "Sağa taşı", "ย้ายขวา"],
  "ui.orderNote": ["Charms work left to right. Order matters.", "Tılsımlar soldan sağa çalışır. Sıra önemli.", "ไอเท็มทำงานจากซ้ายไปขวา ลำดับมีผล"],
  "ui.nextNight": ["Leave the stall", "Tezgâhtan ayrıl", "ออกจากแผง"], "ui.benchSymbol": ["Which symbol?", "Hangi sembol?", "สัญลักษณ์ไหน"], "ui.benchCurse": ["Which curse?", "Hangi lanet?", "คำสาปไหน"],
  "ui.noCurses": ["You carry no curses.", "Hiç lanetin yok.", "ยังไม่มีคำสาป"], "ui.shopEmpty": ["Nothing left on this table.", "Bu tezgâhta bir şey kalmadı.", "โต๊ะนี้ของหมดแล้ว"],
  "ui.benchNote": ["Bench work changes the machine for the rest of the run.", "Tezgâh işleri makineyi oyunun sonuna dek değiştirir.", "งานช่างเปลี่ยนเครื่องไปตลอดเกม"],
  "ui.symVal": ["value {v}", "değer {v}", "ค่า {v}"], "ui.symRemoved": ["removed", "çıkarıldı", "ถอดแล้ว"],
  // ---- deal, pawn ----
  "ui.dealTitle": ["Mr. Ruby has a paper for you", "Bay Ruby'nin sana bir kâğıdı var", "เฮียรูบี้มีกระดาษให้เซ็น"], "ui.boon": ["You get", "Sen alırsın", "ที่ได้"], "ui.curseLabel": ["You carry", "Sen taşırsın", "ที่ต้องแบก"],
  "ui.sign": ["SIGN", "İMZALA", "เซ็น"], "ui.refuse": ["REFUSE", "REDDET", "ปฏิเสธ"], "ui.refuseNote": ["Refuse both: +{n} Caps.", "İkisini de reddet: +{n} Kapak.", "ปฏิเสธทั้งสอง: ฝาขวด +{n}"],
  "ui.mustSign": ["Under this contract you must sign one.", "Bu sözleşmede birini imzalamak zorundasın.", "สัญญานี้ต้องเซ็นหนึ่งใบ"], "ui.forever": ["Lasts the whole run.", "Oyun boyunca sürer.", "อยู่ไปตลอดเกม"],
  "ui.randomCurses": ["{n} random curses", "{n} rastgele lanet", "คำสาปสุ่ม {n} อย่าง"], "ui.randomCurse": ["A random curse", "Rastgele bir lanet", "คำสาปสุ่มหนึ่งอย่าง"],
  "ui.pawnTitle": ["The Pawn", "Rehin", "จำนำ"], "ui.pawnSub": ["You are short. Mr. Ruby gives you one more night if you burn a charm and take a random curse. Once per run.", "Eksiksin. Bir tılsımı yakıp rastgele bir lanet alırsan Bay Ruby sana bir gece daha verir. Oyunda bir kez.", "คุณยังขาด ถ้าเผาไอเท็มหนึ่งชิ้นและรับคำสาปสุ่ม เฮียรูบี้ให้เพิ่มอีกหนึ่งคืน ครั้งเดียวต่อเกม"],
  "ui.pawnBurn": ["Burn it", "Yak", "เผา"], "ui.pawnDecline": ["Walk away", "Vazgeç", "ยอมแพ้"], "ui.pawnNone": ["You have no charm to burn.", "Yakacak tılsımın yok.", "ไม่มีไอเท็มให้เผา"],
  // ---- paid, end ----
  "ui.paidTitle": ["Debt paid", "Borç ödendi", "ปลดหนี้แล้ว"], "ui.paidStamp": ["PAID", "ÖDENDİ", "จ่ายแล้ว"], "ui.paidEarly": ["{n} nights unused: +{w} Caps, {s} spins carried to the next debt and a free trick.", "{n} gece kullanılmadı: +{w} Kapak, sonraki borca {s} çeviriş ve bedava bir numara.", "เหลือ {n} คืน: ฝาขวด +{w} หมุนเพิ่ม {s} ตาในหนี้ก้อนถัดไป และกลเม็ดฟรี"],
  "ui.skipNight": ["Skip this night: {r}", "Bu geceyi atla: {r}", "ข้ามคืนนี้: {r}"],
  "ui.skipNote": ["No spins tonight. Interest still pays and the stall still opens.", "Bu gece çeviriş yok. Faiz yine işler, tezgâh yine açılır.", "คืนนี้ไม่ได้หมุน แต่ยังได้ดอกเบี้ยและแผงยังเปิด"],
  "ui.endlessSub": ["Stop here and collect, or keep going. The debts keep growing, and every one you pay counts.", "Burada dur ve kazancını al ya da devam et. Borçlar büyümeye devam eder, ödediğin her biri sayılır.", "หยุดตรงนี้แล้วรับรางวัล หรือเล่นต่อ หนี้จะโตขึ้นเรื่อยๆ ทุกก้อนที่ปลดได้นับเป็นคะแนน"],
  "ui.endlessGo": ["Keep going", "Devam et", "เล่นต่อ"], "ui.endlessStop": ["Collect", "Kazancını al", "รับรางวัล"],
  "ui.statEndless": ["Debts paid after the contract", "Sözleşmeden sonra ödenen borç", "หนี้ที่ปลดหลังจบสัญญา"],
  "ui.paidInterest": ["Interest earned: {n}", "Kazanılan faiz: {n}", "ดอกเบี้ยที่ได้: {n}"], "ui.paidKept": ["Purse carried over: {n}", "Devreden kese: {n}", "ถุงเงินยกไป: {n}"],
  "ui.paidNext": ["Next debt: {n}", "Sıradaki borç: {n}", "หนี้ก้อนถัดไป: {n}"], "ui.toDeal": ["See Mr. Ruby's offer", "Bay Ruby'nin teklifine bak", "ดูข้อเสนอของเฮียรูบี้"],
  "ui.savedTitle": ["Saved at the last second", "Son saniyede kurtuldun", "รอดในวินาทีสุดท้าย"], "ui.savedBy": ["{name} burned so you could stay.", "{name} yandı, sen kaldın.", "{name} ถูกเผาเพื่อให้คุณอยู่ต่อ"],
  "ui.lostTitle": ["Mr. Ruby collects", "Bay Ruby tahsil ediyor", "เฮียรูบี้มาเก็บหนี้"], "ui.lostSub": ["The jar lid screws shut on night {r} of debt {d}.", "Kavanozun kapağı {d}. borcun {r}. gecesinde kapanıyor.", "ฝาโหลปิดลงในคืนที่ {r} ของหนี้ก้อนที่ {d}"],
  "ui.lostShort": ["You were {n} short.", "{n} eksiktin.", "ขาดไป {n}"], "ui.winTitle": ["Contract cleared", "Sözleşme bitti", "สัญญาจบแล้ว"],
  "ui.bestPattern": ["Best pattern: {name} for {n}", "En iyi desen: {name}, {n}", "ลายที่ดีที่สุด: {name} ได้ {n}"], "ui.statDebts": ["Debts paid", "Ödenen borç", "หนี้ที่ปลด"],
  "ui.statBest": ["Biggest spin", "En büyük çeviriş", "ตาที่ได้มากสุด"], "ui.statScorch": ["Flare-ups", "Parlama", "ไฟลุก"], "ui.statDeals": ["Deals signed", "İmzalanan anlaşma", "ข้อตกลงที่เซ็น"],
  "ui.statCurses": ["Curses carried", "Taşınan lanet", "คำสาปที่แบก"], "ui.waxEarned": ["+{n} Stash", "+{n} Birikim", "เงินเก็บ +{n}"], "ui.unlocked": ["Unlocked", "Açıldı", "ปลดล็อกแล้ว"],
  "ui.unlockChar": ["Character: {name}", "Karakter: {name}", "ตัวละคร: {name}"], "ui.unlockCharm": ["Charm: {name}", "Tılsım: {name}", "ไอเท็ม: {name}"], "ui.unlockHideout": ["Home: {name}", "Ev: {name}", "บ้าน: {name}"],
  "ui.again": ["Again", "Tekrar", "เล่นอีก"], "ui.home": ["Home", "Ana ekran", "หน้าหลัก"], "ui.endingUnlocked": ["Ending reached: {name}", "Ulaşılan son: {name}", "ถึงตอนจบ: {name}"],
  "ui.ending.paid_in_full": ["Paid in Full", "Borç Bitti", "ปลดหนี้หมด"], "ui.ending.bought_the_machine": ["Bought the Machine", "Makineyi Satın Aldı", "ซื้อเครื่องมาเอง"], "ui.ending.new_management": ["New Management", "Yeni Yönetim", "ผู้บริหารคนใหม่"],
  "ui.endingText.paid_in_full": ["Nim's page is stamped in Yaowarat and she buys a new cart with a real awning. Mr. Ruby is back the next night with a new customer. Pip slips Nim the real contract.", "Nim'in sayfası Yaowarat'ta mühürlendi, gerçek tenteli yeni bir araba aldı. Bay Ruby ertesi gece yeni bir müşteriyle geri döndü. Pip, Nim'e asıl sözleşmeyi uzatıyor.", "หน้ากระดาษของนิ่มถูกประทับตราที่เยาวราช เธอซื้อรถเข็นคันใหม่ มีกันสาดของจริง คืนต่อมาเฮียรูบี้กลับมาพร้อมลูกค้าคนใหม่ ปิ๊บแอบส่งสัญญาฉบับจริงให้นิ่ม"],
  "ui.endingText.bought_the_machine": ["Nim pays Head Office herself and owns the machine and Mr. Ruby's debt paper. He is free and has nowhere to go. He moves into her massage chair.", "Nim Genel Müdürlük'e kendisi ödedi; makine de Bay Ruby'nin borç kâğıdı da onun. Ruby özgür ama gidecek yeri yok. Masaj koltuğuna yerleşti.", "นิ่มจ่ายสำนักงานใหญ่เอง เครื่องและสัญญาหนี้ของเฮียรูบี้เป็นของเธอ เขาเป็นอิสระแต่ไม่มีที่ไป จึงย้ายเข้าไปนั่งเก้าอี้นวด"],
  "ui.endingText.new_management": ["Head Office promotes its best earner. On the sky-bar roof Nim gets the sunglasses and the gold chain, and Mr. Ruby becomes her clerk. His last line: \"Two nights a debt. Pay on time. You say it now. I've retired.\"", "Genel Müdürlük en çok kazananı terfi ettirdi. Gökyüzü Barı'nın çatısında güneş gözlüğü ve altın zincir Nim'e geçti, Bay Ruby onun katibi oldu. Son sözü onun: \"Borç başına iki gece. Zamanında öde. Şimdi sen söyle. Ben emekli oldum.\"", "สำนักงานใหญ่เลื่อนตำแหน่งคนทำเงินเก่งที่สุด บนดาดฟ้าสกายบาร์ นิ่มได้แว่นกันแดดกับสร้อยทอง เฮียรูบี้กลายเป็นเสมียน คำสุดท้ายเป็นของเขา: \"หนี้ละสองคืน จ่ายให้ทัน ตอนนี้เธอพูดแทนได้เลย ฉันเกษียณแล้ว\""],
  // ---- daily ----
  "ui.dailyTitle": ["Daily run", "Günlük oyun", "เกมประจำวัน"], "ui.dailySub": ["The same pact for everyone today. Your first try counts.", "Bugün herkese aynı ahit. İlk denemen sayılır.", "วันนี้ทุกคนได้สัญญาฉบับเดียวกัน นับแค่ครั้งแรกของคุณ"],
  "ui.dailyToday": ["Today: {char}, {contract}", "Bugün: {char}, {contract}", "วันนี้: {char}, {contract}"], "ui.dailyForced": ["First terms card: {name}", "İlk şart kartı: {name}", "ใบเงื่อนไขแรก: {name}"],
  "ui.dailyCurse": ["Starting curse: {name}", "Başlangıç laneti: {name}", "คำสาปตั้งต้น: {name}"], "ui.dailyBest": ["Best", "En iyi", "ดีที่สุด"], "ui.dailyScore": ["{d} debts, {c} coins", "{d} borç, {c} para", "หนี้ {d} ก้อน เหรียญ {c}"],
  "ui.dailyStreak": ["Streak: {n} days", "Seri: {n} gün", "ต่อเนื่อง {n} วัน"], "ui.dailyDone": ["Played today. Come back tomorrow.", "Bugün oynadın. Yarın gel.", "เล่นวันนี้แล้ว พรุ่งนี้มาใหม่"],
  "ui.dailyLocal": ["Scores stay on this phone.", "Skorlar bu telefonda kalır.", "คะแนนอยู่ในเครื่องนี้เท่านั้น"], "ui.dailyWax": ["A daily run gives +{n} Stash.", "Günlük oyun +{n} Birikim verir.", "เกมประจำวันได้เงินเก็บ +{n}"],
  "ui.dailyGo": ["Play today's run", "Bugünün oyununu oyna", "เล่นเกมวันนี้"],
  // ---- store, settings ----
  "ui.storeTitle": ["Store", "Mağaza", "ร้านค้า"], "ui.sound": ["Sound effects", "Ses efektleri", "เสียงเอฟเฟกต์"], "ui.music": ["Music", "Müzik", "เพลง"], "ui.haptics": ["Vibration", "Titreşim", "สั่น"],
  "ui.fast": ["Fast spin", "Hızlı çevirme", "หมุนเร็ว"], "ui.reduceMotion": ["Reduce motion", "Hareketi azalt", "ลดการเคลื่อนไหว"],
  "ui.privacyText": ["Your progress stays on this phone. No real money is ever won or paid out, and spins are never sold.", "İlerlemen bu telefonda kalır. Gerçek para kazanılmaz ya da ödenmez, çevirişler satılmaz.", "ความคืบหน้าอยู่ในเครื่องนี้ ไม่มีการได้หรือจ่ายเงินจริง และไม่มีการขายตาหมุน"],
  "ui.storeNote": ["Purchases remove ads or add looks. Nothing here changes spins, chances or Stash. No random items.", "Satın alımlar reklamı kaldırır ya da görünüm ekler. Hiçbiri çeviriş, olasılık ya da Birikim vermez. Rastgele ürün yok.", "สิ่งที่ซื้อได้คือเอาโฆษณาออกหรือเพิ่มหน้าตา ไม่ได้เพิ่มตาหมุน โอกาส หรือเงินเก็บ ไม่มีของสุ่ม"],
  "store.remove_ads.name": ["Remove ads", "Reklamları kaldır", "เอาโฆษณาออก"], "store.remove_ads.desc": ["No ads between runs, for good. Reward ads stay optional.", "Oyunlar arasında reklam çıkmaz, kalıcı. Ödüllü reklamlar isteğe bağlı kalır.", "ไม่มีโฆษณาระหว่างรอบเกมตลอดไป โฆษณารับรางวัลยังเลือกดูได้"],
  "store.starter_pack.name": ["Starter pack", "Başlangıç paketi", "ชุดเริ่มต้น"], "store.starter_pack.desc": ["Remove ads, one machine skin and 100 Stash. Once.", "Reklamları kaldır, bir makine kılıfı ve 100 Birikim. Tek seferlik.", "เอาโฆษณาออก สกินเครื่องหนึ่งแบบ และเงินเก็บ 100 ครั้งเดียว"],
  "store.cos_machine.name": ["Machine skins", "Makine kılıfları", "สกินเครื่อง"], "store.cos_machine.desc": ["New paint for the neon fortune machine.", "Neon fal makinesi için yeni boya.", "สีใหม่ให้เครื่องดูดวงนีออน"],
  "store.cos_hats.name": ["Mr. Ruby's hats", "Bay Ruby'nin şapkaları", "หมวกของเฮียรูบี้"], "store.cos_hats.desc": ["Silly hats for a serious devil.", "Ciddi bir şeytan için komik şapkalar.", "หมวกตลกๆ สำหรับปีศาจจริงจัง"],
  "store.cos_wallpaper.name": ["Home wallpaper", "Ev duvar kâğıdı", "วอลเปเปอร์บ้าน"], "store.cos_wallpaper.desc": ["A new look for Nim's home.", "Nim'in evine yeni bir görünüm.", "หน้าตาใหม่ให้บ้านของนิ่ม"],
  "iap.buy": ["Buy", "Satın al", "ซื้อ"], "iap.owned": ["Owned", "Alındı", "ซื้อแล้ว"], "iap.restore": ["Restore purchases", "Satın alımları geri yükle", "กู้คืนการซื้อ"], "iap.restored": ["Restored: {n}", "Geri yüklendi: {n}", "กู้คืนแล้ว: {n}"],
  "iap.restoreNone": ["Nothing to restore.", "Geri yüklenecek bir şey yok.", "ไม่มีอะไรให้กู้คืน"], "iap.restoreNote": ["Restoring brings back purchases only.", "Geri yükleme yalnızca satın alımları getirir.", "การกู้คืนได้เฉพาะของที่ซื้อ"],
  "iap.failed": ["The purchase did not go through.", "Satın alma tamamlanmadı.", "การซื้อไม่สำเร็จ"], "iap.needsRemoveAds": ["That needs Remove ads first.", "Bunun için önce Reklamları kaldır gerekir.", "ต้องซื้อเอาโฆษณาออกก่อน"], "iap.useUpgrade": ["You own Remove ads, so buy the upgrade instead.", "Reklamları kaldır sende var, yükseltmeyi al.", "คุณเอาโฆษณาออกแล้ว ซื้ออัปเกรดแทนได้"],
  "iap.testLabel": ["Test purchase", "Deneme satın alımı", "ทดลองซื้อ"], "iap.testBody": ["No money is taken. Store price: {price}.", "Para çekilmez. Mağaza fiyatı: {price}.", "ไม่มีการตัดเงิน ราคาในร้าน: {price}"], "iap.testBuy": ["Buy (test)", "Satın al (deneme)", "ซื้อ (ทดลอง)"], "iap.cancel": ["Cancel", "Vazgeç", "ยกเลิก"],
  "ads.watch.shop_reroll": ["Watch an ad: one free reroll", "Reklam izle: bir bedava yenileme", "ดูโฆษณา: สุ่มใหม่ฟรี 1 ครั้ง"], "ads.watch.double_wax": ["Watch an ad: double the Stash from this run", "Reklam izle: bu oyunun Birikimini ikiye katla", "ดูโฆษณา: เงินเก็บจากเกมนี้เป็นสองเท่า"],
  "ads.left": ["{n} left today", "Bugün {n} tane kaldı", "วันนี้เหลือ {n}"], "ads.unavailable": ["No ad is available right now. Try again later.", "Şu an gösterilecek reklam yok. Sonra tekrar dene.", "ตอนนี้ไม่มีโฆษณา ลองใหม่ภายหลัง"], "ads.noReward": ["The ad closed early, so there is no reward.", "Reklam erken kapandı, ödül yok.", "ปิดโฆษณาก่อนจบ จึงไม่ได้รางวัล"],
  "ads.testLabel": ["Test ad", "Deneme reklamı", "โฆษณาทดลอง"], "ads.testTitle": ["This is a test ad", "Bu bir deneme reklamı", "นี่คือโฆษณาทดลอง"], "ads.testBody": ["A real ad would play here. Reward in {n} s.", "Burada gerçek bir reklam oynardı. Ödül {n} sn sonra.", "โฆษณาจริงจะเล่นตรงนี้ รับรางวัลใน {n} วิ"], "ads.close": ["Close", "Kapat", "ปิด"],
  // ---- how to play, board ----
  "ui.howTitle": ["How to play", "Nasıl oynanır", "วิธีเล่น"], "ui.tabRules": ["Rules", "Kurallar", "กติกา"], "ui.tabSymbols": ["Symbols", "Semboller", "สัญลักษณ์"], "ui.tabPatterns": ["Patterns", "Desenler", "ลาย"],
  "ui.rule1": ["You owe Mr. Ruby for a rebuilt cart. Each debt has a few nights to pay it.", "Yeniden kurulan araba için Bay Ruby'ye borcun var. Her borcu ödemek için birkaç gece var.", "คุณเป็นหนี้เฮียรูบี้ค่ารถเข็นใหม่ แต่ละก้อนมีไม่กี่คืนให้จ่าย"],
  "ui.rule2": ["Each night, pick one terms card. It sets the spins.", "Her gece bir şart kartı seç. Çeviriş sayısını o belirler.", "ทุกคืนเลือกใบเงื่อนไขหนึ่งใบ ใบนั้นกำหนดจำนวนหมุน"],
  "ui.rule3": ["Check the Special. It is more likely to land. Then spin the 5 by 3 machine.", "Gözde'ye bak. İnme ihtimali daha yüksek. Sonra 5x3 makineyi çevir.", "ดูเมนูเด็ด มันออกง่ายกว่า แล้วหมุนเครื่อง 5x3"],
  "ui.rule4": ["SPICE UP adds Spice: more pay, but more Soot. Three Soot is a Flare-up and burns your purse.", "ACILANDIR Acı ekler: daha çok kazanç ama daha çok İs. Üç İs Parlamadır, keseni yakar.", "เพิ่มเผ็ดทำให้เผ็ดขึ้น: จ่ายมากขึ้นแต่เขม่าก็มากขึ้น เขม่าสามตัวคือไฟลุก ถุงเงินจะไหม้"],
  "ui.rule5": ["Tricks change the result after the reels stop. Charms work on their own.", "Numaralar makine durunca sonucu değiştirir. Tılsımlar kendiliğinden çalışır.", "กลเม็ดแก้ผลหลังวงล้อหยุด ไอเท็มทำงานเอง"],
  "ui.rule6": ["Pay coins into the debt, or keep them in the purse for interest. The purse can burn.", "Parayı borca öde ya da faiz için kesede tut. Kese yanabilir.", "จ่ายเหรียญเข้าหนี้ หรือเก็บในถุงเพื่อดอกเบี้ย แต่ถุงเงินอาจไหม้"],
  "ui.rule7": ["Pay a debt and Mr. Ruby offers deals: a boon and a curse that stays. Miss a deadline and he collects.", "Bir borcu öde, Bay Ruby anlaşma sunar: bir ödül ve kalıcı bir lanet. Vadeyi kaçırırsan tahsil eder.", "ปลดหนี้แล้วเฮียรูบี้เสนอข้อตกลง: ของดีหนึ่งอย่างกับคำสาปที่อยู่ถาวร พลาดกำหนดเขาก็มาเก็บ"],
  "ui.scoreOrder": ["How a spin is scored", "Bir çeviriş nasıl puanlanır", "การคิดคะแนนหนึ่งตา"],
  "ui.score1": ["1. Each pattern pays: value × symbol mult × pattern mult.", "1. Her desen öder: değer × sembol çarpanı × desen çarpanı.", "1. แต่ละลายจ่าย: ค่า × ตัวคูณสัญลักษณ์ × ตัวคูณลาย"],
  "ui.score2": ["2. Add all patterns together.", "2. Tüm desenleri topla.", "2. รวมทุกลายเข้าด้วยกัน"], "ui.score3": ["3. Multiply by Spice and any bonus.", "3. Acı ve ek çarpanlarla çarp.", "3. คูณด้วยเผ็ดและโบนัส"],
  "ui.score4": ["4. Add flat coins. The total goes into the purse.", "4. Sabit paraları ekle. Toplam keseye girer.", "4. บวกเหรียญคงที่ ยอดรวมเข้าถุงเงิน"], "ui.scoreBeat": ["A bigger pattern beats the smaller one inside it.", "Büyük desen, içindeki küçüğü geçersiz kılar.", "ลายใหญ่ชนะลายเล็กที่อยู่ในนั้น"],
  "ui.symValue": ["Value {n}", "Değer {n}", "ค่า {n}"], "ui.symWeight": ["Weight {n}", "Ağırlık {n}", "น้ำหนัก {n}"], "ui.patCells": ["{n} cells", "{n} hücre", "{n} ช่อง"], "ui.patMult": ["x{n}", "x{n}", "x{n}"], "ui.patPlaces": ["{n} placements", "{n} konum", "{n} ตำแหน่ง"],
  // ---- collection, shelf, sheet ----
  "ui.collTitle": ["Collection", "Koleksiyon", "คลังสะสม"], "ui.tabAch": ["Achievements", "Başarılar", "ความสำเร็จ"], "ui.tabSeen": ["Charms", "Tılsımlar", "ไอเท็ม"], "ui.tabEndings": ["Endings", "Sonlar", "ตอนจบ"],
  "ui.achCount": ["{a} of {b} done", "{a}/{b} tamam", "สำเร็จ {a} จาก {b}"], "ui.seenCount": ["{a} of {b} charms seen", "{a}/{b} tılsım görüldü", "เห็นแล้ว {a} จาก {b} ไอเท็ม"], "ui.unseen": ["Not seen yet", "Henüz görülmedi", "ยังไม่เคยเห็น"],
  "ui.lockedBy": ["Locked: {how}", "Kilitli: {how}", "ล็อก: {how}"], "ui.rewardWax": ["+{n} Stash", "+{n} Birikim", "เงินเก็บ +{n}"], "ui.rewardCharm": ["Unlocks the charm {name}", "{name} tılsımını açar", "ปลดล็อกไอเท็ม {name}"], "ui.rewardChar": ["Unlocks {name}", "{name} karakterini açar", "ปลดล็อก {name}"],
  "ui.noEnding": ["Not reached yet", "Henüz ulaşılmadı", "ยังไปไม่ถึง"],
  "ui.shelfTitle": ["Your charms", "Tılsımların", "ไอเท็มของคุณ"], "ui.cursesTitle": ["Your curses", "Lanetlerin", "คำสาปของคุณ"], "ui.tricksTitle": ["Your tricks", "Numaraların", "กลเม็ดของคุณ"],
  "ui.emptySlot": ["Empty slot", "Boş yuva", "ช่องว่าง"], "ui.noCurseYet": ["No curses. Mr. Ruby is disappointed.", "Hiç lanet yok. Bay Ruby hayal kırıklığında.", "ยังไม่มีคำสาป เฮียรูบี้ผิดหวัง"], "ui.slotsN": ["{a} of {b} slots", "{a}/{b} yuva", "ใช้ {a} จาก {b} ช่อง"],
  "ui.tapInspect": ["Tap an item to read it.", "Okumak için bir öğeye dokun.", "แตะไอเท็มเพื่ออ่าน"], "ui.family": ["Family: {name}", "Aile: {name}", "สาย: {name}"], "ui.sellFor": ["Sell for {n}", "{n} karşılığında sat", "ขายได้ {n}"],
  "ui.curseHeld": ["A curse. It stays until the run ends.", "Bir lanet. Oyun bitene dek kalır.", "คำสาป อยู่จนจบเกม"], "ui.dealOnce": ["Taken from a deal.", "Bir anlaşmadan geldi.", "มาจากข้อตกลง"],
  // ---- speech lines ----
  "line.brimble.home.1": ["Two nights a debt. Pay on time. Or I keep the flame. Company policy.", "Borç başına iki gece. Zamanında öde. Yoksa alevi ben alırım. Şirket politikası.", "หนี้ละสองคืน จ่ายให้ทัน ไม่งั้นฉันเก็บไฟดวงนั้นไว้ นโยบายบริษัท"],
  "line.brimble.home.2": ["Back already? The paperwork missed you.", "Yine mi geldin? Evraklar seni özledi.", "กลับมาแล้วเหรอ เอกสารคิดถึงเธอนะ"], "line.brimble.home.3": ["The machine is fine. It is held together with zip ties, but fine.", "Makine iyi. Plastik kelepçeyle tutuyor ama iyi.", "เครื่องไม่เป็นไร ใช้เทปกับเคเบิ้ลไทร์มัดไว้ แต่ก็ใช้ได้"],
  "line.brimble.start.1": ["One small debt. Take your time. Not too much.", "Ufak bir borç. Acele etme. Çok da etme.", "หนี้ก้อนเล็ก ค่อยๆ ทำ แต่อย่าช้านัก"], "line.brimble.start.2": ["Sign here. No, the small print is for me.", "Buraya imzala. Hayır, dipnot benim.", "เซ็นตรงนี้ ไม่ใช่ ตัวเล็กๆ นั่นของฉัน"],
  "line.brimble.stoke.1": ["More Spice. I like a customer with ambition.", "Daha çok Acı. Hırslı müşteriyi severim.", "เผ็ดอีกแล้วเหรอ ชอบลูกค้าใจกล้าแบบนี้"], "line.brimble.stoke.2": ["Warm in here, isn't it?", "Buralar ısındı, değil mi?", "ในนี้ร้อนขึ้นนะ จริงไหม"],
  "line.brimble.heatHigh.1": ["More spice? I admire that in a customer I am about to lose.", "Acıyı artırıyorsun. Kaybetmek üzere olduğum müşteride bunu takdir ederim.", "เผ็ดขึ้นอีกเหรอ ชอบนะ ลูกค้าที่กำลังจะหลุดมือฉันเนี่ย"], "line.brimble.heatHigh.2": ["That is a lot of Spice. The machine is fine. Probably.", "Bu çok Acı. Makine iyi. Muhtemelen.", "เผ็ดมากเลย เครื่องไม่เป็นไร คงงั้น"],
  "line.brimble.scorch.1": ["The machine is fine. Your purse is lighter. Everyone learns.", "Makine iyi. Kesen hafifledi. Herkes öğrenir.", "เครื่องไม่เป็นไร ถุงเงินเธอเบาลง ทุกคนต้องเรียนรู้"], "line.brimble.scorch.2": ["Soot. Such a shame. I will keep the soot.", "İs. Çok yazık. İsi ben alırım.", "เขม่า น่าเสียดาย เขม่านั่นฉันเก็บเอง"],
  "line.brimble.dud.1": ["Nothing. It happens. Blame the weather.", "Hiçbir şey. Olur. Havayı suçla.", "ไม่ได้อะไรเลย เกิดขึ้นได้ โทษอากาศไปนะ"], "line.brimble.dud.2": ["That was luck. Luck is not in the contract.", "Bu şanstı. Şans sözleşmede yok.", "นั่นคือโชค โชคไม่อยู่ในสัญญา"],
  "line.brimble.big.1": ["Hm. Do that again and I will have to read the contract.", "Hm. Bir daha yaparsan sözleşmeyi okumam gerekecek.", "อืม ทำแบบนั้นอีกฉันต้องไปอ่านสัญญาแล้ว"], "line.brimble.big.2": ["Lovely. Officially I did not see it.", "Güzel. Resmen görmedim.", "สวยมาก แต่ในเอกสาร ฉันไม่เห็นอะไรทั้งนั้น"],
  "line.brimble.paid.1": ["Paid. I will pretend I am pleased.", "Ödendi. Memnunmuş gibi yapacağım.", "จ่ายแล้ว ฉันจะทำเป็นดีใจ"], "line.brimble.paid.2": ["Stamped. On to the next page.", "Mühürlendi. Sıradaki sayfaya.", "ประทับตราแล้ว ไปหน้าถัดไป"], "line.brimble.paid.3": ["Early? You are making me look bad.", "Erken mi? Beni kötü gösteriyorsun.", "เร็วขนาดนี้เหรอ เธอทำให้ฉันดูแย่นะ"],
  "line.brimble.deal.1": ["A deal. Good for you now. Good for me later. That is what a deal is.", "Bir anlaşma. Şimdi sana iyi. Sonra bana iyi. Anlaşma dediğin bu.", "ข้อตกลง ตอนนี้ดีกับเธอ ทีหลังดีกับฉัน ข้อตกลงก็แบบนี้"], "line.brimble.deal.2": ["Read it. Or don't. Most don't.", "Oku. Ya da okuma. Çoğu okumaz.", "อ่านก็ได้ ไม่อ่านก็ได้ ส่วนใหญ่ไม่อ่านกัน"], "line.brimble.deal.3": ["I wrote this clause in a smaller pen on purpose.", "Bu maddeyi bilerek daha küçük kalemle yazdım.", "ข้อนี้ฉันจงใจเขียนตัวหนังสือเล็กจิ๋ว"],
  "line.brimble.signed.1": ["Pleasure. I mean it, for once.", "Memnuniyetle. Bu sefer gerçekten.", "ยินดีที่ได้ทำธุรกิจด้วย ครั้งนี้พูดจริงนะ"], "line.brimble.signed.2": ["Signed. No take-backs. Company policy.", "İmzalandı. Geri dönüş yok. Şirket politikası.", "เซ็นแล้ว คืนไม่ได้ นโยบายบริษัท"],
  "line.brimble.refuse.1": ["Clean hands. How dull.", "Temiz eller. Ne sıkıcı.", "มือสะอาด น่าเบื่อจริง"], "line.brimble.refuse.2": ["Refused. I will keep the pen warm.", "Reddedildi. Kalemi sıcak tutarım.", "ปฏิเสธเหรอ ปากกายังอยู่ตรงนี้นะ เผื่อเปลี่ยนใจ"],
  "line.brimble.pawn.1": ["One more night, for one small fee. You will barely notice.", "Bir gece daha, küçük bir ücretle. Fark bile etmezsin.", "อีกหนึ่งคืน แลกค่าธรรมเนียมนิดเดียว เธอแทบไม่รู้สึก"], "line.brimble.pawn.2": ["Burn something you love. It is the only currency I trust.", "Sevdiğin bir şeyi yak. Güvendiğim tek para birimi bu.", "เผาของที่เธอรัก มันเป็นเงินตราเดียวที่ฉันเชื่อใจ"],
  "line.brimble.lose.1": ["Two nights a debt. Pay on time. Or I keep the flame. I did say.", "Borç başına iki gece. Zamanında öde. Yoksa alevi ben alırım. Söylemiştim.", "หนี้ละสองคืน จ่ายให้ทัน ไม่งั้นฉันเก็บไฟไว้ ฉันบอกแล้ว"], "line.brimble.lose.2": ["Do not look at me like that. I will open the jar again. You are a paying customer.", "Bana öyle bakma. Kavanozu yeniden açacağım. Ödeme yapan müşterisin.", "อย่ามองฉันแบบนั้น ฉันจะเปิดโหลให้ใหม่ เธอเป็นลูกค้าที่จ่ายเงิน"], "line.brimble.lose.3": ["The lid is not personal. It is hardware.", "Kapak kişisel değil. Hırdavat.", "ไม่ใช่เรื่องส่วนตัวนะ ธุรกิจล้วนๆ"],
  "line.brimble.win.1": ["Paid in full. I have never seen that. Do not tell Head Office.", "Tamamen ödendi. Hiç görmemiştim. Genel Merkez'e söyleme.", "จ่ายครบ ไม่เคยเห็นมาก่อน อย่าบอกสำนักงานใหญ่"], "line.brimble.win.2": ["You won. I will deny it.", "Kazandın. Reddedeceğim.", "เธอชนะ... แต่ฉันจะแถว่าไม่รู้เรื่อง"],
  "line.pip.shop.1": ["Everything is half-price, if the price is doubled first.", "Her şey yarı fiyat, fiyatı önce ikiye katlarsan.", "ของทุกอย่างลดครึ่งราคา ถ้าขึ้นราคาเป็นสองเท่าก่อน"], "line.pip.shop.2": ["Buy two. Mr. Ruby does not count the stall.", "İki tane al. Bay Ruby tezgâhı saymıyor.", "พี่จ๋า ซื้อสองชิ้นเลยจ้า เฮียไม่นับแผงนี้หรอก"], "line.pip.shop.3": ["That one hums. It is either good or wired wrong.", "Şu mırıldanıyor. Ya iyi ya da kablosu yanlış.", "อันนั้นหึ่งๆ อยู่ ไม่ของดีก็ต่อสายผิด"],
  "line.nim.start.1": ["One small debt. I've haggled harder for limes.", "Ufak bir borç. Limon için bundan sert pazarlık ettim.", "หนี้ก้อนเล็ก ฉันเคยต่อมะนาวหนักกว่านี้"], "line.nim.start.2": ["I am not lucky. I am organised.", "Şanslı değilim. Düzenliyim.", "ฉันไม่ได้โชคดี ฉันแค่วางแผนเก่ง"],
  "line.nim.paid.1": ["One down. I am counting.", "Biri bitti. Sayıyorum.", "ไปหนึ่งก้อน ฉันนับอยู่"], "line.nim.paid.2": ["You wrote this clause in a smaller pen.", "Bu maddeyi daha küçük kalemle yazmışsın.", "ข้อนี้เฮียจงใจเขียนตัวหนังสือเล็กจิ๋ว"],
  "line.nim.scorch.1": ["That was my money.", "O benim paramdı.", "นั่นเงินหนูนะเฮีย!"], "line.nim.scorch.2": ["Noted. Never again. Probably.", "Not aldım. Bir daha asla. Herhalde.", "จดไว้แล้ว ไม่ทำอีก คงงั้น"],
  "line.nim.lose.1": ["Fine. Open the jar again. I'll do it better.", "Peki. Kavanozu yeniden aç. Daha iyisini yapacağım.", "ก็ได้ เปิดโหลใหม่เถอะ รอบหน้าฉันทำดีกว่านี้"], "line.nim.lose.2": ["So close. Next time I bank sooner.", "Az kalmıştı. Bir dahakine daha erken yatırırım.", "เกือบแล้ว รอบหน้าจะรีบฝากให้เร็วกว่านี้"],
};

const EN = {}, TR = {}, TH = {};
for (const [k, [e, r, h]] of Object.entries({ ...T, ...T3 })) { EN[k] = e; TR[k] = r; TH[k] = h; } // T3: the v3 strings (src/ui/strings-v3.js) win over a v2 key of the same name

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
