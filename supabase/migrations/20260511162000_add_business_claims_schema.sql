-- Structured business listing claim backbone.
-- This does not approve claims or assign listing ownership automatically.

DO $$
BEGIN
  CREATE TYPE public.business_claim_status AS ENUM (
    'pending',
    'needs_more_info',
    'approved',
    'rejected',
    'cancelled',
    'disputed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.business_claim_tier AS ENUM (
    'free',
    'verified',
    'signature'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.listing_claim_status AS ENUM (
    'unclaimed',
    'claim_pending',
    'claimed',
    'disputed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS claim_status public.listing_claim_status NOT NULL DEFAULT 'unclaimed',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claim_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claim_verification_method TEXT;

CREATE TABLE IF NOT EXISTS public.business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL CHECK (length(btrim(claimant_name)) > 0),
  claimant_email TEXT NOT NULL CHECK (length(btrim(claimant_email)) > 0),
  claimant_phone TEXT,
  claimant_role TEXT,
  business_email TEXT,
  company_website TEXT,
  selected_tier public.business_claim_tier NOT NULL DEFAULT 'free',
  verification_method TEXT NOT NULL CHECK (length(btrim(verification_method)) > 0),
  proof_url TEXT,
  proof_notes TEXT,
  message TEXT,
  status public.business_claim_status NOT NULL DEFAULT 'pending',
  confidence_score NUMERIC(5, 2) CHECK (
    confidence_score IS NULL
    OR (confidence_score >= 0 AND confidence_score <= 100)
  ),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_claims_reviewer_not_claimant CHECK (
    reviewed_by IS NULL OR reviewed_by <> claimant_user_id
  )
);

CREATE INDEX IF NOT EXISTS idx_business_claims_listing_status_created
  ON public.business_claims (listing_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_claims_claimant_status_created
  ON public.business_claims (claimant_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_claims_reviewed_by
  ON public.business_claims (reviewed_by)
  WHERE reviewed_by IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_claims_one_active_per_listing
  ON public.business_claims (listing_id)
  WHERE status IN (
    'pending'::public.business_claim_status,
    'needs_more_info'::public.business_claim_status
  );

DROP TRIGGER IF EXISTS update_business_claims_updated_at ON public.business_claims;
CREATE TRIGGER update_business_claims_updated_at
  BEFORE UPDATE ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_claims_insert_own" ON public.business_claims;
CREATE POLICY "business_claims_insert_own"
  ON public.business_claims FOR INSERT
  TO authenticated
  WITH CHECK (claimant_user_id = auth.uid());

DROP POLICY IF EXISTS "business_claims_select_own" ON public.business_claims;
CREATE POLICY "business_claims_select_own"
  ON public.business_claims FOR SELECT
  TO authenticated
  USING (claimant_user_id = auth.uid());

DROP POLICY IF EXISTS "business_claims_admin_select" ON public.business_claims;
CREATE POLICY "business_claims_admin_select"
  ON public.business_claims FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "business_claims_admin_insert" ON public.business_claims;
CREATE POLICY "business_claims_admin_insert"
  ON public.business_claims FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "business_claims_admin_update" ON public.business_claims;
CREATE POLICY "business_claims_admin_update"
  ON public.business_claims FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "business_claims_admin_delete" ON public.business_claims;
CREATE POLICY "business_claims_admin_delete"
  ON public.business_claims FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.business_claims IS 'Structured manual-review claim requests for existing business listings.';
COMMENT ON COLUMN public.business_claims.listing_id IS 'Required link to exactly one existing listing.';
COMMENT ON COLUMN public.business_claims.selected_tier IS 'Claimant-selected commercial tier for the listing claim flow.';
COMMENT ON COLUMN public.listings.claim_status IS 'Current high-level claim state for the listing; ownership remains controlled by owner_id.';
