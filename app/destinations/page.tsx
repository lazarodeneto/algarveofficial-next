export const dynamic = 'force-dynamic'; // Server-render on demand — never pre-build
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import type { Tables } from "@/integrations/supabase/types";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/schemaBuilders.js";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getRegionImageSet } from "@/lib/regionImages";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { DestinationsClient } from "@/components/destinations/DestinationsClient";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";

const DESTINATIONS_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

type RegionRow = Tables<"regions">;
type GlobalSettingRow = Pick<Tables<"global_settings">, "key" | "value" | "category">;

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

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: NonNullable<CmsPageConfigMap[string]["blocks"]> = {};

      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isPlainRecord(rawBlock)) return;

        const block: NonNullable<NonNullable<CmsPageConfigMap[string]["blocks"]>[string]> = {};
        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;

        if (isPlainRecord(rawBlock.style)) {
          const style: Record<string, string | number> = {};
          Object.entries(rawBlock.style).forEach(([styleKey, styleValue]) => {
            if (typeof styleValue === "string" || typeof styleValue === "number") {
              style[styleKey] = styleValue;
            }
          });
          block.style = style;
        }

        blocks[blockId] = block;
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
  const pageConfig = pageConfigs.destinations ?? {};
  const pageText = pageConfig.text ?? {};
  const blocks = pageConfig.blocks ?? {};

  const getText = (textKey: string, fallback: string) =>
    pageText[textKey] ??
    textOverrides[`destinations.${textKey}`] ??
    textOverrides[textKey] ??
    fallback;

  const getMetaTitle = (fallback: string) => pageConfig.meta?.title ?? getText("meta.title", fallback);
  const getMetaDescription = (fallback: string) =>
    pageConfig.meta?.description ?? getText("meta.description", fallback);

  const isBlockEnabled = (blockId: string, fallback = true) => {
    const configured = blocks[blockId]?.enabled;
    return typeof configured === "boolean" ? configured : fallback;
  };

  return {
    getText,
    getMetaTitle,
    getMetaDescription,
    isBlockEnabled,
  };
}

function normalizeSettingKeys(keys: readonly string[]) {
  return Array.from(new Set(keys)).sort();
}

function buildFallbackDescription(regions: RegionRow[]) {
  const names = regions
    .map((region) => region.name?.trim())
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);

  if (names.length >= 2) {
    return `Explore the Algarve's most prestigious destinations — from ${names.join(", ")} and beyond.`;
  }

  return "Explore the Algarve's most prestigious destinations — from the Golden Triangle to Tavira and beyond.";
}

