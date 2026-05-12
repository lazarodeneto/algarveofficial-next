-- Structured external listing verification workflow.
-- This migration stores audit snapshots and proposed changes only; it does not
-- mutate public listing data.

DO $$
BEGIN
  CREATE TYPE public.listing_verification_audit_status AS ENUM (
    'pending',
    'completed',
    'completed_with_proposals',
    'failed',
    'needs_review'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.listing_update_proposal_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'applied'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.listing_verification_confidence_label AS ENUM (
    'unknown',
    'low',
    'medium',
    'high',
    'verified'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.listing_verification_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL CHECK (length(btrim(batch_id)) > 0),
  status public.listing_verification_audit_status NOT NULL DEFAULT 'pending',
  current_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  proposed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  applied_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(5, 2) CHECK (
    confidence_score IS NULL
    OR (confidence_score >= 0 AND confidence_score <= 100)
  ),
  confidence_label public.listing_verification_confidence_label NOT NULL DEFAULT 'unknown',
  notes TEXT,
  needs_admin_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT listing_verification_audits_current_data_object_chk
    CHECK (jsonb_typeof(current_data) = 'object'),
  CONSTRAINT listing_verification_audits_proposed_data_object_chk
    CHECK (jsonb_typeof(proposed_data) = 'object'),
  CONSTRAINT listing_verification_audits_applied_data_object_chk
    CHECK (jsonb_typeof(applied_data) = 'object'),
  CONSTRAINT listing_verification_audits_sources_array_chk
    CHECK (jsonb_typeof(sources) = 'array'),
  CONSTRAINT listing_verification_audits_id_listing_unique UNIQUE (id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.listing_update_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL,
  field_name TEXT NOT NULL CHECK (length(btrim(field_name)) > 0),
  old_value JSONB,
  proposed_value JSONB NOT NULL,
  source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_type TEXT,
  confidence_label public.listing_verification_confidence_label NOT NULL DEFAULT 'unknown',
  status public.listing_update_proposal_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT listing_update_proposals_source_urls_array_chk
    CHECK (jsonb_typeof(source_urls) = 'array'),
  CONSTRAINT listing_update_proposals_audit_listing_fkey
    FOREIGN KEY (audit_id, listing_id)
    REFERENCES public.listing_verification_audits(id, listing_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_verification_audits_batch_status_created
  ON public.listing_verification_audits (batch_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_verification_audits_listing_status_created
  ON public.listing_verification_audits (listing_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_verification_audits_needs_review
  ON public.listing_verification_audits (needs_admin_review, updated_at DESC)
  WHERE needs_admin_review = true;

CREATE INDEX IF NOT EXISTS idx_listing_update_proposals_listing_status_created
  ON public.listing_update_proposals (listing_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_update_proposals_audit_status_created
  ON public.listing_update_proposals (audit_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_update_proposals_reviewed_by
  ON public.listing_update_proposals (reviewed_by)
  WHERE reviewed_by IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_update_proposals_one_pending_field_per_audit
  ON public.listing_update_proposals (audit_id, field_name)
  WHERE status = 'pending'::public.listing_update_proposal_status;

DROP TRIGGER IF EXISTS update_listing_verification_audits_updated_at ON public.listing_verification_audits;
CREATE TRIGGER update_listing_verification_audits_updated_at
  BEFORE UPDATE ON public.listing_verification_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_update_proposals_updated_at ON public.listing_update_proposals;
CREATE TRIGGER update_listing_update_proposals_updated_at
  BEFORE UPDATE ON public.listing_update_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.listing_verification_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_update_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_verification_audits_admin_select" ON public.listing_verification_audits;
CREATE POLICY "listing_verification_audits_admin_select"
  ON public.listing_verification_audits FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_verification_audits_admin_insert" ON public.listing_verification_audits;
CREATE POLICY "listing_verification_audits_admin_insert"
  ON public.listing_verification_audits FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_verification_audits_admin_update" ON public.listing_verification_audits;
CREATE POLICY "listing_verification_audits_admin_update"
  ON public.listing_verification_audits FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_verification_audits_admin_delete" ON public.listing_verification_audits;
CREATE POLICY "listing_verification_audits_admin_delete"
  ON public.listing_verification_audits FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_update_proposals_admin_select" ON public.listing_update_proposals;
CREATE POLICY "listing_update_proposals_admin_select"
  ON public.listing_update_proposals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_update_proposals_admin_insert" ON public.listing_update_proposals;
CREATE POLICY "listing_update_proposals_admin_insert"
  ON public.listing_update_proposals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_update_proposals_admin_update" ON public.listing_update_proposals;
CREATE POLICY "listing_update_proposals_admin_update"
  ON public.listing_update_proposals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "listing_update_proposals_admin_delete" ON public.listing_update_proposals;
CREATE POLICY "listing_update_proposals_admin_delete"
  ON public.listing_update_proposals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.listing_verification_audits IS 'Admin-only audit trail for external verification checks of existing listings.';
COMMENT ON TABLE public.listing_update_proposals IS 'Admin-only structured field proposals generated from listing verification audits.';
COMMENT ON COLUMN public.listing_verification_audits.batch_id IS 'Batch identifier for controlled verification runs, intended for groups of five listings.';
COMMENT ON COLUMN public.listing_verification_audits.current_data IS 'Snapshot of listing data before external verification.';
COMMENT ON COLUMN public.listing_verification_audits.proposed_data IS 'Structured proposed listing data assembled from verified sources; not applied automatically.';
COMMENT ON COLUMN public.listing_verification_audits.applied_data IS 'Structured data that was later applied after admin review; intentionally empty in initial audit runs.';
COMMENT ON COLUMN public.listing_verification_audits.sources IS 'Array of source objects with URLs, source types, checked_at timestamps, and field-level notes.';
COMMENT ON COLUMN public.listing_update_proposals.field_name IS 'Exact listing field or logical JSON path proposed for admin review.';
COMMENT ON COLUMN public.listing_update_proposals.proposed_value IS 'Structured replacement value proposed by the verification workflow.';
COMMENT ON COLUMN public.listing_update_proposals.source_urls IS 'Array of source URLs supporting this field-level proposal.';
