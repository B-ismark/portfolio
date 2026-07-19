'use client';

import { useRef } from 'react';
import { edImg, edAlt } from '../lib/edit';

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
        href={src}
        onClick={open}
        style={shotStyle}
        data-develop
        aria-label={`View larger: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={width}
          height={height}
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
            <img className="lightbox-img" src={src} alt={alt} width={width} height={height} />
            {caption && <figcaption className="lightbox-cap">{caption}</figcaption>}
          </figure>
        </div>
      </dialog>
    </div>
  );
}
