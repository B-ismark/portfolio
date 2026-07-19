'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll (Lenis) driven off GSAP's single ticker, with ScrollTrigger
// kept in sync. Deliberately gentle — a short lerp, not a heavy glide, so the
// page still feels like paper, not a parallax showreel. Honours reduced-motion
// by staying out entirely: native scroll, no smoothing, no RAF loop.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.12, // restrained — settles fast, no floaty overshoot
      wheelMultiplier: 1,
      smoothWheel: true,
    });
    // Exposed so the scroll-to-top button glides with the same easing. Absent
    // under reduced-motion (this effect returns early), so callers fall back to
    // a native scroll.
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // Live plate slip: map scroll velocity → a small, capped px offset and lerp
    // it into --reg-drift each frame. The case-study misregistration pseudos add
    // it to their base offset, so the pink plate lags the blue while scrolling
    // and settles back into register when motion stops. Purely decorative and
    // scoped to CSS that only exists on the case-study pages.
    const root = document.documentElement;
    const K = 0.05; // velocity → px
    const MAX = 5; // cap so it stays a hint, never a glitch
    let drift = 0;

    const raf = (time) => {
      lenis.raf(time * 1000);
      const target = Math.max(-MAX, Math.min(MAX, (lenis.velocity || 0) * K));
      drift += (target - drift) * 0.15;
      if (Math.abs(drift) < 0.03) drift = 0; // land cleanly in register
      root.style.setProperty('--reg-drift', `${drift.toFixed(2)}px`);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
      root.style.removeProperty('--reg-drift');
    };
  }, []);

  // App-router navigations reuse the DOM; jump to top and re-measure triggers.
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
