-- Owner listing edits are submitted as structured change requests.
-- Admin review applies approved changes in a later operational phase.

DO $$
BEGIN
  CREATE TYPE public.listing_change_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.listing_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL CHECK (length(btrim(field_name)) > 0),
  old_value JSONB,
  requested_value JSONB NOT NULL,
  status public.listing_change_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT listing_change_requests_reviewer_not_owner CHECK (
    reviewed_by IS NULL OR reviewed_by <> owner_id
  )
);

CREATE INDEX IF NOT EXISTS idx_listing_change_requests_listing_status_created
  ON public.listing_change_requests (listing_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_change_requests_owner_status_created
  ON public.listing_change_requests (owner_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_change_requests_reviewed_by
  ON public.listing_change_requests (reviewed_by)
  WHERE reviewed_by IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_change_requests_one_pending_per_field
  ON public.listing_change_requests (listing_id, owner_id, field_name)
  WHERE status = 'pending'::public.listing_change_request_status;

DROP TRIGGER IF EXISTS update_listing_change_requests_updated_at ON public.listing_change_requests;
CREATE TRIGGER update_listing_change_requests_updated_at
  BEFORE UPDATE ON public.listing_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.listing_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_change_requests_insert_own_claimed_listing" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_insert_own_claimed_listing"
  ON public.listing_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.listings
      WHERE listings.id = listing_change_requests.listing_id
        AND listings.owner_id = auth.uid()
        AND listings.claim_status = 'claimed'::public.listing_claim_status
    )
  );

DROP POLICY IF EXISTS "listing_change_requests_select_own" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_select_own"
  ON public.listing_change_requests FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "listing_change_requests_admin_select" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_admin_select"
  ON public.listing_change_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_change_requests_admin_update" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_admin_update"
  ON public.listing_change_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_change_requests_admin_delete" ON public.listing_change_requests;
CREATE POLICY "listing_change_requests_admin_delete"
  ON public.listing_change_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.listing_change_requests IS 'Structured owner-submitted listing edits requiring admin review.';
COMMENT ON COLUMN public.listing_change_requests.field_name IS 'Listing field or logical field requested by the owner, e.g. contact_phone or opening_hours.';
COMMENT ON COLUMN public.listing_change_requests.old_value IS 'Snapshot of the value at request time for admin comparison.';
COMMENT ON COLUMN public.listing_change_requests.requested_value IS 'Owner-proposed replacement value stored as JSONB.';
