-- Canonical tier pricing model for paid subscriptions.
-- Adds explicit price/date metadata, normalizes billing periods, and seeds
-- the required monthly/yearly/promo pricing rows for verified/signature tiers.

ALTER TABLE public.subscription_pricing
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS valid_from DATE,
  ADD COLUMN IF NOT EXISTS valid_to DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE public.subscription_pricing
SET
  price_cents = COALESCE(price_cents, price, 0),
  currency = COALESCE(NULLIF(currency, ''), 'EUR'),
  is_active = COALESCE(is_active, true),
  created_at = COALESCE(created_at, updated_at, now()),
  valid_from = COALESCE(valid_from, period_start_date),
  valid_to = COALESCE(valid_to, period_end_date)
WHERE
  price_cents IS NULL
  OR currency IS NULL
  OR currency = ''
  OR is_active IS NULL
  OR created_at IS NULL
  OR valid_from IS NULL
  OR valid_to IS NULL;

UPDATE public.subscription_pricing
SET billing_period = CASE billing_period
  WHEN 'annual' THEN 'yearly'
  WHEN 'period' THEN 'promo'
  ELSE billing_period
END
WHERE billing_period IN ('annual', 'period');

ALTER TABLE public.subscription_pricing
  ALTER COLUMN price_cents SET DEFAULT 0,
  ALTER COLUMN price_cents SET NOT NULL,
  ALTER COLUMN currency SET DEFAULT 'EUR',
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.subscription_pricing
  DROP CONSTRAINT IF EXISTS subscription_pricing_billing_period_check,
  DROP CONSTRAINT IF EXISTS subscription_pricing_currency_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_valid_dates_pair_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_valid_dates_order_chk,
  DROP CONSTRAINT IF EXISTS subscription_pricing_price_cents_positive_chk;

ALTER TABLE public.subscription_pricing
  ADD CONSTRAINT subscription_pricing_billing_period_check
    CHECK (billing_period IN ('monthly', 'yearly', 'promo')),
  ADD CONSTRAINT subscription_pricing_currency_chk
    CHECK (upper(currency) = 'EUR'),
  ADD CONSTRAINT subscription_pricing_valid_dates_pair_chk
    CHECK ((valid_from IS NULL) = (valid_to IS NULL)),
  ADD CONSTRAINT subscription_pricing_valid_dates_order_chk
    CHECK (
      valid_from IS NULL
      OR valid_to IS NULL
      OR valid_to >= valid_from
    ),
  ADD CONSTRAINT subscription_pricing_price_cents_positive_chk
    CHECK (price_cents >= 0);

CREATE INDEX IF NOT EXISTS idx_subscription_pricing_tier_period_created
  ON public.subscription_pricing (tier, billing_period, created_at DESC);

UPDATE public.subscription_pricing
SET
  price = 1900,
  price_cents = 1900,
  display_price = '€19',
  note = 'per month',
  currency = 'EUR',
  valid_from = NULL,
  valid_to = NULL,
  is_active = true,
  monthly_equivalent = NULL,
  savings = 0
WHERE tier = 'verified' AND billing_period = 'monthly';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'verified',
  'monthly',
  1900,
  1900,
  '€19',
  'per month',
  'EUR',
  NULL,
  NULL,
  true,
  NULL,
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'verified' AND billing_period = 'monthly'
);

UPDATE public.subscription_pricing
SET
  price = 19000,
  price_cents = 19000,
  display_price = '€190',
  note = 'per year',
  currency = 'EUR',
  valid_from = NULL,
  valid_to = NULL,
  is_active = true,
  monthly_equivalent = '€15.83/mo',
  savings = 38
WHERE tier = 'verified' AND billing_period = 'yearly';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'verified',
  'yearly',
  19000,
  19000,
  '€190',
  'per year',
  'EUR',
  NULL,
  NULL,
  true,
  '€15.83/mo',
  38
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'verified' AND billing_period = 'yearly'
);

UPDATE public.subscription_pricing
SET
  price = 12000,
  price_cents = 12000,
  display_price = '€120',
  note = 'Promotional rate',
  currency = 'EUR',
  valid_from = DATE '2026-05-01',
  valid_to = DATE '2026-12-31',
  is_active = true,
  monthly_equivalent = NULL,
  savings = 0
WHERE tier = 'verified' AND billing_period = 'promo';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'verified',
  'promo',
  12000,
  12000,
  '€120',
  'Promotional rate',
  'EUR',
  DATE '2026-05-01',
  DATE '2026-12-31',
  true,
  NULL,
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'verified' AND billing_period = 'promo'
);

UPDATE public.subscription_pricing
SET
  price = 19000,
  price_cents = 19000,
  display_price = '€190',
  note = 'per month',
  currency = 'EUR',
  valid_from = NULL,
  valid_to = NULL,
  is_active = true,
  monthly_equivalent = NULL,
  savings = 0
WHERE tier = 'signature' AND billing_period = 'monthly';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'signature',
  'monthly',
  19000,
  19000,
  '€190',
  'per month',
  'EUR',
  NULL,
  NULL,
  true,
  NULL,
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'signature' AND billing_period = 'monthly'
);

UPDATE public.subscription_pricing
SET
  price = 190000,
  price_cents = 190000,
  display_price = '€1,900',
  note = 'per year',
  currency = 'EUR',
  valid_from = NULL,
  valid_to = NULL,
  is_active = true,
  monthly_equivalent = '€158.33/mo',
  savings = 380
WHERE tier = 'signature' AND billing_period = 'yearly';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'signature',
  'yearly',
  190000,
  190000,
  '€1,900',
  'per year',
  'EUR',
  NULL,
  NULL,
  true,
  '€158.33/mo',
  380
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'signature' AND billing_period = 'yearly'
);

UPDATE public.subscription_pricing
SET
  price = 140000,
  price_cents = 140000,
  display_price = '€1,400',
  note = 'Promotional rate',
  currency = 'EUR',
  valid_from = DATE '2026-05-01',
  valid_to = DATE '2026-12-31',
  is_active = true,
  monthly_equivalent = NULL,
  savings = 0
WHERE tier = 'signature' AND billing_period = 'promo';

INSERT INTO public.subscription_pricing (
  id,
  tier,
  billing_period,
  price,
  price_cents,
  display_price,
  note,
  currency,
  valid_from,
  valid_to,
  is_active,
  monthly_equivalent,
  savings
)
SELECT
  gen_random_uuid(),
  'signature',
  'promo',
  140000,
  140000,
  '€1,400',
  'Promotional rate',
  'EUR',
  DATE '2026-05-01',
  DATE '2026-12-31',
  true,
  NULL,
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing
  WHERE tier = 'signature' AND billing_period = 'promo'
);
