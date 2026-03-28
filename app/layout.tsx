import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../index.css";
import { RootProviders } from "@/components/providers/RootProviders";
import { DEFAULT_LOCALE, LOCALE_CONFIGS } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schemaBuilders.js";

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
const defaultHtmlLang = LOCALE_CONFIGS[DEFAULT_LOCALE].hreflang;
const localeHtmlLangMap = Object.fromEntries(
  Object.entries(LOCALE_CONFIGS).map(([locale, config]) => [locale, config.hreflang]),
);
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
const localeInitScript = `
  (() => {
    try {
      const localeMap = ${JSON.stringify(localeHtmlLangMap)};
      const segments = window.location.pathname.split('/').filter(Boolean);
      const routeLocale = segments[0]?.toLowerCase();
      const resolvedLocale = localeMap[routeLocale] ? routeLocale : ${JSON.stringify(DEFAULT_LOCALE)};

      document.documentElement.lang = localeMap[resolvedLocale] || ${JSON.stringify(defaultHtmlLang)};
      document.documentElement.dataset.locale = resolvedLocale;
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={defaultHtmlLang} suppressHydrationWarning className={fontVariables}>
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
        <Script id="locale-init" strategy="beforeInteractive">
          {localeInitScript}
        </Script>
        <RootProviders>{children}</RootProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
