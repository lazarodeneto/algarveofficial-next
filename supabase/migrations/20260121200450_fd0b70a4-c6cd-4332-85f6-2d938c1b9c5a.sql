-- Add Google Business Profile URL column to listings table
ALTER TABLE public.listings
ADD COLUMN google_business_url text;
