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
| `npm run optimize:images` | Re-encode `public/` screenshots to resized WebP + rebuild the image manifest |

## Structure

```
app/
  layout.js               shell — fonts, metadata, pre-paint theme/JS flags, motion mounts
  page.js                 home — masthead, selected work, client work, shipped products
  about/page.js           about — intro, portrait, numbered sections, bookshelf
  explorations/page.js    personal tools + side quests
  work/[slug]/page.js     case studies (amalitech, trackpad, video-conferencing, weaver, booking-room)
  opengraph-image.js      generated OG image
  components/             ShushCursor, HeadlineReveal, SmoothScroll, BrowserMock, NdaCard,
                          Bookshelf, PageTransition, ClarityAnalytics, EditLayer, …
  content.json            single source of truth for all copy (+ fallback image dims)
  content.js              thin re-export wrapper over content.json
  globals.css             the design system — :root tokens are canonical
  lib/
    img.js                <img> srcSet/width/height helper, backed by the manifest
    img-manifest.json     generated — image dimensions + WebP variants
    edit.js               data-edit attribute helpers (dev-only, no-ops in a build)
docs/
  STYLE-GUIDE.md          why every design choice exists + how to use it
  content-notes.md        authorial notes on the copy
public/                   images + generated WebP variants, résumé
tools/                    dev-only: content editor (dev-all.mjs, edit-server.mjs)
                          + the image optimizer (optimize-images.mjs)
```

## Content

All copy and screenshot dimensions live in [`app/content.json`](app/content.json) — text is used verbatim, styling and structure live in the components. A dev-only in-browser editor (`npm run edit`) reads and writes that file so copy can be tuned against the live layout. Nothing is fetched at runtime; the shipped site is static.

## Images

`next/image` is off (a static export can't optimize on demand), so the work is done ahead of time. `npm run optimize:images` walks the raster sources in `public/`, writes resized WebP variants beside each one, and emits `app/lib/img-manifest.json`; `imgProps()` turns a manifest entry into `srcSet` + `sizes` + intrinsic `width`/`height`. Sources with no manifest entry fall through to the raw file, so a freshly dropped-in image still renders — it just isn't optimized until you rerun the script. Commit both the variants and the manifest; the build does not regenerate them.

Two rules keep the output sharp:

- **`sizes` describes the layout**, not the breakpoint list — it has to switch where the *column* changes width, or the browser picks a variant for the wrong box and upscales it.
- **Crop at build time, not paint time.** Where a layout shows a different aspect than the file (`object-fit: cover`), give the source an `aspect` entry in the optimizer's `OVERRIDES` so the variants are already cropped. Otherwise the encoder spends its bits on pixels nobody sees and the visible slice gets stretched.

> **Note:** the about-page portrait (`public/bismark.jpg`) is only 800×533, and the 4:5 plate crops that to 426×533 of usable detail. That's sharp at 1× but still short of a 2×/retina 380px plate. Replacing it with a ≥1440×1200 original is the one remaining fix — drop it in, rerun the script, and the wider ladder is picked up automatically.

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
