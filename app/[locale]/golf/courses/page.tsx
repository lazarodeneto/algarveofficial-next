import type { Metadata } from "next";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { getGolfListings } from "@/lib/golf";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { CourseCard } from "@/components/golf/CourseCard";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string | string[]; city?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: "/golf/courses",
    title: "Golf Courses in the Algarve",
    description:
      "Browse championship golf listings in the Algarve with course specs, locations, and scorecard access.",
    keywords: ["Algarve golf courses", "Golf clubs Algarve", "Golf listings Portugal"],
  });
}

export default async function GolfCoursesPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const resolvedSearchParams = await searchParams;
  const regionParam = resolvedSearchParams.region;
  const cityParam = resolvedSearchParams.city;

  const region = typeof regionParam === "string" ? regionParam : undefined;
  const city = typeof cityParam === "string" ? cityParam : undefined;

  const courses = await getGolfListings({ region, city });
  const translations = await getServerTranslations(locale, [
    "golfCourse.holes",
    "golfCourse.par",
    "golfCourse.slope",
    "golfCourse.locationFallback",
    "golf.courseDirectory.title",
    "golf.courseDirectory.description",
    "golf.courseDirectory.emptyTitle",
    "golf.courseDirectory.emptyDescription",
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
  ]);
  const t = (key: string, fallback: string) => translations[key] ?? fallback;
  const cardLabels = {
    holes: t("golfCourse.holes", "Holes"),
    par: t("golfCourse.par", "Par"),
    slope: t("golfCourse.slope", "Slope"),
    bestFor: t("golfDiscovery.bestFor", "Best for"),
    editorsSelection: t("golfDiscovery.editorsSelection", "Editor's Selection"),
    verified: t("golfDiscovery.verified", "Verified"),
    viewCourse: t("golfDiscovery.viewCourse", "View Course"),
    locationFallback: t("golfCourse.locationFallback", "Algarve"),
    bestForLabels: {
      experiencedGolfers: t("golfDiscovery.experiencedGolfers", "Experienced golfers"),
      championshipPlay: t("golfDiscovery.championshipPlay", "Championship play"),
      premiumExperience: t("golfDiscovery.premiumExperience", "Premium experience"),
      quickRounds: t("golfDiscovery.quickRounds", "Quick rounds"),
      scenicRounds: t("golfDiscovery.scenicRounds", "Scenic rounds"),
      relaxedPlay: t("golfDiscovery.relaxedPlay", "Relaxed play"),
    },
  };

  return (
    <main className={`app-container space-y-8 pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="space-y-2">
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">
          {t("golf.courseDirectory.title", "Golf Course Directory")}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          {t("golf.courseDirectory.description", "Explore golf clubs powered by AlgarveOfficial listings.")}
          {region ? ` Region: ${region}.` : ""}
          {city ? ` City: ${city}.` : ""}
        </p>
      </section>

      {courses.length > 0 ? (
        <section className="grid min-h-[360px] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} labels={cardLabels} />
          ))}
        </section>
      ) : (
        <Card className="min-h-[220px] border-border/70">
          <CardHeader>
            <CardTitle>{t("golf.courseDirectory.emptyTitle", "No golf listings available")}</CardTitle>
            <CardDescription>
              {t("golf.courseDirectory.emptyDescription", "No published golf listings matched your current filters.")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
