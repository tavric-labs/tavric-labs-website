import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public');
const pages = ['index.html', 'privacy/index.html'];
for (const page of pages) {
  const html = await readFile(path.join(source, page), 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?|mailto):/.test(target) || target === '#') continue;
    if (target.startsWith('#')) {
      if (!ids.has(target.slice(1))) throw new Error(`Missing anchor in ${page}: ${target}`);
      continue;
    }
    const [file] = target.split('#');
    const resolved = file.startsWith('/') ? file.slice(1) : path.join(path.dirname(page), file);
    await readFile(path.join(source, resolved.endsWith('/') || resolved === '' ? `${resolved}index.html` : resolved));
  }
}
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(source, path.join(root, 'dist'), { recursive: true });
console.log('Built dist/ and verified local assets and navigation anchors.');
