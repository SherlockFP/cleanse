# v3 charms: 16 active (HONK), 8 Red Eye, 24 fused (Blender), plus fusion.json and the redeye symbol. SPEC 4.4 to 4.6 verbatim.
charms3 = []
FREE = None
def C3(i, fam, rar, icon, nm, rules, *, tags=(), unlock=None, active=None, fused=None):
    assert 'charm/' + icon in ALLICONS, icon
    cur, pr = PRICE[RK[rar]] if rar in RK else ('coins', 30)
    d = dict(id=i, name=T(*nm), family=fam, tags=[fam] + list(tags), rarity={'c': 'common', 'u': 'uncommon', 'r': 'rare', 'l': 'legendary', 'f': 'fused'}[rar], icon='charm/' + icon,
             price={cur: pr}, unlock=unlock, rules=rules)
    tx = text(rules)
    if active: d['active'] = dict(need=active); tx = {l: tx[l] + tail(l, active) for l in L}
    if fused: d['fused'] = list(fused); d['buyable'] = False
    if unlock and unlock.startswith('pool:'):
        d['unlockText'] = T('Opens with the %s Cabinet in the Notebook (Pool tab).' % ('Street' if unlock == 'pool:common' else 'Night'), 'Defterin Havuz sekmesindeki %s Dolabı ile açılır.' % ('Sokak' if unlock == 'pool:common' else 'Gece'), 'ปลดล็อกด้วยตู้%sในสมุดโน้ต (แท็บคลัง)' % ('ของริมถนน' if unlock == 'pool:common' else 'ยามค่ำ'))
    if fused: d['unlockText'] = T('Blend two charms of the right families in the Blender.', 'Doğru ailelerden iki tılsımı Karıştırıcıda karıştır.', 'ปั่นไอเท็มสองชิ้นของตระกูลที่ถูกต้องในเครื่องปั่น')
    d['text'] = tx
    if rar == 'f': d['rarity'] = 'fused'
    elif rar in RK: d['rarity'] = RK[rar]
    charms3.append(d)
