-- ============================================
-- YAN MAG — Fix Storage RLS Policies
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- BEFORE running: Check Storage > Policies and delete any existing
-- policies for the 'media' bucket to avoid conflicts.
-- ============================================

-- 1. Allow public read access to all files in the 'media' bucket
CREATE POLICY "Public read access on media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- 2. Allow authenticated admin/editor users to upload files
CREATE POLICY "Admin and editor upload to media bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- 3. Allow authenticated admin/editor users to update files
CREATE POLICY "Admin and editor update media bucket"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- 4. Allow authenticated admin/editor users to delete files
CREATE POLICY "Admin and editor delete from media bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );
