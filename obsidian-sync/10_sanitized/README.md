# Workflow staging for sanitized sync

Place `*-sanitized.md` files in this directory when using the GitHub Actions
`Sync Sanitized Snapshots` workflow.

Examples:

- `TMPL-LINE-001-sanitized.md`
- `TMPL-OBS-001-sanitized.md`
- `TMPL-OPS-001-sanitized.md`
- `TMPL-X-001-sanitized.md`
- `TS-LINE-001-sanitized.md`

Notes:

- Keep content sanitized (no URLs, names, tokens, numbers).
- Files are matched by `template_id` extracted from the first heading line.
- Run workflow in `dry-run` mode first, then run with `apply=true`.
