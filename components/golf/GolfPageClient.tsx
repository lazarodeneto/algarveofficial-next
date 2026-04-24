"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { GolfLeaderboardEntry, GolfListing } from "@/lib/golf";
import type { GolfCmsPageConfig } from "@/lib/golf-cms";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { resolveHero, resolvePageContent, type CmsHeroData } from "@/lib/cms/resolve-hero";
import { CmsPageRenderer } from "@/components/cms/renderers/CmsPageRenderer";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CourseCard } from "@/components/golf/CourseCard";
import { LeaderboardTable } from "@/components/golf/LeaderboardTable";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GolfPageClientProps {
  locale: string;
  courses: GolfListing[];
  leaderboard: GolfLeaderboardEntry[];
  pageConfig?: GolfCmsPageConfig | null;
}

const GOLF_CONTENT_BLOCK_ORDER = [
  "featured-courses",
  "course-tools",
  "leaderboard",
  "cta",
] as const;

export function GolfPageClient({ locale, courses, leaderboard, pageConfig }: GolfPageClientProps) {
  const cms = useCmsPageBuilder("golf");

  const heroPageConfig = pageConfig?.hero;

  const coursesHref = buildLocalizedPath(locale, "/golf/courses");
  const leaderboardHref = buildLocalizedPath(locale, "/golf/leaderboard");

  const orderedContentBlocks = useMemo(
    () => cms.getBlockOrder([...GOLF_CONTENT_BLOCK_ORDER]),
    [cms],
  );

  const serverHero = heroPageConfig ?? {};
  const hero = resolveHero(serverHero);
  const pageContent = resolvePageContent(serverHero);

  const DEFAULT_BADGE = "Curated Golf";
  const DEFAULT_TITLE = "Play Championship Golf in the Algarve";
  const DEFAULT_SUBTITLE = "Discover elite golf listings, compare course specs, and plan your next round across Portugal's premier coast.";
  const DEFAULT_ALT = "Golf fairways in the Algarve";
  const DEFAULT_CTA_COURSES = "Browse Courses";
  const DEFAULT_CTA_LEADERBOARD = "View Leaderboard";

  return (
    <>
      {cms.isBlockEnabled("hero", true) ? (
        <div className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
          <CmsBlock pageId="golf" blockId="hero" as="section">
            <LiveStyleHero
              badge={pageContent.badge ?? DEFAULT_BADGE}
              title={pageContent.title ?? DEFAULT_TITLE}
              subtitle={pageContent.subtitle ?? DEFAULT_SUBTITLE}
              media={
                <HeroBackgroundMedia
                  mediaType={hero.mediaType}
                  imageUrl={hero.imageUrl ?? undefined}
                  videoUrl={hero.videoUrl ?? undefined}
                  youtubeUrl={hero.youtubeUrl ?? undefined}
                  posterUrl={hero.posterUrl ?? undefined}
                  alt={pageContent.alt ?? DEFAULT_ALT}
                  fallback={<PageHeroImage page="golf" alt={DEFAULT_ALT} />}
                  className="scale-[1.02] object-cover"
                />
              }
              overlayOpacity={0.42}
              ctas={
                <>
                  <Button asChild variant="gold" size="lg">
                    <Link href={coursesHref}>
                      {pageContent.ctaCourses ?? DEFAULT_CTA_COURSES}
                    </Link>
                  </Button>
                  <Button asChild variant="heroOutline" size="lg">
                    <Link href={leaderboardHref}>
                      {pageContent.ctaLeaderboard ?? DEFAULT_CTA_LEADERBOARD}
                    </Link>
                  </Button>
                </>
              }
            />
          </CmsBlock>
        </div>
      ) : null}

      {heroPageConfig && "blocks" in heroPageConfig && (heroPageConfig as { blocks?: unknown[] }).blocks?.length ? (
        <CmsPageRenderer pageConfig={heroPageConfig as Parameters<typeof CmsPageRenderer>[0]["pageConfig"]} exclude={["hero"]} />
      ) : null}

      {heroPageConfig && "blocks" in heroPageConfig && (heroPageConfig as { blocks?: unknown[] }).blocks?.length ? null : (
      <main className="app-container space-y-10 pb-20 pt-6">
        {orderedContentBlocks.map((blockId) => {
          if (blockId === "featured-courses") {
            return (
              <CmsBlock key={blockId} pageId="golf" blockId={blockId} as="section">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-3xl text-foreground md:text-4xl">
                      {cms.getText("featured-courses.title", "Featured Courses")}
                    </h2>
                    <Button asChild variant="outline" size="sm">
                      <Link href={coursesHref}>
                        {cms.getText("featured-courses.cta", "See all")}
                      </Link>
                    </Button>
                  </div>

                  {courses.length > 0 ? (
                    <div className="grid min-h-[360px] gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {courses.map((course) => (
                        <CourseCard key={course.id} course={course} locale={locale} />
                      ))}
                    </div>
                  ) : (
                    <Card className="min-h-[220px] border-border/70">
                      <CardHeader>
                        <CardTitle>
                          {cms.getText("featured-courses.empty.title", "No golf listings available")}
                        </CardTitle>
                        <CardDescription>
                          {cms.getText(
                            "featured-courses.empty.description",
                            "Golf listings will appear here as soon as they are published.",
                          )}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </div>
              </CmsBlock>
            );
          }

          if (blockId === "course-tools") {
            return (
              <CmsBlock key={blockId} pageId="golf" blockId={blockId} as="section">
                <div className="grid gap-5 md:grid-cols-2">
                  <Card className="min-h-[170px] border-border/70">
                    <CardHeader>
                      <CardTitle>{cms.getText("course-tools.booking.title", "Book Tee Time")}</CardTitle>
                      <CardDescription>
                        {cms.getText(
                          "course-tools.booking.subtitle",
                          "Integrated booking will be available in the next phase.",
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {cms.getText(
                        "course-tools.booking.body",
                        "We are connecting partner booking providers and slot availability.",
                      )}
                    </CardContent>
                  </Card>

                  <Card className="min-h-[170px] border-border/70">
                    <CardHeader>
                      <CardTitle>
                        {cms.getText("course-tools.scorecards.title", "Scorecards & Handicap")}
                      </CardTitle>
                      <CardDescription>
                        {cms.getText(
                          "course-tools.scorecards.subtitle",
                          "Structured round tracking is coming in phase 2.",
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {cms.getText(
                        "course-tools.scorecards.body",
                        "Soon you will save rounds, compare scores, and monitor handicap progress.",
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CmsBlock>
            );
          }

          if (blockId === "leaderboard") {
            return (
              <CmsBlock key={blockId} pageId="golf" blockId={blockId} as="section">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-3xl text-foreground md:text-4xl">
                      {cms.getText("leaderboard.title", "Leaderboard")}
                    </h2>
                    <Button asChild variant="outline" size="sm">
                      <Link href={leaderboardHref}>
                        {cms.getText("leaderboard.cta", "Open page")}
                      </Link>
                    </Button>
                  </div>

                  <Card className="min-h-[280px] border-border/70">
                    <CardContent className="p-0">
                      <LeaderboardTable entries={leaderboard.slice(0, 10)} />
                    </CardContent>
                  </Card>
                </div>
              </CmsBlock>
            );
          }

          if (blockId === "cta") {
            return (
              <CmsBlock key={blockId} pageId="golf" blockId={blockId} as="section">
                <Card className="border-border/70 bg-card/70">
                  <CardHeader>
                    <CardTitle>{cms.getText("cta.title", "Ready to Plan Your Next Round?")}</CardTitle>
                    <CardDescription>
                      {cms.getText(
                        "cta.subtitle",
                        "Compare courses, save your favorites, and jump into round tracking.",
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={coursesHref}>{cms.getText("cta.primary", "Browse Courses")}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={leaderboardHref}>
                        {cms.getText("cta.secondary", "View Leaderboard")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </CmsBlock>
            );
          }

          return null;
        })}
      </main>
      )}
    </>
  );
}

