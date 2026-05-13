-- Repair live RLS policy drift reported by Supabase advisor.
--
-- Policy intent:
-- - golf_holes: public scorecard reads, admin-only writes.
-- - listing_featured_positions: public ranking reads, admin/editor management.
-- - content_links, listing_quality_checks: no current app usage; keep client access denied.
-- - stripe_webhook_events, subscription_audit_log: service-role-only operational tables;
--   explicit deny-all client policies keep the existing no-client-access behavior while
--   satisfying the "RLS enabled but no policy" advisor check.

DO $rls$
BEGIN
  IF to_regclass('public.golf_holes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.golf_holes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS golf_holes_select_public ON public.golf_holes';
    EXECUTE 'DROP POLICY IF EXISTS golf_holes_admin_write ON public.golf_holes';

    EXECUTE $sql$
      CREATE POLICY golf_holes_select_public
        ON public.golf_holes
        FOR SELECT
        TO anon, authenticated
        USING (true)
    $sql$;

    EXECUTE $sql$
      CREATE POLICY golf_holes_admin_write
        ON public.golf_holes
        FOR ALL
        TO authenticated
        USING (public.has_role(auth.uid(), 'admin'::public.app_role))
        WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role))
    $sql$;

    EXECUTE 'GRANT SELECT ON public.golf_holes TO anon, authenticated';
  END IF;

  IF to_regclass('public.listing_featured_positions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.listing_featured_positions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read listing_featured_positions" ON public.listing_featured_positions';
    EXECUTE 'DROP POLICY IF EXISTS "Admin manage listing_featured_positions" ON public.listing_featured_positions';
    EXECUTE 'DROP POLICY IF EXISTS listing_featured_positions_public_read ON public.listing_featured_positions';
    EXECUTE 'DROP POLICY IF EXISTS listing_featured_positions_admin_manage ON public.listing_featured_positions';

    EXECUTE $sql$
      CREATE POLICY listing_featured_positions_public_read
        ON public.listing_featured_positions
        FOR SELECT
        TO anon, authenticated
        USING (true)
    $sql$;

    EXECUTE $sql$
      CREATE POLICY listing_featured_positions_admin_manage
        ON public.listing_featured_positions
        FOR ALL
        TO authenticated
        USING (public.is_admin_or_editor(auth.uid()))
        WITH CHECK (public.is_admin_or_editor(auth.uid()))
    $sql$;

    EXECUTE 'GRANT SELECT ON public.listing_featured_positions TO anon, authenticated';
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.listing_featured_positions FROM anon, authenticated';
  END IF;

  IF to_regclass('public.content_links') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.content_links ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS content_links_no_client_access ON public.content_links';

    EXECUTE $sql$
      CREATE POLICY content_links_no_client_access
        ON public.content_links
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
    $sql$;
  END IF;

  IF to_regclass('public.listing_quality_checks') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.listing_quality_checks ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS listing_quality_checks_no_client_access ON public.listing_quality_checks';

    EXECUTE $sql$
      CREATE POLICY listing_quality_checks_no_client_access
        ON public.listing_quality_checks
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
    $sql$;
  END IF;

  IF to_regclass('public.stripe_webhook_events') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS stripe_webhook_events_no_client_access ON public.stripe_webhook_events';

    EXECUTE $sql$
      CREATE POLICY stripe_webhook_events_no_client_access
        ON public.stripe_webhook_events
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
    $sql$;
  END IF;

  IF to_regclass('public.subscription_audit_log') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS subscription_audit_log_no_client_access ON public.subscription_audit_log';

    EXECUTE $sql$
      CREATE POLICY subscription_audit_log_no_client_access
        ON public.subscription_audit_log
        FOR ALL
        TO anon, authenticated
        USING (false)
        WITH CHECK (false)
    $sql$;
  END IF;
END
$rls$;

NOTIFY pgrst, 'reload schema';
