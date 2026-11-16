# Builds docs/v2/data/*.json. Charm, deal and curse texts are composed from the effect data, so text and rule cannot drift apart.
import json, os, sys
OUT = sys.argv[1]
SHEETS = json.load(open(sys.argv[2], encoding='utf-8'))
ICONS = {i for s in SHEETS['sheets'] for i in s['ids']} | {s['id'] for s in SHEETS['singles']}
L = ('en', 'tr', 'th')
def T(en, tr, th): return {'en': en, 'tr': tr, 'th': th}
def num(n): return str(int(n)) if float(n) == int(n) else str(n)
def sgn(n): return ('+' if n >= 0 else '−') + num(abs(n))

# ---------- symbols ----------
SYM = [  # id, tier, value, weight, kind, group, names
    ('moth', 1, 2, 14, 'score', 'low', 'Lime', 'Limon', 'มะนาว'),
    ('candle', 1, 2, 14, 'score', 'low', 'Fish Balls', 'Köfte Şiş', 'ลูกชิ้น'),
    ('tooth', 2, 3, 11, 'score', 'low', 'Sticky Rice', 'Yapışkan Pirinç', 'ข้าวเหนียว'),
    ('key', 2, 3, 11, 'score', 'low', 'Mango', 'Mango', 'มะม่วง'),
    ('eye', 3, 4, 9, 'score', 'mid', 'Coconut', 'Hindistan Cevizi', 'มะพร้าว'),
    ('mask', 3, 5, 8, 'score', 'mid', 'Durian', 'Durian', 'ทุเรียน'),
    ('crow', 4, 6, 7, 'score', 'high', 'Longtail Boat', 'Uzun Kuyruklu Tekne', 'เรือหางยาว'),
    ('lantern', 4, 8, 5, 'score', 'high', 'Elephant', 'Fil', 'ช้าง'),
    ('crown', 5, 12, 3, 'score', 'high', 'Gold Bar', 'Külçe Altın', 'ทองคำแท่ง'),
    ('wisp', 0, 0, 2, 'wild', None, 'Firefly', 'Ateşböceği', 'หิ่งห้อย'),
    ('sigil', 0, 0, 2, 'sigil', None, 'Calling Card', 'Kartvizit', 'นามบัตร'),
    ('ash', 0, 0, 0, 'ash', None, 'Soot', 'İs', 'เขม่า'),
]
SN = {s[0]: T(*s[6:]) for s in SYM}
SN.update(low=T('low symbols', 'düşük semboller', 'สัญลักษณ์ต่ำ'), high=T('high symbols', 'yüksek semboller', 'สัญลักษณ์สูง'),
          all=T('all symbols', 'tüm semboller', 'ทุกสัญลักษณ์'), favoured=T('the Special', 'Gözde', 'เมนูเด็ด'),
          that=T('that symbol', 'o sembol', 'สัญลักษณ์นั้น'), random=T('a random symbol', 'rastgele bir sembol', 'สัญลักษณ์สุ่มหนึ่งตัว'))
RULES_TEXT = {
    'wisp': T('Wild. Stands in for any scoring symbol. A pattern needs at least one real symbol.', 'Joker. Her puan sembolünün yerine geçer. Desende en az bir gerçek sembol gerekir.', 'แทนได้ทุกสัญลักษณ์ ลายต้องมีสัญลักษณ์จริงอย่างน้อยหนึ่งตัว'),
    'sigil': T('Never matches. Each Calling Card that lands gives +1 Caps. Three in one spin: a free trick.', 'Eşleşmez. İnen her Kartvizit +1 Kapak verir. Bir çevirişte üç tane: bedava numara.', 'ไม่จับคู่ นามบัตรแต่ละใบที่ตกให้ +1 ฝาขวด ครบสามในตาเดียว: ได้กลเม็ดฟรี'),
    'ash': T('Comes only from Spice and curses. Blocks patterns. Three in one spin is a Flare-up: the spin pays nothing, 10% of your purse burns, Spice −3.', 'Yalnızca Acı ve lanetlerden gelir. Desenleri keser. Bir çevirişte üç tane Parlamadır: çeviriş ödemez, kesenin %10\'u yanar, Acı −3.', 'มาจากระดับเผ็ดและคำสาปเท่านั้น ขวางลาย ครบสามในตาเดียวคือไฟลุก: ตานั้นไม่จ่าย ถุงเงินไหม้ 10% เผ็ด −3'),
}
symbols = [dict(id=s[0], name=SN[s[0]], tier=s[1], value=s[2], weight=s[3], kind=s[4], group=s[5], icon='sym/' + s[0],
                **({'text': RULES_TEXT[s[0]]} if s[0] in RULES_TEXT else {})) for s in SYM]

# ---------- patterns (cells row-major 0..14, 5 columns) ----------
PAT = []
def pat(i, mult, cells, en, tr, th, beats=()): PAT.append(dict(id=i, name=T(en, tr, th), mult=mult, size=len(cells[0]), cells=cells, beats=list(beats)))
pat('h3', 1, [[r * 5 + c + i for i in range(3)] for r in range(3) for c in range(3)], 'Line of 3', "3'lü Sıra", 'แถว 3')
pat('v3', 1, [[c, c + 5, c + 10] for c in range(5)], 'Column', 'Sütun', 'แนวตั้ง')
pat('d3', 1.5, [[c, c + 6, c + 12] for c in range(3)] + [[c + 10, c + 6, c + 2] for c in range(3)], 'Diagonal', 'Çapraz', 'แนวทแยง')
pat('h4', 2, [[r * 5 + c + i for i in range(4)] for r in range(3) for c in range(2)], 'Line of 4', "4'lü Sıra", 'แถว 4', ['h3'])
pat('halo', 3, [[2, 6, 8, 12]], 'Halo', 'Hale', 'วงแหวน')
pat('corners', 3, [[0, 4, 10, 14]], 'Four Corners', 'Dört Köşe', 'สี่มุม')
pat('h5', 4, [[r * 5 + i for i in range(5)] for r in range(3)], 'Line of 5', "5'li Sıra", 'แถว 5', ['h4', 'h3'])
pat('saw', 4, [[0, 6, 2, 8, 4], [5, 1, 7, 3, 9], [5, 11, 7, 13, 9], [10, 6, 12, 8, 14]], 'Sawtooth', 'Testere', 'ฟันเลื่อย')
pat('vee', 5, [[0, 6, 12, 8, 4], [10, 6, 2, 8, 14]], 'Vee', 'V Yolu', 'ทางตัววี')
pat('cross', 6, [[2, 6, 7, 8, 12]], 'Cross', 'Artı', 'กากบาท', ['halo'])
pat('frame', 10, [[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14]], 'Frame', 'Çerçeve', 'กรอบ')
pat('full', 25, [list(range(15))], 'Full Market', 'Tam Pazar', 'เต็มตลาด')
PN = {p['id']: p['name'] for p in PAT}
PN.update(all=T('all patterns', 'tüm desenler', 'ทุกลาย'), this=T('this pattern', 'bu desen', 'ลายนี้'),
          big=T('5+ cell patterns', '5+ hücreli desenler', 'ลาย 5 ช่องขึ้นไป'))
FAM = {
    'swarm': T('Street Food', 'Sokak Lezzeti', 'สตรีทฟู้ด'), 'ember': T('Wok', 'Wok', 'กระทะ'), 'hex': T('Monsoon', 'Muson', 'มรสุม'),
    'ledger': T('Haggle', 'Pazarlık', 'ต่อราคา'), 'pact': T('Neon', 'Neon', 'นีออน'), 'omen': T('Lucky', 'Uğur', 'นำโชค'),
    'stitch': T('Muay Thai', 'Muay Thai', 'มวยไทย'), 'wisp': T('Firefly', 'Ateşböceği', 'หิ่งห้อย'), 'tinker': T('Tuk-tuk', 'Tuk-tuk', 'ตุ๊กตุ๊ก'),
    'crown': T('Gold', 'Altın', 'ทอง'),
}
FLAGS = {
    'heatStep': T('each Spice level pays +{v}% more', 'her Acı seviyesi ödemeye +%{v} ekler', 'เผ็ดแต่ละระดับเพิ่มเงิน +{v}%'),
    'heatNoCool': T('Spice does not cool at round start', 'Acı el başında düşmez', 'เผ็ดไม่ลดตอนเริ่มรอบ'),
    'scorchNeeds': T('a Flare-up needs {v} Soot', 'Parlama için {v} İs gerekir', 'ต้องมีเขม่า {v} ตัวจึงจะไฟลุก'),
    'ashIsFav': T('Soot counts as the Special in patterns (value 0)', 'İs desenlerde Gözde sayılır (değeri 0)', 'เขม่านับเป็นเมนูเด็ดในลาย (ค่า 0)'),
    'interestCapX': T('interest cap ×{v}', 'faiz tavanı ×{v}', 'เพดานดอกเบี้ย ×{v}'),
    'shopDiscount': T('shop prices −{v}%', 'dükkân fiyatları −%{v}', 'ราคาร้าน −{v}%'),
    'shopMarkup': T('shop prices +{v}%', 'dükkân fiyatları +%{v}', 'ราคาร้าน +{v}%'),
    'dealOffers': T('Mr. Ruby offers {v} deals, not 2', 'Bay Ruby 2 yerine {v} anlaşma sunar', 'เฮียรูบี้เสนอ {v} ข้อตกลงแทน 2'),
    'cancelCurse': T('that curse is cancelled', 'o lanet iptal olur', 'คำสาปนั้นถูกยกเลิก'),
    'saveDeadline': T('if you miss a deadline, this charm burns and you get 1 extra round', 'vadeyi kaçırırsan bu tılsım yanar, 1 ek el kazanırsın', 'ถ้าจ่ายไม่ทัน ไอเท็มนี้จะไหม้แล้วได้เพิ่ม 1 รอบ'),
    'seeNextFav': T("you see the next spin's Special", 'bir sonraki çevirişin Gözdesini görürsün', 'เห็นเมนูเด็ดของตาถัดไป'),
    'pickFirstFav': T('you choose the Special for the first spin of each round', 'her elin ilk çevirişinde Gözdeyi sen seçersin', 'เลือกเมนูเด็ดเองในตาแรกของทุกรอบ'),
    'twoFavs': T('each spin has two Specials', 'her çevirişte iki Gözde olur', 'ทุกตามีเมนูเด็ดสองอย่าง'),
    'favPerRound': T('the Special changes only once per round', 'Gözde yalnızca elde bir kez değişir', 'เมนูเด็ดเปลี่ยนแค่รอบละครั้ง'),
    'fiveNeedsFour': T('5-cell patterns need only 4 matching cells', '5 hücreli desenlere 4 eş hücre yeter', 'ลาย 5 ช่องใช้แค่ 4 ช่องที่ตรงกัน'),
    'trickPockets': T('+{v} trick pocket', '+{v} numara cebi', '+{v} ช่องกลเม็ด'),
    'benchDiscount': T('bench work costs {v}% less', 'tezgâh işleri %{v} ucuz', 'งานโต๊ะช่างถูกลง {v}%'),
    'firstTrickFree': T('the first trick each round is not used up', 'her elin ilk numarası harcanmaz', 'กลเม็ดแรกของแต่ละรอบไม่หมดไป'),
    'sellFull': T('charms sell for their full price', 'tılsımlar tam fiyatına satılır', 'ขายไอเท็มได้เต็มราคา'),
    'noInterest': T('you earn no interest', 'faiz alamazsın', 'ไม่ได้ดอกเบี้ย'),
    'ashBase': T('Soot always has +{v} weight', 'İs her zaman +{v} ağırlıkla gelir', 'เขม่ามีน้ำหนัก +{v} เสมอ'),
    'hideFav': T('you cannot see the Special', 'Gözdeyi göremezsin', 'มองไม่เห็นเมนูเด็ด'),
    'smallHalf': T('3-cell patterns pay half', '3 hücreli desenler yarım öder', 'ลาย 3 ช่องได้เหรียญครึ่งเดียว'),
    'heatFloor': T('Spice never drops below {v}', 'Acı {v} altına düşmez', 'เผ็ดไม่ต่ำกว่า {v}'),
    'firstSpinDead': T('the first spin of each round pays nothing', 'her elin ilk çevirişi ödemez', 'ตาแรกของทุกรอบไม่ได้เหรียญ'),
    'deadCentre': T('the centre cell is always Soot', 'orta hücre hep İs olur', 'ช่องกลางเป็นเขม่าเสมอ'),
    'debtMul': T('debts are {v}% larger', 'borçlar %{v} büyür', 'หนี้เพิ่มขึ้น {v}%'),
    'rerollDouble': T('rerolls cost double and you cannot lock', 'yenileme iki kat tutar, kilitleyemezsin', 'สุ่มร้านใหม่แพงสองเท่าและล็อกไม่ได้'),
    'debtCut': T('the next debt is {v}% smaller', 'sıradaki borç %{v} küçülür', 'หนี้ถัดไปลดลง {v}%'),
    'pickFav': T('choose a symbol: it is always a second Special', 'bir sembol seç: hep ikinci Gözde olur', 'เลือกสัญลักษณ์หนึ่งตัวให้เป็นเมนูเด็ดที่สองตลอดไป'),
    'maskWild': T('Durians are wild', 'Durianlar joker olur', 'ทุเรียนแทนได้ทุกสัญลักษณ์'),
    'roundsAdd': T('+{v} round on every debt', 'her borca +{v} el', 'ทุกหนี้ได้เพิ่ม {v} รอบ'),
    'extraLife': T('once: if you miss a deadline you get 1 extra round', 'bir kez: vadeyi kaçırırsan 1 ek el kazanırsın', 'หนึ่งครั้ง: ถ้าจ่ายไม่ทันจะได้เพิ่ม 1 รอบ'),
    'refuseWick': T('refusing a deal gives +{v} Caps', 'anlaşmayı reddetmek +{v} Kapak verir', 'ปฏิเสธข้อตกลงได้ +{v} ฝาขวด'),
    'mustSign': T('you must sign one deal at every deadline', 'her vadede bir anlaşma imzalamak zorundasın', 'ต้องเซ็นข้อตกลงหนึ่งข้อทุกครั้งที่ครบกำหนด'),
    'spinsRound': T('+{v} spin every round', 'her el +{v} çeviriş', 'ทุกรอบได้ +{v} ตา'),
    'spinsLess': T('−{v} spin on every terms card', 'her şart kartında −{v} çeviriş', 'การ์ดเงื่อนไขทุกใบ −{v} ตา'),
    'ghostHire': T('the first spin of each round places 2 Fireflies', 'her elin ilk çevirişinde 2 Ateşböceği yerleşir', 'ตาแรกของทุกรอบวางหิ่งห้อย 2 ตัว'),
    'startCurses': T('you start with {v} random curses', 'oyuna {v} rastgele lanetle başlarsın', 'เริ่มเกมพร้อมคำสาปสุ่ม {v} อย่าง'),
    'interestHalf': T('interest is halved', 'faiz yarıya iner', 'ดอกเบี้ยลดครึ่ง'),
    'scorchBurn': T('a Flare-up burns {v}% of your purse', 'Parlama kesenin %{v} kadarını yakar', 'ไฟลุกเผาถุงเงิน {v}%'),
    'shopOffers': T('the shop shows {v} charms', 'dükkân {v} tılsım gösterir', 'ร้านแสดงไอเท็ม {v} ชิ้น'),
    'rounds': T('{v} rounds per debt', 'borç başına {v} el', 'หนี้ละ {v} รอบ'),
    'noStoke': T('you cannot Spice Up and Spice stays at 0', 'Acılandıramazsın, Acı 0 kalır', 'เพิ่มเผ็ดไม่ได้และเผ็ดอยู่ที่ 0'),
    'smallDead': T('3-cell patterns pay nothing', '3 hücreli desenler ödemez', 'ลาย 3 ช่องไม่ได้เหรียญ'),
    'bigX': T('patterns of 4+ cells pay ×{v}', '4+ hücreli desenler ×{v} öder', 'ลาย 4 ช่องขึ้นไปได้เหรียญ ×{v}'),
    'bankX': T('coins you bank this round count ×{v}', 'bu el yatırdığın para ×{v} sayılır', 'เหรียญที่จ่ายหนี้ในรอบนี้นับ ×{v}'),
    'lastTwice': T('the last spin of the round is scored twice', 'elin son çevirişi iki kez puanlanır', 'ตาสุดท้ายของรอบคิดคะแนนสองครั้ง'),
    'shopExtra': T('the next shop has +1 charm and a free reroll', 'sıradaki dükkânda +1 tılsım ve bedava yenileme olur', 'ร้านถัดไปมีไอเท็ม +1 ชิ้นและสุ่มใหม่ฟรี 1 ครั้ง'),
    'noInterestRound': T('no interest this round', 'bu el faiz yok', 'รอบนี้ไม่มีดอกเบี้ย'),
    'copyRight': T('copies the rules of the charm in the slot to its right', 'sağındaki yuvada duran tılsımın kurallarını kopyalar', 'ลอกกฎของไอเท็มในช่องทางขวา'),
    'freeRedraw': T('+{v} free Special redraw each round', 'her el +{v} bedava Gözde değiştirme', 'สุ่มเมนูเด็ดใหม่ฟรี +{v} ครั้งทุกรอบ'),
    'freeReroll': T('the first {v} reroll in every shop is free', 'her dükkânda ilk {v} yenileme bedava', 'สุ่มร้านใหม่ {v} ครั้งแรกในทุกร้านฟรี'),
    'startHeat': T('each round starts at Spice {v}', 'her el Acı {v} ile başlar', 'ทุกรอบเริ่มที่เผ็ด {v}'),
}
TRIG = {
    'passive': T('Always', 'Her zaman', 'ตลอดเวลา'), 'onRunStart': T('Run start', 'Oyun başında', 'เริ่มเกม'),
    'onDebtStart': T('New debt', 'Yeni borçta', 'เริ่มหนี้ใหม่'), 'onRoundStart': T('Round start', 'El başında', 'เริ่มรอบ'),
    'onRoundEnd': T('Round end', 'El sonunda', 'จบรอบ'), 'onSpinStart': T('Before each spin', 'Her çevirişten önce', 'ก่อนหมุนทุกตา'),
    'onPattern': T('Each pattern', 'Her desen', 'ทุกลาย'), 'onSpinEnd': T('After each spin', 'Her çevirişten sonra', 'หลังหมุนทุกตา'),
    'onDud': T('Spin with no pattern', 'Desensiz çeviriş', 'หมุนแล้วไม่มีลาย'), 'onScorch': T('On a Flare-up', 'Parlamada', 'เมื่อไฟลุก'),
    'onStoke': T('Each Spice Up', 'Her acılandırmada', 'ทุกครั้งที่เพิ่มเผ็ด'), 'onBank': T('When you bank', 'Borca para yatırınca', 'เมื่อจ่ายเข้าหนี้'),
    'onInterest': T('When interest pays', 'Faiz gelince', 'เมื่อได้ดอกเบี้ย'), 'onDebtPaid': T('Debt paid', 'Borç ödenince', 'เมื่อปลดหนี้'),
    'onBuy': T('When you buy a charm', 'Tılsım alınca', 'เมื่อซื้อไอเท็ม'), 'onSell': T('When you sell a charm', 'Tılsım satınca', 'เมื่อขายไอเท็ม'),
    'onSellSelf': T('When this is sold', 'Bu satılınca', 'เมื่อขายชิ้นนี้'), 'onReroll': T('Each shop reroll', 'Her dükkân yenilemesinde', 'ทุกครั้งที่สุ่มร้านใหม่'),
    'onTrick': T('When you use a trick', 'Numara kullanınca', 'เมื่อใช้กลเม็ด'), 'onDeal': T('When you sign a deal', 'Anlaşma imzalayınca', 'เมื่อเซ็นข้อตกลง'),
    'onRefuse': T('When you refuse a deal', 'Anlaşmayı reddedince', 'เมื่อปฏิเสธข้อตกลง'), 'onCurse': T('When you gain a curse', 'Lanet alınca', 'เมื่อได้คำสาป'),
    'now': T('Now', 'Hemen', 'ทันที'),
}
ZONE = {'corner': T('in a corner', 'köşeye', 'ที่มุม'), 'edge': T('on the left or right edge', 'sol ya da sağ kenara', 'ที่ขอบซ้ายหรือขวา'), 'midrow': T('in the middle row', 'orta sıraya', 'ในแถวกลาง')}
SCOPE = {'spin': T(' this spin', ' (bu çeviriş)', ' ในตานี้'), 'round': T(' this round', ' (bu el)', ' ในรอบนี้'), 'debt': T(' this debt', ' (bu borç)', ' ในหนี้นี้')}
RAR = {'common': T('common', 'sıradan', 'ธรรมดา'), 'uncommon': T('uncommon', 'nadir', 'หายาก'), 'rare': T('rare', 'ender', 'หายากมาก'), 'legendary': T('legendary', 'efsane', 'ตำนาน')}

