import type { Locale } from "@/lib/i18n/config";
import { LOCALE_CONFIGS } from "@/lib/i18n/config";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const localeConfig = LOCALE_CONFIGS[locale as Locale];

  return (
    <html lang={localeConfig?.hreflang ?? "en"}>
      <head>
        <meta name="language" content={localeConfig?.hreflang ?? "en"} />
      </head>
      <body>{children}</body>
    </html>
  );
}

export async function generateStaticParams() {
  const { SUPPORTED_LOCALES } = await import("@/lib/i18n/config");
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}
