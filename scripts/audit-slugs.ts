#!/usr/bin/env node
/**
 * Read-only slug and URL routing audit for AlgarveOfficial.
 *
 * Usage:
 *   npm run audit:slugs
 *   npm run audit:slugs -- --check-routes --base-url=http://localhost:3000
 *   npm run audit:slugs -- --json
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "../lib/i18n/locales";
import { DEFAULT_LOCALE_USES_PREFIX } from "../lib/i18n/default-locale-policy";
import { ALL_CANONICAL_SLUGS, getCategoryUrlSlug } from "../lib/seo/programmatic/category-slugs";
import { isApprovedGolfCourse } from "../lib/golf/allowed-courses";
import { normalizeSlug } from "../lib/slugify";

type Severity = "P0" | "P1" | "P2" | "P3";
type Row = Record<string, unknown>;

interface Issue {
  severity: Severity;
  code: string;
  title: string;
  entity: string;
  id?: string;
  slug?: string;
  path?: string;
  details: string;
  recommendation?: string;
}

interface SlugSurface {
  table: string;
  label: string;
  routeScope: "public" | "admin" | "alias";
  nameField: string;
  idField: string;
  statusField?: string;
  slugField: string;
}

interface RouteTarget {
  entity: string;
  id?: string;
  path: string;
  severity: Severity;
  expectedText?: string;
  expectCanonicalEnglish?: boolean;
  expectLegacyEnglishCanonical?: boolean;
}

const args = process.argv.slice(2);
const jsonOutput = hasFlag("--json");
const checkRoutes = hasFlag("--check-routes");
const maxExamples = numberArg("--max-examples", 20);
const routeLimit = numberArg("--route-limit", 250);
const routeConcurrency = numberArg("--route-concurrency", 8);
const baseUrl = stringArg("--base-url") ?? process.env.SLUG_AUDIT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const issues: Issue[] = [];

const strictSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localePrefixPattern = new RegExp(`^(${SUPPORTED_LOCALES.join("|")})(?:/|$)`, "i");
const reservedRouteSegments = new Set([
  "account",
  "admin",
  "api",
  "blog",
  "category",
  "contact",
  "dashboard",
  "destinations",
  "events",
  "golf",
  "guides",
  "home",
  "listing",
  "login",
  "map",
  "owner",
  "partner",
  "partners",
  "pricing",
  "properties",
  "real-estate",
  "relocation",
  "signup",
  "sitemap.xml",
  "stay",
  "visit",
]);

const slugSurfaces: SlugSurface[] = [
  {
    table: "listings",
    label: "listing",
    routeScope: "public",
    nameField: "name",
    idField: "id",
    statusField: "status",
    slugField: "slug",
  },
  {
    table: "listing_slugs",
    label: "listing slug alias",
    routeScope: "alias",
    nameField: "listing_id",
    idField: "id",
    slugField: "slug",
  },
  {
    table: "categories",
    label: "category",
    routeScope: "public",
    nameField: "name",
    idField: "id",
    slugField: "slug",
  },
  {
    table: "cities",
    label: "city",
    routeScope: "public",
    nameField: "name",
    idField: "id",
    slugField: "slug",
  },
  {
    table: "regions",
    label: "region",
    routeScope: "public",
    nameField: "name",
    idField: "id",
    slugField: "slug",
  },
  {
    table: "blog_posts",
    label: "blog post",
    routeScope: "public",
    nameField: "title",
    idField: "id",
    statusField: "status",
    slugField: "slug",
  },
  {
    table: "events",
    label: "event",
    routeScope: "public",
    nameField: "title",
    idField: "id",
    statusField: "status",
    slugField: "slug",
  },
  {
    table: "pages",
    label: "legacy CMS page",
    routeScope: "admin",
    nameField: "title",
    idField: "id",
    slugField: "slug",
  },
  {
    table: "footer_sections",
    label: "footer section",
    routeScope: "admin",
    nameField: "title",
    idField: "id",
    slugField: "slug",
  },
];

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function stringArg(name: string): string | undefined {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function numberArg(name: string, fallback: number): number {
  const value = stringArg(name);
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    if (process.env[key] !== undefined) continue;

    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.replace(/\\n/g, "\n");
  }
}

function loadLocalEnv(): void {
  const cwd = process.cwd();
  for (const fileName of [".env.local", ".env"]) {
    loadEnvFile(path.join(cwd, fileName));
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeKey(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function entityName(row: Row, field: string): string {
  return asString(row[field])?.trim() || asString(row.id) || "unknown";
}

function isPublicRow(row: Row, surface: SlugSurface): boolean {
  const status = surface.statusField ? asString(row[surface.statusField]) : undefined;
  return !status || status === "published";
}

function publicSeverity(surface: SlugSurface, row: Row, p0ForPublished = true): Severity {
  if (surface.routeScope !== "public") return "P2";
  return p0ForPublished && isPublicRow(row, surface) ? "P0" : "P1";
}

function addIssue(issue: Issue): void {
  issues.push(issue);
}

function slugProblems(value: unknown): string[] {
  if (value === null || value === undefined) return ["null"];
  if (typeof value !== "string") return ["not a string"];

  const problems: string[] = [];
  const trimmed = value.trim();

  if (value === "") problems.push("empty string");
  if (value !== "" && trimmed === "") problems.push("whitespace-only");
  if (trimmed !== value) problems.push("leading/trailing whitespace");
  if (/[A-Z]/.test(value)) problems.push("uppercase characters");
  if (/\s/.test(value)) problems.push("spaces or whitespace");
  if (/_/.test(value)) problems.push("underscores");
  if (/^https?:\/\//i.test(value) || /^www\./i.test(value)) problems.push("full URL");
  if (/[?#]/.test(value)) problems.push("query string or fragment");
  if (value.includes("/")) problems.push(value.endsWith("/") ? "slash/trailing slash" : "slash/path segment");
  if (localePrefixPattern.test(value)) problems.push("locale prefix stored in slug");
  if (/--/.test(value)) problems.push("double hyphen");
  if (/^-|-$/.test(value)) problems.push("leading/trailing hyphen");
  if (/[^\x00-\x7F]/.test(value)) problems.push("non-ASCII/accented characters");

  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized !== value) problems.push("accented characters not normalized");

  if (trimmed && !strictSlugPattern.test(trimmed)) problems.push("outside hyphen-only slug standard");
  const canonicalShape = normalizeSlug(trimmed, { maxLength: Number.MAX_SAFE_INTEGER });
  if (trimmed && canonicalShape !== trimmed) problems.push(`canonical form would be "${canonicalShape}"`);

  return Array.from(new Set(problems));
}

async function fetchAll(table: string, select = "*"): Promise<Row[]> {
  const pageSize = 1000;
  const rows: Row[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1);

    if (error) {
      addIssue({
        severity: "P1",
        code: "AUDIT_QUERY_FAILED",
        title: `Could not query ${table}`,
        entity: table,
        details: error.message,
        recommendation: "Confirm the table exists in this environment and the audit key has read access.",
      });
      return rows;
    }

    const page = (data ?? []) as unknown as Row[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function indexById(rows: Row[]): Map<string, Row> {
  const map = new Map<string, Row>();
  for (const row of rows) {
    const id = asString(row.id);
    if (id) map.set(id, row);
  }
  return map;
}

function auditSlugSurface(surface: SlugSurface, rows: Row[]): void {
  for (const row of rows) {
    const id = asString(row[surface.idField]);
    const slug = row[surface.slugField];
    const problems = slugProblems(slug);
    if (problems.length > 0) {
      const severeProblems = problems.some((problem) =>
        ["null", "empty string", "whitespace-only", "full URL", "query string or fragment", "slash/path segment", "slash/trailing slash", "locale prefix stored in slug"].includes(problem),
      );
      addIssue({
        severity: severeProblems ? publicSeverity(surface, row) : surface.routeScope === "public" ? "P1" : "P2",
        code: "INVALID_SLUG_VALUE",
        title: `${surface.label} has invalid slug data`,
        entity: `${surface.table}.${surface.slugField}`,
        id,
        slug: asString(slug),
        details: `${entityName(row, surface.nameField)}: ${problems.join(", ")}`,
        recommendation: "Normalize with the shared slugify helper and persist only lowercase hyphen-only slugs.",
      });
    }

    const trimmedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    if (trimmedSlug && reservedRouteSegments.has(trimmedSlug)) {
      addIssue({
        severity: surface.label === "category" ? "P2" : "P1",
        code: "STATIC_ROUTE_COLLISION",
        title: `${surface.label} slug collides with a reserved route segment`,
        entity: `${surface.table}.${surface.slugField}`,
        id,
        slug: asString(slug),
        details: `${entityName(row, surface.nameField)} uses "${slug}", which is also a top-level/static route segment.`,
        recommendation: "Confirm this is intentional; otherwise choose a more specific slug to avoid legacy-route and SEO ambiguity.",
      });
    }
  }
}

function auditDuplicates(surface: SlugSurface, rows: Row[]): void {
  const buckets = new Map<string, Row[]>();

  for (const row of rows) {
    const slug = asString(row[surface.slugField])?.trim().toLowerCase();
    if (!slug) continue;
    buckets.set(slug, [...(buckets.get(slug) ?? []), row]);
  }

  for (const [slug, matches] of buckets) {
    if (matches.length <= 1) continue;
    addIssue({
      severity: surface.routeScope === "admin" ? "P2" : "P0",
      code: "DUPLICATE_SLUG",
      title: `Duplicate ${surface.label} slug`,
      entity: `${surface.table}.${surface.slugField}`,
      slug,
      details: matches
        .map((row) => `${entityName(row, surface.nameField)} (${asString(row[surface.idField]) ?? "no id"})`)
        .join("; "),
      recommendation: "Resolve duplicates before production; public route resolution expects unique canonical slugs.",
    });
  }
}

function auditListingScopedDuplicates(listings: Row[]): void {
  const buckets = new Map<string, Row[]>();

  for (const listing of listings) {
    const slug = normalizeKey(asString(listing.slug));
    if (!slug) continue;

    const key = `${listing.city_id ?? "no-city"}:${listing.category_id ?? "no-category"}:${slug}`;
    buckets.set(key, [...(buckets.get(key) ?? []), listing]);
  }

  for (const [key, matches] of buckets) {
    if (matches.length <= 1) continue;
    addIssue({
      severity: "P0",
      code: "DUPLICATE_LISTING_SLUG_SCOPED",
      title: "Duplicate listing slug within city/category scope",
      entity: "listings.slug",
      slug: key.split(":").at(-1),
      details: matches.map((row) => `${entityName(row, "name")} (${asString(row.id) ?? "no id"})`).join("; "),
      recommendation: "Even if global uniqueness is intended, scoped duplicates indicate importer/admin data drift.",
    });
  }
}

function auditRelations(data: AuditData): void {
  const categoryIds = new Set(data.categories.map((row) => asString(row.id)).filter(Boolean));
  const cityIds = new Set(data.cities.map((row) => asString(row.id)).filter(Boolean));
  const regionIds = new Set(data.regions.map((row) => asString(row.id)).filter(Boolean));
  const listingIds = new Set(data.listings.map((row) => asString(row.id)).filter(Boolean));
  const blogPostIds = new Set(data.blogPosts.map((row) => asString(row.id)).filter(Boolean));

  for (const listing of data.listings) {
    const published = asString(listing.status) === "published";
    const severity: Severity = published ? "P0" : "P1";

    const categoryId = asString(listing.category_id);
    const cityId = asString(listing.city_id);
    const regionId = asString(listing.region_id);

    if (!categoryId || !categoryIds.has(categoryId)) {
      addIssue({
        severity,
        code: "LISTING_BROKEN_CATEGORY",
        title: "Listing is linked to a missing category",
        entity: "listings.category_id",
        id: asString(listing.id),
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} category_id=${categoryId ?? "null"}`,
        recommendation: "Set a valid category_id before the listing is public.",
      });
    }

    if (!cityId || !cityIds.has(cityId)) {
      addIssue({
        severity,
        code: "LISTING_BROKEN_CITY",
        title: "Listing is linked to a missing city",
        entity: "listings.city_id",
        id: asString(listing.id),
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} city_id=${cityId ?? "null"}`,
        recommendation: "Set a valid city_id before the listing is public.",
      });
    }

    if (regionId && !regionIds.has(regionId)) {
      addIssue({
        severity: published ? "P1" : "P2",
        code: "LISTING_BROKEN_REGION",
        title: "Listing is linked to a missing region",
        entity: "listings.region_id",
        id: asString(listing.id),
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} region_id=${regionId}`,
        recommendation: "Set region_id to an existing region or null if region routing should not use it.",
      });
    }
  }

  for (const event of data.events) {
    const cityId = asString(event.city_id);
    if (!cityId || !cityIds.has(cityId)) {
      addIssue({
        severity: asString(event.status) === "published" ? "P0" : "P1",
        code: "EVENT_BROKEN_CITY",
        title: "Event is linked to a missing city",
        entity: "events.city_id",
        id: asString(event.id),
        slug: asString(event.slug),
        details: `${entityName(event, "title")} city_id=${cityId ?? "null"}`,
        recommendation: "Set a valid city_id before the event is public.",
      });
    }
  }

  for (const mapping of data.cityRegionMappings) {
    const cityId = asString(mapping.city_id);
    const regionId = asString(mapping.region_id);
    if (!cityId || !cityIds.has(cityId) || !regionId || !regionIds.has(regionId)) {
      addIssue({
        severity: "P1",
        code: "BROKEN_CITY_REGION_MAPPING",
        title: "City-region mapping points to missing taxonomy",
        entity: "city_region_mapping",
        id: asString(mapping.id),
        details: `city_id=${cityId ?? "null"}, region_id=${regionId ?? "null"}`,
        recommendation: "Remove orphaned mappings or relink them to valid city and region rows.",
      });
    }
  }

  auditTranslationOrphans("listing_translations", "listing_id", data.listingTranslations, listingIds);
  auditTranslationOrphans("category_translations", "category_id", data.categoryTranslations, categoryIds);
  auditTranslationOrphans("city_translations", "city_id", data.cityTranslations, cityIds);
  auditTranslationOrphans("region_translations", "region_id", data.regionTranslations, regionIds);
  auditTranslationOrphans("blog_post_translations", "post_id", data.blogPostTranslations, blogPostIds);
}

function auditTranslationOrphans(table: string, foreignKey: string, rows: Row[], validIds: Set<string | undefined>): void {
  for (const row of rows) {
    const foreignId = asString(row[foreignKey]);
    if (!foreignId || !validIds.has(foreignId)) {
      addIssue({
        severity: "P1",
        code: "ORPHAN_TRANSLATION",
        title: "Translation row points to missing canonical record",
        entity: `${table}.${foreignKey}`,
        id: asString(row.id),
        details: `${foreignKey}=${foreignId ?? "null"}, locale=${asString(row.locale) ?? asString(row.language_code) ?? "unknown"}`,
        recommendation: "Delete orphan translations or restore the canonical source row.",
      });
    }
  }
}

function auditListingSlugAliases(listings: Row[], aliases: Row[]): void {
  const listingById = indexById(listings);
  const currentAliasesByListing = new Map<string, Row[]>();

  for (const alias of aliases) {
    const listingId = asString(alias.listing_id);
    if (!listingId || !listingById.has(listingId)) {
      addIssue({
        severity: "P0",
        code: "ORPHAN_LISTING_SLUG_ALIAS",
        title: "Listing slug alias points to missing listing",
        entity: "listing_slugs.listing_id",
        id: asString(alias.id),
        slug: asString(alias.slug),
        details: `listing_id=${listingId ?? "null"}`,
        recommendation: "Delete the alias or relink it to an existing listing.",
      });
      continue;
    }

    if (asBoolean(alias.is_current)) {
      currentAliasesByListing.set(listingId, [...(currentAliasesByListing.get(listingId) ?? []), alias]);
    }
  }

  for (const listing of listings) {
    if (asString(listing.status) !== "published") continue;
    const id = asString(listing.id);
    if (!id) continue;

    const currentAliases = currentAliasesByListing.get(id) ?? [];
    const listingSlug = normalizeKey(asString(listing.slug));

    if (currentAliases.length === 0) {
      addIssue({
        severity: "P1",
        code: "MISSING_CURRENT_LISTING_SLUG_ALIAS",
        title: "Published listing is missing a current listing_slugs alias",
        entity: "listing_slugs",
        id,
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} resolves by fallback today, but old-slug redirect tracking is incomplete.`,
        recommendation: "Backfill listing_slugs with the current slug for every listing.",
      });
      continue;
    }

    if (currentAliases.length > 1) {
      addIssue({
        severity: "P1",
        code: "MULTIPLE_CURRENT_LISTING_SLUG_ALIASES",
        title: "Published listing has multiple current slug aliases",
        entity: "listing_slugs.is_current",
        id,
        slug: asString(listing.slug),
        details: currentAliases.map((alias) => asString(alias.slug) ?? "null").join(", "),
        recommendation: "Leave exactly one current alias matching listings.slug.",
      });
    }

    const hasMatchingCurrent = currentAliases.some((alias) => normalizeKey(asString(alias.slug)) === listingSlug);
    if (!hasMatchingCurrent) {
      addIssue({
        severity: "P1",
        code: "CURRENT_LISTING_SLUG_ALIAS_MISMATCH",
        title: "Current slug alias does not match listings.slug",
        entity: "listing_slugs.slug",
        id,
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} current aliases: ${currentAliases.map((alias) => asString(alias.slug) ?? "null").join(", ")}`,
        recommendation: "Mark old aliases non-current and insert the canonical listings.slug as current.",
      });
    }
  }
}

function auditGolfSlugs(data: AuditData): void {
  const golfCategoryIds = new Set(
    data.categories
      .filter((category) => normalizeKey(asString(category.slug)) === "golf")
      .map((category) => asString(category.id))
      .filter(Boolean),
  );
  const listingById = indexById(data.listings);

  for (const course of data.golfCourses) {
    const listingId = asString(course.listing_id);
    const listing = listingId ? listingById.get(listingId) : undefined;
    if (!listing) {
      addIssue({
        severity: "P1",
        code: "GOLF_COURSE_ORPHAN_LISTING",
        title: "Golf course row points to a missing listing",
        entity: "golf_courses.listing_id",
        id: asString(course.id),
        details: `listing_id=${listingId ?? "null"}`,
        recommendation: "Relink or delete the orphaned golf_courses row.",
      });
      continue;
    }

    const categoryId = asString(listing.category_id);
    if (categoryId && !golfCategoryIds.has(categoryId)) {
      addIssue({
        severity: "P1",
        code: "GOLF_COURSE_NON_GOLF_LISTING",
        title: "Golf course row is linked to a non-golf listing",
        entity: "golf_courses.listing_id",
        id: asString(course.id),
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} category_id=${categoryId}`,
        recommendation: "Move the listing to the golf category or remove the golf course detail row.",
      });
    }
  }

  const publishedGolfListings = data.listings.filter((listing) => {
    const categoryId = asString(listing.category_id);
    return asString(listing.status) === "published" && categoryId && golfCategoryIds.has(categoryId);
  });

  for (const listing of publishedGolfListings) {
    if (!isApprovedGolfCourse({ slug: asString(listing.slug), name: asString(listing.name) })) {
      addIssue({
        severity: "P1",
        code: "GOLF_LISTING_NOT_ALLOWLISTED",
        title: "Published golf listing may be hidden by the public golf allowlist",
        entity: "listings.slug",
        id: asString(listing.id),
        slug: asString(listing.slug),
        details: `${entityName(listing, "name")} does not match an approved golf course slug/name alias.`,
        recommendation: "Either use the approved canonical golf slug/name or update the allowlist intentionally.",
      });
    }
  }
}

function auditLocalePolicy(): void {
  if (DEFAULT_LOCALE !== "en") {
    addIssue({
      severity: "P0",
      code: "DEFAULT_LOCALE_NOT_EN",
      title: "Default locale is not English",
      entity: "lib/i18n/locales.ts",
      details: `DEFAULT_LOCALE=${DEFAULT_LOCALE}`,
      recommendation: "Confirm canonical locale policy before publishing sitemap/canonical URLs.",
    });
  }

  if (DEFAULT_LOCALE_USES_PREFIX) {
    addIssue({
      severity: "P0",
      code: "ENGLISH_CANONICAL_PREFIX_POLICY_MISMATCH",
      title: "English canonical policy is configured as prefixed",
      entity: "lib/i18n/default-locale-policy.ts",
      details: "Business rule says English should be canonical and unprefixed where applicable, but DEFAULT_LOCALE_USES_PREFIX is true.",
      recommendation: "Align proxy, sitemap, canonical, hreflang, and redirect behavior to the chosen production policy.",
    });
  }
}

function expectedEnglishPath(pathWithoutLocale: string): string {
  return pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
}

function expectedLocalizedPath(locale: AppLocale, pathWithoutLocale: string): string {
  const normalized = expectedEnglishPath(pathWithoutLocale);
  if (locale === DEFAULT_LOCALE) return normalized;
  return `/${locale}${normalized}`;
}

function buildRouteTargets(data: AuditData): RouteTarget[] {
  const targets: RouteTarget[] = [];
  const categoryById = indexById(data.categories);
  const citySlugs = new Set(data.cities.map((row) => normalizeKey(asString(row.slug))).filter(Boolean));
  const regionSlugs = new Set(data.regions.map((row) => normalizeKey(asString(row.slug))).filter(Boolean));
  const golfCategoryIds = new Set(
    data.categories
      .filter((category) => normalizeKey(asString(category.slug)) === "golf")
      .map((category) => asString(category.id))
      .filter(Boolean),
  );

  for (const listing of data.listings.filter((row) => asString(row.status) === "published")) {
    const slug = asString(listing.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    const pathWithoutLocale = `/listing/${slug}`;
    targets.push({
      entity: "listing",
      id: asString(listing.id),
      path: expectedEnglishPath(pathWithoutLocale),
      severity: "P0",
      expectedText: asString(listing.name),
      expectCanonicalEnglish: true,
    });
    targets.push({
      entity: "legacy English listing",
      id: asString(listing.id),
      path: `/en${pathWithoutLocale}`,
      severity: "P1",
      expectLegacyEnglishCanonical: true,
    });

    for (const locale of SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)) {
      targets.push({
        entity: `${locale} listing`,
        id: asString(listing.id),
        path: expectedLocalizedPath(locale, pathWithoutLocale),
        severity: "P1",
        expectedText: asString(listing.name),
      });
    }

    const categoryId = asString(listing.category_id);
    if (categoryId && golfCategoryIds.has(categoryId) && isApprovedGolfCourse({ slug, name: asString(listing.name) })) {
      targets.push({
        entity: "golf course",
        id: asString(listing.id),
        path: expectedEnglishPath(`/golf/courses/${slug}`),
        severity: "P0",
        expectedText: asString(listing.name),
        expectCanonicalEnglish: true,
      });
    }
  }

  for (const post of data.blogPosts.filter((row) => asString(row.status) === "published")) {
    const slug = asString(post.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    targets.push({
      entity: "blog post",
      id: asString(post.id),
      path: expectedEnglishPath(`/blog/${slug}`),
      severity: "P0",
      expectedText: asString(post.title),
      expectCanonicalEnglish: true,
    });
  }

  for (const event of data.events.filter((row) => asString(row.status) === "published")) {
    const slug = asString(event.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    targets.push({
      entity: "event",
      id: asString(event.id),
      path: expectedEnglishPath(`/events/${slug}`),
      severity: "P0",
      expectedText: asString(event.title),
      expectCanonicalEnglish: true,
    });
  }

  for (const region of data.regions.filter((row) => row.is_active !== false || row.is_visible_destinations === true)) {
    const slug = asString(region.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    targets.push({
      entity: "destination region",
      id: asString(region.id),
      path: expectedEnglishPath(`/destinations/${slug}`),
      severity: "P0",
      expectedText: asString(region.name),
      expectCanonicalEnglish: true,
    });
  }

  for (const city of data.cities.filter((row) => row.is_active !== false)) {
    const slug = asString(city.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    targets.push({
      entity: "city",
      id: asString(city.id),
      path: expectedEnglishPath(`/visit/${slug}`),
      severity: "P0",
      expectedText: asString(city.name),
      expectCanonicalEnglish: true,
    });

    if (!regionSlugs.has(slug) && citySlugs.has(slug)) {
      targets.push({
        entity: "broken city destination alias",
        id: asString(city.id),
        path: expectedEnglishPath(`/destinations/${slug}`),
        severity: "P1",
      });
    }
  }

  for (const canonicalSlug of ALL_CANONICAL_SLUGS) {
    const category = data.categories.find((row) => normalizeKey(asString(row.slug)) === canonicalSlug);
    if (!category) continue;

    for (const locale of SUPPORTED_LOCALES) {
      const localizedSlug = getCategoryUrlSlug(canonicalSlug, locale);
      targets.push({
        entity: `${locale} category`,
        id: asString(category.id),
        path: expectedLocalizedPath(locale, `/category/${localizedSlug}`),
        severity: locale === DEFAULT_LOCALE ? "P0" : "P1",
        expectedText: asString(category.name),
        expectCanonicalEnglish: locale === DEFAULT_LOCALE,
      });
    }
  }

  return routeLimit > 0 ? targets.slice(0, routeLimit) : targets;
}

async function auditRoutes(data: AuditData): Promise<void> {
  const targets = buildRouteTargets(data);
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  await runConcurrent(targets, routeConcurrency, async (target) => {
    const url = `${normalizedBaseUrl}${target.path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: {
          "user-agent": "AlgarveOfficial slug audit",
        },
      });
    } catch (error) {
      addIssue({
        severity: "P1",
        code: "ROUTE_CHECK_FAILED",
        title: "Could not check route",
        entity: target.entity,
        id: target.id,
        path: target.path,
        details: error instanceof Error ? error.message : String(error),
        recommendation: "Confirm the site/dev server is reachable, then rerun with --check-routes.",
      });
      return;
    }

    const location = response.headers.get("location") ?? "";
    const isRedirect = response.status >= 300 && response.status < 400;

    if (response.status >= 400) {
      addIssue({
        severity: target.severity,
        code: "PUBLIC_ROUTE_404",
        title: "Slug exists in DB but route is not reachable",
        entity: target.entity,
        id: target.id,
        path: target.path,
        details: `GET ${target.path} returned HTTP ${response.status}.`,
        recommendation: "Fix route resolver, slug value, publication state, or sitemap generation for this entity.",
      });
      return;
    }

    if (target.expectCanonicalEnglish && isRedirect) {
      addIssue({
        severity: target.severity,
        code: "ENGLISH_CANONICAL_REDIRECTS",
        title: "Canonical English route redirects instead of serving unprefixed URL",
        entity: target.entity,
        id: target.id,
        path: target.path,
        details: `GET ${target.path} returned HTTP ${response.status} location=${location || "none"}.`,
        recommendation: "English canonical URLs should be unprefixed; redirects should point toward the unprefixed path.",
      });
      return;
    }

    if (target.expectLegacyEnglishCanonical) {
      const canonicalPath = target.path.replace(/^\/en(?=\/|$)/, "") || "/";
      if (isRedirect) {
        if (!location.includes(canonicalPath)) {
          addIssue({
            severity: "P1",
            code: "LEGACY_EN_ROUTE_BAD_REDIRECT",
            title: "Legacy /en route redirects away from canonical English URL",
            entity: target.entity,
            id: target.id,
            path: target.path,
            details: `GET ${target.path} returned HTTP ${response.status} location=${location || "none"}, expected ${canonicalPath}.`,
            recommendation: "Legacy /en routes should either serve with an unprefixed canonical tag or redirect directly to the unprefixed canonical path.",
          });
        }
        return;
      }

      if (response.status === 200) {
        const html = await response.text();
        const canonical = extractCanonicalUrl(html);
        if (!canonical || canonicalPathname(canonical) !== canonicalPath) {
          addIssue({
            severity: "P1",
            code: "LEGACY_EN_ROUTE_CANONICAL_MISMATCH",
            title: "Legacy /en route canonical does not point to unprefixed English URL",
            entity: target.entity,
            id: target.id,
            path: target.path,
            details: `GET ${target.path} served HTTP 200 with canonical=${canonical || "missing"}, expected ${canonicalPath}.`,
            recommendation: "Keep legacy /en routes crawl-safe by rendering a canonical tag that points to the unprefixed English URL.",
          });
        }
        return;
      }

      if (!isRedirect) {
        addIssue({
          severity: "P1",
          code: "LEGACY_EN_ROUTE_NOT_CANONICALIZED",
          title: "Legacy /en route is not canonicalized",
          entity: target.entity,
          id: target.id,
          path: target.path,
          details: `GET ${target.path} returned HTTP ${response.status} location=${location || "none"}, expected a 200 canonical tag or redirect to ${canonicalPath}.`,
          recommendation: "Serve legacy /en routes with an unprefixed canonical tag or redirect them directly to the unprefixed canonical path.",
        });
      }
      return;
    }

    if (target.expectedText && response.status === 200) {
      const html = await response.text();
      if (!containsNormalizedText(html, target.expectedText)) {
        addIssue({
          severity: "P1",
          code: "ROUTE_RESOLVES_UNEXPECTED_CONTENT",
          title: "Route returned 200 but expected record text was not found",
          entity: target.entity,
          id: target.id,
          path: target.path,
          details: `Expected page HTML to contain "${target.expectedText}".`,
          recommendation: "Check whether the route is resolving the wrong record or whether the page title/content source changed.",
        });
      }

      const canonical = extractCanonicalUrl(html);
      if (target.expectCanonicalEnglish && canonical) {
        const canonicalPath = canonicalPathname(canonical);
        if (canonicalPath && canonicalPath.startsWith("/en/")) {
          addIssue({
            severity: "P1",
            code: "CANONICAL_USES_EN_PREFIX",
            title: "Page canonical URL uses /en prefix",
            entity: target.entity,
            id: target.id,
            path: target.path,
            details: `canonical=${canonical}`,
            recommendation: "Canonical metadata should match the unprefixed English URL policy.",
          });
        }
      }
    }
  });

  await auditSitemap(data, normalizedBaseUrl);
}

async function auditSitemap(data: AuditData, normalizedBaseUrl: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${normalizedBaseUrl}/sitemap.xml`, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "AlgarveOfficial slug audit" },
    });
  } catch (error) {
    addIssue({
      severity: "P2",
      code: "SITEMAP_FETCH_FAILED",
      title: "Could not fetch sitemap",
      entity: "sitemap.xml",
      details: error instanceof Error ? error.message : String(error),
      recommendation: "Rerun with a reachable --base-url to compare sitemap URLs against route data.",
    });
    return;
  }

  if (!response.ok) {
    addIssue({
      severity: "P2",
      code: "SITEMAP_FETCH_FAILED",
      title: "Sitemap did not return 200",
      entity: "sitemap.xml",
      details: `HTTP ${response.status}`,
      recommendation: "Fix sitemap availability before production.",
    });
    return;
  }

  const xml = await response.text();
  const sitemapPaths = extractSitemapPaths(xml);
  const citySlugs = new Set(data.cities.map((row) => normalizeKey(asString(row.slug))).filter(Boolean));
  const regionSlugs = new Set(data.regions.map((row) => normalizeKey(asString(row.slug))).filter(Boolean));

  for (const slug of citySlugs) {
    if (regionSlugs.has(slug)) continue;
    for (const path of [`/destinations/${slug}`, `/en/destinations/${slug}`]) {
      if (sitemapPaths.has(path)) {
        addIssue({
          severity: "P0",
          code: "SITEMAP_CITY_DESTINATION_BROKEN_PATH",
          title: "Sitemap contains a city slug under the region destination route",
          entity: "sitemap.xml",
          slug,
          path,
          details: "The destination resolver expects region slugs, while city pages are under /visit/{city}.",
          recommendation: "Remove city /destinations URLs from the sitemap and emit /visit/{city} instead.",
        });
      }
    }
  }

  for (const listing of data.listings.filter((row) => asString(row.status) === "published")) {
    const slug = asString(listing.slug);
    if (!slug || slugProblems(slug).length > 0) continue;
    const canonicalPath = `/listing/${slug}`;
    if (!sitemapPaths.has(canonicalPath) && sitemapPaths.has(`/en${canonicalPath}`)) {
      addIssue({
        severity: "P1",
        code: "SITEMAP_USES_EN_PREFIX_FOR_CANONICAL",
        title: "Sitemap uses /en listing URL instead of unprefixed canonical",
        entity: "sitemap.xml",
        id: asString(listing.id),
        slug,
        path: `/en${canonicalPath}`,
        details: `${entityName(listing, "name")} is in the sitemap with /en prefix.`,
        recommendation: "Update sitemap generation after canonical English route policy is fixed.",
      });
    }
  }
}

function extractSitemapPaths(xml: string): Set<string> {
  const paths = new Set<string>();
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
  for (const match of matches) {
    const value = match[1]?.trim();
    if (!value) continue;
    const parsed = canonicalPathname(value);
    if (parsed) paths.add(parsed);
  }
  return paths;
}

function canonicalPathname(urlOrPath: string): string | null {
  try {
    if (urlOrPath.startsWith("/")) return urlOrPath;
    return new URL(urlOrPath).pathname;
  } catch {
    return null;
  }
}

function extractCanonicalUrl(html: string): string | null {
  const canonicalTag = html.match(/<link\b(?=[^>]*rel=["']canonical["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/i);
  return canonicalTag?.[1] ?? null;
}

function containsNormalizedText(html: string, expected: string): boolean {
  const normalize = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .toLowerCase();

  return normalize(html).includes(normalize(expected).trim());
}

async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workerCount = Math.max(1, concurrency);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      for (;;) {
        const currentIndex = index;
        index += 1;
        const item = items[currentIndex];
        if (!item) return;
        await worker(item);
      }
    }),
  );
}

interface AuditData {
  listings: Row[];
  listingSlugs: Row[];
  categories: Row[];
  cities: Row[];
  regions: Row[];
  blogPosts: Row[];
  events: Row[];
  pages: Row[];
  footerSections: Row[];
  listingTranslations: Row[];
  categoryTranslations: Row[];
  cityTranslations: Row[];
  regionTranslations: Row[];
  blogPostTranslations: Row[];
  cityRegionMappings: Row[];
  golfCourses: Row[];
}

async function fetchAuditData(): Promise<AuditData> {
  const [
    listings,
    listingSlugs,
    categories,
    cities,
    regions,
    blogPosts,
    events,
    pages,
    footerSections,
    listingTranslations,
    categoryTranslations,
    cityTranslations,
    regionTranslations,
    blogPostTranslations,
    cityRegionMappings,
    golfCourses,
  ] = await Promise.all([
    fetchAll("listings", "id,name,slug,status,category_id,city_id,region_id,updated_at,created_at"),
    fetchAll("listing_slugs", "id,listing_id,slug,is_current,created_at"),
    fetchAll("categories", "id,name,slug,is_active,updated_at,created_at"),
    fetchAll("cities", "id,name,slug,is_active,updated_at,created_at"),
    fetchAll("regions", "id,name,slug,is_active,is_visible_destinations,updated_at,created_at"),
    fetchAll("blog_posts", "id,title,slug,status,published_at,updated_at,created_at"),
    fetchAll("events", "id,title,slug,status,city_id,listing_id,updated_at,created_at"),
    fetchAll("pages", "id,title,slug,is_published,updated_at,created_at"),
    fetchAll("footer_sections", "id,title,slug,is_active,updated_at,created_at"),
    fetchAll("listing_translations", "id,listing_id,language_code,title,translation_status,updated_at,created_at"),
    fetchAll("category_translations", "id,category_id,locale,name,status,updated_at,created_at"),
    fetchAll("city_translations", "id,city_id,locale,name,status,updated_at,created_at"),
    fetchAll("region_translations", "id,region_id,locale,name,status,updated_at,created_at"),
    fetchAll("blog_post_translations", "id,post_id,locale,title,status,updated_at,created_at"),
    fetchAll("city_region_mapping", "id,city_id,region_id,is_primary,created_at"),
    fetchAll("golf_courses", "id,listing_id,name,updated_at,created_at"),
  ]);

  return {
    listings,
    listingSlugs,
    categories,
    cities,
    regions,
    blogPosts,
    events,
    pages,
    footerSections,
    listingTranslations,
    categoryTranslations,
    cityTranslations,
    regionTranslations,
    blogPostTranslations,
    cityRegionMappings,
    golfCourses,
  };
}

function auditExpectedCategorySlugs(categories: Row[]): void {
  const categorySlugs = new Set(categories.map((row) => normalizeKey(asString(row.slug))).filter(Boolean));
  for (const canonicalSlug of ALL_CANONICAL_SLUGS) {
    if (!categorySlugs.has(canonicalSlug)) {
      addIssue({
        severity: "P1",
        code: "MISSING_CANONICAL_CATEGORY_SLUG",
        title: "Canonical category slug is missing from DB",
        entity: "categories.slug",
        slug: canonicalSlug,
        details: `${canonicalSlug} exists in programmatic routing but not in categories.`,
        recommendation: "Create the category row or remove/update the programmatic route mapping.",
      });
    }
  }
}

function auditData(data: AuditData): void {
  auditLocalePolicy();

  const rowsByTable: Record<string, Row[]> = {
    listings: data.listings,
    listing_slugs: data.listingSlugs,
    categories: data.categories,
    cities: data.cities,
    regions: data.regions,
    blog_posts: data.blogPosts,
    events: data.events,
    pages: data.pages,
    footer_sections: data.footerSections,
  };

  for (const surface of slugSurfaces) {
    const rows = rowsByTable[surface.table] ?? [];
    auditSlugSurface(surface, rows);
    auditDuplicates(surface, rows);
  }

  auditListingScopedDuplicates(data.listings);
  auditExpectedCategorySlugs(data.categories);
  auditRelations(data);
  auditListingSlugAliases(data.listings, data.listingSlugs);
  auditGolfSlugs(data);
}

function printReport(data: AuditData): void {
  const grouped: Record<Severity, Issue[]> = {
    P0: [],
    P1: [],
    P2: [],
    P3: [],
  };

  for (const issue of issues) {
    grouped[issue.severity].push(issue);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          route_checks: checkRoutes,
          base_url: checkRoutes ? baseUrl : null,
          totals: dataTotals(data),
          issue_counts: {
            P0: grouped.P0.length,
            P1: grouped.P1.length,
            P2: grouped.P2.length,
            P3: grouped.P3.length,
          },
          issues,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("Slug Data Audit Report");
  console.log("======================");
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Route checks: ${checkRoutes ? `enabled (${baseUrl}, limit=${routeLimit || "all"})` : "skipped"}`);
  console.log("");
  console.log("Data totals:");
  for (const [label, count] of Object.entries(dataTotals(data))) {
    console.log(`- ${label}: ${count}`);
  }
  console.log("");

  for (const severity of ["P0", "P1", "P2", "P3"] as Severity[]) {
    const severityIssues = grouped[severity];
    console.log(`${severity} - ${severityLabel(severity)} (${severityIssues.length})`);
    if (severityIssues.length === 0) {
      console.log("- None");
      console.log("");
      continue;
    }

    for (const issue of severityIssues.slice(0, maxExamples)) {
      const location = [issue.entity, issue.id ? `id=${issue.id}` : undefined, issue.slug ? `slug=${issue.slug}` : undefined, issue.path ? `path=${issue.path}` : undefined]
        .filter(Boolean)
        .join(" | ");
      console.log(`- [${issue.code}] ${issue.title}`);
      console.log(`  ${location}`);
      console.log(`  ${issue.details}`);
      if (issue.recommendation) console.log(`  Fix: ${issue.recommendation}`);
    }

    if (severityIssues.length > maxExamples) {
      console.log(`- ... ${severityIssues.length - maxExamples} more. Rerun with --json or --max-examples=${severityIssues.length} for full detail.`);
    }
    console.log("");
  }

  if (!checkRoutes) {
    console.log("Route, sitemap, canonical, and legacy /en checks were not executed.");
    console.log("Run: npm run audit:slugs -- --check-routes --base-url=http://localhost:3000");
  }
}

function dataTotals(data: AuditData): Record<string, number> {
  return {
    listings: data.listings.length,
    listing_slugs: data.listingSlugs.length,
    categories: data.categories.length,
    cities: data.cities.length,
    regions: data.regions.length,
    blog_posts: data.blogPosts.length,
    events: data.events.length,
    pages: data.pages.length,
    footer_sections: data.footerSections.length,
    listing_translations: data.listingTranslations.length,
    category_translations: data.categoryTranslations.length,
    city_translations: data.cityTranslations.length,
    region_translations: data.regionTranslations.length,
    blog_post_translations: data.blogPostTranslations.length,
    city_region_mapping: data.cityRegionMappings.length,
    golf_courses: data.golfCourses.length,
  };
}

function severityLabel(severity: Severity): string {
  switch (severity) {
    case "P0":
      return "Must fix before production";
    case "P1":
      return "Should fix before production";
    case "P2":
      return "SEO/data hygiene";
    case "P3":
      return "Nice to improve";
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main(): Promise<void> {
  const data = await fetchAuditData();
  auditData(data);
  if (checkRoutes) {
    await auditRoutes(data);
  }
  printReport(data);

  if (issues.some((issue) => issue.severity === "P0")) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
