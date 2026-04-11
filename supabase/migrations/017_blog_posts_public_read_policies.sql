-- Blog Posts: Allow anonymous users to read published posts
-- The blog_posts table was created in Supabase dashboard without tracked RLS policies.
-- This migration adds the missing policies to allow public read access.

BEGIN;

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_translations ENABLE ROW LEVEL SECURITY;

-- blog_posts: anonymous can SELECT published posts only
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- blog_posts: authenticated users get full access (admin CRUD)
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- blog_post_translations: anonymous can read all translations
DROP POLICY IF EXISTS "Public can view blog post translations" ON public.blog_post_translations;
CREATE POLICY "Public can view blog post translations" ON public.blog_post_translations
  FOR SELECT USING (true);

-- blog_post_translations: authenticated users get full access
DROP POLICY IF EXISTS "Authenticated users can manage blog post translations" ON public.blog_post_translations;
CREATE POLICY "Authenticated users can manage blog post translations" ON public.blog_post_translations
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMIT;
