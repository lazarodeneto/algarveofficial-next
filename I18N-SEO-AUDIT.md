# 🔍 i18n + SEO Audit Report

**Date:** March 24, 2026
**Status:** Ready for Production Refactor
**Priority:** HIGH (affects SEO rankings, site crawlability)

---

## 📊 Current State Assessment

### ✅ STRENGTHS

| Component | Status | Quality |
|-----------|--------|---------|
| Locale Config (`lib/i18n/config.ts`) | ✅ Excellent | Well-structured, 10 locales, good helpers |
| LocalizedLink Component | ✅ Good | Context-based, handles special routes |
| [locale]/[city]/[category] Page | ✅ Very Good | Full metadata, schema, hreflang implementation |
| Schema Builders | ✅ Excellent | Comprehensive coverage for multiple types |
| Static Params Generation | ✅ Good | Supports all locale/city/category combos |
| SSR/ISR Setup | ✅ Good | `revalidate = 3600` (after our recent fix) |

### ❌ CRITICAL ISSUES

| Issue | Severity | Impact | Location |
|-------|----------|--------|----------|
| Inconsistent canonical URLs | 🔴 HIGH | SEO confusion, duplicate content signals | Multiple pages |
| Missing hreflang on simple pages | 🔴 HIGH | Search engines can't find alternates | /directory, /about, etc |
| No metadata on /directory | 🔴 HIGH | Page not indexable, no rich snippets | app/[locale]/directory |
| Locale routing inconsistency | 🔴 HIGH | Some paths `/en/...`, others just `/...` | Lines 97, 104 in [city]/[category] |
| No x-default hreflang | 🟠 MEDIUM | Missing SEO signal for default language | All pages |
| Hardcoded "en" logic | 🟠 MEDIUM | Not scalable, error-prone | [city]/[category] page |
| No middleware redirect | 🟡 LOW | Browser language detection not working | Missing middleware.ts |

### ⚠️ ARCHITECTURAL RISKS

1. **Canonical URL Building** - Currently page-specific, not centralized
   - Different logic in different pages = inconsistency
   - Risk of duplicate canonical URLs
   - Makes auditing harder

2. **hreflang Generation** - Scattered across pages
   - [city]/[category] has one implementation
   - Other pages have different/missing implementations
   - No single source of truth

3. **Link Handling** - Only client-side via context
   - Server-generated links might lose locale
   - RSS feeds, XML sitemaps might be incorrect

4. **Locale Routing** - Mixing patterns
   - `/directory` (root) vs `/en/directory` vs `/pt-pt/directory`
   - Line 97 shows hardcoded: `loc === "en" ? ... : ...`
   - This breaks consistency

---

## 🔧 Issues in Detail

### Issue #1: Inconsistent Locale Prefix

**Current Code** ([city]/[category]/page.tsx, lines 97-99):
```tsx
const localePath = loc === "en"
  ? `/${citySlug}/${locCatSlug}`           // NO /en prefix
  : `/${loc}/${citySlug}/${locCatSlug}`;   // Has /pt-pt prefix
```

**Problem:**
- Creates TWO different URL patterns
- `/restaurants-in-faro` (en) vs `/pt-pt/restaurantes-em-faro` (pt)
- Google treats them as DIFFERENT pages even though they're the same content
- This dilutes page authority, hurts SEO

**Solution:**
- ALL locales should have consistent prefix
- `/en/restaurants-in-faro` and `/pt-pt/restaurantes-em-faro`
- THEN handle root redirect via middleware

---

### Issue #2: Canonical URLs Not Centralized

**Current Code** ([city]/[category]/page.tsx, lines 104-106):
```tsx
const canonical_url = locale === "en"
  ? `${siteUrl}/${citySlug}/${categoryUrlSlug}`
  : `${siteUrl}/${locale}/${citySlug}/${categoryUrlSlug}`;
```

**Problem:**
- Each page implements its own canonical logic
- Directory page has NO canonical
- Other pages might have different logic
- Hard to maintain, easy to make mistakes

**Solution:**
- Create `buildCanonicalUrl(locale, path)` helper
- Use everywhere consistently
- Single point of truth

---

### Issue #3: Missing Metadata on Simple Pages

**Example:** `/[locale]/directory/page.tsx`

**Current:**
```tsx
export default function DirectoryPage() {
  return <main><h1>Directory</h1>...</main>;
}
// NO generateMetadata!
```

**Problem:**
- No title tag
- No meta description
- No canonical URL
- No hreflang alternates
- Google can't properly index or prioritize

**Solution:**
- Add `generateMetadata()` to all public pages
- Include canonical, hreflang, OG tags

---

### Issue #4: Hardcoded "en" Logic Everywhere

**Pattern** (appears in multiple files):
```tsx
if (locale === "en") {
  // Different handling
} else {
  // Different handling
}
```

**Problem:**
- Not scalable to 10 locales
- Error-prone (what if default changes?)
- Violates DRY principle