OA = lambda *effs, **cond: R('onActivate', cond or None, *effs)
# --- active (tag active, field active.need; unlock 'nb:pool_xx' = a Notebook Pool cabinet opens it) ---
C3('bike_horn', 'tinker', 'c', 'bike_horn', ('Bike Horn', 'Bisiklet Kornası', 'แตรจักรยาน'), [OA(E('luck', 3, scope='spin'))], tags=['active'], active=1)
C3('ice_bucket', 'ember', 'c', 'ice_bucket', ('Ice Bucket', 'Buz Kovası', 'ถังน้ำแข็ง'), [OA(E('heat', -3))], tags=['active'], active=1)
C3('sweeper', 'ember', 'c', 'sweeper', ('Street Sweeper', 'Sokak Süpürücü', 'คนกวาดถนน'), [OA(E('weight', 0, sym='ash', scope='spin'))], tags=['active'], active=1, unlock='pool:common')
C3('price_gun', 'ledger', 'c', 'price_gun', ('Price Gun', 'Etiket Tabancası', 'ปืนติดป้ายราคา'), [OA(E('coins', 10))], tags=['active'], active=1, unlock='pool:common')
C3('wok_toss', 'ember', 'c', 'wok_toss', ('Wok Toss', 'Wok Savurma', 'เหวี่ยงกระทะ'), [OA(E('heat', 3))], tags=['active'], active=1, unlock='pool:common')
C3('fish_sauce', 'swarm', 'u', 'fish_sauce', ('Fish Sauce', 'Balık Sosu', 'น้ำปลา'), [OA(E('allMult', 2, scope='spin'))], tags=['active'], active=1)
C3('calculator', 'ledger', 'u', 'calculator', ('Pocket Calculator', 'Cep Hesap Makinesi', 'เครื่องคิดเลขพกพา'), [OA(E('interest', 3, scope='round'))], tags=['active'], active=1, unlock='pool:uncommon')
C3('coin_flip', 'omen', 'u', 'coin_flip', ('Coin Flip', 'Yazı Tura', 'โยนเหรียญ'), [OA(E('coins', 20), chance=50)], tags=['active'], active=1)
C3('megaphone', 'omen', 'u', 'megaphone', ('Megaphone', 'Megafon', 'โทรโข่ง'), [OA(E('place', 3, sym='favoured'))], tags=['active'], active=1)
C3('rubber_band', 'stitch', 'u', 'rubber_band', ('Rubber Band', 'Lastik Bant', 'หนังยาง'), [OA(E('trick', 1))], tags=['active'], active=1, unlock='pool:uncommon')
C3('taxi_meter', 'ledger', 'u', 'taxi_meter', ('Taxi Meter', 'Taksimetre', 'มิเตอร์แท็กซี่'), [OA(E('wick', 2))], tags=['active'], active=1, unlock='pool:uncommon')
C3('spare_tyre', 'tinker', 'r', 'spare_tyre', ('Spare Tyre', 'Yedek Lastik', 'ยางอะไหล่'), [OA(E('spins', 2))], tags=['active'], active=2)
C3('neon_open', 'pact', 'r', 'neon_open', ('Neon Open Sign', 'Neon Açık Tabelası', 'ป้ายนีออนเปิดร้าน'), [OA(E('patMult', 2, pattern='all', scope='spin'))], tags=['active'], active=2)
C3('double_shift', 'pact', 'r', 'double_shift', ('Double Shift', 'Çift Vardiya', 'ควบสองกะ'), [OA(E('allMult', 3, scope='spin'), E('heat', 2))], tags=['active'], active=2)
C3('gold_spray', 'crown', 'r', 'gold_spray', ('Gold Spray Can', 'Altın Sprey', 'สีสเปรย์ทอง'), [OA(E('symValue', 4, sym='high', scope='spin'))], tags=['active'], active=2)
C3('bike_jump', 'tinker', 'l', 'bike_jump', ('Motorbike Jump', 'Motosiklet Atlayışı', 'มอไซค์กระโดด'), [OA(E('spins', 1), E('luck', 2, scope='spin'), E('patMult', 2, pattern='big', scope='spin'))], tags=['active'], active=2)
# --- Red Eye (family hex, tag redeye) ---
C3('eye_drops', 'hex', 'c', 'eye_drops', ('Eye Drops', 'Göz Damlası', 'ยาหยอดตา'), [pas(sflag('redEyeSoft', 1))], tags=['redeye'])
C3('taillight', 'hex', 'c', 'taillight', ('Taillight', 'Stop Lambası', 'ไฟท้าย'), [pas(E('luck', 1, per='redEyes'))], tags=['redeye'], unlock='pool:common')
C3('staring', 'hex', 'u', 'staring', ('Staring Contest', 'Bakışma Yarışı', 'แข่งจ้องตา'), [R('onRedEye', None, E('stack', 1)), pas(E('symMult', 0.25, sym='all', per='stack'))], tags=['redeye'])
C3('omen_jar', 'hex', 'u', 'omen_jar', ('Bad Omen Jar', 'Kötü Fal Kavanozu', 'โหลลางร้าย'), [R('onRedEye', None, E('coins', 20))], tags=['redeye'], unlock='pool:uncommon')
C3('red_eye_flight', 'hex', 'u', 'red_eye_flight', ('Red-eye Flight', 'Gece Uçuşu', 'เที่ยวบินดึก'), [R('onRedEye', None, E('spins', 2))], tags=['redeye'])
C3('ruby_shades', 'hex', 'r', 'ruby_shades', ("Ruby's Shades", "Ruby'nin Gözlüğü", 'แว่นของรูบี้'), [pas(sflag('redEyeRate', 2), E('allMult', 1.25))], tags=['redeye'])
C3('night_owl', 'hex', 'r', 'night_owl', ('Night Owl', 'Gece Baykuşu', 'นกฮูกกลางคืน'), [R('onRedEye', None, E('gainCharm', rarity='rare'))], tags=['redeye'])
C3('counter_stare', 'hex', 'l', 'counter_stare', ('Counter-stare', 'Karşı Bakış', 'จ้องตอบ'), [pas(sflag('redEyeBless'))], tags=['redeye'])
# --- fused (24 distinct family pairs; rarity fused; sale only) ---
FUS = []
def FZ(i, a, b, nm, rules):
    C3(i, a, 'f', i, nm, rules, tags=[b, 'fused'], unlock='blend', fused=(a, b)); FUS.append(dict(a=a, b=b, out=i))
