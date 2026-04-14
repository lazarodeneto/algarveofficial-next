-- Create owner_subscriptions table to track Stripe subscriptions at account level
CREATE TABLE public.owner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  tier listing_tier NOT NULL DEFAULT 'unverified',
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'inactive')),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id)
);
-- Enable RLS
ALTER TABLE public.owner_subscriptions ENABLE ROW LEVEL SECURITY;
-- RLS Policies for owner_subscriptions
CREATE POLICY "Owners can view their own subscription"
  ON public.owner_subscriptions FOR SELECT
  USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all subscriptions"
  ON public.owner_subscriptions FOR ALL
  USING (is_admin_or_editor(auth.uid()));
-- Create admin_notifications table for subscription alerts
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('new_subscription', 'subscription_changed', 'subscription_canceled')),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
-- RLS Policies for admin_notifications
CREATE POLICY "Admins can manage all notifications"
  ON public.admin_notifications FOR ALL
  USING (is_admin_or_editor(auth.uid()));
-- Trigger to update updated_at on owner_subscriptions
CREATE TRIGGER update_owner_subscriptions_updated_at
  BEFORE UPDATE ON public.owner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Function to sync listing tiers when subscription becomes active
CREATE OR REPLACE FUNCTION public.sync_listing_tiers_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only upgrade listings when subscription becomes active (not downgrade)
  IF NEW.status = 'active' THEN
    -- Upgrade all owner's listings to the subscription tier
    -- Only upgrade, never downgrade (verified -> signature is ok, but not signature -> verified)
    UPDATE public.listings
    SET tier = NEW.tier, updated_at = now()
    WHERE owner_id = NEW.owner_id
      AND (
        -- Allow upgrade from unverified to anything
        tier = 'unverified'
        OR
        -- Allow upgrade from verified to signature only
        (tier = 'verified' AND NEW.tier = 'signature')
      );
  END IF;
  
  RETURN NEW;
END;
$$;
-- Trigger to sync listings when subscription is inserted or updated
CREATE TRIGGER sync_listings_on_subscription_change
  AFTER INSERT OR UPDATE OF status, tier ON public.owner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_listing_tiers_on_subscription();
-- Function to create admin notification on new/changed subscription
CREATE OR REPLACE FUNCTION public.notify_admin_on_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_type TEXT;
  _owner_name TEXT;
  _owner_email TEXT;
BEGIN
  -- Get owner details
  SELECT full_name, email INTO _owner_name, _owner_email
  FROM public.profiles
  WHERE id = NEW.owner_id;
  
  -- Determine notification type
  IF TG_OP = 'INSERT' THEN
    _notification_type := 'new_subscription';
  ELSIF NEW.status = 'canceled' AND (OLD.status IS NULL OR OLD.status != 'canceled') THEN
    _notification_type := 'subscription_canceled';
  ELSE
    _notification_type := 'subscription_changed';
  END IF;
  
  -- Insert notification
  INSERT INTO public.admin_notifications (type, owner_id, data)
  VALUES (
    _notification_type,
    NEW.owner_id,
    jsonb_build_object(
      'owner_name', COALESCE(_owner_name, 'Unknown'),
      'owner_email', COALESCE(_owner_email, 'Unknown'),
      'tier', NEW.tier,
      'billing_period', NEW.billing_period,
      'status', NEW.status,
      'stripe_subscription_id', NEW.stripe_subscription_id
    )
  );
  
  RETURN NEW;
END;
$$;
-- Trigger to notify admins on subscription changes
CREATE TRIGGER notify_admins_on_subscription_change
  AFTER INSERT OR UPDATE ON public.owner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_subscription_change();
