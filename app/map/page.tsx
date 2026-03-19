export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";

import type { Tables } from "@/integrations/supabase/types";
import MapClient from "@/components/map/MapClient";
import { buildMetadata } from "@/lib/metadata";
import { buildItemListSchema, buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";
import { createClient } from "@/lib/supabase/server";

type MapListingSeed = Pick<
  Tables<"listings">,
  "id" | "name" | "slug" | "latitude" | "longitude" | "tier" | "featured_image_url"
> & {
  city?: Pick<Tables<"cities">, "id" | "name" | "slug" | "latitude" | "longitude"> | null;
  region?: Pick<Tables<"regions">, "id" | "name" | "slug"> | null;
  category?: Pick<Tables<"categories">, "id" | "name" | "slug" | "image_url"> | null;
};

type MapPageData = {
  listings: MapListingSeed[];
  cities: Tables<"cities">[];
  regions: Tables<"regions">[];
  categories: Tables<"categories">[];
};

const getMapPageData = cache(async (): Promise<MapPageData> => {
  const supabase = await createClient();

  const [listingsResponse, citiesResponse, regionsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from("listings")
      .select(
        [
          "id",
          "name",
          "slug",
          "latitude",
          "longitude",
          "tier",
          "featured_image_url",
          "city:cities(id, name, slug, latitude, longitude)",
          "region:regions(id, name, slug)",
          "category:categories(id, name, slug, image_url)",
        ].join(", "),
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("cities")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("regions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (listingsResponse.error) throw listingsResponse.error;
  if (citiesResponse.error) throw citiesResponse.error;
  if (regionsResponse.error) throw regionsResponse.error;
  if (categoriesResponse.error) throw categoriesResponse.error;

  return {
    listings: (listingsResponse.data ?? []) as unknown as MapListingSeed[],
    cities: (citiesResponse.data ?? []) as Tables<"cities">[],
    regions: (regionsResponse.data ?? []) as Tables<"regions">[],
    categories: (categoriesResponse.data ?? []) as Tables<"categories">[],
  };
});

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Algarve Listings Map: Properties, Experiences & Events | AlgarveOfficial",
    description:
      "Explore all Algarve listings on an interactive map with filters for category, region, and city.",
    path: "/map",
  });
}

export default async function MapPage() {
  const { listings, cities, regions, categories } = await getMapPageData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") || "https://algarveofficial.com";
  const pageSchema = buildWebPageSchema({
    type: "CollectionPage",
    name: "Algarve Listings Map",
    description:
      "Explore all Algarve listings on an interactive map with filters for category, region, and city.",
    url: `${siteUrl}/map`,
    image: `${siteUrl}/og-image.png`,
    siteUrl,
  });
  const itemListSchema = buildItemListSchema({
    name: "Map listings in Algarve",
    url: `${siteUrl}/map`,
    description: "Published Algarve listings visible on the map.",
    items: listings.slice(0, 100).map((listing) => ({
      name: listing.name,
      url: `${siteUrl}/listing/${listing.slug || listing.id}`,
      image: listing.featured_image_url || undefined,
      description: listing.category?.name || undefined,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div id="map-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">Map</p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              Explore the Algarve by map
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Browse the region visually and jump from geography to listings, experiences, dining,
              and property opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-4 py-2">
                {listings.length} listings preloaded
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                {categories.length} categories
              </span>
            </div>
          </section>
        </main>
      </div>

      <MapClient
        initialListings={listings}
        initialCities={cities}
        initialRegions={regions}
        initialCategories={categories}
      />
    </>
  );
}
