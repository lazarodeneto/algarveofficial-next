-- Create a secure view for owner subscription data that hides Stripe IDs
-- Owners only need to see their subscription status, not the actual Stripe identifiers

CREATE OR REPLACE VIEW public.owner_subscription_status 
WITH (security_invoker = true)
AS
SELECT 
  id,
  owner_id,
  tier,
  billing_period,
  status,
  current_period_end,
  created_at,
  updated_at,
  -- Only expose Stripe IDs to admins, mask for regular users
  CASE 
    WHEN is_admin_or_editor(auth.uid()) THEN stripe_customer_id
    ELSE NULL
  END as stripe_customer_id,
  CASE 
    WHEN is_admin_or_editor(auth.uid()) THEN stripe_subscription_id
    ELSE NULL
  END as stripe_subscription_id,
  -- Expose a boolean flag for whether user has a Stripe customer (for portal access)
  (stripe_customer_id IS NOT NULL) as has_stripe_customer
FROM public.owner_subscriptions;

-- Add comment explaining the security design
COMMENT ON VIEW public.owner_subscription_status IS 
'Secure view for subscription data. Stripe IDs are only visible to admins to prevent potential misuse. Owners can see their subscription status without accessing raw Stripe identifiers.';

-- Create a security definer function for checking if user has active subscription
-- This avoids exposing Stripe IDs in direct queries
CREATE OR REPLACE FUNCTION public.get_owner_subscription_status(_owner_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'subscribed', (status = 'active' OR status = 'trialing'),
    'tier', tier,
    'billing_period', billing_period,
    'status', status,
    'current_period_end', current_period_end,
    'has_stripe_customer', (stripe_customer_id IS NOT NULL)
  )
  FROM public.owner_subscriptions
  WHERE owner_id = _owner_id;
$$;

-- Grant appropriate permissions
GRANT SELECT ON public.owner_subscription_status TO authenticated;;
