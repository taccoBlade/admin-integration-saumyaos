#!/usr/bin/env bash
# deploy.sh – Production deployment to Vercel
# Usage: bash scripts/deploy.sh [--preview]
#
# Prerequisites:
#   npm install -g vercel
#   vercel login
#   VERCEL_TOKEN (optional – set in env to skip interactive login)

set -euo pipefail

PREVIEW=false
for arg in "$@"; do
  [[ "$arg" == "--preview" ]] && PREVIEW=true
done

echo "🔨  Building production bundle…"
npm run build

if $PREVIEW; then
  echo "🚀  Deploying to Vercel (preview)…"
  vercel deploy
else
  echo "🚀  Deploying to Vercel (production)…"
  vercel --prod
fi

echo "✅  Deployment complete."
