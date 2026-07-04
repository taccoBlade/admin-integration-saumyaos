# Backup Strategy

## What Gets Backed Up

| Directory | Contents |
|---|---|
| `public/` | Static assets (images, fonts, favicons, PDFs) |
| `content/` | Project ZIP imports, processed files, generated JSON |
| `data/` | Static data files (JSON configs, seed data) |

Source code is version-controlled in Git — **no need to back it up separately**.  
Supabase data is backed up by Supabase's built-in daily snapshots (Pro plan).

---

## Running a Backup

```bash
# Local backup only
bash scripts/backup.sh

# With automatic upload to an HTTP PUT endpoint
BACKUP_BUCKET_URL=https://your-bucket.example.com bash scripts/backup.sh
```

Archives are saved to `backups/` (gitignored) as:

```
backups/backup_20260704T032500Z.zip
```

---

## Upload Endpoint Requirements

The `BACKUP_BUCKET_URL` endpoint must accept:
- **Method:** `PUT`
- **Content-Type:** `application/zip`
- **Path:** `<BACKUP_BUCKET_URL>/<archive-filename>`

Compatible services:
- **AWS S3** pre-signed PUT URL
- **Google Cloud Storage** signed URL
- **Azure Blob Storage** SAS URL
- Any compatible WebDAV / object storage endpoint

---

## Restoration

```bash
# 1. Choose the archive you want to restore from backups/
ls backups/

# 2. Unzip into the project root (overwrites existing files)
unzip backups/backup_20260704T032500Z.zip -d /path/to/personalsite/

# 3. For Supabase data: restore from Supabase Dashboard → Backups
#    (available on Supabase Pro plan)
```

> [!WARNING]
> Restoring `public/` will overwrite any files that changed since the backup. Always restore to a staging environment first to verify correctness.

---

## Recommended Backup Schedule

| Frequency | Trigger |
|---|---|
| Before every production deploy | Run `bash scripts/backup.sh` inside `scripts/deploy.sh` (add as first step) |
| Weekly automated | Use a cron job or Vercel Cron function to call `backup.sh` |
| On-demand | Run manually when making large content changes |

---

## Retention Policy (Recommended)

- Keep the **last 7 daily** backups.
- Keep **1 backup per week** for 4 weeks.
- Keep **1 backup per month** for 6 months.
- Delete older archives to manage storage costs.
