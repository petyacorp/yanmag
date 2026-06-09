-- ============================================
-- YAN MAG — Add Featured Position & Ticker Items
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- These are safe ALTER TABLE statements that add new columns
-- without affecting existing data.
-- ============================================

-- 1. Add featured_position column to articles
-- Values: 'carousel', 'hero_featured', or NULL (normal article)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS featured_position TEXT DEFAULT NULL
  CHECK (featured_position IN ('carousel', 'hero_featured'));

-- 2. Create index for fast carousel/featured queries
CREATE INDEX IF NOT EXISTS idx_articles_featured_position
  ON public.articles(featured_position)
  WHERE featured_position IS NOT NULL;

-- 3. Add ticker items to site_settings (JSONB arrays of strings)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS ticker_items_es JSONB DEFAULT '["Última hora: Nueva exposición en el MoMA", "Entrevista exclusiva con Yohji Yamamoto", "Descubre las tendencias de Milán", "Arquitectura sostenible en los Alpes"]'::jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS ticker_items_en JSONB DEFAULT '["Breaking: New exhibition at MoMA", "Exclusive interview with Yohji Yamamoto", "Discover Milan''s latest trends", "Sustainable architecture in the Alps"]'::jsonb;

-- 4. Add quote author to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS quote_author TEXT DEFAULT 'STEVE JOBS';

-- 5. Create dashboard_tasks table for editorial tasks checklist
CREATE TABLE IF NOT EXISTS public.dashboard_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin/editor users to manage tasks
DROP POLICY IF EXISTS "Admin and editor manage tasks" ON public.dashboard_tasks;
CREATE POLICY "Admin and editor manage tasks"
  ON public.dashboard_tasks FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );


