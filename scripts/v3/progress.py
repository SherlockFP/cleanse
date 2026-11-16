# v3 progression data: stats, places, characters, Notebook, lockers, Postcards, Lessons, Milestones, Storm, goals, endings, achievements, cart upgrades.
# Every requirement is {stat, gte, id?} with a ready-made sentence in en/tr/th. Stats are listed once in stats.json (the shared vocabulary).
SCREENS = dict(run=T('in a run', 'bir oyunda', 'ในรอบเล่น'), map=T('on the map', 'haritada', 'บนแผนที่'), home=T('at Home', 'evde', 'ที่บ้าน'), stall=T('at the stall', 'tezgâhta', 'ที่แผง'),
               tin=T('at the Tin', "Teneke'de", 'ที่กระป๋องขนม'), phone=T('on the phone', 'telefonda', 'ทางโทรศัพท์'), lockers=T('at the Lockers', 'dolaplarda', 'ที่ตู้ล็อกเกอร์'), codex=T('in the Codex', 'Kodeks\'te', 'ในสมุดบันทึก'),
               notebook=T('in the Notebook', 'Defter\'de', 'ในสมุดโน้ต'))
STATS = {  # core stat name -> (label as a noun phrase so no plural grammar is needed, screen). Names are the ones src/core/meta.js accumulates in meta.stats.
    'debtsPaid': (T('Debts paid', 'Ödenen borç', 'หนี้ที่ปลด'), 'run'), 'runs': (T('Runs finished', 'Biten oyun', 'รอบที่เล่นจบ'), 'run'),
    'dealsSigned': (T('Deals signed in total', 'Toplam imzalanan anlaşma', 'ข้อตกลงที่เซ็นรวม'), 'phone'), 'redCalls': (T('Red calls taken', 'Alınan kırmızı arama', 'สายแดงที่รับ'), 'phone'),
    'hangUps': (T('Calls hung up', 'Kapatılan arama', 'สายที่วางไป'), 'phone'), 'calls': (T('Calls answered', 'Cevaplanan arama', 'สายที่รับ'), 'phone'),
    'tricksUsed': (T('Tricks used in total', 'Toplam kullanılan numara', 'กลเม็ดที่ใช้รวม'), 'run'), 'offerings': (T('Tips given at the Tin', "Teneke'de verilen bahşiş", 'ทิปที่ให้ที่กระป๋องขนม'), 'tin'),
    'stagesFriend': (T('Times a neighbour became a Friend', 'Bir komşunun Dost olma sayısı', 'จำนวนครั้งที่เพื่อนบ้านกลายเป็นเพื่อน'), 'tin'),
    'stage:8': (T('Times a neighbour became a Regular', 'Bir komşunun Müdavim olma sayısı', 'จำนวนครั้งที่เพื่อนบ้านกลายเป็นขาประจำ'), 'tin'),
    'visits': (T('Neighbours who dropped by the Tin', "Teneke'ye uğrayan komşu", 'เพื่อนบ้านที่แวะมากระป๋องขนม'), 'tin'), 'himOrMe': (T('Him or Me moments seen', 'Görülen O mu Ben mi anı', 'ครั้งที่เจอเลือกฉันหรือเขา'), 'tin'),
    'cursesHeld': (T('Most curses carried while paying a debt', 'Borç öderken taşınan en çok lanet', 'คำสาปมากสุดที่แบกตอนปลดหนี้'), 'run'),
    'charmsBought': (T('Charms bought in total', 'Toplam alınan tılsım', 'ไอเท็มที่ซื้อรวม'), 'stall'), 'upgrades': (T('Cart upgrades bought', 'Alınan araba yükseltmesi', 'อัปเกรดรถเข็นที่ซื้อ'), 'stall'),
    'benchJobs': (T('Bench jobs done', 'Yaptırılan tezgâh işi', 'งานโต๊ะช่างที่ใช้'), 'stall'), 'interestTotal': (T('Interest earned in total', 'Toplam kazanılan faiz', 'ดอกเบี้ยที่ได้รวม'), 'run'),
    'coinsEarned': (T('Coins earned in total', 'Toplam kazanılan para', 'เหรียญที่หาได้รวม'), 'run'), 'scorches': (T('Flare-ups survived', 'Atlatılan Parlama', 'ไฟลุกที่รอดมา'), 'run'),
    'reachDebt': (T('Furthest debt reached', 'Ulaşılan en ileri borç', 'หนี้ที่ไปไกลสุด'), 'run'), 'fallRise': (T('Times you lost a run, then cleared a debt in the next', 'Bir oyunu kaybedip sonrakinde borç ödeme sayısı', 'จำนวนครั้งที่แพ้แล้วปลดหนี้ได้ในรอบถัดไป'), 'run'),
    'redEyes': (T('Red Eyes survived', 'Atlatılan Kırmızı Göz', 'ดวงตาแดงที่รอดมา'), 'run'), 'staredDown': (T('Red Eyes stared down with the Kiosk above half', 'Kiosk yarının üstündeyken atlatılan Kırmızı Göz', 'ดวงตาแดงที่รอดตอนตู้ฝากเงินเกินครึ่ง'), 'run'),
    'honks': (T('HONKs', 'KORNA sayısı', 'ครั้งที่บีบแตร'), 'run'), 'blends': (T('Charms blended', 'Karıştırılan tılsım', 'ไอเท็มที่ปั่นรวม'), 'stall'),
    'cleanContract': (T('Places cleared signing no deals', 'Anlaşma imzalamadan bitirilen yer', 'ด่านที่ผ่านโดยไม่เซ็นข้อตกลง'), 'map'), 'demands': (T('Errands done', 'Yapılan küçük iş', 'งานฝากที่ทำสำเร็จ'), 'tin'),
    'heat3Spins': (T('Spins at Spice 3 or more', 'Acı 3 ve üstünde çevirişler', 'ตาที่หมุนตอนเผ็ด 3 ขึ้นไป'), 'run'), 'signRefuse': (T('Runs where you signed one deal and refused another', 'Bir anlaşma imzalayıp birini reddettiğin oyunlar', 'รอบที่เซ็นข้อตกลงหนึ่งข้อและปฏิเสธอีกข้อ'), 'phone'),
    'dailyRuns': (T('Daily runs played', 'Oynanan günlük oyun', 'รอบรายวันที่เล่น'), 'home'),
}
# older names used while writing the rows below; each maps to the core stat above (and a stamp kind where needed)
ALIAS = {'regularReached': 'stage:8', 'regularKinds': 'stage:8', 'friendReached': 'stagesFriend', 'tipsMade': 'offerings', 'charmsOwned': 'charmsBought', 'cartUpgrades': 'upgrades',
         'banked': 'coinsEarned', 'sparesUsed': 'fallRise', 'cursesCarried': 'cursesHeld', 'cursesAtPay': 'cursesHeld', 'spiritsMet': 'visits', 'whiteCalls': 'calls'}
def RQ(stat, n=1, **kw):
    """-> (requirement in the shape of src/core/progress.js, sentence T). clear / lesson / lessons / stamps / lockers / storm are shapes of their own; everything else is {stat, gte}"""
    if stat == 'clear': return {'clear': kw['id']}, T('Clear %s' % PLN[kw['id']]['en'], '%s yerini bitir' % PLN[kw['id']]['tr'], 'ผ่าน%s' % PLN[kw['id']]['th'])
    if stat == 'storm': return {'storm': n}, T('Clear a place on Storm %d' % n, 'Fırtına %d\'de bir yeri bitir' % n, 'ผ่านด่านที่พายุ %d' % n)
    if stat == 'lesson': return {'lesson': n}, T('Finish the lesson "%s"' % LESSON_NAME[n]['en'], '"%s" dersini bitir' % LESSON_NAME[n]['tr'], 'เรียนบท "%s" ให้จบ' % LESSON_NAME[n]['th'])
    if stat == 'lessons': return {'lessons': n}, T('Lessons finished: %d' % n, 'Biten ders: %d' % n, 'บทเรียนที่จบ: %d' % n)
    if stat == 'lockers': return {'lockers': n}, T('Lockers opened: %d' % n, 'Açılan dolap: %d' % n, 'ตู้ที่เปิดแล้ว: %d' % n)
    kind = None
    if stat == 'stampsGold': stat, kind = 'stamps', 'gold'
    if stat == 'placesCleared': stat, kind = 'stamps', 'bronze'
    if stat == 'stamps':
        k = {'gold': T('Gold stamps', 'Altın mühür', 'ตราทอง'), 'bronze': T('Stamps (places cleared)', 'Mühür (bitirilen yer)', 'ตราประทับ (ด่านที่ผ่าน)'), None: T('Stamps earned', 'Kazanılan mühür', 'ตราประทับที่ได้')}[kind]
        d = {'stamps': n}
        if kind: d['kind'] = kind
        return d, T('%s: %d' % (k['en'], n), '%s: %d' % (k['tr'], n), '%s: %d' % (k['th'], n))
    stat = ALIAS.get(stat, stat)
    lab = STATS[stat][0]
    return {'stat': stat, 'gte': n}, T('%s: %s' % (lab['en'], num_fmt(n)), '%s: %s' % (lab['tr'], num_fmt(n)), '%s: %s' % (lab['th'], num_fmt(n)))
def REQ(stat, n=1, **kw): return RQ(stat, n, **kw)[1]
def num_fmt(n): return '{:,}'.format(n)

# ---------- places ----------
RANKS = [('Street Kid', 'Sokak Çocuğu', 'เด็กซอย'), ('Tray Hawker', 'Tepsi Satıcısı', 'คนหาบเร่'), ('Stall Owner', 'Tezgâh Sahibi', 'เจ้าของแผง'), ('Shop Owner', 'Dükkân Sahibi', 'เจ้าของร้าน'),
         ('Wholesaler', 'Toptancı', 'พ่อค้าส่ง'), ('Shophouse Owner', 'Dükkân Evi Sahibi', 'เจ้าของตึกแถว'), ('Club Partner', 'Kulüp Ortağı', 'หุ้นส่วนบีชคลับ'),
         ('Boutique Owner', 'Butik Sahibi', 'เจ้าของบูติก'), ('Developer', 'Müteahhit', 'นักพัฒนาที่ดิน'), ('Tycoon', 'Patron', 'เจ้าสัว')]
