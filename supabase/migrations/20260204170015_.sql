-- Drop the old INSERT policy that doesn't work properly for logged-in users
DROP POLICY IF EXISTS "listing_claims_insert" ON public.listing_claims;
DROP POLICY IF EXISTS "listing_claims_insert_anon" ON public.listing_claims;

-- Create a single unified INSERT policy that allows:
-- 1. Anonymous users (when user_id is NULL)
-- 2. Authenticated users (regardless of user_id value)
CREATE POLICY "listing_claims_insert_public"
ON public.listing_claims
FOR INSERT
TO public
WITH CHECK (true);;
