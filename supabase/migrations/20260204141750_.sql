-- =====================================================
-- FIX REMAINING SECURITY ISSUES
-- =====================================================

-- 1. Fix user_role_view - convert to security_invoker
DROP VIEW IF EXISTS public.user_role_view;
CREATE VIEW public.user_role_view
WITH (security_invoker = on) AS
SELECT 
  user_id,
  role
FROM public.user_roles ur
WHERE public.is_admin_or_editor(auth.uid());

GRANT SELECT ON public.user_role_view TO authenticated;

-- 2. Revoke API access to materialized views (if any exist)
-- This prevents direct API access while keeping them usable internally
DO $$
DECLARE
  mat_view RECORD;
BEGIN
  FOR mat_view IN 
    SELECT schemaname, matviewname 
    FROM pg_matviews 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE SELECT ON %I.%I FROM anon', mat_view.schemaname, mat_view.matviewname);
  END LOOP;
END $$;;
