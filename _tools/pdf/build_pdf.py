"""Build the print portfolio (A4 landscape PDF) from lib/work-data.js.
Renders portfolio.html with compressed JPEGs, then prints it with headless Chrome."""
import json, os, re, html, subprocess, shutil, base64, io
from PIL import Image
import segno

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
PUBLIC = os.path.join(SITE, "public")
BUILD = os.path.join(HERE, "build")
OUT_PDF = os.path.join(os.path.dirname(SITE), "Ali-Raza-Portfolio.pdf")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
URL = "https://alirazarawjani006-create.github.io/portfolio/"

PW, PH, PAD = 1123, 794, 44          # A4 landscape at 96 dpi
GAP = 10
os.makedirs(os.path.join(BUILD, "img"), exist_ok=True)
COMBINE = ["aqua-secure", "case-culture", "izhaan"]   # tiny brands share one page

WORK = json.loads(open(os.path.join(SITE, "lib", "work-data.js"), encoding="utf-8").read()
                  .split("export const WORK = ", 1)[1].rstrip().rstrip(";"))
esc = html.escape

# ---------- images ----------
def jpeg(item, maxdim=1300):
    """Compress one item (video -> its poster) into build/img and return the relative path."""
    src = os.path.join(PUBLIC, (item["thumb"] if item["type"] == "vid" else item["src"]).replace("/", os.sep))
    name = re.sub(r"[^a-z0-9]+", "-", item["src"].lower()) + ".jpg"
    dst = os.path.join(BUILD, "img", name)
    if not os.path.exists(dst):
        im = Image.open(src).convert("RGB"); im.thumbnail((maxdim, maxdim), Image.LANCZOS)
        im.save(dst, "JPEG", quality=76, optimize=True, progressive=True)
    return "img/" + name

def spread(items, k):
    """Pick k items evenly through the list, keeping at most 2 videos."""
    if len(items) <= k: return items[:]
    picked, vids = [], 0
    step = len(items) / k
    idx = [int(i * step) for i in range(k)]
    pool = list(items)
    for i in idx:
        it = pool[i]
        if it["type"] == "vid" and vids >= 2:
            it = next((x for x in pool[i:] + pool[:i] if x["type"] == "img" and x not in picked), it)
        if it in picked: continue
        vids += it["type"] == "vid"; picked.append(it)
    return picked

# ---------- justified rows ----------
def layout(items, W, H):
    """Split items into balanced rows that fill W x H; returns [(row_items, height, widths)]."""
    a = [it["w"] / it["h"] for it in items]; n = len(a)
    best = None
    for r in range(1, min(n, 4) + 1):
        # balanced sequential partition into r rows (DP on squared deviation from the mean aspect sum)
        tot = sum(a); target = tot / r
        pre = [0]; [pre.append(pre[-1] + x) for x in a]
        INF = float("inf"); dp = [[INF] * (n + 1) for _ in range(r + 1)]; cut = [[0] * (n + 1) for _ in range(r + 1)]
        dp[0][0] = 0
        for j in range(1, r + 1):
            for e in range(j, n + 1):
                for s in range(j - 1, e):
                    c = dp[j - 1][s] + (pre[e] - pre[s] - target) ** 2
                    if c < dp[j][e]: dp[j][e], cut[j][e] = c, s
        rows, e = [], n
        for j in range(r, 0, -1): s = cut[j][e]; rows.append(list(range(s, e))); e = s
        rows.reverse()
        hs = [(W - GAP * (len(row) - 1)) / sum(a[i] for i in row) for row in rows]
        total = sum(hs) + GAP * (r - 1)
        scale = min(1, (H - GAP * (r - 1)) / sum(hs))
        hs = [h * scale for h in hs]
        area = sum(h * h * a[i] for row, h in zip(rows, hs) for i in row)
        # avoid single very tall rows dominating: mild penalty for heights > 70% of the box
        area *= 0.85 if max(hs) > H * 0.72 and n > 2 else 1
        if not best or area > best[0]: best = (area, rows, hs)
    _, rows, hs = best
    return [([items[i] for i in row], h, [h * a[i] for i in row]) for row, h in zip(rows, hs)]

def grid(items, W, H, brand_id):
    rows = layout(items, W, H)
    out = []
    for row, h, ws in rows:
        cells = []
        for it, w in zip(row, ws):
            badge = f'<span class="play">▶ {it["len"]:g}s video</span>' if it["type"] == "vid" else ""
            cells.append(f'<a class="cell" href="{URL}work.html#{brand_id}" style="width:{w:.1f}px;height:{h:.1f}px">'
                         f'<img src="{jpeg(it)}" alt="">{badge}</a>')
        out.append(f'<div class="row">{"".join(cells)}</div>')
    return f'<div class="grid" style="width:{W}px;height:{H}px">{"".join(out)}</div>'

# ---------- pages ----------
pages = []
def page(body, cls="", num=True):
    pages.append((cls, body, num))

def chrome_bar(left, right=""):
    return f'<div class="bar mono"><span>{left}</span><span>{right}</span></div>'

