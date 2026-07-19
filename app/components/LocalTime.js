'use client';

import { useEffect, useState } from 'react';

// A quiet "presence" signal: the live time where I am (Takoradi, Ghana — UTC+0,
// no DST), and how far that is from wherever the visitor is sitting. Computed
// entirely client-side, so it reads the *visitor's* zone, not the server's.
// Renders nothing until mounted, to avoid an SSR/hydration mismatch.
export default function LocalTime() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    // minute resolution is plenty for a clock; no need to burn a per-second timer
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  // Ghana is UTC+0 year-round. getTimezoneOffset() is minutes *behind* UTC, so
  // a visitor east of UTC has a negative offset → they're ahead of Ghana.
  const visitorOffsetHours = -now.getTimezoneOffset() / 60;
  const delta = 0 - visitorOffsetHours; // Ghana relative to the visitor
  const abs = Math.abs(delta);
  const hrs = Number.isInteger(abs) ? `${abs}` : abs.toFixed(1);

  let rel;
  if (delta === 0) rel = 'same time as you';
  else if (delta > 0) rel = `${hrs}h ahead of you`;
  else rel = `${hrs}h behind you`;

  return (
    <span className="localtime" suppressHydrationWarning>
      <span className="localtime-time">{time}</span> in Ghana
      <span className="localtime-rel"> · {rel}</span>
    </span>
  );
}
