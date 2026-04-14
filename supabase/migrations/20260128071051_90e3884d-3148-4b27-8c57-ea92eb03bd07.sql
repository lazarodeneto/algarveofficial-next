-- Auto-grant owner role when a listing is assigned to a user
CREATE OR REPLACE FUNCTION public.auto_grant_owner_role_on_listing_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only proceed if owner_id changed and new owner exists
  IF NEW.owner_id IS NOT NULL AND 
     (OLD IS NULL OR OLD.owner_id IS NULL OR NEW.owner_id != OLD.owner_id) THEN
    
    -- Check if user already has owner role, if not grant it
    IF NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = NEW.owner_id AND role = 'owner'
    ) THEN
      INSERT INTO user_roles (user_id, role)
      VALUES (NEW.owner_id, 'owner')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
-- Create trigger on listings table for owner_id changes
DROP TRIGGER IF EXISTS on_listing_owner_change ON listings;
CREATE TRIGGER on_listing_owner_change
  AFTER INSERT OR UPDATE OF owner_id ON listings
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_owner_role_on_listing_assignment();
