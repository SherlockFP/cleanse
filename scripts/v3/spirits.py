# v3 spirits, curses_v3, omens and errands. Numbers are SPEC 3.6 verbatim except where noted in the report.
# Words: tip, favour, deal, regular, fan. Never "offering", "blessing", "devotion", "worship". Spirits never foretell results.
# ---------- curses_v3 ----------
curses3 = []
def CU(i, icon, en, tr, th, *effs):
    assert icon in ALLICONS, icon
    rules = [pas(*effs)]
    curses3.append(dict(id=i, name=T(en, tr, th), icon=icon, rules=rules, text=text(rules)))
CU('haggler', 'curse/haggler', 'Pinched Prices', 'Kıstırılan Fiyatlar', 'ราคาถูกบีบ', sflag('rerollDouble'))
CU('short_circuit', 'curse/short_circuit', 'Short Circuit', 'Kısa Devre', 'ไฟช็อต', sflag('trickPockets', -1))
CU('heavy_hands', 'curse/heavy_hands', 'Heavy Luggage', 'Ağır Bavul', 'กระเป๋าหนัก', sflag('noRelic'))
CU('slow_water', 'curse/slow_water', 'Slow Water', 'Yavaş Su', 'น้ำไหลช้า', sflag('spinsLess', 1))
CU('hollow_centre', 'curse/hollow_centre', 'Hollow Centre', 'Boş Merkez', 'ช่องกลางโหว่', sflag('deadCentre'))
CU('dark_wick', 'curse/dark_wick', 'Dim Bulb', 'Sönük Ampul', 'หลอดไฟสลัว', sflag('heatMax', 8))
CNAME = {c['id']: c['name'] for c in curses + curses3}

# ---------- helpers ----------
def STG(sid, at, name, *rules):
    rules = list(rules)
    return dict(at=at, id='%s_%d' % (sid, abs(at)), name=name, rules=rules, text=text(rules))
def GIFT(i, icon, name, *effs):
    assert icon in ALLICONS, icon
    return dict(id=i, icon=icon, name=name, effects=list(effs), text=etext(effs))
def RED(i, icon, name, boon, curse=None, carry=(), due=None):
    assert icon in ALLICONS, icon
    boon, carry = list(boon), list(carry)
    out = {}
    for l in L:
        s = cap(', '.join(eff(e, l) for e in boon)) + ('' if l == 'th' else '.')
        bits = ([CNAME[curse][l]] if curse else []) + [eff(e, l) for e in carry]
        if bits: s += {'en': ' You carry: %s.', 'tr': ' Taşıdığın: %s.', 'th': ' ต้องแบก: %s'}[l] % ', '.join(bits)
        if due:
            els = ', '.join(eff(e, l) for e in due['else'])
            s += {'en': ' Due: pay this debt within %d nights, or %s.', 'tr': ' Vade: %d gecede öde, yoksa %s.', 'th': ' กำหนด: จ่ายหนี้ภายใน %d คืน ไม่งั้น%s'}[l] % (due['rounds'], els)
        out[l] = s
    d = dict(id=i, icon=icon, name=name, boon=boon, curse=curse, carry=carry, text=out)
    if due: d['due'] = due
    return d

TASTE = lambda c, k, s, t, ch, cu, sk: dict(coins=c, caps=k, spice=s, trick=t, charm=ch, curse=cu, skip=sk)
L_, F_, M_, H_ = 2, 1, 0.5, -1  # Loved, Fine, Meh, Hated

def LN(**k):
    assert set(k) == {'meet', 'gift', 'red', 'loved', 'insult', 'noticed', 'friend', 'patron', 'wrath', 'himOrMe', 'omenTpl', 'demand', 'epilogue'}, set(k)
    for key, v in k.items():
        if key == 'omenTpl': assert all('{v}' in x for x in v), v
    return {key: T(*v) for key, v in k.items()}

SP = []
# ===== Mr. Ruby =====
SP.append(dict(
    id='brimble', name=SPN['brimble'], domain=T('debt, deals', 'borç, anlaşmalar', 'หนี้ ข้อตกลง'), rival='waiting', unlock={'start': True}, local=['c1', 'c10'],
    portrait=dict(calm='devil/idle', glad='devil/grin', cross='devil/angry'), taste=TASTE(F_, L_, M_, M_, H_, F_, H_),
    hint=T('Likes Caps. Hates charms and skipped nights.', 'Kapak sever. Tılsımdan ve atlanan geceden nefret eder.', 'ชอบฝาขวด เกลียดไอเท็มกับการข้ามคืน'),
    stages=[STG('brimble', 2, T('No Hard Feelings', 'Kırgınlık Yok', 'ไม่ถือสา'), pas(sflag('refuseWick', 3))),
            STG('brimble', 5, T('Friend Rate', 'Dost Faizi', 'ดอกเบี้ยเพื่อน'), pas(E('interest', 3))),
            STG('brimble', 8, T('Open Account', 'Açık Hesap', 'บัญชีเปิด'), R('onDeal', None, E('wick', 2), E('coins', 20)))],
    wrath=[STG('brimble', -2, T('Late Notice', 'Gecikme İhtarı', 'ใบเตือน'), pas(sflag('noInterest'))),
           STG('brimble', -5, T('Collections', 'Tahsilat', 'ทวงหนี้'), pas(sflag('noPawn')))],
    gifts=[], red=dict(deals=True), ownCurse='small_print', omen='nextDebts', demand='signDeal',
    lines=LN(meet=('Mr. Ruby. Debt, deals, paper. You will like the paper.', 'Bay Ruby. Borç, anlaşma, evrak. Evrakı seveceksin.', 'มิสเตอร์รูบี้ครับ หนี้ ข้อตกลง เอกสาร เดี๋ยวคุณจะชอบเอกสาร'),
        gift=('Complimentary. It will be on the invoice.', 'Hediye. Faturaya yazılacak.', 'ของแถมครับ แต่จะไปอยู่ในใบแจ้งหนี้'),
        red=('Sign here. The smaller print is on the back.', 'Buraya imza. Küçük yazılar arkada.', 'เซ็นตรงนี้ครับ ตัวหนังสือเล็กๆ อยู่ด้านหลัง'),
        loved=('Caps. Honest currency. I accept.', 'Kapak. Dürüst para. Kabul.', 'ฝาขวด เงินสุจริต รับครับ'),
        insult=('A tip for the creditor? Cute. Also a bad bribe.', 'Alacaklıya bahşiş mi? Tatlı. Ama kötü bir rüşvet.', 'ให้ทิปเจ้าหนี้เหรอ น่ารักดี แต่เป็นสินบนที่แย่มาก'),
        noticed=('You read the clauses. I noticed.', 'Maddeleri okudun. Fark ettim.', 'คุณอ่านข้อสัญญา ผมสังเกตเห็นแล้ว'),
        friend=('Friends get a better rate. Do not tell the others.', 'Dostlara daha iyi oran. Diğerlerine söyleme.', 'เพื่อนได้เรตดีกว่า อย่าบอกคนอื่นนะ'),
        patron=('Regular customer now. I keep a stool for you.', 'Artık müdavimsin. Sana bir tabure ayırdım.', 'ขาประจำแล้ว ผมเก็บเก้าอี้ไว้ให้ตัวหนึ่ง'),
        wrath=('Late notice. I am being polite about it.', 'Gecikme ihtarı. Nazik davranıyorum.', 'หนังสือเตือนครับ ผมยังสุภาพอยู่นะ'),
        himOrMe=('He gives things back for free. I charge. Think about that.', 'O her şeyi bedavaya geri verir. Ben ücret alırım. Bir düşün.', 'เขาคืนของให้ฟรี ผมคิดเงิน ลองคิดดู'),
        omenTpl=('I saw the ledger. Next debts: {v}.', 'Defteri gördüm. Sıradaki borçlar: {v}.', 'ผมเห็นสมุดบัญชีแล้ว หนี้ถัดไป: {v}'),
        demand=('Sign something before this debt is paid. Do not make me ask twice.', 'Bu borç bitmeden bir şey imzala. İki kere söyletme.', 'เซ็นอะไรสักอย่างก่อนปลดหนี้ก้อนนี้ อย่าให้ผมต้องพูดสองรอบ'),
        epilogue=('Mr. Ruby keeps a stool on Nim\'s corner. She pays the bill. He pretends to complain.', 'Bay Ruby, Nim\'in köşesinde bir tabure tutuyor. Hesabı Nim ödüyor. O da şikâyet ediyormuş gibi yapıyor.', 'มิสเตอร์รูบี้เก็บเก้าอี้ไว้ตัวหนึ่งที่หัวมุมของนิ่ม นิ่มเป็นคนจ่ายค่าเก้าอี้ ส่วนเขาก็แกล้งบ่น'))))

