-- Clear low-risk Supabase database linter warnings without changing app data.
--
-- This migration intentionally avoids revoking authenticated access from
-- app-used RPCs. Those remaining warnings require moving direct browser/user
-- client RPC calls behind server API routes before the grants can be removed.

-- 1. SECURITY: pin search_path for linted functions.
DO $$
DECLARE
  function_name text;
  target_function regprocedure;
BEGIN
  FOREACH function_name IN ARRAY ARRAY[
    'update_listing_seo',
    'hash_en_translation',
    'handle_new_user',
    'set_featured_ranks',
    'set_ctx_positions',
    'mark_blog_post_translations_needs_review',
    'set_golf_updated_at',
    'pin_listing_to_context',
    'unpin_listing_from_context',
    'cleanup_expired_featured_positions',
    'validate_slot_price',
    'normalize_listing_slug_input'
  ]
  LOOP
    FOR target_function IN
      SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = function_name
    LOOP
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', target_function);
    END LOOP;
  END LOOP;
END
$$;

-- 2. SECURITY: replace analytics INSERT policies that used an unbounded check.
DROP POLICY IF EXISTS "analytics_events_anon_insert" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_auth_insert" ON public.analytics_events;

CREATE POLICY "analytics_events_anon_insert"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND event_type IS NOT NULL
  AND char_length(event_type) BETWEEN 1 AND 80
  AND (session_id IS NULL OR char_length(session_id) <= 160)
  AND (referrer IS NULL OR char_length(referrer) <= 2048)
  AND (user_agent IS NULL OR char_length(user_agent) <= 1024)
  AND jsonb_typeof(COALESCE(event_data, '{}'::jsonb)) = 'object'
);

CREATE POLICY "analytics_events_auth_insert"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (user_id IS NULL OR user_id = auth.uid())
  AND event_type IS NOT NULL
  AND char_length(event_type) BETWEEN 1 AND 80
  AND (session_id IS NULL OR char_length(session_id) <= 160)
  AND (referrer IS NULL OR char_length(referrer) <= 2048)
  AND (user_agent IS NULL OR char_length(user_agent) <= 1024)
  AND jsonb_typeof(COALESCE(event_data, '{}'::jsonb)) = 'object'
);

COMMENT ON POLICY "analytics_events_anon_insert" ON public.analytics_events
  IS 'Allows consented anonymous analytics inserts while blocking user_id spoofing and obviously invalid payloads.';

COMMENT ON POLICY "analytics_events_auth_insert" ON public.analytics_events
  IS 'Allows consented authenticated analytics inserts only for anonymous events or the current auth.uid().';

-- 3. SECURITY: public buckets do not need broad storage.objects SELECT policies
-- for public object URL delivery; removing them prevents bucket-wide listing.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;

-- 4. SECURITY: remove direct RPC execute access for internal-only functions.
DO $$
DECLARE
  function_name text;
  target_function regprocedure;
BEGIN
  FOREACH function_name IN ARRAY ARRAY[
    'anonymize_analytics_ip',
    'archive_past_event_listings',
    'auto_archive_past_event_listing',
    'auto_grant_owner_role_on_listing_assignment',
    'chat_messages_set_recipient_id',
    'check_admin_rate_limit',
    'cleanup_expired_featured_positions',
    'cleanup_newsletter_rate_limits',
    'cleanup_old_analytics_events',
    'cleanup_old_rate_limits',
    'cleanup_old_view_tracking',
    'cleanup_tracking',
    'cleanup_view_tracking',
    'debug_current_user_access',
    'enforce_event_protected_fields',
    'enforce_listing_protected_fields',
    'increment_campaign_bounced',
    'increment_campaign_clicked',
    'increment_campaign_opened',
    'increment_email_bounces',
    'increment_email_clicks',
    'increment_email_opens',
    'listings_content_changed',
    'listings_insert_translation_jobs',
    'listings_queue_translation_jobs',
    'log_sensitive_access',
    'mask_ip_address',
    'notify_admin_on_subscription_change',
    'refresh_all_segment_counts',
    'rls_auto_enable',
    'set_chat_message_recipient_id',
    'sync_event_to_listing',
    'sync_subscriber_to_contacts',
    'track_listing_slug_change',
    'trigger_refresh_segment_counts'
  ]
  LOOP
    FOR target_function IN
      SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = function_name
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', target_function);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', target_function);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', target_function);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', target_function);
    END LOOP;
  END LOOP;
END
$$;

-- 5. SECURITY: app-used authenticated RPCs should not be callable anonymously.
-- Authenticated grants are retained because current app code still calls these
-- through Supabase user clients after route/UI role checks.
DO $$
DECLARE
  function_name text;
  target_function regprocedure;
BEGIN
  FOREACH function_name IN ARRAY ARRAY[
    'admin_delete_chat_message',
    'admin_delete_chat_thread',
    'admin_delete_listings',
    'admin_owner_crm_summaries',
    'admin_review_business_claim',
    'admin_review_listing_change_request',
    'admin_set_user_role',
    'admin_update_listing_slug',
    'approve_claim_and_assign_listing',
    'get_listing_contact_for_user',
    'get_owner_subscription_status',
    'get_public_profile',
    'get_user_role',
    'mark_thread_messages_read',
    'owner_has_whatsapp',
    'pin_listing_to_context',
    'set_ctx_positions',
    'set_featured_ranks',
    'unpin_listing_from_context',
    'update_listing_canonical_slug'
  ]
  LOOP
    FOR target_function IN
      SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = function_name
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', target_function);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', target_function);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', target_function);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', target_function);
    END LOOP;
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';
