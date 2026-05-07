import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  GripVertical,
  History,
  ImageIcon,
  Layers,
  LayoutDashboard,
  Library,
  Loader2,
  Monitor,
  Paintbrush,
  PanelRight,
  Plus,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Video,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import {
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_DEFINITIONS,
  getCmsPageRegistryMeta,
  isCmsPageEditableInFullBuilder,
  normalizeCmsPageConfigs,
  type CmsBlockConfig,
  type CmsBlockDefinition,
  type CmsPageRegistryGroup,
  type CmsPageStatus,
  type CmsDesignTokenMap,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import {
  normalizeCityBlockMode,
  normalizeSelectedCityIds,
  validateSelectedCityIds,
} from "@/lib/cms/city-block-config";
import { normalizePlacementSelection } from "@/lib/cms/placement-engine";
import {
  normalizeListingFilterId,
  normalizeListingMaxItems,
  normalizeSelectedListingIds,
  validateSelectedListingIds,
} from "@/lib/cms/listing-block-config";
import { getSafeCmsImageSrc, normalizeCmsImageFieldsInValue } from "@/lib/cms/image-source";
import { convertToWebP } from "@/lib/imageUtils";
import { ImageUrlUploadField } from "@/components/admin/ImageUrlUploadField";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  addLocaleToPathname,
  LOCALE_CONFIGS,
  SUPPORTED_LOCALES,
  stripLocaleFromPathname,
  type Locale,
} from "@/lib/i18n/config";
import {
  normalizePageConfig,
} from "@/lib/cms/normalize-page-config";
import { validateCmsPageBuilderDraft } from "@/lib/cms/page-builder-validation";
import { resolveHero, resolvePageContent } from "@/lib/cms/resolve-hero";
import { getDefaultBlockSettings, isSupportedBlockType, type CmsPageConfig } from "@/lib/cms/block-schemas";
import { BlockPreview } from "@/components/cms/builder/BlockPreview";
import AdminHomePage from "./AdminHomePage";

const ENABLE_VISUAL_BLOCK_BUILDER = true;

const HERO_MEDIA_SUPPORTED_PAGE_IDS = new Set([
  "beaches",
  "blog",
  "contact",
  "destinations",
  "directory",
  "events",
  "experiences",
  "golf",
  "invest",
  "live",
  "map",
  "properties",
  "real-estate",
  "stay",
  "visit",
  "wellness-spas",
]);

type CmsVisibleFieldType = "text" | "textarea";

interface CmsVisibleFieldDefinition {
  key: string;
  label: string;
  group: string;
  fallback: string;
  type?: CmsVisibleFieldType;
  description?: string;
}

const HERO_VISIBLE_FIELDS: CmsVisibleFieldDefinition[] = [
  { group: "Hero", key: "hero.badge", label: "Hero Label", fallback: "Curated Algarve" },
  { group: "Hero", key: "hero.title", label: "Hero Title", fallback: "Page title" },
  { group: "Hero", key: "hero.subtitle", label: "Hero Subtitle", fallback: "Page introduction", type: "textarea" },
  { group: "Hero", key: "hero.cta.primary", label: "Primary CTA", fallback: "Explore" },
  { group: "Hero", key: "hero.cta.secondary", label: "Secondary CTA", fallback: "Contact" },
  { group: "Hero", key: "hero.alt", label: "Hero Image Alt Text", fallback: "Algarve page hero" },
];

const DIRECTORY_VISIBLE_FIELDS: CmsVisibleFieldDefinition[] = [
  { group: "Directory Filters", key: "filters.title", label: "Filters Title", fallback: "Advanced Filters" },
  { group: "Directory Filters", key: "filters.searchPlaceholder", label: "Search Placeholder", fallback: "Search by name, keyword, or experience..." },
  { group: "Results", key: "results.countLabel", label: "Results Count Label", fallback: "Showing {{count}} curated listings" },
  { group: "Results", key: "results.emptyTitle", label: "Empty State Title", fallback: "No listings found" },
  { group: "Results", key: "results.emptyDescription", label: "Empty State Description", fallback: "Try changing filters or search terms.", type: "textarea" },
];

const EXPERIENCES_VISIBLE_FIELDS: CmsVisibleFieldDefinition[] = [
  ...HERO_VISIBLE_FIELDS,
  { group: "Stats Boxes", key: "stats.curated", label: "Curated Stat Label", fallback: "Curated experiences" },
  { group: "Stats Boxes", key: "stats.categories", label: "Categories Stat Label", fallback: "Experience categories" },
  { group: "Stats Boxes", key: "stats.sunDays", label: "Sun Days Stat Label", fallback: "Sunshine days" },
  { group: "Pillars", key: "pillars.label", label: "Pillars Label", fallback: "Experience Pillars" },
  { group: "Pillars", key: "pillars.title", label: "Pillars Title", fallback: "Choose your Algarve rhythm" },
  { group: "Pillars", key: "pillars.outdoor.title", label: "Outdoor Card Title", fallback: "Outdoor Adventures" },
  { group: "Pillars", key: "pillars.outdoor.description", label: "Outdoor Card Description", fallback: "Surfing, kayaking, hiking, and coastal exploration.", type: "textarea" },
  { group: "Pillars", key: "pillars.gastronomy.title", label: "Gastronomy Card Title", fallback: "Gastronomy & Wine" },
  { group: "Pillars", key: "pillars.gastronomy.description", label: "Gastronomy Card Description", fallback: "Wine tastings, seafood experiences, and local cooking classes.", type: "textarea" },
  { group: "Pillars", key: "pillars.culture.title", label: "Culture Card Title", fallback: "Culture & Heritage" },
  { group: "Pillars", key: "pillars.culture.description", label: "Culture Card Description", fallback: "Historic villages, artisan workshops, and local traditions.", type: "textarea" },
  { group: "Pillars", key: "pillars.wellness.title", label: "Wellness Card Title", fallback: "Wellness & Relaxation" },
  { group: "Pillars", key: "pillars.wellness.description", label: "Wellness Card Description", fallback: "Spa retreats, yoga sessions, and holistic escapes.", type: "textarea" },
  { group: "CTA", key: "cta.title", label: "CTA Title", fallback: "Plan your Algarve experience" },
  { group: "CTA", key: "cta.description", label: "CTA Description", fallback: "Tell us what you are looking for and we will help you find the right fit.", type: "textarea" },
  { group: "CTA", key: "cta.primary", label: "CTA Primary Button", fallback: "Contact Us" },
  { group: "CTA", key: "cta.secondary", label: "CTA Secondary Button", fallback: "Browse Listings" },
];

const PAGE_VISIBLE_FIELD_DEFINITIONS: Record<string, CmsVisibleFieldDefinition[]> = {
  home: [
    ...HERO_VISIBLE_FIELDS,
    { group: "Home", key: "sections.regions.title", label: "Regions Heading", fallback: "Browse the Algarve" },
    { group: "Home", key: "sections.cities.allCities", label: "Cities Heading", fallback: "All Cities" },
    { group: "Home", key: "sections.categories.title", label: "Categories Heading", fallback: "Browse Categories" },
  ],
  stay: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Stay" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Stay in the Algarve" }
          : field.key === "hero.subtitle"
            ? { ...field, fallback: "Find the perfect places to stay across the Algarve." }
            : field,
    ),
    ...DIRECTORY_VISIBLE_FIELDS,
  ],
  "wellness-spas": [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Wellness & Spas" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Wellness & Spas in the Algarve" }
          : field.key === "hero.subtitle"
            ? { ...field, fallback: "Discover restorative spas, retreats, and wellness escapes across the Algarve." }
            : field,
    ),
    ...DIRECTORY_VISIBLE_FIELDS,
  ],
  experiences: EXPERIENCES_VISIBLE_FIELDS,
  beaches: [
    ...EXPERIENCES_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Beaches" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Beaches in the Algarve" }
          : field.key === "hero.subtitle"
            ? { ...field, fallback: "Discover golden sands, turquoise water, and premium beach clubs." }
            : field,
    ),
  ],
  golf: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Curated Golf" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Play Championship Golf in the Algarve" }
          : field,
    ),
    { group: "Featured Courses", key: "featured-courses.title", label: "Featured Courses Title", fallback: "Featured Courses" },
    { group: "Course Tools", key: "course-tools.booking.title", label: "Booking Tool Card Title", fallback: "Book a Tee Time" },
    { group: "Course Tools", key: "course-tools.scorecards.title", label: "Scorecards Tool Card Title", fallback: "Scorecards" },
    { group: "CTA", key: "cta.title", label: "CTA Title", fallback: "Ready to play?" },
    { group: "CTA", key: "cta.description", label: "CTA Description", fallback: "Find courses, compare details, and plan your next round.", type: "textarea" },
  ],
  properties: [
    { group: "Hero", key: "hero.title", label: "Page Title", fallback: "Properties" },
    { group: "Assistance Box", key: "assistance.title", label: "Assistance Title", fallback: "Need search assistance?" },
    { group: "Assistance Box", key: "assistance.description", label: "Assistance Description", fallback: "Tell us what you are looking for and our concierge team will help.", type: "textarea" },
    { group: "Assistance Box", key: "assistance.cta", label: "Assistance CTA", fallback: "Speak with Concierge" },
    { group: "Results", key: "results.availableLabel", label: "Available Label", fallback: "properties available" },
    { group: "Results", key: "results.sortedLabel", label: "Sort Label", fallback: "Sorted by featured" },
    { group: "Results", key: "results.emptyTitle", label: "Empty State Title", fallback: "No properties match this refined search" },
  ],
  map: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Map Explorer" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Map Explorer" }
          : field,
    ),
    ...DIRECTORY_VISIBLE_FIELDS,
    { group: "Map", key: "map.visibleOnMap", label: "Visible Count Label", fallback: "Visible on map" },
    { group: "Map", key: "map.emptyCoordinates", label: "No Coordinates Message", fallback: "No mapped listings in this view." },
  ],
  blog: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Journal" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Algarve Blog" }
          : field,
    ),
    { group: "Search", key: "search.placeholder", label: "Search Placeholder", fallback: "Search stories, guides, and tips..." },
    { group: "Search", key: "search.allPosts", label: "All Posts Filter", fallback: "All Posts" },
    { group: "Posts", key: "posts.by", label: "Author Prefix", fallback: "By" },
    { group: "Posts", key: "posts.readTime", label: "Read Time Label", fallback: "min read" },
    { group: "Posts", key: "posts.readMore", label: "Read More Label", fallback: "Read More" },
    { group: "Posts", key: "posts.emptyTitle", label: "Empty State Title", fallback: "No posts found" },
    { group: "Posts", key: "posts.emptyDescription", label: "Empty State Description", fallback: "Try another search or category.", type: "textarea" },
  ],
  events: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Events" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Events in the Algarve" }
          : field,
    ),
    { group: "Filters", key: "filters.allCategories", label: "All Categories Label", fallback: "All Categories" },
    { group: "Featured Events", key: "featured.title", label: "Featured Section Title", fallback: "Featured Events" },
    { group: "Featured Events", key: "featured.badge", label: "Featured Badge", fallback: "Featured" },
    { group: "Timeline", key: "timeline.title", label: "Timeline Title", fallback: "Upcoming Events" },
    { group: "Timeline", key: "timeline.emptyTitle", label: "Empty State Title", fallback: "No upcoming events" },
    { group: "Timeline", key: "timeline.emptyDescription", label: "Empty State Description", fallback: "Check back soon for new Algarve events.", type: "textarea" },
  ],
  live: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Relocation" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Relocate to the Algarve" }
          : field,
    ),
    { group: "Planner", key: "planner.label", label: "Planner Label", fallback: "Relocation Planner" },
    { group: "Planner", key: "planner.title", label: "Planner Title", fallback: "Build your relocation brief" },
    { group: "Segments", key: "segments.roadmapTitle", label: "Roadmap Title", fallback: "Your relocation roadmap" },
    { group: "Segments", key: "segments.pillarsTitle", label: "Pillars Title", fallback: "Why the Algarve works" },
    { group: "CTA", key: "final.title", label: "Final CTA Title", fallback: "Start your relocation plan" },
    { group: "CTA", key: "final.primary", label: "Final Primary Button", fallback: "Talk to us" },
    { group: "CTA", key: "final.secondary", label: "Final Secondary Button", fallback: "Explore properties" },
  ],
  "real-estate": [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Real Estate" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Real Estate in the Algarve" }
          : field,
    ),
    { group: "Concierge", key: "concierge.title", label: "Concierge Title", fallback: "Need property guidance?" },
    { group: "Concierge", key: "concierge.description", label: "Concierge Description", fallback: "Our team can help refine your search.", type: "textarea" },
    { group: "Concierge", key: "concierge.cta", label: "Concierge CTA", fallback: "Speak with Concierge" },
  ],
  invest: [
    ...HERO_VISIBLE_FIELDS.map((field) =>
      field.key === "hero.badge"
        ? { ...field, fallback: "Invest" }
        : field.key === "hero.title"
          ? { ...field, fallback: "Invest in Algarve" }
          : field,
    ),
    { group: "Market Overview", key: "market.label", label: "Market Label", fallback: "Market Intelligence" },
    { group: "Market Overview", key: "market.title", label: "Market Title", fallback: "Algarve investment intelligence" },
    { group: "Planner", key: "planner.title", label: "Planner Title", fallback: "Investment Planner" },
    { group: "CTA", key: "cta.title", label: "CTA Title", fallback: "Ready to underwrite an Algarve opportunity?" },
    { group: "CTA", key: "cta.description", label: "CTA Description", fallback: "Work with our team to compare locations, model income, and move with confidence.", type: "textarea" },
  ],
  contact: [
    { group: "Hero", key: "hero.title", label: "Hero Title", fallback: "Contact Us" },
    { group: "Hero", key: "hero.subtitle", label: "Hero Subtitle", fallback: "We'd love to hear from you. Get in touch with our team.", type: "textarea" },
    { group: "Contact Card", key: "contactCard.title", label: "Contact Card Title", fallback: "Get in Touch" },
    { group: "Contact Card", key: "contactCard.description", label: "Contact Card Description", fallback: "Choose your preferred way to reach us.", type: "textarea" },
    { group: "Contact Card", key: "contactCard.emailLabel", label: "Email Label", fallback: "Email" },
    { group: "Contact Card", key: "contactCard.whatsappLabel", label: "WhatsApp Label", fallback: "WhatsApp" },
    { group: "Contact Card", key: "contactCard.locationLabel", label: "Location Label", fallback: "Location" },
    { group: "Form", key: "form.title", label: "Form Title", fallback: "Send a Message" },
    { group: "Form", key: "form.description", label: "Form Description", fallback: "Fill out the form below and our team will get back to you shortly.", type: "textarea" },
  ],
};

