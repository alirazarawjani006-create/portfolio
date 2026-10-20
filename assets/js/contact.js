/* Contact page: intro + mailto form with validation */
(function () {
  const { $, $$, reduce } = AR;
  const hasGsap = typeof gsap !== "undefined";
  const EMAIL = "alirazarawjani006@gmail.com";

  if (hasGsap && !reduce) {
    gsap.set(".ct-line", { yPercent: 110 });
    gsap.set(".ct-fade", { opacity: 0, y: 20 });
  }
  AR.onReady(() => {
    if (!hasGsap || reduce) return;
    gsap.timeline()
      .to(".ct-fade", { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" })
      .to(".ct-line", { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.12 }, 0.1);
  });

  // Copy buttons sit inside channel links — don't follow the link when copying.
  $$(".channel [data-copy]").forEach((b) => b.addEventListener("click", (e) => e.stopPropagation()));

  const form = $("#contact-form");
  const fields = {
    name: { el: $("#f-name"), ok: (v) => v.trim().length > 1 },
    email: { el: $("#f-email"), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    message: { el: $("#f-msg"), ok: (v) => v.trim().length > 4 },
  };
  Object.values(fields).forEach((f) => f.el.addEventListener("input", () => {
    if (f.el.parentElement.classList.contains("is-error") && f.ok(f.el.value)) f.el.parentElement.classList.remove("is-error");
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    Object.values(fields).forEach((f) => {
      const bad = !f.ok(f.el.value);
      f.el.parentElement.classList.toggle("is-error", bad);
      if (bad && !first) first = f.el;
    });
    if (first) {
      first.focus();
      if (hasGsap && !reduce) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      return;
    }
    const name = fields.name.el.value.trim();
    const company = $("#f-company").value.trim();
    const needs = $$('input[name="need"]:checked', form).map((c) => c.value);
    const subject = `Project enquiry from ${name}${company ? " — " + company : ""}`;
    const body = [
      `Hi Ali,`, ``, fields.message.el.value.trim(), ``,
      needs.length ? `Looking for: ${needs.join(", ")}` : null,
      `Name: ${name}`, `Email: ${fields.email.el.value.trim()}`, company ? `Brand / company: ${company}` : null,
    ].filter((l) => l !== null).join("\n");
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    AR.toast("Opening your email app…");
  });
})();
