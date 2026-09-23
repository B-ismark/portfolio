'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Site analytics: two tools, one event vocabulary.
//
// Umami — the numbers: visitors, sources, journeys, funnels, exit pages.
// Cookieless, so it needs no consent banner and still counts the EEA/UK
// visitors Clarity can only partly track without one. It only sends from
// `liveHost` (the metadataBase hostname, set as data-domains), so local dev,
// `npm run preview` and Vercel preview deploys load it but record nothing.
// The website id isn't a secret; it ships in every page's HTML.
//
// Page views are sent from here (data-auto-track="false"), not by the script's
// own history hook: that only switches on once every image has loaded, so a
// visitor who clicked through before then would lose the page they went to.
// Everything sent to Umami is stamped with the page it happened on at the
// moment it happened, so events queued before the ~2KB script arrives still
// land on the right page.
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
// Boot waits for idle or the first interaction, but nothing sent before then is
// lost: events go through Clarity's own call queue (window.clarity.q, the stub
// its snippet installs), which the tag replays when it arrives. init() keeps an
// existing window.clarity, so the stub is safe to install first.
//
// Custom events go to both tools with no per-component wiring; the list, and
// the data each carries, is the Analytics table in README.md (keep it in step).
// Event data becomes Umami event properties. Clarity gets the text fields as
// session tags; tags filter whole recordings, so a number like `seconds` stays
// Umami-only.
//
// A case study page declares itself: data-case-study="<slug>" on its article
// and data-read-end on the element that counts as its end (the bottom "Back to
// work" link). A 404 under /work/ carries neither, so it never counts. Reading
// time only runs while the tab is on screen, so a case study opened in a
// background tab doesn't pass for a close read.
const UMAMI_ID = '5906bcd6-b2d8-49ab-bcbf-14ce4982e8f6';
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

// Any of these boots Clarity early, ahead of the idle callback.
const INTERACTIONS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

// `host` is `domain` itself or one of its subdomains (not notgithub.com).
const isHost = (host, domain) => host === domain || host.endsWith(`.${domain}`);

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
  if (isHost(host, 'linkedin.com')) return { event: 'social_linkedin' };
  if (isHost(host, 'behance.net')) return { event: 'social_behance' };
  if (isHost(host, 'github.com')) return { event: 'social_github' };
  if (isHost(host, 'dribbble.com')) return { event: 'social_dribbble' };
  return { event: 'outbound_link', data: { outbound_host: host } };
}

// window.clarity('set' | 'event', …) is exactly what the package's setTag()
// and event() call, so events never wait on the package chunk.
function toClarity(event, data) {
  if (!CLARITY_ID) return;
  window.clarity =
    window.clarity ||
    function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') window.clarity('set', key, value);
    });
  }
  window.clarity('event', event);
}

export default function Analytics({ liveHost }) {
  const pathname = usePathname();
  // Umami sends waiting for its script, run on load. Set to null once loaded,
  // or if the script never arrives (an ad blocker), so nothing piles up.
  const umamiQueue = useRef([]);
  // Path of the last page view: the referrer for the next one.
  const lastPath = useRef(null);

  // Send to Umami, stamped with the page as it is right now. No event name
  // means a page view; `extra` overrides payload fields (a view's referrer).
  const toUmami = (event, data, extra) => {
    const page = { url: location.href, title: document.title, ...extra };
    const send = () =>
      window.umami?.track((payload) => ({
        ...payload,
        ...page,
        ...(event && { name: event, data }),
      }));
    if (window.umami) send();
    else if (umamiQueue.current) umamiQueue.current.push(send);
  };

  const track = (event, data) => {
    toUmami(event, data);
    toClarity(event, data);
  };

  // Boot Clarity once — the only place it's loaded.
  useEffect(() => {
    if (!CLARITY_ID) return;
    let started = false;
    let cancelled = false;

    const boot = () => {
      if (started) return;
      started = true;
      import('@microsoft/clarity')
        .then(({ default: clarity }) => {
          if (!cancelled) clarity.init(CLARITY_ID);
        })
        // The chunk can 404 in a tab left open across a redeploy; that visit
        // just goes unrecorded.
        .catch(() => {});
    };

    // Keep analytics off the critical path: boot when the main thread is idle,
    // or on the first user interaction — whichever comes first. A timeout caps
    // the idle wait so a passive visitor is still recorded.
    const hasIdle = typeof requestIdleCallback === 'function';
    const idle = hasIdle
      ? requestIdleCallback(boot, { timeout: 3000 })
      : setTimeout(boot, 2000);
    const opts = { once: true, passive: true, capture: true };
    INTERACTIONS.forEach((t) => window.addEventListener(t, boot, opts));

    return () => {
      cancelled = true;
      if (hasIdle) cancelIdleCallback(idle);
      else clearTimeout(idle);
      INTERACTIONS.forEach((t) => window.removeEventListener(t, boot, opts));
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

  // One Umami page view per route. The landing page keeps the script's own
  // referrer (where the visitor came from); later ones came from the page
  // before. Declared ahead of the case-study effect so the view is sent first.
  useEffect(() => {
    toUmami(null, null, lastPath.current && { referrer: lastPath.current });
    lastPath.current = location.pathname + location.search;
  }, [pathname]);

  // On a case study: log the open, so replays, heatmaps and funnels can be
  // filtered per project, then watch for the reader reaching the end.
  useEffect(() => {
    const article = document.querySelector('[data-case-study]');
    if (!article) return;
    const slug = article.dataset.caseStudy;

    track('case_study_view', { case_study: slug });

    const end = article.querySelector('[data-read-end]');
    if (!end || typeof IntersectionObserver !== 'function') return;

    // Time on screen only: pause while the tab is hidden.
    let visibleMs = 0;
    let visibleSince = document.hidden ? null : performance.now();
    const onVisibility = () => {
      if (document.hidden && visibleSince !== null) {
        visibleMs += performance.now() - visibleSince;
        visibleSince = null;
      } else if (!document.hidden && visibleSince === null) {
        visibleSince = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      const onScreen =
        visibleMs + (visibleSince === null ? 0 : performance.now() - visibleSince);
      track('case_study_read', {
        case_study: slug,
        seconds: Math.round(onScreen / 1000),
      });
    });
    io.observe(end);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_ID}
      data-domains={liveHost}
      data-auto-track="false"
      strategy="afterInteractive"
      onLoad={() => {
        const queued = umamiQueue.current || [];
        umamiQueue.current = null;
        queued.forEach((send) => send());
      }}
      onError={() => {
        umamiQueue.current = null;
      }}
    />
  );
}
