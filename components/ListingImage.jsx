/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { normalizePublicImageUrl } from "@/lib/imageUrls";

function normalizeUrl(value) {
  return normalizePublicImageUrl(value);
}

export default function ListingImage({
  src,
  categoryImageUrl = undefined,
  fallbackSrc = "/placeholder.svg",
  alt,
  className,
  loading = "lazy",
  fetchPriority = "auto",
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
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={handleError}
    />
  );
}
