-- Subscription lifecycle: extend owner_subscriptions with full state model.
-- Adds canonical plan_type, lifecycle timestamps, status CHECK, and uniqueness on owner_id.
-- Stripe remains the source of truth for billing; the DB is the source of truth for app access.

-- 1. New columns
ALTER TABLE public.owner_subscriptions
  ADD COLUMN IF NOT EXISTS plan_type TEXT,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ;

-- 2. Convert current_period_end from text to timestamptz.
--    Existing values are ISO strings written by the legacy webhook handler. Empty
--    strings become NULL; malformed values would raise here, which is intentional.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'owner_subscriptions'
       AND column_name = 'current_period_end'
       AND data_type = 'text'
  ) THEN
    ALTER TABLE public.owner_subscriptions
      ALTER COLUMN current_period_end TYPE TIMESTAMPTZ
      USING NULLIF(current_period_end, '')::TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Backfill plan_type from billing_period: promo -> fixed_2026, monthly/yearly stay.
UPDATE public.owner_subscriptions
   SET plan_type = CASE billing_period
                     WHEN 'promo' THEN 'fixed_2026'
                     ELSE billing_period
                   END
 WHERE plan_type IS NULL;

-- 4. Plan type constraint and NOT NULL
ALTER TABLE public.owner_subscriptions
  ALTER COLUMN plan_type SET NOT NULL;

ALTER TABLE public.owner_subscriptions
  DROP CONSTRAINT IF EXISTS owner_subscriptions_plan_type_chk;
ALTER TABLE public.owner_subscriptions
  ADD CONSTRAINT owner_subscriptions_plan_type_chk
    CHECK (plan_type IN ('monthly', 'yearly', 'fixed_2026'));

-- 5. Status CHECK covering full lifecycle
ALTER TABLE public.owner_subscriptions
  DROP CONSTRAINT IF EXISTS owner_subscriptions_status_chk;
ALTER TABLE public.owner_subscriptions
  ADD CONSTRAINT owner_subscriptions_status_chk
    CHECK (status IN (
      'pending',
      'active',
      'trialing',
      'past_due',
      'unpaid',
      'canceled',
      'expired',
      'incomplete',
      'incomplete_expired'
    ));

-- 6. Uniqueness on owner_id (single-row-per-owner invariant, previously enforced only in code)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_owner_subscriptions_owner
  ON public.owner_subscriptions (owner_id);

-- 7. Indexes for reconciliation and lookups
CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_status_end_date
  ON public.owner_subscriptions (status, end_date);

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_stripe_subscription_id
  ON public.owner_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_owner_subscriptions_stripe_customer_id
  ON public.owner_subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
