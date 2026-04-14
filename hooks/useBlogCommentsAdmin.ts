"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogCommentWithPost {
  id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  user_id: string;
  post_id: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useBlogCommentsAdmin() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-blog-comments"],
    queryFn: async () => {
      // First get comments
      const { data: comments, error: commentsError } = await supabase
        .from("blog_comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // Get unique post IDs and user IDs
      const postIds = [...new Set(comments.map(c => c.post_id))];
      const userIds = [...new Set(comments.map(c => c.user_id))];

      // Fetch posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title, slug")
        .in("id", postIds);

      // Fetch profiles using RPC to avoid RLS issues
      const profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      for (const userId of userIds) {
        const { data: profile } = await supabase.rpc("get_public_profile", {
          _profile_id: userId,
        });
        if (profile && typeof profile === 'object' && profile !== null) {
          const profileData = profile as { full_name?: string | null; avatar_url?: string | null };
          profiles[userId] = {
            full_name: profileData.full_name ?? null,
            avatar_url: profileData.avatar_url ?? null,
          };
        }
      }

      // Combine data
      return comments.map(comment => ({
        ...comment,
        post: posts?.find(p => p.id === comment.post_id),
        user: profiles[comment.user_id] ?? { full_name: null, avatar_url: null },
      })) as BlogCommentWithPost[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .update({ is_approved: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      toast.success("Comment approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .update({ is_approved: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      toast.success("Comment rejected");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      toast.success("Comment deleted");
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    approveComment: approveMutation.mutate,
    rejectComment: rejectMutation.mutate,
    deleteComment: deleteMutation.mutate,
  };
}
