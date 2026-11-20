import Link from 'next/link';
import StatusLine from './StatusLine';
import { ed } from '../lib/edit';

// Text-only by design: no image frame. The client name carries the
// credibility a screenshot would; `mark` is a quiet logo stand-in.
export default function NdaCard({
  index,
  client,
  category,
  status,
  description,
  role,
  mark,
  slug,
  editBase,
}) {
  const body = (
    <>
      <div className="nda-head">
        <span className="idx">{index}</span>
        <StatusLine category={category} status={status} editBase={editBase} />
      </div>
      <h3 className="nda-title" {...ed(`${editBase}.client`)}>
        <span className="title-mark">{client}</span>
      </h3>
      <p className="nda-desc" {...ed(`${editBase}.description`)}>{description}</p>
      <dl className="nda-role">
        <dt>Role</dt>
        <dd {...ed(`${editBase}.role`)}>{role}</dd>
      </dl>
      <span className="nda-mark" aria-hidden="true" {...ed(`${editBase}.mark`)}>
        {mark}
      </span>
      {slug && (
        <span className="product-more nda-more">
          Case study
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
            <path
              d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  // A card with a written case study links to it (diagrams, no screenshots);
  // the rest stay plain text.
  if (slug) {
    return (
      <Link className="nda-card nda-card--link" data-nda href={`/work/${slug}`}>
        {body}
      </Link>
    );
  }

  return (
    <article className="nda-card" data-nda aria-label={`${client}, work under NDA`}>
      {body}
    </article>
  );
}
