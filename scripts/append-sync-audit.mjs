#!/usr/bin/env node
/**
 * append-sync-audit.mjs
 * Sync workflow execution metadata を監査ログへ追記する。
 *
 * Usage:
 *   node scripts/append-sync-audit.mjs --file docs/sync-audit-log.md --tenant shared --mode apply --actor user --run-url https://... --sha abc123 --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function getArgValue(flag, fallback = '') {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : fallback;
}

const targetFile = path.resolve(ROOT_DIR, getArgValue('--file', 'docs/sync-audit-log.md'));
const tenant = getArgValue('--tenant', 'shared');
const mode = getArgValue('--mode', 'apply');
const actor = getArgValue('--actor', 'unknown');
const runUrl = getArgValue('--run-url', '');
const sha = getArgValue('--sha', '').slice(0, 12);
const dryRun = process.argv.includes('--dry-run');

const date = new Date().toISOString().slice(0, 10);
const time = new Date().toISOString().slice(11, 19) + 'Z';

const header = [
  '# Sync Audit Log',
  '',
  'Automated append-only audit trail for sanitized sync workflow runs.',
  '',
  '| Date | Time (UTC) | Tenant | Mode | Actor | SHA | Run |',
  '|---|---|---|---|---|---|---|',
].join('\n');

if (!fs.existsSync(path.dirname(targetFile))) {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
}

if (!fs.existsSync(targetFile)) {
  if (!dryRun) fs.writeFileSync(targetFile, `${header}\n`, 'utf-8');
}

const runCell = runUrl ? `[link](${runUrl})` : '-';
const line = `| ${date} | ${time} | ${tenant} | ${mode} | ${actor} | ${sha || '-'} | ${runCell} |`;

if (dryRun) {
  console.log('[DRY-RUN] append line:');
  console.log(line);
  process.exit(0);
}

const current = fs.readFileSync(targetFile, 'utf-8');
const next = current.endsWith('\n') ? `${current}${line}\n` : `${current}\n${line}\n`;
fs.writeFileSync(targetFile, next, 'utf-8');

console.log(`Appended audit line to ${path.relative(ROOT_DIR, targetFile)}`);
