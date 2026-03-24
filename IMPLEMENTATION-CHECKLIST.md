# ✅ IMPLEMENTATION CHECKLIST

Use this checklist to track progress on the audit fixes.

---

## 🔴 PHASE 1 — CRITICAL FIXES (Week 1)
**Target Time:** 1.5 hours | **Impact:** +30% crawl efficiency, TTFB -91%

### FIX #1: Convert Directory to ISR
- [ ] Open `app/[locale]/directory/page.tsx`
- [ ] **Line 1:** Change `export const dynamic = "force-dynamic";` → `export const revalidate = 3600;`
- [ ] **Add before `generateMetadata()`:**
  ```tsx
  export function generateStaticParams() {
    return SUPPORTED_LOCALES.map((locale) => ({ locale }));
  }
  ```
- [ ] Verify file is saved
- [ ] Test: `curl -I https://algarveofficial.com/en/directory` → should cache within 1 hour

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #2: Add NoIndex to Filtered Directory
- [ ] Open `app/[locale]/directory/page.tsx`
- [ ] Find `generateMetadata()` function (around line 140)
- [ ] Add filter detection:
  ```tsx
  const hasFilters = Boolean(
    resolvedSearchParams.q ||
    resolvedSearchParams.category ||
    resolvedSearchParams.city ||
    resolvedSearchParams.region ||
    resolvedSearchParams.tier
  );
  ```
- [ ] Add noindex for filtered views:
  ```tsx
  if (hasFilters) {
    metadata.robots = { index: false, follow: true };
  }
  ```
- [ ] Test: `curl https://algarveofficial.com/en/directory?category=restaurants | grep noindex`

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #3: Convert Listing Pages to ISR
- [ ] Open `app/[locale]/listing/[id]/page.tsx`
- [ ] **Line 1:** Change `export const dynamic = "force-dynamic";` → `export const revalidate = 3600;`
- [ ] **Create** `lib/supabase/listings.ts`:
  ```ts
  export async function getTopListingsByTier(limit: number = 500) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id, slug, tier, google_rating")
      .order("tier", { ascending: true })
      .order("google_rating", { ascending: false })
      .limit(limit);
    return data || [];
  }
  ```
- [ ] **Add to `app/[locale]/listing/[id]/page.tsx`:**
  ```tsx
  export async function generateStaticParams() {
    const topListings = await getTopListingsByTier(500);
    const params = [];
    for (const listing of topListings) {
      for (const locale of SUPPORTED_LOCALES) {
        params.push({ locale, id: listing.id });
      }
    }
    return params;
  }
  ```
- [ ] Test: `curl -I https://algarveofficial.com/en/listing/[top-id]` → should be <100ms (if pre-generated)

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #4: Delete Orphaned Directory Route
- [ ] Check if `app/directory/page.tsx` exists
- [ ] Delete file: `rm app/directory/page.tsx`
- [ ] (Optional) Add middleware redirect if needed:
  ```ts
  if (pathname === "/directory") {
    return NextResponse.redirect(new URL("/en/directory", request.url), 301);
  }
  ```
