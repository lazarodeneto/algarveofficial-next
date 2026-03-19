import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizePublicImageUrl } from "@/lib/imageUrls";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  fallbackIconSize?: number;
  containerClassName?: string;
}

interface LoadedImageProps extends Omit<ImageWithFallbackProps, "src" | "alt"> {
  src: string;
  alt: string;
}

function LoadedImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackIconSize,
  ...props
}: LoadedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showFallback = hasError;

  return (
    <div className={cn("relative bg-muted overflow-hidden", containerClassName)}>
      {!showFallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
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
          <ImageIcon className="text-muted-foreground" size={fallbackIconSize} />
        </div>
      )}
    </div>
  );
}

export function ImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackIconSize = 24,
  ...props
}: ImageWithFallbackProps) {
  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "AlgarveOfficial image";
  const resolvedSrc = typeof src === "string" ? normalizePublicImageUrl(src) : undefined;

  if (!resolvedSrc) {
    return (
      <div className={cn("relative bg-muted overflow-hidden", containerClassName)}>
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="text-muted-foreground" size={fallbackIconSize} />
        </div>
      </div>
    );
  }

  return (
    <LoadedImageWithFallback
      key={resolvedSrc}
      src={resolvedSrc}
      alt={resolvedAlt}
      className={className}
      containerClassName={containerClassName}
      fallbackIconSize={fallbackIconSize}
      {...props}
    />
  );
}
