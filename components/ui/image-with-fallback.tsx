import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getOptimizedImageUrl } from "@/lib/image";
import { canUseNextImage } from "@/lib/nextImageSafety";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIconSize?: number;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
}

interface LoadedImageProps extends Omit<ImageWithFallbackProps, "src" | "fallbackSrc"> {
  src: string;
}

function LoadedImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackIconSize = 24,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  loading,
  style,
}: LoadedImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "Image";
  const useNativeImg = !canUseNextImage(src);
  const hasContainerClass = typeof containerClassName === "string" && containerClassName.trim().length > 0;

  const renderInContainer = (node: React.ReactElement) => {
    if (!hasContainerClass) {
      return node;
    }

    return (
      <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
        {node}
      </div>
    );
  };

  if (hasError) {
    return (
      <div className={cn("relative bg-muted overflow-hidden flex items-center justify-center", containerClassName)}>
        <ImageIcon className="text-muted-foreground" size={fallbackIconSize} />
      </div>
    );
  }

  if (fill) {
    if (useNativeImg) {
      return renderInContainer(
        <img
          src={src}
          alt={resolvedAlt}
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
          loading={loading}
          onError={() => setHasError(true)}
          style={style}
        />
      );
    }

    return renderInContainer(
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        quality={80}
        className={cn("object-cover", className)}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        loading={loading}
        onError={() => setHasError(true)}
        style={style}
      />
    );
  }

  const aspectRatio = 4 / 3;
  const displayWidth = width ?? 800;
  const displayHeight = height ?? Math.round(displayWidth / aspectRatio);
  const baseImageClassName = cn(
    "bg-muted",
    hasContainerClass && "h-full w-full object-cover",
    className
  );

  if (useNativeImg) {
    return renderInContainer(
      <img
        src={src}
        alt={resolvedAlt}
        width={displayWidth}
        height={displayHeight}
        className={baseImageClassName}
        loading={loading}
        onError={() => setHasError(true)}
        style={style}
      />
    );
  }

  return renderInContainer(
    <Image
      src={src}
      alt={resolvedAlt}
      width={displayWidth}
      height={displayHeight}
      quality={80}
      className={baseImageClassName}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      loading={loading}
      onError={() => setHasError(true)}
      style={style}
    />
  );
}

export function ImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackIconSize = 24,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "Image";
  const resolvedSrc = typeof src === "string" ? normalizePublicImageUrl(src) : undefined;
  const resolvedFallbackSrc = typeof fallbackSrc === "string" ? normalizePublicImageUrl(fallbackSrc) : undefined;

  if (!resolvedSrc) {
    return (
      <div className={cn("relative bg-muted overflow-hidden flex items-center justify-center", containerClassName)}>
        <ImageIcon className="text-muted-foreground" size={fallbackIconSize} />
      </div>
    );
  }

  const optimizedSrc = getOptimizedImageUrl(resolvedSrc, {
    width: 1200,
    quality: 80,
    format: "webp",
    resize: "cover",
  });

  return (
    <LoadedImageWithFallback
      src={optimizedSrc ?? resolvedSrc}
      alt={resolvedAlt}
      className={className}
      containerClassName={containerClassName}
      fallbackIconSize={fallbackIconSize}
      {...props}
    />
  );
}