- [ ] Test: `curl -L https://algarveofficial.com/directory` → should redirect to `/en/directory`

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #5: Rewrite Sitemap
- [ ] Create/replace `app/sitemap.ts` with correct implementation
- [ ] **Key requirements:**
  - ✅ Include `/lagos/restaurants` (no `/en` prefix)
  - ✅ Include `/pt-pt/lagos/restaurantes` (with prefix)
  - ✅ NO `/directory/restaurants` entries (routes don't exist)
  - ✅ Include all localized static pages
- [ ] Test: `curl https://algarveofficial.com/sitemap.xml | head -30`
  - Should show correct URLs
  - Should NOT have any `/en/` prefixed English pages
  - Should NOT have `/directory/` entries

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### Phase 1 Verification
- [ ] Deploy changes to Vercel
- [ ] Wait 10 minutes for build to complete
- [ ] Run all 5 test commands above
- [ ] Check Vercel deployment log for any errors
- [ ] Monitor Google Search Console > Coverage for new indexable pages

**Phase 1 Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

## 🟠 PHASE 2 — SEO WINS (Week 2)
**Target Time:** 1 hour | **Impact:** +2000 new pages, +15-20% traffic

### FIX #6: Create City Landing Pages
- [ ] Create `app/[locale]/[city]/page.tsx` (use template from QUICK-FIX-REFERENCE.md)
- [ ] Verify `generateStaticParams()` exists and iterates all cities + locales
- [ ] Verify `generateMetadata()` includes hreflang + canonical
- [ ] Test: `curl https://algarveofficial.com/en/lagos` → should return city page

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #7: Add LocalBusiness Schema to Listings
- [ ] Open `app/[locale]/listing/[id]/page.tsx`
- [ ] Import: `import Script from "next/script";`
- [ ] Before return statement, add schema construction:
  ```tsx
  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.short_description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: listing.google_rating?.toFixed(1),
      reviewCount: listing.google_review_count,
    },
  };
  ```
- [ ] Add Script tag in JSX:
  ```tsx
  <Script id="listing-schema" type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
  />
  ```
- [ ] Test: `curl https://algarveofficial.com/en/listing/123 | grep aggregateRating`

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #8: Add Robots.txt
- [ ] Create `app/robots.ts`
- [ ] Include crawl rules (disallow `/api`, `/admin`, etc.)
- [ ] Include sitemap URL
- [ ] Test: `curl https://algarveofficial.com/robots.txt | grep Sitemap`

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### Phase 2 Verification
- [ ] Deploy to Vercel
- [ ] Test city landing pages exist and are indexed
- [ ] Check Google Search Console > Enhancement reports > Structured Data
  - Should show LocalBusiness entries
- [ ] Monitor Analytics for traffic increase (2-week window)

**Phase 2 Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

## 🟡 PHASE 3-4 — OPTIMIZATION (Week 3-4)
**Target Time:** 2-3 hours | **Impact:** Core Web Vitals 90+, CTR +50%

### FIX #9: Create Category Index Pages
- [ ] Create `app/[locale]/[category]/page.tsx`
- [ ] Show all cities for this category
- [ ] Include aggregated listings
- [ ] Test: `curl https://algarveofficial.com/en/restaurants` → category index page

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### FIX #10: Add Breadcrumb Schema to All Pages
- [ ] Identify all major page types
- [ ] Add breadcrumb JSON-LD to each
- [ ] Test: `curl https://algarveofficial.com/en/lagos/restaurants | grep breadcrumb`

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### OPTIONAL: Dynamic OG Images
- [ ] Implement `next/og` for dynamic OG image generation
- [ ] Test: Share listing page on Twitter, should show custom OG image

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

### OPTIONAL: Webhook Revalidation
- [ ] Create `pages/api/revalidate.ts`
- [ ] Set up Supabase webhook to POST on listing changes
- [ ] Test: Update a listing in Supabase, verify page cache clears

**Status:** ⏳ Not Started | ⚙️ In Progress | ✅ Complete

---

## 📊 PROGRESS SUMMARY

| Phase | Status | Time | Impact |
|-------|--------|------|--------|
| Phase 1: Critical Fixes | ⏳ | 1.5h | TTFB -91%, +30% crawl |
| Phase 2: SEO Wins | ⏳ | 1h | +2000 pages, +15% traffic |
| Phase 3: Optimization | ⏳ | 2-3h | Core Web Vitals 90+, +50% CTR |
| **TOTAL** | ⏳ | **4.5-5h** | **+50% organic traffic** |

---

## 🧪 TESTING CHECKLIST (Do After Each Phase)

### After Phase 1
- [ ] `curl -I https://algarveofficial.com/en/directory` → Cache-Control exists
- [ ] `curl https://algarveofficial.com/sitemap.xml | head -20` → Correct URLs
- [ ] `curl https://algarveofficial.com/robots.txt` → Valid (or doesn't 404)
- [ ] Lighthouse SEO score improves from 78 → 85+
- [ ] Vercel Analytics show TTFB <100ms

### After Phase 2
- [ ] `curl https://algarveofficial.com/en/lagos` → City page exists
- [ ] `curl https://algarveofficial.com/en/listing/123 | grep aggregateRating` → Schema exists
- [ ] Google Search Console > Rich Results → Shows LocalBusiness
- [ ] Analytics show +5-10% traffic increase (after 1 week)

### After Phase 3
- [ ] Lighthouse PageSpeed score >85 (all pages)
- [ ] Core Web Vitals: LCP <2.5s, CLS <0.1
- [ ] Google Search Console > Performance → Top queries improve
- [ ] CTR increases by 15-50% (check Analytics)

---

## 🚀 QUICK WINS ORDER (If Short on Time)

**Do these first (15 min):**
1. [ ] FIX #1: ISR Directory (2 min)
2. [ ] FIX #3: ISR Listings (3 min)
3. [ ] FIX #4: Delete `/directory` (1 min)
4. [ ] FIX #5: Rewrite sitemap (20 min)
5. [ ] Deploy and test (5 min)

**Wait 1 week, then do Phase 2**

---

## 📞 COMMON BLOCKERS

| Issue | Solution | Time |
|-------|----------|------|
| ISR not working | Clear `.next/`, verify `generateStaticParams` | 10 min |
| Sitemap 500 error | Use pagination, segment if >5000 items | 15 min |
| Hreflang still wrong | Verify middleware doesn't affect canonical | 10 min |
| Listing pages slow | Check top 500 are pre-generated | 10 min |
| Google not indexing | Wait 1-2 weeks, submit sitemap, check GSC | 5 min + wait |

---

## ✅ FINAL SIGN-OFF

- [ ] All Phase 1 fixes deployed and tested
- [ ] Google Search Console submitted & monitoring
- [ ] Team trained on ISR maintenance
- [ ] Monitoring alerts set up (TTFB, crawl, indexation)
- [ ] Next review scheduled (1 week from Phase 1 deploy)

**Completion Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

---

**Good luck! You've got this.** 🚀

Track your progress at: https://search.google.com/search-console/coverage
