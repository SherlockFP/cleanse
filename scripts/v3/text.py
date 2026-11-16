# v3 phrase tables and composer extensions. Runs inside gen-v2-data.py's namespace: it rebinds eff, when and per so that
# text(rules) also composes the v3 primitives (SPEC section 3.8). Street words only: tip, favour, deal, regular, fan.
SPN = {  # spirit ids stay as in the SPEC; names are new, invented characters (no real worshipped figure)
    'brimble': T('Mr. Ruby', 'Bay Ruby', 'มิสเตอร์รูบี้'),
    'beckon': T('Madam Receipt', 'Bayan Fiş', 'คุณนายใบเสร็จ'),
    'gold': T('Chef Quack', 'Şef Vak', 'เชฟกาบ'),
    'wire': T('Uncle Wire', 'Tel Amca', 'ลุงสายไฟ'),
    'waiting': T('Mr. Lost-and-Found', 'Kayıp Eşya Bey', 'พี่ของหาย'),
    'tide': T('Grandmother Tide', 'Gelgit Nine', 'ยายน้ำขึ้น'),
    'moonbiter': T('Scrubby', 'Kazıcı', 'แปรงขัด'),
    'lamplit': T('Lady Lamplit', 'Lamba Hanım', 'เจ๊หลอดไฟ'),
}
SPIRITS = list(SPN)
FAVOUR = T('Favour', 'Hatır', 'น้ำใจ')
SN['mid'] = T('mid symbols', 'orta semboller', 'สัญลักษณ์กลาง')
TRIG.update({
    'onCall': T('When a call comes in', 'Arama gelince', 'เมื่อโทรศัพท์ดัง'),
    'onPick': T('When you pick a call card', 'Arama kartı seçince', 'เมื่อเลือกการ์ดโทรศัพท์'),
    'onHangUp': T('When you hang up', 'Telefonu kapatınca', 'เมื่อวางสาย'),
    'onVisit': T('When a neighbour visits the Tin', 'Teneke\'ye komşu uğrayınca', 'เมื่อเพื่อนบ้านแวะที่กระป๋องขนม'),
    'onOffering': T('When you give a tip', 'Bahşiş verince', 'เมื่อให้ทิป'),
    'onStage': T('When a neighbour moves up a step', 'Komşu bir basamak çıkınca', 'เมื่อเพื่อนบ้านสนิทขึ้นหนึ่งขั้น'),
    'onWrath': T('When a neighbour gets fed up', 'Komşu bozulunca', 'เมื่อเพื่อนบ้านหงุดหงิด'),
    'onRedEye': T('On a Red Eye', 'Kırmızı Göz\'de', 'เมื่อดวงตาแดงโผล่'),
    'onActivate': T('When you HONK', 'KORNA çalınca', 'เมื่อบีบแตร'),
    'onFuse': T('When you blend', 'Karıştırınca', 'เมื่อปั่นไอเท็ม'),
})
FLAGS.update({
    'noPawn': T('no Pawn and no Snooze', 'Rehin ve Erteleme yok', 'ไม่มีจำนำและไม่มีเลื่อนเวลา'),
    'heatMax': T('Spice tops out at {v}', 'Acı en çok {v} olur', 'เผ็ดสูงสุดแค่ {v}'),
    'carrySpins': T('unused spins carry over, up to {v}', 'kullanılmayan çevirişler en fazla {v} tane devreder', 'ตาที่เหลือยกไปรอบหน้าได้สูงสุด {v}'),
    'trickFree': T('tricks are not used up', 'numaralar harcanmaz', 'กลเม็ดไม่หมดไป'),
    'noShopN': T('the next {v} stalls are closed', 'sıradaki {v} tezgâh kapalı', 'แผงถัดไป {v} ครั้งปิด'),
    'noBeads': T('refused calls light no beads', 'reddedilen aramalar boncuk yakmaz', 'วางสายแล้วลูกปัดไม่ติด'),
    'noRelic': T('no Left Luggage relic', 'Emanet Dolabı eşyası gelmez', 'ไม่ได้ของจากตู้ฝากของ'),
    'redEyeRate': T('Red Eye chance {v} points higher', 'Kırmızı Göz ihtimali {v} puan artar', 'โอกาสดวงตาแดงเพิ่ม {v} จุด'),
    'redEyeBless': T('Red Eyes do not punish and the spin pays ×3', 'Kırmızı Göz cezalandırmaz, çeviriş ×3 öder', 'ดวงตาแดงไม่ลงโทษและตานั้นได้ ×3'),
    'redEyeSoft': T('Red Eye punishment is {v} level lighter', 'Kırmızı Göz cezası {v} kademe hafifler', 'โทษดวงตาแดงเบาลง {v} ระดับ'),
    'tinOfferings': T('{v} more tip at each stall visit', 'her tezgâh uğrayışında {v} bahşiş daha', 'ให้ทิปได้เพิ่ม {v} ครั้งทุกครั้งที่แวะแผง'),
    'callCards': T('{v} more card on every call', 'her aramada {v} kart daha', 'ทุกสายมีการ์ดเพิ่ม {v} ใบ'),
    'callRerollFree': T('the first reroll on each call is free', 'her aramada ilk yenileme bedava', 'สุ่มการ์ดใหม่ครั้งแรกของทุกสายฟรี'),
    'patronAt': T('a neighbour becomes a Regular at Favour {v}', 'komşu Hatır {v}\'de Müdavim olur', 'เพื่อนบ้านเป็นขาประจำที่น้ำใจ {v}'),
    'noRedEye': T('no Red Eye', 'Kırmızı Göz yok', 'ไม่มีดวงตาแดง'),
})
PERX = {
    'redEyes': T(' per Red Eye this run', ' (bu oyundaki Kırmızı Göz başına)', ' ต่อดวงตาแดงในเกมนี้'),
    'beads': T(' per lit bead', ' (yanan boncuk başına)', ' ต่อลูกปัดที่ติด'),
    'fused': T(' per fused charm', ' (karışık tılsım başına)', ' ต่อไอเท็มที่ปั่นรวม'),
}
_per = per
def per(p, l):
    if p in PERX: return PERX[p][l]
    if p.startswith('favour:'): return (T(' per Favour with %s', ' (%s ile Hatır başına)', ' ต่อน้ำใจกับ%s'))[l] % SPN[p[7:]][l]
    return _per(p, l)

