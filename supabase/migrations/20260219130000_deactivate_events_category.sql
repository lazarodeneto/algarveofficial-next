-- Deactivate and remove the legacy 'events' category.
-- This is a safety migration in case the previous merge migration
-- (20260219120000) has not yet run on this environment.

-- Step 1: Reassign any listings still in events → premier-events
UPDATE public.listings
SET category_id = (SELECT id FROM public.categories WHERE slug = 'premier-events')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'events');
-- Step 2: Deactivate the events category so it stops appearing in all dropdowns
UPDATE public.categories
SET is_active = false
WHERE slug = 'events';
-- Step 3: Delete the events category (safe — listings already reassigned above)
DELETE FROM public.categories
WHERE slug = 'events';
