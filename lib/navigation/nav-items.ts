export type NavItem = {
  labelKey: string;
  fallbackLabel: string;
  href: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.visit", fallbackLabel: "Visit", href: "/visit" },
  { labelKey: "nav.live", fallbackLabel: "Live", href: "/live" },
  { labelKey: "nav.invest", fallbackLabel: "Invest", href: "/real-estate" },
  { labelKey: "nav.map", fallbackLabel: "Map", href: "/map" },
  { labelKey: "nav.events", fallbackLabel: "Events", href: "/events" },
  { labelKey: "nav.contact", fallbackLabel: "Contact", href: "/contact" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.about", fallbackLabel: "About Us", href: "/about-us" },
  { labelKey: "nav.blog", fallbackLabel: "Blog", href: "/blog" },
  { labelKey: "nav.privacy", fallbackLabel: "Privacy Policy", href: "/privacy-policy" },
  { labelKey: "nav.cookies", fallbackLabel: "Cookie Policy", href: "/cookie-policy" },
  { labelKey: "nav.terms", fallbackLabel: "Terms of Service", href: "/terms" },
];
