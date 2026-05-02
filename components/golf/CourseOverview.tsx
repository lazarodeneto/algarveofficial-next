interface CourseOverviewProps {
  title: string;
  description?: string | null;
}

export function CourseOverview({ title, description }: CourseOverviewProps) {
  const paragraphs = (description ?? "")
    .split(/\n{2,}|(?<=\.)\s+(?=[A-ZÀ-Ý])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (paragraphs.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="max-w-2xl">
        <h2 className="font-serif text-3xl font-medium text-foreground">{title}</h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
