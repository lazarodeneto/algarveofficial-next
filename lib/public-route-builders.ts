export function buildListingHref({
  slug,
  id,
}: {
  slug?: string | null;
  id?: string | null;
}) {
  const listingSlug = slug?.trim() || id?.trim();
  return listingSlug ? `/listing/${listingSlug}` : "/stay";
}

export function buildCategoryHref(categorySlug: string) {
  const slug = categorySlug.trim();
  return slug ? `/stay?category=${encodeURIComponent(slug)}` : "/stay";
}

export function buildCityHref(citySlug: string) {
  const slug = citySlug.trim();
  return slug ? `/visit/${slug}` : "/stay";
}
