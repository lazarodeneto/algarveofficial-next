import { useMemo, useState } from "react";
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

  const sourceCandidates = useMemo(
    () =>
      [normalizedSrc, normalizedCategoryImageUrl, normalizedFallbackSrc].filter(
        (value) => Boolean(value)
      ),
    [normalizedCategoryImageUrl, normalizedFallbackSrc, normalizedSrc]
  );
  const sourceKey = sourceCandidates.join("|");
  const [fallbackIndexByKey, setFallbackIndexByKey] = useState({});
  const fallbackIndex = fallbackIndexByKey[sourceKey] ?? 0;
  const currentSrc = sourceCandidates[fallbackIndex] || normalizedFallbackSrc;

  const handleError = () => {
    setFallbackIndexByKey((prev) => {
      const currentIndex = prev[sourceKey] ?? 0;
      const nextIndex = Math.min(currentIndex + 1, Math.max(sourceCandidates.length - 1, 0));
      if (nextIndex === currentIndex) return prev;
      return { ...prev, [sourceKey]: nextIndex };
    });
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
