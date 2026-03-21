# i18n Locale Routing System — Full Audit & Redesign

## 1. DIAGNOSIS (Brutal & Clear)

### Architecture Diagram (Current — Broken)

```
                         ┌─────────────────────────────┐
                         │     app/layout.tsx (SSR)     │
                         │  locale = cookie / header    │ ← WRONG SOURCE
                         │  passes to LocaleProvider    │
                         └──────────┬──────────────────┘
                                    │
                         ┌──────────▼──────────────────┐
                         │  app/[locale]/layout.tsx     │
                         │  DOES NOTHING with params    │ ← WASTED
                         └──────────┬──────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
    ┌─────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
    │ LocaleProvider    │  │ I18nProvider     │  │ useLocalizedHref│
    │ source: cookie    │  │ source: pathname │  │ source: pathname│
    │ + header          │  │ + localStorage   │  │                 │
    └──────────────────┘  └─────────────────┘  └─────────────────┘
         context ≠ URL         i18n ≠ URL         links ≠ context
```

**Result: THREE competing sources of truth, NONE authoritative.**

---

### Critical Bugs Found

#### BUG #1 — LOCALE_PREFIX_REGEX is missing 4 locales (SEVERITY: CRITICAL)

**File:** `lib/i18n/config.ts:98`
```ts
export const LOCALE_PREFIX_REGEX = /^\/(en|pt-pt|fr|de|es|nl)(?=\/|$)/;
//                                     ^^^^^^^^^^^^^^^^^^^^^^
//                                     MISSING: it, sv, no, da
```

**Impact:** `getLocaleFromPathname()`, `stripLocaleFromPathname()`, and `addLocaleToPathname()` all **silently fail** for Italian, Swedish, Norwegian, and Danish URLs. A user on `/it/directory` gets:
- `getLocaleFromPathname("/it/directory")` → `"en"` (WRONG)
- `stripLocaleFromPathname("/it/directory")` → `"/it/directory"` (NOT STRIPPED)
- `addLocaleToPathname("/it/directory", "fr")` → `"/fr/it/directory"` (DOUBLE PREFIX)

This function is used by `localizeHref()` which powers **every link in the app**.

#### BUG #2 — Root layout reads locale from COOKIE, not URL (SEVERITY: CRITICAL)

**File:** `app/layout.tsx:69-71`
```ts
const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
const headerLocale = headersList.get("x-locale") as Locale | null;
const resolvedLocale = (cookieLocale || headerLocale || "en") as Locale;
```

The `[locale]` segment is in the URL but the root layout **ignores it**. The `LocaleProvider` wrapping the entire app receives the cookie-based locale, which can be stale or absent. Meanwhile, nothing ever sets the `NEXT_LOCALE` cookie.

**Impact:** On first visit (no cookie), `LocaleProvider` always says `"en"` regardless of URL. After language switch, cookie is never updated so server-rendered HTML always has wrong locale.

#### BUG #3 — [locale]/layout.tsx is a dead passthrough (SEVERITY: HIGH)

**File:** `app/[locale]/layout.tsx`
```ts
export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return <>{children}</>;  // params.locale is NEVER read
}
```

The `[locale]` dynamic segment exists in the URL structure but the layout **does nothing with it**. No context set, no validation, no redirect for invalid locales. This is the one place that should be the single source of truth.

#### BUG #4 — LanguageSwitcher doesn't set NEXT_LOCALE cookie (SEVERITY: HIGH)

**File:** `components/layout/LanguageSwitcher.tsx:68`
```ts
localStorage.setItem("algarve-language", langCode);
// NO cookie set → server layout never knows about the switch
```

The server layout reads `NEXT_LOCALE` cookie, but the language switcher only writes to `localStorage`. Server-rendered HTML always uses the old/default locale.

#### BUG #5 — I18nProvider has flawed fallback to localStorage (SEVERITY: HIGH)

