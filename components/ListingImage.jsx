"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizePublicImageUrl } from "@/lib/imageUrls";

function normalizeUrl(value) {
  return normalizePublicImageUrl(value);
}

export default function ListingImage({
  src,
  category = undefined,
  categoryImageUrl = undefined,
  listingId = undefined,
  fallbackSrc = "/placeholder.svg",
  alt,
  className,
}) {
  const normalizedSrc = useMemo(() => normalizeUrl(src), [src]);
  const normalizedCategoryImageUrl = useMemo(
    () => normalizeUrl(categoryImageUrl),
    [categoryImageUrl]
  );
  const normalizedFallbackSrc = useMemo(
    () => normalizeUrl(fallbackSrc) || "/placeholder.svg",
    [fallbackSrc]
  );

  const [currentSrc, setCurrentSrc] = useState(
    normalizedSrc || normalizedCategoryImageUrl || normalizedFallbackSrc
  );

  useEffect(() => {
    setCurrentSrc(normalizedSrc || normalizedCategoryImageUrl || normalizedFallbackSrc);
  }, [normalizedSrc, normalizedCategoryImageUrl, normalizedFallbackSrc]);

  const handleError = () => {
    if (currentSrc === normalizedSrc && normalizedCategoryImageUrl) {
      setCurrentSrc(normalizedCategoryImageUrl);
      return;
    }
    if (currentSrc !== normalizedFallbackSrc) {
      setCurrentSrc(normalizedFallbackSrc);
    }
  };

  return (
    <img
      src={currentSrc || normalizedFallbackSrc}
      alt={alt || "Algarve listing"}
      className={className}
      onError={handleError}
    />
  );
}