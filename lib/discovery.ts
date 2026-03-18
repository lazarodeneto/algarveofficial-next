export type DiscoveryCategory =
    | "stay"
    | "eat"
    | "experience"
    | "real_estate";

export const DISCOVERY_FILTERS: {
    key: DiscoveryCategory;
    label: string;
}[] = [
        { key: "stay", label: "Stay" },
        { key: "eat", label: "Eat" },
        { key: "experience", label: "Experiences" },
        { key: "real_estate", label: "Real Estate" },
    ];

export function mapListingToDiscoveryCategory(categorySlug?: string | null): DiscoveryCategory {
    if (!categorySlug) return "experience";

    const slug = categorySlug.toLowerCase();

    // Stay
    if (
        slug.includes("hotel") ||
        slug.includes("villa") ||
        slug.includes("apartment") ||
        slug.includes("resort")
    ) {
        return "stay";
    }

    // Eat
    if (
        slug.includes("restaurant") ||
        slug.includes("bar") ||
        slug.includes("cafe") ||
        slug.includes("food")
    ) {
        return "eat";
    }

    // Real Estate
    if (
        slug.includes("real-estate") ||
        slug.includes("property") ||
        slug.includes("investment")
    ) {
        return "real_estate";
    }

    // Default
    return "experience";
}