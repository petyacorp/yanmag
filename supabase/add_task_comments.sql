-- ============================================
-- YAN MAG — Add Task Comments
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the task_comments table and configures RLS.
-- ============================================

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.dashboard_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.task_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.task_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.task_comments;

-- 1. All authenticated users can view comments
CREATE POLICY "Authenticated users can view comments"
  ON public.task_comments FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- 2. All authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.task_comments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );

-- 3. Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.task_comments FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );
