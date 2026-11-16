# omens (market gossip), errands, Tin tips, calls and Codex neighbour pages.
# Gossip shows public information and rates, never a rolled result. favBoard replaces the SPEC's nextFavs2 (the next two Specials is a rolled
# result); ashNext and scorchOdds are rates and keep their ids (owner rule: spirits never foretell results).
OMENS = [
    ('nextDebts', 'brimble', T('The Ledger', 'Defter', 'สมุดบัญชี'), T('Shows the next 2 debts and the next boss rule.', 'Sıradaki 2 borcu ve sıradaki patron kuralını gösterir.', 'แสดงหนี้ถัดไป 2 ก้อนและกฎบอสถัดไป')),
    ('nextOffers', 'beckon', T('Shelf Talk', 'Raf Sohbeti', 'คุยเรื่องชั้นวาง'), T('Shows the top 2 charms of the next stall.', 'Sıradaki tezgâhın en iyi 2 tılsımını gösterir.', 'แสดงไอเท็มเด่น 2 ชิ้นของแผงถัดไป')),
    ('favBoard', 'gold', T('Menu Board', 'Menü Tahtası', 'กระดานเมนู'), T('Shows which symbols are most likely to be the Special, with your Luck.', 'Luck\'ınla hangi sembollerin Gözde olmaya en yakın olduğunu gösterir.', 'แสดงว่าสัญลักษณ์ไหนมีโอกาสเป็นเมนูเด็ดมากสุดเมื่อรวมโชคของคุณ')),
    ('benchPrices', 'wire', T('Bench Prices', 'Tezgâh Fiyatları', 'ราคาโต๊ะช่าง'), T('Shows the next bench jobs and their prices.', 'Sıradaki tezgâh işlerini ve fiyatlarını gösterir.', 'แสดงงานโต๊ะช่างถัดไปและราคา')),
    ('shortfall', 'waiting', T('The Shortfall', 'Eksik Tutar', 'ยอดที่ขาด'), T('Shows how many coins are still missing at the end of this round if you bank everything.', 'Hepsini yatırırsan bu elin sonunda kaç para eksik kalacağını gösterir.', 'แสดงว่าถ้าจ่ายหมดตอนจบรอบนี้จะยังขาดอีกกี่เหรียญ')),
    ('nextTerms', 'tide', T("Tomorrow's Terms", 'Yarının Şartları', 'เงื่อนไขพรุ่งนี้'), T('Shows the 3 terms cards of the next round.', 'Sıradaki elin 3 şart kartını gösterir.', 'แสดงการ์ดเงื่อนไข 3 ใบของรอบถัดไป')),
    ('ashNext', 'moonbiter', T('Soot Count', 'İs Sayısı', 'จำนวนเขม่า'), T('Shows how much Soot to expect on the next spin at your current Spice. A rate, not a promise.', 'Mevcut Acı\'nda sonraki çevirişte ne kadar İs beklenebileceğini gösterir. Bir oran, söz değil.', 'แสดงว่าตาถัดไปที่ระดับเผ็ดตอนนี้ควรคาดว่าจะมีเขม่าเท่าไร เป็นอัตรา ไม่ใช่คำมั่น')),
    ('scorchOdds', 'lamplit', T('Flare-up Chance', 'Parlama İhtimali', 'โอกาสไฟลุก'), T('Shows the chance of a Flare-up on each of the next 3 spins at your current Spice.', 'Mevcut Acı\'nda sonraki 3 çevirişin her birinde Parlama ihtimalini gösterir.', 'แสดงโอกาสไฟลุกของแต่ละตาใน 3 ตาถัดไปที่ระดับเผ็ดตอนนี้')),
]
omens = [dict(id=i, spirit=s, name=n, text=t) for i, s, n, t in OMENS]
assert {o['spirit'] for o in omens} == set(SPIRITS) and all(next(x for x in SP if x['id'] == o['spirit'])['omen'] == o['id'] for o in omens)
DEM = [  # id, spirit, name, text, check, bonus effects
    ('signDeal', 'brimble', T('Sign something', 'Bir şey imzala', 'เซ็นสักอย่าง'), T('Sign any deal before this debt is paid.', 'Bu borç ödenmeden herhangi bir anlaşma imzala.', 'เซ็นข้อตกลงสักข้อก่อนปลดหนี้ก้อนนี้'), 'debtEnd', [E('wick', 2)]),
    ('buy2', 'beckon', T('Buy two', 'İki tane al', 'ซื้อสองชิ้น'), T('Buy 2 things at the next stall.', 'Sıradaki tezgâhtan 2 şey al.', 'ซื้อของ 2 ชิ้นที่แผงถัดไป'), 'nextStall', [sflag('freeReroll', 1, 'debt')]),
    ('letMePick', 'gold', T("Chef's choice", 'Şefin seçimi', 'ให้เชฟเลือก'), T('Give up your Special pick for one spin. He chooses.', 'Bir çeviriş için Gözde seçimini bırak. O seçer.', 'ยกการเลือกเมนูเด็ดให้เชฟหนึ่งตา'), 'nextSpin', [E('luck', 1, scope='round')]),
    ('handTrick', 'wire', T('Hand me one', 'Birini ver', 'ส่งมาหนึ่งอัน'), T('Give him a trick now. You get 2 random tricks back.', 'Ona şimdi bir numara ver. Karşılığında 2 rastgele numara alırsın.', 'ให้กลเม็ดเขาหนึ่งอันตอนนี้ แล้วได้กลเม็ดสุ่มคืน 2 อัน'), 'now', [E('trick', 2)]),
    ('waitWithMe', 'waiting', T('Sit with me', 'Benimle otur', 'นั่งเป็นเพื่อนหน่อย'), T('Skip the next night. Interest and the stall still come.', 'Sıradaki geceyi atla. Faiz ve tezgâh yine gelir.', 'ข้ามคืนหน้า ดอกเบี้ยกับแผงยังมาตามปกติ'), 'nextNight', [E('trick', 1)]),
    ('keepCool', 'tide', T('Keep it cool', 'Soğukkanlı ol', 'ใจเย็นๆ'), T('End the next round at Spice 2 or less.', 'Sıradaki eli Acı 2 veya altında bitir.', 'จบรอบหน้าที่เผ็ดไม่เกิน 2'), 'nextRound', [sflag('freeReroll', 1, 'debt')]),
    ('feed', 'moonbiter', T('Feed me', 'Beni doyur', 'ป้อนหน่อย'), T('Give a charm or a curse at the next Tin.', 'Sıradaki Teneke\'de bir tılsım ya da lanet ver.', 'ให้ไอเท็มหรือคำสาปที่กระป๋องขนมครั้งหน้า'), 'nextTin', [E('wick', 2)]),
    ('dare', 'lamplit', T('Dare me', 'Cesaretin var mı?', 'ท้าหน่อย'), T('Reach Spice 8 next round with no Flare-up. Fail: lose 10% of your purse.', 'Sıradaki elde Parlamasız Acı 8\'e çık. Olmazsa kesenin %10\'unu kaybedersin.', 'ขึ้นเผ็ด 8 ในรอบหน้าโดยไม่ไฟลุก ถ้าพลาดเสียถุงเงิน 10%'), 'nextRound', [E('wick', 3)]),
]
demands = []
for i, s, n, t, ck, bonus in DEM:
    assert next(x for x in SP if x['id'] == s)['demand'] == i
    d = dict(id=i, spirit=s, name=n, text=t, check=ck, reward=dict(favour=3, effects=bonus), fail=dict(favour=-2 if s == 'brimble' else -1))
    if i == 'dare': d['fail']['purseLossPct'] = 10
    demands.append(d)
