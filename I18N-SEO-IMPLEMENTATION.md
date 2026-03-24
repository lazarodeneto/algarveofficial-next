# 🚀 i18n + SEO Implementation Guide

**Status:** Ready to Implement
**Estimated Time:** 2-3 hours
**Complexity:** Medium

---

## 📋 Implementation Checklist

### Phase 1: Create Core Helpers (15 min)
- [ ] Copy `lib/i18n/seo.ts` (NEW FILE - already created)
- [ ] Copy `lib/seo/metadata-builders.ts` (NEW FILE - already created)
- [ ] Verify imports are correct
- [ ] No breaking changes to existing code

### Phase 2: Update Directory Page (15 min)
- [ ] Open `app/[locale]/directory/page.tsx`
- [ ] Add `generateMetadata` function (see reference implementation)
- [ ] Test canonical URL is correct
- [ ] Test hreflang tags appear
- [ ] Verify SSR still works (`curl` shows h1)

### Phase 3: Refactor [city]/[category] Page (30 min)
- [ ] Open `app/[locale]/[city]/[category]/page.tsx`
- [ ] Replace hardcoded canonical logic with `buildCanonicalUrl()`
- [ ] Replace hreflang generation with `buildHreflangs()`
- [ ] Remove `locale === "en"` hardcoded conditions
- [ ] Test metadata generation
- [ ] Verify no regressions

### Phase 4: Update Other Pages (45 min)
- [ ] Add metadata to: `/about-us`, `/contact`, `/blog`, `/events`, etc.
- [ ] Use `buildLocalizedMetadata()` on all public pages
- [ ] Test each page's canonical and hreflang
- [ ] Verify search console can crawl

### Phase 5: Add Middleware (optional, 15 min)
- [ ] Review `middleware-i18n.ts`
- [ ] Decide: replace, merge, or keep separate from Supabase middleware
- [ ] If merging: combine with existing `middleware.ts`
- [ ] Test language detection and redirect
- [ ] Test "/" redirects to "/en/" (or detected locale)

### Phase 6: Testing & Validation (30 min)
- [ ] Build locally: `npm run build`
- [ ] Run dev server: `npm run start`
- [ ] Check canonical URLs with curl
- [ ] Check hreflang tags with curl
- [ ] Validate with Google Mobile-Friendly Test
- [ ] Check for console errors
- [ ] Test language switching
- [ ] Verify ISR still works

---

## 📝 Step-by-Step Instructions

### Step 1: Create Core Helpers

✅ **Already done!** These files have been created:
- `lib/i18n/seo.ts`
- `lib/seo/metadata-builders.ts`

You can use them immediately.

### Step 2: Update Directory Page

**File:** `app/[locale]/directory/page.tsx`

**Current Code:**
```tsx
export const revalidate = 3600;

export default function DirectoryPage() {
  return (
    <main>
      <h1>Directory</h1>
      <p>SSR TEST OK</p>
    </main>
  );
}
```

**Refactored Code:**
```tsx
import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
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
    description:
      "Browse our curated directory of premium listings in the Algarve.",
    keywords: [
      "Algarve directory",
      "Algarve listings",
      "premium accommodations",
      "restaurants",
      "golf courses",
    ],
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
```

### Step 3: Refactor [city]/[category] Page

**File:** `app/[locale]/[city]/[category]/page.tsx`

**Key Changes:**

1. **Replace hardcoded canonical URL** (lines 104-106):

   **Before:**
   ```tsx
   const canonical_url = locale === "en"
     ? `${siteUrl}/${citySlug}/${categoryUrlSlug}`
     : `${siteUrl}/${locale}/${citySlug}/${categoryUrlSlug}`;
   ```

   **After:**
   ```tsx
   const pagePath = `/${citySlug}/${categoryUrlSlug}`;
   // Use buildLocalizedMetadata which handles canonical automatically
   ```

