-- Growth Engine V2 - Supabase Migration
-- Run this in your Supabase SQL Editor

-- 1. Keyword Clusters
CREATE TABLE IF NOT EXISTS seo_keyword_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    core_topic TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SEO Keywords
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    intent TEXT,
    volume INTEGER DEFAULT 0,
    difficulty INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Not Created',
    cluster_id UUID REFERENCES seo_keyword_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SEO Templates
CREATE TABLE IF NOT EXISTS seo_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    structure_json JSONB DEFAULT '[]', -- Defines default blocks (Hero, Problem, Solution, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SEO Pages (Main Content Engine)
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    canonical_url TEXT,
    redirect_url TEXT,
    duplicate_hash TEXT, -- For duplicate content detection
    status TEXT DEFAULT 'Draft',
    health_score INTEGER DEFAULT 0,
    primary_keyword_id UUID REFERENCES seo_keywords(id) ON DELETE SET NULL,
    cluster_id UUID REFERENCES seo_keyword_clusters(id) ON DELETE SET NULL,
    template_id UUID REFERENCES seo_templates(id) ON DELETE SET NULL,
    meta_title TEXT,
    meta_description TEXT,
    schema_json JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SEO Blocks (Content chunks for each page)
CREATE TABLE IF NOT EXISTS seo_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL, -- 'Hero', 'Problem', 'Solution', 'Case Study', 'FAQ'
    content_json JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Dynamic Variables (Global placeholders like {{industry}}, {{city}})
CREATE TABLE IF NOT EXISTS seo_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE, -- e.g., 'industry'
    value TEXT NOT NULL,      -- e.g., 'Aerospace'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Page <-> Project Linking (Relational linking)
CREATE TABLE IF NOT EXISTS page_project_links (
    page_id UUID NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (page_id, project_id)
);

-- 8. SEO Revisions (Version History)
CREATE TABLE IF NOT EXISTS seo_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
    snapshot_json JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AI Generation Jobs (Queues)
CREATE TABLE IF NOT EXISTS seo_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL, -- 'Bulk Generation', 'Indexing', 'Regeneration'
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Processing', 'Completed', 'Failed'
    target_page_id UUID REFERENCES seo_pages(id) ON DELETE CASCADE,
    params_json JSONB DEFAULT '{}',
    result_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add simple RLS policies to allow Admin Service Role bypass, but block public writes
ALTER TABLE seo_keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Note: The Next.js server actions use `SUPABASE_SERVICE_ROLE_KEY` which inherently bypasses RLS,
-- ensuring seamless functionality while preventing arbitrary client-side writes.
