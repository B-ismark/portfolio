// Local, DEV-ONLY save-server for the in-browser content editor.
//
// Listens on 127.0.0.1:4000 and does exactly three things:
//   GET  /ping     -> liveness check for the editor toolbar
//   POST /content  -> apply {patches:[{path,value}]} into app/content.json
//   POST /upload   -> save an uploaded image under public/work/uploads
//
// It writes ONLY to app/content.json and files under public/work/uploads —
// nothing else. Never run this on a public interface; it's a localhost tool.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'app', 'content.json');
const UPLOAD_DIR = join(ROOT, 'public', 'work', 'uploads');
const UPLOAD_URL = '/work/uploads';

const PORT = 4000;
const HOST = '127.0.0.1';
const MAX_BODY = 30 * 1024 * 1024; // 30 MB (room for an image)
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

// ---- path helpers ----------------------------------------------------------
const parsePath = (p) =>
  String(p)
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

function setPath(obj, path, value) {
  const keys = parsePath(path);
  if (!keys.length) throw new Error('empty path');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (UNSAFE_KEYS.has(k)) throw new Error(`unsafe key: ${k}`);
    if (o[k] == null) o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[k];
  }
  const last = keys[keys.length - 1];
  if (UNSAFE_KEYS.has(last)) throw new Error(`unsafe key: ${last}`);
  o[last] = value;
}

// ---- http helpers ----------------------------------------------------------
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function send(res, code, body) {
  const json = JSON.stringify(body);
  res.writeHead(code, { ...CORS, 'Content-Type': 'application/json' });
  res.end(json);
}

function readBody(req) {
  return new Promise((res, rej) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        rej(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        res(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        rej(new Error('invalid JSON body'));
      }
    });
    req.on('error', rej);
  });
}

// ---- handlers --------------------------------------------------------------
async function applyPatches(patches) {
  if (!Array.isArray(patches)) throw new Error('patches must be an array');
  const data = JSON.parse(await readFile(CONTENT, 'utf8'));
  for (const { path, value } of patches) setPath(data, path, value);
  await writeFile(CONTENT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return patches.length;
}

async function saveUpload({ name, dataUrl }) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl || '');
  if (!m) throw new Error('expected a base64 image data URL');
  const safe = basename(String(name || 'image'))
    .replace(/[^\w.-]/g, '_')
    .replace(/^_+/, '')
    .slice(-80) || 'image';
  const stamped = `${Date.now()}-${safe}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, stamped), Buffer.from(m[2], 'base64'));
  return `${UPLOAD_URL}/${stamped}`;
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS);
      res.end();
      return;
    }
    if (req.method === 'GET' && req.url === '/ping') {
      return send(res, 200, { ok: true });
    }
    if (req.method === 'GET' && req.url === '/content') {
      return send(res, 200, JSON.parse(await readFile(CONTENT, 'utf8')));
    }
    if (req.method === 'POST' && req.url === '/content') {
      const { patches } = await readBody(req);
      const n = await applyPatches(patches);
      console.log(`✎ applied ${n} change(s) to app/content.json`);
      return send(res, 200, { ok: true, applied: n });
    }
    if (req.method === 'POST' && req.url === '/upload') {
      const body = await readBody(req);
      const path = await saveUpload(body);
      console.log(`🖼  saved upload → public${path}`);
      return send(res, 200, { ok: true, path });
    }
    send(res, 404, { ok: false, error: 'not found' });
  } catch (err) {
    console.error('edit-server error:', err.message);
    send(res, 400, { ok: false, error: err.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  edit-server → http://${HOST}:${PORT}`);
  console.log(`  writing     → app/content.json`);
  console.log(`  uploads     → public${UPLOAD_URL}/`);
  console.log(`  (dev tool — leave running alongside \`next dev\`)\n`);
});
