import Link from "next/link";

import type { GolfListing } from "@/lib/golf";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseCardProps {
  course: GolfListing;
  locale: string;
}

export function CourseCard({ course, locale }: CourseCardProps) {
  const courseHref = buildLocalizedPath(locale, `/golf/courses/${course.slug}`);

  return (
    <Card className="group flex min-h-[360px] flex-col overflow-hidden border-border/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_-28px_rgba(15,23,42,0.5)]">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {course.featuredImageUrl ? (
          <img
            src={course.featuredImageUrl}
            alt={course.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1 text-xl">{course.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {course.city?.name ?? "Algarve"}
          {course.region?.name ? `, ${course.region.name}` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid flex-1 grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Holes</p>
          <p className="mt-1 font-semibold">{course.details?.holes ?? "N/A"}</p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Par</p>
          <p className="mt-1 font-semibold">{course.details?.par ?? "N/A"}</p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Slope</p>
          <p className="mt-1 font-semibold">{course.details?.slopeRating ?? "N/A"}</p>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={courseHref} prefetch={false}>
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
