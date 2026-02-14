#!/usr/bin/env node
/**
 * check-secrets.mjs
 * sanitized/publish 向けファイルに機密情報が混入していないかチェック。
 * 追加課金サービス不要。Node.js 標準ライブラリのみ使用。
 * クロスプラットフォーム（Windows / macOS / Linux）対応。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ───── Colors ─────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

// ───── Check Targets ─────
const CHECK_DIRS = [
  path.join(ROOT_DIR, 'content'),
  path.join(ROOT_DIR, 'obsidian-templates'),
];

// ───── Patterns ─────
const PATTERNS = [
  { label: 'URL (http/https)', regex: /https?:\/\//gi },
  { label: 'IP Address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  { label: 'Email Address', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { label: 'OpenAI Token', regex: /sk-[a-zA-Z0-9]{20,}/g },
  { label: 'Slack Token', regex: /xox[bprs]-[a-zA-Z0-9-]+/g },
  { label: 'Bearer Token', regex: /Bearer [a-zA-Z0-9._-]+/g },
  { label: 'Password keyword', regex: /[Pp]assword\s*[:=]/g },
  { label: 'Secret keyword', regex: /[Ss]ecret\s*[:=]/g },
  { label: 'API Key keyword', regex: /[Aa]pi[_-]?[Kk]ey\s*[:=]/g },
  { label: 'Webhook URL pattern', regex: /webhook[./]/gi },
  { label: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { label: 'Private Key Header', regex: /-----BEGIN .* PRIVATE KEY-----/g },
];

// ───── Whitelist (false positive suppression) ─────
const WHITELIST = [
  /^#/,                          // Markdown headings
  /Secrets注意/,                 // Section title
  /書かないルール/,
  /記載しない/,
  /記載禁止/,
  /非公開/,
  /例：/,
  /検出パターン/,
  /https\?:\/\//,                // Pattern strings in docs
  /webhook\[\.\/\]/,
  /\*\*絶対に/,                  // Warning text
  /環境変数で管理/,
  /値は記載しない/,
  /具体値なし/,
  /具体値は記載しない/,
  /実値は含めない/,
  /記載禁止\*\*/,
  /Bearer Token/,                // Mentioning the concept, not actual token
  /password.*secret.*api/i,
  /SPF\/DKIM/,                   // DNS record concepts
  /Content-Type/,                // HTTP header concepts
];

// ───── Helpers ─────
function getMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMdxFiles(fullPath));
    } else if (/\.(mdx?|md)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function isWhitelisted(line) {
  return WHITELIST.some((wl) => wl.test(line));
}

// ───── Main ─────
let totalChecked = 0;
let totalIssues = 0;

console.log('============================================');
console.log('  Secret / Sensitive Data Check');
console.log('============================================');
console.log('');

for (const dir of CHECK_DIRS) {
  if (!fs.existsSync(dir)) {
    console.log(`${YELLOW}[SKIP]${NC} Directory not found: ${dir}`);
    continue;
  }

  const files = getMdxFiles(dir);

  for (const filePath of files) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let fileIssues = 0;

    for (const pattern of PATTERNS) {
      const matchingLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Reset regex lastIndex
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(line) && !isWhitelisted(line)) {
          matchingLines.push({ num: i + 1, text: line.trim() });
        }
      }

      if (matchingLines.length > 0) {
        if (fileIssues === 0) {
          console.log(`${RED}[FAIL]${NC} ${relativePath}`);
        }
        console.log(`  ${YELLOW}Pattern: ${pattern.label}${NC}`);
        for (const m of matchingLines.slice(0, 5)) {
          console.log(`    L${m.num}: ${m.text.substring(0, 120)}`);
        }
        if (matchingLines.length > 5) {
          console.log(`    ... and ${matchingLines.length - 5} more`);
        }
        fileIssues++;
        totalIssues++;
      }
    }

    if (fileIssues === 0) {
      console.log(`${GREEN}[PASS]${NC} ${relativePath}`);
    }
    totalChecked++;
  }
}

console.log('');
console.log('============================================');
console.log(`  Results: ${totalChecked} files checked`);
console.log('============================================');

if (totalIssues > 0) {
  console.log(`${RED}  ${totalIssues} potential issue(s) found!${NC}`);
  console.log('');
  console.log('  Review each finding above.');
  console.log('  If false positive, add to WHITELIST in scripts/check-secrets.mjs');
  console.log('  If real, remove the sensitive data before publishing.');
  process.exit(1);
} else {
  console.log(`${GREEN}  All clear — no secrets detected.${NC}`);
  process.exit(0);
}