def tgt(who, l):
    if who in SPN: return SPN[who][l]
    return {'visitor': T('the visiting neighbour', 'uğrayan komşu', 'เพื่อนบ้านที่แวะมา'), 'rival': T('its rival', 'rakibi', 'คู่แข่งของมัน'),
            'all': T('every neighbour', 'her komşu', 'เพื่อนบ้านทุกคน')}[who][l]
TRICK_NAME = {t['id']: t['name'] for t in tricks}
_eff = eff
def eff(e, l):
    t, n = e['type'], e.get('n', 0)
    r = None
    if t == 'favour':
        r = (T('Favour %s with %s', '%s ile Hatır %s', 'น้ำใจกับ%s %s'))[l]
        r = r % ((sgn(n), tgt(e['spirit'], l)) if l == 'en' else (tgt(e['spirit'], l), sgn(n)))
    elif t == 'charge':
        r = T('fully recharge every active charm', 'tüm etkin tılsımları tam şarj et', 'ชาร์จไอเท็มกดใช้ทุกชิ้นให้เต็ม')[l] if n >= 99 else T('%s charge on every active charm', 'her etkin tılsıma %s şarj', 'ชาร์จไอเท็มกดใช้ทุกชิ้น %s')[l] % sgn(n)
    elif t == 'liftCurse': r = T('lift %s curse of your choice', 'seçtiğin %s laneti kaldır', 'ถอนคำสาปที่เลือก %s อย่าง')[l] % num(n)
    elif t == 'loseCharm':
        r = (T('lose your priciest charm', 'en pahalı tılsımını kaybet', 'เสียไอเท็มที่แพงที่สุด') if e.get('pick') == 'best' else T('lose a random charm', 'rastgele bir tılsımını kaybet', 'เสียไอเท็มสุ่มหนึ่งชิ้น'))[l]
    elif t == 'trick' and e.get('id'): r = T('gain a %s', '%s kazan', 'ได้%s')[l] % TRICK_NAME[e['id']][l]
    elif t == 'gainCharm' and e.get('family'):
        k = e.get('n', 1)
        fam = T('of one random family', 'aynı rastgele aileden', 'จากตระกูลเดียวกันที่สุ่มได้')[l] if e['family'] == 'random' else T('of the %s family', '%s ailesinden', 'ตระกูล%s')[l] % FAM[e['family']][l]
        r = T('gain %s random %s charm%s %s', '%s rastgele %s tılsım kazan, %s', 'ได้ไอเท็ม%s %s ชิ้น %s')[l]
        r = r % ((k, RAR[e['rarity']][l], 's' if k > 1 else '', fam) if l == 'en' else (k, RAR[e['rarity']][l], fam) if l == 'tr' else (RAR[e['rarity']][l], k, fam))
    elif t == 'place' and e.get('sym') == 'favoured': r = T('turn %s cells into the Special', '%s hücreyi Gözde yap', 'เปลี่ยน %s ช่องเป็นเมนูเด็ด')[l] % num(n)
    elif t == 'removeSymbol': r = T('remove %s symbol' + ('s' if n > 1 else '') + ' of your choice from the machine', 'makineden seçtiğin %s sembolü çıkar', 'ถอดสัญลักษณ์ที่เลือก %s ชนิดออกจากเครื่อง')[l] % num(n)
    elif t == 'flag' and e['flag'] == 'noShopN' and e.get('v') == 1: r = T('the next stall is closed', 'sıradaki tezgâh kapalı', 'แผงถัดไปปิด 1 ครั้ง')[l]
    elif t == 'flag' and e['flag'] == 'benchDiscount' and e.get('v') == 100: r = T('bench work is free', 'tezgâh işleri bedava', 'งานโต๊ะช่างฟรี')[l]
    elif t == 'flag' and e['flag'] == 'trickPockets' and e.get('v', 0) < 0: r = T('%s trick pocket', '%s numara cebi', '%s ช่องกลเม็ด')[l] % sgn(e['v'])
    elif t == 'flag' and e['flag'] == 'shopExtra' and e.get('v', 1) > 1: r = T('the next shop has +%s charms and a free reroll', 'sıradaki dükkânda +%s tılsım ve bedava yenileme olur', 'ร้านถัดไปมีไอเท็ม +%s ชิ้นและสุ่มใหม่ฟรี 1 ครั้ง')[l] % num(e['v'])
    elif t == 'flag' and e['flag'] in ('sellFull', 'seeNextFav', 'noBeads', 'noRelic', 'trickFree', 'callRerollFree', 'redEyeBless', 'noRedEye') and e.get('v') is True: r = FLAGS[e['flag']][l]
    if r is None: return _eff(e, l)
    if e.get('scope') in SCOPE: r += SCOPE[e['scope']][l]
    if e.get('per'): r += per(e['per'], l)
    return r