# ===== Madam Receipt (id beckon): the stall, prices =====
SP.append(dict(
    id='beckon', name=SPN['beckon'], domain=T('the stall, prices', 'tezgâh, fiyatlar', 'แผง ราคา'), rival='wire', unlock={'start': True}, local=['c4', 'c9'],
    portrait=dict(calm='spirit/beckon_calm', glad='spirit/beckon_glad', cross='spirit/beckon_cross'), taste=TASTE(L_, F_, M_, F_, F_, H_, M_),
    hint=T('Likes plain coins. Hates curses.', 'Düz parayı sever. Lanetten nefret eder.', 'ชอบเหรียญ เกลียดคำสาป'),
    stages=[STG('beckon', 2, T('First Customer', 'İlk Müşteri', 'ลูกค้าคนแรก'), pas(sflag('shopExtra', 1))),
            STG('beckon', 5, T('Loyalty Card', 'Sadakat Kartı', 'บัตรสะสมแต้ม'), pas(sflag('shopDiscount', 10))),
            STG('beckon', 8, T('Open Late', 'Geç Saate Kadar Açık', 'เปิดดึก'), pas(sflag('shopDiscount', 20)), R('onDebtPaid', None, E('gainCharm', rarity='common')))],
    wrath=[STG('beckon', -2, T('Marked Up', 'Zamlı', 'ขึ้นราคา'), pas(sflag('shopMarkup', 20))),
           STG('beckon', -5, T('No Haggling', 'Pazarlık Yok', 'ห้ามต่อราคา'), pas(sflag('rerollDouble')))],
    gifts=[GIFT('beckon_staff', 'deal/shop', T('Staff Price', 'Personel Fiyatı', 'ราคาพนักงาน'), sflag('shopDiscount', 30, 'debt')),
           GIFT('beckon_shelf', 'deal/mystery', T('Back Shelf', 'Arka Raf', 'ชั้นหลังร้าน'), sflag('shopExtra', 2, 'debt')),
           GIFT('beckon_refund', 'deal/coins', T('Full Refund', 'Tam İade', 'คืนเต็มราคา'), sflag('sellFull', True, 'debt')),
           GIFT('beckon_cash', 'ui/coin', T('Petty Cash', 'Küçük Kasa', 'เงินสดย่อย'), E('coins', 15))],
    red=RED('clearance', 'deal/shop', T('Clearance Sale', 'Stok Eritme', 'เซลล้างสต็อก'), [sflag('sellFull', True, 'debt'), sflag('shopDiscount', 50, 'debt')], carry=[sflag('noShopN', 2)]),
    ownCurse='haggler', omen='nextOffers', demand='buy2',
    lines=LN(meet=('Madam Receipt, stall accounts. Everything is itemised. Everything.', 'Bayan Fiş, tezgâh hesapları. Her şey kalem kalem yazılır. Her şey.', 'คุณนายใบเสร็จ ดูแลบัญชีแผงค่ะ ทุกอย่างลงรายการหมด ทุกอย่างเลย'),
        gift=('A line in your favour. Keep the receipt.', 'Senin lehine bir satır. Fişi sakla.', 'รายการนี้ลงบัญชีให้คุณค่ะ เก็บใบเสร็จไว้นะคะ'),
        red=('Clearance sale. Final. No refunds after the second night.', 'Stok eritme. Son. İkinci geceden sonra iade yok.', 'เซลล้างสต็อกค่ะ ครั้งสุดท้าย เลยคืนที่สองแล้วไม่รับคืน'),
        loved=('Cash. Counted twice. Noted with thanks.', 'Nakit. İki kez sayıldı. Teşekkürle kaydedildi.', 'เงินสด นับสองรอบแล้วค่ะ ขอบคุณ ลงบัญชีแล้ว'),
        insult=('That is not legal tender. Struck from the record.', 'Bu geçerli para değil. Kayıttan silindi.', 'อันนี้ไม่ใช่เงินที่รับได้ค่ะ ขีดออกจากบัญชี'),
        noticed=('You paid on time. I keep a file on customers like you.', 'Zamanında ödedin. Senin gibi müşterilerin dosyasını tutarım.', 'จ่ายตรงเวลานะคะ ฉันมีแฟ้มเก็บลูกค้าแบบนี้ไว้'),
        friend=('Loyalty card, stamped. Ten percent off, no questions.', 'Sadakat kartı mühürlendi. Yüzde on indirim, soru yok.', 'ประทับบัตรสะสมแต้มแล้วค่ะ ลดสิบเปอร์เซ็นต์ ไม่ต้องถามอะไร'),
        patron=('Open late, just for you. Prices as low as I can bear.', 'Sırf senin için geç saate kadar açık. Fiyatlar dayanabildiğim kadar düşük.', 'เปิดดึกเพื่อคุณคนเดียวค่ะ ราคาต่ำที่สุดที่ฉันทนไหว'),
        wrath=('Your balance is overdue. Prices are up, dear customer.', 'Hesabın gecikti. Fiyatlar çıktı, sevgili müşteri.', 'ยอดคุณค้างอยู่ค่ะ ราคาขึ้นแล้วนะคะลูกค้า'),
        himOrMe=('Wire sells off a tray. I keep the books. Choose.', 'Tel tepsiden satar. Ben defteri tutarım. Seç.', 'ลุงสายไฟขายของบนถาด ฉันถือสมุดบัญชี เลือกเลยค่ะ'),
        omenTpl=('I peeked at the next shelf. Coming up: {v}.', 'Sıradaki rafa göz attım. Gelenler: {v}.', 'ฉันแอบดูชั้นของแผงถัดไปค่ะ มีของ: {v}'),
        demand=('Buy two things at the next stall. Receipts to follow.', 'Sıradaki tezgâhtan iki şey al. Fişler peşinden.', 'ซื้อของสองชิ้นที่แผงหน้านะคะ ใบเสร็จตามมา'),
        epilogue=('Madam Receipt printed a receipt for the whole climb. It is eleven metres long and Nim keeps it.', 'Bayan Fiş bütün yükseliş için bir fiş bastı. On bir metre uzunluğunda ve Nim saklıyor.', 'คุณนายใบเสร็จพิมพ์ใบเสร็จของการไต่เต้าทั้งหมดออกมา ยาวสิบเอ็ดเมตร และนิ่มเก็บไว้'))))

