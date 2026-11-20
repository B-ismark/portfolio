'use client';

import { useRef } from 'react';
import { edImg, edAlt } from '../lib/edit';
import { imgProps, imgFull } from '../lib/img';

// Rendered widths, measured: below 1024px both the lead shot and section shots
// span the column (~92vw). From 1024px up the lead is 964px wide and section
// shots sit in a two-column row at ~500px. `sizes` has to match, or the browser
// picks a variant smaller than the space it fills and the screenshot goes soft.
const LEAD_SIZES = '(max-width: 1023px) 92vw, 964px';
const SECTION_W = 500;
const sectionSizes = (zoom = 1) =>
  `(max-width: 1023px) ${Math.round(92 * zoom)}vw, ${Math.round(SECTION_W * zoom)}px`;

// A lightweight browser-chrome frame to ground a screenshot as a real product.
// `zoom` + `focus` crop into a region to drive a specific point home; `width` /
// `height` are the image's intrinsic pixel size so the browser reserves space
// (no layout shift as it loads). The framed shot is a link to the raw image, so
// with no JS it still opens full-size in a new tab; with JS the click is upgraded
// to an in-page lightbox (a native <dialog> — Esc, focus handling, and inert
// background come for free) so the shot can be viewed properly at full size.
// `editImg` / `editAlt` (dev only) are content.json paths for the in-browser editor.
export default function BrowserMock({
  src,
  alt,
  caption,
  zoom,
  focus,
  width,
  height,
  lead = false,
  editImg: imgPath,
  editAlt: altPath,
}) {
  const dialogRef = useRef(null);

  const open = (e) => {
    // Only intercept a plain click; let modified clicks (open-in-new-tab) and
    // no-JS use the anchor's real href.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  // A click that lands on the dialog itself (the backdrop area around the image)
  // closes it; clicks on the image/controls are stopped from bubbling up.
  const onDialogClick = (e) => {
    if (e.target === dialogRef.current) close();
  };

  const shotStyle = zoom ? { aspectRatio: '16 / 10', overflow: 'hidden' } : undefined;
  const imgStyle = zoom
    ? {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: focus || 'top center',
        transform: `scale(${zoom})`,
        transformOrigin: focus || 'top center',
      }
    : undefined;

  return (
    <div className="mock">
      <div className="mock-bar" aria-hidden="true">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
      </div>

      <a
        className="mock-shot mock-zoom"
        href={imgFull(src)}
        onClick={open}
        style={shotStyle}
        data-develop
        aria-label={`View larger: ${alt}`}
      >
        <img
          width={width}
          height={height}
          {...imgProps(src, lead ? LEAD_SIZES : sectionSizes(zoom || 1))}
          alt={alt}
          loading="lazy"
          style={imgStyle}
          {...edImg(imgPath)}
          {...edAlt(altPath)}
        />
        <span className="mock-zoom-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" />
          </svg>
        </span>
      </a>

      <dialog ref={dialogRef} className="lightbox" onClick={onDialogClick} aria-label={alt}>
        <div className="lightbox-inner">
          <button type="button" className="lightbox-close" onClick={close} aria-label="Close image">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <figure className="lightbox-frame">
            <div className="lightbox-bar" aria-hidden="true">
              <span className="lightbox-dot" />
              <span className="lightbox-barlabel">{alt}</span>
            </div>
            {/* lazy: the dialog is display:none until opened, so the full-size file
                only downloads when someone actually opens it */}
            <img className="lightbox-img" src={imgFull(src)} alt={alt} width={width} height={height} loading="lazy" />
            {caption && <figcaption className="lightbox-cap">{caption}</figcaption>}
          </figure>
        </div>
      </dialog>
    </div>
  );
}
