'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Microsoft Clarity — session replay + heatmaps + geo, via the official
// @microsoft/clarity package.
//
// Boots only when NEXT_PUBLIC_CLARITY_ID is set, so an unset local/dev
// environment records nothing. On Vercel, scope that env var to the
// Production environment only, so preview/dev traffic never gets recorded.
//
// The package is imported dynamically inside the effect: when the id is
// absent the chunk is never fetched, keeping it off the critical path.
// Clarity auto-tracks page views + SPA route changes and masks text/input
// by default.
//
// Custom events fired from here (no per-component wiring):
//   case_study_view  — opened /work/<slug>          (+ tag case_study=<slug>)
//   contact_email    — clicked a mailto: link
//   contact_phone    — clicked a tel: link
//   resume_download  — clicked a .pdf link (the résumé)
//   social_linkedin / social_behance / social_github / social_dribbble
//   outbound_link    — any other external link       (+ tag outbound_host)
//
// init() is idempotent (it no-ops once its <script> is present) and
// setTag()/event() require window.clarity to already exist — so init and
// all tagging live here, in one place, guaranteeing init runs first.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

// Map a clicked anchor to a Clarity event (+ optional [key, value] tag).
// Returns null for internal SPA links (case-study opens are tagged by route).
function classifyLink(a) {
  if (a.protocol === 'mailto:') return { event: 'contact_email' };
  if (a.protocol === 'tel:') return { event: 'contact_phone' };
  if (a.pathname && a.pathname.toLowerCase().endsWith('.pdf')) {
    return { event: 'resume_download' };
  }

  const isExternal =
    (a.protocol === 'http:' || a.protocol === 'https:') &&
    a.hostname &&
    a.hostname !== window.location.hostname;
  if (!isExternal) return null;

  const host = a.hostname.replace(/^www\./, '');
  if (host.includes('linkedin.com')) return { event: 'social_linkedin' };
  if (host.includes('behance.net')) return { event: 'social_behance' };
  if (host.includes('github.com')) return { event: 'social_github' };
  if (host.includes('dribbble.com')) return { event: 'social_dribbble' };
  return { event: 'outbound_link', tag: ['outbound_host', host] };
}

export default function ClarityAnalytics() {
  const pathname = usePathname();
  const clarityRef = useRef(null);

  // Boot once, then tag link clicks via a single delegated listener.
  useEffect(() => {
    if (!CLARITY_ID) return;
    let cancelled = false;

    const boot = () => {
      if (cancelled || clarityRef.current) return;
      import('@microsoft/clarity').then(({ default: clarity }) => {
        if (cancelled) return;
        clarity.init(CLARITY_ID);
        clarityRef.current = clarity;
      });
    };

    // Keep analytics off the critical path: boot when the main thread is idle,
    // or on the first user interaction — whichever comes first. A timeout caps
    // the idle wait so a passive visitor is still recorded.
    const hasIdle = typeof requestIdleCallback === 'function';
    const idle = hasIdle
      ? requestIdleCallback(boot, { timeout: 3000 })
      : setTimeout(boot, 2000);
    const kick = () => boot();
    const opts = { once: true, passive: true, capture: true };
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((t) =>
      window.addEventListener(t, kick, opts),
    );
    const clearIdle = () =>
      hasIdle ? cancelIdleCallback(idle) : clearTimeout(idle);

    const onClick = (e) => {
      const clarity = clarityRef.current;
      if (!clarity || !e.target.closest) return;
      const a = e.target.closest('a[href]');
      if (!a) return;
      const hit = classifyLink(a);
      if (!hit) return;
      if (hit.tag) clarity.setTag(hit.tag[0], hit.tag[1]);
      clarity.event(hit.event);
    };

    document.addEventListener('click', onClick);
    return () => {
      cancelled = true;
      clearIdle();
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((t) =>
        window.removeEventListener(t, kick, opts),
      );
      document.removeEventListener('click', onClick);
    };
  }, []);

  // Tag opens of a case study (/work/<slug>) so replays and heatmaps can be
  // filtered per project, and fire a custom event for funnels.
  useEffect(() => {
    if (!CLARITY_ID) return;
    const match = pathname && pathname.match(/^\/work\/([^/]+)\/?$/);
    if (!match) return;
    const slug = match[1];
    const tag = (clarity) => {
      clarity.setTag('case_study', slug);
      clarity.event('case_study_view');
    };
    if (clarityRef.current) {
      tag(clarityRef.current);
    } else {
      import('@microsoft/clarity').then(({ default: clarity }) => {
        clarity.init(CLARITY_ID);
        clarityRef.current = clarity;
        tag(clarity);
      });
    }
  }, [pathname]);

  return null;
}
