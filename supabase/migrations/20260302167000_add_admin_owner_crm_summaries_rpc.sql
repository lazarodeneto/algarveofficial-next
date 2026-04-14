-- Server-side owner CRM summaries for pagination/filter/sort at scale.

CREATE INDEX IF NOT EXISTS idx_chat_threads_owner_last_message
  ON public.chat_threads (owner_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_owner_updated_created
  ON public.owner_subscriptions (owner_id, updated_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_owner_read
  ON public.admin_notifications (owner_id, is_read);
CREATE INDEX IF NOT EXISTS idx_email_contacts_user_id
  ON public.email_contacts (user_id);
CREATE OR REPLACE FUNCTION public.admin_owner_crm_summaries(
  p_search TEXT DEFAULT NULL,
  p_status_filter TEXT DEFAULT 'all',
  p_sort TEXT DEFAULT 'activity',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_search TEXT := NULLIF(TRIM(p_search), '');
  v_status_filter TEXT := LOWER(COALESCE(p_status_filter, 'all'));
  v_sort TEXT := LOWER(COALESCE(p_sort, 'activity'));
  v_page INTEGER := GREATEST(COALESCE(p_page, 1), 1);
  v_page_size INTEGER := LEAST(GREATEST(COALESCE(p_page_size, 100), 10), 200);
  v_offset INTEGER := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_page_size, 100), 10), 200);
  v_payload JSONB;
