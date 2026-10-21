import { work } from './content';

// Generated at build time for `output: export` (emits /sitemap.xml).
export const dynamic = 'force-static';

const ORIGIN = 'https://bismarkportfolio.vercel.app';

export default function sitemap() {
  const pages = ['/', '/explorations/', '/about/', ...Object.keys(work).map((s) => `/work/${s}/`)];
  return pages.map((path) => ({ url: `${ORIGIN}${path}` }));
}
