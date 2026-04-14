-- User reviews for listings
-- Each authenticated user can post one review per listing (1–5 stars + optional comment).

CREATE TABLE public.listing_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, user_id)
);
-- Index for fast per-listing lookups
CREATE INDEX listing_reviews_listing_id_idx ON public.listing_reviews (listing_id);
-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_listing_reviews_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER listing_reviews_updated_at
  BEFORE UPDATE ON public.listing_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_listing_reviews_updated_at();
-- RLS
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
-- Anyone can read reviews
CREATE POLICY "listing_reviews_select_public"
  ON public.listing_reviews FOR SELECT
  USING (true);
-- Authenticated users can insert their own reviews
CREATE POLICY "listing_reviews_insert_own"
  ON public.listing_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- Users can update only their own review
CREATE POLICY "listing_reviews_update_own"
  ON public.listing_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- Users can delete their own review; admins can delete any
CREATE POLICY "listing_reviews_delete_own_or_admin"
  ON public.listing_reviews FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
