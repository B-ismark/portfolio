'use client';

import { useEffect, useRef } from 'react';

// Light/dark switch. The resolved theme is written to <html data-theme> before
// paint by the theme-init script in layout.js, and the visible icon is chosen
// purely from that attribute in CSS — so this component owns no theme state and
// can't cause a hydration flip. Its only jobs on click: flip the attribute,
// persist the choice, and keep the mobile browser-chrome colour in step.
//
// It's a toggle button named "Dark theme", so aria-pressed tells a screen
// reader which theme is on. That's mirrored from the attribute straight onto
// the DOM (not React state) for the same no-hydration-flip reason.

const DARK_BG = '#000000';
const LIGHT_BG = '#f4f1ea';

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

export default function ThemeToggle() {
  const ref = useRef(null);
  const sync = () => ref.current?.setAttribute('aria-pressed', String(isDark()));
  useEffect(sync, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode / storage disabled — the choice just won't persist */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? DARK_BG : LIGHT_BG);
    sync();
  };

  return (
    <button
      ref={ref}
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Dark theme"
      title="Switch theme"
    >
      {/* moon — shown in light mode (click to go dark) */}
      <svg
        className="icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      {/* sun — shown in dark mode (click to go light) */}
      <svg
        className="icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
