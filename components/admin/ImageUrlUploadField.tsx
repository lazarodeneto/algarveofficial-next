"use client";

import { useId, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { convertToWebP, trimWhiteBorders } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface ImageUrlUploadFieldProps {
  value?: string | null;
  onChange: (value: string) => void;
  onUploadComplete?: (uploadedUrl: string) => void;
  id?: string;
  placeholder?: string;
  bucket?: string;
  folder?: string;
  accept?: string;
  disabled?: boolean;
  assetLabel?: string;
  uploadButtonLabel?: string;
  changeButtonLabel?: string;
  clearable?: boolean;
  processImage?: boolean;
  buttonSize?: "default" | "sm" | "lg";
  className?: string;
  inputClassName?: string;
}

export function ImageUrlUploadField({
  value,
  onChange,
  onUploadComplete,
  id,
  placeholder = "https://...",
  bucket = "listing-images",
  folder = "uploads",
  accept = "image/*",
  disabled = false,
  assetLabel = "Image",
  uploadButtonLabel = "Upload Image",
  changeButtonLabel = "Change Image",
  clearable = true,
  processImage = true,
  buttonSize = "default",
  className,
  inputClassName,
}: ImageUrlUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadInputId = useId();
  const hasValue = Boolean(value && value.trim().length > 0);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      const preparedFile = processImage
        ? await convertToWebP(await trimWhiteBorders(file), 0.85)
        : file;

      const fileExt = processImage
        ? "webp"
        : file.name.split(".").pop()?.toLowerCase() || "bin";
      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const filePath = cleanFolder
        ? `${cleanFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, preparedFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      onUploadComplete?.(urlData.publicUrl);
      toast.success(`${assetLabel} uploaded successfully`);
    } catch (error) {
      console.error("[image-url-upload] upload failed", error);
      toast.error(`Failed to upload ${assetLabel.toLowerCase()}`);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn("bg-background", inputClassName)}
        disabled={disabled}
      />

      <div className="flex items-center gap-2">
        <Input
          id={uploadInputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleUpload}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size={buttonSize}
          onClick={() => document.getElementById(uploadInputId)?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {hasValue ? changeButtonLabel : uploadButtonLabel}
        </Button>
        {clearable && hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onChange("")}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
