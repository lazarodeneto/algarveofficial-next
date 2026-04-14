-- Attach the existing enforce_listing_protected_fields function as a trigger
-- This prevents owners from self-upgrading tier or modifying is_curated

DROP TRIGGER IF EXISTS enforce_listing_protected_fields_trigger ON public.listings;
CREATE TRIGGER enforce_listing_protected_fields_trigger
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_listing_protected_fields();
