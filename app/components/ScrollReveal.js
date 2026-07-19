'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Reveals [data-reveal] blocks as they scroll into view — a quiet fade-up,
// once each, driven by ScrollTrigger so it stays in sync with Lenis smooth
// scroll. Restrained on purpose (one beat, no loop). Blocks toggle the same
// `.is-in` class the CSS already transitions, so the visual language is
// unchanged from the old IntersectionObserver version — only the engine moved.
// Honours reduced-motion and degrades to "everything visible" without GSAP.
export default function ScrollReveal() {
  useEffect(() => {
    const els = gsap.utils.toArray('[data-reveal]');
    // Marks share one on-enter signal (.is-in) but different CSS: section heads
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

    const triggers = [];

    if (els.length) {
      // batch() lets blocks that enter together reveal together, with a light
      // stagger between them — no per-card cascade, keeping the editorial calm.
      triggers.push(
        ...ScrollTrigger.batch(els, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            batch.forEach((el, i) =>
              gsap.delayedCall(i * 0.08, () => el.classList.add('is-in'))
            ),
        })
      );
    }

    // Marks (section rules + plate develop) use an IntersectionObserver, not
    // ScrollTrigger.batch: batch can lag several seconds for elements already in
    // view at load (it waits on the first scroll/refresh), which would leave an
    // above-the-fold hero sitting under halftone dots. IO fires on the next
    // frame for in-view elements, so the gesture plays as part of the entrance.
    let io;
    if (marks.length) {
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            obs.unobserve(e.target); // once each
          });
        },
        { rootMargin: '0px 0px -6% 0px' }
      );
      marks.forEach((el) => io.observe(el));
    }

    // Anything already on screen at mount reveals immediately.
    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
      if (io) io.disconnect();
    };
  }, []);

  return null;
}
