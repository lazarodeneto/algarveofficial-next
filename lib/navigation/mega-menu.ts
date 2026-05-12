import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Binoculars,
  BookOpen,
  Building2,
  CalendarDays,
  Compass,
  FlagTriangleRight,
  Handshake,
  Home,
  KeyRound,
  Landmark,
  Map,
  Palette,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";

import { buildStaticRouteData, type LocalizedPathInput } from "@/lib/i18n/localized-routing";
import { buildCategoryRouteData } from "@/lib/public-route-builders";

export type MegaMenuAreaId = "visit" | "live" | "invest";

export type MegaMenuItem = {
  labelKey: string;
  fallbackLabel: string;
  href: LocalizedPathInput;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

export type MegaMenuSection = {
  id: MegaMenuAreaId;
  labelKey: string;
  fallbackLabel: string;
  eyebrow: string;
  description: string;
  featuredHref: LocalizedPathInput;
  featuredLabel: string;
  featuredDescription: string;
  featuredIcon: LucideIcon;
  items: MegaMenuItem[];
  quickLinks?: MegaMenuItem[];
};

function categoryRoute(slug: string, fallback: Parameters<typeof buildStaticRouteData>[0] = "stay") {
  return buildCategoryRouteData(slug) ?? buildStaticRouteData(fallback);
}

export const MEGA_MENU_SECTIONS: MegaMenuSection[] = [
  {
    id: "visit",
    labelKey: "nav.visit",
    fallbackLabel: "Visit",
    eyebrow: "Discover the Algarve",
    description: "Beaches, stays, tables, golf, events, and curated experiences for every trip.",
    featuredHref: buildStaticRouteData("map"),
    featuredLabel: "Plan your Algarve visit",
    featuredDescription: "Start with the map, then move through verified places and seasonal moments.",
    featuredIcon: Map,
    items: [
      {
        labelKey: "nav.stay",
        fallbackLabel: "Stay",
        href: buildStaticRouteData("stay"),
        description: "Hotels, villas, resorts, and selected accommodation.",
        icon: BedDouble,
      },
      {
        labelKey: "nav.beaches",
        fallbackLabel: "Beaches",
        href: buildStaticRouteData("beaches"),
        description: "Scenic beaches and coastal guides.",
        icon: Waves,
      },
      {
        labelKey: "nav.golf",
        fallbackLabel: "Golf",
        href: buildStaticRouteData("golf"),
        description: "Courses, clubs, and golf experiences.",
        icon: FlagTriangleRight,
      },
      {
        labelKey: "nav.events",
        fallbackLabel: "Events",
        href: buildStaticRouteData("events"),
        description: "Festivals, concerts, sport, and seasonal highlights.",
        icon: CalendarDays,
      },
      {
        labelKey: "categoryNames.restaurants",
        fallbackLabel: "Restaurants",
        href: categoryRoute("restaurants"),
        description: "Restaurants, fine dining, and standout local tables.",
        icon: Utensils,
      },
      {
        labelKey: "categoryNames.beach-clubs",
        fallbackLabel: "Beach Clubs",
        href: categoryRoute("beach-clubs"),
        description: "Beach clubs, sea-view days, and coastal service.",
        icon: Waves,
      },
      {
        labelKey: "nav.experiences",
        fallbackLabel: "Experiences",
        href: buildStaticRouteData("experiences"),
        description: "Activities, culture, tours, and memorable days out.",
        icon: Compass,
      },
      {
        labelKey: "categoryNames.wellness-spas",
        fallbackLabel: "Wellness",
        href: categoryRoute("wellness-spas"),
        description: "Spas, retreats, wellness, and slower travel.",
        icon: Sparkles,
      },
      {
        labelKey: "categoryNames.family-attractions",
        fallbackLabel: "Family Attractions",
        href: categoryRoute("family-attractions"),
        description: "Family-friendly activities and places to explore.",
        icon: Binoculars,
      },
      {
        labelKey: "categoryNames.shopping",
        fallbackLabel: "Shopping",
        href: categoryRoute("shopping"),
        description: "Boutiques, markets, and premium retail.",
        icon: ShoppingBag,
      },
    ],
    quickLinks: [
      {
        labelKey: "nav.map",
        fallbackLabel: "Map",
        href: buildStaticRouteData("map"),
        description: "Browse by location.",
        icon: Map,
      },
      {
        labelKey: "nav.blog",
        fallbackLabel: "Blog",
        href: buildStaticRouteData("blog"),
        description: "Read guides and stories.",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "live",
    labelKey: "megaMenu.live.label",
    fallbackLabel: "Live",
    eyebrow: "Move with confidence",
    description: "Relocation guidance and trusted services for building life in the Algarve.",
    featuredHref: buildStaticRouteData("relocation"),
    featuredLabel: "Relocate to the Algarve",
    featuredDescription: "A practical route into residency, areas, services, and local decisions.",
    featuredIcon: Home,
    items: [
      {
        labelKey: "nav.relocation",
        fallbackLabel: "Relocation",
        href: buildStaticRouteData("relocation"),
        description: "Guidance for moving, settling, and choosing a base.",
        icon: Plane,
        badge: "Start here",
      },
      {
        labelKey: "categoryNames.concierge-services",
        fallbackLabel: "Concierge Services",
        href: categoryRoute("concierge-services"),
        description: "Lifestyle support, setup help, and local assistance.",
        icon: KeyRound,
      },
      {
        labelKey: "categoryNames.transportation",
        fallbackLabel: "Transportation",
        href: categoryRoute("transportation"),
        description: "Transfers, drivers, and mobility support.",
        icon: Compass,
      },
      {
        labelKey: "categoryNames.security-services",
        fallbackLabel: "Security Services",
        href: categoryRoute("security-services"),
        description: "Protection, monitoring, and specialist providers.",
        icon: ShieldCheck,
      },
      {
        labelKey: "categoryNames.architecture-design",
        fallbackLabel: "Architecture & Design",
        href: categoryRoute("architecture-design"),
        description: "Architects, interiors, and home improvement partners.",
        icon: Palette,
      },
    ],
  },
  {
    id: "invest",
    labelKey: "nav.invest",
    fallbackLabel: "Invest",
    eyebrow: "Property and opportunity",
    description: "Real estate, investment context, and partners for long-term Algarve decisions.",
    featuredHref: buildStaticRouteData("properties"),
    featuredLabel: "Find property in the Algarve",
    featuredDescription: "Browse public property listings without splitting SEO across duplicate routes.",
    featuredIcon: Building2,
    items: [
      {
        labelKey: "nav.properties",
        fallbackLabel: "Properties",
        href: buildStaticRouteData("properties"),
        description: "Canonical property and real-estate listings.",
        icon: Building2,
        badge: "Canonical",
      },
      {
        labelKey: "nav.invest",
        fallbackLabel: "Investment Guide",
        href: buildStaticRouteData("invest"),
        description: "Market context and investment positioning.",
        icon: Landmark,
      },
      {
        labelKey: "footer.becomePartner",
        fallbackLabel: "Partner with us",
        href: buildStaticRouteData("partner"),
        description: "List or promote a premium business.",
        icon: Handshake,
      },
    ],
  },
];
