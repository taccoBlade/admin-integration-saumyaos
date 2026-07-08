-- Migration: 005_growth_engine.sql
-- Description: Creates tables for the Programmatic SEO Growth Engine

-- 1. Keywords Table
CREATE TABLE IF NOT EXISTS public.keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    intent TEXT CHECK (intent IN ('Informational', 'Commercial', 'Transactional', 'Navigational')),
    volume INTEGER DEFAULT 0,
    difficulty INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Not Created' CHECK (status IN ('Not Created', 'Draft', 'Published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SEO Pages Table
CREATE TABLE IF NOT EXISTS public.seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    published_at TIMESTAMPTZ,
    primary_keyword_id UUID REFERENCES public.keywords(id) ON DELETE SET NULL,
    parent_page_id UUID REFERENCES public.seo_pages(id) ON DELETE SET NULL,
    related_pages JSONB DEFAULT '[]'::jsonb,
    related_services JSONB DEFAULT '[]'::jsonb,
    related_technologies JSONB DEFAULT '[]'::jsonb,
    related_projects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SEO Page Versions (History)
CREATE TABLE IF NOT EXISTS public.seo_page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE,
    editor_user_id UUID NOT NULL, -- normally references auth.users(id), but we keep it loose for admin ID
    snapshot_json JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Page FAQs (for Structured Data)
CREATE TABLE IF NOT EXISTS public.page_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Page Metadata (SEO Tags)
CREATE TABLE IF NOT EXISTS public.page_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    schema_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Internal Links
CREATE TABLE IF NOT EXISTS public.internal_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE,
    anchor_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Suggested' CHECK (status IN ('Suggested', 'Active')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_status ON public.seo_pages(status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_published_at ON public.seo_pages(published_at);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON public.keywords(keyword);

-- RLS Policies (Assuming Admin-only DB logic like existing tables)
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to published seo_pages" ON public.seo_pages FOR SELECT USING (status = 'Published' AND (published_at IS NULL OR published_at <= NOW()));
CREATE POLICY "Allow read access to page_metadata" ON public.page_metadata FOR SELECT USING (true);
CREATE POLICY "Allow read access to page_faqs" ON public.page_faqs FOR SELECT USING (true);
