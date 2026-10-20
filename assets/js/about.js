/* About page: hero choreography, artboards, statement scrub, stats, featured rail */
(function () {
  const { $, $$, reduce, fine } = AR;
  const WORK = window.WORK || [];
  const byId = Object.fromEntries(WORK.map((b) => [b.id, b]));
  const star = '<svg><use href="#i-star"/></svg>';

  const pick = (brand, skip = 0) => {
    if (!brand) return null;
    const imgs = brand.items.filter((i) => i.type === "img");
    const tall = imgs.filter((i) => i.h / i.w >= 1 && i.h / i.w <= 1.6);
    return (tall[skip] || tall[0] || imgs[skip] || imgs[0]) || null;
  };
  const ratio = (w, h) => {
    const r = w / h;
    const known = [[1, "1:1"], [0.8, "4:5"], [0.5625, "9:16"], [1.7778, "16:9"], [0.7071, "A4"], [1.4142, "A4 ↔"]];
    let best = known[0];
    known.forEach((k) => { if (Math.abs(k[0] - r) < Math.abs(best[0] - r)) best = k; });
    return best[1];
  };

  /* ---------- Marquees ---------- */
  const names = WORK.map((b) => b.name);
  $("#marquee-a").innerHTML = names.map((n) => `<span class="marquee__item">${n}${star}</span>`).join("");
  $("#marquee-b").innerHTML = WORK.map((b) => `<span class="marquee__item">${b.industry}${star}</span>`).join("");

  /* ---------- Hero artboards ---------- */
  const boards = [["four-secure", 3], ["go-green-initiative", 4], ["wall-street-properties", 1], ["aqua-tip", 0]];
  const abWrap = $(".artboards");
  boards.forEach(([id, skip], i) => {
    const b = byId[id]; const it = pick(b, skip);
    if (!it) return;
    const el = document.createElement("a");
    el.className = "artboard";
    el.href = `work.html#${id}`;
    el.dataset.cursor = "View";
    el.dataset.label = b.name;
    el.dataset.depth = [0.6, 1.1, 0.4, 0.8][i];
    el.innerHTML = `<div class="artboard__label"><span>${b.name}</span><span>${ratio(it.w, it.h)}</span></div>
      <div class="artboard__img"><img src="${it.thumb}" alt="${b.name} design" width="${it.w}" height="${it.h}"></div>`;
    abWrap.appendChild(el);
  });
  const artboards = $$(".artboard");

  /* mouse parallax on artboards + ruler mark */
  const mark = $(".ruler__mark");
  if (fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
      if (mark) mark.style.left = e.clientX - mark.parentElement.getBoundingClientRect().left + "px";
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      artboards.forEach((a) => { const d = +a.dataset.depth; a.style.translate = `${-cx * 30 * d}px ${-cy * 24 * d}px`; });
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Hero intro ---------- */
  const words = $$(".hero__word");
  const role = $(".hero__role");
  const box = $(".hero__role .sel__box");
  const ghost = $(".ghost-cursor");
  const hero = $(".hero");
  const fades = $$("[data-hero-fade], .hero__meta, .ruler");

  if (typeof gsap !== "undefined" && !reduce) {
    gsap.set(words, { yPercent: 110 });
    gsap.set(role, { opacity: 0, y: 20 });
    gsap.set(fades, { opacity: 0 });
    gsap.set(artboards, { opacity: 0, y: 80, scale: 0.9 });
    gsap.set(ghost, { opacity: 0 });
  }

  function ghostPos(el, ox = 0, oy = 0) {
    const r = el.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return { x: r.left - h.left + r.width * ox, y: r.top - h.top + r.height * oy };
  }

  AR.onReady(() => {
    if (typeof gsap === "undefined" || reduce) {
      if (box) box.style.opacity = 1;
      return;
    }
    const tl = gsap.timeline();
    tl.to(words, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.12 })
      .to(role, { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, 0.4)
      .to(fades, { opacity: 1, duration: 1, stagger: 0.05 }, 0.6)
      .to(artboards, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "expo.out", stagger: 0.1 }, 0.5);

    // Ghost cursor "draws" the selection box around the role, then wanders between artboards.
    const sel = $(".hero__role .sel");
    const start = ghostPos(sel, 0, 0), end = ghostPos(sel, 1, 1);
    gsap.set(ghost, { x: start.x - 140, y: start.y - 120 });
    gsap.set(box, { opacity: 1, clipPath: "inset(0 100% 100% 0)" });
    tl.to(ghost, { opacity: 1, duration: 0.3 }, 1.1)
      .to(ghost, { x: start.x - 6, y: start.y - 6, duration: 0.8, ease: "power3.inOut" }, 1.1)
      .to(ghost, { x: end.x, y: end.y, duration: 0.9, ease: "power2.inOut" }, 1.95)
      .to(box, { clipPath: "inset(-20% -20% -60% -20%)", duration: 0.9, ease: "power2.inOut" }, 1.95)
      .add(wander, "+=0.8");

    function wander() {
      const targets = artboards.filter((a) => a.offsetParent);
      if (!targets.length) return;
      let i = 0;
      const step = () => {
        const t = targets[i++ % targets.length];
        const p = ghostPos(t, 0.55 + Math.random() * 0.3, 0.45 + Math.random() * 0.4);
        gsap.to(ghost, { x: p.x, y: p.y, duration: 1.6 + Math.random(), ease: "power2.inOut", onComplete: () => gsap.delayedCall(1.4 + Math.random() * 1.6, step) });
      };
      step();
    }

    // Hero exits with scroll
    gsap.to(".hero__title", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".artboards", { yPercent: -30, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  });

  /* ---------- Statement scrub ---------- */
  const statement = $("[data-words]");
  const sw = AR.split(statement, "words");
  AR.onReady(() => {
    if (typeof gsap === "undefined" || reduce) { sw.forEach((w) => (w.style.opacity = 1)); return; }
    gsap.to(sw, { opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
  });

  /* ---------- Count-ups ---------- */
  AR.onReady(() => {
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      const fmt = (v) => Math.round(v).toLocaleString("en-US");
      if (typeof gsap === "undefined" || reduce) { el.textContent = fmt(to); return; }
      const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 2, ease: "expo.out", onUpdate: () => (el.textContent = fmt(o.v)) }) });
    });
  });

  /* ---------- Service peeks ---------- */
  $$(".service").forEach((s) => {
    const it = pick(byId[s.dataset.peek], 2);
    const peek = $(".service__peek", s);
    if (it && peek) peek.innerHTML = `<img src="${it.thumb}" alt="" loading="lazy">`;
  });

  /* ---------- Featured rail ---------- */
  const feat = ["four-secure", "wall-street-properties", "go-green-initiative", "aqua-tip", "find-sayarat", "mango-press", "the-arrow", "nature-hills", "bacha-planet"];
  const track = $("#featured-track");
  track.innerHTML = feat.map((id, i) => {
    const b = byId[id]; const it = pick(b, 1);
    if (!b || !it) return "";
    return `<a class="feat" href="work.html#${id}" data-cursor="Open" data-label="${b.name}">
      <span class="feat__no mono">${String(i + 1).padStart(2, "0")} / ${b.tags[0]}</span>
      <div class="feat__img"><img src="${it.thumb}" alt="${b.name} — ${b.industry}" loading="lazy"></div>
      <div class="feat__meta"><h3>${b.name}</h3><span class="mono muted">${b.industry}</span></div></a>`;
  }).join("") + `<div class="feat feat--end"><a href="work.html" data-label="Work"><span class="mono accent">22 brands</span>See all<br>work →</a></div>`;

  AR.onReady(() => {
    if (typeof gsap === "undefined") return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: "#featured", start: "top top", end: () => "+=" + dist(), pin: "#featured", scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$(".feat__img img", track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none",
          scrollTrigger: { trigger: "#featured", start: "top top", end: () => "+=" + dist(), scrub: true } });
      });
    });
    mm.add("(max-width: 760px)", () => {
      const h = $(".hscroll"); h.style.overflowX = "auto"; h.style.scrollSnapType = "x mandatory";
      $$(".feat", track).forEach((f) => (f.style.scrollSnapAlign = "start"));
    });
  });

  /* ---------- Back to top ---------- */
  $$("[data-scrolltop]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    AR.lenis ? AR.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" });
  }));
})();
