# LUNX Security Policy

## Reporting Vulnerabilities

Please report security issues to the maintainers privately before public disclosure.
Do not open public GitHub issues for security vulnerabilities.

## Accepted Risk CVEs

The following CVEs affect **devDependencies only** and are **not bundled in `dist/`**.
They have been reviewed, confirmed as dev-only, and accepted as low risk pending upstream fixes.

| Package | Via | Severity | CVE / Issue | Reason Accepted | In dist/ | Next Review |
|---------|-----|----------|-------------|-----------------|----------|-------------|
| `uuid` (via `hyperid` via `autocannon`) | `autocannon@^8.0.0` | Moderate | Missing buffer bounds check in v3/v5/v6 when buf is provided | `autocannon` is a load-testing devDependency used only in benchmarks. Never imported in production code or bundled into `dist/`. Fix requires `autocannon@2.0.1` (major breaking version). | ❌ No | Next sprint |

### Rationale

- `autocannon` is declared in `devDependencies` only
- `npm why autocannon` confirms: `dev autocannon@"^8.0.0" from the root project`
- No production import path from `src/` or `packages/` leads to `autocannon` or `uuid`
- `dist/` does not contain any `uuid` or `hyperid` modules

### Pre-push gate policy

The pre-push security gate runs with `--audit-level=high`:

```bash
npm audit --audit-level=high
```

This **blocks** on `critical` and `high` CVEs and **warns** on `moderate` CVEs in devDependencies.
A full `--audit-level=moderate` block is not enforced until the `autocannon` major version bump is scheduled.

## Resolved CVEs

| Package | Severity | Resolved in |
|---------|----------|-------------|
| `basic-ftp` | Critical | `npm audit fix` — 2026-04-28 |
| `handlebars` | Critical | `npm audit fix` — 2026-04-28 |
| `@isaacs/brace-expansion` | High | `npm audit fix` — 2026-04-28 |
| `devalue` | High | `npm audit fix` — 2026-04-28 |
| `flatted` | High | `npm audit fix` — 2026-04-28 |
| `minimatch` | High | `npm audit fix` — 2026-04-28 |
| `picomatch` | High | `npm audit fix` — 2026-04-28 |
| `rollup` | High | `npm audit fix` — 2026-04-28 |
