-- ============================================
-- YAN MAG — Add Rating Comment to Articles
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This is a safe ALTER TABLE statement that adds the rating_comment column
-- without affecting existing data.
-- ============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS rating_comment TEXT DEFAULT NULL;
