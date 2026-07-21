'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

// Reveals [data-reveal] blocks and signature marks (.section-head rules,
// [data-develop] plate develops) as they scroll into view — a quiet fade-up,
// once each. Blocks toggle the same `.is-in` class the CSS already transitions,
// so the visual language is unchanged.
//
// Driven by a single IntersectionObserver, NOT ScrollTrigger.batch: batch defers
// its onEnter for elements already in view at mount until the first scroll, which
// left above-the-fold content sitting hidden. IO fires on the next frame for
// in-view elements, so nothing is ever stuck.
//
// Re-runs on every pathname change. The App Router reuses this layout across
// client-side navigations, so the effect never remounts on its own; without the
// pathname dependency it would only ever observe the FIRST page's elements and
// every subsequent page would load hidden until a hard refresh.
//
// Honours reduced-motion and degrades to "everything visible" without JS.
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = gsap.utils.toArray('[data-reveal]');
    // Marks share the on-enter signal (.is-in) but different CSS: section heads
    // draw their poster rule, [data-develop] wrappers resolve from halftone.
    const marks = gsap.utils.toArray('.section-head, [data-develop]');
    if (!els.length && !marks.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Reveal blocks that CSS would otherwise hide. Marks stay untouched: their
      // effects live behind a prefers-reduced-motion: no-preference gate, so the
      // static print look (solid rule, full-tone image) is already what shows.
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }

    // One observer for both. [data-reveal] blocks fade up with a light stagger
    // when a group enters together (matching the old batch feel); marks just
    // toggle their own CSS. Once each, via unobserve. rootMargin trims the bottom
    // ~8% so a block reveals a beat after its top crosses in (was 'top 92%').
    const io = new IntersectionObserver(
      (entries, obs) => {
        const entering = entries.filter((e) => e.isIntersecting);
        entering.forEach((e, i) => {
          const el = e.target;
          obs.unobserve(el); // once each
          if (el.matches('[data-reveal]')) {
            gsap.delayedCall(i * 0.08, () => el.classList.add('is-in'));
          } else {
            el.classList.add('is-in');
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );

    [...els, ...marks].forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
