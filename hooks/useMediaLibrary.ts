"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { convertToWebP, getFileSizeReduction } from "@/lib/imageUtils";

export interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  folder: string | null;
  created_at: string;
  uploaded_by: string | null;
}

export function useMediaLibrary() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const query = useQuery({
    queryKey: ["media-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MediaItem[];
    },
    enabled: isBrowser,
    initialData: [] as MediaItem[],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      if (!isBrowser) return { originalSize: 0, optimizedSize: 0 };

      const isImage = file.type.startsWith("image/");
      let processedFile = file;
      const originalSize = file.size;

      // Convert images to WebP for optimization
      if (isImage) {
        try {
          processedFile = await convertToWebP(file);
          const reduction = getFileSizeReduction(originalSize, processedFile.size);
          if (reduction > 0) {
          }
        } catch (conversionError) {
          processedFile = file;
        }
      }

      const fileExt = processedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, processedFile, {
          cacheControl: "31536000",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Create record in media_library
      const { data, error } = await supabase
        .from("media_library")
        .insert({
          file_name: processedFile.name,
          file_url: urlData.publicUrl,
          file_type: isImage ? "image" : "video",
          file_size: processedFile.size,
          folder: folder || "general",
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, originalSize, optimizedSize: processedFile.size };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      const reduction = getFileSizeReduction(data.originalSize, data.optimizedSize);
      if (reduction > 0) {
        toast.success(`Uploaded & optimized (${reduction}% smaller)`);
      } else {
        toast.success("Media uploaded successfully");
      }
    },
    onError: (error: Error) => {
      toast.error("Upload failed: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from("media_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      toast.success("Media deleted");
    },
    onError: (error: Error) => {
      toast.error("Delete failed: " + error.message);
    },
  });

  return {
    media: isBrowser ? query.data || [] : [],
    isLoading: isBrowser ? query.isLoading : false,
    error: isBrowser ? query.error : null,
    uploadMedia: uploadMutation.mutate,
    uploadMediaAsync: uploadMutation.mutateAsync,
    isUploading: isBrowser ? uploadMutation.isPending : false,
    deleteMedia: deleteMutation.mutate,
    isDeleting: isBrowser ? deleteMutation.isPending : false,
  };
}
