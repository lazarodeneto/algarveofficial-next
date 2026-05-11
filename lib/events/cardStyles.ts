import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types/events";

export const PIXABAY_EVENT_IMAGE_FALLBACK =
  "https://cdn.pixabay.com/photo/2016/11/29/06/17/audience-1867754_1280.jpg";

const EVENT_CARD_CATEGORY_STYLES: Record<EventCategory, string> = {
  festival: "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-200",
  market: "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-200",
  "golf-tournament": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  gastronomy: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200",
  music: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200",
  cultural: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200",
  sporting: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
  seasonal: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
};

export function getEventCardCategoryClass(category: EventCategory) {
  return cn(
    "inline-flex max-w-full truncate rounded-full border px-3 py-1 text-[0.68rem] font-semibold leading-none shadow-none",
    EVENT_CARD_CATEGORY_STYLES[category] ?? "border-border bg-muted text-muted-foreground",
  );
}

export function getEventDateBadgeDisplay(primary: string) {
  return primary.replace(/\s-\s/g, " -\n");
}
