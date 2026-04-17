-- Add explicit CHECK constraint on owner_subscriptions.tier.
-- The column uses the listing_tier enum which already enforces valid values, but
-- an explicit CHECK makes the contract clear in the schema and protects against
-- the enum being widened for listing purposes without updating subscription logic.
ALTER TABLE public.owner_subscriptions
  DROP CONSTRAINT IF EXISTS owner_subscriptions_tier_chk;

ALTER TABLE public.owner_subscriptions
  ADD CONSTRAINT owner_subscriptions_tier_chk
    CHECK (tier::text IN ('unverified', 'verified', 'signature'));
