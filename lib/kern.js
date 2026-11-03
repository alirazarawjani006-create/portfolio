/* Kerning game: drag the middle letters of a word until the spacing looks even.
   The "ideal" is the font's own kerned layout, measured with a Range on a hidden copy of the word. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WORDS = ["AVATAR", "VECTOR", "KERNING", "LAYOUT", "WAVY", "BRAND", "GLYPH", "PIXEL", "TYPE", "MOTION"];
const ROUNDS = 5;
const VERDICTS = [[95, "Pixel-perfect"], [85, "Sharp eye"], [70, "Nicely done"], [50, "Close — keep tweaking"], [0, "Ouch, mind the gap"]];

export function initKern(AR) {
  const { $, $$, reduce } = AR;
  const root = $("#kern");
  if (!root) return;
  const stage = $(".kern__stage", root);
  const roundEl = $("[data-k-round]", root);
  const scoreEl = $("[data-k-score]", root);
  const bar = $(".kern__bar i", root);
  const checkBtn = $("[data-k-check]", root);
  const nextBtn = $("[data-k-next]", root);
  const resultEl = $(".kern__result", root);
  const resultNum = $(".kern__result b", root);
  const resultTxt = $(".kern__result span", root);

  let words = [], round = 0, total = 0, letters = [], ideal = null, fs = 0, checked = false, wordEl = null;

  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

  function measure(word) {
    const m = document.createElement("span");
    m.className = "kern__measure";
    m.textContent = word;
    stage.appendChild(m);
    fs = parseFloat(getComputedStyle(m).fontSize);
    const base = m.getBoundingClientRect().left;
    const t = m.firstChild, r = document.createRange();
    const xs = [], ws = [];
    for (let i = 0; i < word.length; i++) {
      r.setStart(t, i); r.setEnd(t, i + 1);
      const b = r.getBoundingClientRect();
      xs.push(b.left - base); ws.push(b.width);
    }
    const width = m.getBoundingClientRect().width;
    m.remove();
    return { xs, ws, width };
  }

  const xOf = (L) => ideal.xs[L.i] + L.off * fs;

  function layout(animate) {
    if (!wordEl) return;
    wordEl.style.width = ideal.width + "px";
    letters.forEach((L) => gsap[animate ? "to" : "set"](L.el, { x: xOf(L), duration: 0.5, ease: "power3.out" }));
    $$(".kern__ghost", wordEl).forEach((g, i) => gsap.set(g, { x: ideal.xs[+g.dataset.i] }));
  }

  function scramble(n) {
    // random offsets in em for the movable letters, keeping each letter clear of its neighbours
    // Each letter may close at most ~20% of its neighbour's width, so letters never pile on top of each other.
    const off = new Array(n).fill(0), X = ideal.xs, W = ideal.ws, MAX = 0.24, MIN = 0.06;
    for (let i = 1; i < n - 1; i++) {
      let lo = Math.max(-MAX, (X[i - 1] + off[i - 1] * fs + 0.8 * W[i - 1] - X[i]) / fs);
      let hi = MAX;
      if (i === n - 2) hi = Math.min(hi, (X[n - 1] - 0.8 * W[i] - X[i]) / fs);
      else hi = Math.min(hi, (X[i + 1] + MAX * fs - 0.8 * W[i] - X[i]) / fs);
      if (lo > hi) { off[i] = (lo + hi) / 2; continue; }
      // pick from [lo,hi] but away from zero so every movable letter starts visibly off
      const opts = [[lo, Math.min(hi, -MIN)], [Math.max(lo, MIN), hi]].filter(([a, b]) => b > a);
      const [a, b] = opts.length ? opts[Math.floor(Math.random() * opts.length)] : [lo, hi];
      off[i] = a + Math.random() * (b - a);
    }
    return off;
  }

  function build() {
    const word = words[round];
    checked = false;
    stage.innerHTML = "";
    ideal = measure(word);
    wordEl = document.createElement("div");
    wordEl.className = "kern__word";
    stage.appendChild(wordEl);
    const off = scramble(word.length);
    letters = [...word].map((ch, i) => {
      const fixed = i === 0 || i === word.length - 1;
      const el = document.createElement("span");
      el.className = "kern__l" + (fixed ? " is-fixed" : "");
      el.textContent = ch;
      if (!fixed) {
        el.tabIndex = 0;
        el.setAttribute("role", "slider");
        el.setAttribute("aria-label", `Letter ${ch}, drag or use arrow keys to adjust spacing`);
        el.dataset.cursor = "drag";
      }
      wordEl.appendChild(el);
      return { el, i, ch, fixed, off: off[i] };
    });
    // ghost outline of the ideal spacing, revealed on check
    letters.filter((L) => !L.fixed).forEach((L) => {
      const g = document.createElement("span");
      g.className = "kern__ghost"; g.textContent = L.ch; g.dataset.i = L.i;
      wordEl.prepend(g);
    });
    layout(false);
    letters.forEach(bind);
    roundEl.textContent = `${round + 1}/${ROUNDS}`;
    gsap.to(bar, { scaleX: round / ROUNDS, duration: 0.8, ease: "expo.out" });
    checkBtn.disabled = false;
    nextBtn.hidden = true;
    gsap.to(resultEl, { opacity: 0, y: 10, duration: 0.3 });
    if (!reduce) gsap.from(letters.map((L) => L.el), { yPercent: -120, opacity: 0, rotate: () => gsap.utils.random(-25, 25), duration: 1, ease: "expo.out", stagger: 0.06 });
  }

  function bind(L) {
    if (L.fixed) return;
    const el = L.el;
    const lim = 0.6; // em either side of the ideal
    const clamp = (v) => Math.max(-lim, Math.min(lim, v));
    let sx = 0, so = 0, drag = false;
    el.addEventListener("pointerdown", (e) => {
      if (checked) return;
      drag = true; sx = e.clientX; so = L.off;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-drag");
      gsap.to(el, { y: -8, scale: 1.06, duration: 0.3, ease: "power3.out" });
    });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      L.off = clamp(so + (e.clientX - sx) / fs);
      gsap.to(el, { x: xOf(L), duration: 0.18, ease: "power2.out", overwrite: "auto" });
    });
    const up = () => {
      if (!drag) return;
      drag = false;
      el.classList.remove("is-drag");
      gsap.to(el, { y: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, .5)" });
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", (e) => {
      if (checked || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      const step = (e.shiftKey ? 6 : 1) / fs;
      L.off = clamp(L.off + (e.key === "ArrowLeft" ? -step : step));
      gsap.to(el, { x: xOf(L), duration: 0.2, ease: "power2.out" });
    });
  }

  function check() {
    if (checked) return;
    checked = true;
    checkBtn.disabled = true;
    const movable = letters.filter((L) => !L.fixed);
    const err = movable.reduce((s, L) => s + Math.abs(L.off), 0) / movable.length; // mean error in em
    const score = Math.round(100 * Math.max(0, 1 - err / 0.15));
    total += score;
    const ghosts = $$(".kern__ghost", wordEl);
    const tl = gsap.timeline();
    tl.to(ghosts, { opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" })
      .to(movable.map((L) => L.el), { x: (i) => ideal.xs[movable[i].i], duration: 1.1, ease: "elastic.out(1, .55)", stagger: 0.05 }, "+=0.5")
      .add(() => movable.forEach((L) => (L.off = 0)), "<")
      .to(ghosts, { opacity: 0, duration: 0.6 }, "-=0.4");
    const o = { v: 0 }, t = { v: total - score };
    const last = round + 1 >= ROUNDS;
    resultTxt.textContent = (VERDICTS.find((v) => score >= v[0]) || VERDICTS[4])[1] + (last ? ` · Final ${total}/${ROUNDS * 100}` : "");
    gsap.fromTo(resultEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.3 });
    gsap.to(o, { v: score, duration: 1.4, ease: "expo.out", delay: 0.3, onUpdate: () => (resultNum.textContent = Math.round(o.v)) });
    gsap.to(t, { v: total, duration: 1.4, ease: "expo.out", delay: 0.3, onUpdate: () => (scoreEl.textContent = String(Math.round(t.v)).padStart(3, "0")) });
    gsap.to(bar, { scaleX: (round + 1) / ROUNDS, duration: 0.8, ease: "expo.out" });
    nextBtn.hidden = false;
    nextBtn.firstChild.textContent = last ? "Play again " : "Next word ";
    if (!reduce) gsap.from(nextBtn, { opacity: 0, x: -10, duration: 0.5, delay: 0.6 });
  }

  function next() {
    const els = letters.map((L) => L.el);
    const go = () => {
      round++;
      if (round >= ROUNDS) start();
      else build();
    };
    if (reduce) return go();
    gsap.to(els, { yPercent: 110, opacity: 0, duration: 0.5, ease: "expo.in", stagger: 0.03, onComplete: go });
  }

  function start() {
    words = shuffle(WORDS).slice(0, ROUNDS);
    round = 0; total = 0;
    scoreEl.textContent = "000";
    build();
  }

  checkBtn.addEventListener("click", check);
  nextBtn.addEventListener("click", next);

  let rw = innerWidth;
  addEventListener("resize", () => {
    if (Math.abs(innerWidth - rw) < 2 || !letters.length) return;
    rw = innerWidth;
    ideal = measure(words[round]);
    layout(false);
  });

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    words = shuffle(WORDS).slice(0, ROUNDS);
    // build when the board scrolls into view so the drop-in is seen
    ScrollTrigger.create({ trigger: root, start: "top 75%", once: true, onEnter: () => build() });
  });
}
