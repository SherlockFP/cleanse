// Small Luck Pier, v1.0-lite strings. EN + TR. All text goes through t(key, vars); {n} style placeholders.
// Keys follow TECH.md section 7: ui.*, sym.<id>, trinket.<id>.name|short|desc, chart.<id>.*, event.<id>.*,
// build.<id>.name, line.<who>.<trigger>.<n>. Content beyond lite (CONTENT.md) is added by the monthly drops.
const EN = {};
const TR = {};
const add = (en, tr) => { Object.assign(EN, en); Object.assign(TR, tr); };

// ---- Symbols (12 in lite) -------------------------------------------------------------------
const SYMS = [
  ['pebble', 'Pebble', 'Çakıl'], ['sardine', 'Sardine', 'Sardalya'], ['tea', 'Tea glass', 'Çay bardağı'],
  ['lantern', 'Lantern', 'Fener'], ['gull', 'Gull', 'Martı'], ['knot', 'Knot', 'Düğüm'],
  ['net', 'Net', 'Ağ'], ['kelp', 'Kelp', 'Yosun'], ['samovar', 'Samovar', 'Semaver'],
  ['cat', 'Cat', 'Kedi'], ['barnacle', 'Barnacle', 'Midye kabuğu'], ['storm', 'Storm cloud', 'Fırtına bulutu'],
];
// One-line rule per symbol for the bag screen.
const SYM_RULE = {
  pebble: ['Line symbol. Pays 3.', 'Dizi sembolü. 3 öder.'],
  sardine: ['Line symbol. Pays 6.', 'Dizi sembolü. 6 öder.'],
  tea: ['Line symbol. Pays 10.', 'Dizi sembolü. 10 öder.'],
  lantern: ['Line symbol. Pays 15.', 'Dizi sembolü. 15 öder.'],
  gull: ['Line symbol. Pays 25.', 'Dizi sembolü. 25 öder.'],
  knot: ['Counts as any line symbol. Three Knots pay 12.', 'Her dizi sembolü yerine geçer. Üç düğüm 12 öder.'],
  net: ['Pays 2 for each Sardine next to it.', 'Yanındaki her sardalya için 2 öder.'],
  kelp: ['Once per spin, if Kelp lands, pays its counter, then the counter grows by 1 (max 5).', 'Çevirmede yosun gelirse sayacı kadar öder, sonra sayaç 1 artar (en çok 5).'],
  samovar: ['Pays 3 for each Tea glass next to it.', 'Yanındaki her çay bardağı için 3 öder.'],
  cat: ['Pays 4 for each Sardine or Gull next to it.', 'Yanındaki her sardalya ya da martı için 4 öder.'],
  barnacle: ['Pays nothing.', 'Hiçbir şey ödemez.'],
  storm: ['Pays nothing. It and the squares next to it cannot be pegged.', 'Hiçbir şey ödemez. Kendisi ve yanındaki kareler mandallanamaz.'],
};
for (const [id, en, tr] of SYMS) add({ ['sym.' + id]: en, ['sym.' + id + '.rule']: SYM_RULE[id][0] }, { ['sym.' + id]: tr, ['sym.' + id + '.rule']: SYM_RULE[id][1] });

