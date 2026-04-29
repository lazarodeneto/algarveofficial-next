import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display, Archivo_Narrow } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { unstable_cache } from "next/cache";

import "../index.css";
import { AppLazyMotion } from "@/components/providers/AppLazyMotion";
import { ClientRuntimeScripts } from "@/components/providers/ClientRuntimeScripts";
import { RootProviders } from "@/components/providers/RootProviders";
import { resolveGaMeasurementId } from "@/lib/analytics/ga-config";
import { toHtmlLang } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildMetadata } from "@/lib/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schemaBuilders.js";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

const fontVariables = `${playfair.variable} ${dmSans.variable} ${archivoNarrow.variable}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") ?? "https://algarveofficial.com";
const supabaseOrigin = (() => {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!rawUrl) return null;
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
})();
const organizationSchema = buildOrganizationSchema(siteUrl);
const websiteSchema = buildWebsiteSchema(siteUrl);
const enableVercelTelemetry = process.env.NODE_ENV === "production";

const loadGoogleTagId = unstable_cache(
  async () => {
    try {
      const supabase = createPublicServerClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("ga_measurement_id")
        .eq("id", "default")
        .maybeSingle();

      if (error) {
        return resolveGaMeasurementId(null);
      }

      return resolveGaMeasurementId(data?.ga_measurement_id);
    } catch {
      return resolveGaMeasurementId(null);
    }
  },
  ["site-settings-ga-measurement-id"],
  { revalidate: 300 },
);

async function getGoogleTagId(): Promise<string> {
  try {
    return await loadGoogleTagId();
  } catch {
    return resolveGaMeasurementId(null);
  }
}

export const metadata: Metadata = {
  ...buildMetadata({
    title: "AlgarveOfficial | Premium Villas, Golf & Restaurants",
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
  const [locale, googleTagId] = await Promise.all([
    getRequestLocale(),
    getGoogleTagId(),
  ]);
  const htmlLang = toHtmlLang(locale);

  return (
    <html lang={htmlLang} data-locale={locale} suppressHydrationWarning className={fontVariables}>
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
      <body className={fontVariables}>
        <ClientRuntimeScripts googleTagId={googleTagId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <AppLazyMotion>
          <RootProviders>{children}</RootProviders>
        </AppLazyMotion>
        {enableVercelTelemetry ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
