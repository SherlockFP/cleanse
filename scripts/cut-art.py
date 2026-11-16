# Cuts the ChatGPT gouache sheets in art/raw into sprites in public/img and writes public/img/manifest.json.
# Run: python -I scripts/cut-art.py   (needs Pillow and numpy)
# Items are found as connected opaque regions, so they may cross the even grid lines. Small loose bits join the nearest item.
import json, os, sys
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW, OUT = os.path.join(ROOT, 'art', 'raw'), os.path.join(ROOT, 'public', 'img')
CREAM = (244, 234, 210)

# sheet file -> (cols, rows, output size of the long side, ids in reading order; None skips a cell)
SHEETS = {
    'sheet_sym_a.png': (3, 3, 256, ['sym/pebble', 'sym/sardine', 'sym/tea', 'sym/lantern', 'sym/gull', 'sym/seaglass', 'sym/compass', 'sym/cormorant', 'sym/knot']),
    'sheet_sym_b.png': (3, 3, 256, ['sym/net', 'sym/samovar', 'sym/cat', 'sym/kelp', 'sym/bottle', 'sym/barnacle', 'sym/storm', None, None]),
    'sheet_c1_catch.png': (3, 3, 192, ['trinket/salt_barrel', 'trinket/fish_cart', 'trinket/net_mender', 'trinket/fish_hook', 'trinket/ice_crate', 'trinket/pier_cat', 'trinket/fish_scale', 'trinket/full_net', None]),
    'sheet_c2_hearth.png': (3, 3, 192, ['trinket/samovar_tap', 'trinket/lantern_oil', 'trinket/sugar_cube', 'trinket/warm_rug', 'trinket/grandmas_cup', 'trinket/hearth_stone', 'trinket/wick_trimmer', 'trinket/tea_garden', None]),
    'sheet_c6_peg.png': (3, 3, 192, ['trinket/spare_peg', 'trinket/steady_hand', 'trinket/brass_peg', 'trinket/laundry_day', 'trinket/clothesline', 'trinket/sticky_tar', 'trinket/wishbone', 'trinket/grandpas_pegs', None]),
    'sheet_c7_tide.png': (3, 3, 192, ['trinket/first_light', 'trinket/tide_table', 'trinket/dry_spell', 'trinket/night_tide', 'trinket/lucky_sandal', 'trinket/slack_water', 'trinket/orhans_watch', 'trinket/second_wind', None]),
    'sheet_c8_ledger.png': (3, 3, 192, ['trinket/tin_cup', 'trinket/lucky_ledger', 'trinket/pebble_jar', 'trinket/skipping_stone', 'trinket/hagglers_cap', 'trinket/junk_cart', 'trinket/kelp_pot', 'trinket/sea_chest', None]),
    'sheet_d1_deni.png': (2, 2, 512, ['deni/idle', 'deni/lean', 'deni/point', 'deni/cheer']),
    'sheet_parts.png': (3, 3, 192, ['reel/peg', 'reel/peg_open', 'reel/crank', 'fx/lantern_off', 'fx/lantern_on', 'fx/coin', 'fx/jar', 'fx/jar_full', 'fx/plank']),
    'sheet_f_people.png': (3, 2, 384, ['orhan/arms', 'orhan/nod', 'orhan/stamp', 'npc/baker', 'npc/auditor', 'npc/fisher']),
}
SINGLES = {'reel_case.png': ('reel/case', 1024), 'boathouse_full.png': ('home/boathouse_full', 900)}


def key(im):
    """Magenta to alpha. Edge pixels take the cream paper colour so no pink fringe is left."""
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g  # about 255 on magenta, below 0 on every palette colour
    alpha = np.clip((200 - m) / 120.0, 0, 1)
    out = np.dstack([a, (alpha * 255)]).astype(np.uint8)
    edge = (alpha > 0) & (alpha < 1)
    out[edge, :3] = CREAM
    return out


def bbox(alpha):
    ys, xs = np.where(alpha > 40)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None


def save(arr, sid, size):
    im = Image.fromarray(arr, 'RGBA')
    s = size / max(im.size)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    p = os.path.join(OUT, sid + '.png')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, optimize=True)
    return im.size


