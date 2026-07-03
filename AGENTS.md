# AGENTS.md — public-docs

Next.js + MDX public reference site for THINK YOU LAB implementation guides (public mirror of the
Obsidian templates/knowledge; private canonical lives in `private-members`).

- **Stack**: Next.js, MDX, TypeScript, ESLint. Content under `content/`; Obsidian sync in `obsidian-sync/` + `obsidian-templates/`.
- **Setup**: deps auto-install via `.claude/bootstrap.sh` on SessionStart (`npm ci`). Manual: `npm ci`.
- **Build**: `npm run build` (→ `next build`). **Dev**: `npm run dev`. **Lint**: `npm run lint`.
- **Content flow**: templates are a one-way build-time mirror from the private canonical; edit source there, not here (see `CONTRIBUTING.md`).
- **Conventions**: CI = build + lint + dependency-review + secrets-scan + sync-sanitized.

## Claude Code on the web

A cloud session auto-installs deps (SessionStart hook) and loads this `AGENTS.md` + `.claude/skills/`.
MCP is local-only for this repo. See `thinkyou0714/.github` → `docs/claude-code-web-readiness.md`.
