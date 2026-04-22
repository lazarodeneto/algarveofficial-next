-- Add dedicated fallback image URL per category used by admin "Categories" cards.
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS fallback_image_url TEXT;

COMMENT ON COLUMN public.categories.fallback_image_url IS
  'Admin-uploaded fallback image used when listings in a category do not have gallery/featured media.';