def per(p, l):
    k, _, a = p.partition(':')
    return {
        'curses': T(' per curse', ' (lanet başına)', ' ต่อคำสาป'), 'heat': T(' per Spice', ' (Acı başına)', ' ต่อเผ็ด'),
        'family': T(' per %s charm' % FAM.get(a, {}).get('en'), ' (%s tılsımı başına)' % FAM.get(a, {}).get('tr'), ' ต่อไอเท็ม%s' % FAM.get(a, {}).get('th')),
        'sym': T(' per %s on the grid' % SN.get(a, {}).get('en'), ' (ızgaradaki %s başına)' % SN.get(a, {}).get('tr'), ' ต่อ%sบนกระดาน' % SN.get(a, {}).get('th')),
        'emptySlots': T(' per empty charm slot', ' (boş yuva başına)', ' ต่อช่องไอเท็มว่าง'), 'tricks': T(' per trick held', ' (eldeki numara başına)', ' ต่อกลเม็ดที่ถือ'),
        'deals': T(' per deal signed', ' (imzalı anlaşma başına)', ' ต่อข้อตกลงที่เซ็น'), 'stack': T(' per charge', ' (birikim başına)', ' ต่อแต้มสะสม'),
        'rightOf': T(' per charm to its right', ' (sağındaki her tılsım için)', ' ต่อไอเท็มที่อยู่ทางขวา'),
        'leftOf': T(' per charm to its left', ' (solundaki her tılsım için)', ' ต่อไอเท็มที่อยู่ทางซ้าย'),
        'removed': T(' per removed symbol', ' (çıkarılan sembol başına)', ' ต่อสัญลักษณ์ที่ถอดออก'),
        'purse100': T(' per {c:100} coins in your purse (max 10)', ' (kesedeki her {c:100} para için, en çok 10)', ' ต่อทุก {c:100} เหรียญในถุงเงิน (สูงสุด 10)'),
    }[k][l]

def eff(e, l):
    t, n = e['type'], e.get('n', 0)
    s = SN.get(e.get('sym'), {}).get(l, ''); p = PN.get(e.get('pattern'), {}).get(l, '')
    if t == 'coins': r = T('+{c:%s} coins', '+{c:%s} para', '+{c:%s} เหรียญ')[l] % num(n)
    elif t == 'symValue': r = T('%s value %s', '%s değeri %s', 'ค่า%s %s')[l] % (s, sgn(n))
    elif t == 'symMult': r = T('%s mult %s', '%s çarpanı %s', 'ตัวคูณ%s %s')[l] % (s, sgn(n))
    elif t == 'patMult': r = T('%s mult %s', '%s çarpanı %s', 'ตัวคูณ%s %s')[l] % (p, sgn(n))
    elif t == 'allMult': r = T('spin total ×%s', 'çeviriş toplamı ×%s', 'ยอดรวมตานี้ ×%s')[l] % num(n)
    elif t == 'luck': r = T('%s Luck', '%s Şans', 'โชค %s')[l] % sgn(n)
    elif t == 'spins': r = T('%s spin', '%s çeviriş', '%s ตา')[l] % sgn(n)
    elif t == 'interest': r = T('interest %s%%', 'faiz %s puan', 'ดอกเบี้ย %s%%')[l] % sgn(n)
    elif t == 'wick': r = T('%s Caps', '%s Kapak', '%s ฝาขวด')[l] % sgn(n)
    elif t == 'heat': r = T('%s Spice', '%s Acı', 'เผ็ด %s')[l] % sgn(n)
    elif t == 'weight':
        # plain words, not "weight +100%" (AUDIT2 9)
        r = T('%s never lands', '%s hiç gelmez', '%sไม่ออกเลย')[l] % s if n == 0 else T('%s ×%s as often', '%s ×%s sıklıkla gelir', '%sออกบ่อย ×%s')[l] % (s, num(n))
    elif t == 'transform': r = T('turn up to {n} {a} into {b}', 'en çok {n} {a}, {b} olur', 'เปลี่ยน{a}สูงสุด {n} ตัวเป็น{b}')[l].format(n=num(n), a=SN[e['from']][l], b=SN[e['to']][l])
    elif t == 'place': r = T('place {n} {a}', '{n} {a} yerleşir', 'วาง{a} {n} ตัว')[l].format(n=num(n), a=s) + (' ' + ZONE[e['zone']][l] if e.get('zone') else '')
    elif t == 'retrigger': r = T('it pays again', 'bir kez daha öder', 'ได้เหรียญซ้ำอีกครั้ง')[l]
    elif t == 'trick': r = T('gain %s random trick' + ('s' if (n or 1) > 1 else ''), '%s rastgele numara kazan', 'ได้กลเม็ดสุ่ม %s ชิ้น')[l] % num(n or 1)
    elif t == 'stack': r = T('%s charge', '%s birikim', '%s แต้มสะสม')[l] % sgn(n)
    elif t == 'slot': r = T('%s charm slot', '%s tılsım yuvası', '%s ช่องไอเท็ม')[l] % sgn(n)
    elif t == 'gainCharm': r = T('gain a random %s charm', 'rastgele bir %s tılsım kazan', 'ได้ไอเท็ม%sสุ่มหนึ่งชิ้น')[l] % RAR[e['rarity']][l]
    elif t == 'gainCurse': r = T('gain %s random curse', '%s rastgele lanet al', 'ได้คำสาปสุ่ม %s อย่าง')[l] % num(n)
    elif t == 'removeSymbol': r = T('remove %s symbols of your choice from the machine', 'makineden seçtiğin %s sembolü çıkar', 'ถอดสัญลักษณ์ที่เลือก %s ชนิดออกจากเครื่อง')[l] % num(n)
    elif t == 'flag': r = FLAGS[e['flag']][l].replace('{v}', num(e.get('v', 0)))
    else: raise KeyError(t)
    if e.get('scope') in SCOPE and not (t == 'allMult' and e['scope'] == 'spin'): r += SCOPE[e['scope']][l]  # "spin total" already says it
    if e.get('per'): r += per(e['per'], l)
    return r

