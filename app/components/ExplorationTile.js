import Link from 'next/link';

export default function ExplorationTile({ num, title, description, slug }) {
  const body = (
    <>
      <p className="eyebrow expl-num">{num}</p>
      <h3 className="expl-title">
        <span className="title-mark">{title}</span>
      </h3>
      <p className="expl-desc">{description}</p>
      {slug && (
        <span className="expl-more">
          Case study <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  );

  if (slug) {
    return (
      <Link
        className="expl-tile expl-tile--link"
        href={`/work/${slug}`}
      >
        {body}
      </Link>
    );
  }

  return <article className="expl-tile">{body}</article>;
}