FZ('f_skewer_cart', 'swarm', 'ember', ('Skewer Cart', 'Şiş Arabası', 'รถเข็นไม้เสียบ'), [pas(E('symValue', 2, sym='low'), E('symMult', 0.1, sym='low', per='heat'))])
FZ('f_firefly_snack', 'swarm', 'wisp', ('Firefly Snack', 'Ateşböceği Atıştırmalığı', 'ของกินเล่นหิ่งห้อย'), [R('onPattern', dict(group='low', hasWisp=True), E('retrigger', 1))])
FZ('f_street_gold', 'swarm', 'crown', ('Street Gold', 'Sokak Altını', 'ทองข้างถนน'), [R('onPattern', dict(group='low', minCells=5), E('coins', 5))])
FZ('f_market_scale', 'swarm', 'ledger', ('Market Scale', 'Pazar Terazisi', 'ตาชั่งตลาด'), [R('onSymbolLand', dict(group='low', every=10), E('interest', 1))])
FZ('f_smog_wok', 'ember', 'hex', ('Smog Wok', 'Sisli Wok', 'กระทะหมอกควัน'), [pas(E('patMult', 0.5, pattern='all', per='curses'))])
FZ('f_neon_grill', 'ember', 'pact', ('Neon Grill', 'Neon Izgara', 'เตาย่างนีออน'), [R('onScorch', None, E('wick', 3), E('coins', 10))])
FZ('f_lucky_chili', 'ember', 'omen', ('Lucky Chili', 'Şanslı Biber', 'พริกนำโชค'), [pas(E('luck', 0.5, per='heat'))])
FZ('f_ruby_umbrella', 'hex', 'pact', ('Ruby Umbrella', 'Ruby Şemsiyesi', 'ร่มรูบี้'), [R('onCurse', None, E('coins', 15)), R('passive', dict(cursesMin=3), E('allMult', 1.5))])
FZ('f_rainy_day_fund', 'hex', 'ledger', ('Rainy Day Fund', 'Yağmurlu Gün Fonu', 'เงินเผื่อฝนตก'), [pas(E('interest', 1, per='curses'))])
FZ('f_monsoon_gold', 'hex', 'crown', ('Monsoon Gold', 'Muson Altını', 'ทองหน้าฝน'), [pas(E('symValue', 1, sym='crown', per='curses'))])
FZ('f_small_print_lawyer', 'ledger', 'pact', ('Small-print Lawyer', 'Küçük Yazı Avukatı', 'ทนายตัวหนังสือเล็ก'), [R('onDeal', None, E('interest', 2))])
FZ('f_meter_taxi', 'ledger', 'tinker', ('Meter Taxi', 'Taksimetreli Taksi', 'แท็กซี่มิเตอร์'), [R('onTrick', None, E('coins', 3))])
FZ('f_gold_shop', 'ledger', 'crown', ('Gold Shop', 'Kuyumcu', 'ร้านทอง'), [R('onInterest', None, E('symValue', 1, sym='crown'))])
FZ('f_calling_luck', 'pact', 'omen', ('Calling Luck', 'Kartvizit Şansı', 'นามบัตรนำโชค'), [R('onSymbolLand', dict(sym='sigil'), E('luck', 1, scope='round'))])
FZ('f_rooftop_lease', 'pact', 'crown', ('Rooftop Lease', 'Çatı Kirası', 'เช่าดาดฟ้า'), [R('onDeal', None, E('gainCharm', rarity='rare'))])
FZ('f_lucky_combo', 'omen', 'stitch', ('Lucky Combo', 'Şanslı Kombo', 'คอมโบนำโชค'), [R('onPattern', dict(favoured=True), E('patMult', 1, pattern='this'))])
FZ('f_glowing_special', 'omen', 'wisp', ('Glowing Special', 'Parlayan Özel', 'เมนูเด็ดเรืองแสง'), [pas(E('weight', 2, sym='wisp'), E('luck', 1))])
FZ('f_lucky_tuktuk', 'omen', 'tinker', ('Lucky Tuk-tuk', 'Şanslı Tuk-tuk', 'ตุ๊กตุ๊กนำโชค'), [R('onTrick', None, E('luck', 1, scope='round'))])
FZ('f_spinning_elbow', 'stitch', 'wisp', ('Spinning Elbow', 'Dönen Dirsek', 'ศอกกลับ'), [R('onPattern', dict(hasWisp=True), E('patMult', 2, pattern='this'))])
FZ('f_clinch_tool', 'stitch', 'tinker', ('Clinch Tool', 'Clinch Aleti', 'ประแจเข้าล็อก'), [R('onSpinEnd', dict(distinctMin=3), E('allMult', 2, scope='spin'))])
FZ('f_golden_belt', 'stitch', 'crown', ('Golden Belt', 'Altın Kemer', 'เข็มขัดทอง'), [pas(E('patMult', 2, pattern='big'))])
FZ('f_firefly_lamp', 'wisp', 'tinker', ('Firefly Lamp', 'Ateşböceği Lambası', 'ตะเกียงหิ่งห้อย'), [R('onSpinStart', None, E('place', 1, sym='wisp'))])
FZ('f_gold_dust', 'wisp', 'crown', ('Gold Dust', 'Altın Tozu', 'ผงทอง'), [R('onPattern', dict(group='high', hasWisp=True), E('retrigger', 1))])
FZ('f_gold_rims', 'tinker', 'crown', ('Gold Rims', 'Altın Jantlar', 'ล้อทอง'), [pas(E('slot', 1), E('symValue', 1, sym='high'))])
assert len(charms3) == 48 and len(FUS) == 24 and len({(f['a'], f['b']) for f in FUS}) == 24

