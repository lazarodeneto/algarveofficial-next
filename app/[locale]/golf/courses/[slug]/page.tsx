import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { getGolfListingBySlug, getGolfListings } from "@/lib/golf";
import { getBestForKeys, inferGolfExperienceTags } from "@/lib/golf/experienceTags";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { BestFor } from "@/components/golf/BestFor";
import { CourseOverview } from "@/components/golf/CourseOverview";
import { Facilities } from "@/components/golf/Facilities";
import { GolfCTA } from "@/components/golf/GolfCTA";
import { GolfLocationMap } from "@/components/golf/GolfLocationMap";
import { Leaderboard } from "@/components/golf/Leaderboard";
import { MetricsGrid } from "@/components/golf/MetricsGrid";
import { QuickFacts } from "@/components/golf/QuickFacts";
import { RelatedCourses } from "@/components/golf/RelatedCourses";
import { RequestTeeTimeForm } from "@/components/golf/RequestTeeTimeForm";
import { Scorecard } from "@/components/golf/Scorecard";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const TRANSLATION_KEYS = [
  "golfCourse.metaTitleFallback",
  "golfCourse.metaDescriptionFallback",
  "golfCourse.locationFallback",
  "golfCourse.regionFallback",
  "golfCourse.holes",
  "golfCourse.par",
  "golfCourse.slope",
  "golfCourse.rating",
  "golfCourse.length",
  "golfCourse.designer",
  "golfCourse.meters",
  "golfCourse.overview",
  "golfCourse.facilities",
  "golfCourse.drivingRange",
  "golfCourse.clubhouse",
  "golfCourse.restaurant",
  "golfCourse.buggy",
  "golfCourse.academy",
  "golfCourse.access",
  "golfCourse.difficulty",
  "golfCourse.bestFor",
  "golfCourse.priceRange",
  "golfCourse.public",
  "golfCourse.private",
  "golfCourse.golfers",
  "golfCourse.casual",
  "golfCourse.confident",
  "golfCourse.championship",
  "golfCourse.scorecard",
  "golfCourse.leaderboard",
  "golfCourse.rank",
  "golfCourse.player",
  "golfCourse.score",
  "golfCourse.rounds",
  "golfCourse.hole",
  "golfCourse.hcp",
  "golfCourse.white",
  "golfCourse.yellow",
  "golfCourse.red",
  "golfCourse.requestTeeTime",
  "golfCourse.contactClub",
  "golfCourse.visitWebsite",
  "golfCourse.relatedCourses",
  "golfCourse.teeTime.title",
  "golfCourse.teeTime.intro",
  "golfCourse.teeTime.name",
  "golfCourse.teeTime.email",
  "golfCourse.teeTime.phone",
  "golfCourse.teeTime.preferredDate",
  "golfCourse.teeTime.preferredTime",
  "golfCourse.teeTime.morning",
  "golfCourse.teeTime.midday",
  "golfCourse.teeTime.afternoon",
  "golfCourse.teeTime.flexible",
  "golfCourse.teeTime.players",
  "golfCourse.teeTime.handicap",
  "golfCourse.teeTime.message",
  "golfCourse.teeTime.submit",
  "golfCourse.teeTime.submitting",
  "golfCourse.teeTime.success",
  "golfCourse.teeTime.error",
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
  "golfDiscovery.youMightAlsoLike",
] as const;

function tx(translations: Record<string, string>, key: string, fallback: string) {
  return translations[key] ?? fallback;
}