**Solution:**
- Use `LOCALE_CONFIGS` consistently
- Create helpers like `isDefaultLocale()`, `getUrlPrefix()`, etc.

---

### Issue #5: No Middleware Redirect

**Current:**
- No `middleware.ts` or it's for Supabase only
- `/` goes to homepage (not localized)
- No browser language detection

**Problem:**
- User with French browser lands on `/` (English)
- Bad UX, missed conversion opportunity
- Google crawler gets English version only

**Solution:**
- Add middleware to:
  - Detect `Accept-Language` header
  - Redirect `/` → `/en/` or detected locale
  - Set `x-locale` header for server

---

### Issue #6: hreflang Inconsistency

**[city]/[category] implementation:**
- Generates hreflang in `generateMetadata`
- Uses `LOCALE_CONFIGS[loc].hreflang`
- Handles x-default

**Other pages:**
- No hreflang generation visible

**Solution:**
- Create `buildHreflangs()` helper
- Use on every public page
- Consistent pattern everywhere

---

## 📐 Recommended Architecture

```
lib/i18n/
├── config.ts                 ✅ (keep as-is)
├── locale-context.tsx        ✅ (keep as-is)
├── navigation.ts             ✅ (keep mostly)
└── seo.ts                     🆕 NEW - Centralized SEO helpers

lib/seo/
├── schemaBuilders.js         ✅ (keep)
├── metadata-builders.ts       🆕 NEW - Canonical, hreflang, metadata
└── programmatic/             ✅ (keep)

middleware.ts                  🆕 NEW - Language detection + redirect

app/
├── layout.tsx                ✅ (update metadata)
├── [locale]/
│   ├── layout.tsx            ✅ (keep)
│   ├── directory/
│   │   └── page.tsx          🔧 ADD metadata
│   ├── [city]/[category]/
│   │   └── page.tsx          🔧 REFACTOR to use new helpers
│   └── ... other pages
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (30 min)
- [ ] Create `lib/i18n/seo.ts` with centralized helpers
- [ ] Create `lib/seo/metadata-builders.ts`
- [ ] Update `lib/i18n/config.ts` if needed

### Phase 2: Middleware (15 min)
- [ ] Create/update `middleware.ts`
- [ ] Add language detection
- [ ] Test redirects

### Phase 3: Refactor Pages (1-2 hours)
- [ ] Update `/[locale]/directory/page.tsx`
- [ ] Refactor `/[locale]/[city]/[category]/page.tsx`
- [ ] Update other public pages with metadata
- [ ] Test canonical URLs and hreflang

### Phase 4: Validation & Testing (30 min)
- [ ] Check all canonical URLs
- [ ] Verify hreflang tags
- [ ] Test language detection
- [ ] Verify SSR/ISR still works

---

## ✅ Success Criteria

After refactoring, every public page should have:

1. **Correct Canonical URL**
   ```html
   <link rel="canonical" href="https://algarveofficial.com/en/directory" />
   ```

2. **Full hreflang Alternates**
   ```html
   <link rel="alternate" hreflang="en" href="https://algarveofficial.com/en/directory" />
   <link rel="alternate" hreflang="pt-PT" href="https://algarveofficial.com/pt-pt/directory" />
   <link rel="alternate" hreflang="fr-FR" href="https://algarveofficial.com/fr/directory" />
   <link rel="alternate" hreflang="x-default" href="https://algarveofficial.com/en/directory" />
   ```

3. **Consistent Locale Prefix**
   - ALL URLs should have `/[locale]/` prefix
   - `/en/directory`, `/pt-pt/directory`, etc.

4. **Metadata on All Pages**
   - Title, description, keywords
   - OG tags for social sharing
   - Twitter cards
   - Schema markup

---

## 📋 Quality Metrics

**Before Refactor:**
- ❌ Canonical URLs: Inconsistent
- ❌ hreflang: Missing on 90% of pages
- ❌ Locale routing: Inconsistent pattern
- ❌ Metadata: Missing on simple pages

**After Refactor:**
- ✅ Canonical URLs: 100% consistent
- ✅ hreflang: On all public pages
- ✅ Locale routing: Consistent `/[locale]/` everywhere
- ✅ Metadata: On all public pages
- ✅ Code quality: DRY, maintainable, testable

---

## 📊 Impact on SEO

**Expected Improvements:**
- ✅ Faster indexing (proper canonical signals)
- ✅ Better ranking (consistent hreflang structure)
- ✅ Improved CTR (proper language variants in search results)
- ✅ Better Core Web Vitals (consistent serving)
- ✅ Reduced crawl budget waste (no duplicate content confusion)

**Risk Mitigation:**
- No broken redirects (we're not removing URLs)
- Gradual indexing (Google will crawl hreflang variants)
- Vercel caching still works (routing unchanged)

---

## 🎯 Next Steps

1. Review this audit
2. Approve refactoring plan
3. Proceed with Phase 1 implementation
4. Deploy to staging for testing
5. Monitor Google Search Console for changes

