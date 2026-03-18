"use client";
import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizePublicImageUrl } from "@/lib/imageUrls";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  fallbackIconSize?: number;
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackIconSize = 24,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "AlgarveOfficial image";
  const resolvedSrc = typeof src === "string" ? normalizePublicImageUrl(src) : undefined;

  const showFallback = !resolvedSrc || hasError;

  useEffect(() => {
    setHasError(false);
    setIsLoading(Boolean(resolvedSrc));
  }, [resolvedSrc]);

  return (
    <div className={cn("relative bg-muted overflow-hidden", containerClassName)}>
      {!showFallback && (
        <img
          src={resolvedSrc}
          alt={resolvedAlt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            isLoading && "opacity-0",
            className
          )}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
          {...props}
        />
      )}
      {(showFallback || isLoading) && (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center",
            !showFallback && isLoading && "absolute inset-0"
          )}
        >
          <ImageIcon
            className="text-muted-foreground"
            size={fallbackIconSize}
          />
        </div>
      )}
    </div>
  );
}