// ---- Trinkets (35 in lite): id, EN name, TR name, EN short, TR short, EN full effect, TR full effect -----------
const TRINKETS = [
  // Catch
  ['salt_barrel', 'Salt Barrel', 'Tuz Fıçısı', 'Sardine lines pay +5', 'Sardalya dizileri +5', 'Sardine lines pay +5.', 'Sardalya dizileri +5 öder.'],
  ['fish_cart', 'Fish Cart', 'Balık Arabası', '4+ Sardines land: +20', '4+ sardalya gelirse +20', 'If 4 or more Sardines land, +20.', '4 ya da daha çok sardalya gelirse +20.'],
  ['net_mender', 'Net Mender', 'Ağ Tamircisi', 'Nets pay 4 per Sardine', 'Ağ, sardalya başına 4', 'Each Net pays 4 per adjacent Sardine instead of 2.', 'Her ağ, yanındaki sardalya başına 2 yerine 4 öder.'],
  ['fish_hook', 'Fish Hook', 'Olta İğnesi', 'Sardine lines pay x2', 'Sardalya dizileri x2', 'Sardine lines pay x2.', 'Sardalya dizileri x2 öder.'],
  ['ice_crate', 'Ice Crate', 'Buz Kasası', 'Held Sardines in a line: +12 each', 'Mandallı sardalya başına +12', 'A Sardine line completed with held Sardines pays +12 per held Sardine.', 'Mandallı sardalyalarla tamamlanan sardalya dizisi, mandallı sardalya başına +12 öder.'],
  ['pier_cat', 'Pier Cat', 'İskele Kedisi', 'Sardine lines +5, Cats x2', 'Sardalya dizisi +5, kedi x2', 'Each Sardine line pays +5. Each Cat pays x2.', 'Her sardalya dizisi +5 öder. Her kedi x2 öder.'],
  ['fish_scale', "Fishmonger's Scale", 'Balıkçı Terazisi', 'Paying Sardine lines raise Sardine pay', 'Sardalya dizisi, sardalya ödemesini büyütür', 'Each Sardine line that pays (counted per line, not per spin) adds +6 to Sardine line pay for the rest of the run, max +30.', 'Ödeme yapan her sardalya dizisi (çevirme başına değil, dizi başına) sefer boyunca sardalya dizisi ödemesine +6 ekler, en çok +30.'],
  ['full_net', 'Full Net', 'Dolu Ağ', '5+ Sardines land: +40', '5+ sardalya gelirse +40', 'If 5 or more Sardines land, +40.', '5 ya da daha çok sardalya gelirse +40.'],
  // Peg
  ['spare_peg', 'Spare Peg', 'Yedek Mandal', '+1 peg per tide', 'Gelgit başına +1 mandal', '+1 peg per tide.', 'Gelgit başına +1 mandal.'],
  ['steady_hand', 'Steady Hand', 'Sabit El', 'Line with 2 pegged squares: +3', 'İki mandallı kareyle dizi: +3', 'A line completed with 2 pegged cells pays +3.', 'İki mandallı kareyle tamamlanan dizi +3 öder.'],
  ['brass_peg', 'Brass Peg', 'Pirinç Mandal', 'Pegged squares in paying lines +2', 'Ödeyen dizideki mandallı kare +2', 'Each pegged cell that is part of a paying line pays +2.', 'Ödeme yapan bir dizinin parçası olan her mandallı kare +2 öder.'],
  // Tide
  ['first_light', 'First Light', 'İlk Işık', 'Spin 1 of each tide pays x3', 'Her gelgitin 1. çevirmesi x3', 'Spin 1 of each tide pays x3.', 'Her gelgitin 1. çevirmesi x3 öder.'],
  ['tide_table', 'Tide Table', 'Gelgit Cetveli', 'Every 3rd spin pays +4', 'Her 3. çevirme +4', 'Every 3rd spin of a tide pays +4.', 'Gelgitin her 3. çevirmesi +4 öder.'],
  ['dry_spell', 'Dry Spell', 'Kurak Gün', 'After a 0 spin, next pays x1.75', 'Boş çevirmeden sonra x1,75', 'After a spin that pays 0, the next spin pays x1.75.', '0 ödeyen çevirmeden sonraki çevirme x1,75 öder.'],
  ['night_tide', 'Night Tide', 'Gece Suyu', 'Last spin of each tide pays x2', 'Gelgitin son çevirmesi x2', 'The last spin of each tide pays x2.', 'Her gelgitin son çevirmesi x2 öder.'],
  ['lucky_sandal', 'Lucky Sandal', 'Uğurlu Terlik', 'Three empty spins charge a +30', 'Üç boş çevirme +30 yükler', 'Each spin that pays 0 adds 1 charge. At 3 charges the next spin pays +30 and charges reset. The reel odds do not change.', 'Her boş çevirme 1 yük ekler. 3 yükte sonraki çevirme +30 öder ve yükler sıfırlanır. Çarkın olasılıkları değişmez.'],
  ['slack_water', 'Slack Water', 'Durgun Su', 'Quota -8%', 'Kota -%8', 'Quota -8%.', 'Kota -%8.'],
  ['orhans_watch', "Orhan's Watch", "Orhan'ın Saati", '+1 spin and +1 peg per tide', 'Gelgitte +1 çevirme, +1 mandal', '+1 spin and +1 peg per tide.', 'Her gelgitte +1 çevirme ve +1 mandal.'],
  ['second_wind', 'Second Wind', 'İkinci Nefes', "Orhan's mercy reaches 20, twice", 'Orhan 20 eksiği, iki kez yuvarlar', "Orhan's mercy covers a gap of up to 20 instead of 5, and can fire twice per run.", "Orhan'ın yuvarlaması 5 yerine 20'ye kadar olan eksiği kapatır ve seferde iki kez çalışabilir."],
  // Ledger
  ['tin_cup', 'Tin Cup', 'Teneke Kupa', '+8 coins at each tide start', 'Her gelgit başında +8 para', '+8 coins at the start of each tide.', 'Her gelgitin başında +8 para.'],
  ['lucky_ledger', 'Lucky Ledger', 'Uğurlu Defter', 'First two rerolls each shop free', 'Her dükkanda ilk iki yenileme bedava', 'The first two rerolls in each shop are free.', 'Her dükkanda ilk iki yenileme bedava.'],
  ['pebble_jar', 'Pebble Jar', 'Çakıl Kavanozu', 'Pebble lines pay +4', 'Çakıl dizileri +4', 'Pebble lines pay +4.', 'Çakıl dizileri +4 öder.'],
  ['skipping_stone', 'Skipping Stone', 'Sektirme Taşı', '+2 per 2 Pebbles landed, max 6', 'Her 2 çakıl için +2, en çok 6', '+2 for every 2 Pebbles that land, max 6 per spin.', 'Gelen her 2 çakıl için +2, çevirme başına en çok 6.'],
  ['hagglers_cap', "Haggler's Cap", 'Pazarlıkçı Kasketi', 'Shop prices -20%', 'Dükkan fiyatları -%20', 'Shop prices -20%.', 'Dükkan fiyatları -%20.'],
  ['junk_cart', 'Junk Cart', 'Eskici Arabası', 'First removal each shop is free', 'Dükkanda ilk çıkarma bedava', 'The first token removal in each shop is free. It still uses one of your 3 removals this run.', 'Her dükkanda ilk parça çıkarma bedava. Bu koşuda 3 çıkarma hakkından birini yine harcar.'],
  ['kelp_pot', 'Kelp Pot', 'Yosun Saksısı', 'Kelp counter grows +2, max 7', 'Yosun sayacı +2 artar, en çok 7', 'The Kelp counter grows +2 instead of +1, max 7.', 'Yosun sayacı +1 yerine +2 artar, en çok 7.'],
  ['sea_chest', 'Sea Chest', 'Sandık', '+3 coins per shelf trinket at tide end', 'Gelgit sonu raftaki biblo başına +3', '+3 coins per held trinket at tide end.', 'Gelgit sonunda elindeki her biblo için +3 para.'],
  // Hearth
  ['samovar_tap', 'Samovar Tap', 'Semaver Musluğu', 'Tea glass lines pay +6', 'Çay dizileri +6', 'Tea glass lines pay +6.', 'Çay bardağı dizileri +6 öder.'],
  ['lantern_oil', 'Lantern Oil', 'Fener Yağı', 'Lantern lines pay +8', 'Fener dizileri +8', 'Lantern lines pay +8.', 'Fener dizileri +8 öder.'],
  ['sugar_cube', 'Sugar Cube', 'Kesme Şeker', 'Tea next to a Lantern: +3', 'Fenerin yanındaki çay +3', 'Each Tea glass adjacent to a Lantern pays +3.', 'Fenerin yanındaki her çay bardağı +3 öder.'],
  ['warm_rug', 'Warm Rug', 'Sıcak Kilim', 'No peg clipped: +2 (spins 2-6)', 'Mandalsız çevirme +2 (2-6)', 'A spin with no peg clipped pays +2 (spins 2-6).', 'Hiç mandal takılı olmayan çevirme +2 öder (2-6. çevirmeler).'],
  ['grandmas_cup', "Grandma's Cup", 'Babaanne Fincanı', 'Tea glass lines pay x2', 'Çay dizileri x2', 'Tea glass lines pay x2.', 'Çay bardağı dizileri x2 öder.'],
  ['hearth_stone', 'Hearth Stone', 'Ocak Taşı', 'After quota: +20% of jar, max 20', "Kotadan sonra kavanozun %20'si, en çok 20", 'After the quota is paid, +20% of the jar, max 20.', 'Kota ödendikten sonra kavanozun %20 kadarı ek gelir, en çok 20.'],
  ['wick_trimmer', 'Wick Trimmer', 'Fitil Makası', 'Middle-line Lantern lines pay x3', 'Ortadaki fener dizileri x3', 'Lantern lines in the middle row or middle column pay x3.', 'Orta satırdaki ya da orta sütundaki fener dizileri x3 öder.'],
  ['tea_garden', 'Tea Garden', 'Çay Bahçesi', 'Tea line plus Lantern line: x3', 'Çay ve fener dizisi birlikte: x3', 'A spin with a Tea glass line and a Lantern line pays x3 in total.', 'Aynı çevirmede hem çay bardağı hem fener dizisi varsa toplam x3 öder.'],
];
for (const [id, en, tr, es, ts, ed, td] of TRINKETS) {
  const k = 'trinket.' + id;
  add({ [k + '.name']: en, [k + '.short']: es, [k + '.desc']: ed }, { [k + '.name']: tr, [k + '.short']: ts, [k + '.desc']: td });
}