# ===== Chef Quack (id gold): the Special, Luck =====
SP.append(dict(
    id='gold', name=SPN['gold'], domain=T('the Special, Luck', 'Gözde, Şans', 'เมนูเด็ด โชค'), rival='moonbiter', unlock={'start': True}, local=['c3'],
    portrait=dict(calm='spirit/gold_calm', glad='spirit/gold_glad', cross='spirit/gold_cross'), taste=TASTE(F_, F_, M_, L_, H_, M_, H_),
    hint=T('Likes tricks. Hates charms and skipped nights.', 'Numaraları sever. Tılsımdan ve atlanan geceden nefret eder.', 'ชอบกลเม็ด เกลียดไอเท็มกับการข้ามคืน'),
    stages=[STG('gold', 2, T("Chef's Pick", 'Şefin Seçimi', 'เมนูเชฟเลือก'), pas(E('luck', 1))),
            STG('gold', 5, T('Your Order', 'Senin Siparişin', 'สั่งเองได้'), pas(sflag('pickFirstFav'))),
            STG('gold', 8, T('Two Specials', 'İki Özel', 'เมนูเด็ดสองอย่าง'), pas(sflag('twoFavs')))],
    wrath=[STG('gold', -2, T('Menu Hidden', 'Menü Gizli', 'ซ่อนเมนู'), pas(sflag('hideFav'))),
           STG('gold', -5, T('Burnt Pan', 'Yanık Tava', 'กระทะไหม้'), pas(E('luck', -3)))],
    gifts=[GIFT('gold_burner', 'ui/luck', T('Hot Burner', 'Kızgın Ocak', 'เตาร้อน'), E('luck', 2, scope='debt')),
           GIFT('gold_gadgets', 'ui/trick_bag', T('Kitchen Gadgets', 'Mutfak Aletleri', 'ของใช้ในครัว'), E('trick', 2)),
           GIFT('gold_peek', 'ui/favour', T('Peek at the Board', 'Tahtaya Göz At', 'ชะโงกดูกระดาน'), sflag('seeNextFav', True, 'debt')),
           GIFT('gold_touch', 'ui/star', T("Chef's Touch", 'Şefin Dokunuşu', 'ฝีมือเชฟ'), E('symValue', 2, sym='favoured', scope='debt'))],
    red=RED('rush_order', 'deal/luck', T('Rush Order', 'Acil Sipariş', 'ออเดอร์ด่วน'), [E('luck', 5, scope='debt')], due=dict(rounds=2, **{'else': [E('loseCharm', pick='best')]})),
    ownCurse='sticky_fingers', omen='favBoard', demand='letMePick',
    lines=LN(meet=('Quack! Chef Quack, head of the Special. The Special is my department.', 'Vak! Şef Vak, Gözde\'nin başı. Gözde benim bölümüm.', 'ก๊าบ! เชฟกาบ หัวหน้าเมนูเด็ดครับ เมนูเด็ดเป็นแผนกของผม'),
        gift=('Order up! Hot and free. Do not tell the customers.', 'Sipariş hazır! Sıcak ve bedava. Müşterilere söyleme.', 'ออเดอร์ออกแล้ว! ร้อนๆ ฟรี อย่าบอกลูกค้านะ'),
        red=('Rush order: lots of Luck now. Pay late and I take your best charm.', 'Acil sipariş: hemen bol Şans. Geç ödersen en iyi tılsımını alırım.', 'ออเดอร์ด่วน โชคเยอะทันที จ่ายช้าผมยึดไอเท็มที่ดีที่สุดนะ'),
        loved=('A new gadget! Quack quack. Best tip of the night.', 'Yeni bir alet! Vak vak. Gecenin en iyi bahşişi.', 'ของเล่นชิ้นใหม่! ก๊าบๆ ทิปดีที่สุดของคืนนี้'),
        insult=('I am a duck, not a bin. Take that away.', 'Ben ördeğim, çöp kutusu değil. Götür şunu.', 'ผมเป็ดนะ ไม่ใช่ถังขยะ เอาไปเลย'),
        noticed=('You ordered the Special twice. Good taste.', 'Gözde\'yi iki kez sipariş ettin. İyi zevk.', 'สั่งเมนูเด็ดสองรอบเลย รสนิยมดี'),
        friend=('You pick the first dish. Do not burn it.', 'İlk yemeği sen seç. Yakma.', 'จานแรกคุณเลือกเอง อย่าทำไหม้ล่ะ'),
        patron=('Two Specials tonight! Chef\'s kiss. Quack.', 'Bu gece iki Özel! Şefin öpücüğü. Vak.', 'คืนนี้เมนูเด็ดสองอย่าง! จุ๊บเชฟ ก๊าบ'),
        wrath=('The board is covered up. Nobody eats until I say.', 'Tahta örtüldü. Ben demeden kimse yemek yemez.', 'ผมปิดกระดานเมนูแล้ว ผมไม่สั่ง ไม่มีใครได้กิน'),
        himOrMe=('Scrubby wipes my board clean. I cook, it scrapes. Pick a side.', 'Kazıcı tahtamı siler. Ben pişiririm, o kazır. Taraf seç.', 'แปรงขัดมาเช็ดกระดานผมจนเกลี้ยง ผมทำอาหาร มันขัดทิ้ง เลือกข้างสิ'),
        omenTpl=('I read the board over the cook\'s shoulder: {v}.', 'Aşçının omzu üstünden tahtayı okudum: {v}.', 'ผมชะโงกดูกระดานเหนือไหล่พ่อครัว: {v}'),
        demand=('Let me choose the Special for one spin. Trust the chef.', 'Bir çeviriş için Gözde\'yi ben seçeyim. Şefe güven.', 'ให้ผมเลือกเมนูเด็ดสักตาหนึ่ง เชื่อใจเชฟสิ'),
        epilogue=('Chef Quack has a stool beside Nim\'s stall. The Special sells out every night. Nobody knows how.', 'Şef Vak, Nim\'in tezgâhının yanında bir tabureye sahip. Gözde her gece tükeniyor. Kimse nasıl olduğunu bilmiyor.', 'เชฟกาบมีเก้าอี้ข้างแผงของนิ่ม เมนูเด็ดหมดทุกคืน ไม่มีใครรู้ว่าทำได้ยังไง'))))

