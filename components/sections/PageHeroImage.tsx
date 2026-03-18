import { cn } from "@/lib/utils";
import { getRegionImageSet } from "@/lib/regionImages";
import type { StaticImageData } from "next/image";

export type PageHeroImageKey =
  | "about"
  | "blog"
  | "contact"
  | "destinations"
  | "directory"
  | "events"
  | "partner"
  | "real-estate";

const PAGE_HERO_IMAGE_CONFIG: Record<
  PageHeroImageKey,
  {
    regionSlug: string;
    objectPosition?: string;
  }
> = {
  about: {
    regionSlug: "sagres-atlantic",
    objectPosition: "center 48%",
  },
  blog: {
    regionSlug: "tavira-heritage",
    objectPosition: "center 46%",
  },
  contact: {
    regionSlug: "carvoeiro-cliffs",
    objectPosition: "center 56%",
  },
  destinations: {
    regionSlug: "golden-triangle",
    objectPosition: "center 48%",
  },
  directory: {
    regionSlug: "lagos-signature",
    objectPosition: "center 50%",
  },
  events: {
    regionSlug: "vilamoura-prestige",
    objectPosition: "center 44%",
  },
  partner: {
    regionSlug: "golden-triangle",
    objectPosition: "center 42%",
  },
  "real-estate": {
    regionSlug: "vilamoura-prestige",
    objectPosition: "center 50%",
  },
};

interface PageHeroImageProps {
  page: PageHeroImageKey;
  alt: string;
  className?: string;
}

export function PageHeroImage({ page, alt, className }: PageHeroImageProps) {
  const config = PAGE_HERO_IMAGE_CONFIG[page];
  const imageSet = getRegionImageSet(config.regionSlug);

  if (!imageSet) {
    return <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />;
  }

  const resolveImageSrc = (value: string | StaticImageData) =>
    typeof value === "string" ? value : value.src;

  return (
    <img
      src={resolveImageSrc(imageSet.image)}
      srcSet={`${resolveImageSrc(imageSet.image400)} 400w, ${resolveImageSrc(imageSet.image800)} 800w, ${resolveImageSrc(imageSet.image)} 1200w`}
      sizes="100vw"
      alt={alt}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className={cn("h-full w-full object-cover scale-[1.02]", className)}
      style={{ objectPosition: config.objectPosition }}
    />
  );
}
