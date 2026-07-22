// Image optimizer for the static export.
//
// The site emits raw PNG/JPG screenshots (some >1MB) with next/image disabled
// (output: 'export', images.unoptimized). This walks the screenshot set, writes
// resized WebP variants next to each source, and emits a manifest the <img>
// helper (app/lib/img.js) reads to build `srcset` + intrinsic width/height.
//
// Run:  node tools/optimize-images.mjs
// Idempotent — re-encodes from the originals each time (safe to rerun).

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

// Directories (relative to /public) whose raster images get optimized.
const DIRS = ['work'];
// Individual files (relative to /public) to include beyond the dirs above.
const FILES = ['bismark.jpg'];

// Target widths. A variant is only written when it's smaller than the source
// (never upscale), plus one variant clamped to the source width itself.
const WIDTHS = [400, 800, 1200, 1600];
const QUALITY = 80;
const RASTER = new Set(['.png', '.jpg', '.jpeg']);

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
  const img = sharp(full);
  const meta = await img.metadata();
  const srcW = meta.width || 0;
  const srcH = meta.height || 0;
  const dir = dirname(full);
  const stem = basename(full, extname(full));

  // Unique target widths ≤ source width, always including the source width so
  // the largest variant is full quality (used by the lightbox).
  const widths = [...new Set(WIDTHS.filter((w) => w < srcW).concat(srcW))].sort(
    (a, b) => a - b,
  );

  const variants = [];
  for (const w of widths) {
    const outName = `${stem}-${w}.webp`;
    const outFull = join(dir, outName);
    await sharp(full)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outFull);
    variants.push({ w, path: webPath(outFull) });
  }

  return {
    width: srcW,
    height: srcH,
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