PLN = {c['id']: c['name'] for c in contracts}
PLACE_TEXT = {  # who Nim meets, what the local neighbour wants, a joke
 'c1': [('Nim meets Mr. Ruby at the burnt cart. He brought a folding table.', 'Nim, Bay Ruby ile yanık arabanın başında tanışır. Katlanır bir masa getirmiş.', 'นิ่มเจอมิสเตอร์รูบี้ที่รถเข็นไหม้ เขาแบกโต๊ะพับมาด้วย'),
        ('Mr. Ruby wants his paper signed and his Caps counted.', 'Bay Ruby kâğıdının imzalanmasını ve Kapaklarının sayılmasını istiyor.', 'มิสเตอร์รูบี้อยากให้เซ็นกระดาษและนับฝาขวดของเขา'),
        ('The cart is gone, but the plastic stool survived. It is now a desk.', 'Araba gitti ama plastik tabure kurtuldu. Şimdi masa.', 'รถเข็นหายไป แต่เก้าอี้พลาสติกรอด ตอนนี้เป็นโต๊ะทำงาน')],
 'c2': [('Uncle Wire sells fixes from a stall beside the railway tracks.', 'Tel Amca, demiryolunun yanındaki bir tezgâhta tamir satıyor.', 'ลุงสายไฟขายงานซ่อมที่แผงข้างรางรถไฟ'),
        ('Wire wants tricks and quiet nights.', 'Tel tüm numaraları ve sessiz geceleri istiyor.', 'ลุงสายไฟอยากได้กลเม็ดกับคืนเงียบๆ'),
        ('The trains are late. The market is early.', 'Trenler geç. Pazar erken.', 'รถไฟมาช้า แต่ตลาดเปิดเร็ว')],
 'c3': [('Chef Quack stirs the night\'s Special in a loud gold-street kitchen.', 'Şef Vak, gürültülü altın sokağı mutfağında gecenin Özel\'ini karıştırıyor.', 'เชฟกาบผัดเมนูเด็ดของคืนนี้ในครัวถนนทองที่เสียงดัง'),
        ('Quack wants new gadgets and a better Special than yesterday.', 'Vak yeni aletler ve dünden iyi bir Özel istiyor.', 'เชฟกาบอยากได้ของใช้ในครัวใหม่ๆ กับเมนูเด็ดที่ดีกว่าเมื่อวาน'),
        ('Everything glitters. Most of it is the wok.', 'Her şey parlıyor. Çoğu wok.', 'ทุกอย่างวิบวับ ส่วนใหญ่คือกระทะ')],
 'c4': [('Madam Receipt keeps the books for a street of hostels.', 'Bayan Fiş, bir hostel sokağının defterini tutuyor.', 'คุณนายใบเสร็จทำบัญชีให้ถนนที่เต็มไปด้วยโฮสเทล'),
        ('She wants plain coins and fair prices.', 'Düz para ve adil fiyat istiyor.', 'เธออยากได้เหรียญธรรมดากับราคาที่แฟร์'),
        ('Everyone has a rucksack. Nobody has a plan.', 'Herkesin sırt çantası var. Kimsenin planı yok.', 'ทุกคนมีเป้ แต่ไม่มีใครมีแผน')],
 'c5': [("Grandmother Tide's barge is the only thing moving on the promenade.", 'Gelgit Nine\'nin mavnası gezinti yolunda hareket eden tek şey.', 'เรือบรรทุกของยายน้ำขึ้นเป็นสิ่งเดียวที่ขยับบนทางเดินริมหาด'),
        ('She wants patience and a skipped night.', 'Sabır ve atlanan bir gece istiyor.', 'ยายอยากได้ความอดทนกับการข้ามคืนหนึ่งคืน'),
        ('The deck chairs are empty. The sea is open.', 'Şezlonglar boş. Deniz açık.', 'เก้าอี้ชายหาดว่างเปล่า แต่ทะเลเปิดอยู่')],
 'c6': [('Scrubby is wiping smoke off the night bazaar, one stall at a time.', 'Kazıcı gece pazarının dumanını tezgâh tezgâh siliyor.', 'แปรงขัดเช็ดควันออกจากตลาดกลางคืนทีละแผง'),
        ('It wants a charm or a curse to chew on.', 'Çiğnemek için bir tılsım ya da lanet istiyor.', 'มันอยากได้ไอเท็มหรือคำสาปไว้ขัดเล่น'),
        ('The haze is so thick even the bulbs look tired.', 'Duman o kadar yoğun ki ampuller bile yorgun.', 'หมอกควันหนาจนหลอดไฟยังดูเหนื่อย')],
 'c7': [('Lady Lamplit hangs over the beach club bar and hums.', 'Lamba Hanım plaj kulübü barının üstünde asılı, mırıldanıyor.', 'เจ๊หลอดไฟห้อยอยู่เหนือบาร์บีชคลับและฮัมเพลง'),
        ('She wants Spice and a dare.', 'Acı ve bir meydan okuma istiyor.', 'เจ๊อยากได้ความเผ็ดกับการท้า'),
        ('The cocktails are free. The ice is not.', 'Kokteyller bedava. Buz değil.', 'ค็อกเทลฟรี แต่น้ำแข็งไม่ฟรี')],
 'c8': [("Mr. Lost-and-Found minds the boutique's lost property by the river.", 'Kayıp Eşya Bey, nehir kenarındaki butiğin kayıp eşyalarına bakıyor.', 'พี่ของหายดูแลของหายของบูติกริมแม่น้ำ'),
        ('He wants charms to keep safe and nights to skip.', 'Saklamak için tılsımlar ve atlanacak geceler istiyor.', 'เขาอยากได้ไอเท็มไว้เก็บให้ปลอดภัยกับคืนที่ข้ามได้'),
        ('Rent by the river is high. The shelf is small.', 'Nehir kıyısında kira yüksek. Raf küçük.', 'ค่าเช่าริมแม่น้ำแพง ชั้นวางก็เล็ก')],
 'c9': [('Madam Receipt and Uncle Wire both turn up at the launch, in the same glass lobby.', 'Bayan Fiş ile Tel Amca açılışa geliyor, aynı cam lobide.', 'คุณนายใบเสร็จกับลุงสายไฟมางานเปิดตัวทั้งคู่ ในล็อบบี้กระจกเดียวกัน'),
        ('Both want the first sale.', 'İkisi de ilk satışı istiyor.', 'ทั้งคู่อยากได้ยอดขายแรก'),
        ('The scale model is perfect. The real tower is a month late.', 'Maket kusursuz. Gerçek kule bir ay gecikmiş.', 'โมเดลจำลองสมบูรณ์แบบ ตึกจริงช้าไปหนึ่งเดือน')],
 'c10': [('Mr. Ruby is behind the bar. The whole roof is his.', 'Bay Ruby barın arkasında. Bütün çatı onun.', 'มิสเตอร์รูบี้อยู่หลังบาร์ ดาดฟ้าทั้งหลังเป็นของเขา'),
         ('He wants one last signature.', 'Son bir imza istiyor.', 'เขาอยากได้ลายเซ็นสุดท้าย'),
         ('Sixty floors up, the paperwork has a view.', 'Altmış kat yukarıda evrakların manzarası var.', 'สูงขึ้นไปหกสิบชั้น เอกสารยังมีวิวสวยๆ')],
}
HOME_SCENE = {
 'c1': T('a mat, a crate and a cooking pot behind the cart', 'arabanın arkasında bir hasır, bir sandık ve bir tencere', 'เสื่อ ลังไม้ และหม้อหุงต้มหลังรถเข็น'),
 'c2': T('a push cart, a tray and string lights', 'bir el arabası, bir tepsi ve ampul zinciri', 'รถเข็น ถาด และไฟประดับ'),
 'c3': T('a gold-painted cart wheel and a shiny wok', 'altın boyalı bir araba tekerleği ve parlak bir wok', 'ล้อรถเข็นทาสีทองกับกระทะเงาวับ'),
 'c4': T('a canvas stall with a hand-painted sign', 'el boyaması tabelalı bir branda tezgâh', 'แผงผ้าใบพร้อมป้ายเขียนมือ'),
 'c5': T('a rented shop-front room', 'kiralık bir dükkân odası', 'ห้องหน้าร้านเช่า'),
 'c6': T('a small warehouse', 'küçük bir depo', 'โกดังเล็กๆ'),
 'c7': T('a two-storey shophouse', 'iki katlı bir dükkân evi', 'ตึกแถวสองชั้น'),
 'c8': T('a river-view office with a deck', 'terası olan nehir manzaralı bir ofis', 'ออฟฟิศวิวแม่น้ำพร้อมระเบียงไม้'),
 'c9': T('a glass-walled condo with a city view', 'şehir manzaralı cam duvarlı bir daire', 'คอนโดผนังกระจกวิวเมือง'),
 'c10': T('a penthouse that looks out over the whole map', 'bütün haritaya bakan bir çatı katı', 'เพนต์เฮาส์ที่มองเห็นทั้งแผนที่')}
LOCAL = {x['id']: x['local'] for x in SP}
SP_LOCAL = {}
for _s_ in SP:
    for _c in _s_['local']: SP_LOCAL.setdefault(_c, []).append(_s_['id'])
ENTER = {x['unlock']['c']: x['id'] for x in SP if 'c' in x['unlock']}
KEYS_FIRST = {'c2': 'silver', 'c5': 'silver', 'c7': 'silver'}
places = []
for _i, _c in enumerate(contracts):
    cid = _c['id']
    assert cid == 'c%d' % (_i + 1)
    places.append(dict(
        id=cid, order=_i + 1, contract=cid, name=_c['name'], icon='place/' + cid, bg='bg/fair' if cid == 'c1' else 'bg/' + cid,
        rank=dict(id='rank%d' % (_i + 1), name=T(*RANKS[_i])), debts=len(_c['debts']), nights=_c['rounds'], unlockAfter=_c['unlockAfter'],
        local=SP_LOCAL[cid], spiritsOnEnter=[ENTER[cid]] if cid in ENTER else [], localFirst=SP_LOCAL[cid][0],
        card=[T(*x) for x in PLACE_TEXT[cid]], home=HOME_SCENE[cid], homeBg=['bg/hideout', 'bg/hideout', 'bg/hideout', 'bg/home_2', 'bg/home_2', 'bg/home_2', 'bg/home_3', 'bg/home_3', 'bg/home_3', 'bg/home_4'][_i],
        firstClear=dict(stash=_c['rewardWax'], keys=dict(brass=1, **({KEYS_FIRST[cid]: 1} if cid in KEYS_FIRST else {}), **({'red': 1} if cid == 'c9' else {}))),
        story=_c['ending']))
