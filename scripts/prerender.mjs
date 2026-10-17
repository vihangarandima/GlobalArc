// Writes a fully rendered HTML file for every route, plus sitemap.xml, so
// search engines and AI crawlers see the content and the right meta without
// running JavaScript. Runs after `vite build` and the SSR build (see
// package.json). The browser still renders the app as before on load.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, 'dist-ssr');

const { render, ROUTES, pageMeta, headTags, sitemapXml } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);

const template = await readFile(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is missing the <!--seo--> or #root placeholder');
}

for (const route of ROUTES) {
  const html = template
    .replace('<!--seo-->', () => headTags(pageMeta(route)))
    .replace('<div id="root"></div>', () => `<div id="root">${render(route)}</div>`);
  const file = route === '/' ? join(dist, 'index.html') : join(dist, route, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerendered ${route}`);
}

await writeFile(join(dist, 'sitemap.xml'), sitemapXml());
console.log('wrote sitemap.xml');

await rm(ssr, { recursive: true, force: true });
