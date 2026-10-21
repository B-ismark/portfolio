import { site } from '../content';
import { ed } from '../lib/edit';

// A quiet sign-off. The contact links used to live here too, but every content
// page now closes on the contact banner (which carries them), so the footer
// stays out of its way: the name and one-line colophon on the left, the
// copyright and sign-off on the right, all on one row.
export default function Footer() {
  const f = site.footer;
  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div className="foot-id">
          <p className="foot-name" {...ed('site.footer.name')}>{f.name}</p>
          <p className="colophon" {...ed('site.footer.colophon')}>{f.colophon}</p>
        </div>
        <p className="foot-base">
          <span className="colophon" {...ed('site.footer.copyright')}>{f.copyright}</span>
          <span className="colophon" {...ed('site.footer.setIn')}>{f.setIn}</span>
        </p>
      </div>
    </footer>
  );
}
