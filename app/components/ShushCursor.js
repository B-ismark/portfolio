'use client';

import { useEffect, useRef } from 'react';

/**
 * Progressive enhancement for NDA cards — the real 🤫 emoji as the cursor.
 *
 * Baseline (in CSS): `.nda-card { cursor: url(/cursor-shush.svg) 20 20, default }`,
 * where the SVG draws the same emoji. If this JS never runs, or the SVG fails,
 * the pointer stays normal.
 *
 * When the visitor has a real pointer (hover + fine) and hasn't asked for
 * reduced motion, this hides the native cursor over an NDA card and shows a
 * 🤫 that follows with a light spring and scales in once on entry.
 */
export default function ShushCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return; // leave the native static cursor in place

    const cards = Array.from(document.querySelectorAll('[data-nda]'));
    if (!cards.length) return;

    const LERP = 0.2;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let active = false;
    let disabled = false; // set once a touch is seen — never re-enable

    const draw = () => {
      pos.x += (target.x - pos.x) * LERP;
      pos.y += (target.y - pos.y) * LERP;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      const settling =
        Math.abs(target.x - pos.x) > 0.4 || Math.abs(target.y - pos.y) > 0.4;
      if (active || settling) {
        raf = requestAnimationFrame(draw);
      } else {
        raf = 0;
      }
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (active && !raf) raf = requestAnimationFrame(draw);
    };

    const onEnter = (e) => {
      if (disabled) return;
      active = true;
      target.x = pos.x = e.clientX;
      target.y = pos.y = e.clientY;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      el.classList.remove('is-active');
      void el.offsetWidth; // replay the scale-in each entry
      el.classList.add('is-active');
      e.currentTarget.classList.add('js-cursor');
      window.addEventListener('mousemove', onMove);
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onLeave = (e) => {
      active = false;
      el.classList.remove('is-active');
      e.currentTarget.classList.remove('js-cursor');
      window.removeEventListener('mousemove', onMove);
    };

    const onTouch = () => {
      disabled = true;
      active = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (el) el.classList.remove('is-active');
      cards.forEach((c) => {
        c.classList.remove('js-cursor');
        c.removeEventListener('mouseenter', onEnter);
        c.removeEventListener('mouseleave', onLeave);
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
    };
    window.addEventListener('touchstart', onTouch, { passive: true });

    cards.forEach((c) => {
      c.addEventListener('mouseenter', onEnter);
      c.addEventListener('mouseleave', onLeave);
    });

    return () => {
      cards.forEach((c) => {
        c.removeEventListener('mouseenter', onEnter);
        c.removeEventListener('mouseleave', onLeave);
        c.classList.remove('js-cursor');
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="shush-cursor" ref={ref} aria-hidden="true">
      <span className="shush-emoji">🤫</span>
    </div>
  );
}
