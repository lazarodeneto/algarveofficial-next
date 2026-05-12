#!/usr/bin/env node
/**
 * Browser-backed route smoke test for slug and locale routes.
 *
 * Usage:
 *   npm run smoke:routes
 *   npm run smoke:routes -- --base-url=http://localhost:3000
 *   npm run smoke:routes -- --output=output/playwright/route-smoke-report.md
 *   npm run smoke:routes -- --json
 */

import fs from "node:fs";
import path from "node:path";
import { chromium, type BrowserContext, type Request, type Response } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "../lib/i18n/locales";
import { DEFAULT_LOCALE_USES_PREFIX } from "../lib/i18n/default-locale-policy";
import { getCategoryDisplayName, getCategoryUrlSlug } from "../lib/seo/programmatic/category-slugs";

type SmokeGroup = "public" | "localized" | "legacy" | "admin" | "api";
type SmokeKind = "page" | "api";

interface SmokeTarget {
  group: SmokeGroup;
  kind?: SmokeKind;
  label: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  expectedText?: string;
  expectedFinalPath?: string;
  expectedRedirectPath?: string;
  expectedCanonicalPath?: string;
  expectAuthRedirect?: boolean;
  expectStatus?: number[];
  expectCanonical?: boolean;
  expectHreflang?: boolean;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

interface ListingRow {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
}

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  status?: string | null;
}

interface CityRow {
  id: string;
  name: string;
  slug: string;
}

interface RegionRow {
  id: string;
  name: string;
  slug: string;
}

interface ListingSlugAliasRow {
  listing_id: string;
  slug: string;
  is_current: boolean;
}

type SupabaseQuery = any;

interface RouteSeeds {
  golfListing: ListingRow;
  propertyListing: ListingRow | null;
  blogPost: BlogPostRow | null;
  category: CategoryRow;
  city: CityRow;
  region: RegionRow;
  oldListingSlug: { oldSlug: string; currentSlug: string; name: string } | null;
}

interface RedirectStep {
  url: string;
  status: number | null;
  location: string | null;
}

interface SmokeResult {
  group: SmokeGroup;
  label: string;
  path: string;
  method: string;
  initialStatus: number | null;
  finalStatus: number | null;
  redirectTarget: string | null;
  finalUrl: string;
  canonical: string | null;
  hreflangCount: number;
  hasXDefault: boolean;
  entityCheck: "pass" | "fail" | "not-checked" | "auth-redirect";
  rendersWithoutErrors: boolean;
  consoleErrors: string[];
  serverErrors: string[];
  pass: boolean;
  notes: string[];
  redirectChain: RedirectStep[];
}

const args = process.argv.slice(2);
const baseUrl = stripTrailingSlash(
  stringArg("--base-url") ?? process.env.ROUTE_SMOKE_BASE_URL ?? "http://localhost:3000",
);
const jsonOutput = hasFlag("--json");
const outputPath = stringArg("--output");
const routeTimeoutMs = numberArg("--timeout", 20_000);

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function stringArg(name: string): string | undefined {
  const prefix = `${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function numberArg(name: string, fallback: number): number {
  const raw = stringArg(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
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

function localizedPath(locale: AppLocale, pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === DEFAULT_LOCALE && !DEFAULT_LOCALE_USES_PREFIX) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${baseUrl}/`).toString();
}

function pathnameOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value, `${baseUrl}/`).pathname;
  } catch {
    return null;
  }
}

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function textContains(bodyText: string, expectedText: string): boolean {
  return normalizeForMatch(bodyText).includes(normalizeForMatch(expectedText));
}

function isIgnorableSmokeConsoleError(message: string): boolean {
  return (
    /failed to load resource: net::ERR_BLOCKED_BY_RESPONSE\.NotSameSite/i.test(message) ||
    /the server could not finish this Suspense boundary/i.test(message)
  );
}

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function fetchSingle<T>(
  client: SupabaseClient,
  table: string,
  select: string,
  build: (query: SupabaseQuery) => unknown,
): Promise<T | null> {
  const query = client.from(table).select(select) as SupabaseQuery;
  const response = await (build(query) as PromiseLike<{ data: unknown; error: { message: string } | null }>);
  if (response.error) return null;
  if (Array.isArray(response.data)) return (response.data[0] as T | undefined) ?? null;
  return (response.data as T | null) ?? null;
}

