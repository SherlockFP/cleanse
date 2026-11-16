# v3 art list. Builds art/sheets_v3.json (same format as art/sheets.json). Runs inside gen-v2-data.py's namespace.
# Rules: one object per cell, bold silhouette, Thai street-night gouache, no text, no sacred, royal or temple imagery.
# Spirits are invented street characters; none depicts a real worshipped figure.
BUST = {}  # id -> subject, in sheet order
def _b(i, s): BUST[i] = s
_b('spirit/beckon_calm', 'bust portrait of Madam Receipt: a tall curling roll of till receipt paper standing like a thin lady, round glasses on the top curl, a pencil tucked in a curl, one paper arm holding a rubber stamp, calm polite smile, no printed text')
_b('spirit/beckon_glad', 'the same receipt-paper lady printing a long happy ribbon of blank paper, wide smile, stamp raised')
_b('spirit/beckon_cross', 'the same receipt-paper lady crumpled tight, glasses slipping, frowning, stamp held like a hammer')
_b('spirit/gold_calm', 'bust portrait of Chef Quack: a fat yellow rubber duck in a tiny paper chef hat and a neat apron, wooden spoon in one wing, bossy proud look')
_b('spirit/gold_glad', 'the same rubber duck chef tossing the spoon, beak open in a delighted quack, hat tilted, small sparkles')
_b('spirit/gold_cross', 'the same rubber duck chef with the hat crooked, beak flat, one wing on hip, glaring, spoon pointed')
_b('spirit/moonbiter_calm', 'bust portrait of Scrubby: a round worn steel-wool scrubbing pad creature, black with soot, two small polite white eyes, a tiny apron string, shy and apologetic')
_b('spirit/moonbiter_glad', 'the same sooty steel-wool pad with a shy happy smile and one gleaming clean spot on its cheek')
_b('spirit/moonbiter_cross', 'the same sooty steel-wool pad bristling, eyes narrowed, hungry and annoyed')
_b('spirit/waiting_calm', 'bust portrait of Lost Property: a lumpy brown cardboard lost-property box on two small legs, an umbrella handle and one flip-flop poking out of the top, round kind eyes, a clip-on tie, holding a bundle of paper tickets, no text on the box')
_b('spirit/waiting_glad', 'the same cardboard box smiling with its lid flapping open, a bright scarf waving out of it')
_b('spirit/waiting_cross', 'the same cardboard box with the lid shut tight and flaps folded like arms, hurt and stubborn look')
_b('spirit/lamplit_calm', 'bust portrait of Lady Lamplit: a big warm round light bulb with a playful painted face and a curl of electric cable like a hair curl, glowing orange, teasing half smile')
_b('spirit/lamplit_glad', 'the same glowing light-bulb lady laughing, glowing brighter, little sparks around her')
_b('spirit/lamplit_cross', 'the same light-bulb lady flickering dim and cross, filament frown, cable curl drooping')
_b('spirit/tide_calm', 'bust portrait of Grandmother Tide: a broad weathered old Thai river-barge woman in a yellow plastic raincoat and rubber boots, holding an enamel tea mug, steady calm face')
_b('spirit/tide_glad', 'the same old barge woman in a yellow raincoat chuckling, raising her tea mug')
_b('spirit/tide_cross', 'the same old barge woman in a yellow raincoat scowling, arms folded, rain dripping from her hood')
_b('spirit/wire_calm', 'bust portrait of Uncle Wire: a grinning thin man whose hair is a tangle of black overhead power cables, a tool belt of keys and spoons, a food-cart apron, calm sly smile')
_b('spirit/wire_glad', 'the same cable-haired street hustler laughing, cables sparking happily, thumbs up')
_b('spirit/wire_cross', 'the same cable-haired street hustler annoyed, cables tangled into a knot, arms crossed')
_b('devil/phone', 'Mr. Ruby the slim red devil in a floral shirt and sunglasses, holding an old red phone receiver to his ear, smug smile')
_b('char/yai', 'bust portrait of Grandma Yai: a tiny elderly Thai noodle seller with a ladle, a towel over her shoulder, steam rising, sharp eyes')
_b('char/beng', 'bust portrait of Beng: a skinny teenage Thai motorbike-taxi boy in an orange vest with no readable numbers, helmet under his arm, cheeky grin')
_b('char/pla', 'bust portrait of Pla: a young Thai boxer girl with taped hands, a plain towel round her neck, confident grin, no headband, no armbands')
_b('char/mali', 'bust portrait of Mali: a tired cheerful Thai night-bus conductor woman with a metal ticket tube, uniform cap, kind eyes')
_b('char/nim_boss', 'Nim, a 19-year-old Thai woman with a short black bob, now in a sharp blazer with sunglasses pushed up, confident smile, city lights behind')

