-- Fix subscription_pricing to match actual Stripe prices
-- Verified: €49/mo, €490/yr
-- Signature: €199/mo, €1,990/yr
UPDATE public.subscription_pricing SET
  price = 4900,
  display_price = '€49',
  note = 'per month',
  monthly_equivalent = NULL,
  savings = 0
WHERE id = 'verified_monthly';
UPDATE public.subscription_pricing SET
  price = 49000,
  display_price = '€490',
  note = 'per year',
  monthly_equivalent = '€40.83/mo',
  savings = 98
WHERE id = 'verified_annual';
UPDATE public.subscription_pricing SET
  price = 19900,
  display_price = '€199',
  note = 'per month',
  monthly_equivalent = NULL,
  savings = 0
WHERE id = 'signature_monthly';
UPDATE public.subscription_pricing SET
  price = 199000,
  display_price = '€1,990',
  note = 'per year',
  monthly_equivalent = '€165.83/mo',
  savings = 398
WHERE id = 'signature_annual';
