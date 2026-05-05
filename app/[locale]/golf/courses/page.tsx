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
  const tx = await getServerTranslations(locale, [
    "golf.courseDirectory.metadataTitle",
    "golf.courseDirectory.metadataDescription",
  ]);

  return buildLocalizedMetadata({
    locale,
    path: "/golf/courses",
    title: tx["golf.courseDirectory.metadataTitle"] ?? "AlgarveOfficial",
    description:
      tx["golf.courseDirectory.metadataDescription"] ??
      "AlgarveOfficial",
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
    "golf.courseDirectory.regionFilter",
    "golf.courseDirectory.cityFilter",
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
  const t = (key: string, values?: Record<string, string>) => {
    const template = translations[key] ?? key;
    return Object.entries(values ?? {}).reduce(
      (next, [name, value]) => next.replaceAll(`{{${name}}}`, value),
      template,
    );
  };
  const cardLabels = {
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

  return (
    <main className={`app-container space-y-8 pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="space-y-2">
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">
          {t("golf.courseDirectory.title")}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          {t("golf.courseDirectory.description")}
          {region ? ` ${t("golf.courseDirectory.regionFilter", { region })}` : ""}
          {city ? ` ${t("golf.courseDirectory.cityFilter", { city })}` : ""}
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
            <CardTitle>{t("golf.courseDirectory.emptyTitle")}</CardTitle>
            <CardDescription>
              {t("golf.courseDirectory.emptyDescription")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
