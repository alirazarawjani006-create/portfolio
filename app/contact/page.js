import { Fragment } from "react";
import { Icon, Curtain, Nav, LayerTag, RoundCta, FooterBottom } from "../../components/Chrome";
import PageScripts from "../../components/PageScripts";
import { BRANDS } from "../../lib/helpers";

export const metadata = {
  title: "Contact — Ali Raza",
  description: "Get in touch with Ali Raza — graphic designer, digital marketer and video editor based in Karachi.",
};

const MARQUEE = ["Brand identity", "Social media", "Reels & video", "Website graphics", "Print & packaging", "Campaigns"];
const NEEDS = ["Brand identity", "Social media", "Video editing", "Website graphics", "Print", "Something else"];

const CopyBtn = ({ value, msg, label }) => (
  <button className="icon-btn" data-copy={value} data-copy-msg={msg} aria-label={label}><Icon id="copy" /></button>
);
const Go = ({ icon = "arrow" }) => <span className="icon-btn icon-btn--go"><Icon id={icon} /></span>;

export default function ContactPage() {
  return (
    <>
      <Curtain label="Contact" />
      <Nav active="contact" />

      <main>
        <section className="contact-hero">
          <LayerTag className="layer-tag ct-fade" style={{ marginBottom: 28 }}>Artboard 03 — Contact</LayerTag>
          <h1 className="contact-hero__title">
            <span className="line-mask"><span className="ct-line">Have a project</span></span>
            <span className="line-mask"><span className="ct-line">in mind? <span className="serif">Let’s talk.</span></span></span>
          </h1>
        </section>

        <div className="marquee" data-speed="0.8" style={{ marginTop: "clamp(48px,7vw,100px)" }} aria-hidden="true">
          <div className="marquee__track">
            {MARQUEE.map((m) => <span key={m} className="marquee__item">{m}<Icon id="star" /></span>)}
          </div>
        </div>

        <section className="contact-grid">
          <div>
            <div className="channels" data-reveal="stagger">
              <a className="channel" href="mailto:alirazarawjani006@gmail.com">
                <span className="mono muted">Email</span>
                <span className="channel__value">alirazarawjani006@gmail.com</span>
                <span className="channel__act"><CopyBtn value="alirazarawjani006@gmail.com" msg="Email copied" label="Copy email" /><Go /></span>
              </a>
              <a className="channel" href="tel:+923190006224">
                <span className="mono muted">Phone</span>
                <span className="channel__value">+92 319 0006224</span>
                <span className="channel__act"><CopyBtn value="+923190006224" msg="Number copied" label="Copy phone number" /><Go /></span>
              </a>
              <a className="channel" href="https://wa.me/923190006224" target="_blank" rel="noopener">
                <span className="mono muted">WhatsApp</span>
                <span className="channel__value">Message on WhatsApp</span>
                <span className="channel__act"><Go icon="wa" /></span>
              </a>
              <a className="channel" href="https://www.google.com/maps/search/?api=1&query=Soldier+Bazaar+Garden+East+Karachi" target="_blank" rel="noopener">
                <span className="mono muted">Studio</span>
                <span className="channel__value">Soldier Bazaar, Garden East, Karachi</span>
                <span className="channel__act"><Go icon="pin" /></span>
              </a>
            </div>

            <div className="info-cards" data-reveal="stagger">
              <div className="info-card"><span className="mono muted">Local time · PKT</span><strong data-clock>00:00:00</strong></div>
              <a className="info-card" href="assets/files/Ali-Raza-CV.pdf" download data-cursor="Save"><span className="mono muted">Curriculum vitae</span><strong style={{ display: "flex", alignItems: "center", gap: 10 }}>Download CV <Icon id="down" width="26" height="26" /></strong></a>
            </div>
          </div>

          <form className="form" id="contact-form" noValidate data-reveal="fade">
            <div className="form__head">
              <h2>Start a project</h2>
              <span className="mono muted">Fields marked * are required</span>
            </div>
            <div className="field">
              <input id="f-name" name="name" type="text" placeholder=" " autoComplete="name" required />
              <label htmlFor="f-name">Your name *</label><span className="field__bar"></span>
              <span className="field__err">Please tell me your name.</span>
            </div>
            <div className="field">
              <input id="f-email" name="email" type="email" placeholder=" " autoComplete="email" required />
              <label htmlFor="f-email">Email address *</label><span className="field__bar"></span>
              <span className="field__err">Please enter a valid email address.</span>
            </div>
            <div className="field">
              <input id="f-company" name="company" type="text" placeholder=" " autoComplete="organization" />
              <label htmlFor="f-company">Brand / company</label><span className="field__bar"></span>
            </div>
            <fieldset className="pick" style={{ border: 0 }}>
              <legend className="mono muted" style={{ marginBottom: 12 }}>I need help with</legend>
              <div className="pick__opts">
                {NEEDS.map((n, i) => (
                  <Fragment key={n}>
                    <input type="checkbox" id={`p${i + 1}`} name="need" value={n} /><label htmlFor={`p${i + 1}`}>{n}</label>
                  </Fragment>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <textarea id="f-msg" name="message" placeholder=" " rows="4" required></textarea>
              <label htmlFor="f-msg">Tell me about the project *</label><span className="field__bar"></span>
              <span className="field__err">A few words about the project, please.</span>
            </div>
            <div className="form__foot">
              <p className="form__note">Sending opens your email app with everything filled in — nothing is stored on this site.</p>
              <button className="btn btn--solid" type="submit" data-magnetic="0.25">Send message <Icon id="arrow" /></button>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer" style={{ paddingTop: "clamp(40px,6vw,80px)" }}>
        <div className="footer__cta">
          <h2 className="footer__big" data-reveal="lines"><span className="line-mask"><span>Rather <span className="serif">browse</span></span></span><span className="line-mask"><span>first?</span></span></h2>
          <div className="footer__row">
            <div className="footer__links">
              <a href="index.html">About me</a>
              <a href="work.html">See the work</a>
            </div>
            <RoundCta href="work.html" label="Work" ring={`${BRANDS} BRANDS ✦ SELECTED WORK ✦ ${BRANDS} BRANDS ✦ SELECTED WORK ✦ `}>View<br />work →</RoundCta>
          </div>
        </div>
        <FooterBottom><a href="index.html">About ↗</a></FooterBottom>
      </footer>

      <PageScripts page="contact" />
    </>
  );
}
