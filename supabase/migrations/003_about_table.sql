-- Migration: Dedicated About Table with RLS, updated_at trigger, and default values
-- Alter content_target_type enum to support 'about' target type
ALTER TYPE public.content_target_type ADD VALUE IF NOT EXISTS 'about';

-- Alter publish_status enum to support review and scheduled states
ALTER TYPE public.publish_status ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE public.publish_status ADD VALUE IF NOT EXISTS 'scheduled';

-- Create the dedicated about table
CREATE TABLE IF NOT EXISTS public.about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Current Focus',
  eyebrow text DEFAULT 'Now',
  focus_cards_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  obsessions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.publish_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies
CREATE POLICY "public read published about" ON public.about
  FOR SELECT USING (status = 'published');

CREATE POLICY "admin manage about" ON public.about
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Enable automatic updated_at trigger
CREATE OR REPLACE TRIGGER set_updated_at_about
  BEFORE UPDATE ON public.about
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
