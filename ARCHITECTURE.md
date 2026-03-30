# AlgarveOfficial Architecture

This document covers the core architectural systems for the AlgarveOfficial Next.js application.

---

## Table of Contents

1. [Locale Routing Architecture](#1-locale-routing-architecture)
2. [Adding a New Programmatic Page Type](#2-adding-a-new-programmatic-page-type)
3. [Category Slug Translation System](#3-category-slug-translation-system)
4. [Adding a New Supported Locale](#4-adding-a-new-supported-locale)

---

## 1. Locale Routing Architecture

### Overview

The application uses a hybrid locale routing strategy:
- **Default locale (`en`)**: No prefix (e.g., `/destinations/golden-triangle`)
- **Other locales**: Language prefix (e.g., `/pt-pt/destinations/golden-triangle`)

### Key Files

| File | Purpose |
|------|---------|
| `lib/i18n/config.ts` | Locale definitions, configs, validation |
| `lib/i18n/routing.ts` | Path manipulation utilities |
| `lib/i18n/seo.ts` | Hreflang, canonical URLs |
| `lib/i18n/server.ts` | Server-side translation loading |

### Locale Configuration

Locales are defined in `lib/i18n/config.ts`:

```typescript
export const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_CONFIGS: Record<Locale, {...}> = {
  en: { name: "English", hreflang: "en", shortName: "EN", dateLocale: "en-GB" },
  "pt-pt": { name: "Português", hreflang: "pt-PT", shortName: "PT", dateLocale: "pt-PT" },
  // ... other locales
};
```

### URL Patterns

| Route Type | Example |
|------------|---------|
| Default locale home | `/` |
| Localized home | `/pt-pt` |
| Default locale page | `/destinations/golden-triangle` |
| Localized page | `/pt-pt/destinations/golden-triangle` |
| API routes | `/api/reviews` (locale-agnostic) |

### Path Manipulation

Use these utilities from `@/lib/i18n/config`:

```typescript
import { addLocaleToPathname, stripLocaleFromPathname, isValidLocale } from "@/lib/i18n/config";
import { getLocaleFromPathnameSafe } from "@/lib/i18n/routing";

// Add locale to a path
const localizedPath = addLocaleToPathname("/destinations", "pt-pt"); // "/pt-pt/destinations"

// Strip locale from a path
const barePath = stripLocaleFromPathname("/pt-pt/destinations"); // "/destinations"

// Validate locale string
if (isValidLocale(maybeLocale)) { /* safe to use */ }

// Get locale from URL path
const locale = getLocaleFromPathnameSafe("/pt-pt/destinations"); // "pt-pt"
```

### Page Structure

Locale-aware pages use the `[locale]` catch-all segment:

```
app/
├── [locale]/
│   ├── page.tsx              # Homepage (e.g., /en, /pt-pt)
│   ├── destinations/
│   │   └── [slug]/
│   │       └── page.tsx     # /en/destinations/:slug
│   ├── visit/
│   │   ├── page.tsx         # /en/visit
│   │   └── [city]/
│   │       └── page.tsx     # /en/visit/:city
```

### Middleware

Locale detection happens in `middleware.ts`:

1. Check cookie `NEXT_LOCALE`
2. Check Accept-Language header
3. Fall back to default locale

---

## 2. Adding a New Programmatic Page Type

### What is a Programmatic Page?

Programmatic pages are dynamically generated from database content:
- **Destinations** (`/destinations/{slug}`) - Region hub pages
- **City pages** (`/visit/{city}`) - City hub pages  
- **Category pages** (`/visit/{city}/{category}`) - Category filtered by city
- **Listings** (`/listing/{id-or-slug}`) - Individual business pages

### Adding a New Page Type

Follow this pattern:

#### Step 1: Define Route Structure

Create the route in `app/[locale]/`:

```
app/[locale]/new-page-type/
└── [slug]/
    └── page.tsx
```

#### Step 2: Implement the Page Component

```typescript
// app/[locale]/new-page-type/[slug]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { createPublicServerClient } from "@/lib/supabase/public-server";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const getPageData = cache(async (slug: string, locale: string) => {
  const supabase = createPublicServerClient();
  
  // Fetch data from database
  const { data } = await supabase
    .from("your_table")
    .select("*")
    .eq("slug", slug)
    .single();
    
  return data;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getPageData(slug, locale);
  
  return buildPageMetadata({
    title: data?.name,
    description: data?.short_description,
    localizedPath: `/new-page-type/${slug}`,
  });
}

export default async function NewPageType({ params }: PageProps) {
  const { locale, slug } = await params;
  const resolvedLocale = locale as any; // or cast properly
  const data = await getPageData(slug, resolvedLocale);
  
  if (!data) notFound();
  
  return (
    <main>
      <h1>{data.name}</h1>
      {/* Render content */}
    </main>
  );
}
```

#### Step 3: Add to Route Map (if admin)

If the page needs admin management, add to `AdminDashboardPage.tsx`:

```typescript
const staticRouteMap: Record<string, ReactElement> = {
  "new-page-type": <AdminNewPageType />,
  // ...
};
```

### Data Fetching Pattern

Use React `cache` for deduplication:

```typescript
const getData = cache(async (id: string, locale: string) => {
  // Fetch from Supabase
});
```

---

## 3. Category Slug Translation System

### Overview

Categories use **canonical slugs** in the database and **localized slugs** in URLs. This allows SEO-friendly URLs in each language while maintaining a single source of truth.

### Canonical vs URL Slugs

| Canonical (DB) | en | pt-pt | fr |
|----------------|----|----|-----|
| `restaurants` | `restaurants` | `restaurantes` | `restaurants` |
| `places-to-stay` | `accommodation` | `alojamento` | `hebergement` |
| `golf` | `golf` | `golfe` | `golf` |

### Key Files

| File | Purpose |
|------|---------|
| `lib/seo/programmatic/category-slugs.ts` | Slug mappings, translation functions |
| `lib/categoryMerges.ts` | Legacy category consolidation |

### Using the System

```typescript
import { 
  getCanonicalFromUrlSlug, 
  getCategoryUrlSlug,
  ALL_CANONICAL_SLUGS 
} from "@/lib/seo/programmatic/category-slugs";
import type { Locale } from "@/lib/i18n/config";

// Convert URL slug → canonical slug (for DB queries)
const canonical = getCanonicalFromUrlSlug("restaurantes", "pt-pt"); // "restaurants"

// Convert canonical slug → URL slug (for links)
const urlSlug = getCategoryUrlSlug("restaurants", "pt-pt"); // "restaurantes"

// Get all canonical slugs
const allCategories = ALL_CANONICAL_SLUGS; // ["restaurants", "places-to-stay", ...]
```

### Adding a New Category

1. Add to `CanonicalCategorySlug` type in `category-slugs.ts`
2. Add to `ALL_CANONICAL_SLUGS` array
3. Add locale mappings in `CATEGORY_URL_SLUGS`
4. Add display names in `CATEGORY_DISPLAY_NAMES`
5. Update `getCanonicalFromUrlSlug` reverse lookup

```typescript
// lib/seo/programmatic/category-slugs.ts

// 1. Add type
export type CanonicalCategorySlug = 
  | "restaurants"
  | "places-to-stay"
  // ... existing
  | "new-category";  // ← NEW

// 2. Add to array
export const ALL_CANONICAL_SLUGS: CanonicalCategorySlug[] = [
  "restaurants",
  // ... existing
  "new-category",  // ← NEW
];

// 3. Add mappings
export const CATEGORY_URL_SLUGS: Record<CanonicalCategorySlug, Record<Locale, string>> = {
  // ... existing
  new-category: {
    en: "new-category",
    "pt-pt": "nova-categoria",
    fr: "nouvelle-categorie",
    // ... all supported locales
  },
};
```

---

## 4. Adding a New Supported Locale

### Overview

Adding a locale requires updates across multiple files:
1. Config files (definition)
2. Translation bundles (UI strings)
3. Date libraries (formatting)
4. Third-party services (if applicable)

### Step-by-Step

#### Step 1: Update Config

Edit `lib/i18n/config.ts`:

```typescript
// Add to SUPPORTED_LOCALES
export const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da", "pl"] as const;

// Add to LOCALE_CONFIGS
export const LOCALE_CONFIGS: Record<Locale, {...}> = {
  // ... existing
  pl: {
    name: "Polski",
    hreflang: "pl-PL",
    shortName: "PL",
    dateLocale: "pl-PL",
  },
};

// Add to LOCALE_LANGUAGE_MAP
export const LOCALE_LANGUAGE_MAP: Record<string, Locale> = {
  // ... existing
  pl: "pl",
  "pl-pl": "pl",
};
```

#### Step 2: Create Translation Bundle

Create `i18n/locales/pl.json`:

```json
{
  "common.cancel": "Anuluj",
  "common.save": "Zapisz",
  "nav.home": "Strona główna"
}
```

You can copy `en.json` as a template and translate keys.

#### Step 3: Import in Server Bundle

Edit `lib/i18n/server.ts`:

```typescript
// Add import
import pl from "@/i18n/locales/pl.json";

const localeLoaders: Record<Locale, () => Promise<TranslationNode>> = {
  // ... existing
  pl: () => Promise.resolve(pl as TranslationNode),
};
```

#### Step 4: Add Category Slug Translations

Edit `lib/seo/programmatic/category-slugs.ts`:

```typescript
export const CATEGORY_URL_SLUGS: Record<CanonicalCategorySlug, Record<Locale, string>> = {
  restaurants: {
    // ... existing
    pl: "restauracje",  // ← NEW
  },
  // ... repeat for all categories
};

export const CATEGORY_DISPLAY_NAMES: Record<CanonicalCategorySlug, Record<Locale, string>> = {
  restaurants: {
    // ... existing
    pl: "Restauracje",  // ← NEW
  },
  // ... repeat for all categories
};
```

#### Step 5: Verify Build

```bash
npm run typecheck
npm run lint
```

### Files Typically Modified

| File | Change |
|------|--------|
| `lib/i18n/config.ts` | Add to SUPPORTED_LOCALES, LOCALE_CONFIGS, LOCALE_LANGUAGE_MAP |
| `lib/i18n/server.ts` | Add import and loader |
| `i18n/locales/{locale}.json` | Create translation bundle |
| `lib/seo/programmatic/category-slugs.ts` | Add category translations |
| `legacy-pages/admin/cms/AdminTranslations.tsx` | Update LOCALES array (if used) |

---

## Quick Reference

### Common Imports

```typescript
// Locale config
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isValidLocale, addLocaleToPathname } from "@/lib/i18n/config";

// Routing  
import { getLocaleFromPathnameSafe, stripLocaleFromPathname } from "@/lib/i18n/routing";

// SEO
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildHreflangs } from "@/lib/i18n/seo";

// Category slugs
import { getCanonicalFromUrlSlug, getCategoryUrlSlug, ALL_CANONICAL_SLUGS } from "@/lib/seo/programmatic/category-slugs";

// Supabase
import { createPublicServerClient } from "@/lib/supabase/public-server";
```

### Common Patterns

```typescript
// Server component with locale
export default async function Page({ params }: Props) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  
  const data = await fetchData(resolvedLocale);
  
  return <div>{/* content */}</div>;
}

// Link with locale
import { LocaleLink } from "@/components/navigation/LocaleLink";
<LocaleLink href="/destinations/golden-triangle">Destinations</LocaleLink>

// useTranslation in client components
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
<p>{t("common.key", "Fallback")}</p>
```
