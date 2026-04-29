-- Update Premium Accommodation category icon to Star
UPDATE public.categories 
SET icon = 'Star', updated_at = now()
WHERE slug = 'premium-accommodation';