async function fetchMany<T>(
  client: SupabaseClient,
  table: string,
  select: string,
  build: (query: SupabaseQuery) => unknown,
): Promise<T[]> {
  const query = client.from(table).select(select) as SupabaseQuery;
  const response = await (build(query) as PromiseLike<{ data: unknown; error: { message: string } | null }>);
  if (response.error || !Array.isArray(response.data)) return [];
  return response.data as T[];
}

async function getRouteSeeds(): Promise<RouteSeeds> {
  const fallbackGolf: ListingRow = {
    id: "the-els-club-vilamoura",
    name: "The Els Club Vilamoura",
    slug: "the-els-club-vilamoura",
    status: "published",
  };
  const fallbackCategory: CategoryRow = {
    id: "restaurants",
    name: "Restaurants",
    slug: "restaurants",
  };
  const fallbackCity: CityRow = {
    id: "lagos",
    name: "Lagos",
    slug: "lagos",
  };
  const fallbackRegion: RegionRow = {
    id: "golden-triangle",
    name: "Golden Triangle",
    slug: "golden-triangle",
  };

  const client = getSupabaseClient();
  if (!client) {
    return {
      golfListing: fallbackGolf,
      propertyListing: null,
      blogPost: null,
      category: fallbackCategory,
      city: fallbackCity,
      region: fallbackRegion,
      oldListingSlug: null,
    };
  }

  const categories = await fetchMany<CategoryRow>(
    client,
    "categories",
    "id,name,slug",
    (query) => query.in("slug", ["golf", "real-estate", "restaurants"]).order("slug"),
  );
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  const golfListing =
    await fetchSingle<ListingRow>(
      client,
      "listings",
      "id,name,slug,status",
      (query) => query.eq("slug", fallbackGolf.slug).limit(1),
    ) ??
    (categoryBySlug.get("golf")
      ? await fetchSingle<ListingRow>(
          client,
          "listings",
          "id,name,slug,status",
          (query) => query
            .eq("category_id", categoryBySlug.get("golf")?.id)
            .eq("status", "published")
            .order("updated_at", { ascending: false })
            .limit(1),
        )
      : null) ??
    fallbackGolf;

  const propertyListing = categoryBySlug.get("real-estate")
    ? await fetchSingle<ListingRow>(
        client,
        "listings",
        "id,name,slug,status",
        (query) => query
          .eq("category_id", categoryBySlug.get("real-estate")?.id)
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(1),
      )
    : null;

  const blogPost = await fetchSingle<BlogPostRow>(
    client,
    "blog_posts",
    "id,title,slug,status",
    (query) => query.eq("status", "published").order("published_at", { ascending: false }).limit(1),
  );

  const city =
    await fetchSingle<CityRow>(
      client,
      "cities",
      "id,name,slug",
      (query) => query.eq("slug", fallbackCity.slug).limit(1),
    ) ?? fallbackCity;

  const region =
    await fetchSingle<RegionRow>(
      client,
      "regions",
      "id,name,slug",
      (query) => query.eq("slug", fallbackRegion.slug).limit(1),
    ) ?? fallbackRegion;

  const aliasRows = await fetchMany<ListingSlugAliasRow>(
    client,
    "listing_slugs",
    "listing_id,slug,is_current",
    (query) => query.eq("is_current", false).limit(10),
  );
  let oldListingSlug: RouteSeeds["oldListingSlug"] = null;
  for (const alias of aliasRows) {
    const listing = await fetchSingle<ListingRow>(
      client,
      "listings",
      "id,name,slug,status",
      (query) => query.eq("id", alias.listing_id).limit(1),
    );
    if (listing?.slug && listing.slug !== alias.slug) {
      oldListingSlug = {
        oldSlug: alias.slug,
        currentSlug: listing.slug,
        name: listing.name,
      };
      break;
    }
  }

  return {
    golfListing,
    propertyListing,
    blogPost,
    category: categoryBySlug.get("restaurants") ?? fallbackCategory,
    city,
    region,
    oldListingSlug,
  };
}