PROPS = [
    ('machine/lever', 'a tall chrome crank lever on a short brass track, red ball knob at the top, taped grip, side view, standing upright'),
    ('machine/kiosk', 'a small battered street ATM kiosk on a stand with a dark empty screen, a coin funnel on top and a little striped awning, stickers peeling, no text'),
    ('machine/phone', 'an old red rotary phone on a small wooden shelf bolted to a cart pole, cord hanging, rain drops, no text'),
    ('ui/tin', 'a round blue butter-biscuit tin with the lid slightly open and one small fairy light clipped on its rim, no text'),
    ('machine/blender', 'a big street-stall fruit blender on a cart counter, a tall glass jug, two empty funnels feeding into it, chrome base with one big button'),
    ('machine/awning_1', 'a short striped red-and-white cloth awning to sit on top of a street machine, wide and shallow'),
    ('machine/awning_2', 'a hand-painted wooden stall sign board with string lights around it, blank, no letters'),
    ('machine/awning_3', 'a bright neon tube frame in pink and green shaped like a crest of stars, no letters'),
    ('sym/redeye', 'a glowing red neon sign shaped like a single wide-open eye with a tiny horn on top, no text'),
]

SMALL = []  # (id, subject), chunked into 4x4 sheets
def _s(items):
    for i, s in items: SMALL.append((i, s))
_s([
    ('ui/phone', 'an old red rotary telephone'), ('ui/call_green', 'a green rotary telephone with a soft glow'), ('ui/white_call', 'a white rotary telephone with a soft glow'),
    ('ui/kiosk', 'a small street ATM kiosk with a glowing screen and a coin slot, no text'), ('ui/blender', 'a fruit blender jug full of orange and green fruit'),
    ('ui/honk', 'a round rubber tuk-tuk bulb horn with a brass trumpet'), ('ui/hand', 'a white cartoon glove hand pointing with its index finger, bold outline'),
    ('ui/charge_on', 'a small glowing yellow battery cell, full'), ('ui/charge_off', 'a small grey empty battery cell'),
    ('ui/bead_off', 'a plain dull wooden bead'), ('ui/bead_on', 'a glowing white bead with a soft halo')])
_s([
    ('ui/key_brass', 'an old brass key with a round bow'), ('ui/key_silver', 'a silver key with a square bow'), ('ui/key_red', 'a red-painted key with a heart-shaped bow'),
    ('ui/locker_shut', 'a small dented tin locker door with a padlock, closed'), ('ui/locker_open', 'the same small tin locker door swung open, empty inside'),
    ('ui/luggage', 'a battered travel suitcase with a paper luggage tag, no text'), ('ui/postcard_back', 'the back of a postcard with a stamp box and lines, no text'),
    ('ui/map_pin', 'a red map pin with a round head'), ('ui/pin_done', 'a green map pin with a round head and a small tick mark'), ('ui/pin_locked', 'a grey map pin with a tiny padlock hanging from it'),
    ('ui/favour_pip', 'a small round paper token with a warm glow'),
    ('ui/stamp_bronze', 'a round bronze rubber-stamp mark with a little cart in the middle, no text'), ('ui/stamp_silver', 'a round silver rubber-stamp mark with a little shop front in the middle, no text'),
    ('ui/stamp_gold', 'a round gold rubber-stamp mark with a little tower in the middle, no text'),
    ('ui/notebook', 'a school exercise notebook with a pencil clipped on, no text'), ('ui/codex', 'a fat scrapbook with tabs and photos sticking out, no text'),
    ('ui/wrath', 'a small black storm cloud with a red lightning bolt'), ('ui/fused_rim', 'an empty round gold frame ring with small rivets'),
    ('ui/storm', 'a rain cloud with a small umbrella under it and falling drops'), ('ui/lesson', 'a sheet of lined paper with a big green tick mark and no writing'),
    ('ui/taste_loved', 'a round yellow smiley face with heart eyes'), ('ui/taste_fine', 'a round yellow smiley face with a small calm smile'),
    ('ui/taste_meh', 'a round yellow face with a flat straight mouth'), ('ui/taste_hated', 'a round green face with a sour twisted mouth')])
