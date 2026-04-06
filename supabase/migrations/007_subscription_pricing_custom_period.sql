-- Add custom period metadata to subscription pricing rows.
-- Enables admin-defined fixed-price plans like "€199 per 45 days".

ALTER TABLE public.subscription_pricing
  ADD COLUMN IF NOT EXISTS period_length INTEGER,
  ADD COLUMN IF NOT EXISTS period_unit TEXT;

ALTER TABLE public.subscription_pricing
  DROP CONSTRAINT IF EXISTS subscription_pricing_period_length_positive_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_period_unit_valid_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_period_pairing_chk;

ALTER TABLE public.subscription_pricing
  ADD CONSTRAINT subscription_pricing_period_length_positive_chk
    CHECK (period_length IS NULL OR period_length > 0),
  ADD CONSTRAINT subscription_pricing_period_unit_valid_chk
    CHECK (period_unit IS NULL OR period_unit IN ('days', 'months')),
  ADD CONSTRAINT subscription_pricing_period_pairing_chk
    CHECK ((period_length IS NULL) = (period_unit IS NULL));

-- Backfill existing period rows with a safe default when period metadata is missing.
UPDATE public.subscription_pricing
SET
  period_length = COALESCE(period_length, 1),
  period_unit = COALESCE(period_unit, 'months'),
  note = CASE
    WHEN note IS NULL OR trim(note) = '' OR lower(note) = 'admin-defined period'
      THEN 'per 1 month'
    ELSE note
  END
WHERE billing_period = 'period'
  AND (period_length IS NULL OR period_unit IS NULL);