function buildTargets(seeds: RouteSeeds): SmokeTarget[] {
  const targets: SmokeTarget[] = [
    {
      group: "public",
      label: "home",
      path: "/",
      expectedText: "Algarve",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "golf landing",
      path: "/golf",
      expectedText: "Golf",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "beaches landing",
      path: "/beaches",
      expectedText: "Beaches",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "events",
      path: "/events",
      expectedText: "Events",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "relocation",
      path: "/relocation",
      expectedText: "Relocation",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "golf courses",
      path: "/golf/courses",
      expectedText: "Golf",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "golf course detail",
      path: `/golf/courses/${seeds.golfListing.slug}`,
      expectedText: seeds.golfListing.name,
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "invalid golf course slug",
      path: "/golf/courses/not-a-real-course",
      expectStatus: [404],
    },
    {
      group: "public",
      label: "properties",
      path: "/properties",
      expectedText: "Properties",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "real estate alias",
      path: "/real-estate",
      expectedText: "Real Estate",
      expectedCanonicalPath: "/properties",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "map",
      path: "/map",
      expectedText: "Map",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "blog",
      path: "/blog",
      expectedText: "Blog",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "restaurants alias",
      path: "/restaurants",
      expectedText: seeds.category.name,
      expectedFinalPath: `/category/${getCategoryUrlSlug("restaurants", DEFAULT_LOCALE)}`,
      expectedRedirectPath: `/category/${getCategoryUrlSlug("restaurants", DEFAULT_LOCALE)}`,
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "category detail",
      path: `/category/${getCategoryUrlSlug("restaurants", DEFAULT_LOCALE)}`,
      expectedText: seeds.category.name,
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "city detail",
      path: `/visit/${seeds.city.slug}`,
      expectedText: seeds.city.name,
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "public",
      label: "region detail",
      path: `/destinations/${seeds.region.slug}`,
      expectedText: seeds.region.name,
      expectCanonical: true,
      expectHreflang: true,
    },
  ];

  if (seeds.propertyListing) {
    targets.push(
      {
        group: "public",
        label: "property detail alias",
        path: `/properties/${seeds.propertyListing.slug}`,
        expectedText: seeds.propertyListing.name,
        expectedFinalPath: `/listing/${seeds.propertyListing.slug}`,
        expectedRedirectPath: `/listing/${seeds.propertyListing.slug}`,
        expectCanonical: true,
        expectHreflang: true,
      },
      {
        group: "public",
        label: "property canonical listing",
        path: `/listing/${seeds.propertyListing.slug}`,
        expectedText: seeds.propertyListing.name,
        expectCanonical: true,
        expectHreflang: true,
      },
    );
  }

  if (seeds.blogPost) {
    targets.push({
      group: "public",
      label: "blog post detail",
      path: `/blog/${seeds.blogPost.slug}`,
      expectedText: seeds.blogPost.title,
      expectCanonical: true,
      expectHreflang: true,
    });
  }

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    targets.push(
      {
        group: "localized",
        label: `${locale} home`,
        path: localizedPath(locale, "/"),
        expectedText: "Algarve",
        expectCanonical: true,
        expectHreflang: true,
      },
      {
        group: "localized",
        label: `${locale} golf landing`,
        path: localizedPath(locale, "/golf"),
        expectedText: "Golf",
        expectCanonical: true,
        expectHreflang: true,
      },
      {
        group: "localized",
        label: `${locale} golf course detail`,
        path: localizedPath(locale, `/golf/courses/${seeds.golfListing.slug}`),
        expectedText: seeds.golfListing.name,
        expectCanonical: true,
        expectHreflang: true,
      },
      {
        group: "localized",
        label: `${locale} category detail`,
        path: localizedPath(locale, `/category/${getCategoryUrlSlug("restaurants", locale)}`),
        expectedText: getCategoryDisplayName("restaurants", locale),
        expectCanonical: true,
        expectHreflang: true,
      },
    );
  }

  targets.push(
    {
      group: "legacy",
      label: "legacy /en home",
      path: "/en",
      expectedText: "Algarve",
      expectedCanonicalPath: "/",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "legacy",
      label: "legacy /en golf",
      path: "/en/golf",
      expectedText: "Golf",
      expectedCanonicalPath: "/golf",
      expectCanonical: true,
      expectHreflang: true,
    },
    {
      group: "legacy",
      label: "legacy /en golf course",
      path: `/en/golf/courses/${seeds.golfListing.slug}`,
      expectedText: seeds.golfListing.name,
      expectedCanonicalPath: `/golf/courses/${seeds.golfListing.slug}`,
      expectCanonical: true,
      expectHreflang: true,
    },
  );

  if (seeds.oldListingSlug) {
    targets.push({
      group: "legacy",
      label: "old listing slug",
      path: `/listing/${seeds.oldListingSlug.oldSlug}`,
      expectedText: seeds.oldListingSlug.name,
      expectedFinalPath: `/listing/${seeds.oldListingSlug.currentSlug}`,
      expectedRedirectPath: `/listing/${seeds.oldListingSlug.currentSlug}`,
      expectCanonical: true,
      expectHreflang: true,
    });
  }

  targets.push(
    {
      group: "admin",
      label: "admin overview",
      path: "/admin",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin listings",
      path: "/admin/listings",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin listing edit",
      path: `/admin/listings/${seeds.propertyListing?.id ?? seeds.golfListing.id}`,
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin categories",
      path: "/admin/categories",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin events",
      path: "/admin/events",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin blog",
      path: "/admin/blog",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin full page builder alias",
      path: "/admin/full-page-builder",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin content page builder",
      path: "/admin/content/page-builder?page=beaches",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin inbox",
      path: "/admin/inbox",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin regions",
      path: "/admin/regions",
      expectAuthRedirect: true,
    },
    {
      group: "admin",
      label: "admin cities",
      path: "/admin/cities",
      expectAuthRedirect: true,
    },
    {
      group: "api",
      kind: "api",
      label: "sitemap",
      path: "/sitemap.xml",
      expectStatus: [200],
    },
    {
      group: "api",
      kind: "api",
      label: "importer dry-run API",
      path: "/api/admin/listings/import",
      method: "POST",
      body: { dry_run: true, listings: [] },
      expectStatus: [401, 403],
    },
  );

  return targets;
}

