import { permanentRedirect } from "next/navigation";

import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getPreferredLocaleForServerRedirect } from "@/lib/i18n/serverRedirect";

interface LegacyLiveRootPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyLiveRootPage({ searchParams }: LegacyLiveRootPageProps) {
  const locale = await getPreferredLocaleForServerRedirect();
  const sp = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      qs.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => qs.append(key, entry));
    }
  }

  const query = qs.toString();
  const targetPath = buildLocalizedPath(locale, "/relocation");
  permanentRedirect(`${targetPath}${query ? `?${query}` : ""}`);
}
