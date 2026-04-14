
-- ============================================================
-- SECURITY AUDIT FIX: Remove dangerous public_read policies
-- and tighten access on admin-only tables
-- ============================================================

-- 1) DROP all _public_read policies (USING true, TO public) on internal/admin tables
DROP POLICY IF EXISTS "ai_generation_logs_public_read" ON public.ai_generation_logs;
DROP POLICY IF EXISTS "analytics_daily_public_read" ON public.analytics_daily;
DROP POLICY IF EXISTS "automation_enrollments_public_read" ON public.automation_enrollments;
DROP POLICY IF EXISTS "campaign_recipients_public_read" ON public.campaign_recipients;
DROP POLICY IF EXISTS "email_automations_public_read" ON public.email_automations;
DROP POLICY IF EXISTS "email_campaigns_public_read" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_events_public_read" ON public.email_events;
DROP POLICY IF EXISTS "email_segments_public_read" ON public.email_segments;
DROP POLICY IF EXISTS "email_templates_public_read" ON public.email_templates;
DROP POLICY IF EXISTS "google_ratings_refresh_log_public_read" ON public.google_ratings_refresh_log;
DROP POLICY IF EXISTS "promotional_codes_public_read" ON public.promotional_codes;
DROP POLICY IF EXISTS "view_tracking_public_read" ON public.view_tracking;
DROP POLICY IF EXISTS "whatsapp_webhook_events_public_read" ON public.whatsapp_webhook_events;

-- 2) Add proper admin-only SELECT for tables that had ONLY public_read (no admin select existed)
CREATE POLICY "ai_generation_logs_admin_select"
  ON public.ai_generation_logs FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "analytics_daily_admin_select"
  ON public.analytics_daily FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "automation_enrollments_admin_select"
  ON public.automation_enrollments FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "google_ratings_refresh_log_admin_select"
  ON public.google_ratings_refresh_log FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "promotional_codes_admin_select"
  ON public.promotional_codes FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "view_tracking_admin_select"
  ON public.view_tracking FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "whatsapp_webhook_events_admin_select"
  ON public.whatsapp_webhook_events FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 3) Fix google_ratings_sync_status — has (true OR true) merged SELECT
DROP POLICY IF EXISTS "merged_select_public_google_ratings_sync_status" ON public.google_ratings_sync_status;
CREATE POLICY "google_ratings_sync_status_admin_select"
  ON public.google_ratings_sync_status FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 4) Drop legacy duplicate _safe policies on email_contacts (TO public instead of TO authenticated)
DROP POLICY IF EXISTS "email_contacts_admin_only" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_delete_safe" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_insert_safe" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_update_safe" ON public.email_contacts;

-- 5) Drop legacy _safe policies on whatsapp_accounts (TO public)
DROP POLICY IF EXISTS "whatsapp_accounts_delete_safe" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "whatsapp_accounts_insert_safe" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "whatsapp_accounts_update_safe" ON public.whatsapp_accounts;

-- 6) Drop legacy _safe policies on owner_subscriptions (TO public)
DROP POLICY IF EXISTS "owner_subscriptions_delete_safe" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_insert_safe" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_update_safe" ON public.owner_subscriptions;
-- Re-create as TO authenticated
CREATE POLICY "owner_subscriptions_insert_auth"
  ON public.owner_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "owner_subscriptions_update_auth"
  ON public.owner_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "owner_subscriptions_delete_auth"
  ON public.owner_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id OR is_admin_or_editor(auth.uid()));

-- 7) Fix translation_jobs — RLS enabled but no policies
CREATE POLICY "translation_jobs_admin_select"
  ON public.translation_jobs FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "translation_jobs_admin_insert"
  ON public.translation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "translation_jobs_admin_update"
  ON public.translation_jobs FOR UPDATE
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "translation_jobs_admin_delete"
  ON public.translation_jobs FOR DELETE
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 8) Fix functions missing search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.hash_en_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.language_code = 'en' THEN
    NEW.source_hash = md5(COALESCE(NEW.title, '') || COALESCE(NEW.description, '') || COALESCE(NEW.short_description, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
;
