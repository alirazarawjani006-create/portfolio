import { WORK } from "../lib/work-data";
import { byId, pick, ratio, pad, HERO_BOARDS, BOARD_DEPTH, FEATURED, BRANDS } from "../lib/helpers";
import { Icon, Curtain, Nav, LayerTag, RoundCta, ContactLinks, FooterBottom } from "../components/Chrome";
import PageScripts from "../components/PageScripts";

export const metadata = {
  title: "Ali Raza — Graphic Designer",
  description: `Ali Raza — Karachi-based graphic designer, digital marketer and video editor. Brand identities, social campaigns, web graphics and reels for ${BRANDS} brands.`,
};

const SERVICES = [
  { peek: "four-secure", title: "Graphic Design", icon: "pen", tools: ["Photoshop", "Illustrator", "Branding", "Print"],
    desc: "Brand identities, logo systems, brand guidelines, social posts, banners, stationery and print — visual assets built for business communication and every digital platform." },
  { peek: "go-green-initiative", title: "Digital Marketing", icon: "chart", tools: ["Content calendars", "Campaigns", "Social media"],
    desc: "Monthly content calendars, campaign creatives, launch teasers and awareness series that support brand identity and keep feeds consistent." },
  { peek: "aqua-tip", title: "Video Editing", icon: "film", tools: ["After Effects", "Filmora", "Reels", "Motion"],
    desc: "Reels, TikToks, logo animations and promo edits — media assets prepared and optimised for social and online use." },
  { peek: "ai-video-lab", title: "AI Tools", icon: "spark", tools: ["AI video", "AI imagery", "Concepting"],
    desc: "Using AI image and video tools to explore concepts, generate visuals and speed up production — without losing the designer’s eye." },
];

const STRENGTHS = [
  ["Creative", "thinking", "Every brief gets a concept first — then the pixels.", "C"],
  ["Attention", "to detail", "Kerning, alignment, export settings — the small things make the work feel finished.", "D"],
  ["Adapt­ability", null, "From cyber-security to kids’ toys — I learn the brand and speak its language.", "A"],
];

const Star = () => <Icon id="star" />;

