-- ============================================
-- YAN MAG — Accent Insensitive Search Function
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This enables the unaccent extension and creates a search function
-- that ignores accents/diacritics in Spanish/English search.
-- ============================================

-- 1. Enable the unaccent extension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create the search function
CREATE OR REPLACE FUNCTION public.search_articles(search_query TEXT)
RETURNS SETOF public.articles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.articles
  WHERE status = 'published'
    AND (
      public.unaccent(title_es) ILIKE public.unaccent('%' || search_query || '%') OR
      public.unaccent(COALESCE(title_en, '')) ILIKE public.unaccent('%' || search_query || '%') OR
      public.unaccent(COALESCE(excerpt_es, '')) ILIKE public.unaccent('%' || search_query || '%') OR
      public.unaccent(COALESCE(content_es, '')) ILIKE public.unaccent('%' || search_query || '%')
    )
  ORDER BY published_at DESC
  LIMIT 20;
END;
$$;
