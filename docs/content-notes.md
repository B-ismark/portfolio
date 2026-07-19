# Content notes

Authorial notes for `app/content.json`. These used to be inline comments in
`app/content.js`; they moved here when the data was split into JSON so the
in-browser editor could round-trip it. JSON can't hold comments — this file
carries the intent instead.

## hero

- `impact` metric is real, from the résumé: "15% increase in time spent on site".
- `image` is a real photo from the live AmaliTech site (the site Bismark rebuilt).

## clients (NDA cards)

- Under wraps. NDA cards are text-only — the client name carries the credibility
  a screenshot would (the witty "no screenshots" bit lives in the section note on
  the home page). `mark` is a stand-in for the eventual logo.

## products / work (case-study detail pages)

- Only projects with real source material get a detail page. Content is drawn
  from the actual repos under github.com/B-ismark. No invented metrics — where a
  number isn't real, it's left out.
- booking-room impact ("~30% faster to book") is a real metric from the résumé
  ("reducing booking times by 30%").
- Outbound `links` carry anti-spam attrs in the component
  (`rel=nofollow noopener noreferrer` + `referrerPolicy=no-referrer`).
- `booking-room` is the only project with real UI screenshots in-repo.
