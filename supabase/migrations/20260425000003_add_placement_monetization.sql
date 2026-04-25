-- Placement slots with pricing (monetization)
CREATE TABLE IF NOT EXISTS placement_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type TEXT NOT NULL CHECK (context_type IN ('homepage', 'category', 'city', 'region')),
  context_value TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(context_type, context_value, position)
);

CREATE INDEX IF NOT EXISTS idx_placement_slots_lookup
  ON placement_slots(context_type, context_value, position);

ALTER TABLE placement_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read placement_slots"
  ON placement_slots FOR SELECT USING (true);

CREATE POLICY "Admin manage placement_slots"
  ON placement_slots FOR ALL USING (true);

-- Subscription status tracking (links to Stripe or external billing)
CREATE TABLE IF NOT EXISTS listing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'cancelled', 'inactive')),
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_subscriptions_listing
  ON listing_subscriptions(listing_id);

ALTER TABLE listing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read listing_subscriptions"
  ON listing_subscriptions FOR SELECT USING (true);

CREATE POLICY "Admin manage listing_subscriptions"
  ON listing_subscriptions FOR ALL USING (true);