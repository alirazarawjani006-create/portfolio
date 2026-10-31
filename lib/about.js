/* About page: hero choreography, artboards, statement scrub, stats, featured rail */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initAbout(AR) {
  const { $, $$, reduce, fine } = AR;
  const artboards = $$(".artboard");

  /* mouse parallax on artboards + ruler mark */
  const mark = $(".ruler__mark");
  const glow = $(".hero__glow");
  if (fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
      if (mark) mark.style.left = e.clientX - mark.parentElement.getBoundingClientRect().left + "px";
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      artboards.forEach((a) => { const d = +a.dataset.depth; a.style.translate = `${-cx * 30 * d}px ${-cy * 24 * d}px`; });
      if (glow) glow.style.translate = `${cx * 60}px ${cy * 40}px`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Hero intro ---------- */
  const chars = $$(".hero__word").flatMap((w) => [...AR.split(w, "chars")]);
  const role = $(".hero__role");
  const box = $(".hero__role .sel__box");
  const ghost = $(".ghost-cursor");
  const hero = $(".hero");
  const metas = $$(".hero__meta > span");
  const rule = $(".hero__rule");
  const intro = $(".hero__intro");
  const introWords = intro ? [...AR.split(intro, "words")] : [];
  const fades = $$(".scroll-cue, .ruler");
  const frames = $$(".artboard__img");
  const pics = $$(".artboard__img img");
  const labels = $$(".artboard__label");

  if (!reduce) {
    gsap.set(chars, { yPercent: 115, rotate: 7, transformOrigin: "0% 100%" });
    gsap.set(role, { opacity: 0, y: 20, filter: "blur(8px)" });
    gsap.set(metas, { opacity: 0, y: 10 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set(introWords, { opacity: 0, y: 14 });
    gsap.set(fades, { opacity: 0 });
    gsap.set(frames, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(pics, { scale: 1.35 });
    gsap.set(labels, { opacity: 0, y: 8 });
    gsap.set(ghost, { opacity: 0 });
  }

  function ghostPos(el, ox = 0, oy = 0) {
    const r = el.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return { x: r.left - h.left + r.width * ox, y: r.top - h.top + r.height * oy };
  }

  AR.onReady(() => {
    if (reduce) {
      if (box) box.style.opacity = 1;
      return;
    }
    const tl = gsap.timeline();
    tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.3, ease: "expo.out", stagger: 0.045 }, 0)
      .to(rule, { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0)
      .to(metas, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.3)
      .to(role, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out", clearProps: "filter" }, 0.45)
      // artboards unmask bottom-up while the image settles from a zoom
      .to(frames, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: 0.12 }, 0.35)
      .to(pics, { scale: 1, duration: 1.8, ease: "expo.out", stagger: 0.12, clearProps: "transform" }, 0.45)
      .to(labels, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 }, 0.9)
      .to(introWords, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.012 }, 0.8)
      .to(fades, { opacity: 1, duration: 1 }, 1)
      .add(() => artboards.forEach((a, i) =>
        gsap.to(a, { y: i % 2 ? 9 : -9, duration: 3.2 + i * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 })), 1.6);

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
        // keep the name tag on screen near the right edge
        ghost.classList.toggle("is-flip", p.x > hero.clientWidth - 150);
        gsap.to(ghost, { x: p.x, y: p.y, duration: 1.6 + Math.random(), ease: "power2.inOut", onComplete: () => gsap.delayedCall(1.4 + Math.random() * 1.6, step) });
      };
      step();
    }

    // Hero exits with scroll: the two halves of the name drift apart as it fades
    const exit = () => ({ trigger: hero, start: "top top", end: "bottom top", scrub: true });
    gsap.to(".hero__title", { yPercent: 12, opacity: 0.15, ease: "none", scrollTrigger: exit() });
    gsap.to(".hero__title .row--1", { xPercent: -6, ease: "none", scrollTrigger: exit() });
    gsap.to(".hero__title .row--2", { xPercent: 6, ease: "none", scrollTrigger: exit() });
    gsap.to(".artboards", { yPercent: -30, ease: "none", scrollTrigger: exit() });
  });

  /* ---------- Statement scrub ---------- */
  const statement = $("[data-words]");
  const sw = AR.split(statement, "words");
  AR.onReady(() => {
    if (reduce) { sw.forEach((w) => (w.style.opacity = 1)); return; }
    gsap.to(sw, { opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
  });

  /* ---------- Count-ups ---------- */
  AR.onReady(() => {
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      const fmt = (v) => Math.round(v).toLocaleString("en-US");
      if (reduce) { el.textContent = fmt(to); return; }
      const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 2, ease: "expo.out", onUpdate: () => (el.textContent = fmt(o.v)) }) });
    });
  });

  /* ---------- Featured rail ---------- */
  const track = $("#featured-track");
  AR.onReady(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => track.scrollWidth - innerWidth;
      // Pin just the rail, centred in the viewport, so whole cards stay visible on short screens.
      // Lenis already smooths the scroll, so scrub directly instead of adding a second lag.
      const rail = $("#featured .hscroll");
      const tl = gsap.timeline({ scrollTrigger: { trigger: rail, start: "center center", end: () => "+=" + dist(),
        pin: rail, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 } });
      tl.to(track, { x: () => -dist(), ease: "none" }, 0);
      $$(".feat__img img", track).forEach((img) => tl.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none" }, 0));
    });
    // On phones the rail is a native swipe carousel (see the 760px media query).
  });

  /* ---------- Back to top ---------- */
  $$("[data-scrolltop]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    AR.lenis ? AR.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" });
  }));
}
