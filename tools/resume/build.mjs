// Rebuilds the résumé as a PDF matching the original Google Docs template.
//
// Geometry, fonts and colours were reverse-engineered from the shipped
// public/bismark-gyau-resume.pdf:
//   page      612x792pt (US Letter)
//   columns   label x=57.8pt (w 177.7), content x=235.5pt -> 554pt
//   rules     2pt solid #000, content column only
//   fonts     Raleway 700 (display/labels), Lato 400/700 (body)
//   colours   ink #000, green #274e13, link #1155cc, date grey #666666
//
// The fonts are vendored under ./fonts (Lato and Raleway, both SIL Open Font
// License) and inlined as data URIs, so the PDF embeds them and the build needs
// no network access.
//
// Usage: npm run resume            -> writes public/bismark-gyau-resume.pdf
//        node tools/resume/build.mjs [out.pdf]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const font = (f) => fs.readFileSync(path.join(HERE, 'fonts', f)).toString('base64');

// playwright-core ships no browser of its own, so find one: an explicit override
// first, then the image-provided Chromium, then whatever Playwright registered.
function findChromium() {
  const candidates = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  throw new Error(
    'No Chromium found. Set CHROME_PATH to a Chrome/Chromium binary, or run `npx playwright install chromium`.',
  );
}

// --- tunables: adjust to land on exactly one page -------------------------
const T = {
  sectionGap: 8,      // pt between sections
  bodyLead: 13.5,      // pt, body line-height
  bulletLead: 12,      // pt, bullet line-height
  roleSize: 13,        // pt, the green title under the name
  bulletGap: 2,        // pt between bullets
  jobGap: 10,          // pt between roles inside Experience
};

const faces = `
@font-face{font-family:Lato;font-weight:400;font-style:normal;src:url(data:font/woff2;base64,${font('lato-400.woff2')}) format('woff2')}
@font-face{font-family:Lato;font-weight:700;font-style:normal;src:url(data:font/woff2;base64,${font('lato-700.woff2')}) format('woff2')}
@font-face{font-family:Raleway;font-weight:700;font-style:normal;src:url(data:font/woff2;base64,${font('raleway-700.woff2')}) format('woff2')}
`;

// --- content --------------------------------------------------------------
const bullet = (s) => `<li>${s}</li>`;

const job = (co, role, dates, bullets) => `
<div class="job">
  <div class="job-head">
    <p class="job-title"><b>${co}/</b> ${role}</p>
    <p class="job-dates">${dates}</p>
  </div>
  <ul>${bullets.map(bullet).join('')}</ul>
</div>`;

const section = (label, body) => `
<section>
  <div class="label"><span class="dash"></span>${label}</div>
  <div class="content">${body}</div>
</section>`;

