"use client";

import type { ReactElement } from "react";

import { type CmsBlock, type CmsPageConfig } from "@/lib/cms/block-schemas";
import { getEnabledBlocks, normalizePageConfig } from "@/lib/cms/normalize-page-config";
import { resolveHero } from "@/lib/cms/resolve-hero";
import { CoursesGridBlock, GolfLeaderboardBlock, RegionsGridBlock } from "@/components/cms/blocks/golf";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";

interface CmsPageRendererProps {
  pageConfig: CmsPageConfig | null;
  exclude?: string[];
}

function renderEditorialText(content: unknown) {
  if (typeof content !== "string" || !content.trim()) return null;
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

function renderBlockByType(block: CmsBlock, settings: Record<string, unknown>): ReactElement | null {
  switch (block.type) {
    case "hero":
      return null;

    case "featured-listings":
      return (
        <section className="app-container py-6" data-cms-block-type="featured-listings">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "Featured Listings"}
          </h2>
        </section>
      );

    case "categories-grid":
      return (
        <section className="app-container py-6" data-cms-block-type="categories-grid">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "Categories"}
          </h2>
        </section>
      );

    case "cities-grid":
      return (
        <section className="app-container py-6" data-cms-block-type="cities-grid">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "Cities"}
          </h2>
        </section>
      );

    case "cta":
      return (
        <section className="app-container py-6" data-cms-block-type="cta">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "Call to Action"}
          </h2>
          {typeof settings.description === "string" ? (
            <p className="mt-2 text-muted-foreground">{settings.description}</p>
          ) : null}
        </section>
      );

    case "editorial-text":
      return (
        <section className="app-container py-6" data-cms-block-type="editorial-text">
          {renderEditorialText(settings.content)}
        </section>
      );

    case "image-gallery":
      return (
        <section className="app-container py-6" data-cms-block-type="image-gallery">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "Image Gallery"}
          </h2>
        </section>
      );

    case "faq":
      return (
        <section className="app-container py-6" data-cms-block-type="faq">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {(settings.title as string) ?? "FAQ"}
          </h2>
        </section>
      );

    case "courses-grid":
      return <CoursesGridBlock settings={settings} />;

    case "golf-leaderboard":
      return <GolfLeaderboardBlock settings={settings} />;

    case "regions-grid":
      return <RegionsGridBlock settings={settings} />;

    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(`[cms-renderer] Ignoring unknown block type "${block.type}".`);
      }
      return null;
  }
}

function CmsBlockRenderer({ block }: { block: CmsBlock }) {
  const settings =
    block.settings && typeof block.settings === "object" && !Array.isArray(block.settings)
      ? (block.settings as Record<string, unknown>)
      : {};

  const rendered = renderBlockByType(block, settings);
  if (!rendered) return null;

  return (
    <div data-cms-block-id={block.id} data-cms-block-type={block.type}>
      {rendered}
    </div>
  );
}

export function CmsPageRenderer({ pageConfig, exclude = [] }: CmsPageRendererProps) {
  if (!pageConfig) return null;

  const normalizedConfig = normalizePageConfig(pageConfig);
  const excluded = new Set(exclude);
  const heroExcluded = excluded.has("hero");

  const hero = resolveHero({
    hero: {
      ...(normalizedConfig.hero ?? {}),
      ctaCourses:
        ((normalizedConfig.hero as { ctaCourses?: string } | undefined)?.ctaCourses ??
        normalizedConfig.hero?.ctaPrimary) ?? undefined,
      ctaLeaderboard:
        ((normalizedConfig.hero as { ctaLeaderboard?: string } | undefined)?.ctaLeaderboard ??
        normalizedConfig.hero?.ctaSecondary) ?? undefined,
    },
  });

  const blocks = getEnabledBlocks(normalizedConfig).filter(
    (block) => !excluded.has(block.id) && !excluded.has(block.type),
  );

  if (heroExcluded && blocks.length === 0) {
    return null;
  }

  return (
    <div data-cms-renderer>
      {!heroExcluded && hero?.enabled !== false && hero?.mediaType ? (
        <section data-cms-hero>
          <HeroBackgroundMedia
            mediaType={hero.mediaType}
            imageUrl={hero.imageUrl ?? undefined}
            videoUrl={hero.videoUrl ?? undefined}
            youtubeUrl={hero.youtubeUrl ?? undefined}
            posterUrl={hero.posterUrl ?? undefined}
            alt={hero.alt ?? "CMS Hero"}
          />
        </section>
      ) : null}

      {blocks.map((block) => (
        <CmsBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
