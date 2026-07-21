'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

// Progressive enhancement for the home headline — a quiet fade-in, nothing more.
// The hero is a two-plate print: a black poster line (.lead-lines) with a faint
// pink plate sitting just off register behind it (.lead-ghost). It's static: the
// misregistration is already in place, so the masthead simply fades up as one
// block, then the highlighter swipes the role once, then the POV line, presence,
// and featured work fade in after. No drift, no cursor-tracking. Staged hidden
// before paint (html.gsap-lead), gated on no-reduced-motion; the CSS `.reveal`
// fade + 2.5s failsafe cover no-JS / reduced-motion / GSAP failure.
export default function HeadlineReveal() {
  // Re-run on every route change: the App Router reuses this layout across
  // client-side navigations, so a plain [] effect fires only on the first load.
  // Without the pathname dependency, navigating BACK to home never replays the
  // entrance and the lead sits staged-hidden until the 2.5s CSS failsafe.
  const pathname = usePathname();

  useEffect(() => {
    const headline = document.querySelector('.lead-headline');
    if (!headline) return; // home only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Ensure the hidden/kill-CSS state is present (inline script sets it on
    // first paint; this covers client-side navigation back to home).
    document.documentElement.classList.add('gsap-lead');

    const lines = headline.querySelector('.lead-lines');
    const ghost = headline.querySelector('.lead-ghost');
    const tail = headline.querySelector('.lead-tail');

    let cancelled = false;
    const reveal = () => {
      headline.style.visibility = 'visible';
    };

    // Fonts should be settled before the entrance or the plates register against
    // fallback metrics — but cap the wait so it never lags behind the page.
    const fontsReady = Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 800)),
    ]);

    fontsReady.then(() => {
      if (cancelled) return;
      try {
        reveal();

        const tl = gsap.timeline({ delay: 0.05 });

        // The poster plate and its faint pink echo fade up together, already in
        // register — no movement. Ghost fades to its rest opacity via the var.
        if (lines) {
          tl.fromTo(
            lines,
            { opacity: 0 },
            { opacity: 1, duration: 0.7, ease: 'power2.out' },
            0
          );
        }
        if (ghost) {
          tl.fromTo(
            headline,
            { '--reg-ghost-o': 0 },
            { '--reg-ghost-o': 0.5, duration: 0.7, ease: 'power2.out' },
            0
          );
        }

        // One small beat: the highlighter swipes the role.
        tl.add(() => headline.classList.add('is-marked'), 0.4);

        // POV line, then presence, worked-with, and featured work — staged hidden
        // in CSS, so fromTo (not from, which would read the hidden value as end).
        if (tail) {
          tl.fromTo(
            tail,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            0.3
          );
        }
        tl.fromTo(
          '.lead-meta',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '>-0.3'
        )
          .fromTo(
            '.worked-with',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            '<0.08'
          )
          .fromTo(
            '.section--lead-work',
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
            '<0.1'
          );
      } catch {
        reveal(); // never leave the headline hidden
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
