/**
 * REFACTORED Directory Page
 *
 * This is a REFERENCE IMPLEMENTATION showing the correct pattern.
 * Copy the important parts to your actual page.tsx
 *
 * Key improvements:
 * - Proper generateMetadata() with canonical + hreflang
 * - Uses centralized SEO helpers
 * - Correct locale routing
 * - No hardcoded "en" logic
 */

import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const revalidate = 3600; // ISR: revalidate every hour

/**
 * Generate metadata for Directory page
 * This runs on server during build/request time
 * Automatically generates:
 * - Correct canonical URL: /en/directory, /pt-pt/directory, etc.
 * - All hreflang alternates
 * - OG tags
 * - Twitter cards
 * - Robots directives
 */
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
    description:
      "Browse our curated directory of premium listings in the Algarve, from luxury villas to fine dining restaurants and golf courses.",
    keywords: [
      "Algarve directory",
      "Algarve listings",
      "premium accommodations",
      "restaurants",
      "golf courses",
      "things to do",
    ],
  });
}

/**
 * Directory page component
 * Server-side rendered for optimal SEO
 */
export default async function DirectoryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return <div>Invalid locale</div>;
  }

  const locale = rawLocale as Locale;

  // TODO: Fetch listings data based on locale
  // const listings = await fetchListings(locale);

  return (
    <main className="min-h-screen">
      <section className="py-12 md:py-16">
        <div className="app-container">
          <h1 className="text-4xl font-serif mb-4">Directory</h1>
          <p className="text-lg text-muted-foreground">
            Explore our curated collection of premium destinations and services in the Algarve.
          </p>
        </div>
      </section>

      {/*
        TODO: Add directory listing sections
        Make sure to use LocalizedLink for all internal links:

        <LocalizedLink href="/about">About</LocalizedLink>
        // This automatically becomes:
        // /en/about (if locale is "en")
        // /pt-pt/about (if locale is "pt-pt")
        // etc.
      */}
    </main>
  );
}
