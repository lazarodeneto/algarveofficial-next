import { permanentRedirect } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DirectoryPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
  }
  const query = qs.toString();

  permanentRedirect(`/${locale}/visit${query ? `?${query}` : ""}`);
}
