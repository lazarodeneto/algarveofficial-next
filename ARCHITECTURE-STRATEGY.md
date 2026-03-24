# 🏗️ OPTIMAL NEXT.JS 16 ARCHITECTURE FOR SEO + SCALE

**Purpose:** Define the "perfect" routing, rendering strategy, and SEO setup for a directory platform with 1000+ listings.

---

## 📊 CURRENT vs OPTIMAL

### CURRENT ARCHITECTURE (Broken)
```
❌ /directory/page.tsx                  → force-dynamic (500ms TTFB, not indexed)
❌ /[locale]/directory/page.tsx         → force-dynamic (same issue)
❌ /[locale]/listing/[id]/page.tsx      → force-dynamic (1000+ pages, not indexable)
❌ /[city]/[category]/page.tsx          → static ✅ (but missing non-localized)
❌ /[locale]/[city]/[category]/page.tsx → static ✅

⚠️ Missing Pages:
   - /[locale]/[city]                   (city hubs)
   - /[locale]/[category]               (category indexes)
   - /[locale]/[landmark]/...           (proximity-based)

❌ Route Collision:
   - /restaurants/lagos matches [city]/[category] with city="restaurants" → 404
```

### OPTIMAL ARCHITECTURE (Proposed)
```
✅ /page.tsx                            → static, 1 hour ISR (home)
✅ /robots.ts                           → static crawl rules
✅ /sitemap.ts                          → segmented, static

✅ /[locale]/layout.tsx                 → generateStaticParams (all locales)
✅ /[locale]/page.tsx                   → static home, locale-scoped

✅ /[locale]/directory/page.tsx         → ISR (3600s), generateStaticParams
✅ /[locale]/directory/[...]/page.tsx   → REMOVED (deprecated)

✅ /[locale]/[city]/page.tsx            → ISR (86400s), generateStaticParams
   └─ City hub: all categories, top listings, local content

✅ /[locale]/[category]/page.tsx        → ISR (86400s), generateStaticParams
   └─ Category index: all cities, curated listings

✅ /[locale]/[city]/[category]/page.tsx → ISR (3600s), generateStaticParams
   └─ PRIMARY: programmatic pages, fully indexed

✅ /[locale]/listing/[id]/page.tsx      → ISR (3600s), generateStaticParams (top 500)
   └─ Listing detail: LocalBusiness schema, rich snippets

✅ /[city]/[category]/page.tsx          → ISR (3600s), generateStaticParams
   └─ ENGLISH ONLY: no locale prefix (SEO best practice)
   └─ Mirrors /[locale]/[city]/[category] with LOCALE="en"

✅ /[locale]/[landmark]/[category]/page.tsx → (FUTURE)
   └─ Proximity-based: "near Vilamoura marina"

Static Pages (Single Instances):
✅ /about-us, /contact, /blog, /events, /destinations, etc.
   └─ Exists at both / and /[locale]/... via redirects
```

---

## 🎯 ROUTING DECISION TREE

### 1. Is This a Localized Page?
- **YES (most pages)** → Put in `/[locale]/...`
- **NO (English-first)** → Put in `/...` (root) AND `/[locale]/...`

### 2. Is This Data-Driven (Dynamic)?
- **YES** → Use ISR with `revalidate` + `generateStaticParams`
  - Pre-generate top 500 (by tier/rating)
  - On-demand ISR for long tail
- **NO (static content)** → Just use `revalidate = 86400`

### 3. What's the Revalidation Window?
```
Frequently Updated (hourly):
  - Directory listings (new items added hourly)
  - Blog posts (updated throughout day)
  - Events (live updates)
  → revalidate = 3600

Daily Updates:
  - Category/city pages (rollup of listings)
  - City landing pages
  → revalidate = 86400

Weekly Updates:
  - Static pages (about, contact, etc.)
  → revalidate = 604800

Never Updates:
  - Archived content
  → revalidate = false (fully static)
```

### 4. Will It Scale Past 1000 Items?
- **NO** → Simple `generateStaticParams` with all items
- **YES** → Segment generation:
  ```tsx
  export async function generateStaticParams() {
    // Only pre-generate top 500
    const top = await getTop500ByRating();
    return top.map(item => ({ id: item.id }));
    // Rest use on-demand ISR
  }
  ```

---

## 📈 PROPOSED COMPLETE STRUCTURE

