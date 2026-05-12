import { NextResponse } from "next/server";

import { getPublicCategoryCounts } from "@/lib/public-data/listings";

export async function GET() {
  const counts = await getPublicCategoryCounts();

  return NextResponse.json(counts, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