# ===== Uncle Wire: tricks, the bench =====
SP.append(dict(
    id='wire', name=SPN['wire'], domain=T('tricks, the bench', 'numaralar, tezgâh', 'กลเม็ด โต๊ะช่าง'), rival='beckon', unlock={'c': 'c2'}, local=['c2', 'c9'],
    portrait=dict(calm='spirit/wire_calm', glad='spirit/wire_glad', cross='spirit/wire_cross'), taste=TASTE(F_, M_, F_, L_, F_, H_, H_),
    hint=T('Likes tricks. Hates curses and skipped nights.', 'Numaraları sever. Lanetten ve atlanan geceden nefret eder.', 'ชอบกลเม็ด เกลียดคำสาปกับการข้ามคืน'),
    stages=[STG('wire', 2, T('Fourth Pocket', 'Dördüncü Cep', 'กระเป๋าที่สี่'), pas(sflag('trickPockets', 1))),
            STG('wire', 5, T('Odd Jobs', 'Ufak Tefek İşler', 'งานจิปาถะ'), pas(sflag('firstTrickFree'))),
            STG('wire', 8, T('Splice Hand', 'Usta El', 'มือช่างต่อสาย'), R('onDebtStart', None, E('trick', 2)))],
    wrath=[STG('wire', -2, T('Jammed Pocket', 'Sıkışan Cep', 'กระเป๋าติด'), pas(sflag('trickPockets', -1))),
           STG('wire', -5, T('Blown Fuse', 'Atan Sigorta', 'ฟิวส์ขาด'), pas(sflag('trickPockets', -1)))],
    gifts=[GIFT('wire_parts', 'ui/trick_bag', T('Spare Parts', 'Yedek Parça', 'อะไหล่'), E('trick', 2)),
           GIFT('wire_pocket', 'deal/slot', T('Extra Pocket', 'Ek Cep', 'กระเป๋าเพิ่ม'), sflag('trickPockets', 1, 'debt')),
           GIFT('wire_fix', 'deal/power', T('Free Fix', 'Bedava Tamir', 'ซ่อมฟรี'), sflag('benchDiscount', 100, 'debt')),
           GIFT('wire_jump', 'ui/honk', T('Jump Start', 'Takviye', 'จั๊มพ์สตาร์ท'), E('charge', 99))],
    red=RED('hot_wire', 'deal/power', T('Hot-wire', 'Kaçak Bağlantı', 'ต่อตรง'), [E('trick', 3), sflag('trickFree', True, 'debt')], curse='short_circuit'),
    ownCurse='short_circuit', omen='benchPrices', demand='handTrick',
    lines=LN(meet=('Hey, friend! Wire, street fixes. I have a trick. It has a hole. You have a thumb.', 'Hey dostum! Tel, sokak tamircisi. Bir numaram var. Deliği var. Senin de başparmağın.', 'ไงเพื่อน! ลุงสายไฟ ช่างข้างถนน ผมมีกลเม็ดอันนึง มีรู ส่วนคุณมีนิ้วโป้ง'),
        gift=('Spare part, brand new. Well, new to you.', 'Yedek parça, sıfır. Yani senin için sıfır.', 'อะไหล่ใหม่เอี่ยม ก็ใหม่สำหรับคุณนะ'),
        red=('Hot-wire! Three tricks, free to use. The wiring may hum. It is fine.', 'Kaçak bağlantı! Üç numara, bedava kullan. Kablo vızıldayabilir. Sorun yok.', 'ต่อตรง! กลเม็ดสามชิ้น ใช้ฟรี สายอาจจะหึ่งๆ หน่อย ไม่เป็นไร'),
        loved=('A trick for the toolbox. You know my heart, friend.', 'Alet çantasına bir numara. Kalbimi biliyorsun dostum.', 'กลเม็ดเข้ากล่องเครื่องมือ รู้ใจกันจริงๆ เพื่อน'),
        insult=('Skip a night? I do not sleep, you do not skip. Take it back.', 'Gece mi atlayacaksın? Ben uyumam, sen atlamazsın. Geri al.', 'ข้ามคืนเหรอ ผมไม่นอน คุณก็ไม่ข้าม เอากลับไป'),
        noticed=('Fourth pocket. Tools do not carry themselves.', 'Dördüncü cep. Aletler kendi kendine taşınmaz.', 'กระเป๋าที่สี่ เครื่องมือไม่เดินเองหรอก'),
        friend=('One trick a night, free. I never saw anything.', 'Geceye bir numara, bedava. Ben hiçbir şey görmedim.', 'คืนละกลเม็ดฟรี ผมไม่เห็นอะไรทั้งนั้น'),
        patron=('Bench jobs are cheaper now. I know a guy. I am the guy.', 'Tezgâh işleri ucuzladı. Bir adam tanıyorum. O adam benim.', 'งานโต๊ะช่างถูกลงแล้ว ผมรู้จักช่างคนนึง ก็ผมนี่แหละ'),
        wrath=('A pocket jammed? Happens when you ignore the neighbours.', 'Cep mi sıkıştı? Komşuları görmezden gelince olur.', 'กระเป๋าติดเหรอ เป็นงี้แหละเวลาไม่สนใจเพื่อนบ้าน'),
        himOrMe=('Madam Receipt has a cash drawer. I have a street. Streets are free.', 'Bayan Fiş\'in para çekmecesi var. Benim sokağım. Sokaklar bedava.', 'คุณนายใบเสร็จมีลิ้นชักเก็บเงิน ผมมีถนน ถนนไม่เสียค่าเช่า'),
        omenTpl=('Heard it at the bench. Prices: {v}.', 'Tezgâhta duydum. Fiyatlar: {v}.', 'ได้ข่าวจากโต๊ะช่าง ราคา: {v}'),
        demand=('Give me a trick, I give you two. Fair? Fair.', 'Bana bir numara ver, sana iki vereyim. Adil mi? Adil.', 'ให้กลเม็ดผมหนึ่ง ผมให้คุณสอง แฟร์ใช่ไหม แฟร์'),
        epilogue=('Uncle Wire rewired the whole street for Nim. Half of it works. The tower has Wi-Fi now. Do not ask.', 'Tel Amca bütün sokağı Nim için yeniden kablolayı. Yarısı çalışıyor. Kulede artık Wi-Fi var. Sorma.', 'ลุงสายไฟเดินสายใหม่ทั้งซอยให้นิ่ม ใช้ได้ครึ่งหนึ่ง ตึกสูงมีไวไฟแล้ว อย่าถามว่าทำไงนะ'))))

