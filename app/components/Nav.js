'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '../content';
import { ed, edHref } from '../lib/edit';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const pathname = usePathname() || '/';
  // Normalise away any trailing slash (static export uses trailingSlash) so the
  // comparisons below are exact.
  const norm = pathname.replace(/\/+$/, '') || '/';
  // "Work" (href '/') owns the home page *and* the case-study pages at /work/*;
  // every other nav item is active only on its own subtree. Without the /work
  // special-case, Work would light up on /explorations and /about too.
  const isActive = (href) =>
    href === '/'
      ? norm === '/' || norm === '/work' || norm.startsWith('/work/')
      : norm === href || norm.startsWith(`${href}/`);

  // Auto-hiding header: slides away on scroll-down, and comes straight back the
  // moment the user scrolls up (so the menu is always one flick away), plus it's
  // always shown near the top. `pinned` just adds a hairline once off the top.
  const [hidden, setHidden] = useState(false);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const THRESHOLD = 80; // don't start hiding until past the header itself
    const update = () => {
      const y = window.scrollY;
      setPinned(y > 4);
      if (y < THRESHOLD) setHidden(false);
      else if (y > last + 4) setHidden(true);
      else if (y < last - 4) setHidden(false);
      last = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cls =
    'site-header' + (hidden ? ' is-hidden' : '') + (pinned ? ' is-pinned' : '');

  return (
    <header className={cls}>
      <div className="wrap">
        <Link className="brand" href="/">
          <span {...ed('site.brand')}>{site.brand}</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {site.nav.map((item, i) => {
            const current = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                {...edHref(`site.nav[${i}].href`)}
              >
                <span {...ed(`site.nav[${i}].label`)}>{item.label}</span>
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
