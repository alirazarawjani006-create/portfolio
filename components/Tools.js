/* Toolkit: software marks drawn as simple SVG tiles. Greyscale by default, full colour on hover (see .tool in globals.css). */

const Tile = ({ bg, fg, letters }) => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="14" fill={bg} stroke={fg} strokeWidth="2.5" />
    <text x="32" y="42" textAnchor="middle" fontSize="27" fontWeight="700" fill={fg} fontFamily="'Bricolage Grotesque', Arial, sans-serif" letterSpacing="-1">{letters}</text>
  </svg>
);

const Canva = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="g-canva" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#00C4CC" /><stop offset=".55" stopColor="#5A32FA" /><stop offset="1" stopColor="#7D2AE8" /></linearGradient></defs>
    <circle cx="32" cy="32" r="30" fill="url(#g-canva)" />
    <path d="M40.5 23.5c-1.8-2.4-4.4-3.6-7.4-3.6-6.6 0-11.6 5.6-11.6 12.4 0 6.4 4.4 11.4 10.6 11.4 3.6 0 6.6-1.6 8.8-4.4" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
  </svg>
);

const Filmora = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="g-filmora" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1EF2C2" /><stop offset="1" stopColor="#2C6BFF" /></linearGradient></defs>
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#0B1422" />
    <path d="M18 16h28l-8 9H27v6h13l-7 8h-6v9h-9z" fill="url(#g-filmora)" />
  </svg>
);

const Gpt = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#10A37F" />
    <g fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round">
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path key={r} d="M32 18c5 0 8 3.4 8 8v9" transform={`rotate(${r} 32 32)`} />
      ))}
    </g>
  </svg>
);

export const TOOLS = [
  { name: "Photoshop", note: "Retouch · compositing", c: "#31A8FF", icon: <Tile bg="#001E36" fg="#31A8FF" letters="Ps" /> },
  { name: "Illustrator", note: "Logos · vectors", c: "#FF9A00", icon: <Tile bg="#330000" fg="#FF9A00" letters="Ai" /> },
  { name: "After Effects", note: "Motion · logo reveals", c: "#9999FF", icon: <Tile bg="#00005B" fg="#9999FF" letters="Ae" /> },
  { name: "Premiere Pro", note: "Edits · promos", c: "#EA77FF", icon: <Tile bg="#00005B" fg="#EA77FF" letters="Pr" /> },
  { name: "Canva", note: "Quick social sets", c: "#7D2AE8", icon: <Canva /> },
  { name: "Filmora", note: "Reels · TikToks", c: "#1EF2C2", icon: <Filmora /> },
  { name: "ChatGPT", note: "Ideas · AI workflow", c: "#10A37F", icon: <Gpt /> },
];

export function Toolkit() {
  return (
    <div className="toolkit">
      <div className="toolkit__head">
        <span className="mono muted">Toolkit</span>
        <span className="mono muted toolkit__hint">Hover to colour in</span>
      </div>
      <ul className="toolkit__grid" data-reveal="stagger">
        {TOOLS.map((t) => (
          <li key={t.name} className="tool" style={{ "--c": t.c }} data-tilt="">
            <span className="tool__icon">{t.icon}</span>
            <span className="tool__name">{t.name}</span>
            <span className="tool__note mono">{t.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
