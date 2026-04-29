
import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { convertToWebP, trimWhiteBorders } from "@/lib/imageUtils";
import { normalizePublicImageUrl, resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";

interface SingleImageUploadFieldProps {
    value?: string;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    folder?: string;
}

export function SingleImageUploadField({
    value,
    onChange,
    disabled = false,
    folder = "agents",
}: SingleImageUploadFieldProps) {
    const [isUploading, setIsUploading] = useState(false);
    const resolvedValue =
        resolveSupabaseBucketImageUrl(value, "listing-images") ?? normalizePublicImageUrl(value);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Process image
            const trimmed = await trimWhiteBorders(file);
            const processed = await convertToWebP(trimmed, 0.85);

            const fileExt = "webp";
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("listing-images") // Reusing listing-images bucket
                .upload(fileName, processed);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("listing-images")
                .getPublicUrl(fileName);

            onChange(urlData.publicUrl);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className="space-y-4">
            {resolvedValue ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                    <Image
                        src={resolvedValue}
                        alt="Uploaded content"
                        fill
                        unoptimized
                        sizes="128px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                            disabled={disabled}
                            aria-label="Remove image"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled ?? isUploading}
                        className="relative overflow-hidden"
                        onClick={() => document.getElementById('single-upload-input')?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isUploading ? "Uploading..." : "Upload Image"}

                        <input
                            id="single-upload-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={disabled ?? isUploading}
                        />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        JPG, PNG, WebP
                    </span>
                </div>
            )}
        </div>
    );
}
