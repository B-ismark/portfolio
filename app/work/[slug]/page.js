import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusLine from '../../components/StatusLine';
import BrowserMock from '../../components/BrowserMock';
import ContactCTA from '../../components/ContactCTA';
import { work } from '../../content';
import { ed, edHref } from '../../lib/edit';

export function generateStaticParams() {
  return Object.keys(work).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = work[slug];
  if (!project) return {};
  return {
    title: `${project.title} · Bismark Gyau`,
    description: project.summary,
    openGraph: {
      title: `${project.title} · Bismark Gyau`,
      description: project.summary,
    },
  };
}

const NOTE = /what i.?d do differently/i;

export default async function WorkPage({ params }) {
  const { slug } = await params;
  const project = work[slug];
  if (!project) notFound();

  const base = `work.${slug}`;

  return (
    <article className="wrap work">
      <Link className="work-back reveal" href="/" style={{ '--d': '0ms' }}>
        <span aria-hidden="true">←</span> Work
      </Link>

      <header className="work-head reveal" style={{ '--d': '70ms' }}>
        <div className="work-top">
          <span className="idx">{project.index}</span>
          <StatusLine category={project.category} status={project.status} editBase={base} />
        </div>
        <h1 className="work-title" data-text={project.title} {...ed(`${base}.title`)}>
          {project.title}
        </h1>
        <p className="work-summary" {...ed(`${base}.summary`)}>{project.summary}</p>
      </header>

      {/* recruiter at-a-glance — Role / Type / Stack / Impact */}
      <dl className="work-meta reveal" style={{ '--d': '130ms' }}>
        {project.meta.map((m, i) => (
          <div key={m.label} className={m.label === 'Impact' ? 'is-impact' : undefined}>
            <dt {...ed(`${base}.meta[${i}].label`)}>{m.label}</dt>
            <dd {...ed(`${base}.meta[${i}].value`)}>{m.value}</dd>
          </div>
        ))}
      </dl>

      {project.highlights?.length > 0 && (
        <div className="work-highlights reveal" style={{ '--d': '155ms' }}>
          <p className="eyebrow">At a glance</p>
          <ul>
            {project.highlights.map((h, i) => (
              <li key={h} {...ed(`${base}.highlights[${i}]`)}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {project.links?.length > 0 && (
        <div className="work-links reveal" style={{ '--d': '178ms' }}>
          {project.links.map((l, i) => (
            <a
              key={l.href}
              className="work-link"
              href={l.href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              referrerPolicy="no-referrer"
              {...edHref(`${base}.links[${i}].href`)}
            >
              <span {...ed(`${base}.links[${i}].label`)}>{l.label}</span>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <path
                  d="M4 12 12 4M6 4h6v6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ))}
        </div>
      )}

      {/* lead visual — real product in a browser frame, or a typographic plate */}
      {project.hero ? (
        <figure className="work-lead reveal" style={{ '--d': '210ms' }}>
          <BrowserMock
            src={project.hero.src}
            alt={project.hero.alt}
            caption={project.hero.caption}
            width={project.hero.width}
            height={project.hero.height}
            editImg={`${base}.hero.src`}
            editAlt={`${base}.hero.alt`}
          />
          {project.hero.caption && (
            <figcaption className="mock-cap" {...ed(`${base}.hero.caption`)}>
              {project.hero.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div
          className="plate plate--wide work-plate reveal"
          style={{ '--d': '210ms' }}
          aria-hidden="true"
        >
          <span className="plate-word" {...ed(`${base}.plateWord`)}>{project.plateWord}</span>
          <span className="plate-cap eyebrow">{project.category}</span>
        </div>
      )}

      {/* body — sections; where a screenshot illustrates a point, it sits with it */}
      <div className="work-body">
        {project.sections.map((s, i) => {
          const isNote = NOTE.test(s.heading);
          const hasMedia = !!s.media;
          // Portrait shots (phone screens) get a slim device-width column instead
          // of a full half-row, so a tall image doesn't dwarf the copy beside it.
          const isPortrait = hasMedia && s.media.height > s.media.width;
          const side = i % 2 === 0 ? 'left' : 'right';
          const cls = [
            'work-section',
            isNote ? 'work-section--note' : '',
            hasMedia ? `work-section--media media-${side}` : '',
            isPortrait ? 'work-section--is-portrait' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <section className={cls} data-reveal key={s.heading}>
              <div className="work-sec-copy">
                <div className="work-sec-head">
                  <span className="work-sec-num" data-n={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="work-sec-title" {...ed(`${base}.sections[${i}].heading`)}>
                    {s.heading}
                  </h2>
                </div>
                {s.body && <p {...ed(`${base}.sections[${i}].body`)}>{s.body}</p>}
                {s.list && (
                  <ul>
                    {s.list.map((item, j) => (
                      <li key={item} {...ed(`${base}.sections[${i}].list[${j}]`)}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              {hasMedia && (
                <figure className="work-media">
                  <BrowserMock
                    src={s.media.src}
                    alt={s.media.alt}
                    caption={s.media.caption}
                    width={s.media.width}
                    height={s.media.height}
                    zoom={s.media.zoom}
                    focus={s.media.focus}
                    editImg={`${base}.sections[${i}].media.src`}
                    editAlt={`${base}.sections[${i}].media.alt`}
                  />
                  {s.media.caption && (
                    <figcaption {...ed(`${base}.sections[${i}].media.caption`)}>
                      {s.media.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </section>
          );
        })}
      </div>

      <Link className="work-back work-back--bottom" href="/">
        <span aria-hidden="true">←</span> Back to work
      </Link>

      <ContactCTA />
    </article>
  );
}
