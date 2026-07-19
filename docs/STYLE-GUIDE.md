# Style Guide

The design system for Bismark Gyau's portfolio. **Risograph / print-editorial** — surgical white stock, two spot inks, heavy poster rules, deliberate misregistration, one orchestrated page-load.

The single source of truth is [`app/globals.css`](../app/globals.css) `:root`. This document explains *why* each choice exists and *how* to use it. When the two disagree, the CSS wins — update this file to match.

> **North star:** nothing may read as generic AI-generated. A hand-set, intentional result is the whole point. If it looks templated, it's wrong. See [The AI-slop ban](#the-ai-slop-ban).

---

## 1. Principles

1. **Print, not app.** Square frames (`border-radius: 0`), 2px ink rules instead of hairlines-everywhere, poster numerals, a single fluoro dot instead of mac traffic-lights. The screen is imitating a screenprinted poster.
2. **Two inks, one surface.** White paper + near-black + exactly two spot colours. No third accent, no gradients.
3. **Misregistration is the signature.** A pink plate slips behind the blue impression — on titles, section numerals, the CTA heading, the route transition. This is *the* recurring move.
4. **Restraint over effect.** Grain is atmosphere at 5% opacity, not a texture. The type scale is deliberately narrow. Motion is one orchestrated wave, not per-element confetti.
5. **Nothing is ever left hidden or muddy.** Every signature interaction is gated on JS + motion-allowed and falls back to the flat print look. No-JS and reduced-motion get a complete, legible site.

---

## 2. Colour

### Tokens (light)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#fcfcfc` | Surgical white surface — the inks pop hardest on it |
| `--paper-2` | `#eeeeee` | Recessed panels / placeholder plates |
| `--ink` | `#141414` | Near-black — headings, rules, borders |
| `--ink-2` | `#2c2b28` | Body text (14:1 on white) |
| `--muted` | `#67645b` | Meta / eyebrows (5.8:1) |
| `--line` | `#dcdcda` | Hairline structure |
| `--line-strong` | `#c3c2bd` | Stronger dividers |
| `--accent` | `#2540c0` | **Federal blue** — text-safe (8:1) |
| `--accent-2` | `#ff4d9a` | **Fluoro pink** — fills only |
| `--accent-2-ink` | `#141414` | Dark text on a pink fill (5.3:1) |
| `--accent-deep` | `#2540c0` | CTA block (constant across themes) |
| `--cream` / `--cream-ink` | `#f4f1ea` / `#141414` | Text/surface on the blue CTA block (theme-invariant) |

### The ink rule — memorise this

- **Federal blue `--accent` is text-safe.** Use it for anything *readable*: emphasis, labels, links, index numerals, the case-study title impression, structure.
- **Fluoro pink `--accent-2` is FILLS-ONLY.** It fails as text on white. Use it for marks, offsets, dots, highlighter swipes, and fills. When text must sit *on* a pink fill, use `--accent-2-ink` (dark), never the other way around.

Never set body copy in pink. Never use blue as a decorative fill where a readable colour is wanted.

### Dark theme

Dark is **true black `#000` stock** (not brownish grey) with warm off-white ink; the inks *glow* like screenprint on black. Blue lightens to `#7d90ff`, pink to `#ff6fb0`, the CTA block brightens to `#3550e0`. Grain flips `multiply → screen` via `--grain-blend`.