def when(tr, c, l):
    if tr == 'onSymbolLand':
        if c.get('zone'): w = T('Each symbol that lands %s', '%s inen her sembol', 'ทุกสัญลักษณ์ที่ตก%s')[l] % ZONE[c['zone']][l]
        else: w = T('Each %s that lands', 'İnen her %s', '%sทุกตัวที่ตก')[l] % SN[c['sym']][l]
    else: w = TRIG[tr][l]
    x = []
    if tr != 'onSymbolLand' and c.get('sym'): x.append(T('if %s', '%s ise', 'ถ้าเป็น%s')[l] % SN[c['sym']][l])
    if c.get('group'): x.append(T('if one of the %s', '%s arasındaysa', 'ถ้าเป็น%s')[l] % SN[c['group']][l])
    if c.get('pattern'): x.append(T('if %s', '%s ise', 'ถ้าเป็น%s')[l] % PN[c['pattern']][l])
    if c.get('minCells'): x.append(T('if %d+ cells', '%d+ hücreliyse', 'ถ้า %d ช่องขึ้นไป')[l] % c['minCells'])
    if c.get('hasWisp'): x.append(T('if it holds a Firefly', 'içinde Ateşböceği varsa', 'ถ้ามีหิ่งห้อยอยู่ในลาย')[l])
    if c.get('favoured'): x.append(T('if it is the Special', 'Gözdeyse', 'ถ้าเป็นเมนูเด็ด')[l])
    if c.get('minPatterns'): x.append(T('if %d+ patterns', '%d+ desen varsa', 'ถ้ามี %d ลายขึ้นไป')[l] % c['minPatterns'])
    if c.get('distinctMin'): x.append(T('if %d+ different shapes', '%d+ farklı şekil varsa', 'ถ้ามี %d รูปทรงต่างกันขึ้นไป')[l] % c['distinctMin'])
    if 'heatMin' in c: x.append(T('if Spice %d+', 'Acı %d+ ise', 'ถ้าเผ็ด %d+')[l] % c['heatMin'])
    if 'heatMax' in c: x.append(T('if Spice is %d or less', 'Acı en çok %d ise', 'ถ้าเผ็ดไม่เกิน %d')[l] % c['heatMax'])
    if c.get('cursesMin'): x.append(T('if you carry %d+ curses', '%d+ lanetin varsa', 'ถ้ามีคำสาป %d+')[l] % c['cursesMin'])
    if c.get('spinIs') == 'first': x.append(T('on the first spin of a round', 'elin ilk çevirişinde', 'ในตาแรกของรอบ')[l])
    if c.get('spinIs') == 'last': x.append(T('on the last spin of a round', 'elin son çevirişinde', 'ในตาสุดท้ายของรอบ')[l])
    if c.get('countMin'):
        cs, cn = SN[c['countMin'][0]][l], c['countMin'][1]
        x.append(T('if {n}+ {s} on the grid', 'ızgarada {n}+ {s} varsa', 'ถ้ามี{s} {n}+ บนกระดาน')[l].format(n=cn, s=cs))
    if c.get('roundsLeftMin'): x.append(T('with a round to spare', 'el artarsa', 'ถ้าเหลือรอบ')[l])
    if c.get('purseMaxPct'): x.append(T('if your purse is %d%% of the debt or less', 'kesen borcun %%%d kadarı ya da azsa', 'ถ้าถุงเงินไม่เกิน %d%% ของหนี้')[l] % c['purseMaxPct'])
    if c.get('emptySlot'): x.append(T('if a charm slot is empty', 'boş yuvan varsa', 'ถ้ามีช่องไอเท็มว่าง')[l])
    if c.get('slotIs') == 'first': x.append(T('if it sits in the leftmost charm slot', 'en soldaki tılsım yuvasındaysa', 'ถ้าอยู่ช่องไอเท็มซ้ายสุด')[l])
    if c.get('slotIs') == 'last': x.append(T('if it sits in the rightmost filled charm slot', 'dolu yuvaların en sağındaysa', 'ถ้าอยู่ช่องไอเท็มที่มีของขวาสุด')[l])
    if c.get('firstRound'): x.append(T('on the first round of a debt', 'borcun ilk elinde', 'ในรอบแรกของหนี้')[l])
    if c.get('every'): x.append(T('every %d times', 'her %d seferde bir', 'ทุก %d ครั้ง')[l] % c['every'])
    if c.get('chance'): x.append(T('%d%% chance', '%%%d ihtimalle', 'โอกาส %d%%')[l] % c['chance'])
    if c.get('limit') == 'round': x.append(T('once per round', 'elde bir kez', 'รอบละครั้ง')[l])
    if c.get('limit') == 'debt': x.append(T('once per debt', 'borçta bir kez', 'หนี้ละครั้ง')[l])
    return (' ' if l == 'th' else ', ').join([w] + x)

def text(rules):
    out = {}
    for l in L:
        out[l] = ' '.join(when(r['trigger'], r.get('cond', {}), l) + ': ' + ', '.join(eff(e, l) for e in r['effects']) + ('' if l == 'th' else '.') for r in rules)
    return out

def R(trigger, cond=None, *effects): return dict(trigger=trigger, cond=cond or {}, effects=list(effects))
def E(t, n=None, **k):
    d = dict(type=t);
    if n is not None: d['n'] = n
    d.update(k); return d
def F(flag, v=None): return dict(type='flag', flag=flag, **({'v': v} if v is not None else {}))
P = 'passive'
PRICE = {'common': ('coins', 6), 'uncommon': ('coins', 10), 'rare': ('wick', 5), 'legendary': ('wick', 9)}
# a price that differs from its rarity's follows measured power (sim-quick smart bot): strong flat earners cost more, weak ones less
POWER_PRICE = {'patient_cocoon': 14, 'corner_tacks': 14, 'paper_fortune': 9, 'abacus': 4, 'coin_purse': 4, 'cushion': 4, 'matchbox': 4, 'paid_witness': 4, 'polish_rag': 4, 'star_card': 8}
RK = {'c': 'common', 'u': 'uncommon', 'r': 'rare', 'l': 'legendary'}
charms = []
def C(i, fam, rar, icon, en, tr, th, *rules, tags=(), price=None):
    assert 'charm/' + icon in ICONS, icon
    cur, pr = PRICE[RK[rar]]
    pr = price if price is not None else POWER_PRICE.get(i, pr)
    charms.append(dict(id=i, name=T(en, tr, th), family=fam, tags=[fam] + list(tags), rarity=RK[rar], icon='charm/' + icon,
                       price={cur: pr}, unlock=None, rules=list(rules), text=text(rules)))

