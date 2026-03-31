import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InvestPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const { isValidLocale, DEFAULT_LOCALE } = await import("@/lib/i18n/config");
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
  }
  const query = qs.toString();

  permanentRedirect(`/${locale}/properties${query ? `?${query}` : ""}`);
}
