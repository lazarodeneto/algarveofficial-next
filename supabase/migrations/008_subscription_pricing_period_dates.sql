-- Add explicit date range support for PERIOD billing rows in subscription_pricing.
-- Allows admin to define "from date" and "to date" for fixed-price period plans.

ALTER TABLE public.subscription_pricing
  ADD COLUMN IF NOT EXISTS period_start_date DATE,
  ADD COLUMN IF NOT EXISTS period_end_date DATE;

ALTER TABLE public.subscription_pricing
  DROP CONSTRAINT IF EXISTS subscription_pricing_period_dates_pair_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_period_dates_order_chk;

ALTER TABLE public.subscription_pricing
  ADD CONSTRAINT subscription_pricing_period_dates_pair_chk
    CHECK ((period_start_date IS NULL) = (period_end_date IS NULL)),
  ADD CONSTRAINT subscription_pricing_period_dates_order_chk
    CHECK (
      period_start_date IS NULL
      OR period_end_date IS NULL
      OR period_end_date >= period_start_date
    );
