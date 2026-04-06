-- Index coverage for hot public/admin query paths.
-- Safe additive migration with IF NOT EXISTS guards.

create index if not exists idx_listings_public_browse
  on public.listings (status, is_active, city_id, category_id, created_at desc);

create index if not exists idx_listings_tier_period
  on public.listings (tier, featured_until, created_at desc);

create index if not exists idx_cities_active_order
  on public.cities (is_active, display_order, name);

create index if not exists idx_regions_active_order
  on public.regions (is_active, display_order, name);

create index if not exists idx_categories_active_order
  on public.categories (is_active, display_order, name);

create index if not exists idx_subscription_pricing_active
  on public.subscription_pricing (is_active, tier, billing_period);

create index if not exists idx_listing_reviews_listing_status
  on public.listing_reviews (listing_id, status, created_at desc);