assert len(places) == 10
places_file = dict(places=places, stamps=[
    dict(id='bronze', icon='ui/stamp_bronze', name=T('Bronze', 'Bronz', 'บรอนซ์'), rule=T('Clear the place.', 'Yeri bitir.', 'ผ่านด่าน'), stash=5),
    dict(id='silver', icon='ui/stamp_silver', name=T('Silver', 'Gümüş', 'เงิน'), rule=T('Clear it with no Flare-up.', 'Parlamasız bitir.', 'ผ่านโดยไม่มีไฟลุก'), stash=10),
    dict(id='gold', icon='ui/stamp_gold', name=T('Gold', 'Altın', 'ทอง'), rule=T('Clear it signing no deals.', 'Hiç anlaşma imzalamadan bitir.', 'ผ่านโดยไม่เซ็นข้อตกลงเลย'), stash=15)],
    map=dict(bg='bg/map', pin=dict(open='ui/map_pin', done='ui/pin_done', locked='ui/pin_locked'),
             rankUp=T('Level %d', 'Seviye %d', 'ระดับ %d')))

# ---------- new characters ----------
CH3 = []
def CHAR3(i, nm, intro, rules, req_stat, req_n, tie, tricks_=()):
    rules = list(rules)
    tt = text(rules)
    rules.append(R('onRunStart', None, E('favour', tie['favour'], spirit=tie['spirit'])))
    tt = text(rules)
    CH3.append(dict(id=i, name=T(*nm), icon='char/' + i, unlock='ach:crew_' + i, start=dict(wick=3, tricks=list(tricks_), charms=[], curses=0, slots=5), rules=rules,
                    text=T(*[intro[j] + ' ' + tt[l] for j, l in enumerate(L)]), tie=tie))
CHAR3('yai', ('Grandma Yai', 'Yai Nine', 'ยายใย'), ('The noodle seller who counts slowly and never loses.', 'Yavaş sayan ve asla kaybetmeyen makarnacı.', 'แม่ค้าก๋วยเตี๋ยวที่นับช้าๆ แต่ไม่เคยขาดทุน'),
      [pas(E('interest', 2), sflag('interestCapX', 1.5))], 'banked', 10000, dict(spirit='tide', favour=3))
CHAR3('beng', ('Beng', 'Beng', 'เบ็ง'), ('The moped-taxi boy who knows every shortcut.', 'Her kestirmeyi bilen moped taksi çocuğu.', 'เด็กวินมอไซค์ที่รู้ทุกทางลัด'),
      [pas(sflag('trickPockets', 1)), R('onDebtStart', None, E('trick', 1, id='nudge'))], 'tricksUsed', 100, dict(spirit='wire', favour=3))
CHAR3('pla', ('Pla', 'Pla', 'ปลา'), ('The young boxer who likes it hot.', 'Sıcağı seven genç boksör.', 'นักมวยสาวที่ชอบอะไรร้อนๆ'),
      [pas(sflag('startHeat', 2)), R('onScorch', None, E('wick', 1))], 'scorches', 20, dict(spirit='lamplit', favour=3))
CHAR3('mali', ('Mali', 'Mali', 'มะลิ'), ('The night-bus conductor who always keeps a spare.', 'Her zaman yedek tutan gece otobüsü biletçisi.', 'กระเป๋ารถเมล์กลางคืนที่มีของสำรองเสมอ'),
      [R('onDebtStart', None, E('trick', 1, id='spare_candle'))], 'sparesUsed', 3, dict(spirit='waiting', favour=3))
CHARNAME = {c['id']: c['name'] for c in chars + CH3}
chars_file = dict(characters=CH3)


# ---------- Lessons (numeric ids and a stat condition in the core's shape; the Brass keys of lessons 3 and 6 and the Silver key of 8 are granted by core/meta.js) ----------
LS = [  # n, name, goal, why, stash, cond, hand anchor, how-to card, system whose first sighting shows the first-time line
 (1, ('Spin and shapes', 'Çevir ve şekiller', 'หมุนและรูปทรง'), ('Land a Line of 4.', '4\'lü bir Sıra yakala.', 'ทำแถว 4 ให้ได้'), ('Longer shapes pay more.', 'Uzun şekiller daha çok öder.', 'ยิ่งรูปทรงยาวยิ่งได้เยอะ'), 10, ('pattern:h4', 1), 'pattern:0', 3, 'shapes'),
 (2, ('Spice Up', 'Acılandır', 'เพิ่มเผ็ด'), ('Spin once at Spice 3 or more.', 'Acı 3 veya üstündeyken bir kez çevir.', 'หมุนหนึ่งครั้งตอนเผ็ดตั้งแต่ 3 ขึ้นไป'), ('Spice adds pay. Soot is the price.', 'Acı ödemeyi artırır. Bedeli İs.', 'เผ็ดทำให้ได้เงินเพิ่ม ราคาที่ต้องจ่ายคือเขม่า'), 10, ('heat3Spins', 1), 'spiceUp', 6, 'spice'),
 (3, ('Bank and interest', 'Yatır ve faiz', 'ฝากและดอกเบี้ย'), ('Bank coins and earn interest once.', 'Para yatır ve bir kez faiz kazan.', 'ฝากเหรียญและรับดอกเบี้ยหนึ่งครั้ง'), ('Coins in the Kiosk are safe and earn interest.', 'Kiosk\'taki para güvende ve faiz kazanır.', 'เหรียญในตู้ฝากเงินปลอดภัยและได้ดอกเบี้ย'), 10, ('interestTotal', 1), 'kiosk', 7, 'kiosk'),
 (4, ('Charms and order', 'Tılsımlar ve sıra', 'ไอเท็มและลำดับ'), ('Buy 3 charms.', '3 tılsım satın al.', 'ซื้อไอเท็ม 3 ชิ้น'), ('Charms work from left to right.', 'Tılsımlar soldan sağa çalışır.', 'ไอเท็มทำงานจากซ้ายไปขวา'), 15, ('charmsBought', 3), 'stall.charm:0', 9, 'charms'),
 (5, ('Trick and pocket', 'Numara ve cep', 'กลเม็ดและกระเป๋า'), ('Use a trick.', 'Bir numara kullan.', 'ใช้กลเม็ดหนึ่งอัน'), ('A trick bends one spin, then it is gone.', 'Bir numara bir çevirişi büker, sonra biter.', 'กลเม็ดบิดผลได้หนึ่งตาแล้วก็หมดไป'), 15, ('tricksUsed', 1), 'pocket', 10, 'tricks'),
 (6, ('Meet a neighbour', 'Komşuyla tanış', 'ทำความรู้จักเพื่อนบ้าน'), ('Give your first tip at the Tin.', 'Teneke\'de ilk bahşişini ver.', 'ให้ทิปแรกที่กระป๋องขนม'), ('A tip they like wins Favour.', 'Sevdikleri bir bahşiş Hatır kazandırır.', 'ทิปที่เขาชอบทำให้ได้น้ำใจ'), 15, ('offerings', 1), 'tin.offer.coins.small', 12, 'tin'),
 (7, ('Sign or refuse', 'İmzala ya da reddet', 'เซ็นหรือปฏิเสธ'), ('Sign one deal and refuse another in one run.', 'Bir oyunda bir anlaşma imzala, birini reddet.', 'เซ็นข้อตกลงหนึ่งข้อและปฏิเสธอีกข้อในรอบเดียว'), ('A deal pays now and costs later.', 'Anlaşma şimdi öder, sonra tahsil eder.', 'ข้อตกลงให้ตอนนี้แต่เก็บทีหลัง'), 20, ('signRefuse', 1), 'deal.sign', 13, 'deal'),
 (8, ('Make a friend', 'Dost edin', 'ผูกมิตร'), ('Get one neighbour to Friend.', 'Bir komşuyu Dost seviyesine getir.', 'ทำให้เพื่อนบ้านหนึ่งคนถึงขั้นเพื่อน'), ('Friends help for the rest of the run.', 'Dostlar oyunun geri kalanında yardım eder.', 'เพื่อนช่วยเราไปตลอดรอบ'), 25, ('stagesFriend', 1), 'call.card:0', 11, 'stage'),
 (9, ('The bench', 'Tezgâh', 'โต๊ะช่าง'), ('Do one bench job.', 'Bir tezgâh işi yaptır.', 'ใช้งานโต๊ะช่างหนึ่งครั้ง'), ('The bench changes one symbol for the whole run.', 'Tezgâh bir sembolü bütün oyun için değiştirir.', 'โต๊ะช่างเปลี่ยนสัญลักษณ์หนึ่งชนิดไปตลอดรอบ'), 20, ('benchJobs', 1), 'stall.tab:bench', 9, 'bench'),
 (10, ('Fall and rise', 'Düş ve kalk', 'ล้มแล้วลุก'), ('Lose a run, then clear a debt in the next.', 'Bir oyunu kaybet, sonrakinde bir borç öde.', 'แพ้หนึ่งรอบแล้วปลดหนี้หนึ่งก้อนในรอบถัดไป'), ('A lost run still pays Stash. Go again.', 'Kaybedilen oyun da Birikim kazandırır. Tekrar dene.', 'รอบที่แพ้ก็ยังได้เงินเก็บ ลุยใหม่'), 20, ('fallRise', 1), 'lessons', 16, None),
 (11, ('HONK', 'KORNA', 'บีบแตร'), ('Fire an active charm with HONK.', 'Etkin bir tılsımı KORNA ile ateşle.', 'ใช้ไอเท็มกดใช้ด้วยการบีบแตร'), ('Active charms gain one charge at each round start.', 'Etkin tılsımlar her el başında bir şarj kazanır.', 'ไอเท็มกดใช้ได้ชาร์จเพิ่มหนึ่งทุกต้นรอบ'), 20, ('honks', 1), 'honk', 15, 'honk'),
 (12, ('Blend', 'Karıştır', 'ปั่นรวม'), ('Make a charm in the Blender.', 'Karıştırıcıda bir tılsım yap.', 'ปั่นไอเท็มหนึ่งชิ้นในเครื่องปั่น'), ('Two charms go in. One better charm comes out.', 'İki tılsım girer, daha iyi bir tılsım çıkar.', 'ใส่ไอเท็มสองชิ้น ได้ไอเท็มที่ดีกว่าออกมาหนึ่งชิ้น'), 20, ('blends', 1), 'blender', 16, 'blender'),
 (13, ('Stare it down', 'Gözünü kırpma', 'จ้องตอบ'), ('Survive a Red Eye with the Kiosk above half the debt.', 'Kiosk borcun yarısının üstündeyken bir Kırmızı Göz\'ü atlat.', 'รอดดวงตาแดงตอนที่ตู้ฝากเงินเกินครึ่งหนึ่งของหนี้'), ('Coins in the Kiosk are safe from a Red Eye.', 'Kiosk\'taki para Kırmızı Göz\'den güvende.', 'เหรียญในตู้ฝากเงินปลอดภัยจากดวงตาแดง'), 25, ('staredDown', 1), 'lessons', 14, 'redeye'),
]
LESSON_NAME = {n: T(*nm) for n, nm, *_ in LS}
lessons = []
for n, nm, goal, why, st, (cs, cn), anchor, card, first in LS:
    lessons.append(dict(id=n, name=T(*nm), goal=T(*goal), reqText=T(*goal), why=T(*why), reward=dict(stash=st), cond=dict(stat=cs, gte=cn), hand=anchor, card=card, firstTime=first, firstTimeLine=T(*why), icon='ui/lesson'))
