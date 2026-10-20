/* Work page: filters, brand index with cursor peek, infinite draggable canvas,
   brand case overlay and lightbox. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORK } from "./work-data";
import { pad, ratio as baseRatio, TOTAL as total } from "./helpers";

export function initWork(AR) {
  const { $, $$, reduce, fine } = AR;
  const hasGsap = true;
  const ratio = (w, h) => baseRatio(w, h, [[1.91, "1.91:1"]]);
  WORK.forEach((b, bi) => b.items.forEach((it, i) => { it.brand = b; it.bi = bi; it.i = i; }));

  let filter = "All";
  const matches = (b) => filter === "All" || b.tags.includes(filter);

  /* ---------- Filters ---------- */
  const filtersEl = $("#filters");
  filtersEl.addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    filter = c.dataset.filter;
    $$(".chip", filtersEl).forEach((x) => { x.classList.toggle("is-active", x === c); x.setAttribute("aria-pressed", x === c); });
    applyFilter();
  });

  /* ---------- Index rows ---------- */
  const rowsEl = $("#rows");
  const rows = $$(".brand-row", rowsEl);
  rows.forEach((r) => r.addEventListener("click", () => openCase(r.dataset.id)));

  function applyFilter() {
    rows.forEach((r) => r.classList.toggle("is-hidden", !matches(WORK.find((b) => b.id === r.dataset.id))));
    if (hasGsap && !reduce) {
      const vis = rows.filter((r) => !r.classList.contains("is-hidden"));
      gsap.fromTo(vis, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.03 });
    }
    tiles.forEach((t) => t.el.classList.toggle("is-dim", !matches(t.item.brand)));
    if (hasGsap) ScrollTrigger.refresh();
  }

  /* ---------- Cursor peek on index ---------- */
  const peek = $(".peek"), peekInner = $(".peek__inner", peek), peekDims = $(".sel__dims", peek);
  if (fine) {
    let px = 0, py = 0, cx = 0, cy = 0, timer, active = null;
    addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (px - cx) * 0.14; cy += (py - cy) * 0.14;
      const rot = Math.max(-8, Math.min(8, (px - cx) * 0.06));
      peek.style.translate = `${cx + 40}px ${cy - 170}px`;
      peek.style.rotate = `${rot}deg`;
      requestAnimationFrame(loop);
    };
    loop();
    rows.forEach((r) => {
      r.addEventListener("pointerenter", () => {
        const b = WORK.find((x) => x.id === r.dataset.id);
        if (active === b) return;
        active = b;
        const imgs = b.items.slice(0, 6);
        peekInner.innerHTML = imgs.map((it, i) => `<img src="${it.thumb}" alt=""${i === 0 ? ' class="is-on"' : ""}>`).join("");
        peekDims.textContent = `${b.name} — ${pad(b.items.length)} frames`;
        peek.classList.add("is-on");
        clearInterval(timer);
        let k = 0;
        const els = $$("img", peekInner);
        timer = setInterval(() => { els[k % els.length].classList.remove("is-on"); k++; els[k % els.length].classList.add("is-on"); }, 650);
      });
    });
    rowsEl.addEventListener("pointerleave", () => { peek.classList.remove("is-on"); clearInterval(timer); active = null; });
  }

  /* ---------- View toggle ---------- */
  const toggle = $(".viewtoggle"), pill = $(".viewtoggle__pill", toggle);
  const indexEl = $("#index"), canvasEl = $("#canvas");
  const placePill = () => { const a = $("button.is-active", toggle); pill.style.width = a.offsetWidth + "px"; pill.style.transform = `translateX(${a.offsetLeft - 4}px)`; };
  placePill(); addEventListener("resize", placePill);
  if (document.fonts) document.fonts.ready.then(placePill);
  toggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]"); if (!btn || btn.classList.contains("is-active")) return;
    $$("button", toggle).forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    placePill();
    setView(btn.dataset.view);
  });
  function setView(v) {
    const toCanvas = v === "canvas";
    indexEl.hidden = toCanvas; canvasEl.hidden = !toCanvas;
    if (toCanvas) { buildCanvas(); introCanvas(); }
    if (hasGsap) ScrollTrigger.refresh();
    const bar = $(".toolbar");
    const top = toCanvas ? canvasEl.offsetTop - bar.offsetHeight - 6 : bar.offsetTop;
    if (toCanvas || window.scrollY > top) AR.lenis ? AR.lenis.scrollTo(top, { duration: 1 }) : scrollTo({ top, behavior: "smooth" });
  }

  /* ---------- Infinite canvas ---------- */
  const board = $("#board");
  canvasEl.setAttribute("data-lenis-prevent", "");
  let tiles = [], built = false, W = 0, H = 0, panX = 0, panY = 0, vx = 0, vy = 0, dragging = false, needs = true;
  const TW = () => (innerWidth < 760 ? 150 : 230), GAP = () => (innerWidth < 760 ? 40 : 64);

  function buildCanvas() {
    if (built) return; built = true;
    // interleave brands so neighbours differ
    const queues = WORK.map((b) => b.items.slice());
    const order = [];
    while (queues.some((q) => q.length)) queues.forEach((q) => q.length && order.push(q.shift()));
    const tw = TW(), gap = GAP(), colW = tw + gap;
    const cols = Math.max(Math.ceil((canvasEl.clientWidth + colW * 2) / colW), Math.round(Math.sqrt(order.length * 1.1)));
    const heights = new Array(cols).fill(gap);
    order.forEach((item, n) => {
      const c = heights.indexOf(Math.min(...heights));
      const w = tw * (n % 7 === 0 ? 1.25 : 1);
      const h = Math.round(w * item.h / item.w);
      const x = c * colW + (n % 3) * 8, y = heights[c] + (n % 5) * 6;
      heights[c] += h + gap;
      const el = document.createElement("div");
      el.className = "tile";
      el.style.width = w + "px"; el.style.height = h + "px";
      el.dataset.cursor = item.type === "vid" ? "Play" : "View";
      el.innerHTML = `<span class="tile__label">${item.brand.name} — ${pad(item.i + 1)}</span>
        <div class="tile__img"><img alt="${item.brand.name} design ${item.i + 1}" draggable="false"></div>
        ${item.type === "vid" ? '<span class="tile__play"><svg><use href="#i-play"/></svg></span>' : ""}
        <span class="sel__box"><i></i><i></i><i></i><i></i><em class="sel__dims">${ratio(item.w, item.h)} · ${item.type === "vid" ? item.len + "s" : item.w + "×" + item.h}</em></span>`;
      board.appendChild(el);
      tiles.push({ el, item, x, y, w, h, img: el.querySelector("img"), loaded: false });
    });
    W = cols * colW; H = Math.max(...heights) + gap;
    if (H < canvasEl.clientHeight + 600) H = canvasEl.clientHeight + 600;
    panX = -(W - canvasEl.clientWidth) / 2; panY = -(H - canvasEl.clientHeight) / 2;
    buildMini();
    tiles.forEach((t) => t.el.classList.toggle("is-dim", !matches(t.item.brand)));
    requestAnimationFrame(frame);
  }

  const mod = (a, n) => ((a % n) + n) % n;
  function frame() {
    if (!canvasEl.hidden) {
      if (!dragging) {
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) { panX += vx; panY += vy; vx *= 0.94; vy *= 0.94; needs = true; }
      }
      if (needs) layout();
    }
    requestAnimationFrame(frame);
  }
  function layout() {
    needs = false;
    const cw = canvasEl.clientWidth, ch = canvasEl.clientHeight, m = 300;
    for (const t of tiles) {
      const sx = mod(t.x + panX + m, W) - m;
      const sy = mod(t.y + panY + m, H) - m;
      t.el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      if (!t.loaded && sx > -t.w - 400 && sx < cw + 400 && sy > -t.h - 400 && sy < ch + 400) { t.img.src = t.item.thumb; t.loaded = true; }
    }
    updateMini();
  }

  // minimap
  const mini = $("#mini"), miniView = $("#mini-view");
  let ms = 1;
  function buildMini() {
    ms = Math.min(140 / W, 100 / H);
    mini.innerHTML = tiles.map((t) => `<i style="left:${t.x * ms}px;top:${t.y * ms}px;width:${t.w * ms}px;height:${t.h * ms}px"></i>`).join("");
    miniView.style.width = canvasEl.clientWidth * ms + "px"; miniView.style.height = canvasEl.clientHeight * ms + "px";
  }
  function updateMini() {
    miniView.style.left = mod(-panX, W) * ms + "px";
    miniView.style.top = mod(-panY, H) * ms + "px";
  }

  // drag / inertia
  let sx0 = 0, sy0 = 0, lx = 0, ly = 0, moved = 0, downTile = null, lastT = 0;
  canvasEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".canvas__hud")) return;
    dragging = true; moved = 0; vx = vy = 0;
    sx0 = lx = e.clientX; sy0 = ly = e.clientY; lastT = performance.now();
    downTile = e.target.closest(".tile");
    canvasEl.classList.add("is-dragging");
    canvasEl.setPointerCapture(e.pointerId);
  });
  canvasEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(1, now - lastT);
    panX += dx; panY += dy; needs = true;
    vx = (dx / dt) * 16; vy = (dy / dt) * 16;
    lx = e.clientX; ly = e.clientY; lastT = now;
    moved = Math.max(moved, Math.hypot(e.clientX - sx0, e.clientY - sy0));
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false; canvasEl.classList.remove("is-dragging");
    if (performance.now() - lastT > 80) vx = vy = 0;
    if (moved < 6 && downTile) {
      const t = tiles.find((x) => x.el === downTile);
      if (t) {
        const list = tiles.filter((x) => matches(x.item.brand)).map((x) => x.item);
        openLightbox(list, list.indexOf(t.item));
      }
    }
    downTile = null;
  };
  canvasEl.addEventListener("pointerup", endDrag);
  canvasEl.addEventListener("pointercancel", endDrag);
  canvasEl.addEventListener("wheel", (e) => { e.preventDefault(); panX -= e.deltaX; panY -= e.deltaY; vx = vy = 0; needs = true; }, { passive: false });
  $("#canvas-center").addEventListener("click", () => {
    if (!hasGsap) return;
    // glide to the nearest copy of the board's centre (the board repeats every W × H)
    const cx = -(W - canvasEl.clientWidth) / 2, cy = -(H - canvasEl.clientHeight) / 2;
    const o = { x: panX, y: panY };
    vx = vy = 0;
    gsap.to(o, { x: cx + Math.round((panX - cx) / W) * W, y: cy + Math.round((panY - cy) / H) * H,
      duration: 1.2, ease: "expo.inOut", onUpdate: () => { panX = o.x; panY = o.y; needs = true; } });
  });
  addEventListener("keydown", (e) => {
    if (canvasEl.hidden || lb.classList.contains("is-open") || caseEl.classList.contains("is-open")) return;
    const k = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (k && canvasEl.matches(":hover")) { e.preventDefault(); vx += k[0] * 14; vy += k[1] * 14; }
  });
  addEventListener("resize", () => { if (built) { buildMini(); needs = true; } });

  function introCanvas() {
    layout();
    if (!hasGsap || reduce) return;
    const cw = canvasEl.clientWidth, ch = canvasEl.clientHeight;
    const vis = tiles.filter((t) => { const r = t.el.getBoundingClientRect(), c = canvasEl.getBoundingClientRect(); return r.right > c.left && r.left < c.left + cw && r.bottom > c.top && r.top < c.top + ch; });
    gsap.fromTo(vis.map((t) => t.el.querySelector(".tile__img")), { scale: 0.4, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.1, ease: "expo.out", stagger: { each: 0.025, from: "center" } });
    // gentle drift so the board feels alive
    vx = -2.2; vy = -1.4;
  }

  /* ---------- Case overlay ---------- */
  const caseEl = $("#case");
  caseEl.setAttribute("data-lenis-prevent", "");
  const grid = $("#case-grid");
  let current = null, vidObserver = null;

  function fillCase(b) {
    current = b;
    $("#case-layer span").textContent = `Artboard ${pad(WORK.indexOf(b) + 1)} / ${pad(WORK.length)}`;
    $("#case-title").textContent = b.name;
    $("#case-desc").textContent = b.desc;
    $("#case-ind").textContent = b.industry;
    $("#case-tags").textContent = b.tags.join(", ");
    $("#case-count").textContent = pad(b.items.length);
    grid.innerHTML = b.items.map((it, i) => it.type === "vid"
      ? `<button class="m-item" data-i="${i}" data-cursor="Play" aria-label="Play video ${i + 1}">
           <video src="${it.src}" poster="${it.thumb}" muted loop playsinline preload="none" width="${it.w}" height="${it.h}"></video>
           <span class="m-item__badge mono"><svg><use href="#i-play"/></svg>${it.len}s</span></button>`
      : `<button class="m-item" data-i="${i}" data-cursor="View" aria-label="View image ${i + 1}">
           <img src="${it.thumb}" srcset="${it.thumb} 720w, ${it.src} ${Math.max(it.w, it.h)}w" sizes="(max-width: 760px) 50vw, 33vw"
             width="${it.w}" height="${it.h}" alt="${b.name} — design ${i + 1}" loading="lazy" decoding="async"></button>`).join("");
    const nb = nextBrand(b);
    $("#case-next strong").textContent = nb ? nb.name : "";
    caseEl.scrollTop = 0;

    if (vidObserver) vidObserver.disconnect();
    vidObserver = new IntersectionObserver((ents) => ents.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
    }), { root: caseEl, threshold: 0.35 });
    $$("video", grid).forEach((v) => vidObserver.observe(v));
  }
  function nextBrand(b) {
    const list = WORK.filter(matches);
    const pool = list.includes(b) ? list : WORK;
    return pool[(pool.indexOf(b) + 1) % pool.length];
  }
  function animateCaseIn() {
    if (!hasGsap || reduce) return;
    const title = $("#case-title");
    const chars = AR.split(title, "chars");
    gsap.fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.025, delay: 0.25 });
    gsap.fromTo(".case__info > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.4 });
    gsap.fromTo($$(".m-item", grid).slice(0, 9), { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.5 });
  }
  function openCase(id) {
    const b = WORK.find((x) => x.id === id); if (!b) return;
    fillCase(b);
    caseEl.classList.add("is-open");
    AR.lock(true);
    peek.classList.remove("is-on");
    history.replaceState(null, "", "#" + id);
    if (hasGsap && !reduce) gsap.fromTo(caseEl, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" });
    else caseEl.style.clipPath = "none";
    animateCaseIn();
    setTimeout(() => $("#case-close").focus({ preventScroll: true }), 50);
  }
  function closeCase() {
    if (!caseEl.classList.contains("is-open")) return;
    history.replaceState(null, "", location.pathname);
    $$("video", grid).forEach((v) => v.pause());
    const done = () => { caseEl.classList.remove("is-open"); AR.lock(false); };
    if (hasGsap && !reduce) gsap.to(caseEl, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut", onComplete: done });
    else done();
  }
  $("#case-close").addEventListener("click", closeCase);
  $("#case-next").addEventListener("click", () => {
    const nb = nextBrand(current); if (!nb) return;
    if (!hasGsap || reduce) { fillCase(nb); return; }
    gsap.to(caseEl, { opacity: 0, duration: 0.35, onComplete: () => {
      fillCase(nb); history.replaceState(null, "", "#" + nb.id);
      gsap.to(caseEl, { opacity: 1, duration: 0.35 }); animateCaseIn();
    } });
  });
  grid.addEventListener("click", (e) => {
    const m = e.target.closest(".m-item"); if (!m) return;
    openLightbox(current.items, +m.dataset.i);
  });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), stage = $("#lb-stage"), thumbs = $("#lb-thumbs");
  let lbList = [], lbIdx = 0, lastFocus = null;
  function openLightbox(list, idx) {
    lbList = list; lbIdx = Math.max(0, idx);
    lastFocus = document.activeElement;
    thumbs.innerHTML = list.length <= 60 ? list.map((it, i) => `<button data-i="${i}" aria-label="Go to ${i + 1}"><img src="${it.thumb}" alt="" loading="lazy"></button>`).join("") : "";
    lb.classList.add("is-open");
    AR.lock(true);
    showLb(0);
    setTimeout(() => $("#lb-close").focus({ preventScroll: true }), 30);
  }
  function showLb(dir) {
    const it = lbList[lbIdx];
    const old = stage.querySelector("img, video");
    let el;
    if (it.type === "vid") {
      el = document.createElement("video");
      Object.assign(el, { src: it.src, poster: it.thumb, controls: true, autoplay: true, playsInline: true, loop: true });
    } else {
      el = document.createElement("img");
      el.src = it.src; el.alt = `${it.brand.name} — design ${it.i + 1}`;
    }
    if (old) { if (old.pause) old.pause(); old.remove(); }
    stage.prepend(el);
    if (hasGsap && !reduce) gsap.fromTo(el, { opacity: 0, x: dir * 60, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "expo.out" });
    $("#lb-title").textContent = `${it.brand.name} — ${it.brand.industry}`;
    $("#lb-count").textContent = `${pad(lbIdx + 1)} / ${pad(lbList.length)}`;
    $$("button", thumbs).forEach((b, i) => b.classList.toggle("is-on", i === lbIdx));
    const on = thumbs.querySelector(".is-on");
    if (on) on.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    // preload neighbours
    [lbIdx + 1, lbIdx - 1].forEach((k) => { const n = lbList[(k + lbList.length) % lbList.length]; if (n && n.type === "img") new Image().src = n.src; });
  }
  const step = (d) => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; showLb(d); };
  function closeLb() {
    const v = stage.querySelector("video"); if (v) v.pause();
    lb.classList.remove("is-open");
    if (!caseEl.classList.contains("is-open")) AR.lock(false);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $("#lb-prev").addEventListener("click", () => step(-1));
  $("#lb-next").addEventListener("click", () => step(1));
  $("#lb-close").addEventListener("click", closeLb);
  thumbs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const i = +b.dataset.i; const d = i > lbIdx ? 1 : -1; lbIdx = i; showLb(d); });
  stage.addEventListener("click", (e) => { if (e.target === stage) closeLb(); });
  let tx0 = null;
  stage.addEventListener("touchstart", (e) => (tx0 = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", (e) => { if (tx0 === null) return; const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx0 = null; });

  addEventListener("keydown", (e) => {
    if (lb.classList.contains("is-open")) {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    } else if (caseEl.classList.contains("is-open") && e.key === "Escape") closeCase();
  });

  /* ---------- Page intro ---------- */
  if (hasGsap && !reduce) {
    gsap.set(".ph-word", { yPercent: 110 });
    gsap.set(["#count-total", ".ph-fade", ".toolbar"], { opacity: 0, y: 20 });
    gsap.set(rows, { opacity: 0, y: 40 });
  }
  AR.onReady(() => {
    if (hasGsap && !reduce) {
      gsap.timeline()
        .to(".ph-word", { yPercent: 0, duration: 1.4, ease: "expo.out" })
        .to(["#count-total", ".ph-fade", ".toolbar"], { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.3)
        .to(rows, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.04 }, 0.5);
      const o = { v: 0 };
      gsap.to(o, { v: total, duration: 1.8, ease: "expo.out", delay: 0.3, onUpdate: () => ($("#count-total").textContent = `(${pad(Math.round(o.v), 3)})`) });
    }
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && WORK.some((b) => b.id === id)) setTimeout(() => openCase(id), reduce ? 0 : 500);
  });
}
