// <img> prop helper backed by the build-time image manifest
// (app/lib/img-manifest.json, produced by tools/optimize-images.mjs).
//
// Given the original source path referenced in content.json (e.g.
// "/work/amalitech/hero.png"), returns props that serve resized WebP variants
// via `srcSet` and reserve layout with intrinsic width/height. If a source has
// no manifest entry (not yet optimized), it degrades to the raw src unchanged.

import manifest from './img-manifest.json';

// Props to spread onto an <img>. `sizes` is the CSS layout width hint the
// browser uses to pick a variant (e.g. "(max-width: 720px) 92vw, 520px").
export function imgProps(src, sizes) {
  const entry = manifest[src];
  if (!entry || !entry.variants || entry.variants.length === 0) {
    return { src };
  }
  const largest = entry.variants[entry.variants.length - 1];
  return {
    src: largest.path, // fallback for engines ignoring srcSet
    srcSet: entry.variants.map((v) => `${v.path} ${v.w}w`).join(', '),
    ...(sizes ? { sizes } : {}),
    width: entry.width,
    height: entry.height,
  };
}

// Path to the full-resolution WebP variant (used by the lightbox / open-full).
export function imgFull(src) {
  const entry = manifest[src];
  if (!entry || !entry.variants || entry.variants.length === 0) return src;
  return entry.variants[entry.variants.length - 1].path;
}
