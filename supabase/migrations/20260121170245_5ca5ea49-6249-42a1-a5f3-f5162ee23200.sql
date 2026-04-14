-- ============================================
-- FIX: Prevent owners from self-upgrading tier/curation/status
-- ============================================

-- Create a trigger function to enforce business rules on listing updates
CREATE OR REPLACE FUNCTION public.enforce_listing_protected_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow admins and editors to modify any field
  IF public.is_admin_or_editor(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- For non-admin/editor users, prevent modification of protected fields
  
  -- Prevent tier changes (monetization protection)
  IF NEW.tier IS DISTINCT FROM OLD.tier THEN
    RAISE EXCEPTION 'Only administrators can modify listing tier';
  END IF;
  
  -- Prevent is_curated changes (editorial protection)
  IF NEW.is_curated IS DISTINCT FROM OLD.is_curated THEN
    RAISE EXCEPTION 'Only administrators can modify curation status';
  END IF;
  
  -- Prevent direct publishing (require review process)
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    RAISE EXCEPTION 'Only administrators can publish listings';
  END IF;
  
  -- Prevent un-rejecting a listing
  IF OLD.status = 'rejected' AND NEW.status NOT IN ('rejected', 'draft') THEN
    RAISE EXCEPTION 'Only administrators can change rejected listing status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Drop the trigger if it already exists (idempotent)
DROP TRIGGER IF EXISTS enforce_listing_protected_fields_trigger ON public.listings;
-- Create the trigger on listings table
CREATE TRIGGER enforce_listing_protected_fields_trigger
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_listing_protected_fields();
-- Add CHECK constraint to enforce business rule: is_curated requires signature tier
-- This provides an additional layer of data integrity
ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS enforce_curated_requires_signature;
ALTER TABLE public.listings
ADD CONSTRAINT enforce_curated_requires_signature
CHECK (
  (is_curated = false) OR 
  (is_curated = true AND tier = 'signature')
);
