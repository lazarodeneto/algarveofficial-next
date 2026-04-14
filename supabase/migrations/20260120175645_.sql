-- Create blog category enum
CREATE TYPE public.blog_category AS ENUM (
  'lifestyle',
  'travel-guides',
  'food-wine',
  'golf',
  'real-estate',
  'events',
  'wellness',
  'insider-tips'
);

-- Create blog post status enum
CREATE TYPE public.blog_status AS ENUM (
  'draft',
  'scheduled',
  'published'
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID NOT NULL,
  category public.blog_category NOT NULL DEFAULT 'lifestyle',
  tags TEXT[] DEFAULT '{}'::text[],
  reading_time INTEGER DEFAULT 5,
  related_listing_ids UUID[] DEFAULT '{}'::uuid[],
  status public.blog_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
-- Anyone can view published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Admins and editors can view all posts
CREATE POLICY "Admins and editors can view all blog posts"
ON public.blog_posts
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Admins and editors can manage all posts
CREATE POLICY "Admins and editors can manage blog posts"
ON public.blog_posts
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Blog comments policies
-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
ON public.blog_comments
FOR SELECT
USING (is_approved = true);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
ON public.blog_comments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
ON public.blog_comments
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments (before approval)
CREATE POLICY "Users can update own comments"
ON public.blog_comments
FOR UPDATE
USING (auth.uid() = user_id AND is_approved = false);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.blog_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on blog_posts
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment blog post views
CREATE OR REPLACE FUNCTION public.increment_blog_views(_post_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE id = _post_id;
$$;

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_is_approved ON public.blog_comments(is_approved);;
