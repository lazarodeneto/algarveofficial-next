-- Stripe mapping columns for DB-driven checkout/subscription logic.
-- Stripe remains payment engine; Supabase remains pricing source of truth.

ALTER TABLE public.subscription_pricing
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_pricing_stripe_price_id_unique
  ON public.subscription_pricing (stripe_price_id)
  WHERE stripe_price_id IS NOT NULL;

ALTER TABLE public.owner_subscriptions
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

ALTER TABLE public.owner_subscriptions
  ALTER COLUMN currency SET DEFAULT 'EUR';

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_owner_status
  ON public.owner_subscriptions (owner_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_stripe_customer
  ON public.owner_subscriptions (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_stripe_subscription
  ON public.owner_subscriptions (stripe_subscription_id);
