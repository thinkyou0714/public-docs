# Variables Hub Mapping

This document defines where operational variables are managed and how they map
to public-docs workflows without exposing secrets.

## Scope

- Public repo must not store raw secrets.
- Secret values are referenced by variable names only.
- Real values remain in private systems (`****`).

## Hub-to-Workflow Mapping

| Variable Group | Public Usage | Source of Truth | Notes |
|---|---|---|---|
| `SANITIZED_DIR` | `sync-sanitized.mjs --sanitized-dir` | Obsidian staging folders | Use tenant subfolder |
| `SITE_URL` | `scripts/generate-sitemap.mjs` | Deployment env | Use `NEXT_PUBLIC_SITE_URL` |
| `CONTENT_VISIBILITY` | frontmatter `visibility` | article spec | `public` only in this repo |
| `TEMPLATE_ID` | MDX matching + sync key | template registry | Must be globally unique |

## Tenant Mapping

| Tenant | Staging Path | Workflow Input |
|---|---|---|
| Shared | `obsidian-sync/10_sanitized/shared` | `tenant_id=shared` |
| Tenant A | `obsidian-sync/10_sanitized/tenant-a` | `tenant_id=tenant-a` |
| Tenant B | `obsidian-sync/10_sanitized/tenant-b` | `tenant_id=tenant-b` |

## Workflow Gate Mapping

| Tenant | Environment Gate |
|---|---|
| Shared | `sync-shared` |
| Tenant A | `sync-tenant-a` |
| Tenant B | `sync-tenant-b` |

Set required reviewers for each environment in repository settings to enforce
execution separation for `apply=true`.

## Audit Mapping

| Event | Log Target | Trigger |
|---|---|---|
| Sync apply run | `docs/sync-audit-log.md` | `sync-sanitized.yml` with `apply=true` |

Audit writes are idempotent by `run_id` (duplicate append is skipped).

DoD gate option:

- `fail_on_dod_drop=true` in workflow_dispatch fails the run when any changed
  article falls below DoD 10/10.

## Change Rule

1. Add/update variable name here first.
2. Update corresponding script/workflow.
3. Run `npm run check-secrets` and `npm run build`.
4. Record the change in changelog/PR body.