# ---- swarm: low symbols and head-count ----
C('moth_jar', 'swarm', 'c', 'moth_jar', 'Lime Soda Bag', 'Poşet Limonata', 'น้ำมะนาวถุง', R('onSymbolLand', {'sym': 'moth'}, E('coins', 1)))
C('dusty_wing', 'swarm', 'c', 'moth_wing', 'Half a Lime', 'Yarım Limon', 'มะนาวครึ่งซีก', R(P, None, E('weight', 1.5, sym='moth')))
C('tallow_stub', 'swarm', 'c', 'moth_wing', 'Dipping Sauce', 'Acı Sos', 'น้ำจิ้ม', R(P, None, E('symValue', 2, sym='candle')))
C('patient_cocoon', 'swarm', 'u', 'cocoon', 'Banana Leaf Parcel', 'Muz Yaprağı Paketi', 'ห่อใบตอง', R('onPattern', {'group': 'low', 'every': 8}, E('symValue', 1, sym='low')))
C('moth_net', 'swarm', 'c', 'moth_net', 'Lime Basket', 'Limon Sepeti', 'ตะกร้ามะนาว', R('onSpinEnd', {'countMin': ['moth', 3]}, E('coins', 4)))
C('night_swarm', 'swarm', 'u', 'moth_jar', 'Lime Rush', 'Limon Akını', 'มะนาวยกเข่ง', R('onPattern', {'sym': 'moth'}, E('patMult', 0.25, pattern='this', per='sym:moth')))
C('milk_tooth', 'swarm', 'c', 'cocoon', 'Rice Basket', 'Pirinç Sepeti', 'กระติบข้าว', R(P, None, E('symValue', 2, sym='tooth')))
C('bent_key', 'swarm', 'u', 'moth_net', 'Green Mango', 'Ham Mango', 'มะม่วงดิบ', R('onPattern', {'sym': 'key', 'every': 2}, E('wick', 1)), tags=['pact'])
C('small_fry_union', 'swarm', 'r', 'moth_jar', "Hawkers' Club", 'Seyyar Satıcılar', 'ชมรมแม่ค้า', R(P, None, E('symMult', 0.25, sym='low', per='family:swarm')))
C('dust_queen', 'swarm', 'l', 'moth_wing', 'Lime Master', 'Limon Ustası', 'เซียนมะนาว', R('onPattern', {'sym': 'moth'}, E('retrigger', 1)), R(P, None, E('weight', 1.5, sym='moth')))
C('paupers_parade', 'swarm', 'r', 'cocoon', 'Market Boom', 'Pazar Bereketi', 'ตลาดคึกคัก', R('onSpinEnd', {'minPatterns': 3, 'limit': 'round'}, E('symValue', 1, sym='low')))
# ---- ember: Heat ----
C('matchbox', 'ember', 'c', 'matchbox', 'Gas Lighter', 'Çakmak', 'ไฟแช็ก', R('onStoke', None, E('coins', 1)))
C('hot_coal', 'ember', 'c', 'coal', 'Hot Charcoal', 'Kızgın Kömür', 'ถ่านแดง', R(P, {'heatMin': 4}, E('patMult', 0.5, pattern='all')))
C('bellows', 'ember', 'u', 'bellows', 'Bamboo Fan', 'Bambu Yelpaze', 'พัดสาน', R('onRoundStart', None, E('heat', 2)), R(P, None, F('heatStep', 35)))
C('torch', 'ember', 'c', 'torch', 'Wok Flame', 'Wok Alevi', 'ไฟกระทะ', R('onSpinEnd', {'heatMin': 6}, E('coins', 4)))
C('brazier', 'ember', 'u', 'brazier', 'Clay Stove', 'Kil Ocak', 'เตาอั้งโล่', R(P, None, F('heatNoCool'), E('luck', 1)), tags=['omen'])
C('fire_eater', 'ember', 'r', 'torch', 'Iron Stomach', 'Demir Mide', 'กระเพาะเหล็ก', R(P, None, F('scorchNeeds', 4)), tags=['hex'])
C('cold_ember', 'ember', 'u', 'coal', 'Iced Coffee', 'Buzlu Kahve', 'โอเลี้ยง', R('onSpinEnd', {'heatMax': 0}, E('luck', 2, scope='round')), tags=['omen'])
C('kindling', 'ember', 'c', 'matchbox', 'Dried Chilies', 'Kuru Biber', 'พริกแห้ง', R('onDud', None, E('heat', 1), E('coins', 2)))
C('furnace_heart', 'ember', 'l', 'brazier', 'Volcano Wok', 'Volkan Wok', 'กระทะภูเขาไฟ', R(P, {'heatMin': 10}, E('allMult', 2)))
C('powder_trail', 'ember', 'r', 'bellows', 'Chili Paste', 'Biber Ezmesi', 'น้ำพริก', R('onPattern', {'minCells': 4, 'heatMin': 5}, E('retrigger', 1)), tags=['stitch'])
C('stray_spark', 'ember', 'u', 'matchbox', 'Flying Spark', 'Uçan Kıvılcım', 'สะเก็ดไฟ', R('onStoke', {'chance': 25, 'limit': 'round'}, E('spins', 1)))
# ---- hex: curses and Ash ----
C('pin_doll', 'hex', 'c', 'rag_doll', 'Leaky Umbrella', 'Delik Şemsiye', 'ร่มรั่ว', R('onRoundStart', None, E('coins', 3, per='curses')))
C('black_cat', 'hex', 'u', 'black_cat', 'Howling Dog', 'Uluyan Köpek', 'หมาหอน', R(P, None, E('luck', 1, per='curses')), tags=['omen'])
C('cracked_mirror', 'hex', 'r', 'cracked_mirror', 'Cracked Screen', 'Kırık Ekran', 'จอแตก', R('onCurse', None, E('symMult', 0.25, sym='all')))
C('rattle_ribs', 'hex', 'c', 'rib_cage', 'Charcoal Sack', 'Kömür Çuvalı', 'กระสอบถ่าน', R('onSymbolLand', {'sym': 'ash'}, E('coins', 3)), tags=['ember'])
C('crow_feather', 'hex', 'c', 'crow_feather', 'Boat Paddle', 'Kürek', 'ไม้พายเรือ', R(P, None, E('symValue', 3, sym='crow')), tags=['crown'])
C('ash_cake', 'hex', 'u', 'rib_cage', 'Rice Crust', 'Kıtır Pilav', 'ข้าวตัง', R('onScorch', None, E('wick', 2), E('coins', 10)), tags=['ember'])
C('scapegoat_bell', 'hex', 'l', 'black_cat', 'Silver Lining', 'Umut Işığı', 'ฟ้าหลังฝน', R(P, None, F('ashIsFav')), tags=['ember'])
C('grave_dirt', 'hex', 'u', 'rag_doll', 'Flooded Soi', 'Su Basmış Sokak', 'ซอยน้ำท่วม', R(P, {'cursesMin': 3}, E('patMult', 1, pattern='all')))
C('jinx_bead', 'hex', 'c', 'cracked_mirror', 'Falling Coconut', 'Düşen Hindistan Cevizi', 'มะพร้าวหล่น', R('onSymbolLand', {'sym': 'eye'}, E('coins', 1, per='curses')))
C('thirteenth_stair', 'hex', 'u', 'crow_feather', 'Pothole', 'Çukur', 'หลุมบ่อ', R('onSpinEnd', {'every': 4}, E('coins', 45)))
C('martyr_splinter', 'hex', 'r', 'rib_cage', 'Wet Matches', 'Islak Kibrit', 'ไม้ขีดเปียก', R('onScorch', None, E('symMult', 0.3, sym='all')), tags=['ember'])
# ---- ledger: purse, interest, banking ----
C('abacus', 'ledger', 'c', 'abacus', 'Shop Abacus', 'Dükkân Abaküsü', 'ลูกคิด', R(P, None, E('interest', 4)))
C('coin_purse', 'ledger', 'c', 'coin_purse', 'Waist Bag', 'Bel Çantası', 'กระเป๋าคาดเอว', R('onRoundEnd', None, E('coins', 5)))
C('ledger_book', 'ledger', 'u', 'ledger_book', 'Price Notebook', 'Fiyat Defteri', 'สมุดจดราคา', R('onInterest', None, E('wick', 1)), tags=['pact'])
C('clay_jar', 'ledger', 'u', 'clay_jar', 'Piggy Bank', 'Kumbara', 'กระปุกหมู', R('onRoundEnd', None, E('stack', 1)), R('onSellSelf', None, E('coins', 12, per='stack')))
C('exact_change', 'ledger', 'u', 'coin_purse', 'Exact Change', 'Tam Para', 'เงินพอดี', R('onDebtPaid', {'purseMaxPct': 10}, E('wick', 6)))
C('compound_tooth', 'ledger', 'r', 'abacus', 'Interest on Interest', 'Faizin Faizi', 'ดอกทบต้น', R(P, None, E('interest', 1, per='family:ledger'), F('interestCapX', 2)))
C('penny_wise', 'ledger', 'c', 'ledger_book', 'Born Haggler', 'Doğuştan Pazarlıkçı', 'เซียนต่อราคา', R(P, None, F('shopDiscount', 20), F('freeReroll', 1)))
C('brass_goose', 'ledger', 'l', 'clay_jar', 'Money Tree', 'Para Ağacı', 'ต้นเงินไหลมา', R('onInterest', None, E('symMult', 0.2, sym='all')))
C('early_payer', 'ledger', 'u', 'ledger_book', 'Early Bird', 'Erkenci', 'จ่ายไว', R('onDebtPaid', {'roundsLeftMin': 1}, E('luck', 1)), tags=['omen'])
C('dividend_slip', 'ledger', 'r', 'coin_purse', 'Transfer Slip', 'Havale Fişi', 'สลิปโอนเงิน', R('onPattern', {'minCells': 5}, E('coins', 2, per='purse100')), tags=['stitch'])
# ---- pact: deals, Sigils, Wick ----
C('notary_stamp', 'pact', 'c', 'stamp', 'Rubber Stamp', 'Kaşe', 'ตรายาง', R('onSymbolLand', {'sym': 'sigil'}, E('coins', 4)))
C('quill', 'pact', 'u', 'quill', 'Gold Pen', 'Altın Kalem', 'ปากกาทอง', R('onDeal', None, E('symValue', 2, sym='all')))
C('fine_print', 'pact', 'c', 'scroll', 'Read the Fine Print', 'Satır Arası', 'อ่านท้ายสัญญา', R(P, None, F('dealOffers', 3)))
C('ink_bottle', 'pact', 'c', 'ink_bottle', 'Neon Sign', 'Neon Tabela', 'ป้ายไฟนีออน', R(P, None, E('weight', 2, sym='sigil')))
C('firm_handshake', 'pact', 'r', 'claw_shake', 'Firm Handshake', 'Sıkı El Sıkışma', 'จับมือแน่น', R(P, None, E('patMult', 0.5, pattern='all', per='deals')))
C('red_ribbon', 'pact', 'u', 'red_ribbon', 'Red Ribbon', 'Kırmızı Kurdele', 'ริบบิ้นแดง', R('onRefuse', None, E('wick', 5)))
C('loophole', 'pact', 'u', 'scroll', 'Loophole', 'Açık Kapı', 'ช่องโหว่', R('onCurse', {'chance': 50}, F('cancelCurse')), tags=['hex'])
C('summons', 'pact', 'u', 'stamp', 'Group Chat', 'Grup Sohbeti', 'ไลน์กลุ่ม', R('onSpinEnd', {'countMin': ['sigil', 3]}, E('trick', 1)), tags=['tinker'])
C('blood_ink', 'pact', 'l', 'ink_bottle', 'Red Ink', 'Kırmızı Mürekkep', 'หมึกแดง', R('onSymbolLand', {'sym': 'sigil'}, E('allMult', 1.5)))
C('paid_witness', 'pact', 'c', 'quill', 'Paid Witness', 'Ücretli Tanık', 'พยานรับจ้าง', R('onDebtPaid', None, E('wick', 4)))
C('cosigner', 'pact', 'r', 'claw_shake', 'Co-signer', 'Kefil', 'คนค้ำประกัน', R(P, None, F('saveDeadline')))
# ---- omen: Luck and the Favourite ----
C('tea_leaves', 'omen', 'c', 'tea_cup', 'Thai Iced Tea', 'Tay Buzlu Çayı', 'ชาเย็น', R(P, None, E('luck', 1)))
C('crystal_ball', 'omen', 'u', 'crystal_ball', 'Lucky Cat', 'Şans Kedisi', 'แมวกวัก', R(P, None, F('seeNextFav'), F('freeRedraw', 1)))
C('star_card', 'omen', 'c', 'star_card', 'Red Envelope', 'Kırmızı Zarf', 'อั่งเปา', R('onPattern', {'favoured': True}, E('coins', 2)))
C('comet', 'omen', 'u', 'comet', 'Shooting Star', 'Kayan Yıldız', 'ดาวตก', R('onSpinStart', {'spinIs': 'first'}, E('luck', 4, scope='spin')))
C('bent_nail', 'omen', 'c', 'horseshoe_nail', 'House Gecko', 'Ev Kertenkelesi', 'จิ้งจกทัก', R('onDud', None, E('luck', 1, scope='round')))
C('dream_web', 'omen', 'u', 'spider_web', 'Woven Fish', 'Örgü Balık', 'ปลาตะเพียนสาน', R('onSpinStart', {'spinIs': 'last'}, E('luck', 5, scope='spin')))
C('second_sight', 'omen', 'r', 'crystal_ball', 'Second Sight', 'Altıncı His', 'สัมผัสที่หก', R(P, None, F('pickFirstFav')))
C('fair_wind', 'omen', 'u', 'comet', 'Cool Breeze', 'Serin Esinti', 'ลมเย็น', R('onSpinEnd', {'minPatterns': 2}, E('luck', 1, scope='round')))
C('twin_stars', 'omen', 'r', 'star_card', 'Twin Stars', 'İkiz Yıldız', 'ดาวคู่', R(P, None, F('twoFavs')))
C('paper_fortune', 'omen', 'c', 'tea_cup', 'Daily Horoscope', 'Günlük Burç', 'ใบดูดวงรายวัน', R('onRoundStart', None, E('luck', 1, scope='round', per='emptySlots')))
C('fixed_star', 'omen', 'l', 'spider_web', 'North Star', 'Kutup Yıldızı', 'ดาวเหนือ', R(P, None, F('favPerRound'), E('symMult', 0.5, sym='favoured')))
# ---- stitch: shapes and positions ----
C('needle', 'stitch', 'c', 'needle', 'Jab', 'Direkt', 'หมัดตรง', R(P, None, E('patMult', 0.5, pattern='h3')))
C('shuttle', 'stitch', 'c', 'shuttle', 'Uppercut', 'Aparkat', 'หมัดเสย', R(P, None, E('patMult', 1, pattern='v3')))
C('knot', 'stitch', 'c', 'knot', 'Roundhouse Kick', 'Döner Tekme', 'เตะเฉียง', R(P, None, E('patMult', 1, pattern='d3')))
C('corner_tacks', 'stitch', 'u', 'needle', 'Corner Man', 'Köşe Adamı', 'พี่เลี้ยงมุม', R('onSymbolLand', {'zone': 'corner'}, E('coins', 1)))
C('long_hem', 'stitch', 'u', 'shuttle', 'Long Combo', 'Uzun Kombo', 'คอมโบยาว', R('onPattern', {'minCells': 5}, E('patMult', 2, pattern='this')))
C('patchwork', 'stitch', 'u', 'knot', 'Mixed Strikes', 'Karışık Vuruş', 'ออกอาวุธครบ', R('onSpinEnd', {'distinctMin': 3}, E('coins', 12)))
C('crooked_loom', 'stitch', 'r', 'shuttle', 'Clinch', 'Klinç', 'จับล็อก', R(P, None, F('fiveNeedsFour')))
C('halo_thread', 'stitch', 'u', 'needle', 'Elbow and Knee', 'Dirsek ve Diz', 'ศอกกับเข่า', R(P, None, E('patMult', 3, pattern='halo'), E('patMult', 3, pattern='corners')))
C('master_stitch', 'stitch', 'r', 'knot', 'Ring Veteran', 'Ring Kurdu', 'เซียนเวที', R('onPattern', {'every': 10}, E('patMult', 0.5, pattern='all')))
C('fair_tapestry', 'stitch', 'l', 'shuttle', 'Knockout', 'Nakavt', 'น็อกเอาต์', R('onSpinEnd', {'minPatterns': 4}, E('allMult', 3)))
# ---- wisp: wilds and transforms ----
C('wisp_bottle', 'wisp', 'c', 'wisp_bottle', 'Firefly Bottle', 'Ateşböceği Şişesi', 'ขวดหิ่งห้อย', R(P, None, E('weight', 2, sym='wisp')))
C('glow_jar', 'wisp', 'c', 'glow_jar', 'Glow Jar', 'Işıltı Kavanozu', 'โหลเรืองแสง', R('onSymbolLand', {'sym': 'wisp'}, E('coins', 2)))
C('firefly', 'wisp', 'u', 'firefly', 'Canal Firefly', 'Kanal Ateşböceği', 'หิ่งห้อยริมคลอง', R('onSpinStart', {'chance': 30}, E('place', 1, sym='wisp')))
C('prism', 'wisp', 'u', 'prism', 'Glow Stick', 'Işık Çubuğu', 'แท่งเรืองแสง', R('onPattern', {'hasWisp': True}, E('patMult', 1, pattern='this')))
C('lost_light', 'wisp', 'c', 'firefly', 'Stray Glow', 'Kayıp Işık', 'แสงหลง', R('onPattern', {'hasWisp': True}, E('symValue', 3, sym='that', scope='spin')))
C('changeling', 'wisp', 'r', 'wisp_bottle', 'Switch-up', 'Kılık Değiştir', 'สลับร่าง', R('onSpinStart', None, E('transform', 2, **{'from': 'moth', 'to': 'favoured'})), tags=['omen'])
C('spare_face', 'wisp', 'u', 'prism', 'Glowing Durian', 'Parlayan Durian', 'ทุเรียนเรืองแสง', R('onSpinStart', None, E('transform', 1, **{'from': 'mask', 'to': 'wisp'})))
C('ghost_parade', 'wisp', 'r', 'glow_jar', 'Firefly Boat Tour', 'Ateşböceği Turu', 'ล่องเรือดูหิ่งห้อย', R('onSpinEnd', {'countMin': ['wisp', 3]}, E('allMult', 2)))
C('twin_flame', 'wisp', 'u', 'wisp_bottle', 'Twin Glow', 'İkiz Işık', 'แสงคู่', R('onSymbolLand', {'sym': 'wisp', 'every': 5}, E('wick', 1)), tags=['pact'])
C('green_dawn', 'wisp', 'l', 'glow_jar', 'Mangrove Glow', 'Mangrov Işıltısı', 'แสงป่าชายเลน', R('onSpinStart', {'spinIs': 'first'}, E('place', 5, sym='wisp', zone='midrow')))
# ---- tinker: tricks and the bench ----
C('wrench', 'tinker', 'c', 'wrench', 'Chrome Spanner', 'Krom Anahtar', 'ประแจ', R('onTrick', None, E('patMult', 1, pattern='all', scope='spin')))
C('oil_can', 'tinker', 'c', 'oil_can', 'Engine Oil', 'Motor Yağı', 'น้ำมันเครื่อง', R(P, None, F('trickPockets', 1)), R('onDebtStart', None, E('trick', 1)))
C('gear', 'tinker', 'u', 'gear', 'Two-stroke Engine', 'İki Zamanlı Motor', 'เครื่องสองจังหวะ', R('onTrick', {'every': 2}, E('spins', 1)))
C('hammer', 'tinker', 'u', 'hammer', 'Panel Beater', 'Kaportacı', 'ช่างเคาะ', R('onBuy', None, E('symValue', 2, sym='random')))
C('pliers', 'tinker', 'c', 'pliers', 'Pliers', 'Pense', 'คีม', R(P, None, F('benchDiscount', 50)))
C('spare_parts', 'tinker', 'u', 'gear', 'Spare Parts', 'Yedek Parça', 'อะไหล่', R(P, None, E('allMult', 1.04, per='tricks')))
C('tuned_gears', 'tinker', 'r', 'gear', 'Tuned Engine', 'Ayarlı Motor', 'เครื่องจูน', R(P, None, F('firstTrickFree')))
C('polish_rag', 'tinker', 'c', 'oil_can', 'Chrome Polish', 'Krom Cilası', 'น้ำยาขัดเงา', R('onDebtPaid', None, E('symValue', 2, sym='random')))
C('scrap_heap', 'tinker', 'r', 'hammer', 'Used Parts Market', 'Hurdacı', 'เชียงกง', R(P, None, E('symMult', 0.3, sym='all', per='removed')))
C('clockwork_thumb', 'tinker', 'l', 'wrench', 'Turbo', 'Turbo', 'เทอร์โบ', R('onTrick', None, E('allMult', 2, scope='spin')))
# ---- crown: high symbols ----
C('scepter', 'crown', 'u', 'scepter', 'Gold Chain', 'Altın Zincir', 'สร้อยทอง', R(P, None, E('symValue', 6, sym='crown'), E('weight', 2, sym='crown')))
C('throne', 'crown', 'r', 'throne', 'Gold Shop', 'Kuyumcu', 'ร้านทอง', R('onPattern', {'sym': 'crown'}, E('retrigger', 1)))
C('cushion', 'crown', 'c', 'cushion', 'Velvet Tray', 'Kadife Tepsi', 'ถาดกำมะหยี่', R(P, None, E('weight', 1.3, sym='high')))
C('lamplighter', 'crown', 'c', 'scepter', 'Elephant Carver', 'Fil Oymacısı', 'ช่างแกะช้าง', R(P, None, E('symValue', 4, sym='lantern')))
C('jesters_cap', 'crown', 'u', 'cushion', 'Big Spender', 'Eli Açık', 'สายเปย์', R('onPattern', {'group': 'high'}, E('coins', 5)))
C('coronation', 'crown', 'r', 'throne', 'Gold Rush', 'Altına Hücum', 'ตื่นทอง', R('onSpinEnd', {'countMin': ['crown', 3]}, E('symValue', 2, sym='crown')))
C('royal_tithe', 'crown', 'u', 'scepter', 'Gold Tip', 'Altın Bahşiş', 'ทิปทอง', R('onPattern', {'group': 'high', 'every': 4}, E('wick', 1)), tags=['pact'])
C('velvet_rope', 'crown', 'u', 'cushion', 'VIP Rope', 'VIP İpi', 'เชือกกั้นวีไอพี', R(P, None, E('weight', 0.7, sym='low')))
C('paper_king', 'crown', 'l', 'throne', 'Paper Tycoon', 'Kâğıttan Zengin', 'เศรษฐีกระดาษ', R('onPattern', {'group': 'high', 'minCells': 4}, E('patMult', 4, pattern='this')))

# ---- slot order: these read where they sit in the charm row ----
C('understudy', 'tinker', 'u', 'prism', 'Copycat', 'Taklitçi', 'ลอกแบบ', R(P, None, F('copyRight')))
C('opening_act', 'tinker', 'u', 'red_ribbon', 'Front Seat', 'Ön Koltuk', 'เบาะหน้า', R(P, {'slotIs': 'first'}, E('allMult', 1.5)))
C('closer', 'tinker', 'u', 'knot', 'Tail Light', 'Arka Lamba', 'ไฟท้าย', R(P, {'slotIs': 'last'}, E('allMult', 1.5)))

