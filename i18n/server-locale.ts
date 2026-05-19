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

const HOMEPAGE_INITIAL_MESSAGE_PREFIXES = [
  "accessibility",
  "auth.loginFailed",
  "categories",
  "categoryNames",
  "common",
  "cookie",
  "dashboard.favorites.title",
  "footer",
  "gdpr",
  "hero",
  "language",
  "listing.badge",
  "listing.experience",
  "nav",
  "newsletter",
  "sections.categories",
  "sections.cities",
  "sections.homepage",
  "sections.listings",
  "theme",
  "weather",
] as const;

interface LoadInitialLocaleMessagesOptions {
  scope?: "full" | "homepage";
}

function pickMessagePrefixes(
  messages: LocaleMessages,
  prefixes: readonly string[],
): LocaleMessages {
  const flattened = flattenI18nData(messages);
  const picked: Record<string, string> = {};

  for (const [key, value] of Object.entries(flattened)) {
    if (prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}.`))) {
      picked[key] = value;
    }
  }

  return unflattenI18nData(picked);
}

function scopeInitialMessages(
  messages: LocaleMessages,
  scope: LoadInitialLocaleMessagesOptions["scope"],
): LocaleMessages {
  if (scope !== "homepage") return messages;
  return pickMessagePrefixes(messages, HOMEPAGE_INITIAL_MESSAGE_PREFIXES);
}

export async function loadInitialLocaleMessages(
  locale: string,
  options: LoadInitialLocaleMessagesOptions = {},
): Promise<LocaleMessages> {
  const normalizedLocale = normalizeLocaleCode(locale);
  const messages = await loadLocale(normalizedLocale);

  if (normalizedLocale === "en") {
    return scopeInitialMessages(messages, options.scope);
  }

  const englishMessages = await loadLocale("en");
  const premiumSafeMessages = enforcePremiumInLocaleData(messages, englishMessages);
  const dbLocale = LOCALE_DB_MAP[normalizedLocale];
  if (!dbLocale) {
    return scopeInitialMessages(premiumSafeMessages, options.scope);
  }

  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("i18n_locale_data")
      .select("data")
      .eq("locale", dbLocale)
      .maybeSingle();

    if (error || !data?.data || typeof data.data !== "object") {
      return scopeInitialMessages(premiumSafeMessages, options.scope);
    }

    const mergedMessages = enforcePremiumInLocaleData(
      unflattenI18nData({
        ...flattenI18nData(premiumSafeMessages),
        ...flattenI18nData(data.data as Record<string, unknown>),
      }),
      englishMessages,
    );
    return scopeInitialMessages(mergedMessages, options.scope);
  } catch {
    return scopeInitialMessages(premiumSafeMessages, options.scope);
  }
}
