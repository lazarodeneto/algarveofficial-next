import {
  enforcePremiumInLocaleData,
  flattenI18nData,
  unflattenI18nData,
} from "@/lib/i18n/premiumGuard";
import { createPublicServerClient } from "@/lib/supabase/public-server";

import { loadLocale, normalizeLocaleCode, type LocaleMessages } from "./locale-loader";

const LOCALE_DB_MAP: Record<string, string> = {
  "pt-pt": "pt",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  sv: "sv",
  no: "no",
  da: "da",
};

export async function loadInitialLocaleMessages(locale: string): Promise<LocaleMessages> {
  const normalizedLocale = normalizeLocaleCode(locale);
  const messages = await loadLocale(normalizedLocale);

  if (normalizedLocale === "en") {
    return messages;
  }

  const englishMessages = await loadLocale("en");
  const premiumSafeMessages = enforcePremiumInLocaleData(messages, englishMessages);
  const dbLocale = LOCALE_DB_MAP[normalizedLocale];
  if (!dbLocale) {
    return premiumSafeMessages;
  }

  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("i18n_locale_data")
      .select("data")
      .eq("locale", dbLocale)
      .maybeSingle();

    if (error || !data?.data || typeof data.data !== "object") {
      return premiumSafeMessages;
    }

    return enforcePremiumInLocaleData(
      unflattenI18nData({
        ...flattenI18nData(premiumSafeMessages),
        ...flattenI18nData(data.data as Record<string, unknown>),
      }),
      englishMessages,
    );
  } catch {
    return premiumSafeMessages;
  }
}