2. **Replace hreflang generation** (lines 93-102):

   **Before:**
   ```tsx
   const hreflangAlternates: Record<string, string> = {};
   for (const loc of SUPPORTED_LOCALES) {
     const locCatSlug = getCategoryUrlSlug(canonical, loc);
     const hreflang = LOCALE_CONFIGS[loc].hreflang;
     const localePath = loc === "en"
       ? `/${citySlug}/${locCatSlug}`
       : `/${loc}/${citySlug}/${locCatSlug}`;
     hreflangAlternates[hreflang] = `${siteUrl}${localePath}`;
   }
   ```

   **After:**
   ```tsx
   import { buildHreflangs } from "@/lib/i18n/seo";

   const pagePath = `/${citySlug}/${categoryUrlSlug}`;
   const hreflangs = buildHreflangs(pagePath);
   ```

3. **Use buildLocalizedMetadata in generateMetadata:**

   ```tsx
   import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

   export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
     // ... validation code ...

     const pagePath = `/${citySlug}/${categoryUrlSlug}`;
     const categoryName = getCategoryDisplayName(canonical, locale);
     const title = `${categoryName} in ${data.city.name}`;

     return buildLocalizedMetadata({
       locale,
       path: pagePath,
       title,
       description: `${categoryName} in ${data.city.name}, Algarve...`,
       image: data.city.image_url || undefined,
       type: "website",
     });
   }
   ```

4. **Update hreflang links** (around line 330):

   **Before:**
   ```tsx
   {SUPPORTED_LOCALES.map((loc) => {
     const locCatSlug = getCategoryUrlSlug(canonical, loc);
     const href = loc === "en"
       ? `/${citySlug}/${locCatSlug}`
       : `/${loc}/${citySlug}/${locCatSlug}`;
     return (
       <Link key={loc} href={href} hrefLang={LOCALE_CONFIGS[loc].hreflang}>
         {getCategoryDisplayName(canonical, loc)} in {data.city.name}
       </Link>
     );
   })}
   ```

   **After:**
   ```tsx
   {Object.entries(hreflangs).map(([hreflang, url]) => (
     <Link
       key={hreflang}
       href={url}
       hrefLang={hreflang}
       data-hreflang={hreflang}
     >
       {getCategoryDisplayName(canonical, locale)} in {data.city.name}
     </Link>
   ))}
   ```

### Step 4: Apply to Other Pages

**Pattern for any page:**

```tsx
import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;

  return buildLocalizedMetadata({
    locale,
    path: "/your-page-path",
    title: "Your Page Title",
    description: "Your page description",
  });
}

export default async function YourPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return null;
  // Page content
}
```

**Apply this to:**
- [ ] `/[locale]/about-us/page.tsx`
- [ ] `/[locale]/contact/page.tsx`
- [ ] `/[locale]/blog/page.tsx`
- [ ] `/[locale]/blog/[slug]/page.tsx`
- [ ] `/[locale]/events/page.tsx`
- [ ] `/[locale]/events/[slug]/page.tsx`
- [ ] `/[locale]/destinations/page.tsx`
- [ ] `/[locale]/destinations/[slug]/page.tsx`
- [ ] `/[locale]/listing/[id]/page.tsx`
- [ ] And any other public pages

### Step 5: Optional - Add Middleware

**Note:** Only do this if you want language detection and automatic redirects.

**Option A: Merge with existing Supabase middleware**

Your current `middleware.ts` handles Supabase. Merge the i18n logic:

```tsx
// middleware.ts - MERGED VERSION

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getLocaleFromPathname, resolveLocaleFromAcceptLanguage } from "@/lib/i18n/config";

const UNLOCALIZED_ROUTES = ["/api", "/_next", "/static", "/favicon", "/robots", "/sitemap"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip unlocalized routes
  if (UNLOCALIZED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get locale and set header
  const locale = getLocaleFromPathname(pathname);
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  // Handle root redirect
  if (pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = resolveLocaleFromAcceptLanguage(acceptLanguage);
    return NextResponse.redirect(new URL(`/${detectedLocale}/`, request.url));
  }

  // (Keep your Supabase client code here if you have it)

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.git).*)"],
};
```

**Option B: Keep separate**

If you prefer, keep `middleware.ts` as-is and reference the i18n patterns but don't implement the middleware. The system works fine without it.

### Step 6: Testing

**Test 1: Check Canonical URLs**
```bash
curl -s https://localhost:3000/en/directory | grep canonical
# Expected: <link rel="canonical" href="https://algarveofficial.com/en/directory" />
```

