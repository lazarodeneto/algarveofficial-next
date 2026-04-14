-- Security hardening

-- 1. Enforce max comment length at DB level on listing_reviews.
--    Frontend already sets maxLength=500 but a direct API call would bypass that.
ALTER TABLE public.listing_reviews
  ADD CONSTRAINT listing_reviews_comment_length
  CHECK (comment IS NULL OR char_length(comment) <= 500);
-- 2. Enforce max length on review rating (already a CHECK constraint, just documenting).
--    rating CHECK (rating >= 1 AND rating <= 5) is already in place from the create migration.;
