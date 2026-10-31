/* Shared behaviour for every page: smooth scroll, cursor, preloader,
   page transitions, nav, magnetic buttons, marquees and reveals. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function initCore() {
  if (window.AR) return window.AR;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasGsap = true;
  gsap.registerPlugin(ScrollTrigger);

  const readyCbs = [];
  let isReady = false;
  const AR = (window.AR = {
    reduce, fine, $, $$,
    lenis: null,
    onReady(cb) { isReady ? cb() : readyCbs.push(cb); },
  });

  function fireReady() {
    if (isReady) return;
    isReady = true;
    document.documentElement.classList.add("is-ready");
    readyCbs.splice(0).forEach((cb) => cb());
  }

  /* ---------- Smooth scroll ---------- */
  if (!reduce) {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    AR.lenis = lenis;
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  AR.lock = (on) => {
    document.body.classList.toggle("is-locked", on);
    if (AR.lenis) on ? AR.lenis.stop() : AR.lenis.start();
  };

  /* ---------- Text splitting ---------- */
  // Wraps every word (and optionally char) of an element's text nodes, keeping inline elements intact.
  AR.split = function (el, mode = "words") {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w";
            if (mode === "chars") {
              w.style.display = "inline-block";
              w.style.whiteSpace = "nowrap";
              [...part].forEach((c) => { const s = document.createElement("span"); s.className = "char"; s.textContent = c; w.appendChild(s); });
            } else w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("sel__box")) walk(n);
      });
    };
    walk(el);
    return $$(mode === "chars" ? ".char" : ".w", el);
  };

  /* ---------- Cursor ---------- */
  if (fine) {
    const dot = document.createElement("div"); dot.className = "cursor";
    const ring = document.createElement("div"); ring.className = "cursor-ring"; ring.innerHTML = "<span></span>";
    document.body.append(dot, ring);
    const label = ring.firstChild;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    AR.mouse = { x: mx, y: my };
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY; AR.mouse.x = mx; AR.mouse.y = my;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, label, input, textarea");
      ring.classList.remove("is-hover", "is-label", "is-drag");
      if (!t) return;
      const c = t.getAttribute("data-cursor");
      if (c === "drag") { ring.classList.add("is-drag"); label.textContent = "Drag"; }
      else if (c) { ring.classList.add("is-label"); label.textContent = c; }
      else ring.classList.add("is-hover");
    });
    document.addEventListener("pointerleave", () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("pointerenter", () => { dot.style.opacity = ring.style.opacity = 1; });
    AR.setCursor = (txt) => {
      ring.classList.remove("is-hover", "is-label", "is-drag");
      if (txt) { ring.classList.add("is-label"); label.textContent = txt; }
    };
  } else AR.setCursor = () => {};

  /* ---------- Magnetic ---------- */
  if (fine && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transition = "transform .2s";
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .8s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
      });
    });
  }

  /* ---------- Nav ---------- */
  const nav = $(".nav");
  const progress = $(".progress");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > 300 && y > lastY && !document.body.classList.contains("menu-open"));
    }
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".nav__burger");
  if (burger) burger.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    AR.lock(open);
  });

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Toast + copy ---------- */
  let toastEl, toastT;
  AR.toast = (msg) => {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = `<i></i>${msg}`;
    requestAnimationFrame(() => toastEl.classList.add("is-on"));
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
  };
  AR.copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) {} ta.remove();
    }
    AR.toast(msg || "Copied to clipboard");
  };
  $$("[data-copy]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); AR.copy(b.dataset.copy, b.dataset.copyMsg); }));

  /* ---------- Marquees (scroll-velocity reactive) ---------- */
  $$(".marquee").forEach((m) => {
    const track = $(".marquee__track", m);
    if (!track) return;
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    const dir = m.dataset.dir === "right" ? 1 : -1;
    const base = parseFloat(m.dataset.speed) || 0.6;
    let x = 0, boost = 0, half = 0;
    const measure = () => (half = track.scrollWidth / 2);
    measure(); addEventListener("resize", measure);
    if (AR.lenis) AR.lenis.on("scroll", (l) => (boost = Math.min(Math.abs(l.velocity) * 0.5, 14) * Math.sign(l.velocity || 1)));
    const loop = () => {
      if (!reduce) {
        x += (base + Math.abs(boost)) * dir;
        boost *= 0.92;
        if (x <= -half) x += half;
        if (x >= 0 && dir > 0) x -= half;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    if (dir > 0) x = -half;
    loop();
  });

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    if (!hasGsap || reduce) { $$("[data-reveal]").forEach((el) => (el.style.opacity = 1)); return; }
    $$('[data-reveal="lines"]').forEach((el) => {
      const lines = $$(".line-mask > span", el);
      gsap.set(lines, { yPercent: 110 });
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true,
        onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }) });
    });
    $$('[data-reveal="fade"]').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: parseFloat(el.dataset.delay) || 0 }) });
    });
    $$('[data-reveal="stagger"]').forEach((el) => {
      const kids = Array.from(el.children);
      gsap.set(kids, { opacity: 0, y: 50 });
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true,
        onEnter: () => gsap.to(kids, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 }) });
    });
    $$("[data-parallax]").forEach((el) => {
      gsap.to(el, { yPercent: parseFloat(el.dataset.parallax) || -15, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- Preloader + curtain ---------- */
  const curtain = $(".curtain");
  const loader = $(".loader");
  let firstVisit = true;
  try { firstVisit = !sessionStorage.getItem("ar-visited"); sessionStorage.setItem("ar-visited", "1"); } catch (e) {}

  function revealPage() {
    if (!hasGsap) { if (curtain) curtain.style.display = "none"; fireReady(); return; }
    gsap.to(curtain, { yPercent: -100, duration: reduce ? 0.01 : 1.1, ease: "expo.inOut", delay: 0.05,
      onStart: () => setTimeout(fireReady, reduce ? 0 : 380),
      onComplete: () => gsap.set(curtain, { pointerEvents: "none" }) });
  }

  function runLoader() {
    loader.classList.add("is-on");
    if (curtain) gsap.set(curtain, { yPercent: -100, pointerEvents: "none" });
    const count = $(".loader__count", loader);
    const frame = $(".loader__frame", loader);
    const nameSpans = $$(".loader__name span", loader);
    const obj = { v: 0 };
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const tl = gsap.timeline();
    tl.from(frame, { scaleX: 0.02, scaleY: 0.02, duration: 1.1, ease: "expo.inOut" })
      .to(obj, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => (count.textContent = String(Math.round(obj.v)).padStart(3, "0")) }, 0)
      .from(nameSpans, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.06 }, 0.6)
      .add(() => {}, "+=0.15");
    Promise.all([fontsReady, new Promise((r) => tl.eventCallback("onComplete", r))]).then(() => {
      gsap.timeline()
        .to(nameSpans, { yPercent: -110, duration: 0.6, ease: "expo.in", stagger: 0.03 })
        .to(frame, { scale: 6, opacity: 0, duration: 0.9, ease: "expo.in" }, 0.1)
        .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut", onStart: () => setTimeout(fireReady, 450) }, 0.55)
        .add(() => loader.remove());
    });
  }

  if (loader && firstVisit && hasGsap && !reduce) runLoader();
  else { if (loader) loader.remove(); revealPage(); }

  // Page transitions
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !hasGsap || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href");
    if (!href || a.target === "_blank" || a.hasAttribute("download") || href.startsWith("#") || /^(mailto|tel|https?):/i.test(href)) return;
    if (!/\.html(#.*)?$/.test(href) && href !== "./") return;
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) document.body.classList.remove("menu-open");
    const label = $(".curtain__label", curtain);
    if (label) label.textContent = a.dataset.label || a.textContent.trim().split(/\s+/)[0] || "Loading";
    gsap.set(curtain, { yPercent: 100, pointerEvents: "all" });
    gsap.to(curtain, { yPercent: 0, duration: reduce ? 0.01 : 0.85, ease: "expo.inOut", onComplete: () => (location.href = href) });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && curtain && hasGsap) gsap.set(curtain, { yPercent: -100, pointerEvents: "none" }); });

  AR.onReady(() => {
    initReveals();
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 200);
  });
  return AR;
}
