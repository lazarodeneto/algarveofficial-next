-- Dual-authority subscription control:
-- - stripe: Stripe lifecycle events control tier/state.
-- - admin: courtesy/manual override; Stripe must never change tier.

ALTER TABLE public.owner_subscriptions
  ADD COLUMN IF NOT EXISTS tier_source TEXT NOT NULL DEFAULT 'stripe';

UPDATE public.owner_subscriptions
SET tier_source = 'stripe'
WHERE tier_source IS NULL;

ALTER TABLE public.owner_subscriptions
  DROP CONSTRAINT IF EXISTS owner_subscriptions_tier_source_chk;

ALTER TABLE public.owner_subscriptions
  ADD CONSTRAINT owner_subscriptions_tier_source_chk
    CHECK (tier_source IN ('stripe', 'admin'));

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_tier_source
  ON public.owner_subscriptions (tier_source);
