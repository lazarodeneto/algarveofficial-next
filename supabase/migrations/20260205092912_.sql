-- Tighten overly permissive insert policy flagged by linter
-- Allows public submissions but prevents inserting claims on behalf of another user.

ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listing_claims_insert_public ON public.listing_claims;

CREATE POLICY listing_claims_insert_public
ON public.listing_claims
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);
;