```
app/
│
├── layout.tsx                          # Root layout (RootLayout)
│   ├── Import fonts, providers, i18n
│   ├── NO revalidate (inherits)
│   └── Use headers() for locale detection
│
├── page.tsx                            # Root home /
│   ├── export revalidate = 86400
│   ├── Showcase, latest listings, featured content
│   └── Fully server-rendered (no client hydration if possible)
│
├── robots.ts                           # Crawl rules
├── sitemap.ts                          # Segmented sitemap
├── sitemap[0].ts                       # Pages 0-5000
├── sitemap[1].ts                       # Pages 5000-10000 (if needed)
│
├── [locale]/
│   ├── layout.tsx                      # Locale scope + LocaleProvider
│   │   ├── export generateStaticParams() → SUPPORTED_LOCALES
│   │   └── Server validate locale or notFound()
│   │
│   ├── page.tsx                        # Localized home /[locale]
│   │   ├── export revalidate = 86400
│   │   └── Mirror of root /page.tsx but with locale context
│   │
│   ├── directory/
│   │   ├── page.tsx                    # ✅ CRITICAL: ISR Directory
│   │   │   ├── export revalidate = 3600
│   │   │   ├── export generateStaticParams() → SUPPORTED_LOCALES
│   │   │   ├── generateMetadata with noIndex for ?filters
│   │   │   └── DirectoryClient (client-side filtering hydrates)
│   │   │
│   │   ├── [slug]/                     # ❌ DEPRECATED (remove)
│   │   │   └── page.tsx                # Old filters, use redirect or delete
│   │   │
│   │   └── error.tsx                   # Error boundary
│   │
│   ├── [city]/                         # ✅ NEW: City Hubs
│   │   ├── page.tsx                    # City landing
│   │   │   ├── export revalidate = 86400
│   │   │   ├── export generateStaticParams()
│   │   │   ├── Show all categories available in city
│   │   │   └── Top listings per category
│   │   │
│   │   └── [category]/                 # ✅ City + Category (CRITICAL)
│   │       ├── page.tsx                # Main programmatic page
│   │       │   ├── export revalidate = 3600
│   │       │   ├── export generateMetadata() → hreflang, canonical
│   │       │   ├── export generateStaticParams()
│   │       │   ├── Full listing grid with schema
│   │       │   └── Related cities/categories sections
│   │       │
│   │       ├── layout.tsx              # (optional breadcrumb layout)
│   │       └── error.tsx               # Error boundary
│   │
│   ├── [category]/                     # ✅ NEW: Category Index
│   │   ├── page.tsx                    # All cities for this category
│   │   │   ├── export revalidate = 86400
│   │   │   ├── export generateStaticParams()
│   │   │   ├── Show all cities with this category
│   │   │   ├── Top listings aggregate
│   │   │   └── Internal links to /{city}/{category}
│   │   │
│   │   └── layout.tsx                  # (optional)
│   │
│   ├── listing/                        # ✅ Listing Detail Pages
│   │   └── [id]/
│   │       ├── page.tsx                # Listing detail
│   │       │   ├── export revalidate = 3600
│   │       │   ├── export generateStaticParams()
│   │       │   │   └── Top 500 by rating, rest on-demand
│   │       │   ├── generateMetadata() → hreflang, OG image
│   │       │   ├── LocalBusiness schema + AggregateRating
│   │       │   └── "More in {city}" + "Similar {category}" sections
│   │       │
│   │       └── error.tsx               # Error boundary
│   │
│   ├── blog/                           # Blog (ISR daily)
│   │   ├── page.tsx                    # Blog list
│   │   │   ├── export revalidate = 86400
│   │   │   └── generateStaticParams() → get top 100 posts
│   │   │
│   │   └── [slug]/
│   │       ├── page.tsx                # Blog post
│   │       │   ├── export revalidate = 3600
│   │       │   ├── generateStaticParams() → top 100
│   │       │   └── BlogPosting schema
│   │       │
│   │       └── error.tsx
│   │
│   ├── events/                         # Events (ISR hourly)
│   │   ├── page.tsx
│   │   │   ├── export revalidate = 3600
│   │   │   └── generateStaticParams()
│   │   │
│   │   └── [slug]/
│   │       └── page.tsx
│   │           ├── export revalidate = 1800 (30 min)
│   │           └── Event schema
│   │
│   ├── destinations/                   # City guides (ISR daily)
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── about-us/                       # Static pages
│   │   └── page.tsx
│   │       ├── export revalidate = 604800 (weekly)
│   │       └── No dynamic params
│   │
│   ├── contact/
│   │   └── page.tsx
│   │
│   ├── privacy-policy/
│   │   └── page.tsx
│   │
│   ├── terms/
│   │   └── page.tsx
│   │
│   ├── error.tsx                       # Global error boundary
│   └── not-found.tsx                   # 404 page
│
├── [city]/                             # ✅ ENGLISH ROOT: Non-Localized Pages
│   ├── [category]/
│   │   ├── page.tsx                    # Same as /[locale]/[city]/[category]
│   │   │   │                           # but with LOCALE = "en"
│   │   │   ├── export revalidate = 3600
│   │   │   ├── export generateStaticParams()
│   │   │   └── Mirror logic of localized version
│   │   │
│   │   └── layout.tsx
│   │
│   └── page.tsx                        # City hub (non-localized)
│       ├── export revalidate = 86400
│       └── Mirror /[locale]/[city]/page.tsx
│
├── api/
│   ├── revalidate/
│   │   └── route.ts                    # On-demand ISR endpoint
│   │       └── POST /api/revalidate?path=/path
│   │           ├── Validate secret
│   │           ├── revalidateTag() or revalidatePath()
│   │           └── Return { revalidated: true }
│   │
│   ├── webhook/
│   │   └── supabase.ts                 # Listen for Supabase changes
│   │       └── On listing update → POST /api/revalidate
│   │
│   └── listing/
│       └── [id]/
│           └── route.ts                # Listing API (if needed)
│
└── error.tsx                           # Root error boundary
└── not-found.tsx                       # Root 404
```

