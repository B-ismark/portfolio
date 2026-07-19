import { liveStatuses } from '../content';
import { ed } from '../lib/edit';

// category · status — with a quiet accent dot on "in motion" statuses.
// `editBase` (dev only) is the content.json path of the item this line belongs
// to, e.g. "hero" or "clients[0]", so category/status become editable inline.
export default function StatusLine({ category, status, editBase }) {
  const live = liveStatuses.has(status);
  return (
    <p className="eyebrow status-line">
      <span {...(editBase ? ed(`${editBase}.category`) : null)}>{category}</span>
      <span className="mid" aria-hidden="true">·</span>
      <span className={`status${live ? ' is-live' : ''}`}>
        <span className="dot" aria-hidden="true" />
        <span {...(editBase ? ed(`${editBase}.status`) : null)}>{status}</span>
      </span>
    </p>
  );
}
