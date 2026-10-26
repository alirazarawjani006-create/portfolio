/* About page: hero choreography, artboards, statement scrub, stats, featured rail */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initAbout(AR) {
  const { $, $$, reduce, fine } = AR;
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

  if (!reduce) {
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
    if (reduce) {
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
        // keep the name tag on screen near the right edge
        ghost.classList.toggle("is-flip", p.x > hero.clientWidth - 150);
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
}
