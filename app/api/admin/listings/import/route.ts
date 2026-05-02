import { NextRequest, NextResponse } from "next/server";

import type { ImportPreviewRow } from "@/lib/admin/listing-json-import";
import { importListing, type ImporterSupabaseClient } from "@/lib/importer/importListing";
import { normalizeImportObject } from "@/lib/importer/normalize";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminMutation } from "@/lib/server/admin-audit-log";

export const runtime = "nodejs";

type ImportBody = {
  listings?: unknown;
  category_slug?: unknown;
  dry_run?: unknown;
};

type ImportResult = {
  total: number;
  valid: number;
  invalid: number;
  created: number;
  inserted: number;
  updated: number;
  skipped: number;
  golf_created: number;
  golf_updated: number;
  property_created: number;
  property_updated: number;
  service_created: number;
  service_updated: number;
  golfRecords: number;
  propertyRecords: number;
  serviceRecords: number;
  scorecard_rows_processed: number;
  warnings: { index: number; name: string; message: string; warnings: string[] }[];
  errors: { index?: number; name: string; field?: string; error: string; message?: string }[];
  processed: { name: string; slug: string; action: string; vertical: string }[];
  preview: ImportPreviewRow[];
};

function getImportItems(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return null;
}

function getCandidateSlug(item: unknown) {
  const row = normalizeImportObject(item);
  const name = typeof row.Nome === "string" ? row.Nome : typeof row.name === "string" ? row.name : "";
  return typeof row.URL_slug === "string" ? row.URL_slug : typeof row.slug === "string" ? row.slug : name;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can import listings.", {
    requireServiceRole: true,
    missingServiceRoleMessage:
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin listing imports.",
  });
  if ("error" in auth) return auth.error;

  let body: ImportBody;
  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const items = getImportItems(body.listings);
  if (!items) {
    return adminErrorResponse(400, "INVALID_LISTINGS", "Request body must contain a listing object or listings array.");
  }

  const fallbackCategory = typeof body.category_slug === "string" ? body.category_slug : undefined;
  const dryRun = body.dry_run === true;
  const candidateSlugs = items.map(getCandidateSlug).filter((slug): slug is string => Boolean(slug));
  const { data: existingRows } = candidateSlugs.length > 0
    ? await auth.writeClient.from("listings").select("slug").in("slug", candidateSlugs)
    : { data: [] as Array<{ slug: string }> };
  const existingSlugs = new Set((existingRows ?? []).map((row) => row.slug));

  const rows = await Promise.all(items.map((item, index) =>
    importListing(item, {
      index,
      dryRun,
      fallbackCategory,
      existingSlugs,
      writeClient: dryRun ? undefined : auth.writeClient as unknown as ImporterSupabaseClient,
    }),
  ));

  const result: ImportResult = {
    total: rows.length,
    valid: rows.filter((row) => row.ok).length,
    invalid: rows.filter((row) => !row.ok).length,
    created: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    golf_created: 0,
    golf_updated: 0,
    property_created: 0,
    property_updated: 0,
    service_created: 0,
    service_updated: 0,
    golfRecords: 0,
    propertyRecords: 0,
    serviceRecords: 0,
    scorecard_rows_processed: 0,
    warnings: [],
    errors: [],
    processed: [],
    preview: rows.map((row) => row.preview),
  };

  for (const row of rows) {
    const name = row.preview.name || `Row ${row.preview.index + 1}`;

    if (row.warnings.length > 0) {
      result.warnings.push({
        index: row.preview.index,
        name,
        message: row.warnings.join(" "),
        warnings: row.warnings,
      });
    }

    if (!row.ok) {
      result.skipped += 1;
      result.errors.push({
        index: row.preview.index,
        name,
        field: row.errors[0]?.path,
        error: row.errors.map((error) => error.path ? `${error.path}: ${error.message}` : error.message).join(" "),
        message: row.errors.map((error) => error.message).join(" "),
      });
      continue;
    }

    if (dryRun) continue;

    if (row.changed.listing === "inserted") {
      result.inserted += 1;
      result.created += 1;
    } else if (row.changed.listing === "updated") {
      result.updated += 1;
    }

    if (row.type === "golf") {
      result.golfRecords += 1;
      result.scorecard_rows_processed += row.changed.children;
      if (row.changed.listing === "updated") result.golf_updated += 1;
      else result.golf_created += 1;
    } else if (row.type === "property") {
      result.propertyRecords += 1;
      if (row.changed.listing === "updated") result.property_updated += 1;
      else result.property_created += 1;
    } else if (row.type === "concierge-services") {
      result.serviceRecords += 1;
      if (row.changed.listing === "updated") result.service_updated += 1;
      else result.service_created += 1;
    }

    if (row.normalized) {
      result.processed.push({
        name: row.normalized.name,
        slug: row.normalized.slug,
        action: row.changed.listing,
        vertical: row.preview.vertical,
      });
    }
  }

  if (dryRun) {
    result.skipped = result.invalid;
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.listings.import-json",
    payload: {
      total: result.total,
      inserted: result.inserted,
      updated: result.updated,
      skipped: result.skipped,
      dryRun,
    },
  });

  return NextResponse.json({ ok: true, data: result, results: result });
}
