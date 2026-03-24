import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildHreflangs } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const metadata = buildLocalizedMetadata({
    locale,
    path: "/directory",
    title: "Directory",
    description: "Browse our curated directory of premium listings in the Algarve.",
    keywords: ["Algarve directory", "luxury listings", "restaurants", "golf"],
  });

  // Explicitly add hreflang links to alternates
  const hreflangs = buildHreflangs("/directory");
  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as any)?.canonical,
      languages: hreflangs,
    } as any,
  };
}

export default async function DirectoryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return <div>Invalid locale</div>;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, name, Nome")
    .limit(10);

  if (error) {
    console.error(error);
    return <div>Error loading</div>;
  }

  return (
    <main>
      <h1>Directory</h1>

      {data?.length ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              {item.name || item.Nome || "Unnamed"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No listings</p>
      )}
    </main>
  );
}