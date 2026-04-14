
-- Remove legacy duplicate policies that use TO public (should be TO authenticated)
DROP POLICY IF EXISTS "email_subscribers_admin_only" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_admin_insert" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_admin_update" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_admin_delete" ON public.email_subscribers;
;
