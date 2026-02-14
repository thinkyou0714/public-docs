#!/usr/bin/env node
/**
 * sync-sanitized.mjs
 * Obsidian /10_sanitized の要約情報を public-docs/content の MDX に同期する。
 *
 * Default: dry-run (no file writes)
 * Apply:   node scripts/sync-sanitized.mjs --apply
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const DEFAULT_SANITIZED_DIR = 'C:\\n8n\\obsidian-vault\\10_sanitized';

function getArgValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  return process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : null;
}

const SANITIZED_DIR = path.resolve(
  getArgValue('--sanitized-dir') ?? process.env.SANITIZED_DIR ?? DEFAULT_SANITIZED_DIR,
);

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');
const START_MARKER = '{/* SANITIZED_SYNC_START */}';
const END_MARKER = '{/* SANITIZED_SYNC_END */}';
const LEGACY_START_MARKER = '<!-- SANITIZED_SYNC_START -->';
const LEGACY_END_MARKER = '<!-- SANITIZED_SYNC_END -->';

function getFilesRecursive(dir, re) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...getFilesRecursive(fullPath, re));
    } else if (re.test(entry.name)) {
      result.push(fullPath);
    }
  }
  return result;
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { frontmatter: {}, body: content, hasFrontmatter: false };
  const fmRaw = m[1];
  const frontmatter = {};
  for (const line of fmRaw.split(/\r?\n/)) {
    if (/^\s*-/.test(line)) continue;
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const val = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    frontmatter[key] = val;
  }
  const body = content.slice(m[0].length).replace(/^\r?\n/, '');
  return { frontmatter, body, hasFrontmatter: true, frontmatterBlock: m[0] };
}

function parseSanitized(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const titleLine = lines.find((l) => l.startsWith('# ')) ?? '';
  const idMatch = titleLine.match(/([A-Z]+-[A-Z]+-\d{3})/);
  const templateId = idMatch ? idMatch[1] : null;

  const sections = {};
  let current = null;
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      current = h2[1].trim();
      sections[current] = [];
      continue;
    }
    if (current) sections[current].push(line);
  }

  return {
    templateId,
    summary: (sections['要約'] || []).join('\n').trim(),
    decisions: (sections['決定事項'] || []).join('\n').trim(),
    openQuestions: (sections['未決'] || []).join('\n').trim(),
    nextActions: (sections['次アクション'] || []).join('\n').trim(),
    risks: (sections['リスク'] || []).join('\n').trim(),
    refIds: (sections['参照ID'] || []).join('\n').trim(),
  };
}

function buildSyncBlock(data) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    START_MARKER,
    '## sanitized snapshot',
    '',
    `Last synced: ${now}`,
    '',
    '### 要約',
    '',
    data.summary || '-',
    '',
    '### 決定事項',
    '',
    data.decisions || '-',
    '',
    '### 未決',
    '',
    data.openQuestions || '-',
    '',
    '### 次アクション',
    '',
    data.nextActions || '-',
    '',
    '### リスク',
    '',
    data.risks || '-',
    '',
    '### 参照ID',
    '',
    data.refIds || '-',
    '',
    END_MARKER,
    '',
  ];
  return lines.join('\n');
}

function upsertSyncBlock(body, syncBlock) {
  const hasNewBlock = body.includes(START_MARKER) && body.includes(END_MARKER);
  const hasLegacyBlock = body.includes(LEGACY_START_MARKER) && body.includes(LEGACY_END_MARKER);
  if (hasNewBlock) {
    const escapedStart = START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, 'm');
    return body.replace(re, syncBlock);
  }
  if (hasLegacyBlock) {
    const escapedStart = LEGACY_START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = LEGACY_END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, 'm');
    return body.replace(re, syncBlock);
  }
  return `${syncBlock}${body}`;
}