**File:** `components/providers/I18nProvider.tsx:39-44`
```ts
const targetLocale: Locale =
  routeLocale !== DEFAULT_LOCALE
    ? routeLocale
    : storedLocale && isValidLocale(storedLocale)
      ? storedLocale
      : ((locale as Locale) ?? DEFAULT_LOCALE);
```

When `routeLocale === "en"` (DEFAULT_LOCALE), it falls back to `localStorage`. So if a user was previously on `/fr`, switches to `/en`, the i18n engine may still load French translations because `localStorage` has `"fr"`.

#### BUG #6 — Footer LANGUAGE_PREFIX_RE is missing "en" (SEVERITY: MEDIUM)

**File:** `components/layout/Footer.tsx:139`
```ts
const LANGUAGE_PREFIX_RE = /^\/(?:pt-pt|fr|de|es|it|nl|sv|no|da)(?:\/|$)/;
//                                ^^^ no "en" → English paths get double-prefixed
```

Footer's `normalizeFooterLinkHref()` tests if a path already has a locale prefix. Since `"en"` is missing, paths like `/en/directory` are treated as bare paths and get prefixed again → `/en/en/directory`.

#### BUG #7 — seoUrls.ts LANGUAGE_PREFIX_RE also missing "en" (SEVERITY: MEDIUM)

**File:** `lib/seoUrls.ts:2`
```ts
const LANGUAGE_PREFIX_RE = /^\/(pt-pt|fr|de|es|it|nl|sv|no|da)(?=\/|$)/;
```

Same pattern, same bug: English URLs are never recognized as localized.

#### BUG #8 — Duplicate locale utility files (SEVERITY: ARCHITECTURAL)

Two files with overlapping but different implementations:
- `lib/i18n/config.ts` — uses broken `LOCALE_PREFIX_REGEX`
- `lib/i18n/locales.ts` — uses string split (works correctly but different types)

`I18nProvider` imports from `locales.ts` (correct). `localizeHref.ts` imports from `config.ts` (broken regex). This inconsistency means the same "getLocaleFromPathname" function returns **different results depending on which file imported it**.

#### BUG #9 — No Next.js middleware (SEVERITY: HIGH)

No `middleware.ts` at the project root. This means:
- No locale detection for first-time visitors
- No redirect from `/` to `/{detected-locale}` at the edge
- No validation that `[locale]` is a supported locale
- Invalid locales like `/xyz/directory` render without error
- No `NEXT_LOCALE` cookie is ever set server-side

#### BUG #10 — Dashboard paths bypass locale system (SEVERITY: MEDIUM)

**File:** `components/layout/PublicSiteSidebar.tsx:38-40`
```ts
const tripsPath = isAuthenticated ? "/dashboard/trips" : loginPath;
const favoritesPath = isAuthenticated ? "/dashboard/favorites" : loginPath;
const messagesPath = isAuthenticated ? "/dashboard/messages" : loginPath;
```

Same pattern in `Header.tsx:69-72`. Dashboard paths are raw, not wrapped with `l()`. If the app ever needs localized dashboard routes, these all break.

#### BUG #11 — 404 page has un-localized link (SEVERITY: LOW)

**File:** `app/not-found.tsx:22`
```tsx
<Link href="/">Back to Home</Link>
```

Sends user to `/` which redirects to `/en` regardless of their locale.

#### BUG #12 — PublicSiteFrame checks raw paths without locale awareness (SEVERITY: MEDIUM)

**File:** `components/layout/PublicSiteFrame.tsx:12,16`
```ts
const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];
const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
```

A path like `/en/admin` would NOT match `/admin` prefix check, so the sidebar would incorrectly show on admin pages when accessed with a locale prefix.

---

### Root Cause Summary

