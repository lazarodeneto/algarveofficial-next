-- Tighten listing-images upload policy: only listing owners or admins/editors
-- can upload to a listing folder.

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
  AND (
    public.is_admin_or_editor(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id::text = (storage.foldername(name))[1]
        AND l.owner_id = auth.uid()
    )
  )
);