# ===== Mr. Lost-and-Found (id waiting): second chances, the white call. Never a threat; his Wrath only stops the calls. =====
SP.append(dict(
    id='waiting', name=SPN['waiting'], domain=T('second chances, the white call', 'ikinci şanslar, beyaz arama', 'โอกาสที่สอง สายสีขาว'), rival='brimble', unlock={'c': 'c3', 'whiteCall': True}, local=['c8'],
    portrait=dict(calm='spirit/waiting_calm', glad='spirit/waiting_glad', cross='spirit/waiting_cross'), taste=TASTE(F_, F_, M_, H_, L_, M_, L_),
    hint=T('Likes charms and skipped nights. Hates tricks.', 'Tılsımı ve atlanan geceyi sever. Numaradan nefret eder.', 'ชอบไอเท็มกับการข้ามคืน เกลียดกลเม็ด'),
    stages=[STG('waiting', 2, T('Spare One', 'Yedek', 'ของสำรอง'), R('onDebtStart', None, E('trick', 1, id='spare_candle'))),
            STG('waiting', 5, T('Second Chance', 'İkinci Şans', 'โอกาสที่สอง'), pas(sflag('extraLife'))),
            STG('waiting', 8, T('Found Again', 'Yeniden Bulundu', 'เจอกันอีกครั้ง'), R('onHangUp', None, E('luck', 1), E('wick', 2)))],
    wrath=[STG('waiting', -2, T('Stops Calling', 'Aramayı Keser', 'เลิกโทรหา'), pas(sflag('noBeads'))),
           STG('waiting', -5, T('Lockers Shut', 'Dolaplar Kapalı', 'ปิดตู้'), pas(sflag('noBeads')), pas(sflag('noRelic')))],
    gifts=[GIFT('waiting_spare', 'trick/spare_candle', T('Spare One', 'Yedek', 'ของสำรอง'), E('trick', 1, id='spare_candle')),
           GIFT('waiting_caps', 'ui/wick', T('Found Caps', 'Bulunan Kapaklar', 'ฝาขวดที่เจอ'), E('wick', 3)),
           GIFT('waiting_luck', 'ui/luck', T('Lucky Find', 'Şanslı Buluntu', 'ของที่เจอโชคดี'), E('luck', 1)),
           GIFT('waiting_claim', 'ui/collect', T('Claim Ticket', 'Teslim Fişi', 'บัตรรับของ'), E('liftCurse', 1))],
    red=None,
    white=[dict(id='white_symbols', icon='ui/star', name=T('Clean Slate', 'Temiz Sayfa', 'เริ่มใหม่'), effects=[E('symMult', 1, sym='all')], text=etext([E('symMult', 1, sym='all')])),
           dict(id='white_patterns', icon='deal/power', name=T('Wide Open', 'Sonuna Kadar Açık', 'เปิดกว้าง'), effects=[E('patMult', 1, pattern='all')], text=etext([E('patMult', 1, pattern='all')])),
           dict(id='white_stare', icon='sym/redeye', name=T('Stare Back', 'Karşılık Ver', 'จ้องกลับ'), effects=[sflag('redEyeBless')], text=etext([sflag('redEyeBless')]))],
    ownCurse='heavy_hands', omen='shortfall', demand='waitWithMe',
    lines=LN(meet=('Hello! Lost-and-Found. Anything missing? I might have it.', 'Merhaba! Kayıp Eşya. Bir şey mi kayıp? Bende olabilir.', 'สวัสดีครับ! ฝ่ายของหาย อะไรหายไหม ผมอาจเก็บไว้อยู่'),
        gift=('Found this in the back. It is yours now, I think.', 'Bunu arka tarafta buldum. Artık senin sanırım.', 'เจอของนี่หลังตู้ ตอนนี้เป็นของคุณแล้วมั้ง'),
        red=('Nothing hidden. Take it or leave it. Both are fine.', 'Gizli bir şey yok. Al ya da bırak. İkisi de olur.', 'ไม่มีอะไรซ่อนครับ จะรับหรือไม่รับก็ได้ ไม่เป็นไร'),
        loved=('A charm for the shelf! I will keep it safe until you need it.', 'Rafa bir tılsım! İhtiyacın olana kadar saklarım.', 'ไอเท็มเข้าชั้น! ผมเก็บไว้ให้จนกว่าคุณจะต้องใช้'),
        insult=('Tricks? They always get lost. Sorry, I cannot hold those.', 'Numaralar mı? Hep kaybolur. Özür dilerim, onları tutamam.', 'กลเม็ดเหรอ หายทุกที ขอโทษนะ ผมเก็บให้ไม่ได้'),
        noticed=('A spare in your pocket, in case. You never know.', 'Cebinde bir yedek, ne olur ne olmaz.', 'ใส่ของสำรองไว้ในกระเป๋าให้ เผื่อไว้ก่อน'),
        friend=('Missed a deadline? Come back. One more night, no questions.', 'Vadeyi mi kaçırdın? Geri gel. Bir gece daha, soru yok.', 'ตกกำหนดเหรอ กลับมาสิ อีกหนึ่งคืน ไม่ต้องถามอะไร'),
        patron=('Hang up on a call and I will hold a little luck for you.', 'Bir aramayı kapat, sana biraz şans saklarım.', 'วางสายสักสาย ผมเก็บโชคเล็กๆ ไว้ให้'),
        wrath=('I stopped calling and the lockers are shut. Not angry, only quiet.', 'Aramayı bıraktım, dolaplar kapalı. Kızgın değilim, sadece sessizim.', 'ผมเลิกโทรแล้ว ตู้ก็ปิด ไม่ได้โกรธ แค่เงียบไปเฉยๆ'),
        himOrMe=('Mr. Ruby never gives anything back. I only give things back. Which of us?', 'Bay Ruby hiçbir şeyi geri vermez. Ben yalnızca geri veririm. Hangimiz?', 'มิสเตอร์รูบี้ไม่เคยคืนอะไรเลย ผมมีแต่คืนของ เลือกเอานะ'),
        omenTpl=('I counted what is missing from the tin. Short by: {v}.', 'Teneke\'den eksik olanı saydım. Eksik: {v}.', 'ผมนับของที่ขาดในกระป๋องแล้ว ยังขาดอีก: {v}'),
        demand=('Skip the next night and sit with me. I will mind your things.', 'Sıradaki geceyi atla, benimle otur. Eşyalarına bakarım.', 'ข้ามคืนหน้าไปนั่งกับผมสิ ผมดูของให้'),
        epilogue=('Mr. Lost-and-Found returned everything Nim ever lost. The last thing was her old cart, repainted.', 'Kayıp Eşya Bey, Nim\'in kaybettiği her şeyi geri verdi. Sonuncusu, yeniden boyanmış eski arabasıydı.', 'พี่ของหายคืนทุกอย่างที่นิ่มเคยทำหาย ชิ้นสุดท้ายคือรถเข็นคันเก่าที่ทาสีใหม่'))))

