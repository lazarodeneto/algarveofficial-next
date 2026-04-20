import type { Metadata } from "next";

import LocaleHomePage, { generateMetadata as generateLocaleHomeMetadata } from "@/app/[locale]/page";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleHomeMetadata({
    params: Promise.resolve({ locale: DEFAULT_LOCALE }),
  });
}

export default function RootPage() {
  return <LocaleHomePage params={Promise.resolve({ locale: DEFAULT_LOCALE })} />;
}
