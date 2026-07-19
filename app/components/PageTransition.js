'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

// Bolder route change than the old per-element fade-up: a two-colour riso pass.
// On an internal navigation a fluoro-pink slab is laid, a federal-blue slab
// over-prints it, and the destination is stamped across in cream over a
// misregistered pink offset — the same second-ink language as the contact
// heading and the case-study titles. The push happens hidden under full cover,
// then the inks part upward to reveal the new page. Work cards carry their
// project name into the stamp; everything else uses the section name.
//
// Progressive enhancement: without JS or under reduced-motion nothing
// intercepts; links navigate normally and the overlay stays offscreen and inert.
const labelFor = (path) => {
  const p = (path || '/').replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/work' || p.startsWith('/work/')) return 'Work';
  if (p.startsWith('/explorations')) return 'Explorations';
  if (p.startsWith('/about')) return 'About';
  return '';
};

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const rootRef = useRef(null);
  const aRef = useRef(null);
  const bRef = useRef(null);
  const labelRef = useRef(null);
  const textRef = useRef(null);
  // 'idle' → 'covering' → 'covered' → 'uncovering'. A ref so the click handler
  // and the pathname effect share one truth without re-rendering.
  const st = useRef({ phase: 'idle', href: null });

  const uncover = () => {
    st.current.phase = 'uncovering';
    gsap
      .timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          st.current = { phase: 'idle', href: null };
          rootRef.current.classList.remove('is-active');
          gsap.set([aRef.current, bRef.current], { yPercent: 100, y: 0 });
          gsap.set(labelRef.current, { opacity: 0, yPercent: 0 });
        },
      })
      .to(labelRef.current, { opacity: 0, yPercent: -60, duration: 0.35 }, 0)
      // Blue lifts off first, pink trails — the two inks part on the way out.
      .to(aRef.current, { yPercent: -100, duration: 0.55 }, 0.05)
      .to(bRef.current, { yPercent: -100, duration: 0.55 }, 0.12);
  };

  const cover = (href, label) => {
    st.current = { phase: 'covering', href };
    rootRef.current.classList.add('is-active');
    textRef.current.textContent = label || labelFor(href);
    gsap.killTweensOf([aRef.current, bRef.current, labelRef.current]);
    // y:0 so GSAP owns only yPercent — otherwise it parses the CSS
    // translateY(100%) into a px y and stacks yPercent on top (→ 200%).
    gsap.set([aRef.current, bRef.current], { yPercent: 100, y: 0 });
    gsap.set(labelRef.current, { opacity: 0, yPercent: 24 });
    gsap
      .timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          st.current.phase = 'covered';
          router.push(href);
        },
      })
      // Pink ink is laid down first, blue over-prints it — a riso pass.
      .to(bRef.current, { yPercent: 0, duration: 0.52 }, 0)
      .to(aRef.current, { yPercent: 0, duration: 0.5 }, 0.08)
      .to(labelRef.current, { opacity: 1, yPercent: 0, duration: 0.4 }, 0.18);
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Own the slab transform from the start (clears the CSS translateY(100%)
    // that GSAP would otherwise read as a px offset and double).
    gsap.set([aRef.current, bRef.current], { yPercent: 100, y: 0 });

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (a.dataset.noTransition != null) return;

      let url;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return; // external

      // Skip asset links (BrowserMock screenshots, the résumé PDF, …): routes
      // have no file extension in their last path segment.
      const last = url.pathname.split('/').pop() || '';
      if (last.includes('.')) return;

      const here = location.pathname.replace(/\/+$/, '') || '/';
      const dest = url.pathname.replace(/\/+$/, '') || '/';
      if (dest === here) return; // same page (incl. in-page hash links)

      if (st.current.phase !== 'idle') {
        e.preventDefault();
        e.stopPropagation();
        return; // a pass is already running — don't stack
      }

      // Any card that opens a case study (work cards on the home + explorations
      // pages, exploration tiles) stamps its own project name; plain nav uses
      // the section name.
      const label = dest.startsWith('/work/')
        ? a.querySelector('.title-mark')?.textContent?.trim() || ''
        : '';

      // Capture-phase preventDefault also stops next/link's own handler
      // (it bails when the event is already defaultPrevented).
      e.preventDefault();
      e.stopPropagation();
      cover(url.pathname, label);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Route committed after a cover → wait for the new page to paint, then reveal.
  useEffect(() => {
    if (st.current.phase !== 'covered') return;
    requestAnimationFrame(() => requestAnimationFrame(uncover));
  }, [pathname]);

  return (
    <div className="pt" ref={rootRef} aria-hidden="true">
      <span className="pt-slab pt-slab--b" ref={bRef} />
      <span className="pt-slab pt-slab--a" ref={aRef} />
      <div className="pt-label" ref={labelRef}>
        <span className="pt-label-text" ref={textRef} />
      </div>
    </div>
  );
}
