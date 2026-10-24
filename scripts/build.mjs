import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public');
const html = await readFile(path.join(source, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(https?|mailto):/.test(target) || target === '#') continue;
  if (target.startsWith('#')) {
    if (!ids.has(target.slice(1))) throw new Error(`Missing anchor: ${target}`);
  } else {
    await readFile(path.join(source, target));
  }
}
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(source, path.join(root, 'dist'), { recursive: true });
console.log('Built dist/ and verified local assets and navigation anchors.');
