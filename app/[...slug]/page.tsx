import { notFound, redirect } from "next/navigation";

interface LegacyRoutePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const LEGACY_LOCALE_PREFIXES = new Set([
  "pt-pt",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "sv",
  "no",
  "da",
]);

export default async function LegacyRoutePage({ params }: LegacyRoutePageProps) {
  const resolved = await params;
  const slug = resolved.slug || [];
  const [maybeLocalePrefix, ...rest] = slug;

  if (maybeLocalePrefix && LEGACY_LOCALE_PREFIXES.has(maybeLocalePrefix.toLowerCase())) {
    const destinationPath = rest.length > 0 ? `/${rest.join("/")}` : "/";
    redirect(destinationPath);
  }

  notFound();
}