def foot():
    return '<div class="foot mono"><span>Ali Raza — Graphic Designer</span><span class="pn"></span></div>'

by = {b["id"]: b for b in WORK}
brands = [b for b in WORK if b["id"] not in COMBINE]
nB = len(WORK)

# cover
cover_imgs = [(by["four-secure"]["items"][3], "Four Secure"), (by["cta-world"]["items"][1], "CTA World"),
              (by["go-green-initiative"]["items"][4], "Go Green"), (by["etsy-printables"]["items"][5], "Etsy Printables"),
              (by["wall-street-properties"]["items"][1], "Wall Street"), (by["the-arrow"]["items"][0], "The Arrow")]
tiles = "".join(f'<figure class="ctile t{i}"><figcaption class="mono">{esc(n)}</figcaption><img src="{jpeg(it, 900)}" alt=""></figure>'
                for i, (it, n) in enumerate(cover_imgs))
page(f'''
<div class="cover">
  {chrome_bar("Portfolio — 2026", "Karachi, Pakistan")}
  <div class="cover__tiles">{tiles}</div>
  <div class="cover__title">
    <h1>Ali<br>Raza</h1>
    <div class="cover__role"><span class="sel">graphic designer</span></div>
    <p class="mono cover__sub">Graphic Design · Digital Marketing · Video Editing · AI Tools</p>
  </div>
  <div class="cover__meta mono"><span>{nB} brands · {sum(len(b["items"]) for b in WORK)} selected pieces</span><span>{URL.replace("https://", "")}</span></div>
</div>''', "dark cover-page", num=False)

# about
SERV = [("Graphic Design", "Brand identities, logo systems, brand guidelines, social posts, banners, stationery and print.", "Photoshop · Illustrator · Branding · Print"),
        ("Digital Marketing", "Monthly content calendars, campaign creatives, launch teasers and awareness series that keep feeds consistent.", "Content calendars · Campaigns · Social"),
        ("Video Editing", "Reels, TikToks, logo animations and promo edits prepared for social and online use.", "After Effects · Filmora · Reels · Motion"),
        ("AI Tools", "AI image and video tools to explore concepts, generate visuals and speed up production.", "AI video · AI imagery · Concepting")]
serv = "".join(f'<div class="svc"><span class="mono accent">/{i+1:02d}</span><h3>{t}</h3><p>{d}</p><span class="mono muted">{tl}</span></div>'
               for i, (t, d, tl) in enumerate(SERV))
page(f'''
{chrome_bar("01 — About me", "Ali Raza")}
<div class="about">
  <div class="about__l">
    <p class="statement">I’m Ali — a creative, adaptable designer who turns ideas into <em>scroll-stopping</em> visuals.
    For three years I’ve shaped campaigns, identities, websites and reels for brands in cybersecurity, logistics,
    real estate, fashion, law and beyond — using design, marketing sense and <em>AI tools</em> to move faster without losing the craft.</p>
    <div class="stats">
      <div><b>3<sup>yrs</sup></b><span>In-house graphic designer</span></div>
      <div><b>{nB}<sup>+</sup></b><span>Brands designed for</span></div>
      <div><b>2,300<sup>+</sup></b><span>Posts, banners, logos &amp; edits</span></div>
      <div><b>4<sup>in 1</sup></b><span>Design, marketing, video, AI</span></div>
    </div>
  </div>
  <div class="about__r">
    <div class="block"><h4 class="mono muted">Experience</h4>
      <div class="xp"><div class="xp__top"><h3>Graphic Designer — Four Secure</h3><span class="mono accent">3 years</span></div>
      <ul><li>Graphics and visual assets for business communication and digital platforms.</li>
      <li>Creative content for digital marketing campaigns and brand identity.</li>
      <li>Video editing and media assets for social media and online use.</li>
      <li>AI tools to assist creative tasks and improve workflow efficiency.</li></ul></div></div>
    <div class="block"><h4 class="mono muted">Education</h4>
      <div class="xp__top"><h3>Intermediate in Commerce</h3><span class="mono muted">I.Com</span></div>
      <div class="xp__top"><h3>Matriculation</h3><span class="mono muted">Computer Science</span></div></div>
    <div class="block"><h4 class="mono muted">Strengths</h4>
      <div class="chips"><span>Creative thinking</span><span>Attention to detail</span><span>Adaptability</span></div></div>
  </div>
</div>
<div class="services">{serv}</div>
{foot()}''', "dark")

# contents (filled after numbering)
page("__INDEX__", "dark")

