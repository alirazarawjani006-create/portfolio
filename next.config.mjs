// Static export for GitHub Pages: the site is served from /portfolio and keeps
// its original .html URLs (index.html, work.html, contact.html).
const isDev = process.env.NODE_ENV !== "production";
const basePath = isDev ? "" : "/portfolio";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  env: { BASE_PATH: basePath }, // for full-page links that must work from any URL depth (404 page)
  trailingSlash: false,
  reactStrictMode: false, // animation setup runs once per page load, like the original scripts
  images: { unoptimized: true },
  // `next dev` has no .html files, so map the original URLs onto the routes.
  ...(isDev && {
    async rewrites() {
      return [
        { source: "/index.html", destination: "/" },
        { source: "/work.html", destination: "/work" },
        { source: "/contact.html", destination: "/contact" },
      ];
    },
  }),
};

export default nextConfig;