# ===== Grandmother Tide: interest, patience =====
SP.append(dict(
    id='tide', name=SPN['tide'], domain=T('interest, patience', 'faiz, sabır', 'ดอกเบี้ย ความอดทน'), rival='lamplit', unlock={'c': 'c5'}, local=['c5'],
    portrait=dict(calm='spirit/tide_calm', glad='spirit/tide_glad', cross='spirit/tide_cross'), taste=TASTE(F_, F_, H_, M_, H_, M_, L_),
    hint=T('Likes a skipped night. Hates Spice and charms.', 'Atlanan geceyi sever. Acıdan ve tılsımdan nefret eder.', 'ชอบการข้ามคืน เกลียดความเผ็ดกับไอเท็ม'),
    stages=[STG('tide', 2, T('High Tide', 'Kabarma', 'น้ำขึ้น'), pas(E('interest', 2))),
            STG('tide', 5, T('Slack Tide', 'Durgun Su', 'น้ำนิ่ง'), pas(sflag('carrySpins', 3))),
            STG('tide', 8, T('Spring Tide', 'Büyük Gelgit', 'น้ำใหญ่'), R('onDebtStart', None, E('spins', 1), E('luck', 2, scope='round')))],
    wrath=[STG('tide', -2, T('Ebb', 'Cezir', 'น้ำลง'), pas(sflag('interestHalf'))),
           STG('tide', -5, T('Dry Bank', 'Kuru Nehir', 'น้ำแห้ง'), pas(sflag('noInterest')))],
    gifts=[GIFT('tide_money', 'ui/interest', T('Slow Money', 'Yavaş Para', 'เงินงอกช้าๆ'), E('interest', 3, scope='debt')),
           GIFT('tide_hours', 'trick/hourglass', T('Extra Hours', 'Ek Saat', 'ชั่วโมงเพิ่ม'), E('spins', 2)),
           GIFT('tide_tea', 'ui/heat', T('Hot Tea', 'Sıcak Çay', 'ชาร้อน'), E('charge', 99)),
           GIFT('tide_change', 'ui/coin', T('Pocket Change', 'Bozuk Para', 'เงินทอน'), E('coins', 15))],
    red=RED('cargo_credit', 'deal/time', T('Cargo on Credit', 'Veresiye Kargo', 'ของเชื่อ'), [E('gainCharm', 2, rarity='uncommon', family='random')], curse='slow_water'),
    ownCurse='slow_water', omen='nextTerms', demand='keepCool',
    lines=LN(meet=('Sit. Tea is hot. The river is slow. So are good things.', 'Otur. Çay sıcak. Nehir yavaş. İyi şeyler de öyle.', 'นั่งสิลูก ชายังร้อน แม่น้ำไหลช้า ของดีก็มาช้าเหมือนกัน'),
        gift=('Here, a little extra. Do not spend it all at once.', 'Al, biraz fazladan. Hepsini bir anda harcama.', 'นี่ เพิ่มให้นิดหน่อย อย่าใช้หมดทีเดียวนะ'),
        red=('Cargo on credit. Slow water comes with it.', 'Veresiye kargo. Yavaş su da onunla gelir.', 'ของเชื่อนะ น้ำไหลช้ามาด้วย'),
        loved=('You rested a night? Good child. Slow money is honest money.', 'Bir gece dinlendin mi? Aferin. Yavaş para dürüst paradır.', 'พักไปหนึ่งคืนเหรอ เด็กดี เงินที่มาช้าเป็นเงินสุจริต'),
        insult=('Spice for an old woman? The tea is hot enough. No.', 'Yaşlı kadına acı mı? Çay yeterince sıcak. Hayır.', 'เผ็ดให้คนแก่เหรอ ชาก็ร้อนพอแล้ว ไม่เอา'),
        noticed=('You are learning patience. High tide for you.', 'Sabrı öğreniyorsun. Senin için kabarma.', 'เริ่มรู้จักอดทนแล้วนะ น้ำขึ้นให้เลย'),
        friend=('Unused hours may carry over. The river does not mind.', 'Kullanılmayan saatler devredebilir. Nehir aldırmaz.', 'ตาที่เหลือยกไปได้ แม่น้ำไม่ว่าอะไรหรอก'),
        patron=('Spring tide. The first night of every debt is long and lovely.', 'Büyük gelgit. Her borcun ilk gecesi uzun ve güzel.', 'น้ำใหญ่แล้ว คืนแรกของทุกหนี้ยาวและสวย'),
        wrath=('Ebb tide. I am not angry. I am gone, for now.', 'Cezir. Kızgın değilim. Şimdilik gittim.', 'น้ำลงแล้ว ยายไม่ได้โกรธ แค่ไปก่อน'),
        himOrMe=('Lamplit burns bright and short. I burn slow and long. Choose, dear.', 'Lamba parlak ve kısa yanar. Ben yavaş ve uzun. Seç, evladım.', 'เจ๊หลอดไฟสว่างวาบแล้วดับ ยายสว่างช้าแต่ยาว เลือกเถอะลูก'),
        omenTpl=('The barge hands told me tomorrow\'s terms: {v}.', 'Mavna adamları yarının şartlarını söyledi: {v}.', 'ลูกเรือเรือบรรทุกบอกยายว่าเงื่อนไขพรุ่งนี้: {v}'),
        demand=('Keep it cool tonight. Spice 2 or less. Tea will help.', 'Bu gece soğukkanlı ol. Acı 2 veya altı. Çay yardımcı olur.', 'คืนนี้ใจเย็นๆ เผ็ดไม่เกิน 2 ดื่มชาจะช่วยได้'),
        epilogue=('Grandmother Tide\'s barge now ties up next to Nim\'s stall. She still says to go slow. Nim does not.', 'Gelgit Nine\'nin mavnası artık Nim\'in tezgâhının yanına yanaşıyor. Hâlâ yavaş git diyor. Nim gitmiyor.', 'เรือบรรทุกของยายน้ำขึ้นจอดข้างแผงของนิ่มแล้ว ยายยังบอกให้ไปช้าๆ แต่นิ่มไม่ฟัง'))))

