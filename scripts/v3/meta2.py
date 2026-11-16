# v3 achievements, cart upgrades (the Review's build layer) and the stats vocabulary.
AC = [  # id, name, core stat, n, stash. Only stats that src/core/meta.js accumulates, so each one can really be earned
 ('friend_first', ('Hello, Neighbour', 'Merhaba Komşu', 'สวัสดีเพื่อนบ้าน'), 'stagesFriend', 1, 10),
 ('regular_first', ('A Regular', 'Müdavim Oldu', 'ขาประจำคนแรก'), 'stage:8', 1, 20),
 ('busy_corner', ('Busy Corner', 'Işlek Köşe', 'หัวมุมคึกคัก'), 'visits', 40, 20),
 ('pick_a_side', ('Pick a Side', 'Taraf Seç', 'เลือกข้าง'), 'himOrMe', 1, 10),
 ('small_print', ('Reads the Small Print', 'Küçük Yazıyı Okur', 'อ่านตัวหนังสือเล็ก'), 'redCalls', 5, 15),
 ('phone_pal', ('Phone Pal', 'Telefon Dostu', 'เพื่อนปลายสาย'), 'calls', 30, 15),
 ('dial_tone', ('Dial Tone', 'Çevir Sesi', 'เสียงสัญญาณ'), 'hangUps', 10, 15),
 ('red_eye_1', ('Red Eye, Meet Nim', 'Kırmızı Göz, Nim ile Tanış', 'ดวงตาแดง พบนิ่ม'), 'redEyes', 1, 10),
 ('red_eye_10', ('Eyes Everywhere', 'Her Yerde Gözler', 'ตาแดงเต็มไปหมด'), 'redEyes', 10, 25),
 ('good_tipper', ('Good Tipper', 'Cömert Bahşişçi', 'คนให้ทิปใจดี'), 'offerings', 50, 15),
 ('beep_beep', ('Beep Beep', 'Bip Bip', 'ปี๊นปี๊น'), 'honks', 10, 15),
 ('horn_chorus', ('Horn Chorus', 'Korna Korosu', 'ประสานเสียงแตร'), 'honks', 40, 25),
 ('first_blend', ('First Blend', 'İlk Karışım', 'ปั่นครั้งแรก'), 'blends', 1, 10),
 ('recipe_book', ('Recipe Book', 'Tarif Defteri', 'สมุดสูตร'), 'blends', 12, 30),
 ('master_blender', ('Master Blender', 'Karıştırma Ustası', 'เจ้าแห่งเครื่องปั่น'), 'blends', 30, 60),
 ('eyes_open', ('Eyes Open', 'Gözler Açık', 'ตาสว่าง'), 'staredDown', 1, 20),
 ('cart_mechanic', ('Cart Mechanic', 'Araba Tamircisi', 'ช่างรถเข็น'), 'upgrades', 10, 20),
 ('clean_hands', ('Clean Hands', 'Temiz Eller', 'มือสะอาด'), 'cleanContract', 1, 30),
 ('errand_runner', ('Errand Runner', 'Ayak İşleri', 'คนรับฝากงาน'), 'demands', 5, 20),
 ('back_again', ('Back Up Again', 'Yine Ayakta', 'ลุกขึ้นอีกครั้ง'), 'fallRise', 3, 30),
]
ach3 = [dict(id=i, name=T(*nm), cond=dict(stat=st, gte=n), reward=dict(stash=stash), text=REQ(st, n)) for i, nm, st, n, stash in AC]
assert len(ach3) == 20
# the four new characters open by achievements in achievements.json (the list core/meta.js checks); characters_v3 points at them
for _id, _nm, _st, _n in (('crew_yai', ('Noodle Money', 'Makarna Parası', 'เงินก๋วยเตี๋ยว'), 'coinsEarned', 10000), ('crew_beng', ('Shortcut Rider', 'Kestirme Sürücüsü', 'สายทางลัด'), 'tricksUsed', 100),
                          ('crew_pla', ('Heat Seeker', 'Sıcak Avcısı', 'สายร้อนแรง'), 'scorches', 20), ('crew_mali', ('Always a Spare', 'Hep Bir Yedek', 'มีสำรองเสมอ'), 'fallRise', 3)):
    ach.append(dict(id=_id, name=T(*_nm), cond=dict(stat=_st, gte=_n), reward=dict(char=_id[5:]), text=REQ(_st, _n)))

# ---------- cart upgrades: 2 per stall, a patMult or weight rule for the whole run (no new engine rule). Numbers follow src/core/shop.js (+1 mult, weight x1.5, base price 10 and 8) ----------
UP_ICON = dict(h3='cart/up_row', h4='cart/up_row', h5='cart/up_row', v3='cart/up_column', d3='cart/up_diag', saw='cart/up_diag', vee='cart/up_diag', halo='cart/up_corners',
               corners='cart/up_corners', cross='cart/up_plus', frame='cart/up_frame', full='cart/up_frame')
UP_N = {}
UP_PRICE = {k: 10 for k in UP_ICON}
UP_MIN = {k: 1 for k in UP_ICON}
upgrades = []
def UPG(i, icon, nm, eft, price, mindebt, kind):
    assert icon in ALLICONS, icon
    upgrades.append(dict(id=i, icon=icon, name=nm, kind=kind, effects=[eft], price=dict(coins=price), minDebt=mindebt, text=etext([eft])))
for p in PAT:
    pid = p['id']; n = UP_N.get(pid, 1); pn = p['name']
    UPG('up_' + pid, UP_ICON[pid], T('%s Tune-up' % pn['en'], '%s Bakımı' % pn['tr'], 'จูน%s' % pn['th']), E('patMult', n, pattern=pid), UP_PRICE[pid], UP_MIN[pid], 'pattern')
for s in symbols:
    if s['kind'] != 'score': continue
    sn = SN[s['id']]
    UPG('up_' + s['id'], 'cart/up_stock', T('%s Crate' % sn['en'], '%s Kasası' % sn['tr'], 'ตุน%s' % sn['th']), E('weight', 1.5, sym=s['id']), 8, 1, 'weight')
assert len(upgrades) == 21
cart_file = dict(upgrades=upgrades, offers=2, rule=T('Cart upgrades last the whole run. Two show at every stall. Each one raises a shape or adds weight to one symbol.',
                                                  'Araba yükseltmeleri bütün oyun sürer. Her tezgâhta ikisi görünür. Her biri bir şekli yükseltir ya da bir sembole ağırlık ekler.',
                                                  'อัปเกรดรถเข็นอยู่ไปตลอดรอบ ทุกแผงมีให้เลือกสองอย่าง แต่ละอย่างเพิ่มค่าของรูปทรงหรือเพิ่มน้ำหนักให้สัญลักษณ์หนึ่งชนิด'))
stats_file = dict(stats=[dict(id=k, label=v[0], screen=v[1]) for k, v in STATS.items()], screens=SCREENS,
                  special=dict(clear=T('Clear a place', 'Bir yeri bitir', 'ผ่านด่านหนึ่ง'), storm=T('Clear a place on a Storm level', 'Bir Fırtına seviyesinde bir yeri bitir', 'ผ่านด่านที่ระดับพายุหนึ่ง'),
                               lesson=T('Finish a lesson', 'Bir dersi bitir', 'เรียนบทหนึ่งให้จบ'), reached=T('Get a neighbour to a step', 'Bir komşuyu bir basamağa çıkar', 'ทำให้เพื่อนบ้านสนิทถึงขั้นหนึ่ง')))
