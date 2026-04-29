import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useOwnerListings } from "@/hooks/useOwnerListings";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trimWhiteBorders, convertToWebP } from "@/lib/imageUtils";
import { ImageUrlUploadField } from "@/components/admin/ImageUrlUploadField";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";

interface ImageItem {
  id: string;
  url: string;
  isFeatured: boolean;
}

interface ListingImageRow {
  id: string;
  image_url: string;
  is_featured: boolean;
  display_order: number;
}

export default function OwnerMedia() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: listings = [], isLoading } = useOwnerListings();
  
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingByUrl, setIsAddingByUrl] = useState(false);
  const [quickImageUrl, setQuickImageUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const selectedListing = listings.find(l => l.id === selectedListingId);
  const selectedListingTier = (selectedListing?.tier as string | null | undefined) ?? "unverified";
  const maxImages = getListingTierMaxGalleryImages(selectedListingTier);
  
  // Convert listing images to ImageItem format
  const images: ImageItem[] = useMemo(() => {
    if (!selectedListing?.images) return [];
    return (selectedListing.images as ListingImageRow[])
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({
        id: img.id,
        url: img.image_url,
        isFeatured: img.is_featured,
      }));
  }, [selectedListing]);

  // Set first listing as default when data loads
  useEffect(() => {
    if (listings.length > 0 && !selectedListingId) {
      setSelectedListingId(listings[0].id);
    }
  }, [listings, selectedListingId]);
  
  const handleListingChange = (listingId: string) => {
    setSelectedListingId(listingId);
  };

  const syncFeaturedImageUrl = async (currentImages: ImageItem[], deletedId?: string) => {
    if (!selectedListingId) return;
    const remaining = deletedId
      ? currentImages.filter((image) => image.id !== deletedId)
      : currentImages;
    const featured = remaining.find((image) => image.isFeatured) ?? remaining[0];
    const featuredImageUrl = featured?.url ?? null;
    await supabase
      .from("listings")
      .update({ featured_image_url: featuredImageUrl })
      .eq("id", selectedListingId);
  };
  
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedListingId || !user) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(t("owner.media.tierLimit", { max: maxImages }));
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (filesToUpload.length < files.length) {
      toast.info(
        t("owner.media.tierLimitPartialUpload", {
          count: filesToUpload.length,
          max: maxImages,
        }),
      );
    }
    
    setIsUploading(true);
    
    try {
      const uploadedUrls: { url: string; isFeatured: boolean }[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Trim white borders and convert to WebP
        let processedFile = file;
        try {
          const trimmedFile = await trimWhiteBorders(file);
          processedFile = await convertToWebP(trimmedFile, 0.85);
        } catch (error) {
          console.warn(`Failed to process ${file.name}, using original`, error);
        }
        
        const fileExt = processedFile.name.split('.').pop() || 'webp';
        const fileName = `${selectedListingId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        // Upload to storage (using listing-images bucket, consistent with admin)
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, processedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        // Create listing_images record
        const { error: dbError } = await supabase
          .from('listing_images')
          .insert({
            listing_id: selectedListingId,
            image_url: urlData.publicUrl,
            display_order: images.length + i,
            is_featured: images.length === 0 && i === 0,
          });

        if (dbError) throw dbError;

        uploadedUrls.push({ url: urlData.publicUrl, isFeatured: images.length === 0 && i === 0 });
      }

      const newFeatured = uploadedUrls.find((image) => image.isFeatured);
      if (newFeatured) {
        await supabase
          .from("listings")
          .update({ featured_image_url: newFeatured.url })
          .eq("id", selectedListingId);
      }
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(t('owner.media.imagesUploaded', { count: filesToUpload.length }));
    } catch (error) {
      toast.error(t('owner.media.uploadFailed') + ': ' + (error as Error).message);
    }
    
    setIsUploading(false);
  };

  const addImageFromUrl = async (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !selectedListingId) {
      toast.error(t("owner.media.provideImageUrl"));
      return;
    }

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(t("owner.media.tierLimit", { max: maxImages }));
      return;
    }

    setIsAddingByUrl(true);
    try {
      const isFeatured = images.length === 0;
      const { error } = await supabase
        .from("listing_images")
        .insert({
          listing_id: selectedListingId,
          image_url: trimmedUrl,
          display_order: images.length,
          is_featured: isFeatured,
        });

      if (error) throw error;

      if (isFeatured) {
        await supabase
          .from("listings")
          .update({ featured_image_url: trimmedUrl })
          .eq("id", selectedListingId);
      }

      setQuickImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(t("owner.media.imageAdded"));
    } catch (error) {
      toast.error(`${t("owner.media.uploadFailed")}: ${(error as Error).message}`);
    } finally {
      setIsAddingByUrl(false);
    }
  };
  
  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!imageToDelete) return;
    
    try {
      const deletedWasFeatured = images.find(i => i.id === imageToDelete)?.isFeatured;
      
      const { error } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageToDelete);
        
      if (error) throw error;
      
      // If deleted was featured, make first remaining one featured
      if (deletedWasFeatured) {
        const remaining = images.filter(i => i.id !== imageToDelete);
        if (remaining.length > 0) {
          await supabase
            .from('listing_images')
            .update({ is_featured: true })
            .eq('id', remaining[0].id);
        }
      }

      await syncFeaturedImageUrl(images, imageToDelete);
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(t('owner.media.imageDeleted'));
    } catch (error) {
      toast.error(t('owner.media.deleteFailed') + ': ' + (error as Error).message);
    }
    
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };
  
  const setFeatured = async (imageId: string) => {
    try {
      // First unfeatured all images for this listing
      await supabase
        .from('listing_images')
        .update({ is_featured: false })
        .eq('listing_id', selectedListingId);
      
      // Then set the selected one as featured
      await supabase
        .from('listing_images')
        .update({ is_featured: true })
        .eq('id', imageId);

      const featuredImage = images.find((image) => image.id === imageId);
      if (featuredImage) {
        await supabase
          .from("listings")
          .update({ featured_image_url: featuredImage.url })
          .eq("id", selectedListingId);
      }
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(t('owner.media.featuredUpdated'));
    } catch (error) {
      toast.error(t('owner.media.updateFailed') + ': ' + (error as Error).message);
    }
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // Visual feedback only - actual reorder would need API call
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl lg:text-3xl font-serif font-medium text-foreground">
          {t('owner.media.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('owner.media.subtitle')}
        </p>
      </m.div>

      {/* Listing Selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-medium whitespace-nowrap">{t('owner.media.selectListing')}</label>
            <Select value={selectedListingId} onValueChange={handleListingChange}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t('owner.media.chooseListing')} />
              </SelectTrigger>
              <SelectContent>
                {listings.map(listing => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedListing && (
        <>
          {/* Upload Area */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t('owner.media.uploadImages')}</CardTitle>
              <CardDescription>
                {t('owner.media.uploadDescription')} ({images.length}/{maxImages})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                <p className="mb-2 text-xs text-muted-foreground">{t("owner.media.quickAdd")}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <ImageUrlUploadField
                      value={quickImageUrl}
                      onChange={setQuickImageUrl}
                      onUploadComplete={(uploadedUrl) => {
                        void addImageFromUrl(uploadedUrl);
                      }}
                      bucket="listing-images"
                      folder={selectedListingId || "uploads"}
                      assetLabel="Listing image"
                      buttonSize="sm"
                      disabled={!selectedListingId || isUploading || isAddingByUrl || images.length >= maxImages}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      !selectedListingId ||
                      isUploading ||
                      isAddingByUrl ||
                      images.length >= maxImages ||
                      quickImageUrl.trim().length === 0
                    }
                    onClick={() => {
                      void addImageFromUrl(quickImageUrl);
                    }}
                  >
                    {isAddingByUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : t("owner.media.addUrl")}
                  </Button>
                </div>
              </div>
              <label
                className={cn(
                  "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  "border-border hover:border-primary/50 hover:bg-primary/5",
                  isUploading && "pointer-events-none opacity-50"
                )}
              >
                <div className="flex flex-col items-center justify-center py-6">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">{t('owner.media.uploading')}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{t('owner.media.clickToUpload')}</span> {t('owner.media.orDragDrop')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('owner.media.fileTypes')}
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
                  disabled={isUploading || images.length >= maxImages}
                />
              </label>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t('owner.media.gallery', { count: images.length })}</CardTitle>
              <CardDescription>
                {t('owner.media.galleryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t('owner.media.noImages')}</p>
                  <p className="text-sm text-muted-foreground">{t('owner.media.uploadToStart')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move",
                        image.isFeatured ? "border-primary" : "border-transparent",
                        draggedIndex === index && "opacity-50 scale-95"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={`${t('owner.media.galleryImage')} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Drag Handle */}
                      <div className="absolute top-2 left-2 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-white" />
                      </div>
                      
                      {/* Featured Badge */}
                      {image.isFeatured && (
                        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground">
                          {t('owner.media.featured')}
                        </div>
                      )}
                      
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!image.isFeatured && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setFeatured(image.id)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {t('owner.media.featured')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">{t('owner.media.tipsTitle')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('owner.media.tip1')}</li>
                <li>• {t('owner.media.tip2')}</li>
                <li>• {t('owner.media.tip3')}</li>
                <li>• {t('owner.media.tip4')}</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('owner.media.deleteImage')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('owner.media.deleteImageDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