# ===== Scrubby (id moonbiter): Soot, removal, curses =====
SP.append(dict(
    id='moonbiter', name=SPN['moonbiter'], domain=T('Soot, removal, curses', 'İs, çıkarma, lanetler', 'เขม่า การถอดออก คำสาป'), rival='gold', unlock={'c': 'c6'}, local=['c6'],
    portrait=dict(calm='spirit/moonbiter_calm', glad='spirit/moonbiter_glad', cross='spirit/moonbiter_cross'), taste=TASTE(M_, H_, F_, F_, L_, L_, M_),
    hint=T('Likes charms and curses. Hates Caps.', 'Tılsımı ve laneti sever. Kapaktan nefret eder.', 'ชอบไอเท็มกับคำสาป เกลียดฝาขวด'),
    stages=[STG('moonbiter', 2, T('Soot Pennies', 'İs Kuruşları', 'เศษเหรียญเขม่า'), R('onSymbolLand', dict(sym='ash'), E('coins', 1))),
            STG('moonbiter', 5, T('Elbow Grease', 'Dirsek Yağı', 'แรงขัด'), R('onScorch', None, E('wick', 2), E('patMult', 0.5, pattern='all', scope='round'))),
            STG('moonbiter', 8, T('Soot Is Special', 'İs de Özel', 'เขม่าก็เมนูเด็ด'), pas(sflag('ashIsFav')))],
    wrath=[STG('moonbiter', -2, T('Sooty Floor', 'Isli Zemin', 'พื้นเขม่า'), pas(E('weight', 1.5, sym='ash'))),
           STG('moonbiter', -5, T('Hollow Centre', 'Boş Merkez', 'ช่องกลางโหว่'), pas(sflag('deadCentre')))],
    gifts=[GIFT('moonbiter_scrape', 'deal/symbol', T('Scrape One', 'Birini Kazı', 'ขัดออกหนึ่งอย่าง'), E('removeSymbol', 1)),
           GIFT('moonbiter_curse', 'curse/crack', T('Scrub a Curse', 'Laneti Kazı', 'ขัดคำสาป'), E('liftCurse', 1)),
           GIFT('moonbiter_clean', 'sym/ash', T('No Soot Tonight', 'Bu Gece İs Yok', 'คืนนี้ไม่มีเขม่า'), E('weight', 0, sym='ash', scope='debt')),
           GIFT('moonbiter_caps', 'ui/wick', T('Scrap Caps', 'Hurda Kapaklar', 'ฝาขวดเก็บตก'), E('wick', 3))],
    red=RED('deep_clean', 'deal/symbol', T('Deep Clean', 'Derin Temizlik', 'ขัดล้างใหญ่'), [E('removeSymbol', 2), E('allMult', 1.5, scope='debt')], curse='hollow_centre'),
    ownCurse='hollow_centre', omen='ashNext', demand='feed',
    lines=LN(meet=('Hello. Scrubby. I clean things. Sorry in advance.', 'Merhaba. Kazıcı. Bir şeyleri temizlerim. Şimdiden kusura bakma.', 'สวัสดีครับ แปรงขัด ผมขัดของ ขอโทษล่วงหน้านะครับ'),
        gift=('Sorry, may I? There. One thing less.', 'Pardon, izin var mı? Tamam. Bir şey eksildi.', 'ขอโทษครับ ขอหน่อย เรียบร้อย ของหายไปหนึ่งอย่าง'),
        red=('Deep clean: two symbols gone and everything pays more. The middle stays hollow.', 'Derin temizlik: iki sembol gider, her şey daha çok öder. Orta boş kalır.', 'ขัดล้างใหญ่ สัญลักษณ์หายไปสองอย่าง ทุกอย่างจ่ายมากขึ้น แต่ช่องกลางจะโหว่'),
        loved=('Something to scrub? You spoil me.', 'Kazınacak bir şey mi? Beni şımartıyorsun.', 'มีของให้ขัดเหรอ ตามใจกันจัง'),
        insult=('Caps? Sorry. They stick to everything. I cannot take them.', 'Kapak mı? Üzgünüm. Her şeye yapışırlar. Alamam.', 'ฝาขวดเหรอ ขอโทษครับ มันติดไปหมด ผมรับไม่ได้'),
        noticed=('You are neat. I like neat. A little Soot for you.', 'Düzenlisin. Düzeni severim. Sana biraz İs.', 'คุณเรียบร้อยดี ผมชอบ แถมเขม่านิดหน่อย'),
        friend=('Elbow grease! After every Flare-up I pay for the cleaning.', 'Dirsek yağı! Her Parlamadan sonra temizliği ben öderim.', 'แรงขัดมาแล้ว! หลังไฟลุกทุกครั้งผมจ่ายค่าขัดเอง'),
        patron=('Even Soot counts as the Special now. Sorry! I tidied the rules.', 'Artık İs bile Gözde sayılır. Pardon! Kuralları topladım.', 'ตอนนี้แม้แต่เขม่าก็นับเป็นเมนูเด็ด ขอโทษนะ ผมจัดกฎใหม่'),
        wrath=('I am hungry and cross. The floor is dirty. It is your fault.', 'Açım ve kızgınım. Zemin kirli. Senin suçun.', 'ผมหิวและหงุดหงิด พื้นสกปรก เพราะคุณนั่นแหละ'),
        himOrMe=('Chef Quack is too bright. Everything he fries leaves a mark. Me or him?', 'Şef Vak fazla parlak. Kızarttığı her şey iz bırakır. Ben mi o mu?', 'เชฟกาบสว่างเกินไป ทอดอะไรก็เป็นรอยหมด ผมหรือเขา'),
        omenTpl=('I swept under the machine. Expect about {v} Soot next spin.', 'Makinenin altını süpürdüm. Sonraki çevirişte yaklaşık {v} İs bekle.', 'ผมกวาดใต้เครื่องแล้ว ตาหน้าน่าจะมีเขม่าประมาณ {v}'),
        demand=('Feed me a charm or a curse next time. Please. Sorry. Please.', 'Bir dahaki sefere bir tılsım ya da lanet ver. Lütfen. Pardon. Lütfen.', 'คราวหน้าป้อนไอเท็มหรือคำสาปให้ผมหน่อย ขอร้อง ขอโทษ ขอร้อง'),
        epilogue=('Scrubby polished the machine until it shone, then apologised to it. It still shines.', 'Kazıcı makineyi parlayana kadar cilaladı, sonra ondan özür diledi. Hâlâ parlıyor.', 'แปรงขัดขัดเครื่องจนเงา แล้วก็ขอโทษมัน ตอนนี้ยังเงาอยู่'))))

