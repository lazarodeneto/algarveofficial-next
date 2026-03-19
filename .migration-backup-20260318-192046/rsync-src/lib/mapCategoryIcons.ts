import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  BedDouble,
  Binoculars,
  Building2,
  CalendarHeart,
  ChefHat,
  ConciergeBell,
  MapPin,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";

const ICON_BY_RAW_SLUG: Record<string, LucideIcon> = {
  "places-to-stay": BedDouble,
  "luxury-accommodation": BedDouble,
  "luxury-hotels": BedDouble,
  "luxury-hotels-resorts": BedDouble,
  restaurants: UtensilsCrossed,
  "restaurants-algarve": UtensilsCrossed,
  "fine-dining": UtensilsCrossed,
  "fine-dining-algarve": UtensilsCrossed,
  "private-chefs": ChefHat,
  golf: Trophy,
  "golf-tournaments": Trophy,
  "beaches-clubs": Waves,
  beaches: Waves,
  "wellness-spas": Sparkles,
  "shopping-boutiques": ShoppingBag,
  "things-to-do": Binoculars,
  "luxury-experiences": Binoculars,
  "family-fun": Binoculars,
  "whats-on": CalendarHeart,
  "premier-events": CalendarHeart,
  events: CalendarHeart,
  "vip-concierge": ConciergeBell,
  "concierge-services": ConciergeBell,
  "algarve-concierge-services": ConciergeBell,
  "real-estate": Building2,
  "algarve-real-estate": Building2,
  "vip-transportation": Plane,
  "architecture-decoration": Armchair,
  "protection-services": ShieldCheck,
};

const ICON_BY_CANONICAL_SLUG: Record<string, LucideIcon> = {
  "places-to-stay": BedDouble,
  restaurants: UtensilsCrossed,
  "things-to-do": Binoculars,
  "whats-on": CalendarHeart,
  "algarve-services": Users,
};

export function getMapCategoryIcon(slug?: string | null): LucideIcon {
  const normalized = slug?.toLowerCase().trim();
  if (!normalized) return MapPin;

  if (ICON_BY_RAW_SLUG[normalized]) {
    return ICON_BY_RAW_SLUG[normalized];
  }

  const canonical = getCanonicalCategorySlug(normalized);
  if (canonical && ICON_BY_CANONICAL_SLUG[canonical]) {
    return ICON_BY_CANONICAL_SLUG[canonical];
  }

  return MapPin;
}
