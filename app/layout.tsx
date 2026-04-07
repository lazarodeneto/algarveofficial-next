import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Inter, Playfair_Display, Archivo_Narrow } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import "../index.css";
import { RootProviders } from "@/components/providers/RootProviders";
import { DEFAULT_LOCALE, LOCALE_CONFIGS, SUPPORTED_LOCALES } from "@/lib/i18n/config";
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

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

const fontVariables = `${playfair.variable} ${inter.variable} ${archivoNarrow.variable}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") || "https://algarveofficial.com";
const organizationSchema = buildOrganizationSchema(siteUrl);
const websiteSchema = buildWebsiteSchema(siteUrl);
const defaultHtmlLang = LOCALE_CONFIGS[DEFAULT_LOCALE].hreflang;
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
const localeInitScript = `(()=>{try{const s=location.pathname.split('/')[1]?.toLowerCase(),l=${JSON.stringify(
  SUPPORTED_LOCALES,
)}.includes(s)?s:${JSON.stringify(DEFAULT_LOCALE)},m={en:'en','pt-pt':'pt-PT',fr:'fr-FR',de:'de-DE',es:'es-ES',it:'it-IT',nl:'nl-NL',sv:'sv-SE',no:'nb-NO',da:'da-DK'};document.documentElement.lang=m[l]||${JSON.stringify(
  defaultHtmlLang,
)};document.documentElement.dataset.locale=l}catch{}})();`;

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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
