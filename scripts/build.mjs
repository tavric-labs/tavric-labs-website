import { cp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public');
const exists = (p) => access(p).then(() => true, () => false);

// The course lives in its own repository. When its build output is available
// (COURSES_DIST, or ../courses/dist next to this checkout) it is published at
// /courses/. Without it the site still builds, and every element marked
// data-courses is removed so there are no dead links.
const coursesDist = path.resolve(process.env.COURSES_DIST || path.join(root, '..', 'courses', 'dist'));
const hasCourses = await exists(path.join(coursesDist, 'index.html'));
const isCoursesTarget = (target) => /^\/?courses(\/|$)/.test(target);

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
    if (isCoursesTarget(file)) {
      if (hasCourses) {
        const inside = file.replace(/^\/?courses\/?/, '');
        await readFile(path.join(coursesDist, inside === '' ? 'index.html' : inside.endsWith('/') ? `${inside}index.html` : inside));
      }
      continue;
    }
    const resolved = file.startsWith('/') ? file.slice(1) : path.join(path.dirname(page), file);
    await readFile(path.join(source, resolved.endsWith('/') || resolved === '' ? `${resolved}index.html` : resolved));
  }
}
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(source, path.join(root, 'dist'), { recursive: true });

// Add or remove the course links in the copied pages.
for (const page of pages) {
  const file = path.join(root, 'dist', page);
  let html = await readFile(file, 'utf8');
  if (hasCourses) html = html.replace(/ data-courses(?=[\s>])/g, '');
  else html = html.replace(/<article [^>]*data-courses[^>]*>[\s\S]*?<\/article>\n?/g, '').replace(/<a [^>]*data-courses[^>]*>[\s\S]*?<\/a>/g, '');
  await writeFile(file, html);
}

let note = 'no course build found, so the course links were left out';
if (hasCourses) {
  const fragment = JSON.parse(await readFile(path.join(coursesDist, 'sitemap-fragment.json'), 'utf8'));
  if (fragment.base !== '/courses/') throw new Error(`The course was built for ${fragment.base}, not /courses/`);
  await cp(coursesDist, path.join(root, 'dist', 'courses'), { recursive: true });
  await rm(path.join(root, 'dist', 'courses', 'sitemap-fragment.json'));
  const sitemapFile = path.join(root, 'dist', 'sitemap.xml');
  const entries = fragment.paths.map((p) => `  <url><loc>https://tavric-labs.net/courses/${p}</loc></url>\n`).join('');
  const sitemap = await readFile(sitemapFile, 'utf8');
  if (!sitemap.includes('</urlset>')) throw new Error('sitemap.xml has no closing urlset');
  await writeFile(sitemapFile, sitemap.replace('</urlset>', `${entries}</urlset>`));
  note = `published the course at /courses/ with ${fragment.paths.length} sitemap entries`;
}
console.log(`Built dist/ and verified local assets and navigation anchors; ${note}.`);
