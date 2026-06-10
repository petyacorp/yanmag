-- ============================================
-- YAN MAG — Add Rating to Articles
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This is a safe ALTER TABLE statement that adds the rating column
-- without affecting existing data.
-- ============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT NULL;