# ---- engines: multipliers that compound. Each feeds on its own family; the cross-family ones name the other family's thing ----
C('hive_mind', 'swarm', 'r', 'moth_jar', 'Food Court', 'Yemek Alanı', 'ศูนย์อาหาร', R('onPattern', {'group': 'low'}, E('allMult', 1.05, scope='spin')))
C('moth_mother', 'swarm', 'u', 'cocoon', 'Lime Tree', 'Limon Ağacı', 'ต้นมะนาว', R('onSpinEnd', {'countMin': ['moth', 4]}, E('stack', 1)), R(P, None, E('symMult', 0.1, sym='low', per='stack')), price=12)
C('smiths_forge', 'ember', 'r', 'brazier', 'Wok Master', 'Wok Ustası', 'เชฟกระทะเหล็ก', R(P, None, E('allMult', 1.08, per='heat')))
C('slow_burn', 'ember', 'u', 'coal', 'Slow Grill', 'Ağır Ateş Izgara', 'ย่างไฟอ่อน', R('onRoundEnd', {'heatMin': 5}, E('stack', 1)), R(P, None, E('allMult', 1.05, per='stack')), price=12)
C('cinder_vow', 'ember', 'r', 'torch', 'Burnt Pan', 'Yanık Tava', 'กระทะไหม้', R('onScorch', None, E('stack', 1)), R(P, None, E('allMult', 1.1, per='stack')), tags=['hex'])
C('witch_bottle', 'hex', 'r', 'black_cat', 'Rain Jar', 'Yağmur Küpü', 'โอ่งน้ำฝน', R(P, None, E('allMult', 1.12, per='curses')), tags=['pact'])
C('gilt_ledger', 'ledger', 'r', 'ledger_book', 'Fat Wallet', 'Şişkin Cüzdan', 'กระเป๋าตุง', R(P, None, E('allMult', 1.05, per='purse100')))
C('tally_stick', 'ledger', 'u', 'abacus', 'Stamp Card', 'Damga Kartı', 'บัตรสะสมแต้ม', R('onDebtPaid', None, E('stack', 1)), R(P, None, E('allMult', 1.15, per='stack')), price=12)
C('crown_bond', 'ledger', 'r', 'coin_purse', 'Gold Savings', 'Altın Birikimi', 'ออมทอง', R(P, None, E('symMult', 0.4, sym='crown', per='purse100')), tags=['crown'])
C('devils_due', 'pact', 'r', 'claw_shake', "Ruby's Cut", "Ruby'nin Payı", 'ส่วนแบ่งรูบี้', R(P, None, E('allMult', 1.12, per='deals')), tags=['hex'])
C('lodestar', 'omen', 'r', 'star_card', 'Best Seller', 'Çok Satan', 'ขายดี', R('onPattern', {'favoured': True}, E('allMult', 1.05, scope='spin')))
C('pattern_book', 'stitch', 'r', 'knot', 'Training Camp', 'Antrenman Kampı', 'ค่ายมวย', R(P, None, E('patMult', 0.5, pattern='all', per='family:stitch')))
C('will_o_lamp', 'wisp', 'r', 'glow_jar', 'Firefly Lamp', 'Ateşböceği Lambası', 'ตะเกียงหิ่งห้อย', R('onPattern', {'hasWisp': True}, E('allMult', 1.25, scope='spin')), tags=['omen'])
C('tool_belt', 'tinker', 'r', 'wrench', 'Tool Box', 'Alet Kutusu', 'กล่องเครื่องมือ', R('onTrick', None, E('stack', 1)), R(P, None, E('allMult', 1.05, per='stack')))
# order engines: where they sit in the row is the whole point
C('lead_goose', 'tinker', 'u', 'gear', 'Convoy Leader', 'Konvoy Başı', 'หัวขบวน', R(P, None, E('allMult', 1.15, per='rightOf')), price=12)
C('caboose', 'tinker', 'u', 'hammer', 'Last in Line', 'Konvoy Sonu', 'ท้ายขบวน', R(P, None, E('allMult', 1.1, per='leftOf')), price=12)
C('crown_jewels', 'crown', 'r', 'throne', 'Gold Safe', 'Altın Kasası', 'ตู้เซฟทอง', R('onSymbolLand', {'sym': 'crown'}, E('allMult', 1.15, scope='spin')))

# ---------- curses ----------
curses = []
def CU(i, icon, en, tr, th, *rules):
    assert 'curse/' + icon in ICONS
    curses.append(dict(id=i, name=T(en, tr, th), icon='curse/' + icon, rules=list(rules), text=text(rules)))
CU('dead_weight', 'weight', 'Bad Loan', 'Batık Kredi', 'หนี้เสีย', R(P, None, F('noInterest'), F('debtMul', 10)))
CU('short_candle', 'candle', 'Late Start', 'Geç Açılış', 'เปิดร้านสาย', R('onRoundStart', {'firstRound': True}, E('spins', -2)))
CU('ash_rain', 'ash', 'Smog', 'Duman', 'หมอกควัน', R(P, None, F('ashBase', 3)))
CU('the_tithe', 'tax', 'Market Fee', 'Pazar Payı', 'ค่าแผง', R(P, None, E('allMult', 0.8)))
CU('dear_prices', 'price', 'Price Hike', 'Zam', 'ของขึ้นราคา', R(P, None, F('shopMarkup', 50)))
CU('blindfold', 'blind', 'Power Cut', 'Elektrik Kesintisi', 'ไฟดับ', R(P, None, F('hideFav')))
CU('shackle', 'chain', 'Tiny Stall', 'Dar Tezgâh', 'แผงแคบ', R(P, None, E('slot', -1)))
CU('hairline_crack', 'crack', 'Thin Margins', 'İnce Kâr', 'กำไรบาง', R(P, None, F('smallHalf')))
CU('fever', 'fever', 'Chili Burn', 'Biber Yakması', 'เผ็ดแสบลิ้น', R(P, None, F('heatFloor', 3)))
CU('moth_eaten', 'weight', 'Wilted', 'Solgun', 'ผักเหี่ยว', R(P, None, E('symValue', -1, sym='low')))
CU('cold_feet', 'candle', 'Quiet Opening', 'Sessiz Açılış', 'เปิดร้านเงียบ', R(P, None, F('firstSpinDead')))
CU('smoke_hole', 'ash', 'Smoky Grill', 'Dumanlı Izgara', 'เตาควันโขมง', R(P, None, F('deadCentre')))
CU('small_print', 'tax', 'Hidden Fees', 'Gizli Masraf', 'ค่าธรรมเนียมแฝง', R(P, None, F('debtMul', 15)))
CU('sticky_fingers', 'price', 'Pickpocket', 'Yankesici', 'มือล้วง', R(P, None, F('rerollDouble')))
CU('jinx', 'blind', 'Bad Day', 'Kötü Gün', 'วันซวย', R(P, None, E('luck', -2)))
CU('brittle_nerves', 'crack', 'Short Temper', 'Kısa Sigorta', 'ใจร้อน', R('onTrick', None, E('heat', 2)))
CUN = {c['id']: c['name'] for c in curses}

# ---------- deals ----------
deals = []
def D(i, icon, en, tr, th, curse, *effects, n=1):
    assert 'deal/' + icon in ICONS and (curse == 'random' or curse in CUN)
    boon = [R('now', None, *effects)]
    tx = text(boon)
    for l in L:
        cn = (CUN[curse][l] + (' x%d' % n if n > 1 else '')) if curse != 'random' else T('%d random', '%d rastgele', 'สุ่ม %d อย่าง')[l] % n
        tx[l] = tx[l].split(': ', 1)[1]
        tx[l] = tx[l][0].upper() + tx[l][1:] + ' ' + T('Curse: %s.', 'Lanet: %s.', 'คำสาป: %s')[l] % cn
    deals.append(dict(id=i, name=T(en, tr, th), icon='deal/' + icon, boon=list(effects), curse=curse, curseCount=n, text=tx))
D('quick_cash', 'coins', 'Quick Cash', 'Hızlı Para', 'เงินด่วน', 'the_tithe', E('coins', 40))
D('fat_purse', 'coins', 'Better Rate', 'İyi Faiz', 'ดอกงาม', 'dear_prices', E('interest', 5))
D('advance', 'coins', 'A Small Advance', 'Küçük Avans', 'เบิกล่วงหน้า', 'small_print', F('debtCut', 30))
D('muscle', 'power', 'Borrowed Muscle', 'Ödünç Kas', 'ยืมแรง', 'short_candle', E('patMult', 0.5, pattern='all'))
D('overdrive', 'power', 'Full Throttle', 'Son Gaz', 'บิดสุด', 'ash_rain', E('symMult', 0.3, sym='all'))
D('big_lines', 'power', 'Big Dreams', 'Büyük Hayaller', 'ฝันใหญ่', 'hairline_crack', E('patMult', 3, pattern='big'))
D('lucky_break', 'luck', 'Lucky Break', 'Şans Kapısı', 'ดวงเฮง', 'blindfold', E('luck', 1))
D('loaded', 'luck', 'A Thumb on the Scale', 'Terazide Parmak', 'นิ้วกดตาชั่ง', 'cold_feet', E('luck', 2))
D('star_sign', 'luck', 'Star Sign', 'Burç', 'ราศี', 'moth_eaten', F('pickFav'))
D('extra_slot', 'slot', 'Room for One More', 'Bir Kişilik Yer', 'เบียดได้อีกที่', 'small_print', E('slot', 1))
D('big_pockets', 'slot', 'Cargo Pants', 'Kargo Pantolon', 'กางเกงหลายกระเป๋า', 'brittle_nerves', F('trickPockets', 2), E('trick', 2))
D('wide_shelf', 'slot', 'Bigger Stall', 'Geniş Tezgâh', 'แผงใหญ่', 'random', E('slot', 1))
D('green_night', 'wild', 'Firefly Season', 'Ateşböceği Mevsimi', 'หน้าหิ่งห้อย', 'smoke_hole', E('weight', 3, sym='wisp'))
D('false_face', 'wild', 'Durian Secret', 'Durian Sırrı', 'ความลับทุเรียน', 'jinx', F('maskWild'))
D('ghost_hire', 'wild', 'Hired Fireflies', 'Kiralık Ateşböcekleri', 'จ้างหิ่งห้อย', 'the_tithe', F('ghostHire'))
D('borrowed_time', 'time', 'Borrowed Time', 'Ödünç Zaman', 'ยืมเวลา', 'small_print', F('roundsAdd', 1), n=2)
D('long_wick', 'time', 'Late Closing', 'Geç Kapanış', 'ปิดร้านดึก', 'dead_weight', F('spinsRound', 1))
D('snooze', 'time', 'Snooze', 'Erteleme', 'ขอเลื่อน', 'random', F('extraLife'))
D('free_market', 'shop', 'Friends Price', 'Eş Dost Fiyatı', 'ราคาคนกันเอง', 'sticky_fingers', F('shopDiscount', 30))
D('backroom', 'shop', 'Back Room', 'Arka Oda', 'ห้องหลังร้าน', 'dear_prices', E('gainCharm', rarity='rare'))
D('fire_sale', 'shop', 'Clearance Sale', 'Tasfiye', 'ล้างสต็อก', 'shackle', E('wick', 8))
D('crowned', 'symbol', 'Gold Plating', 'Altın Kaplama', 'ชุบทอง', 'moth_eaten', E('symValue', 8, sym='crown'), E('weight', 2, sym='crown'))
D('purge_two', 'symbol', 'Clear the Shelf', 'Rafı Boşalt', 'เคลียร์แผง', 'hairline_crack', E('removeSymbol', 2))
D('black_envelope', 'mystery', 'Mystery Box', 'Sürpriz Kutu', 'กล่องปริศนา', 'random', E('gainCharm', rarity='legendary'), n=2)

# ---------- tricks ----------
tricks = []
def TK(i, when_, cur, pr, en, tr, th, d_en, d_tr, d_th, **op):
    assert 'trick/' + i in ICONS, i
    tricks.append(dict(id=i, name=T(en, tr, th), icon='trick/' + i, when=when_, price={cur: pr}, op=op, text=T(d_en, d_tr, d_th)))
