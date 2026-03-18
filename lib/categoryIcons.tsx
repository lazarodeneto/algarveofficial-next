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
  LucideIcon,
} from "lucide-react";

/**
 * Definitive category icon mapping for AlgarveOfficial
 * 
 * 1  Accommodation           = Hotel
 * 2  Gastronomy             = UtensilsCrossed
 * 3  Golf & Tournaments      = LandPlot
 * 4  Beaches & Beach Clubs   = Waves
 * 5  Wellness & Spas         = Sparkles
 * 6  Private Dining          = ChefHat
 * 7  Concierge Services      = ConciergeBell
 * 8  Algarve Experience     = Binoculars
 * 9  Family Attractions      = Ship
 * 10 VIP Transportation      = Plane
 * 11 Prime Real Estate       = House
 * 12 Premier Events          = CalendarHeart
 * 13 Architecture & Decoration = Armchair
 * 14 Protection Services     = ShieldCheck
 * 15 Shopping & Boutiques    = ShoppingBag
 */

// Icon name to component mapping (for database icon field values)
export const categoryIconMap: Record<string, LucideIcon> = {
  'Hotel': Hotel,
  'Star': Star,
  'UtensilsCrossed': UtensilsCrossed,
  'LandPlot': LandPlot,
  'Waves': Waves,
  'Sparkles': Sparkles,
  'ChefHat': ChefHat,
  'ConciergeBell': ConciergeBell,
  'Binoculars': Binoculars,
  'Ship': Ship,
  'Plane': Plane,
  'House': House,
  'CalendarHeart': CalendarHeart,
  'Armchair': Armchair,
  'ShieldCheck': ShieldCheck,
  'ShoppingBag': ShoppingBag,
};

/**
 * Get the Lucide icon component for a category
 */
export function getCategoryIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return Hotel;
  return categoryIconMap[iconName] || Hotel;
}

/**
 * Render a category icon as JSX with specified className
 */
export function renderCategoryIcon(iconName?: string, className: string = "h-4 w-4") {
  const IconComponent = getCategoryIconComponent(iconName);
  return <IconComponent className={className} />;
}