// ---- Tide Charts (6 in lite) ------------------------------------------------------------------
const CHARTS = [
  ['spring_tide', 'Spring Tide', 'Bahar Suyu', 'Quota +20%. All line pay +25%.', 'Kota +%20. Tüm dizi ödemeleri +%25.'],
  ['neap_tide', 'Neap Tide', 'Ölü Su', 'Quota -15%. 5 spins per tide.', 'Kota -%15. Gelgitte 5 çevirme.'],
  ['bare_line', 'Bare Line', 'Boş İp', '1 peg per tide. Start with 20 coins.', 'Gelgitte 1 mandal. 20 parayla başla.'],
  ['market_day', 'Market Day', 'Pazar Günü', 'Shops show 4 offers. Prices +25%.', 'Dükkanda 4 teklif var. Fiyatlar +%25.'],
  ['tight_shelf', 'Tight Shelf', 'Dar Raf', '3 trinket places. Trinkets cost half.', 'Rafta 3 yer var. Biblolar yarı fiyat.'],
  ['long_evening', 'Long Evening', 'Uzun Akşam', '7 spins per tide. Quota +15%.', 'Gelgitte 7 çevirme. Kota +%15.'],
];
for (const [id, en, tr, ed, td] of CHARTS) add({ ['chart.' + id + '.name']: en, ['chart.' + id + '.desc']: ed }, { ['chart.' + id + '.name']: tr, ['chart.' + id + '.desc']: td });

// ---- Creditor events (4 in lite) ---------------------------------------------------------------
const EVENTS = [
  ['auditor', 'The Auditor', 'Müfettiş', 'Nermin Hanım from the district office', 'İlçeden Nermin Hanım', '2 pegs this tide instead of 3.', 'Bu gelgit 3 yerine 2 mandal.'],
  ['fog_bank', 'Fog Bank', 'Sis', 'The weather', 'Hava', 'The right column cannot be pegged.', 'Sağ sütun mandallanamaz.'],
  ['short_day', 'Short Day', 'Kısa Gün', 'The ferry timetable', 'Vapur tarifesi', '1 spin less. Quota -10%.', '1 çevirme eksik. Kota -%10.'],
  ['low_water', 'Low Water', 'Çekilme', 'The sea', 'Deniz', 'Lines in the bottom row do not pay.', 'Alt satırdaki diziler ödemez.'],
];
for (const [id, en, tr, ew, tw, ed, td] of EVENTS) {
  const k = 'event.' + id;
  add({ [k + '.name']: en, [k + '.who']: ew, [k + '.desc']: ed }, { [k + '.name']: tr, [k + '.who']: tw, [k + '.desc']: td });
}

// ---- Boathouse builds (6 in lite) --------------------------------------------------------------
const BUILDS = [
  ['roof', 'Patch the Roof', 'Çatıyı Onar'], ['stove', 'Stove', 'Soba'], ['cat_basket', 'Cat Basket', 'Kedi Sepeti'],
  ['radio', 'Radio', 'Radyo'], ['tea_corner', 'Tea Corner', 'Çay Köşesi'], ['lamp_post', 'Lamp Post', 'Sokak Lambası'],
];
for (const [id, en, tr] of BUILDS) add({ ['build.' + id + '.name']: en }, { ['build.' + id + '.name']: tr });

