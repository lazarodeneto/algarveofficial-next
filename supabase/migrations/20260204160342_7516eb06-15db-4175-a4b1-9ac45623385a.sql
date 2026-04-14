-- Create listing-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,  -- Public bucket for listing images
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');
-- Allow anyone to view listing images (public bucket)
CREATE POLICY "Anyone can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');
-- Allow admins and editors to delete listing images
CREATE POLICY "Admins can delete listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);
-- Allow owners to delete their own listing images (by checking listing ownership)
CREATE POLICY "Owners can delete their listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND EXISTS (
    SELECT 1 FROM listings
    WHERE owner_id = auth.uid()
    AND id = (storage.foldername(name))[1]::uuid
  )
);
