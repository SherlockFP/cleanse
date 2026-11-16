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
    ('moth', 1, 2, 14, 'score', 'low', 'Moth', 'Güve', 'แมลงเม่า'),
    ('candle', 1, 2, 14, 'score', 'low', 'Candle', 'Mum', 'เทียน'),
    ('tooth', 2, 3, 11, 'score', 'low', 'Tooth', 'Diş', 'ฟัน'),
    ('key', 2, 3, 11, 'score', 'low', 'Key', 'Anahtar', 'กุญแจ'),
    ('eye', 3, 4, 9, 'score', 'mid', 'Eye', 'Göz', 'ลูกตา'),
    ('mask', 3, 5, 8, 'score', 'mid', 'Mask', 'Maske', 'หน้ากาก'),
    ('crow', 4, 6, 7, 'score', 'high', 'Crow', 'Karga', 'อีกา'),
    ('lantern', 4, 8, 5, 'score', 'high', 'Lantern', 'Fener', 'โคม'),
    ('crown', 5, 12, 3, 'score', 'high', 'Crown', 'Taç', 'มงกุฎ'),
    ('wisp', 0, 0, 2, 'wild', None, 'Wisp', 'Cin Ateşi', 'ผีโขมด'),
    ('sigil', 0, 0, 2, 'sigil', None, 'Sigil', 'Mühür', 'ตราปีศาจ'),
    ('ash', 0, 0, 0, 'ash', None, 'Ash', 'Kül', 'เถ้า'),
]
SN = {s[0]: T(*s[6:]) for s in SYM}
SN.update(low=T('low symbols', 'düşük semboller', 'สัญลักษณ์ต่ำ'), high=T('high symbols', 'yüksek semboller', 'สัญลักษณ์สูง'),
          all=T('all symbols', 'tüm semboller', 'ทุกสัญลักษณ์'), favoured=T('the Favourite', 'Gözde', 'ตัวโปรด'),
          that=T('that symbol', 'o sembol', 'สัญลักษณ์นั้น'), random=T('a random symbol', 'rastgele bir sembol', 'สัญลักษณ์สุ่มหนึ่งตัว'))
