# Workflow staging for sanitized sync

Place `*-sanitized.md` files in tenant folders when using the GitHub Actions
`Sync Sanitized Snapshots` workflow.

Directory layout:

- `obsidian-sync/10_sanitized/shared/`
- `obsidian-sync/10_sanitized/tenant-a/`
- `obsidian-sync/10_sanitized/tenant-b/`

Examples:

- `TMPL-LINE-001-sanitized.md`
- `TMPL-OBS-001-sanitized.md`
- `TMPL-OPS-001-sanitized.md`
- `TMPL-X-001-sanitized.md`
- `TS-LINE-001-sanitized.md`

Notes:

- Keep content sanitized (no URLs, names, tokens, numbers).
- Files are matched by `template_id` extracted from the first heading line.
- Select `tenant_id` in workflow_dispatch, run `dry-run` first.
- Then rerun with `apply=true` (and optional `auto_commit=true`).
