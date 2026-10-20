/* Small helpers shared by the page markup and the page scripts */
import { WORK } from "./work-data";

export const byId = Object.fromEntries(WORK.map((b) => [b.id, b]));

export const pad = (n, l = 2) => String(n).padStart(l, "0");

// A portrait-ish image from a brand, used for cards and previews.
export const pick = (brand, skip = 0) => {
  if (!brand) return null;
  const imgs = brand.items.filter((i) => i.type === "img");
  const tall = imgs.filter((i) => i.h / i.w >= 1 && i.h / i.w <= 1.6);
  return (tall[skip] || tall[0] || imgs[skip] || imgs[0]) || null;
};

export const ratio = (w, h, extra = []) => {
  const r = w / h;
  const known = [[1, "1:1"], [0.8, "4:5"], [0.5625, "9:16"], [1.7778, "16:9"], [0.7071, "A4"], [1.4142, "A4 ↔"], ...extra];
  let best = known[0];
  known.forEach((k) => { if (Math.abs(k[0] - r) < Math.abs(best[0] - r)) best = k; });
  return best[1];
};

export const TAGS = ["Branding", "Social Media", "Web", "Print", "Motion"];
export const TOTAL = WORK.reduce((s, b) => s + b.items.length, 0);

// About page content
export const HERO_BOARDS = [["four-secure", 3], ["go-green-initiative", 4], ["wall-street-properties", 1], ["aqua-tip", 0]];
export const BOARD_DEPTH = [0.6, 1.1, 0.4, 0.8];
export const FEATURED = ["four-secure", "wall-street-properties", "go-green-initiative", "aqua-tip", "find-sayarat", "mango-press", "the-arrow", "nature-hills", "bacha-planet"];
