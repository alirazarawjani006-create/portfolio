import { WORK } from "../../lib/work-data";
import { pad, TAGS, TOTAL, BRANDS } from "../../lib/helpers";
import { Icon, Curtain, Nav, LayerTag, RoundCta, ContactLinks, FooterBottom } from "../../components/Chrome";
import PageScripts from "../../components/PageScripts";

export const metadata = {
  title: "Work — Ali Raza",
  description: `Selected work by Ali Raza — brand identities, social media campaigns, web graphics, print and video for ${BRANDS} brands.`,
};

export default function WorkPage() {
  return (
    <>
      <Curtain label="Work" />
      <Nav active="work" />

      <main>
        <section className="page-hero">
          <h1 className="page-hero__title"><span className="line-mask"><span className="ph-word">Work</span></span><sup id="count-total">({pad(TOTAL, 3)})</sup></h1>
          <div className="page-hero__row">
            <p className="page-hero__lede ph-fade">Three years of identities, campaigns, web graphics, print and reels — for {BRANDS} brands across cybersecurity, logistics, real estate, retail, fashion, law and more. Pick a brand from the index, or switch to the canvas and drag around everything at once.</p>
            <LayerTag className="layer-tag ph-fade">Artboard 02 — Portfolio</LayerTag>
          </div>
        </section>

        <div className="toolbar">
          <div className="filters" role="toolbar" aria-label="Filter by discipline" id="filters">
            {["All", ...TAGS].map((t) => {
              const n = t === "All" ? WORK.length : WORK.filter((b) => b.tags.includes(t)).length;
              return <button key={t} className={`chip${t === "All" ? " is-active" : ""}`} data-filter={t} aria-pressed={t === "All"}>{t} <small>{pad(n)}</small></button>;
            })}
          </div>
          <div className="viewtoggle" role="tablist" aria-label="View">
            <span className="viewtoggle__pill" aria-hidden="true"></span>
            <button role="tab" aria-selected="true" className="is-active" data-view="index"><Icon id="list" />Index</button>
            <button role="tab" aria-selected="false" data-view="canvas"><Icon id="canvas" />Canvas</button>
          </div>
        </div>

        <section className="index" id="index" aria-label="Brand index">
          <div className="index__head mono"><span>No.</span><span>Brand</span><span>Industry</span><span>Disciplines</span><span style={{ textAlign: "right" }}>Pieces</span></div>
          <div id="rows">
            {WORK.map((b, i) => (
              <button key={b.id} className="brand-row" data-id={b.id} data-cursor="Open">
                <span className="brand-row__no">{pad(i + 1)}</span>
                <span className="brand-row__name">{b.name}</span>
                <span className="brand-row__ind">{b.industry}</span>
                <span className="brand-row__tags">{b.tags.map((t) => <span key={t}>{t}</span>)}</span>
                <span className="brand-row__count">{pad(b.items.length)} <Icon id="arrow" width="16" height="16" /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="canvas" id="canvas" hidden aria-label="Draggable canvas of all work" data-cursor="drag">
          <div className="canvas__board" id="board"></div>
          <div className="minimap" aria-hidden="true"><div id="mini"></div><b id="mini-view"></b></div>
          <div className="canvas__hud mono">
            <span id="canvas-hint">Drag to explore · Click to open</span>
            <button id="canvas-center">Re-center ⌖</button>
          </div>
        </section>
      </main>

      <div className="peek" aria-hidden="true"><div className="peek__inner"></div><span className="sel__box"><i></i><i></i><i></i><i></i><em className="sel__dims"></em></span></div>

      {/* Case overlay */}
      <div className="case" id="case" role="dialog" aria-modal="true" aria-labelledby="case-title">
        <div className="case__bar">
          <LayerTag id="case-layer"><span></span></LayerTag>
          <button className="case__close" id="case-close"><Icon id="close" />Close <span className="mono muted">Esc</span></button>
        </div>
        <div className="case__head">
          <h2 className="case__title" id="case-title"></h2>
          <div className="case__info">
            <p id="case-desc"></p>
            <dl className="case__facts mono">
              <div><dt className="muted">Industry</dt><dd id="case-ind"></dd></div>
              <div><dt className="muted">Scope</dt><dd id="case-tags"></dd></div>
              <div><dt className="muted">Pieces</dt><dd id="case-count"></dd></div>
            </dl>
          </div>
        </div>
        <div className="masonry" id="case-grid"></div>
        <button className="case__next" id="case-next"><span><span className="mono muted">Next brand</span><strong></strong></span><span className="round-cta" style={{ width: 110, fontSize: 13 }}>Next →</span></button>
      </div>

      {/* Lightbox */}
      <div className="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
        <div className="lightbox__top">
          <span className="mono" id="lb-title"></span>
          <button className="lb-btn" id="lb-close" aria-label="Close"><Icon id="close" /></button>
        </div>
        <div className="lightbox__stage" id="lb-stage">
          <button className="lb-btn lightbox__prev" id="lb-prev" aria-label="Previous"><Icon id="prev" /></button>
          <button className="lb-btn lightbox__next" id="lb-next" aria-label="Next"><Icon id="arrow" /></button>
        </div>
        <div className="lightbox__bottom">
          <span className="mono muted" id="lb-count"></span>
          <div className="lightbox__thumbs" id="lb-thumbs"></div>
          <span className="mono muted">← → to browse</span>
        </div>
      </div>

      <footer className="footer" style={{ paddingTop: "clamp(60px,9vw,120px)" }}>
        <div className="footer__cta">
          <h2 className="footer__big" data-reveal="lines"><span className="line-mask"><span>Like what</span></span><span className="line-mask"><span>you <span className="serif">see?</span></span></span></h2>
          <div className="footer__row">
            <ContactLinks />
            <RoundCta href="contact.html" label="Contact" ring="START A PROJECT ✦ START A PROJECT ✦ START A PROJECT ✦ ">Say<br />hello →</RoundCta>
          </div>
        </div>
        <FooterBottom><a href="index.html">About ↗</a></FooterBottom>
      </footer>

      <PageScripts page="work" />
    </>
  );
}
