# Content notes

Authorial notes for `app/content.json`. These used to be inline comments in
`app/content.js`; they moved here when the data was split into JSON so the
in-browser editor could round-trip it. JSON can't hold comments — this file
carries the intent instead.

## hero

- `impact` metric is real, from the résumé: "15% increase in time spent on site".
- `image` is a real photo from the live AmaliTech site (the site Bismark rebuilt).

## about

- **Don't reintroduce claims of hand-writing code.** `sections[0]` used to end
  "and often the build itself when a project calls for it" and `sections[1]`
  "I design in Figma and build in the browser when it helps the idea land". The
  build work is AI-assisted, so both were deliberately softened to talk about
  *working prototypes* — the products really do get shipped, which is the part
  worth claiming, but neither line should imply framework fluency. The résumé
  (`tools/resume/build.mjs`) makes the same distinction: it lists no frameworks
  under Skills.
- Case-study `Role: Design & build` and `Stack:` values are a **different
  register and stay as they are** — a stack line describes what the product is
  built with, which is simply true, rather than asserting a personal proficiency.

## clients (NDA cards)

- Under wraps. NDA cards are text-only (the witty "no screenshots" bit lives in
  the section note on the home page).
- **Clients are never named.** Each is described by industry and region instead
  ("A major European telecommunications company", "A major North American
  industrial services company"). The same applies to the home page's "Worked
  with" strip, the résumé (`tools/resume/build.mjs`) and any future case study.
  Don't name a client's internal products or design systems either: they
  identify the client as surely as the name. `mark` is the region's initials.

## products / work (case-study detail pages)

- Only projects with real source material get a detail page. Content is drawn
  from the actual repos under github.com/B-ismark. No invented metrics — where a
  number isn't real, it's left out.
- booking-room impact ("~30% faster to book") is a real metric from the résumé
  ("reducing booking times by 30%").
- Outbound `links` carry anti-spam attrs in the component
  (`rel=nofollow noopener noreferrer` + `referrerPolicy=no-referrer`).
- `booking-room` is the only project with real UI screenshots in-repo.

## danmu

- Drawn from github.com/B-ismark/Danmu: its commit history, `PRODUCT.md`,
  `Design.md` and `docs/START-HERE.md`. Dated decisions in the copy come from
  there (key wall removed 2026-06-06, render pipeline deleted 2026-07-25,
  "scanned pieces are approximate" decided 2026-10-03, first-screen redesign
  in PR #300).
- "970+ commits" and "5 months" are counted from the repo (974 commits,
  2026-06-06 to 2026-11-19). "7 to 13 of 19" is the detector benchmark in the
  commit that added the second model. No usage numbers exist; don't add any.
- Screenshots were captured from the running app (starter living room, light
  theme) at 2400px wide.
