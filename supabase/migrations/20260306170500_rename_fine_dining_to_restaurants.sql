-- Rename category slug and canonical display name from fine-dining to restaurants.
-- Also rewrite persisted menu links that still point to the old filter slug.

UPDATE public.categories
SET
  slug = 'restaurants',
  name = 'Restaurants',
  updated_at = now()
WHERE slug = 'fine-dining';
UPDATE public.categories
SET
  name = 'Restaurants',
  updated_at = now()
WHERE slug = 'restaurants';
UPDATE public.footer_links
SET
  href = regexp_replace(href, 'category=fine-dining', 'category=restaurants', 'g'),
  updated_at = now()
WHERE href LIKE '%category=fine-dining%';
UPDATE public.header_menu_items
SET
  href = regexp_replace(href, 'category=fine-dining', 'category=restaurants', 'g'),
  updated_at = now()
WHERE href LIKE '%category=fine-dining%';