---

## 🔄 RENDERING STRATEGY BY PAGE TYPE

### TIER 1: Homepage + Marketing Pages
```tsx
// app/page.tsx, app/[locale]/page.tsx
export const revalidate = 86400;  // Update 1x daily

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export default async function HomePage({ params }) {
  // Server fetch: featured listings, latest blog, events
  // All content rendered server-side
  // No client-side hydration overhead
}
```
**Result:** Fast, cacheable, SEO-friendly

---

### TIER 2: Directory + Filters
```tsx
// app/[locale]/directory/page.tsx
export const revalidate = 3600;  // Update hourly

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({ searchParams }) {
  // Check if filtered
  if (searchParams.category || searchParams.city) {
    // Add noindex for thin duplicates
  }
}

export default async function DirectoryPage({ params, searchParams }) {
  // Get initial data (for server render)
  const initialListings = await getListingsByFilters(searchParams);

  return (
    <>
      <Script id="schema">{...}</Script>

      {/* Server-rendered initial state */}
      <ListingGrid listings={initialListings} />

      {/* Client component hydrates for interactivity */}
      <DirectoryClient initialListings={initialListings} />
    </>
  );
}
```
**Result:** First page fully indexed, filters are client-side enhancement

---

### TIER 3: Programmatic Pages (High Volume)
```tsx
// app/[locale]/[city]/[category]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  // Pre-generate all city/category combinations
  return getAllCategoryCityCombinations();
}

export async function generateMetadata({ params }) {
  // Hreflang, canonical, OG image
  return {
    alternates: {
      canonical: getCanonicalUrl(params),
      languages: getHreflangMap(params),
    },
  };
}

export default async function CategoryCityPage({ params }) {
  const data = await getCategoryCityData(params);

  return (
    <>
      <Script id="schema-itemlist">{...}</Script>
      <Script id="schema-breadcrumb">{...}</Script>

      {/* Fully server-rendered, no JS needed */}
      <Breadcrumb />
      <h1>Restaurants in Lagos</h1>
      <ListingGrid listings={data.listings} />
      <RelatedCities />
      <RelatedCategories />
    </>
  );
}
```
**Result:** 1000+ pages fully indexed, crawlable, cacheable

---

### TIER 4: Listing Detail Pages (Scalability)
```tsx
// app/[locale]/listing/[id]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  // Only pre-generate top 500
  const top500 = await getTopListingsByTier(500);

  return top500.flatMap(listing =>
    SUPPORTED_LOCALES.map(locale => ({
      locale,
      id: listing.id,
    }))
  );
}

export default async function ListingPage({ params }) {
  const listing = await getListing(params.id);

  return (
    <>
      <Script id="listing-schema">{
        "@type": "LocalBusiness",
        "aggregateRating": { ... }
      }</Script>

      {/* Fully server-rendered listing detail */}
      <ListingDetail listing={listing} />

      {/* Related listings (server-rendered) */}
      <MoreInCity city={listing.city} count={9} />
      <SimilarCategory category={listing.category} count={6} />
    </>
  );
}
```
**Result:** Top 500 pre-built, rest on-demand ISR (fast enough)

---

## 🌍 LOCALE HANDLING BEST PRACTICES

### URL Structure
```
English (no prefix):
  /                        ✅
  /lagos/restaurants       ✅
  /listing/123             ✅

Portuguese (pt-pt prefix):
  /pt-pt                   ✅
  /pt-pt/lagos/restaurantes ✅
  /pt-pt/listing/123       ✅

French (fr prefix):
  /fr                      ✅
  /fr/lagos/restaurants    ✅

❌ NEVER:
  /en/...                  ← Strip via middleware 301
  /en-US/...               ← Not a supported locale
```