_s([
    ('charm/bike_horn', 'a chrome bicycle bell horn'), ('charm/fish_sauce', 'a glass bottle of fish sauce with a red cap, no label text'), ('charm/ice_bucket', 'a metal bucket of ice cubes'),
    ('charm/megaphone', 'a white plastic megaphone'), ('charm/spare_tyre', 'a spare motorbike tyre'), ('charm/sweeper', "a street sweeper's long broom and dustpan"),
    ('charm/price_gun', 'a handheld price-tag gun'), ('charm/neon_open', 'a small neon shop sign shaped like an open door, no letters'), ('charm/double_shift', 'two coffee cups stacked, steaming'),
    ('charm/wok_toss', 'a wok tossing noodles into the air'), ('charm/calculator', 'a pocket calculator, no numbers on the screen'), ('charm/rubber_band', 'a ball of red rubber bands'),
    ('charm/coin_flip', 'a coin spinning in the air'), ('charm/gold_spray', 'a gold spray-paint can'), ('charm/taxi_meter', 'a taxi meter box with a blank red display'),
    ('charm/bike_jump', 'a small motorbike mid-jump over a puddle')])
_s([
    ('charm/eye_drops', 'a small bottle of eye drops'), ('charm/staring', 'two cartoon eyes staring wide, red veins'), ('charm/omen_jar', 'a glass jar holding a small glowing red eye'),
    ('charm/ruby_shades', 'a pair of red-lens sunglasses'), ('charm/night_owl', 'a small brown owl with big orange eyes'), ('charm/red_eye_flight', 'a small passenger plane at night with a red light'),
    ('charm/counter_stare', 'a round mirror reflecting a red eye back'), ('charm/taillight', 'a red motorbike taillight glowing'),
    ('curse/haggler', 'a shadowy hand pinching a price tag'), ('curse/hollow_centre', 'a donut with a black empty hole'), ('curse/dark_wick', 'a light bulb with a black burnt filament'),
    ('curse/slow_water', 'a slow brown river with a snail on a leaf'), ('curse/short_circuit', 'a sparking tangled plug socket'), ('curse/heavy_hands', 'two hands chained to a heavy suitcase')])
_s([
    ('charm/f_skewer_cart', 'a grill cart with skewers smoking on charcoal'), ('charm/f_firefly_snack', 'a paper cone of snacks with a firefly sitting on top'),
    ('charm/f_street_gold', 'a fish-ball skewer dipped in gold'), ('charm/f_market_scale', 'a market hanging scale with limes in its pan'), ('charm/f_smog_wok', 'a wok in grey smog with rain drops'),
    ('charm/f_neon_grill', 'a neon pink grill flame'), ('charm/f_lucky_chili', 'a red chili with a four-leaf clover leaf'), ('charm/f_ruby_umbrella', 'a red umbrella with small horns on the tip'),
    ('charm/f_rainy_day_fund', 'a piggy bank under a rain cloud'), ('charm/f_monsoon_gold', 'gold bars shining in heavy rain'), ('charm/f_small_print_lawyer', 'a magnifying glass over a tiny contract, no text'),
    ('charm/f_meter_taxi', 'a pink taxi with a coin on its roof'), ('charm/f_gold_shop', 'a gold shop window with gold chains on red velvet, no text'), ('charm/f_calling_luck', 'a red business card with a clover'),
    ('charm/f_rooftop_lease', 'a rooftop with a key on a red ribbon'), ('charm/f_lucky_combo', 'two red boxing gloves with a clover between them'),
    ('charm/f_glowing_special', 'a dinner plate glowing with a firefly over it'), ('charm/f_lucky_tuktuk', 'a tuk-tuk with a clover on its hood'), ('charm/f_spinning_elbow', 'a spinning boxing elbow pad with motion lines'),
    ('charm/f_clinch_tool', 'a wrench and a boxing glove tied together'), ('charm/f_golden_belt', 'a gold champion belt with a plain round plate, no text'), ('charm/f_firefly_lamp', 'a jar lamp full of fireflies'),
    ('charm/f_gold_dust', 'a pile of gold dust with a firefly'), ('charm/f_gold_rims', 'a shiny gold motorbike wheel rim')])
