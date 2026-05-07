import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import {
  CMS_PAGE_DEFINITION_MAP,
  resolveCmsBlockId,
  type CmsBlockConfig,
  type CmsPageConfig,
  type CmsPageDefinition,
} from "@/lib/cms/pageBuilderRegistry";
import { normalizeCmsImageSrc } from "@/lib/cms/image-source";

export type CmsPageBuilderValidationSeverity = "error" | "warning";

export interface CmsPageBuilderValidationIssue {
  severity: CmsPageBuilderValidationSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface CmsPageBuilderValidationReport {
  valid: boolean;
  issues: CmsPageBuilderValidationIssue[];
  errors: CmsPageBuilderValidationIssue[];
  warnings: CmsPageBuilderValidationIssue[];
}

interface CmsPageBuilderValidationInput {
  pageId: string;
  locale: string;
  pageConfig: CmsPageConfig | Record<string, unknown>;
  pageDefinition?: CmsPageDefinition;
  supportedLocales?: readonly Locale[];
  cityIds?: readonly string[];
  categoryIds?: readonly string[];
  listingIds?: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonSafeValue(value: unknown): boolean {
  if (value === null) return true;
  if (["string", "number", "boolean"].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every(isJsonSafeValue);
  if (!isRecord(value)) return false;
  return Object.values(value).every(isJsonSafeValue);
}

function addIssue(
  issues: CmsPageBuilderValidationIssue[],
  severity: CmsPageBuilderValidationSeverity,
  code: string,
  message: string,
  path?: string,
) {
  issues.push({ severity, code, message, path });
}

function containsUnsafeHtml(value: string) {
  return (
    /<\s*script\b/i.test(value) ||
    /<\s*iframe\b/i.test(value) ||
    /<\s*object\b/i.test(value) ||
    /\son[a-z]+\s*=/i.test(value) ||
    /javascript\s*:/i.test(value)
  );
}

function isUrlLikePath(path: string) {
  const normalized = path.toLowerCase();
  return (
    normalized.endsWith(".url") ||
    normalized.endsWith(".href") ||
    normalized.includes("href") ||
    normalized.includes("imageurl") ||
    normalized.includes("videourl") ||
    normalized.includes("posterurl") ||
    normalized.includes("youtubeurl")
  );
}

function isImageLikePath(path: string) {
  const normalized = path.replaceAll("_", "").toLowerCase();
  return (
    normalized.endsWith(".image") ||
    normalized.endsWith(".src") ||
    normalized.includes("imageurl") ||
    normalized.includes("posterurl") ||
    normalized.includes("backgroundimage") ||
    normalized.includes("featuredimageurl") ||
    normalized.includes("heroimageurl")
  );
}

function isHrefLikePath(path: string) {
  const normalized = path.toLowerCase();
  return normalized.endsWith(".href") || normalized.includes("href") || normalized.includes("cta");
}

function validateUrlValue(value: string, path: string, locale: string, issues: CmsPageBuilderValidationIssue[]) {
  const trimmed = value.trim();
  if (!trimmed) return;

  if (containsUnsafeHtml(trimmed)) {
    addIssue(issues, "error", "UNSAFE_URL", "URL fields cannot contain scripts or JavaScript handlers.", path);
    return;
  }

  if (isImageLikePath(path)) {
    const normalized = normalizeCmsImageSrc(trimmed);
    if (!normalized.src) {
      addIssue(
        issues,
        "error",
        "INVALID_IMAGE_SRC",
        normalized.reason ?? "Image fields must be a public /images path, Supabase public URL, or approved HTTPS image URL.",
        path,
      );
    }
    return;
  }

  const isHref = isHrefLikePath(path);
  const allowedRelative = trimmed.startsWith("/") || trimmed.startsWith("#");
  const allowedSpecial = isHref && (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:"));

  if (allowedRelative || allowedSpecial) {
    if (
      isHref &&
      trimmed.startsWith("/") &&
      locale !== "default" &&
      !trimmed.startsWith(`/${locale}/`) &&
      trimmed !== `/${locale}` &&
      trimmed !== "/"
    ) {
      addIssue(
        issues,
        "warning",
        "UNLOCALIZED_LINK",
        `Relative links should include the active locale prefix /${locale} or be localized by the renderer.`,
        path,
      );
    }
    return;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      addIssue(issues, "error", "INVALID_URL_PROTOCOL", "Only http(s), localized paths, anchors, mailto, or tel URLs are allowed.", path);
    }
  } catch {
    addIssue(issues, "error", "INVALID_URL", "URL fields must be valid http(s) URLs or safe relative paths.", path);
  }
}

function walkValues(
  value: unknown,
  path: string,
  visitor: (value: unknown, path: string) => void,
) {
  visitor(value, path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkValues(item, `${path}[${index}]`, visitor));
    return;
  }
  if (!isRecord(value)) return;
  Object.entries(value).forEach(([key, child]) => walkValues(child, path ? `${path}.${key}` : key, visitor));
}

function normalizeBlocks(pageConfig: CmsPageConfig | Record<string, unknown>): Record<string, CmsBlockConfig> {
  if (Array.isArray(pageConfig.blocks)) {
    return pageConfig.blocks.reduce<Record<string, CmsBlockConfig>>((acc, block) => {
      if (!isRecord(block) || typeof block.id !== "string") return acc;
      const settings = isRecord(block.settings) ? block.settings : isRecord(block.data) ? block.data : undefined;
      acc[block.id] = {
        enabled: typeof block.enabled === "boolean" ? block.enabled : undefined,
        order: typeof block.order === "number" ? block.order : undefined,
        className: typeof settings?.className === "string" ? settings.className : undefined,
        data: settings,
      };
      return acc;
    }, {});
  }

  if (!isRecord(pageConfig.blocks)) return {};
  return pageConfig.blocks as Record<string, CmsBlockConfig>;
}

function validateEntityReference(
  issues: CmsPageBuilderValidationIssue[],
  value: unknown,
  knownIds: ReadonlySet<string>,
  code: string,
  label: string,
  path: string,
) {
  if (typeof value !== "string" || !value.trim()) return;
  if (!knownIds.size) return;
  if (!knownIds.has(value)) {
    addIssue(issues, "error", code, `${label} "${value}" does not exist in the current admin data set.`, path);
  }
}

function validateEntityReferenceArray(
  issues: CmsPageBuilderValidationIssue[],
  value: unknown,
  knownIds: ReadonlySet<string>,
  code: string,
  label: string,
  path: string,
) {
  if (!Array.isArray(value) || !knownIds.size) return;
  value.forEach((item, index) => validateEntityReference(issues, item, knownIds, code, label, `${path}[${index}]`));
}

function getTextRecord(pageConfig: CmsPageConfig | Record<string, unknown>): Record<string, string> {
  if (!isRecord(pageConfig.text)) return {};
  return Object.fromEntries(
    Object.entries(pageConfig.text).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export function validateCmsPageBuilderDraft(input: CmsPageBuilderValidationInput): CmsPageBuilderValidationReport {
  const issues: CmsPageBuilderValidationIssue[] = [];
  const supportedLocales = input.supportedLocales ?? SUPPORTED_LOCALES;
  const pageDefinition = input.pageDefinition ?? CMS_PAGE_DEFINITION_MAP[input.pageId];
  const pageConfig = input.pageConfig ?? {};
  const blocks = normalizeBlocks(pageConfig);

  if (!/^[a-z0-9-]+$/.test(input.pageId)) {
    addIssue(issues, "error", "INVALID_PAGE_ID", "Page id must use lowercase letters, numbers, and hyphens.", "pageId");
  }

  if (!supportedLocales.includes(input.locale as Locale)) {
    addIssue(issues, "error", "INVALID_LOCALE", `Locale "${input.locale}" is not supported.`, "locale");
  }

  if (!pageDefinition) {
    addIssue(issues, "error", "UNKNOWN_PAGE", `Page "${input.pageId}" is not registered in the CMS page registry.`, "pageId");
  } else if (!pageDefinition.path.startsWith("/") || /\s/.test(pageDefinition.path)) {
    addIssue(issues, "error", "INVALID_ROUTE", `Page route "${pageDefinition.path}" must be a valid canonical path.`, "path");
  }

  Object.entries(blocks).forEach(([blockId, blockConfig]) => {
    const resolvedBlockId = resolveCmsBlockId(input.pageId, blockId);
    if (!resolvedBlockId) {
      addIssue(issues, "error", "UNKNOWN_BLOCK", `Block "${blockId}" is not allowed on page "${input.pageId}".`, `blocks.${blockId}`);
    }

    if (!isRecord(blockConfig)) {
      addIssue(issues, "error", "INVALID_BLOCK_CONFIG", `Block "${blockId}" config must be an object.`, `blocks.${blockId}`);
      return;
    }

    if (blockConfig.order !== undefined && (typeof blockConfig.order !== "number" || !Number.isFinite(blockConfig.order))) {
      addIssue(issues, "error", "INVALID_BLOCK_ORDER", `Block "${blockId}" order must be a finite number.`, `blocks.${blockId}.order`);
    }

    const className = typeof blockConfig.className === "string" ? blockConfig.className : "";

    if (blockConfig.className !== undefined && typeof blockConfig.className !== "string") {
      addIssue(issues, "error", "INVALID_CLASS_NAME", `Block "${blockId}" className must be text.`, `blocks.${blockId}.className`);
    }

    if (className && /[<>{};]/.test(className)) {
      addIssue(issues, "error", "UNSAFE_CLASS_NAME", `Block "${blockId}" className contains unsafe characters.`, `blocks.${blockId}.className`);
    }

    if (blockConfig.data !== undefined && !isJsonSafeValue(blockConfig.data)) {
      addIssue(issues, "error", "INVALID_BLOCK_DATA", `Block "${blockId}" data must be JSON-safe.`, `blocks.${blockId}.data`);
    }
  });

  const cityIds = new Set(input.cityIds ?? []);
  const categoryIds = new Set(input.categoryIds ?? []);
  const listingIds = new Set(input.listingIds ?? []);

  Object.entries(blocks).forEach(([blockId, blockConfig]) => {
    const data = isRecord(blockConfig?.data) ? blockConfig.data : {};
    validateEntityReferenceArray(issues, data.selectedCityIds, cityIds, "UNKNOWN_CITY_ID", "City id", `blocks.${blockId}.data.selectedCityIds`);
    validateEntityReference(issues, data.cityId, cityIds, "UNKNOWN_CITY_ID", "City id", `blocks.${blockId}.data.cityId`);
    validateEntityReference(issues, data.categoryId, categoryIds, "UNKNOWN_CATEGORY_ID", "Category id", `blocks.${blockId}.data.categoryId`);
    validateEntityReferenceArray(issues, data.selectedListingIds, listingIds, "UNKNOWN_LISTING_ID", "Listing id", `blocks.${blockId}.data.selectedListingIds`);
    validateEntityReference(issues, data.listingId, listingIds, "UNKNOWN_LISTING_ID", "Listing id", `blocks.${blockId}.data.listingId`);
  });

  walkValues(pageConfig, "", (value, path) => {
    if (typeof value !== "string") return;

    if (containsUnsafeHtml(value)) {
      addIssue(issues, "error", "UNSAFE_HTML", "CMS text and data cannot contain scripts, iframes, event handlers, or javascript: URLs.", path);
    }

    if (isUrlLikePath(path)) {
      validateUrlValue(value, path, input.locale, issues);
    }
  });

  const text = getTextRecord(pageConfig);
  const h1Candidates = Object.entries(text)
    .filter(([key, value]) => value.trim() && /(^hero\.title$|(^|\.)(h1|pageTitle)$)/i.test(key))
    .map(([, value]) => value.trim().toLowerCase());
  const duplicateH1 = h1Candidates.find((value, index) => h1Candidates.indexOf(value) !== index);
  if (duplicateH1) {
    addIssue(issues, "warning", "DUPLICATE_H1_CANDIDATE", "Multiple H1-like fields appear to contain the same title.", "text");
  }

  const meta = isRecord(pageConfig.meta) ? pageConfig.meta : {};
  const metaTitle = typeof meta.title === "string" ? meta.title : "";
  const metaDescription = typeof meta.description === "string" ? meta.description : "";

  if (!metaTitle && !text["meta.title"]) {
    addIssue(issues, "warning", "MISSING_META_TITLE", "Add a meta title before publishing for stronger SEO.", "meta.title");
  }
  if (!metaDescription && !text["meta.description"]) {
    addIssue(issues, "warning", "MISSING_META_DESCRIPTION", "Add a meta description before publishing for stronger SEO.", "meta.description");
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
  };
}
