-- Seed PERIOD billing rows for paid tiers in subscription_pricing.
-- This ensures Admin > Subscription Settings shows Monthly, Annual, and Period.

INSERT INTO public.subscription_pricing (
  tier,
  billing_period,
  price,
  display_price,
  note,
  monthly_equivalent,
  savings
)
SELECT
  seed.tier,
  'period',
  0,
  '€0',
  'Admin-defined period',
  NULL,
  0
FROM (
  VALUES ('verified'), ('signature')
) AS seed(tier)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_pricing sp
  WHERE sp.tier = seed.tier
    AND sp.billing_period = 'period'
);
