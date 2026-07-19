'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { site } from '../content';
import { ed, edHref } from '../lib/edit';

gsap.registerPlugin(ScrollTrigger, SplitText);

// The contact banner folds the "elsewhere" links in so the long pages read as
// one invitation, not a stray list above a second call to action. (Case-study
// pages keep the footer's own copy — they have no banner.)
//
// The whole block prints itself into register as it scrolls in — the site's own
// riso language rather than the cursor-reactive effects it used to carry. The
// heading rises line by line from behind a mask (same gesture as the home
// headline), and a fluoro-pink misregistered echo of it drifts in a beat later
// and settles just off-register: a second ink plate landing. The email plate
// clicks into lockup on the same pass, then re-separates on hover. Scroll- and
// hover-driven only — nothing follows the pointer. It's off under
// reduced-motion, and without JS it stays a plain, complete banner (the pink
// echo holds as a static print edge).
export default function ContactCTA() {
  const c = site.cta;

  // Carry each link's original index so the dev editor still targets the right
  // key in content.json after we filter. Email is the banner's primary action
  // and the résumé now gets its own action beside it, so pull both the mailto
  // and the PDF out of the inline "elsewhere" row (LinkedIn / Behance).
  const withIndex = site.footer.elsewhere.map((l, i) => ({ ...l, i }));
  const resume = withIndex.find((l) => l.href.toLowerCase().endsWith('.pdf'));
  const links = withIndex.filter(
    (l) => !l.href.startsWith('mailto:') && l !== resume
  );

  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const echoRef = useRef(null);
  const offsetRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let split;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });

    // 1) Heading rises, line by line, from behind a per-line mask.
    try {
      split = new SplitText(headRef.current, {
        type: 'lines',
        mask: 'lines', // 3.13+: each line gets an overflow-clip mask
        linesClass: 'split-line',
      });
      tl.from(split.lines, {
        yPercent: 110,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
      });
    } catch {
      /* SplitText unavailable — heading stays plainly visible */
    }

    // 2) The pink echo drifts in from a wider offset and settles onto its
    //    resting fringe — a beat behind the heading, like the second plate
    //    landing. The resting offset lives in CSS (top/left), so clearProps
    //    hands the transform back cleanly once the drift finishes.
    if (echoRef.current) {
      tl.from(
        echoRef.current,
        {
          x: 12,
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'transform',
        },
        '-=0.5'
      );
    }

    // 3) Email plate clicks into lockup (registered behind the cream face).
    //    clearProps hands the transform back to CSS so the :hover
    //    re-separation takes over afterwards.
    if (offsetRef.current) {
      tl.from(
        offsetRef.current,
        {
          x: 12,
          y: 12,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform',
        },
        '-=0.4'
      );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      if (split) split.revert(); // restores original heading markup
    };
  }, []);

  return (
    <section className="cta" aria-labelledby="cta-h" ref={sectionRef}>
      <div className="cta-lead">
        <p className="eyebrow" {...ed('site.cta.eyebrow')}>{c.eyebrow}</p>
        <div className="cta-head-wrap">
          <span className="cta-head-echo" aria-hidden="true" ref={echoRef}>
            {c.heading}
          </span>
          <h2 id="cta-h" className="cta-head" ref={headRef} {...ed('site.cta.heading')}>
            {c.heading}
          </h2>
        </div>
      </div>
      <div className="cta-body">
      <p className="cta-sub" {...ed('site.cta.sub')}>
        {c.sub}
      </p>
      <div className="cta-actions">
        <div className="cta-primary">
          <a className="cta-btn" href={`mailto:${c.email}`}>
            <span className="cta-btn-offset" aria-hidden="true" ref={offsetRef} />
            <span className="cta-btn-face" {...ed('site.cta.email')}>{c.email}</span>
          </a>
          {resume && (
            <a
              className="cta-resume"
              href={resume.href}
              {...(resume.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...edHref(`site.footer.elsewhere[${resume.i}].href`)}
            >
              <span {...ed(`site.footer.elsewhere[${resume.i}].label`)}>{resume.label}</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          )}
        </div>
        <nav className="cta-elsewhere" aria-label="Elsewhere">
          {links.map((l) => (
            <a
              key={l.label}
              className="cta-link"
              href={l.href}
              {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...edHref(`site.footer.elsewhere[${l.i}].href`)}
            >
              <span {...ed(`site.footer.elsewhere[${l.i}].label`)}>{l.label}</span>
              {l.ext && <span aria-hidden="true"> ↗</span>}
            </a>
          ))}
        </nav>
      </div>
      </div>
    </section>
  );
}
