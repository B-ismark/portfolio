# To do

Open items from the October 2026 portfolio audit. The quick fixes (accessibility,
navigation, security headers, dependency updates, copy typos) already shipped;
what's left here needs source material or a decision.

## Case studies

- [ ] **Deutsche Telekom case study, told without the pixels.** The most senior,
      most recognisable work is currently a text-only NDA card. Tell the problem,
      the role, the process and the outcome in words; use blurred screens or
      redrawn diagrams instead of real UI.
- [ ] **Show the thinking, not just the final screens.** Every case study shows
      only polished UI. Add process artefacts: sketches, research notes, journey
      maps, wireframes, options that were rejected, before/after.
- [ ] **Back the impact numbers.** "+15% time on site" and "~30% faster to book"
      need a measure and a baseline (how, compared with what, over what period).
      Record the source in `content-notes.md`.
- [ ] **Add one or two testimonials** from a PM, engineer or fellow designer.
- [ ] **Decide the positioning.** Most case studies are solo design-and-build;
      choose whether the site tells a product-designer or a design-engineer story
      and edit the case-study order and copy to match.

## Copy

- [ ] Pair the hero line with one concrete proof point (years, product types,
      scale).
- [ ] Add an availability line to the contact banner ("Open to … from …").

## Privacy

- [ ] **Clarity consent.** Session recording starts without asking. Either add a
      consent banner that gates `boot()` in `app/components/Analytics.js`, or
      turn Clarity off. Umami is cookieless and needs no banner.

## How to check (see the audit for the full plan)

- 5-second test and task test with 5 reviewers (2 designers, 2 recruiters, 1 PM).
- Design-lead read-through: score each case study 1–5 on problem, process,
  decisions and outcome; aim for ≥3 on process.
- Re-run the axe scan on all pages, light and dark, after content changes.
- securityheaders.com / Mozilla Observatory on the live URL after deploy.
