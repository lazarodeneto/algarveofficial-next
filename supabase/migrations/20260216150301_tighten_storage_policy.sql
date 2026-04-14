-- Tighten listings storage policy

-- Drop the loose policy
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
-- Create a stricter policy
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listings' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
