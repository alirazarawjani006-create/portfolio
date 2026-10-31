/* Markup shared by every page: icon sprite, backdrop layers, curtain, nav, footer bits */

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export function Icons() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" {...stroke} /></symbol>
      <symbol id="i-prev" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" {...stroke} /></symbol>
      <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" fill="currentColor" /></symbol>
      <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" fill="currentColor" /></symbol>
      <symbol id="i-cursor" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="currentColor" stroke="#0a0a0b" strokeWidth="1.2" strokeLinejoin="round" /></symbol>
      <symbol id="i-pen" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.6 7.6M11 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></symbol>
      <symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 21h18M6 17V11M11 17V6M16 17v-4M21 3l-6 6-4-3-8 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
      <symbol id="i-film" viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></symbol>
      <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></symbol>
      <symbol id="i-layer" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
      <symbol id="i-canvas" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="3" width="7" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="13" width="7" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="3" y="16" width="7" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" /></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" strokeWidth="1.6" /></symbol>
      <symbol id="i-wa" viewBox="0 0 24 24"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-1-.4-2.2-1.6-2.6-2.6l.8-1-1-2z" fill="currentColor" /></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></symbol>
      <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 4v13M6 11l6 6 6-6M5 20h14" {...stroke} /></symbol>
    </svg>
  );
}

export const Icon = ({ id, ...rest }) => <svg {...rest}><use href={`#i-${id}`} /></svg>;

export function Backdrop() {
  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className="dotgrid" aria-hidden="true"></div>
      <div className="progress" aria-hidden="true"></div>
    </>
  );
}

export function Curtain({ label }) {
  return <div className="curtain" aria-hidden="true"><span className="curtain__label">{label}</span></div>;
}

const LINKS = [["about", "index.html", "About", "01"], ["work", "work.html", "Work", "02"], ["contact", "contact.html", "Contact", "03"]];

export function Nav({ active }) {
  return (
    <>
      <header className="nav">
        <a href="index.html" className="brandmark" data-label="About" aria-label="Ali Raza — home">
          <span className="brandmark__sq">AR</span>
          <span>Ali Raza<small>Graphic Designer</small></span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(([key, href, label, no]) => (
            <a key={key} href={href} className={`nav__link${key === active ? " is-active" : ""}`} aria-current={key === active ? "page" : undefined}>
              {label} <sup>{no}</sup>
            </a>
          ))}
        </nav>
        <div className="status mono"><span className="status__dot"></span>Open to projects</div>
        <button className="nav__burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
      </header>
      <div className="mobile-menu">
        <div>
          {LINKS.map(([key, href, label, no]) => (
            <a key={key} className="big" href={href}><sup>{no}</sup>{label}</a>
          ))}
        </div>
        <div className="mono muted">alirazarawjani006@gmail.com<br />0319 0006224</div>
      </div>
    </>
  );
}

export function LayerTag({ children, ...rest }) {
  return <span className="layer-tag" {...rest}><Icon id="layer" />{children}</span>;
}

export function RoundCta({ href, label, ring, children }) {
  return (
    <a className="round-cta" href={href} data-magnetic="0.4" data-label={label}>
      <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs><path id="circ" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" /></defs>
        <text fontFamily="JetBrains Mono" fontSize="11" letterSpacing="4" fill="currentColor"><textPath href="#circ">{ring}</textPath></text>
      </svg>
      {children}
    </a>
  );
}

export function ContactLinks() {
  return (
    <div className="footer__links">
      <a href="mailto:alirazarawjani006@gmail.com">alirazarawjani006@gmail.com</a>
      <a href="tel:+923190006224">+92 319 0006224</a>
    </div>
  );
}

export function FooterBottom({ children }) {
  return (
    <div className="footer__bottom mono">
      <span>© <span data-year>2026</span> Ali Raza</span>
      <span>Karachi, Pakistan</span>
      {children}
    </div>
  );
}
