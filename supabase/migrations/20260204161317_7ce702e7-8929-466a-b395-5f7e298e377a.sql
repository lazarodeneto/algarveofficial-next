-- Allow listing owners to manage their own listing_images (fixes WebP uploads not appearing)

-- INSERT: owners can add images to their own listings
CREATE POLICY "listing_images_owner_insert"
ON public.listing_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
  )
);
-- UPDATE: owners can update images for their own listings
CREATE POLICY "listing_images_owner_update"
ON public.listing_images
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
  )
);
-- DELETE: owners can delete images for their own listings
CREATE POLICY "listing_images_owner_delete"
ON public.listing_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
  )
);
-- Optional: allow admin/editor (based on user_roles table) to manage listing images too
CREATE POLICY "listing_images_admin_editor_insert_v2"
ON public.listing_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'editor')
  )
);
CREATE POLICY "listing_images_admin_editor_update_v2"
ON public.listing_images
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'editor')
  )
);
CREATE POLICY "listing_images_admin_editor_delete_v2"
ON public.listing_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'editor')
  )
);
