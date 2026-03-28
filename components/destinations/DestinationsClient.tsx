"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { getRegionImageSet } from "@/lib/regionImages";

import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";

export type RegionRow = Tables<"regions">;
export type GlobalSettingRow = Pick<Tables<"global_settings">, "key" | "value" | "category">;

export interface DestinationsClientProps {
  initialRegions: RegionRow[];
  initialGlobalSettings: GlobalSettingRow[];
}

const DESTINATIONS_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

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

function useDestinationsCmsHelpers(globalSettings: GlobalSettingRow[]) {
  return useMemo(() => {
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
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true) => {
      const configured = blocks[blockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getBlockClassName = (blockId: string) => {
      const className = blocks[blockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const style = blocks[blockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
    };

    const getText = (textKey: string, fallback: string) =>
      pageText[textKey] ??
      textOverrides[`destinations.${textKey}`] ??
      textOverrides[textKey] ??
      fallback;

    const getMetaTitle = (fallback: string) => pageConfig.meta?.title ?? getText("meta.title", fallback);
    const getMetaDescription = (fallback: string) =>
      pageConfig.meta?.description ?? getText("meta.description", fallback);

    return {
      getText,
      getMetaTitle,
      getMetaDescription,
      isBlockEnabled,
      getBlockClassName,
      getBlockStyle,
    };
  }, [globalSettings]);
}

function DestinationsCmsBlock({
  blockId,
  children,
  className,
  style,
  as: Component = "div",
  defaultEnabled = true,
  cms,
}: {
  blockId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  defaultEnabled?: boolean;
  cms: ReturnType<typeof useDestinationsCmsHelpers>;
}) {
  if (!cms.isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page="destinations"
      data-cms-block={blockId}
      className={[className, cms.getBlockClassName(blockId)].filter(Boolean).join(" ")}
      style={{ ...style, ...cms.getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}

async function fetchRegions() {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("is_visible_destinations", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RegionRow[];
}

async function fetchGlobalSettings() {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...DESTINATIONS_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as GlobalSettingRow[];
}

function DestinationsClientInner({ initialRegions, initialGlobalSettings }: DestinationsClientProps) {
  const { t } = useTranslation();

  const { data: regions = initialRegions, isLoading } = useQuery({
    queryKey: ["regions", { destinationsOnly: true, activeOnly: false }],
    queryFn: fetchRegions,
    initialData: initialRegions,
    staleTime: 1000 * 60 * 10,
  });

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["global-settings", [...DESTINATIONS_CMS_KEYS].sort()],
    queryFn: fetchGlobalSettings,
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 5,
  });

  const cms = useDestinationsCmsHelpers(globalSettings);
  const featuredRegions = regions.filter((region) => region.is_featured);
  const otherRegions = regions.filter((region) => !region.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="destinations">
      <Header />

      {cms.isBlockEnabled("hero", true) ? (
        <DestinationsCmsBlock
          blockId="hero"
          as="section"
          cms={cms}
          className="px-0 sm:px-4 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4"
        >
          <LiveStyleHero
            badge={t("sections.regions.label")}
            title={t("sections.regions.title")}
            subtitle={t("sections.regions.subtitleLong")}
            media={
              <HeroBackgroundMedia
                mediaType={cms.getText("hero.mediaType", "image")}
                imageUrl={cms.getText("hero.imageUrl", "")}
                videoUrl={cms.getText("hero.videoUrl", "")}
                youtubeUrl={cms.getText("hero.youtubeUrl", "")}
                posterUrl={cms.getText("hero.posterUrl", "")}
                alt={t("destinations.hero.alt", "Scenic Algarve destination coastline")}
                fallback={<PageHeroImage page="destinations" alt={t("destinations.hero.alt", "Scenic Algarve destination coastline")} />}
              />
            }
            ctas={
              <>
                <LocaleLink href="/directory">
                  <Button variant="gold" size="lg">
                    {t("destinations.hero.ctaPrimary", "Browse Premium Listings")}
                  </Button>
                </LocaleLink>
                <LocaleLink href="/live">
                  <Button variant="heroOutline" size="lg">
                    {t("destinations.hero.ctaSecondary", "Plan Relocation")}
                  </Button>
                </LocaleLink>
              </>
            }
          />
        </DestinationsCmsBlock>
      ) : null}

      {cms.isBlockEnabled("featured-regions", true) ? (
        <DestinationsCmsBlock blockId="featured-regions" as="section" cms={cms} className="py-16 lg:py-24">
          <div className="app-container content-max">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-title font-serif font-medium text-foreground">{t("sections.regions.featured")}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t("sections.regions.featuredSubtitle")}</p>
            </motion.div>
            <div className="flex-grid-centered">
              {featuredRegions.map((region, index) => {
                const image = getRegionImageSet(region.slug, { includeAliases: true });
                return (
                  <motion.div
                    key={region.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <LocaleLink
                      href={`/destinations/${region.slug}`}
                      className="glass-box group relative overflow-hidden rounded-xl aspect-[4/5] luxury-card cursor-pointer block"
                    >
                      <div className="absolute inset-0">
                        {image ? (
                          <Image
                            src={typeof image.image800 === "string" ? image.image800 : image.image800.src}
                            alt={region.name}
                            fill
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : region.image_url || region.hero_image_url ? (
                          <Image
                            src={region.hero_image_url || region.image_url || ""}
                            alt={region.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                            <MapPin className="w-16 h-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                      </div>
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <span className="text-xs font-medium text-primary tracking-wider uppercase mb-2">
                          {t("sections.regions.algarveRegion")}
                        </span>
                        <h3 className="text-2xl lg:text-3xl font-serif font-medium text-white mb-2">{region.name}</h3>
                        <p className="text-sm lg:text-base text-white/80 mb-4">
                          {region.short_description || region.description}
                        </p>
                        <div className="flex items-center justify-end">
                          <span className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            {t("sections.regions.explore")}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </LocaleLink>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </DestinationsCmsBlock>
      ) : null}

      {otherRegions.length > 0 && cms.isBlockEnabled("other-regions", true) ? (
        <DestinationsCmsBlock blockId="other-regions" as="section" cms={cms} className="py-16 lg:py-24 bg-card">
          <div className="app-container content-max">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-title font-serif font-medium text-foreground">{t("sections.regions.more")}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t("sections.regions.moreSubtitle")}</p>
            </motion.div>
            <div className="flex-grid-centered">
              {otherRegions.map((region, index) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <LocaleLink
                    href={`/destinations/${region.slug}`}
                    className="group block p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-serif font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {region.short_description || region.description}
                    </p>
                  </LocaleLink>
                </motion.div>
              ))}
            </div>
          </div>
        </DestinationsCmsBlock>
      ) : null}

      {cms.isBlockEnabled("cta", true) ? (
        <DestinationsCmsBlock blockId="cta" as="section" cms={cms} className="py-20 lg:py-28 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-serif font-medium text-foreground mb-6">
                {t("sections.regions.cantDecide")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("sections.regions.cantDecideSubtitle")}
              </p>
              <Button asChild variant="gold" size="lg">
                <LocaleLink href="/#categories">
                  {t("sections.regions.browseByCategory")} <ArrowRight className="w-4 h-4" />
                </LocaleLink>
              </Button>
            </motion.div>
          </div>
        </DestinationsCmsBlock>
      ) : null}

      <Footer />
    </div>
  );
}

export function DestinationsClient(props: DestinationsClientProps) {
  return <DestinationsClientInner {...props} />;
}

export default DestinationsClient;
