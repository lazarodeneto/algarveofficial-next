import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { getGolfListings } from "@/lib/golf";
import { rankGolfCourses, type GolfFilterCriteria } from "@/lib/golf/filterEngine";
import {
  GOLF_EXPERIENCE_TAGS,
  type GolfExperienceTag,
} from "@/lib/golf/experienceTags";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { CourseCard } from "@/components/golf/CourseCard";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ locale: string; tag: string }>;
}

const TRANSLATION_KEYS = [
  "golfCourse.holes",
  "golfCourse.par",
  "golfCourse.slope",
  "golfCourse.locationFallback",
  "golfDiscovery.bestFor",
  "golfDiscovery.experiencedGolfers",
  "golfDiscovery.championshipPlay",
  "golfDiscovery.premiumExperience",
  "golfDiscovery.quickRounds",
  "golfDiscovery.scenicRounds",
  "golfDiscovery.relaxedPlay",
  "golfDiscovery.editorsSelection",
  "golfDiscovery.verified",
  "golfDiscovery.viewCourse",
  "golfDiscovery.backToGolf",
  "golfDiscovery.noMatchesTitle",
  "golfDiscovery.noMatchesDescription",
  "golfDiscovery.championshipTitle",
  "golfDiscovery.championshipIntro",
  "golfDiscovery.coastalTitle",
  "golfDiscovery.coastalIntro",
  "golfDiscovery.luxuryTitle",
  "golfDiscovery.luxuryIntro",
  "golfDiscovery.beginnerTitle",
  "golfDiscovery.beginnerIntro",
  "golfDiscovery.quick9Title",
  "golfDiscovery.quick9Intro",
] as const;

const TAG_TO_KEY_PREFIX: Record<GolfExperienceTag, string> = {
  championship: "championship",
  coastal: "coastal",
  luxury: "luxury",
  beginner: "beginner",
  "quick-9": "quick9",
};

const TAG_TO_CRITERIA: Record<GolfExperienceTag, GolfFilterCriteria> = {
  championship: { holes: 18, difficulty: "high", tags: ["championship"] },
  coastal: { tags: ["coastal"] },
  luxury: { tags: ["luxury"] },
  beginner: { difficulty: "low", tags: ["beginner"] },
  "quick-9": { holes: 9, tags: ["quick-9"] },
};

function isGolfExperienceTag(value: string): value is GolfExperienceTag {
  return GOLF_EXPERIENCE_TAGS.includes(value as GolfExperienceTag);
}

function tx(translations: Record<string, string>, key: string, fallback: string) {
  return translations[key] ?? fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, tag: rawTag } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  if (!isGolfExperienceTag(rawTag)) return {};

  const translations = await getServerTranslations(locale, [
    `golfDiscovery.${TAG_TO_KEY_PREFIX[rawTag]}Title`,
    `golfDiscovery.${TAG_TO_KEY_PREFIX[rawTag]}Intro`,
  ]);
  const keyPrefix = TAG_TO_KEY_PREFIX[rawTag];

  return buildLocalizedMetadata({
    locale,
    path: `/golf/discover/${rawTag}`,
    title: tx(translations, `golfDiscovery.${keyPrefix}Title`, "Golf in the Algarve"),
    description: tx(
      translations,
      `golfDiscovery.${keyPrefix}Intro`,
      "Discover curated Algarve golf courses.",
    ),
    keywords: ["Algarve golf", "golf courses", "golf discovery"],
  });
}

export default async function GolfDiscoverPage({ params }: PageProps) {
  const { locale: rawLocale, tag: rawTag } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  if (!isGolfExperienceTag(rawTag)) {
    notFound();
  }

  const translations = await getServerTranslations(locale, [...TRANSLATION_KEYS]);
  const courses = rankGolfCourses(await getGolfListings(), TAG_TO_CRITERIA[rawTag]);
  const keyPrefix = TAG_TO_KEY_PREFIX[rawTag];
  const cardLabels = {
    holes: tx(translations, "golfCourse.holes", "Holes"),
    par: tx(translations, "golfCourse.par", "Par"),
    slope: tx(translations, "golfCourse.slope", "Slope"),
    bestFor: tx(translations, "golfDiscovery.bestFor", "Best for"),
    editorsSelection: tx(translations, "golfDiscovery.editorsSelection", "Editor's Selection"),
    verified: tx(translations, "golfDiscovery.verified", "Verified"),
    viewCourse: tx(translations, "golfDiscovery.viewCourse", "View Course"),
    locationFallback: tx(translations, "golfCourse.locationFallback", "Algarve"),
    bestForLabels: {
      experiencedGolfers: tx(translations, "golfDiscovery.experiencedGolfers", "Experienced golfers"),
      championshipPlay: tx(translations, "golfDiscovery.championshipPlay", "Championship play"),
      premiumExperience: tx(translations, "golfDiscovery.premiumExperience", "Premium experience"),
      quickRounds: tx(translations, "golfDiscovery.quickRounds", "Quick rounds"),
      scenicRounds: tx(translations, "golfDiscovery.scenicRounds", "Scenic rounds"),
      relaxedPlay: tx(translations, "golfDiscovery.relaxedPlay", "Relaxed play"),
    },
  };

  return (
    <main className={`app-container pb-16 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="mx-auto max-w-6xl py-12">
        <div className="max-w-3xl">
          <LocaleLink
            href={buildLocalizedPath(locale, "/golf")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tx(translations, "golfDiscovery.backToGolf", "All golf courses")}
          </LocaleLink>
          <h1 className="font-serif text-4xl font-medium leading-tight text-foreground md:text-6xl">
            {tx(translations, `golfDiscovery.${keyPrefix}Title`, "Golf in the Algarve")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            {tx(translations, `golfDiscovery.${keyPrefix}Intro`, "Discover curated Algarve golf courses.")}
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {courses.map((course, index) => {
              const featured = course.tier === "signature" && index < 2;
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  labels={cardLabels}
                  featured={featured}
                  className={featured ? "xl:col-span-2" : undefined}
                />
              );
            })}
          </div>
        ) : (
          <Card className="mt-8 min-h-[220px] rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{tx(translations, "golfDiscovery.noMatchesTitle", "No matching courses yet")}</CardTitle>
              <CardDescription>
                {tx(
                  translations,
                  "golfDiscovery.noMatchesDescription",
                  "Explore all golf courses while we expand this discovery collection.",
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </main>
  );
}
