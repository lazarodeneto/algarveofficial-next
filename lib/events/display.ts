import type { EventCategory } from "@/types/events";
import type { EventCategoryField } from "@/lib/eventCategoryTemplates";
import type { TFunction } from "i18next";

type EventTranslator = TFunction;

const EVENT_CATEGORY_KEYS: Record<EventCategory, string> = {
  festival: "events.categories.festival",
  market: "events.categories.market",
  "golf-tournament": "events.categories.golfTournament",
  gastronomy: "events.categories.gastronomy",
  music: "events.categories.music",
  cultural: "events.categories.cultural",
  sporting: "events.categories.sporting",
  seasonal: "events.categories.seasonal",
};

function humanizeSlug(value: string): string {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const EVENT_TEXT_VALUE_KEYS: Record<string, Record<string, string>> = {
  distance_category: {
    "4.59 km circuit; MotoGP, Moto2 and Moto3": "motogpCircuitCategories",
  },
  exhibition_theme: {
    "Medieval recreation in Silves historic centre": "medievalRecreationSilvesHistoricCentre",
  },
  prize_pool: {
    "$3 million purse": "threeMillionDollarPurse",
  },
};

export function getTranslatedEventCategoryLabel(
  category: EventCategory,
  fallback: string,
  t: EventTranslator,
): string {
  return t(EVENT_CATEGORY_KEYS[category] ?? category, fallback);
}

export function getTranslatedEventFieldLabel(field: Pick<EventCategoryField, "name" | "label">, t: EventTranslator) {
  return t(`events.template.fields.${field.name}`, field.label);
}

export function getTranslatedEventFieldValue(
  field: Pick<EventCategoryField, "name" | "options">,
  value: string,
  t: EventTranslator,
): string {
  const fallback = field.options?.find((option) => option.value === value)?.label ?? humanizeSlug(value);
  return t(`events.template.values.${field.name}.${value}`, fallback);
}

export function getTranslatedEventTextValue(
  field: Pick<EventCategoryField, "name">,
  value: string,
  t: EventTranslator,
): string {
  const key = EVENT_TEXT_VALUE_KEYS[field.name]?.[value];
  if (!key) return value;

  return t(`events.template.textValues.${field.name}.${key}`, value);
}

export function getTranslatedEventTag(tag: string, t: EventTranslator): string {
  return t(`events.tags.${tag}`, humanizeSlug(tag));
}

export function getLocalizedEventPriceRange(priceRange: string | null | undefined, t: EventTranslator): string | null {
  if (!priceRange) return null;

  const fromMatch = priceRange.match(/^From\s+(.+)$/i);
  if (!fromMatch) return priceRange;

  return t("events.detail.fromPrice", {
    price: fromMatch[1],
    defaultValue: `From ${fromMatch[1]}`,
  });
}
