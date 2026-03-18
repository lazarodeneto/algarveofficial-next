import { ImageUploader } from "../listings/ImageUploader";
import type { ListingFormData } from "@/types/listing";

interface MediaStepProps {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, value: unknown) => void;
  errors: Record<string, string>;
}

export function MediaStep({ data, onChange, errors }: MediaStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium font-serif">Media Gallery</h3>
        <p className="text-sm text-muted-foreground">
          Upload high-quality images. The first image will be the featured/cover image.
        </p>
      </div>

      <ImageUploader
        images={data.images}
        onChange={(images) => onChange("images", images)}
        maxImages={20}
      />

      {errors.images && (
        <p className="text-sm text-destructive">{errors.images}</p>
      )}

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium mb-2">Image Guidelines</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Minimum 1 image required for publishing</li>
          <li>• Recommended: 5-10 high-quality images</li>
          <li>• Best resolution: 1920×1080 or higher</li>
          <li>• Supported formats: PNG, JPG, WebP</li>
          <li>• Maximum file size: 10MB per image</li>
          <li>• Drag images to reorder; click star to set featured image</li>
        </ul>
      </div>
    </div>
  );
}
