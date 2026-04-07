# Supabase Schema and Index Migrations

This repository uses ordered SQL migrations under `/supabase/migrations`.

## Execution model

1. Apply migrations in lexical order (`001_...` to latest).
2. Migrations are additive-first and guarded with `IF NOT EXISTS` where possible.
3. Runtime and admin code are expected to stay backward-compatible with the previous migration until rollout is complete.

## Migration inventory

- `001_gdpr_consent.sql`
  - Adds GDPR consent model and supporting indexes.
- `002_fix_function_search_paths.sql`
  - Hardens function search paths.
- `003_category_system_refactor.sql`
  - First pass category system changes.
- `004_category_system_v2.sql`
  - Category v2 follow-up.
- `005_promotional_codes_custom_period.sql`
  - Adds custom-period promotional code support.
- `006_subscription_pricing_period_seed.sql`
  - Seeds period pricing records.
- `007_subscription_pricing_custom_period.sql`
  - Adds custom period pricing support.
- `008_subscription_pricing_period_dates.sql`
  - Adds period date range support.
- `009_cms_documents_v1.sql`
  - Introduces versioned CMS document model (`cms_documents`, `cms_document_versions`) used by runtime resolver.
- `010_hot_path_indexes.sql`
  - Adds indexes for high-traffic read/write paths used by listings directory, taxonomy lists, pricing reads, and reviews.
- `011_tier_pricing_model.sql`
  - Normalizes `subscription_pricing` to canonical `monthly` / `yearly` / `promo` periods, adds explicit `price_cents` / `currency` / validity metadata, and seeds the platform pricing rows for verified and signature tiers.
- `012_stripe_price_mapping.sql`
  - Adds `subscription_pricing.stripe_price_id` and owner subscription pricing snapshot columns used by Stripe checkout/webhook synchronization.
- `013_subscription_lifecycle.sql`
  - Extends `owner_subscriptions` with full lifecycle fields: `plan_type` (monthly/yearly/fixed_2026), `stripe_checkout_session_id`, `stripe_payment_intent_id`, `current_period_start` (timestamptz), `cancel_at_period_end`, `canceled_at`, `trial_end`, `last_event_at`. Converts `current_period_end` from text to timestamptz. Adds CHECK constraint covering all 9 subscription statuses. Adds UNIQUE index on `owner_id`. Adds composite indexes for reconciliation and Stripe ID lookups.
- `014_stripe_events_audit.sql`
  - Creates `stripe_webhook_events` table (webhook idempotency — PK on `event_id`) and `subscription_audit_log` table (sanitized before/after state for every lifecycle mutation). Both tables have RLS enabled with no policies (service-role only).

## Index coverage map

`010_hot_path_indexes.sql` currently covers:

- `listings(status, category_id, city_id, region_id, created_at desc)`
  - Public browse/filter routes.
- `listings(status, tier, published_at desc)`
  - Tier-period listing views.
- `cities(is_active, display_order, name)`
  - City filters and city index.
- `regions(is_active, display_order, name)`
  - Region filters and navigation.
- `categories(is_active, display_order, name)`
  - Category filters and browse pages.
- `subscription_pricing(tier, period, is_active, start_date, end_date)`
  - Pricing retrieval in admin/public subscription flows.
- `subscription_pricing(tier, billing_period, created_at desc)`
  - Canonical tier pricing resolution and promo fallback lookups.
- `subscription_pricing(stripe_price_id) WHERE stripe_price_id IS NOT NULL`
  - Fast Stripe webhook/checkout mapping from Stripe price to DB pricing row.
- `reviews(listing_id, is_approved, created_at desc)`
  - Listing review aggregations.

## Applying migrations locally

Run with Supabase CLI from repo root:

```bash
supabase db reset
```

Or apply to linked environment:

```bash
supabase db push
```

## Change checklist for new migrations

1. Add migration file with next numeric prefix.
2. Keep operations idempotent when possible (`IF NOT EXISTS`, guarded `ALTER`).
3. Update this document with:
   - purpose
   - affected tables/functions
   - index additions/removals
4. Ensure related app code is deployed with compatible read/write paths.
5. Run local validation:
   - `npm run typecheck`
   - `npm run test:contracts`

## Rollback guidance

No automatic down-migrations are maintained in-repo. For high-risk changes:

- prefer additive migrations first,
- ship code compatibility before destructive changes,
- if destructive cleanup is needed, create a separate follow-up migration after production verification.
