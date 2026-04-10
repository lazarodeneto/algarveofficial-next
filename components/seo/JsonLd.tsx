import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildContactPageSchema,
  buildEventSchema,
  buildFaqSchema,
  buildItemListSchema,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildTouristDestinationSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
} from "@/lib/seo/schemaBuilders.js";
import { SITE_URL, localizeSeoUrl, toAbsoluteSeoUrl } from "@/lib/seoUrls";

// Organization Schema
export function OrganizationJsonLd() {
  const schema = buildOrganizationSchema(SITE_URL);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema with SearchAction
export function WebsiteJsonLd() {
  const schema = buildWebsiteSchema(SITE_URL);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale?: string | null;
}) {
  const schema = buildBreadcrumbSchema(
    items.map((item) => ({
      name: item.name,
      url: localizeSeoUrl(item.url, locale),
    })),
  );
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
  image?: string;
}

interface ItemListJsonLdProps {
  name: string;
  url: string;
  description?: string;
  items: ItemListEntry[];
  locale?: string | null;
}

export function ItemListJsonLd({ name, url, description, items, locale }: ItemListJsonLdProps) {
  const schema = buildItemListSchema({
    name,
    url: localizeSeoUrl(url, locale),
    description,
    items: items.map((item) => ({
      name: item.name,
      url: localizeSeoUrl(item.url, locale),
      description: item.description,
      image: item.image ? toAbsoluteSeoUrl(item.image) : undefined,
    })),
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebPageJsonLdProps {
  name: string;
  url: string;
  description?: string;
  image?: string;
  type?: string;
  locale?: string | null;
}

export function WebPageJsonLd({
  name,
  url,
  description,
  image,
  type = "WebPage",
  locale,
}: WebPageJsonLdProps) {
  const schema = buildWebPageSchema({
    name,
    description,
    url: localizeSeoUrl(url, locale),
    image: image ? toAbsoluteSeoUrl(image) : undefined,
    type,
    siteUrl: SITE_URL,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ContactPageJsonLdProps {
  name: string;
  url: string;
  description?: string;
  image?: string;
  email?: string | null;
  telephone?: string | null;
  areaServed?: string | null;
  locale?: string | null;
}

export function ContactPageJsonLd({
  name,
  url,
  description,
  image,
  email,
  telephone,
  areaServed,
  locale,
}: ContactPageJsonLdProps) {
  const schema = buildContactPageSchema({
    name,
    description,
    url: localizeSeoUrl(url, locale),
    image: image ? toAbsoluteSeoUrl(image) : undefined,
    email,
    telephone,
    areaServed,
    siteUrl: SITE_URL,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local Business / Place Schema for listings
interface UserReview {
  author: string;
  rating: number;
  comment?: string | null;
  datePublished: string;
}

interface LocalBusinessJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  address?: string;
  city?: string;
  telephone?: string;
  email?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  category?: string;
  tags?: string[];
  categoryData?: Record<string, unknown> | null;
  openingHours?: string[];
  userReviews?: UserReview[];
}

export function LocalBusinessJsonLd({
  name,
  description,
  image,
  url,
  address,
  city,
  telephone,
  email,
  priceRange,
  rating,
  reviewCount,
  latitude,
  longitude,
  category,
  tags,
  categoryData,
  openingHours,
  userReviews,
}: LocalBusinessJsonLdProps) {
  const schema = buildLocalBusinessSchema({
    name,
    description,
    image,
    url,
    address,
    city,
    telephone,
    email,
    priceRange,
    rating,
    reviewCount,
    latitude,
    longitude,
    category,
    tags,
    categoryData,
    openingHours,
    userReviews,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema for premium items/services
interface ProductJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  brand?: string;
  priceFrom?: number;
  priceTo?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}

export function ProductJsonLd({
  name,
  description,
  image,
  url,
  brand = "AlgarveOfficial",
  priceFrom,
  priceTo,
  currency = "EUR",
  rating,
  reviewCount,
  availability = "InStock",
}: ProductJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: brand,
    },
  };

  if (priceFrom) {
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: priceFrom,
      highPrice: priceTo || priceFrom,
      availability: `https://schema.org/${availability}`,
      url,
    };
  }

  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Event Schema
interface EventJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  startDate: string;
  endDate?: string;
  location?: string;
  city?: string;
  venue?: string;
  priceRange?: string;
  ticketUrl?: string;
}

export function EventJsonLd({
  name,
  description,
  image,
  url,
  startDate,
  endDate,
  location,
  city,
  venue,
  ticketUrl,
}: EventJsonLdProps) {
  const schema = buildEventSchema({
    name,
    description,
    image,
    url,
    startDate,
    endDate,
    location,
    city,
    venue,
    ticketUrl,
    siteUrl: SITE_URL,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article/Blog Post Schema
interface ArticleJsonLdProps {
  headline: string;
  description?: string;
  image?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  image,
  url,
  datePublished,
  dateModified,
  authorName = "AlgarveOfficial",
  authorUrl = SITE_URL,
}: ArticleJsonLdProps) {
  const schema = buildArticleSchema({
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified,
    authorName,
    authorUrl,
    siteUrl: SITE_URL,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = buildFaqSchema(items);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// TouristDestination Schema for city and region pages
interface TouristDestinationJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  latitude?: number;
  longitude?: number;
  containedInPlace?: string;
  touristType?: string[];
}

export function TouristDestinationJsonLd({
  name,
  description,
  image,
  url,
  latitude,
  longitude,
  containedInPlace,
  touristType,
}: TouristDestinationJsonLdProps) {
  const schema = buildTouristDestinationSchema({
    name,
    description,
    image,
    url,
    latitude,
    longitude,
    containedInPlace,
    touristType,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default {
  OrganizationJsonLd,
  WebsiteJsonLd,
  BreadcrumbJsonLd,
  ItemListJsonLd,
  WebPageJsonLd,
  ContactPageJsonLd,
  LocalBusinessJsonLd,
  ProductJsonLd,
  EventJsonLd,
  ArticleJsonLd,
  FaqJsonLd,
  TouristDestinationJsonLd,
};
