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
  data?: Record<
    string,
    | string
    | number
    | boolean
    | string[]
    | Record<string, string | number | boolean>
  >;
}

export interface CmsPageConfig {
  hero?: Record<string, unknown>;
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
  category?: "hero" | "discovery" | "content" | "utility";
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
      { id: "hero", label: "Hero", category: "hero" },
      { id: "quick-links", label: "Home Quick Links", category: "discovery" },
      { id: "smart-search", label: "Smart Search", category: "discovery" },
      { id: "regions", label: "Regions", category: "discovery" },
      { id: "all-cities", label: "All Cities", category: "discovery" },
      { id: "categories", label: "Categories", category: "discovery" },
      { id: "featured-city", label: "Featured City", category: "discovery" },
      { id: "cities", label: "Cities", category: "discovery" },
      { id: "curated", label: "Signature Selection", category: "content" },
      { id: "vip", label: "Map / VIP", category: "discovery" },
      { id: "trust", label: "Trust", category: "content" },
      { id: "all-listings", label: "All Listings", category: "content" },
      { id: "algarve-guide", label: "SEO Guide", category: "content" },
      { id: "newsletter", label: "Newsletter", category: "utility" },
      { id: "cta", label: "Call to Action", category: "utility" },
    ],
  },
  {
    id: "experiences",
    label: "Experiences",
    path: "/experiences",
    description: "Curated experiences and activities across the Algarve.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub", description: "Highlight a single city with a large hero card." },
      { id: "city-index", label: "City Index", description: "Grid of top cities by listing count." },
      { id: "filters", label: "Advanced Filters" },
      { id: "results", label: "Results Grid" },
      { id: "stats", label: "Stats" },
      { id: "pillars", label: "Experience Pillars" },
      { id: "cta", label: "Call to Action" },
    ],
  },
  {
    id: "beaches",
    label: "Beaches",
    path: "/beaches",
    description: "Beach and beach-club discovery experience.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub", description: "Highlight a single city with a large hero card." },
      { id: "city-index", label: "City Index", description: "Grid of top cities by listing count." },
      { id: "filters", label: "Advanced Filters" },
      { id: "results", label: "Results Grid" },
      { id: "stats", label: "Stats" },
      { id: "pillars", label: "Experience Pillars" },
      { id: "cta", label: "Call to Action" },
    ],
  },
  {
    id: "stay",
    label: "Stay",
    path: "/stay",
    description: "Places to stay across the Algarve — hotels, resorts, and accommodation.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub", description: "Highlight a single city with a large hero card." },
      { id: "city-index", label: "City Index", description: "Grid of top cities by listing count." },
      { id: "filters", label: "Advanced Filters" },
      { id: "results", label: "Results Grid" },
      { id: "pagination", label: "Pagination / Load More" },
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
    id: "visit-city",
    label: "Visit City",
    path: "/visit/:city",
    description: "Programmatic city landing page inside the Visit section.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "breadcrumbs", label: "Breadcrumbs" },
      { id: "city-categories", label: "City Categories" },
      { id: "listings", label: "Listings Grid" },
      { id: "seo-content", label: "SEO Content" },
    ],
  },
  {
    id: "visit-city-category",
    label: "Visit City Category",
    path: "/visit/:city/:category",
    description: "Programmatic city+category listing page.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "breadcrumbs", label: "Breadcrumbs" },
      { id: "listings", label: "Listings Grid" },
      { id: "internal-links", label: "Internal Links" },
      { id: "seo-content", label: "SEO Content" },
    ],
  },
  {
    id: "category-hub",
    label: "Category Hub",
    path: "/category/:category",
    description: "Programmatic category overview and city drill-down page.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "top-cities", label: "Top Cities" },
      { id: "featured-listings", label: "Featured Listings" },
      { id: "visibility-cta", label: "Visibility CTA" },
      { id: "seo-content", label: "SEO Content" },
    ],
  },
  {
    id: "legacy-city-category",
    label: "Legacy City Category Redirect",
    path: "/:city/:category",
    description: "Legacy alias route that redirects to the canonical city category page.",
    blocks: [
      { id: "redirect", label: "Redirect Behavior" },
      { id: "fallback", label: "Fallback State" },
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
      { id: "featured-city-hub", label: "Featured City Hub", description: "Highlight a single city with a large hero card." },
      { id: "city-index", label: "City Index", description: "Grid of all active cities." },
      { id: "all-city-hubs", label: "All Active City Hubs", description: "Showcase every active city hub." },
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
    id: "guide-detail",
    label: "Guide Detail",
    path: "/guides/:slug",
    description: "Programmatic editorial guide page template.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "breadcrumbs", label: "Breadcrumbs" },
      { id: "content", label: "Guide Content" },
      { id: "listings", label: "Listings Grid" },
      { id: "internal-links", label: "Internal Links" },
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
      { id: "related-events", label: "Related Events" },
    ],
  },
  {
    id: "live",
    label: "Residence",
    path: "/residence",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub" },
      { id: "all-city-hubs", label: "All Active City Hubs" },
      { id: "planner", label: "Planner" },
      { id: "segments", label: "Segments" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "legacy-live",
    label: "Legacy Live Redirect",
    path: "/live",
    description: "Legacy alias route that redirects to /residence.",
    blocks: [
      { id: "redirect", label: "Redirect Behavior" },
      { id: "fallback", label: "Fallback State" },
    ],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    path: "/real-estate",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub" },
      { id: "all-city-hubs", label: "All Active City Hubs" },
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
      { id: "city-hubs", label: "City Hubs" },
      { id: "featured-city-hub", label: "Featured City Hub" },
      { id: "all-city-hubs", label: "All Active City Hubs" },
      { id: "market-overview", label: "Market Overview" },
      { id: "framework", label: "Investment Framework" },
      { id: "cta", label: "CTA" },
    ],
  },
  {
    id: "properties",
    label: "Properties",
    path: "/properties",
    description: "Real estate property listings.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "filters", label: "Advanced Filters" },
      { id: "results", label: "Results Grid" },
    ],
  },
  {
    id: "golf",
    label: "Golf",
    path: "/golf",
    description: "Golf courses and experiences in the Algarve.",
    blocks: [
      { id: "hero", label: "Hero" },
      { id: "featured-courses", label: "Featured Courses", category: "content" },
      { id: "course-tools", label: "Course Tools", category: "utility" },
      { id: "leaderboard", label: "Leaderboard", category: "content" },
      { id: "cta", label: "Call to Action", category: "utility" },
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

export const CMS_PAGE_DEFINITION_MAP: Record<string, CmsPageDefinition> =
  CMS_PAGE_DEFINITIONS.reduce<Record<string, CmsPageDefinition>>((acc, page) => {
    acc[page.id] = page;
    return acc;
  }, {});

export const CMS_BLOCK_ID_ALIASES_BY_PAGE: Record<string, Record<string, string>> = {
  golf: {
    "city-hubs": "featured-courses",
    "filters": "course-tools",
    "results": "featured-courses",
    "featured-city-hub": "leaderboard",
    "city-index": "leaderboard",
  },
  invest: {
    "all-active-city-hubs": "all-city-hubs",
  },
  live: {
    "all-active-city-hubs": "all-city-hubs",
  },
  "real-estate": {
    "all-active-city-hubs": "all-city-hubs",
  },
};

export const CMS_CONTRACT_ENFORCED_PAGE_IDS: string[] = [
  "home",
  "blog",
  "events",
  "event-detail",
  "destinations",
  "destination-detail",
  "city-detail",
  "experiences",
  "live",
  "invest",
  "real-estate",
  "map",
];

export const CMS_CONTRACT_PLANNED_BLOCK_IDS: Record<string, string[]> = {
  blog: ["search"],
  destinations: ["featured-city-hub"],
  events: ["filters", "featured", "timeline"],
  "event-detail": ["hero", "details", "venue", "cta"],
  experiences: ["city-index"],
  invest: ["framework", "cta"],
  map: ["search", "map", "results"],
  "real-estate": ["filters", "listings", "concierge"],
};

interface CmsNormalizeIssueBase {
  pageId: string;
}

export type CmsNormalizeIssue =
  | (CmsNormalizeIssueBase & {
      kind: "unknown-page-id";
    })
  | (CmsNormalizeIssueBase & {
      kind: "unknown-block-id";
      blockId: string;
      resolvedBlockId?: string;
    });

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitiveCmsDataValue(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isFlatCmsDataObject(value: unknown): value is Record<string, string | number | boolean> {
  if (!isPlainRecord(value)) return false;
  return Object.values(value).every((item) => isPrimitiveCmsDataValue(item));
}

export function isKnownCmsPageId(pageId: string): boolean {
  return Boolean(CMS_PAGE_DEFINITION_MAP[pageId]);
}

export function resolveCmsBlockId(pageId: string, blockId: string): string | null {
  const definition = CMS_PAGE_DEFINITION_MAP[pageId];
  if (!definition) return null;

  const directMatch = definition.blocks.some((block) => block.id === blockId);
  if (directMatch) return blockId;

  const alias = CMS_BLOCK_ID_ALIASES_BY_PAGE[pageId]?.[blockId];
  if (!alias) return null;

  const aliasExists = definition.blocks.some((block) => block.id === alias);
  return aliasExists ? alias : null;
}

function normalizeCmsBlockConfig(input: unknown): CmsBlockConfig {
  if (!isPlainRecord(input)) return {};

  const block: CmsBlockConfig = {};

  if (typeof input.enabled === "boolean") block.enabled = input.enabled;
  if (typeof input.order === "number" && Number.isFinite(input.order)) block.order = input.order;
  if (typeof input.className === "string") block.className = input.className;

  if (isPlainRecord(input.style)) {
    const style: Record<string, string | number> = {};
    Object.entries(input.style).forEach(([styleKey, styleValue]) => {
      if (typeof styleValue === "string" || typeof styleValue === "number") {
        style[styleKey] = styleValue;
      }
    });
    block.style = style;
  }

  if (isPlainRecord(input.data)) {
    const data: Record<
      string,
      | string
      | number
      | boolean
      | string[]
      | Record<string, string | number | boolean>
    > = {};
    Object.entries(input.data).forEach(([dataKey, dataValue]) => {
      if (
        typeof dataValue === "string" ||
        typeof dataValue === "number" ||
        typeof dataValue === "boolean" ||
        Array.isArray(dataValue) ||
        isFlatCmsDataObject(dataValue)
      ) {
        data[dataKey] = dataValue as
          | string
          | number
          | boolean
          | string[]
          | Record<string, string | number | boolean>;
      }
    });
    block.data = data;
  }

  return block;
}

function mergeAliasBlockConfig(existing: CmsBlockConfig | undefined, incoming: CmsBlockConfig): CmsBlockConfig {
  if (!existing) return incoming;
  return {
    enabled: existing.enabled ?? incoming.enabled,
    order: existing.order ?? incoming.order,
    className: existing.className ?? incoming.className,
    style: existing.style ?? incoming.style,
    data: existing.data ?? incoming.data,
  };
}

export function normalizeCmsPageConfigs(
  input: unknown,
  options?: { onIssue?: (issue: CmsNormalizeIssue) => void },
): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;
    if (!isKnownCmsPageId(pageId)) {
      options?.onIssue?.({ kind: "unknown-page-id", pageId });
      return;
    }

    const normalizedPage: CmsPageConfig = {};

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: Record<string, CmsBlockConfig> = {};

      Object.entries(rawPage.blocks).forEach(([rawBlockId, rawBlock]) => {
        const resolvedBlockId = resolveCmsBlockId(pageId, rawBlockId);
        if (!resolvedBlockId) {
          options?.onIssue?.({
            kind: "unknown-block-id",
            pageId,
            blockId: rawBlockId,
          });
          return;
        }

        const normalizedBlock = normalizeCmsBlockConfig(rawBlock);
        if (rawBlockId === resolvedBlockId) {
          blocks[resolvedBlockId] = normalizedBlock;
          return;
        }

        blocks[resolvedBlockId] = mergeAliasBlockConfig(blocks[resolvedBlockId], normalizedBlock);
      });

      normalizedPage.blocks = blocks;
    }

    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      normalizedPage.text = text;
    }

    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      normalizedPage.meta = meta;
    }

    out[pageId] = normalizedPage;
  });

  return out;
}
