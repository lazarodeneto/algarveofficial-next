import {
  Hotel,
  UtensilsCrossed,
  LandPlot,
  Waves,
  Sparkles,
  ChefHat,
  ConciergeBell,
  Binoculars,
  Ship,
  Plane,
  House,
  CalendarHeart,
  Armchair,
  ShieldCheck,
  ShoppingBag,
  Star,
  type LucideIcon,
} from "lucide-react";

// Icon name to component mapping used by the category records.
export const categoryIconMap: Record<string, LucideIcon> = {
  Hotel,
  Star,
  UtensilsCrossed,
  LandPlot,
  Waves,
  Sparkles,
  ChefHat,
  ConciergeBell,
  Binoculars,
  Ship,
  Plane,
  House,
  CalendarHeart,
  Armchair,
  ShieldCheck,
  ShoppingBag,
};

export function getCategoryIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return Hotel;
  return categoryIconMap[iconName] || Hotel;
}

export function renderCategoryIcon(
  iconName?: string,
  className: string = "h-4 w-4"
) {
  const IconComponent = getCategoryIconComponent(iconName);
  return <IconComponent className={className} />;
}
