import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { trimWhiteBorders, convertToWebP } from "@/lib/imageUtils";

interface OwnerListingImageManagerProps {
  listingId: string;
}

interface ImageRecord {
  id: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
}

export function OwnerListingImageManager({ listingId }: OwnerListingImageManagerProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // Fetch images for this listing
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["owner-listing-images", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_images")
        .select("id, image_url, display_order, is_featured")
        .eq("listing_id", listingId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as ImageRecord[];
    },
    enabled: !!listingId,
  });

  /** Sync the listings.featured_image_url with the current featured gallery image */
  const syncFeaturedImageUrl = async (currentImages: ImageRecord[], deletedId?: string) => {
    const remaining = deletedId 
      ? currentImages.filter((i) => i.id !== deletedId) 
      : currentImages;
    
    const featured = remaining.find((i) => i.is_featured) || remaining[0];
    const newFeaturedUrl = featured?.image_url || null;

    await supabase
      .from("listings")
      .update({ featured_image_url: newFeaturedUrl })
      .eq("id", listingId);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const uploadedUrls: { url: string; isFeatured: boolean }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        let processedFile = file;
        try {
          const trimmedFile = await trimWhiteBorders(file);
          processedFile = await convertToWebP(trimmedFile, 0.85);
        } catch {
          console.warn(`Failed to process ${file.name}, using original`);
        }

        const fileExt = processedFile.name.split(".").pop() || "webp";
        const fileName = `${listingId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, processedFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        const isFeatured = images.length === 0 && i === 0;

        const { error: dbError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listingId,
            image_url: urlData.publicUrl,
            display_order: images.length + i,
            is_featured: isFeatured,
          });
        if (dbError) throw dbError;

        uploadedUrls.push({ url: urlData.publicUrl, isFeatured });
      }

      // Sync featured_image_url if the first upload became featured
      const newFeatured = uploadedUrls.find((u) => u.isFeatured);
      if (newFeatured) {
        await supabase
          .from("listings")
          .update({ featured_image_url: newFeatured.url })
          .eq("id", listingId);
      }

      queryClient.invalidateQueries({ queryKey: ["owner-listing-images", listingId] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed: " + (error as Error).message);
    }

    setIsUploading(false);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const deletedWasFeatured = images.find((i) => i.id === imageToDelete)?.is_featured;

      const { error } = await supabase
        .from("listing_images")
        .delete()
        .eq("id", imageToDelete);
      if (error) throw error;

      if (deletedWasFeatured) {
        const remaining = images.filter((i) => i.id !== imageToDelete);
        if (remaining.length > 0) {
          await supabase
            .from("listing_images")
            .update({ is_featured: true })
            .eq("id", remaining[0].id);
        }
      }

      // Sync featured_image_url on the listings table
      await syncFeaturedImageUrl(images, imageToDelete);

      queryClient.invalidateQueries({ queryKey: ["owner-listing-images", listingId] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Delete failed: " + (error as Error).message);
    }

    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const setFeatured = async (imageId: string) => {
    try {
      await supabase
        .from("listing_images")
        .update({ is_featured: false })
        .eq("listing_id", listingId);

      await supabase
        .from("listing_images")
        .update({ is_featured: true })
        .eq("id", imageId);

      // Sync featured_image_url on the listings table
      const newFeaturedImage = images.find((i) => i.id === imageId);
      if (newFeaturedImage) {
        await supabase
          .from("listings")
          .update({ featured_image_url: newFeaturedImage.image_url })
          .eq("id", listingId);
      }

      queryClient.invalidateQueries({ queryKey: ["owner-listing-images", listingId] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Featured image updated");
    } catch (error) {
      toast.error("Failed to update: " + (error as Error).message);
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Photos
          </CardTitle>
          <CardDescription>
            Add, remove, or set a featured image for your listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              "border-border hover:border-primary/50 hover:bg-primary/5",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center py-4">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP (auto-optimized)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              disabled={isUploading}
            />
          </label>

          {/* Gallery */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No photos yet. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    image.is_featured ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img
                    src={image.image_url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {image.is_featured && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary text-primary-foreground">
                      Featured
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_featured && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFeatured(image.id)}
                        className="h-8 text-xs"
                      >
                        <Star className="h-3.5 w-3.5 mr-1" />
                        Feature
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setImageToDelete(image.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
