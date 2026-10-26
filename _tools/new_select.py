"""Inventory + pick images for the brands in "new brands" -> new_selection.json and contact sheets."""
import json, os, collections, sys
from PIL import Image, ImageDraw, ImageOps
Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(__file__)
ROOT = r"D:\my Portfoliyo\new brands"
SHEETS = os.path.join(HERE, "sheets"); os.makedirs(SHEETS, exist_ok=True)
IMG = {".jpg", ".jpeg", ".png"}
VID = {".mp4", ".mov"}

# brand key -> (source folders, cap, folder preference, folder depth to spread picks across)
BRANDS = {
    "CTA": (["CTA"], 24, None, 2),
    "Etsy": (["ETSY DONE LISTINGS", "Etsy work"], 26, "mockup", 2),
    "Flow": (["flow vedios"], 0, None, 9),
    "Sanchez Payano": (["sanchez payano"], 14, None, 9),
}

def load_small(p):
    im = Image.open(p)
    if im.format == "JPEG": im.draft("RGB", (256, 256))
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P", "PA"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (20, 20, 20, 255)); bg.alpha_composite(im); im = bg
    return im.convert("RGB")

def dhash(im):
    g = im.convert("L").resize((9, 8), Image.LANCZOS)
    px = list(g.getdata())
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])

def ham(a, b): return bin(a ^ b).count("1")

inventory, selection = {}, {}
for key, (dirs, cap, prefer, depth) in BRANDS.items():
    imgs, vids = [], []
    for sub in dirs:
        base = os.path.join(ROOT, sub)
        for dp, dn, fn in os.walk(base):
            dn[:] = [d for d in dn if d != "__MACOSX" and "auto-save" not in d.lower()]
            for f in sorted(fn):
                if f.startswith("._"): continue
                ext = os.path.splitext(f)[1].lower(); p = os.path.join(dp, f)
                rec = {"folder": os.path.relpath(dp, ROOT), "path": p, "size": os.path.getsize(p)}
                if ext in VID: vids.append(rec)
                elif ext in IMG:
                    try:
                        with Image.open(p) as im: rec["w"], rec["h"] = im.size
                    except Exception: continue
                    if min(rec["w"], rec["h"]) >= 400: imgs.append(rec)
    inventory[key] = {"img": len(imgs), "vid": vids}
    if prefer:
        pref = [i for i in imgs if prefer in i["folder"].lower()]
        if len(pref) >= cap: imgs = pref
    folders = collections.defaultdict(list)
    for it in sorted(imgs, key=lambda x: x["path"]):
        folders[os.sep.join(it["folder"].split(os.sep)[:depth])].append(it)
    order = sorted(folders, key=lambda f: (0 if "logo" in f.lower() else 1, f))
    queues = {f: folders[f][::max(1, len(folders[f]) // 4)] + folders[f] for f in order}
    picked, hashes, seen = [], [], set()
    while len(picked) < cap and any(queues.values()):
        for f in order:
            while queues[f]:
                it = queues[f].pop(0)
                if it["path"] in seen: continue
                seen.add(it["path"])
                try: h = dhash(load_small(it["path"]))
                except Exception: continue
                if any(ham(h, x) <= 8 for x in hashes): continue
                hashes.append(h); picked.append(it); break
            if len(picked) >= cap: break
    selection[key] = picked
    if picked:
        T, cols = 220, 6; rows = (len(picked) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * T, rows * (T + 18)), (40, 40, 40)); d = ImageDraw.Draw(sheet)
        for i, it in enumerate(picked):
            im = load_small(it["path"]); im.thumbnail((T, T))
            x, y = (i % cols) * T, (i // cols) * (T + 18)
            sheet.paste(im, (x + (T - im.width) // 2, y + (T - im.height) // 2))
            d.text((x + 4, y + T + 2), f"{i} {it['folder'][-30:]}", fill=(255, 220, 0))
        sheet.save(os.path.join(SHEETS, f"new-{key}.jpg"), quality=80)
    print(key, len(picked), "/", len(imgs), "imgs;", len(vids), "vids", flush=True)

json.dump({"selection": selection, "videos": {k: v["vid"] for k, v in inventory.items()}},
          open(os.path.join(HERE, "new_selection.json"), "w"), indent=1)
