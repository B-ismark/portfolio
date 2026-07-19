import StatusLine from './StatusLine';
import { ed } from '../lib/edit';

// Text-only by design — no image frame. The client name carries the
// credibility a screenshot would; `mark` is a quiet logo stand-in.
export default function NdaCard({
  index,
  client,
  category,
  status,
  description,
  role,
  mark,
  editBase,
}) {
  return (
    <article className="nda-card" data-nda aria-label={`${client}, work under NDA`}>
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
    </article>
  );
}
