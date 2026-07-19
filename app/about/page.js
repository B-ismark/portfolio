import ContactCTA from '../components/ContactCTA';
import { about, site } from '../content';
import { ed, edImg, edAlt, edHref } from '../lib/edit';

const DESCRIPTION = about.metaDescription;

// The résumé is a primary artifact on an about page, so surface it up by the
// intro rather than leaving it to the contact banner alone. Same source of
// truth as the banner (the footer link list), found by its PDF href.
const RESUME_INDEX = site.footer.elsewhere.findIndex((l) =>
  l.href.toLowerCase().endsWith('.pdf')
);
const resume = RESUME_INDEX >= 0 ? site.footer.elsewhere[RESUME_INDEX] : null;

export const metadata = {
  title: 'About · Bismark Gyau',
  description: DESCRIPTION,
  openGraph: { title: 'About · Bismark Gyau', description: DESCRIPTION },
};

export default function About() {
  return (
    <div className="wrap about">
      <p className="eyebrow about-eyebrow reveal" style={{ '--d': '0ms' }} {...ed('about.eyebrow')}>
        {about.eyebrow}
      </p>

      <div className="about-intro">
        <div className="about-intro-text">
          <h1 className="about-lead reveal" style={{ '--d': '80ms' }}>
            <span className="about-lead-setup" {...ed('about.lead')}>{about.lead}</span>
            <span className="about-lead-punch">
              <em {...ed('about.leadEm')}>{about.leadEm}</em>
            </span>
          </h1>
          {resume && (
            <a
              className="about-resume reveal"
              style={{ '--d': '140ms' }}
              href={resume.href}
              {...(resume.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...edHref(`site.footer.elsewhere[${RESUME_INDEX}].href`)}
            >
              Download{' '}
              <span {...ed(`site.footer.elsewhere[${RESUME_INDEX}].label`)}>{resume.label}</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          )}
        </div>
        <figure className="about-photo reveal" style={{ '--d': '150ms' }} data-develop>
          <img
            src={about.portrait.src}
            alt={about.portrait.alt}
            {...edImg('about.portrait.src')}
            {...edAlt('about.portrait.alt')}
          />
        </figure>
      </div>

      {/* headed sections, our numbered poster style (shared with case studies) */}
      <div className="work-body about-sections">
        {about.sections.map((s, i) => (
          <section className="work-section" data-reveal key={s.heading}>
            <div className="work-sec-copy">
              <div className="work-sec-head">
                <span className="work-sec-num" data-n={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="work-sec-title" {...ed(`about.sections[${i}].heading`)}>
                  {s.heading}
                </h2>
              </div>
              {s.body.map((p, j) => (
                <p key={j} {...ed(`about.sections[${i}].body[${j}]`)}>
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <ContactCTA />
    </div>
  );
}
