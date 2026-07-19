# Bismark Gyau — Portfolio

Product-design portfolio for [Bismark Gyau](https://www.linkedin.com/in/bismark-gyau) — product designer, Ghana; currently UI/UX designer at AmaliTech.

A **risograph / print-editorial** site: surgical white stock, two spot inks, heavy poster rules, deliberate misregistration, one orchestrated page-load. Built to read as hand-set — never templated. The full rationale lives in [`docs/STYLE-GUIDE.md`](docs/STYLE-GUIDE.md).

## Stack

- **[Next.js 16](https://nextjs.org)** App Router, **fully static export** (`output: 'export'` → `./out`). No server, no CMS.
- **React 19**
- **[GSAP 3.15](https://gsap.com)** + **[Lenis 1.3](https://github.com/darkroomengineering/lenis)** for motion and smooth scroll — the *only* animation stack. WebGL / three.js is deliberately declined.
- **[playwright-core](https://playwright.dev)** (dev only) for the in-browser content editor tooling.

## Quick start

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

Build the static site and preview the real output:

```bash
npm run build      # emits ./out
npm run preview    # serves ./out via `npx serve`
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Static export to `./out` |
| `npm run preview` | Serve the built `./out` |
| `npm run edit` | Dev server + content-edit server together (`tools/dev-all.mjs`) |
| `npm run edit-server` | Content-edit server only (`tools/edit-server.mjs`) |

## Structure

```
app/
  page.js                 home — masthead, selected work, client work, shipped products
  about/page.js           about
  explorations/page.js    personal tools + side quests
  work/[slug]/page.js     case studies (amalitech, trackpad, video-conferencing, weaver, booking-room)
  components/             ShushCursor, HeadlineReveal, SmoothScroll, BrowserMock, NdaCard, …
  content.json            single source of truth for all copy + image dimensions
  content.js              thin re-export wrapper over content.json
  globals.css             the design system — :root tokens are canonical
docs/
  STYLE-GUIDE.md          why every design choice exists + how to use it
  content-notes.md        authorial notes on the copy
public/                   images, résumé, cursor asset
tools/                    dev-only content editor (dev-all.mjs, edit-server.mjs)
```

## Content

All copy and screenshot dimensions live in [`app/content.json`](app/content.json) — text is used verbatim, styling and structure live in the components. A dev-only in-browser editor (`npm run edit`) reads and writes that file so copy can be tuned against the live layout. Nothing is fetched at runtime; the shipped site is static.

## Design system, in one breath

- **Two inks, one surface.** White paper + near-black + exactly two spots: federal blue `#2540c0` (text-safe) and fluoro pink `#ff4d9a` (fills only). No third accent, no gradients.
- **Misregistration is the signature** — a pink plate slips behind the blue impression on titles, numerals, the CTA and route transitions, widening with scroll velocity.
- **Type:** Big Shoulders (poster display, uppercase) + Archivo (body). No Inter / Roboto / system stacks.
- **Light + dark**, both WCAG AA verified. Dark is true-black stock where the inks glow like screenprint.
- **Progressive enhancement:** every signature interaction is gated on JS + motion-allowed and falls back to a complete, legible flat print look. No-JS and `prefers-reduced-motion` get the full static site.

See [`docs/STYLE-GUIDE.md`](docs/STYLE-GUIDE.md) for tokens, component vocabulary, motion contract, accessibility, and the checklist for adding anything new.

## Deployment

Static export — host `./out` on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, plain S3). `trailingSlash: true` keeps relative asset paths correct on any host. No build-time secrets, no runtime services.

---

© 2026 Bismark Gyau
