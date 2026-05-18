-- Harden May 2026 audit blockers for legacy monetization tables and public form rate limiting.
-- Additive and rollback-safe: no data is deleted.

-- Legacy placement monetization tables are not part of the public API surface.
DO $$
BEGIN
  IF to_regclass('public.placement_slots') IS NOT NULL THEN
    ALTER TABLE public.placement_slots ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.placement_slots FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public read placement_slots" ON public.placement_slots;
    DROP POLICY IF EXISTS "Admin manage placement_slots" ON public.placement_slots;
    DROP POLICY IF EXISTS "placement_slots_admin_read" ON public.placement_slots;

    CREATE POLICY "placement_slots_admin_read"
      ON public.placement_slots FOR SELECT
      TO authenticated
      USING (public.is_admin_or_editor(auth.uid()));

    REVOKE ALL ON public.placement_slots FROM PUBLIC;
    REVOKE ALL ON public.placement_slots FROM anon;
    REVOKE ALL ON public.placement_slots FROM authenticated;
    GRANT SELECT ON public.placement_slots TO authenticated;
    GRANT ALL ON public.placement_slots TO service_role;

    COMMENT ON TABLE public.placement_slots IS
      'Legacy paid placement slot state. Browser users have admin/editor read-only access; writes must go through service-role server workflows.';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.listing_subscriptions') IS NOT NULL THEN
    ALTER TABLE public.listing_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.listing_subscriptions FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public read listing_subscriptions" ON public.listing_subscriptions;
    DROP POLICY IF EXISTS "Admin manage listing_subscriptions" ON public.listing_subscriptions;
    DROP POLICY IF EXISTS "listing_subscriptions_admin_read" ON public.listing_subscriptions;

    CREATE POLICY "listing_subscriptions_admin_read"
      ON public.listing_subscriptions FOR SELECT
      TO authenticated
      USING (public.is_admin_or_editor(auth.uid()));

    REVOKE ALL ON public.listing_subscriptions FROM PUBLIC;
    REVOKE ALL ON public.listing_subscriptions FROM anon;
    REVOKE ALL ON public.listing_subscriptions FROM authenticated;
    GRANT SELECT ON public.listing_subscriptions TO authenticated;
    GRANT ALL ON public.listing_subscriptions TO service_role;

    COMMENT ON TABLE public.listing_subscriptions IS
      'Legacy listing subscription state. Browser users have admin/editor read-only access; Stripe/admin writes must use service-role workflows.';
  END IF;
END
$$;

-- Revenue audit/idempotency tables are service-role only.
DO $$
BEGIN
  IF to_regclass('public.stripe_events_processed') IS NOT NULL THEN
    ALTER TABLE public.stripe_events_processed ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.stripe_events_processed FORCE ROW LEVEL SECURITY;
    REVOKE ALL ON public.stripe_events_processed FROM PUBLIC;
    REVOKE ALL ON public.stripe_events_processed FROM anon;
    REVOKE ALL ON public.stripe_events_processed FROM authenticated;
    GRANT ALL ON public.stripe_events_processed TO service_role;

    COMMENT ON TABLE public.stripe_events_processed IS
      'Legacy Stripe idempotency table. Service-role only.';
  END IF;

  IF to_regclass('public.slot_transactions') IS NOT NULL THEN
    ALTER TABLE public.slot_transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.slot_transactions FORCE ROW LEVEL SECURITY;
    REVOKE ALL ON public.slot_transactions FROM PUBLIC;
    REVOKE ALL ON public.slot_transactions FROM anon;
    REVOKE ALL ON public.slot_transactions FROM authenticated;
    GRANT ALL ON public.slot_transactions TO service_role;

    COMMENT ON TABLE public.slot_transactions IS
      'Legacy slot transaction audit table. Service-role only.';
  END IF;
END
$$;

