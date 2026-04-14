-- Fix listings UPDATE RLS policy to use user_roles table instead of JWT claims
DROP POLICY IF EXISTS "listings_update_safe" ON public.listings;
CREATE POLICY "listings_update_safe" ON public.listings
FOR UPDATE USING (
  auth.uid() = owner_id 
  OR public.is_admin_or_editor(auth.uid())
) WITH CHECK (
  auth.uid() = owner_id 
  OR public.is_admin_or_editor(auth.uid())
);
