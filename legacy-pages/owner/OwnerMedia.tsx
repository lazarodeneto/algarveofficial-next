import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const selectedListing = listings.find(l => l.id === selectedListingId);
  
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
  
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedListingId || !user) return;
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
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
      }
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      toast.success(t('owner.media.imagesUploaded', { count: files.length }));
    } catch (error) {
      toast.error(t('owner.media.uploadFailed') + ': ' + (error as Error).message);
    }
    
    setIsUploading(false);
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
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
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
      
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
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
      <motion.div
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
      </motion.div>

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
                {t('owner.media.uploadDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  disabled={isUploading}
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
