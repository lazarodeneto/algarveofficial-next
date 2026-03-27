export type NavItem = {
  labelKey: string;
  href: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.visit", href: "/visit" },
  { labelKey: "nav.live", href: "/live" },
  { labelKey: "nav.invest", href: "/invest" },
  { labelKey: "nav.map", href: "/map" },
  { labelKey: "nav.events", href: "/events" },
  { labelKey: "nav.contact", href: "/contact" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.about", href: "/about-us" },
  { labelKey: "nav.blog", href: "/blog" },
  { labelKey: "nav.privacy", href: "/privacy-policy" },
  { labelKey: "nav.cookies", href: "/cookie-policy" },
  { labelKey: "nav.terms", href: "/terms" },
];
