import Link from 'next/link';
import StatusLine from './StatusLine';
import { ed, edImg } from '../lib/edit';

export default function HeroCard({
  index,
  category,
  status,
  title,
  description,
  meta,
  plateWord,
  image,
  href,
  slug,
  editBase = 'hero',
}) {
  const body = (
    <>
      <div className="hero-text">
        <div className="hero-top">
          <span className="idx">{index}</span>
          <StatusLine category={category} status={status} editBase={editBase} />
        </div>
        <h3 className="p-title--hero" {...ed(`${editBase}.title`)}>
          <span className="title-mark">{title}</span>
        </h3>
        <p className="p-desc" {...ed(`${editBase}.description`)}>{description}</p>
        <dl className="meta">
          {meta.map((m, i) => (
            <div key={m.label}>
              <dt {...ed(`${editBase}.meta[${i}].label`)}>{m.label}</dt>
              <dd {...ed(`${editBase}.meta[${i}].value`)}>{m.value}</dd>
            </div>
          ))}
        </dl>
        {slug ? (
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
        ) : (
          href && (
            <span className="product-more" aria-hidden="true">
              Visit live site
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                <path
                  d="M4 12 12 4M6 4h6v6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )
        )}
      </div>

      {image ? (
        <div className="plate plate--image" data-develop>
          {/* first/hero image on the home page — a likely LCP element, so it
              loads eagerly at high priority rather than lazily. */}
          <img
            src={image}
            alt="The AmaliTech website"
            loading="eager"
            fetchPriority="high"
            {...edImg(`${editBase}.image`)}
          />
        </div>
      ) : (
        <div className="plate" aria-hidden="true">
          <span className="plate-word" {...ed(`${editBase}.plateWord`)}>{plateWord}</span>
          <span className="plate-cap eyebrow">{category}</span>
        </div>
      )}
    </>
  );

  // Prefer the internal case study when there is one — the featured project
  // should open its story on-site, not bounce out to a marketing page. The live
  // site now lives as a link inside the case study.
  if (slug) {
    return (
      <Link
        href={`/work/${slug}`}
        className="hero hero--link"
        aria-label={`${title}, read the case study`}
      >
        {body}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hero hero--link"
        aria-label={`${title}, visit the live website`}
      >
        {body}
      </a>
    );
  }

  return <article className="hero">{body}</article>;
}
