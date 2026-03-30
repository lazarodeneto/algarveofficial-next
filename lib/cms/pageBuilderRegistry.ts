export const CMS_GLOBAL_SETTING_KEYS = {
  textOverrides: "cms_text_overrides_v1",
  pageConfigs: "cms_page_configs_v1",
  designTokens: "cms_design_tokens_v1",
  customCss: "cms_custom_css_v1",
} as const;

export type CmsTextOverrideMap = Record<string, string>;

export interface CmsBlockConfig {
  enabled?: boolean;
  order?: number;
  className?: string;
  style?: Record<string, string | number>;
}

export interface CmsPageConfig {
  blocks?: Record<string, CmsBlockConfig>;
  text?: Record<string, string>;
  meta?: {
    title?: string;
    description?: string;
  };
}

export type CmsPageConfigMap = Record<string, CmsPageConfig>;
export type CmsDesignTokenMap = Record<string, string>;

export interface CmsBlockDefinition {
  id: string;
  label: string;
  description?: string;
}

export interface CmsPageDefinition {
  id: string;
  label: string;
  path: string;
  description?: string;
  blocks: CmsBlockDefinition[];
}

export const CMS_PAGE_DEFINITIONS: CmsPageDefinition[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    description: "Landing page and section stack.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "quick-links", label: "Home Quick Links" },
      { id: "regions", label: "Regions" },
      { id: "categories", label: "Categories" },
      { id: "cities", label: "Cities" },
      { id: "curated", label: "Signature Selection" },
      { id: "vip", label: "Map / VIP" },
      { id: "all-listings", label: "All Listings" },
      { id: "algarve-guide", label: "SEO Guide" },
      { id: "newsletter", label: "Newsletter" },
      { id: "cta", label: "Call to Action" },
    ],
  },
  {
    id: "directory",
    label: "Directory",
    path: "/directory",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "filters", label: "Filters" },
      { id: "results", label: "Results" },
      { id: "pagination", label: "Pagination / Load More" },
    ],
  },
  {
    id: "visit",
    label: "Visit (City Hubs)",
    path: "/visit",
    description: "Visit index page showing all city hubs.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "filters", label: "Filters" },
      { id: "results", label: "Results" },
      { id: "pagination", label: "Pagination / Load More" },
    ],
  },
  {
    id: "map",
    label: "Map Explorer",
    path: "/map",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "search", label: "Search / Location Controls" },
      { id: "map", label: "Interactive Map" },
      { id: "results", label: "Results Panel" },
    ],
  },
  {
    id: "listing-detail",
    label: "Listing Detail",
    path: "/listing/:id",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "gallery", label: "Gallery" },
      { id: "details", label: "Details" },
      { id: "contact", label: "Contact Card" },
      { id: "reviews", label: "Reviews" },
      { id: "related", label: "Related Listings" },
    ],
  },
  {
    id: "destinations",
    label: "Destinations",
    path: "/destinations",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "featured-regions", label: "Featured Regions" },
      { id: "other-regions", label: "More Regions" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "destination-detail",
    label: "Destination Detail",
    path: "/destinations/:slug",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "curated", label: "Signature Selection" },
      { id: "listings", label: "Listings Grid" },
      { id: "faq", label: "FAQ / Extras" },
    ],
  },
  {
    id: "city-detail",
    label: "City Detail",
    path: "/city/:slug",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "curated", label: "Signature Selection" },
      { id: "listings", label: "Listings Grid" },
      { id: "faq", label: "FAQ / Extras" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    path: "/blog",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "search", label: "Search & Categories" },
      { id: "featured-post", label: "Featured Post" },
      { id: "posts-grid", label: "Posts Grid" },
    ],
  },
  {
    id: "blog-post",
    label: "Blog Post",
    path: "/blog/:slug",
    blocks: [
      { id: "hero", label: "Hero Image" },
      { id: "content", label: "Article Content" },
      { id: "share", label: "Share / Meta" },
      { id: "related", label: "Related Posts" },
    ],
  },
  {
    id: "events",
    label: "Events",
    path: "/events",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "filters", label: "Filters" },
      { id: "featured", label: "Featured Events" },
      { id: "timeline", label: "Event Timeline" },
    ],
  },
  {
    id: "event-detail",
    label: "Event Detail",
    path: "/events/:slug",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "details", label: "Details" },
      { id: "venue", label: "Venue" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "live",
    label: "Live",
    path: "/live",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "planner", label: "Planner" },
      { id: "segments", label: "Segments" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    path: "/real-estate",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "filters", label: "Filters" },
      { id: "listings", label: "Listings Grid" },
      { id: "concierge", label: "Concierge Callout" },
    ],
  },
  {
    id: "invest",
    label: "Invest",
    path: "/invest",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "market-overview", label: "Market Overview" },
      { id: "framework", label: "Investment Framework" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "trips",
    label: "Trips",
    path: "/trips",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "planner", label: "Trip Planner" },
      { id: "saved", label: "Saved Trips" },
    ],
  },
  {
    id: "partner",
    label: "Partner",
    path: "/partner",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "benefits", label: "Benefits" },
      { id: "plans", label: "Plans" },
      { id: "contact", label: "Contact Form" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "form", label: "Contact Form" },
      { id: "sidebar", label: "Contact Info" },
      { id: "map", label: "Map" },
    ],
  },
  {
    id: "about",
    label: "About",
    path: "/about-us",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "story", label: "Story" },
      { id: "values", label: "Values" },
      { id: "team", label: "Team" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "privacy-policy",
    label: "Privacy Policy",
    path: "/privacy-policy",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "content", label: "Policy Content" },
    ],
  },
  {
    id: "terms",
    label: "Terms",
    path: "/terms",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "content", label: "Terms Content" },
    ],
  },
  {
    id: "cookie-policy",
    label: "Cookie Policy",
    path: "/cookie-policy",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "content", label: "Cookie Content" },
    ],
  },
  {
    id: "auth-login",
    label: "Login",
    path: "/login",
    blocks: [
      { id: "branding", label: "Branding Panel" },
      { id: "form", label: "Login Form" },
    ],
  },
  {
    id: "auth-signup",
    label: "Signup",
    path: "/signup",
    blocks: [
      { id: "branding", label: "Branding Panel" },
      { id: "form", label: "Signup Form" },
    ],
  },
  {
    id: "auth-forgot-password",
    label: "Forgot Password",
    path: "/forgot-password",
    blocks: [
      { id: "branding", label: "Branding Panel" },
      { id: "form", label: "Reset Request Form" },
    ],
  },
  {
    id: "auth-reset-password",
    label: "Reset Password",
    path: "/auth/reset-password",
    blocks: [
      { id: "branding", label: "Branding Panel" },
      { id: "form", label: "Reset Form" },
    ],
  },
  {
    id: "auth-callback",
    label: "Auth Callback",
    path: "/auth/callback",
    blocks: [
      { id: "status", label: "Callback Status" },
      { id: "message", label: "Status Message" },
      { id: "actions", label: "Fallback Actions" },
    ],
  },
  {
    id: "snake",
    label: "Snake",
    path: "/snake",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "game", label: "Game Canvas" },
      { id: "stats", label: "Score / Controls" },
    ],
  },
];

export const CMS_DEFAULT_DESIGN_TOKENS: CmsDesignTokenMap = {
  "--cms-heading-font": "inherit",
  "--cms-body-font": "inherit",
  "--cms-card-radius": "0.75rem",
  "--cms-section-gap": "1.5rem",
  "--cms-card-shadow": "0 10px 30px rgba(0,0,0,0.12)",
};