-- Keep legacy slot RPCs off the public executable surface when present.
DO $$
BEGIN
  IF to_regprocedure('public.confirm_slot_with_validation(uuid,text,text,integer,integer,text)') IS NOT NULL THEN
    ALTER FUNCTION public.confirm_slot_with_validation(UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.confirm_slot_with_validation(UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.confirm_slot_with_validation(UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT)
      TO service_role;
  END IF;

  IF to_regprocedure('public.cleanup_stale_slots()') IS NOT NULL THEN
    ALTER FUNCTION public.cleanup_stale_slots()
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.cleanup_stale_slots()
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.cleanup_stale_slots()
      TO service_role;
  END IF;

  IF to_regprocedure('public.reserve_slot(uuid,text,text,integer,uuid,integer,text)') IS NOT NULL THEN
    ALTER FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID, INTEGER, TEXT)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID, INTEGER, TEXT)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID, INTEGER, TEXT)
      TO service_role;
  END IF;

  IF to_regprocedure('public.reserve_slot(uuid,text,text,integer,uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.reserve_slot(UUID, TEXT, TEXT, INTEGER, UUID)
      TO service_role;
  END IF;

  IF to_regprocedure('public.release_expired_reservations()') IS NOT NULL THEN
    ALTER FUNCTION public.release_expired_reservations()
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.release_expired_reservations()
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.release_expired_reservations()
      TO service_role;
  END IF;

  IF to_regprocedure('public.confirm_slot_reservation(uuid,text,text,integer)') IS NOT NULL THEN
    ALTER FUNCTION public.confirm_slot_reservation(UUID, TEXT, TEXT, INTEGER)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.confirm_slot_reservation(UUID, TEXT, TEXT, INTEGER)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.confirm_slot_reservation(UUID, TEXT, TEXT, INTEGER)
      TO service_role;
  END IF;

  IF to_regprocedure('public.clear_slot_reservation(text,text,integer)') IS NOT NULL THEN
    ALTER FUNCTION public.clear_slot_reservation(TEXT, TEXT, INTEGER)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.clear_slot_reservation(TEXT, TEXT, INTEGER)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.clear_slot_reservation(TEXT, TEXT, INTEGER)
      TO service_role;
  END IF;
END
$$;

-- Atomic rate-limit increment used by server-side public communication forms.
CREATE OR REPLACE FUNCTION public.check_communication_rate_limit(
  p_scope TEXT,
  p_identifier_hash TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_expires_before TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF p_scope IS NULL
    OR length(trim(p_scope)) = 0
    OR p_identifier_hash IS NULL
    OR length(trim(p_identifier_hash)) = 0
    OR p_max_attempts < 1
    OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  v_expires_before := v_now - make_interval(secs => p_window_seconds);

  INSERT INTO public.communication_rate_limits (
    scope,
    identifier_hash,
    count,
    window_start,
    last_seen_at,
    metadata
  )
  VALUES (
    p_scope,
    p_identifier_hash,
    1,
    v_now,
    v_now,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (scope, identifier_hash)
  DO UPDATE SET
    count = CASE
      WHEN public.communication_rate_limits.window_start <= v_expires_before THEN 1
      ELSE public.communication_rate_limits.count + 1
    END,
    window_start = CASE
      WHEN public.communication_rate_limits.window_start <= v_expires_before THEN v_now
      ELSE public.communication_rate_limits.window_start
    END,
    last_seen_at = v_now,
    metadata = COALESCE(p_metadata, '{}'::jsonb)
  RETURNING count INTO v_count;

  RETURN v_count > p_max_attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.check_communication_rate_limit(TEXT, TEXT, INTEGER, INTEGER, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_communication_rate_limit(TEXT, TEXT, INTEGER, INTEGER, JSONB)
  TO service_role;

COMMENT ON FUNCTION public.check_communication_rate_limit(TEXT, TEXT, INTEGER, INTEGER, JSONB)
  IS 'Atomically increments hashed public communication form counters and returns true once the current window exceeds the allowed attempts.';
