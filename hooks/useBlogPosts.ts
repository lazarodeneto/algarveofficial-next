import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useCurrentLocale } from "@/hooks/useCurrentLocale";

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];
export type BlogCategory = Database['public']['Enums']['blog_category'];
export type BlogStatus = Database['public']['Enums']['blog_status'];

export interface BlogPostWithAuthor extends BlogPost {
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  comments_count?: number;
}

interface BlogPostTranslationRow {
  blog_post_id: string;
  language_code: string;
  title: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

function normalizeBlogLocale(language: string | undefined): string {
  const normalized = String(language ?? 'en').trim().toLowerCase();
  if (!normalized || normalized === 'en') return 'en';
  if (normalized === 'pt' || normalized.startsWith('pt-pt')) return 'pt-pt';
  return normalized;
}

function applyBlogTranslation<T extends BlogPost>(
  post: T,
  translation: BlogPostTranslationRow | null | undefined
): T {
  if (!translation) return post;

  return {
    ...post,
    title: translation.title || post.title,
    excerpt: translation.description ?? post.excerpt,
    seo_title: translation.seo_title ?? post.seo_title,
    seo_description: translation.seo_description ?? post.seo_description,
  };
}

// Fetch all published blog posts for public view
export function usePublishedBlogPosts(category?: BlogCategory) {
  const locale = normalizeBlogLocale(useCurrentLocale());
  const isBrowser = typeof window !== "undefined";
  const now = new Date().toISOString();

  return useQuery({
    queryKey: ['blog-posts', 'published', category, locale],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published');

      if (category) {
        query = query.eq('category', category);
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      // Filter posts to include only those that are published and either:
      // 1. Have published_at set and it's in the past
      // 2. Have published_at as null (just published without timestamp)
      const publishedPosts = posts.filter(post => {
        if (!post.published_at) return true; // Show posts without published_at
        return post.published_at <= now;
      });

      // Sort by published_at (most recent first), treating null as current time
      publishedPosts.sort((a, b) => {
        const aTime = new Date(a.published_at || new Date()).getTime();
        const bTime = new Date(b.published_at || new Date()).getTime();
        return bTime - aTime;
      });

      let localizedPosts = publishedPosts;
      if (locale !== 'en' && publishedPosts.length > 0) {
        const postIds = publishedPosts.map((post) => post.id);
        const { data: translations, error: translationsError } = await supabase
          .from('blog_post_translations' as never)
          .select('blog_post_id, language_code, title, description, seo_title, seo_description')
          .eq('language_code', locale)
          .in('blog_post_id', postIds);

        if (translationsError) {
          console.warn(`Falling back to English blog posts for locale ${locale}:`, translationsError.message);
        } else {
          const translationMap = new Map(
            ((translations ?? []) as BlogPostTranslationRow[]).map((translation) => [translation.blog_post_id, translation])
          );
          localizedPosts = publishedPosts.map((post) => applyBlogTranslation(post, translationMap.get(post.id)));
        }
      }

      // Fetch authors separately
      const authorIds = [...new Set(localizedPosts.map(p => p.author_id))];
      const { data: authors } = await supabase
        .from('public_profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      const authorsMap = new Map(authors?.map(a => [a.id, a]) || []);

      return localizedPosts.map(post => ({
        ...post,
        author: authorsMap.get(post.author_id),
      })) as BlogPostWithAuthor[];
    },
    enabled: isBrowser,
    initialData: [] as BlogPostWithAuthor[],
  });
}

// Fetch a single blog post by slug for public view
export function usePublishedBlogPost(
  slug: string | undefined,
  initialPost?: BlogPostWithAuthor | null,
) {
  const locale = normalizeBlogLocale(useCurrentLocale());
  const isBrowser = typeof window !== "undefined";
  const now = new Date().toISOString();

  return useQuery({
    queryKey: ['blog-post', 'slug', slug, locale],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');

      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Check if post is actually publishable (either has published_at in past or null)
      if (post.published_at && post.published_at > now) {
        throw new Error('This post is scheduled for the future');
      }

      let localizedPost = post;
      if (locale !== 'en') {
        const { data: translation, error: translationError } = await supabase
          .from('blog_post_translations' as never)
          .select('blog_post_id, language_code, title, description, seo_title, seo_description')
          .eq('blog_post_id', post.id)
          .eq('language_code', locale)
          .maybeSingle();

        if (translationError) {
          console.warn(`Falling back to English blog post for locale ${locale}:`, translationError.message);
        } else {
          localizedPost = applyBlogTranslation(post, translation as BlogPostTranslationRow | null);
        }
      }

      // Fetch author separately
      const { data: author } = await supabase
        .from('public_profiles')
        .select('id, full_name, avatar_url')
        .eq('id', localizedPost.author_id)
        .maybeSingle();

      return {
        ...localizedPost,
        author: author ?? undefined,
      } as BlogPostWithAuthor;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    enabled: isBrowser && !!slug,
    initialData: initialPost ?? null,
  });
}

// Increment blog post views with session-based deduplication
/**
 * Increment blog views with session-based deduplication
 * Only tracks if user has consented to analytics (sessionId is not null)
 */
export function useIncrementBlogViews() {
  return useMutation({
    mutationFn: async ({ postId, sessionId }: { postId: string; sessionId: string | null }) => {
      // Skip tracking if no consent (sessionId is null)
      if (!sessionId) {
        return;
      }

      const { error } = await supabase.rpc('increment_blog_views', {
        _post_id: postId,
        _session_id: sessionId
      });
      if (error) throw error;
    },
  });
}

// Fetch all blog posts for admin (includes drafts, scheduled)
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts', 'admin'],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch authors separately
      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const { data: authors } = await supabase
        .from('public_profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      const authorsMap = new Map(authors?.map(a => [a.id, a]) || []);

      return posts.map(post => ({
        ...post,
        author: authorsMap.get(post.author_id),
      })) as BlogPostWithAuthor[];
    },
  });
}

// Fetch a single blog post by ID for admin editing
export function useAdminBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: ['blog-post', 'admin', id],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      if (!id) throw new Error('ID is required');

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id && id !== 'new',
  });
}

// Create a new blog post
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: BlogPostInsert) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
}

// Update a blog post
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BlogPostUpdate }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', 'admin', data.id] });
      toast.success('Blog post updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
}

// Delete a blog post
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
}

// Blog category labels (for UI display)
export const blogCategoryLabels: Record<BlogCategory, string> = {
  'lifestyle': 'Lifestyle',
  'travel-guides': 'Travel Guides',
  'food-wine': 'Food & Wine',
  'golf': 'Golf',
  'real-estate': 'Algarve Services',
  'events': 'Events',
  'wellness': 'Wellness',
  'insider-tips': 'Insider Tips',
};
