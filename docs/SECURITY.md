# Security

## Audit Summary (Phase 12 — 2026-07-04)

| Severity | Count | Notes |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Moderate | 2 | `postcss < 8.5.10` nested inside `next@16.2.10` (upstream issue, no fix available without downgrading Next) |
| Low | 0 | — |

The moderate PostCSS finding (GHSA-qx2v-qp2m-jg93) is a CSS stringify XSS. It affects **server-side** CSS processing only and is not exploitable in production context because:
1. No user-supplied CSS is processed by the Next.js build on the production server.
2. Next.js maintains control over PostCSS internally.

We will track the Next.js upstream fix and upgrade once available.

---

## HTTP Security Headers

Applied globally via `next.config.mjs` using `headers()`:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://va.vercel-scripts.com …` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

---

## Admin Route Protection

- All `/admin/*` routes are guarded in `middleware.ts`.
- Unauthenticated requests are redirected to `/auth/login`.
- Even authenticated users are rejected unless their email matches `ADMIN_ALLOWED_EMAIL`.
- Auth cookies are cleared on unauthorized access.

---

## Credential Policy

- **No credentials are stored in source code.**
- All secrets are loaded from environment variables (`.env.local` in dev, platform secrets in production).
- `scripts/set-test-password.ts` aborts when `NODE_ENV !== 'development'`.
- Refer to `.env.example` for the complete list of required variables.

---

## Required Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Admin operations |
| `SUPABASE_URL` | server scripts | Alias for service scripts |
| `ADMIN_ALLOWED_EMAIL` | server | Allowlisted admin email |
| `ADMIN_TEST_USER_ID` | dev only | Used by set-test-password.ts |
| `ADMIN_TEST_PASSWORD` | dev only | Used by set-test-password.ts |
| `BACKUP_BUCKET_URL` | optional | Backup upload endpoint |

---

## Mitigations Applied in Phase 12

- Removed hard-coded test credentials from all scripts.
- Deleted `scripts/test-behavior.ts` (contained Supabase admin operations not needed in prod).
- Added `NODE_ENV` guard to `scripts/set-test-password.ts`.
- Added HSTS, X-Frame-Options, nosniff, and Permissions-Policy headers to every response.
- Replaced native `alert()`/`confirm()` in admin UI with accessible `ConfirmModal`.