_s([
    ('place/c1', 'a folding street food cart with one bulb and a plastic stool'), ('place/c2', 'a striped night-market tent with a string of bulbs and a short piece of railway track'),
    ('place/c3', 'a gold shop window with a row of gold bars on red cloth, no text'), ('place/c4', 'a big backpacker rucksack with a water bottle and a tied-on flip-flop'),
    ('place/c5', 'an empty striped beach deck chair under a small palm'), ('place/c6', 'a night-bazaar stall with an orange lamp glowing through haze'),
    ('place/c7', 'a beach cabana with a striped towel and a cocktail glass'), ('place/c8', 'a small wooden river pier with a hanging lamp and a moored boat'),
    ('place/c9', 'a white scale model of a condo tower on a little table'), ('place/c10', 'a tall cocktail glass with a tiny umbrella on a glass rooftop rail')])
_s([
    ('cart/up_row', 'a wooden skewer rack with five filled sticks in a row'), ('cart/up_column', 'a tall stack of three crates'), ('cart/up_diag', 'a zig-zag string of lights'),
    ('cart/up_corners', 'a square tray with four brass corner caps'), ('cart/up_plus', 'a plus-shaped steel grill rack'), ('cart/up_frame', 'an empty wooden stall frame with a tarp roll on top'),
    ('cart/up_stock', 'a crate full of mixed fruit'), ('cart/up_firefly', 'a jar of fireflies hanging on a cart hook'), ('cart/up_sweep', 'a tin of cleaning powder with a sponge')])
_s([('post/' + i, s) for i, s in [
    ('rainy_day', 'a picture postcard of a rainy soi street with umbrellas, no text'), ('hot_pan', 'a picture postcard of a hot frying pan with chilies, no text'),
    ('fresh_fish', 'a picture postcard of fresh fish on ice at a market, no text'), ('night_bus', 'a picture postcard of a night bus with lit windows, no text'),
    ('borrowed_coat', 'a picture postcard of a coat on a hook, no text'), ('short_cut', 'a picture postcard of a narrow alley shortcut between buildings, no text'),
    ('crooked_scale', 'a picture postcard of a crooked market scale, no text'), ('old_photo', 'a picture postcard of an old faded photo of a bus station bench with a lost umbrella, no text'),
    ('thumb_scale', 'a picture postcard of a thumb pressing on a scale pan, no text'), ('empty_wallet', 'a picture postcard of an empty open wallet, no text'),
    ('all_pocket', 'a picture postcard of a jacket with many bulging pockets, no text'), ('mothers_voice', 'a picture postcard of an old radio on a kitchen table, no text'),
    ('staring_contest', 'a picture postcard of a red neon eye in a dark alley, no text'), ('spare_blender', 'a picture postcard of a fruit blender on a cart, no text'),
    ('party_line', 'a picture postcard of three old phones with tangled cords, no text'), ('quiet_phone', 'a picture postcard of a phone with its receiver off the hook, no text'),
    ('full_charge', 'a picture postcard of a row of glowing batteries, no text'), ('late_kiosk', 'a picture postcard of a street ATM kiosk at dawn, no text')]])