function getAllMdxByTemplateId() {
  const map = new Map();
  const duplicates = new Map();
  const mdxFiles = getFilesRecursive(CONTENT_DIR, /\.mdx?$/);
  for (const filePath of mdxFiles) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter } = parseFrontmatter(raw);
    if (frontmatter.template_id) {
      if (map.has(frontmatter.template_id)) {
        const list = duplicates.get(frontmatter.template_id) ?? [map.get(frontmatter.template_id)];
        list.push(filePath);
        duplicates.set(frontmatter.template_id, list);
      }
      map.set(frontmatter.template_id, filePath);
    }
  }
  return { map, duplicates };
}

function main() {
  if (!fs.existsSync(SANITIZED_DIR)) {
    console.error(`[ERROR] sanitized directory not found: ${SANITIZED_DIR}`);
    console.error(
      'Hint: set --sanitized-dir <path> or SANITIZED_DIR env when running in CI/workflow.',
    );
    process.exit(1);
  }

  const sanitizedFiles = getFilesRecursive(SANITIZED_DIR, /-sanitized\.md$/i);
  const { map: mdxById, duplicates: mdxDuplicates } = getAllMdxByTemplateId();
  let updated = 0;
  let skipped = 0;
  let syncError = false;

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Sanitized files: ${sanitizedFiles.length}`);
  console.log(`Sanitized dir: ${SANITIZED_DIR}`);

  if (mdxDuplicates.size > 0) {
    syncError = true;
    console.error('[ERROR] duplicate template_id detected in MDX content:');
    for (const [id, files] of mdxDuplicates.entries()) {
      const rel = files.map((f) => path.relative(ROOT_DIR, f)).join(', ');
      console.error(`  - ${id}: ${rel}`);
    }
  }

  const sanitizedById = new Map();
  const sanitizedDuplicates = new Map();
  for (const sf of sanitizedFiles) {
    const raw = fs.readFileSync(sf, 'utf-8');
    const data = parseSanitized(raw);
    if (!data.templateId) {
      console.log(`[SKIP] ${path.basename(sf)}: template_id not found`);
      skipped++;
      continue;
    }
    if (sanitizedById.has(data.templateId)) {
      const list = sanitizedDuplicates.get(data.templateId) ?? [sanitizedById.get(data.templateId).sourceFile];
      list.push(sf);
      sanitizedDuplicates.set(data.templateId, list);
      continue;
    }
    sanitizedById.set(data.templateId, { ...data, sourceFile: sf });
  }

  if (sanitizedDuplicates.size > 0) {
    syncError = true;
    console.error('[ERROR] duplicate template_id detected in sanitized files:');
    for (const [id, files] of sanitizedDuplicates.entries()) {
      const rel = files.map((f) => path.relative(SANITIZED_DIR, f)).join(', ');
      console.error(`  - ${id}: ${rel}`);
    }
  }

  if (syncError) {
    console.error('Sync aborted: resolve duplicate template_id before retrying.');
    process.exit(1);
  }

  for (const [templateId, data] of sanitizedById.entries()) {
    const target = mdxById.get(data.templateId);
    if (!target) {
      console.log(`[SKIP] ${path.basename(data.sourceFile)}: no target MDX for ${templateId}`);
      skipped++;
      continue;
    }

    const mdxRaw = fs.readFileSync(target, 'utf-8');
    const parsed = parseFrontmatter(mdxRaw);
    if (!parsed.hasFrontmatter) {
      console.log(`[SKIP] ${path.relative(ROOT_DIR, target)}: frontmatter missing`);
      skipped++;
      continue;
    }

    const syncBlock = buildSyncBlock(data);
    const newBody = upsertSyncBlock(parsed.body, syncBlock);
    const next = `${parsed.frontmatterBlock}\n\n${newBody}`.replace(/\n{3,}/g, '\n\n');

    if (next === mdxRaw) {
      if (VERBOSE) console.log(`[NOOP] ${path.relative(ROOT_DIR, target)}`);
      continue;
    }

    updated++;
    console.log(`[UPDATE] ${templateId} -> ${path.relative(ROOT_DIR, target)}`);
    if (APPLY) fs.writeFileSync(target, next, 'utf-8');
  }

  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(APPLY ? 'Done.' : 'Dry-run complete. Use --apply to write changes.');
}

main();
