import { enforcePremiumInLocaleData } from "@/lib/i18n/premiumGuard";

import { loadLocale, normalizeLocaleCode, type LocaleMessages } from "./locale-loader";

export async function loadInitialLocaleMessages(locale: string): Promise<LocaleMessages> {
  const normalizedLocale = normalizeLocaleCode(locale);
  const messages = await loadLocale(normalizedLocale);

  if (normalizedLocale === "en") {
    return messages;
  }

  const englishMessages = await loadLocale("en");
  return enforcePremiumInLocaleData(messages, englishMessages);
}
