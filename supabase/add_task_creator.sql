-- ============================================
-- YAN MAG — Add Task Creator Column
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This adds the created_by column to the dashboard_tasks table to track 
-- which administrator or editor entered each task.
-- ============================================

ALTER TABLE public.dashboard_tasks
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'Sistema';