omens_file = dict(omens=omens, demands=demands, labels=dict(
    omen=T('Gossip', 'Dedikodu', 'ข่าวแผง'), demand=T('Errand', 'Küçük İş', 'ฝากงาน'),
    accept=T('Do it', 'Yaparım', 'รับงาน'), met=T('Done', 'Tamam', 'เสร็จแล้ว'), failed=T('Not done', 'Olmadı', 'ไม่สำเร็จ')))

# ---------- Tin tips ----------
def _n(en, tr, th): return T(en, tr, th)
tips = dict(
    strip=dict(title=T('The Tin', 'Teneke', 'กระป๋องขนม'), sub=T('Someone dropped by. A small tip wins their Favour.', 'Biri uğradı. Küçük bir bahşiş Hatırını kazanır.', 'มีคนแวะมา ทิปเล็กๆ ช่วยให้ได้น้ำใจ'),
               ignore=T('Not now', 'Şimdi değil', 'ไว้ก่อน'), perVisit=1, tinOnlyFirstNight=True),
    favour=dict(name=FAVOUR, min=-5, max=10, surplusPerCaps=3, stages=[
        dict(at=2, id='noticed', name=T('Noticed', 'Tanıdı', 'จำหน้าได้')), dict(at=5, id='friend', name=T('Friend', 'Dost', 'เพื่อน')),
        dict(at=8, id='regular', name=T('Regular', 'Müdavim', 'ขาประจำ'))],
        wrath=[dict(at=-2, id='annoyed', name=T('Annoyed', 'Bozuk', 'หงุดหงิด')), dict(at=-5, id='fedup', name=T('Fed up', 'Küs', 'หมดความอดทน'))]),
    kinds=[dict(id='coins', icon='ui/coin', name=T('Coins', 'Para', 'เหรียญ')), dict(id='caps', icon='ui/wick', name=T('Caps', 'Kapak', 'ฝาขวด')),
           dict(id='spice', icon='ui/heat', name=T('Spice', 'Acı', 'เผ็ด')), dict(id='trick', icon='ui/trick_bag', name=T('Trick', 'Numara', 'กลเม็ด')),
           dict(id='charm', icon='ui/seal', name=T('Charm', 'Tılsım', 'ไอเท็ม')), dict(id='curse', icon='ui/curse_badge', name=T('Curse', 'Lanet', 'คำสาป')),
           dict(id='skip', icon='trick/hourglass', name=T('Skipped spins', 'Atlanan çeviriş', 'ข้ามตา'))],
    sizes=[dict(id='small', favour=1, name=T('Small tip', 'Küçük bahşiş', 'ทิปเล็ก')), dict(id='medium', favour=3, name=T('Medium tip', 'Orta bahşiş', 'ทิปกลาง')),
           dict(id='large', favour=6, name=T('Big tip', 'Büyük bahşiş', 'ทิปใหญ่'))],
    table=dict(coins=dict(small=4, medium=10, large=25), caps=dict(small=1, medium=2, large=4), spice=dict(small=1, medium=3, large=5),
               trick=dict(small=None, medium=1, large=None), charm=dict(small=None, medium=None, large=1), curse=dict(small=None, medium=1, large=None),
               skip=dict(small=1, medium=2, large=None)),
    label=dict(
        coins=T('{n}% of the debt, from your purse', 'Borcun %{n}\'i, kesenden', 'หนี้ {n}% จากถุงเงิน'), caps=T('{n} Caps', '{n} Kapak', 'ฝาขวด {n}'),
        spice=T('burn {n} Spice now', '{n} Acı yak', 'ลดเผ็ด {n} ระดับ'), trick=T('any 1 trick', 'herhangi 1 numara', 'กลเม็ดหนึ่งอัน'),
        charm=T('any 1 charm (you also get its sale price)', 'herhangi 1 tılsım (satış fiyatını da alırsın)', 'ไอเท็มหนึ่งชิ้น (ได้เงินขายด้วย)'),
        curse=T("take this neighbour's own curse", 'bu komşunun kendi lanetini al', 'รับคำสาปของเพื่อนบ้านคนนี้'), skip=T('{n} fewer spins next round', 'sonraki elde {n} çeviriş eksik', 'รอบหน้าตาน้อยลง {n}')),
    taste=[dict(id='loved', mult=2, icon='ui/taste_loved', name=T('Loved', 'Bayılır', 'ชอบมาก')), dict(id='fine', mult=1, icon='ui/taste_fine', name=T('Fine', 'Olur', 'ได้')),
           dict(id='meh', mult=0.5, icon='ui/taste_meh', name=T('Meh', 'Eh', 'เฉยๆ')), dict(id='hated', mult=None, icon='ui/taste_hated', name=T('Hates it', 'Nefret eder', 'เกลียด'))],
    insult=dict(favour=-1, tipLost=True, text=T('A hated tip costs 1 Favour and is lost.', 'Nefret edilen bahşiş 1 Hatır götürür ve kaybolur.', 'ทิปที่เกลียดทำให้เสียน้ำใจ 1 และทิปหายไป')),
    tasteShownAtFirstVisit=True)