lessons_file = dict(lessons=lessons, coach=dict(firstTimeFor=['redeye', 'honk', 'blender', 'white', 'wrath', 'himOrMe', 'curse', 'flareUp'], dismiss='anyTap', perRun=1),
    keysNote=T('Lessons 3 and 6 also give a Brass Key and lesson 8 a Silver Key (granted by core/meta.js).', '3. ve 6. dersler Pirinç Anahtar, 8. ders Gümüş Anahtar da verir (core/meta.js verir).', 'บทเรียนที่ 3 และ 6 ให้กุญแจทองเหลือง บทเรียนที่ 8 ให้กุญแจเงิน (core/meta.js เป็นผู้ให้)'),
    tutorialFixes=dict(bankStep='bank half, not all: the purse must keep the price of the first charm and the first tip', nights='c1 has 2 nights a debt: read nights from places.json, never hard-code 3', seed='the tutorial seed must fix the Spice Up result and the Tin visitor'))

# ---------- Notebook: effects use the names src/core/meta.js hideoutEffects reads (startTrick, startCharmPick, benchOffers, startWick, postcardSlots, flag, poolAdd) ----------
nb = []
PACK1 = ['rainy_day', 'hot_pan', 'fresh_fish', 'night_bus', 'borrowed_coat', 'short_cut']
def NBN(i, tab, nm, cost, rq, eft, tx):
    d = dict(id=i, tab=tab, name=T(*nm), cost=cost, effect=eft, text=T(*tx))
    if rq:
        d['requires'], d['reqText'] = RQ(*([rq[0], rq[1]] if len(rq) > 1 and not isinstance(rq[1], str) else [rq[0], 1]), **({'id': rq[1]} if len(rq) > 1 and isinstance(rq[1], str) else {}))
    else: d['requires'], d['reqText'] = None, T('Open from the start', 'Baştan açık', 'ใช้ได้ตั้งแต่เริ่ม')
    nb.append(d)
FLG = lambda f, v: dict(type='flag', flag=f, v=v)
for row in [
 ('cart_01', 'cart', ('Second Stool', 'İkinci Tabure', 'เก้าอี้ตัวที่สอง'), 20, None, dict(type='startTrick', n=1), ('Start every run with one extra trick.', 'Her oyuna fazladan bir numarayla başla.', 'เริ่มทุกรอบด้วยกลเม็ดเพิ่มหนึ่งอัน')),
 ('cart_02', 'cart', ('Tip Jar', 'Bahşiş Kavanozu', 'โหลทิป'), 30, ('lesson', 3), FLG('freeReroll', 1), ('The first reroll in every stall is free.', 'Her tezgâhta ilk yenileme bedava.', 'สุ่มร้านใหม่ครั้งแรกของทุกแผงฟรี')),
 ('cart_03', 'cart', ('Spare Bag', 'Yedek Çanta', 'กระเป๋าสำรอง'), 45, ('clear', 'c1'), dict(type='benchOffers', n=3), ('The bench shows 3 jobs, not 2.', 'Tezgâh 2 yerine 3 iş gösterir.', 'โต๊ะช่างแสดงงาน 3 อย่าง แทนที่จะเป็น 2')),
 ('cart_04', 'cart', ('Starter Shelf', 'Başlangıç Rafı', 'ชั้นเริ่มต้น'), 60, ('clear', 'c2'), dict(type='startCharmPick', n=3), ('Choose 1 of 3 charms at the start of a run.', 'Oyun başında 3 tılsımdan 1\'ini seç.', 'เลือกไอเท็ม 1 จาก 3 ตอนเริ่มรอบ')),
 ('cart_05', 'cart', ('Loan Slip', 'Borç Pusulası', 'ใบยืมเงิน'), 70, ('dealsSigned', 3), dict(type='startWick', n=3), ('Start every run with 3 more Caps.', 'Her oyuna 3 Kapak fazlayla başla.', 'เริ่มทุกรอบด้วยฝาขวดเพิ่ม 3')),
 ('cart_06', 'cart', ('Night Pass', 'Gece Geçişi', 'บัตรข้ามคืน'), 90, ('clear', 'c3'), FLG('extraLife', True), ('Once per run, a missed deadline gives you 1 extra round.', 'Oyun başına bir kez, kaçırılan vade sana 1 ek el verir.', 'หนึ่งครั้งต่อรอบ ถ้าจ่ายไม่ทันจะได้เพิ่ม 1 รอบ')),
 ('cart_07', 'cart', ('Postcard Stand', 'Kartpostal Standı', 'แผงโปสการ์ด'), 100, ('clear', 'c3'), dict(type='postcardSlots', n=1, packs=PACK1), ('Take one Postcard on a run. Pack I opens.', 'Bir oyunda bir Kartpostal al. Paket I açılır.', 'พกโปสการ์ดได้หนึ่งใบต่อรอบ ปลดล็อกชุดที่ 1')),
 ('cart_08', 'cart', ('Back Pocket', 'Arka Cep', 'กระเป๋าหลัง'), 130, ('tricksUsed', 25), FLG('trickPockets', 1), ('A fourth trick pocket.', 'Dördüncü bir numara cebi.', 'กระเป๋ากลเม็ดที่สี่')),
 ('cart_09', 'cart', ('Fresh Start', 'Yeni Başlangıç', 'เริ่มใหม่'), 160, ('clear', 'c5'), dict(type='postcardSlots', n=1), ('A second Postcard slot.', 'İkinci bir Kartpostal yuvası.', 'ช่องโปสการ์ดช่องที่สอง')),
 ('cart_10', 'cart', ('Lucky Coin', 'Şans Parası', 'เหรียญนำโชค'), 220, ('stampsGold', 5), FLG('pickFirstFav', True), ('You choose the Special on the first spin of each round.', 'Her elin ilk çevirişinde Gözdeyi sen seçersin.', 'เลือกเมนูเด็ดเองในตาแรกของทุกรอบ')),
 ('cart_11', 'cart', ('Cash Tray', 'Para Tepsisi', 'ถาดเงินทอน'), 80, ('clear', 'c2'), FLG('shopDiscount', 5), ('Stall prices are 5% lower.', 'Tezgâh fiyatları %5 daha düşük.', 'ราคาแผงถูกลง 5%')),
 ('cart_12', 'cart', ('Sharp Knife', 'Keskin Bıçak', 'มีดคม'), 50, ('benchJobs', 3), FLG('benchDiscount', 10), ('Bench jobs cost 10% less.', 'Tezgâh işleri %10 ucuz.', 'งานโต๊ะช่างถูกลง 10%')),
 ('cart_13', 'cart', ('Pocket Warmer', 'Cep Isıtıcı', 'ที่อุ่นกระเป๋า'), 120, ('tricksUsed', 40), FLG('firstTrickFree', True), ('The first trick each round is not used up.', 'Her elin ilk numarası harcanmaz.', 'กลเม็ดแรกของแต่ละรอบไม่หมดไป')),
 ('cart_14', 'cart', ('Rainy Reserve', 'Yağmur Yedeği', 'ของสำรองหน้าฝน'), 100, ('clear', 'c4'), FLG('carrySpins', 1), ('One unused spin carries over to the next round.', 'Kullanılmayan bir çeviriş sonraki ele devreder.', 'ตาที่เหลือหนึ่งตายกไปรอบหน้าได้')),
 ('tin_01', 'tin', ('Tin Shelf', 'Teneke Rafı', 'ชั้นกระป๋องขนม'), 40, ('lesson', 6), FLG('tinOfferings', 1), ('Give 2 tips on each stall visit.', 'Her tezgâh uğrayışında 2 bahşiş ver.', 'ให้ทิปได้ 2 ครั้งทุกครั้งที่แวะแผง')),
 ('tin_03', 'tin', ('Rival Chalk', 'Rakip Tebeşiri', 'ชอล์กคู่แข่ง'), 50, ('himOrMe', 1), dict(type='none', ui='rivalLines'), ('Rivals are joined by a chalk line on the Tin screen.', 'Rakipler Teneke ekranında tebeşir çizgisiyle bağlanır.', 'คู่แข่งถูกโยงด้วยเส้นชอล์กบนหน้ากระป๋องขนม')),
 ('tin_04', 'tin', ('Fourth Line', 'Dördüncü Hat', 'สายที่สี่'), 120, ('clear', 'c4'), FLG('callCards', 1), ('Calls show 4 cards, not 3.', 'Aramalar 3 yerine 4 kart gösterir.', 'สายโทรศัพท์แสดงการ์ด 4 ใบ แทนที่จะเป็น 3')),
 ('tin_05', 'tin', ('Quick Friends', 'Çabuk Dostlar', 'เพื่อนไว'), 150, ('stage:8', 3), FLG('patronAt', 7), ('Neighbours become Regulars at Favour 7, not 8.', 'Komşular Hatır 8 yerine 7\'de Müdavim olur.', 'เพื่อนบ้านเป็นขาประจำที่น้ำใจ 7 แทนที่จะเป็น 8')),
 ('tin_06', 'tin', ('Red Phone', 'Kırmızı Telefon', 'โทรศัพท์แดง'), 200, ('redCalls', 5), FLG('callRerollFree', True), ('The first reroll on every call is free.', 'Her aramada ilk yenileme bedava.', 'สุ่มการ์ดใหม่ครั้งแรกของทุกสายฟรี')),
 ('tin_07', 'tin', ('Gossip Board', 'Dedikodu Panosu', 'กระดานข่าวแผง'), 60, ('offerings', 15), dict(type='none', ui='gossipOnCall'), ("Each call card shows that neighbour's gossip first.", 'Her arama kartı önce o komşunun dedikodusunu gösterir.', 'การ์ดโทรศัพท์แต่ละใบโชว์ข่าวแผงของเพื่อนบ้านคนนั้นก่อน')),
 ('pool_01', 'pool', ('Street Cabinet', 'Sokak Dolabı', 'ตู้ของริมถนน'), 25, None, dict(type='poolAdd', rarity='common', n=4), ('4 more common charms enter the stall pool.', 'Tezgâh havuzuna 4 sıradan tılsım daha girer.', 'ไอเท็มธรรมดา 4 ชิ้นเข้าสู่ร้านสุ่ม')),
 ('pool_02', 'pool', ('Night Cabinet', 'Gece Dolabı', 'ตู้ยามค่ำ'), 50, ('clear', 'c2'), dict(type='poolAdd', rarity='uncommon', n=4), ('4 more uncommon charms enter the stall pool.', 'Tezgâh havuzuna 4 nadir tılsım daha girer.', 'ไอเท็มหายาก 4 ชิ้นเข้าสู่ร้านสุ่ม')),
 ('pool_03', 'pool', ('Rare Cabinet', 'Ender Dolap', 'ตู้ของหายาก'), 90, ('clear', 'c4'), dict(type='poolAdd', rarity='rare', n=3), ('3 more rare charms enter the stall pool.', 'Tezgâh havuzuna 3 ender tılsım daha girer.', 'ไอเท็มหายากมาก 3 ชิ้นเข้าสู่ร้านสุ่ม')),
 ('pool_04', 'pool', ('Gold Cabinet', 'Altın Dolap', 'ตู้ทอง'), 140, ('clear', 'c6'), dict(type='poolAdd', rarity='legendary', n=2), ('2 legendary charms enter the stall pool.', 'Tezgâh havuzuna 2 efsane tılsım girer.', 'ไอเท็มตำนาน 2 ชิ้นเข้าสู่ร้านสุ่ม')),
]: NBN(*row)
# Crew: a character opens by its requirement (an achievement in achievements.json gives it); the node only shows the road and the starting Favour
CREW = [('crew_01', 'nim', None, 'gold', 1), ('crew_02', 'tao', ('clear', 'c1'), 'lamplit', 1), ('crew_03', 'bua', ('reachDebt', 6), 'beckon', 2), ('crew_04', 'rattle', ('cursesHeld', 4), 'moonbiter', 2),
        ('crew_05', 'sok', ('interestTotal', 5000), 'tide', 2), ('crew_06', 'pip', ('clear', 'c3'), 'brimble', 2), ('crew_07', 'yai', ('coinsEarned', 10000), 'tide', 3),
        ('crew_08', 'beng', ('tricksUsed', 100), 'wire', 3), ('crew_09', 'pla', ('scorches', 20), 'lamplit', 3), ('crew_10', 'mali', ('fallRise', 3), 'waiting', 3)]
