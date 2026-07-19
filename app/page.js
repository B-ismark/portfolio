import HeroCard from './components/HeroCard';
import NdaCard from './components/NdaCard';
import ProductCard from './components/ProductCard';
import ShushCursor from './components/ShushCursor';
import ContactCTA from './components/ContactCTA';
import LocalTime from './components/LocalTime';
import { hero, clients, products, site } from './content';
import { ed } from './lib/edit';

export default function Home() {
  const h = site.home;
  return (
    <div className="wrap">
      <section className="lead reveal" style={{ '--d': '0ms' }}>
        <h1 className="lead-headline">
          {/* pink misregistration plate — an aria-hidden duplicate of the poster
              line, offset behind the black one. Duplicated markup (not a pseudo)
              so it wraps identically to the real line, em padding and all; only
              .lead-lines is split/animated, never this ghost. */}
          <span className="lead-ghost" aria-hidden="true">
            {h.leadHeadline}
            {' '}
            <em>{h.leadHeadlineEm}</em>
          </span>
          <span className="lead-lines">
            <span {...ed('site.home.leadHeadline')}>{h.leadHeadline}</span>{' '}
            <em {...ed('site.home.leadHeadlineEm')}>{h.leadHeadlineEm}</em>
          </span>
          <span className="lead-tail" {...ed('site.home.leadHeadlineTail')}>
            {h.leadHeadlineTail}
          </span>
        </h1>
        <div className="lead-spec">
          <p className="lead-meta">
            <span className="lead-now">
              <span className="dot" aria-hidden="true" />
              <span {...ed('site.home.currentStatus')}>{h.currentStatus}</span>
            </span>
            <LocalTime />
          </p>
          <div className="worked-with">
            <span className="eyebrow" {...ed('site.home.workedWithLabel')}>
              {h.workedWithLabel}
            </span>
            <ul className="worked-with-list">
              {h.workedWith.map((w, i) => (
                <li key={w} {...ed(`site.home.workedWith[${i}]`)}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        className="section section--lead-work reveal"
        style={{ '--d': '150ms' }}
        aria-labelledby="work-h"
      >
        <div className="section-head">
          <h2 id="work-h" className="eyebrow" {...ed('site.home.selectedWorkLabel')}>
            {h.selectedWorkLabel}
          </h2>
          <span className="eyebrow s-count" {...ed('site.home.selectedWorkCount')}>
            {h.selectedWorkCount}
          </span>
        </div>
        <HeroCard {...hero} editBase="hero" />
      </section>

      <section className="section" data-reveal aria-labelledby="client-h">
        <div className="section-head">
          <h2 id="client-h" className="eyebrow" {...ed('site.home.clientWorkLabel')}>
            {h.clientWorkLabel}
          </h2>
          <span className="eyebrow s-count" {...ed('site.home.clientWorkCount')}>
            {h.clientWorkCount}
          </span>
        </div>
        <p className="section-note" {...ed('site.home.clientNote')}>
          {h.clientNote}
        </p>
        <div className="clients">
          {clients.map((c, i) => (
            <NdaCard key={c.index} {...c} editBase={`clients[${i}]`} />
          ))}
        </div>
      </section>

      <section className="section" data-reveal aria-labelledby="ship-h">
        <div className="section-head">
          <h2 id="ship-h" className="eyebrow" {...ed('site.home.shippedLabel')}>
            {h.shippedLabel}
          </h2>
          <span className="eyebrow s-count" {...ed('site.home.shippedCount')}>
            {h.shippedCount}
          </span>
        </div>
        <div className="products">
          {products.map((p, i) => (
            <ProductCard key={p.index} {...p} editBase={`products[${i}]`} />
          ))}
        </div>
      </section>

      <ContactCTA />

      <ShushCursor />
    </div>
  );
}
