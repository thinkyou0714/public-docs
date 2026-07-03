---
name: build-site
description: Build/lint the Next.js MDX site and report errors. Use when asked to build, lint, preview, or verify the site compiles.
---

Build (or dev-preview) and lint the site, then report the outcome.

1. Ensure deps are present (SessionStart bootstrap runs `npm ci`; else run it).
2. Build: `npm run build` (→ `next build`). Local preview: `npm run dev`. Lint: `npm run lint`.
3. Report: success + output, or the first build/lint error with its file/line. Summarize MDX/TS diagnostics.
4. Do not alter content unless asked; templates mirror the private canonical (edit source there).
