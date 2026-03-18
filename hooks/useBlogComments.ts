"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type BlogComment = Database['public']['Tables']['blog_comments']['Row'];
export type BlogCommentInsert = Database['public']['Tables']['blog_comments']['Insert'];

export interface BlogCommentWithUser extends BlogComment {
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch approved comments for a blog post (public)
export function useBlogComments(postId: string | undefined) {
  return useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');

      const { data: comments, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch users separately
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const usersMap = new Map(users?.map(u => [u.id, u]) || []);

      return comments.map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id),
      })) as BlogCommentWithUser[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!postId,
  });
}

// Fetch all comments for admin moderation
export function useAdminBlogComments() {
  return useQuery({
    queryKey: ['blog-comments', 'admin'],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch users and posts separately
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const postIds = [...new Set(comments.map(c => c.post_id))];

      const [{ data: users }, { data: posts }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds),
        supabase.from('blog_posts').select('id, title, slug').in('id', postIds),
      ]);

      const usersMap = new Map(users?.map(u => [u.id, u]) || []);
      const postsMap = new Map(posts?.map(p => [p.id, p]) || []);

      return comments.map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id),
        post: postsMap.get(comment.post_id),
      }));
    },
  });
}

// Create a new comment
export function useCreateBlogComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: BlogCommentInsert) => {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', data.post_id] });
      toast.success('Comment submitted for approval');
    },
    onError: (error) => {
      toast.error(`Failed to submit comment: ${error.message}`);
    },
  });
}

// Approve a comment (admin)
export function useApproveBlogComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
      toast.success('Comment approved');
    },
    onError: (error) => {
      toast.error(`Failed to approve comment: ${error.message}`);
    },
  });
}

// Delete a comment
export function useDeleteBlogComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });
}