def regions(mask):
    """Connected regions of a boolean mask on a 1/4 grid: (pixel count, x0, y0, x1, y1, touches border) in full-size pixels."""
    small = mask[::4, ::4]
    h, w = small.shape
    lab = np.zeros((h, w), bool)
    out = []
    for sy in range(h):
        for sx in range(w):
            if not small[sy, sx] or lab[sy, sx]:
                continue
            q, x0, y0, x1, y1, cnt, border = deque([(sy, sx)]), sx, sy, sx, sy, 0, False
            lab[sy, sx] = True
            while q:
                y, x = q.popleft()
                cnt += 1
                x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
                if y == 0 or x == 0 or y == h - 1 or x == w - 1:
                    border = True
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and small[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = True
                        q.append((yy, xx))
            out.append((cnt, x0 * 4, y0 * 4, (x1 + 1) * 4, (y1 + 1) * 4, border))
    return sorted(out, reverse=True)


def reading_order(rects, rows):
    """Sort boxes (x0, y0, x1, y1) into rows by centre y, then left to right."""
    rects = sorted(rects, key=lambda r: (r[1] + r[3]) / 2)
    per = -(-len(rects) // rows)
    return [r for i in range(0, len(rects), per) for r in sorted(rects[i:i + per], key=lambda r: r[0])]


def items(alpha, n):
    """The n largest opaque regions; smaller loose bits (smoke, drops) are merged into the nearest one."""
    regs = regions(alpha > 40)
    big, rest = [list(r[1:5]) for r in regs[:n]], [r for r in regs[n:] if r[0] > 12]
    for _, x0, y0, x1, y1, _ in rest:
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        t = min(big, key=lambda r: max(r[0] - cx, 0, cx - r[2]) + max(r[1] - cy, 0, cy - r[3]))
        if max(t[0] - cx, 0, cx - t[2]) + max(t[1] - cy, 0, cy - t[3]) < 60:
            t[0], t[1], t[2], t[3] = min(t[0], x0), min(t[1], y0), max(t[2], x1), max(t[3], y1)
    return big


def windows(alpha):
    """The nine transparent holes fully inside the case."""
    holes = [r[1:5] for r in regions(alpha < 40) if not r[5]][:9]
    return reading_order(holes, 3)


manifest, problems = {}, []
for name, (cols, rows, size, ids) in SHEETS.items():
    path = os.path.join(RAW, name)
    if not os.path.exists(path):
        problems.append('missing ' + name); continue
    arr = key(Image.open(path))
    want = [sid for sid in ids if sid]
    found = items(arr[..., 3], len(want))
    if len(found) != len(want):
        problems.append(f'{name}: found {len(found)} items, need {len(want)}'); continue
    for sid, (x0, y0, x1, y1) in zip(want, reading_order(found, rows)):
        manifest[sid] = save(arr[y0:y1, x0:x1], sid, size)

for name, (sid, size) in SINGLES.items():
    path = os.path.join(RAW, name)
    if not os.path.exists(path):
        problems.append('missing ' + name); continue
    arr = key(Image.open(path))
    bb = bbox(arr[..., 3])
    crop = arr[bb[1]:bb[3], bb[0]:bb[2]]
    manifest[sid] = save(crop, sid, size)
    if sid == 'reel/case':
        h, w = crop.shape[:2]
        rects = [[round(x0 / w, 4), round(y0 / h, 4), round(x1 / w, 4), round(y1 / h, 4)] for x0, y0, x1, y1 in windows(crop[..., 3])]
        if len(rects) != 9:
            problems.append(f'reel case: found {len(rects)} windows, need 9')
        json.dump({'size': manifest[sid], 'windows': rects}, open(os.path.join(OUT, 'reel', 'case_rects.json'), 'w'))

for name, sid, w in (('bg_pier_game.png', 'bg/pier_game', 1080), ('store_icon.png', 'store/icon', 1024)):
    path = os.path.join(RAW, name)
    if not os.path.exists(path):
        problems.append('missing ' + name); continue
    im = Image.open(path).convert('RGB')
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, sid + ('.jpg' if sid.startswith('bg/') else '.png'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, quality=86)
    manifest[sid] = im.size

json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=0)
print(len(manifest), 'sprites')
for p in problems:
    print('PROBLEM', p)
sys.exit(1 if any(p.startswith('missing') for p in problems) else 0)
