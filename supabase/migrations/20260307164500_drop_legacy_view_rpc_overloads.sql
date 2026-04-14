DROP FUNCTION IF EXISTS public.increment_listing_views(uuid);
DROP FUNCTION IF EXISTS public.increment_blog_views(uuid);
NOTIFY pgrst, 'reload schema';
