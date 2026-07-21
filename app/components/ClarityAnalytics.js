'use client';

import { useEffect } from 'react';
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
// init() is idempotent (it no-ops once its <script> is present), and
// setTag()/event() require window.clarity to already exist — so both the
// boot and the per-route tagging live here, in one place, guaranteeing
// init runs before any tag call.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function ClarityAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!CLARITY_ID) return;
    import('@microsoft/clarity').then(({ default: clarity }) => {
      clarity.init(CLARITY_ID);

      // Tag opens of a case study (/work/<slug>) so replays and heatmaps
      // can be filtered per project, and fire a custom event for funnels.
      const match = pathname && pathname.match(/^\/work\/([^/]+)\/?$/);
      if (match) {
        const slug = match[1];
        clarity.setTag('case_study', slug);
        clarity.event('case_study_view');
      }
    });
  }, [pathname]);

  return null;
}