for i, ch, rq, sp, fv in CREW:
    NBN(i, 'crew', tuple(CHARNAME[ch][l] for l in L), 0, rq, dict(type='none', char=ch, tie=dict(spirit=sp, favour=fv)),
        ('Starts with +%d Favour with %s.' % (fv, SPN[sp]['en']), '%s ile +%d Hatırla başlar.' % (SPN[sp]['tr'], fv), 'เริ่มด้วยน้ำใจกับ%s +%d' % (SPN[sp]['th'], fv)))
HOME = [
 ('home_01', ('Cot', 'Yatak', 'เตียงพับ'), 0, None, ('A mat and a crate on the corner.', 'Köşede bir hasır ve bir sandık.', 'เสื่อกับลังไม้ที่หัวมุม'), 'cot'),
 ('home_02', ('Radio', 'Radyo', 'วิทยุ'), 25, ('lesson', 1), ('Three songs for the Home screen.', 'Ev ekranı için üç şarkı.', 'เพลงสามเพลงสำหรับหน้าบ้าน'), 'radio'),
 ('home_03', ('String Lights', 'Ampul Zinciri', 'ไฟประดับ'), 60, ('clear', 'c2'), ('The corner glows at night.', 'Köşe geceleri parlar.', 'หัวมุมสว่างไสวตอนกลางคืน'), 'lights'),
 ('home_04', ('Notice Board', 'İlan Panosu', 'บอร์ดประกาศ'), 80, ('lessons', 3), ('The Lessons list becomes a wall board.', 'Dersler listesi duvar panosu olur.', 'รายการบทเรียนกลายเป็นบอร์ดติดผนัง'), 'board'),
 ('home_05', ('Token Shelf', 'Jeton Rafı', 'ชั้นเหรียญเพื่อนบ้าน'), 100, ('clear', 'c3'), ("Each neighbour's tin token stands on a shelf. A pip glows when one was a Regular in your best run.", 'Her komşunun teneke jetonu bir rafta durur. En iyi oyununda biri Müdavim olduysa bir nokta parlar.', 'เหรียญกระป๋องของเพื่อนบ้านแต่ละคนตั้งบนชั้น จุดจะสว่างถ้าเคยเป็นขาประจำในรอบที่ดีที่สุด'), 'tokens'),
 ('home_06', ('Machine Skin: Brass', 'Makine Kaplaması: Pirinç', 'สกินเครื่อง ทองเหลือง'), 120, ('stampsGold', 5), ('A brass look for the machine.', 'Makineye pirinç görünüm.', 'เครื่องลุคทองเหลือง'), 'skin_brass'),
 ('home_07', ('Machine Skin: Neon', 'Makine Kaplaması: Neon', 'สกินเครื่อง นีออน'), 150, ('clear', 'c7'), ('A neon look for the machine.', 'Makineye neon görünüm.', 'เครื่องลุคนีออน'), 'skin_neon'),
 ('home_08', ("Ruby's Hat Stand", 'Ruby\'nin Şapkalığı', 'ที่แขวนหมวกของรูบี้'), 200, ('dealsSigned', 20), ('A hat set for Mr. Ruby.', 'Bay Ruby için bir şapka seti.', 'ชุดหมวกสำหรับมิสเตอร์รูบี้'), 'hats'),
 ('home_09', ('Map Frame', 'Harita Çerçevesi', 'กรอบแผนที่'), 250, ('placesCleared', 10), ('The map hangs on the wall.', 'Harita duvara asılır.', 'แผนที่แขวนบนผนัง'), 'mapframe'),
 ('home_10', ('Tower View', 'Kule Manzarası', 'วิวตึกสูง'), 400, ('clear', 'c10'), ('The window shows the skyline.', 'Pencere şehir silüetini gösterir.', 'หน้าต่างเห็นเส้นขอบฟ้า'), 'tower'),
]
for i, nm, cost, rq, tx, cid in HOME:
    NBN(i, 'home', nm, cost, rq, dict(type='none', cosmetic=cid, hideout=['cot', 'stove', 'shelf', 'lights', 'workbench', 'desk', 'keepsake', 'moth_house', 'mirror', 'chair'][int(i[-2:]) - 1]), tx)
assert len({d['id'] for d in nb}) == len(nb)
notebook = dict(tabs=[dict(id='cart', name=T('Cart', 'Araba', 'รถเข็น')), dict(id='tin', name=T('Tin', 'Teneke', 'กระป๋องขนม')), dict(id='pool', name=T('Pool', 'Havuz', 'คลัง')),
                      dict(id='crew', name=T('Crew', 'Ekip', 'ลูกทีม')), dict(id='home', name=T('Home', 'Ev', 'บ้าน'))], nodes=nb,
                note='Friendship tiers (Devotion) are bought through meta.buyDevotion, not as nodes: their texts are in spirits.json devotion.')

# ---------- Lockers (20 + 4 Left Luggage) and keys ----------
def locked_charms():
    out = {}
    for c in charms:
        if c['unlock']: out.setdefault((c['family'], c['rarity']), []).append(c['id'])
    return out
LK = locked_charms()
FAMS = list(FAM)
rareA = [LK[(f, 'rare')][0] for f in FAMS]; rareB = [LK[(f, 'rare')][1] for f in FAMS]; legend = [LK[(f, 'legendary')][0] for f in FAMS]
assert all(len(LK[(f, 'rare')]) == 2 for f in FAMS) and len(rareA) == 10
POSTCARD_IDS = ['rainy_day', 'hot_pan', 'fresh_fish', 'night_bus', 'borrowed_coat', 'short_cut', 'crooked_scale', 'old_photo', 'thumb_scale', 'empty_wallet', 'all_pocket', 'mothers_voice',
                'staring_contest', 'spare_blender', 'party_line', 'quiet_phone', 'full_charge', 'late_kiosk']
def fams_t(ids):
    return [FAM[CHARM_FAM[i]] for i in ids]
CHARM_FAM = {c['id']: c['family'] for c in charms}
def lk_hint(rar, ids):
    f = fams_t(ids)
    r = dict(rare=T('Rare', 'Ender', 'หายากมาก'), legendary=T('Legendary', 'Efsane', 'ตำนาน'))[rar]
    j = lambda l, sep, last: (sep.join(x[l] for x in f[:-1]) + last + f[-1][l]) if len(f) > 1 else f[0][l]
    return T('%s charm%s: %s' % (r['en'], 's' if len(ids) > 1 else '', j('en', ', ', ' and ')), '%s tılsım: %s' % (r['tr'], j('tr', ', ', ' ve ')), 'ไอเท็ม%s: %s' % (r['th'], j('th', ', ', ' และ ')))
lockers = []
def LKR(n, key, extra, contents, hint):
    d = dict(id='locker_%d' % n, n=n, key=key, contents=contents, hint=hint, name=T('Locker %d' % n, 'Dolap %d' % n, 'ตู้ที่ %d' % n), icon='ui/locker_shut', openIcon='ui/locker_open')
    if extra: d['requires'], d['reqText'] = extra
    else: d['requires'], d['reqText'] = None, T('Just the key', 'Yalnızca anahtar', 'ใช้แค่กุญแจ')
    lockers.append(d)
for k in range(10): LKR(k + 1, 'brass', None, dict(charms=[rareA[k]]), lk_hint('rare', [rareA[k]]))
for k in range(5): LKR(11 + k, 'silver', RQ('clear', 1, id='c3'), dict(charms=[rareB[2 * k], rareB[2 * k + 1]]), lk_hint('rare', [rareB[2 * k], rareB[2 * k + 1]]))
LKR(16, 'silver', RQ('lessons', 10), dict(postcards=POSTCARD_IDS[6:12]), T('Postcard pack II (6)', 'Kartpostal paketi II (6)', 'โปสการ์ดชุดที่ 2 (6 ใบ)'))
LKR(17, 'silver', RQ('clear', 1, id='c6'), dict(postcards=POSTCARD_IDS[12:18]), T('Postcard pack III (6)', 'Kartpostal paketi III (6)', 'โปสการ์ดชุดที่ 3 (6 ใบ)'))
LKR(18, 'red', RQ('clear', 1, id='c7'), dict(charms=legend[:5]), lk_hint('legendary', legend[:5]))
LKR(19, 'red', RQ('storm', 3), dict(charms=legend[5:]), lk_hint('legendary', legend[5:]))
LKR(20, 'red', RQ('lockers', 19), dict(deed=True), T('The Night Market Deed: a title, Home decor, a Codex page and a last letter', 'Gece Pazarı Tapusu: bir unvan, Ev dekoru, bir Kodeks sayfası ve son bir mektup', 'โฉนดตลาดกลางคืน: ชื่อตำแหน่ง ของตกแต่งบ้าน หน้าสมุดบันทึกและจดหมายฉบับสุดท้าย'))
_all = [i for l in lockers for i in l['contents'].get('charms', [])]
assert len(_all) == 30 and len(set(_all)) == 30 and set(_all) == {c['id'] for c in charms if c['unlock']}, 'lockers must hold the 30 locked charms exactly once'
luggage = [dict(id='luggage_%d' % n, n=n, name=T('Left Luggage %d' % n, 'Emanet Dolabı %d' % n, 'ตู้ฝากของ %d' % n), icon='ui/luggage', requires=dict(stat='reachDebt', gte=4),
                reqText=REQ('reachDebt', 4), tag=T('Reach debt 4', '4. borca ulaş', 'ไปให้ถึงหนี้ที่ 4')) for n in range(1, 5)]
