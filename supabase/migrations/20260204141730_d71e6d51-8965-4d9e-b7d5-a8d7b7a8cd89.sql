-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Fixes: OR true policies, security definer views, 
--        function search_path, and exposed PII
-- =====================================================

-- =====================================================
-- 1. FIX "OR true" VULNERABILITIES IN RLS POLICIES
-- =====================================================

-- 1a. owner_subscriptions - Remove OR true, restrict to owner + admins
DROP POLICY IF EXISTS "owner_subscriptions_select_safe" ON public.owner_subscriptions;
CREATE POLICY "owner_subscriptions_select_own"
  ON public.owner_subscriptions FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR public.is_admin_or_editor(auth.uid())
  );
-- 1b. whatsapp_accounts - Remove OR true, restrict to owner + admins
DROP POLICY IF EXISTS "whatsapp_accounts_select_safe" ON public.whatsapp_accounts;
CREATE POLICY "whatsapp_accounts_select_own"
  ON public.whatsapp_accounts FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR public.is_admin_or_editor(auth.uid())
  );
-- 1c. admin_notifications - Remove OR true, restrict to owner + admins
DROP POLICY IF EXISTS "admin_notifications_select_safe" ON public.admin_notifications;
CREATE POLICY "admin_notifications_select_own"
  ON public.admin_notifications FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR public.is_admin_or_editor(auth.uid())
  );
-- 1d. email_subscribers - Restrict to admin/editor only (contains marketing data)
DROP POLICY IF EXISTS "email_subscribers_public_read" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_select_safe" ON public.email_subscribers;
CREATE POLICY "email_subscribers_admin_only"
  ON public.email_subscribers FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));
-- 1e. email_contacts - Restrict to admin/editor only
DROP POLICY IF EXISTS "email_contacts_select_safe" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_public_read" ON public.email_contacts;
CREATE POLICY "email_contacts_admin_only"
  ON public.email_contacts FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));
-- 1f. profiles - Remove public read, only allow own profile or admin view
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() 
    OR public.is_admin_or_editor(auth.uid())
  );
-- 1g. analytics_events - Restrict to admin/editor only (contains IP, user_agent)
DROP POLICY IF EXISTS "analytics_events_select_safe" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_public_read" ON public.analytics_events;
CREATE POLICY "analytics_events_admin_only"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));
-- 1h. messages - Fix unrestricted read policy
DROP POLICY IF EXISTS "messages_public_read" ON public.messages;
CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.user_id = auth.uid() OR c.owner_id = auth.uid())
    )
    OR public.is_admin_or_editor(auth.uid())
  );
-- =====================================================
-- 2. FIX SECURITY DEFINER VIEWS → SECURITY INVOKER
-- =====================================================

-- 2a. Recreate public_profiles view with security_invoker
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles;
-- 2b. Recreate public_listings view with security_invoker (no contact PII)
DROP VIEW IF EXISTS public.public_listings;
CREATE VIEW public.public_listings
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  slug,
  description,
  short_description,
  category_id,
  city_id,
  region_id,
  owner_id,
  status,
  tier,
  is_curated,
  featured_image_url,
  category_data,
  tags,
  google_rating,
  google_review_count,
  google_business_url,
  latitude,
  longitude,
  address,
  website_url,  -- Public website is OK
  facebook_url,
  instagram_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  price_from,
  price_to,
  price_currency,
  meta_title,
  meta_description,
  view_count,
  published_at,
  created_at,
  updated_at
  -- EXCLUDED: contact_email, contact_phone, whatsapp_number (use RPC)
FROM public.listings
WHERE status = 'published';
-- 2c. Recreate owner_subscription_status view with security_invoker
DROP VIEW IF EXISTS public.owner_subscription_status;
CREATE VIEW public.owner_subscription_status
WITH (security_invoker = on) AS
SELECT 
  owner_id,
  tier,
  billing_period,
  status,
  current_period_end,
  -- Mask Stripe IDs for non-admins (handled by RLS on base table)
  CASE 
    WHEN public.is_admin_or_editor(auth.uid()) THEN stripe_customer_id 
    ELSE NULL 
  END as stripe_customer_id,
  CASE 
    WHEN public.is_admin_or_editor(auth.uid()) THEN stripe_subscription_id 
    ELSE NULL 
  END as stripe_subscription_id,
  created_at,
  updated_at