async function getRedirectChain(finalResponse: Response | null): Promise<RedirectStep[]> {
  if (!finalResponse) return [];

  const steps: RedirectStep[] = [];
  let request: Request | null = finalResponse.request();
  while (request) {
    const response = await request.response();
    steps.unshift({
      url: request.url(),
      status: response?.status() ?? null,
      location: response?.headers().location ?? null,
    });
    request = request.redirectedFrom();
  }
  return steps;
}

function firstRedirectTarget(chain: RedirectStep[]): string | null {
  const redirect = chain.find((step) => step.status !== null && step.status >= 300 && step.status < 400 && step.location);
  if (!redirect?.location) return null;
  return new URL(redirect.location, redirect.url).toString();
}

async function inspectPage(context: BrowserContext, target: SmokeTarget): Promise<SmokeResult> {
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const serverErrors: string[] = [];
  const requestFailures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure();
    if (failure) requestFailures.push(`${failure.errorText} ${request.url()}`);
  });

  const notes: string[] = [];
  let response: Response | null = null;
  try {
    response = await page.goto(absoluteUrl(target.path), {
      waitUntil: "domcontentloaded",
      timeout: routeTimeoutMs,
    });
    if (target.expectedText) {
      await page.getByText(target.expectedText).first().waitFor({
        state: "visible",
        timeout: Math.min(routeTimeoutMs, 8_000),
      }).catch(() => undefined);
    }
    await page.waitForLoadState("networkidle", { timeout: Math.min(routeTimeoutMs, 8_000) }).catch(() => undefined);
  } catch (error) {
    notes.push(error instanceof Error ? error.message : String(error));
  }

  const redirectChain = await getRedirectChain(response);
  const finalUrl = page.url();
  const finalStatus = response?.status() ?? null;
  const initialStatus = redirectChain[0]?.status ?? finalStatus;
  const redirectTarget = firstRedirectTarget(redirectChain);
  const bodyText = await page.locator("body").innerText({ timeout: 2_000 }).catch(() => "");
  const canonical = await page
    .locator('link[rel="canonical"]')
    .first()
    .getAttribute("href", { timeout: 1_000 })
    .catch(() => null);
  const hreflangLinks = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("hreflang")).filter(Boolean))
    .catch(() => [] as string[]) as string[];

  const observedConsoleErrors = [...consoleErrors];
  const observedServerErrors = [...serverErrors];
  const routeRelevantConsoleErrors = observedConsoleErrors.filter(
    (error) => !isIgnorableSmokeConsoleError(error),
  );
  const finalPath = pathnameOf(finalUrl);
  const redirectPath = pathnameOf(redirectTarget);
  const canonicalPath = pathnameOf(canonical);
  const statusOk = target.expectStatus
    ? finalStatus !== null && target.expectStatus.includes(finalStatus)
    : finalStatus !== null && finalStatus < 400;
  const finalPathOk = !target.expectedFinalPath || finalPath === target.expectedFinalPath;
  const redirectOk = !target.expectedRedirectPath || redirectPath === target.expectedRedirectPath;
  const canonicalPathOk = !target.expectedCanonicalPath || canonicalPath === target.expectedCanonicalPath;
  const authRedirectOk = !target.expectAuthRedirect || finalPath?.endsWith("/login") === true;
  const canonicalOk = !target.expectCanonical || Boolean(canonical);
  const hreflangOk = !target.expectHreflang || hreflangLinks.length > 0;
  const expectsClientErrorStatus = target.expectStatus?.some((status) => status >= 400 && status < 500) ?? false;
  const toleratedConsoleErrors = expectsClientErrorStatus
    ? routeRelevantConsoleErrors.filter((error) => !/failed to load resource: the server responded with a status of 4\d\d/i.test(error))
    : routeRelevantConsoleErrors;
  const toleratedServerErrors = expectsClientErrorStatus
    ? observedServerErrors.filter((error) => !/^4\d\d\s/.test(error))
    : observedServerErrors;
  const rendersWithoutErrors = toleratedConsoleErrors.length === 0 && toleratedServerErrors.length === 0;
  const entityCheck = target.expectAuthRedirect
    ? authRedirectOk
      ? "auth-redirect"
      : "fail"
    : target.expectedText
      ? textContains(bodyText, target.expectedText)
        ? "pass"
        : "fail"
      : "not-checked";
  const entityOk = entityCheck === "pass" || entityCheck === "not-checked" || entityCheck === "auth-redirect";
  const pass = statusOk && finalPathOk && redirectOk && canonicalPathOk && authRedirectOk && canonicalOk && hreflangOk && rendersWithoutErrors && entityOk;

  if (requestFailures.length > 0) {
    notes.push(`request failures: ${requestFailures.slice(0, 3).join("; ")}`);
  }

  await page.close();

  return {
    group: target.group,
    label: target.label,
    path: target.path,
    method: target.method ?? "GET",
    initialStatus,
    finalStatus,
    redirectTarget,
    finalUrl,
    canonical,
    hreflangCount: hreflangLinks.length,
    hasXDefault: hreflangLinks.includes("x-default"),
    entityCheck,
    rendersWithoutErrors,
    consoleErrors: observedConsoleErrors,
    serverErrors: observedServerErrors,
    pass,
    notes,
    redirectChain,
  };
}