const getDestinationsPageData = cache(async () => {
  const supabase = await createClient();
  const globalSettingKeys = normalizeSettingKeys(DESTINATIONS_CMS_KEYS);

  const [regionsResponse, globalSettingsResponse] = await Promise.all([
    supabase
      .from("regions")
      .select("*")
      .eq("is_visible_destinations", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("global_settings")
      .select("key, value, category")
      .in("key", globalSettingKeys)
      .order("key", { ascending: true }),
  ]);

  if (regionsResponse.error) throw regionsResponse.error;
  if (globalSettingsResponse.error) throw globalSettingsResponse.error;

  const regions = (regionsResponse.data ?? []) as RegionRow[];
  const globalSettings = (globalSettingsResponse.data ?? []) as GlobalSettingRow[];

  return { regions, globalSettings };
});

export async function generateMetadata(): Promise<Metadata> {
  const { regions, globalSettings } = await getDestinationsPageData();
  const cms = buildCmsHelpers(globalSettings);

  const fallbackTitle = "Premium Destinations in the Algarve | AlgarveOfficial";
  const fallbackDescription = buildFallbackDescription(regions);

  return buildMetadata({
    title: cms.getMetaTitle(fallbackTitle),
    description: cms.getMetaDescription(fallbackDescription),
    path: "/destinations",
  });
}

export default async function DestinationsPage() {
  const { regions, globalSettings } = await getDestinationsPageData();
  const cms = buildCmsHelpers(globalSettings);

  const featuredRegions = regions.filter((region) => region.is_featured);
  const otherRegions = regions.filter((region) => !region.is_featured);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Destinations", url: `${SITE_URL}/destinations` },
  ]);

  const itemListSchema = buildItemListSchema({
    name: "Destinations in the Algarve",
    url: `${SITE_URL}/destinations`,
    description: cms.getMetaDescription(buildFallbackDescription(regions)),
    items: regions
      .filter((region) => Boolean(region.slug))
      .map((region) => ({
        name: region.name,
        url: `${SITE_URL}/destinations/${region.slug}`,
        description: region.short_description || region.description || undefined,
        image:
          region.hero_image_url ||
          region.image_url ||
          getRegionImageSet(region.slug, { includeAliases: true })?.image,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div id="destinations-server-shell" className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/60 bg-[var(--colour-ink)] text-white">
          <div className="app-container flex items-center justify-between py-5">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              <span className="text-gradient-gold">Algarve</span>
              <span className="text-white">Official</span>
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              <Link href="/directory" className="hover:text-primary">Directory</Link>
              <Link href="/destinations" className="hover:text-primary">Destinations</Link>
              <Link href="/events" className="hover:text-primary">Events</Link>
              <Link href="/partner" className="hover:text-primary">Partner</Link>
            </nav>
          </div>
        </header>

        {cms.isBlockEnabled("hero", true) ? (
          <section className="px-0 sm:px-4 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4">
            <LiveStyleHero
              badge="Destinations"
              title="The Algarve's most sought-after destinations"
              subtitle={cms.getText(
                "seo.description",
                "Explore coastal enclaves, golf communities and heritage towns across Portugal's most prestigious shoreline.",
              )}
              media={<PageHeroImage page="destinations" alt="Scenic Algarve destination coastline" />}
              ctas={
                <>
                  <Link href="/directory" className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90">
                    Browse Premium Listings
                  </Link>
                  <Link href="/live" className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-primary hover:text-primary">
                    Plan Relocation
                  </Link>
                </>
              }
            />
          </section>
        ) : null}

        {cms.isBlockEnabled("featured-regions", true) && featuredRegions.length > 0 ? (
          <section className="py-16 lg:py-24">
            <div className="app-container content-max">
              <div className="mb-12 text-center">
                <h2 className="text-title font-serif font-medium text-foreground">Featured destinations</h2>
                <p className="mt-2 text-body text-muted-foreground">Standout locations across the Algarve coast.</p>
              </div>
              <div className="flex-grid-centered">
                {featuredRegions.map((region) => {
                  const image = getRegionImageSet(region.slug, { includeAliases: true });
                  const imageSrc = normalizePublicImageUrl(
                    image
                      ? typeof image.image === "string"
                        ? image.image
                        : image.image.src
                      : region.hero_image_url || region.image_url || "",
                  );

                  return (
                    <Link
                      key={region.id}
                      href={`/destinations/${region.slug}`}
                      className="glass-box group relative overflow-hidden rounded-xl aspect-[4/5] luxury-card cursor-pointer block"
                    >
                      <div className="absolute inset-0">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={region.name}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                            <span className="text-muted-foreground/30">Algarve</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                      </div>
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <span className="text-xs font-medium text-primary tracking-wider uppercase mb-2">Algarve Region</span>
                        <h3 className="text-2xl lg:text-3xl font-serif font-medium text-white mb-2">{region.name}</h3>
                        <p className="text-sm lg:text-base text-white/80 mb-4">
                          {region.short_description || region.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {otherRegions.length > 0 && cms.isBlockEnabled("other-regions", true) ? (
          <section className="py-16 lg:py-24 bg-card">
            <div className="app-container content-max">
              <div className="mb-12 text-center">
                <h2 className="text-title font-serif font-medium text-foreground">More destinations</h2>
                <p className="mt-2 text-body text-muted-foreground">Explore every corner of the Algarve.</p>
              </div>
              <div className="flex-grid-centered">
                {otherRegions.map((region) => (
                  <Link
                    key={region.id}
                    href={`/destinations/${region.slug}`}
                    className="group block p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated"
                  >
                    <h3 className="text-lg font-serif font-medium text-foreground mb-2">{region.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {region.short_description || region.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <DestinationsClient initialRegions={regions} initialGlobalSettings={globalSettings} />
    </>
  );
}