const GOLF_DISCOVERY_CARDS = [
  { tag: "championship", label: "Championship Courses" },
  { tag: "coastal", label: "Scenic Coastal Golf" },
  { tag: "luxury", label: "Luxury & Private Clubs" },
  { tag: "beginner", label: "Beginner Friendly" },
  { tag: "quick-9", label: "Quick 9-Hole Rounds" },
] as const;

const GOLF_DISCOVERY_DEFAULTS = {
  label: "Discover Golf",
  title: "Find your perfect golf course in the Algarve",
  subtitle: "Choose the kind of round you want and discover curated courses without endless comparison.",
};

const GOLF_DISCOVERY_CARD_DEFAULTS: Record<(typeof GOLF_DISCOVERY_CARDS)[number]["tag"], { title: string; description: string }> = {
  championship: { title: "Championship Courses", description: "18-hole tournament layouts" },
  coastal: { title: "Scenic Coastal Golf", description: "Views and atmosphere" },
  luxury: { title: "Luxury & Private Clubs", description: "Premium golf experiences" },
  beginner: { title: "Beginner Friendly", description: "Easier rounds and learning" },
  "quick-9": { title: "Quick 9-Hole Rounds", description: "Faster rounds" },
};

const CMS_PAGE_GROUP_ORDER: CmsPageRegistryGroup[] = [
  "Core Pages",
  "Directory Pages",
  "Dynamic Templates",
  "Golf",
  "Blog & Events",
  "Business & Legal",
  "Auth & System",
];

const CMS_PAGE_STATUS_LABEL: Record<CmsPageStatus, string> = {
  enabled: "Live",
  partial: "Read-only",
  planned: "Queued",
  disabled: "Hidden",
};

const CMS_PAGE_STATUS_BADGE_CLASS: Record<CmsPageStatus, string> = {
  enabled: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
  partial: "border-amber-500/40 bg-amber-50 text-amber-700",
  planned: "border-slate-300 bg-slate-50 text-slate-600",
  disabled: "border-slate-300 bg-slate-100 text-slate-500",
};

function isFunctionalBuilderPage(pageId: string): boolean {
  return getCmsPageRegistryMeta(pageId).status === "enabled";
}

const FUNCTIONAL_PAGE_DEFINITIONS = CMS_PAGE_DEFINITIONS.filter((page) =>
  isFunctionalBuilderPage(page.id),
);

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringMap(input: unknown): Record<string, string> {
  if (!isRecord(input)) return {};
  const out: Record<string, string> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      out[key] = value;
    }
  });
  return out;
}

function AdminImageCardPreview({
  title,
  description,
  imageUrl,
  fallbackLabel = "No image",
}: {
  title: string;
  description?: string;
  imageUrl: string;
  fallbackLabel?: string;
}) {
  const trimmedImageUrl = getSafeCmsImageSrc(imageUrl) ?? "";
  const [erroredImageUrl, setErroredImageUrl] = useState<string | null>(null);
  const hasImageError = Boolean(trimmedImageUrl) && erroredImageUrl === trimmedImageUrl;
  const canPreviewImage = Boolean(trimmedImageUrl) && !hasImageError;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <div className="relative flex aspect-[4/3] min-h-[150px] flex-col justify-end overflow-hidden bg-black p-4 text-white">
        {canPreviewImage ? (
          <img
            src={trimmedImageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setErroredImageUrl(trimmedImageUrl)}
          />
        ) : null}
        {canPreviewImage ? <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" /> : null}
        {!canPreviewImage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-xs font-medium uppercase tracking-[0.16em] text-white/70">
            {hasImageError ? "Image unavailable" : fallbackLabel}
          </div>
        ) : null}
        <div className="relative z-10">
          <p className="font-fira text-lg font-bold leading-tight">{title}</p>
          {description ? <p className="mt-1 text-sm leading-snug text-white/85">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

interface CmsDocumentVersionSummary {
  id: number | string;
  version: number;
  created_at?: string | null;
  created_by?: string | null;
}

function formatCmsVersionDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toRows(input: Record<string, string>): KeyValueRow[] {
  return Object.entries(input).map(([key, value], index) => ({
    id: `${key}-${index}`,
    key,
    value,
  }));
}

function fromRows(rows: KeyValueRow[]): Record<string, string> {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (!key) return acc;
    acc[key] = row.value;
    return acc;
  }, {});
}

function resolvePreviewPath(path: string): string {
  return path
    .replace(":city", "lagos")
    .replace(":category", "restaurants")
    .replace(":slug", "sample")
    .replace(":id", "sample");
}

function convertVisualBlocksToLegacyMap(config: CmsPageConfig): Record<string, CmsBlockConfig> {
  return (config.blocks ?? []).reduce<Record<string, CmsBlockConfig>>((acc, block) => {
    const settings =
      block.settings && typeof block.settings === "object" && !Array.isArray(block.settings)
        ? (block.settings as Record<string, unknown>)
        : {};

    acc[block.id] = {
      enabled: block.enabled,
      order: block.order,
      className: typeof settings.className === "string" ? settings.className : undefined,
      data: settings as CmsBlockConfig["data"],
    };
    return acc;
  }, {});
}

function buildHeroTextMap(hero: CmsPageConfig["hero"] | undefined): Record<string, string> {
  if (!hero) return {};

  const map: Record<string, string> = {};

  if (typeof hero.mediaType === "string") map["hero.mediaType"] = hero.mediaType;
  if (typeof hero.imageUrl === "string") map["hero.imageUrl"] = hero.imageUrl;
  if (typeof hero.videoUrl === "string") map["hero.videoUrl"] = hero.videoUrl;
  if (typeof hero.youtubeUrl === "string") map["hero.youtubeUrl"] = hero.youtubeUrl;
  if (typeof hero.posterUrl === "string") map["hero.posterUrl"] = hero.posterUrl;
  if (typeof hero.alt === "string") map["hero.alt"] = hero.alt;
  if (typeof hero.badge === "string") map["hero.badge"] = hero.badge;
  if (typeof hero.title === "string") map["hero.title"] = hero.title;
  if (typeof hero.subtitle === "string") map["hero.subtitle"] = hero.subtitle;
  if (typeof hero.ctaPrimary === "string") map["hero.cta.primary"] = hero.ctaPrimary;
  if (typeof hero.ctaSecondary === "string") map["hero.cta.secondary"] = hero.ctaSecondary;
  if (typeof (hero as { ctaCourses?: unknown }).ctaCourses === "string") {
    map["hero.cta.primary"] = (hero as { ctaCourses?: string }).ctaCourses ?? "";
  }
  if (typeof (hero as { ctaLeaderboard?: unknown }).ctaLeaderboard === "string") {
    map["hero.cta.secondary"] = (hero as { ctaLeaderboard?: string }).ctaLeaderboard ?? "";
  }

  return map;
}

