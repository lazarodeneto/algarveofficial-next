import { useState, useCallback } from "react";
import { Upload, X, GripVertical, Star, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { convertToWebP, trimWhiteBorders } from "@/lib/imageUtils";
import { resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";
import { toast } from "sonner";
import type { ListingImage } from "@/types/listing";

interface ImageUploaderProps {
  images: ListingImage[];
  onChange: (images: ListingImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 20,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (isConverting) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsConverting(true);

    try {
      // Trim white borders and convert each file to WebP
      const convertedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            // First trim white borders, then convert to WebP
            const trimmedFile = await trimWhiteBorders(file);
            const webpFile = await convertToWebP(trimmedFile, 0.85);
            return { original: file, converted: webpFile };
          } catch (error) {
            console.warn(`Failed to process ${file.name}, using original`, error);
            return { original: file, converted: file };
          }
        })
      );

      const newImages: ListingImage[] = convertedFiles.map((result, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: URL.createObjectURL(result.converted),
        alt: result.original.name.replace(/\.[^/.]+$/, ''),
        is_featured: images.length === 0 && index === 0,
        order: images.length + index,
        // Store the converted file for later upload
        _file: result.converted,
      }));

      onChange([...images, ...newImages]);

      // Show success message with conversion info
      const convertedCount = convertedFiles.filter(
        (r) => r.converted.type === 'image/webp' && r.original.type !== 'image/webp'
      ).length;

      if (convertedCount > 0) {
        toast.success(`${convertedCount} image${convertedCount > 1 ? 's' : ''} converted to WebP`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    } finally {
      setIsConverting(false);
    }
  }, [images, isConverting, maxImages, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isConverting) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    void handleFiles(files);
  }, [disabled, handleFiles, isConverting]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  }, [handleFiles]);

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    // If we removed the featured image, make the first one featured
    if (updated.length > 0 && !updated.some((img) => img.is_featured)) {
      updated[0].is_featured = true;
    }
    onChange(updated.map((img, idx) => ({ ...img, order: idx })));
  };

  const setFeatured = (id: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        is_featured: img.id === id,
      }))
    );
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    onChange(newImages.map((img, idx) => ({ ...img, order: idx })));
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          (disabled || isConverting) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled ?? isConverting ?? images.length >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {isConverting ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isConverting ? "Converting to WebP..." : "Drop images here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images auto-converted to WebP for better performance ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleImageDragStart(index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                className={cn(
                  "relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted",
                  image.is_featured && "ring-2 ring-primary",
                  draggedIndex === index && "opacity-50"
                )}
              >
                {/* Local blob previews are intentionally rendered with img for immediate feedback. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveSupabaseBucketImageUrl(image.url, "listing-images") ?? image.url}
                  alt={image.alt ?? "Listing image"}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-primary hover:bg-white/20"
                    onClick={() => setFeatured(image.id)}
                    title="Set as featured"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        image.is_featured && "fill-primary text-primary"
                      )}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-destructive hover:bg-white/20"
                    onClick={() => removeImage(image.id)}
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Drag handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-white" />
                </div>

                {/* Featured badge */}
                {image.is_featured && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                    Featured
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No images uploaded
            </p>
            <p className="text-xs text-muted-foreground">
              At least 1 image is required before publishing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
