import { Icon, LayerTag } from "../components/Chrome";

export const metadata = { title: "Page not found — Ali Raza" };

// GitHub Pages serves this for any missing URL, so links are absolute (with the base path).
const BASE = process.env.BASE_PATH;
export default function NotFound() {
  return (
    <main className="page-hero" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <LayerTag style={{ marginBottom: 28, alignSelf: "flex-start" }}>Artboard 404 — Missing layer</LayerTag>
      <h1 className="page-hero__title">404</h1>
      <div className="page-hero__row">
        <p className="page-hero__lede">This page doesn’t exist — it may have moved, or the link has a typo.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn" href={`${BASE}/index.html`}>About me <Icon id="arrow" /></a>
          <a className="btn btn--solid" href={`${BASE}/work.html`}>See the work <Icon id="arrow" /></a>
        </div>
      </div>
    </main>
  );
}
