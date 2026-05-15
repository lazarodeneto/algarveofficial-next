-- Retire unsafe paid-claim tier guard behavior before this local migration ships.
--
-- Admin claim approval remains the explicit source of truth for assigning the
-- claim-approved listing tier. Stripe checkout, webhook handling, reconciliation,
-- and admin/courtesy subscription flows must enforce payment/subscription state
-- at their own action boundaries. A generic listings trigger must not silently
-- recalculate or downgrade public.listings.tier during unrelated listing updates.

DROP TRIGGER IF EXISTS guard_paid_business_claim_listing_tier
  ON public.listings;

DROP FUNCTION IF EXISTS public.guard_paid_business_claim_listing_tier();
