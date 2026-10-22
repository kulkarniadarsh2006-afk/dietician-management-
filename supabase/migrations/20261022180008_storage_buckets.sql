-- ==============================================================================
-- Migration: 20261022180008_storage_buckets.sql
-- Description: Provision private storage bucket 'diet-plans' (non-public, 15MB limit,
--              PDF-only) and configure storage.objects RLS policies for active staff.
-- ==============================================================================

-- 1. Create or configure private 'diet-plans' bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diet-plans',
  'diet-plans',
  false,               -- Strictly private, never publicly accessible
  15728640,            -- 15 MB file size limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Storage RLS Policies: storage.objects
-- Note: storage.objects already has RLS enabled by Supabase Storage engine

-- Active staff can read objects from 'diet-plans' bucket (to generate server signed URLs)
CREATE POLICY "Active staff can read diet-plans storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'diet-plans' 
    AND public.is_active_staff()
  );

-- Active staff can upload PDF plans to 'diet-plans' bucket
CREATE POLICY "Active staff can upload diet-plans storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'diet-plans' 
    AND public.is_active_staff()
  );

-- Active staff can update plans in 'diet-plans' bucket
CREATE POLICY "Active staff can update diet-plans storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'diet-plans' 
    AND public.is_active_staff()
  )
  WITH CHECK (
    bucket_id = 'diet-plans' 
    AND public.is_active_staff()
  );

-- Only administrators can delete PDF plans from storage
CREATE POLICY "Admins can delete diet-plans storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'diet-plans' 
    AND public.is_admin()
  );
