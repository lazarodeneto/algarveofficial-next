-- Rebrand selected category display names
UPDATE public.categories
SET name = 'Accommodation'
WHERE slug = 'premium-accommodation';
UPDATE public.categories
SET name = 'Gastronomy'
WHERE slug = 'fine-dining';
UPDATE public.categories
SET name = 'Algarve Experience'
WHERE slug = 'premium-experiences';
-- Keep footer category links aligned with renamed category labels
UPDATE public.footer_links
SET name = 'Accommodation'
WHERE name = 'Premium Accommodation';
UPDATE public.footer_links
SET name = 'Gastronomy'
WHERE name IN ('Fine Dining', 'Fine Dining & Michelin');
UPDATE public.footer_links
SET name = 'Algarve Experience'
WHERE name IN ('Premium Experience', 'Premium Experiences');