KEYS = [
 dict(id='brass', icon='ui/key_brass', name=T('Brass Key', 'Pirinç Anahtar', 'กุญแจทองเหลือง'), sources=T('First clear of each place, every 3 debts paid in a run (up to 2 a run), lessons 3 and 6, daily goals, the weekly bonus.', 'Her yerin ilk bitirişi, bir oyunda her 3 borç (oyun başına en çok 2), 3. ve 6. dersler, günlük hedefler, haftalık bonus.', 'ผ่านแต่ละด่านครั้งแรก ปลดหนี้ทุก 3 ก้อนในรอบเดียว (สูงสุด 2 ต่อรอบ) บทเรียนที่ 3 และ 6 เป้าหมายรายวัน โบนัสรายสัปดาห์')),
 dict(id='silver', icon='ui/key_silver', name=T('Silver Key', 'Gümüş Anahtar', 'กุญแจเงิน'), sources=T('Milestones, first clear of places 2, 5 and 7, the weekly contract, Storm clears, lesson 8, a 7-day streak.', 'Kilometre taşları, 2., 5. ve 7. yerlerin ilk bitirişi, haftalık sözleşme, Fırtına bitirişleri, 8. ders, 7 günlük seri.', 'เหตุการณ์สำคัญ ผ่านด่าน 2, 5 และ 7 ครั้งแรก สัญญารายสัปดาห์ ผ่านพายุ บทเรียนที่ 8 เล่นต่อเนื่อง 7 วัน')),
 dict(id='red', icon='ui/key_red', name=T('Red Key', 'Kırmızı Anahtar', 'กุญแจแดง'), sources=T('Win a run with red cards from 3 different neighbours, the 5th red call in total, a gold stamp at place 9.', '3 farklı komşunun kırmızı kartlarıyla bir oyun kazan, toplam 5. kırmızı arama, 9. yerde altın mühür.', 'ชนะหนึ่งรอบโดยรับการ์ดแดงจากเพื่อนบ้าน 3 คนต่างกัน สายแดงครั้งที่ 5 รวม ตราทองที่ด่าน 9'))]
lockers_file = dict(keys=KEYS, lockers=lockers, luggage=luggage, leftLuggage=dict(rule=T(
    'At run end, if you reached debt 4, leave one held charm in an empty Left Luggage locker. It comes back next run as a relic: it takes a slot and cannot be sold, blended or lost.',
    '4. borca ulaştıysan oyun sonunda elindeki bir tılsımı boş bir Emanet Dolabı\'na bırak. Sonraki oyunda emanet olarak döner: yuva tutar, satılamaz, karıştırılamaz, kaybedilemez.',
    'ถ้าถึงหนี้ที่ 4 ตอนจบรอบ ฝากไอเท็มที่ถือไว้หนึ่งชิ้นในตู้ฝากของที่ว่าง รอบหน้ามันกลับมาเป็นของฝาก กินหนึ่งช่อง ขายปั่นหรือทำหายไม่ได้')))

# ---------- Postcards ----------
PC = [  # id, pack, name, gain rules, cost rules, engine (gain text, cost text) or None
 ('rainy_day', 1, ('Rainy Day', 'Yağmurlu Gün', 'วันฝนตก'), [pas(sflag('spinsRound', 1))], [pas(sflag('debtMul', 8))], None),
 ('hot_pan', 1, ('Hot Pan', 'Kızgın Tava', 'กระทะร้อน'), [pas(sflag('startHeat', 3))], [pas(sflag('ashBase', 1))], None),
 ('fresh_fish', 1, ('Fresh Fish', 'Taze Balık', 'ปลาสด'), [R('onRunStart', None, E('luck', 4))], [R('onDebtStart', None, E('luck', -1))], None),
 ('night_bus', 1, ('Night Bus', 'Gece Otobüsü', 'รถเมล์ดึก'), [R('onRunStart', None, E('wick', 3))], [pas(sflag('noShopN', 1))], None),
 ('borrowed_coat', 1, ('Borrowed Coat', 'Ödünç Palto', 'เสื้อโค้ทยืม'), [pas(E('slot', 1))], [R('onRunStart', None, E('favour', -2, spirit='brimble'))], None),
 ('short_cut', 1, ('Short Cut', 'Kestirme', 'ทางลัด'), [R('onDebtPaid', dict(roundsLeftMin=1), E('wick', 3), E('trick', 1))], [pas(sflag('spinsLess', 1))], None),
 ('crooked_scale', 2, ('Crooked Scale', 'Eğri Terazi', 'ตาชั่งเบี้ยว'), [R('onRunStart', None, E('favour', 2, spirit='wire'), E('favour', 2, spirit='beckon'))], [R('onRunStart', None, E('favour', -2, spirit='tide'), E('favour', -2, spirit='waiting'))], None),
 ('old_photo', 2, ('Old Photograph', 'Eski Fotoğraf', 'ภาพถ่ายเก่า'), [R('onRunStart', None, E('favour', 3, spirit='waiting'))], [R('onRunStart', None, E('favour', -3, spirit='brimble'))], None),
 ('thumb_scale', 2, ('Thumb on the Scale', 'Terazide Başparmak', 'นิ้วโป้งบนตาชั่ง'), [pas(sflag('freeRedraw', 1))], [R('onSpinStart', dict(spinIs='first'), sflag('hideFav', True, 'spin'))], None),
 ('empty_wallet', 2, ('Empty Wallet', 'Boş Cüzdan', 'กระเป๋าตังค์ว่าง'), [R('onRunStart', None, sflag('debtCut', 30))], [R('onRunStart', None, E('wick', -3))], None),
 ('all_pocket', 2, ('All Pockets', 'Bütün Cepler', 'กระเป๋าเต็มตัว'), [pas(sflag('trickPockets', 2))], [pas(sflag('shopOffers', 2))], None),
 ('mothers_voice', 2, ("Mother's Voice", 'Annenin Sesi', 'เสียงแม่'), [R('onRunStart', None, E('favour', 1, spirit='all'))], [pas(E('interest', -2))], None),
 ('staring_contest', 3, ('Staring Contest', 'Bakışma Yarışı', 'แข่งจ้องตา'), [R('onRedEye', None, E('wick', 3))], [pas(sflag('redEyeRate', 3))],
  dict(engine='omenEarly', cost=T('Red Eye from debt 1, and its chance is doubled.', 'Kırmızı Göz 1. borçtan başlar ve ihtimali iki katına çıkar.', 'ดวงตาแดงมาตั้งแต่หนี้ที่ 1 และโอกาสเพิ่มเป็นสองเท่า'))),
 ('spare_blender', 3, ('Spare Blender', 'Yedek Karıştırıcı', 'เครื่องปั่นสำรอง'), [], [],
  dict(engine='blenderFromDebt1', gain=T('The Blender opens from debt 1.', 'Karıştırıcı 1. borçtan itibaren açık.', 'เครื่องปั่นเปิดใช้ตั้งแต่หนี้ที่ 1'), cost=T('Blending costs 2 Caps more.', 'Karıştırma 2 Kapak daha pahalı.', 'ปั่นไอเท็มแพงขึ้น 2 ฝาขวด'))),
 ('party_line', 3, ('Party Line', 'Ortak Hat', 'สายรวม'), [pas(sflag('callCards', 1))], [], dict(engine='callRerollDouble', cost=T('Call rerolls cost double.', 'Arama yenilemeleri iki kat tutar.', 'สุ่มการ์ดโทรศัพท์ใหม่แพงสองเท่า'))),
 ('quiet_phone', 3, ('Quiet Phone', 'Sessiz Telefon', 'โทรศัพท์เงียบ'), [pas(E('interest', 4))], [], dict(engine='noCalls', cost=T('No calls this run: no beads and no white call.', 'Bu oyunda arama yok: boncuk da beyaz arama da yok.', 'รอบนี้ไม่มีสายโทรศัพท์ ไม่มีลูกปัดและไม่มีสายขาว'))),
 ('full_charge', 3, ('Full Charge', 'Tam Şarj', 'ชาร์จเต็ม'), [], [], dict(engine='fullCharge', gain=T('Active charms can hold one extra charge and start full.', 'Etkin tılsımlar bir fazla şarj tutar ve dolu başlar.', 'ไอเท็มกดใช้เก็บชาร์จได้เพิ่มหนึ่งและเริ่มด้วยชาร์จเต็ม'), cost=T('No recharge in the first round of each debt.', 'Her borcun ilk elinde şarj yok.', 'รอบแรกของทุกหนี้ไม่ได้ชาร์จเพิ่ม'))),
 ('late_kiosk', 3, ('Late Kiosk', 'Geç Kiosk', 'ตู้ฝากเงินมาช้า'), [pas(E('interest', 4))], [], dict(engine='noPayNow', cost=T('PAY NOW is off. No early pay.', 'ŞİMDİ ÖDE kapalı. Erken ödeme yok.', 'ปุ่มจ่ายเลยปิด ไม่มีจ่ายก่อนกำหนด'))),
]
assert [p[0] for p in PC] == POSTCARD_IDS
postcards = []
for i, pk, nm, gain, cost, eng in PC:
    d = dict(id=i, pack=pk, icon='post/' + i, back='ui/postcard_back', name=T(*nm), gainRules=gain, costRules=cost, rules=list(gain) + list(cost))
    gt = text(gain) if gain else None; ct = text(cost) if cost else None
    ge = (eng or {}).get('gain'); ce = (eng or {}).get('cost')
    d['gain'] = T(*[' '.join(x for x in [gt and gt[l], ge and ge[l]] if x) for l in L]); d['cost'] = T(*[' '.join(x for x in [ct and ct[l], ce and ce[l]] if x) for l in L])
    if eng: d['engine'] = eng['engine']
    postcards.append(d)
postcards_file = dict(postcards=postcards, packs=[])
postcards_file['packs'] = [dict(id=1, source='cart_07'), dict(id=2, source='locker_16'), dict(id=3, source='locker_17')]

