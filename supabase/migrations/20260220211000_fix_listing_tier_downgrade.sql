-- Fix listing tier sync to also downgrade listings when subscription becomes inactive/canceled
CREATE OR REPLACE FUNCTION public.sync_listing_tiers_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
    -- Upgrade listings to the subscription tier (never downgrade between paid tiers)
    UPDATE public.listings
    SET tier = NEW.tier, updated_at = now()
    WHERE owner_id = NEW.owner_id
      AND (
        tier = 'unverified'
        OR (tier = 'verified' AND NEW.tier = 'signature')
      );

  ELSIF NEW.status IN ('canceled', 'inactive', 'unpaid') THEN
    -- Downgrade all owner's listings back to unverified when subscription ends
    UPDATE public.listings
    SET tier = 'unverified', updated_at = now()
    WHERE owner_id = NEW.owner_id;
  END IF;

  RETURN NEW;
END;
$$;
