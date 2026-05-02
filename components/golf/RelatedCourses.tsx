import type { GolfListing } from "@/lib/golf";
import { CourseCard, type CourseCardLabels } from "@/components/golf/CourseCard";

interface RelatedCoursesProps {
  title: string;
  courses: GolfListing[];
  locale: string;
  cardLabels: CourseCardLabels;
}

export function RelatedCourses({ title, courses, locale, cardLabels }: RelatedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <h2 className="font-serif text-3xl font-medium text-foreground">{title}</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {courses.map((course) => (
          <div key={course.id} className="min-w-[280px] md:min-w-0">
            <CourseCard course={course} locale={locale} labels={cardLabels} />
          </div>
        ))}
      </div>
    </section>
  );
}
