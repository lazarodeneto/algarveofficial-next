# ⚡ i18n + SEO Quick Start

**Status:** Implementation Ready
**Files Created:** 5
**Estimated Setup Time:** 2-3 hours

---

## 🎯 What Was Done

### Created Files
1. ✅ `lib/i18n/seo.ts` - Core i18n SEO helpers
2. ✅ `lib/seo/metadata-builders.ts` - Metadata building utilities
3. ✅ `middleware-i18n.ts` - Optional language detection middleware
4. ✅ `app/[locale]/directory/page-refactored.tsx` - Example: Directory page
5. ✅ `app/[locale]/[city]/[category]/page-refactored.ts` - Example: Complex page

### Audit Documents
1. ✅ `I18N-SEO-AUDIT.md` - Full audit report (14 issues identified)
2. ✅ `I18N-SEO-IMPLEMENTATION.md` - Step-by-step guide

---

## 🚀 Quick Implementation (Fastest Path)

### 1️⃣ Update Directory Page (5 min)

**File:** `app/[locale]/directory/page.tsx`

Add this at the top:
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
    path: "/directory",
    title: "Directory",
    description: "Browse our curated directory of premium listings in the Algarve.",
  });
}
```

Make page async (if not already):
```tsx
export default async function DirectoryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return null;

  // Rest of your page code
}
```

### 2️⃣ Test It Works

```bash
npm run build
npm run start

# In another terminal:
curl -s http://localhost:3000/en/directory | grep -E "canonical|hreflang"
```

**Expected output:**
```html
<link rel="canonical" href="https://algarveofficial.com/en/directory" />
<link rel="alternate" hreflang="en" href="https://algarveofficial.com/en/directory" />
<link rel="alternate" hreflang="pt-PT" href="https://algarveofficial.com/pt-pt/directory" />
...
```

### 3️⃣ Deploy

```bash
git add -A
git commit -m "Add i18n SEO helpers and update directory page"
git push
```

---

## 📖 Pattern for Any Page

Copy this template for **every public page**:

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
    path: "/your-page-path",  // ← Change this
    title: "Your Page Title",  // ← Change this
    description: "Page description",  // ← Change this
  });
}

export default async function YourPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return null;
  const locale = rawLocale as Locale;

  // Your page code here
}
```

---

## 🔧 Apply to All Public Pages

**Just add the generateMetadata function to each of these:**

- [ ] `/[locale]/about-us/page.tsx`
- [ ] `/[locale]/contact/page.tsx`
- [ ] `/[locale]/blog/page.tsx`
- [ ] `/[locale]/blog/[slug]/page.tsx`
- [ ] `/[locale]/events/page.tsx`
- [ ] `/[locale]/events/[slug]/page.tsx`
- [ ] `/[locale]/destinations/page.tsx`
- [ ] `/[locale]/destinations/[slug]/page.tsx`
- [ ] `/[locale]/listing/[id]/page.tsx`
- [ ] `/[locale]/[city]/[category]/page.tsx`
- [ ] etc.

**Time estimate:** 10 min per page × 10 pages = ~100 min

---

## 🎯 Core Concepts

### buildLocalizedMetadata()
**What it does:** Generates complete Metadata object with:
- Correct canonical URL
- All hreflang alternates (including x-default)
- OG tags
- Twitter cards
- robots directives

**Usage:**
```tsx
return buildLocalizedMetadata({
  locale,                        // from params
  path: "/directory",            // without locale prefix!
  title: "Directory",
  description: "Browse listings",
  keywords: ["algarve", "directory"],
});
```

### buildCanonicalUrl()
**What it does:** Builds correct canonical URL for any locale/path combo

**Usage:**
```tsx
import { buildCanonicalUrl } from "@/lib/i18n/seo";

const url = buildCanonicalUrl("en", "/directory");
// Returns: "https://algarveofficial.com/en/directory"
```

### buildHreflangs()
**What it does:** Generates hreflang alternates for all locales

