import { NextRequest, NextResponse } from "next/server";

import { teeTimeStatusSchema } from "@/lib/golf/tee-time-request";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

interface QueryError {
  message: string;
}

interface AdminGolfRequestsClient {
  from(table: string): {
    select(columns: string): {
      order(column: string, options: { ascending: boolean }): {
        limit(count: number): Promise<{ data: unknown[] | null; error: QueryError | null }>;
      };
      in(column: string, values: string[]): Promise<{ data: unknown[] | null; error: QueryError | null }>;
    };
    update(values: Record<string, string>): {
      eq(column: string, value: string): {
        select(columns: string): {
          single(): Promise<{ data: unknown; error: QueryError | null }>;
        };
      };
    };
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can view tee time requests.", {
    requireServiceRole: true,
    missingServiceRoleMessage: "Server is missing SUPABASE_SERVICE_ROLE_KEY for tee time request reads.",
  });
  if ("error" in auth) return auth.error;

  const client = auth.writeClient as unknown as AdminGolfRequestsClient;
  const { data, error } = await client
    .from("golf_tee_time_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return adminErrorResponse(500, "TEE_TIME_REQUESTS_READ_FAILED", error.message);

  const listingIds = Array.from(
    new Set(
      (data ?? [])
        .map((row: unknown) => toNullableString(asRecord(row)?.listing_id))
        .filter((id: string | null): id is string => Boolean(id)),
    ),
  );
  const listingNames = new Map<string, string>();

  if (listingIds.length > 0) {
    const listingsQuery = await client.from("listings").select("id, name").in("id", listingIds);
    if (!listingsQuery.error) {
      for (const listing of listingsQuery.data ?? []) {
        const row = asRecord(listing);
        const id = toNullableString(row?.id);
        const name = toNullableString(row?.name);
        if (id && name) listingNames.set(id, name);
      }
    }
  }

  const requests = (data ?? []).map((item: unknown) => {
    const row = asRecord(item) ?? {};
    const listingId = toNullableString(row.listing_id);
    return {
      ...row,
      course_name: listingId ? listingNames.get(listingId) ?? null : null,
    };
  });

  return NextResponse.json({ ok: true, data: requests });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can update tee time requests.", {
    requireServiceRole: true,
    missingServiceRoleMessage: "Server is missing SUPABASE_SERVICE_ROLE_KEY for tee time request updates.",
  });
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = teeTimeStatusSchema.safeParse(body);
  if (!parsed.success) {
    return adminErrorResponse(400, "TEE_TIME_REQUEST_STATUS_INVALID", "Invalid tee time request status.");
  }

  const client = auth.writeClient as unknown as AdminGolfRequestsClient;
  const { data, error } = await client
    .from("golf_tee_time_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error) return adminErrorResponse(500, "TEE_TIME_REQUEST_UPDATE_FAILED", error.message);

  return NextResponse.json({ ok: true, data });
}