### Hreflang Structure
```html
<!-- On /lagos/restaurants (English) -->
<link rel="canonical" href="https://algarveofficial.com/lagos/restaurants" />
<link rel="alternate" hrefLang="en" href="https://algarveofficial.com/lagos/restaurants" />
<link rel="alternate" hrefLang="pt-PT" href="https://algarveofficial.com/pt-pt/lagos/restaurantes" />
<link rel="alternate" hrefLang="fr" href="https://algarveofficial.com/fr/lagos/restaurants" />
<link rel="alternate" hrefLang="x-default" href="https://algarveofficial.com/lagos/restaurants" />
```

### Middleware Responsibilities
```ts
// middleware.ts — Single entry point for locale logic
1. Strip /en/ prefix → redirect to no prefix
2. Normalize casing: /PT-PT/ → /pt-pt/
3. Redirect old formats: /restaurants/lagos → /lagos/restaurants
4. Set x-locale header for server components
5. NO query param meddling (that's per-route)
```

---

## ⚙️ ISR + On-Demand Revalidation

### Strategy
```
1. Deploy with ISR settings
   - Directory: revalidate = 3600
   - Listings: revalidate = 3600
   - City pages: revalidate = 86400

2. Add webhook listener
   - Supabase changes → POST /api/revalidate
   - Immediately invalidate affected page(s)

3. For urgent updates
   - Manual: POST /api/revalidate?path=/lagos/restaurants
   - Clears cache instantly
```

### Implementation
```ts
// pages/api/revalidate.ts
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Validate webhook secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { path, tags } = body;

  try {
    // Option 1: Revalidate specific path
    if (path) {
      revalidatePath(path);
    }

    // Option 2: Revalidate by tag (for multiple URLs)
    if (tags) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
```

---

## 📊 PERFORMANCE TARGETS

After implementing optimal architecture:

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| TTFB | 480ms | <50ms | ISR + CDN caching |
| LCP | 3.2s | <1.5s | Server rendering |
| CLS | 0.25 | <0.1 | Image optimization |
| Lighthouse SEO | 78 | 98 | Metadata + schema |
| Crawl Budget | 40% | 85% | Robots.txt + ISR |
| Pages Indexed | 500 | 2000+ | ISR + generateStaticParams |
| Avg Position | 18 | 8 | Rich snippets + content |
| CTR | 3.2% | 4.8% | OG images + rating stars |

---

## 🚀 MIGRATION CHECKLIST

- [ ] **Phase 1 (Week 1):** ISR conversions
  - [ ] Convert `/directory` to ISR
  - [ ] Convert `/listing/[id]` to ISR
  - [ ] Verify sitemap works

- [ ] **Phase 2 (Week 2):** New pages
  - [ ] Create `/[locale]/[city]/page.tsx`
  - [ ] Create `/[locale]/[category]/page.tsx`
  - [ ] Create `[city]/[category]` (English only)

- [ ] **Phase 3 (Week 3):** Schema + Metadata
  - [ ] Add LocalBusiness to listings
  - [ ] Add breadcrumb to all pages
  - [ ] Fix sitemap

- [ ] **Phase 4 (Week 4):** Optimization
  - [ ] Dynamic OG images
  - [ ] Webhook revalidation
  - [ ] Performance testing

---

## 🎓 KEY LEARNINGS

1. **ISR > force-dynamic for SEO pages** — Always pre-generate + ISR when possible
2. **generateStaticParams scales to 5000+** — Use pagination for larger sets
3. **Hreflang must be 100% correct** — Google will index wrong URLs if hreflang mismatches
4. **Schema first, styling second** — Rich snippets drive more traffic than beautiful UI
5. **Breadcrumb = free CTR boost** — ~8% more clicks with visible breadcrumbs in SERP
6. **Robots.txt prevents crawl waste** — Disallow filters, duplicates, internal search
7. **Sitemap > Sitemap Index** — Segment when >5000 entries to avoid timeouts

---

## 🔗 NEXT STEPS

1. **Read:** `COMPREHENSIVE-PRODUCTION-AUDIT-2026.md` (this audit)
2. **Implement:** Top 5 quick fixes from `QUICK-FIX-REFERENCE.md` (15 min)
3. **Test:** Run verification commands to confirm caching + indexation
4. **Deploy:** Phase 1 (week 1) to production
5. **Monitor:** Google Search Console for crawl efficiency, indexation, positions
6. **Iterate:** Use Phase 2-4 roadmap over next 3 weeks

---

**Questions?** Refer back to main audit for detailed explanations and code samples.