export default function AboutPage() {
  return (
    <>
      {/* Preloader (first visit only) */}
      <div className="loader" aria-hidden="true">
        <div className="loader__top mono"><span>Ali Raza — Portfolio</span><span>Loading artboard</span></div>
        <div className="loader__frame"><i></i><i></i><i></i><i></i>
          <div className="loader__name"><div className="line-mask"><span>Ali Raza</span></div></div>
          <div className="loader__dims mono">1080 × 1350</div>
        </div>
        <div className="loader__count">000</div>
      </div>
      <Curtain label="Ali Raza" />
      <Nav active="about" />

      <main>
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero__bg" aria-hidden="true"><span className="hero__glow"></span></div>
          <div className="ruler ruler--top" aria-hidden="true"><span className="ruler__mark"></span></div>
          <div className="ruler ruler--left" aria-hidden="true"></div>

          <div className="hero__meta mono">
            <span>Portfolio © <span data-year>2026</span></span>
            <span>Based in Karachi, PK</span>
            <span>Design · Marketing · Motion</span>
            <i className="hero__rule" aria-hidden="true"></i>
          </div>

          <div className="artboards" aria-hidden="true">
            {HERO_BOARDS.map(([id, skip], i) => {
              const b = byId[id], it = pick(b, skip);
              if (!it) return null;
              return (
                <a key={id} className="artboard" href={`work.html#${id}`} data-cursor="View" data-label={b.name} data-depth={BOARD_DEPTH[i]}>
                  <div className="artboard__label"><span>{b.name}</span><span>{ratio(it.w, it.h)}</span></div>
                  <div className="artboard__img"><img src={it.thumb} alt={`${b.name} design`} width={it.w} height={it.h} /></div>
                </a>
              );
            })}
          </div>

          <h1 className="hero__title" aria-label="Ali Raza, graphic designer">
            <span className="row row--1"><span className="line-mask"><span className="hero__word">Ali</span></span>
              <span className="hero__role serif"><span className="sel">graphic designer<span className="sel__box"><i></i><i></i><i></i><i></i><em className="sel__dims">W 3 yrs × H ∞ ideas</em></span></span></span>
            </span>
            <span className="row row--2"><span className="line-mask"><span className="hero__word">Raza</span></span></span>
          </h1>

          <div className="ghost-cursor" aria-hidden="true"><Icon id="cursor" /><span>Ali — designing</span></div>

          <div className="hero__foot">
            <p className="hero__intro" data-hero-fade="">Graphic designer, digital marketer and video editor. I build brand identities, campaigns and reels that people actually stop scrolling for.</p>
            <div className="scroll-cue mono" data-hero-fade=""><span className="scroll-cue__bar"></span>Scroll to explore</div>
          </div>
        </section>

        {/* CLIENT MARQUEE */}
        <div className="marquee" data-speed="0.7" aria-label="Brands I have worked with">
          <div className="marquee__track" id="marquee-a">
            {WORK.map((b) => <span key={b.id} className="marquee__item">{b.name}<Star /></span>)}
          </div>
        </div>
        <div className="marquee marquee--ghost" data-speed="0.5" data-dir="right" aria-hidden="true">
          <div className="marquee__track" id="marquee-b">
            {WORK.map((b) => <span key={b.id} className="marquee__item">{b.industry}<Star /></span>)}
          </div>
        </div>

        {/* STATEMENT */}
        <section className="section wrap" id="about">
          <div className="section-head">
            <LayerTag>Layer 01 — About me</LayerTag>
            <span className="mono muted">Karachi · Pakistan</span>
          </div>
          <p className="statement" data-words="">
            I’m Ali — a creative, adaptable designer who turns ideas into <span className="serif accent">scroll-stopping</span> visuals. For three years I’ve shaped campaigns, identities, websites and reels for brands in cybersecurity, logistics, real estate, fashion, law and beyond — using design, marketing sense and <span className="serif">AI tools</span> to move faster without losing the craft.
          </p>

          <div className="statement__aside">
            <div className="portrait-card" data-reveal="fade">
              <div className="portrait-card__mono"><span>AR</span></div>
              <dl>
                <dt>Name</dt><dd>Ali Raza</dd>
                <dt>Role</dt><dd>Graphic Designer</dd>
                <dt>Based</dt><dd>Garden East, Karachi</dd>
                <dt>Studio</dt><dd>Four Secure</dd>
              </dl>
            </div>
            <div className="stats" data-reveal="stagger">
              <div className="stat"><div className="stat__num"><span data-count="3">0</span><sup>yrs</sup></div><p>Professional experience as an in-house graphic designer.</p></div>
              <div className="stat"><div className="stat__num"><span data-count={BRANDS}>0</span><sup>+</sup></div><p>Brands designed for, from start-ups to established firms.</p></div>
              <div className="stat"><div className="stat__num"><span data-count="2300">0</span><sup>+</sup></div><p>Exported posts, banners, logos and video edits delivered.</p></div>
              <div className="stat"><div className="stat__num"><span data-count="4">0</span><sup>in 1</sup></div><p>Design, marketing, video and AI — under one roof.</p></div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section wrap" id="skills">
          <div className="section-head">
            <h2 className="h2" data-reveal="lines"><span className="line-mask"><span>What I</span></span><span className="line-mask"><span><span className="serif">bring</span> to the table</span></span></h2>
            <LayerTag>Layer 02 — Core skills</LayerTag>
          </div>
          <div className="services" data-reveal="stagger">
            {SERVICES.map((s, i) => {
              const peek = pick(byId[s.peek], 2);
              return (
                <div key={s.title} className="service" data-peek={s.peek}>
                  <span className="service__no">/{pad(i + 1)}</span>
                  <h3 className="service__title">{s.title}</h3>
                  <div className="service__desc">{s.desc}
                    <div className="service__tools">{s.tools.map((t) => <span key={t}>{t}</span>)}</div></div>
                  <span className="service__icon"><Icon id={s.icon} /></span>
                  <span className="service__peek">{peek && <img src={peek.thumb} alt="" loading="lazy" />}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* EXPERIENCE + EDUCATION */}
        <section className="section wrap" id="experience">
          <div className="section-head">
            <h2 className="h2" data-reveal="lines"><span className="line-mask"><span>Experience &amp;</span></span><span className="line-mask"><span className="serif">education</span></span></h2>
            <LayerTag>Layer 03 — Timeline</LayerTag>
          </div>
          <div className="timeline">
            <div className="tl-col" data-reveal="fade">
              <h3 className="mono muted">Work</h3>
              <div className="tl-item">
                <div className="tl-item__top"><h4>Graphic Designer — Four Secure</h4><span className="mono accent">3 years</span></div>
                <ul>
                  <li>Create graphics and visual assets for business communication and digital platforms.</li>
                  <li>Design creative content for digital marketing campaigns and brand identity.</li>
                  <li>Edit videos and prepare media assets for social media and online use.</li>
                  <li>Use AI tools to assist creative tasks and improve workflow efficiency.</li>
                </ul>
              </div>
            </div>
            <div className="tl-col" data-reveal="fade" data-delay="0.15">
              <h3 className="mono muted">Education</h3>
              <div className="tl-item">
                <div className="tl-item__top"><h4>Intermediate in Commerce</h4><span className="mono muted">I.Com</span></div>
                <ul><li>Commerce</li></ul>
              </div>
              <div className="tl-item">
                <div className="tl-item__top"><h4>Matriculation</h4><span className="mono muted">Computer Science</span></div>
                <ul><li>Computer Science</li></ul>
              </div>
              <div style={{ marginTop: 32 }}><a className="btn" href="assets/files/Ali-Raza-CV.pdf" download data-magnetic="0.2">Download CV <Icon id="arrow" /></a></div>
            </div>
          </div>
        </section>

        {/* STRENGTHS */}
        <section className="section wrap" id="strengths" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <LayerTag>Layer 04 — Strengths</LayerTag>
          </div>
          <div className="strengths" data-reveal="stagger">
            {STRENGTHS.map(([a, b, p, g], i) => (
              <div key={g} className="strength"><span className="mono accent">{pad(i + 1)}</span>
                <div><h3>{a}{b && <><br />{b}</>}</h3><p>{p}</p></div>
                <span className="strength__glyph">{g}</span></div>
            ))}
          </div>
        </section>

        {/* FEATURED (horizontal) */}
        <section className="section" id="featured" style={{ paddingBottom: "clamp(60px,8vw,120px)" }}>
          <div className="section-head wrap">
            <h2 className="h2" data-reveal="lines"><span className="line-mask"><span>Selected</span></span><span className="line-mask"><span className="serif">work</span></span></h2>
            <a className="btn" href="work.html" data-magnetic="0.2">All {BRANDS} brands <Icon id="arrow" /></a>
          </div>
          <div className="hscroll">
            <div className="hscroll__track" id="featured-track">
              {FEATURED.map((id, i) => {
                const b = byId[id], it = pick(b, 1);
                if (!b || !it) return null;
                return (
                  <a key={id} className="feat" href={`work.html#${id}`} data-cursor="Open" data-label={b.name}>
                    <span className="feat__no mono">{pad(i + 1)} / {b.tags[0]}</span>
                    <div className="feat__img"><img src={it.thumb} alt={`${b.name} — ${b.industry}`} loading="lazy" /></div>
                    <div className="feat__meta"><h3>{b.name}</h3><span className="mono muted">{b.industry}</span></div>
                  </a>
                );
              })}
              <div className="feat feat--end"><a href="work.html" data-label="Work"><span className="mono accent">{BRANDS} brands</span>See all<br />work →</a></div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER CTA */}
      <footer className="footer">
        <div className="footer__cta">
          <LayerTag>Final layer — Let’s talk</LayerTag>
          <h2 className="footer__big" data-reveal="lines"><span className="line-mask"><span>Got a brand</span></span><span className="line-mask"><span>to <span className="serif">build?</span></span></span></h2>
          <div className="footer__row">
            <ContactLinks />
            <RoundCta href="contact.html" label="Contact" ring="START A PROJECT ✦ START A PROJECT ✦ START A PROJECT ✦ ">Say<br />hello →</RoundCta>
          </div>
        </div>
        <FooterBottom><a href="#top" data-scrolltop="">Back to top ↑</a></FooterBottom>
      </footer>

      <PageScripts page="about" />
    </>
  );
}
