import ProductCard from '../components/ProductCard';
import ContactCTA from '../components/ContactCTA';
import { explorationProjects, explorations, site } from '../content';
import { ed } from '../lib/edit';

const DESCRIPTION =
  'Side projects and half-formed ideas — the things I build when no one has asked me to, made to answer my own questions.';

export const metadata = {
  title: 'Explorations · Bismark Gyau',
  description: DESCRIPTION,
  openGraph: { title: 'Explorations · Bismark Gyau', description: DESCRIPTION },
};

export default function Explorations() {
  const x = site.explorations;
  return (
    <div className="wrap explorations">
      <p
        className="eyebrow about-eyebrow reveal"
        style={{ '--d': '0ms' }}
        {...ed('site.explorations.eyebrow')}
      >
        {x.eyebrow}
      </p>

      <div className="about-intro explorations-intro">
        <div className="about-intro-text">
          <h1 className="about-lead reveal" style={{ '--d': '80ms' }}>
            <span className="about-lead-setup" {...ed('site.explorations.lead')}>{x.lead}</span>
            <span className="about-lead-punch">
              <em {...ed('site.explorations.leadEm')}>{x.leadEm}</em>
            </span>
          </h1>
        </div>
      </div>

      <section className="section reveal" style={{ '--d': '150ms' }} aria-labelledby="xproj-h">
        <div className="section-head">
          <h2 id="xproj-h" className="eyebrow" {...ed('site.explorations.projectsLabel')}>
            {x.projectsLabel}
          </h2>
          <span className="eyebrow s-count" {...ed('site.explorations.projectsCount')}>
            {x.projectsCount}
          </span>
        </div>
        <div className="products">
          {explorationProjects.map((p, i) => (
            <ProductCard key={p.index} {...p} editBase={`explorationProjects[${i}]`} />
          ))}
        </div>
      </section>

      <section className="section" data-reveal aria-labelledby="xidea-h">
        <div className="section-head">
          <h2 id="xidea-h" className="eyebrow" {...ed('site.explorations.ideasLabel')}>
            {x.ideasLabel}
          </h2>
          <span className="eyebrow s-count" {...ed('site.explorations.ideasCount')}>
            {x.ideasCount}
          </span>
        </div>
        <ul className="ideas">
          {explorations.map((idea, i) => (
            <li className="idea" key={idea.title}>
              <span className="idx">{idea.index}</span>
              <div className="idea-copy">
                <h3 className="p-title--sm">
                  <span className="title-mark" {...ed(`explorations[${i}].title`)}>
                    {idea.title}
                  </span>
                  {idea.status && (
                    <span className="idea-tag" {...ed(`explorations[${i}].status`)}>
                      {idea.status}
                    </span>
                  )}
                </h3>
                <p className="p-desc" {...ed(`explorations[${i}].description`)}>
                  {idea.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ContactCTA />
    </div>
  );
}