TK('nudge', 'post', 'coins', 3, 'Nudge', 'Dürtme', 'สะกิด', 'Slide one column down by one cell. The bottom symbol wraps to the top.', 'Bir sütunu bir hücre aşağı kaydır. Alttaki sembol üste geçer.', 'เลื่อนหนึ่งแถวตั้งลงหนึ่งช่อง ตัวล่างสุดวนขึ้นบน', type='shiftColumn', n=1)
TK('pin', 'post', 'coins', 3, 'Clothes Peg', 'Mandal', 'ไม้หนีบ', 'Pin one column. It stays as it is for the next spin.', 'Bir sütunu iğnele. Sonraki çevirişte olduğu gibi kalır.', 'ปักหมุดหนึ่งแถวตั้ง ตาถัดไปแถวนั้นไม่หมุน', type='holdColumn')
TK('row_arrow', 'post', 'coins', 4, 'Do-over', 'Bir Daha', 'เอาใหม่', 'Spin one row again. You must keep the new row.', 'Bir sırayı yeniden çevir. Yeni sırayı kabul etmek zorundasın.', 'หมุนหนึ่งแถวนอนใหม่ ต้องรับผลใหม่', type='respinRow')
TK('double_stamp', 'post', 'coins', 5, 'Buy One Get One', 'Bir Alana Bir', 'ซื้อ 1 แถม 1', 'The best pattern of this spin pays twice.', 'Bu çevirişin en iyi deseni iki kez öder.', 'ลายที่ดีที่สุดของตานี้จ่ายสองครั้ง', type='retriggerBest')
TK('swap', 'post', 'coins', 3, 'Switcheroo', 'Yer Değiştir', 'สลับที่', 'Swap two cells that touch.', 'Birbirine değen iki hücreyi değiştir.', 'สลับสองช่องที่ติดกัน', type='swapAdjacent')
TK('brush', 'post', 'coins', 5, 'Paintbrush', 'Fırça', 'พู่กัน', 'Paint one cell into the Special.', 'Bir hücreyi Gözdeye boya.', 'ทาหนึ่งช่องให้เป็นเมนูเด็ด', type='setCell', to='favoured')
TK('broom', 'post', 'coins', 3, 'Grass Broom', 'Saman Süpürge', 'ไม้กวาดดอกหญ้า', 'Sweep every Soot off the grid. Those cells spin again.', 'Izgaradaki tüm İsleri süpür. O hücreler yeniden çevrilir.', 'กวาดเขม่าทั้งหมดออก ช่องเหล่านั้นหมุนใหม่', type='rerollSymbol', sym='ash')
TK('hourglass', 'any', 'wick', 2, 'Extra Time', 'Ek Süre', 'ต่อเวลา', '+2 spins this round.', 'Bu el +2 çeviriş.', 'รอบนี้ได้ +2 ตา', type='spins', n=2)
TK('ice', 'any', 'coins', 2, 'Ice Bucket', 'Buz Kovası', 'ถังน้ำแข็ง', 'Spice −4.', 'Acı −4.', 'เผ็ด −4', type='heat', n=-4)
TK('chili', 'pre', 'coins', 4, 'Chili', 'Acı Biber', 'พริก', 'Spice +3. The next spin cannot Flare-up.', 'Acı +3. Sonraki çevirişte Parlama olmaz.', 'เผ็ด +3 ตาถัดไปจะไม่เกิดไฟลุก', type='heat', n=3, noScorch=True)
TK('pocket', 'post', 'coins', 4, 'Shirt Pocket', 'Gömlek Cebi', 'กระเป๋าเสื้อ', 'Take one symbol off the grid and keep it. Use again later to put it in any cell.', 'Izgaradan bir sembol al ve sakla. Sonra yeniden kullanıp istediğin hücreye koy.', 'หยิบสัญลักษณ์หนึ่งตัวเก็บไว้ ใช้อีกครั้งเพื่อวางลงช่องใดก็ได้', type='stash')
TK('stencil', 'post', 'coins', 5, 'Stencil', 'Şablon', 'แบบลาย', 'One cell becomes a Firefly for this spin.', 'Bir hücre bu çeviriş için Ateşböceği olur.', 'หนึ่งช่องกลายเป็นหิ่งห้อยในตานี้', type='setCell', to='wisp')
TK('wish_coin', 'pre', 'coins', 3, 'Lucky Coin', 'Uğurlu Para', 'เหรียญนำโชค', '+5 Luck on the next spin.', 'Sonraki çevirişte +5 Şans.', 'ตาถัดไปโชค +5', type='luck', n=5, scope='spin')
TK('kit', 'shop', 'wick', 2, 'Tool Roll', 'Alet Rulosu', 'ม้วนเครื่องมือ', 'One bench job is free. Use it at the bench.', 'Bir tezgâh işi bedava. Tezgâhta kullan.', 'งานโต๊ะช่างฟรีหนึ่งงาน ใช้ที่โต๊ะช่าง', type='freeBench')
TK('token', 'pre', 'coins', 5, 'Queue Ticket', 'Sıra Fişi', 'บัตรคิว', 'You choose the Special for the next spin.', 'Sonraki çevirişin Gözdesini sen seçersin.', 'เลือกเมนูเด็ดของตาถัดไปเอง', type='pickFav')
TK('horn', 'pre', 'coins', 5, 'Tuk-tuk Horn', 'Tuk-tuk Kornası', 'แตรตุ๊กตุ๊ก', 'All pattern mults +2 on the next spin.', 'Sonraki çevirişte tüm desen çarpanları +2.', 'ตาถัดไปตัวคูณทุกลาย +2', type='patMult', n=2, scope='spin')
TK('hand_mirror', 'post', 'coins', 4, 'Pocket Mirror', 'Cep Aynası', 'กระจกพกพา', 'Copy one cell onto a cell next to it.', 'Bir hücreyi yanındaki hücreye kopyala.', 'คัดลอกหนึ่งช่องไปยังช่องข้างเคียง', type='copyAdjacent')
TK('loan_note', 'any', 'coins', 0, 'IOU Slip', 'Borç Senedi', 'ใบยืมเงิน', 'Gain coins equal to 15% of this debt now. The next debt is 10% larger.', "Hemen bu borcun %15'i kadar para al. Sıradaki borç %10 büyür.", 'รับเหรียญ 15% ของหนี้นี้ทันที หนี้ถัดไปเพิ่ม 10%', type='loan', gainPct=15, nextDebtPct=10)
TK('salt', 'any', 'wick', 4, 'Cold Towel', 'Soğuk Havlu', 'ผ้าเย็น', 'Your curses do nothing for the rest of this round.', 'Lanetlerin bu elin sonuna kadar etkisiz kalır.', 'คำสาปทั้งหมดไม่มีผลจนจบรอบนี้', type='muteCurses', scope='round')
TK('spare_candle', 'auto', 'wick', 6, 'Late Pass', 'Mühlet', 'ขอผ่อนผัน', 'If you miss a deadline, this burns and you get 1 extra round.', 'Vadeyi kaçırırsan bu yanar ve 1 ek el kazanırsın.', 'ถ้าจ่ายไม่ทัน ใบนี้จะไหม้แล้วได้เพิ่ม 1 รอบ', type='saveDeadline')

# ---------- stakes ("terms" cards on screen; the word stake is never shown) ----------
stakes = []
def ST(i, icon, spins, w, minDebt, en, tr, th, *effects):
    assert icon in ICONS, icon
    tx = {}
    for l in L:
        parts = [T('%d spins', '%d çeviriş', '%d ตา')[l] % spins] + [eff(e, l) for e in effects]
        tx[l] = '. '.join(p[0].upper() + p[1:] for p in parts) + '.' if l != 'th' else ' '.join(parts)
    stakes.append(dict(id=i, name=T(en, tr, th), icon=icon, spins=spins, weight=w, minDebt=minDebt, effects=list(effects), text=tx))
ST('steady', 'stake/steady', 5, 10, 1, 'Regular Night', 'Normal Gece', 'คืนปกติ')
ST('short_fuse', 'stake/short', 3, 8, 1, 'Rush Hour', 'Yoğun Saat', 'ชั่วโมงเร่งด่วน', E('allMult', 2, scope='round'))
ST('wick_run', 'stake/wick', 3, 8, 1, 'Cap Hunt', 'Kapak Avı', 'ล่าฝาขวด', E('wick', 6))
ST('long_night', 'stake/long', 6, 8, 1, 'Smoky Night', 'Dumanlı Gece', 'คืนควันคลุ้ง', F('ashBase', 3))
ST('lucky_draw', 'stake/luck', 4, 8, 1, 'Lucky Night', 'Şanslı Gece', 'คืนดวงดี', E('luck', 3, scope='round'))
ST('two_faces', 'stake/double', 5, 6, 2, 'Big Orders Only', 'Sadece Büyük Sipariş', 'รับแต่ออเดอร์ใหญ่', F('smallDead'), F('bigX', 2))
ST('market_night', 'stake/shop', 4, 6, 1, 'Market Night', 'Pazar Gecesi', 'คืนตลาดนัด', F('shopExtra'))
ST('cold_iron', 'stake/cold', 5, 6, 2, 'Mild, Please', 'Acısız Olsun', 'ไม่เผ็ดนะ', F('noStoke'), E('interest', 5, scope='round'))
ST('wild_night', 'stake/wild', 4, 6, 2, 'Glow Night', 'Işıltı Gecesi', 'คืนหิ่งห้อย', E('weight', 4, sym='wisp', scope='round'))
ST('hot_coals', 'ui/heat', 5, 6, 2, 'Extra Spicy', 'Ekstra Acı', 'เผ็ดพิเศษ', E('heat', 4), F('heatNoCool'))
ST('bank_holiday', 'ui/btn_bank', 4, 5, 3, "Collector's Day Off", 'Tahsildarın İzni', 'คนทวงหนี้หยุด', F('bankX', 1.6))
ST('mirror_night', 'trick/hand_mirror', 4, 5, 3, 'Encore Night', 'Tekrar Gecesi', 'คืนขอซ้ำ', F('lastTwice'))

# ---------- contracts ----------
BASE = [80, 280, 1000, 3500, 12000, 40000, 145000, 550000, 2100000]
contracts = []
def CT(n, en, tr, th, debts, mul, wax, *effects, ending=None):
    tx = {l: ('; '.join(eff(e, l) for e in effects) or T('No extra rules', 'Ek kural yok', 'ไม่มีกฎเพิ่ม')[l]) for l in L}
    tx = {l: v[0].upper() + v[1:] + ('' if l == 'th' else '.') for l, v in tx.items()}
    contracts.append(dict(id='c%d' % n, tier=n, name=T(en, tr, th), debts=[round(BASE[i] * mul) for i in range(debts)], rounds=3, debtMul=mul, rewardWax=wax,
                          unlockAfter=('c%d' % (n - 1)) if n > 1 else None, rules=list(effects), ending=ending, text=tx))
CT(1, 'The Soi Cart', 'Sokak Arabası', 'รถเข็นในซอย', 5, 1, 20, F('shopOffers', 3), F('scorchBurn', 10))
CT(2, 'Train Market', 'Tren Pazarı', 'ตลาดรถไฟ', 6, 0.5, 30)
CT(3, 'Yaowarat', 'Yaowarat', 'เยาวราช', 8, 0.85, 50, ending='paid_in_full')
CT(4, 'Chatuchak Weekend', 'Chatuchak Hafta Sonu', 'จตุจักรวันหยุด', 8, 1, 60, F('spinsLess', 1))
CT(5, 'Hua Hin Low Season', 'Hua Hin Ölü Sezon', 'หัวหินหน้าโลว์', 8, 1.25, 70, F('interestHalf'))
CT(6, 'Chiang Mai Haze', 'Chiang Mai Dumanı', 'หมอกควันเชียงใหม่', 8, 1.1, 80, F('ashBase', 2), F('scorchBurn', 30))
CT(7, 'Phuket Beach Club', 'Phuket Plaj Kulübü', 'บีชคลับภูเก็ต', 8, 1.5, 100, F('startCurses', 1), ending='bought_the_machine')
CT(8, 'Riverside Boutique', 'Nehir Kıyısı Butik', 'บูติกริมเจ้าพระยา', 8, 1.5, 120, F('shopOffers', 3), F('rerollDouble'))
CT(9, 'Sukhumvit Condo Launch', 'Sukhumvit Rezidans Açılışı', 'เปิดตัวคอนโดสุขุมวิท', 8, 1.5, 150, F('rounds', 2))
CT(10, 'The Sky Bar', 'Gökyüzü Barı', 'สกายบาร์', 9, 1.2, 250, F('startCurses', 2), F('mustSign'), ending='new_management')
contracts[8]['rounds'] = 2
contracts[0]['rounds'] = 2
contracts[0]['debts'] = [70, 120, 250, 500, 1000]  # the starter contract is an on-ramp; v3 retune by sim-quick (AUDIT2 critic: debt 1 was the wall)
contracts[2]['debts'] = [68, 238, 800, 2500, 7500, 22000, 70000, 220000]  # flattens the debt 5-6 wall of the 0.85 curve
BOSSES = [
    ('auditor', 'The City Warden', 'Zabıta', 'เทศกิจ', F('smallHalf')),
    ('collector', 'The Rent Collector', 'Kira Tahsildarı', 'คนเก็บค่าเช่า', F('ashBase', 3)),
    ('veiled_clerk', 'The Man in Shades', 'Siyah Gözlüklü Adam', 'ชายใส่แว่นดำ', F('hideFav')),
    ('miser', 'The Landlord', 'Ev Sahibi', 'เจ้าของตึก', F('noInterest')),
    ('timekeeper', 'The Night Watchman', 'Gece Bekçisi', 'ยามกะดึก', F('spinsLess', 1)),
    ('head_inspector', 'The Chief Warden', 'Zabıta Amiri', 'หัวหน้าเทศกิจ', F('smallDead')),
]
bosses = []
for i, en, tr, th, *effects in BOSSES:
    tx = {l: '; '.join(eff(e, l) for e in effects) for l in L}
    bosses.append(dict(id=i, name=T(en, tr, th), effects=list(effects), text={l: v[0].upper() + v[1:] + ('' if l == 'th' else '.') for l, v in tx.items()}))
for c in contracts:
    k = c['tier'] - 1
    a, b = BOSSES[k % 5][0], BOSSES[(k + 3) % 6][0]
    if a == b: b = BOSSES[5][0]
    c['bosses'] = [dict(debt=2, boss=a), dict(debt=len(c['debts']) - 1, boss=b)]

# ---------- characters ----------
chars = []
def CH(i, en, tr, th, unlock, start, d_en, d_tr, d_th, *rules):
    assert 'char/' + i in ICONS
    chars.append(dict(id=i, name=T(en, tr, th), icon='char/' + i, unlock=unlock, start=start, rules=list(rules), text=T(d_en, d_tr, d_th)))
CH('nim', 'Nim', 'Nim', 'นิ่ม', None, dict(wick=3, tricks=['nudge'], charms=[], curses=0, slots=5),
   'The cart girl. +1 Luck. Starts with a Nudge.', 'Araba kızı. +1 Şans. Bir Dürtme ile başlar.', 'สาวขายของรถเข็น โชค +1 เริ่มพร้อมสะกิดหนึ่งชิ้น', R(P, None, E('luck', 1)))
CH('tao', 'Tao', 'Tao', 'เต๋า', 'ach:contract_1', dict(wick=3, tricks=['chili'], charms=['matchbox'], curses=0, slots=5),
   "Nim's brother. He was at the burner. Every round starts at Spice 3 and each Spice level pays +20%.", "Nim'in kardeşi. Ocağın başındaydı. Her el Acı 3 ile başlar, her Acı seviyesi +%20 öder.", 'พี่ชายของนิ่ม คนที่ยืนอยู่ข้างเตา ทุกรอบเริ่มที่เผ็ด 3 และเผ็ดแต่ละระดับจ่าย +20%', R(P, None, F('startHeat', 3), F('heatStep', 20)))
CH('bua', 'Auntie Bua', 'Bua Teyze', 'ป้าบัว', 'ach:reach_debt_6', dict(wick=3, tricks=['wish_coin'], charms=[], curses=0, slots=4),
   'The market auntie. Knows what sells tonight. She picks the Special on the first spin of each round. One charm slot fewer.', 'Pazar teyzesi. Bu gece neyin satacağını bilir. Her elin ilk çevirişinde Gözdeyi o seçer. Bir tılsım yuvası eksik.', 'ป้าแม่ค้าตลาด รู้ว่าคืนนี้อะไรขายดี เลือกเมนูเด็ดเองในตาแรกของทุกรอบ ช่องไอเท็มน้อยลงหนึ่ง', R(P, None, F('pickFirstFav')))