# ---------- calls ----------
calls = dict(
    cards=3, cardsMax=4, rubyAlwaysRed=True, waitingAlwaysGreen=True, redChanceOther=25, localWeight=2, friendWeight=1.5,
    allRedAfter=['redEye', 'flareUp'], reroll=dict(baseCaps=1, stepCaps=1), refuseCaps=3,
    beads=dict(max=3, lightsWhen='hangUpAfterOpeningRedSheet', note=T(
        'A bead lights only when you open a red card, read it and hang up anyway.',
        'Boncuk yalnızca kırmızı bir kartı açıp okuyup yine de telefonu kapatınca yanar.',
        'ลูกปัดจะติดก็ต่อเมื่อเปิดการ์ดแดงอ่านแล้ววางสายอยู่ดี')),
    hangUpFavour=dict(brimble=0), whiteCall=dict(beads=3, caller='waiting', cards=['white_symbols', 'white_patterns', 'white_stare'], resetBeads=True),
    firstRun=dict(spirits=['brimble', 'beckon', 'gold'], noRedEye=True, noBlender=True, noHonk=True),
    colours=dict(
        green=dict(name=T('Favour', 'İyilik', 'น้ำใจ'), icon='ui/call_green', hint=T("A neighbour's favour. Safe.", 'Bir komşunun iyiliği. Güvenli.', 'น้ำใจจากเพื่อนบ้าน ปลอดภัย')),
        red=dict(name=T('Deal', 'Anlaşma', 'ดีล'), icon='ui/phone', hint=T('A strong deal with a price. Read what you carry.', 'Bedeli olan güçlü bir anlaşma. Taşıyacağını oku.', 'ดีลแรงที่มีราคา อ่านให้ดีว่าต้องแบกอะไร')),
        white=dict(name=T('Clean slate', 'Temiz sayfa', 'เริ่มใหม่'), icon='ui/white_call', hint=T('A permanent gain for this run. No price.', 'Bu oyun boyunca kalıcı kazanç. Bedelsiz.', 'ของดีถาวรตลอดเกมนี้ ไม่มีราคา'))),
    labels=dict(hangUp=T('Hang up', 'Kapat', 'วางสาย'), reroll=T('Reroll', 'Yenile', 'สุ่มใหม่'), pick=T('Pick', 'Seç', 'เลือก'), back=T('Back to the call', 'Aramaya dön', 'กลับไปที่สาย'),
                title=T('The phone is ringing', 'Telefon çalıyor', 'โทรศัพท์ดังแล้ว'), whiteTitle=T('A white call', 'Beyaz bir arama', 'สายสีขาว'), beads=T('Hang-ups', 'Kapatmalar', 'วางสาย')),
    rank_up=dict(on=[2, 4, 6], overlay=['machine/awning_1', 'machine/awning_2', 'machine/awning_3'], label=T('Level {n}', 'Seviye {n}', 'ระดับ {n}')))

