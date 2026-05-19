-- Guard paid business claim approval with active Stripe-backed subscription state.
-- This migration prepares the production-safe function change; do not apply to
-- linked production until the dashboard/webhook migration has been reviewed.

CREATE OR REPLACE FUNCTION public.admin_review_business_claim(
  _claim_id uuid,
  _action text,
  _admin_note text DEFAULT NULL,
  _force boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid := auth.uid();
  _claim public.business_claims%ROWTYPE;
  _listing public.listings%ROWTYPE;
  _active_claim_count integer := 0;
  _now timestamptz := now();
  _note text := NULLIF(btrim(COALESCE(_admin_note, '')), '');
  _approved_listing_tier public.listing_tier := 'unverified'::public.listing_tier;
  _selected_tier_rank integer := 0;
  _subscription_tier_rank integer := 0;
BEGIN
  IF _actor_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin authentication required');
  END IF;

  IF NOT public.has_role(_actor_id, 'admin'::public.app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can review business claims');
  END IF;

  SELECT *
    INTO _claim
    FROM public.business_claims
    WHERE id = _claim_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  SELECT *
    INTO _listing
    FROM public.listings
    WHERE id = _claim.listing_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Linked listing not found');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _claim.claimant_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claimant account not found');
  END IF;

  IF _action = 'approve' THEN
    IF _listing.claim_status = 'claimed'::public.listing_claim_status
       AND _listing.owner_id <> _claim.claimant_user_id
       AND _force IS DISTINCT FROM true THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Listing is already claimed by another owner. Mark the claim disputed before reassigning ownership.'
      );
    END IF;

    _approved_listing_tier := CASE _claim.selected_tier
      WHEN 'signature'::public.business_claim_tier THEN 'signature'::public.listing_tier
      WHEN 'verified'::public.business_claim_tier THEN 'verified'::public.listing_tier
      ELSE 'unverified'::public.listing_tier
    END;

    _selected_tier_rank := CASE _approved_listing_tier
      WHEN 'signature'::public.listing_tier THEN 2
      WHEN 'verified'::public.listing_tier THEN 1
      ELSE 0
    END;

    IF _selected_tier_rank > 0 THEN
      SELECT CASE os.tier
          WHEN 'signature'::public.listing_tier THEN 2
          WHEN 'verified'::public.listing_tier THEN 1
          ELSE 0
        END
        INTO _subscription_tier_rank
        FROM public.owner_subscriptions os
        WHERE os.owner_id = _claim.claimant_user_id
          AND os.tier_source = 'stripe'
          AND os.tier IN ('verified'::public.listing_tier, 'signature'::public.listing_tier)
          AND (
            (os.plan_type = 'fixed_2026' AND os.end_date IS NOT NULL AND os.end_date >= current_date)
            OR (
              os.plan_type <> 'fixed_2026'
              AND os.status IN ('active', 'trialing', 'past_due')
            )
          )
        ORDER BY
          CASE os.tier
            WHEN 'signature'::public.listing_tier THEN 2
            WHEN 'verified'::public.listing_tier THEN 1
            ELSE 0
          END DESC,
          os.updated_at DESC NULLS LAST,
          os.created_at DESC NULLS LAST
        LIMIT 1;

      IF COALESCE(_subscription_tier_rank, 0) < _selected_tier_rank THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Active paid Stripe subscription is required before approving this paid tier claim',
          'claim_id', _claim_id,
          'listing_id', _claim.listing_id,
          'owner_id', _claim.claimant_user_id,
          'tier', _approved_listing_tier
        );
      END IF;
    END IF;

    UPDATE public.business_claims
       SET status = 'approved'::public.business_claim_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           review_note = _note,
           rejection_reason = NULL,
           updated_at = _now
     WHERE id = _claim_id;

    UPDATE public.listings
       SET owner_id = _claim.claimant_user_id,
           tier = _approved_listing_tier,
           claim_status = 'claimed'::public.listing_claim_status,
           claimed_at = _now,
           claim_verified_at = _now,
           claim_verification_method = _claim.verification_method,
           updated_at = _now
     WHERE id = _claim.listing_id;

    UPDATE public.business_claims
       SET status = 'cancelled'::public.business_claim_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           review_note = COALESCE(review_note, 'Closed because another claim for this listing was approved.'),
           updated_at = _now
     WHERE listing_id = _claim.listing_id
       AND id <> _claim_id
       AND status IN (
         'pending'::public.business_claim_status,
         'needs_more_info'::public.business_claim_status
       );

    RETURN jsonb_build_object(
      'success', true,
      'action', _action,
      'claim_id', _claim_id,
      'listing_id', _claim.listing_id,
      'owner_id', _claim.claimant_user_id,
      'tier', _approved_listing_tier
    );
  END IF;

  IF _action = 'reject' THEN
    UPDATE public.business_claims
       SET status = 'rejected'::public.business_claim_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           rejection_reason = _note,
           review_note = _note,
           updated_at = _now
     WHERE id = _claim_id;

    SELECT COUNT(*)
      INTO _active_claim_count
      FROM public.business_claims
      WHERE listing_id = _claim.listing_id
        AND id <> _claim_id
        AND status IN (
          'pending'::public.business_claim_status,
          'needs_more_info'::public.business_claim_status
        );

    IF _active_claim_count = 0
       AND _listing.claim_status <> 'claimed'::public.listing_claim_status THEN
      UPDATE public.listings
         SET claim_status = 'unclaimed'::public.listing_claim_status,
             updated_at = _now
       WHERE id = _claim.listing_id;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'action', _action,
      'claim_id', _claim_id,
      'listing_id', _claim.listing_id
    );
  END IF;

  IF _action = 'needs_more_info' THEN
    UPDATE public.business_claims
       SET status = 'needs_more_info'::public.business_claim_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           review_note = _note,
           updated_at = _now
     WHERE id = _claim_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', _action,
      'claim_id', _claim_id,
      'listing_id', _claim.listing_id
    );
  END IF;

  IF _action = 'dispute' THEN
    UPDATE public.business_claims
       SET status = 'disputed'::public.business_claim_status,
           reviewed_by = _actor_id,
           reviewed_at = _now,
           review_note = _note,
           updated_at = _now
     WHERE id = _claim_id;

    UPDATE public.listings
       SET claim_status = 'disputed'::public.listing_claim_status,
           updated_at = _now
     WHERE id = _claim.listing_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', _action,
      'claim_id', _claim_id,
      'listing_id', _claim.listing_id
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unsupported claim review action');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean) TO authenticated, service_role;

COMMENT ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean)
  IS 'Atomically reviews a structured business claim and only assigns paid listing tiers when a matching active Stripe-backed subscription exists.';