// ---- Character lines: key line.<who>.<trigger>.<n>. Lines that need content outside lite are left out. -----
// Each entry: trigger, [EN lines], [TR lines].
const LINES = {
  deni: [
    ['run_start', ["Come on, you old box. Grandpa trusted you with the boiler money. I'm only asking for tea money.", 'Six turns. Be a good goat.', "Orhan's window is open. He's listening. Behave."],
      ['Hadi ama kutucuk. Dedem sana kazan parasını emanet etti. Ben sadece çay parası istiyorum.', 'Altı çevirme. Uslu bir keçi ol.', "Orhan'ın penceresi açık. Dinliyor. Uslu dur."]],
    ['tutorial_peg', ["Two the same. Peg them. Grandpa's rule."], ['İkisi aynı. Mandalla. Dedemin kuralı.']],
    ['pair_miss', ['Two lanterns and a gull. The gull knows what it did.', 'Two out of three. I can work with two.', "Fine. I'll peg it and we try again like adults."],
      ['İki fener, bir martı. Martı ne yaptığını biliyor.', 'Üçte iki. İkiyle iş yaparım.', 'Tamam. Mandallıyorum, yetişkinler gibi bir daha deniyoruz.']],
    ['peg_hit', ['Told you.', "That's what the pegs are for.", 'Grandpa carved his initials on these. Now I see why.'],
      ['Dedim sana.', 'Mandal bunun için var.', 'Dedem bunlara adını kazımış. Şimdi anladım nedenini.']],
    ['zero', ['Nothing. A fine collection of nothing.', "Pebbles. You shouldn't have.", "I'm not angry. I'm counting."],
      ['Hiç. Güzel bir hiç koleksiyonu.', 'Çakıl. Hiç gerek yoktu.', 'Kızmadım. Sayıyorum.']],
    ['zero_streak', ['Three empty turns. Even the cat looked away.'], ['Üç boş çevirme. Kedi bile başını çevirdi.']],
    ['small_win', ["Tea money. I'll take it.", 'Sardines pay the small bills.'], ['Çay parası. Alırım.', 'Küçük faturaları sardalya öder.']],
    ['big_win', ["Look at that! Don't get smug, box.", 'Grandpa, are you seeing this?'], ['Şuna bak! Şımarma kutucuk.', 'Dede, görüyor musun?']],
    ['clutch', ["Last turn. Of course it was the last turn.", 'Paid. With one whole second to spare.'], ['Son çevirme. Tabii ki son çevirmeydi.', 'Ödendi. Tam bir saniye kala.']],
    ['tide_paid', ["Told you. Don't get smug, {n} tides to go.", "One more page for Orhan's ledger."], ['Bak, dedim sana. Ama sevinme, daha {n} gelgit var.', "Orhan'ın defterine bir sayfa daha."]],
    ['mercy', ['He rounded up. Nobody say a word.'], ['Yuvarladı. Kimse bir şey demesin.']],
    ['shop_enter', ["Grandpa's crate. Hands in pockets, Deni.", 'What do we need, and what do I just want?', "Sevgi's stall. Hands in pockets, Deni."],
      ['Dedemin sandığı. Eller cepte Deni.', 'Ne lazım, ne sadece canım istiyor?', "Sevgi'nin tezgahı. Eller cepte Deni."]],
    ['shop_buy', ["It'll pay for itself. Probably.", 'Welcome to the shelf. Make yourself useful.'], ['Kendini amorti eder. Herhalde.', 'Rafa hoş geldin. Bir işe yara.']],
    ['shop_broke', ['The jar says no.'], ['Kavanoz hayır diyor.']],
    ['remove_token', ['Goodbye, pebble. It was never personal.'], ['Güle güle çakıl. Kişisel değildi.']],
    ['event_intro', ['Company. Stand up straight, box.'], ['Misafir var. Dik dur kutucuk.']],
    ['loss', ["Not today. The pier's still standing, and so am I.", "Short. I'll be back at first light.", 'The box and I need to have a talk.'],
      ['Bugün olmadı. İskele ayakta, ben de.', 'Yetmedi. İlk ışıkta yine buradayım.', 'Kutucukla bir konuşmamız lazım.']],
    ['win', ['Stamp it, Kaptan.', 'One less. Grandpa, one less.'], ['Bas damgayı Kaptan.', 'Bir tane eksildi. Dede, bir tane eksildi.']],
    ['home', ['The roof holds. Mostly.', 'Planks first. Curtains later.'], ['Çatı tutuyor. Çoğunlukla.', 'Önce tahta. Perde sonra.']],
    ['build_done', ['Hammer down. It looks like a place now.'], ['Çekici bıraktım. Artık bir yere benziyor.']],
    ['daily_start', ['Same tide for the whole harbor today. No excuses.'], ['Bugün bütün limana aynı gelgit. Bahane yok.']],
    ['streak', ['Every day this week. Even the gulls noticed.'], ['Bu hafta her gün. Martılar bile fark etti.']],
    ['lamplight', ["Paid, and still cranking. Don't tell Orhan I like this."], ["Ödedim, hâlâ çeviriyorum. Orhan'a sevdiğimi söylemeyin."]],
  ],
  orhan: [
    ['tide_paid', ['Hm.', 'On time. Your grandfather never was.', 'Paid. Next.'], ['Hm.', 'Vaktinde. Deden hiç olmazdı.', 'Ödendi. Sıradaki.']],
    ['mercy', ["Rounding. Don't tell the co-op."], ['Yuvarlıyorum. Kooperatife söyleme.']],
    ['event_auditor', ['The district sent an auditor. Count your pegs.'], ['İlçeden müfettiş geldi. Mandallarını say.']],
    ['event_fog', ["Fog on the right side. Can't see a thing over there."], ['Sağ taraf sis. Orada bir şey görünmüyor.']],
    ['event_short', ['Ferry leaves early. So do you.'], ['Vapur erken kalkıyor. Sen de.']],
    ['event_low', ["Tide's out. The bottom row is mud."], ['Su çekildi. Alt sıra çamur.']],
    ['loss', ['Close the ledger. Come back tomorrow.', 'The deed stays in the drawer. For now.'], ['Defteri kapat. Yarın gel.', 'Tapu çekmecede kalıyor. Şimdilik.']],
    ['win', ['Installment received. Sit. Drink your tea.'], ['Taksit alındı. Otur. Çayını iç.']],
  ],
  // Home-screen neighbors, only those whose build is in lite.
  sevgi: [['home', ["Take a simit. You can't crank on an empty stomach."], ['Al bir simit. Aç karnına kol çevrilmez.']]],
  tekir: [['home', ['Mrrp.'], ['Mırr.']]],
};
for (const [who, rows] of Object.entries(LINES)) {
  for (const [trig, en, tr] of rows) {
    en.forEach((s, i) => { EN[`line.${who}.${trig}.${i + 1}`] = s; });
    tr.forEach((s, i) => { TR[`line.${who}.${trig}.${i + 1}`] = s; });
  }
}

