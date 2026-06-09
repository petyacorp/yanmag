-- ============================================
-- YAN MAG — Fix Storage RLS Policies
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- 1. Ensure the helper function exists
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public read access on media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin and editor upload to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin and editor update media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin and editor delete from media bucket" ON storage.objects;

-- 3. Allow public read access to all files in the 'media' bucket
CREATE POLICY "Public read access on media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- 4. Allow authenticated admin/editor users to upload files
CREATE POLICY "Admin and editor upload to media bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- 5. Allow authenticated admin/editor users to update files
CREATE POLICY "Admin and editor update media bucket"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- 6. Allow authenticated admin/editor users to delete files
CREATE POLICY "Admin and editor delete from media bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND public.get_user_role() IN ('admin', 'editor')
  );