# ---------- Codex neighbour pages: 10 per neighbour, opened by the event named on each ----------
PAGE_EVENTS = ['meet', 'firstTip', 'firstLoved', 'firstInsult', 'noticed', 'friend', 'regular', 'wrath', 'redCall', 'himOrMe']
PG = {
'brimble': [('He set up a folding table beside the burnt cart and called it an office.', 'Yanık arabanın yanına katlanır bir masa kurdu, adına ofis dedi.', 'เขากางโต๊ะพับข้างรถเข็นที่ไหม้ แล้วเรียกมันว่าออฟฟิศ'),
            ('Nim tipped him. He asked for a receipt and a better tip.', 'Nim ona bahşiş verdi. Makbuz ve daha iyi bir bahşiş istedi.', 'นิ่มให้ทิปเขา เขาขอใบเสร็จและขอทิปที่มากกว่านี้'),
            ('Caps, he says, are the only honest money. He counts them twice.', 'Kapaklar, diyor, tek dürüst para. İki kez sayıyor.', 'เขาว่าฝาขวดเป็นเงินสุจริตอย่างเดียว แล้วก็นับสองรอบ'),
            ('She tipped the creditor with a charm. He filed it as an attempted bribe.', 'Alacaklıya tılsımla bahşiş verdi. Rüşvet girişimi diye dosyaladı.', 'เธอให้ไอเท็มเป็นทิปเจ้าหนี้ เขาจดว่าเป็นความพยายามติดสินบน'),
            ('He noticed she reads the clauses. Nobody reads the clauses.', 'Maddeleri okuduğunu fark etti. Kimse maddeleri okumaz.', 'เขาเห็นว่าเธออ่านข้อสัญญา ปกติไม่มีใครอ่านกัน'),
            ('He gave her a friend rate. It is only slightly worse than the others.', 'Ona dost faizi verdi. Diğerlerinden yalnızca biraz daha kötü.', 'เขาให้เรตเพื่อน ซึ่งแย่กว่าคนอื่นแค่นิดเดียว'),
            ('A stool with her name on it. He sits on it when she is out.', 'Üstünde adı yazan bir tabure. O yokken kendisi oturuyor.', 'มีเก้าอี้เขียนชื่อเธอ เวลาเธอไม่อยู่เขานั่งเอง'),
            ('A late notice, hand-delivered. He even brought a pen.', 'Elden verilen bir gecikme ihtarı. Kalemi bile getirdi.', 'หนังสือเตือนส่งถึงมือ เขาเอาปากกามาด้วย'),
            ('He signs his own deals in red. Black ink is for customers who read.', 'Kendi anlaşmalarını kırmızıyla imzalar. Siyah mürekkep okuyan müşteriler içindir.', 'เขาเซ็นดีลของตัวเองด้วยหมึกแดง หมึกดำไว้ให้ลูกค้าที่อ่านสัญญา'),
            ('He and Lost-and-Found cannot share a lift. One returns things, one keeps them.', 'O ile Kayıp Eşya aynı asansöre binemez. Biri geri verir, biri tutar.', 'เขากับพี่ของหายนั่งลิฟต์ด้วยกันไม่ได้ คนหนึ่งคืนของ อีกคนเก็บของ')],
'beckon': [('She printed a receipt for her own arrival. It is pinned to the stall wall.', 'Kendi gelişi için bir fiş bastı. Tezgâhın duvarında asılı.', 'เธอพิมพ์ใบเสร็จการมาถึงของตัวเอง แปะอยู่บนผนังแผง'),
           ("Nim's first tip came back as a receipt with a smiley stamp.", 'Nim\'in ilk bahşişi gülen yüzlü bir fiş olarak geri döndü.', 'ทิปแรกของนิ่มกลับมาเป็นใบเสร็จพร้อมตราหน้ายิ้ม'),
           ('Plain coins, counted twice. She says rounding is a crime.', 'Düz para, iki kez sayıldı. Yuvarlamak suç, diyor.', 'เหรียญธรรมดา นับสองรอบ เธอว่าการปัดเศษเป็นความผิด'),
           ('A curse as a tip? She stamped it VOID and had to sit down.', 'Bahşiş olarak lanet mi? Üstüne GEÇERSİZ damgası vurup oturmak zorunda kaldı.', 'ให้คำสาปเป็นทิปเหรอ เธอตราประทับว่าโมฆะแล้วต้องนั่งพัก'),
           ('She keeps a file on people who pay on time. Nim\'s file is thick.', 'Zamanında ödeyenlerin dosyasını tutar. Nim\'inki kalın.', 'เธอมีแฟ้มเก็บคนจ่ายตรงเวลา แฟ้มของนิ่มหนามาก'),
           ('A loyalty card with ten stamps. The tenth is a hug, which is not on the card.', 'On mühürlü sadakat kartı. Onuncusu bir sarılma, kartta yazmıyor.', 'บัตรสะสมแต้มสิบดวง ดวงที่สิบคือกอดหนึ่งครั้ง ซึ่งไม่ได้เขียนไว้ในบัตร'),
           ('She stays open late for Nim. The lights are cheaper at night, she says.', 'Nim için geç saate kadar açık kalıyor. Işık geceleri daha ucuz, diyor.', 'เธอเปิดดึกเพื่อนิ่ม ค่าไฟกลางคืนถูกกว่า เธอว่าอย่างนั้น'),
           ('Prices went up the very morning she got upset. Coincidence, she says.', 'Fiyatlar tam kızdığı sabah arttı. Tesadüf, diyor.', 'ราคาขึ้นในเช้าวันที่เธอไม่พอใจพอดี เธอว่าบังเอิญ'),
           ('Her red card is a closing sale. She sells everything except the receipts.', 'Kırmızı kartı bir stok eritme. Fişler dışında her şeyi satıyor.', 'การ์ดแดงของเธอคือเซลล้างสต็อก ขายหมดทุกอย่างยกเว้นใบเสร็จ'),
           ('She and Uncle Wire share a pavement and a long, polite feud.', 'O ile Tel Amca bir kaldırımı ve uzun, kibar bir kavgayı paylaşıyor.', 'เธอกับลุงสายไฟแบ่งทางเท้ากัน และทะเลาะกันแบบสุภาพมาอย่างยาวนาน')],
'gold': [('A rubber duck in a paper hat was running the Special. Nobody asked how.', 'Kâğıt şapkalı bir lastik ördek Gözde\'yi yönetiyordu. Kimse nasıl diye sormadı.', 'เป็ดยางสวมหมวกกระดาษกำลังคุมเมนูเด็ด ไม่มีใครถามว่าทำไงถึงทำได้'),
         ("Nim's first tip: he checked it with his beak. It passed.", 'Nim\'in ilk bahşişini gagasıyla kontrol etti. Geçti.', 'ทิปแรกของนิ่ม เขาเอาปากจิ้มตรวจดู ผ่าน'),
         ('He loves gadgets. A whisk led to a full tour of his kitchen.', 'Aletlere bayılır. Bir çırpıcı yüzünden mutfağı baştan sona gezdirdi.', 'เขารักของใช้ในครัว ตะกร้อมือเดียวพาเดินทัวร์ครัวทั้งห้อง'),
         ('He quacked for a full minute at a skipped night. Nim got the message.', 'Atlanan geceye bir dakika boyunca vakladı. Nim mesajı aldı.', 'เขาร้องก๊าบใส่การข้ามคืนทั้งนาที นิ่มเข้าใจแล้ว'),
         ('He started saving the first dish for Nim.', 'İlk yemeği Nim için ayırmaya başladı.', 'เขาเริ่มเก็บจานแรกไว้ให้นิ่ม'),
         ('She picks the first dish now. He watches, trembling, in case she burns it.', 'İlk yemeği artık o seçiyor. Yakacak diye titreyerek izliyor.', 'ตอนนี้เธอเลือกจานแรกเอง เขายืนดูตัวสั่นเผื่อเธอทำไหม้'),
         ('Two Specials a night. He insists the second is only for taste testing.', 'Geceye iki Özel. İkincisinin sadece tadım için olduğunda ısrar ediyor.', 'คืนละสองเมนูเด็ด เขายืนยันว่าอันที่สองไว้ชิมเท่านั้น'),
         ('The board stayed covered. He sat on the lid and would not discuss it.', 'Tahta örtülü kaldı. Kapağın üstüne oturdu, konuşmayı reddetti.', 'กระดานเมนูถูกปิดไว้ เขานั่งทับฝาและไม่ยอมคุย'),
         ('A rush order: the luck arrives fast, the bill arrives faster.', 'Acil sipariş: şans hızlı gelir, hesap daha hızlı.', 'ออเดอร์ด่วน โชคมาไว แต่บิลมาไวกว่า'),
         ('He and Scrubby share a stove. One cooks, one scrapes, nobody talks.', 'O ile Kazıcı bir ocağı paylaşıyor. Biri pişirir, biri kazır, kimse konuşmaz.', 'เขากับแปรงขัดใช้เตาเดียวกัน คนหนึ่งทำอาหาร คนหนึ่งขัด ไม่มีใครคุยกัน')],
'wire': [('He fixed the stall light with a spoon and a smile. It still works.', 'Tezgâh lambasını bir kaşık ve bir gülümsemeyle tamir etti. Hâlâ çalışıyor.', 'เขาซ่อมไฟแผงด้วยช้อนกับรอยยิ้ม ตอนนี้ก็ยังติดอยู่'),
         ('She tipped him a trick. He gave her a tour of the wires over her head.', 'Ona bir numara bahşiş verdi. O da başının üstündeki kabloların turunu attırdı.', 'เธอให้กลเม็ดเป็นทิป เขาพาเดินดูสายไฟเหนือหัวเธอ'),
         ('A trick for the toolbox: his eyes lit up and so did a street lamp.', 'Alet çantası için bir numara: gözleri parladı, bir sokak lambası da.', 'กลเม็ดเข้ากล่องเครื่องมือ ตาเขาเป็นประกาย เสาไฟข้างทางก็ติดตาม'),
         ('He does not sleep, so a skipped night makes him feel unwanted.', 'Uyumaz, bu yüzden atlanan gece onu istenmemiş hissettirir.', 'เขาไม่นอน เลยรู้สึกไม่มีใครต้องการเวลาข้ามคืน'),
         ('A fourth pocket, sewn into her apron while she looked elsewhere.', 'Önlüğüne dördüncü bir cep dikildi, o başka yere bakarken.', 'กระเป๋าที่สี่ถูกเย็บติดผ้ากันเปื้อนตอนเธอมองไปทางอื่น'),
         ('One free trick a night. He never saw it. He was across the street.', 'Geceye bir bedava numara. Görmedi. Karşı sokaktaydı.', 'คืนละกลเม็ดฟรี เขาไม่เห็นหรอก เขาอยู่อีกฝั่งถนน'),
         ('Cheap bench jobs. He knows a guy. He is the guy and the guy\'s cousin.', 'Ucuz tezgâh işleri. Bir adam tanıyor. O adam kendisi ve adamın kuzeni.', 'งานโต๊ะช่างราคาถูก เขารู้จักช่างคนนึง ก็ตัวเขาเองกับลูกพี่ลูกน้องช่าง'),
         ('A jammed pocket and a shrug. Wires get tangled, he says.', 'Sıkışan bir cep ve omuz silkme. Kablolar dolaşır, diyor.', 'กระเป๋าติดกับการยักไหล่ สายไฟมันพันกันได้ เขาว่า'),
         ('Hot-wire: the stall hums for a night, and so does the fridge next door.', 'Kaçak bağlantı: tezgâh bir gece vızıldar, yan taraftaki buzdolabı da.', 'ต่อตรง แผงหึ่งทั้งคืน ตู้เย็นข้างบ้านก็หึ่งด้วย'),
         ('He and Madam Receipt argue about who owns the pavement. It belongs to the city.', 'O ile Bayan Fiş kaldırımın kimin olduğunu tartışıyor. Şehrin.', 'เขากับคุณนายใบเสร็จเถียงกันว่าทางเท้าเป็นของใคร จริงๆ เป็นของเมือง')],
'waiting': [('He sits by the night bus stop with a box. Anything left behind finds him.', 'Gece otobüsü durağında bir kutuyla oturuyor. Geride kalan her şey onu bulur.', 'เขานั่งข้างป้ายรถเมล์กลางคืนกับกล่องใบหนึ่ง ของที่ลืมไว้จะมาหาเขาเอง'),
            ('Her first tip went into the box. He promised to keep it until needed.', 'İlk bahşişi kutuya girdi. İhtiyaç olana kadar saklamaya söz verdi.', 'ทิปแรกของเธอลงกล่อง เขาสัญญาว่าจะเก็บไว้จนกว่าจะต้องใช้'),
            ('A charm for the shelf made him do a little dance in cardboard.', 'Rafa bir tılsım onu kartonun içinde küçük bir dansa kaldırdı.', 'ไอเท็มเข้าชั้นทำให้เขาเต้นเบาๆ อยู่ในกล่องกระดาษ'),
            ('She offered a trick. It left at once, he says. They always do.', 'Bir numara önerdi. Hemen kaybolmuş, diyor. Hep öyle olur.', 'เธอยื่นกลเม็ดให้ มันหายไปทันที เขาว่า มันหายทุกที'),
            ('A spare in her pocket. He says everyone needs a spare.', 'Cebinde bir yedek. Herkesin bir yedeğe ihtiyacı var, diyor.', 'ของสำรองในกระเป๋าเธอ เขาว่าทุกคนควรมีของสำรอง'),
            ('He lets a missed deadline pass once. After that, the box has rules.', 'Bir kaçırılan vadeyi bir kez geçirir. Sonrasında kutunun kuralları var.', 'เขายอมให้ตกกำหนดได้หนเดียว หลังจากนั้นกล่องก็มีกฎ'),
            ('Hang up on a call and he quietly keeps her some luck.', 'Bir aramayı kapat, sessizce ona biraz şans saklar.', 'วางสายสักสาย เขาก็เก็บโชคไว้ให้เธออย่างเงียบๆ'),
            ('He stopped calling. The lockers stay shut. He is not angry, only very quiet.', 'Aramayı bıraktı. Dolaplar kapalı. Kızgın değil, sadece çok sessiz.', 'เขาเลิกโทรแล้ว ตู้ปิดอยู่ ไม่ได้โกรธ แค่เงียบมาก'),
            ('A white call is a clean slate. He has been saving it for years.', 'Beyaz arama bir temiz sayfa. Yıllardır saklıyor.', 'สายสีขาวคือการเริ่มใหม่ เขาเก็บไว้หลายปีแล้ว'),
            ('He cannot stand Mr. Ruby: a man who keeps everything and returns nothing.', 'Bay Ruby\'ye dayanamaz: her şeyi tutan, hiçbir şeyi geri vermeyen bir adam.', 'เขาทนมิสเตอร์รูบี้ไม่ไหว คนที่เก็บทุกอย่างและไม่คืนอะไรเลย')],
'tide': [('She poured tea before Nim finished saying hello.', 'Nim merhaba demeyi bitirmeden çay doldurdu.', 'ยายรินชาให้ก่อนที่นิ่มจะทักทายเสร็จ'),
         ('A tip arrived and she put it straight into the river-money jar.', 'Bir bahşiş geldi, hemen nehir parası kavanozuna koydu.', 'ทิปมาถึง ยายใส่โหลเงินแม่น้ำทันที'),
         ('A skipped night earned a pat on the head and a sweet bun.', 'Atlanan gece, başa bir okşama ve tatlı bir çörek getirdi.', 'การข้ามคืนได้ลูบหัวกับขนมปังหวานหนึ่งลูก'),
         ('Spice for an old woman: she held the tea cup to her cheek and said no.', 'Yaşlı kadına acı: çay fincanını yanağına dayayıp hayır dedi.', 'ให้ความเผ็ดกับคนแก่ ยายยกถ้วยชาแนบแก้มแล้วบอกไม่เอา'),
         ('High tide: the money grows while you sleep. She approves of sleeping.', 'Kabarma: para sen uyurken büyür. Uykuyu onaylıyor.', 'น้ำขึ้น เงินงอกเงยขณะนอนหลับ ยายเห็นดีกับการนอน'),
         ('Unused hours rolled into tomorrow. She calls it the river\'s savings.', 'Kullanılmayan saatler yarına aktı. Buna nehrin birikimi diyor.', 'ตาที่เหลือไหลไปพรุ่งนี้ ยายเรียกว่าเงินเก็บของแม่น้ำ'),
         ('Her barge now docks beside the stall. The tea is always hot.', 'Mavnası artık tezgâhın yanına yanaşıyor. Çay hep sıcak.', 'เรือของยายจอดข้างแผงแล้ว ชาร้อนอยู่เสมอ'),
         ('She went quiet and sailed off. The river does not hurry, and neither does she.', 'Sessizleşip yola çıktı. Nehir acele etmez, o da etmez.', 'ยายเงียบแล้วพายเรือออกไป แม่น้ำไม่รีบ ยายก็ไม่รีบ'),
         ('Cargo on credit: three crates and one polite reminder.', 'Veresiye kargo: üç sandık ve bir kibar hatırlatma.', 'ของเชื่อ ลังสามใบกับคำเตือนสุภาพหนึ่งที'),
         ('She and Lady Lamplit argue about sparks. The tea keeps winning.', 'O ile Lamba Hanım kıvılcımlar yüzünden tartışıyor. Çay hep kazanıyor.', 'ยายกับเจ๊หลอดไฟเถียงเรื่องประกายไฟ ชาชนะตลอด')],
'moonbiter': [('A steel-wool pad on a hot grill said sorry before it said hello.', 'Sıcak ızgaradaki bir tel sünger merhaba demeden önce özür diledi.', 'ใยขัดบนเตาร้อนขอโทษก่อนที่จะทักทาย'),
              ('A tip: he scrubbed it twice and handed it back shinier.', 'Bir bahşiş: iki kez kazıdı ve daha parlak geri verdi.', 'ทิปชิ้นหนึ่ง เขาขัดสองรอบแล้วส่งคืนให้เงากว่าเดิม'),
              ('A curse for him? He wept a little and ate it politely.', 'Onun için bir lanet mi? Biraz ağladı ve nazikçe yedi.', 'คำสาปให้เขาเหรอ เขาน้ำตาซึมนิดหน่อยแล้วกินอย่างสุภาพ'),
              ('She tried tipping him Caps. They stuck to him. He apologised for hours.', 'Ona Kapak bahşiş vermeye çalıştı. Yapıştılar. Saatlerce özür diledi.', 'เธอลองให้ฝาขวดเป็นทิป มันติดตัวเขา เขาขอโทษอยู่หลายชั่วโมง'),
              ('He noticed the grill was neat. He cried a little with joy.', 'Izgaranın düzenli olduğunu fark etti. Sevinçten biraz ağladı.', 'เขาเห็นว่าเตาเรียบร้อยดี เขาน้ำตาไหลเพราะดีใจ'),
              ('After a Flare-up he pays for the cleaning. He insists on a receipt.', 'Parlamadan sonra temizliği o öder. Fiş konusunda ısrarcı.', 'หลังไฟลุกเขาออกค่าขัดล้างเอง และยืนยันขอใบเสร็จ'),
              ('Even the Soot is special now. He rewrote the rules and apologised.', 'Artık İs bile özel. Kuralları yeniden yazdı ve özür diledi.', 'ตอนนี้แม้แต่เขม่าก็พิเศษ เขาเขียนกฎใหม่แล้วขอโทษ'),
              ('He went hungry and the floor stayed dirty. Nobody was happy.', 'Aç kaldı, zemin kirli kaldı. Kimse mutlu değildi.', 'เขาหิวและพื้นก็ยังสกปรก ไม่มีใครมีความสุข'),
              ('Deep clean: two things gone and the centre stays hollow. Sorry.', 'Derin temizlik: iki şey gitti, orta boş kaldı. Pardon.', 'ขัดล้างใหญ่ ของหายไปสองอย่าง ช่องกลางโหว่ ขอโทษครับ'),
              ('He and Chef Quack share a stove. One makes the mess, one cleans it.', 'O ile Şef Vak bir ocağı paylaşıyor. Biri dağıtır, biri temizler.', 'เขากับเชฟกาบใช้เตาเดียวกัน คนหนึ่งทำเลอะ คนหนึ่งขัด')],
'lamplit': [('A light bulb on a cable greeted her and asked what time she goes to bed.', 'Kablodaki bir ampul onu selamladı ve kaçta yattığını sordu.', 'หลอดไฟบนสายทักทายเธอและถามว่าปกตินอนกี่โมง'),
            ('A tip made her glow. She said it was the electric bill.', 'Bir bahşiş onu parlattı. Elektrik faturası, dedi.', 'ทิปทำให้เธอเรืองแสง เธอบอกว่านั่นคือค่าไฟ'),
            ('Spice offered gladly: she hummed a happy buzz for a full minute.', 'Acı gönülle verildi: bir dakika boyunca mutlu mutlu vızıldadı.', 'ให้ความเผ็ดอย่างเต็มใจ เธอส่งเสียงหึ่งอย่างมีความสุขทั้งนาที'),
            ('She was offered a charm and flickered, offended.', 'Ona bir tılsım uzatıldı, gücenip titreşti.', 'มีคนยื่นไอเท็มให้เธอ เธอกะพริบถี่อย่างไม่พอใจ'),
            ('Warm hands tonight. She says it is the best thing to meet.', 'Bu gece sıcak eller. Tanışılacak en güzel şey, diyor.', 'คืนนี้มืออุ่นๆ เธอว่าเป็นสิ่งที่ดีที่สุดที่จะได้เจอ'),
            ('Burning bright: every level pays more. She counted them with her cable.', 'Parlak yanış: her seviye daha çok öder. Kablosuyla saydı.', 'ไฟลุกโชน ทุกระดับจ่ายเพิ่ม เธอใช้สายไฟนับ'),
            ('Fireproof: a Flare-up now only singes and even pays out.', 'Yanmaz: Parlama artık sadece kavurur, hatta ödeme yapar.', 'กันไฟ ตอนนี้ไฟลุกแค่ลวกและยังจ่ายให้ด้วย'),
            ('The bulb went dim. Nim said sorry. The bulb said not yet.', 'Ampul söndü. Nim özür diledi. Ampul daha değil dedi.', 'หลอดไฟสลัวลง นิ่มขอโทษ หลอดไฟบอกว่ายัง'),
            ('Midnight run: all the Spice, all the pay, one dim bulb afterwards.', 'Gece koşusu: bütün acı, bütün ödeme, ardından sönük bir ampul.', 'วิ่งเที่ยงคืน เผ็ดสุด จ่ายสุด หลังจากนั้นหลอดไฟสลัวหนึ่งดวง'),
            ('She and Grandmother Tide have argued since the first rain. It rains a lot.', 'O ile Gelgit Nine ilk yağmurdan beri tartışıyor. Çok yağmur yağıyor.', 'เธอกับยายน้ำขึ้นเถียงกันมาตั้งแต่ฝนแรก ฝนตกบ่อยมาก')],
}
assert set(PG) == set(SPIRITS) and all(len(v) == 10 for v in PG.values())
pages = [dict(spirit=s, n=i + 1, event=PAGE_EVENTS[i], text=T(*PG[s][i])) for s in SPIRITS for i in range(10)]
CODEX_TABS = [
    ('charms', T('Charms', 'Tılsımlar', 'ไอเท็ม'), 172, T('Own it once to read it. Mastered = clear a place with it 3 times.', 'Okumak için bir kez sahip ol. Ustalık = onunla bir yeri 3 kez bitir.', 'ต้องมีสักครั้งถึงจะอ่านได้ ชำนาญ = ผ่านด่านด้วยไอเท็มนี้ 3 ครั้ง'), dict(stash=[10, 20, 30, 60], key=dict(at=50, key='brass'))),
    ('tricks', T('Tricks', 'Numaralar', 'กลเม็ด'), 20, T('Use it once to read it.', 'Okumak için bir kez kullan.', 'ใช้สักครั้งถึงจะอ่านได้'), dict(key=dict(at=100, key='silver'))),
    ('symbols', T('Symbols and shapes', 'Semboller ve desenler', 'สัญลักษณ์และลาย'), 25, T('See it on the machine, then land it, then land it with 5 or more cells.', 'Makinede gör, sonra indir, sonra 5+ hücreyle indir.', 'เห็นบนเครื่อง แล้วทำให้ได้ แล้วทำให้ได้ 5 ช่องขึ้นไป'), dict(postcard=dict(at=100))),
    ('deals', T('Deals and curses', 'Anlaşmalar ve lanetler', 'ดีลและคำสาป'), 46, T('See it, sign it or carry it, then survive it.', 'Gör, imzala ya da taşı, sonra atlat.', 'เห็น เซ็นหรือแบก แล้วผ่านมันไปให้ได้'), dict(key=dict(at=50, key='brass'))),
    ('neighbours', T('Neighbours', 'Komşular', 'เพื่อนบ้าน'), 80, T('Each page opens by an event with that neighbour: meet, tip, a step up, a fed-up moment, a red deal, Him or Me.', 'Her sayfa o komşuyla bir olayla açılır: tanışma, bahşiş, bir basamak, küsme, kırmızı anlaşma, O mu Ben mi.', 'แต่ละหน้าเปิดจากเหตุการณ์กับเพื่อนบ้านคนนั้น เช่น พบกัน ทิป สนิทขึ้น หงุดหงิด ดีลแดง เลือกฉันหรือเขา'), dict(stash=[100])),
    ('people', T('People and places', 'İnsanlar ve yerler', 'ผู้คนและสถานที่'), 33, T('Meet them, clear the place, earn the stamp.', 'Tanış, yeri bitir, mührü kazan.', 'พบเขา ผ่านด่าน รับตราประทับ'), dict(deedProgress=True)),
    ('fusion', T('Blender recipes', 'Karıştırma tarifleri', 'สูตรปั่นไอเท็ม'), 24, T('Blend a pair once to write its recipe in. Unfound recipes show the two families and a question mark.', 'Bir çifti bir kez karıştır, tarifi yazılır. Bulunmayanlar iki aileyi ve bir soru işareti gösterir.', 'ปั่นคู่นั้นสักครั้งเพื่อจดสูตร สูตรที่ยังไม่เจอจะโชว์สองตระกูลกับเครื่องหมายคำถาม'), dict(stash=[60])),
]
redeye_page = dict(id='redeye', icon='sym/redeye', name=T('The Red Eye', 'Kırmızı Göz', 'ดวงตาแดง'), unlock=dict(redEyesMin=1), text=T(
    'A red neon eye that sometimes switches on in the middle of the machine. From debt 3 it appears on its own, and the chance is always shown on the machine trim. It never matches and blocks every shape through it. Debts 3 to 4: that spin pays nothing. Debts 5 to 6: it also takes what you won this round from the purse. Debt 7 and later: the purse goes to nothing. Coins in the Kiosk are always safe. After an eye, every call card is red.',
    'Makinenin ortasında bazen yanan kırmızı bir neon göz. 3. borçtan itibaren kendiliğinden çıkar, ihtimali makinenin çerçevesinde hep görünür. Hiçbir şeyle eşleşmez, içinden geçen her şekli keser. 3-4. borçlar: o çeviriş ödemez. 5-6. borçlar: bu el kazandığını da kesenden alır. 7. borç ve sonrası: kese sıfırlanır. Kiosk\'taki para her zaman güvende. Bir gözden sonra her arama kartı kırmızıdır.',
    'ดวงตานีออนสีแดงที่บางครั้งติดขึ้นกลางเครื่อง ตั้งแต่หนี้ที่ 3 มันโผล่เอง และโอกาสแสดงบนขอบเครื่องเสมอ มันไม่จับคู่กับอะไรและขวางทุกรูปทรงที่ผ่าน หนี้ 3 ถึง 4 ตานั้นไม่ได้เหรียญ หนี้ 5 ถึง 6 ยังเอาเงินที่ได้ในรอบนี้ออกจากถุงด้วย หนี้ 7 ขึ้นไป ถุงเงินเหลือศูนย์ เหรียญในตู้ฝากเงินปลอดภัยเสมอ หลังดวงตาแดงทุกการ์ดโทรศัพท์จะเป็นสีแดง'))
codex = dict(tabs=[dict(id=i, name=n, entries=c, how=h, reward=r) for i, n, c, h, r in CODEX_TABS], pages=pages, redEye=redeye_page,
             locked=dict(silhouette=T('Not found yet', 'Henüz bulunmadı', 'ยังไม่เจอ'), where=T('Where: {where}', 'Nerede: {where}', 'ได้จาก: {where}')),
             completion=dict(total=sum(c for _, _, c, _, _ in CODEX_TABS) + 1))
