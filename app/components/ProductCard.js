import Link from 'next/link';
import StatusLine from './StatusLine';
import { ed, edImg } from '../lib/edit';

export default function ProductCard({
  index,
  category,
  status,
  title,
  description,
  role,
  plateWord,
  slug,
  image,
  editBase,
}) {
  const body = (
    <>
      {/* browser-chrome frame — real screenshot, or a framed wordmark poster */}
      <div className="card-mock" aria-hidden="true">
        <div className="mock-bar">
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-dot" />
        </div>
        {image ? (
          <div className="mock-shot" data-develop>
            <img src={image} alt="" loading="lazy" {...edImg(`${editBase}.image`)} />
          </div>
        ) : (
          <div className="card-mock-empty">
            <span className="plate-word" {...ed(`${editBase}.plateWord`)}>{plateWord}</span>
          </div>
        )}
      </div>

      <div className="product-top">
        <span className="idx">{index}</span>
        <StatusLine category={category} status={status} editBase={editBase} />
      </div>
      <h3 className="p-title--sm" {...ed(`${editBase}.title`)}>
        <span className="title-mark">{title}</span>
      </h3>
      <p className="p-desc" {...ed(`${editBase}.description`)}>{description}</p>
      <dl className="meta">
        <div>
          <dt>Role</dt>
          <dd {...ed(`${editBase}.role`)}>{role}</dd>
        </div>
      </dl>
      {slug && (
        <span className="product-more" aria-hidden="true">
          Case study
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
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

  if (slug) {
    return (
      <Link
        className="product product--link"
        href={`/work/${slug}`}
        aria-label={`${title}, read the case study`}
      >
        {body}
      </Link>
    );
  }

  return <article className="product">{body}</article>;
}
