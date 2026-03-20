import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../index.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { PublicSiteFrame } from "@/components/layout/PublicSiteFrame";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { buildMetadata } from "@/lib/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schemaBuilders.js";
import { CookieConsentBannerWrapper } from "@/components/gdpr/CookieConsentBannerWrapper";
import { LOCALE_CONFIGS, type Locale } from "@/lib/i18n/config";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const fontVariables = `${playfair.variable} ${inter.variable}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") || "https://algarveofficial.com";
const organizationSchema = buildOrganizationSchema(siteUrl);
const websiteSchema = buildWebsiteSchema(siteUrl);
const themeInitScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem('algarve-theme') || 'light';
      const resolvedTheme =
        storedTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : storedTheme;

      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(resolvedTheme);
    } catch {}
  })();
`;

export const metadata: Metadata = {
  ...buildMetadata({
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
    path: "/",
  }),
  manifest: "/manifest.json",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const headersList = await headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const headerLocale = headersList.get("x-locale") as Locale | null;
  const resolvedLocale: Locale = (cookieLocale || headerLocale || "en") as Locale;
  const localeConfig = LOCALE_CONFIGS[resolvedLocale] ?? LOCALE_CONFIGS.en;
  const htmlLang = localeConfig?.hreflang ?? "en-GB";

  return (
    <html lang={htmlLang} className={fontVariables} suppressHydrationWarning>
      <body className={fontVariables}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <LocaleProvider locale={resolvedLocale}>
          <AppProviders locale={resolvedLocale}>
            <PublicSiteFrame>{children}</PublicSiteFrame>
            <CookieConsentBannerWrapper />
          </AppProviders>
        </LocaleProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
