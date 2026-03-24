import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIGS,
} from "@/lib/i18n/config";
import {
  getCanonicalFromUrlSlug,
  getCategoryUrlSlug,
  getCategoryDisplayName,
  ALL_CANONICAL_SLUGS,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import {
  getAllCategoryCityCombinations,
  getCategoryCityPageData,
  isValidCitySlug,
} from "@/lib/seo/programmatic/category-city-data";
import {
  generateSeoContentBlock,
} from "@/lib/seo/programmatic/content-blocks";
import {
  buildItemListSchema,
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/programmatic/schema-builders";
import { LocalizedLink } from "@/components/navigation/LocalizedLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import { getServerTranslations } from "@/lib/i18n/server";

export const revalidate = 3600;

// English is the default locale — no prefix in URL
const LOCALE = "en" as const;

interface PageParams {
  city: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const combinations = await getAllCategoryCityCombinations();

  return combinations
    .filter(({ categorySlug }) =>
      ALL_CANONICAL_SLUGS.includes(categorySlug as CanonicalCategorySlug),
    )
    .map(({ categorySlug, citySlug }) => ({
      city: citySlug,
      category: getCategoryUrlSlug(categorySlug as CanonicalCategorySlug, LOCALE),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, category: categoryUrlSlug } = await params;

  if (!isValidCitySlug(citySlug)) return {};

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, LOCALE);
  if (!canonical) return {};

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) return {};

  const content = generateSeoContentBlock(
    LOCALE,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  const hreflangAlternates: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    const locCatSlug = getCategoryUrlSlug(canonical, loc);
    const hreflang = LOCALE_CONFIGS[loc].hreflang;
    const localePath =
      loc === "en"
        ? `/${citySlug}/${locCatSlug}`
        : `/${loc}/${citySlug}/${locCatSlug}`;
    hreflangAlternates[hreflang] = `${siteUrl}${localePath}`;
  }
  hreflangAlternates["x-default"] = `${siteUrl}/${citySlug}/${getCategoryUrlSlug(canonical, "en")}`;

  const canonical_url = `${siteUrl}/${citySlug}/${categoryUrlSlug}`;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonical_url,
      languages: hreflangAlternates,
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: canonical_url,
      siteName: "AlgarveOfficial",
      locale: LOCALE_CONFIGS[LOCALE].dateLocale ?? "en_GB",
      type: "website",
      images: data.city.image_url
        ? [{ url: data.city.image_url, width: 1200, height: 630, alt: `${data.city.name} ${getCategoryDisplayName(canonical, LOCALE)}` }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { city: citySlug, category: categoryUrlSlug } = await params;

  // ✅ FIX: prevent collision with static routes like /directory
  const VALID_CATEGORIES = [
    "restaurants",
    "hotels",
    "experiences",
    "real-estate",
    "golf",
    "beach-clubs",
    "wellness",
  ];

  // Validate city
  if (!isValidCitySlug(citySlug)) {
    notFound();
  }

  // ✅ NEW: validate category BEFORE anything else
  if (!VALID_CATEGORIES.includes(categoryUrlSlug)) {
    notFound();
  }

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, LOCALE);
  if (!canonical) notFound();

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) notFound();

  const content = generateSeoContentBlock(
    LOCALE,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
  );

  const tx = await getServerTranslations(LOCALE, [
    "nav.home",
    "common.avgRating",
    "common.inOtherCities",
    "common.moreToExploreIn",
    "common.curated",
    "common.signature",
    "common.verified",
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  const itemListSchema = buildItemListSchema(LOCALE, canonical, data.city.name, citySlug, categoryUrlSlug, data.listings);
  const breadcrumbSchema = buildBreadcrumbSchema(LOCALE, canonical, data.city.name, citySlug, categoryUrlSlug);
  const collectionSchema = buildCollectionPageSchema(LOCALE, canonical, data.city.name, citySlug, categoryUrlSlug, data.totalCount);

  return (
    <>
      <Script
        id="schema-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="schema-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          {data.city.image_url && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={data.city.image_url}
                alt={`${data.city.name} ${getCategoryDisplayName(canonical, LOCALE)}`}
                fill
                className="object-cover opacity-15"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
            </div>
          )}
          <div className="app-container py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <LocalizedLink href="/" className="hover:text-foreground transition-colors">
                    {tx["nav.home"] ?? "Home"}
                  </LocalizedLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li>
                  <LocalizedLink
                    href={`/${citySlug}`}
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {data.city.name}
                  </LocalizedLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li className="text-foreground font-medium">{getCategoryDisplayName(canonical, LOCALE)}</li>
              </ol>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              {content.h1}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                {data.totalCount} {getCategoryDisplayName(canonical, LOCALE).toLowerCase()}
              </span>
              {data.listings.some((l) => l.google_rating) && (
                <span>
                  ★{" "}
                  {(
                    data.listings
                      .filter((l) => l.google_rating)
                      .reduce((s, l) => s + (l.google_rating ?? 0), 0) /
                    data.listings.filter((l) => l.google_rating).length
                  ).toFixed(1)}{" "}
                  {tx["common.avgRating"] ?? "avg rating"}
                </span>
              )}
              <span>{data.city.name}, Algarve, Portugal</span>
            </div>
          </div>
        </section>

        <section className="app-container py-8">
          <div className="max-w-3xl">
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              {content.intro}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {content.bodyParagraph}
            </p>
          </div>
        </section>

        <section className="app-container py-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} tx={tx} />
            ))}
          </div>
        </section>

        {data.relatedCities.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryDisplayName(canonical, LOCALE)} {tx["common.inOtherCities"] ?? "in other Algarve cities"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCities.map((city) => (
                <LocalizedLink
                  key={city.slug}
                  href={`/${city.slug}/${categoryUrlSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {city.name}
                  <span className="text-xs opacity-60">({city.count})</span>
                </LocalizedLink>
              ))}
            </div>
          </section>
        )}

        {data.relatedCategories.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {tx["common.moreToExploreIn"] ?? "More to explore in"} {data.city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCategories.map((cat) => {
                const relCatCanonical = cat.slug as CanonicalCategorySlug;
                const relCatUrlSlug = ALL_CANONICAL_SLUGS.includes(relCatCanonical)
                  ? getCategoryUrlSlug(relCatCanonical, LOCALE)
                  : cat.slug;
                return (
                  <LocalizedLink
                    key={cat.slug}
                    href={`/${citySlug}/${relCatUrlSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {cat.name}
                    <span className="text-xs opacity-60">({cat.count})</span>
                  </LocalizedLink>
                );
              })}
            </div>
          </section>
        )}

        {/* Hidden hreflang links for crawlers */}
        <div className="sr-only" aria-hidden="true">
          {SUPPORTED_LOCALES.map((loc) => {
            const locCatSlug = getCategoryUrlSlug(canonical, loc);
            const href =
              loc === "en"
                ? `/${citySlug}/${locCatSlug}`
                : `/${loc}/${citySlug}/${locCatSlug}`;
            return (
              <Link key={loc} href={href} hrefLang={LOCALE_CONFIGS[loc].hreflang}>
                {getCategoryDisplayName(canonical, loc)} in {data.city.name}
              </Link>
            );
          })}
        </div>

        <section className="app-container py-8 border-t border-border">
          <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {content.closingParagraph}
          </p>
        </section>
      </main>
    </>
  );
}

