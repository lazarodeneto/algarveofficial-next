import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

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

  return buildLocalizedMetadata({
    locale,
    path: "/directory",
    title: "Directory",
    description: "Browse our curated directory of premium listings in the Algarve.",
    keywords: ["Algarve directory", "luxury listings", "restaurants", "golf"],
  });
}

export default async function DirectoryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return <div>Invalid locale</div>;
  }

  return (
    <main>
      <h1>Directory</h1>
      <p>SSR TEST OK</p>
    </main>
  );
}