**Usage:**
```tsx
import { buildHreflangs } from "@/lib/i18n/seo";

const hreflangs = buildHreflangs("/directory");
// Returns:
// {
//   "en": "https://algarveofficial.com/en/directory",
//   "pt-PT": "https://algarveofficial.com/pt-pt/directory",
//   ...
//   "x-default": "https://algarveofficial.com/en/directory"
// }
```

---

## ✅ Validation

### Test Each Page

```bash
# For /en/directory
curl -s http://localhost:3000/en/directory | head -100

# Look for:
# 1. <title>...</title> ✅
# 2. <meta name="description" content="..." /> ✅
# 3. <link rel="canonical" href="https://algarveofficial.com/en/directory" /> ✅
# 4. <link rel="alternate" hreflang="en" href="..." /> ✅
# 5. <link rel="alternate" hreflang="x-default" href="..." /> ✅
# 6. <h1>...</h1> ✅ (SSR)
```

### Check in Browser

```
1. Visit http://localhost:3000/en/directory
2. Right-click → "View page source"
3. Search for "canonical" - should see your locale included
4. Search for "hreflang" - should see all locales
5. Search for "<h1" - should see content (not waiting for JS)
```

---

## 🚨 Common Mistakes

### ❌ Wrong Path Format
```tsx
// WRONG - path should NOT include locale
buildLocalizedMetadata({
  path: "/en/directory",  // ❌ WRONG!
})

// RIGHT
buildLocalizedMetadata({
  path: "/directory",  // ✅ CORRECT
})
```

### ❌ Missing generateMetadata
```tsx
// WRONG - just rendering page
export default function Page() { ... }

// RIGHT - include metadata
export async function generateMetadata() { ... }
export default async function Page() { ... }
```

### ❌ Hardcoded "en" Logic
```tsx
// WRONG
const url = locale === "en"
  ? `/directory`
  : `/${locale}/directory`;

// RIGHT - use helper
import { buildCanonicalUrl } from "@/lib/i18n/seo";
const url = buildCanonicalUrl(locale, "/directory");
```

---

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| `lib/i18n/seo.ts` | Core helpers: buildCanonicalUrl, buildHreflangs, etc. |
| `lib/seo/metadata-builders.ts` | buildLocalizedMetadata function |
| `I18N-SEO-AUDIT.md` | Detailed audit (what's wrong and why) |
| `I18N-SEO-IMPLEMENTATION.md` | Step-by-step guide (how to fix it) |

---

## 📊 Results

### Before
```
❌ No canonical URLs on simple pages
❌ No hreflang on any page
❌ Inconsistent locale routing
❌ Hardcoded "en" logic everywhere
❌ Directory page has NO SEO
```

### After
```
✅ Canonical URLs on all pages
✅ hreflang + x-default on all pages
✅ Consistent /[locale]/ prefix everywhere
✅ Centralized, scalable helpers
✅ All pages properly indexed
```

### SEO Impact
```
✅ Faster indexing (proper signals)
✅ Better SERP positioning (consistent structure)
✅ Proper language variants (users see correct version)
✅ Reduced crawl waste (no duplicate content confusion)
```

---

## 🎓 Learn More

**For detailed explanation:** See `I18N-SEO-AUDIT.md`
- What's wrong
- Why it matters
- How it affects SEO

**For step-by-step instructions:** See `I18N-SEO-IMPLEMENTATION.md`
- Phase 1-6 breakdown
- Code samples for each page
- Common issues & solutions
- Validation checklist

---

## 🎯 Next Steps

1. **Review** the audit (`I18N-SEO-AUDIT.md`)
2. **Implement** using this quick start
3. **Test** locally (build, run, curl)
4. **Deploy** to staging
5. **Monitor** Google Search Console

---

**Ready to start?** Pick one page and try the pattern above. Should take 5 min!

Questions? Check the detailed docs or audit report.
