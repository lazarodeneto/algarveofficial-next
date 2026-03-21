import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIGS,
  isValidLocale,
  addLocaleToPathname,
  type Locale,
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
  type CategoryCityPageData,
} from "@/lib/seo/programmatic/category-city-data";
import {
  generateSeoContentBlock,
} from "@/lib/seo/programmatic/content-blocks";
import {
  buildItemListSchema,
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/programmatic/schema-builders";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { LocalizedLink } from "@/components/navigation/LocalizedLink";

// ─── ISR ───────────────────────────────────────────────────────────────────────

export const revalidate = 3600; // 1 hour

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageParams {
  locale: string;
  category: string; // URL slug (locale-specific)
  city: string;     // always the DB city slug (invariant across locales)
}

interface PageProps {
  params: Promise<PageParams>;
}

// ─── Static params ────────────────────────────────────────────────────────────

/**
 * Generates all /{locale}/{category-url-slug}/{city-slug} combinations.
 * Only generates pages that have at least one published listing.
 *
 * With 1000+ listings spread across ~9 categories × ~20 cities = ~180 DB combos
 * × 10 locales = ~1,800 statically generated pages.
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  const combinations = await getAllCategoryCityCombinations();

  const params: PageParams[] = [];

  for (const { categorySlug, citySlug } of combinations) {
    // Skip if this DB category slug is not in our programmatic set
    if (!ALL_CANONICAL_SLUGS.includes(categorySlug as CanonicalCategorySlug)) continue;

    for (const locale of SUPPORTED_LOCALES) {
      params.push({
        locale,
        category: getCategoryUrlSlug(categorySlug as CanonicalCategorySlug, locale),
        city: citySlug,
      });
    }
  }

  return params;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, category: categoryUrlSlug, city: citySlug } = await params;

  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) return {};

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) return {};

  const content = generateSeoContentBlock(
    locale,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
  );

  const localizedPath = `/${canonical}/${citySlug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  // Build correct hreflang: each locale gets its own translated category URL slug
  const hreflangAlternates: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    const locCatSlug = getCategoryUrlSlug(canonical, loc);
    const hreflang = LOCALE_CONFIGS[loc].hreflang;
    hreflangAlternates[hreflang] = `${siteUrl}/${loc}/${locCatSlug}/${citySlug}`;
  }
  hreflangAlternates["x-default"] = `${siteUrl}/en/${getCategoryUrlSlug(canonical, "en")}/${citySlug}`;

  const canonical_url = `${siteUrl}/${locale}/${categoryUrlSlug}/${citySlug}`;

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
      locale: LOCALE_CONFIGS[locale]?.dateLocale ?? "en_GB",
      type: "website",
      images: data.city.image_url
        ? [{ url: data.city.image_url, width: 1200, height: 630, alt: `${getCategoryDisplayName(canonical, locale)} in ${data.city.name}` }]
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

// ─── Page component ────────────────────────────────────────────────────────────

export default async function CategoryCityPage({ params }: PageProps) {
  const { locale: rawLocale, category: categoryUrlSlug, city: citySlug } = await params;

  if (!isValidLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) notFound();

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) notFound();

  const content = generateSeoContentBlock(
    locale,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  const itemListSchema = buildItemListSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug, data.listings);
  const breadcrumbSchema = buildBreadcrumbSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug);
  const collectionSchema = buildCollectionPageSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug, data.totalCount);

  return (
    <>
      {/* ── JSON-LD Structured Data ── */}
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
        {/* ── Hero / Header ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          {data.city.image_url && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={data.city.image_url}
                alt={`${getCategoryDisplayName(canonical, locale)} in ${data.city.name}`}
                fill
                className="object-cover opacity-15"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
            </div>
          )}
          <div className="app-container py-12 md:py-16">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <LocalizedLink href="/" className="hover:text-foreground transition-colors">
                    Home
                  </LocalizedLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li>
                  <LocalizedLink
                    href={`/${categoryUrlSlug}`}
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {getCategoryDisplayName(canonical, locale)}
                  </LocalizedLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li className="text-foreground font-medium">{data.city.name}</li>
              </ol>
            </nav>

            {/* H1 — Primary keyword target */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              {content.h1}
            </h1>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                {data.totalCount} {getCategoryDisplayName(canonical, locale).toLowerCase()}
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
                  avg rating
                </span>
              )}
              <span>{data.city.name}, Algarve, Portugal</span>
            </div>
          </div>
        </section>

        {/* ── SEO Content Block (server-rendered, above listings) ── */}
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

        {/* ── Listings Grid ── */}
        <section className="app-container py-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} locale={locale} />
            ))}
          </div>
        </section>

        {/* ── Internal Linking: Related Cities ── */}
        {data.relatedCities.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryDisplayName(canonical, locale)} in other Algarve cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCities.map((city) => (
                <LocalizedLink
                  key={city.slug}
                  href={`/${categoryUrlSlug}/${city.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {city.name}
                  <span className="text-xs opacity-60">({city.count})</span>
                </LocalizedLink>
              ))}
            </div>
          </section>
        )}

        {/* ── Internal Linking: Related Categories in Same City ── */}
        {data.relatedCategories.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              More to explore in {data.city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCategories.map((cat) => {
                const relCatCanonical = cat.slug as CanonicalCategorySlug;
                const relCatUrlSlug = ALL_CANONICAL_SLUGS.includes(relCatCanonical)
                  ? getCategoryUrlSlug(relCatCanonical, locale)
                  : cat.slug;
                return (
                  <LocalizedLink
                    key={cat.slug}
                    href={`/${relCatUrlSlug}/${citySlug}`}
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

        {/* ── Locale Language Switcher Links (hidden, SEO signals) ── */}
        <div className="sr-only" aria-hidden="true">
          {SUPPORTED_LOCALES.map((loc) => {
            const locCatSlug = getCategoryUrlSlug(canonical, loc);
            return (
              <Link key={loc} href={`/${loc}/${locCatSlug}/${citySlug}`} hrefLang={LOCALE_CONFIGS[loc].hreflang}>
                {getCategoryDisplayName(canonical, loc)} in {data.city.name}
              </Link>
            );
          })}
        </div>

        {/* ── SEO Closing Content ── */}
        <section className="app-container py-8 border-t border-border">
          <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {content.closingParagraph}
          </p>
        </section>
      </main>
    </>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  locale,
}: {
  listing: CategoryCityPageData["listings"][number];
  locale: Locale;
}) {
  const tierBadge =
    listing.tier === "signature"
      ? "Signature"
      : listing.tier === "verified"
        ? "Verified"
        : null;

  return (
    <LocalizedLink
      href={`/listing/${listing.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.featured_image_url ? (
          <Image
            src={listing.featured_image_url}
            alt={listing.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        {tierBadge && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {tierBadge}
          </span>
        )}
        {listing.is_curated && (
          <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            Curated
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {listing.name}
        </h3>
        {listing.short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {listing.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {listing.google_rating !== null ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-amber-500">★</span>
              {listing.google_rating.toFixed(1)}
              {listing.google_review_count && (
                <span className="opacity-60">({listing.google_review_count})</span>
              )}
            </span>
          ) : (
            <span />
          )}
          {listing.price_from && (
            <span className="text-xs text-muted-foreground">
              From {listing.price_currency ?? "€"}{listing.price_from}
            </span>
          )}
        </div>
      </div>
    </LocalizedLink>
  );
}
