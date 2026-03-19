export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Tables } from "@/integrations/supabase/types";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildWebPageSchema,
} from "@/lib/seo/schemaBuilders.js";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import {
  RealEstateDirectoryClient,
  type RealEstateCategory,
  type RealEstateListing,
} from "@/components/real-estate/RealEstateDirectoryClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";
const FALLBACK_TITLE =
  "Algarve Real Estate Directory: Villas, Apartments & Investment Property | AlgarveOfficial";
const FALLBACK_DESCRIPTION =
  "Browse luxury villas, apartments and investment properties across the Algarve, with dedicated filters for premium homes and real estate opportunities.";
const REAL_ESTATE_META_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
] as const;

type GlobalSettingRow = Pick<Tables<"global_settings">, "key" | "value" | "category">;

interface RealEstatePageData {
  category: RealEstateCategory;
  listings: RealEstateListing[];
  globalSettings: GlobalSettingRow[];
}

function normalizeRealEstateListings(rows: unknown[]): RealEstateListing[] {
  return (rows ?? []).map((row) => {
    const item = row as RealEstateListing & {
      cities?: RealEstateListing["cities"] | RealEstateListing["cities"][];
    };

    return {
      ...item,
      cities: Array.isArray(item.cities) ? (item.cities[0] ?? null) : (item.cities ?? null),
    };
  }) as RealEstateListing[];
}

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key.trim()] = value;
    }
  });

  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const normalizedPage: CmsPageConfigMap[string] = {};

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

function buildCmsHelpers(globalSettings: GlobalSettingRow[]) {
  const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value ?? "";
    return acc;
  }, {});

  const textOverrides = normalizeTextOverrides(
    parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
  );
  const pageConfigs = normalizePageConfigs(
    parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
  );
  const pageConfig = pageConfigs["real-estate"] ?? {};
  const pageText = pageConfig.text ?? {};

  const getText = (textKey: string, fallback: string) =>
    pageText[textKey] ??
    textOverrides[`real-estate.${textKey}`] ??
    textOverrides[textKey] ??
    fallback;

  return {
    getMetaTitle: (fallback: string) => pageConfig.meta?.title ?? getText("meta.title", fallback),
    getMetaDescription: (fallback: string) =>
      pageConfig.meta?.description ?? getText("meta.description", fallback),
  };
}

const getRealEstatePageData = cache(async (): Promise<RealEstatePageData | null> => {
  const supabase = await createClient();

  const [categoryResponse, globalSettingsResponse] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", "real-estate")
      .eq("is_active", true)
      .single(),
    supabase
      .from("global_settings")
      .select("key, value, category")
      .in("key", [...REAL_ESTATE_META_KEYS])
      .order("key", { ascending: true }),
  ]);

  if (categoryResponse.error) {
    if (categoryResponse.error.code === "PGRST116") {
      return null;
    }
    throw categoryResponse.error;
  }

  if (globalSettingsResponse.error) {
    throw globalSettingsResponse.error;
  }

  const category = categoryResponse.data as RealEstateCategory;

  const { data: listingData, error: listingsError } = await supabase
    .from("listings")
    .select(`
      id,
      slug,
      name,
      short_description,
      featured_image_url,
      price_from,
      tier,
      category_data,
      cities (
        id,
        name,
        slug
      )
    `)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(48);

  if (listingsError) {
    throw listingsError;
  }

  return {
    category,
    listings: normalizeRealEstateListings(listingData ?? []),
    globalSettings: (globalSettingsResponse.data ?? []) as GlobalSettingRow[],
  };
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getRealEstatePageData();
  const cms = buildCmsHelpers(data?.globalSettings ?? []);

  return buildMetadata({
    title: cms.getMetaTitle(FALLBACK_TITLE),
    description: cms.getMetaDescription(FALLBACK_DESCRIPTION),
    path: "/real-estate",
  });
}

export default async function RealEstatePage() {
  const data = await getRealEstatePageData();

  if (!data) {
    notFound();
  }

  const { category, listings } = data;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Real Estate", url: `${SITE_URL}/real-estate` },
  ]);

  const collectionPageSchema = buildWebPageSchema({
    type: "CollectionPage",
    name: "Algarve Real Estate Directory",
    description: FALLBACK_DESCRIPTION,
    url: `${SITE_URL}/real-estate`,
    image: `${SITE_URL}/og-image.jpg`,
  });

  const itemListSchema = buildItemListSchema({
    name: "Algarve Real Estate Listings",
    url: `${SITE_URL}/real-estate`,
    description: FALLBACK_DESCRIPTION,
    items: listings.map((listing) => ({
      name: listing.name,
      url: `${SITE_URL}/listing/${listing.slug || listing.id}`,
      description: listing.short_description || undefined,
      image: listing.featured_image_url || undefined,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div id="real-estate-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">Invest</p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              Independent Real Estate Directory
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Browse premium villas, apartments, and investment properties across the Algarve with
              dedicated real-estate filters and a standalone property catalogue.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-4 py-2">
                {listings.length} properties available
              </span>
              <span className="rounded-full border border-border px-4 py-2">{category.name}</span>
            </div>
          </section>
        </main>
      </div>

      <RealEstateDirectoryClient initialCategory={category} initialListings={listings} />
    </>
  );
}
