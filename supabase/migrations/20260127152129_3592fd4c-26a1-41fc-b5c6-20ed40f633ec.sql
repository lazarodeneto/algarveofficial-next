-- Add independent visibility control for Destinations page
ALTER TABLE public.regions 
ADD COLUMN is_visible_destinations boolean NOT NULL DEFAULT true;
