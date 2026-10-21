import Link from 'next/link';
import ContactCTA from './components/ContactCTA';
import { site } from './content';
import { ed } from './lib/edit';

export const metadata = {
  title: 'Page not found · Bismark Gyau',
  robots: { index: false },
};

// The static export writes this out as 404.html, which the host serves for any
// unknown path — so a stale or mistyped link still lands inside the site.
export default function NotFound() {
  const n = site.notFound;
  return (
    <div className="wrap explorations">
      <p className="eyebrow about-eyebrow reveal" style={{ '--d': '0ms' }} {...ed('site.notFound.eyebrow')}>
        {n.eyebrow}
      </p>

      <div className="about-intro explorations-intro">
        <div className="about-intro-text">
          <h1 className="about-lead reveal" style={{ '--d': '80ms' }}>
            <span className="about-lead-setup" {...ed('site.notFound.lead')}>{n.lead}</span>
            <span className="about-lead-punch">
              <em {...ed('site.notFound.leadEm')}>{n.leadEm}</em>
            </span>
          </h1>
        </div>
      </div>

      <nav className="section reveal" style={{ '--d': '150ms' }} aria-labelledby="nf-h">
        <div className="section-head">
          <h2 id="nf-h" className="eyebrow" {...ed('site.notFound.linksLabel')}>
            {n.linksLabel}
          </h2>
        </div>
        <ul className="nf-links">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link className="work-back" href={item.href}>
                {item.label} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ContactCTA />
    </div>
  );
}