const html = `<!doctype html><meta charset="utf-8"><title>Bismark Kwadwo Gyau — Résumé</title>
<style>
${faces}
@page { size: 612pt 792pt; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:612pt; }
body {
  font-family: Lato, sans-serif; font-size:10pt; color:#000;
  padding: 57pt 58pt 24pt 57.8pt;
  -webkit-font-smoothing: antialiased;
}
section, .head { display:grid; grid-template-columns: 177.7pt 318.5pt; }
.head { margin-bottom:${T.sectionGap}pt; }
section { margin-bottom:${T.sectionGap}pt; break-inside:avoid; }

/* left label column */
.name { font-family:Raleway; font-weight:700; font-size:24pt; line-height:28.5pt; letter-spacing:-0.3pt; }
.role { font-family:Raleway; font-weight:700; font-size:${T.roleSize}pt; line-height:18pt; color:#274e13; margin-top:2pt; }
.label { font-family:Raleway; font-weight:700; font-size:12pt; line-height:12pt; padding-top:6pt; }
/* the template's "ㅡ" separator, drawn rather than set in Gulim */
.dash { display:block; width:13pt; height:1.6pt; background:#000; margin-bottom:9pt; }

/* right content column — every section carries the 2pt poster rule */
.content { border-top:2pt solid #000; padding-top:8pt; }
.head .content { border-top:2pt solid #000; padding-top:8pt; }
.contact { line-height:12pt; }
.contact .sp { display:block; height:10pt; }
a { color:#1155cc; text-decoration:underline; }

p { line-height:${T.bodyLead}pt; }
p + p { margin-top:6pt; }

/* skills: label + value rows */
.skill { display:grid; grid-template-columns:52pt 1fr; line-height:${T.bulletLead}pt; }
.skill + .skill { margin-top:4pt; }
.skill b { font-weight:700; }

/* experience */
.job + .job { margin-top:${T.jobGap}pt; }
.job-head { display:flex; justify-content:space-between; align-items:baseline; gap:10pt; margin-bottom:4pt; }
.job-title { font-size:11pt; line-height:13pt; }
.job-dates { font-size:9pt; color:#666; line-height:11pt; white-space:nowrap; }
ul { list-style:none; }
li { position:relative; padding-left:18pt; line-height:${T.bulletLead}pt; }
li + li { margin-top:${T.bulletGap}pt; }
li::before { content:"\\25CF"; position:absolute; left:0; font-family:"Liberation Sans",Arial,sans-serif; font-size:8pt; top:0.2pt; }

/* projects */
.proj-note { font-size:9pt; color:#666; font-style:italic; margin-bottom:4pt; line-height:11pt; }

.ed { line-height:13pt; }
.ed + .ed { margin-top:4pt; }
.ed .d { font-size:9pt; color:#666; }
</style>

<div class="head">
  <div>
    <div class="name">Bismark<br>Kwadwo Gyau</div>
    <div class="role">Product Designer &middot; UI/UX</div>
  </div>
  <div class="content contact">
    Takoradi, Ghana (Remote)
    <span class="sp"></span>
    +233 54 947 7402<br>
    <a href="mailto:bismarkgyau@gmail.com">bismarkgyau@gmail.com</a><br>
    <a href="https://bismarkportfolio.vercel.app">bismarkportfolio.vercel.app</a><br>
    <a href="https://www.linkedin.com/in/bismark-gyau">linkedin.com/in/bismark-gyau</a>
  </div>
</div>

${section('Profile', `<p>Product designer, 3+ years across web, mobile, and desktop. I start at the problem, not the
screen, and would rather put a working thing in front of people than a static mockup. Most of
my work is design systems, accessibility, and getting things shipped.</p>`)}

${section('Skills', `
<div class="skill"><b>Design</b><span>Figma, Adobe XD, Framer &middot; design systems, design tokens, prototyping, interaction design</span></div>
<div class="skill"><b>Research</b><span>Usability testing, user research, design thinking, discovery-to-delivery ownership</span></div>
<div class="skill"><b>Practice</b><span>Accessibility (WCAG AA) &middot; tone-of-voice and editorial guidelines &middot; AI-assisted prototyping &middot; Agile</span></div>`)}

${section('Experience', [
  job('AmaliTech', 'Associate UI/UX Designer', '2024 &ndash; Present', [
    'Co-led the website rebuild off an outgrown WordPress template onto a CMS the team owns &mdash; <b>+15% time on site</b>.',
    'Built the design system, tone of voice, and editorial guidelines from scratch; the team now publishes on-brand without a designer in the loop.',
    '<b>Deutsche Telekom</b> (ongoing): redesigning several platforms onto their OneDesign system, tightening UX along the way.',
    '<b>Brock</b>: modernised the platform UI in a short, focused engagement.',
  ]),
  job('AmaliTech', 'Junior Associate UI/UX Designer', '2023 &ndash; 2024', [
    'Designed user-management and asset-tracking platforms across multiple product teams.',
    'Supported accessibility-focused mobile app development as UI and interaction designer.',
  ]),
  job('Freelance', 'Product Designer', '2022 &ndash; 2023', [
    'Research, wireframes, and prototypes for startups and NGOs.',
  ]),
].join(''))}

${section('Selected Projects', `
<p class="proj-note">Self-directed products &mdash; designed, then taken all the way to working software</p>
<ul>
  <li><b>Meeting room booking</b> &mdash; search by time, capacity, and amenities; drag to create; conflict detection so nothing double-books. Recurring bookings, ICS export, utilisation reports. <b>~30% faster to book.</b></li>
  <li><b>Weaver</b> &mdash; reads your taste from what you&rsquo;ve saved, then surfaces new work ranked to it, keeping room for exploration rather than replaying your history. Shipped as a PWA.</li>
</ul>`)}

${section('Education &amp; Certifications', `
<div class="ed"><b>University of Cape Coast, Ghana</b> / BSc Computer Science <span class="d">&middot; 2018 &ndash; 2022</span></div>
<div class="ed"><b>IBM</b> / Enterprise Design Thinking Co-Creator <span class="d">&middot; 2023</span></div>
<div class="ed"><b>Coursera</b> / Google UX Design <span class="d">&middot; 2023</span></div>`)}
`;

