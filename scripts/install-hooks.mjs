#!/usr/bin/env node
/**
 * install-hooks.mjs
 * Git pre-commit hook をインストールする。
 * husky等の追加パッケージ不要。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const HOOKS_DIR = path.join(ROOT, '.git', 'hooks');
const HOOK_FILE = path.join(HOOKS_DIR, 'pre-commit');

const HOOK_CONTENT = `#!/bin/sh
# Auto-installed pre-commit hook
# Runs secret check before every commit

echo "Running secret check..."
node scripts/check-secrets.mjs
if [ $? -ne 0 ]; then
  echo ""
  echo "COMMIT BLOCKED: Potential secrets detected."
  echo "Fix the issues above or update the whitelist in scripts/check-secrets.mjs"
  exit 1
fi
echo "Secret check passed."
`;

if (!fs.existsSync(HOOKS_DIR)) {
  console.log('No .git/hooks directory found. Skipping hook installation.');
  process.exit(0);
}

fs.writeFileSync(HOOK_FILE, HOOK_CONTENT, { mode: 0o755 });
console.log(`Pre-commit hook installed: ${HOOK_FILE}`);
