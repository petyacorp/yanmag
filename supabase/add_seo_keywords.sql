-- ============================================
-- YAN MAG — Add SEO Keywords to Articles
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This is a safe ALTER TABLE statement that adds the meta_keywords column
-- without affecting existing data.
-- ============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT DEFAULT NULL;