# ===== Lady Lamplit: Spice, dares =====
SP.append(dict(
    id='lamplit', name=SPN['lamplit'], domain=T('Spice, dares', 'Acı, meydan okumalar', 'ความเผ็ด การท้า'), rival='tide', unlock={'c': 'c7'}, local=['c7'],
    portrait=dict(calm='spirit/lamplit_calm', glad='spirit/lamplit_glad', cross='spirit/lamplit_cross'), taste=TASTE(F_, F_, L_, M_, H_, M_, M_),
    hint=T('Likes Spice. Hates charms.', 'Acıyı sever. Tılsımdan nefret eder.', 'ชอบความเผ็ด เกลียดไอเท็ม'),
    stages=[STG('lamplit', 2, T('Warm Hands', 'Sıcak Eller', 'มืออุ่นๆ'), pas(sflag('heatFloor', 1))),
            STG('lamplit', 5, T('Burning Bright', 'Parlak Yanış', 'ไฟลุกโชน'), pas(sflag('heatStep', 25))),
            STG('lamplit', 8, T('Fireproof', 'Yanmaz', 'กันไฟ'), pas(sflag('scorchBurn', 10)), R('onScorch', None, E('wick', 1)))],
    wrath=[STG('lamplit', -2, T('Dim Bulb', 'Sönük Ampul', 'หลอดสลัว'), pas(sflag('heatMax', 8))),
           STG('lamplit', -5, T('Lights Out', 'Işıklar Söndü', 'ไฟดับ'), pas(sflag('noStoke')))],
    gifts=[GIFT('lamplit_warm', 'ui/heat', T('Warm Up', 'Isınma', 'วอร์มเครื่อง'), E('heat', 3), sflag('heatNoCool', True, 'round')),
           GIFT('lamplit_apron', 'deal/power', T('Fireproof Apron', 'Yanmaz Önlük', 'ผ้ากันเปื้อนกันไฟ'), sflag('scorchBurn', 10, 'debt')),
           GIFT('lamplit_bulbs', 'ui/wick', T('Spare Bulbs', 'Yedek Ampuller', 'หลอดไฟสำรอง'), E('wick', 4)),
           GIFT('lamplit_bright', 'ui/star', T('Bright Night', 'Parlak Gece', 'คืนสว่างไสว'), E('allMult', 1.5, scope='round'))],
    red=RED('midnight_run', 'ui/heat', T('Midnight Run', 'Gece Koşusu', 'วิ่งเที่ยงคืน'), [E('heat', 10), sflag('heatNoCool', True, 'round'), E('allMult', 2, scope='round')], curse='dark_wick'),
    ownCurse='dark_wick', omen='scorchOdds', demand='dare',
    lines=LN(meet=('Well, hello. Lamplit. I stay up late. So do you.', 'Vay, merhaba. Lamba. Ben geç yatarım. Sen de.', 'โอ้ สวัสดีจ้ะ เจ๊หลอดไฟ เจ๊นอนดึก เธอก็ด้วย'),
        gift=('A little warmth for the road. Go on, take it.', 'Yol için biraz sıcaklık. Hadi, al.', 'ความอุ่นเล็กๆ ไว้ติดตัว เอาไปเลยจ้ะ'),
        red=('Midnight run. All the Spice, all the pay. Careful with the sparks.', 'Gece koşusu. Bütün acı, bütün ödeme. Kıvılcımlara dikkat.', 'วิ่งเที่ยงคืน เผ็ดสุด จ่ายสุด ระวังประกายไฟนะจ๊ะ'),
        loved=('Spice! You burn it for me? Oh, you are my favourite.', 'Acı! Benim için mi yaktın? Ah, sen favorimsin.', 'ความเผ็ด! เผาให้เจ๊เหรอ โอ๊ย เธอนี่โปรดที่สุดเลย'),
        insult=('Swap me for a charm? Darling, I am not for sale.', 'Beni tılsımla mı değişeceksin? Tatlım, ben satılık değilim.', 'เอาไอเท็มมาแลกเจ๊เหรอ จ๊ะที่รัก เจ๊ไม่ขายนะ'),
        noticed=('Warm hands tonight. I like that in a customer.', 'Bu gece sıcak eller. Müşteride bunu severim.', 'คืนนี้มืออุ่นๆ เจ๊ชอบลูกค้าแบบนี้'),
        friend=('Burning bright. Past five, every level pays more.', 'Parlak yanış. Beşten sonra her seviye daha çok öder.', 'ไฟลุกโชน เลยห้าไปแล้วทุกระดับจ่ายเพิ่ม'),
        patron=('Fireproof. Flare-ups barely scorch and they even pay you.', 'Yanmaz. Parlamalar zar zor yakar, hatta sana ödeme yapar.', 'กันไฟ ไฟลุกแทบไม่ไหม้ แถมยังจ่ายให้อีก'),
        wrath=('The bulb is dim. Your fault. Go on, say sorry.', 'Ampul sönük. Senin suçun. Hadi, özür dile.', 'หลอดสลัวแล้วนะ ก็เพราะเธอ ไปขอโทษสิจ๊ะ'),
        himOrMe=('Tide puts out every spark. Choose me and the night stays lit.', 'Gelgit her kıvılcımı söndürür. Beni seç, gece aydınlık kalsın.', 'ยายน้ำขึ้นดับประกายทุกอัน เลือกเจ๊สิ แล้วคืนนี้จะสว่างต่อ'),
        omenTpl=('I smelled the pan. Flare-up chance, next 3 spins: {v}.', 'Tavayı kokladım. Parlama ihtimali, sonraki 3 çeviriş: {v}.', 'เจ๊ได้กลิ่นกระทะแล้ว โอกาสไฟลุก 3 ตาถัดไป: {v}'),
        demand=('Dare me. Reach Spice 8 and keep the lights on. Do not blink.', 'Cesaretin var mı? Acı 8\'e çık ve ışıkları açık tut. Göz kırpma.', 'ท้าเจ๊สิ ขึ้นไปเผ็ด 8 แล้วอย่าให้ไฟดับ ห้ามกะพริบตา'),
        epilogue=('Lady Lamplit hangs over the tower terrace and never switches off. Nim keeps a dimmer on the wall. Neither of them touches it.', 'Lamba Hanım kulenin terasında asılı, asla sönmez. Nim duvarda bir dimmer tutuyor. İkisi de ona dokunmuyor.', 'เจ๊หลอดไฟห้อยอยู่เหนือระเบียงตึกสูงและไม่เคยดับ นิ่มติดสวิตช์หรี่ไฟไว้ที่ผนัง ทั้งคู่ไม่เคยแตะมัน'))))

for _s in SP:
    if _s['red'] and _s['red'].get('deals'): _s['text'] = dict(red=T('Mr. Ruby\'s deals: a strong boon, a curse you carry.', 'Bay Ruby\'nin anlaşmaları: güçlü bir fayda, taşıdığın bir lanet.', 'ข้อตกลงของมิสเตอร์รูบี้ ได้ของแรง แต่ต้องแบกคำสาป'))
    elif _s['red']: _s['text'] = dict(red=_s['red']['text'])
    else: _s['text'] = dict(red=T('Never offers a red card. Hang up on three red cards and he calls with a white one.', 'Asla kırmızı kart sunmaz. Üç kırmızı kartı kapatırsan beyaz kartla arar.', 'ไม่มีการ์ดแดง วางสายใส่การ์ดแดงสามครั้ง เขาจะโทรมาพร้อมการ์ดสีขาว'))
