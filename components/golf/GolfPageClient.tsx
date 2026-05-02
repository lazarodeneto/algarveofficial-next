"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { filterGolfListings, type GolfLeaderboardEntry, type GolfListing } from "@/lib/golf";
import {
  filterGolfCoursesByExperienceTag,
  GOLF_EXPERIENCE_TAGS,
  type GolfExperienceTag,
} from "@/lib/golf/experienceTags";
import type { GolfCmsPageConfig } from "@/lib/golf-cms";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { resolveHero, resolvePageContent } from "@/lib/cms/resolve-hero";
import { normalizePageConfig } from "@/lib/cms/normalize-page-config";
import { CmsPageRenderer } from "@/components/cms/renderers/CmsPageRenderer";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CourseCard, type CourseCardLabels } from "@/components/golf/CourseCard";
import { GolfFinder } from "@/components/golf/GolfFinder";
import { LeaderboardTable } from "@/components/golf/LeaderboardTable";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import { Button } from "@/components/ui/Button";
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

const DISCOVERY_IMAGE_FALLBACKS: Record<GolfExperienceTag, string> = {
  championship: "/images/region-vilamoura-800w-Ck2-Nx2h.webp",
  coastal: "/images/region-lagos-800w-C_edT6EI.webp",
  luxury: "/images/region-golden-triangle-800w-D-7A6jep.webp",
  beginner: "/images/region-tavira-800w-BTeay4E1.webp",
  "quick-9": "/images/region-carvoeiro-800w-CVkjcyBE.webp",
};