// ---- Interface ---------------------------------------------------------------------------------
add({
  // names
  'ui.title': 'Small Luck Pier', 'ui.reel': "Hasan's Reel", 'ui.deni': 'Deni', 'ui.orhan': 'Kaptan Orhan', 'ui.loading': 'Loading',
  'ui.ok': 'OK', 'ui.close': 'Close', 'ui.back': 'Back', 'ui.next': 'Next', 'ui.yes': 'Yes', 'ui.no': 'No', 'ui.on': 'On', 'ui.off': 'Off', 'ui.new': 'New',
  // pier HUD
  'ui.spin': 'SPIN', 'ui.spinsLeft': '{n} spins left', 'ui.spinsLeft.one': '1 spin left', 'ui.spinOf': 'Spin {n} of {m}',
  'ui.tide': 'Tide {n}', 'ui.tideOf': 'Tide {n} of {m}', 'ui.lamplightTide': 'Lamplight, tide {n}',
  'ui.jar': 'Jar', 'ui.quota': 'Quota', 'ui.jarQuota': '{a} / {b}', 'ui.pegsLeft': '{n} pegs left', 'ui.pegsLeft.one': '1 peg left',
  'ui.pegHint': 'Tap a square to peg it. Tap again to take the peg off.', 'ui.coinsPlus': '+{n}', 'ui.bag': 'Bag', 'ui.shelf': 'Shelf',
  'ui.lines': '{n} lines', 'ui.lines.one': '1 line', 'ui.pegHit': 'Peg hit!', 'ui.bigWin': 'Big spin!', 'ui.paid': 'PAID', 'ui.pause': 'Pause',
  'ui.turbo': 'Turbo', 'ui.skipHint': 'Tap to skip', 'ui.mercyShown': 'Orhan rounded up: +{n}', 'ui.coachSpin': 'Tap SPIN.', 'ui.coachBag': 'This is what the reel can draw.',
  'ui.coachSalt': 'Sardine lines pay +4 now.',
  // trinkets and grades
  'ui.trinket': 'Trinket', 'ui.grade': 'Grade {n}', 'ui.gradeStamps': 'Grade {n} of 4', 'ui.inspect': 'Inspect', 'ui.example': 'Example', 'ui.sell': 'Sell for {n}',
  'ui.shelfFull': 'Your shelf is full. Sell a trinket first.', 'ui.emptyPlace': 'Empty place',
  // shop
  'ui.shop': 'Shop', 'ui.shopHost.crate': "Hasan's dock crate", 'ui.shopHost.sevgi': "Madam Sevgi's stall", 'ui.buy': 'Buy', 'ui.price': '{n} coins',
  'ui.token': 'Token', 'ui.tokenOffer': 'Token for the bag', 'ui.reroll': 'Reroll {n}', 'ui.rerollFree': 'Reroll, free', 'ui.removeToken': 'Remove {n}',
  'ui.removeFree': 'Remove, free', 'ui.removePick': 'Pick a token to remove.', 'ui.lock': 'Hold', 'ui.unlock': 'Let go',
  'ui.locked': 'Kept', 'ui.continue': 'Back to the pier', 'ui.notEnough': 'The jar says no.', 'ui.atCap': 'Bag is full of these', 'ui.bagMin': 'No removals left this run.',
  'ui.shopOdds': 'Shop odds for this pool', 'ui.shopOddsNote': 'These are the real odds for the cards you can see here, worked out from what is unlocked right now.',
  'ui.oddsGrade': 'Grade {n}: {p}%', 'ui.oddsTrinket': 'A card is a trinket 70% of the time, a token 30%.', 'ui.tutorialShop': 'One offer only, this time.',
  'ui.jarCarries': 'Coins left in the jar carry to the next tide.', 'ui.noRealMoney': 'Nothing in the shop is bought with real money.',
  // bag and odds
  'ui.bagTitle': 'Bag and odds', 'ui.bagSize': '{n} tokens in the bag', 'ui.bagSize.one': '1 token in the bag', 'ui.bagChance': 'Chance per square', 'ui.linePay': 'Line pay',
  'ui.pays': 'Pays {n}', 'ui.noLine': 'No line', 'ui.mercyRule': 'Once per run, if the jar is 1 to 5 coins short, Orhan rounds up.',
  'ui.fairNote': 'Each square draws one token from the bag, on its own. A pegged square keeps its symbol.',
  'ui.stopNote': 'Every spin stops at the same times, whatever the result. The reel never slows down or teases.',
  'ui.tutorialNote': 'The first tide of your first run is a fixed tutorial. Every spin after it is drawn from the bag.',
  'ui.oddsNote': 'The odds shown here and in the shop are the real ones. Nothing is hidden or nudged.',
  // run start, charts, events
  'ui.runStart': 'New run', 'ui.pickTrinket': 'Pick a free trinket', 'ui.pickChart': 'Pick a tide chart', 'ui.chart': 'Tide chart', 'ui.chartNone': 'No chart',
  'ui.start': 'Start', 'ui.event': 'Creditor event', 'ui.eventAt': 'Today the {name} calls.', 'ui.installment': 'Installment {n}', 'ui.installmentOf': 'Installment {n} of {m}',
  'ui.tier': 'Tier x{n}',
  // ledger, run end
  'ui.tidePaid': 'Tide paid', 'ui.runPaid': 'Installment paid', 'ui.runLost': 'The jar was short', 'ui.jarShort': '{n} short', 'ui.reached': 'Tide reached: {n}',
  'ui.bestSpin': 'Best spin: {n}', 'ui.planks': 'Planks', 'ui.planksGain': 'Planks +{n}', 'ui.planksNote': 'Planks stay with you. They build the boathouse.',
  'ui.firstDay': 'First day on the pier: +10', 'ui.perTide': 'Tides cleared: +{n}', 'ui.perWin': 'Paid run: +{n}', 'ui.perClutch': 'Clutch tides: +{n}',
  'ui.marginNote': "Margin note from Orhan's ledger", 'ui.storyBeat': 'Ledger page {n}', 'ui.doublePlanks': 'Double Planks', 'ui.again': 'Another run', 'ui.home': 'Home',
  // lamplight
  'ui.lamplightTitle': 'Lamplight', 'ui.lamplightAsk': 'Paid. Keep going?', 'ui.lamplightNext': 'Next quota: {n}', 'ui.lamplightKeep': 'Keep cranking', 'ui.lamplightStop': 'Stop here',
  'ui.lamplightNote': 'Play after tide 5 counts for score only.',
  // home, boathouse, album, daily
  'ui.play': 'Play', 'ui.nextBuild': 'Next: {name}', 'ui.buildCost': '{n} Planks', 'ui.build': 'Build', 'ui.built': 'Built', 'ui.needPlanks': 'Need {n} more Planks',
  'ui.album': 'Album', 'ui.albumDone': 'Album {n}%', 'ui.albumTrinkets': 'Trinkets', 'ui.albumSymbols': 'Symbols', 'ui.albumNotes': 'Margin notes', 'ui.albumStamps': 'Creditor stamps',
  'ui.seen': 'Seen', 'ui.wonWith': 'Won with', 'ui.locked2': 'Locked',
  'ui.daily': 'Daily Tide', 'ui.dailyDone': 'Done for today', 'ui.dailyScore': 'Score {n}', 'ui.dailyBest': 'Best {n}', 'ui.streak': '{n}-day streak', 'ui.streak.one': '1-day streak',
  'ui.dailyRetry': 'Try once more', 'ui.dailyNote': 'One seeded run a day. Everyone on the harbor gets the same draws.', 'ui.dailyLocal': 'The date comes from this phone, so scores are personal.',
  // pause and rules
  'ui.paused': 'Paused', 'ui.resume': 'Resume', 'ui.rules': 'Rules', 'ui.quit': 'Quit run', 'ui.quitAsk': 'Quit this run?', 'ui.quitText': 'The jar and the bag are lost. Planks for tides cleared are kept.',
  'ui.quitGo': 'Quit', 'ui.quitKeep': 'Keep playing',
  'ui.rulesTitle': 'How the pier works',
  'ui.rules1': 'Tap SPIN. Each square draws a token from the bag.', 'ui.rules2': 'Tap squares to peg them. Pegged squares keep their symbol for the next spin. Move the pegs as you like.',
  'ui.rules3': 'Three of a kind in a row, column or diagonal pays. A Knot counts as any symbol.', 'ui.rules4': 'A pegged square never pays by itself. A line pays only if one of its squares landed this spin.',
  'ui.rules5': 'A tide is 6 spins and 3 pegs. After the last spin the quota is taken from the jar. Short jar, run over.', 'ui.rules6': 'A spin costs nothing. Coins are tips, used only for the quota and the shop.',
  'ui.rules7': 'Spins, pegs and odds are never for sale.', 'ui.rulesMercy': 'Mercy: once per run, if the jar is 1 to 5 coins short, Orhan rounds up.',
  'ui.rulesOdds': 'The odds are the bag. The bag screen shows every percentage, and the shop prints the real odds for what it can offer.',
  // event intro
  'ui.eventStamp': 'CREDITOR', 'ui.eventWho': 'From: {name}', 'ui.eventRule': 'This tide: {rule}',
  // settings
  'ui.settings': 'Settings', 'ui.language': 'Language', 'ui.sound': 'Sound', 'ui.music': 'Music', 'ui.haptics': 'Vibration', 'ui.turboSetting': 'Turbo (faster spins)',
  'ui.reduceMotion': 'Reduced motion', 'ui.exportSave': 'Save code', 'ui.importSave': 'Load code', 'ui.exportHint': 'Copy this code to keep your progress.', 'ui.importHint': 'Paste a save code here.',
  'ui.importBad': 'That code does not work.', 'ui.copied': 'Copied', 'ui.privacy': 'Privacy', 'ui.privacyText': 'No account. Your progress is saved only on this phone.',
  'ui.credits': 'Credits', 'ui.creditsText': 'Made by one developer on a small pier.',
  // first boot
  'ui.firstBoot': 'Pick a language', 'ui.langEn': 'English', 'ui.langTr': 'Türkçe',
}, {
  'ui.title': 'Küçük İskele', 'ui.reel': "Hasan'ın Çarkı", 'ui.deni': 'Deni', 'ui.orhan': 'Kaptan Orhan', 'ui.loading': 'Yükleniyor',
  'ui.ok': 'Tamam', 'ui.close': 'Kapat', 'ui.back': 'Geri', 'ui.next': 'Sonraki', 'ui.yes': 'Evet', 'ui.no': 'Hayır', 'ui.on': 'Açık', 'ui.off': 'Kapalı', 'ui.new': 'Yeni',
  'ui.spin': 'ÇEVİR', 'ui.spinsLeft': '{n} çevirme kaldı', 'ui.spinsLeft.one': '1 çevirme kaldı', 'ui.spinOf': 'Çevirme {n}/{m}',
  'ui.tide': 'Gelgit {n}', 'ui.tideOf': 'Gelgit {n}/{m}', 'ui.lamplightTide': 'Lamba ışığı, gelgit {n}',
  'ui.jar': 'Kavanoz', 'ui.quota': 'Kota', 'ui.jarQuota': '{a} / {b}', 'ui.pegsLeft': '{n} mandal kaldı', 'ui.pegsLeft.one': '1 mandal kaldı',
  'ui.pegHint': 'Mandallamak için bir kareye dokun. Çıkarmak için bir daha dokun.', 'ui.coinsPlus': '+{n}', 'ui.bag': 'Torba', 'ui.shelf': 'Raf',
  'ui.lines': '{n} dizi', 'ui.lines.one': '1 dizi', 'ui.pegHit': 'Mandal tuttu!', 'ui.bigWin': 'Büyük çevirme!', 'ui.paid': 'ÖDENDİ', 'ui.pause': 'Duraklat',
  'ui.turbo': 'Turbo', 'ui.skipHint': 'Geçmek için dokun', 'ui.mercyShown': 'Orhan yuvarladı: +{n}', 'ui.coachSpin': "ÇEVİR'e dokun.", 'ui.coachBag': 'Çark bunları çekebilir.',
  'ui.coachSalt': 'Sardalya dizileri artık +4 öder.',
  'ui.trinket': 'Biblo', 'ui.grade': '{n}. derece', 'ui.gradeStamps': 'Derece {n}/4', 'ui.inspect': 'İncele', 'ui.example': 'Örnek', 'ui.sell': '{n} paraya sat',
  'ui.shelfFull': 'Raf dolu. Önce bir biblo sat.', 'ui.emptyPlace': 'Boş yer',
  'ui.shop': 'Dükkan', 'ui.shopHost.crate': "Hasan'ın iskele sandığı", 'ui.shopHost.sevgi': "Sevgi Hanım'ın tezgahı", 'ui.buy': 'Al', 'ui.price': '{n} para',
  'ui.token': 'Parça', 'ui.tokenOffer': 'Torbaya parça', 'ui.reroll': 'Yenile {n}', 'ui.rerollFree': 'Yenile, bedava', 'ui.removeToken': 'Parça çıkar {n}',
  'ui.removeFree': 'Parça çıkar, bedava', 'ui.removePick': 'Çıkarılacak parçayı seç.', 'ui.lock': 'Sakla', 'ui.unlock': 'Bırak',
  'ui.locked': 'Saklandı', 'ui.continue': 'İskeleye dön', 'ui.notEnough': 'Kavanoz hayır diyor.', 'ui.atCap': 'Torbada bundan yeterince var', 'ui.bagMin': 'Bu koşuda çıkarma hakkı kalmadı.',
  'ui.shopOdds': 'Bu havuzun dükkan olasılıkları', 'ui.shopOddsNote': 'Burada gördüğün kartların gerçek olasılıkları bunlar. Şu an açık olan şeylere göre hesaplanır.',
  'ui.oddsGrade': '{n}. derece: %{p}', 'ui.oddsTrinket': 'Kart %70 biblo, %30 parça çıkar.', 'ui.tutorialShop': 'Bu sefer tek teklif var.',
  'ui.jarCarries': 'Kavanozda kalan para sonraki gelgite geçer.', 'ui.noRealMoney': 'Dükkandaki hiçbir şey gerçek parayla alınmaz.',
  'ui.bagTitle': 'Torba ve olasılıklar', 'ui.bagSize': 'Torbada {n} parça var', 'ui.bagSize.one': 'Torbada 1 parça var', 'ui.bagChance': 'Kare başına ihtimal', 'ui.linePay': 'Dizi ödemesi',
  'ui.pays': '{n} öder', 'ui.noLine': 'Dizi yapmaz', 'ui.mercyRule': 'Seferde bir kez, kavanoz 1 ile 5 para eksikse Orhan yuvarlar.',
  'ui.fairNote': 'Her kare torbadan kendi başına bir parça çeker. Mandallı kare sembolünü korur.',
  'ui.stopNote': 'Her çevirme, sonuç ne olursa olsun aynı anlarda durur. Çark ne yavaşlar ne oyalar.',
  'ui.tutorialNote': 'İlk seferin ilk gelgiti sabit bir öğreticidir. Ondan sonraki her çevirme torbadan çekilir.',
  'ui.oddsNote': 'Burada ve dükkanda gösterilen olasılıklar gerçektir. Gizli bir şey, bir itiş yok.',
  'ui.runStart': 'Yeni sefer', 'ui.pickTrinket': 'Bedava bir biblo seç', 'ui.pickChart': 'Bir gelgit çizelgesi seç', 'ui.chart': 'Gelgit çizelgesi', 'ui.chartNone': 'Çizelge yok',
  'ui.start': 'Başla', 'ui.event': 'Alacaklı ziyareti', 'ui.eventAt': 'Bugün {name} geldi.', 'ui.installment': '{n}. taksit', 'ui.installmentOf': 'Taksit {n}/{m}',
  'ui.tier': 'Kademe x{n}',
  'ui.tidePaid': 'Gelgit ödendi', 'ui.runPaid': 'Taksit ödendi', 'ui.runLost': 'Kavanoz yetmedi', 'ui.jarShort': '{n} eksik', 'ui.reached': 'Ulaşılan gelgit: {n}',
  'ui.bestSpin': 'En iyi çevirme: {n}', 'ui.planks': 'Tahta', 'ui.planksGain': 'Tahta +{n}', 'ui.planksNote': 'Tahtalar sende kalır. Kayıkhaneyi onlarla yaparsın.',
  'ui.firstDay': 'İskeledeki ilk gün: +10', 'ui.perTide': 'Geçilen gelgitler: +{n}', 'ui.perWin': 'Ödenen sefer: +{n}', 'ui.perClutch': 'Son çevirmede geçilenler: +{n}',
  'ui.marginNote': 'Orhan defterinin kenar notu', 'ui.storyBeat': 'Defter sayfası {n}', 'ui.doublePlanks': 'Tahtayı ikiye katla', 'ui.again': 'Bir sefer daha', 'ui.home': 'Ev',
  'ui.lamplightTitle': 'Lamba Işığı', 'ui.lamplightAsk': 'Ödendi. Devam mı?', 'ui.lamplightNext': 'Sıradaki kota: {n}', 'ui.lamplightKeep': 'Çevirmeye devam', 'ui.lamplightStop': 'Burada bırak',
  'ui.lamplightNote': '5. gelgitten sonrası yalnızca puan içindir.',
  'ui.play': 'Oyna', 'ui.nextBuild': 'Sıradaki: {name}', 'ui.buildCost': '{n} Tahta', 'ui.build': 'Yap', 'ui.built': 'Yapıldı', 'ui.needPlanks': '{n} Tahta daha lazım',
  'ui.album': 'Albüm', 'ui.albumDone': 'Albüm %{n}', 'ui.albumTrinkets': 'Biblolar', 'ui.albumSymbols': 'Semboller', 'ui.albumNotes': 'Kenar notları', 'ui.albumStamps': 'Alacaklı damgaları',
  'ui.seen': 'Görüldü', 'ui.wonWith': 'Kazanılan', 'ui.locked2': 'Kilitli',
  'ui.daily': 'Günün Gelgiti', 'ui.dailyDone': 'Bugünlük tamam', 'ui.dailyScore': 'Puan {n}', 'ui.dailyBest': 'En iyi {n}', 'ui.streak': '{n} günlük seri', 'ui.streak.one': '1 günlük seri',
  'ui.dailyRetry': 'Bir kez daha dene', 'ui.dailyNote': 'Günde bir ortak sefer. Limandaki herkes aynı çekilişleri alır.', 'ui.dailyLocal': 'Tarih bu telefondan alınır, o yüzden puanlar kişiseldir.',
  'ui.paused': 'Duraklatıldı', 'ui.resume': 'Devam', 'ui.rules': 'Kurallar', 'ui.quit': 'Seferi bırak', 'ui.quitAsk': 'Bu sefer bırakılsın mı?', 'ui.quitText': 'Kavanoz ve torba gider. Geçtiğin gelgitlerin tahtaları kalır.',
  'ui.quitGo': 'Bırak', 'ui.quitKeep': 'Devam et',
  'ui.rulesTitle': 'İskele nasıl işler',
  'ui.rules1': 'ÇEVİR düğmesine dokun. Her kare torbadan bir parça çeker.', 'ui.rules2': 'Kareleri mandallamak için dokun. Mandallı kareler bir sonraki çevirmede sembolünü korur. Mandalları istediğin gibi taşı.',
  'ui.rules3': 'Bir satırda, sütunda ya da çaprazda üç aynı sembol öder. Düğüm her sembolün yerine geçer.', 'ui.rules4': 'Mandallı kare tek başına ödemez. Bir dizi, karelerinden biri bu çevirmede geldiyse öder.',
  'ui.rules5': 'Bir gelgit 6 çevirme ve 3 mandaldır. Son çevirmeden sonra kota kavanozdan alınır. Kavanoz yetmezse sefer biter.', 'ui.rules6': 'Çevirmek bedava. Paralar bahşiştir, yalnızca kota ve dükkan içindir.',
  'ui.rules7': 'Çevirme, mandal ve olasılık hiçbir zaman satılmaz.', 'ui.rulesMercy': 'Yuvarlama: seferde bir kez, kavanoz 1 ile 5 para eksikse Orhan yuvarlar.',
  'ui.rulesOdds': 'Olasılık, torbanın içidir. Torba ekranı her yüzdeyi gösterir, dükkan da sunabileceği şeylerin gerçek olasılığını yazar.',
  'ui.eventStamp': 'ALACAKLI', 'ui.eventWho': 'Gelen: {name}', 'ui.eventRule': 'Bu gelgit: {rule}',
  'ui.settings': 'Ayarlar', 'ui.language': 'Dil', 'ui.sound': 'Ses', 'ui.music': 'Müzik', 'ui.haptics': 'Titreşim', 'ui.turboSetting': 'Turbo (hızlı çevirme)',
  'ui.reduceMotion': 'Az hareket', 'ui.exportSave': 'Kayıt kodu', 'ui.importSave': 'Kod yükle', 'ui.exportHint': 'İlerlemeni saklamak için bu kodu kopyala.', 'ui.importHint': 'Kayıt kodunu buraya yapıştır.',
  'ui.importBad': 'Bu kod çalışmıyor.', 'ui.copied': 'Kopyalandı', 'ui.privacy': 'Gizlilik', 'ui.privacyText': 'Hesap yok. İlerlemen yalnızca bu telefonda saklanır.',
  'ui.credits': 'Emeği geçenler', 'ui.creditsText': 'Küçük bir iskelede tek geliştirici tarafından yapıldı.',
  'ui.firstBoot': 'Dil seç', 'ui.langEn': 'English', 'ui.langTr': 'Türkçe',
});


