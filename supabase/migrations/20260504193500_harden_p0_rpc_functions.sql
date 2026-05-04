-- Harden P0 SECURITY DEFINER RPCs against caller-supplied identity spoofing.
-- This migration keeps existing function signatures for client compatibility,
-- but derives the acting user from auth.uid() inside each function.

CREATE OR REPLACE FUNCTION public.approve_claim_and_assign_listing(
  _claim_id uuid,
  _listing_id uuid,
  _reviewer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _claim record;
  _claim_user_id uuid;
  _actor_id uuid := auth.uid();
BEGIN
  IF _actor_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reviewer authentication required');
  END IF;

  IF NOT (
    public.has_role(_actor_id, 'admin'::public.app_role)
    OR public.has_role(_actor_id, 'editor'::public.app_role)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins or editors can approve listing claims');
  END IF;

  SELECT *
    INTO _claim
    FROM public.listing_claims
    WHERE id = _claim_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF _claim.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim is not pending');
  END IF;

  _claim_user_id := _claim.user_id;

  IF _claim_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim has no registered user. The claimant must create an account first.');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND status = 'published'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found or not published');
  END IF;

  UPDATE public.listings
     SET owner_id = _claim_user_id,
         updated_at = now()
   WHERE id = _listing_id;

  UPDATE public.listing_claims
     SET status = 'approved',
         assigned_listing_id = _listing_id,
         reviewed_by = _actor_id,
         reviewed_at = now(),
         updated_at = now()
   WHERE id = _claim_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Claim approved and listing assigned',
    'user_id', _claim_user_id,
    'listing_id', _listing_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_claim_and_assign_listing(uuid, uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_claim_and_assign_listing(uuid, uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.approve_claim_and_assign_listing(uuid, uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_listing_contact_for_user(
  _listing_id uuid,
  _user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid := auth.uid();
  _result jsonb;
  _has_thread boolean := false;
  _is_owner boolean := false;
  _is_admin boolean := false;
BEGIN
  IF _actor_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF _user_id IS NOT NULL AND _user_id <> _actor_id THEN
    RETURN NULL;
  END IF;

  _is_admin := (
    public.has_role(_actor_id, 'admin'::public.app_role)
    OR public.has_role(_actor_id, 'editor'::public.app_role)
  );

  IF _is_admin THEN
    SELECT jsonb_build_object(
      'contact_email', contact_email,
      'contact_phone', contact_phone,
      'whatsapp_number', whatsapp_number,
      'website_url', website_url
    )
    INTO _result
    FROM public.listings
    WHERE id = _listing_id;

    RETURN _result;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND owner_id = _actor_id
  ) INTO _is_owner;

  IF _is_owner THEN
    SELECT jsonb_build_object(
      'contact_email', contact_email,
      'contact_phone', contact_phone,
      'whatsapp_number', whatsapp_number,
      'website_url', website_url
    )
    INTO _result
    FROM public.listings
    WHERE id = _listing_id;

    RETURN _result;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.chat_threads
    WHERE listing_id = _listing_id
      AND viewer_id = _actor_id
      AND status = 'active'
  ) INTO _has_thread;

  IF _has_thread THEN
    SELECT jsonb_build_object(
      'website_url', website_url,
      'has_whatsapp', whatsapp_number IS NOT NULL
    )
    INTO _result
    FROM public.listings
    WHERE id = _listing_id;
  ELSE
    SELECT jsonb_build_object(
      'website_url', website_url
    )
    INTO _result
    FROM public.listings
    WHERE id = _listing_id;
  END IF;

  RETURN _result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_listing_contact_for_user(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_listing_contact_for_user(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_listing_contact_for_user(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_owner_subscription_status(_owner_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid := auth.uid();
  _result jsonb;
BEGIN
  IF _actor_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF _owner_id <> _actor_id
     AND NOT (
       public.has_role(_actor_id, 'admin'::public.app_role)
       OR public.has_role(_actor_id, 'editor'::public.app_role)
     ) THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'subscribed', (status = 'active' OR status = 'trialing'),
    'tier', tier,
    'billing_period', billing_period,
    'status', status,
    'current_period_end', current_period_end,
    'has_stripe_customer', (stripe_customer_id IS NOT NULL)
  )
  INTO _result
  FROM public.owner_subscriptions
  WHERE owner_id = _owner_id;

  RETURN _result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_owner_subscription_status(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_owner_subscription_status(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_owner_subscription_status(uuid) TO authenticated, service_role;