def _bg(i, s): return dict(file='art/raw/%s.png' % i.replace('/', '_'), id=i, size=1024, magenta=False, subject=s)
SINGLES3 = [
    _bg('bg/map', 'portrait hand-painted illustrated map of Thailand as a long strip, rivers and coastline, tiny drawn icons along a winding road: a food cart, a train market, a gold shop street, a backpacker street, a beach, hills, a beach club, a river pier, a tower, no text'),
    _bg('bg/c2', 'portrait background, a big weekend night market with rows of tents and string lights beside old railway tracks, empty middle, no characters, no text'),
    _bg('bg/c3', 'portrait background, a busy Chinatown street at night, neon signs with no letters, gold shop windows, street food carts, empty middle, no characters, no text'),
    _bg('bg/c4', 'portrait background, a packed backpacker street at night with hostels, neon with no letters, street bars and fruit carts, empty middle, no characters, no text'),
    _bg('bg/c5', 'portrait background, a quiet beach-town promenade in low season, empty deck chairs, palm trees, a few lit bars, the sea at dusk, no characters, no text'),
    _bg('bg/c6', 'portrait background, a northern night bazaar in hazy smoky air, orange lights glowing through haze, hills far behind, empty middle, no characters, no text'),
    _bg('bg/c7', 'portrait background, a beach club at night with a pool, cabanas, fairy lights and a dark sea, empty middle, no characters, no text'),
    _bg('bg/c8', 'portrait background, a small boutique by a wide river at night, a wooden deck, boats with lights on the water, empty middle, no characters, no text'),
    _bg('bg/c9', 'portrait background, a glass condo sales lobby at night with a scale model on a table, tall windows on city lights, empty middle, no characters, no text'),
    _bg('bg/c10', 'portrait background, a rooftop sky bar sixty floors up at night, glass railing, the city spread below, empty middle, no characters, no text'),
    _bg('bg/home_2', 'portrait background, inside a rented shophouse room with a tiled floor, a folding shutter door, a ceiling fan, empty floor space, no furniture, no characters, no text'),
    _bg('bg/home_3', 'portrait background, inside a small modern condo with a balcony door and city view, wooden floor, empty floor space, no furniture, no characters, no text'),
    _bg('bg/home_4', 'portrait background, inside a penthouse with floor-to-ceiling windows over the night skyline, polished floor, empty floor space, no furniture, no characters, no text'),
    _bg('bg/phone', 'portrait background, close-up of a street cart corner at night with an old red phone on a shelf and a biscuit tin with a fairy light, rain on the tarp, warm bulb light, empty middle, no characters, no text'),
    _bg('bg/locker', 'portrait background, a wall of twenty dented tin lockers with blank number plates in a back alley, four larger luggage lockers at the bottom, one bare bulb, no text'),
    _bg('story/p1', 'a small family food cart on fire in a narrow soi at night, a young woman with a short black bob holding grill tongs in shock, neighbours with buckets, no text'),
    _bg('story/p2', 'a slim red devil in a floral shirt and sunglasses holding out a paper and a gold pen to the young woman beside a burnt cart, neon fortune machine behind him, no text'),
    _bg('story/p3', 'a small warm flame inside a glass jar sitting on top of a neon street fortune machine, the devil hand resting on the jar lid, no text'),
    _bg('ending/the_refuser', 'a young woman with a short black bob hanging up an old red phone at dawn on a quiet soi, a friendly cardboard box on little legs beside her holding up a bundle of tickets, no text'),
    _bg('ending/left_luggage', 'four open luggage lockers glowing gold in an alley, the neon fortune machine unplugged with its cable on the ground, the devil sitting on a suitcase looking surprised, no text'),
]

def _chunk(lst, n): return [lst[i:i + n] for i in range(0, len(lst), n)]
SHEETS3 = []
for _k, _ch in enumerate(_chunk(list(BUST.items()), 9)):
    SHEETS3.append(dict(file='art/raw/v3_people_%s.png' % 'abc'[_k], cols=3, rows=3, size=320, ids=[i for i, _ in _ch], subjects=[s for _, s in _ch]))
SHEETS3.append(dict(file='art/raw/v3_props.png', cols=3, rows=3, size=384, ids=[i for i, _ in PROPS], subjects=[s for _, s in PROPS]))
for _k, _ch in enumerate(_chunk(SMALL, 16)):
    SHEETS3.append(dict(file='art/raw/v3_icons_%s.png' % 'abcdefgh'[_k], cols=4, rows=4, size=192, ids=[i for i, _ in _ch], subjects=[s for _, s in _ch]))
assert len(SHEETS3) <= 14, len(SHEETS3)
for _sh in SHEETS3: assert len(_sh['ids']) == len(_sh['subjects']) <= _sh['cols'] * _sh['rows']
ART3 = dict(style=SHEETS['style'] + '. On 4x4 sheets keep every object small and well separated with a clear magenta gap between cells.', sheets=SHEETS3, singles=SINGLES3)
ICONS3 = {i for sh in SHEETS3 for i in sh['ids']} | {s['id'] for s in SINGLES3}
assert len(ICONS3) == sum(len(sh['ids']) for sh in SHEETS3) + len(SINGLES3), 'duplicate art id'
assert not (ICONS3 & ICONS), ICONS3 & ICONS
ALLICONS = ICONS | ICONS3
