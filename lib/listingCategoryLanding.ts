import type { CanonicalCategorySlug } from "@/lib/categoryMerges";

type ListingLandingKey =
  | "nav.stay"
  | "nav.experiences"
  | "nav.properties"
  | "nav.golf"
  | "nav.events";

interface ListingLandingDescriptor {
  labelKey: ListingLandingKey;
  fallbackLabel: string;
  path: string;
}

export function getListingCategoryLanding(
  canonicalCategorySlug?: CanonicalCategorySlug | null,
): ListingLandingDescriptor {
  switch (canonicalCategorySlug) {
    case "accommodation":
      return { labelKey: "nav.stay", fallbackLabel: "Stay", path: "/stay" };
    case "real-estate":
      return { labelKey: "nav.properties", fallbackLabel: "Properties", path: "/properties" };
    case "golf":
      return { labelKey: "nav.golf", fallbackLabel: "Golf", path: "/golf" };
    case "events":
      return { labelKey: "nav.events", fallbackLabel: "Events", path: "/events" };
    case "restaurants":
    case "beach-clubs":
    case "experiences":
    case "family-attractions":
    case "wellness-spas":
    case "beaches":
    case "shopping":
    case "concierge-services":
    case "transportation":
    case "security-services":
    case "architecture-design":
    default:
      return { labelKey: "nav.experiences", fallbackLabel: "Experiences", path: "/experiences" };
  }
}
