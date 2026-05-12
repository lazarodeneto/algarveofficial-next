import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createEmptyListingPerformanceCounts,
  LISTING_PERFORMANCE_EVENT_TO_METRIC,
  LISTING_PERFORMANCE_EVENT_TYPES,
  type ListingPerformanceEventType,
} from "@/lib/analytics/listingPerformance";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const querySchema = z.object({
  listingId: z.string().uuid().optional(),
  rangeDays: z.coerce.number().int().min(1).max(365).default(30),
});

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
    },
    { status },
  );
}

function readName(value: unknown): string | null {
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
}

function addCounts(
  target: ReturnType<typeof createEmptyListingPerformanceCounts>,
  source: ReturnType<typeof createEmptyListingPerformanceCounts>,
) {
  target.profileViews += source.profileViews;
  target.websiteClicks += source.websiteClicks;
  target.phoneClicks += source.phoneClicks;
  target.directionsClicks += source.directionsClicks;
  target.whatsAppClicks += source.whatsAppClicks;
  target.bookingClicks += source.bookingClicks;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const parsed = querySchema.safeParse({
    listingId: request.nextUrl.searchParams.get("listingId") || undefined,
    rangeDays: request.nextUrl.searchParams.get("rangeDays") || undefined,
  });

  if (!parsed.success) {
    return errorResponse(400, "OWNER_PERFORMANCE_QUERY_INVALID", "Invalid performance query parameters.");
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return errorResponse(
      503,
      "SERVICE_ROLE_NOT_CONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for owner performance metrics.",
    );
  }

  const endAt = new Date();
  const startAt = new Date(endAt.getTime() - parsed.data.rangeDays * 24 * 60 * 60 * 1000);

  let listingsQuery = writeClient
    .from("listings")
    .select(`
      id,
      name,
      slug,
      tier,
      claim_status,
      owner_id,
      city:cities(id, name, slug),
      category:categories(id, name, slug)
    `)
    .eq("owner_id", auth.userId)
    .eq("claim_status", "claimed")
    .order("name", { ascending: true });

  if (parsed.data.listingId) {
    listingsQuery = listingsQuery.eq("id", parsed.data.listingId);
  }

  const { data: listings, error: listingsError } = await listingsQuery;

  if (listingsError) {
    return errorResponse(500, "OWNER_PERFORMANCE_LISTINGS_FAILED", listingsError.message);
  }

  if (parsed.data.listingId && (!listings || listings.length === 0)) {
    return errorResponse(404, "OWNER_PERFORMANCE_LISTING_NOT_FOUND", "This listing is not assigned to your owner account.");
  }

  const ownedListings = listings ?? [];
  const listingIds = ownedListings.map((listing) => listing.id);
  const countsByListing = new Map<string, ReturnType<typeof createEmptyListingPerformanceCounts>>();

  for (const listingId of listingIds) {
    countsByListing.set(listingId, createEmptyListingPerformanceCounts());
  }

  try {
    await Promise.all(
      listingIds.flatMap((listingId) =>
        LISTING_PERFORMANCE_EVENT_TYPES.map(async (eventType: ListingPerformanceEventType) => {
          const { count, error } = await writeClient
            .from("analytics_events")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listingId)
            .eq("event_type", eventType)
            .gte("created_at", startAt.toISOString())
            .lte("created_at", endAt.toISOString());

          if (error) {
            throw new Error(error.message);
          }

          const listingCounts = countsByListing.get(listingId);
          if (listingCounts) {
            listingCounts[LISTING_PERFORMANCE_EVENT_TO_METRIC[eventType]] = count ?? 0;
          }
        }),
      ),
    );
  } catch (error) {
    return errorResponse(
      500,
      "OWNER_PERFORMANCE_COUNTS_FAILED",
      error instanceof Error ? error.message : "Failed to load performance counts.",
    );
  }

  const totals = createEmptyListingPerformanceCounts();
  const listingMetrics = ownedListings.map((listing) => {
    const counts = countsByListing.get(listing.id) ?? createEmptyListingPerformanceCounts();
    addCounts(totals, counts);

    return {
      id: listing.id,
      name: listing.name,
      slug: listing.slug,
      tier: listing.tier,
      claimStatus: listing.claim_status,
      city: readName(listing.city),
      category: readName(listing.category),
      counts,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      data: {
        range: {
          days: parsed.data.rangeDays,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        },
        totals,
        listings: listingMetrics,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
