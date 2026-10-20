"""Inventory every exported image/video in the portfolio folder -> inventory.json"""
import json, os, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

ROOT = r"D:\my Portfoliyo"
OUT = os.path.join(os.path.dirname(__file__), "inventory.json")
IMG = {".jpg", ".jpeg", ".png"}
VID = {".mp4", ".mov"}

items = []
for brand in sorted(os.listdir(ROOT)):
    bdir = os.path.join(ROOT, brand)
    if not os.path.isdir(bdir) or brand == "website":
        continue
    for dp, dn, fn in os.walk(bdir):
        dn[:] = [d for d in dn if d != "__MACOSX"]
        for f in fn:
            if f.startswith("._"):
                continue
            ext = os.path.splitext(f)[1].lower()
            p = os.path.join(dp, f)
            rel = os.path.relpath(dp, bdir)
            rec = {"brand": brand, "folder": rel, "name": f, "path": p, "size": os.path.getsize(p)}
            if ext in IMG:
                try:
                    with Image.open(p) as im:
                        rec["w"], rec["h"] = im.size
                except Exception as e:
                    continue
                rec["kind"] = "img"
            elif ext in VID:
                rec["kind"] = "vid"
            else:
                continue
            items.append(rec)

json.dump(items, open(OUT, "w"), indent=0)
print(len(items), "items")
