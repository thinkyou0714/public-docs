#!/usr/bin/env node
/**
 * dod-evaluate.mjs
 * 指定された MDX ファイルの DoD 10項目達成状況を評価し、
 * Markdown テーブルを標準出力へ出す。
 *
 * Usage:
 *   node scripts/dod-evaluate.mjs content/templates/tmpl-line-001.mdx
 *   node scripts/dod-evaluate.mjs --exit-on-needs-review content/templates/tmpl-line-001.mdx
 */

import fs from 'fs';
import path from 'path';

function getArgValue(flag, fallback = '') {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : fallback;
}

const exitOnNeedsReview = process.argv.includes('--exit-on-needs-review');
const worstOnly = process.argv.includes('--worst-only');
const emitWorst = Number.parseInt(getArgValue('--emit-worst', '0'), 10) || 0;
const files = process.argv
  .slice(2)
  .filter((p) => p && !p.startsWith('--') && p.endsWith('.mdx'));

function normalizeContent(content) {
  return content.replace(/\r\n/g, '\n');
}

function extractSection(content, heading) {
  const c = normalizeContent(content);
  const headingRegex = new RegExp(`^##\\s*${heading}`, 'm');
  const headingMatch = c.match(headingRegex);
  if (!headingMatch) return '';
  const startIdx = headingMatch.index + headingMatch[0].length;
  const rest = c.substring(startIdx);
  const nextHeading = rest.match(/^##\s/m);
  const sectionText = nextHeading ? rest.substring(0, nextHeading.index) : rest;
  return sectionText.trim();
}

function sectionLength(content, heading) {
  return extractSection(content, heading).length;
}

function countListItems(content, heading) {
  const section = extractSection(content, heading);
  if (!section) return 0;
  const items = section.match(/^[\s]*[-*\d.]+[\s.)\]]/gm);
  return items ? items.length : 0;
}

function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return {};
  const fm = {};
  const lines = fmMatch[1].split(/\r?\n/);
  for (const line of lines) {
    if (/^\s+-/.test(line)) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !key.startsWith('-')) fm[key] = val;
    }
  }
  return fm;
}

const DOD_CHECKS = [
  (_, content) => /^##\s*概要/m.test(content) && sectionLength(content, '概要') > 10,
  (_, content) => /^##\s*前提条件/m.test(content) && sectionLength(content, '前提条件') > 10,
  (_, content) => /^##\s*セットアップ/m.test(content) && sectionLength(content, 'セットアップ') > 30,
  (_, content) => /^##\s*詰まりTOP5/m.test(content) && countListItems(content, '詰まりTOP5') >= 5,
  (_, content) => /^##\s*反証/m.test(content) && countListItems(content, '反証') >= 3,
  (_, content) => /確認|ログ|モニタ|監視/m.test(content) && /^##\s*運用/m.test(content),
  (_, content) => /^##\s*ロールバック/m.test(content) && sectionLength(content, 'ロールバック') > 10,
  (_, content) =>
    !(/https?:\/\/[^\s"]*\.(com|io|jp|app|net)/gi.test(content)) &&
    !(/sk-[a-zA-Z0-9]{20,}/g.test(content)) &&
    !(/xox[bprs]-/g.test(content)),
  (_, content) => /^##\s*FAQ/m.test(content) && countListItems(content, 'FAQ') >= 10,
  (fm, content) => /^##\s*変更履歴/m.test(content) && /last_verified/m.test(content) && fm.template_id != null,
];

if (files.length === 0) {
  if (!worstOnly) console.log('No changed article files.');
  process.exit(0);
}

let fullPass = 0;
let reviewedCount = 0;
const records = [];

if (!worstOnly) {
  console.log('| template_id | file | DoD | status |');
  console.log('|---|---|---:|---|');
}
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  reviewedCount++;
  const raw = fs.readFileSync(file, 'utf-8');
  const content = normalizeContent(raw);
  const fm = parseFrontmatter(content);
  const passCount = DOD_CHECKS.filter((fn) => fn(fm, content)).length;
  const templateId = fm.template_id || '(no ID)';
  const status = passCount === 10 ? 'maintained (10/10)' : 'needs review';
  if (passCount === 10) fullPass++;
  records.push({ templateId, file: path.normalize(file), passCount });
  if (!worstOnly) {
    console.log(`| ${templateId} | ${path.normalize(file)} | ${passCount}/10 | ${status} |`);
  }
}

const needsReview = Math.max(0, reviewedCount - fullPass);
if (!worstOnly) {
  console.log('');
  console.log(`Overall: ${fullPass}/${reviewedCount} changed articles are 10/10.`);
  if (needsReview > 0) {
    console.log(`:warning: DoD review required for ${needsReview} article(s).`);
  } else {
    console.log('✅ All changed articles maintain DoD 10/10.');
  }
}

if (emitWorst > 0) {
  const worst = [...records]
    .sort((a, b) => a.passCount - b.passCount)
    .slice(0, emitWorst);
  for (const r of worst) {
    console.log(`${r.templateId}|${r.passCount}/10|${r.file}`);
  }
}

if (exitOnNeedsReview && needsReview > 0) {
  process.exit(2);
}