const out = process.argv[2] || path.join(ROOT, 'public', 'bismark-gyau-resume.pdf');

// Chromium writes no /Title or /Author, which leaves Document Properties blank and
// the only copy of the full name split across the two display lines. Stamp a proper
// /Info dictionary via a PDF incremental update: append a replacement object 1,
// then a new xref section whose trailer chains to the old one with /Prev. Nothing
// earlier in the file moves, so every existing byte offset stays valid.
// ASCII only — avoids any text-string encoding ambiguity.
// Skia stamps a wall-clock /CreationDate and /ModDate, the only non-deterministic
// bytes in its output — which would make this committed binary churn on every
// rebuild even when nothing changed. Pin them to the résumé's revision date
// instead (bump it when you revise the content) so `npm run resume` is
// reproducible and a diff always means a real change.
const REVISED = process.env.RESUME_DATE || '20260811000000';
const PDF_DATE = `D:${REVISED}+00'00'`;

const META = {
  Title: 'Bismark Kwadwo Gyau - Resume',
  Author: 'Bismark Kwadwo Gyau',
  Subject: 'Product Designer - UI/UX',
  Creator: 'tools/resume/build.mjs',
  CreationDate: PDF_DATE,
  ModDate: PDF_DATE,
};

function stampMetadata(file) {
  let orig = fs.readFileSync(file);

  // The superseded object 1 keeps its bytes in the file, so its wall-clock dates
  // have to be normalised in place too — not just overridden in the replacement
  // dict. Equal-length substitution only, so no byte offset moves.
  orig = Buffer.from(
    orig.toString('latin1').replace(
      /\/(CreationDate|ModDate)\s*\(D:[^)]*\)/g,
      (m, key) => {
        const next = `/${key} (${PDF_DATE})`;
        return next.length === m.length ? next : m;
      },
    ),
    'latin1',
  );

  const s = orig.toString('latin1');

  const trailer = s.lastIndexOf('trailer');
  const startxref = s.lastIndexOf('startxref');
  if (trailer === -1 || startxref === -1) throw new Error('unexpected PDF layout: no trailer');
  const root = /\/Root\s+(\d+)\s+(\d+)\s*R/.exec(s.slice(trailer));
  const info = /\/Info\s+(\d+)\s+(\d+)\s*R/.exec(s.slice(trailer));
  const size = /\/Size\s+(\d+)/.exec(s.slice(trailer));
  const prev = /startxref\s+(\d+)/.exec(s.slice(startxref));
  if (!root || !info || !size || !prev) throw new Error('unexpected PDF layout: trailer keys');

  const infoNum = Number(info[1]);
  const esc = (v) => v.replace(/([\\()])/g, '\\$1');
  const dict =
    `<<` + Object.entries(META).map(([k, v]) => `/${k} (${esc(v)})`).join(' ') + `>>`;

  const objOffset = orig.length;
  const obj = `${infoNum} 0 obj\n${dict}\nendobj\n`;
  const xrefOffset = objOffset + Buffer.byteLength(obj, 'latin1');
  const entry = (off, gen, type) =>
    `${String(off).padStart(10, '0')} ${String(gen).padStart(5, '0')} ${type} \n`;
  const xref =
    `xref\n0 1\n${entry(0, 65535, 'f')}${infoNum} 1\n${entry(objOffset, 0, 'n')}` +
    `trailer\n<</Size ${size[1]} /Root ${root[1]} ${root[2]} R ` +
    `/Info ${infoNum} 0 R /Prev ${prev[1]}>>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  fs.writeFileSync(file, Buffer.concat([orig, Buffer.from(obj + xref, 'latin1')]));
}

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluateHandle('document.fonts.ready');

// The whole point is a ONE-page résumé, and the overflow is silent otherwise —
// so measure the laid-out content and shout if it no longer fits. Tune the T
// values above (or cut copy) until this passes.
const h = await page.evaluate(() => document.body.scrollHeight);
const pt = h * 0.75;
console.log(`content height ${pt.toFixed(1)}pt of 792pt`);

await page.pdf({ path: out, printBackground: true, preferCSSPageSize: true });
await browser.close();
stampMetadata(out);

if (pt > 792) {
  console.error(
    `\n✗ Content overflows onto a second page by ${(pt - 792).toFixed(1)}pt.\n` +
      `  Wrote ${out} anyway so you can look at it, but tighten it before shipping.`,
  );
  process.exit(1);
}
console.log(`✓ one page — wrote ${path.relative(ROOT, out)}`);
