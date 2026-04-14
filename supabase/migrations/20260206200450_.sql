
-- Add column to track which listing was assigned when claim was approved
ALTER TABLE public.listing_claims 
ADD COLUMN IF NOT EXISTS assigned_listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL;

-- Create a function to approve a claim and assign a listing in one transaction
CREATE OR REPLACE FUNCTION public.approve_claim_and_assign_listing(
  _claim_id uuid,
  _listing_id uuid,
  _reviewer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _claim RECORD;
  _user_id uuid;
BEGIN
  -- Get the claim
  SELECT * INTO _claim FROM listing_claims WHERE id = _claim_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;
  
  IF _claim.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim is not pending');
  END IF;
  
  _user_id := _claim.user_id;
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim has no registered user. The claimant must create an account first.');
  END IF;
  
  -- Verify listing exists and is published
  IF NOT EXISTS (SELECT 1 FROM listings WHERE id = _listing_id AND status = 'published') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found or not published');
  END IF;
  
  -- 1. Assign listing to user (triggers auto_grant_owner_role_on_listing_assignment)
  UPDATE listings SET owner_id = _user_id, updated_at = now() WHERE id = _listing_id;
  
  -- 2. Update claim status
  UPDATE listing_claims SET
    status = 'approved',
    assigned_listing_id = _listing_id,
    reviewed_by = _reviewer_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = _claim_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Claim approved and listing assigned',
    'user_id', _user_id,
    'listing_id', _listing_id
  );
END;
$$;
;