async function inspectApi(target: SmokeTarget): Promise<SmokeResult> {
  const response = await fetch(absoluteUrl(target.path), {
    method: target.method ?? "GET",
    headers: {
      "content-type": "application/json",
    },
    body: target.body === undefined ? undefined : JSON.stringify(target.body),
    redirect: "manual",
    signal: AbortSignal.timeout(routeTimeoutMs),
  });

  const redirectTarget = response.headers.get("location");
  const statusOk = target.expectStatus ? target.expectStatus.includes(response.status) : response.status < 400;

  return {
    group: target.group,
    label: target.label,
    path: target.path,
    method: target.method ?? "GET",
    initialStatus: response.status,
    finalStatus: response.status,
    redirectTarget,
    finalUrl: absoluteUrl(target.path),
    canonical: null,
    hreflangCount: 0,
    hasXDefault: false,
    entityCheck: "not-checked",
    rendersWithoutErrors: response.status < 500,
    consoleErrors: [],
    serverErrors: response.status >= 500 ? [`${response.status} ${target.path}`] : [],
    pass: statusOk && response.status < 500,
    notes: [],
    redirectChain: [
      {
        url: absoluteUrl(target.path),
        status: response.status,
        location: redirectTarget,
      },
    ],
  };
}

function statusText(result: SmokeResult): string {
  if (result.initialStatus !== result.finalStatus && result.initialStatus !== null && result.finalStatus !== null) {
    return `${result.initialStatus}->${result.finalStatus}`;
  }
  return String(result.finalStatus ?? result.initialStatus ?? "ERR");
}

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function truncate(value: string | null, max = 72): string {
  if (!value) return "";
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatMarkdown(results: SmokeResult[]): string {
  const generatedAt = new Date().toISOString();
  const passed = results.filter((result) => result.pass).length;
  const failed = results.length - passed;
  const lines = [
    "# Route Smoke Report",
    "",
    `Generated: ${generatedAt}`,
    `Base URL: ${baseUrl}`,
    `Result: ${passed}/${results.length} passed, ${failed} failed`,
    "",
    "| Result | Group | Label | URL | Status | Redirect target | Final URL | Canonical tag | Hreflang | Entity | No console/server errors |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const result of results) {
    lines.push([
      result.pass ? "PASS" : "FAIL",
      result.group,
      result.label,
      result.path,
      statusText(result),
      truncate(pathnameOf(result.redirectTarget) ?? result.redirectTarget),
      truncate(pathnameOf(result.finalUrl) ?? result.finalUrl),
      result.canonical ? truncate(result.canonical) : "missing",
      `${result.hreflangCount}${result.hasXDefault ? " + x-default" : ""}`,
      result.entityCheck,
      yesNo(result.rendersWithoutErrors),
    ].map((cell) => escapeCell(String(cell))).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  const failures = results.filter((result) => !result.pass);
  if (failures.length > 0) {
    lines.push("", "## Failures", "");
    for (const result of failures) {
      lines.push(`- ${result.group}/${result.label} ${result.path}`);
      lines.push(`  - status: ${statusText(result)}, final: ${result.finalUrl}`);
      if (result.redirectTarget) lines.push(`  - redirect: ${result.redirectTarget}`);
      if (!result.canonical) lines.push("  - canonical: missing");
      if (result.hreflangCount === 0) lines.push("  - hreflang: missing");
      if (result.entityCheck === "fail") lines.push("  - entity: expected text not found");
      if (result.consoleErrors.length > 0) {
        lines.push(`  - console: ${result.consoleErrors.slice(0, 2).join("; ")}`);
      }
      if (result.serverErrors.length > 0) {
        lines.push(`  - server: ${result.serverErrors.slice(0, 2).join("; ")}`);
      }
      for (const note of result.notes.slice(0, 2)) {
        lines.push(`  - note: ${note}`);
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));
  loadEnvFile(path.join(process.cwd(), ".env"));

  const seeds = await getRouteSeeds();
  const targets = buildTargets(seeds);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await context.route(/\/rest\/v1\/site_settings(?:\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "default",
        primary_color: "rgba(212, 166, 42, 1)",
        secondary_color: "rgba(15, 23, 42, 1)",
        accent_color: "rgba(212, 166, 42, 1)",
        site_name: "AlgarveOfficial",
        tagline: "Curated Algarve guide",
        updated_at: new Date().toISOString(),
        maintenance_mode: false,
        maintenance_message: "",
        maintenance_ip_whitelist: [],
      }),
    });
  });
  const results: SmokeResult[] = [];

  try {
    for (const target of targets) {
      const result = target.kind === "api"
        ? await inspectApi(target)
        : await inspectPage(context, target);
      results.push(result);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ baseUrl, results }, null, 2));
  } else {
    const report = formatMarkdown(results);
    console.log(report);
    if (outputPath) {
      const absoluteOutputPath = path.resolve(process.cwd(), outputPath);
      fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
      fs.writeFileSync(absoluteOutputPath, report, "utf8");
    }
  }

  if (results.some((result) => !result.pass)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