# ---------- Milestones (14) ----------
def MS(i, nm, home, req):
    return dict(id=i, name=T(*nm), home=T(*home), requires=req[0], reqText=req[1])
milestones = [
 MS('ms_1', ('First run done', 'İlk oyun bitti', 'จบรอบแรก'), ('A price tag appears on the first Notebook page and the Lessons list gets a pencil.', 'Defterin ilk sayfasında bir fiyat etiketi belirir, Dersler listesi bir kalem alır.', 'ป้ายราคาโผล่ที่หน้าแรกของสมุดโน้ต และรายการบทเรียนมีดินสอ'), RQ('runs', 1)),
 MS('ms_2', ('First place cleared', 'İlk yer bitti', 'ผ่านด่านแรก'), ('The mat becomes a plastic stool and a radio sits on a crate.', 'Hasır plastik bir tabure olur, bir sandığın üstünde radyo durur.', 'เสื่อกลายเป็นเก้าอี้พลาสติก และมีวิทยุวางบนลัง'), RQ('clear', 1, id='c1')),
 MS('ms_3', ('Ten debts paid', 'On borç ödendi', 'ปลดหนี้สิบก้อน'), ('A string of bulbs above the cart.', 'Arabanın üstünde bir ampul zinciri.', 'ไฟประดับเส้นหนึ่งเหนือรถเข็น'), RQ('debtsPaid', 10)),
 MS('ms_4', ('First Regular', 'İlk Müdavim', 'ขาประจำคนแรก'), ("That neighbour's tin token stands on the shelf and glows.", 'O komşunun teneke jetonu rafta durur ve parlar.', 'เหรียญกระป๋องของเพื่อนบ้านคนนั้นตั้งบนชั้นและเรืองแสง'), RQ('regularKinds', 1)),
 MS('ms_5', ('Yaowarat cleared', 'Yaowarat bitti', 'ผ่านเยาวราช'), ('The cart wheel is painted gold.', 'Arabanın tekerleği altın boyanır.', 'ล้อรถเข็นถูกทาสีทอง'), RQ('clear', 1, id='c3')),
 MS('ms_6', ('All 20 lockers open', '20 dolabın hepsi açık', 'เปิดตู้ครบ 20 ตู้'), ('The Locker Wall gets a gold coat.', 'Dolap Duvarı altın kaplanır.', 'ผนังตู้ล็อกเกอร์ถูกเคลือบสีทอง'), RQ('lockers', 20)),
 MS('ms_7', ('Pattaya cleared', 'Pattaya bitti', 'ผ่านพัทยา'), ('The cart sits in a rented shop front. Day and night begin.', 'Araba kiralık bir dükkân önünde durur. Gece ve gündüz başlar.', 'รถเข็นอยู่ในหน้าร้านเช่า และมีกลางวันกลางคืนสลับกัน'), RQ('clear', 1, id='c5')),
 MS('ms_8', ('30 stamps', '30 mühür', 'ตราประทับ 30 ดวง'), ('A framed map hangs on the wall.', 'Duvara çerçeveli bir harita asılır.', 'แผนที่ใส่กรอบแขวนบนผนัง'), RQ('stamps', 30)),
 MS('ms_9', ('First Storm cleared', 'İlk Fırtına bitti', 'ผ่านพายุแรก'), ('Rain on the window and an umbrella stand.', 'Pencerede yağmur, bir şemsiyelik.', 'ฝนบนหน้าต่างและที่เสียบร่ม'), RQ('storm', 1)),
 MS('ms_10', ('Phuket cleared', 'Phuket bitti', 'ผ่านภูเก็ต'), ("A two-storey shophouse. Mr. Ruby's hat hangs on a hook.", 'İki katlı bir dükkân evi. Bay Ruby\'nin şapkası bir askıda.', 'ตึกแถวสองชั้น หมวกของมิสเตอร์รูบี้แขวนอยู่บนตะขอ'), RQ('clear', 1, id='c7')),
 MS('ms_11', ('Sukhumvit cleared', 'Sukhumvit bitti', 'ผ่านสุขุมวิท'), ('A glass wall with the city behind it.', 'Arkasında şehir olan bir cam duvar.', 'ผนังกระจกที่มีเมืองอยู่ด้านหลัง'), RQ('clear', 1, id='c9')),
 MS('ms_12', ('Sky Bar cleared', 'Gökyüzü Barı bitti', 'ผ่านสกายบาร์'), ('A penthouse with the skyline. The cart is a trophy on a shelf.', 'Şehir silüetli bir çatı katı. Araba rafta bir kupa.', 'เพนต์เฮาส์วิวเมือง รถเข็นเป็นถ้วยรางวัลบนชั้น'), RQ('clear', 1, id='c10')),
 MS('ms_13', ('All 8 neighbours Regular', 'Sekiz komşu da Müdavim', 'เพื่อนบ้านครบ 8 คนเป็นขาประจำ'), ('The tin tokens sit in a glass display case.', 'Teneke jetonlar bir cam vitrinde durur.', 'เหรียญกระป๋องวางในตู้กระจกโชว์'), RQ('regularKinds', 8)),
 MS('ms_14', ('Storm 10 cleared', 'Fırtına 10 bitti', 'ผ่านพายุ 10'), ('The Night Market Deed hangs framed. The last change.', 'Gece Pazarı Tapusu çerçevelenip asılır. Son değişiklik.', 'โฉนดตลาดกลางคืนแขวนใส่กรอบ การเปลี่ยนแปลงครั้งสุดท้าย'), RQ('storm', 10)),
]

# ---------- Storm 1 to 10 ----------
STORM = [  # name, rule text, rules, engine
 (('Rain Clouds', 'Yağmur Bulutları', 'เมฆฝน'), ('The first terms card of each debt has 1 spin fewer.', 'Her borcun ilk şart kartında 1 çeviriş eksik.', 'การ์ดเงื่อนไขใบแรกของทุกหนี้ตาน้อยลง 1'), [R('onRoundStart', dict(firstRound=True), E('spins', -1))], None),
 (('Wet Roads', 'Islak Yollar', 'ถนนเปียก'), ('The stall shows 1 charm fewer.', 'Tezgâh 1 tılsım eksik gösterir.', 'แผงแสดงไอเท็มน้อยลง 1 ชิ้น'), [pas(sflag('shopOffers', 3))], None),
 (('Cheaper Words', 'Ucuz Sözler', 'คำพูดถูกลง'), ("Every deal's curse hits one step harder.", 'Her anlaşmanın laneti bir kademe sert vurur.', 'คำสาปของทุกข้อตกลงรุนแรงขึ้นหนึ่งขั้น'), [], dict(dealHarsher=1)),
 (('Flood Watch', 'Sel Uyarısı', 'เฝ้าระวังน้ำท่วม'), ('All debts are 10% larger.', 'Bütün borçlar %10 büyük.', 'หนี้ทุกก้อนเพิ่มขึ้น 10%'), [pas(sflag('debtMul', 10))], None),
 (('Wary Neighbours', 'Tedirgin Komşular', 'เพื่อนบ้านระแวง'), ('Every neighbour starts at Favour -1.', 'Her komşu Hatır -1 ile başlar.', 'เพื่อนบ้านทุกคนเริ่มที่น้ำใจ -1'), [R('onRunStart', None, E('favour', -1, spirit='all'))], None),
 (('Heavy Rain', 'Sağanak', 'ฝนหนัก'), ('A Flare-up burns 25% of your purse.', 'Parlama kesenin %25\'ini yakar.', 'ไฟลุกเผาถุงเงิน 25%'), [pas(sflag('scorchBurn', 25))], None),
 (('Power Cut', 'Elektrik Kesintisi', 'ไฟดับ'), ('The Tin is closed on the first night of each debt. Red Eyes start from debt 2.', 'Teneke her borcun ilk gecesinde kapalı. Kırmızı Göz 2. borçtan başlar.', 'กระป๋องขนมปิดในคืนแรกของทุกหนี้ ดวงตาแดงมาตั้งแต่หนี้ที่ 2'), [], dict(tinClosedFirstNight=True, redEyeFromDebt=2)),
 (('Rising Water', 'Yükselen Su', 'น้ำสูงขึ้น'), ('All debts grow 15% more (25% in all).', 'Bütün borçlar %15 daha büyür (toplam %25).', 'หนี้ทุกก้อนเพิ่มอีก 15% (รวมเป็น 25%)'), [pas(sflag('debtMul', 15))], None),
 (('Storm Front', 'Fırtına Cephesi', 'แนวพายุ'), ('The boss rule also applies to every third debt.', 'Patron kuralı her üçüncü borçta da geçerli.', 'กฎบอสใช้กับหนี้ทุกก้อนที่สามด้วย'), [], dict(bossEveryThird=True)),
 (('The Perfect Storm', 'Kusursuz Fırtına', 'พายุสมบูรณ์แบบ'), ('Start with 1 curse. Neighbours get fed up at Favour -1 and -4.', '1 lanetle başla. Komşular Hatır -1 ve -4\'te küser.', 'เริ่มด้วยคำสาป 1 อย่าง เพื่อนบ้านหงุดหงิดที่น้ำใจ -1 และ -4'), [pas(sflag('startCurses', 1))], dict(wrathAt=[-1, -4])),
]
storm = [dict(id='storm_%d' % (i + 1), n=i + 1, icon='ui/storm', name=T(*nm), text=T(*tx), rules=rules, engine=eng or {}, requires=RQ('clear', 1, id='c10')[0] if i == 0 else RQ('storm', i)[0],
              reqText=RQ('clear', 1, id='c10')[1] if i == 0 else RQ('storm', i)[1], reward=dict(stash=30, key='silver')) for i, (nm, tx, rules, eng) in enumerate(STORM)]
storm_file = dict(storms=storm, unlock=T('Storm 1 opens after you clear Sky Bar. Storm N opens after any place is cleared on Storm N-1. Rules stack.', 'Fırtına 1, Gökyüzü Barı\'nı bitirince açılır. Fırtına N, herhangi bir yer Fırtına N-1\'de bitince açılır. Kurallar üst üste biner.', 'พายุ 1 เปิดเมื่อผ่านสกายบาร์ พายุ N เปิดเมื่อผ่านด่านใดก็ได้ที่พายุ N-1 กฎซ้อนทับกัน'))