function formatValue(value: string | null | undefined) {
  if (!value) return null;
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function contactHref(phone?: string | null, email?: string | null) {
  if (phone) return `tel:${phone.replace(/\s+/g, "")}`;
  if (email) return `mailto:${email}`;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const translations = await getServerTranslations(locale, [
    "golfCourse.metaTitleFallback",
    "golfCourse.metaDescriptionFallback",
  ]);

  const listing = await getGolfListingBySlug(slug);

  const title = listing
    ? `${listing.name} | ${tx(translations, "golfCourse.metaTitleFallback", "Golf Course")}`
    : tx(translations, "golfCourse.metaTitleFallback", "Golf Course");
  const description =
    listing?.shortDescription ??
    listing?.description ??
    tx(
      translations,
      "golfCourse.metaDescriptionFallback",
      "Explore course details, scorecard resources, and location guidance.",
    );

  return buildLocalizedMetadata({
    locale,
    path: `/golf/courses/${slug}`,
    title,
    description,
    keywords: ["Golf course", "Algarve golf", "Golf scorecard"],
  });
}

export default async function GolfCourseDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const translations = await getServerTranslations(locale, [...TRANSLATION_KEYS]);

  const course = await getGolfListingBySlug(slug);
  if (!course || course.categorySlug !== "golf") {
    notFound();
  }

  const details = course.details;
  const metaItems = [
    details?.holes ? `${details.holes} ${tx(translations, "golfCourse.holes", "Holes")}` : null,
    details?.par ? `${tx(translations, "golfCourse.par", "Par")} ${details.par}` : null,
    formatValue(details?.courseType),
    course.city?.name,
  ].filter((item): item is string => Boolean(item));

  const locationLine = [
    course.city?.name ?? tx(translations, "golfCourse.locationFallback", "Algarve"),
    course.region?.name ?? tx(translations, "golfCourse.regionFallback", "Algarve"),
  ]
    .filter(Boolean)
    .join(" • ");

  const hasCoordinates =
    typeof course.latitude === "number" &&
    Number.isFinite(course.latitude) &&
    typeof course.longitude === "number" &&
    Number.isFinite(course.longitude);

  const courseTags = inferGolfExperienceTags(course);
  const relatedCourses = (await getGolfListings({ limit: 60 }))
    .filter((item) => {
      if (item.id === course.id) return false;
      const sameRegion = Boolean(course.region?.slug && item.region?.slug === course.region.slug);
      const sharedTag = inferGolfExperienceTags(item).some((tag) => courseTags.includes(tag));
      return sameRegion || sharedTag;
    })
    .slice(0, 3);
  const bestForLabels = {
    experiencedGolfers: tx(translations, "golfDiscovery.experiencedGolfers", "Experienced golfers"),
    championshipPlay: tx(translations, "golfDiscovery.championshipPlay", "Championship play"),
    premiumExperience: tx(translations, "golfDiscovery.premiumExperience", "Premium experience"),
    quickRounds: tx(translations, "golfDiscovery.quickRounds", "Quick rounds"),
    scenicRounds: tx(translations, "golfDiscovery.scenicRounds", "Scenic rounds"),
    relaxedPlay: tx(translations, "golfDiscovery.relaxedPlay", "Relaxed play"),
  };
  const courseCardLabels = {
    holes: tx(translations, "golfCourse.holes", "Holes"),
    par: tx(translations, "golfCourse.par", "Par"),
    slope: tx(translations, "golfCourse.slope", "Slope"),
    bestFor: tx(translations, "golfDiscovery.bestFor", "Best for"),
    editorsSelection: tx(translations, "golfDiscovery.editorsSelection", "Editor's Selection"),
    verified: tx(translations, "golfDiscovery.verified", "Verified"),
    viewCourse: tx(translations, "golfDiscovery.viewCourse", "View Course"),
    locationFallback: tx(translations, "golfCourse.locationFallback", "Algarve"),
    bestForLabels,
  };

  return (
    <main className={`bg-background pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="relative h-[460px] w-full overflow-hidden bg-muted">
        {course.featuredImageUrl ? (
          <Image
            src={course.featuredImageUrl}
            alt={course.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-800 to-emerald-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-xl p-6 text-white md:p-10">
          <h1 className="font-serif text-4xl font-medium leading-tight md:text-6xl">{course.name}</h1>
          <p className="mt-3 text-base text-white/88">{locationLine}</p>
          {metaItems.length > 0 ? (
            <p className="mt-4 text-sm font-medium text-white/90 md:text-base">
              {metaItems.join(" • ")}
            </p>
          ) : null}
        </div>
      </section>

      <QuickFacts
        accessType={details?.accessType}
        difficulty={details?.difficulty}
        courseType={details?.courseType}
        priceRange={details?.priceRange}
        labels={{
          access: tx(translations, "golfCourse.access", "Access"),
          difficulty: tx(translations, "golfCourse.difficulty", "Difficulty"),
          bestFor: tx(translations, "golfCourse.bestFor", "Best For"),
          priceRange: tx(translations, "golfCourse.priceRange", "Price Range"),
          public: tx(translations, "golfCourse.public", "Public"),
          private: tx(translations, "golfCourse.private", "Private"),
          golfers: tx(translations, "golfCourse.golfers", "Golfers"),
          casual: tx(translations, "golfCourse.casual", "Casual rounds"),
          confident: tx(translations, "golfCourse.confident", "Confident players"),
          championship: tx(translations, "golfCourse.championship", "Championship play"),
        }}
      />

      <MetricsGrid
        details={details}
        labels={{
          holes: tx(translations, "golfCourse.holes", "Holes"),
          par: tx(translations, "golfCourse.par", "Par"),
          slope: tx(translations, "golfCourse.slope", "Slope"),
          rating: tx(translations, "golfCourse.rating", "Course Rating"),
          length: tx(translations, "golfCourse.length", "Length"),
          designer: tx(translations, "golfCourse.designer", "Designer"),
          meters: tx(translations, "golfCourse.meters", "m"),
        }}
      />

      <CourseOverview
        title={tx(translations, "golfCourse.overview", "Course Overview")}
        description={course.description ?? course.shortDescription}
      />

      <Facilities
        details={details}
        labels={{
          title: tx(translations, "golfCourse.facilities", "Facilities"),
          drivingRange: tx(translations, "golfCourse.drivingRange", "Driving Range"),
          clubhouse: tx(translations, "golfCourse.clubhouse", "Clubhouse"),
          restaurant: tx(translations, "golfCourse.restaurant", "Restaurant"),
          buggy: tx(translations, "golfCourse.buggy", "Buggy"),
          academy: tx(translations, "golfCourse.academy", "Academy"),
        }}
      />

      <BestFor
        title={tx(translations, "golfDiscovery.bestFor", "Best for")}
        items={getBestForKeys(course).map((key) => bestForLabels[key])}
      />

      <Scorecard
        rows={course.scorecardHoles}
        labels={{
          title: tx(translations, "golfCourse.scorecard", "Scorecard"),
          hole: tx(translations, "golfCourse.hole", "Hole"),
          par: tx(translations, "golfCourse.par", "Par"),
          hcp: tx(translations, "golfCourse.hcp", "HCP"),
          white: tx(translations, "golfCourse.white", "White"),
          yellow: tx(translations, "golfCourse.yellow", "Yellow"),
          red: tx(translations, "golfCourse.red", "Red"),
        }}
      />

      <Leaderboard
        courseId={course.id}
        labels={{
          title: tx(translations, "golfCourse.leaderboard", "Leaderboard"),
          rank: tx(translations, "golfCourse.rank", "Rank"),
          player: tx(translations, "golfCourse.player", "Player"),
          score: tx(translations, "golfCourse.score", "Score"),
          rounds: tx(translations, "golfCourse.rounds", "Rounds"),
        }}
      />

      {hasCoordinates ? (
        <section className="mx-auto max-w-6xl py-12">
          <div className="h-[400px] overflow-hidden rounded-2xl shadow-sm">
            <GolfLocationMap
              listingId={course.id}
              name={course.name}
              slug={course.slug}
              latitude={course.latitude as number}
              longitude={course.longitude as number}
              tier={course.tier}
              featuredImageUrl={course.featuredImageUrl}
              href={buildLocalizedPath(locale, `/golf/courses/${course.slug}`)}
            />
          </div>
        </section>
      ) : null}

      <GolfCTA
        bookingUrl={details?.bookingUrl}
        contactHref={contactHref(course.contactPhone, course.contactEmail)}
        websiteUrl={course.websiteUrl}
        labels={{
          requestTeeTime: tx(translations, "golfCourse.requestTeeTime", "Request Tee Time"),
          contactClub: tx(translations, "golfCourse.contactClub", "Contact Club"),
          visitWebsite: tx(translations, "golfCourse.visitWebsite", "Visit Website"),
        }}
      />

      <RequestTeeTimeForm
        listingId={course.id}
        labels={{
          title: tx(translations, "golfCourse.teeTime.title", "Request a tee time"),
          intro: tx(
            translations,
            "golfCourse.teeTime.intro",
            "Share your preferred day and details. We will help connect you with the course or relevant partner.",
          ),
          name: tx(translations, "golfCourse.teeTime.name", "Name"),
          email: tx(translations, "golfCourse.teeTime.email", "Email"),
          phone: tx(translations, "golfCourse.teeTime.phone", "Phone"),
          preferredDate: tx(translations, "golfCourse.teeTime.preferredDate", "Preferred date"),
          preferredTime: tx(translations, "golfCourse.teeTime.preferredTime", "Preferred time"),
          morning: tx(translations, "golfCourse.teeTime.morning", "Morning"),
          midday: tx(translations, "golfCourse.teeTime.midday", "Midday"),
          afternoon: tx(translations, "golfCourse.teeTime.afternoon", "Afternoon"),
          flexible: tx(translations, "golfCourse.teeTime.flexible", "Flexible"),
          players: tx(translations, "golfCourse.teeTime.players", "Number of players"),
          handicap: tx(translations, "golfCourse.teeTime.handicap", "Handicap / playing level"),
          message: tx(translations, "golfCourse.teeTime.message", "Message"),
          submit: tx(translations, "golfCourse.teeTime.submit", "Request Tee Time"),
          submitting: tx(translations, "golfCourse.teeTime.submitting", "Sending request..."),
          success: tx(
            translations,
            "golfCourse.teeTime.success",
            "Request received. We'll help connect you with the course or relevant partner.",
          ),
          error: tx(translations, "golfCourse.teeTime.error", "We could not send this request. Please try again."),
        }}
      />

      <RelatedCourses
        title={tx(translations, "golfDiscovery.youMightAlsoLike", "You might also like")}
        courses={relatedCourses}
        locale={locale}
        cardLabels={courseCardLabels}
      />
    </main>
  );
}
