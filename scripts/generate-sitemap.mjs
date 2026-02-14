#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * ビルド前にcontent/配下のMDXファイルからsitemap.xmlを生成する。
 * `output: 'export'` 環境では Route Handlers が使えないため、
 * 静的ファイルとして public/sitemap.xml を生成する。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT = path.join(ROOT, 'public', 'sitemap.xml');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://public-docs-phi.vercel.app';
const SECTIONS = ['templates', 'guides', 'troubleshooting', 'changelog'];

function getMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
}

const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { loc: '/', priority: '1.0' },
  { loc: '/templates', priority: '0.9' },
  { loc: '/guides', priority: '0.9' },
  { loc: '/troubleshooting', priority: '0.9' },
  { loc: '/changelog', priority: '0.7' },
];

const articlePages = [];
for (const section of SECTIONS) {
  const files = getMdxFiles(path.join(CONTENT_DIR, section));
  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '');
    articlePages.push({ loc: `/${section}/${slug}`, priority: '0.8' });
  }
}

const allPages = [...staticPages, ...articlePages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`Sitemap generated: ${OUTPUT} (${allPages.length} URLs)`);
