import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Plus, Save, Trash2, ExternalLink, Paintbrush, Video, ImageIcon, RotateCcw, ArrowDown, ArrowUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import {
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_DEFINITIONS,
  normalizeCmsPageConfigs,
  type CmsBlockConfig,
  type CmsBlockDefinition,
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
import { convertToWebP } from "@/lib/imageUtils";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  normalizePageConfig,
} from "@/lib/cms/normalize-page-config";
import { resolveHero, resolvePageContent } from "@/lib/cms/resolve-hero";
import { getDefaultBlockSettings, isSupportedBlockType, type CmsPageConfig } from "@/lib/cms/block-schemas";
import { BlockPreview } from "@/components/cms/builder/BlockPreview";

const ENABLE_VISUAL_BLOCK_BUILDER = true;

const HERO_MEDIA_SUPPORTED_PAGE_IDS = new Set([
  "blog",
  "destinations",
  "directory",
  "events",
  "experiences",
  "golf",
  "invest",
  "live",
  "map",
  "real-estate",
  "stay",
  "visit",
]);

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

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
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

interface AdminCmsPageConfigPayload {
  page_id: string;
  locale: string;
  document_id: number | null;
  content: Record<string, unknown>;
  latest_draft_version: number | null;
  latest_published_version: number | null;
}

interface AdminCmsPageConfigResponse {
  ok: boolean;
  data?: AdminCmsPageConfigPayload;
  error?: { message?: string };
}

