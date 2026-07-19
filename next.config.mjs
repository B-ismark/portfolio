/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — no server, no CMS. Emits ./out on `next build`.
  output: 'export',
  images: { unoptimized: true },
  // /about -> /about/index.html, keeps relative asset paths happy on any static host.
  trailingSlash: true,
};

export default nextConfig;