BEGIN
  IF NOT public.is_admin_or_editor() THEN
    RAISE EXCEPTION 'Only admins or editors can access owner CRM summaries'
      USING ERRCODE = '42501';
  END IF;

  IF v_status_filter NOT IN ('all', 'subscribed', 'inactive', 'attention') THEN
    v_status_filter := 'all';
  END IF;

  IF v_sort NOT IN ('activity', 'listings', 'name') THEN
    v_sort := 'activity';
  END IF;

  WITH owner_ids AS (
    SELECT DISTINCT src.owner_id
    FROM (
      SELECT ur.user_id AS owner_id
      FROM public.user_roles ur
      WHERE ur.role = 'owner'::public.app_role

      UNION

      SELECT l.owner_id
      FROM public.listings l
      WHERE l.owner_id IS NOT NULL
    ) src
  ),
  listing_stats AS (
    SELECT
      l.owner_id,
      COUNT(*)::INTEGER AS listing_count,
      COUNT(*) FILTER (WHERE l.status = 'published')::INTEGER AS published_listing_count
    FROM public.listings l
    WHERE l.owner_id IS NOT NULL
    GROUP BY l.owner_id
  ),
  thread_stats AS (
    SELECT
      t.owner_id,
      COUNT(*)::INTEGER AS total_thread_count,
      COUNT(*) FILTER (WHERE t.status = 'active')::INTEGER AS active_thread_count,
      MAX(t.last_message_at) AS last_message_at
    FROM public.chat_threads t
    WHERE t.owner_id IS NOT NULL
    GROUP BY t.owner_id
  ),
  latest_subscriptions AS (
    SELECT DISTINCT ON (os.owner_id)
      os.owner_id,
      os.status,
      os.tier,
      os.billing_period,
      os.current_period_end,
      os.stripe_customer_id
    FROM public.owner_subscriptions os
    ORDER BY os.owner_id, COALESCE(os.updated_at, os.created_at) DESC
  ),
  notification_stats AS (
    SELECT
      n.owner_id,
      COUNT(*) FILTER (WHERE n.is_read = FALSE)::INTEGER AS unread_alerts_count
    FROM public.admin_notifications n
    GROUP BY n.owner_id
  ),
  contact_stats AS (
    SELECT
      ec.user_id AS owner_id,
      TRUE AS has_email_contact
    FROM public.email_contacts ec
    WHERE ec.user_id IS NOT NULL
    GROUP BY ec.user_id
  ),
  owner_rollup AS (
    SELECT
      oid.owner_id,
      COALESCE(role_row.role, 'owner'::public.app_role) AS role,
      p.full_name,
      p.email,
      p.phone,
      p.created_at AS joined_at,
      COALESCE(ls.listing_count, 0) AS listing_count,
      COALESCE(ls.published_listing_count, 0) AS published_listing_count,
      COALESCE(ts.active_thread_count, 0) AS active_thread_count,
      COALESCE(ts.total_thread_count, 0) AS total_thread_count,
      ts.last_message_at,
      sub.status AS subscription_status,
      sub.tier AS subscription_tier,
      sub.billing_period,
      sub.current_period_end,
      sub.stripe_customer_id,
      COALESCE(cs.has_email_contact, FALSE) AS has_email_contact,
      COALESCE(ns.unread_alerts_count, 0) AS unread_alerts_count
    FROM owner_ids oid
    JOIN public.profiles p
      ON p.id = oid.owner_id
    LEFT JOIN LATERAL (
      SELECT ur.role
      FROM public.user_roles ur
      WHERE ur.user_id = oid.owner_id
        AND ur.role = 'owner'::public.app_role
      LIMIT 1
    ) role_row ON TRUE
    LEFT JOIN listing_stats ls
      ON ls.owner_id = oid.owner_id
    LEFT JOIN thread_stats ts
      ON ts.owner_id = oid.owner_id
    LEFT JOIN latest_subscriptions sub
      ON sub.owner_id = oid.owner_id
    LEFT JOIN notification_stats ns
      ON ns.owner_id = oid.owner_id
    LEFT JOIN contact_stats cs
      ON cs.owner_id = oid.owner_id
    WHERE p.email IS NOT NULL
  ),
  filtered AS (
    SELECT oru.*
    FROM owner_rollup oru
    WHERE
      (
        v_search IS NULL
        OR LOWER(oru.email) LIKE '%' || LOWER(v_search) || '%'
        OR LOWER(COALESCE(oru.full_name, '')) LIKE '%' || LOWER(v_search) || '%'
        OR LOWER(COALESCE(oru.subscription_status, '')) LIKE '%' || LOWER(v_search) || '%'
      )
      AND (
        v_status_filter = 'all'
        OR (
          v_status_filter = 'subscribed'
          AND LOWER(COALESCE(oru.subscription_status, '')) IN ('active', 'trialing', 'past_due')
        )
        OR (
          v_status_filter = 'inactive'
          AND LOWER(COALESCE(oru.subscription_status, '')) NOT IN ('active', 'trialing', 'past_due')
        )
        OR (
          v_status_filter = 'attention'
          AND (
            oru.unread_alerts_count > 0
            OR LOWER(COALESCE(oru.subscription_status, '')) IN ('past_due', 'canceled', 'inactive')
          )
        )
      )
  ),
  ordered AS (
    SELECT f.*
    FROM filtered f
    ORDER BY
      CASE WHEN v_sort = 'name' THEN LOWER(COALESCE(f.full_name, f.email)) END ASC NULLS LAST,
      CASE WHEN v_sort = 'listings' THEN f.listing_count END DESC NULLS LAST,
      CASE WHEN v_sort = 'activity' THEN f.last_message_at END DESC NULLS LAST,
      CASE WHEN v_sort = 'activity' THEN f.joined_at END DESC NULLS LAST,
      LOWER(COALESCE(f.full_name, f.email)) ASC
  ),
  paged AS (
    SELECT *
    FROM ordered
    LIMIT v_page_size OFFSET v_offset
  ),
  metrics AS (
    SELECT
      COUNT(*)::INTEGER AS total_owners,
      COALESCE(SUM(oru.listing_count), 0)::INTEGER AS total_listings,
      COUNT(*) FILTER (WHERE LOWER(COALESCE(oru.subscription_status, '')) IN ('active', 'trialing', 'past_due'))::INTEGER AS subscribed_owners,
      COUNT(*) FILTER (
        WHERE oru.unread_alerts_count > 0
          OR LOWER(COALESCE(oru.subscription_status, '')) IN ('past_due', 'canceled', 'inactive')
      )::INTEGER AS attention_owners,
      COUNT(*) FILTER (WHERE oru.total_thread_count > 0)::INTEGER AS owners_with_messages
    FROM owner_rollup oru
  )
  SELECT jsonb_build_object(
    'page', v_page,
    'page_size', v_page_size,
    'total_count', (SELECT COUNT(*)::INTEGER FROM filtered),
    'total_pages', GREATEST(1, CEIL((SELECT COUNT(*)::NUMERIC FROM filtered) / v_page_size)::INTEGER),
    'metrics', (SELECT to_jsonb(m) FROM metrics m),
    'rows', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'ownerId', p.owner_id,
            'role', p.role,
            'fullName', p.full_name,
            'email', p.email,
            'phone', p.phone,
            'joinedAt', p.joined_at,
            'listingCount', p.listing_count,
            'publishedListingCount', p.published_listing_count,
            'activeThreadCount', p.active_thread_count,
            'totalThreadCount', p.total_thread_count,
            'lastMessageAt', p.last_message_at,
            'subscriptionStatus', p.subscription_status,
            'subscriptionTier', p.subscription_tier,
            'billingPeriod', p.billing_period,
            'currentPeriodEnd', p.current_period_end,
            'stripeCustomerId', p.stripe_customer_id,
            'hasEmailContact', p.has_email_contact,
            'unreadAlertsCount', p.unread_alerts_count
          )
        )
        FROM paged p
      ),
      '[]'::JSONB
    )
  ) INTO v_payload;

  RETURN v_payload;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_owner_crm_summaries(TEXT, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_owner_crm_summaries(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_owner_crm_summaries(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO service_role;
