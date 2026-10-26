"""Convert the curated selection into web assets (public/assets/work) + lib/work-data.js"""
import json, os, re, shutil, subprocess, collections, unicodedata
from PIL import Image, ImageOps, ImageStat
import imageio_ffmpeg
Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(__file__)
SITE = r"D:\my Portfoliyo\website"
OUT = os.path.join(SITE, "public", "assets", "work")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

EXCLUDE = {
    "FOUR SECURE": {2, 10, 12, 25, 26, 27, 28},
    "GO GREEN INITIATIVE": {0},
    "wall street": {10},
    "MANGO PRESS": {0, 16},
    "NatureHills_LinkedIn_Pack": {1, 4, 5},
    "FIX & FIT": {0, 8, 9, 17},
    "twcft": {0, 5, 6, 11, 12, 14, 15, 16, 17},
    "Root Cyber": {0},
    "THE ARROW": {13},
    "the wonder by chest": {3, 5, 6, 11},
    "aqua tip": {8, 11},
    "b2b print usa": {4, 5, 8, 11, 13},
    "bacha planet": {0, 2},
    "find sayarat": {1, 4, 9},
    "trivor": {7},
    "wmz transport": {1, 3, 5, 7, 9, 13},
    "NTX CONSTRUTION": {12},
    "Jawhar Al Saraya": {0},
}

# display order + metadata
BRANDS = [
    ("FOUR SECURE", "Four Secure", "Cybersecurity", ["Social Media", "Branding", "Motion", "Web"],
     "In-house since day one — three years of campaigns, awareness series, event posts, website banners and reels for a cybersecurity company.", 5),
    ("wall street", "Wall Street Properties", "Real Estate", ["Social Media", "Print", "Web", "Motion"],
     "Launch and construction-update content for Jinnah Heights, 83 Edge and Jinnah Twin Tower — floor plans, magazine spreads, banners and reels.", 3),
    ("GO GREEN INITIATIVE", "Go Green Initiative", "Landscaping & Green Walls", ["Social Media", "Motion"],
     "A monthly content calendar for a green-wall studio — editorial plant posts, seasonal guides, festive greetings and TikTok edits.", 4),
    ("aqua tip", "Aqua TIP", "Threat Intelligence", ["Social Media", "Web", "Motion"],
     "A violet, after-dark visual language for a threat-intelligence platform — social campaigns, product UI modules and video.", 3),
    ("MANGO PRESS", "Mango Press", "Digital Agency", ["Branding", "Social Media", "Print", "Motion"],
     "Identity, stationery, pitch decks and a punchy yellow social feed for a digital marketing agency.", 2),
    ("find sayarat", "Find Sayarat", "Automotive Marketplace", ["Social Media"],
     "Launch campaign for a UAE used-car marketplace — teaser posts, comparison carousels and buyer guides.", 0),
    ("NatureHills_LinkedIn_Pack", "Nature Hills", "Living Walls · UK", ["Social Media"],
     "A LinkedIn content pack that lets the living walls do the talking — calm typography over real project photography.", 1),
    ("FIX & FIT", "Fix & Fit", "Home Services", ["Social Media", "Web"],
     "Bold yellow-and-black social posts and website graphics for a repairs and renovation service.", 0),
    ("Root Cyber", "Root Cyber", "Cybersecurity", ["Social Media", "Motion"],
     "Educational cybersecurity posts and reels across a monthly calendar, plus logo work.", 2),
    ("THE ARROW", "The Arrow", "Brand Identity", ["Branding"],
     "A full identity and brand guideline — logo system, legibility rules, collaterals and merchandise mockups.", 0),
    ("trivor", "Trivor", "Fashion", ["Branding"],
     "Logo exploration and brand guideline for a family fashion label — “tailored luxury with personality”.", 0),
    ("bacha planet", "Bacha Planet", "Kids & Toys", ["Branding", "Social Media", "Web", "Motion"],
     "A playful identity, favicon, brand book, website imagery and social posts for a children’s toy store.", 2),
    ("the wonder by chest", "The Wonder Chest", "Beauty & Wellness", ["Branding", "Web"],
     "Logo iterations and website imagery for a beauty and wellness brand.", 0),
    ("twcft", "TWCFT", "Non-profit", ["Print", "Branding"],
     "Banners, standees, cards, brand guideline and portrait retouching for the Women’s Care Foundation of Pakistan.", 1),
    ("b2b print usa", "B2B Print USA", "Printing", ["Branding"],
     "Logo and brand guidelines for a US printing company.", 0),
    ("NTX CONSTRUTION", "NTX Construction", "Construction", ["Branding"],
     "Logo, typography, colour and scaling rules — a complete brand guideline for a construction group.", 0),
    ("Rahvero", "Rahvero", "Travel Consultancy", ["Branding"],
     "A road-and-star monogram and full logo suite for a travel consultancy.", 0),
    ("Jawhar Al Saraya", "Jawhar Al Saraya", "Auto Accessories", ["Branding", "Motion"],
     "Logo, signage and logo animation for an auto-accessories trading company.", 1),
    ("wmz transport", "WMZ Transport", "Logistics", ["Branding"],
     "Logo explorations for a transport company — “We move what matters”.", 0),
    ("new aqua secure", "Aqua Secure", "Cybersecurity", ["Branding"],
     "Logo concepts for a security brand.", 0),
    ("Case Culture", "Case Culture", "Accessories", ["Branding"],
     "Monogram and logo system for an accessories brand.", 0),
    ("izhaan", "Izhaan", "Handmade Goods", ["Print"],
     "Packaging stickers for a small handmade business.", 0),
]

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def open_rgb(p):
    im = Image.open(p)
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P", "PA"):
        im = im.convert("RGBA")
        a = im.getchannel("A")
        if a.getextrema()[0] < 250:
            lum = ImageStat.Stat(im.convert("L"), mask=a.point(lambda v: 255 if v > 128 else 0)).mean[0]
            bg = (238, 236, 230, 255) if lum < 115 else (17, 17, 19, 255)
            base = Image.new("RGBA", im.size, bg); base.alpha_composite(im); im = base
    return im.convert("RGB")