FROM public.owner_subscriptions;
-- =====================================================
-- 3. FIX FUNCTION SEARCH_PATH ISSUES
-- =====================================================

-- 3a. cleanup_view_tracking
CREATE OR REPLACE FUNCTION public.cleanup_view_tracking(days integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.view_tracking
  WHERE created_at < now() - (days || ' days')::interval;
$$;
-- 3b. cleanup_tracking
CREATE OR REPLACE FUNCTION public.cleanup_tracking(days integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.view_tracking
  WHERE created_at < now() - (days || ' days')::interval;
$$;
-- 3c. _policy_role_ident
CREATE OR REPLACE FUNCTION public._policy_role_ident(role_name text)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF role_name IS NULL OR role_name = '' THEN
    RETURN NULL;
  END IF;

  IF lower(role_name) = 'public' THEN
    RETURN 'PUBLIC';
  END IF;

  RETURN format('%I', role_name);
END;
$$;
-- 3d. get_jwt_role
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT auth.jwt() ->> 'role';
$$;
-- 3e. is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (auth.jwt() ->> 'role') IN ('admin','editor');
$$;
-- 3f. jwt_role
CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT auth.jwt() ->> 'role';
$$;
-- 3g. is_admin_or_editor (no-arg version)
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (auth.jwt() ->> 'role') IN ('admin','editor');
$$;
-- 3h. chat_message_unread_counter
CREATE OR REPLACE FUNCTION public.chat_message_unread_counter()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.direction = 'inbound' THEN
    IF NEW.sender_type = 'viewer' THEN
      UPDATE chat_threads
      SET unread_owner_count = unread_owner_count + 1,
          last_message_at = NEW.created_at
      WHERE id = NEW.thread_id;
    ELSIF NEW.sender_type IN ('owner','admin') THEN
      UPDATE chat_threads
      SET unread_viewer_count = unread_viewer_count + 1,
          last_message_at = NEW.created_at
      WHERE id = NEW.thread_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
-- 3i. chat_messages_set_recipient_id
CREATE OR REPLACE FUNCTION public.chat_messages_set_recipient_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_viewer uuid;
BEGIN
  SELECT owner_id, viewer_id
    INTO v_owner, v_viewer
  FROM public.chat_threads
  WHERE id = NEW.thread_id;

  IF v_owner IS NULL OR v_viewer IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.direction = 'inbound' THEN
    IF NEW.sender_type = 'viewer' THEN
      NEW.recipient_id := v_owner;
    ELSIF NEW.sender_type = 'owner' THEN
      NEW.recipient_id := v_viewer;
    ELSIF NEW.sender_type = 'admin' THEN
      NEW.recipient_id := COALESCE(NEW.recipient_id, v_viewer);
    ELSE
      NEW.recipient_id := COALESCE(NEW.recipient_id, v_owner);
    END IF;
  ELSE
    IF NEW.sender_type = 'viewer' THEN
      NEW.recipient_id := v_owner;
    ELSIF NEW.sender_type = 'owner' THEN
      NEW.recipient_id := v_viewer;
    ELSE
      NEW.recipient_id := COALESCE(NEW.recipient_id, v_viewer);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
-- =====================================================
-- 4. ADD CONVERSATIONS POLICY FOR OWNERS
-- =====================================================

-- Allow business owners to access conversations for their listings
DROP POLICY IF EXISTS "conversations_owner_select" ON public.conversations;
CREATE POLICY "conversations_owner_select"
  ON public.conversations FOR SELECT
  USING (
    user_id = auth.uid() 
    OR owner_id = auth.uid()
    OR public.is_admin_or_editor(auth.uid())
  );
-- =====================================================
-- 5. GRANT VIEW PERMISSIONS
-- =====================================================

GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_listings TO anon, authenticated;
GRANT SELECT ON public.owner_subscription_status TO authenticated;