| Root Cause | Where | Impact |
|---|---|---|
| **No single source of truth** | Root layout uses cookie; I18nProvider uses pathname+localStorage; localizeHref uses pathname | Complete locale drift across components |
| **Broken regex** | `config.ts` LOCALE_PREFIX_REGEX missing 4 locales | Links break for IT/SV/NO/DA users |
| **No middleware** | Project root | No server-side locale detection, no cookie sync |
| **Cookie never set** | LanguageSwitcher only writes localStorage | Server HTML always wrong locale |
| **Duplicate utilities** | `config.ts` vs `locales.ts` | Same function, different results |
| **[locale] layout wasted** | `app/[locale]/layout.tsx` | URL locale ignored by layout tree |

---

## 2. TARGET ARCHITECTURE

### Architecture Diagram (Fixed)

```
  ┌──────────────────────────────────────────────────┐
  │               middleware.ts (EDGE)               │
  │  1. Extract locale from URL                      │
  │  2. Validate against SUPPORTED_LOCALES           │
  │  3. Redirect invalid → default                   │
  │  4. Set NEXT_LOCALE cookie + x-locale header     │
  │  5. Redirect bare / → /{detected-locale}         │
  └──────────────────────┬───────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────┐
  │          app/[locale]/layout.tsx (SSR)            │
  │  SINGLE SOURCE OF TRUTH: params.locale           │
  │  → Validates locale                              │
  │  → Sets <html lang="">                           │
  │  → Wraps with LocaleProvider(params.locale)      │
  │  → Wraps with I18nProvider(params.locale)        │
  └──────────────────────┬───────────────────────────┘
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
  ┌────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │  Header  │    │   Footer    │    │  Sidebar    │
  │  uses    │    │   uses      │    │  uses       │
  │ useLocale│    │  useLocale  │    │ useLocale   │
  │    +     │    │     +       │    │    +        │
  │<LocalizedLink>│<LocalizedLink>│ │<LocalizedLink>│
  └──────────┘    └─────────────┘    └─────────────┘
       ALL derive locale from SAME context (URL-based)
```

### Design Principles

1. **URL is king.** `params.locale` from `[locale]/layout.tsx` is the ONLY source of truth.
2. **No localStorage for locale.** Only used as preference hint for middleware redirect on first visit.
3. **One regex, one place.** All locale detection goes through `lib/i18n/config.ts` with a correct, auto-generated regex.
4. **`<LocalizedLink>` everywhere.** No raw `<Link href={...}>` with manual prefix logic.
5. **Middleware handles edge.** Cookie sync, redirects, and validation happen before React renders.

---

## 3. IMPLEMENTATION

### PHASE 1: Fix the regex and consolidate utilities

#### Fix `lib/i18n/config.ts`

```ts
// FIXED: Include ALL supported locales
export const LOCALE_PREFIX_REGEX =
  /^\/(en|pt-pt|fr|de|es|it|nl|sv|no|da)(?=\/|$)/;

// NEW: Auto-generate regex from SUPPORTED_LOCALES to prevent future drift
export const LOCALE_PREFIX_PATTERN = new RegExp(
  `^\\/(${SUPPORTED_LOCALES.join("|")})(?=\\/|$)`
);
```

#### Delete `lib/i18n/locales.ts` — consolidate into `config.ts`

Move `isValidLocale`, `getLocaleFromParam`, `getLocaleFromPathname`, `toHtmlLang` into `config.ts`. Update all imports.

#### Fix `components/layout/Footer.tsx`

```ts
// DELETE this line:
// const LANGUAGE_PREFIX_RE = /^\/(?:pt-pt|fr|de|es|it|nl|sv|no|da)(?:\/|$)/;

// REPLACE with import:
import { LOCALE_PREFIX_PATTERN } from "@/lib/i18n/config";
```

#### Fix `lib/seoUrls.ts`

```ts
// DELETE this line:
// const LANGUAGE_PREFIX_RE = /^\/(pt-pt|fr|de|es|it|nl|sv|no|da)(?=\/|$)/;

// REPLACE with import:
import { LOCALE_PREFIX_PATTERN } from "@/lib/i18n/config";
```

---

### PHASE 2: Create middleware.ts

**New file:** `middleware.ts` (project root)

