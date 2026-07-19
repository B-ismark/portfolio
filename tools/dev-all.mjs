// Runs `next dev` and the edit-server together, so `npm run edit` gives you the
// site + the in-browser content editor with one command. Ctrl-C stops both.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const opts = { cwd: ROOT, stdio: 'inherit', shell: true };

const next = spawn('npx next dev', opts);
const editServer = spawn(`node "${join('tools', 'edit-server.mjs')}"`, opts);

const kids = [next, editServer];
const stop = () => {
  for (const k of kids) {
    if (!k.killed) k.kill();
  }
};

for (const k of kids) {
  k.on('exit', (code) => {
    stop();
    process.exit(code ?? 0);
  });
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
