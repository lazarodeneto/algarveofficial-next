import {
  BedDouble,
  Binoculars,
  BookOpen,
  CalendarDays,
  FlagTriangleRight,
  HouseHeart,
  Mail,
  Map,
  MapPinHouse,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

export const PUBLIC_NAV_ICONS: Record<string, LucideIcon> = {
  "nav.stay": BedDouble,
  "nav.experiences": Binoculars,
  "nav.beaches": Waves,
  "categories.wellnessSpas": Sparkles,
  "nav.golf": FlagTriangleRight,
  "nav.properties": HouseHeart,
  "nav.map": Map,
  "nav.blog": BookOpen,
  "nav.events": CalendarDays,
  "nav.relocation": MapPinHouse,
  "nav.contact": Mail,
};
