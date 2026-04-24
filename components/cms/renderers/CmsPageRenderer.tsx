"use client";

import type * as React from "react";

import { type CmsPageConfig } from "@/lib/cms/block-schemas";
import { getEnabledBlocks } from "@/lib/cms/normalize-page-config";
import { resolveHero } from "@/lib/cms/resolve-hero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { CoursesGridBlock, GolfLeaderboardBlock, RegionsGridBlock } from "@/components/cms/blocks/golf";

interface CmsPageRendererProps {
  pageConfig: CmsPageConfig | null;
  exclude?: string[];
}

function BlockNotFound({ type }: { type: string }) {
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="p-8 border-2 border-dashed border-red-500 bg-red-50 text-red-700">
        <p>Unknown block type: {type}</p>
        <p className="text-sm">Render this block or update the renderer map.</p>
      </div>
    );
  }
  return null;
}

export function CmsPageRenderer({ pageConfig, exclude = [] }: CmsPageRendererProps) {
  if (!pageConfig) {
    return null;
  }

  const heroInput = pageConfig.hero
    ? {
        enabled: pageConfig.hero.enabled ?? true,
        mediaType: pageConfig.hero.mediaType ?? "image",
        imageUrl: pageConfig.hero.imageUrl,
        videoUrl: pageConfig.hero.videoUrl,
        youtubeUrl: pageConfig.hero.youtubeUrl,
        posterUrl: pageConfig.hero.posterUrl,
        alt: pageConfig.hero.alt,
        badge: pageConfig.hero.badge,
        title: pageConfig.hero.title,
        subtitle: pageConfig.hero.subtitle,
        ctaCourses: pageConfig.hero.ctaPrimary,
        ctaLeaderboard: pageConfig.hero.ctaSecondary,
      }
    : null;

  const hero = resolveHero(heroInput);

  let enabledBlocks = getEnabledBlocks(pageConfig);

  if (exclude.length > 0) {
    enabledBlocks = enabledBlocks.filter((block) => !exclude.includes(block.type));
  }

  return (
    <div data-cms-renderer>
      {hero?.enabled && hero?.mediaType && (
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
      )}

      {enabledBlocks.map((block) => (
        <CmsBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

interface CmsBlockRendererProps {
  block: ReturnType<typeof getEnabledBlocks>[number];
}

function CmsBlockRenderer({ block }: CmsBlockRendererProps) {
  if (process.env.NODE_ENV === "development") {
    console.log("[CmsBlockRenderer] Rendering block:", block.type, block.id);
  }

  const renderSafe = (renderFn: () => React.ReactElement | null) => {
    try {
      return renderFn();
    } catch (e) {
      console.warn("[CmsBlockRenderer] Block render error:", block.type, e);
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="border-2 border-dashed border-red-500 p-4 m-4 text-xs text-red-600">
            Failed to render block: {block.type} (ID: {block.id})
          </div>
        );
      }
      return null;
    }
  };

  switch (block.type) {
    case "hero":
      return null;

    case "featured-listings":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="featured-listings">
          <p className="text-muted-foreground">Featured Listings Block</p>
        </div>
      ));

    case "categories-grid":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="categories-grid">
          <p className="text-muted-foreground">Categories Grid Block</p>
        </div>
      ));

    case "cities-grid":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="cities-grid">
          <p className="text-muted-foreground">Cities Grid Block</p>
        </div>
      ));

    case "cta":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="cta">
          <p className="text-muted-foreground">CTA Block</p>
        </div>
      ));

    case "editorial-text":
      return renderSafe(() => (
        <div
          data-block={block.id}
          data-block-type="editorial-text"
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: (block.settings?.content as string) ?? "",
          }}
        />
      ));

    case "image-gallery":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="image-gallery">
          <p className="text-muted-foreground">Image Gallery Block</p>
        </div>
      ));

    case "faq":
      return renderSafe(() => (
        <div data-block={block.id} data-block-type="faq">
          <p className="text-muted-foreground">FAQ Block</p>
        </div>
      ));

    case "courses-grid":
      return renderSafe(() => <CoursesGridBlock settings={block.settings ?? {}} />);

    case "golf-leaderboard":
      return renderSafe(() => <GolfLeaderboardBlock settings={block.settings ?? {}} />);

    case "regions-grid":
      return renderSafe(() => <RegionsGridBlock settings={block.settings ?? {}} />);

    default:
      console.warn("[CmsBlockRenderer] Unknown block type:", block.type);
      return <BlockNotFound type={block.type} />;
  }
}