# brand pages
start_page = {}
for bi, b in enumerate(brands):
    no = WORK.index(b) + 1
    big = len(b["items"]) >= 18
    first = spread(b["items"], 6) if not big else spread(b["items"], 14)[:6]
    rest = [] if not big else [x for x in spread(b["items"], 14) if x not in first][:8]
    tags = "".join(f"<span>{esc(t)}</span>" for t in b["tags"])
    start_page[b["id"]] = len(pages) + 1
    side_w = 290; gw = PW - 2 * PAD - side_w - 36; gh = PH - 2 * PAD - 64
    page(f'''
{chrome_bar(f"{no:02d} / {nB:02d}", esc(b["industry"]))}
<div class="brand">
  <aside class="brand__side">
    <span class="bigno">{no:02d}</span>
    <h2>{esc(b["name"])}</h2>
    <span class="mono accent">{esc(b["industry"])}</span>
    <p>{esc(b["desc"])}</p>
    <div class="chips">{tags}</div>
    <dl class="mono"><dt>Pieces</dt><dd>{len(b["items"]):02d}</dd>
      <dt>Videos</dt><dd>{sum(i["type"] == "vid" for i in b["items"]):02d}</dd></dl>
    <a class="view mono" href="{URL}work.html#{b['id']}">View the full project online →</a>
  </aside>
  {grid(first, gw, gh, b["id"])}
</div>
{foot()}''', "dark")
    if rest:
        page(f'''
{chrome_bar(f"{no:02d} / {nB:02d} — {esc(b['name'])}", "continued")}
{grid(rest, PW - 2 * PAD, PH - 2 * PAD - 64, b["id"])}
{foot()}''', "dark")

# small identity projects on one page
small = [by[i] for i in COMBINE]
start_page["small"] = len(pages) + 1
cols = ""
for b in small:
    no = WORK.index(b) + 1
    for b2 in [b]: start_page[b2["id"]] = start_page["small"]
    cw = (PW - 2 * PAD - 2 * 28) / 3
    cols += f'''<div class="mini"><span class="mono accent">{no:02d} — {esc(b["industry"])}</span><h2>{esc(b["name"])}</h2>
      <p>{esc(b["desc"])}</p>{grid(b["items"], cw, 430, b["id"])}</div>'''
page(f'''{chrome_bar(f"{WORK.index(small[0]) + 1:02d}–{WORK.index(small[-1]) + 1:02d} / {nB:02d}", "More identity work")}
<div class="minis">{cols}</div>{foot()}''', "dark")

# contact
qr = segno.make(URL, error="m")
buf = io.BytesIO(); qr.save(buf, kind="svg", scale=6, border=0, dark="#edeae3", light=None)
qr_svg = "data:image/svg+xml;base64," + base64.b64encode(buf.getvalue()).decode()
page(f'''
{chrome_bar("Final layer — Let’s talk", "Ali Raza")}
<div class="contact">
  <h1>Got a brand<br>to <em>build?</em></h1>
  <div class="contact__row">
    <dl class="channels">
      <dt class="mono muted">Email</dt><dd><a href="mailto:alirazarawjani006@gmail.com">alirazarawjani006@gmail.com</a></dd>
      <dt class="mono muted">Phone / WhatsApp</dt><dd><a href="https://wa.me/923190006224">+92 319 0006224</a></dd>
      <dt class="mono muted">Based</dt><dd>Soldier Bazaar, Garden East, Karachi</dd>
      <dt class="mono muted">Online portfolio</dt><dd><a href="{URL}">{URL.replace("https://", "")}</a></dd>
    </dl>
    <a class="qr" href="{URL}"><img src="{qr_svg}" alt="QR code to the online portfolio"><span class="mono muted">Scan for the full portfolio,<br>videos included</span></a>
  </div>
</div>
<div class="foot mono"><span>© 2026 Ali Raza</span><span class="pn"></span></div>''', "dark")

# contents page
rows = "".join(f'<a class="ix" href="#p{start_page[b["id"]]}"><span class="mono muted">{WORK.index(b) + 1:02d}</span><b>{esc(b["name"])}</b>'
               f'<span class="muted">{esc(b["industry"])}</span><span class="mono muted">{start_page[b["id"]]:02d}</span></a>' for b in WORK)
pages[2] = (pages[2][0], f'''{chrome_bar("02 — Contents", f"{nB} brands")}
<div class="index"><h2 class="h2">Selected<br><em>work</em></h2><div class="ix-list">{rows}</div></div>{foot()}''', True)

# ---------- html ----------
CSS = open(os.path.join(HERE, "print.css"), encoding="utf-8").read()
PN = '<span class="pn"></span>'
body = "".join(f'<section class="page {cls}" id="p{i + 1}">' + b.replace(PN, f'<span class="pn">{i + 1:02d} / {len(pages):02d}</span>') + '</section>'
               for i, (cls, b, num) in enumerate(pages))
doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ali Raza — Portfolio 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>'''

def main():
    open(os.path.join(BUILD, "portfolio.html"), "w", encoding="utf-8").write(doc)
    r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--run-all-compositor-stages-before-draw",
                        "--virtual-time-budget=30000", f"--print-to-pdf={OUT_PDF}", "file:///" + os.path.join(BUILD, "portfolio.html").replace("\\", "/")],
                       capture_output=True, text=True)
    print(r.stderr[-500:] if r.returncode else "", len(pages), "pages ->", OUT_PDF, round(os.path.getsize(OUT_PDF) / 1e6, 1), "MB")

if __name__ == "__main__":
    main()
