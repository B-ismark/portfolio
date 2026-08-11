// Image optimizer for the static export.
//
// The site emits raw PNG/JPG screenshots (some >1MB) with next/image disabled
// (output: 'export', images.unoptimized). This walks the screenshot set, writes
// resized WebP variants next to each source, and emits a manifest the <img>
// helper (app/lib/img.js) reads to build `srcset` + intrinsic width/height.
//
// Run:  node tools/optimize-images.mjs
// Idempotent — re-encodes from the originals each time (safe to rerun).

import { readdir, stat, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, relative, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

// Directories (relative to /public) whose raster images get optimized.
const DIRS = ['work'];
// Individual files (relative to /public) to include beyond the dirs above.
const FILES = ['bismark.jpg'];

// Target widths. A variant is only written when it's smaller than the effective
// (post-crop) source width, plus one variant clamped to that width itself.
const WIDTHS = [400, 800, 1200, 1600];
// Skip a candidate width that lands within 15% of the full-size variant — two
// near-identical files help nobody and just pad the export.
const NEAR_DUPE = 0.85;
const RASTER = new Set(['.png', '.jpg', '.jpeg']);

// Encode defaults. quality 84 (up from 80, which visibly mushed UI text and
// skin tones to save ~13% of the bytes), effort 6 = libwebp's densest search,
// and smartSubsample recovers chroma detail on hard edges for essentially free.
const DEFAULTS = { quality: 84, effort: 6, smartSubsample: true };

// Per-source overrides, keyed by web path; anything unlisted uses DEFAULTS.
//
// `aspect` (width / height) pre-crops the source to the aspect the LAYOUT shows
// before resizing, so every encoded pixel is one the visitor actually sees.
const OVERRIDES = {
  // The about-page portrait: a 3:2 landscape photo displayed in a 4:5 portrait
  // plate (`.about-photo img` — aspect-ratio 4/5 + object-fit: cover). The
  // browser was cropping ~47% of the width away at paint time, so the encoder
  // had been spending its bits on pixels the page never showed while the visible
  // slice — barely 426px of real detail — got stretched across the plate. The
  // centred crop below is pixel-for-pixel what object-fit already displayed, so
  // the composition is unchanged; it just stops the waste. Photographic content
  // also needs a higher quality than flat UI screenshots.
  //
  // KEEP `aspect` IN SYNC with `.about-photo img { aspect-ratio }` in
  // app/globals.css — they describe the same crop from two ends.
  '/bismark.jpg': { aspect: 4 / 5, quality: 92 },
};

// Largest centred region of w×h matching `aspect` (width / height) — the same
// region `object-fit: cover` picks, expressed as a sharp extract().
function coverCrop(w, h, aspect) {
  if (w / h > aspect) {
    const cw = Math.round(h * aspect);
    return { left: Math.round((w - cw) / 2), top: 0, width: cw, height: h };
  }
  const ch = Math.round(w / aspect);
  return { left: 0, top: Math.round((h - ch) / 2), width: w, height: ch };
}

// Drop this source's previously generated variants first, so a changed width
// ladder can't leave orphaned .webp files behind for the export to copy. Matched
// strictly (`stem-<digits>.webp`) so a sibling like `home-feed-400.webp` is
// never mistaken for a variant of `home.jpg`.
async function clearVariants(dir, stem) {
  const re = new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+\\.webp$`);
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(
    entries.filter((n) => re.test(n)).map((n) => rm(join(dir, n), { force: true })),
  );
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (RASTER.has(extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function collect() {
  const set = new Set();
  for (const d of DIRS) for (const f of await walk(join(PUBLIC, d))) set.add(f);
  for (const f of FILES) {
    const full = join(PUBLIC, f);
    try {
      await stat(full);
      set.add(full);
    } catch {}
  }
  return [...set].sort();
}

// "/work/amalitech/hero.png" style web path for a public/ file.
const webPath = (full) => '/' + relative(PUBLIC, full).split(/[\\/]/).join('/');

async function encode(full) {
  const { aspect, ...webp } = { ...DEFAULTS, ...(OVERRIDES[webPath(full)] || {}) };
  const meta = await sharp(full).metadata();
  const srcW = meta.width || 0;
  const srcH = meta.height || 0;
  const dir = dirname(full);
  const stem = basename(full, extname(full));

  // With an `aspect` override the crop becomes the EFFECTIVE source: it drives
  // the width ladder and the manifest's intrinsic size, so the <img> width and
  // height finally describe what the layout renders rather than the raw file.
  const crop = aspect ? coverCrop(srcW, srcH, aspect) : null;
  const effW = crop ? crop.width : srcW;
  const effH = crop ? crop.height : srcH;

  // Unique target widths below the effective width, always including that width
  // so the largest variant is full detail (used by the lightbox).
  const widths = [
    ...new Set(WIDTHS.filter((w) => w < effW * NEAR_DUPE).concat(effW)),
  ].sort((a, b) => a - b);

  await clearVariants(dir, stem);

  const variants = [];
  for (const w of widths) {
    const outName = `${stem}-${w}.webp`;
    const outFull = join(dir, outName);
    const pipe = sharp(full);
    if (crop) pipe.extract(crop);
    await pipe.resize({ width: w, withoutEnlargement: true }).webp(webp).toFile(outFull);
    variants.push({ w, path: webPath(outFull) });
  }

  return {
    width: effW,
    height: effH,
    // Only present when the variants are a crop of the source, so it's obvious
    // why these dimensions don't match the raw file on disk.
    ...(crop ? { cropped: `${aspect.toFixed(3)} (from ${srcW}×${srcH})` } : {}),
    variants, // ascending by width
  };
}

async function main() {
  const files = await collect();
  const manifest = {};
  let savedFrom = 0;
  let savedTo = 0;

  for (const full of files) {
    const before = (await stat(full)).size;
    const entry = await encode(full);
    manifest[webPath(full)] = entry;
    const largest = entry.variants[entry.variants.length - 1];
    const after = (await stat(join(PUBLIC, largest.path.slice(1)))).size;
    savedFrom += before;
    savedTo += after;
    const pct = Math.round((1 - after / before) * 100);
    console.log(
      `${webPath(full).padEnd(42)} ${entry.width}px  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (largest webp, -${pct}%)`,
    );
  }

  const outDir = join(ROOT, 'app', 'lib');
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, 'img-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );

  console.log(
    `\n${files.length} images. Largest-variant total ${(savedFrom / 1024 / 1024).toFixed(1)}MB → ${(savedTo / 1024 / 1024).toFixed(1)}MB. Manifest: app/lib/img-manifest.json`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
