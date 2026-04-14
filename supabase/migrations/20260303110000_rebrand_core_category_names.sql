-- Rebrand selected category display names
UPDATE public.categories
SET name = 'Accommodation'
WHERE slug = 'luxury-accommodation';
UPDATE public.categories
SET name = 'Gastronomy'
WHERE slug = 'fine-dining';
UPDATE public.categories
SET name = 'Algarve Experience'
WHERE slug = 'luxury-experiences';
-- Keep footer category links aligned with renamed category labels
UPDATE public.footer_links
SET name = 'Accommodation'
WHERE name = 'Luxury Accommodation';
UPDATE public.footer_links
SET name = 'Gastronomy'
WHERE name IN ('Fine Dining', 'Fine Dining & Michelin');
UPDATE public.footer_links
SET name = 'Algarve Experience'
WHERE name IN ('Luxury Experience', 'Luxury Experiences');
