import type { StaticImageData } from "next/image";

// Full size (if you use them)
const regionGoldenTriangle = "/images/region-golden-triangle.webp";
const regionVilamoura = "/images/region-vilamoura.webp";
const regionCarvoeiro = "/images/region-carvoeiro.webp";
const regionLagos = "/images/region-lagos.webp";
const regionTavira = "/images/region-tavira.webp";
const regionSagres = "/images/region-sagres.webp";

// 800w
const regionGoldenTriangle800 = "/images/region-golden-triangle-800w.webp";
const regionVilamoura800 = "/images/region-vilamoura-800w.webp";
const regionCarvoeiro800 = "/images/region-carvoeiro-800w.webp";
const regionLagos800 = "/images/region-lagos-800w.webp";
const regionTavira800 = "/images/region-tavira-800w.webp";
const regionSagres800 = "/images/region-sagres-800w.webp";

// 400w
const regionGoldenTriangle400 = "/images/region-golden-triangle-400w.webp";
const regionVilamoura400 = "/images/region-vilamoura-400w.webp";
const regionCarvoeiro400 = "/images/region-carvoeiro-400w.webp";
const regionLagos400 = "/images/region-lagos-400w.webp";
const regionTavira400 = "/images/region-tavira-400w.webp";
const regionSagres400 = "/images/region-sagres-400w.webp";

export interface RegionImageSet {
  image: string | StaticImageData;
  image800: string | StaticImageData;
  image400: string | StaticImageData;
}

export const REGION_IMAGE_MAP: Record<string, RegionImageSet> = {
  "golden-triangle": { image: regionGoldenTriangle, image800: regionGoldenTriangle800, image400: regionGoldenTriangle400 },
  "vilamoura-prestige": { image: regionVilamoura, image800: regionVilamoura800, image400: regionVilamoura400 },
  "carvoeiro-cliffs": { image: regionCarvoeiro, image800: regionCarvoeiro800, image400: regionCarvoeiro400 },
  "lagos-signature": { image: regionLagos, image800: regionLagos800, image400: regionLagos400 },
  "tavira-heritage": { image: regionTavira, image800: regionTavira800, image400: regionTavira400 },
  "sagres-atlantic": { image: regionSagres, image800: regionSagres800, image400: regionSagres400 },
};

const REGION_IMAGE_ALIAS_MAP: Record<string, keyof typeof REGION_IMAGE_MAP> = {
  "ria-formosa-reserve": "tavira-heritage",
  "monchique-retreats": "sagres-atlantic",
  "portimao-prime": "carvoeiro-cliffs",
  "private-algarve": "golden-triangle",
};

export function getRegionImageSet(
  slug?: string | null,
  options?: { includeAliases?: boolean },
): RegionImageSet | null {
  if (!slug) return null;
  if (REGION_IMAGE_MAP[slug]) {
    return REGION_IMAGE_MAP[slug];
  }

  if (options?.includeAliases) {
    const alias = REGION_IMAGE_ALIAS_MAP[slug];
    if (alias) {
      return REGION_IMAGE_MAP[alias] || null;
    }
  }

  return null;
}
