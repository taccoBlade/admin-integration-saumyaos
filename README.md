# Saumya Parekh — Personal Site

Production-grade portfolio built with **Next.js 16**, **Supabase**, **Tailwind CSS**, and **Framer Motion**.  
Live at → **[saumya.space](https://saumya.space)**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Variables](#environment-variables)
3. [Security](#security)
4. [Accessibility](#accessibility)
5. [Mobile Polish](#mobile-polish)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Backup Strategy](#backup-strategy)

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All required env vars are documented in [`.env.example`](.env.example).  
**Never commit `.env.local` — it is in `.gitignore`.**

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server) | Service role key – server only |
| `ADMIN_ALLOWED_EMAIL` | ✅ | Email allowed into /admin |
| `ADMIN_TEST_USER_ID` | dev only | UUID for test-password script |
| `ADMIN_TEST_PASSWORD` | dev only | Dev-only test password |
| `BACKUP_BUCKET_URL` | optional | PUT endpoint for backup uploads |

---

## Security

See **[docs/SECURITY.md](docs/SECURITY.md)** for a full audit report and mitigation notes.

Key measures already in place:
- HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) applied globally in `next.config.mjs`
- Admin routes protected by Supabase auth + email allowlist in `middleware.ts`
- No credentials stored in source — all via env vars
- `npm run audit` reports **0** high/critical CVEs (2 moderate in Next.js nested PostCSS; upstream Next.js issue, tracked)

---

## Accessibility

See **[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)** for full a11y standards and manual checklist.

- `eslint-plugin-jsx-a11y` enforced via `npm run lint:accessibility`
- Custom `ConfirmModal` replaces native `alert()`/`confirm()` with accessible focus-trapped dialogs
- All interactive components use `aria-label` and visible focus outlines

---

## Mobile Polish

- Tailwind responsive breakpoints: `sm` (640 px), `tablet` (768 px), `desktop` (1024 px), `lg` (1280 px)
- `SwipeNav` component for touch-swipeable image galleries
- All pages tested at 375 px, 768 px, and 1440 px widths

---

## Testing

```bash
# Lint (Next.js ESLint)
npm run lint

# Accessibility lint report (→ reports/a11y-report.txt)
npm run lint:accessibility

# Security audit
npm run audit

# Cross-browser Playwright suite (Chrome, Firefox, WebKit)
npm run test:browser

# Visual / smoke test via Puppeteer
npm run test:web
```

CI cross-browser matrix runs on every push via **[.github/workflows/browser-test.yml](.github/workflows/browser-test.yml)**.

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for step-by-step instructions.

```bash
# Deploy to Vercel production
bash scripts/deploy.sh

# Deploy to preview / staging
bash scripts/deploy.sh --preview
```

---

## Backup Strategy

See **[docs/BACKUP.md](docs/BACKUP.md)** for restore instructions.

```bash
# Create a timestamped zip of public/, content/, data/
bash scripts/backup.sh

# With automatic upload to a bucket
BACKUP_BUCKET_URL=https://your-bucket.example.com bash scripts/backup.sh
```

Backups are stored in `backups/` (gitignored).
