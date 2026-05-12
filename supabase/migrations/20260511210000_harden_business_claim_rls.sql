-- Final hardening for the business claim/change-request flow.
-- Public submissions must go through app APIs so validation, ownership checks,
-- listing status transitions, and notifications stay consistent.

ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_claims_insert_own" ON public.business_claims;
DROP POLICY IF EXISTS "business_claims_no_direct_claimant_insert" ON public.business_claims;
CREATE POLICY "business_claims_no_direct_claimant_insert"
  ON public.business_claims FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "listing_change_requests_insert_own_claimed_listing" ON public.listing_change_requests;
DROP POLICY IF EXISTS "listing_change_requests_insert_own_pending_claimed_listing" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_insert_own_pending_claimed_listing"
  ON public.listing_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND status = 'pending'::public.listing_change_request_status
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND admin_note IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.listings
      WHERE listings.id = listing_change_requests.listing_id
        AND listings.owner_id = auth.uid()
        AND listings.claim_status = 'claimed'::public.listing_claim_status
    )
  );

DO $$
BEGIN
  ALTER TABLE public.business_claims
    ADD CONSTRAINT business_claims_pending_is_unreviewed
    CHECK (
      status <> 'pending'::public.business_claim_status
      OR (
        reviewed_by IS NULL
        AND reviewed_at IS NULL
        AND rejection_reason IS NULL
        AND review_note IS NULL
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.listing_change_requests
    ADD CONSTRAINT listing_change_requests_pending_is_unreviewed
    CHECK (
      status <> 'pending'::public.listing_change_request_status
      OR (
        reviewed_by IS NULL
        AND reviewed_at IS NULL
        AND admin_note IS NULL
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON POLICY "business_claims_no_direct_claimant_insert" ON public.business_claims
  IS 'Claim submissions are handled by /api/business-claims to keep listing claim_status and notifications in sync.';

COMMENT ON POLICY "listing_change_requests_insert_own_pending_claimed_listing" ON public.listing_change_requests
  IS 'Owners may only create fresh pending change requests for their own claimed listings.';
