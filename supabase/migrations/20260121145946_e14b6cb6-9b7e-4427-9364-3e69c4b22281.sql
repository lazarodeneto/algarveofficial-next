-- Fix: Restrict listing image uploads to user-owned folders only
-- This prevents any authenticated user from uploading to arbitrary paths

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Users can upload to their own listing folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
