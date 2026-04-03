export type NavItem = {
  labelKey: string;
  fallbackLabel: string;
  href: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.stay", fallbackLabel: "Stay", href: "/stay?category=places-to-stay" },
  { labelKey: "nav.experiences", fallbackLabel: "Experiences", href: "/experiences" },
  { labelKey: "nav.golf", fallbackLabel: "Golf", href: "/golf" },
  { labelKey: "nav.properties", fallbackLabel: "Properties", href: "/properties" },
  { labelKey: "nav.map", fallbackLabel: "Map", href: "/map" },
  { labelKey: "nav.events", fallbackLabel: "Events", href: "/events" },
  { labelKey: "nav.live", fallbackLabel: "Live", href: "/live" },
  { labelKey: "nav.contact", fallbackLabel: "Contact", href: "/contact" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.about", fallbackLabel: "About Us", href: "/about-us" },
  { labelKey: "nav.blog", fallbackLabel: "Blog", href: "/blog" },
  { labelKey: "nav.privacy", fallbackLabel: "Privacy Policy", href: "/privacy-policy" },
  { labelKey: "nav.cookies", fallbackLabel: "Cookie Policy", href: "/cookie-policy" },
  { labelKey: "nav.terms", fallbackLabel: "Terms of Service", href: "/terms" },
];