export function GolfPageClient({ locale, courses, leaderboard, pageConfig }: GolfPageClientProps) {
  const { t } = useTranslation();
  const cms = useCmsPageBuilder("golf");
  const golfCourses = useMemo(() => filterGolfListings(courses), [courses]);

  const normalizedPageConfig = useMemo(
    () => normalizePageConfig(pageConfig ?? {}),
    [pageConfig],
  );

  const CORE_BLOCKS = [
    "courses-grid",
    "featured-listings",
    "regions-grid",
    "golf-leaderboard"
  ];

  const hasCmsBlocks = (normalizedPageConfig.blocks ?? []).some(
    (block) => block.enabled !== false && CORE_BLOCKS.includes(block.type),
  );
  const isCmsBlockEnabled = useMemo(() => {
    const blocks = normalizedPageConfig.blocks ?? [];
    return (blockIdOrType: string, defaultEnabled = true) => {
      const block =
        blocks.find((item) => item.id === blockIdOrType) ??
        blocks.find((item) => item.type === blockIdOrType);
      if (!block) return defaultEnabled;
      return block.enabled !== false;
    };
  }, [normalizedPageConfig.blocks]);

  const coursesHref = buildLocalizedPath(locale, "/golf/courses");
  const leaderboardHref = buildLocalizedPath(locale, "/golf/leaderboard");
  const cardLabels: CourseCardLabels = {
    holes: t("golfCourse.holes"),
    par: t("golfCourse.par"),
    slope: t("golfCourse.slope"),
    bestFor: t("golfDiscovery.bestFor"),
    editorsSelection: t("golfDiscovery.editorsSelection"),
    verified: t("golfDiscovery.verified"),
    viewCourse: t("golfDiscovery.viewCourse"),
    locationFallback: t("golfCourse.locationFallback"),
    bestForLabels: {
      experiencedGolfers: t("golfDiscovery.experiencedGolfers"),
      championshipPlay: t("golfDiscovery.championshipPlay"),
      premiumExperience: t("golfDiscovery.premiumExperience"),
      quickRounds: t("golfDiscovery.quickRounds"),
      scenicRounds: t("golfDiscovery.scenicRounds"),
      relaxedPlay: t("golfDiscovery.relaxedPlay"),
    },
  };
  const finderLabels = {
    title: t("golfDiscovery.finderTitle"),
    skillQuestion: t("golfDiscovery.skillQuestion"),
    beginner: t("golfDiscovery.beginner"),
    intermediate: t("golfDiscovery.intermediate"),
    advanced: t("golfDiscovery.advanced"),
    mattersQuestion: t("golfDiscovery.mattersQuestion"),
    scenery: t("golfDiscovery.scenery"),
    challenge: t("golfDiscovery.challenge"),
    ease: t("golfDiscovery.ease"),
    viewMatches: t("golfDiscovery.viewMatches"),
  };
  const discoveryOptions = GOLF_EXPERIENCE_TAGS.map((tag) => {
    const matchingCourse = filterGolfCoursesByExperienceTag(golfCourses, tag)[0];
    const keyPrefix = tag === "quick-9" ? "quick9" : tag;
    return {
      tag,
      href: buildLocalizedPath(locale, `/golf/discover/${tag}`),
      title: t(`golfDiscovery.${keyPrefix}Title`),
      description: t(`golfDiscovery.${keyPrefix}Description`),
      imageUrl: matchingCourse?.featuredImageUrl ?? DISCOVERY_IMAGE_FALLBACKS[tag],
    };
  });

  const orderedContentBlocks = useMemo(
    () => cms.getBlockOrder([...GOLF_CONTENT_BLOCK_ORDER]),
    [cms],
  );

  const resolvedPageConfig = normalizedPageConfig;
  const hero = resolveHero(resolvedPageConfig as Parameters<typeof resolveHero>[0]);
  const pageContent = resolvePageContent(resolvedPageConfig as Parameters<typeof resolvePageContent>[0]);

  const DEFAULT_BADGE = t("golf.hero.badge");
  const DEFAULT_TITLE = t("golf.hero.title");
  const DEFAULT_SUBTITLE = t("golf.hero.subtitle");
  const DEFAULT_ALT = t("golf.hero.alt");
  const DEFAULT_CTA_COURSES = t("golf.hero.ctaCourses");
  const DEFAULT_CTA_LEADERBOARD = t("golf.hero.ctaLeaderboard");

  return (
    <>
      {isCmsBlockEnabled("hero", true) ? (
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

      <main id="main-content" className="app-container pb-20 pt-12 md:pt-16">
        <section className="mx-auto max-w-6xl py-12">
          <div className="rounded-lg border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {t("golfDiscovery.heroLabel")}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground md:text-6xl">
              {t("golfDiscovery.discoveryTitle")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              {t("golfDiscovery.discoverySubtitle")}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {discoveryOptions.map((option) => (
              <Link
                key={option.tag}
                href={option.href}
                className="group relative h-[180px] overflow-hidden rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.03]"
              >
                <img
                  src={option.imageUrl}
                  alt={option.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h2 className="text-lg font-semibold leading-tight">{option.title}</h2>
                  <p className="mt-1 text-sm text-white/82">{option.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <GolfFinder locale={locale} labels={finderLabels} />
      </main>

      {hasCmsBlocks ? (
        <CmsPageRenderer
          pageConfig={normalizedPageConfig}
          exclude={["hero"]}
        />
      ) : (
        <div className="app-container space-y-10 pb-20 pt-6">
          {orderedContentBlocks.map((blockId) => {
            if (blockId === "featured-courses") {
              return (
                <CmsBlock key={blockId} pageId="golf" blockId={blockId} as="section">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-serif text-3xl text-foreground md:text-4xl">
                        {cms.getText("featured-courses.title", t("golf.featuredCourses.title"))}
                      </h2>
                      <Button asChild variant="outline" size="sm">
                        <Link href={coursesHref}>
                          {cms.getText("featured-courses.cta", t("golf.featuredCourses.cta"))}
                        </Link>
                      </Button>
                    </div>

                    {golfCourses.length > 0 ? (
                      <div className="grid min-h-[360px] gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {golfCourses.map((course) => (
                          <CourseCard key={course.id} course={course} locale={locale} labels={cardLabels} />
                        ))}
                      </div>
                    ) : (
                      <Card className="min-h-[220px] border-border/70">
                        <CardHeader>
                          <CardTitle>
                            {cms.getText("featured-courses.empty.title", t("golf.featuredCourses.emptyTitle"))}
                          </CardTitle>
                          <CardDescription>
                            {cms.getText(
                              "featured-courses.empty.description",
                              t("golf.featuredCourses.emptyDescription"),
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
                        <CardTitle>{cms.getText("course-tools.booking.title", t("golf.courseTools.bookingTitle"))}</CardTitle>
                        <CardDescription>
                          {cms.getText(
                            "course-tools.booking.subtitle",
                            t("golf.courseTools.bookingSubtitle"),
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {cms.getText(
                          "course-tools.booking.body",
                          t("golf.courseTools.bookingBody"),
                        )}
                      </CardContent>
                    </Card>

                    <Card className="min-h-[170px] border-border/70">
                      <CardHeader>
                        <CardTitle>
                          {cms.getText("course-tools.scorecards.title", t("golf.courseTools.scorecardsTitle"))}
                        </CardTitle>
                        <CardDescription>
                          {cms.getText(
                            "course-tools.scorecards.subtitle",
                            t("golf.courseTools.scorecardsSubtitle"),
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {cms.getText(
                          "course-tools.scorecards.body",
                          t("golf.courseTools.scorecardsBody"),
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
                        {cms.getText("leaderboard.title", t("golf.leaderboard.title"))}
                      </h2>
                      <Button asChild variant="outline" size="sm">
                        <Link href={leaderboardHref}>
                          {cms.getText("leaderboard.cta", t("golf.leaderboard.cta"))}
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
                      <CardTitle>{cms.getText("cta.title", t("golf.cta.title"))}</CardTitle>
                      <CardDescription>
                        {cms.getText(
                          "cta.subtitle",
                          t("golf.cta.subtitle"),
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href={coursesHref}>{cms.getText("cta.primary", t("golf.cta.primary"))}</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={leaderboardHref}>
                          {cms.getText("cta.secondary", t("golf.cta.secondary"))}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CmsBlock>
              );
            }

            return null;
          })}
        </div>
      )}
    </>
  );
}
