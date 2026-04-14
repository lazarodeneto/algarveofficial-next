/**
 * Generate alt_text SQL updates for listing_images
 * Run: npx tsx scripts/generate-alt-text.ts
 */

import { createClient } from "@supabase/supabase-js";

interface ListingImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  listing: {
    name: string;
    city: { name: string }[];
  } | null;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Category to visual context mapping
const VISUAL_CONTEXTS: Record<string, string> = {
  golf: "golf course view with fairways and greens",
  hotel: "hotel exterior with pool and terrace",
  restaurant: "restaurant dining atmosphere and interior",
  bar: "bar interior and social setting",
  beach: "beach scene with golden sands",
  beach_club: "beach club setting with sunbeds and ocean",
  experience: "premium experience and activities",
  spa: "spa and wellness environment",
  shopping: "shopping venue and retail space",
  health: "health and wellness facility",
  fitness: "fitness center and gym equipment",
  tennis: "tennis court and sports facility",
  watersport: "water sports activity and equipment",
  boat: "boat and marine experience",
  attractions: "tourist attraction and landmark",
  default: "premium venue setting and atmosphere",
};

// Generate proper alt text
function generateAltText(
  listingName: string,
  cityName: string,
  categorySlug?: string
): string {
  // Clean up listing name
  const name = listingName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Capitalize first letter of each word
  const properName = name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Get visual context from category
  const context = categorySlug
    ? VISUAL_CONTEXTS[categorySlug] || VISUAL_CONTEXTS.default
    : VISUAL_CONTEXTS.default;

  // Clean city name
  const city = cityName
    ? cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase()
    : "Algarve";

  return `${properName} — ${context} in ${city}, Algarve`;
}

async function main() {
  console.log("Fetching listing images with listing data...\n");

  // Fetch all listing images with listing and city info
  const { data: images, error } = await supabase
    .from("listing_images")
    .select(`
      id,
      image_url,
      alt_text,
      listing:listings (
        name,
        city:cities (name)
      )
    `) as { data: ListingImage[] | null; error: Error | null };

  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  console.log(`Found ${images?.length || 0} images\n`);

  // Generate SQL statements
  const updates: string[] = [];
  
  for (const img of images || []) {
    const listingName = img.listing?.name ?? "Venue";
    const cityName = img.listing?.city?.[0]?.name ?? "";
    
    const newAltText = generateAltText(listingName, cityName);
    
    const sql = `UPDATE listing_images SET alt_text = '${newAltText.replace(/'/g, "''")}' WHERE id = '${img.id}';`;
    updates.push(sql);
  }

  // Output SQL
  console.log("-- Alt text SQL updates for listing_images");
  console.log("-- Run this in your Supabase SQL editor\n");
  
  for (const sql of updates) {
    console.log(sql);
  }

  console.log(`\n-- Total: ${updates.length} updates`);
}

main().catch(console.error);