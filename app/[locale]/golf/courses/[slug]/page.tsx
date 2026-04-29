import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getGolfListingBySlug } from "@/lib/golf";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { GolfLocationMap } from "@/components/golf/GolfLocationMap";
import { StartRoundButton } from "@/components/golf/StartRoundButton";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const listing = await getGolfListingBySlug(slug);

  const title = listing ? `${listing.name} | Golf Course` : "Golf Course";
  const description =
    listing?.shortDescription ??
    listing?.description ??
    "Explore course details, scorecard resources, and location guidance.";

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

  const course = await getGolfListingBySlug(slug);
  if (!course || course.categorySlug !== "golf") {
    notFound();
  }

  const holeScorecardRows = course.scorecardHoles;

  const hasCoordinates =
    typeof course.latitude === "number" &&
    Number.isFinite(course.latitude) &&
    typeof course.longitude === "number" &&
    Number.isFinite(course.longitude);
  const hasHoleData = holeScorecardRows.length > 0 || course.holeCount > 0;

  return (
    <main className={`app-container space-y-8 pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="relative overflow-hidden rounded-3xl border border-border/60">
        <div className="relative h-[320px] w-full bg-muted md:h-[420px]">
          {course.featuredImageUrl ? (
            <img
              src={course.featuredImageUrl}
              alt={course.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">Algarve Golf</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight md:text-5xl">{course.name}</h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            {course.city?.name ?? "Algarve"}
            {course.region?.name ? `, ${course.region.name}` : ""}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Holes</CardDescription>
            <CardTitle>{course.details?.holes ?? "N/A"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Par</CardDescription>
            <CardTitle>{course.details?.par ?? "N/A"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Slope Rating</CardDescription>
            <CardTitle>{course.details?.slopeRating ?? "N/A"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Course Rating</CardDescription>
            <CardTitle>{course.details?.courseRating ?? "N/A"}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
          <CardDescription>
            {course.details?.architect
              ? `Designed by ${course.details.architect}.`
              : "Course profile and practical details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>{course.description ?? course.shortDescription ?? "Description coming soon."}</p>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold text-foreground">Year Opened:</span>{" "}
              {course.details?.yearOpened ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Practice Facilities:</span>{" "}
              {course.details?.practiceFacilities ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Clubhouse:</span>{" "}
              {course.details?.clubhouse === null || course.details?.clubhouse === undefined
                ? "N/A"
                : course.details?.clubhouse
                  ? "Yes"
                  : "No"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Dress Code:</span>{" "}
              {course.details?.dressCode ?? "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Scorecard</CardTitle>
          <CardDescription>Preview or download scorecard resources when available.</CardDescription>
        </CardHeader>
        <CardContent>
          {course.details?.scorecardImageUrl ? (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <img
                src={course.details.scorecardImageUrl}
                alt={`${course.name} scorecard`}
                className="h-[420px] w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : course.details?.scorecardPdfUrl ? (
            <Button asChild variant="outline">
              <a href={course.details.scorecardPdfUrl} target="_blank" rel="noreferrer">
                Open Scorecard PDF
              </a>
            </Button>
          ) : holeScorecardRows.length > 0 ? (
            <div className="space-y-4 rounded-xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Live Hole Data Preview
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-[560px] w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <th className="p-2 text-left text-muted-foreground">Hole</th>
                      {holeScorecardRows.map((row) => (
                        <td key={`hole-${row.holeNumber}`} className="p-2 text-center font-medium">
                          {row.holeNumber}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th className="p-2 text-left text-muted-foreground">Par</th>
                      {holeScorecardRows.map((row) => (
                        <td key={`par-${row.holeNumber}`} className="p-2 text-center">
                          {row.par}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Scorecard coming soon.</p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70">
        <CardHeader>
          <CardTitle>Course Map</CardTitle>
          <CardDescription>
            {hasCoordinates
              ? "Interactive location map"
              : "Map preview will be published shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[320px] w-full">
            {hasCoordinates ? (
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
            ) : course.details?.mapImageUrl ? (
              <img
                src={course.details.mapImageUrl}
                alt={`${course.name} map`}
                className="h-[320px] w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Map coming soon.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-wrap gap-3">
        <div className="min-w-[240px] max-w-[340px] flex-1">
          {hasHoleData ? (
            <StartRoundButton
              listingId={course.id}
              courseSlug={course.slug}
              locale={locale}
            />
          ) : (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Scorecard coming soon.
            </div>
          )}
        </div>
        {course.details?.bookingUrl ? (
          <Button asChild variant="outline">
            <a href={course.details.bookingUrl} target="_blank" rel="noreferrer">
              Visit Booking Partner
            </a>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={buildLocalizedPath(locale, "/golf/courses")}>Back to Courses</Link>
        </Button>
      </section>
    </main>
  );
}