fusion = dict(same=dict(cost=dict(common=2, uncommon=3, rare=4), pickOf=2, note=T(
    'Two charms of the same family and rarity make one charm of that family, one rarity up. You pick 1 of 2.',
    'Aynı aileden ve aynı nadirlikten iki tılsım, o aileden bir kademe yukarıda bir tılsım olur. 2 üzerinden 1 seçersin.',
    'ไอเท็มตระกูลและระดับเดียวกันสองชิ้น รวมเป็นหนึ่งชิ้นของตระกูลเดิมระดับสูงขึ้นหนึ่งขั้น เลือก 1 จาก 2')),
    recipeCost=5, recipeMinRarity='uncommon', excluded=['legendary', 'fused'], holdMs=600, firstRecipeFavour=dict(spirit='wire', n=1), recipes=FUS)

symbols3 = [dict(id='redeye', name=T('Red Eye', 'Kırmızı Göz', 'ดวงตาแดง'), tier=0, value=0, weight=0, kind='redeye', group=None, icon='sym/redeye',
                 text=T('Placed by the Red Eye event, never by the reels. Never matches and blocks every pattern through it. From debt 3 it can cost you the spin.',
                        'Makaralardan değil Kırmızı Göz olayından gelir. Hiçbir şeyle eşleşmez, içinden geçen her deseni keser. 3. borçtan itibaren çevirişi götürebilir.',
                        'มาจากเหตุการณ์ดวงตาแดง ไม่ได้มาจากวงล้อ ไม่จับคู่กับอะไรและขวางทุกลายที่ผ่าน ตั้งแต่หนี้ที่ 3 อาจทำให้เสียทั้งตา'))]
