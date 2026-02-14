#!/usr/bin/env node
/**
 * dod-report.mjs
 * 全記事の DoD 10項目達成度をスキャンし、レポートを出力する。
 * 追加依存なし。Node.js 標準ライブラリのみ。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

// ───── DoD 10 Checks ─────
const DOD_CHECKS = [
  {
    id: 1,
    label: '価値1行（概要セクション）',
    test: (fm, content) => /^##\s*概要/m.test(content) && sectionLength(content, '概要') > 10,
  },
  {
    id: 2,
    label: '前提条件明記',
    test: (fm, content) => /^##\s*前提条件/m.test(content) && sectionLength(content, '前提条件') > 10,
  },
  {
    id: 3,
    label: 'セットアップ再現可能',
    test: (fm, content) => /^##\s*セットアップ/m.test(content) && sectionLength(content, 'セットアップ') > 30,
  },
  {
    id: 4,
    label: '詰まりTOP5',
    test: (fm, content) => /^##\s*詰まりTOP5/m.test(content) && countListItems(content, '詰まりTOP5') >= 5,
  },
  {
    id: 5,
    label: '反証3',
    test: (fm, content) => /^##\s*反証/m.test(content) && countListItems(content, '反証') >= 3,
  },
  {
    id: 6,
    label: 'ログ/確認ポイント',
    test: (fm, content) => /確認|ログ|モニタ|監視/m.test(content) && /^##\s*運用/m.test(content),
  },
  {
    id: 7,
    label: '停止/復旧/ロールバック',
    test: (fm, content) => /^##\s*ロールバック/m.test(content) && sectionLength(content, 'ロールバック') > 10,
  },
  {
    id: 8,
    label: '機密ゼロ',
    test: (fm, content) => {
      // Simple inline check — the full check-secrets.mjs is more thorough
      return !(/https?:\/\/[^\s"]*\.(com|io|jp|app|net)/gi.test(content))
        && !(/sk-[a-zA-Z0-9]{20,}/g.test(content))
        && !(/xox[bprs]-/g.test(content));
    },
  },
  {
    id: 9,
    label: 'FAQ10',
    test: (fm, content) => /^##\s*FAQ/m.test(content) && countListItems(content, 'FAQ') >= 10,
  },
  {
    id: 10,
    label: '変更履歴+内部リンク',
    test: (fm, content) =>
      /^##\s*変更履歴/m.test(content)
      && /last_verified/m.test(content)
      && fm.template_id != null,
  },
];

// ───── Helpers ─────
function normalizeContent(content) {
  return content.replace(/\r\n/g, '\n');
}

function extractSection(content, heading) {
  const c = normalizeContent(content);
  const headingRegex = new RegExp(`^##\\s*${heading}`, 'm');
  const headingMatch = c.match(headingRegex);
  if (!headingMatch) return '';
  const startIdx = headingMatch.index + headingMatch[0].length;
  // Find next ## heading or end of content
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
  let currentKey = null;
  for (const line of lines) {
    // Skip array items (lines starting with "  -")
    if (/^\s+-/.test(line)) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !key.startsWith('-')) {
        currentKey = key;
        fm[key] = val;
      }
    }
  }
  return fm;
}

function getMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMdxFiles(fullPath));
    } else if (/\.mdx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ───── Main ─────
const files = getMdxFiles(CONTENT_DIR);
const results = [];

for (const filePath of files) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const content = normalizeContent(rawContent);
  const fm = parseFrontmatter(content);

  const checks = DOD_CHECKS.map((check) => ({
    id: check.id,
    label: check.label,
    passed: check.test(fm, content),
  }));

  const passCount = checks.filter((c) => c.passed).length;
  results.push({ file: relativePath, id: fm.template_id || '(no ID)', passCount, checks });
}

// ───── Output ─────
console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║          DoD Achievement Report                  ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

let totalPass = 0;
let totalChecks = 0;

for (const r of results) {
  const pct = Math.round((r.passCount / 10) * 100);
  const color = pct === 100 ? GREEN : pct >= 70 ? YELLOW : RED;
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));

  console.log(`${CYAN}${r.id}${NC} ${DIM}(${r.file})${NC}`);
  console.log(`  ${color}${bar} ${pct}% (${r.passCount}/10)${NC}`);

  const failedChecks = r.checks.filter((c) => !c.passed);
  if (failedChecks.length > 0) {
    for (const f of failedChecks) {
      console.log(`  ${RED}  ✗ ${f.id}. ${f.label}${NC}`);
    }
  }
  console.log('');

  totalPass += r.passCount;
  totalChecks += 10;
}

const overallPct = totalChecks > 0 ? Math.round((totalPass / totalChecks) * 100) : 0;
console.log('──────────────────────────────────────────────────');
console.log(`  Total: ${results.length} articles, ${totalPass}/${totalChecks} checks passed (${overallPct}%)`);

if (overallPct === 100) {
  console.log(`  ${GREEN}All articles meet DoD!${NC}`);
} else {
  console.log(`  ${YELLOW}Some articles need work. Run this report after edits.${NC}`);
}
console.log('');
