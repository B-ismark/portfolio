'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Site analytics: two tools, one event vocabulary.
//
// Umami — the numbers: visitors, sources, journeys, funnels, exit pages.
// Cookieless, so it needs no consent banner and still counts the EEA/UK
// visitors Clarity can only partly track without one. Its ~2KB script tracks
// page views (client-side route changes included) on its own. It only sends from
// `liveHost` (the metadataBase hostname, set as data-domains), so local dev,
// `npm run preview` and Vercel preview deploys load it but record nothing.
// The website id isn't a secret; it ships in every page's HTML.
//
// Microsoft Clarity — the why: session replay + heatmaps + geo, via the
// official @microsoft/clarity package. Boots only when NEXT_PUBLIC_CLARITY_ID
// is set, so an unset local/dev environment records nothing. On Vercel, scope
// that env var to the Production environment only, so preview/dev traffic
// never gets recorded. The package is imported dynamically inside the effect:
// when the id is absent the chunk is never fetched, keeping it off the
// critical path. Clarity auto-tracks page views + SPA route changes and masks
// text/input by default.
//
// Custom events, sent to both (no per-component wiring):
//   case_study_view  — opened /work/<slug>                  (case_study)
//   case_study_read  — reached the end of a case study      (case_study, seconds)
//   contact_email    — clicked a mailto: link
//   contact_phone    — clicked a tel: link
//   resume_download  — clicked a .pdf link (the résumé)
//   social_linkedin / social_behance / social_github / social_dribbble
//   outbound_link    — any other external link              (outbound_host)
//
// Bracketed fields become Umami event properties. Clarity gets the text ones as
// session tags; tags filter whole recordings, so a number like `seconds` stays
// Umami-only.
//
// "The end" of a case study is the element marked data-read-end (the bottom
// "Back to work" link). `seconds` counts from the case study opening, which
// tells a reader apart from someone flicking straight to the bottom.
//
// Clarity's init() is idempotent (it no-ops once its <script> is present) and
// setTag()/event() require window.clarity to already exist — so init and all
// tagging live here, in one place, guaranteeing init runs first.
const UMAMI_ID = '5906bcd6-b2d8-49ab-bcbf-14ce4982e8f6';
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

// Map a clicked anchor to an event (+ optional data).
// Returns null for internal SPA links (case-study opens are tracked by route).
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
  return { event: 'outbound_link', data: { outbound_host: host } };
}

function toClarity(clarity, event, data) {
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') clarity.setTag(key, value);
    });
  }
  clarity.event(event);
}

export default function Analytics({ liveHost }) {
  const pathname = usePathname();
  const clarityRef = useRef(null);
  // Umami events fired before its script arrives, flushed on load. Set to null
  // once loaded, or if the script never arrives (an ad blocker), so nothing
  // piles up.
  const umamiQueue = useRef([]);

  const toUmami = (event, data) => {
    if (window.umami) window.umami.track(event, data);
    else if (umamiQueue.current) umamiQueue.current.push([event, data]);
  };

  const track = (event, data) => {
    toUmami(event, data);
    if (clarityRef.current) toClarity(clarityRef.current, event, data);
  };

  // Boot Clarity once.
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

    return () => {
      cancelled = true;
      clearIdle();
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((t) =>
        window.removeEventListener(t, kick, opts),
      );
    };
  }, []);

  // Tag link clicks via a single delegated listener.
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest) return;
      const a = e.target.closest('a[href]');
      if (!a) return;
      const hit = classifyLink(a);
      if (hit) track(hit.event, hit.data);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // On a case study (/work/<slug>): log the open, so replays, heatmaps and
  // funnels can be filtered per project, then watch for the reader reaching
  // the end.
  useEffect(() => {
    const match = pathname && pathname.match(/^\/work\/([^/]+)\/?$/);
    if (!match) return;
    const slug = match[1];
    const openedAt = performance.now();

    toUmami('case_study_view', { case_study: slug });
    if (CLARITY_ID) {
      const tag = (clarity) =>
        toClarity(clarity, 'case_study_view', { case_study: slug });
      if (clarityRef.current) {
        tag(clarityRef.current);
      } else {
        import('@microsoft/clarity').then(({ default: clarity }) => {
          clarity.init(CLARITY_ID);
          clarityRef.current = clarity;
          tag(clarity);
        });
      }
    }

    const end = document.querySelector('[data-read-end]');
    if (!end || typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      track('case_study_read', {
        case_study: slug,
        seconds: Math.round((performance.now() - openedAt) / 1000),
      });
    });
    io.observe(end);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_ID}
      data-domains={liveHost}
      strategy="afterInteractive"
      onLoad={() => {
        const queued = umamiQueue.current || [];
        umamiQueue.current = null;
        queued.forEach(([event, data]) => window.umami?.track(event, data));
      }}
      onError={() => {
        umamiQueue.current = null;
      }}
    />
  );
}
