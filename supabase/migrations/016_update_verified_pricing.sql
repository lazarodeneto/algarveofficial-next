-- Re-assert verified tier standard pricing.
-- Keeps canonical values aligned across existing environments:
-- monthly = €19 (1900 cents), yearly = €190 (19000 cents).

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
