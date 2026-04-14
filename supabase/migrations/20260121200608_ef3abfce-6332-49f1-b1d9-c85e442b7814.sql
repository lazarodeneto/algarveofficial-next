-- Add Google rating columns to listings table
ALTER TABLE public.listings
ADD COLUMN google_rating numeric(2,1),
ADD COLUMN google_review_count integer;
