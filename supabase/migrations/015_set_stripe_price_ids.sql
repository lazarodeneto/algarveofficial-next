-- Maps live Stripe Price IDs to canonical paid pricing rows.
-- Uses existing subscription_pricing rows from 011_tier_pricing_model.sql.

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1T2wA8JRvCCSGiDzqDobDCMn'
WHERE tier = 'verified' AND billing_period = 'monthly';

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1T2wA3JRvCCSGiDzDRNpgMLh'
WHERE tier = 'verified' AND billing_period = 'yearly';

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1T2wAFJRvCCSGiDzUyZk593j'
WHERE tier = 'signature' AND billing_period = 'monthly';

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1T2wA7JRvCCSGiDzvmazc16C'
WHERE tier = 'signature' AND billing_period = 'yearly';

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1TJaB5JRvCCSGiDzZVy6vOpf'
WHERE tier = 'verified' AND billing_period = 'promo';

UPDATE public.subscription_pricing
SET stripe_price_id = 'price_1TJaFFJRvCCSGiDzKyAiLNeC'
WHERE tier = 'signature' AND billing_period = 'promo';

DO $$
DECLARE
  mapped_count integer;
BEGIN
  SELECT COUNT(*) INTO mapped_count
  FROM public.subscription_pricing
  WHERE (tier, billing_period) IN (
    ('verified', 'monthly'),
    ('verified', 'yearly'),
    ('verified', 'promo'),
    ('signature', 'monthly'),
    ('signature', 'yearly'),
    ('signature', 'promo')
  )
    AND stripe_price_id IS NOT NULL;

  IF mapped_count <> 6 THEN
    RAISE EXCEPTION
      'Expected 6 mapped paid pricing rows, found %.',
      mapped_count;
  END IF;
END $$;
