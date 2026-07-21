import { Big_Shoulders, Archivo } from 'next/font/google';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import './globals.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';
import SmoothScroll from './components/SmoothScroll';
import HeadlineReveal from './components/HeadlineReveal';
import ScrollTop from './components/ScrollTop';
import PageTransition from './components/PageTransition';
import ClarityAnalytics from './components/ClarityAnalytics';

// DEV-ONLY in-browser content editor. Loaded lazily and only in development, so
// its chunk is never fetched by the production/static-export site.
const EditLayer =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('./components/EditLayer'))
    : () => null;

// Big Shoulders — an industrial poster grotesque; the display voice, set large
// and (mostly) uppercase. A deliberate break from the delicate-serif look.
const display = Big_Shoulders({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

// Archivo — a clean grotesque for body and labels (normal + italic).
const archivo = Archivo({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-archivo',
});

const DESCRIPTION =
  'A product designer who starts at the problem, not the screen, across live web platforms, enterprise systems, and the products in between.';

// Mobile browser-chrome colour. Updated live by ThemeToggle on manual switch;
// this value is the initial paint for a first-time (light) visitor.
export const viewport = {
  themeColor: '#f4f1ea',
};

export const metadata = {
  // TODO: set to the real deployed domain so OG/canonical URLs resolve correctly
  metadataBase: new URL('https://bismarkgyau.com'),
  title: 'Bismark Gyau · product designer',
  description: DESCRIPTION,
  openGraph: {
    title: 'Bismark Gyau · product designer',
    description: DESCRIPTION,
    siteName: 'Bismark Gyau',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bismark Gyau · product designer',
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${archivo.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes on <body> before React hydrates,
          which is harmless but otherwise logs a mismatch warning. */}
      <body suppressHydrationWarning>
        {/* Resolve the theme *before* paint so there's no light-to-dark flash:
            an explicit stored choice wins, else the OS preference. Writing
            data-theme also means CSS never has to fall back to the media query,
            keeping the toggle and system pref in agreement. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var e=document.documentElement,t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';e.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#000000':'#f4f1ea')}catch(e){}`}
        </Script>
        {/* Mark JS live *before* paint, so scroll-reveal only hides content when
            it can also reveal it (no-JS keeps everything visible). Also stage the
            lead headline hidden up front (unless reduced-motion) so its masked
            line-rise is the load motion, not a second animation after the fade. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`try{var d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('gsap-lead')}catch(e){}`}
        </Script>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <PageTransition />
        <ScrollTop />
        <SmoothScroll />
        <ScrollReveal />
        <HeadlineReveal />
        <EditLayer />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