def save_webp(im, path, maxdim, q):
    im = im.copy(); im.thumbnail((maxdim, maxdim), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=5)
    return im.size

def duration(p):
    r = subprocess.run([FFMPEG, "-i", p], capture_output=True, text=True, errors="ignore")
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else 0

def build_video(src, dst, poster):
    d = duration(src)
    if d < 3: return None
    length = min(d, 20)
    vf = "scale='if(gt(iw,ih),min(960,iw),-2)':'if(gt(iw,ih),-2,min(960,ih))'"
    r = subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", src, "-t", f"{length:.2f}", "-vf", vf,
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "29", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "96k", "-ac", "2", "-movflags", "+faststart", dst], capture_output=True)
    if r.returncode != 0 or not os.path.exists(dst): return None
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", f"{min(1.0, length/3):.2f}", "-i", dst,
                    "-frames:v", "1", "-vf", "scale=640:-2", poster + ".png"], capture_output=True)
    if not os.path.exists(poster + ".png"): return None
    im = Image.open(poster + ".png").convert("RGB"); w, h = im.size
    im.save(poster, "WEBP", quality=72); os.remove(poster + ".png")
    return w, h, round(length, 1)

def main():
    sel = json.load(open(os.path.join(HERE, "selection.json")))
    inv = json.load(open(os.path.join(HERE, "inventory.json")))
    vids = collections.defaultdict(list)
    for it in inv:
        if it["kind"] == "vid" and 300_000 < it["size"] < 1_500_000_000:
            vids[it["brand"]].append(it)

    if os.path.isdir(OUT): shutil.rmtree(OUT)
    data = []
    for key, name, industry, tags, desc, nvid in BRANDS:
        s = slug(name); d = os.path.join(OUT, s); os.makedirs(d, exist_ok=True)
        items = []
        for i, it in enumerate(sel.get(key, [])):
            if i in EXCLUDE.get(key, set()): continue
            try: im = open_rgb(it["path"])
            except Exception as e: print("skip", it["path"], e); continue
            n = len(items) + 1
            w, h = save_webp(im, os.path.join(d, f"{n:02d}.webp"), 1800, 82)
            save_webp(im, os.path.join(d, f"{n:02d}-t.webp"), 720, 74)
            items.append({"type": "img", "src": f"assets/work/{s}/{n:02d}.webp",
                          "thumb": f"assets/work/{s}/{n:02d}-t.webp", "w": w, "h": h})
        # videos: spread across folders
        byf = collections.defaultdict(list)
        for v in sorted(vids.get(key, []), key=lambda x: x["path"]): byf[v["folder"]].append(v)
        order = sorted(byf); picked = []
        while len(picked) < nvid and any(byf.values()):
            for f in order:
                if byf[f] and len(picked) < nvid: picked.append(byf[f].pop(len(byf[f]) // 2))
        vi = 0
        for v in picked:
            vi += 1
            dst = os.path.join(d, f"v{vi}.mp4"); poster = os.path.join(d, f"v{vi}.webp")
            res = build_video(v["path"], dst, poster)
            if not res: vi -= 1; print("video fail", v["path"]); continue
            w, h, length = res
            items.insert(min(len(items), 2 + vi * 3), {"type": "vid", "src": f"assets/work/{s}/v{vi}.mp4",
                          "thumb": f"assets/work/{s}/v{vi}.webp", "w": w, "h": h, "len": length})
        data.append({"id": s, "name": name, "industry": industry, "tags": tags, "desc": desc, "items": items})
        print(f"{name}: {sum(1 for x in items if x['type']=='img')} img, {vi} vid", flush=True)

    js = "/* generated by build_assets.py */\nexport const WORK = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    open(os.path.join(SITE, "lib", "work-data.js"), "w", encoding="utf-8").write(js)

if __name__ == "__main__":
    main()