CH('rattle', 'Coach Daeng', 'Koç Daeng', 'ครูแดง', 'ach:curses_4', dict(wick=3, tricks=['salt'], charms=[], curses=1, slots=5),
   'Old Muay Thai cornerman. Takes a hit, gives two. Starts with one curse. Every curse gives all symbols +0.25 mult. Sticky Rice value +3.', 'Yaşlı Muay Thai köşe adamı. Bir darbe alır, iki verir. Bir lanetle başlar. Her lanet tüm sembollere +0.25 çarpan verir. Yapışkan Pirinç değeri +3.', 'พี่เลี้ยงมวยรุ่นเก๋า โดนหนึ่งตอบสอง เริ่มพร้อมคำสาปหนึ่งอย่าง คำสาปแต่ละอย่างให้ตัวคูณทุกสัญลักษณ์ +0.25 ค่าข้าวเหนียว +3', R(P, None, E('symMult', 0.25, sym='all', per='curses'), E('symValue', 3, sym='tooth')))
CH('sok', 'Uncle Heng', 'Heng Amca', 'เฮียเฮง', 'ach:interest_total', dict(wick=0, tricks=[], charms=['abacus'], curses=0, slots=5),
   'Runs a Yaowarat pawnshop. Interest +5%. Sells charms for the full price. Starts with no Caps.', "Yaowarat'ta rehinci dükkânı işletir. Faiz +5 puan. Tılsımları tam fiyatına satar. Kapaksız başlar.", 'เจ้าของโรงรับจำนำเยาวราช ดอกเบี้ย +5% ขายไอเท็มได้เต็มราคา เริ่มโดยไม่มีฝาขวด', R(P, None, E('interest', 5), F('sellFull')))
CH('pip', 'Pip', 'Pip', 'ปิ๊บ', 'ach:contract_3', dict(wick=5, tricks=['loan_note'], charms=[], curses=1, slots=6),
   "Ruby's nephew. Six charm slots and three deals to choose from, but he starts with one curse.", "Ruby'nin yeğeni. Altı tılsım yuvası ve üç anlaşma seçeneği var, ama bir lanetle başlar.", 'หลานชายของรูบี้ มีช่องไอเท็มหกช่องและข้อตกลงให้เลือกสามข้อ แต่เริ่มพร้อมคำสาปหนึ่งอย่าง', R(P, None, F('dealOffers', 3)))

# ---------- hideout ----------
hide = []
def H(i, cost, en, tr, th, d_en, d_tr, d_th, **effect):
    assert 'hide/' + i in ICONS
    hide.append(dict(id=i, name=T(en, tr, th), icon='hide/' + i, costWax=cost, order=len(hide) + 1, effect=effect, text=T(d_en, d_tr, d_th)))
H('cot', 0, 'Cot Behind the Cart', 'Araba Arkası Yatak', 'เตียงพับหลังรถเข็น', 'Somewhere to sleep. Yours from the start.', 'Uyuyacak bir yer. Baştan beri senin.', 'ที่ซุกหัวนอน เป็นของคุณตั้งแต่แรก', type='none')
H('stove', 25, 'Gas Burner', 'Tüplü Ocak', 'เตาแก๊ส', 'Start each run with one extra random trick.', 'Her oyuna fazladan bir rastgele numarayla başla.', 'เริ่มเกมทุกครั้งพร้อมกลเม็ดสุ่มเพิ่มหนึ่งชิ้น', type='startTrick', n=1)
H('shelf', 40, 'Plastic Shelf', 'Plastik Raf', 'ชั้นพลาสติก', 'At run start, pick 1 of 3 common charms.', 'Oyun başında 3 sıradan tılsımdan 1 tanesini seç.', 'ตอนเริ่มเกม เลือกไอเท็มธรรมดา 1 จาก 3 ชิ้น', type='startCharmPick', n=3)
H('lights', 60, 'String Lights', 'Ampul Zinciri', 'ไฟประดับ', 'The shop shows 5 charms instead of 4.', 'Dükkân 4 yerine 5 tılsım gösterir.', 'ร้านแสดงไอเท็ม 5 ชิ้นแทน 4', type='shopOffers', n=5)
H('workbench', 80, 'Motorbike Bench', 'Motor Tezgâhı', 'โต๊ะช่างมอไซค์', 'The bench offers 3 jobs instead of 2.', 'Tezgâh 2 yerine 3 iş sunar.', 'โต๊ะช่างมีงานให้เลือก 3 งานแทน 2', type='benchOffers', n=3)
H('desk', 100, 'Laptop Desk', 'Laptop Masası', 'โต๊ะโน้ตบุ๊ก', 'You see the next debt and its deals one debt early. One free reroll in every shop.', 'Sıradaki borcu ve anlaşmalarını bir borç önceden görürsün. Her dükkânda bir bedava yenileme.', 'เห็นหนี้ถัดไปและข้อตกลงล่วงหน้าหนึ่งหนี้ สุ่มร้านใหม่ฟรีหนึ่งครั้งทุกร้าน', type='foresight', freeRerolls=1)
H('keepsake', 120, 'Biscuit Tin', 'Bisküvi Kutusu', 'กระป๋องคุกกี้', 'After a run, keep one common or uncommon charm. It is offered at the start of your next run.', 'Oyun bitince sıradan ya da nadir bir tılsımı sakla. Sonraki oyunun başında sana sunulur.', 'จบเกมแล้วเก็บไอเท็มธรรมดาหรือหายากไว้หนึ่งชิ้น จะถูกเสนอให้ตอนเริ่มเกมถัดไป', type='keepCharm')
H('moth_house', 150, 'Cooler Box', 'Buzluk', 'กระติกน้ำแข็ง', 'Start each run with +3 Caps.', 'Her oyuna +3 Kapak ile başla.', 'เริ่มเกมทุกครั้งพร้อม +3 ฝาขวด', type='startWick', n=3)
H('mirror', 200, 'Karaoke Set', 'Karaoke Seti', 'ชุดคาราโอเกะ', 'Play any run from a seed code and share yours.', 'Herhangi bir oyunu tohum koduyla oyna, kendi kodunu paylaş.', 'เล่นเกมจากรหัสซี้ดได้ และแชร์รหัสของตัวเอง', type='seededRuns')
H('chair', 300, "Ruby's Massage Chair", "Ruby'nin Masaj Koltuğu", 'เก้าอี้นวดของรูบี้', 'He visits. Refusing a deal gives +5 Caps instead of +3, and he tells you things.', 'Ziyarete gelir. Anlaşmayı reddetmek +3 yerine +5 Kapak verir, bir şeyler de anlatır.', 'เขาแวะมาเยี่ยม ปฏิเสธข้อตกลงได้ +5 ฝาขวดแทน +3 และเขาจะเล่าอะไรให้ฟัง', type='refuseWick', n=5, story=True)

# ---------- achievements ----------
STAT = {
    'debtsPaid': T('Pay {n} debts', '{n} borç öde', 'ปลดหนี้ {n} ก้อน'),
    'contract': T('Clear contract {n}', '{n}. sözleşmeyi bitir', 'จบสัญญาที่ {n}'),
    'reachDebt': T('Reach debt {n} in any contract', 'Herhangi bir sözleşmede {n}. borca ulaş', 'ไปถึงหนี้ก้อนที่ {n} ในสัญญาใดก็ได้'),
    'pattern:full': T('Score a Full Market {n} time', '{n} kez Tam Pazar yap', 'ทำเต็มตลาด {n} ครั้ง'),
    'pattern:cross': T('Score a Cross {n} time', '{n} kez Artı yap', 'ทำกากบาท {n} ครั้ง'),
    'pattern:vee': T('Score {n} Vees', '{n} V Yolu yap', 'ทำทางตัววี {n} ครั้ง'),
    'pattern:frame': T('Score a Frame {n} time', '{n} kez Çerçeve yap', 'ทำกรอบ {n} ครั้ง'),
    'patternsOneSpin': T('Score {n} patterns in one spin', 'Tek çevirişte {n} desen yap', 'ทำ {n} ลายในตาเดียว'),
    'spinCoins': T('Win {n} coins in one spin', 'Tek çevirişte {n} para kazan', 'ได้ {n} เหรียญในตาเดียว'),
    'heat10Spins': T('Spin {n} times at Spice 10', 'Acı 10 iken {n} kez çevir', 'หมุน {n} ตาที่เผ็ด 10'),
    'scorches': T('Survive {n} Flare-ups', '{n} Parlama atlat', 'รอดจากไฟลุก {n} ครั้ง'),
    'cursesHeld': T('Pay a debt while carrying {n} curses', '{n} lanet taşırken bir borç öde', 'ปลดหนี้ขณะมีคำสาป {n} อย่าง'),
    'dealsSigned': T('Sign {n} deals', '{n} anlaşma imzala', 'เซ็นข้อตกลง {n} ข้อ'),
    'dealsRefused': T('Refuse {n} deals', '{n} anlaşmayı reddet', 'ปฏิเสธข้อตกลง {n} ข้อ'),
    'cleanContract': T('Clear a contract without signing a deal', 'Hiç anlaşma imzalamadan bir sözleşme bitir', 'จบสัญญาโดยไม่เซ็นข้อตกลงเลย'),
    'interestTotal': T('Earn {n} coins of interest in total', 'Toplam {n} para faiz kazan', 'ได้ดอกเบี้ยรวม {n} เหรียญ'),
    'earlyPays': T('Pay {n} debts with a round to spare', '{n} borcu el artırarak öde', 'ปลดหนี้ก่อนกำหนด {n} ก้อน'),
    'exactChange': T('Pay a debt and keep 10% of it or less', "Bir borcu öde, kesende borcun en çok %10'u kalsın", 'ปลดหนี้แล้วเหลือเงินไม่เกิน 10% ของหนี้'),
    'tricksUsed': T('Use {n} tricks', '{n} numara kullan', 'ใช้กลเม็ด {n} ครั้ง'),
    'tricksOneSpin': T('Use {n} tricks on one spin', 'Tek çevirişte {n} numara kullan', 'ใช้กลเม็ด {n} ครั้งในตาเดียว'),
    'symbolsRemoved': T('Remove {n} symbols from the machine', 'Makineden {n} sembol çıkar', 'ถอดสัญลักษณ์ออกจากเครื่อง {n} ชนิด'),
    'wispsOneSpin': T('Land {n} Fireflies in one spin', 'Tek çevirişte {n} Ateşböceği indir', 'ได้หิ่งห้อย {n} ตัวในตาเดียว'),
    'luckReached': T('Reach {n} Luck', '{n} Şansa ulaş', 'โชคถึง {n}'),
    'favPatterns': T('Score {n} patterns of the Special', 'Gözde ile {n} desen yap', 'ทำลายด้วยเมนูเด็ด {n} ครั้ง'),
    'crownPatterns': T('Score {n} Gold Bar patterns', '{n} Külçe Altın deseni yap', 'ทำลายทองคำแท่ง {n} ครั้ง'),
    'charmsBought': T('Buy {n} charms', '{n} tılsım al', 'ซื้อไอเท็ม {n} ชิ้น'),
    'charmsSold': T('Sell {n} charms', '{n} tılsım sat', 'ขายไอเท็ม {n} ชิ้น'),
    'dailyRuns': T('Finish {n} daily runs', '{n} günlük oyun bitir', 'เล่นเกมประจำวันจบ {n} ครั้ง'),
    'charWins': T('Clear a contract with {n} different characters', '{n} farklı karakterle sözleşme bitir', 'จบสัญญาด้วยตัวละคร {n} ตัว'),
    'familyFull': T('Hold {n} charms of one family', 'Aynı aileden {n} tılsım taşı', 'ถือไอเท็มตระกูลเดียวกัน {n} ชิ้น'),
    'hideout': T('Build {n} home pieces', 'Eve {n} eşya koy', 'สร้างของในบ้าน {n} ชิ้น'),
}
ach = []
CID = {c['id']: c for c in charms}; CHID = {c['id'] for c in chars}
def A(i, stat, n, en, tr, th, **reward):
    if 'charm' in reward:
        assert CID[reward['charm']]['unlock'] is None, reward
        CID[reward['charm']]['unlock'] = 'ach:' + i
    if 'char' in reward: assert reward['char'] in CHID
    ach.append(dict(id=i, name=T(en, tr, th), cond=dict(stat=stat, gte=n), reward=reward,
                    text={l: STAT[stat][l].replace('{n}', format(n, ',')) + ('' if l == 'th' else '.') for l in L}))
