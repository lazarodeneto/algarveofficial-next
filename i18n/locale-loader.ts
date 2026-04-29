import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";

export type LocaleMessages = Record<string, unknown>;

export function normalizeLocaleCode(locale: string | null | undefined): Locale {
  const normalized = String(locale ?? "").trim().toLowerCase();
  if (!normalized) return DEFAULT_LOCALE;
  if (normalized === "pt" || normalized.startsWith("pt-pt")) return "pt-pt";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";
  if (normalized.startsWith("nl")) return "nl";
  if (normalized.startsWith("sv")) return "sv";
  if (normalized === "no" || normalized.startsWith("nb") || normalized.startsWith("nn")) return "no";
  if (normalized.startsWith("da")) return "da";
  return isValidLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

export async function loadLocale(locale: string | null | undefined): Promise<LocaleMessages> {
  switch (normalizeLocaleCode(locale)) {
    case "pt-pt":
      return (await import("./locales/pt-pt.json")).default as LocaleMessages;
    case "fr":
      return (await import("./locales/fr.json")).default as LocaleMessages;
    case "de":
      return (await import("./locales/de.json")).default as LocaleMessages;
    case "es":
      return (await import("./locales/es.json")).default as LocaleMessages;
    case "it":
      return (await import("./locales/it.json")).default as LocaleMessages;
    case "nl":
      return (await import("./locales/nl.json")).default as LocaleMessages;
    case "sv":
      return (await import("./locales/sv.json")).default as LocaleMessages;
    case "no":
      return (await import("./locales/no.json")).default as LocaleMessages;
    case "da":
      return (await import("./locales/da.json")).default as LocaleMessages;
    default:
      return (await import("./locales/en.json")).default as LocaleMessages;
  }
}
