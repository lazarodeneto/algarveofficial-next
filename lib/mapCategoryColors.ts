import { getCanonicalCategorySlug } from "@/lib/categoryMerges";

const CATEGORY_COLORS: Record<string, string> = {
  "places-to-stay": "#2563eb",
  "premium-accommodation": "#2563eb",
  "restaurants": "#dc2626",
  "golf": "#16a34a",
  "beaches-clubs": "#0ea5e9",
  "beaches": "#0ea5e9",
  "wellness-spas": "#7c3aed",
  "shopping-boutiques": "#ec4899",
  "vip-concierge": "#f59e0b",
  "algarve-services": "#f59e0b",
  "things-to-do": "#f97316",
  "premium-experiences": "#f97316",
  "family-fun": "#22c55e",
  "vip-transportation": "#6366f1",
  "whats-on": "#ef4444",
  "premier-events": "#ef4444",
  "events": "#ef4444",
  "private-chefs": "#b45309",
  "architecture-decoration": "#64748b",
  "protection-services": "#1f2937",
  "real-estate": "#0891b2",
};

const FALLBACK_PALETTE = [
  "#0ea5e9",
  "#2563eb",
  "#14b8a6",
  "#16a34a",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#d946ef",
  "#7c3aed",
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCategoryMapColor(slug?: string | null): string {
  if (!slug) return "#64748b";
  const canonical = getCanonicalCategorySlug(slug);
  const normalized = (canonical || slug).toLowerCase().trim();
  if (CATEGORY_COLORS[normalized]) return CATEGORY_COLORS[normalized];
  return FALLBACK_PALETTE[hashSlug(normalized) % FALLBACK_PALETTE.length];
}