RULES_TEXT = {
    'wisp': T('Wild. Stands in for any scoring symbol. A pattern needs at least one real symbol.', 'Joker. Her puan sembolünün yerine geçer. Desende en az bir gerçek sembol gerekir.', 'แทนได้ทุกสัญลักษณ์ ลายต้องมีสัญลักษณ์จริงอย่างน้อยหนึ่งตัว'),
    'sigil': T('Never matches. Each Sigil that lands gives +1 Wick. Three in one spin: a free trick.', 'Eşleşmez. İnen her Mühür +1 Fitil verir. Bir çevirişte üç tane: bedava numara.', 'ไม่จับคู่ ตราแต่ละตัวที่ตกให้ +1 ไส้เทียน ครบสามในตาเดียว: ได้กลเม็ดฟรี'),
    'ash': T('Comes only from Heat and curses. Blocks patterns. Three in one spin is a Scorch: the spin pays nothing, 10% of your purse burns, Heat −3.', 'Yalnızca Ateş ve lanetlerden gelir. Desenleri keser. Bir çevirişte üç tane Kavrulmadır: çeviriş ödemez, kesenin %10\'u yanar, Ateş −3.', 'มาจากไฟและคำสาปเท่านั้น ขวางลาย ครบสามในตาเดียวคือไหม้เกรียม: ตานั้นไม่จ่าย ถุงเงินไหม้ 10% ไฟ −3'),
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
pat('full', 25, [list(range(15))], 'Full Fair', 'Tam Panayır', 'เต็มงาน')
PN = {p['id']: p['name'] for p in PAT}
PN.update(all=T('all patterns', 'tüm desenler', 'ทุกลาย'), this=T('this pattern', 'bu desen', 'ลายนี้'),
          big=T('5+ cell patterns', '5+ hücreli desenler', 'ลาย 5 ช่องขึ้นไป'))
FAM = {
    'swarm': T('Swarm', 'Sürü', 'ฝูง'), 'ember': T('Ember', 'Köz', 'ถ่านไฟ'), 'hex': T('Hex', 'Büyü', 'อาถรรพ์'),
    'ledger': T('Ledger', 'Defter', 'สมุดบัญชี'), 'pact': T('Pact', 'Ahit', 'พันธสัญญา'), 'omen': T('Omen', 'Alamet', 'ลางบอกเหตุ'),
    'stitch': T('Stitch', 'Dikiş', 'ฝีเข็ม'), 'wisp': T('Wisp', 'Cin Ateşi', 'ผีโขมด'), 'tinker': T('Tinker', 'Tamirci', 'ช่างซ่อม'),
    'crown': T('Crown', 'Taç', 'มงกุฎ'),
}
FLAGS = {
    'heatStep': T('each Heat level pays +{v}% more', 'her Ateş seviyesi ödemeye +%{v} ekler', 'ไฟแต่ละระดับเพิ่มเงิน +{v}%'),
    'heatNoCool': T('Heat does not cool at round start', 'Ateş el başında soğumaz', 'ไฟไม่ลดตอนเริ่มรอบ'),
    'scorchNeeds': T('a Scorch needs {v} Ash', 'Kavrulma için {v} Kül gerekir', 'ต้องมีเถ้า {v} ตัวจึงไหม้เกรียม'),
    'ashIsFav': T('Ash counts as the Favourite in patterns (value 0)', 'Kül desenlerde Gözde sayılır (değeri 0)', 'เถ้านับเป็นตัวโปรดในลาย (ค่า 0)'),
    'interestCapX': T('interest cap ×{v}', 'faiz tavanı ×{v}', 'เพดานดอกเบี้ย ×{v}'),
    'shopDiscount': T('shop prices −{v}%', 'dükkân fiyatları −%{v}', 'ราคาร้าน −{v}%'),
    'shopMarkup': T('shop prices +{v}%', 'dükkân fiyatları +%{v}', 'ราคาร้าน +{v}%'),
    'dealOffers': T('Brimble offers {v} deals, not 2', 'Brimble 2 yerine {v} anlaşma sunar', 'บริมเบิลเสนอ {v} ข้อตกลงแทน 2'),
    'cancelCurse': T('that curse is cancelled', 'o lanet iptal olur', 'คำสาปนั้นถูกยกเลิก'),
    'saveDeadline': T('if you miss a deadline, this charm burns and you get 1 extra round', 'vadeyi kaçırırsan bu tılsım yanar, 1 ek el kazanırsın', 'ถ้าจ่ายไม่ทัน เครื่องรางนี้จะไหม้แล้วได้เพิ่ม 1 รอบ'),
    'seeNextFav': T("you see the next spin's Favourite", 'bir sonraki çevirişin Gözdesini görürsün', 'เห็นตัวโปรดของตาถัดไป'),
    'pickFirstFav': T('you choose the Favourite for the first spin of each round', 'her elin ilk çevirişinde Gözdeyi sen seçersin', 'เลือกตัวโปรดเองในตาแรกของทุกรอบ'),
    'twoFavs': T('each spin has two Favourites', 'her çevirişte iki Gözde olur', 'ทุกตามีตัวโปรดสองตัว'),
    'favPerRound': T('the Favourite changes only once per round', 'Gözde yalnızca elde bir kez değişir', 'ตัวโปรดเปลี่ยนแค่รอบละครั้ง'),
    'fiveNeedsFour': T('5-cell patterns need only 4 matching cells', '5 hücreli desenlere 4 eş hücre yeter', 'ลาย 5 ช่องใช้แค่ 4 ช่องที่ตรงกัน'),
    'trickPockets': T('+{v} trick pocket', '+{v} numara cebi', '+{v} ช่องกลเม็ด'),
    'benchDiscount': T('bench work costs {v}% less', 'tezgâh işleri %{v} ucuz', 'งานโต๊ะช่างถูกลง {v}%'),
    'firstTrickFree': T('the first trick each round is not used up', 'her elin ilk numarası harcanmaz', 'กลเม็ดแรกของแต่ละรอบไม่หมดไป'),
    'sellFull': T('charms sell for their full price', 'tılsımlar tam fiyatına satılır', 'ขายเครื่องรางได้เต็มราคา'),
    'noInterest': T('you earn no interest', 'faiz alamazsın', 'ไม่ได้ดอกเบี้ย'),
    'ashBase': T('Ash always has +{v} weight', 'Kül her zaman +{v} ağırlıkla gelir', 'เถ้ามีน้ำหนัก +{v} เสมอ'),
    'hideFav': T('you cannot see the Favourite', 'Gözdeyi göremezsin', 'มองไม่เห็นตัวโปรด'),
    'smallHalf': T('3-cell patterns pay half', '3 hücreli desenler yarım öder', 'ลาย 3 ช่องจ่ายครึ่งเดียว'),
    'heatFloor': T('Heat never drops below {v}', 'Ateş {v} altına düşmez', 'ไฟไม่ต่ำกว่า {v}'),
    'firstSpinDead': T('the first spin of each round pays nothing', 'her elin ilk çevirişi ödemez', 'ตาแรกของทุกรอบไม่จ่าย'),
    'deadCentre': T('the centre cell is always Ash', 'orta hücre hep Kül olur', 'ช่องกลางเป็นเถ้าเสมอ'),
    'debtMul': T('debts are {v}% larger', 'borçlar %{v} büyür', 'หนี้เพิ่มขึ้น {v}%'),
    'rerollDouble': T('rerolls cost double and you cannot lock', 'yenileme iki kat tutar, kilitleyemezsin', 'สุ่มร้านใหม่แพงสองเท่าและล็อกไม่ได้'),
    'debtCut': T('the next debt is {v}% smaller', 'sıradaki borç %{v} küçülür', 'หนี้ถัดไปลดลง {v}%'),
    'pickFav': T('choose a symbol: it is always a second Favourite', 'bir sembol seç: hep ikinci Gözde olur', 'เลือกสัญลักษณ์หนึ่งตัวให้เป็นตัวโปรดที่สองตลอดไป'),
    'maskWild': T('Masks are wild', 'Maskeler joker olur', 'หน้ากากแทนได้ทุกสัญลักษณ์'),
    'roundsAdd': T('+{v} round on every debt', 'her borca +{v} el', 'ทุกหนี้ได้เพิ่ม {v} รอบ'),
    'extraLife': T('once: if you miss a deadline you get 1 extra round', 'bir kez: vadeyi kaçırırsan 1 ek el kazanırsın', 'หนึ่งครั้ง: ถ้าจ่ายไม่ทันจะได้เพิ่ม 1 รอบ'),
    'refuseWick': T('refusing a deal gives +{v} Wick', 'anlaşmayı reddetmek +{v} Fitil verir', 'ปฏิเสธข้อตกลงได้ +{v} ไส้เทียน'),
    'mustSign': T('you must sign one deal at every deadline', 'her vadede bir anlaşma imzalamak zorundasın', 'ต้องเซ็นข้อตกลงหนึ่งข้อทุกครั้งที่ครบกำหนด'),
    'spinsRound': T('+{v} spin every round', 'her el +{v} çeviriş', 'ทุกรอบได้ +{v} ตา'),
    'spinsLess': T('−{v} spin on every terms card', 'her şart kartında −{v} çeviriş', 'การ์ดเงื่อนไขทุกใบ −{v} ตา'),
    'ghostHire': T('the first spin of each round places 2 Wisps', 'her elin ilk çevirişinde 2 Cin Ateşi yerleşir', 'ตาแรกของทุกรอบวางผีโขมด 2 ตัว'),
    'startCurses': T('you start with {v} random curses', 'oyuna {v} rastgele lanetle başlarsın', 'เริ่มเกมพร้อมคำสาปสุ่ม {v} อย่าง'),
    'interestHalf': T('interest is halved', 'faiz yarıya iner', 'ดอกเบี้ยลดครึ่ง'),
    'scorchBurn': T('a Scorch burns {v}% of your purse', 'Kavrulma kesenin %{v} kadarını yakar', 'ไหม้เกรียมเผาถุงเงิน {v}%'),
    'shopOffers': T('the shop shows {v} charms', 'dükkân {v} tılsım gösterir', 'ร้านแสดงเครื่องราง {v} ชิ้น'),
    'rounds': T('{v} rounds per debt', 'borç başına {v} el', 'หนี้ละ {v} รอบ'),
    'noStoke': T('you cannot Stoke and Heat stays at 0', 'Körükleyemezsin, Ateş 0 kalır', 'โหมไฟไม่ได้และไฟอยู่ที่ 0'),
    'smallDead': T('3-cell patterns pay nothing', '3 hücreli desenler ödemez', 'ลาย 3 ช่องไม่จ่าย'),
    'bigX': T('patterns of 4+ cells pay ×{v}', '4+ hücreli desenler ×{v} öder', 'ลาย 4 ช่องขึ้นไปจ่าย ×{v}'),
    'bankX': T('coins you bank this round count ×{v}', 'bu el yatırdığın para ×{v} sayılır', 'เหรียญที่จ่ายหนี้ในรอบนี้นับ ×{v}'),
    'lastTwice': T('the last spin of the round is scored twice', 'elin son çevirişi iki kez puanlanır', 'ตาสุดท้ายของรอบคิดคะแนนสองครั้ง'),
    'shopExtra': T('the next shop has +1 charm and a free reroll', 'sıradaki dükkânda +1 tılsım ve bedava yenileme olur', 'ร้านถัดไปมีเครื่องราง +1 ชิ้นและสุ่มใหม่ฟรี 1 ครั้ง'),
    'noInterestRound': T('no interest this round', 'bu el faiz yok', 'รอบนี้ไม่มีดอกเบี้ย'),
    'copyRight': T('copies the rules of the charm in the slot to its right', 'sağındaki yuvada duran tılsımın kurallarını kopyalar', 'ลอกกฎของเครื่องรางในช่องทางขวา'),
    'freeRedraw': T('+{v} free Favourite redraw each round', 'her el +{v} bedava Gözde değiştirme', 'สุ่มตัวโปรดใหม่ฟรี +{v} ครั้งทุกรอบ'),
    'freeReroll': T('the first {v} reroll in every shop is free', 'her dükkânda ilk {v} yenileme bedava', 'สุ่มร้านใหม่ {v} ครั้งแรกในทุกร้านฟรี'),
    'startHeat': T('each round starts at Heat {v}', 'her el Ateş {v} ile başlar', 'ทุกรอบเริ่มที่ไฟ {v}'),
}
TRIG = {
    'passive': T('Always', 'Her zaman', 'ตลอดเวลา'), 'onRunStart': T('Run start', 'Oyun başında', 'เริ่มเกม'),
    'onDebtStart': T('New debt', 'Yeni borçta', 'เริ่มหนี้ใหม่'), 'onRoundStart': T('Round start', 'El başında', 'เริ่มรอบ'),
    'onRoundEnd': T('Round end', 'El sonunda', 'จบรอบ'), 'onSpinStart': T('Before each spin', 'Her çevirişten önce', 'ก่อนหมุนทุกตา'),
    'onPattern': T('Each pattern', 'Her desen', 'ทุกลาย'), 'onSpinEnd': T('After each spin', 'Her çevirişten sonra', 'หลังหมุนทุกตา'),
    'onDud': T('Spin with no pattern', 'Desensiz çeviriş', 'หมุนแล้วไม่มีลาย'), 'onScorch': T('On a Scorch', 'Kavrulmada', 'เมื่อไหม้เกรียม'),
    'onStoke': T('Each Stoke', 'Her körüklemede', 'ทุกครั้งที่โหมไฟ'), 'onBank': T('When you bank', 'Borca para yatırınca', 'เมื่อจ่ายเข้าหนี้'),
    'onInterest': T('When interest pays', 'Faiz gelince', 'เมื่อได้ดอกเบี้ย'), 'onDebtPaid': T('Debt paid', 'Borç ödenince', 'เมื่อปลดหนี้'),
    'onBuy': T('When you buy a charm', 'Tılsım alınca', 'เมื่อซื้อเครื่องราง'), 'onSell': T('When you sell a charm', 'Tılsım satınca', 'เมื่อขายเครื่องราง'),
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
        'curses': T(' per curse', ' (lanet başına)', ' ต่อคำสาป'), 'heat': T(' per Heat', ' (Ateş başına)', ' ต่อไฟ'),
        'family': T(' per %s charm' % FAM.get(a, {}).get('en'), ' (%s tılsımı başına)' % FAM.get(a, {}).get('tr'), ' ต่อเครื่องราง%s' % FAM.get(a, {}).get('th')),
        'sym': T(' per %s on the grid' % SN.get(a, {}).get('en'), ' (ızgaradaki %s başına)' % SN.get(a, {}).get('tr'), ' ต่อ%sบนกระดาน' % SN.get(a, {}).get('th')),
        'emptySlots': T(' per empty charm slot', ' (boş yuva başına)', ' ต่อช่องเครื่องรางว่าง'), 'tricks': T(' per trick held', ' (eldeki numara başına)', ' ต่อกลเม็ดที่ถือ'),
        'deals': T(' per deal signed', ' (imzalı anlaşma başına)', ' ต่อข้อตกลงที่เซ็น'), 'stack': T(' per charge', ' (birikim başına)', ' ต่อแต้มสะสม'),
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
    elif t == 'wick': r = T('%s Wick', '%s Fitil', '%s ไส้เทียน')[l] % sgn(n)
    elif t == 'heat': r = T('%s Heat', '%s Ateş', 'ไฟ %s')[l] % sgn(n)
    elif t == 'weight':
        pc = round((n - 1) * 100)
        r = T('%s weight %s%%', '%s ağırlığı %s', 'น้ำหนัก%s %s%%')[l] % (s, sgn(pc) if l != 'tr' else sgn(pc)[0] + '%' + sgn(pc)[1:])
    elif t == 'transform': r = T('turn up to {n} {a} into {b}', 'en çok {n} {a}, {b} olur', 'เปลี่ยน{a}สูงสุด {n} ตัวเป็น{b}')[l].format(n=num(n), a=SN[e['from']][l], b=SN[e['to']][l])
    elif t == 'place': r = T('place {n} {a}', '{n} {a} yerleşir', 'วาง{a} {n} ตัว')[l].format(n=num(n), a=s) + (' ' + ZONE[e['zone']][l] if e.get('zone') else '')
    elif t == 'retrigger': r = T('it pays again', 'bir kez daha öder', 'จ่ายซ้ำอีกครั้ง')[l]
    elif t == 'trick': r = T('gain %s random trick', '%s rastgele numara kazan', 'ได้กลเม็ดสุ่ม %s ชิ้น')[l] % num(n or 1)
    elif t == 'stack': r = T('%s charge', '%s birikim', '%s แต้มสะสม')[l] % sgn(n)
    elif t == 'slot': r = T('%s charm slot', '%s tılsım yuvası', '%s ช่องเครื่องราง')[l] % sgn(n)
    elif t == 'gainCharm': r = T('gain a random %s charm', 'rastgele bir %s tılsım kazan', 'ได้เครื่องราง%sสุ่มหนึ่งชิ้น')[l] % RAR[e['rarity']][l]
    elif t == 'gainCurse': r = T('gain %s random curse', '%s rastgele lanet al', 'ได้คำสาปสุ่ม %s อย่าง')[l] % num(n)
    elif t == 'removeSymbol': r = T('remove %s symbols of your choice from the machine', 'makineden seçtiğin %s sembolü çıkar', 'ถอดสัญลักษณ์ที่เลือก %s ชนิดออกจากเครื่อง')[l] % num(n)
    elif t == 'flag': r = FLAGS[e['flag']][l].replace('{v}', num(e.get('v', 0)))
    else: raise KeyError(t)
    if e.get('scope') in SCOPE: r += SCOPE[e['scope']][l]
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
    if c.get('hasWisp'): x.append(T('if it holds a Wisp', 'içinde Cin Ateşi varsa', 'ถ้ามีผีโขมดอยู่ในลาย')[l])
    if c.get('favoured'): x.append(T('if it is the Favourite', 'Gözdeyse', 'ถ้าเป็นตัวโปรด')[l])
    if c.get('minPatterns'): x.append(T('if %d+ patterns', '%d+ desen varsa', 'ถ้ามี %d ลายขึ้นไป')[l] % c['minPatterns'])
    if c.get('distinctMin'): x.append(T('if %d+ different shapes', '%d+ farklı şekil varsa', 'ถ้ามี %d รูปทรงต่างกันขึ้นไป')[l] % c['distinctMin'])
    if 'heatMin' in c: x.append(T('if Heat %d+', 'Ateş %d+ ise', 'ถ้าไฟ %d+')[l] % c['heatMin'])
    if 'heatMax' in c: x.append(T('if Heat is %d or less', 'Ateş en çok %d ise', 'ถ้าไฟไม่เกิน %d')[l] % c['heatMax'])
    if c.get('cursesMin'): x.append(T('if you carry %d+ curses', '%d+ lanetin varsa', 'ถ้ามีคำสาป %d+')[l] % c['cursesMin'])
    if c.get('spinIs') == 'first': x.append(T('on the first spin of a round', 'elin ilk çevirişinde', 'ในตาแรกของรอบ')[l])
    if c.get('spinIs') == 'last': x.append(T('on the last spin of a round', 'elin son çevirişinde', 'ในตาสุดท้ายของรอบ')[l])
    if c.get('countMin'):
        cs, cn = SN[c['countMin'][0]][l], c['countMin'][1]
        x.append(T('if {n}+ {s} on the grid', 'ızgarada {n}+ {s} varsa', 'ถ้ามี{s} {n}+ บนกระดาน')[l].format(n=cn, s=cs))
    if c.get('roundsLeftMin'): x.append(T('with a round to spare', 'el artarsa', 'ถ้าเหลือรอบ')[l])
    if c.get('purseMaxPct'): x.append(T('if your purse is %d%% of the debt or less', 'kesen borcun %%%d kadarı ya da azsa', 'ถ้าถุงเงินไม่เกิน %d%% ของหนี้')[l] % c['purseMaxPct'])
    if c.get('emptySlot'): x.append(T('if a charm slot is empty', 'boş yuvan varsa', 'ถ้ามีช่องเครื่องรางว่าง')[l])
    if c.get('slotIs') == 'first': x.append(T('if it sits in the leftmost charm slot', 'en soldaki tılsım yuvasındaysa', 'ถ้าอยู่ช่องเครื่องรางซ้ายสุด')[l])
    if c.get('slotIs') == 'last': x.append(T('if it sits in the rightmost filled charm slot', 'dolu yuvaların en sağındaysa', 'ถ้าอยู่ช่องเครื่องรางที่มีของขวาสุด')[l])
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
PRICE = {'common': ('coins', 4), 'uncommon': ('coins', 7), 'rare': ('wick', 5), 'legendary': ('wick', 9)}
RK = {'c': 'common', 'u': 'uncommon', 'r': 'rare', 'l': 'legendary'}
charms = []
def C(i, fam, rar, icon, en, tr, th, *rules, tags=()):
    assert 'charm/' + icon in ICONS, icon
    cur, pr = PRICE[RK[rar]]
    charms.append(dict(id=i, name=T(en, tr, th), family=fam, tags=[fam] + list(tags), rarity=RK[rar], icon='charm/' + icon,
                       price={cur: pr}, unlock=None, rules=list(rules), text=text(rules)))

# ---- swarm: low symbols and head-count ----
C('moth_jar', 'swarm', 'c', 'moth_jar', 'Moth Jar', 'Güve Kavanozu', 'โหลแมลงเม่า', R('onSymbolLand', {'sym': 'moth'}, E('coins', 1)))
C('dusty_wing', 'swarm', 'c', 'moth_wing', 'Dusty Wing', 'Tozlu Kanat', 'ปีกเปื้อนฝุ่น', R(P, None, E('weight', 1.5, sym='moth')))
C('tallow_stub', 'swarm', 'c', 'moth_wing', 'Tallow Stub', 'İçyağı Mumu', 'เทียนไขก้นสั้น', R(P, None, E('symValue', 2, sym='candle')))
C('patient_cocoon', 'swarm', 'u', 'cocoon', 'Patient Cocoon', 'Sabırlı Koza', 'ดักแด้ใจเย็น', R('onPattern', {'group': 'low', 'every': 4}, E('symValue', 1, sym='low')))
C('moth_net', 'swarm', 'c', 'moth_net', 'Moth Net', 'Güve Ağı', 'สวิงจับแมลงเม่า', R('onSpinEnd', {'countMin': ['moth', 3]}, E('coins', 4)))
C('night_swarm', 'swarm', 'u', 'moth_jar', 'Night Swarm', 'Gece Sürüsü', 'ฝูงกลางคืน', R('onPattern', {'sym': 'moth'}, E('patMult', 0.25, pattern='this', per='sym:moth')))
C('milk_tooth', 'swarm', 'c', 'cocoon', 'Milk Tooth', 'Süt Dişi', 'ฟันน้ำนม', R(P, None, E('symValue', 2, sym='tooth')))
C('bent_key', 'swarm', 'u', 'moth_net', 'Bent Key', 'Eğri Anahtar', 'กุญแจงอ', R('onPattern', {'sym': 'key', 'every': 2}, E('wick', 1)), tags=['pact'])
C('small_fry_union', 'swarm', 'r', 'moth_jar', 'Small Fry Union', 'Ufaklıklar Birliği', 'สหภาพตัวจิ๋ว', R(P, None, E('symMult', 0.25, sym='low', per='family:swarm')))
C('dust_queen', 'swarm', 'l', 'moth_wing', 'Dust Queen', 'Toz Kraliçesi', 'ราชินีฝุ่น', R('onPattern', {'sym': 'moth'}, E('retrigger', 1)), R(P, None, E('weight', 1.5, sym='moth')))
C('paupers_parade', 'swarm', 'r', 'cocoon', "Pauper's Parade", 'Garibanlar Alayı', 'ขบวนยาจก', R('onSpinEnd', {'minPatterns': 3, 'limit': 'round'}, E('symValue', 1, sym='low')))
# ---- ember: Heat ----
C('matchbox', 'ember', 'c', 'matchbox', 'Matchbox', 'Kibrit Kutusu', 'กล่องไม้ขีด', R('onStoke', None, E('coins', 1)))
C('hot_coal', 'ember', 'c', 'coal', 'Hot Coal', 'Kor Parçası', 'ถ่านแดง', R(P, {'heatMin': 4}, E('patMult', 0.5, pattern='all')))
C('bellows', 'ember', 'u', 'bellows', 'Bellows', 'Körük', 'เครื่องสูบลม', R('onRoundStart', None, E('heat', 2)), R(P, None, F('heatStep', 20)))
C('torch', 'ember', 'c', 'torch', 'Torch', 'Meşale', 'คบเพลิง', R('onSpinEnd', {'heatMin': 6}, E('coins', 4)))
C('brazier', 'ember', 'u', 'brazier', 'Brazier', 'Mangal', 'เตาอั้งโล่', R(P, None, F('heatNoCool'), E('luck', 1)), tags=['omen'])
C('fire_eater', 'ember', 'r', 'torch', "Fire Eater's Glove", 'Ateşbaz Eldiveni', 'ถุงมือนักกลืนไฟ', R(P, None, F('scorchNeeds', 4)), tags=['hex'])
C('cold_ember', 'ember', 'u', 'coal', 'Cold Ember', 'Soğuk Köz', 'ถ่านเย็น', R('onSpinEnd', {'heatMax': 0}, E('luck', 1, scope='round')), tags=['omen'])
C('kindling', 'ember', 'c', 'matchbox', 'Kindling', 'Çıra', 'เชื้อไฟ', R('onDud', None, E('heat', 1), E('coins', 2)))
C('furnace_heart', 'ember', 'l', 'brazier', 'Furnace Heart', 'Ocak Yüreği', 'หัวใจเตาหลอม', R(P, {'heatMin': 10}, E('allMult', 2)))
C('powder_trail', 'ember', 'r', 'bellows', 'Powder Trail', 'Barut İzi', 'ทางดินปืน', R('onPattern', {'minCells': 4, 'heatMin': 5}, E('retrigger', 1)), tags=['stitch'])
C('stray_spark', 'ember', 'u', 'matchbox', 'Stray Spark', 'Kaçak Kıvılcım', 'ประกายไฟหลง', R('onStoke', {'chance': 25, 'limit': 'round'}, E('spins', 1)))
# ---- hex: curses and Ash ----
C('pin_doll', 'hex', 'c', 'rag_doll', 'Pin Doll', 'İğneli Bebek', 'ตุ๊กตาปักเข็ม', R('onRoundStart', None, E('coins', 3, per='curses')))
C('black_cat', 'hex', 'u', 'black_cat', 'Black Cat', 'Kara Kedi', 'แมวดำ', R(P, None, E('luck', 1, per='curses')), tags=['omen'])
C('cracked_mirror', 'hex', 'r', 'cracked_mirror', 'Cracked Mirror', 'Çatlak Ayna', 'กระจกร้าว', R('onCurse', None, E('symMult', 0.25, sym='all')))
C('rattle_ribs', 'hex', 'c', 'rib_cage', 'Rattle Ribs', 'Tıkırdayan Kaburga', 'ซี่โครงกรุ๊งกริ๊ง', R('onSymbolLand', {'sym': 'ash'}, E('coins', 3)), tags=['ember'])
C('crow_feather', 'hex', 'c', 'crow_feather', 'Crow Feather', 'Karga Tüyü', 'ขนอีกา', R(P, None, E('symValue', 3, sym='crow')), tags=['crown'])
C('ash_cake', 'hex', 'u', 'rib_cage', 'Ash Cake', 'Kül Çöreği', 'ขนมเถ้า', R('onScorch', None, E('wick', 2), E('coins', 10)), tags=['ember'])
C('scapegoat_bell', 'hex', 'l', 'black_cat', 'Scapegoat Bell', 'Günah Keçisi Çanı', 'กระดิ่งแพะรับบาป', R(P, None, F('ashIsFav')), tags=['ember'])
C('grave_dirt', 'hex', 'u', 'rag_doll', 'Grave Dirt', 'Mezar Toprağı', 'ดินป่าช้า', R(P, {'cursesMin': 3}, E('patMult', 1, pattern='all')))
C('jinx_bead', 'hex', 'c', 'cracked_mirror', 'Jinx Bead', 'Uğursuz Boncuk', 'ลูกปัดอาถรรพ์', R('onSymbolLand', {'sym': 'eye'}, E('coins', 1), E('coins', 1, per='curses')))
C('thirteenth_stair', 'hex', 'u', 'crow_feather', 'Thirteenth Stair', 'On Üçüncü Basamak', 'บันไดขั้นที่สิบสาม', R('onSpinEnd', {'every': 13}, E('coins', 40)))
C('martyr_splinter', 'hex', 'r', 'rib_cage', "Martyr's Splinter", 'Çilekeş Kıymığı', 'เสี้ยนผู้ทนทุกข์', R('onScorch', None, E('symMult', 0.3, sym='all')), tags=['ember'])
# ---- ledger: purse, interest, banking ----
C('abacus', 'ledger', 'c', 'abacus', 'Abacus', 'Abaküs', 'ลูกคิด', R(P, None, E('interest', 4)))
C('coin_purse', 'ledger', 'c', 'coin_purse', 'Coin Purse', 'Para Kesesi', 'ถุงเหรียญ', R('onRoundEnd', None, E('coins', 5)))
C('ledger_book', 'ledger', 'u', 'ledger_book', 'Ledger Book', 'Hesap Defteri', 'สมุดบัญชี', R('onInterest', None, E('wick', 1)), tags=['pact'])
C('clay_jar', 'ledger', 'u', 'clay_jar', 'Clay Jar', 'Toprak Kumbara', 'กระปุกดิน', R('onRoundEnd', None, E('stack', 1)), R('onSellSelf', None, E('coins', 12, per='stack')))
C('exact_change', 'ledger', 'u', 'coin_purse', 'Exact Change', 'Tam Para', 'เงินพอดี', R('onDebtPaid', {'purseMaxPct': 10}, E('wick', 6)))
C('compound_tooth', 'ledger', 'r', 'abacus', 'Compound Tooth', 'Bileşik Diş', 'ฟันทบต้น', R(P, None, E('interest', 1, per='family:ledger'), F('interestCapX', 2)))
C('penny_wise', 'ledger', 'c', 'ledger_book', 'Penny Wise', 'Kuruş Hesabı', 'นักต่อราคา', R(P, None, F('shopDiscount', 20), F('freeReroll', 1)))
C('brass_goose', 'ledger', 'l', 'clay_jar', 'Brass Goose', 'Pirinç Kaz', 'ห่านทองเหลือง', R('onInterest', None, E('symMult', 0.2, sym='all')))
C('early_payer', 'ledger', 'u', 'ledger_book', 'Early Payer', 'Erken Ödeyen', 'จ่ายก่อนกำหนด', R('onDebtPaid', {'roundsLeftMin': 1}, E('luck', 1)), tags=['omen'])
C('dividend_slip', 'ledger', 'r', 'coin_purse', 'Dividend Slip', 'Temettü Fişi', 'ใบปันผล', R('onPattern', {'minCells': 5}, E('coins', 2, per='purse100')), tags=['stitch'])
# ---- pact: deals, Sigils, Wick ----
C('notary_stamp', 'pact', 'c', 'stamp', 'Notary Stamp', 'Noter Damgası', 'ตรารับรอง', R('onSymbolLand', {'sym': 'sigil'}, E('coins', 4)))
C('quill', 'pact', 'u', 'quill', 'Black Quill', 'Kara Tüy Kalem', 'ปากกาขนนกดำ', R('onDeal', None, E('symValue', 1, sym='all')))
C('fine_print', 'pact', 'c', 'scroll', 'Fine Print', 'İnce Yazı', 'ตัวอักษรจิ๋ว', R(P, None, F('dealOffers', 3)))
C('ink_bottle', 'pact', 'c', 'ink_bottle', 'Ink Bottle', 'Mürekkep Şişesi', 'ขวดหมึก', R(P, None, E('weight', 2, sym='sigil')))
C('firm_handshake', 'pact', 'r', 'claw_shake', 'Firm Handshake', 'Sıkı Tokalaşma', 'จับมือแน่น', R(P, None, E('patMult', 0.5, pattern='all', per='deals')))
C('red_ribbon', 'pact', 'u', 'red_ribbon', 'Red Ribbon', 'Kırmızı Kurdele', 'ริบบิ้นแดง', R('onRefuse', None, E('wick', 3)))
C('loophole', 'pact', 'u', 'scroll', 'Loophole', 'Kaçamak Madde', 'ช่องโหว่', R('onCurse', {'chance': 50}, F('cancelCurse')), tags=['hex'])
C('summons', 'pact', 'u', 'stamp', 'Summons', 'Celpname', 'หมายเรียก', R('onSpinEnd', {'countMin': ['sigil', 3]}, E('trick', 1)), tags=['tinker'])
C('blood_ink', 'pact', 'l', 'ink_bottle', 'Blood Ink', 'Kan Mürekkebi', 'หมึกเลือด', R('onSymbolLand', {'sym': 'sigil'}, E('allMult', 1.5)))
C('paid_witness', 'pact', 'c', 'quill', 'Paid Witness', 'Paralı Şahit', 'พยานรับจ้าง', R('onDebtPaid', None, E('wick', 1)))
C('cosigner', 'pact', 'r', 'claw_shake', 'Co-signer', 'Kefil', 'ผู้ค้ำประกัน', R(P, None, F('saveDeadline')))
# ---- omen: Luck and the Favourite ----
C('tea_leaves', 'omen', 'c', 'tea_cup', 'Tea Leaves', 'Çay Telvesi', 'ใบชาก้นถ้วย', R(P, None, E('luck', 1)))
C('crystal_ball', 'omen', 'u', 'crystal_ball', 'Cloudy Ball', 'Bulanık Küre', 'ลูกแก้วขุ่น', R(P, None, F('seeNextFav'), F('freeRedraw', 1)))
C('star_card', 'omen', 'c', 'star_card', 'Star Card', 'Yıldız Kartı', 'ไพ่ดาว', R('onPattern', {'favoured': True}, E('coins', 2)))
C('comet', 'omen', 'u', 'comet', 'Comet', 'Kuyruklu Yıldız', 'ดาวหาง', R('onSpinStart', {'spinIs': 'first'}, E('luck', 4, scope='spin')))
C('bent_nail', 'omen', 'c', 'horseshoe_nail', 'Bent Nail', 'Eğri Çivi', 'ตะปูคด', R('onDud', None, E('luck', 1, scope='round')))
C('dream_web', 'omen', 'u', 'spider_web', 'Dream Web', 'Düş Ağı', 'ใยฝัน', R('onSpinStart', {'spinIs': 'last'}, E('luck', 5, scope='spin')))
C('second_sight', 'omen', 'r', 'crystal_ball', 'Second Sight', 'Altıncı His', 'ตาที่สาม', R(P, None, F('pickFirstFav')))
C('fair_wind', 'omen', 'u', 'comet', 'Fair Wind', 'Uğurlu Rüzgâr', 'ลมนำโชค', R('onSpinEnd', {'minPatterns': 2}, E('luck', 1, scope='round')))
C('twin_stars', 'omen', 'r', 'star_card', 'Twin Stars', 'İkiz Yıldız', 'ดาวคู่', R(P, None, F('twoFavs')))
C('paper_fortune', 'omen', 'c', 'tea_cup', 'Paper Fortune', 'Kâğıt Fal', 'ใบเซียมซี', R('onRoundStart', None, E('luck', 1, scope='round', per='emptySlots')))
C('fixed_star', 'omen', 'l', 'spider_web', 'Fixed Star', 'Sabit Yıldız', 'ดาวประจำตัว', R(P, None, F('favPerRound'), E('symMult', 0.5, sym='favoured')))
# ---- stitch: shapes and positions ----
C('needle', 'stitch', 'c', 'needle', 'Red Needle', 'Kırmızı İğne', 'เข็มด้ายแดง', R(P, None, E('patMult', 0.5, pattern='h3')))
C('shuttle', 'stitch', 'c', 'shuttle', 'Shuttle', 'Mekik', 'กระสวย', R(P, None, E('patMult', 1, pattern='v3')))
C('knot', 'stitch', 'c', 'knot', 'Pretzel Knot', 'Simit Düğümü', 'เงื่อนขด', R(P, None, E('patMult', 1, pattern='d3')))
C('corner_tacks', 'stitch', 'u', 'needle', 'Corner Tacks', 'Köşe Raptiyeleri', 'หมุดมุม', R('onSymbolLand', {'zone': 'corner'}, E('coins', 1)))
C('long_hem', 'stitch', 'u', 'shuttle', 'Long Hem', 'Uzun Etek', 'ชายผ้ายาว', R('onPattern', {'minCells': 5}, E('patMult', 2, pattern='this')))
C('patchwork', 'stitch', 'u', 'knot', 'Patchwork', 'Kırkyama', 'ผ้าปะ', R('onSpinEnd', {'distinctMin': 3}, E('coins', 12)))
C('crooked_loom', 'stitch', 'r', 'shuttle', 'Crooked Loom', 'Yamuk Tezgâh', 'กี่ทอเบี้ยว', R(P, None, F('fiveNeedsFour')))
C('halo_thread', 'stitch', 'u', 'needle', 'Halo Thread', 'Hale İpliği', 'ด้ายวงแหวน', R(P, None, E('patMult', 3, pattern='halo'), E('patMult', 3, pattern='corners')))
C('master_stitch', 'stitch', 'r', 'knot', 'Master Stitch', 'Usta Dikişi', 'ฝีเข็มครู', R('onPattern', {'every': 10}, E('patMult', 0.5, pattern='all')))
C('fair_tapestry', 'stitch', 'l', 'shuttle', 'Fair Tapestry', 'Panayır Halısı', 'พรมงานวัด', R('onSpinEnd', {'minPatterns': 4}, E('allMult', 3)))
# ---- wisp: wilds and transforms ----
C('wisp_bottle', 'wisp', 'c', 'wisp_bottle', 'Wisp Bottle', 'Cin Şişesi', 'ขวดผีโขมด', R(P, None, E('weight', 2, sym='wisp')))
C('glow_jar', 'wisp', 'c', 'glow_jar', 'Glow Jar', 'Işıltı Kavanozu', 'โหลเรืองแสง', R('onSymbolLand', {'sym': 'wisp'}, E('coins', 2)))
C('firefly', 'wisp', 'u', 'firefly', 'Firefly', 'Ateş Böceği', 'หิ่งห้อย', R('onSpinStart', {'chance': 30}, E('place', 1, sym='wisp')))
C('prism', 'wisp', 'u', 'prism', 'Prism', 'Prizma', 'ปริซึม', R('onPattern', {'hasWisp': True}, E('patMult', 1, pattern='this')))
C('lost_light', 'wisp', 'c', 'firefly', 'Lost Light', 'Kayıp Işık', 'แสงหลงทาง', R('onPattern', {'hasWisp': True}, E('symValue', 3, sym='that', scope='spin')))
C('changeling', 'wisp', 'r', 'wisp_bottle', 'Changeling', 'Peri Değişimi', 'ลูกสับเปลี่ยน', R('onSpinStart', None, E('transform', 2, **{'from': 'moth', 'to': 'favoured'})), tags=['omen'])
C('spare_face', 'wisp', 'u', 'prism', 'Spare Face', 'Yedek Yüz', 'หน้าสำรอง', R('onSpinStart', None, E('transform', 1, **{'from': 'mask', 'to': 'wisp'})))
C('ghost_parade', 'wisp', 'r', 'glow_jar', 'Ghost Parade', 'Hayalet Alayı', 'ขบวนผี', R('onSpinEnd', {'countMin': ['wisp', 3]}, E('allMult', 2)))
C('twin_flame', 'wisp', 'u', 'wisp_bottle', 'Twin Flame', 'İkiz Alev', 'เปลวแฝด', R('onSymbolLand', {'sym': 'wisp', 'every': 5}, E('wick', 1)), tags=['pact'])
C('green_dawn', 'wisp', 'l', 'glow_jar', 'Green Dawn', 'Yeşil Şafak', 'รุ่งอรุณสีเขียว', R('onSpinStart', {'spinIs': 'first'}, E('place', 5, sym='wisp', zone='midrow')))
# ---- tinker: tricks and the bench ----
C('wrench', 'tinker', 'c', 'wrench', 'Brass Wrench', 'Pirinç Anahtar', 'ประแจทองเหลือง', R('onTrick', None, E('coins', 5)))
C('oil_can', 'tinker', 'c', 'oil_can', 'Oil Can', 'Yağdanlık', 'กาหยอดน้ำมัน', R(P, None, F('trickPockets', 1)), R('onDebtStart', None, E('trick', 1)))
C('gear', 'tinker', 'u', 'gear', 'Eighth Tooth', 'Sekizinci Diş', 'ฟันเฟืองซี่ที่แปด', R('onTrick', {'every': 3}, E('spins', 1)))
C('hammer', 'tinker', 'u', 'hammer', 'Tack Hammer', 'Çivi Çekici', 'ค้อนตอกหมุด', R('onBuy', None, E('symValue', 1, sym='random')))
C('pliers', 'tinker', 'c', 'pliers', 'Pliers', 'Pense', 'คีม', R(P, None, F('benchDiscount', 50)))
C('spare_parts', 'tinker', 'u', 'gear', 'Spare Parts', 'Yedek Parça', 'อะไหล่', R('onSpinEnd', None, E('coins', 1, per='tricks')))
C('tuned_gears', 'tinker', 'r', 'gear', 'Tuned Gears', 'Ayarlı Dişliler', 'เฟืองจูนแล้ว', R(P, None, F('firstTrickFree')))
C('polish_rag', 'tinker', 'c', 'oil_can', 'Polish Rag', 'Cila Bezi', 'ผ้าขัดเงา', R('onDebtPaid', None, E('symValue', 1, sym='random')))
C('scrap_heap', 'tinker', 'r', 'hammer', 'Scrap Heap', 'Hurda Yığını', 'กองเศษเหล็ก', R(P, None, E('symMult', 0.3, sym='all', per='removed')))
C('clockwork_thumb', 'tinker', 'l', 'wrench', 'Clockwork Thumb', 'Kurmalı Başparmak', 'นิ้วโป้งไขลาน', R('onTrick', None, E('allMult', 2, scope='spin')))
# ---- crown: high symbols ----
C('scepter', 'crown', 'u', 'scepter', 'Short Scepter', 'Kısa Asa', 'คทาสั้น', R(P, None, E('symValue', 6, sym='crown'), E('weight', 2, sym='crown')))
C('throne', 'crown', 'r', 'throne', 'Crooked Throne', 'Yamuk Taht', 'บัลลังก์เอียง', R('onPattern', {'sym': 'crown'}, E('retrigger', 1)))
C('cushion', 'crown', 'c', 'cushion', 'Velvet Cushion', 'Kadife Minder', 'เบาะกำมะหยี่', R(P, None, E('weight', 1.3, sym='high')))
C('lamplighter', 'crown', 'c', 'scepter', "Lamplighter's Pole", 'Fenerci Sırığı', 'ไม้จุดโคม', R(P, None, E('symValue', 4, sym='lantern')))
C('jesters_cap', 'crown', 'u', 'cushion', "Jester's Cap", 'Soytarı Külahı', 'หมวกตัวตลก', R('onPattern', {'group': 'high'}, E('coins', 5)))
C('coronation', 'crown', 'r', 'throne', 'Coronation', 'Taç Giyme', 'พิธีสวมมงกุฎ', R('onSpinEnd', {'countMin': ['crown', 3]}, E('symValue', 2, sym='crown')))
C('royal_tithe', 'crown', 'u', 'scepter', 'Royal Tithe', 'Saray Payı', 'ส่วยหลวง', R('onPattern', {'group': 'high', 'every': 4}, E('wick', 1)), tags=['pact'])
C('velvet_rope', 'crown', 'u', 'cushion', 'Velvet Rope', 'Kadife Halat', 'เชือกกำมะหยี่', R(P, None, E('weight', 0.7, sym='low')))
C('paper_king', 'crown', 'l', 'throne', 'Paper King', 'Kâğıt Kral', 'ราชากระดาษ', R('onPattern', {'group': 'high', 'minCells': 4}, E('patMult', 4, pattern='this')))

# ---- slot order: these read where they sit in the charm row ----
C('understudy', 'tinker', 'u', 'prism', 'Understudy', 'Yedek Oyuncu', 'ตัวสำรอง', R(P, None, F('copyRight')))
C('opening_act', 'tinker', 'u', 'red_ribbon', 'Opening Act', 'Açılış Numarası', 'การแสดงเปิด', R(P, {'slotIs': 'first'}, E('allMult', 1.5)))
C('closer', 'tinker', 'u', 'knot', 'The Closer', 'Kapanış', 'ปิดม่าน', R(P, {'slotIs': 'last'}, E('allMult', 1.5)))

# ---------- curses ----------
curses = []
def CU(i, icon, en, tr, th, *rules):
    assert 'curse/' + icon in ICONS
    curses.append(dict(id=i, name=T(en, tr, th), icon='curse/' + icon, rules=list(rules), text=text(rules)))
CU('dead_weight', 'weight', 'Dead Weight', 'Ölü Yük', 'ถ่วงหนัก', R(P, None, F('noInterest'), F('debtMul', 10)))
CU('short_candle', 'candle', 'Short Candle', 'Kısa Mum', 'เทียนสั้น', R('onRoundStart', {'firstRound': True}, E('spins', -2)))
CU('ash_rain', 'ash', 'Ash Rain', 'Kül Yağmuru', 'ฝนเถ้า', R(P, None, F('ashBase', 3)))
CU('the_tithe', 'tax', 'The Tithe', 'Brimble Payı', 'ค่าหัวคิว', R(P, None, E('allMult', 0.8)))
CU('dear_prices', 'price', 'Dear Prices', 'Ateş Pahası', 'ของแพง', R(P, None, F('shopMarkup', 50)))
CU('blindfold', 'blind', 'Blindfold', 'Göz Bağı', 'ผ้าปิดตา', R(P, None, F('hideFav')))
CU('shackle', 'chain', 'Shackle', 'Pranga', 'โซ่ตรวน', R(P, None, E('slot', -1)))
CU('hairline_crack', 'crack', 'Hairline Crack', 'Kılcal Çatlak', 'รอยร้าว', R(P, None, F('smallHalf')))
CU('fever', 'fever', 'Fever', 'Humma', 'ไข้ขึ้น', R(P, None, F('heatFloor', 3)))
CU('moth_eaten', 'weight', 'Moth-eaten', 'Güve Yeniği', 'มอดกิน', R(P, None, E('symValue', -1, sym='low')))
CU('cold_feet', 'candle', 'Cold Feet', 'Isınma Turu', 'ตาแรกฝืด', R(P, None, F('firstSpinDead')))
CU('smoke_hole', 'ash', 'Smoke Hole', 'Duman Deliği', 'รูควัน', R(P, None, F('deadCentre')))
CU('small_print', 'tax', 'Small Print', 'Dipnot', 'หมายเหตุท้ายสัญญา', R(P, None, F('debtMul', 15)))
CU('sticky_fingers', 'price', 'Sticky Fingers', 'Yapışkan Parmak', 'มือกาว', R(P, None, F('rerollDouble')))
CU('jinx', 'blind', 'Jinx', 'Uğursuzluk', 'ดวงซวย', R(P, None, E('luck', -2)))
CU('brittle_nerves', 'crack', 'Brittle Nerves', 'Gergin Sinir', 'ประสาทเปราะ', R('onTrick', None, E('heat', 2)))
CUN = {c['id']: c['name'] for c in curses}

# ---------- deals ----------
deals = []
def D(i, icon, en, tr, th, curse, *effects, n=1):
    assert 'deal/' + icon in ICONS and (curse == 'random' or curse in CUN)
    boon = [R('now', None, *effects)]
    tx = text(boon)
    for l in L:
        cn = CUN[curse][l] if curse != 'random' else T('%d random', '%d rastgele', 'สุ่ม %d อย่าง')[l] % n
        tx[l] = tx[l].split(': ', 1)[1]
        tx[l] = tx[l][0].upper() + tx[l][1:] + ' ' + T('Curse: %s.', 'Lanet: %s.', 'คำสาป: %s')[l] % cn
    deals.append(dict(id=i, name=T(en, tr, th), icon='deal/' + icon, boon=list(effects), curse=curse, curseCount=n, text=tx))
D('quick_cash', 'coins', 'Quick Cash', 'Sıcak Para', 'เงินด่วน', 'the_tithe', E('coins', 40))
D('fat_purse', 'coins', 'Fat Purse', 'Şişkin Kese', 'ถุงเงินอ้วน', 'dear_prices', E('interest', 5))
D('advance', 'coins', 'A Small Advance', 'Küçük Bir Avans', 'เบิกล่วงหน้านิดหน่อย', 'small_print', F('debtCut', 30))
D('muscle', 'power', 'Borrowed Muscle', 'Ödünç Kas', 'กล้ามยืมมา', 'short_candle', E('patMult', 0.5, pattern='all'))
D('overdrive', 'power', 'Overdrive', 'Tam Gaz', 'เร่งเครื่อง', 'ash_rain', E('symMult', 0.5, sym='all'))
D('big_lines', 'power', 'Grand Designs', 'Büyük Planlar', 'แผนการใหญ่', 'hairline_crack', E('patMult', 3, pattern='big'))
D('lucky_break', 'luck', 'Lucky Break', 'Şans Kapısı', 'โชคหล่นทับ', 'blindfold', E('luck', 3))
D('loaded', 'luck', 'A Thumb on the Scale', 'Teraziye Parmak', 'นิ้วโป้งบนตาชั่ง', 'cold_feet', E('luck', 4))
D('star_sign', 'luck', 'Star Sign', 'Burç', 'ดาวประจำราศี', 'moth_eaten', F('pickFav'))
D('extra_slot', 'slot', 'Room for One More', 'Bir Kişilik Yer', 'ที่ว่างอีกหนึ่ง', 'fever', E('slot', 1))
D('big_pockets', 'slot', 'Deep Pockets', 'Derin Cepler', 'กระเป๋าลึก', 'brittle_nerves', F('trickPockets', 2), E('trick', 2))
D('wide_shelf', 'slot', 'Wide Shelf', 'Geniş Raf', 'ชั้นกว้าง', 'random', E('slot', 1))
D('green_night', 'wild', 'Green Night', 'Yeşil Gece', 'คืนสีเขียว', 'smoke_hole', E('weight', 3, sym='wisp'))
D('false_face', 'wild', 'False Face', 'Sahte Yüz', 'หน้าปลอม', 'jinx', F('maskWild'))
D('ghost_hire', 'wild', 'Hired Ghosts', 'Kiralık Hayaletler', 'ผีรับจ้าง', 'the_tithe', F('ghostHire'))
D('borrowed_time', 'time', 'Borrowed Time', 'Ödünç Zaman', 'เวลายืมมา', 'small_print', F('roundsAdd', 1))
D('long_wick', 'time', 'Long Wick', 'Uzun Fitil', 'ไส้เทียนยาว', 'dead_weight', F('spinsRound', 1))
D('snooze', 'time', 'Snooze', 'Erteleme', 'ขอเลื่อน', 'random', F('extraLife'))
D('free_market', 'shop', 'Friends and Family Rate', 'Eş Dost Fiyatı', 'ราคากันเอง', 'sticky_fingers', F('shopDiscount', 30))
D('backroom', 'shop', 'Back Room', 'Arka Oda', 'ห้องหลังร้าน', 'dear_prices', E('gainCharm', rarity='rare'))
D('fire_sale', 'shop', 'Fire Sale', 'Yangından Mal', 'ลดล้างสต๊อก', 'shackle', E('wick', 8))
D('crowned', 'symbol', 'Paper Coronation', 'Kâğıt Taç Töreni', 'สวมมงกุฎกระดาษ', 'moth_eaten', E('symValue', 8, sym='crown'), E('weight', 2, sym='crown'))
D('purge_two', 'symbol', 'Spring Cleaning', 'Bahar Temizliği', 'ล้างบ้านครั้งใหญ่', 'hairline_crack', E('removeSymbol', 2))
D('black_envelope', 'mystery', 'The Black Envelope', 'Kara Zarf', 'ซองดำ', 'random', E('gainCharm', rarity='legendary'), n=2)

# ---------- tricks ----------
tricks = []
def TK(i, when_, cur, pr, en, tr, th, d_en, d_tr, d_th, **op):
    assert 'trick/' + i in ICONS, i
    tricks.append(dict(id=i, name=T(en, tr, th), icon='trick/' + i, when=when_, price={cur: pr}, op=op, text=T(d_en, d_tr, d_th)))
TK('nudge', 'post', 'coins', 3, 'Nudge', 'Dürtme', 'สะกิด', 'Slide one column down by one cell. The bottom symbol wraps to the top.', 'Bir sütunu bir hücre aşağı kaydır. Alttaki sembol üste geçer.', 'เลื่อนหนึ่งแถวตั้งลงหนึ่งช่อง ตัวล่างสุดวนขึ้นบน', type='shiftColumn', n=1)
TK('pin', 'post', 'coins', 3, 'Thumbtack', 'Raptiye', 'หมุดปัก', 'Pin one column. It stays as it is for the next spin.', 'Bir sütunu iğnele. Sonraki çevirişte olduğu gibi kalır.', 'ปักหมุดหนึ่งแถวตั้ง ตาถัดไปแถวนั้นไม่หมุน', type='holdColumn')
TK('row_arrow', 'post', 'coins', 4, 'Do-over', 'Baştan', 'ขอใหม่', 'Spin one row again. You must keep the new row.', 'Bir sırayı yeniden çevir. Yeni sırayı kabul etmek zorundasın.', 'หมุนหนึ่งแถวนอนใหม่ ต้องรับผลใหม่', type='respinRow')
TK('double_stamp', 'post', 'coins', 5, 'Double Stamp', 'Çift Damga', 'ตราประทับคู่', 'The best pattern of this spin pays twice.', 'Bu çevirişin en iyi deseni iki kez öder.', 'ลายที่ดีที่สุดของตานี้จ่ายสองครั้ง', type='retriggerBest')
TK('swap', 'post', 'coins', 3, 'Switcheroo', 'Değiş Tokuş', 'สลับที่', 'Swap two cells that touch.', 'Birbirine değen iki hücreyi değiştir.', 'สลับสองช่องที่ติดกัน', type='swapAdjacent')
TK('brush', 'post', 'coins', 5, 'Green Brush', 'Yeşil Fırça', 'พู่กันเขียว', 'Paint one cell into the Favourite.', 'Bir hücreyi Gözdeye boya.', 'ทาหนึ่งช่องให้เป็นตัวโปรด', type='setCell', to='favoured')
TK('broom', 'post', 'coins', 3, 'Straw Broom', 'Saz Süpürge', 'ไม้กวาดฟาง', 'Sweep every Ash off the grid. Those cells spin again.', 'Izgaradaki tüm Külleri süpür. O hücreler yeniden çevrilir.', 'กวาดเถ้าทั้งหมดออก ช่องเหล่านั้นหมุนใหม่', type='rerollSymbol', sym='ash')
TK('hourglass', 'any', 'wick', 2, 'Hourglass', 'Kum Saati', 'นาฬิกาทราย', '+2 spins this round.', 'Bu el +2 çeviriş.', 'รอบนี้ได้ +2 ตา', type='spins', n=2)
TK('ice', 'any', 'coins', 2, 'Ice Cube', 'Buz Küpü', 'น้ำแข็งก้อน', 'Heat −4.', 'Ateş −4.', 'ไฟ −4', type='heat', n=-4)
TK('chili', 'pre', 'coins', 4, 'Chili', 'Acı Biber', 'พริกขี้หนู', 'Heat +3. The next spin cannot Scorch.', 'Ateş +3. Sonraki çeviriş Kavrulamaz.', 'ไฟ +3 ตาถัดไปจะไม่ไหม้เกรียม', type='heat', n=3, noScorch=True)
TK('pocket', 'post', 'coins', 4, 'Sleeve Pocket', 'Yen Cebi', 'กระเป๋าแขนเสื้อ', 'Take one symbol off the grid and keep it. Use again later to put it in any cell.', 'Izgaradan bir sembol al ve sakla. Sonra yeniden kullanıp istediğin hücreye koy.', 'หยิบสัญลักษณ์หนึ่งตัวเก็บไว้ ใช้อีกครั้งเพื่อวางลงช่องใดก็ได้', type='stash')
TK('stencil', 'post', 'coins', 5, 'Stencil', 'Şablon', 'แม่พิมพ์ฉลุ', 'One cell becomes a Wisp for this spin.', 'Bir hücre bu çeviriş için Cin Ateşi olur.', 'หนึ่งช่องกลายเป็นผีโขมดในตานี้', type='setCell', to='wisp')
TK('wish_coin', 'pre', 'coins', 3, 'Wish Coin', 'Dilek Parası', 'เหรียญอธิษฐาน', '+5 Luck on the next spin.', 'Sonraki çevirişte +5 Şans.', 'ตาถัดไปโชค +5', type='luck', n=5, scope='spin')
TK('kit', 'shop', 'wick', 2, 'Tool Roll', 'Alet Çantası', 'ม้วนเครื่องมือ', 'One bench job is free. Use it at the bench.', 'Bir tezgâh işi bedava. Tezgâhta kullan.', 'งานโต๊ะช่างฟรีหนึ่งงาน ใช้ที่โต๊ะช่าง', type='freeBench')
TK('token', 'pre', 'coins', 5, 'Spiral Token', 'Sarmal Jeton', 'เบี้ยก้นหอย', 'You choose the Favourite for the next spin.', 'Sonraki çevirişin Gözdesini sen seçersin.', 'เลือกตัวโปรดของตาถัดไปเอง', type='pickFav')
TK('horn', 'pre', 'coins', 5, 'Party Horn', 'Düdük', 'แตรปาร์ตี้', 'All pattern mults +2 on the next spin.', 'Sonraki çevirişte tüm desen çarpanları +2.', 'ตาถัดไปตัวคูณทุกลาย +2', type='patMult', n=2, scope='spin')
TK('hand_mirror', 'post', 'coins', 4, 'Hand Mirror', 'El Aynası', 'กระจกมือ', 'Copy one cell onto a cell next to it.', 'Bir hücreyi yanındaki hücreye kopyala.', 'คัดลอกหนึ่งช่องไปยังช่องข้างเคียง', type='copyAdjacent')
TK('loan_note', 'any', 'coins', 0, 'Thumbprint Note', 'Parmak İzli Senet', 'ตั๋วประทับนิ้ว', 'Gain coins equal to 15% of this debt now. The next debt is 10% larger.', "Hemen bu borcun %15'i kadar para al. Sıradaki borç %10 büyür.", 'รับเหรียญ 15% ของหนี้นี้ทันที หนี้ถัดไปเพิ่ม 10%', type='loan', gainPct=15, nextDebtPct=10)
TK('salt', 'any', 'wick', 4, 'Salt', 'Tuz', 'เกลือ', 'Your curses do nothing for the rest of this round.', 'Lanetlerin bu elin sonuna kadar etkisiz kalır.', 'คำสาปทั้งหมดไม่มีผลจนจบรอบนี้', type='muteCurses', scope='round')
TK('spare_candle', 'auto', 'wick', 6, 'Spare Candle', 'Yedek Mum', 'เทียนสำรอง', 'If you miss a deadline, this burns and you get 1 extra round.', 'Vadeyi kaçırırsan bu yanar ve 1 ek el kazanırsın.', 'ถ้าจ่ายไม่ทัน เทียนนี้จะไหม้แล้วได้เพิ่ม 1 รอบ', type='saveDeadline')

# ---------- stakes ("terms" cards on screen; the word stake is never shown) ----------
stakes = []
def ST(i, icon, spins, w, minDebt, en, tr, th, *effects):
    assert icon in ICONS, icon
    tx = {}
    for l in L:
        parts = [T('%d spins', '%d çeviriş', '%d ตา')[l] % spins] + [eff(e, l) for e in effects]
        tx[l] = '. '.join(p[0].upper() + p[1:] for p in parts) + '.' if l != 'th' else ' '.join(parts)
    stakes.append(dict(id=i, name=T(en, tr, th), icon=icon, spins=spins, weight=w, minDebt=minDebt, effects=list(effects), text=tx))
ST('steady', 'stake/steady', 5, 10, 1, 'Steady Night', 'Sakin Gece', 'คืนเรียบๆ')
ST('short_fuse', 'stake/short', 3, 8, 1, 'Short Fuse', 'Kısa Fitil', 'ชนวนสั้น', E('allMult', 2, scope='round'))
ST('wick_run', 'stake/wick', 3, 8, 1, 'Wick Run', 'Fitil Seferi', 'เก็บไส้เทียน', E('wick', 6))
ST('long_night', 'stake/long', 6, 8, 1, 'Long Night', 'Uzun Gece', 'คืนยาว', F('ashBase', 3))
ST('lucky_draw', 'stake/luck', 4, 8, 1, 'Wishbone Night', 'Lades Gecesi', 'คืนกระดูกอธิษฐาน', E('luck', 3, scope='round'))
ST('two_faces', 'stake/double', 5, 6, 2, 'Two Faces', 'İki Yüz', 'สองหน้า', F('smallDead'), F('bigX', 3))
ST('market_night', 'stake/shop', 4, 6, 1, 'Market Night', 'Pazar Gecesi', 'คืนตลาดนัด', F('shopExtra'))
ST('cold_iron', 'stake/cold', 5, 6, 2, 'Cold Iron', 'Soğuk Demir', 'เหล็กเย็น', F('noStoke'), E('interest', 5, scope='round'))
ST('wild_night', 'stake/wild', 4, 6, 2, 'Ghost Night', 'Hayalet Gecesi', 'คืนผีออก', E('weight', 4, sym='wisp', scope='round'))
ST('hot_coals', 'ui/heat', 5, 6, 2, 'Hot Coals', 'Kor Yatağı', 'ลุยถ่านแดง', E('heat', 4), F('heatNoCool'))
ST('bank_holiday', 'ui/btn_bank', 4, 5, 3, "Collector's Day Off", 'Tahsildarın İzin Günü', 'วันหยุดคนทวงหนี้', F('bankX', 1.25))
ST('mirror_night', 'trick/hand_mirror', 4, 5, 3, 'Mirror Night', 'Ayna Gecesi', 'คืนกระจก', F('lastTwice'))

# ---------- contracts ----------
BASE = [60, 150, 400, 1000, 2600, 7000, 20000, 60000, 200000]
SCALE = [1, 2, 4, 8, 18, 40, 100, 250, 600]
contracts = []
def CT(n, en, tr, th, debts, mul, wax, *effects, ending=None):
    tx = {l: ('; '.join(eff(e, l) for e in effects) or T('No extra rules', 'Ek kural yok', 'ไม่มีกฎเพิ่ม')[l]) for l in L}
    tx = {l: v[0].upper() + v[1:] + ('' if l == 'th' else '.') for l, v in tx.items()}
    contracts.append(dict(id='c%d' % n, tier=n, name=T(en, tr, th), debts=[round(BASE[i] * mul) for i in range(debts)], rounds=3, debtMul=mul, rewardWax=wax,
                          unlockAfter=('c%d' % (n - 1)) if n > 1 else None, rules=list(effects), ending=ending, text=tx))
CT(1, 'The Starter Pact', 'Başlangıç Ahdi', 'สัญญาแรกเข้า', 5, 1, 20)
CT(2, 'Standard Terms', 'Standart Şartlar', 'เงื่อนไขมาตรฐาน', 6, 1, 30)
CT(3, 'The Full Ledger', 'Tam Defter', 'บัญชีเต็มเล่ม', 8, 1, 50, ending='paid_in_full')
CT(4, 'Short Wick', 'Kısa Fitil Ahdi', 'สัญญาไส้สั้น', 8, 1, 60, F('spinsLess', 1))
CT(5, 'Dry Season', 'Kurak Mevsim', 'หน้าแล้ง', 8, 1.25, 70, F('interestHalf'))
CT(6, 'Cinder Week', 'Kül Haftası', 'สัปดาห์ขี้เถ้า', 8, 1.25, 80, F('ashBase', 2), F('scorchBurn', 20))
CT(7, 'Head Office Audit', 'Merkez Denetimi', 'สำนักงานใหญ่มาตรวจ', 8, 1.5, 100, F('startCurses', 1), ending='bought_the_machine')
CT(8, 'Thin Shelves', 'Boş Raflar', 'ชั้นวางโล่ง', 8, 1.5, 120, F('shopOffers', 3), F('rerollDouble'))
CT(9, 'Two Nights Only', 'Yalnızca İki Gece', 'สองคืนเท่านั้น', 8, 1.5, 150, F('rounds', 2))
CT(10, 'New Management', 'Yeni Yönetim', 'ผู้บริหารชุดใหม่', 9, 2, 250, F('startCurses', 2), F('mustSign'), ending='new_management')
contracts[8]['rounds'] = 2
contracts[0]['debts'][3:5] = [650, 1300]  # the starter contract is an on-ramp: sim-quick greedy clears about 60% (was 25% at 1000/2600)
BOSSES = [
    ('auditor', 'The Auditor', 'Müfettiş', 'ผู้ตรวจบัญชี', F('smallHalf')),
    ('collector', 'The Collector', 'Tahsildar', 'คนทวงหนี้', F('ashBase', 3)),
    ('veiled_clerk', 'The Veiled Clerk', 'Peçeli Kâtip', 'เสมียนคลุมหน้า', F('hideFav')),
    ('miser', 'The Miser', 'Cimri', 'ตาเฒ่าขี้เหนียว', F('noInterest')),
    ('timekeeper', 'The Timekeeper', 'Saat Bekçisi', 'คนคุมเวลา', F('spinsLess', 1)),
    ('head_inspector', 'The Head Inspector', 'Baş Müfettiş', 'หัวหน้าผู้ตรวจ', F('smallDead')),
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
   'The lantern girl. +1 Luck. Starts with a Nudge.', 'Fenerci kız. +1 Şans. Bir Dürtme ile başlar.', 'เด็กสาวถือโคม โชค +1 เริ่มพร้อมสะกิดหนึ่งชิ้น', R(P, None, E('luck', 1)))
CH('tao', 'Tao', 'Tao', 'เต๋า', 'ach:contract_1', dict(wick=3, tricks=['chili'], charms=['matchbox'], curses=0, slots=5),
   'He lit the wrong match. Every round starts at Heat 3 and each Heat level pays +20%.', 'Yanlış kibriti o çaktı. Her el Ateş 3 ile başlar, her Ateş seviyesi +%20 öder.', 'คนจุดไม้ขีดผิดก้าน ทุกรอบเริ่มที่ไฟ 3 และไฟแต่ละระดับจ่าย +20%', R(P, None, F('startHeat', 3), F('heatStep', 20)))
CH('bua', 'Auntie Bua', 'Bua Teyze', 'ป้าบัว', 'ach:reach_debt_6', dict(wick=3, tricks=['wish_coin'], charms=[], curses=0, slots=4),
   'Reads the leaves. She picks the Favourite on the first spin of each round. One charm slot fewer.', 'Fal bakar. Her elin ilk çevirişinde Gözdeyi o seçer. Bir tılsım yuvası eksik.', 'หมอดูใบชา เลือกตัวโปรดเองในตาแรกของทุกรอบ ช่องเครื่องรางน้อยลงหนึ่ง', R(P, None, F('pickFirstFav')))
CH('rattle', 'Doc Rattle', 'Doktor Tıkırtı', 'หมอกรุ๊งกริ๊ง', 'ach:curses_4', dict(wick=3, tricks=['salt'], charms=[], curses=1, slots=5),
   'The bone-setter. Starts with one curse. Every curse gives all symbols +0.25 mult. Tooth value +3.', 'Kırıkçı. Bir lanetle başlar. Her lanet tüm sembollere +0.25 çarpan verir. Diş değeri +3.', 'หมอต่อกระดูก เริ่มพร้อมคำสาปหนึ่งอย่าง คำสาปแต่ละอย่างให้ตัวคูณทุกสัญลักษณ์ +0.25 ค่าฟัน +3', R(P, None, E('symMult', 0.25, sym='all', per='curses'), E('symValue', 3, sym='tooth')))
CH('sok', 'Old Sok', 'İhtiyar Sok', 'ลุงสก', 'ach:interest_total', dict(wick=0, tricks=[], charms=['abacus'], curses=0, slots=5),
   'The pawnbroker. Interest +5%. Sells charms for the full price. Starts with no Wick.', 'Rehinci. Faiz +5 puan. Tılsımları tam fiyatına satar. Fitilsiz başlar.', 'เจ้าของโรงรับจำนำ ดอกเบี้ย +5% ขายเครื่องรางได้เต็มราคา เริ่มโดยไม่มีไส้เทียน', R(P, None, E('interest', 5), F('sellFull')))
CH('pip', 'Pip', 'Pip', 'ปิ๊บ', 'ach:contract_3', dict(wick=5, tricks=['loan_note'], charms=[], curses=1, slots=6),
   "Brimble's apprentice. Six charm slots and three deals to choose from, but he starts with one curse.", "Brimble'ın çırağı. Altı tılsım yuvası ve üç anlaşma seçeneği var, ama bir lanetle başlar.", 'ลูกมือของบริมเบิล มีช่องเครื่องรางหกช่องและข้อตกลงให้เลือกสามข้อ แต่เริ่มพร้อมคำสาปหนึ่งอย่าง', R(P, None, F('dealOffers', 3)))

# ---------- hideout ----------
hide = []
def H(i, cost, en, tr, th, d_en, d_tr, d_th, **effect):
    assert 'hide/' + i in ICONS
    hide.append(dict(id=i, name=T(en, tr, th), icon='hide/' + i, costWax=cost, order=len(hide) + 1, effect=effect, text=T(d_en, d_tr, d_th)))
H('cot', 0, 'Folding Cot', 'Portatif Yatak', 'เตียงพับ', 'Somewhere to sleep. Yours from the start.', 'Uyuyacak bir yer. Baştan beri senin.', 'ที่ซุกหัวนอน เป็นของเธอตั้งแต่แรก', type='none')
H('stove', 25, 'Pot-belly Stove', 'Göbekli Soba', 'เตาพุงป่อง', 'Start each run with one extra random trick.', 'Her oyuna fazladan bir rastgele numarayla başla.', 'เริ่มเกมทุกครั้งพร้อมกลเม็ดสุ่มเพิ่มหนึ่งชิ้น', type='startTrick', n=1)
H('shelf', 40, 'Crooked Shelf', 'Yamuk Raf', 'ชั้นวางเบี้ยว', 'At run start, pick 1 of 3 common charms.', 'Oyun başında 3 sıradan tılsımdan 1 tanesini seç.', 'ตอนเริ่มเกม เลือกเครื่องรางธรรมดา 1 จาก 3 ชิ้น', type='startCharmPick', n=3)
H('lights', 60, 'String of Lanterns', 'Fener Dizisi', 'ราวโคมไฟ', 'The shop shows 5 charms instead of 4.', 'Dükkân 4 yerine 5 tılsım gösterir.', 'ร้านแสดงเครื่องราง 5 ชิ้นแทน 4', type='shopOffers', n=5)
H('workbench', 80, 'Workbench', 'Tezgâh', 'โต๊ะช่าง', 'The bench offers 3 jobs instead of 2.', 'Tezgâh 2 yerine 3 iş sunar.', 'โต๊ะช่างมีงานให้เลือก 3 งานแทน 2', type='benchOffers', n=3)
H('desk', 100, 'Writing Desk', 'Yazı Masası', 'โต๊ะเขียนหนังสือ', 'You see the next debt and its deals one debt early. One free reroll in every shop.', 'Sıradaki borcu ve anlaşmalarını bir borç önceden görürsün. Her dükkânda bir bedava yenileme.', 'เห็นหนี้ถัดไปและข้อตกลงล่วงหน้าหนึ่งหนี้ สุ่มร้านใหม่ฟรีหนึ่งครั้งทุกร้าน', type='foresight', freeRerolls=1)
H('keepsake', 120, 'Keepsake Box', 'Hatıra Kutusu', 'กล่องของที่ระลึก', 'After a run, keep one common or uncommon charm. It is offered at the start of your next run.', 'Oyun bitince sıradan ya da nadir bir tılsımı sakla. Sonraki oyunun başında sana sunulur.', 'จบเกมแล้วเก็บเครื่องรางธรรมดาหรือหายากไว้หนึ่งชิ้น จะถูกเสนอให้ตอนเริ่มเกมถัดไป', type='keepCharm')
H('moth_house', 150, 'Moth House', 'Güve Yuvası', 'บ้านแมลงเม่า', 'Start each run with +3 Wick.', 'Her oyuna +3 Fitil ile başla.', 'เริ่มเกมทุกครั้งพร้อม +3 ไส้เทียน', type='startWick', n=3)
H('mirror', 200, 'Standing Mirror', 'Boy Aynası', 'กระจกตั้งพื้น', 'Play any run from a seed code and share yours.', 'Herhangi bir oyunu tohum koduyla oyna, kendi kodunu paylaş.', 'เล่นเกมจากรหัสซี้ดได้ และแชร์รหัสของตัวเอง', type='seededRuns')
H('chair', 300, "Brimble's Armchair", "Brimble'ın Koltuğu", 'เก้าอี้นวมของบริมเบิล', 'He visits. Refusing a deal gives +5 Wick instead of +3, and he tells you things.', 'Ziyarete gelir. Anlaşmayı reddetmek +3 yerine +5 Fitil verir, bir şeyler de anlatır.', 'เขาแวะมาเยี่ยม ปฏิเสธข้อตกลงได้ +5 ไส้เทียนแทน +3 และเขาจะเล่าอะไรให้ฟัง', type='refuseWick', n=5, story=True)

# ---------- achievements ----------
STAT = {
    'debtsPaid': T('Pay {n} debts', '{n} borç öde', 'ปลดหนี้ {n} ก้อน'),
    'contract': T('Clear contract {n}', '{n}. sözleşmeyi bitir', 'จบสัญญาที่ {n}'),
    'reachDebt': T('Reach debt {n} in any contract', 'Herhangi bir sözleşmede {n}. borca ulaş', 'ไปถึงหนี้ก้อนที่ {n} ในสัญญาใดก็ได้'),
    'pattern:full': T('Score a Full Fair {n} time', '{n} kez Tam Panayır yap', 'ทำเต็มงาน {n} ครั้ง'),
    'pattern:cross': T('Score a Cross {n} time', '{n} kez Artı yap', 'ทำกากบาท {n} ครั้ง'),
    'pattern:vee': T('Score {n} Vees', '{n} V Yolu yap', 'ทำทางตัววี {n} ครั้ง'),
    'pattern:frame': T('Score a Frame {n} time', '{n} kez Çerçeve yap', 'ทำกรอบ {n} ครั้ง'),
    'patternsOneSpin': T('Score {n} patterns in one spin', 'Tek çevirişte {n} desen yap', 'ทำ {n} ลายในตาเดียว'),
    'spinCoins': T('Win {n} coins in one spin', 'Tek çevirişte {n} para kazan', 'ได้ {n} เหรียญในตาเดียว'),
    'heat10Spins': T('Spin {n} times at Heat 10', 'Ateş 10 iken {n} kez çevir', 'หมุน {n} ตาที่ไฟ 10'),
    'scorches': T('Survive {n} Scorches', '{n} Kavrulma atlat', 'รอดจากไหม้เกรียม {n} ครั้ง'),
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
    'wispsOneSpin': T('Land {n} Wisps in one spin', 'Tek çevirişte {n} Cin Ateşi indir', 'ได้ผีโขมด {n} ตัวในตาเดียว'),
    'luckReached': T('Reach {n} Luck', '{n} Şansa ulaş', 'โชคถึง {n}'),
    'favPatterns': T('Score {n} patterns of the Favourite', 'Gözde ile {n} desen yap', 'ทำลายด้วยตัวโปรด {n} ครั้ง'),
    'crownPatterns': T('Score {n} Crown patterns', '{n} Taç deseni yap', 'ทำลายมงกุฎ {n} ครั้ง'),
    'charmsBought': T('Buy {n} charms', '{n} tılsım al', 'ซื้อเครื่องราง {n} ชิ้น'),
    'charmsSold': T('Sell {n} charms', '{n} tılsım sat', 'ขายเครื่องราง {n} ชิ้น'),
    'dailyRuns': T('Finish {n} daily runs', '{n} günlük oyun bitir', 'เล่นเกมประจำวันจบ {n} ครั้ง'),
    'charWins': T('Clear a contract with {n} different characters', '{n} farklı karakterle sözleşme bitir', 'จบสัญญาด้วยตัวละคร {n} ตัว'),
    'familyFull': T('Hold {n} charms of one family', 'Aynı aileden {n} tılsım taşı', 'ถือเครื่องรางตระกูลเดียวกัน {n} ชิ้น'),
    'hideout': T('Build {n} hideout pieces', 'Sığınağa {n} eşya koy', 'สร้างของในที่ซ่อน {n} ชิ้น'),
}
ach = []
CID = {c['id']: c for c in charms}; CHID = {c['id'] for c in chars}
def A(i, stat, n, en, tr, th, **reward):
    if 'charm' in reward:
        assert CID[reward['charm']]['unlock'] is None, reward
        CID[reward['charm']]['unlock'] = 'ach:' + i
    if 'char' in reward: assert reward['char'] in CHID
    ach.append(dict(id=i, name=T(en, tr, th), cond=dict(stat=stat, gte=n), reward=reward,
                    text={l: STAT[stat][l].replace('{n}', format(n, ',')) + '.' for l in L}))
A('first_debt', 'debtsPaid', 1, 'First Instalment', 'İlk Taksit', 'งวดแรก', wax=5)
A('debts_50', 'debtsPaid', 50, 'Regular Customer', 'Müdavim', 'ลูกค้าประจำ', wax=40)
A('contract_1', 'contract', 1, 'Signed and Paid', 'İmzalandı, Ödendi', 'เซ็นแล้วจ่ายแล้ว', char='tao')
A('contract_2', 'contract', 2, 'Standard Customer', 'Standart Müşteri', 'ลูกค้ามาตรฐาน', charm='small_fry_union')
A('contract_3', 'contract', 3, 'Paid in Full', 'Tamamı Ödendi', 'จ่ายครบ', char='pip')
A('contract_4', 'contract', 4, 'Short Work', 'Kısa İş', 'งานสั้น', charm='powder_trail')
A('contract_5', 'contract', 5, 'Dry Spell', 'Kuraklık', 'ฝนแล้ง', charm='compound_tooth')
A('contract_6', 'contract', 6, 'Out of the Ashes', 'Küllerinden', 'ลุกจากกองเถ้า', charm='scapegoat_bell')
A('contract_7', 'contract', 7, 'Audited', 'Denetimden Geçti', 'ผ่านการตรวจ', charm='blood_ink')
A('contract_8', 'contract', 8, 'Bare Shelves', 'Çıplak Raflar', 'ชั้นเปล่า', charm='fair_tapestry')
A('contract_9', 'contract', 9, 'Two Nights', 'İki Gece', 'สองคืน', charm='paper_king')
A('contract_10', 'contract', 10, 'Under New Management', 'Yeni Yönetim Altında', 'เปลี่ยนผู้บริหาร', wax=200)
A('reach_debt_6', 'reachDebt', 6, 'Deep In', 'Boğazına Kadar', 'ถลำลึก', char='bua')
A('full_fair', 'pattern:full', 1, 'The Whole Fair', 'Bütün Panayır', 'ทั้งงานวัด', charm='dust_queen')
A('cross_1', 'pattern:cross', 1, 'Cross My Heart', 'Kalbim Üstüne', 'สาบานด้วยใจ', charm='crooked_loom')
A('vee_5', 'pattern:vee', 5, 'Down and Up', 'İn Çık', 'ลงแล้วขึ้น', charm='master_stitch')
A('frame_1', 'pattern:frame', 1, 'Picture Frame', 'Resim Çerçevesi', 'กรอบรูป', wax=30)
A('six_patterns', 'patternsOneSpin', 6, 'Busy Night', 'Yoğun Gece', 'คืนงานชุก', charm='ghost_parade')
A('spin_1k', 'spinCoins', 1000, 'Big Spin', 'Büyük Çeviriş', 'หมุนใหญ่', charm='furnace_heart')
A('spin_100k', 'spinCoins', 100000, 'Absurd Spin', 'Akıl Almaz Çeviriş', 'หมุนเหลือเชื่อ', wax=50)
A('heat_10', 'heat10Spins', 10, 'Boiling Point', 'Kaynama Noktası', 'จุดเดือด', charm='fire_eater')
A('scorch_10', 'scorches', 10, 'Well Done', 'İyi Pişmiş', 'สุกทั่ว', charm='martyr_splinter')
A('curses_4', 'cursesHeld', 4, 'Bad Company', 'Kötü Arkadaşlar', 'คบคนพาล', char='rattle')
A('curses_8', 'cursesHeld', 8, 'Walking Hex', 'Yürüyen Büyü', 'อาถรรพ์เดินได้', charm='cracked_mirror')
A('deals_10', 'dealsSigned', 10, 'Repeat Signer', 'İmza Bağımlısı', 'นักเซ็นตัวยง', charm='firm_handshake')
A('refuse_10', 'dealsRefused', 10, 'No, Thank You', 'Yok, Sağ Ol', 'ไม่เอา ขอบคุณ', charm='cosigner')
A('clean_contract', 'cleanContract', 1, 'Clean Hands', 'Temiz Eller', 'มือสะอาด', charm='fixed_star')
A('interest_total', 'interestTotal', 5000, 'Money Makes Money', 'Para Parayı Çeker', 'เงินต่อเงิน', char='sok')
A('early_10', 'earlyPays', 10, 'Ahead of Schedule', 'Vadesinden Önce', 'ก่อนกำหนด', charm='brass_goose')
A('exact_change', 'exactChange', 1, 'To the Coin', 'Kuruşu Kuruşuna', 'เป๊ะทุกเหรียญ', charm='dividend_slip')
A('tricks_50', 'tricksUsed', 50, 'Light Fingers', 'Eli Çabuk', 'มือไว', charm='tuned_gears')
A('tricks_3', 'tricksOneSpin', 3, 'Triple Play', 'Üçlü Numara', 'สามกลในตาเดียว', charm='clockwork_thumb')
A('removed_5', 'symbolsRemoved', 5, 'Less Is More', 'Az Olsun Öz Olsun', 'น้อยแต่มาก', charm='scrap_heap')
A('wisps_5', 'wispsOneSpin', 5, 'Green Sky', 'Yeşil Gök', 'ฟ้าเขียว', charm='green_dawn')
A('luck_12', 'luckReached', 12, 'Charmed Life', 'Şanslı Doğmuş', 'ดวงดีแต่เกิด', charm='twin_stars')
A('fav_100', 'favPatterns', 100, 'House Favourite', 'Evin Gözdesi', 'ตัวโปรดขาประจำ', charm='second_sight')
A('crown_20', 'crownPatterns', 20, 'Royal Habit', 'Kraliyet Alışkanlığı', 'ติดนิสัยเจ้า', charm='throne')
A('family_5', 'familyFull', 5, 'Family Business', 'Aile Şirketi', 'ธุรกิจครอบครัว', charm='coronation')
A('bought_100', 'charmsBought', 100, 'Hoarder', 'İstifçi', 'นักสะสม', charm='paupers_parade')
A('sold_30', 'charmsSold', 30, 'Pawn Star', 'Rehin Ustası', 'เซียนจำนำ', charm='changeling')
A('daily_7', 'dailyRuns', 7, 'Seven Nights', 'Yedi Gece', 'เจ็ดคืน', wax=50)
A('char_wins_6', 'charWins', 6, 'Everyone Pays', 'Herkes Öder', 'ทุกคนต้องจ่าย', wax=300)
A('hideout_10', 'hideout', 10, 'Home at Last', 'Nihayet Yuva', 'บ้านเสียที', wax=100)

# ---------- config ----------
config = dict(
    grid=dict(cols=5, rows=3),
    luck=dict(base=4, cap=12, favouredWeightMul='1 + luck', dudPity=1),
    heat=dict(max=10, payoutPerLevel=0.20, ashWeightPerLevel=2.0, coolAtRoundStart=2, scorchAsh=3, scorchBurnPct=10, scorchHeatDrop=3),
    interest=dict(basePct=8, capPctOfDebt=25),
    earlyPay=dict(wickPerUnusedRound=2, trickPerDebt=1),
    priceScale=SCALE,
    start=dict(coins=0, wick=3, charmSlots=5, charmSlotsMax=8, trickPockets=3, removedSymbolsMax=3),
    shop=dict(charmOffers=4, trickOffers=2, benchOffers=2, rerollBase=2, rerollStep=1, locks=1, sellPct=50, familyBias=2.5,
              rarityOdds=[dict(fromDebt=1, common=62, uncommon=30, rare=8, legendary=0), dict(fromDebt=3, common=50, uncommon=32, rare=15, legendary=3),
                          dict(fromDebt=6, common=38, uncommon=34, rare=21, legendary=7)],
              slotPriceWick=10),
    bench=[dict(id='polish', effect=dict(type='symValue', n=1), price=dict(coins=6), name=T('Polish', 'Cila', 'ขัดเงา'), text=T('One symbol: value +1.', 'Bir sembol: değer +1.', 'สัญลักษณ์หนึ่งชนิด: ค่า +1')),
           dict(id='weigh', effect=dict(type='weight', n=1.3), price=dict(coins=5), name=T('Load', 'Ağırlık', 'ถ่วงน้ำหนัก'), text=T('One symbol: weight +30%.', 'Bir sembol: ağırlık +%30.', 'สัญลักษณ์หนึ่งชนิด: น้ำหนัก +30%')),
           dict(id='gild', effect=dict(type='symMult', n=0.25), price=dict(wick=4), name=T('Gild', 'Yaldız', 'ปิดทอง'), text=T('One symbol: mult +0.25.', 'Bir sembol: çarpan +0.25.', 'สัญลักษณ์หนึ่งชนิด: ตัวคูณ +0.25')),
           dict(id='purge', effect=dict(type='removeSymbol', n=1), price=dict(wick=6), name=T('Pull Out', 'Sök', 'ถอดออก'), text=T('Remove one symbol from the machine for this run.', 'Bir sembolü bu oyun için makineden çıkar.', 'ถอดสัญลักษณ์หนึ่งชนิดออกจากเครื่องตลอดเกมนี้')),
           dict(id='lift', effect=dict(type='removeCurse', n=1), price=dict(wick=8), name=T('Lift a Curse', 'Lanet Kaldır', 'ถอนคำสาป'), text=T('Remove one curse of your choice.', 'Seçtiğin bir laneti kaldır.', 'ถอนคำสาปที่เลือกหนึ่งอย่าง'))],
    deals=dict(offers=2, refuseWick=3),
    bosses=bosses,
    symValueUpAtDebt=[3, 6],
    wax=dict(perDebtPaid=3, dailyRun=10),
    ads=dict(interstitialMinSeconds=180, interstitialOnlyAfterRun=True, rewardedPerDay=6, rewardedGrants=['shop_reroll', 'double_wax']),
    endings=[dict(id='paid_in_full', contract='c3', cond=None), dict(id='bought_the_machine', contract='c7', cond='dealsSigned == 0'), dict(id='new_management', contract='c10', cond='curses >= 5')],
    families=[dict(id=k, name=v) for k, v in FAM.items()],
)

# ---------- checks and write ----------
assert len(charms) >= 100 and len(bosses) == 6 and len(deals) == 24 and len(curses) == 16 and len(tricks) == 20 and len(stakes) == 12
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
files = dict(symbols=symbols, patterns=PAT, charms=charms, deals=deals, curses=curses, tricks=tricks, stakes=stakes, contracts=contracts,
             characters=chars, hideout=hide, achievements=ach, config=config)
os.makedirs(OUT, exist_ok=True)
for k, v in files.items():
    walk(v)
    with open(os.path.join(OUT, k + '.json'), 'w', encoding='utf-8', newline='\n') as f:
        if isinstance(v, list): f.write('{"%s": [\n' % k + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in v) + '\n]}\n')
        else: json.dump(v, f, ensure_ascii=False, indent=1)
    json.load(open(os.path.join(OUT, k + '.json'), encoding='utf-8'))
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')
print({k: len(v) for k, v in files.items()})
print(Counter(c['family'] for c in charms), Counter(c['rarity'] for c in charms), 'locked', sum(1 for c in charms if c['unlock']))
print('icons used', len({c['icon'] for c in charms}), 'of', len([i for i in ICONS if i.startswith('charm/')]))
for i in (0, 5, 8, 9, 23, 37, 40, 66, 85, 103): print(charms[i]['text'])
print(deals[10]['text'], deals[23]['text'], curses[1]['text'], stakes[5]['text'], contracts[5]['text'], sep='\n')