// ---- Interface, added by the UI lane (src/ui) ---------------------------------------------------
add({
  'ui.jarGoal': 'Fill the jar: {a} / {b}', 'ui.coachPeg': 'Peg the pair.',
  'ui.sold': 'Sold', 'ui.percent': '{p}%', 'ui.oddsKind': 'A card is a trinket {a}% of the time, a token {b}%.',
  'ui.bagMinN': 'The bag needs at least {n} tokens.', 'ui.statTides': 'Tides cleared: {n}', 'ui.statCoins': 'Coins earned: {n}',
}, {
  'ui.jarGoal': 'Kavanozu doldur: {a} / {b}', 'ui.coachPeg': 'Çifti mandalla.',
  'ui.sold': 'Satıldı', 'ui.percent': '%{p}', 'ui.oddsKind': 'Kart %{a} ihtimalle biblo, %{b} ihtimalle parça çıkar.',
  'ui.bagMinN': 'Torbada en az {n} parça olmalı.', 'ui.statTides': 'Geçilen gelgit: {n}', 'ui.statCoins': 'Kazanılan para: {n}',
});

export const STRINGS = { en: EN, tr: TR };
let lang = 'en';

export const detectLang = () => (typeof navigator !== 'undefined' && /^tr/i.test(navigator.language || '') ? 'tr' : 'en');
export const setLang = (l) => { lang = STRINGS[l] ? l : detectLang(); if (typeof document !== 'undefined') document.documentElement.lang = lang; };
export const getLang = () => lang;
export const fmt = (n) => Number(n).toLocaleString(lang); // 1,234 in English, 1.234 in Turkish
export const t = (key, vars = {}) =>
  (STRINGS[lang][key] ?? EN[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (typeof vars[k] === 'number' ? fmt(vars[k]) : (vars[k] ?? '')));
// Uses `<key>.one` when n is 1 and that key exists, else `<key>`; {n} is filled in.
export const plural = (n, key, vars = {}) => t(n === 1 && (key + '.one') in EN ? key + '.one' : key, { n, ...vars });
// How many variants line.<who>.<trigger>.<n> has (0 if none); the picker chooses an index and never repeats it twice in a row.
export const lineCount = (who, trigger) => { let n = 0; while (`line.${who}.${trigger}.${n + 1}` in EN) n++; return n; };