_when = when
def when(tr, c, l):
    c = dict(c)
    extra = []
    if 'favour' in c:
        who, k = c.pop('favour'); extra.append((T('if Favour with %s is %d+', '%s ile Hatır %d+ ise', 'ถ้าน้ำใจกับ%s ถึง %d+'))[l] % ((tgt(who, l), k)))
    if 'favourMax' in c:
        who, k = c.pop('favourMax'); extra.append((T('if Favour with %s is %d or less', '%s ile Hatır en çok %d ise', 'ถ้าน้ำใจกับ%s ไม่เกิน %d'))[l] % ((tgt(who, l), k)))
    if 'beadsMin' in c: extra.append(T('if %d+ beads are lit', '%d+ boncuk yanıyorsa', 'ถ้าลูกปัดติด %d+ ลูก')[l] % c.pop('beadsMin'))
    if 'redEyesMin' in c: extra.append(T('after %d+ Red Eyes this run', 'bu oyunda %d+ Kırmızı Göz sonrası', 'หลังดวงตาแดง %d+ ครั้งในเกมนี้')[l] % c.pop('redEyesMin'))
    if 'debtMin' in c: extra.append(T('from debt %d', '%d. borçtan itibaren', 'ตั้งแต่หนี้ที่ %d')[l] % c.pop('debtMin'))
    if tr == 'onSymbolLand' and not c.get('sym') and not c.get('zone') and c.get('group'):
        g = c.pop('group'); w0 = T('Each %s symbol that lands', 'İnen her %s sembol', 'ทุกสัญลักษณ์%sที่ตก')[l] % {'low': T('low', 'düşük', 'ต่ำ'), 'mid': T('mid', 'orta', 'กลาง'), 'high': T('high', 'yüksek', 'สูง')}[g][l]
        rest = _when('now', c, l)
        rest = rest.split(', ', 1)[1] if (', ' in rest and l != 'th') else (rest.split(' ', 1)[1] if (l == 'th' and ' ' in rest) else '')
        return (' ' if l == 'th' else ', ').join([x for x in [w0, rest] + extra if x])
    base = _when(tr, c, l)
    return (' ' if l == 'th' else ', ').join([base] + extra)

def tail(l, need):  # active charms: charge need, shown after the rule text
    if l == 'en': return ' Needs %d charge%s.' % (need, '' if need == 1 else 's')
    if l == 'tr': return ' %d şarj gerekir.' % need
    return ' ต้องชาร์จ %d' % need

def cap(s): return s[:1].upper() + s[1:]
def etext(effs):
    return T(*[cap(', '.join(eff(e, l) for e in effs)) + ('' if l == 'th' else '.') for l in L])
def pas(*effs): return R('passive', None, *effs)
def sflag(flag, v=True, scope=None):
    d = dict(type='flag', flag=flag, v=v)
    if scope: d['scope'] = scope
    return d

