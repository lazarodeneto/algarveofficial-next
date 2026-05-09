import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { EVENT_TRANSLATIONS, type EventTranslation } from "@/lib/events/translations";

type LocalizableEvent = {
  slug?: string | null;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  venue?: string | null;
  event_data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEventLocale(locale: string | null | undefined): Locale {
  return isValidLocale(locale ?? "") ? (locale as Locale) : DEFAULT_LOCALE;
}

function getEventDataTranslation(eventData: unknown, locale: Locale): EventTranslation | null {
  if (!isRecord(eventData)) return null;
  const translations = eventData.translations;
  if (!isRecord(translations)) return null;
  const translation = translations[locale];
  if (!isRecord(translation)) return null;

  return {
    title: typeof translation.title === "string" ? translation.title : undefined,
    short_description:
      typeof translation.short_description === "string" ? translation.short_description : undefined,
    description: typeof translation.description === "string" ? translation.description : undefined,
    meta_title: typeof translation.meta_title === "string" ? translation.meta_title : undefined,
    meta_description:
      typeof translation.meta_description === "string" ? translation.meta_description : undefined,
    venue: typeof translation.venue === "string" ? translation.venue : undefined,
  };
}

function getEventTranslation(event: LocalizableEvent, locale: Locale): EventTranslation | null {
  if (locale === DEFAULT_LOCALE) return null;

  const staticTranslation = event.slug ? EVENT_TRANSLATIONS[event.slug]?.[locale] : undefined;
  const eventDataTranslation = getEventDataTranslation(event.event_data, locale);

  if (!staticTranslation && !eventDataTranslation) return null;

  return {
    ...staticTranslation,
    ...eventDataTranslation,
  };
}

export function localizeEvent<T extends LocalizableEvent | null | undefined>(
  event: T,
  localeInput: string | null | undefined,
): T {
  if (!event) return event;

  const locale = normalizeEventLocale(localeInput);
  const translation = getEventTranslation(event, locale);
  if (!translation) return event;

  return {
    ...event,
    title: translation.title ?? event.title,
    short_description: translation.short_description ?? event.short_description,
    description: translation.description ?? event.description,
    meta_title: translation.meta_title ?? translation.title ?? event.meta_title,
    meta_description: translation.meta_description ?? translation.short_description ?? event.meta_description,
    venue: translation.venue ?? event.venue,
  };
}

export function localizeEvents<T extends LocalizableEvent>(
  events: T[],
  localeInput: string | null | undefined,
): T[] {
  return events.map((event) => localizeEvent(event, localeInput));
}