**Two selectors carry the identical dark palette and MUST stay in sync** (plain CSS can't share one block across a bare selector and a media query):

1. `:root[data-theme='dark']` — the explicit choice (toggle / stored pref), set before paint by the init script in [`layout.js`](../app/layout.js).
2. `@media (prefers-color-scheme: dark)` on `:root:not([data-theme='light'])` — the no-JS fallback.

Edit **both**. `--accent-deep`, `--cream`, `--cream-ink` are intentionally absent from the dark blocks (constant across themes).

Every value clears WCAG AA on its surface — body ≥9:1, muted meta ≥4.7:1 — in **both** themes. Verify any colour change against both.

---

## 3. Typography

Two families, loaded via `next/font/google` in [`layout.js`](../app/layout.js). **Fraunces and all serifs are removed** — the earlier delicate-serif look was scrapped as an AI-tasteful default.

| Family | Variable | Role |
|---|---|---|
| **Big Shoulders** | `--font-display` | Poster display voice — large, mostly UPPERCASE. Industrial grotesque. |
| **Archivo** | `--font-archivo` | Body + labels, normal + italic. Clean grotesque. |

`h1`–`h3` are display-face, `font-weight: 700`, `line-height: 1`, `text-transform: uppercase`, coloured `--ink`.

### Fluid type scale (narrow by design)

| Token | Clamp | Use |
|---|---|---|
| `--fs-eyebrow` | `0.68rem` | Eyebrows, meta labels (uppercase, tracked `0.12–0.14em`) |
| `--fs-body` | `1rem` | Body (`line-height: 1.55`, `letter-spacing: 0.005em`) |
| `--fs-lead` | `→ 1.14rem` | Lead paragraphs, summaries |
| `--fs-title-sm` | `→ 1.32rem` | Card titles |
| `--fs-title` | `→ 2rem` | Section / hero titles |
| `--fs-display` | `→ 3.15rem` | Display |

Poster headlines use their own larger clamps (e.g. `.lead-headline` up to `5.4rem`, `.work-title` up to `5.6rem`) with `line-height: 0.9–0.92` and constrained `max-width` in `ch`.

### Type rules

- **Big Shoulders is ultra-condensed.** Measure poster headlines in `rem`/`px`, not `ch` — the condensed `0` makes `ch` wildly under-measure (see `.cta-head-wrap`).
- Long leads (e.g. `.about-lead`, ~46 words) set *smaller* with open leading and a wider measure than a two-line poster headline — tight caps at that length merge into an unreadable slab.
- Body measure caps: summaries `52ch`, body copy `58–60ch`.

---

## 4. Layout & spacing

- **Container:** `.wrap` — `max-width: var(--max)` (`1080px`), centred, `padding-inline: var(--gutter)` (`clamp(18px, 4.5vw, 56px)`). Case studies share this one column so page, contact banner, nav and footer align on one edge.
- **Section rhythm:** `.section` = `margin-top: clamp(52px, 8vh, 100px)`. `.section--lead-work` sits tighter so featured work reaches the first screen.
- **Section head:** `.section-head` — baseline-aligned flex, `border-bottom: 2px solid var(--ink)` (heavy poster rule, *not* a hairline), with an index count on the right.
- **Easing:** one shared curve, `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)`. Use it for every transition.
- **Breakpoints:** `860px` (masthead → stack, hero → single column), `820px` (CTA two-col), `900px` (case-study media stacks), `720px` (card grids → single column).

---

## 5. Signature moves

These are the identity. Use them; don't dilute them with new effects.

- **Misregistration.** Blue impression + a fluoro-pink ghost offset a few px, via `::before`/`::after` `content: attr(...)` + `mix-blend-mode: var(--grain-blend)`. On scroll, `--reg-drift` (written by `SmoothScroll` from scroll velocity) widens the slip like paper mis-feeding a press. See `.work-title`, `.work-sec-num`, `.cta-head-echo`, `.pt-label`.
- **Heavy 2px ink rules** on section heads, the masthead spec column, `work-meta`, footer top. Hairlines (`--line`) only for quiet internal dividers.
- **Poster numerals** — big display-face section numbers with a pink offset (`.work-sec-num`, `.idx`, `.work-highlights` leading-zero counters).
- **Single fluoro dot** on browser mockups (`.mock-dot`) — never three mac traffic-lights; dots 2 and 3 are `display: none`.
- **Pink highlighter marker** on the one emphasised headline phrase (`.lead-headline em`, `.about-lead em`) and swiped under card titles on hover (`.title-mark`, animating `background-size`).
- **Paper grain** — a fixed 5%-opacity SVG fractal-noise layer (`body::before`), `mix-blend-mode` flips with theme. Atmosphere so the white isn't sterile; never a visible texture.
- **Colophon footer** with ink-swatch language; blue CTA block; numbered "At a glance" brief + marginalia postscript on case studies (the two callout boxes were deliberately killed).

---

## 6. Components (class vocabulary)

| Cluster | Key classes |
|---|---|
| Shell | `.wrap`, `.site-header` (sticky, auto-hide `.is-hidden`/`.is-pinned`), `.nav`, `.theme-toggle`, `.skip-link`, `.site-footer`, `.scroll-top` |
| Home masthead | `.lead`, `.lead-headline` (+`em`, `.tail`), `.lead-spec`, `.lead-meta`, `.lead-now` + `.localtime`, `.worked-with` |
| Hero (AmaliTech) | `.hero`, `.hero--link`, `.plate`, `.plate--image`, `.p-title--hero`, `.p-desc`, `.meta` (dt/dd) |
| NDA client work | `.clients`, `.nda-card`, `.nda-head`, `.nda-title`, `.nda-role`, `.nda-mark`, `.shush-cursor` |
| Shipped products | `.products`, `.product--link`, `.card-mock` (+`.mock-shot`), `.product-more` |
| Explorations | `.expl`, `.expl-tile(--link)`, `.ideas`, `.idea` + `.idx`, `.idea-tag` |
| Case study | `.work`, `.work-back`, `.work-title`, `.work-meta` (`.is-impact`), `.work-section(--note/--media)`, `.work-sec-num`, `.work-highlights`, `.mock`, `.mock-zoom`, `.lightbox` |
| Contact | `.cta`, `.cta-head(-echo)`, `.cta-btn` (+`-offset`/`-face`), `.cta-resume`, `.cta-elsewhere` |

### NDA cards — specific rules
Text-only, no image frame. Client logo/monogram small and low-contrast, bottom-right (`.nda-mark`, opacity `0.28 → 0.5` on hover). Desktop-only "shush" cursor on hover: the native `cursor` value **must** end `, default`; JS (`ShushCursor`) progressively enhances to the 🤫 emoji follower. `aria-label="work under NDA"`. Subtle — no bounce, no loop. Named-not-shown: the client is named, the pixels never are.

---

## 7. Motion

Stack: **GSAP 3.15 + Lenis 1.3 only.** WebGL / three.js is **deliberately declined** as the top AI-slop signal for an editorial site. Do not add three.js / r3f / particles / shader backgrounds. (At most *one* future riso/letterpress image-hover moment may use OGL, not three.)

Three pieces, all reduced-motion-gated in JS:

- **`SmoothScroll`** — Lenis lerp `0.12` driven off the GSAP ticker, `ScrollTrigger` synced, resets on route change; also writes `--reg-drift` and exposes `window.__lenis`.
- **`HeadlineReveal`** — the near-fold LOAD wave as ONE top-down GSAP timeline: `.lead-headline` masked line-rise **first**, then `.lead-meta`, then `.worked-with`, then `.section--lead-work`. Blocks are staged hidden before paint via `html.gsap-lead` (set in `layout.js`); their own CSS `.reveal` is switched off under `.gsap-lead` so nothing fades in on its own clock ahead of the headline. Failsafe keyframes reveal everything by **2.5s** if JS/fonts stall.
- **`ScrollReveal`** — restrained block reveal via `ScrollTrigger.batch` + `.is-in` (no per-card cascade). Also drives the rule-draw and plate-develop signatures.

**Gating contract:** `html.js` is set before paint so `[data-reveal]` only hides content when JS can also reveal it. Under `prefers-reduced-motion: reduce`, all animation/transition durations collapse to `0.001ms` and staged content is shown flat. **Every new interaction must survive both no-JS and reduced-motion with the full static print look intact.**

---

## 8. Accessibility

- WCAG AA in **both** themes — re-verify contrast on any colour change.
- Focus: `:focus-visible` → `2px solid var(--accent)`, `outline-offset: 3px`.
- Selection: pink fill + `--accent-2-ink` dark text.
- One `<h1>` per page (About/Explorations use their big lead as the h1).
- `.skip-link` to `#main`; keyboard users tabbing into the auto-hiding header always bring it back (`:focus-within`).
- Lightbox is a native `<dialog>` (Esc, focus trap, inert background for free); no-JS opens the raw image.
- Reserve image space with real `width`/`height` (CLS): screenshot dimensions live in `content.json` and pass through `BrowserMock`.

---

## 9. The AI-slop ban

Hard rule from the owner. **Banned:**

- Fonts: Inter, Roboto, Arial, system stacks, Space Grotesk.
- Purple/blue gradients on white; gradient-blob heroes; gradient anything.
- `rounded-2xl` + `shadow-lg` + glow-hover cards; soft app-card aesthetics.
- Emoji / ✨ sprinkles as decoration.
- Centred generic hero layouts.
- Filler copy: "leveraged", "spearheaded", "seamless", "elevate", "in today's fast-paced…".

**Prefer instead:** editorial asymmetry, heavy intentional rules, distinctive display type, generous whitespace, and the misregistration signature. Use provided copy verbatim; facts only ("teams", not "founders"); metrics stay soft — the field near-taboos them.

---

## 10. Adding something new — checklist

1. Two inks only. Blue if it must be read, pink only as a fill/mark.
2. Square frames, 2px ink rules, one fluoro dot — no rounding, no soft shadows-as-style.
3. Display type UPPERCASE; measure poster headlines in `rem`/`px`, body in `ch`.
4. Reuse `--ease`; reuse existing tokens before inventing one.
5. Works flat with no-JS **and** reduced-motion; nothing left hidden.
6. AA-verified in light **and** dark; dark palette edited in **both** sync'd blocks.
7. Doesn't trip any [AI-slop](#the-ai-slop-ban) signal.
8. If it earns a place, it leans into misregistration/print — it doesn't add a new effect vocabulary.
