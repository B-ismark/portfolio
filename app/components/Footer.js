import { site } from '../content';
import { ed } from '../lib/edit';

// A quiet sign-off. The contact links used to live here too, but every content
// page now closes on the contact banner (which carries them), so the footer
// stays out of its way — just the name, the one-line colophon, and the base.
export default function Footer() {
  const f = site.footer;
  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div className="foot-id">
          <p className="foot-name" {...ed('site.footer.name')}>{f.name}</p>
          <p className="colophon" {...ed('site.footer.colophon')}>{f.colophon}</p>
        </div>
      </div>
      <div className="wrap foot-base">
        <span className="colophon" {...ed('site.footer.copyright')}>{f.copyright}</span>
        <span className="colophon" {...ed('site.footer.setIn')}>{f.setIn}</span>
      </div>
    </footer>
  );
}
