# Deployment

## Prerequisites

1. **Vercel CLI** installed globally:
   ```bash
   npm install -g vercel
   ```
2. **Vercel account** linked:
   ```bash
   vercel login
   ```
3. All environment variables set in the Vercel dashboard under **Settings → Environment Variables** (match `.env.example`).

---

## Manual Deployment

### Production

```bash
bash scripts/deploy.sh
```

This script:
1. Runs `npm run build` to produce an optimised `.next` bundle.
2. Calls `vercel --prod` to deploy to the live production URL.

### Preview / Staging

```bash
bash scripts/deploy.sh --preview
```

Calls `vercel deploy` without `--prod`, creating a unique preview URL.

---

## CI / CD (GitHub Actions)

Cross-browser tests run automatically on every push to `main` or `dev` via:

```
.github/workflows/browser-test.yml
```

The workflow:
1. Runs `npm ci` and `npm run build`.
2. Launches Playwright tests on **Chromium**, **Firefox**, and **WebKit** in parallel.
3. Uploads test artefacts on failure.

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `VERCEL_TOKEN` | (optional) Vercel token for automated deploys from CI |

---

## Vercel Configuration Notes

- Framework preset: **Next.js**
- Build command: `npm run build`
- Output directory: `.next` (auto-detected)
- Node.js version: **20.x**
- Root directory: `personalsite/` (if repo root is `personalsite/personalsite/`, set accordingly)

---

## Post-Deploy Checklist

- [ ] Verify live URL loads (`https://saumya.space`)
- [ ] Check Vercel Function logs for runtime errors
- [ ] Run Lighthouse on production → ≥ 90 for Performance, Accessibility, Best Practices, SEO
- [ ] Confirm all environment variables are set (Supabase, Analytics, Admin email)
- [ ] Test admin login flow end-to-end
- [ ] Confirm OpenGraph image renders correctly (share on LinkedIn/Twitter as test)