```ts
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  resolveLocaleFromAcceptLanguage,
  type Locale,
} from "@/lib/i18n/config";

const PUBLIC_FILE_RE = /\.(.*)$/;
const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner") ||
    PUBLIC_FILE_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Extract first path segment
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();

  // If URL already has a valid locale prefix
  if (maybeLocale && LOCALE_SET.has(maybeLocale)) {
    const locale = maybeLocale as Locale;
    const response = NextResponse.next();

    // Sync cookie and header so server components can read locale
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    response.headers.set("x-locale", locale);

    return response;
  }

  // No locale in URL — detect and redirect
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const storedPreference =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : null;
  const browserLocale = resolveLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );
  const targetLocale = storedPreference || browserLocale || DEFAULT_LOCALE;

  // Build redirect URL
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", targetLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap).*)",
  ],
};
```

---

### PHASE 3: Fix app/[locale]/layout.tsx (Single Source of Truth)

```tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../../index.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { PublicSiteFrame } from "@/components/layout/PublicSiteFrame";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { buildMetadata } from "@/lib/metadata";
import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIGS,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schemaBuilders.js";
import { CookieConsentBannerWrapper } from "@/components/gdpr/CookieConsentBannerWrapper";

// ... fonts and schemas same as before ...

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  // Validate locale — 404 if invalid
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const localeConfig = LOCALE_CONFIGS[locale];
  const htmlLang = localeConfig.hreflang;

  return (
    <html lang={htmlLang} className={fontVariables} suppressHydrationWarning>
      <body className={fontVariables}>
        {/* ... schema scripts ... */}
        <LocaleProvider locale={locale}>
          <AppProviders locale={locale}>
            <PublicSiteFrame>{children}</PublicSiteFrame>
            <CookieConsentBannerWrapper />
          </AppProviders>
        </LocaleProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Then simplify `app/layout.tsx`** to a bare wrapper:

```tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

---

### PHASE 4: Fix I18nProvider (Remove localStorage fallback)

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { ensureLocaleLoaded, initI18n } from "@/i18n";
import { type Locale } from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale; // REQUIRED, not optional
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      if (!initialized.current) {
        await initI18n();
        initialized.current = true;
      }

      // SINGLE SOURCE: locale prop (from URL via context)
      // NO localStorage fallback, NO pathname parsing
      await ensureLocaleLoaded(locale);

      if (!cancelled && i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
    };

    void syncI18n();
    return () => { cancelled = true; };
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

---

### PHASE 5: Create `<LocalizedLink>` component

**New file:** `components/navigation/LocalizedLink.tsx`

```tsx
"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createLocalizedHref } from "@/lib/i18n/navigation";

type LocalizedLinkProps = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const locale = useLocale();
    const localizedHref = createLocalizedHref(href, locale);

    return <Link ref={ref} href={localizedHref} {...props} />;
  }
);
```

**New file:** `lib/i18n/navigation.ts`

```ts
import { SUPPORTED_LOCALES, type Locale } from "./config";

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

const UNLOCALIZED_PREFIXES = ["/api", "/auth", "/dashboard", "/admin", "/owner"];

/**
 * Creates a localized href by prepending the locale prefix.
 * - Skips external URLs, anchors, mailto, tel
 * - Skips paths that already have a locale prefix
 * - Skips dashboard/admin/auth paths
 */
export function createLocalizedHref(href: string, locale: Locale): string {
  // Skip non-path hrefs
  if (!href || /^(https?:\/\/|mailto:|tel:|#)/i.test(href)) {
    return href;
  }

  const normalized = href.startsWith("/") ? href : `/${href}`;

  // Skip unlocalized routes
  if (UNLOCALIZED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }

  // Skip if already has a locale prefix
  const firstSegment = normalized.split("/").filter(Boolean)[0]?.toLowerCase();
  if (firstSegment && LOCALE_SET.has(firstSegment)) {
    return normalized;
  }

  // Prepend locale
  return normalized === "/"
    ? `/${locale}`
    : `/${locale}${normalized}`;
}

/**
 * Swaps the locale segment in a pathname.
 * Used by LanguageSwitcher to change language while preserving the path.
 */
export function swapLocaleInPath(
  pathname: string,
  newLocale: Locale
): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && LOCALE_SET.has(firstSegment)) {
    segments[0] = newLocale;
    return `/${segments.join("/")}`;
  }

  // No locale prefix — add one
  return `/${newLocale}${pathname === "/" ? "" : pathname}`;
}
```

