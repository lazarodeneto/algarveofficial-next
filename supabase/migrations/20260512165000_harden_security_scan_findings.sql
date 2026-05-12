-- Harden direct client-side write/read paths found during the May 2026 security scan.

-- Listings: owners may only update the public featured image pointer directly.
-- Admin/editor listing writes go through service-role API routes.
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owner update own listings" ON public.listings;
DROP POLICY IF EXISTS "listings_update_safe" ON public.listings;
DROP POLICY IF EXISTS "owners_update_listing_featured_image" ON public.listings;

CREATE POLICY "owners_update_listing_featured_image"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

REVOKE UPDATE ON public.listings FROM anon, authenticated;
GRANT UPDATE (featured_image_url, updated_at) ON public.listings TO authenticated;

COMMENT ON POLICY "owners_update_listing_featured_image" ON public.listings
  IS 'Owner browser updates are limited by column grants to featured_image_url/updated_at.';

-- Owner subscriptions: Stripe/admin APIs are the only write authorities.
ALTER TABLE public.owner_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_subscriptions_insert_safe" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_update_safe" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_delete_safe" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_insert_auth" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_update_auth" ON public.owner_subscriptions;
DROP POLICY IF EXISTS "owner_subscriptions_delete_auth" ON public.owner_subscriptions;

REVOKE INSERT, UPDATE, DELETE ON public.owner_subscriptions FROM anon;

COMMENT ON TABLE public.owner_subscriptions
  IS 'Owner subscription state is writable only by service-role Stripe/admin workflows; owners may read their own row through RLS.';

-- Business claims: claimants can read their own safe submission/status fields, not review metadata.
REVOKE SELECT ON public.business_claims FROM anon, authenticated;
GRANT SELECT (
  id,
  listing_id,
  claimant_user_id,
  claimant_name,
  claimant_email,
  claimant_phone,
  claimant_role,
  business_email,
  company_website,
  selected_tier,
  verification_method,
  proof_url,
  proof_notes,
  message,
  status,
  created_at,
  updated_at
) ON public.business_claims TO authenticated;

COMMENT ON TABLE public.business_claims
  IS 'Structured manual-review claim requests. Browser reads exclude confidence_score, reviewed_by, reviewed_at, review_note, and rejection_reason.';

-- Media bucket: keep public reads, but restrict writes to admins/editors and remove SVG uploads.
UPDATE storage.buckets
SET allowed_mime_types = array_remove(allowed_mime_types, 'image/svg+xml')
WHERE id = 'media'
  AND allowed_mime_types IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete media" ON storage.objects;

CREATE POLICY "Admins and editors can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()))
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));

-- Listing tier sync is handled by Stripe webhook/admin service-role code so
-- listing-scoped checkouts cannot be widened by a table trigger.
DROP TRIGGER IF EXISTS sync_listings_on_subscription_change ON public.owner_subscriptions;
DROP FUNCTION IF EXISTS public.sync_listing_tiers_on_subscription();