**Test 2: Check hreflang Tags**
```bash
curl -s https://localhost:3000/pt-pt/directory | grep hreflang
# Expected:
# <link rel="alternate" hreflang="en" href="https://algarveofficial.com/en/directory" />
# <link rel="alternate" hreflang="pt-PT" href="https://algarveofficial.com/pt-pt/directory" />
# etc.
```

**Test 3: Check h1 Still Renders (SSR)**
```bash
curl -s https://localhost:3000/en/directory | grep "<h1"
# Expected: <h1>Directory</h1>
```

**Test 4: Build**
```bash
npm run build
# Expected: No errors, all pages compiled
```

**Test 5: Google Mobile-Friendly Test**
```
Visit: https://search.google.com/test/mobile-friendly
Test URL: https://algarveofficial.com/en/directory
Expected: Page passes, proper indexing
```

---

## 🎯 Validation Checklist

After implementation, verify:

### Canonical URLs
- [ ] Every public page has `<link rel="canonical" href="..." />`
- [ ] Canonical URL includes correct locale prefix
- [ ] Canonical is self-referential (page points to itself)

### hreflang Tags
- [ ] Every public page has hreflang for all locales
- [ ] hreflang for "en": `/en/...`
- [ ] hreflang for "pt-pt": `/pt-pt/...`
- [ ] x-default points to English version
- [ ] hreflang values match LOCALE_CONFIGS

### Metadata
- [ ] Title is present and branded
- [ ] Description is present (< 160 chars)
- [ ] OG tags are present
- [ ] Twitter cards are present
- [ ] Robots directives are correct

### Locale Routing
- [ ] All URLs follow `/[locale]/path` pattern
- [ ] No mixing of patterns (/path vs /locale/path)
- [ ] LocalizedLink works on all pages
- [ ] Language switcher works

### Performance
- [ ] Build time: < 30 seconds
- [ ] SSR: pages render on server (curl shows content)
- [ ] ISR: pages update on schedule
- [ ] No hydration errors in console

---

## 🐛 Common Issues & Solutions

### Issue: "Maximum call stack size exceeded"
**Cause:** Circular dependency in imports
**Solution:** Check that `lib/i18n/seo.ts` doesn't import from metadata-builders

### Issue: Canonical URL wrong
**Cause:** Passing wrong path to helper
**Solution:** Make sure path doesn't include locale prefix
```tsx
// ❌ WRONG
buildCanonicalUrl(locale, "/en/directory")

// ✅ RIGHT
buildCanonicalUrl(locale, "/directory")
```

### Issue: hreflang missing x-default
**Cause:** Not using buildHreflangs() helper
**Solution:** Always use the helper, don't build manually
```tsx
// ✅ USE THIS
const hreflangs = buildHreflangs("/directory");

// ❌ DON'T DO THIS
const hreflangs = { en: "...", pt: "..." }; // Missing x-default!
```

### Issue: SSR stopped working
**Cause:** Added "use client" accidentally
**Solution:** Remove "use client" from server pages
```tsx
// ❌ WRONG
"use client";
export async function generateMetadata() { ... }

// ✅ RIGHT
// No "use client" directive
export async function generateMetadata() { ... }
```

---

## 📚 Reference Implementation Files

- `lib/i18n/seo.ts` - Core i18n SEO helpers
- `lib/seo/metadata-builders.ts` - Metadata building utilities
- `app/[locale]/directory/page-refactored.tsx` - Directory page example
- `app/[locale]/[city]/[category]/page-refactored.ts` - Complex page example
- `middleware-i18n.ts` - Optional middleware for language detection

---

## ✅ Success Criteria

✅ **You're done when:**

1. All public pages have `generateMetadata()`
2. All pages use `buildLocalizedMetadata()`
3. No hardcoded `locale === "en"` logic
4. Canonical URLs are consistent across all pages
5. hreflang tags include all locales + x-default
6. Build succeeds
7. curl shows h1 on all pages (SSR works)
8. No console errors
9. Google Mobile-Friendly Test passes

---

## 🚀 Deployment

Once everything is working locally:

1. Commit changes
2. Push to GitHub
3. Vercel auto-deploys
4. Test on staging first
5. Monitor Google Search Console
6. Google will re-crawl and re-index within 24 hours

---

**Questions?** Check `I18N-SEO-AUDIT.md` for detailed analysis.