function AdminPageBuilderContent() {
  const router = useRouter();
  const locale = useCurrentLocale();
  const pathname = usePathname() || "/admin/cms/page-builder";
  const searchParams = useSearchParams();
  const requestedPageId = searchParams.get("page")?.trim() ?? "";
  const requestedMode = searchParams.get("mode")?.trim() ?? "";
  const fallbackPageId = FUNCTIONAL_PAGE_DEFINITIONS[0]?.id ?? "home";
  const initialPageId = FUNCTIONAL_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId)
    ? requestedPageId
    : fallbackPageId;

  const { settings, isLoading, saveSettingsAsync, isSaving } = useGlobalSettings({
    locale,
    keys: [
      CMS_GLOBAL_SETTING_KEYS.pageConfigs,
      CMS_GLOBAL_SETTING_KEYS.textOverrides,
      CMS_GLOBAL_SETTING_KEYS.designTokens,
      CMS_GLOBAL_SETTING_KEYS.customCss,
    ],
  });

  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId);
  const isHomePage = selectedPageId === "home";
  const isHomeEditorMode = isHomePage && requestedMode !== "builder";
  const isGolfPage = selectedPageId === "golf";

  const [pageConfigs, setPageConfigs] = useState<CmsPageConfigMap>({});
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [selectedInspectorBlockId, setSelectedInspectorBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [globalTextRows, setGlobalTextRows] = useState<KeyValueRow[]>([]);
  const [designTokenRows, setDesignTokenRows] = useState<KeyValueRow[]>([]);
  const [customCss, setCustomCss] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [heroUploadTarget, setHeroUploadTarget] = useState<"image" | "video" | "poster" | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [featuredCitySearchQuery, setFeaturedCitySearchQuery] = useState("");
  const [listingSearchQuery, setListingSearchQuery] = useState("");
  const pendingSelectedPageIdRef = useRef<string | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const heroVideoInputRef = useRef<HTMLInputElement | null>(null);
  const heroPosterInputRef = useRef<HTMLInputElement | null>(null);

  const [visualConfig, setVisualConfig] = useState<CmsPageConfig | null>(null);
  const [cmsDocumentId, setCmsDocumentId] = useState<number | null>(null);
  const [cmsLatestDraftVersion, setCmsLatestDraftVersion] = useState<number | null>(null);
  const [cmsLatestPublishedVersion, setCmsLatestPublishedVersion] = useState<number | null>(null);
  const [cmsVersionHistory, setCmsVersionHistory] = useState<CmsDocumentVersionSummary[]>([]);
  const [isCmsDocumentLoading, setIsCmsDocumentLoading] = useState(false);
  const [isCmsSavingDraft, setIsCmsSavingDraft] = useState(false);
  const [isCmsPublishing, setIsCmsPublishing] = useState(false);
  const [isCmsPreviewing, setIsCmsPreviewing] = useState(false);
  const [isCmsHistoryLoading, setIsCmsHistoryLoading] = useState(false);
  const [isCmsDirty, setIsCmsDirty] = useState(false);

  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities-for-cms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, slug, is_active")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-for-cms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, is_active")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: listingOptions = [] } = useQuery({
    queryKey: ["admin-listings-for-cms-placement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, name, slug, city_id, category_id, tier, status")
        .eq("status", "published")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const setSearchParams = useCallback((nextParams: URLSearchParams, options?: { replace?: boolean }) => {
    const query = nextParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  }, [pathname, router]);

  const setHomeWorkspaceMode = (mode: "home-editor" | "builder") => {
    const next = new URLSearchParams(searchParams);
    next.set("page", "home");
    if (mode === "builder") {
      next.set("mode", "builder");
    } else {
      next.delete("mode");
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!pathname.endsWith("/admin/content/home")) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", "home");
    const query = next.toString();
    const targetPathname = pathname.replace(
      /\/admin\/content\/home$/,
      "/admin/content/page-builder",
    );
    router.replace(`${targetPathname}${query ? `?${query}` : ""}`);
  }, [pathname, router, searchParams]);

  const fetchSelectedCmsConfig = async (pageId: string) => {
    const json = await fetchAdmin(
      `/api/admin/cms/page-config?page_id=${encodeURIComponent(pageId)}&locale=${encodeURIComponent(locale)}`
    );
    return json.data;
  };

  const saveSelectedDraft = async (pageId: string, content: CmsPageConfig | Record<string, unknown>) => {
    const json = await fetchAdmin("/api/admin/cms/page-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_draft",
        page_id: pageId,
        locale,
        content,
      }),
    });
    return json.data;
  };

  const publishSelectedPage = async (pageId: string) => {
    const json = await fetchAdmin("/api/admin/cms/page-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        page_id: pageId,
        locale,
      }),
    });
    return json.data;
  };

  const fetchSelectedCmsHistory = async (pageId: string) => {
    const json = await fetchAdmin(
      `/api/admin/cms/documents?page_id=${encodeURIComponent(pageId)}&locale=${encodeURIComponent(locale)}&doc_type=page_config&include_versions=true&version_limit=6&limit=1`,
    );
    const document = Array.isArray(json.data) ? json.data[0] : null;
    const versions = Array.isArray(document?.versions) ? document.versions : [];

    return versions
      .map((version: unknown): CmsDocumentVersionSummary | null => {
        if (!version || typeof version !== "object") return null;
        const row = version as Record<string, unknown>;
        const id = row.id;
        const versionNumber = Number(row.version ?? 0);
        if ((typeof id !== "string" && typeof id !== "number") || !Number.isFinite(versionNumber)) {
          return null;
        }

        return {
          id,
          version: versionNumber,
          created_at: typeof row.created_at === "string" ? row.created_at : null,
          created_by: typeof row.created_by === "string" ? row.created_by : null,
        };
      })
      .filter((version: CmsDocumentVersionSummary | null): version is CmsDocumentVersionSummary => version !== null);
  };

  const openSelectedPreview = async (path: string) => {
    const json = await fetchAdmin(
      `/api/admin/cms/preview-url?path=${encodeURIComponent(path)}&locale=${encodeURIComponent(locale)}`
    );
    window.open(json.data.url, "_blank", "noopener,noreferrer");
  };

  const applySelectedCmsConfigData = (pageId: string, data: Record<string, unknown>) => {
    const rawContent = isRecord(data.content) ? data.content : {};
    const normalizedContent = normalizePageConfig(rawContent);

    setCmsDocumentId(typeof data.document_id === "number" ? data.document_id : null);
    setCmsLatestDraftVersion(typeof data.latest_draft_version === "number" ? data.latest_draft_version : null);
    setCmsLatestPublishedVersion(typeof data.latest_published_version === "number" ? data.latest_published_version : null);
    setVisualConfig(normalizedContent);

    const hasDocumentContent = Object.keys(rawContent).length > 0;
    setPageConfigs((prev) => {
      if (!hasDocumentContent) {
        return prev;
      }

      return {
        ...prev,
        [pageId]: {
          ...(prev[pageId] ?? {}),
          hero: (normalizedContent.hero as Record<string, unknown>) ?? (rawContent.hero as Record<string, unknown> | undefined) ?? {},
          meta: normalizedContent.meta ?? (rawContent.meta as CmsPageConfig["meta"] | undefined),
          blocks: {
            ...((prev[pageId]?.blocks as Record<string, CmsBlockConfig> | undefined) ?? {}),
            ...convertVisualBlocksToLegacyMap(normalizedContent),
          },
          text: {
            ...((prev[pageId]?.text as Record<string, string> | undefined) ?? {}),
            ...((rawContent.text as Record<string, string> | undefined) ?? {}),
            ...buildHeroTextMap(normalizedContent.hero),
          },
        },
      };
    });
    setIsCmsDirty(false);
  };

  const settingMap = useMemo(() => {
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});
  }, [settings]);

  useEffect(() => {
    if (!requestedPageId) return;
    const isValidRequested = FUNCTIONAL_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId);
    if (!isValidRequested) return;

    const pendingPageId = pendingSelectedPageIdRef.current;
    if (pendingPageId) {
      if (requestedPageId === pendingPageId) {
        pendingSelectedPageIdRef.current = null;
      } else {
        return;
      }
    }

    if (isCmsDirty) return;
    if (requestedPageId !== selectedPageId) {
      setSelectedPageId(requestedPageId);
    }
  }, [isCmsDirty, requestedPageId, selectedPageId]);

  useEffect(() => {
    if (!isCmsDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCmsDirty]);

  useEffect(() => {
    setCitySearchQuery("");
    setFeaturedCitySearchQuery("");
    setListingSearchQuery("");
  }, [selectedPageId]);

  useEffect(() => {
    if (!selectedPageId || !initialized) return;
    if (requestedPageId === selectedPageId) {
      if (pendingSelectedPageIdRef.current === selectedPageId) {
        pendingSelectedPageIdRef.current = null;
      }
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set("page", selectedPageId);
    setSearchParams(next, { replace: true });
  }, [initialized, requestedPageId, searchParams, selectedPageId, setSearchParams]);

  useEffect(() => {
    if (!initialized || selectedPageId === "home" || !requestedMode) return;
    const next = new URLSearchParams(searchParams);
    next.delete("mode");
    setSearchParams(next, { replace: true });
  }, [initialized, requestedMode, searchParams, selectedPageId, setSearchParams]);

  useEffect(() => {
    if (isLoading || initialized) return;

    const parsedPageConfigs = normalizeCmsPageConfigs(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
      {
        onIssue: (issue) => {
          const label =
            issue.kind === "unknown-block-id"
              ? `unknown block "${issue.blockId}" in page "${issue.pageId}"`
              : `unknown page "${issue.pageId}"`;
          console.warn(`[admin-page-builder] Ignoring ${label} from stored config payload.`);
        },
      },
    );
    const parsedGlobalText = normalizeStringMap(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    ) as CmsTextOverrideMap;
    const parsedTokens = normalizeStringMap(
      parseJson(settingMap[CMS_GLOBAL_SETTING_KEYS.designTokens], {}),
    ) as CmsDesignTokenMap;

    setPageConfigs(parsedPageConfigs);
    setGlobalTextRows(toRows(parsedGlobalText));
    setDesignTokenRows(toRows(parsedTokens));
    setCustomCss(settingMap[CMS_GLOBAL_SETTING_KEYS.customCss] ?? "");
    setInitialized(true);

    if (ENABLE_VISUAL_BLOCK_BUILDER) {
      const visualPageConfig = normalizePageConfig(
        selectedPageId === "golf" ? {} : parsedPageConfigs[selectedPageId] ?? {},
      );
      setVisualConfig(visualPageConfig);
    }
  }, [initialized, isLoading, settingMap, selectedPageId]);

  useEffect(() => {
    if (!initialized || !ENABLE_VISUAL_BLOCK_BUILDER || selectedPageId === "golf") return;
    setVisualConfig(normalizePageConfig(pageConfigs[selectedPageId] ?? {}));
  }, [initialized, pageConfigs, selectedPageId]);

  useEffect(() => {
    if (!initialized || !selectedPageId) return;

    let cancelled = false;

    const loadSelectedCmsConfig = async () => {
      setIsCmsDocumentLoading(true);
      try {
        const data = await fetchSelectedCmsConfig(selectedPageId);
        if (cancelled) return;
        applySelectedCmsConfigData(selectedPageId, data);
      } catch (error) {
        if (cancelled) return;
        toast.error(`Failed to load ${selectedPageId} page builder config: ${(error as Error).message}`);
      } finally {
        if (!cancelled) {
          setIsCmsDocumentLoading(false);
        }
      }
    };

    void loadSelectedCmsConfig();

    return () => {
      cancelled = true;
    };
  }, [initialized, locale, selectedPageId]);

  useEffect(() => {
    if (!initialized || !selectedPageId) return;

    let cancelled = false;
    setIsCmsHistoryLoading(true);

    fetchSelectedCmsHistory(selectedPageId)
      .then((versions) => {
        if (!cancelled) {
          setCmsVersionHistory(versions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCmsVersionHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCmsHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cmsLatestDraftVersion, cmsLatestPublishedVersion, initialized, locale, selectedPageId]);

  const selectedPageDefinition = useMemo(
    () => FUNCTIONAL_PAGE_DEFINITIONS.find((page) => page.id === selectedPageId) ?? FUNCTIONAL_PAGE_DEFINITIONS[0],
    [selectedPageId],
  );
  const selectedPageMeta = useMemo(
    () => getCmsPageRegistryMeta(selectedPageId),
    [selectedPageId],
  );
  const selectedPageCanEdit = isCmsPageEditableInFullBuilder(selectedPageId);
  const groupedPageDefinitions = useMemo(() => {
    return CMS_PAGE_GROUP_ORDER.map((group) => ({
      group,
      pages: FUNCTIONAL_PAGE_DEFINITIONS.filter((page) => getCmsPageRegistryMeta(page.id).group === group),
    })).filter((entry) => entry.pages.length > 0);
  }, []);
  const selectedPageLabelForCopy = selectedPageDefinition?.label ?? "selected";

  const selectedPageConfig = useMemo(() => {
    const baseConfig = pageConfigs[selectedPageId] ?? {};
    if (selectedPageId !== "golf" || !visualConfig) {
      return baseConfig;
    }

    const golfBlocksMap = (visualConfig.blocks ?? []).reduce<Record<string, CmsBlockConfig>>(
      (acc, block) => {
        const settings =
          block.settings && typeof block.settings === "object" && !Array.isArray(block.settings)
            ? (block.settings as Record<string, unknown>)
            : {};

        acc[block.id] = {
          enabled: block.enabled,
          order: block.order,
          className: typeof settings.className === "string" ? settings.className : undefined,
          data: settings as CmsBlockConfig["data"],
        };
        return acc;
      },
      {},
    );

    return {
      ...baseConfig,
      hero: (visualConfig.hero as Record<string, unknown>) ?? {},
      meta: visualConfig.meta,
      blocks: {
        ...((baseConfig.blocks as Record<string, CmsBlockConfig> | undefined) ?? {}),
        ...golfBlocksMap,
      },
      text: {
        ...((baseConfig.text as Record<string, string> | undefined) ?? {}),
        ...buildHeroTextMap(visualConfig.hero),
      },
    };
  }, [pageConfigs, selectedPageId, visualConfig]);
  const selectedPageTextMap = selectedPageConfig.text ?? {};
  const heroMediaSupported = HERO_MEDIA_SUPPORTED_PAGE_IDS.has(selectedPageId);
  const heroMediaType = selectedPageTextMap["hero.mediaType"] ?? "image";
  const heroImageUrl = selectedPageTextMap["hero.imageUrl"] ?? "";
  const heroVideoUrl = selectedPageTextMap["hero.videoUrl"] ?? "";
  const heroYoutubeUrl = selectedPageTextMap["hero.youtubeUrl"] ?? "";
  const heroPosterUrl = selectedPageTextMap["hero.posterUrl"] ?? "";
  const resolvedHeroMedia = useMemo(
    () => resolveHero(selectedPageConfig as Parameters<typeof resolveHero>[0]),
    [selectedPageConfig],
  );
  const resolvedHeroContent = useMemo(
    () => resolvePageContent(selectedPageConfig as Parameters<typeof resolvePageContent>[0]),
    [selectedPageConfig],
  );

  const GOLF_DEFAULT_BADGE = "Curated Golf";
  const GOLF_DEFAULT_TITLE = "Play Championship Golf in the Algarve";
  const GOLF_DEFAULT_SUBTITLE = "Discover elite golf listings, compare course specs, and plan your next round across Portugal's premier coast.";
  const GOLF_DEFAULT_ALT = "Golf fairways in the Algarve";
  const GOLF_DEFAULT_CTA_COURSES = "Browse Courses";
  const GOLF_DEFAULT_CTA_LEADERBOARD = "View Leaderboard";

  const selectedPageTextRows = useMemo(
    () => toRows(selectedPageConfig.text ?? {}),
    [selectedPageConfig.text],
  );
  const selectedVisibleFields = useMemo(() => {
    return PAGE_VISIBLE_FIELD_DEFINITIONS[selectedPageId] ?? HERO_VISIBLE_FIELDS;
  }, [selectedPageId]);
  const groupedVisibleFields = useMemo(() => {
    const groups = new Map<string, CmsVisibleFieldDefinition[]>();
    selectedVisibleFields.forEach((field) => {
      const current = groups.get(field.group) ?? [];
      current.push(field);
      groups.set(field.group, current);
    });
    return Array.from(groups.entries()).map(([group, fields]) => ({ group, fields }));
  }, [selectedVisibleFields]);
  const blockControlsDefinitions = useMemo<CmsBlockDefinition[]>(() => {
    if (!isGolfPage || !visualConfig) {
      return selectedPageDefinition?.blocks ?? [];
    }

    const mergedBlocks = [...(selectedPageDefinition?.blocks ?? [])];

    for (const block of visualConfig.blocks ?? []) {
      if (!mergedBlocks.some((item) => item.id === block.id)) {
        mergedBlocks.push({
          id: block.id,
          label: block.type,
        });
      }
    }

    return mergedBlocks;
  }, [isGolfPage, selectedPageDefinition, visualConfig]);

  useEffect(() => {
    if (
      selectedInspectorBlockId &&
      blockControlsDefinitions.some((block) => block.id === selectedInspectorBlockId)
    ) {
      return;
    }

    setSelectedInspectorBlockId(blockControlsDefinitions[0]?.id ?? null);
  }, [blockControlsDefinitions, selectedInspectorBlockId]);

  const filteredGroupedPageDefinitions = useMemo(() => {
    const query = pageSearchQuery.trim().toLowerCase();

    return groupedPageDefinitions
      .map(({ group, pages }) => ({
        group,
        pages: query
          ? pages.filter((page) =>
              [page.label, page.path, page.description ?? ""].some((value) =>
                value.toLowerCase().includes(query),
              ),
            )
          : pages,
      }))
      .filter(({ pages }) => pages.length > 0);
  }, [groupedPageDefinitions, pageSearchQuery]);

  const orderedCanvasBlocks = useMemo(() => {
    return [...blockControlsDefinitions].sort((a, b) => {
      const aOrder = selectedPageConfig.blocks?.[a.id]?.order;
      const bOrder = selectedPageConfig.blocks?.[b.id]?.order;

      if (typeof aOrder === "number" && typeof bOrder === "number") {
        return aOrder - bOrder;
      }
      if (typeof aOrder === "number") return -1;
      if (typeof bOrder === "number") return 1;

      return blockControlsDefinitions.indexOf(a) - blockControlsDefinitions.indexOf(b);
    });
  }, [blockControlsDefinitions, selectedPageConfig.blocks]);

  const selectedInspectorBlock = useMemo(
    () => blockControlsDefinitions.find((block) => block.id === selectedInspectorBlockId) ?? null,
    [blockControlsDefinitions, selectedInspectorBlockId],
  );
  const selectedInspectorBlockConfig = selectedInspectorBlock
    ? selectedPageConfig.blocks?.[selectedInspectorBlock.id] ?? {}
    : {};
  const selectedInspectorDefaultEnabled = selectedInspectorBlock?.id === "featured-city" ? false : true;
  const selectedInspectorEnabled = selectedInspectorBlock
    ? typeof selectedInspectorBlockConfig.enabled === "boolean"
      ? selectedInspectorBlockConfig.enabled
      : selectedInspectorDefaultEnabled
    : true;

  const enabledBlockCount = blockControlsDefinitions.filter((block) => {
    const config = selectedPageConfig.blocks?.[block.id] ?? {};
    const fallback = block.id === "featured-city" ? false : true;
    return typeof config.enabled === "boolean" ? config.enabled : fallback;
  }).length;
  const customVisibleFieldCount = selectedVisibleFields.filter((field) =>
    Object.prototype.hasOwnProperty.call(selectedPageTextMap, field.key),
  ).length;
  const inheritedVisibleFieldCount = Math.max(selectedVisibleFields.length - customVisibleFieldCount, 0);

  const workspaceStatus = isCmsPublishing
    ? { label: "Publishing", className: "border-amber-500/40 bg-amber-50 text-amber-700" }
    : isCmsPreviewing
      ? { label: "Preparing preview", className: "border-blue-500/40 bg-blue-50 text-blue-700" }
      : isCmsSavingDraft || isSaving
      ? { label: "Saving", className: "border-blue-500/40 bg-blue-50 text-blue-700" }
      : isCmsDocumentLoading
        ? { label: "Loading", className: "border-slate-300 bg-slate-50 text-slate-600" }
        : isCmsDirty
          ? { label: "Unsaved changes", className: "border-amber-500/40 bg-amber-50 text-amber-700" }
        : selectedPageCanEdit
          ? { label: "Ready", className: "border-emerald-500/40 bg-emerald-50 text-emerald-700" }
          : { label: "Read only", className: "border-slate-300 bg-slate-100 text-slate-500" };

  const validationReport = useMemo(
    () =>
      validateCmsPageBuilderDraft({
        pageId: selectedPageId,
        locale,
        pageDefinition: selectedPageDefinition,
        pageConfig: selectedPageConfig,
        cityIds: cities.map((city) => city.id),
        categoryIds: categories.map((category) => category.id),
        listingIds: listingOptions.map((listing) => listing.id),
      }),
    [categories, cities, listingOptions, locale, selectedPageConfig, selectedPageDefinition, selectedPageId],
  );
  const validationErrors = validationReport.errors;
  const validationWarnings = validationReport.warnings;

  const blockLibraryGroups = useMemo(() => {
    const labels: Record<string, string> = {
      hero: "Core",
      discovery: "Discovery",
      content: "Content",
      utility: "Utility",
      uncategorized: "Other",
    };
    const groups = new Map<string, CmsBlockDefinition[]>();

    blockControlsDefinitions.forEach((block) => {
      const groupKey = block.category ?? "uncategorized";
      const group = labels[groupKey] ?? labels.uncategorized;
      groups.set(group, [...(groups.get(group) ?? []), block]);
    });

    return Array.from(groups.entries()).map(([group, blocks]) => ({ group, blocks }));
  }, [blockControlsDefinitions]);

  const handlePageSelection = (nextPageId: string) => {
    if (nextPageId === selectedPageId) return;
    if (!FUNCTIONAL_PAGE_DEFINITIONS.some((page) => page.id === nextPageId)) return;
    if (
      isCmsDirty &&
      !window.confirm(`Discard unsaved changes to ${selectedPageDefinition?.label ?? "this page"} before switching pages?`)
    ) {
      return;
    }

    pendingSelectedPageIdRef.current = nextPageId;
    setSelectedPageId(nextPageId);
    setSelectedInspectorBlockId(null);

    const next = new URLSearchParams(searchParams);
    next.set("page", nextPageId);
    if (nextPageId !== "home") {
      next.delete("mode");
    }
    setSearchParams(next, { replace: true });
  };

  const handleLocaleChange = (nextLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale as Locale)) return;
    if (
      isCmsDirty &&
      !window.confirm(`Discard unsaved changes to ${selectedPageDefinition?.label ?? "this page"} before switching locale?`)
    ) {
      return;
    }

    const nextPath = addLocaleToPathname(stripLocaleFromPathname(pathname), nextLocale as Locale);
    const query = searchParams.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  const updateBlockConfig = (blockId: string, updater: (current: CmsBlockConfig) => CmsBlockConfig) => {
    setIsCmsDirty(true);
    const currentBlockSnapshot = ((selectedPageConfig.blocks?.[blockId] as CmsBlockConfig | undefined) ?? {});
    const nextBlockConfig = updater(currentBlockSnapshot);

    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      const currentBlocks = currentPage.blocks ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          blocks: {
            ...currentBlocks,
            [blockId]: nextBlockConfig,
          },
        },
      };
    });

    if (selectedPageId === "golf") {
      setVisualConfig((prev) => {
        if (!prev) return prev;

        const blocks = [...(prev.blocks ?? [])];
        const blockIndex = blocks.findIndex((block) => block.id === blockId);
        const existingBlock = blockIndex >= 0 ? blocks[blockIndex] : null;

        const inferredType =
          existingBlock?.type ??
          (isSupportedBlockType(blockId)
            ? blockId
            : blockId === "leaderboard"
              ? "golf-leaderboard"
              : blockId === "featured-courses"
                ? "courses-grid"
                : blockId);

        const baseSettings =
          existingBlock?.settings && typeof existingBlock.settings === "object" && !Array.isArray(existingBlock.settings)
            ? { ...(existingBlock.settings as Record<string, unknown>) }
            : isSupportedBlockType(inferredType)
              ? { ...getDefaultBlockSettings(inferredType) }
              : {};

        if (typeof nextBlockConfig.className === "string") {
          baseSettings.className = nextBlockConfig.className;
        }
        if (nextBlockConfig.data && typeof nextBlockConfig.data === "object") {
          Object.assign(baseSettings, nextBlockConfig.data as Record<string, unknown>);
        }

        const nextBlock = {
          id: blockId,
          type: inferredType,
          enabled: typeof nextBlockConfig.enabled === "boolean"
            ? nextBlockConfig.enabled
            : existingBlock?.enabled ?? true,
          order: typeof nextBlockConfig.order === "number"
            ? nextBlockConfig.order
            : existingBlock?.order ?? (blocks.length + 1) * 10,
          settings: baseSettings,
        };

        if (blockIndex >= 0) {
          blocks[blockIndex] = nextBlock;
        } else {
          blocks.push(nextBlock);
        }

        return normalizePageConfig({
          ...prev,
          blocks,
        });
      });
    }
  };

  const moveCanvasBlock = (blockId: string, direction: "up" | "down") => {
    const orderedIds = orderedCanvasBlocks.map((block) => block.id);
    const index = orderedIds.indexOf(blockId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= orderedIds.length) return;

    const nextIds = [...orderedIds];
    [nextIds[index], nextIds[targetIndex]] = [nextIds[targetIndex], nextIds[index]];

    nextIds.forEach((id, nextIndex) => {
      updateBlockConfig(id, (current) => ({
        ...current,
        order: (nextIndex + 1) * 10,
      }));
    });
    setSelectedInspectorBlockId(blockId);
  };

  const hideCanvasBlock = (blockId: string) => {
    updateBlockConfig(blockId, (current) => ({ ...current, enabled: false }));
    setSelectedInspectorBlockId(blockId);
    toast.success("Section hidden. It can be restored from the block library.");
  };

  const restoreCanvasBlock = (blockId: string) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      enabled: true,
      order: typeof current.order === "number" ? current.order : (orderedCanvasBlocks.length + 1) * 10,
    }));
    setSelectedInspectorBlockId(blockId);
    toast.success("Section restored.");
  };

  const getCitiesBlockMode = (config: CmsBlockConfig) =>
    normalizeCityBlockMode(config.data?.mode);

  const getCitiesBlockSelectedIds = (config: CmsBlockConfig) =>
    normalizeSelectedCityIds(config.data?.selectedCityIds);

  const setCitiesBlockMode = (blockId: string, mode: "all" | "curated") => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        mode,
      },
    }));
  };

  const setCitiesBlockSelectedIds = (blockId: string, ids: string[]) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        selectedCityIds: ids,
      },
    }));
  };

  const getBlockSelection = (config: CmsBlockConfig) =>
    normalizePlacementSelection(config.data?.selection);

  const setBlockSelection = (
    blockId: string,
    selection: "manual" | "tier-driven" | "hybrid",
  ) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        selection,
      },
    }));
  };

  const getListingBlockSelectedIds = (config: CmsBlockConfig) =>
    normalizeSelectedListingIds(config.data?.selectedListingIds);

  const setListingBlockSelectedIds = (blockId: string, ids: string[]) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        selectedListingIds: ids,
      },
    }));
  };

  const setListingBlockFilter = (
    blockId: string,
    key: "cityId" | "categoryId" | "listingId",
    value: string | null,
  ) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        [key]: value ?? "",
      },
    }));
  };

  const setListingBlockMaxItems = (blockId: string, value: number | undefined) => {
    updateBlockConfig(blockId, (current) => {
      const nextData = { ...(current.data ?? {}) };
      if (typeof value === "number") {
        nextData.maxItems = value;
      } else {
        delete nextData.maxItems;
      }
      return {
        ...current,
        data: nextData,
      };
    });
  };

  const setBlockSettingValue = (blockId: string, key: string, value: unknown) => {
    updateBlockConfig(blockId, (current) => ({
      ...current,
      data: {
        ...(current.data ?? {}),
        [key]: value,
      },
    }));
  };

  const getGolfDiscoveryCards = (config: CmsBlockConfig) => {
    const existingCards = Array.isArray(config.data?.cards)
      ? config.data.cards.filter(isRecord)
      : [];

    return GOLF_DISCOVERY_CARDS.map((card) => {
      const existing = existingCards.find((item) => item.tag === card.tag) ?? {};
      const defaults = GOLF_DISCOVERY_CARD_DEFAULTS[card.tag];
      return {
        tag: card.tag,
        label: card.label,
        enabled: typeof existing.enabled === "boolean" ? existing.enabled : true,
        title: typeof existing.title === "string" ? existing.title : defaults.title,
        description: typeof existing.description === "string" ? existing.description : defaults.description,
        imageUrl: typeof existing.imageUrl === "string" ? existing.imageUrl : "",
        previewImageUrl: typeof existing.imageUrl === "string" ? getSafeCmsImageSrc(existing.imageUrl) ?? "" : "",
        href: typeof existing.href === "string" ? existing.href : "",
      };
    });
  };

  const setGolfDiscoveryCardValue = (
    blockId: string,
    tag: (typeof GOLF_DISCOVERY_CARDS)[number]["tag"],
    key: "enabled" | "title" | "description" | "imageUrl" | "href",
    value: string | boolean,
  ) => {
    updateBlockConfig(blockId, (current) => {
      const cards = getGolfDiscoveryCards(current).map((card) =>
        card.tag === tag ? { ...card, [key]: value } : card,
      );

      return {
        ...current,
        data: {
          ...(current.data ?? {}),
          cards,
        },
      };
    });
  };

  const setPageMeta = (field: "title" | "description", value: string) => {
    setIsCmsDirty(true);
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          meta: {
            ...(currentPage.meta ?? {}),
            [field]: value,
          },
        },
      };
    });

    if (selectedPageId === "golf") {
      setVisualConfig((prev) => {
        if (!prev) return prev;
        return normalizePageConfig({
          ...prev,
          meta: {
            ...(prev.meta ?? {}),
            [field]: value,
          },
        });
      });
    }
  };

  const setPageTextRows = (rows: KeyValueRow[]) => {
    setIsCmsDirty(true);
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          text: fromRows(rows),
        },
      };
    });
  };

  const setPageTextValue = (textKey: string, value: string) => {
    setIsCmsDirty(true);
    const isGolfHeroMediaField =
      selectedPageId === "golf" &&
      (textKey === "hero.imageUrl" ||
        textKey === "hero.videoUrl" ||
        textKey === "hero.youtubeUrl" ||
        textKey === "hero.posterUrl");
    const isMediaTypeField = textKey === "hero.mediaType";
    const normalizedInput = isMediaTypeField ? value.trim().toLowerCase() : value;

    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      const nextText = { ...(currentPage.text ?? {}) };
      const trimmed = normalizedInput.trim();

      if (trimmed) {
        nextText[textKey] = normalizedInput;
      } else if (isGolfHeroMediaField) {
        // Keep explicit empty strings for golf hero media so draft merges can clear prior values.
        nextText[textKey] = "";
      } else {
        delete nextText[textKey];
      }

      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          text: nextText,
        },
      };
    });

    if (selectedPageId !== "golf" || !textKey.startsWith("hero.")) {
      return;
    }

    setVisualConfig((prev) => {
      if (!prev) return prev;

      const nextHero = {
        ...(prev.hero ?? {}),
      } as Record<string, unknown>;

      const nextValue = normalizedInput.trim() ? normalizedInput : undefined;
      switch (textKey) {
        case "hero.mediaType":
          nextHero.mediaType = nextValue ?? "image";
          break;
        case "hero.imageUrl":
          nextHero.imageUrl = nextValue ?? "";
          break;
        case "hero.videoUrl":
          nextHero.videoUrl = nextValue ?? "";
          break;
        case "hero.youtubeUrl":
          nextHero.youtubeUrl = nextValue ?? "";
          break;
        case "hero.posterUrl":
          nextHero.posterUrl = nextValue ?? "";
          break;
        case "hero.alt":
          nextHero.alt = nextValue;
          break;
        case "hero.badge":
          nextHero.badge = nextValue;
          break;
        case "hero.title":
          nextHero.title = nextValue;
          break;
        case "hero.subtitle":
          nextHero.subtitle = nextValue;
          break;
        case "hero.cta.primary":
          nextHero.ctaPrimary = nextValue;
          break;
        case "hero.cta.secondary":
          nextHero.ctaSecondary = nextValue;
          break;
        default:
          break;
      }

      return normalizePageConfig({
        ...prev,
        hero: nextHero,
      });
    });
  };

  const resetHeroMedia = () => {
    const clearedHeroMedia = {
      mediaType: "image" as const,
      imageUrl: "",
      videoUrl: "",
      youtubeUrl: "",
      posterUrl: "",
    };

    setIsCmsDirty(true);

    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      const nextText = { ...(currentPage.text ?? {}) };

      nextText["hero.mediaType"] = clearedHeroMedia.mediaType;
      nextText["hero.imageUrl"] = clearedHeroMedia.imageUrl;
      nextText["hero.videoUrl"] = clearedHeroMedia.videoUrl;
      nextText["hero.youtubeUrl"] = clearedHeroMedia.youtubeUrl;
      nextText["hero.posterUrl"] = clearedHeroMedia.posterUrl;

      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          hero: {
            ...((currentPage.hero as Record<string, unknown> | undefined) ?? {}),
            ...clearedHeroMedia,
          },
          text: nextText,
        },
      };
    });

    setVisualConfig((prev) => {
      if (!prev) return prev;
      return normalizePageConfig({
        ...prev,
        hero: {
          ...(prev.hero ?? {}),
          ...clearedHeroMedia,
        },
      });
    });

    toast.success("Hero media reset.");
  };

  const handleHeroMediaUpload = async (
    file: File,
    target: "image" | "video" | "poster",
  ) => {
    try {
      setHeroUploadTarget(target);

      let uploadFile = file;
      let extension = file.name.split(".").pop()?.toLowerCase() || (target === "video" ? "mp4" : "webp");

      if (target !== "video" && file.type.startsWith("image/") && file.type !== "image/webp") {
        uploadFile = await convertToWebP(file, 0.88);
        extension = "webp";
      }

      const filePath = `page-heroes/${selectedPageId}/${target}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, uploadFile, {
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath);

      if (target === "image") {
        setPageTextValue("hero.imageUrl", publicUrl);
        setPageTextValue("hero.mediaType", "image");
      } else if (target === "video") {
        setPageTextValue("hero.videoUrl", publicUrl);
        setPageTextValue("hero.mediaType", "video");
      } else {
        setPageTextValue("hero.posterUrl", publicUrl);
        setPageTextValue("hero.mediaType", "poster");
        if (!heroImageUrl) {
          setPageTextValue("hero.imageUrl", publicUrl);
        }
      }

      toast.success(`Hero ${target} uploaded`);
    } catch (error) {
      toast.error(`Failed to upload hero ${target}: ${(error as Error).message}`);
    } finally {
      setHeroUploadTarget(null);
    }
  };

  const addPageTextRow = () => {
    setPageTextRows([
      ...selectedPageTextRows,
      {
        id: `new-${Date.now()}`,
        key: "",
        value: "",
      },
    ]);
  };

  const updatePageTextRow = (id: string, field: "key" | "value", value: string) => {
    setPageTextRows(
      selectedPageTextRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removePageTextRow = (id: string) => {
    setPageTextRows(selectedPageTextRows.filter((row) => row.id !== id));
  };

  const addGlobalTextRow = () => {
    setGlobalTextRows((prev) => [...prev, { id: `new-${Date.now()}`, key: "", value: "" }]);
  };

  const updateGlobalTextRow = (id: string, field: "key" | "value", value: string) => {
    setGlobalTextRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeGlobalTextRow = (id: string) => {
    setGlobalTextRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addDesignTokenRow = () => {
    setDesignTokenRows((prev) => [...prev, { id: `new-${Date.now()}`, key: "", value: "" }]);
  };

  const updateDesignTokenRow = (id: string, field: "key" | "value", value: string) => {
    setDesignTokenRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeDesignTokenRow = (id: string) => {
    setDesignTokenRows((prev) => prev.filter((row) => row.id !== id));
  };

  const buildSelectedDraftPayload = (): CmsPageConfig | Record<string, unknown> | null => {
    if (selectedPageId === "golf" && visualConfig) {
      const normalizedGolfConfig = normalizePageConfig({
        hero: visualConfig.hero ?? {},
        blocks: visualConfig.blocks ?? [],
        meta: visualConfig.meta ?? {},
      });
      const text = selectedPageConfig.text ?? {};

      return normalizeCmsImageFieldsInValue({
        ...normalizedGolfConfig,
        ...(Object.keys(text).length > 0 ? { text } : {}),
      });
    }

    const current = selectedPageConfig;
    if (!current || Object.keys(current).length === 0) {
      return normalizeCmsImageFieldsInValue(visualConfig ? normalizePageConfig(visualConfig) : {});
    }

    return normalizeCmsImageFieldsInValue(current as Record<string, unknown>);
  };

  const handleSaveDraft = async () => {
    if (!selectedPageCanEdit) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} is ${CMS_PAGE_STATUS_LABEL[selectedPageMeta.status].toLowerCase()} in Full Page Builder.`);
      return;
    }

    const draftPayload = buildSelectedDraftPayload();
    if (!draftPayload) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} page config is not loaded yet.`);
      return;
    }

    if (validationErrors.length > 0) {
      toast.error(`Fix ${validationErrors.length} validation ${validationErrors.length === 1 ? "error" : "errors"} before saving this draft.`);
      return;
    }

    setIsCmsSavingDraft(true);
    try {
      const data = await saveSelectedDraft(selectedPageId, draftPayload);
      const normalizedContent = normalizePageConfig(data.content ?? draftPayload);
      setCmsDocumentId(data.document_id);
      setCmsLatestDraftVersion(data.latest_draft_version);
      setCmsLatestPublishedVersion(data.latest_published_version);
      setVisualConfig(normalizedContent);
      setIsCmsDirty(false);
      fetchSelectedCmsHistory(selectedPageId).then(setCmsVersionHistory).catch(() => undefined);
      toast.success(`${selectedPageDefinition?.label ?? "Page"} draft saved.`);
    } catch (error) {
      toast.error(`Failed to save ${selectedPageDefinition?.label ?? "page"} draft: ${(error as Error).message}`);
    } finally {
      setIsCmsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedPageCanEdit) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} is ${CMS_PAGE_STATUS_LABEL[selectedPageMeta.status].toLowerCase()} in Full Page Builder.`);
      return;
    }

    const draftPayload = buildSelectedDraftPayload();
    if (!draftPayload) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} page config is not loaded yet.`);
      return;
    }

    if (validationErrors.length > 0) {
      toast.error(`Fix ${validationErrors.length} validation ${validationErrors.length === 1 ? "error" : "errors"} before publishing.`);
      return;
    }

    const confirmed = window.confirm(
      `Publish ${selectedPageDefinition?.label ?? "this page"} for ${locale}? This will replace the current published page with the validated draft.`,
    );
    if (!confirmed) return;

    setIsCmsPublishing(true);
    try {
      const draftData = await saveSelectedDraft(selectedPageId, draftPayload);
      setCmsDocumentId(draftData.document_id);
      setCmsLatestDraftVersion(draftData.latest_draft_version);
      setCmsLatestPublishedVersion(draftData.latest_published_version);

      const data = await publishSelectedPage(selectedPageId);
      const normalizedContent = normalizePageConfig(data.content ?? {});
      setCmsDocumentId(data.document_id);
      setCmsLatestDraftVersion(data.latest_draft_version);
      setCmsLatestPublishedVersion(data.latest_published_version);
      setVisualConfig(normalizedContent);
      setIsCmsDirty(false);
      fetchSelectedCmsHistory(selectedPageId).then(setCmsVersionHistory).catch(() => undefined);
      toast.success(`${selectedPageDefinition?.label ?? "Page"} published.`);
    } catch (error) {
      toast.error(`Failed to publish ${selectedPageDefinition?.label ?? "page"}: ${(error as Error).message}`);
    } finally {
      setIsCmsPublishing(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedPageCanEdit) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} is ${CMS_PAGE_STATUS_LABEL[selectedPageMeta.status].toLowerCase()} in Full Page Builder.`);
      return;
    }

    const draftPayload = buildSelectedDraftPayload();
    if (!draftPayload) {
      toast.error(`${selectedPageDefinition?.label ?? "Selected"} page config is not loaded yet.`);
      return;
    }

    if (validationErrors.length > 0) {
      toast.error(`Fix ${validationErrors.length} validation ${validationErrors.length === 1 ? "error" : "errors"} before previewing.`);
      return;
    }

    setIsCmsPreviewing(true);
    try {
      const data = await saveSelectedDraft(selectedPageId, draftPayload);
      const normalizedContent = normalizePageConfig(data.content ?? draftPayload);
      setCmsDocumentId(data.document_id);
      setCmsLatestDraftVersion(data.latest_draft_version);
      setCmsLatestPublishedVersion(data.latest_published_version);
      setVisualConfig(normalizedContent);
      setIsCmsDirty(false);
      fetchSelectedCmsHistory(selectedPageId).then(setCmsVersionHistory).catch(() => undefined);
      await openSelectedPreview(resolvePreviewPath(selectedPageDefinition?.path ?? "/"));
      toast.success(`${selectedPageDefinition?.label ?? "Page"} draft preview opened.`);
    } catch (error) {
      toast.error(`Failed to open ${selectedPageDefinition?.label ?? "page"} preview: ${(error as Error).message}`);
    } finally {
      setIsCmsPreviewing(false);
    }
  };

  const handleDiscardDraftChanges = async () => {
    if (!isCmsDirty) {
      toast.info("There are no unsaved page edits to discard.");
      return;
    }

    if (!window.confirm(`Discard unsaved changes to ${selectedPageDefinition?.label ?? "this page"}?`)) {
      return;
    }

    setIsCmsDocumentLoading(true);
    try {
      const data = await fetchSelectedCmsConfig(selectedPageId);
      applySelectedCmsConfigData(selectedPageId, data);
      toast.success("Unsaved page edits discarded.");
    } catch (error) {
      toast.error(`Failed to reload ${selectedPageDefinition?.label ?? "page"} draft: ${(error as Error).message}`);
    } finally {
      setIsCmsDocumentLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      if (validationErrors.length > 0) {
        toast.error(`Fix ${validationErrors.length} validation ${validationErrors.length === 1 ? "error" : "errors"} before syncing runtime settings.`);
        return;
      }

      const enrichedConfigs: CmsPageConfigMap = { ...pageConfigs };

      for (const pageId of Object.keys(enrichedConfigs)) {
        const pageConfig = enrichedConfigs[pageId] ?? {};
        const textMap = pageConfig.text ?? {};
        const heroMediaSupported = HERO_MEDIA_SUPPORTED_PAGE_IDS.has(pageId);

        const hasHeroMediaKey = [
          "hero.mediaType",
          "hero.imageUrl",
          "hero.videoUrl",
          "hero.youtubeUrl",
          "hero.posterUrl",
          "hero.alt",
        ].some((key) => Object.prototype.hasOwnProperty.call(textMap, key));

        if (heroMediaSupported && hasHeroMediaKey) {
          const heroData: Record<string, unknown> = {
            enabled: true,
            mediaType: textMap["hero.mediaType"] || "image",
          };

          if (Object.prototype.hasOwnProperty.call(textMap, "hero.imageUrl")) {
            heroData.imageUrl = textMap["hero.imageUrl"];
          }
          if (Object.prototype.hasOwnProperty.call(textMap, "hero.videoUrl")) {
            heroData.videoUrl = textMap["hero.videoUrl"];
          }
          if (Object.prototype.hasOwnProperty.call(textMap, "hero.youtubeUrl")) {
            heroData.youtubeUrl = textMap["hero.youtubeUrl"];
          }
          if (Object.prototype.hasOwnProperty.call(textMap, "hero.posterUrl")) {
            heroData.posterUrl = textMap["hero.posterUrl"];
          }
          if (Object.prototype.hasOwnProperty.call(textMap, "hero.alt")) {
            heroData.alt = textMap["hero.alt"];
          }

          enrichedConfigs[pageId] = {
            ...pageConfig,
            hero: heroData,
          };
        }
      }

      const normalizedEnrichedConfigs = normalizeCmsImageFieldsInValue(enrichedConfigs);

      const payload = [
        {
          key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
          value: JSON.stringify(normalizedEnrichedConfigs, null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.textOverrides,
          value: JSON.stringify(fromRows(globalTextRows), null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.designTokens,
          value: JSON.stringify(fromRows(designTokenRows), null, 2),
          category: "cms",
        },
        {
          key: CMS_GLOBAL_SETTING_KEYS.customCss,
          value: customCss,
          category: "cms",
        },
      ];

      await saveSettingsAsync(payload);
      toast.success("Page builder settings saved");
    } catch (error) {
      toast.error(`Failed to save page builder settings: ${(error as Error).message}`);
    }
  };

  if (isLoading && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 rounded-lg border border-border bg-background/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <DashboardBreadcrumb />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-serif font-medium text-foreground">Full Page Builder</h1>
              <Badge variant="outline" className={workspaceStatus.className}>
                {workspaceStatus.label}
              </Badge>
              <Badge
                variant="outline"
                className={
                  validationErrors.length > 0
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : validationWarnings.length > 0
                      ? "border-amber-500/40 bg-amber-50 text-amber-700"
                      : "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                }
              >
                {validationErrors.length > 0
                  ? `${validationErrors.length} validation ${validationErrors.length === 1 ? "error" : "errors"}`
                  : validationWarnings.length > 0
                    ? `${validationWarnings.length} warning${validationWarnings.length === 1 ? "" : "s"}`
                    : "Validated"}
              </Badge>
              <Badge variant="outline">
                {LOCALE_CONFIGS[locale as Locale]?.shortName ?? locale.toUpperCase()}
              </Badge>
              {isCmsDirty ? (
                <Badge variant="outline" className="border-amber-500/40 bg-amber-50 text-amber-700">
                  Unsaved changes
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedPageDefinition?.label} · {selectedPageDefinition?.path} · Draft v{cmsLatestDraftVersion ?? "-"} · Published v{cmsLatestPublishedVersion ?? "-"}
            </p>
            {isHomePage ? (
              <div className="mt-3 grid w-full max-w-[22rem] grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/40 p-1 sm:w-fit sm:max-w-none sm:rounded-full">
                <Button
                  type="button"
                  variant={isHomeEditorMode ? "default" : "ghost"}
                  size="sm"
                  className="h-9 min-w-0 justify-center rounded-xl px-2 text-xs sm:h-8 sm:rounded-full sm:px-3 sm:text-sm"
                  onClick={() => setHomeWorkspaceMode("home-editor")}
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  <span className="truncate">Home Page Editor</span>
                </Button>
                <Button
                  type="button"
                  variant={!isHomeEditorMode ? "default" : "ghost"}
                  size="sm"
                  className="h-9 min-w-0 justify-center rounded-xl px-2 text-xs sm:h-8 sm:rounded-full sm:px-3 sm:text-sm"
                  onClick={() => setHomeWorkspaceMode("builder")}
                >
                  <Layers className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  <span className="truncate">Builder Blocks</span>
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isHomeEditorMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(resolvePreviewPath("/"), "_blank", "noopener,noreferrer")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Open Public Home
                </Button>
                <Button type="button" variant="outline" onClick={() => setHomeWorkspaceMode("builder")}>
                  <Layers className="h-4 w-4 mr-2" />
                  Edit Builder Blocks
                </Button>
              </>
            ) : (
              <>
                <div className="flex rounded-md border border-border bg-muted/40 p-1">
                  {(["desktop", "tablet", "mobile"] as const).map((mode) => {
                    const Icon = mode === "desktop" ? Monitor : mode === "tablet" ? Tablet : Smartphone;
                    return (
                      <Button
                        key={mode}
                        type="button"
                        variant={previewMode === mode ? "default" : "ghost"}
                        size="sm"
                        className="h-8 gap-1 px-2"
                        onClick={() => setPreviewMode(mode)}
                        aria-label={`${mode} preview`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline capitalize">{mode}</span>
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isCmsDocumentLoading || isCmsSavingDraft || isCmsPublishing || isCmsPreviewing || !selectedPageCanEdit || validationErrors.length > 0}
                >
                  {isCmsPreviewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Preview Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isCmsDocumentLoading || isCmsSavingDraft || isCmsPublishing || isCmsPreviewing || !selectedPageCanEdit || validationErrors.length > 0}
                >
                  {isCmsSavingDraft ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDiscardDraftChanges}
                  disabled={!isCmsDirty || isCmsDocumentLoading || isCmsSavingDraft || isCmsPublishing || isCmsPreviewing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isCmsDocumentLoading || isCmsSavingDraft || isCmsPublishing || isCmsPreviewing || !selectedPageCanEdit || validationErrors.length > 0}
                >
                  {isCmsPublishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
                <Button onClick={handleSaveAll} disabled={isSaving || isCmsSavingDraft || isCmsPublishing || isCmsPreviewing || validationErrors.length > 0} variant="ghost">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Sync Runtime
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <aside className="space-y-4 2xl:sticky 2xl:top-28 2xl:max-h-[calc(100vh-8rem)] 2xl:overflow-y-auto">
          <Card className="border-border bg-card/70">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Pages</CardTitle>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={pageSearchQuery}
                  onChange={(event) => setPageSearchQuery(event.target.value)}
                  className="bg-background pl-9"
                  placeholder="Search pages"
                />
              </div>
              <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="bg-background">
                  <Globe2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Locale" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((localeOption) => (
                    <SelectItem key={localeOption} value={localeOption}>
                      {LOCALE_CONFIGS[localeOption].shortName} · {LOCALE_CONFIGS[localeOption].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2 rounded-md border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Locale Editing</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Editing {LOCALE_CONFIGS[locale as Locale]?.name ?? locale}. Saves and publishes stay scoped to this URL locale.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-50 px-2 py-2 text-emerald-700">
                    <p className="font-semibold">{customVisibleFieldCount}/{selectedVisibleFields.length}</p>
                    <p>Translated</p>
                  </div>
                  <div className="rounded-md border border-amber-500/30 bg-amber-50 px-2 py-2 text-amber-700">
                    <p className="font-semibold">{inheritedVisibleFieldCount}</p>
                    <p>Inherited</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-md border border-border bg-background px-2 py-2">
                  <p className="font-semibold text-foreground">{FUNCTIONAL_PAGE_DEFINITIONS.length}</p>
                  <p className="text-muted-foreground">Live</p>
                </div>
                <div className="rounded-md border border-border bg-background px-2 py-2">
                  <p className="font-semibold text-foreground">0</p>
                  <p className="text-muted-foreground">Review</p>
                </div>
                <div className="rounded-md border border-border bg-background px-2 py-2">
                  <p className="font-semibold text-foreground">{cmsLatestDraftVersion ? 1 : 0}</p>
                  <p className="text-muted-foreground">Draft</p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredGroupedPageDefinitions.map(({ group, pages }) => (
                  <div key={group} className="space-y-2">
                    <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{group}</p>
                    <div className="space-y-1">
                      {pages.map((page) => {
                        const isSelected = page.id === selectedPageId;
                        const pageMeta = getCmsPageRegistryMeta(page.id);
                        return (
                          <button
                            key={page.id}
                            type="button"
                            onClick={() => handlePageSelection(page.id)}
                            className={[
                              "w-full rounded-md border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                              isSelected
                                ? "border-primary/50 bg-primary/10"
                                : "border-transparent hover:border-border hover:bg-muted/50",
                            ].join(" ")}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium text-foreground">{page.label}</span>
                              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                {CMS_PAGE_STATUS_LABEL[pageMeta.status]}
                              </span>
                            </span>
                            <span className="mt-1 block truncate text-xs text-muted-foreground">{page.path}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredGroupedPageDefinitions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
                    No matching pages.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>

        {isHomeEditorMode ? (
          <section className="min-w-0 space-y-4 2xl:col-span-2">
            <Card className="border-border bg-card/70">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Home Page Editor</CardTitle>
                    </div>
                    <CardDescription>
                      Hero media, headline copy, CTA buttons, section ordering, and homepage quick-link card media now live inside the Full Page Builder.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-emerald-700">
                      Runtime connected
                    </Badge>
                    <Button type="button" variant="outline" size="sm" onClick={() => setHomeWorkspaceMode("builder")}>
                      <Layers className="h-4 w-4 mr-2" />
                      Builder Blocks
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <AdminHomePage embedded />
          </section>
        ) : (
          <>
        <section className="space-y-4">
          <Card className="border-border bg-card/70">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{selectedPageDefinition?.label} Canvas</CardTitle>
                  </div>
                  <CardDescription>
                    {selectedPageDefinition?.description ?? selectedPageMeta.notes ?? "Manage this page structure."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={CMS_PAGE_STATUS_BADGE_CLASS[selectedPageMeta.status]}>
                    {CMS_PAGE_STATUS_LABEL[selectedPageMeta.status]}
                  </Badge>
                  <Badge variant="outline">{enabledBlockCount}/{blockControlsDefinitions.length} visible</Badge>
                  {selectedPageDefinition?.path ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resolvePreviewPath(selectedPageDefinition.path), "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderedCanvasBlocks.map((block, index) => {
                const config = selectedPageConfig.blocks?.[block.id] ?? {};
                const defaultEnabled = block.id === "featured-city" ? false : true;
                const isEnabled = typeof config.enabled === "boolean" ? config.enabled : defaultEnabled;
                const isSelected = selectedInspectorBlockId === block.id;
                const orderValue = typeof config.order === "number" ? config.order : (index + 1) * 10;

                return (
                  <div
                    key={block.id}
                    aria-label={`${block.label} section`}
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => setSelectedInspectorBlockId(block.id)}
                    className={[
                      "w-full cursor-pointer rounded-lg border bg-background p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isSelected ? "border-primary/60 shadow-sm" : "border-border hover:border-primary/30",
                      !isEnabled ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-[10rem] flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{block.label}</p>
                        <p className="truncate text-xs text-muted-foreground">ID: {block.id} · order {orderValue}</p>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant={isSelected ? "outline" : "ghost"}
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Inspect ${block.label}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedInspectorBlockId(block.id);
                          }}
                        >
                          <PanelRight className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          aria-label={`Move ${block.label} up`}
                          onClick={(event) => {
                            event.stopPropagation();
                            moveCanvasBlock(block.id, "up");
                          }}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === orderedCanvasBlocks.length - 1}
                          aria-label={`Move ${block.label} down`}
                          onClick={(event) => {
                            event.stopPropagation();
                            moveCanvasBlock(block.id, "down");
                          }}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-700"
                          disabled={!isEnabled}
                          aria-label={`Hide ${block.label}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            hideCanvasBlock(block.id);
                          }}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          updateBlockConfig(block.id, (current) => ({ ...current, enabled: checked }))
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>
                  </div>
                );
              })}
              {orderedCanvasBlocks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                  <Library className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No editable sections registered.</p>
                  <p className="text-sm text-muted-foreground">This page can still keep its dedicated admin editor.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/70">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Library className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Block Library</CardTitle>
                  </div>
                  <CardDescription>Add or restore known registry sections only. Unknown block types stay blocked.</CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  Registry only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
              {blockLibraryGroups.map(({ group, blocks }) => (
                <div key={group} className="min-w-0 space-y-3 rounded-md border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{group}</p>
                    <p className="text-xs text-muted-foreground">{blocks.length} registered sections</p>
                  </div>
                  <div className="space-y-2">
                    {blocks.map((block) => {
                      const config = selectedPageConfig.blocks?.[block.id] ?? {};
                      const defaultEnabled = block.id === "featured-city" ? false : true;
                      const isEnabled = typeof config.enabled === "boolean" ? config.enabled : defaultEnabled;

                      return (
                        <div
                          key={block.id}
                          className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/70 px-2 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{block.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{block.id}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={isEnabled ? "ghost" : "outline"}
                            className="shrink-0 px-2.5"
                            disabled={isEnabled}
                            onClick={() => restoreCanvasBlock(block.id)}
                          >
                            {isEnabled ? "Added" : "Add"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4 2xl:sticky 2xl:top-28 2xl:max-h-[calc(100vh-8rem)] 2xl:overflow-y-auto">
          <Card className="border-border bg-card/70">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PanelRight className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Inspector</CardTitle>
              </div>
              <CardDescription>
                {selectedInspectorBlock ? selectedInspectorBlock.label : "Page settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedPageDefinition?.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedPageDefinition?.path}</p>
                  </div>
                  <Badge variant="outline">{selectedPageMeta.scope}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="font-semibold text-foreground">{customVisibleFieldCount}</p>
                    <p className="text-muted-foreground">custom fields</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="font-semibold text-foreground">{selectedVisibleFields.length}</p>
                    <p className="text-muted-foreground">visible fields</p>
                  </div>
                </div>
              </div>

              {selectedInspectorBlock ? (
                <div className="space-y-3 rounded-md border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedInspectorBlock.label}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedInspectorBlock.id}</p>
                    </div>
                    <Switch
                      checked={selectedInspectorEnabled}
                      onCheckedChange={(checked) =>
                        updateBlockConfig(selectedInspectorBlock.id, (current) => ({ ...current, enabled: checked }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={typeof selectedInspectorBlockConfig.order === "number" ? String(selectedInspectorBlockConfig.order) : ""}
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        updateBlockConfig(selectedInspectorBlock.id, (current) => ({
                          ...current,
                          order: Number.isFinite(parsed) ? parsed : undefined,
                        }));
                      }}
                      className="bg-card"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extra Class Names</Label>
                    <Input
                      value={selectedInspectorBlockConfig.className ?? ""}
                      onChange={(event) =>
                        updateBlockConfig(selectedInspectorBlock.id, (current) => ({ ...current, className: event.target.value }))
                      }
                      className="bg-card"
                      placeholder="e.g. py-24 bg-card"
                    />
                  </div>
                  {selectedInspectorBlock.description ? (
                    <p className="text-xs text-muted-foreground">{selectedInspectorBlock.description}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                  Select a section from the canvas to inspect it.
                </div>
              )}

              <div className="space-y-2 rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Publish History</p>
                  </div>
                  {isCmsHistoryLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Document #{cmsDocumentId ?? "new"} · Draft v{cmsLatestDraftVersion ?? "-"} · Published v{cmsLatestPublishedVersion ?? "-"}
                </p>
                {cmsVersionHistory.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {cmsVersionHistory.map((version) => {
                      const isPublished = cmsLatestPublishedVersion === version.version;
                      const isDraft = cmsLatestDraftVersion === version.version;
                      return (
                        <div
                          key={version.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-2.5 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">v{version.version}</span>
                              {isPublished ? (
                                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-[10px] text-emerald-700">
                                  Published
                                </Badge>
                              ) : null}
                              {isDraft && !isPublished ? (
                                <Badge variant="outline" className="border-amber-500/40 bg-amber-50 text-[10px] text-amber-700">
                                  Draft
                                </Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatCmsVersionDate(version.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                    No saved versions yet. Save a draft to start the page history.
                  </p>
                )}
              </div>

              <div
                className={[
                  "space-y-3 rounded-md border p-3",
                  validationErrors.length > 0
                    ? "border-destructive/30 bg-destructive/5"
                    : validationWarnings.length > 0
                      ? "border-amber-500/30 bg-amber-50"
                      : "border-emerald-500/30 bg-emerald-50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {validationErrors.length > 0 ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    )}
                    <p className="text-sm font-medium text-foreground">Validation</p>
                  </div>
                  <Badge variant="outline">
                    {validationErrors.length > 0
                      ? `${validationErrors.length} errors`
                      : validationWarnings.length > 0
                        ? `${validationWarnings.length} warnings`
                        : "Ready"}
                  </Badge>
                </div>
                {validationReport.issues.length > 0 ? (
                  <div className="space-y-2">
                    {validationReport.issues.slice(0, 5).map((issue) => (
                      <div key={`${issue.code}-${issue.path ?? issue.message}`} className="rounded-md bg-background/80 p-2 text-xs">
                        <p className={issue.severity === "error" ? "font-medium text-destructive" : "font-medium text-amber-700"}>
                          {issue.severity === "error" ? "Error" : "Warning"} · {issue.code}
                        </p>
                        <p className="mt-1 text-muted-foreground">{issue.message}</p>
                        {issue.path ? <p className="mt-1 font-mono text-[11px] text-muted-foreground">{issue.path}</p> : null}
                      </div>
                    ))}
                    {validationReport.issues.length > 5 ? (
                      <p className="text-xs text-muted-foreground">
                        {validationReport.issues.length - 5} more validation items hidden.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800">
                    This draft passes the Phase 2 schema, URL, reference, and safety checks.
                  </p>
                )}
              </div>

              {!selectedPageCanEdit ? (
                <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>This page is not editable in the active Full Page Builder workflow.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
          </>
        )}
      </div>

      {!isHomeEditorMode ? (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Detailed editing panels
          </div>

      {ENABLE_VISUAL_BLOCK_BUILDER && visualConfig && !isGolfPage && (
        <div className="w-full">
          <BlockPreview pageConfig={visualConfig} />
        </div>
      )}

      <div className="grid gap-6 2xl:grid-cols-2">
        {selectedPageDefinition?.blocks.some((block) => block.id === "hero") ? (
          <Card className="border-border bg-card/50 2xl:col-span-2">
            <CardHeader>
              <CardTitle>Hero Media</CardTitle>
              <CardDescription>
                {heroMediaSupported
                  ? "Upload or paste image, video, or YouTube media for the selected page hero."
                  : selectedPageId === "home"
                    ? "Homepage hero media is managed in the Home Page Editor mode inside Full Page Builder."
                    : "This page currently uses its own dedicated hero-data source instead of the shared page-builder hero media."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {heroMediaSupported ? (
                <>
                  <div className="grid gap-6 2xl:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Media Type</Label>
                        <Select value={heroMediaType} onValueChange={(value) => setPageTextValue("hero.mediaType", value)}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Choose hero media type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="poster">Poster Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Hero Image URL</Label>
                          <Input
                            value={heroImageUrl}
                            onChange={(e) => setPageTextValue("hero.imageUrl", e.target.value)}
                            className="bg-background"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Poster URL</Label>
                          <Input
                            value={heroPosterUrl}
                            onChange={(e) => setPageTextValue("hero.posterUrl", e.target.value)}
                            className="bg-background"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hero Video URL</Label>
                          <Input
                            value={heroVideoUrl}
                            onChange={(e) => setPageTextValue("hero.videoUrl", e.target.value)}
                            className="bg-background"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>YouTube URL</Label>
                          <Input
                            value={heroYoutubeUrl}
                            onChange={(e) => setPageTextValue("hero.youtubeUrl", e.target.value)}
                            className="bg-background"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={heroImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            await handleHeroMediaUpload(file, "image");
                            event.target.value = "";
                          }}
                        />
                        <input
                          ref={heroPosterInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            await handleHeroMediaUpload(file, "poster");
                            event.target.value = "";
                          }}
                        />
                        <input
                          ref={heroVideoInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            await handleHeroMediaUpload(file, "video");
                            event.target.value = "";
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => heroImageInputRef.current?.click()}
                          disabled={heroUploadTarget !== null}
                        >
                          {heroUploadTarget === "image" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                          Upload Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => heroPosterInputRef.current?.click()}
                          disabled={heroUploadTarget !== null}
                        >
                          {heroUploadTarget === "poster" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                          Upload Poster
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => heroVideoInputRef.current?.click()}
                          disabled={heroUploadTarget !== null}
                        >
                          {heroUploadTarget === "video" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Video className="h-4 w-4 mr-2" />}
                          Upload Video
                        </Button>
                        <Button type="button" variant="ghost" onClick={resetHeroMedia}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset Hero Media
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Preview</Label>
                      {selectedPageId === "golf" ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
                          <LiveStyleHero
                            badge={resolvedHeroContent.badge ?? GOLF_DEFAULT_BADGE}
                            title={resolvedHeroContent.title ?? GOLF_DEFAULT_TITLE}
                            subtitle={resolvedHeroContent.subtitle ?? GOLF_DEFAULT_SUBTITLE}
                            media={(
                              <HeroBackgroundMedia
                                mediaType={resolvedHeroMedia.mediaType ?? heroMediaType}
                                imageUrl={resolvedHeroMedia.imageUrl ?? heroImageUrl}
                                videoUrl={resolvedHeroMedia.videoUrl ?? heroVideoUrl}
                                youtubeUrl={resolvedHeroMedia.youtubeUrl ?? heroYoutubeUrl}
                                posterUrl={resolvedHeroMedia.posterUrl ?? heroPosterUrl}
                                alt={resolvedHeroContent.alt ?? GOLF_DEFAULT_ALT}
                                className="object-cover"
                              />
                            )}
                            overlayOpacity={0.42}
                            ctas={(
                              <>
                                <Button type="button" variant="gold" size="lg" disabled>
                                  {resolvedHeroContent.ctaCourses ?? GOLF_DEFAULT_CTA_COURSES}
                                </Button>
                                <Button type="button" variant="heroOutline" size="lg" disabled>
                                  {resolvedHeroContent.ctaLeaderboard ?? GOLF_DEFAULT_CTA_LEADERBOARD}
                                </Button>
                              </>
                            )}
                            className="h-[420px] min-h-0 !rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/40">
                          <HeroBackgroundMedia
                            mediaType={heroMediaType}
                            imageUrl={heroImageUrl}
                            videoUrl={heroVideoUrl}
                            youtubeUrl={heroYoutubeUrl}
                            posterUrl={heroPosterUrl}
                            alt={`${selectedPageDefinition.label} hero preview`}
                            fallback={<div className="h-full w-full bg-black" aria-label="Empty hero media preview" />}
                          />
                          <div className="absolute inset-0 bg-black/35" />
                          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/75">Preview</p>
                            <p className="text-lg font-serif">{selectedPageDefinition.label}</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Image uploads are auto-converted to WebP. Video uploads keep their original format.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {selectedPageId === "home"
                    ? "Use Home Page Editor mode for homepage video/poster management. Region and city detail pages also keep their own dedicated hero image editors."
                    : "No shared hero-media editor is enabled for this page yet."}
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border bg-card/50 2xl:col-span-2">
          <CardHeader>
            <CardTitle>Visible Page Fields</CardTitle>
            <CardDescription>
              Edit the visible titles, headings, labels, descriptions, and card copy for the selected public page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {groupedVisibleFields.map(({ group, fields }) => (
              <div key={group} className="space-y-3 rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{group}</p>
                    <p className="text-xs text-muted-foreground">
                      {fields.length} editable {fields.length === 1 ? "field" : "fields"}
                    </p>
                  </div>
                  <Badge variant="outline">{selectedPageDefinition?.label}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {fields.map((field) => {
                    const hasOverride = Object.prototype.hasOwnProperty.call(selectedPageTextMap, field.key);
                    const value = selectedPageTextMap[field.key] ?? field.fallback;
                    const id = `${selectedPageId}-${field.key}`;
                    const inputClassName = hasOverride ? "bg-card" : "bg-background";

                    return (
                      <div key={field.key} className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}>
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor={id}>{field.label}</Label>
                          <Badge variant="outline" className={hasOverride ? "border-emerald-500/40 bg-emerald-50 text-emerald-700" : "border-amber-500/40 bg-amber-50 text-amber-700"}>
                            {hasOverride ? "Translated" : "Inherited"}
                          </Badge>
                        </div>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={id}
                            value={value}
                            onChange={(e) => setPageTextValue(field.key, e.target.value)}
                            className={inputClassName}
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={id}
                            value={value}
                            onChange={(e) => setPageTextValue(field.key, e.target.value)}
                            className={inputClassName}
                          />
                        )}
                        {field.description ? (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        ) : null}
                        {!hasOverride ? (
                          <p className="text-xs text-muted-foreground">Inherited default: {field.fallback}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Block Controls</CardTitle>
            <CardDescription>Enable/disable blocks and control basic block-level classes/order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockControlsDefinitions.map((block) => {
              const config = selectedPageConfig.blocks?.[block.id] ?? {};
              const golfDiscoveryCards = block.id === "discovery" ? getGolfDiscoveryCards(config) : [];
              const citiesBlockMode = getCitiesBlockMode(config);
              const blockSelection = getBlockSelection(config);
              const selectedCityIds = getCitiesBlockSelectedIds(config);
              const normalizedSelectedCityIds = (() => {
                const { validCityIds } = validateSelectedCityIds("cities", selectedCityIds, cities);
                return validCityIds;
              })();
              const availableCities = cities.filter((city) => !normalizedSelectedCityIds.includes(city.id));
              const visibleAvailableCities = citySearchQuery.trim()
                ? availableCities.filter((city) =>
                    city.name.toLowerCase().includes(citySearchQuery.trim().toLowerCase()),
                  )
                : availableCities;
              const featuredCityOptions = featuredCitySearchQuery.trim()
                ? cities.filter((city) =>
                    city.name.toLowerCase().includes(featuredCitySearchQuery.trim().toLowerCase()),
                  )
                : cities;
              const isListingPlacementBlock =
                block.id === "all-listings" ||
                block.id === "listings" ||
                block.id === "curated";
              const listingSelection = getBlockSelection(config);
              const selectedListingIds = getListingBlockSelectedIds(config);
              const selectedListingCityId = normalizeListingFilterId(config.data?.cityId);
              const selectedListingCategoryId = normalizeListingFilterId(config.data?.categoryId);
              const selectedFeaturedListingId = normalizeListingFilterId(config.data?.listingId);
              const maxItems = normalizeListingMaxItems(config.data?.maxItems, 24);
              const placementListingPool = listingOptions.filter((listing) => {
                if (selectedListingCityId && listing.city_id !== selectedListingCityId) return false;
                if (selectedListingCategoryId && listing.category_id !== selectedListingCategoryId) return false;
                return true;
              });
              const { validListingIds } = validateSelectedListingIds(selectedListingIds, placementListingPool);
              const availablePlacementListings = placementListingPool.filter(
                (listing) => !validListingIds.includes(listing.id),
              );
              const visibleAvailablePlacementListings = listingSearchQuery.trim()
                ? availablePlacementListings.filter((listing) =>
                    listing.name.toLowerCase().includes(listingSearchQuery.trim().toLowerCase()),
                  )
                : availablePlacementListings;
              const defaultEnabled = block.id === "featured-city" ? false : true;

              return (
                <div key={block.id} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{block.label}</p>
                      <p className="text-xs text-muted-foreground">ID: {block.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{block.id}</Badge>
                      <Switch
                        checked={typeof config.enabled === "boolean" ? config.enabled : defaultEnabled}
                        onCheckedChange={(checked) =>
                          updateBlockConfig(block.id, (current) => ({ ...current, enabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={typeof config.order === "number" ? String(config.order) : ""}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          const parsed = Number.parseInt(nextValue, 10);
                          updateBlockConfig(block.id, (current) => ({
                            ...current,
                            order: Number.isFinite(parsed) ? parsed : undefined,
                          }));
                        }}
                        className="bg-background"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra Class Names</Label>
                      <Input
                        value={config.className ?? ""}
                        onChange={(e) =>
                          updateBlockConfig(block.id, (current) => ({ ...current, className: e.target.value }))
                        }
                        className="bg-background"
                        placeholder="e.g. py-24 bg-card"
                      />
                    </div>
                  </div>

                  {block.id === "discovery" && (
                    <div className="space-y-4 border-t border-border pt-3 mt-3">
                      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))]">
                        <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">Label</p>
                            <p className="truncate text-xs text-muted-foreground">Small eyebrow text</p>
                          </div>
                          <Switch
                            checked={typeof config.data?.showLabel === "boolean" ? config.data.showLabel : true}
                            onCheckedChange={(checked) => setBlockSettingValue(block.id, "showLabel", checked)}
                          />
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">Title</p>
                            <p className="truncate text-xs text-muted-foreground">Main heading</p>
                          </div>
                          <Switch
                            checked={typeof config.data?.showTitle === "boolean" ? config.data.showTitle : true}
                            onCheckedChange={(checked) => setBlockSettingValue(block.id, "showTitle", checked)}
                          />
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">Cards</p>
                            <p className="truncate text-xs text-muted-foreground">Top discovery cards</p>
                          </div>
                          <Switch
                            checked={typeof config.data?.showCards === "boolean" ? config.data.showCards : true}
                            onCheckedChange={(checked) => setBlockSettingValue(block.id, "showCards", checked)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Discovery Label</Label>
                          <Input
                            value={typeof config.data?.label === "string" ? config.data.label : GOLF_DISCOVERY_DEFAULTS.label}
                            onChange={(e) => setBlockSettingValue(block.id, "label", e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Discovery Title</Label>
                          <Input
                            value={typeof config.data?.title === "string" ? config.data.title : GOLF_DISCOVERY_DEFAULTS.title}
                            onChange={(e) => setBlockSettingValue(block.id, "title", e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between">
                            <Label>Discovery Subtitle</Label>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Show subtitle</span>
                              <Switch
                                checked={typeof config.data?.showSubtitle === "boolean" ? config.data.showSubtitle : true}
                                onCheckedChange={(checked) => setBlockSettingValue(block.id, "showSubtitle", checked)}
                              />
                            </div>
                          </div>
                          <Textarea
                            value={typeof config.data?.subtitle === "string" ? config.data.subtitle : GOLF_DISCOVERY_DEFAULTS.subtitle}
                            onChange={(e) => setBlockSettingValue(block.id, "subtitle", e.target.value)}
                            className="bg-background"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Top Cards</p>
                          <p className="text-xs text-muted-foreground">
                            Edit card titles, descriptions, uploaded images, links, and visibility for the row at the top of /golf.
                          </p>
                        </div>
                        {golfDiscoveryCards.map((card) => (
                          <div key={card.tag} className="space-y-3 rounded-md border border-border bg-background p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{card.label}</p>
                                <p className="truncate text-xs text-muted-foreground">{card.tag}</p>
                              </div>
                              <Switch
                                checked={card.enabled}
                                onCheckedChange={(checked) => setGolfDiscoveryCardValue(block.id, card.tag, "enabled", checked)}
                              />
                            </div>
                            <div className="grid gap-4 2xl:grid-cols-[minmax(13rem,0.85fr)_1fr]">
                              <div className="space-y-2">
                                <Label>Card Image Preview</Label>
                                <AdminImageCardPreview
                                  title={card.title}
                                  description={card.description}
                                  imageUrl={card.previewImageUrl}
                                  fallbackLabel="No card image"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {getSafeCmsImageSrc(card.imageUrl) ? "Using custom image URL." : "No valid card image. Frontend will render black."}
                                </p>
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    value={card.title}
                                    onChange={(e) => setGolfDiscoveryCardValue(block.id, card.tag, "title", e.target.value)}
                                    className="bg-card"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Input
                                    value={card.description}
                                    onChange={(e) => setGolfDiscoveryCardValue(block.id, card.tag, "description", e.target.value)}
                                    className="bg-card"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Image URL</Label>
                                  <ImageUrlUploadField
                                    id={`golf-discovery-${block.id}-${card.tag}-image-url`}
                                    value={card.imageUrl}
                                    onChange={(value) => setGolfDiscoveryCardValue(block.id, card.tag, "imageUrl", value)}
                                    placeholder="Leave blank to render black"
                                    bucket="media"
                                    folder={`page-builder/golf/top-cards/${card.tag}`}
                                    assetLabel={`${card.label} card image`}
                                    uploadButtonLabel="Upload card image"
                                    changeButtonLabel="Change card image"
                                    buttonSize="sm"
                                    inputClassName="bg-card"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Link URL</Label>
                                  <Input
                                    value={card.href}
                                    onChange={(e) => setGolfDiscoveryCardValue(block.id, card.tag, "href", e.target.value)}
                                    className="bg-card"
                                    placeholder="Leave blank to use default discovery page"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.id === "featured-city-hub" && cities.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3 mt-3">
                      <Label>Highlighted City</Label>
                      <Select
                        value={typeof config.data?.cityId === "string" ? config.data.cityId : ""}
                        onValueChange={(value) =>
                          updateBlockConfig(block.id, (current) => ({
                            ...current,
                            data: { ...(current.data ?? {}), cityId: value },
                          }))
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a city to highlight" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {`Choose which city to feature prominently on the ${selectedPageLabelForCopy} page.`}
                      </p>
                    </div>
                  )}

                  {block.id === "featured-city" && cities.length > 0 && (
                    <div className="space-y-3 border-t border-border pt-3 mt-3">
                      <Label>Featured City</Label>
                      <Input
                        value={featuredCitySearchQuery}
                        onChange={(e) => setFeaturedCitySearchQuery(e.target.value)}
                        className="bg-background"
                        placeholder="Search cities..."
                      />
                      <Select
                        value={typeof config.data?.cityId === "string" ? config.data.cityId : ""}
                        onValueChange={(value) =>
                          updateBlockConfig(block.id, (current) => ({
                            ...current,
                            data: { ...(current.data ?? {}), cityId: value },
                          }))
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a city to feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {featuredCityOptions.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select one city for the dedicated Featured City block.
                      </p>

                      <div className="space-y-2">
                        <Label>Selection Strategy</Label>
                        <Select
                          value={blockSelection}
                          onValueChange={(value) =>
                            setBlockSelection(
                              block.id,
                              value === "tier-driven" || value === "hybrid"
                                ? value
                                : "manual",
                            )
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="tier-driven">Tier-driven</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Hybrid ranks by tier score, using the selected city as an optional candidate hint.
                        </p>
                      </div>
                    </div>
                  )}

                  {block.id === "cities" && cities.length > 0 && (
                    <div className="space-y-3 border-t border-border pt-3 mt-3">
                      <div className="space-y-2">
                        <Label>City Index Mode</Label>
                        <Select
                          value={citiesBlockMode}
                          onValueChange={(value) => setCitiesBlockMode(block.id, value === "curated" ? "curated" : "all")}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All cities</SelectItem>
                            <SelectItem value="curated">Curated list</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {citiesBlockMode === "curated" ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Add cities</Label>
                            <Input
                              value={citySearchQuery}
                              onChange={(e) => setCitySearchQuery(e.target.value)}
                              className="bg-background"
                              placeholder="Search cities..."
                            />
                            <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-background p-2 space-y-1">
                              {visibleAvailableCities.map((city) => (
                                <Button
                                  key={city.id}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    setCitiesBlockSelectedIds(block.id, [...normalizedSelectedCityIds, city.id])
                                  }
                                >
                                  {city.name}
                                </Button>
                              ))}
                              {visibleAvailableCities.length === 0 ? (
                                <p className="px-2 py-1 text-xs text-muted-foreground">No matching cities.</p>
                              ) : null}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Selected cities (display order)</Label>
                            <div className="space-y-2">
                              {normalizedSelectedCityIds.map((cityId, index) => {
                                const city = cities.find((row) => row.id === cityId);
                                if (!city) return null;

                                return (
                                  <div
                                    key={city.id}
                                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                                  >
                                    <span className="text-sm">{city.name}</span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === 0}
                                        onClick={() => {
                                          const next = [...normalizedSelectedCityIds];
                                          const swap = next[index - 1];
                                          next[index - 1] = next[index];
                                          next[index] = swap;
                                          setCitiesBlockSelectedIds(block.id, next);
                                        }}
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === normalizedSelectedCityIds.length - 1}
                                        onClick={() => {
                                          const next = [...normalizedSelectedCityIds];
                                          const swap = next[index + 1];
                                          next[index + 1] = next[index];
                                          next[index] = swap;
                                          setCitiesBlockSelectedIds(block.id, next);
                                        }}
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          setCitiesBlockSelectedIds(
                                            block.id,
                                            normalizedSelectedCityIds.filter((id) => id !== city.id),
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                              {normalizedSelectedCityIds.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No cities selected. Frontend falls back to all cities.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          All active cities are shown when mode is set to all.
                        </p>
                      )}

                      <div className="space-y-2">
                        <Label>Selection Strategy</Label>
                        <Select
                          value={blockSelection}
                          onValueChange={(value) =>
                            setBlockSelection(
                              block.id,
                              value === "tier-driven" || value === "hybrid"
                                ? value
                                : "manual",
                            )
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="tier-driven">Tier-driven</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Hybrid uses curated cities as the candidate pool, then ranks them by tier score.
                        </p>
                      </div>
                    </div>
                  )}

                  {isListingPlacementBlock && (
                    <div className="space-y-3 border-t border-border pt-3 mt-3">
                      <div className="space-y-2">
                        <Label>Selection Strategy</Label>
                        <Select
                          value={listingSelection}
                          onValueChange={(value) =>
                            setBlockSelection(
                              block.id,
                              value === "tier-driven" || value === "hybrid" ? value : "manual",
                            )
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="tier-driven">Tier-driven</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Hybrid uses the manual pool when present, then ranks that pool by tier score.
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>City Filter (optional)</Label>
                          <Select
                            value={selectedListingCityId ?? "__all__"}
                            onValueChange={(value) =>
                              setListingBlockFilter(block.id, "cityId", value === "__all__" ? null : value)
                            }
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="All cities" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All cities</SelectItem>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Category Filter (optional)</Label>
                          <Select
                            value={selectedListingCategoryId ?? "__all__"}
                            onValueChange={(value) =>
                              setListingBlockFilter(block.id, "categoryId", value === "__all__" ? null : value)
                            }
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Items</Label>
                        <Input
                          type="number"
                          min={1}
                          value={String(maxItems)}
                          onChange={(e) => {
                            const parsed = Number.parseInt(e.target.value, 10);
                            setListingBlockMaxItems(
                              block.id,
                              Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
                            );
                          }}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Manual Featured Listing (optional)</Label>
                        <Select
                          value={selectedFeaturedListingId ?? "__none__"}
                          onValueChange={(value) =>
                            setListingBlockFilter(block.id, "listingId", value === "__none__" ? null : value)
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="No manual featured listing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {placementListingPool.map((listing) => (
                              <SelectItem key={listing.id} value={listing.id}>
                                {listing.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Add Manual Listings</Label>
                        <Input
                          value={listingSearchQuery}
                          onChange={(e) => setListingSearchQuery(e.target.value)}
                          className="bg-background"
                          placeholder="Search listings..."
                        />
                        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-background p-2 space-y-1">
                          {visibleAvailablePlacementListings.map((listing) => (
                            <Button
                              key={listing.id}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() =>
                                setListingBlockSelectedIds(block.id, [...validListingIds, listing.id])
                              }
                            >
                              {listing.name}
                            </Button>
                          ))}
                          {visibleAvailablePlacementListings.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-muted-foreground">No matching listings.</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Selected Listings (manual order)</Label>
                        <div className="space-y-2">
                          {validListingIds.map((listingId, index) => {
                            const listing = placementListingPool.find((row) => row.id === listingId);
                            if (!listing) return null;

                            return (
                              <div
                                key={listing.id}
                                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                              >
                                <span className="text-sm">{listing.name}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={index === 0}
                                    onClick={() => {
                                      const next = [...validListingIds];
                                      const swap = next[index - 1];
                                      next[index - 1] = next[index];
                                      next[index] = swap;
                                      setListingBlockSelectedIds(block.id, next);
                                    }}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={index === validListingIds.length - 1}
                                    onClick={() => {
                                      const next = [...validListingIds];
                                      const swap = next[index + 1];
                                      next[index + 1] = next[index];
                                      next[index] = swap;
                                      setListingBlockSelectedIds(block.id, next);
                                    }}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setListingBlockSelectedIds(
                                        block.id,
                                        validListingIds.filter((id) => id !== listing.id),
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          {validListingIds.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No listings selected. Manual/hybrid mode will fallback deterministically.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Page Meta + Local Text Overrides</CardTitle>
            <CardDescription>
              Optional per-page overrides for hardcoded copy and SEO metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Meta Title Override</Label>
                <Input
                  value={selectedPageConfig.meta?.title ?? ""}
                  onChange={(e) => setPageMeta("title", e.target.value)}
                  className="bg-background"
                  placeholder="Optional page meta title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description Override</Label>
                <Textarea
                  value={selectedPageConfig.meta?.description ?? ""}
                  onChange={(e) => setPageMeta("description", e.target.value)}
                  className="bg-background"
                  rows={3}
                  placeholder="Optional page meta description"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Page Local Text Map</Label>
                <Button variant="outline" size="sm" onClick={addPageTextRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use logical keys like <code>hero.badge</code>, <code>hero.title</code>, <code>cta.subtitle</code>.
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {selectedPageTextRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No page-local text overrides yet.</p>
                )}
                {selectedPageTextRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Input
                      value={row.key}
                      onChange={(e) => updatePageTextRow(row.id, "key", e.target.value)}
                      className="bg-background"
                      placeholder="key"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updatePageTextRow(row.id, "value", e.target.value)}
                      className="bg-background"
                      placeholder="value"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="justify-self-end sm:justify-self-auto"
                      onClick={() => removePageTextRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Global Translation Overrides</CardTitle>
            <CardDescription>
              Override any <code>{'t("...")'}</code> key globally (all pages/languages).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={addGlobalTextRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Key
              </Button>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {globalTextRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No global text overrides yet.</p>
              )}
              {globalTextRows.map((row) => (
                <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <Input
                    value={row.key}
                    onChange={(e) => updateGlobalTextRow(row.id, "key", e.target.value)}
                    className="bg-background"
                    placeholder="e.g. sections.regions.title"
                  />
                  <Input
                    value={row.value}
                    onChange={(e) => updateGlobalTextRow(row.id, "value", e.target.value)}
                    className="bg-background"
                    placeholder="Override text"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="justify-self-end sm:justify-self-auto"
                    onClick={() => removeGlobalTextRow(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Design Tokens + Custom CSS
            </CardTitle>
            <CardDescription>
              Control global styles and inject advanced CSS safely from admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addDesignTokenRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Token
                </Button>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {designTokenRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Input
                      value={row.key}
                      onChange={(e) => updateDesignTokenRow(row.id, "key", e.target.value)}
                      className="bg-background"
                      placeholder="--cms-card-radius"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updateDesignTokenRow(row.id, "value", e.target.value)}
                      className="bg-background"
                      placeholder="0.75rem"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="justify-self-end sm:justify-self-auto"
                      onClick={() => removeDesignTokenRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {designTokenRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No custom design tokens yet.</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Custom CSS</Label>
              <Textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="bg-background font-mono text-xs"
                rows={10}
                placeholder={`/* Example */\n[data-cms-page="home"] [data-cms-block="hero"] {\n  border-radius: 24px;\n}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminPageBuilder() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[360px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminPageBuilderContent />
    </Suspense>
  );
}
