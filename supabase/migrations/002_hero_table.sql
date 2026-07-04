-- Migration: Dedicated Hero Table with RLS, updated_at trigger, and cover_image foreign key relationship
-- Alter content_target_type enum to support 'hero' target type
ALTER TYPE public.content_target_type ADD VALUE IF NOT EXISTS 'hero';

-- Create the dedicated hero table
CREATE TABLE IF NOT EXISTS public.hero (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tagline text,
  subtitle text,
  description text,
  cover_image_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  cta_text text,
  cta_url text,
  secondary_cta_text text,
  secondary_cta_url text,
  status public.publish_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies
CREATE POLICY "public read published hero" ON public.hero
  FOR SELECT USING (status = 'published');

CREATE POLICY "admin manage hero" ON public.hero
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Enable automatic updated_at trigger
CREATE OR REPLACE TRIGGER set_updated_at_hero
  BEFORE UPDATE ON public.hero
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
