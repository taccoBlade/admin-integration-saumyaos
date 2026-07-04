#!/usr/bin/env bash
# backup.sh – Backup public/, content/, and data/ directories.
#
# Creates a timestamped zip archive and optionally uploads it to a bucket URL.
#
# Required env vars (can be set in .env.local or shell):
#   BACKUP_BUCKET_URL  – (optional) HTTP PUT endpoint; leave unset for local-only backup
#
# Usage:
#   bash scripts/backup.sh
#   BACKUP_BUCKET_URL=https://your-bucket.example.com bash scripts/backup.sh

set -euo pipefail

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
ZIP_NAME="backup_${TIMESTAMP}.zip"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"

mkdir -p "$BACKUP_DIR"
ARCHIVE_PATH="$BACKUP_DIR/$ZIP_NAME"

echo "📦  Creating backup archive: $ARCHIVE_PATH"

# Include public/, content/, and data/ — skip node_modules and .next
cd "$PROJECT_ROOT"
zip -r "$ARCHIVE_PATH" public/ content/ data/ \
  --exclude "*.DS_Store" \
  --exclude "__pycache__/*" \
  2>/dev/null || true

ARCHIVE_SIZE=$(du -sh "$ARCHIVE_PATH" | cut -f1)
echo "✅  Archive created: $ARCHIVE_PATH ($ARCHIVE_SIZE)"

# Upload if BACKUP_BUCKET_URL is set
if [[ -n "${BACKUP_BUCKET_URL:-}" ]]; then
  echo "⬆️   Uploading to $BACKUP_BUCKET_URL/$ZIP_NAME…"
  curl --fail --silent --show-error \
    -X PUT \
    -T "$ARCHIVE_PATH" \
    -H "Content-Type: application/zip" \
    "$BACKUP_BUCKET_URL/$ZIP_NAME"
  echo "✅  Upload complete."
else
  echo "ℹ️   BACKUP_BUCKET_URL not set — backup saved locally only."
  echo "    To upload, set BACKUP_BUCKET_URL in your environment."
fi

echo ""
echo "Restore instructions:"
echo "  unzip $ZIP_NAME -d <target-directory>"