---

### PHASE 6: Fix LanguageSwitcher

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";
import { ensureLocaleLoaded } from "@/i18n";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import { swapLocaleInPath } from "@/lib/i18n/navigation";
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, type Locale } from "@/lib/i18n/config";

const languages = SUPPORTED_LOCALES.map((code) => ({
  code,
  name: LOCALE_CONFIGS[code].name,
  shortName: LOCALE_CONFIGS[code].shortName,
}));

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  const currentLanguage = languages.find((l) => l.code === currentLocale) || languages[0];

  const changeLanguage = async (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Load translations
    await ensureLocaleLoaded(newLocale);
    await i18n.changeLanguage(newLocale);

    // Save preference (for middleware on next visit)
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }

    // Build new URL preserving path + search + hash
    const newPath = swapLocaleInPath(pathname, newLocale);
    const search = searchParams?.toString() ?? "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const fullUrl = `${newPath}${search ? `?${search}` : ""}${hash}`;

    router.push(fullUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="...">
          <Globe className="h-[15px] w-[15px] text-[#C7A35A]" />
          <span className="hidden sm:inline tracking-wide uppercase">
            {currentLanguage.shortName}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="...">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "...",
              lang.code === currentLocale ? "bg-..." : "hover:bg-..."
            )}
          >
            <span className="flex items-center gap-4 w-full">
              <span>{lang.name}</span>
              {lang.code === currentLocale && <Check className="h-4 w-4 ml-auto" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### PHASE 7: Fix PublicSiteFrame locale-aware prefix check

```tsx
"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";
import { stripLocaleFromPathname } from "@/lib/i18n/config";

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function PublicSiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  // Strip locale before checking prefixes
  const barePath = stripLocaleFromPathname(pathname);
  const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some(
    (prefix) => barePath.startsWith(prefix)
  );

  if (shouldHideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <PublicSiteSidebar />
      </Suspense>
      <div className="xl:pl-16 lg:pr-6">{children}</div>
    </>
  );
}
```

---

### PHASE 8: Update Header and Sidebar to use `<LocalizedLink>`

Replace all instances of:
```tsx
const l = useLocalizedHref();
<Link href={l("/directory")}>
```

With:
```tsx
import { LocalizedLink } from "@/components/navigation/LocalizedLink";
<LocalizedLink href="/directory">
```

This eliminates the need for `useLocalizedHref()` entirely. The hook can be deprecated.

For the Sidebar, also fix dashboard paths:

```tsx
const tripsPath = isAuthenticated ? "/dashboard/trips" : "/login";
// These are intentionally NOT localized (dashboard is outside [locale])
```

---

## 4. MIGRATION CHECKLIST

### Phase 1: Critical Fixes (Do First — Immediate Impact)

- [ ] **Fix LOCALE_PREFIX_REGEX** in `lib/i18n/config.ts` — add `it|sv|no|da`
- [ ] **Generate regex from array** — `new RegExp(\`^\\/(${SUPPORTED_LOCALES.join("|")})(?=\\/|$)\`)`
- [ ] **Fix Footer.tsx** — replace local `LANGUAGE_PREFIX_RE` with import from config
- [ ] **Fix seoUrls.ts** — replace local `LANGUAGE_PREFIX_RE` with import from config
- [ ] **Delete `lib/i18n/locales.ts`** — consolidate into `config.ts`, update all imports

### Phase 2: Architecture (Core Redesign)

- [ ] **Create `middleware.ts`** at project root
- [ ] **Move `<html>` rendering** from `app/layout.tsx` to `app/[locale]/layout.tsx`
- [ ] **Simplify `app/layout.tsx`** to bare children passthrough
- [ ] **Add locale validation** in `[locale]/layout.tsx` — `notFound()` for invalid locales
- [ ] **Fix I18nProvider** — remove localStorage/pathname fallback, use only `locale` prop

### Phase 3: Navigation Components

- [ ] **Create `lib/i18n/navigation.ts`** — `createLocalizedHref()`, `swapLocaleInPath()`
- [ ] **Create `<LocalizedLink>`** component
- [ ] **Rewrite LanguageSwitcher** — use `swapLocaleInPath()`, set cookie, derive from `useLocale()`
- [ ] **Fix PublicSiteFrame** — strip locale before prefix check
- [ ] **Update Header** — replace `useLocalizedHref()` + `Link` with `<LocalizedLink>`
- [ ] **Update Footer** — remove `normalizeFooterLinkHref` locale regex, use `<LocalizedLink>`
- [ ] **Update Sidebar** — replace `useLocalizedHref()` with `<LocalizedLink>`
- [ ] **Update BrandLogo** — replace `useLocalizedHref()` with `<LocalizedLink>`

### Phase 4: Edge Cases & SEO

- [ ] **Fix not-found.tsx** — localize "Back to Home" link
- [ ] **Add `generateStaticParams`** to `[locale]/layout.tsx` for all supported locales
- [ ] **Add hreflang alternates** to metadata in `[locale]/layout.tsx`
- [ ] **Verify canonical URLs** use locale prefix

### Phase 5: Cleanup

- [ ] **Deprecate `useLocalizedHref` hook** — replace all usages with `<LocalizedLink>`
- [ ] **Deprecate `localizeHref.ts`** — replaced by `navigation.ts`
- [ ] **Remove all inline locale regex patterns** — only `config.ts` should have them
- [ ] **Remove `algarve-language` localStorage** usage from I18nProvider
- [ ] **Audit all `Link` imports** — ensure none bypass `<LocalizedLink>` for public routes

---

## 5. EDGE CASES

### Default locale (with or without prefix)
- Middleware always redirects `/` → `/en` (or detected locale)
- All URLs always have locale prefix — no "default without prefix" ambiguity
- `app/page.tsx` redirect is kept as fallback

### 404 pages
- Invalid locale in URL → `notFound()` from `[locale]/layout.tsx`
- Missing page → Next.js default `not-found.tsx` with localized link

### Dynamic routes
- `app/[locale]/blog/[slug]/page.tsx` — receives `params.locale` from layout context
- No need to parse locale from pathname in page components

### Query params preservation
- `swapLocaleInPath()` only touches pathname
- `LanguageSwitcher` explicitly preserves `searchParams` and `hash`

### SEO (canonical + hreflang)
- `buildLocaleAlternates()` already generates correct hreflang tags
- Canonical URL should always include locale prefix
- Middleware ensures consistent URLs (no duplicate content)

---

## 6. BEST PRACTICES

1. **Never parse locale from pathname in components.** Use `useLocale()` hook (from context) or `params.locale` (in server components).

2. **Never use raw `<Link>` for public routes.** Always `<LocalizedLink>`. Dashboard/admin routes that live outside `[locale]` can use raw `<Link>`.

3. **One regex, one file.** `LOCALE_PREFIX_PATTERN` in `config.ts` is auto-generated from `SUPPORTED_LOCALES`. Never duplicate.

4. **Cookie is for persistence only.** The URL is truth. Cookie tells middleware what to redirect to on bare `/` visits.

5. **No localStorage for locale.** It's invisible to the server and causes hydration mismatches.

6. **Middleware runs on every request.** Keep it fast — no database calls, no heavy computation. Edge-compatible.

7. **When adding a new locale:** Add to `SUPPORTED_LOCALES` array in `config.ts`. Everything else (regex, middleware, switcher) auto-updates.