# ---------- Goals: 30 daily, 20 weekly ----------
GT = {  # template id -> sentence with {n}; daily ones are per run, weekly ones are totals for the week
 'debts': T('Pay {n} debts in one run', 'Bir oyunda {n} borç öde', 'ปลดหนี้ {n} ก้อนในรอบเดียว'), 'line4': T('Land {n} Lines of 4 or longer in one run', 'Bir oyunda {n} adet 4\'lü ya da uzun Sıra yakala', 'ทำแถว 4 หรือยาวกว่า {n} ครั้งในรอบเดียว'),
 'noflare': T('Clear a debt with no Flare-up', 'Parlamasız bir borç öde', 'ปลดหนี้ก้อนหนึ่งโดยไม่มีไฟลุก'), 'deals': T('Sign {n} deals in one run', 'Bir oyunda {n} anlaşma imzala', 'เซ็นข้อตกลง {n} ข้อในรอบเดียว'),
 'refuse': T('Refuse {n} deals in one run', 'Bir oyunda {n} anlaşmayı reddet', 'ปฏิเสธข้อตกลง {n} ข้อในรอบเดียว'), 'bench': T('Do {n} bench jobs in one run', 'Bir oyunda {n} tezgâh işi yaptır', 'ใช้งานโต๊ะช่าง {n} ครั้งในรอบเดียว'),
 'tricks': T('Use {n} tricks in one run', 'Bir oyunda {n} numara kullan', 'ใช้กลเม็ด {n} อันในรอบเดียว'), 'tips': T('Give {n} tips at the Tin in one run', 'Bir oyunda Teneke\'de {n} bahşiş ver', 'ให้ทิปที่กระป๋องขนม {n} ครั้งในรอบเดียว'),
 'friend': T('Get a neighbour to Friend', 'Bir komşuyu Dost yap', 'ทำให้เพื่อนบ้านถึงขั้นเพื่อน'), 'honk': T('HONK {n} times in one run', 'Bir oyunda {n} kez KORNA çal', 'บีบแตร {n} ครั้งในรอบเดียว'),
 'blend': T('Blend {n} charms in one run', 'Bir oyunda {n} tılsım karıştır', 'ปั่นไอเท็ม {n} ชิ้นในรอบเดียว'), 'spice': T('Reach Spice {n} in one run', 'Bir oyunda Acı {n}\'e ulaş', 'ขึ้นเผ็ด {n} ในรอบเดียว'),
 'charms': T('Hold {n} charms at once', 'Aynı anda {n} tılsım tut', 'ถือไอเท็ม {n} ชิ้นพร้อมกัน'), 'interest': T('Earn {n} interest in one run', 'Bir oyunda {n} faiz kazan', 'ได้ดอกเบี้ย {n} ในรอบเดียว'),
 'early': T('Pay a debt with a night to spare', 'Bir geceyi artırarak borç öde', 'ปลดหนี้โดยเหลือคืนไว้หนึ่งคืน'), 'curses': T('Carry {n} curses at once', 'Aynı anda {n} lanet taşı', 'แบกคำสาป {n} อย่างพร้อมกัน'),
 'hangup': T('Hang up on {n} calls in one run', 'Bir oyunda {n} aramayı kapat', 'วางสาย {n} สายในรอบเดียว'), 'redeye': T('Survive a Red Eye', 'Bir Kırmızı Göz\'ü atlat', 'รอดดวงตาแดงหนึ่งครั้ง'),
 'w_debts': T('Pay {n} debts this week', 'Bu hafta {n} borç öde', 'ปลดหนี้ {n} ก้อนในสัปดาห์นี้'), 'w_tips': T('Give {n} tips this week', 'Bu hafta {n} bahşiş ver', 'ให้ทิป {n} ครั้งในสัปดาห์นี้'),
 'w_red': T('Take {n} red calls this week', 'Bu hafta {n} kırmızı arama al', 'รับสายแดง {n} สายในสัปดาห์นี้'), 'w_locker': T('Open {n} locker this week', 'Bu hafta {n} dolap aç', 'เปิดตู้ {n} ตู้ในสัปดาห์นี้'),
 'w_storm': T('Clear a place on Storm {n} this week', 'Bu hafta Fırtına {n}\'de bir yeri bitir', 'ผ่านด่านที่พายุ {n} ในสัปดาห์นี้'), 'w_blend': T('Blend {n} charms this week', 'Bu hafta {n} tılsım karıştır', 'ปั่นไอเท็ม {n} ชิ้นในสัปดาห์นี้'),
 'w_honk': T('HONK {n} times this week', 'Bu hafta {n} kez KORNA çal', 'บีบแตร {n} ครั้งในสัปดาห์นี้'), 'w_clear': T('Clear {n} places this week', 'Bu hafta {n} yeri bitir', 'ผ่านด่าน {n} ด่านในสัปดาห์นี้'),
 'w_runs': T('Finish {n} runs this week', 'Bu hafta {n} oyun bitir', 'เล่นให้จบ {n} รอบในสัปดาห์นี้'), 'w_friend': T('Get neighbours to Friend {n} times this week', 'Bu hafta komşuları {n} kez Dost yap', 'ทำให้เพื่อนบ้านถึงขั้นเพื่อน {n} ครั้งในสัปดาห์นี้'),
 'w_regular': T('Get a neighbour to Regular this week', 'Bu hafta bir komşuyu Müdavim yap', 'ทำให้เพื่อนบ้านเป็นขาประจำสัปดาห์นี้'), 'w_white': T('Take a white call this week', 'Bu hafta bir beyaz arama al', 'รับสายขาวในสัปดาห์นี้'),
 'w_upgrade': T('Buy {n} cart upgrades this week', 'Bu hafta {n} araba yükseltmesi al', 'ซื้ออัปเกรดรถเข็น {n} อย่างในสัปดาห์นี้'), 'w_redeye': T('Survive {n} Red Eyes this week', 'Bu hafta {n} Kırmızı Göz atlat', 'รอดดวงตาแดง {n} ครั้งในสัปดาห์นี้'),
}
def GL(tpl, n):
    t = GT[tpl]
    return dict(tpl=tpl, n=n, text=T(*[t[l].replace('{n}', str(n)) for l in L]))
DAILY = [('debts', 3), ('debts', 4), ('debts', 5), ('line4', 2), ('line4', 4), ('noflare', 1), ('deals', 1), ('deals', 2), ('refuse', 1), ('refuse', 2), ('bench', 1), ('bench', 2), ('tricks', 3), ('tricks', 5),
         ('tips', 2), ('tips', 4), ('friend', 1), ('honk', 2), ('honk', 4), ('blend', 1), ('spice', 5), ('spice', 7), ('charms', 5), ('charms', 7), ('interest', 100), ('early', 1), ('curses', 3), ('hangup', 2), ('redeye', 1), ('tricks', 8)]
WEEKLY = [('w_debts', 15), ('w_debts', 25), ('w_tips', 25), ('w_tips', 40), ('w_red', 3), ('w_red', 5), ('w_locker', 1), ('w_storm', 2), ('w_blend', 5), ('w_blend', 10), ('w_honk', 15), ('w_clear', 2),
          ('w_clear', 3), ('w_runs', 10), ('w_friend', 5), ('w_regular', 1), ('w_white', 1), ('w_upgrade', 10), ('w_upgrade', 20), ('w_redeye', 5)]
goals = dict(daily=[dict(id='d%02d' % (i + 1), **GL(t, n)) for i, (t, n) in enumerate(DAILY)], weekly=[dict(id='w%02d' % (i + 1), **GL(t, n)) for i, (t, n) in enumerate(WEEKLY)],
             rules=dict(dailyPick=3, dailyStash=10, dailyAllKey='brass', weeklyPick=5, weeklyStash=20, weeklyAllKey='silver', streakKey=dict(days=7, key='silver'), freezePerWeek=1, noRepeatDays=30),
             note=T('No paid resets, no timers. A missed day never costs you anything.', 'Ücretli sıfırlama yok, süre baskısı yok. Kaçırılan gün sana bir şey kaybettirmez.', 'ไม่มีเสียเงินรีเซ็ต ไม่มีจับเวลา วันที่พลาดไม่ทำให้เสียอะไร'))
assert len(goals['daily']) == 30 and len(goals['weekly']) == 20

# ---------- Endings ----------
endings = dict(endings=[
    dict(id='paid_in_full', contract='c3', cond=None, existing=True, art=None),
    dict(id='bought_the_machine', contract='c7', cond='dealsSigned == 0', existing=True, art=None),
    dict(id='new_management', contract='c10', cond='curses >= 5', existing=True, art=None),
    dict(id='the_refuser', contract='c5+', cond='whiteTaken >= 1', existing=False, art='ending/the_refuser',
         name=T('The Refuser', 'Reddeden', 'คนวางสาย'), text=T(
             'Nim picks up the red phone one last time and hangs up. Mr. Lost-and-Found hands her a box of everything she ever lost, the old cart included. The machine goes quiet. The corner is hers.',
             'Nim kırmızı telefonu son kez eline alır ve kapatır. Kayıp Eşya Bey ona kaybettiği her şeyin bulunduğu bir kutu uzatır, eski araba da içinde. Makine susar. Köşe artık onun.',
             'นิ่มยกโทรศัพท์แดงขึ้นมาเป็นครั้งสุดท้ายแล้ววางสาย พี่ของหายยื่นกล่องใส่ทุกอย่างที่เธอเคยทำหายให้ รวมถึงรถเข็นคันเก่า เครื่องเงียบลง หัวมุมนี้เป็นของเธอแล้ว')),
    dict(id='left_luggage', contract='c10', cond='luggageFused == 4', existing=False, art='ending/left_luggage', secret=True,
         name=T('Left Luggage', 'Emanet Dolabı', 'ตู้ฝากของ'), hidden=T('???', '???', '???'), clue=T('Mr. Ruby\'s fine print mentions "four boxes, all blended".', 'Bay Ruby\'nin küçük yazılarında "dört kutu, hepsi karışık" yazıyor.', 'ตัวหนังสือเล็กๆ ของมิสเตอร์รูบี้พูดถึง "สี่ตู้ ปั่นรวมหมดแล้ว"'),
         text=T('Four luggage lockers glow in the alley, each holding a blended charm that hums in tune. The machine unplugs itself. Mr. Ruby sits on a suitcase and, for once, has nothing to say.',
                'Sokakta dört emanet dolabı parlıyor, her birinde uyum içinde vızıldayan karışık bir tılsım var. Makine fişini kendi çeker. Bay Ruby bir bavulun üstüne oturur ve ilk kez söyleyecek sözü yoktur.',
                'ตู้ฝากของสี่ตู้เรืองแสงอยู่ในซอย แต่ละตู้มีไอเท็มปั่นรวมที่ครางเป็นเสียงเดียวกัน เครื่องดึงปลั๊กตัวเอง มิสเตอร์รูบี้นั่งบนกระเป๋าเดินทางและเป็นครั้งแรกที่ไม่มีอะไรจะพูด'))],
    epilogue=dict(per='lines.epilogue', when='spirit was Regular in the run', count=8))
