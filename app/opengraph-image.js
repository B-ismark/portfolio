import { ImageResponse } from 'next/og';

// Required so the image is generated at build time for `output: export`.
export const dynamic = 'force-static';

export const alt = 'Bismark Gyau · product designer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Typographic OG card, generated at build so shared links render a real preview.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fcfcfc',
          color: '#141414',
          padding: 88,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#2540c0',
          }}
        >
          Bismark Gyau
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -1,
            textTransform: 'uppercase',
          }}
        >
          <span>A product designer who</span>
          <span>starts at</span>
          <span
            style={{
              alignSelf: 'flex-start',
              background: '#ff4d9a',
              color: '#141414',
              padding: '2px 14px',
            }}
          >
            the problem, not the screen.
          </span>
        </div>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#67645b',
          }}
        >
          Product designer · Ghana
        </div>
      </div>
    ),
    { ...size }
  );
}
