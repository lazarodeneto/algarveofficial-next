-- Create subscription_pricing table for configurable tier pricing
CREATE TABLE public.subscription_pricing (
  id text PRIMARY KEY,
  tier text NOT NULL CHECK (tier IN ('verified', 'signature')),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  price integer NOT NULL DEFAULT 0,
  display_price text NOT NULL,
  note text NOT NULL,
  monthly_equivalent text,
  savings integer DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
-- Create promotional_codes table for seasonal discounts
CREATE TABLE public.promotional_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL CHECK (discount_value > 0),
  applicable_tiers text[] NOT NULL DEFAULT '{}',
  applicable_billing text[] NOT NULL DEFAULT '{}',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.subscription_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_codes ENABLE ROW LEVEL SECURITY;
-- RLS policies for subscription_pricing
-- Public can read pricing
CREATE POLICY "Anyone can view subscription pricing"
  ON public.subscription_pricing
  FOR SELECT
  USING (true);
-- Only admins can modify pricing
CREATE POLICY "Admins can manage subscription pricing"
  ON public.subscription_pricing
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- RLS policies for promotional_codes
-- Only admins can view promotional codes (codes shouldn't be publicly visible)
CREATE POLICY "Admins can view promotional codes"
  ON public.promotional_codes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Only admins can manage promotional codes
CREATE POLICY "Admins can manage promotional codes"
  ON public.promotional_codes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Add update trigger for updated_at
CREATE TRIGGER update_subscription_pricing_updated_at
  BEFORE UPDATE ON public.subscription_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotional_codes_updated_at
  BEFORE UPDATE ON public.promotional_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Seed initial pricing data (matching current hardcoded values)
INSERT INTO public.subscription_pricing (id, tier, billing_period, price, display_price, note, monthly_equivalent, savings) VALUES
  ('verified_monthly', 'verified', 'monthly', 9900, '€99', 'per month', NULL, 0),
  ('verified_annual', 'verified', 'annual', 99000, '€990', 'per year', '€82.50/mo', 198),
  ('signature_monthly', 'signature', 'monthly', 29900, '€299', 'per month', NULL, 0),
  ('signature_annual', 'signature', 'annual', 299000, '€2,990', 'per year', '€249/mo', 598);
