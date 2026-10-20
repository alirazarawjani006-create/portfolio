"""Pick a varied, de-duplicated set of images per brand and render contact sheets for review."""
import json, os, collections
from PIL import Image, ImageDraw, ImageOps
Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(__file__)
items = json.load(open(os.path.join(HERE, "inventory.json")))
SHEETS = os.path.join(HERE, "sheets"); os.makedirs(SHEETS, exist_ok=True)

CAPS = {"FOUR SECURE": 32, "GO GREEN INITIATIVE": 22, "wall street": 22, "MANGO PRESS": 18,
        "NatureHills_LinkedIn_Pack": 18, "FIX & FIT": 18, "twcft": 18, "Root Cyber": 14}
DEFAULT_CAP = 14

def load_small(p, size=(16, 16)):
    im = Image.open(p)
    if im.format == "JPEG":
        im.draft("RGB", (256, 256))
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (20, 20, 20, 255)); bg.alpha_composite(im); im = bg
    return im.convert("RGB")

def dhash(im):
    g = im.convert("L").resize((9, 8), Image.LANCZOS)
    px = list(g.getdata())
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])

def ham(a, b): return bin(a ^ b).count("1")

by_brand = collections.defaultdict(list)
for it in items:
    if it["kind"] != "img": continue
    if it["brand"] == "FOUR SECURE" and it["folder"].startswith("FIX & FIT"): continue
    if min(it["w"], it["h"]) < 400: continue
    by_brand[it["brand"]].append(it)

selection = {}
for brand, lst in sorted(by_brand.items()):
    cap = CAPS.get(brand, DEFAULT_CAP)
    folders = collections.defaultdict(list)
    for it in sorted(lst, key=lambda x: x["path"]):
        folders[it["folder"]].append(it)
    # logo folders first, then round-robin across folders, picking evenly spaced files
    order = sorted(folders, key=lambda f: (0 if "logo" in f.lower() else 1, f))
    queues = {f: folders[f][::max(1, len(folders[f]) // 6)] + folders[f] for f in order}
    picked, hashes, seen = [], [], set()
    while len(picked) < cap and any(queues.values()):
        for f in order:
            while queues[f]:
                it = queues[f].pop(0)
                if it["path"] in seen: continue
                seen.add(it["path"])
                try: h = dhash(load_small(it["path"]))
                except Exception: continue
                if any(ham(h, x) <= 6 for x in hashes): continue
                hashes.append(h); picked.append(it); break
            if len(picked) >= cap: break
    selection[brand] = picked

    # contact sheet
    T = 220
    cols = 6; rows = (len(picked) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * T, rows * (T + 18)), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for i, it in enumerate(picked):
        im = load_small(it["path"]); im.thumbnail((T, T))
        x, y = (i % cols) * T, (i // cols) * (T + 18)
        sheet.paste(im, (x + (T - im.width) // 2, y + (T - im.height) // 2))
        d.text((x + 4, y + T + 2), f"{i} {it['folder'][:28]}", fill=(255, 220, 0))
    sheet.save(os.path.join(SHEETS, f"{brand}.jpg"), quality=80)
    print(brand, len(picked), "/", len(lst))

json.dump(selection, open(os.path.join(HERE, "selection.json"), "w"), indent=1)
