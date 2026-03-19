import type { StaticImageData } from "next/image";

import regionGoldenTriangle from "@/assets/region-golden-triangle.webp";
import regionVilamoura from "@/assets/region-vilamoura.webp";
import regionCarvoeiro from "@/assets/region-carvoeiro.webp";
import regionLagos from "@/assets/region-lagos.webp";
import regionTavira from "@/assets/region-tavira.webp";
import regionSagres from "@/assets/region-sagres.webp";
import regionGoldenTriangle800 from "@/assets/region-golden-triangle-800w.webp";
import regionVilamoura800 from "@/assets/region-vilamoura-800w.webp";
import regionCarvoeiro800 from "@/assets/region-carvoeiro-800w.webp";
import regionLagos800 from "@/assets/region-lagos-800w.webp";
import regionTavira800 from "@/assets/region-tavira-800w.webp";
import regionSagres800 from "@/assets/region-sagres-800w.webp";
import regionGoldenTriangle400 from "@/assets/region-golden-triangle-400w.webp";
import regionVilamoura400 from "@/assets/region-vilamoura-400w.webp";
import regionCarvoeiro400 from "@/assets/region-carvoeiro-400w.webp";
import regionLagos400 from "@/assets/region-lagos-400w.webp";
import regionTavira400 from "@/assets/region-tavira-400w.webp";
import regionSagres400 from "@/assets/region-sagres-400w.webp";

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
