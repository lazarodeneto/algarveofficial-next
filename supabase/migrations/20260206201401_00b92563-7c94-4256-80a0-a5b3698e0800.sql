-- Fix blog_posts RLS policies to use user_roles table instead of JWT claims
DROP POLICY IF EXISTS "blog_posts_admin_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_delete" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_insert" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "blog_posts_admin_update" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "blog_posts_admin_delete" ON public.blog_posts
  FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
