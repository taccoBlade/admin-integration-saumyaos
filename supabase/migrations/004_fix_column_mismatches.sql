-- Migration 004: Fix photo_spreads and resume_versions column mismatches
-- Run this in the Supabase SQL Editor after migrations 001, 002, and 003.

-- 1. Rename photo_spreads.template → template_type (to match photography-actions.ts)
ALTER TABLE public.photo_spreads
  RENAME COLUMN template TO template_type;

-- 2. Add missing 'featured' column to photo_spreads
ALTER TABLE public.photo_spreads
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- 3. Add missing version_label column to resume_versions (was never nullable in schema, add a safe default)
ALTER TABLE public.resume_versions
  ADD COLUMN IF NOT EXISTS version_label text NOT NULL DEFAULT 'v1.0';

-- 4. Add file_media_id as an alias FK column pointing to media_assets
--    (resume-actions.ts uses file_media_id; media_asset_id already exists)
ALTER TABLE public.resume_versions
  ADD COLUMN IF NOT EXISTS file_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL;

-- 5. Back-fill file_media_id from media_asset_id for any existing rows
UPDATE public.resume_versions
  SET file_media_id = media_asset_id
  WHERE file_media_id IS NULL AND media_asset_id IS NOT NULL;

-- 6. Also ensure version_string exists as an alias for version_label usage in actions
ALTER TABLE public.resume_versions
  ADD COLUMN IF NOT EXISTS version_string text;

-- Back-fill version_string from version_label
UPDATE public.resume_versions
  SET version_string = version_label
  WHERE version_string IS NULL;