interface AdminCmsPreviewResponse {
  ok: boolean;
  data?: {
    url: string;
    path: string;
    locale: string;
  };
  error?: { message?: string };
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
  const fallbackPageId = CMS_PAGE_DEFINITIONS[0]?.id ?? "home";
  const initialPageId = CMS_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId)
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
  const isGolfPage = selectedPageId === "golf";

  const [pageConfigs, setPageConfigs] = useState<CmsPageConfigMap>({});
  const [globalTextRows, setGlobalTextRows] = useState<KeyValueRow[]>([]);
  const [designTokenRows, setDesignTokenRows] = useState<KeyValueRow[]>([]);
  const [customCss, setCustomCss] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [heroUploadTarget, setHeroUploadTarget] = useState<"image" | "video" | "poster" | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [featuredCitySearchQuery, setFeaturedCitySearchQuery] = useState("");
  const [listingSearchQuery, setListingSearchQuery] = useState("");
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const heroVideoInputRef = useRef<HTMLInputElement | null>(null);
  const heroPosterInputRef = useRef<HTMLInputElement | null>(null);

  const [visualConfig, setVisualConfig] = useState<CmsPageConfig | null>(null);
  const [golfDocumentId, setGolfDocumentId] = useState<number | null>(null);
  const [golfLatestDraftVersion, setGolfLatestDraftVersion] = useState<number | null>(null);
  const [golfLatestPublishedVersion, setGolfLatestPublishedVersion] = useState<number | null>(null);
  const [isGolfCmsLoading, setIsGolfCmsLoading] = useState(false);
  const [isGolfSavingDraft, setIsGolfSavingDraft] = useState(false);
  const [isGolfPublishing, setIsGolfPublishing] = useState(false);

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

  const setSearchParams = (nextParams: URLSearchParams, options?: { replace?: boolean }) => {
    const query = nextParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  };

  const fetchGolfCmsConfig = async () => {
    const json = await fetchAdmin(
      `/api/admin/cms/page-config?page_id=golf&locale=${encodeURIComponent(locale)}`
    );
    return json.data;
  };

  const saveGolfDraft = async (content: CmsPageConfig) => {
    const json = await fetchAdmin("/api/admin/cms/page-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_draft",
        page_id: "golf",
        locale,
        content,
      }),
    });
    return json.data;
  };

  const publishGolf = async () => {
    const json = await fetchAdmin("/api/admin/cms/page-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish",
        page_id: "golf",
        locale,
      }),
    });
    return json.data;
  };

  const openGolfPreview = async () => {
    const json = await fetchAdmin(
      `/api/admin/cms/preview-url?path=${encodeURIComponent("/golf")}&locale=${encodeURIComponent(locale)}`
    );
    window.open(json.data.url, "_blank", "noopener,noreferrer");
  };

  const settingMap = useMemo(() => {
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});
  }, [settings]);

  useEffect(() => {
    if (!requestedPageId) return;
    const isValidRequested = CMS_PAGE_DEFINITIONS.some((page) => page.id === requestedPageId);
    if (isValidRequested && requestedPageId !== selectedPageId) {
      setSelectedPageId(requestedPageId);
    }
  }, [requestedPageId]);

  useEffect(() => {
    setCitySearchQuery("");
    setFeaturedCitySearchQuery("");
    setListingSearchQuery("");
  }, [selectedPageId]);

  useEffect(() => {
    if (!selectedPageId || !initialized) return;
    if (requestedPageId === selectedPageId) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", selectedPageId);
    setSearchParams(next, { replace: true });
  }, [initialized, requestedPageId, searchParams, selectedPageId, setSearchParams]);

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
    if (!initialized || selectedPageId !== "golf") return;

    let cancelled = false;

    const loadGolfCmsConfig = async () => {
      setIsGolfCmsLoading(true);
      try {
        const data = await fetchGolfCmsConfig();
        const normalizedContent = normalizePageConfig(data.content ?? {});

        if (cancelled) return;

        setGolfDocumentId(data.document_id);
        setGolfLatestDraftVersion(data.latest_draft_version);
        setGolfLatestPublishedVersion(data.latest_published_version);
        setVisualConfig(normalizedContent);

        setPageConfigs((prev) => ({
          ...prev,
          golf: {
            ...(prev.golf ?? {}),
            hero: (normalizedContent.hero as Record<string, unknown>) ?? {},
            meta: normalizedContent.meta,
            text: {
              ...((prev.golf?.text as Record<string, string> | undefined) ?? {}),
              ...buildHeroTextMap(normalizedContent.hero),
            },
          },
        }));
      } catch (error) {
        if (cancelled) return;
        toast.error(`Failed to load Golf page builder config: ${(error as Error).message}`);
      } finally {
        if (!cancelled) {
          setIsGolfCmsLoading(false);
        }
      }
    };

    void loadGolfCmsConfig();

    return () => {
      cancelled = true;
    };
  }, [initialized, locale, selectedPageId]);

  const selectedPageDefinition = useMemo(
    () => CMS_PAGE_DEFINITIONS.find((page) => page.id === selectedPageId) ?? CMS_PAGE_DEFINITIONS[0],
    [selectedPageId],
  );
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
  const blockControlsDefinitions = useMemo<CmsBlockDefinition[]>(() => {
    if (!isGolfPage || !visualConfig) {
      return selectedPageDefinition?.blocks ?? [];
    }

    const fromCmsBlocks: CmsBlockDefinition[] = (visualConfig.blocks ?? []).map((block) => ({
      id: block.id,
      label: block.type,
    }));

    if (!fromCmsBlocks.some((block) => block.id === "hero")) {
      fromCmsBlocks.unshift({ id: "hero", label: "Hero" });
    }

    return fromCmsBlocks.length > 0 ? fromCmsBlocks : selectedPageDefinition?.blocks ?? [];
  }, [isGolfPage, selectedPageDefinition, visualConfig]);

  const updateBlockConfig = (blockId: string, updater: (current: CmsBlockConfig) => CmsBlockConfig) => {
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

  const setPageMeta = (field: "title" | "description", value: string) => {
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
    setPageConfigs((prev) => {
      const currentPage = prev[selectedPageId] ?? {};
      const nextText = { ...(currentPage.text ?? {}) };

      nextText["hero.mediaType"] = "image";
      nextText["hero.imageUrl"] = "";
      nextText["hero.videoUrl"] = "";
      nextText["hero.youtubeUrl"] = "";
      nextText["hero.posterUrl"] = "";

      return {
        ...prev,
        [selectedPageId]: {
          ...currentPage,
          text: nextText,
        },
      };
    });

    if (selectedPageId === "golf") {
      setVisualConfig((prev) => {
        if (!prev) return prev;
        return normalizePageConfig({
          ...prev,
          hero: {
            ...(prev.hero ?? {}),
            mediaType: "image",
            imageUrl: "",
            videoUrl: "",
            youtubeUrl: "",
            posterUrl: "",
          },
        });
      });
    }
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

  const handleGolfSaveDraft = async () => {
    if (!visualConfig) {
      toast.error("Golf page config is not loaded yet.");
      return;
    }

    const draftPayload = normalizePageConfig({
      hero: visualConfig.hero ?? {},
      blocks: visualConfig.blocks ?? [],
      meta: visualConfig.meta ?? {},
    });

    setIsGolfSavingDraft(true);
    try {
      const data = await saveGolfDraft(draftPayload);
      const normalizedContent = normalizePageConfig(data.content ?? draftPayload);
      setGolfDocumentId(data.document_id);
      setGolfLatestDraftVersion(data.latest_draft_version);
      setGolfLatestPublishedVersion(data.latest_published_version);
      setVisualConfig(normalizedContent);
      toast.success("Golf draft saved.");
    } catch (error) {
      toast.error(`Failed to save Golf draft: ${(error as Error).message}`);
    } finally {
      setIsGolfSavingDraft(false);
    }
  };

  const handleGolfPublish = async () => {
    setIsGolfPublishing(true);
    try {
      const data = await publishGolf();
      const normalizedContent = normalizePageConfig(data.content ?? {});
      setGolfDocumentId(data.document_id);
      setGolfLatestDraftVersion(data.latest_draft_version);
      setGolfLatestPublishedVersion(data.latest_published_version);
      setVisualConfig(normalizedContent);
      toast.success("Golf page published.");
    } catch (error) {
      toast.error(`Failed to publish Golf page: ${(error as Error).message}`);
    } finally {
      setIsGolfPublishing(false);
    }
  };

  const handleGolfPreview = async () => {
    try {
      await openGolfPreview();
    } catch (error) {
      toast.error(`Failed to open Golf preview: ${(error as Error).message}`);
    }
  };

  const handleSaveAll = async () => {
    try {
      const enrichedConfigs: CmsPageConfigMap = { ...pageConfigs };

      for (const pageId of Object.keys(enrichedConfigs)) {
        const pageConfig = enrichedConfigs[pageId] ?? {};
        const textMap = pageConfig.text ?? {};
        const heroMediaSupported = HERO_MEDIA_SUPPORTED_PAGE_IDS.has(pageId);

        if (heroMediaSupported && (textMap["hero.mediaType"] || textMap["hero.imageUrl"] || textMap["hero.videoUrl"])) {
          const heroData: Record<string, unknown> = {
            enabled: true,
            mediaType: textMap["hero.mediaType"] || "image",
          };

          if (textMap["hero.imageUrl"]) {
            heroData.imageUrl = textMap["hero.imageUrl"];
          }
          if (textMap["hero.videoUrl"]) {
            heroData.videoUrl = textMap["hero.videoUrl"];
          }
          if (textMap["hero.youtubeUrl"]) {
            heroData.youtubeUrl = textMap["hero.youtubeUrl"];
          }
          if (textMap["hero.posterUrl"]) {
            heroData.posterUrl = textMap["hero.posterUrl"];
          }
          if (textMap["hero.alt"]) {
            heroData.alt = textMap["hero.alt"];
          }

          enrichedConfigs[pageId] = {
            ...pageConfig,
            hero: heroData,
          };
        }
      }

      console.log("[admin-page-builder] Full pageConfigs state:", JSON.stringify(pageConfigs, null, 2).slice(0, 3000));
      console.log("[admin-page-builder] Selected pageId:", selectedPageId);
      console.log("[admin-page-builder] Selected page config:", JSON.stringify(pageConfigs[selectedPageId], null, 2));
      console.log("[admin-page-builder] ENRICHED CONFIGS:", JSON.stringify(enrichedConfigs[selectedPageId]?.hero, null, 2));
      const payload = [
        {
          key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
          value: JSON.stringify(enrichedConfigs, null, 2),
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Full Page Builder</h1>
          <p className="text-muted-foreground">
            Control every page section, copy block, and design token from one CMS workspace.
          </p>
        </div>
        {isGolfPage ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleGolfPreview}
              disabled={isGolfCmsLoading || isGolfSavingDraft || isGolfPublishing}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={handleGolfSaveDraft}
              disabled={isGolfCmsLoading || isGolfSavingDraft || isGolfPublishing}
            >
              {isGolfSavingDraft ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={handleGolfPublish}
              disabled={isGolfCmsLoading || isGolfSavingDraft || isGolfPublishing}
            >
              {isGolfPublishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        ) : (
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All
          </Button>
        )}
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Select Page</CardTitle>
          <CardDescription>Choose which page schema to edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {CMS_PAGE_DEFINITIONS.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.label} ({page.path})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPageDefinition?.path && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedPageDefinition.path, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Page
              </Button>
            )}
          </div>
          {selectedPageDefinition?.description && (
            <p className="text-sm text-muted-foreground">{selectedPageDefinition.description}</p>
          )}
          {isGolfPage && (
            <p className="text-xs text-muted-foreground">
              {isGolfCmsLoading
                ? "Loading Golf CMS document..."
                : `Document #${golfDocumentId ?? "new"} · Draft v${golfLatestDraftVersion ?? "-"} · Published v${golfLatestPublishedVersion ?? "-"}`}
            </p>
          )}
        </CardContent>
      </Card>

      {ENABLE_VISUAL_BLOCK_BUILDER && visualConfig && !isGolfPage && (
        <div className="w-full">
          <BlockPreview pageConfig={visualConfig} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {selectedPageDefinition?.blocks.some((block) => block.id === "hero") ? (
          <Card className="border-border bg-card/50 xl:col-span-2">
            <CardHeader>
              <CardTitle>Hero Media</CardTitle>
              <CardDescription>
                {heroMediaSupported
                  ? "Upload or paste image, video, or YouTube media for the selected page hero."
                  : selectedPageId === "home"
                    ? "Homepage hero media is managed in the dedicated Home CMS editor."
                    : "This page currently uses its own dedicated hero-data source instead of the shared page-builder hero media."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {heroMediaSupported ? (
                <>
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
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
                                fallback={<PageHeroImage page="golf" alt={GOLF_DEFAULT_ALT} />}
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
                            fallback={<div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />}
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
                    ? "Use the Home CMS screen for homepage video/poster management. Region and city detail pages also keep their own dedicated hero image editors."
                    : "No shared hero-media editor is enabled for this page yet."}
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Block Controls</CardTitle>
            <CardDescription>Enable/disable blocks and control basic block-level classes/order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockControlsDefinitions.map((block) => {
              const config = selectedPageConfig.blocks?.[block.id] ?? {};
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
                  <div className="flex items-center justify-between">
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
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
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
                    <Button variant="ghost" size="icon" onClick={() => removePageTextRow(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Global Translation Overrides</CardTitle>
            <CardDescription>
              Override any <code>t("...")</code> key globally (all pages/languages).
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
                <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
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
                  <Button variant="ghost" size="icon" onClick={() => removeGlobalTextRow(row.id)}>
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
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
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
                    <Button variant="ghost" size="icon" onClick={() => removeDesignTokenRow(row.id)}>
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