A('first_debt', 'debtsPaid', 1, 'First Instalment', 'İlk Taksit', 'งวดแรก', wax=5)
A('debts_50', 'debtsPaid', 50, 'Regular Customer', 'Müdavim', 'ขาประจำ', wax=40)
A('contract_1', 'contract', 1, 'Off the Soi', 'Sokaktan Çıkış', 'พ้นซอย', char='tao')
A('contract_2', 'contract', 2, 'Market Regular', 'Pazarın Demirbaşı', 'ขาประจำตลาดรถไฟ', charm='small_fry_union')
A('contract_3', 'contract', 3, 'Chinatown Gold', 'Çin Mahallesi Altını', 'ทองเยาวราช', char='pip')
A('contract_4', 'contract', 4, 'Weekend Rush', 'Hafta Sonu Akını', 'ลุยจตุจักร', charm='powder_trail')
A('contract_5', 'contract', 5, 'Low Season Hero', 'Ölü Sezon Kahramanı', 'ฮีโร่หน้าโลว์', charm='compound_tooth')
A('contract_6', 'contract', 6, 'Through the Haze', 'Dumanın İçinden', 'ไนท์บาซาร์ในหมอก', charm='scapegoat_bell')
A('contract_7', 'contract', 7, 'Sand in the Books', 'Defterde Kum', 'ทรายในบัญชี', charm='blood_ink')
A('contract_8', 'contract', 8, 'River View', 'Nehir Manzarası', 'วิวแม่น้ำ', charm='fair_tapestry')
A('contract_9', 'contract', 9, 'Keys to the Condo', 'Dairenin Anahtarı', 'ได้กุญแจคอนโด', charm='paper_king')
A('contract_10', 'contract', 10, 'Top of the City', 'Şehrin Tepesi', 'บนยอดเมือง', wax=200)
A('reach_debt_6', 'reachDebt', 6, 'In Over My Head', 'Boğazıma Kadar', 'หนี้ท่วมหัว', char='bua')
A('full_fair', 'pattern:full', 1, 'The Whole Market', 'Bütün Pazar', 'เหมาทั้งตลาด', charm='dust_queen')
A('cross_1', 'pattern:cross', 1, 'Crossroads', 'Kavşak', 'สี่แยก', charm='crooked_loom')
A('vee_5', 'pattern:vee', 5, 'Down and Up', 'İn Çık', 'ลงแล้วขึ้น', charm='master_stitch')
A('frame_1', 'pattern:frame', 1, 'Photo Frame', 'Fotoğraf Çerçevesi', 'กรอบรูป', wax=30)
A('six_patterns', 'patternsOneSpin', 6, 'Busy Night', 'Yoğun Gece', 'คืนขายดี', charm='ghost_parade')
A('spin_1k', 'spinCoins', 1000, 'Big Spin', 'Büyük Tur', 'หมุนใหญ่', charm='furnace_heart')
A('spin_100k', 'spinCoins', 100000, 'Absurd Spin', 'Akıl Almaz Tur', 'หมุนเวอร์', wax=50)
A('heat_10', 'heat10Spins', 10, 'Max Spice', 'Son Derece Acı', 'เผ็ดสุดขีด', charm='fire_eater')
A('scorch_10', 'scorches', 10, 'Well Done', 'İyi Pişmiş', 'สุกเกิน', charm='martyr_splinter')
A('curses_4', 'cursesHeld', 4, 'Rainy Season', 'Yağmur Mevsimi', 'หน้าฝน', char='rattle')
A('curses_8', 'cursesHeld', 8, 'Storm Chaser', 'Fırtına Avcısı', 'นักล่าพายุ', charm='cracked_mirror')
A('deals_10', 'dealsSigned', 10, 'Repeat Signer', 'Seri İmzacı', 'เซ็นไม่หยุด', charm='firm_handshake')
A('refuse_10', 'dealsRefused', 10, 'No, Thank You', 'Yok, Sağ Ol', 'ไม่เอาดีกว่า', charm='cosigner')
A('clean_contract', 'cleanContract', 1, 'Clean Hands', 'Temiz Eller', 'มือสะอาด', charm='fixed_star')
A('interest_total', 'interestTotal', 5000, 'Money Makes Money', 'Para Parayı Çeker', 'เงินต่อเงิน', char='sok')
A('early_10', 'earlyPays', 10, 'Ahead of Schedule', 'Vaktinden Önce', 'ก่อนกำหนด', charm='brass_goose')
A('exact_change', 'exactChange', 1, 'To the Last Coin', 'Kuruşu Kuruşuna', 'ไม่ขาดสักบาท', charm='dividend_slip')
A('tricks_50', 'tricksUsed', 50, 'Quick Hands', 'Çabuk Eller', 'มือไว', charm='tuned_gears')
A('tricks_3', 'tricksOneSpin', 3, 'Triple Play', 'Üçlü Hamle', 'สามจังหวะ', charm='clockwork_thumb')
A('removed_5', 'symbolsRemoved', 5, 'Less Is More', 'Az Çoktur', 'น้อยแต่มาก', charm='scrap_heap')
A('wisps_5', 'wispsOneSpin', 5, 'Firefly Tree', 'Ateşböceği Ağacı', 'ต้นหิ่งห้อย', charm='green_dawn')
A('luck_12', 'luckReached', 12, 'Born Lucky', 'Şanslı Doğmuş', 'ดวงเฮงสุดๆ', charm='twin_stars')
A('fav_100', 'favPatterns', 100, 'House Special', 'Evin Gözdesi', 'เมนูเด็ดประจำร้าน', charm='second_sight')
A('crown_20', 'crownPatterns', 20, 'Gold Habit', 'Altın Merakı', 'ติดทอง', charm='throne')
A('family_5', 'familyFull', 5, 'Family Business', 'Aile İşi', 'ธุรกิจครอบครัว', charm='coronation')
A('bought_100', 'charmsBought', 100, 'Hoarder', 'İstifçi', 'นักกักตุน', charm='paupers_parade')
A('sold_30', 'charmsSold', 30, 'Pawnshop Regular', 'Rehinci Müdavimi', 'ขาประจำโรงรับจำนำ', charm='changeling')
A('daily_7', 'dailyRuns', 7, 'Seven Nights', 'Yedi Gece', 'เจ็ดคืน', wax=50)
A('char_wins_6', 'charWins', 6, 'The Whole Soi', 'Bütün Sokak', 'ทั้งซอย', wax=300)
A('hideout_10', 'hideout', 10, 'Penthouse', 'Çatı Katı', 'เพนต์เฮาส์', wax=100)

# ---------- skip a night: the reward the terms screen offers instead of spinning ----------
SKIP = []
for i, *effects in [('skip_wick', E('wick', 6)), ('skip_rare', E('gainCharm', rarity='rare')), ('skip_tricks', E('trick', 3))]:
    SKIP.append(dict(id=i, effects=list(effects), text={l: ', '.join(eff(e, l) for e in effects) for l in L}))

# ---------- config ----------
config = dict(
    grid=dict(cols=5, rows=3),
    luck=dict(base=3, cap=12, favouredWeightMul='1 + luck', dudPity=1),
    heat=dict(max=10, payoutPerLevel=0.25, ashWeightPerLevel=2.25, coolAtRoundStart=2, scorchAsh=3, scorchBurnPct=20, scorchHeatDrop=3),
    interest=dict(basePct=8, capPctOfDebt=20),
    earlyPay=dict(wickPerUnusedRound=2, trickPerDebt=1, spinsPerUnusedRound=6, shopPerUnusedRound=1),
    priceDebtDiv=70, coinPow=0.6,
    endless=dict(growth=4),
    skip=dict(rewards=SKIP),
    start=dict(coins=0, wick=3, charmSlots=5, charmSlotsMax=8, trickPockets=3, removedSymbolsMax=3),
    shop=dict(charmOffers=4, trickOffers=2, benchOffers=2, rerollBase=2, rerollStep=1, locks=1, sellPct=50, familyBias=2.5,
              rarityOdds=[dict(fromDebt=1, common=62, uncommon=30, rare=8, legendary=0), dict(fromDebt=3, common=50, uncommon=32, rare=15, legendary=3),
                          dict(fromDebt=6, common=38, uncommon=34, rare=21, legendary=7)],
              slotPriceWick=10),
    bench=[dict(id='polish', effect=dict(type='symValue', n=1), price=dict(coins=6), name=T('Polish', 'Cilala', 'ขัดเงา'), text=T('One symbol: value +1.', 'Bir sembol: değer +1.', 'สัญลักษณ์หนึ่งชนิด: ค่า +1')),
           dict(id='weigh', effect=dict(type='weight', n=1.3), price=dict(coins=5), name=T('Stock Up', 'Stokla', 'ตุนของ'), text=T('One symbol: weight +30%.', 'Bir sembol: ağırlık +%30.', 'สัญลักษณ์หนึ่งชนิด: น้ำหนัก +30%')),
           dict(id='gild', effect=dict(type='symMult', n=0.25), price=dict(wick=4), name=T('Upgrade', 'Yükselt', 'อัปเกรด'), text=T('One symbol: mult +0.25.', 'Bir sembol: çarpan +0.25.', 'สัญลักษณ์หนึ่งชนิด: ตัวคูณ +0.25')),
           dict(id='purge', effect=dict(type='removeSymbol', n=1), price=dict(wick=6), name=T('Pull Out', 'Çıkar', 'ดึงออก'), text=T('Remove one symbol from the machine for this run.', 'Bir sembolü bu oyun için makineden çıkar.', 'ถอดสัญลักษณ์หนึ่งชนิดออกจากเครื่องตลอดเกมนี้')),
           dict(id='lift', effect=dict(type='removeCurse', n=1), price=dict(wick=8), name=T('Lift a Curse', 'Laneti Kaldır', 'ปลดคำสาป'), text=T('Remove one curse of your choice.', 'Seçtiğin bir laneti kaldır.', 'ถอนคำสาปที่เลือกหนึ่งอย่าง'))],
    deals=dict(offers=2, refuseWick=3),
    bosses=bosses,
    symValueUpAtDebt=[3, 6],
    wax=dict(perDebtPaid=3, dailyRun=10),
    ads=dict(interstitialMinSeconds=180, interstitialOnlyAfterRun=True, rewardedPerDay=6, rewardedGrants=['shop_reroll', 'double_wax']),
    endings=[dict(id='paid_in_full', contract='c3', cond=None), dict(id='bought_the_machine', contract='c7', cond='dealsSigned == 0'), dict(id='new_management', contract='c10', cond='curses >= 5')],
    families=[dict(id=k, name=v) for k, v in FAM.items()],
)

# ---------- v3 content (scripts/v3/*.py run in this namespace; they rebind eff, when and per so text() composes the v3 primitives) ----------
_V3 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v3')
for _part in ('art', 'text', 'charms', 'spirits', 'meta1', 'progress', 'meta2'):
    exec(compile(open(os.path.join(_V3, _part + '.py'), encoding='utf-8').read(), _part + '.py', 'exec'), globals())
spirits_file = dict(group=T('Neighbours', 'Komşular', 'เพื่อนบ้าน'), terms=dict(favour=FAVOUR, tip=T('Tip', 'Bahşiş', 'ทิป'), gossip=omens_file['labels']['omen'], errand=omens_file['labels']['demand'],
                    regular=T('Regular', 'Müdavim', 'ขาประจำ')),
                    devotion=[dict(tier=1, cost=30, stat='noticed', n=1, text=T('Start every run with +1 Favour with this neighbour.', 'Her oyuna bu komşuyla +1 Hatırla başla.', 'เริ่มทุกรอบด้วยน้ำใจกับเพื่อนบ้านคนนี้ +1'), reqText=T('Get this neighbour to Noticed once.', 'Bu komşuyu bir kez Tanıdı seviyesine getir.', 'ทำให้เพื่อนบ้านคนนี้ถึงขั้นจำหน้าได้หนึ่งครั้ง')),
                              dict(tier=2, cost=60, stat='friend', n=3, text=T('Their taste is always visible, and their gossip shows on their call card.', 'Zevki hep görünür, dedikodusu arama kartında çıkar.', 'รสนิยมของเขามองเห็นเสมอ และข่าวแผงของเขาโชว์บนการ์ดโทรศัพท์'), reqText=T('Get this neighbour to Friend 3 times.', 'Bu komşuyu 3 kez Dost seviyesine getir.', 'ทำให้เพื่อนบ้านคนนี้ถึงขั้นเพื่อน 3 ครั้ง')),
                              dict(tier=3, cost=100, stat='patron', n=2, text=T('The price of their red card shows before you tap it.', 'Kırmızı kartının bedeli dokunmadan görünür.', 'ราคาของการ์ดแดงของเขาโชว์ก่อนแตะ'), reqText=T('Get this neighbour to Regular 2 times.', 'Bu komşuyu 2 kez Müdavim seviyesine getir.', 'ทำให้เพื่อนบ้านคนนี้เป็นขาประจำ 2 ครั้ง'))],
                    spirits=SP)
V3FILES = [('spirits', spirits_file), ('curses_v3', dict(curses=curses3)), ('charms_v3', dict(charms=charms3)), ('fusion', fusion), ('symbols_v3', dict(symbols=symbols3)),
           ('omens', omens_file), ('tips', tips), ('calls', calls), ('codex', codex), ('places', places_file), ('characters_v3', chars_file), ('notebook', notebook),
           ('lessons', lessons_file), ('lockers', lockers_file), ('postcards', postcards_file), ('milestones', dict(milestones=milestones)), ('storm', storm_file),
           ('goals', goals), ('endings', endings), ('achievements_v3', dict(achievements=ach3)), ('cart_upgrades', cart_file), ('stats', stats_file)]
assert len(SP) == 8 and len(charms3) == 48 and len(curses3) == 6 and len(fusion['recipes']) == 24 and len(postcards) == 18 and len(milestones) == 14 and len(storm) == 10

# ---------- checks and write ----------
assert len(charms) >= 115 and len(bosses) == 6 and len(deals) == 24 and len(curses) == 16 and len(tricks) == 20 and len(stakes) == 12
assert len(contracts) == 10 and len(chars) == 6 and len(hide) == 10 and len(ach) >= 40
assert len({c['id'] for c in charms}) == len(charms)
for p in PAT:
    for cells in p['cells']: assert len(set(cells)) == len(cells) and all(0 <= x < 15 for x in cells)
for c in chars:
    assert all(t in {x['id'] for x in tricks} for t in c['start']['tricks']) and all(x in CID for x in c['start']['charms'])
    assert c['unlock'] is None or c['unlock'][4:] in {a['id'] for a in ach}
def walk(o):
    if isinstance(o, dict):
        if 'en' in o: assert set(o) == set(L) and all(o[l].strip() for l in L), o
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
for _k, _v in V3FILES: walk(_v)
files = dict(symbols=symbols, patterns=PAT, charms=charms, deals=deals, curses=curses, tricks=tricks, stakes=stakes, contracts=contracts,
             characters=chars, hideout=hide, achievements=ach, config=config)
os.makedirs(OUT, exist_ok=True)
for k, v in files.items():
    walk(v)
    with open(os.path.join(OUT, k + '.json'), 'w', encoding='utf-8', newline='\n') as f:
        if isinstance(v, list): f.write('{"%s": [\n' % k + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in v) + '\n]}\n')
        else: json.dump(v, f, ensure_ascii=False, indent=1)
    json.load(open(os.path.join(OUT, k + '.json'), encoding='utf-8'))
ART_OUT = os.path.join(os.path.dirname(os.path.abspath(sys.argv[2])), 'sheets_v3.json')
with open(ART_OUT, 'w', encoding='utf-8', newline=chr(10)) as f: json.dump(ART3, f, ensure_ascii=False, indent=1)
for k, v in V3FILES:
    with open(os.path.join(OUT, k + '.json'), 'w', encoding='utf-8', newline=chr(10)) as f: json.dump(v, f, ensure_ascii=False, indent=1)
    json.load(open(os.path.join(OUT, k + '.json'), encoding='utf-8'))
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')
print({k: len(v) for k, v in files.items()})
print('v3', {k: len(json.dumps(v)) for k, v in V3FILES})
print(Counter(c['family'] for c in charms), Counter(c['rarity'] for c in charms), 'locked', sum(1 for c in charms if c['unlock']))
print('icons used', len({c['icon'] for c in charms}), 'of', len([i for i in ICONS if i.startswith('charm/')]))
for i in (0, 5, 8, 9, 23, 37, 40, 66, 85, 103): print(charms[i]['text'])
print(deals[10]['text'], deals[23]['text'], curses[1]['text'], stakes[5]['text'], contracts[5]['text'], sep='\n')
