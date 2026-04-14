import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SITE_CONFIG } from "./seo-config";

export async function getListingWithSeo(listingSlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      id, slug, name, description, short_description, category_slug, category_name,
      city, region, address, latitude, longitude, telephone, email, website,
      price_range, image_url, logo_url, google_rating, google_review_count,
      meta_title, meta_description, status, published_at, updated_at,
      listing_tags(tags:tag_id(name)),
      listing_translations!left(locale, seo_title, seo_description, short_description, description)
    `)
    .eq("slug", listingSlug)
    .eq("status", "published")
    .single();

  if (error || !listing) return null;

  const translations = listing.listing_translations as unknown as { locale: string; seo_title?: string; seo_description?: string }[] | null;
  const translation = translations?.find((t) => t.locale === locale);

  const tagsData = listing.listing_tags as unknown as { tags: { name: string } }[] | null;
  const tags = tagsData?.map((t) => t.tags.name) ?? [];

  return {
    ...listing,
    seo_title: (translation?.seo_title || listing.meta_title) ?? listing.name,
    seo_description: (translation?.seo_description || listing.meta_description || listing.short_description) ?? listing.description,
    tags,
  };
}

export async function getBlogPostWithSeo(postSlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, content, featured_image, author_name,
      category, tags, seo_title, seo_description, status, published_at, updated_at,
      blog_post_translations!left(locale, title, seo_title, seo_description, excerpt)
    `)
    .eq("slug", postSlug)
    .eq("status", "published")
    .single();

  if (error || !post) return null;

  const translations = post.blog_post_translations as unknown as { locale: string; seo_title?: string; seo_description?: string }[] | null;
  const translation = translations?.find((t) => t.locale === locale);

  return {
    ...post,
    seo_title: (translation?.seo_title || post.seo_title) ?? post.title,
    seo_description: (translation?.seo_description || post.seo_description) ?? post.excerpt,
  };
}

export async function getEventWithSeo(eventSlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id, slug, title, name, description, short_description,
      image_url, venue_name, city, start_date, end_date, ticket_url,
      meta_title, meta_description, status, updated_at
    `)
    .eq("slug", eventSlug)
    .eq("status", "published")
    .single();

  if (error || !event) return null;

  return {
    ...event,
    seo_title: (event.meta_title || event.title) ?? event.name,
    seo_description: (event.meta_description || event.short_description) ?? event.description,
  };
}

export async function getCategoryWithSeo(categorySlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: category, error } = await supabase
    .from("categories")
    .select(`
      id, slug, name, description, short_description, image_url,
      meta_title, meta_description,
      category_translations!left(locale, name, description, short_description, meta_title, meta_description)
    `)
    .eq("slug", categorySlug)
    .single();

  if (error || !category) return null;

  const translations = category.category_translations as unknown as { locale: string; meta_title?: string; meta_description?: string; description?: string }[] | null;
  const translation = translations?.find((t) => t.locale === locale);

  return {
    ...category,
    seo_title: (translation?.meta_title || category.meta_title) ?? category.name,
    seo_description: translation?.meta_description ?? category.description,
  };
}

export async function getCityWithSeo(citySlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: city, error } = await supabase
    .from("cities")
    .select(`
      id, slug, name, description, short_description, image_url, latitude, longitude,
      meta_title, meta_description,
      regions(id, slug, name),
      city_translations!left(locale, name, description, short_description, meta_title, meta_description)
    `)
    .eq("slug", citySlug)
    .single();

  if (error || !city) return null;

  const translations = city.city_translations as unknown as { locale: string; meta_title?: string; meta_description?: string }[] | null;
  const translation = translations?.find((t) => t.locale === locale);
  
  const region = city.regions as unknown as { id: string; slug: string; name: string } | null;

  return {
    ...city,
    region_name: region?.name ?? null,
    region_slug: region?.slug ?? null,
    seo_title: (translation?.meta_title || city.meta_title) ?? city.name,
    seo_description: translation?.meta_description ?? city.description,
  };
}

export async function getRegionWithSeo(regionSlug: string, locale = "en") {
  const supabase = createPublicServerClient();
  
  const { data: region, error } = await supabase
    .from("regions")
    .select(`
      id, slug, name, description, short_description, image_url, latitude, longitude,
      meta_title, meta_description,
      region_translations!left(locale, name, description, short_description, meta_title, meta_description)
    `)
    .eq("slug", regionSlug)
    .single();

  if (error || !region) return null;

  const translations = region.region_translations as unknown as { locale: string; meta_title?: string; meta_description?: string }[] | null;
  const translation = translations?.find((t) => t.locale === locale);

  return {
    ...region,
    seo_title: (translation?.meta_title || region.meta_title) ?? region.name,
    seo_description: translation?.meta_description ?? region.description,
  };
}

export async function getSiteSettingsSeo() {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("meta_title, meta_description, og_image, canonical_url, logo_url")
    .eq("id", "default")
    .single();

  if (error || !data) {
    return {
      meta_title: SITE_CONFIG.name,
      meta_description: SITE_CONFIG.description,
      og_image: SITE_CONFIG.ogImage,
      canonical_url: SITE_CONFIG.url,
      logo_url: null,
    };
  }

  return {
    meta_title: data.meta_title ?? SITE_CONFIG.name,
    meta_description: data.meta_description ?? SITE_CONFIG.description,
    og_image: data.og_image ?? SITE_CONFIG.ogImage,
    canonical_url: data.canonical_url ?? SITE_CONFIG.url,
    logo_url: data.logo_url,
  };
}

export async function getSitemapData() {
  const supabase = createPublicServerClient();

  const [listingsRes, regionsRes, citiesRes, blogRes, eventsRes, categoriesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("slug, updated_at, published_at, category_slug, image_url, meta_description")
      .eq("status", "published")
      .limit(50000),
    supabase
      .from("regions")
      .select("slug, name, updated_at, image_url, meta_description, is_visible_destinations")
      .eq("is_visible_destinations", true)
      .limit(1000),
    supabase
      .from("cities")
      .select("slug, name, updated_at, image_url, meta_description")
      .limit(5000),
    supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at, featured_image, seo_description")
      .eq("status", "published")
      .limit(5000),
    supabase
      .from("events")
      .select("slug, title, updated_at, start_date, image_url, seo_description")
      .eq("status", "published")
      .limit(5000),
    supabase
      .from("categories")
      .select("slug, name, image_url, meta_description")
      .limit(100),
  ]);

  return {
    listings: listingsRes.data ?? [],
    regions: regionsRes.data ?? [],
    cities: citiesRes.data ?? [],
    blogPosts: blogRes.data ?? [],
    events: eventsRes.data ?? [],
    categories: categoriesRes.data ?? [],
  };
}
