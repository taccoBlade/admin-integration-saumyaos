-- Migration: 006_growth_intelligence.sql
-- Description: Adds Content Clusters, Preview Tokens, and expands Growth Engine schema.

-- 1. Content Clusters
CREATE TABLE IF NOT EXISTS public.content_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    core_topic TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add Cluster ID and Preview support to seo_pages
ALTER TABLE public.seo_pages
ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES public.content_clusters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS preview_token UUID UNIQUE,
ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMPTZ;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_seo_pages_cluster_id ON public.seo_pages(cluster_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_preview_token ON public.seo_pages(preview_token);

-- 4. RLS Policies
ALTER TABLE public.content_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to content_clusters" ON public.content_clusters FOR SELECT USING (true);
