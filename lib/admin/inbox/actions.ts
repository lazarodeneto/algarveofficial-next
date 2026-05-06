"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { INBOX_CACHE_TAG, type InboxSource } from "./types";

type Client = SupabaseClient<Database>;
type UserRole = Database["public"]["Enums"]["app_role"];

export interface InboxActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const cookieClient = await createCookieClient();
  const { data, error } = await cookieClient.auth.getUser();
  if (error || !data.user) return { error: "Unauthorized." };

  const { data: role, error: roleError } = await cookieClient.rpc("get_user_role", {
    _user_id: data.user.id,
  });
  if (roleError) return { error: "Role check failed." };
  if (role !== "admin") return { error: "Forbidden." };
  return { userId: data.user.id };
}

function writeClient(): Client {
  const client = createServiceRoleClient();
  if (!client) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  return client as Client;
}

function invalidate() {
  revalidateTag(INBOX_CACHE_TAG, "max");
  revalidatePath("/admin/inbox");
  revalidatePath("/[locale]/admin/inbox", "page");
}

interface ActionInput {
  source: InboxSource;
  sourceRowId: string;
}

interface RejectInput extends ActionInput {
  reason: string;
}

interface AssignInput extends ActionInput {
  assigneeId: string;
}

interface ArchiveInput extends ActionInput {
  reason?: string;
}

const INBOX_SOURCES = new Set<InboxSource>([
  "billing_subscription",
  "external_outbox_alert",
  "listing_claim",
  "listing_moderation",
  "review_moderation",
  "event_moderation",
  "translation_job",
]);
const ARCHIVABLE_SOURCES = new Set<InboxSource>([
  "listing_claim",
  "listing_moderation",
  "review_moderation",
  "event_moderation",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateActionInput(input: ActionInput | null | undefined): InboxActionResult | null {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid inbox action payload." };
  }
  if (!INBOX_SOURCES.has(input.source)) {
    return { ok: false, error: "Invalid inbox source." };
  }
  if (!UUID_PATTERN.test(input.sourceRowId)) {
    return { ok: false, error: "sourceRowId must be a valid UUID." };
  }
  return null;
}

function validateAssigneeId(assigneeId: string): InboxActionResult | null {
  if (!UUID_PATTERN.test(assigneeId)) {
    return { ok: false, error: "assigneeId must be a valid UUID." };
  }
  return null;
}

async function ensureAdminAssignee(client: Client, assigneeId: string): Promise<InboxActionResult | null> {
  const { data: role, error } = await client.rpc("get_user_role", { _user_id: assigneeId });
  if (error) return { ok: false, error: "Could not verify assignee role." };
  if ((role as UserRole | null) !== "admin") {
    return { ok: false, error: "Inbox items can only be assigned to admins." };
  }
  return null;
}

export async function approveInboxItem(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  const { source, sourceRowId } = input;
  const nowIso = new Date().toISOString();

  try {
    if (source === "listing_moderation") {
      const { data, error } = await client
        .from("listings")
        .update({ status: "published", published_at: nowIso, rejection_reason: null })
        .eq("id", sourceRowId)
        .eq("status", "pending_review")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Listing is no longer pending review." };
    } else if (source === "review_moderation") {
      const { data, error } = await client
        .from("listing_reviews")
        .update({
          status: "approved",
          approved_at: nowIso,
          moderated_at: nowIso,
          moderated_by: auth.userId,
          rejection_reason: null,
        })
        .eq("id", sourceRowId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Review is no longer pending moderation." };
    } else if (source === "event_moderation") {
      const { data, error } = await client
        .from("events")
        .update({ status: "published", rejection_reason: null })
        .eq("id", sourceRowId)
        .eq("status", "pending_review")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Event is no longer pending review." };
    } else {
      return { ok: false, error: "This inbox item must be opened from its workflow page." };
    }
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Approve failed." };
  }
}

export async function rejectInboxItem(input: RejectInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "Rejection reason is required." };
  if (reason.length > 1000) {
    return { ok: false, error: "Rejection reason must be 1,000 characters or fewer." };
  }

  const client = writeClient();
  const { source, sourceRowId } = input;
  const nowIso = new Date().toISOString();

  try {
    if (source === "listing_moderation") {
      const { data, error } = await client
        .from("listings")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", sourceRowId)
        .eq("status", "pending_review")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Listing is no longer pending review." };
    } else if (source === "review_moderation") {
      const { data, error } = await client
        .from("listing_reviews")
        .update({
          status: "rejected",
          rejection_reason: reason,
          moderated_at: nowIso,
          moderated_by: auth.userId,
        })
        .eq("id", sourceRowId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Review is no longer pending moderation." };
    } else if (source === "event_moderation") {
      const { data, error } = await client
        .from("events")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", sourceRowId)
        .eq("status", "pending_review")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Event is no longer pending review." };
    } else if (source === "listing_claim") {
      const { data, error } = await client
        .from("listing_claims")
        .update({
          status: "rejected",
          rejection_reason: reason,
          reviewed_by: auth.userId,
          reviewed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", sourceRowId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Partner request is no longer pending." };
    }
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Reject failed." };
  }
}

export async function assignInboxItem(input: AssignInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input) ?? validateAssigneeId(input.assigneeId);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const invalidAssignee = await ensureAdminAssignee(client, input.assigneeId);
    if (invalidAssignee) return invalidAssignee;

    const { error } = await client
      .from("admin_inbox_assignments" as never)
      .upsert(
        {
          source: input.source,
          source_row_id: input.sourceRowId,
          assignee_id: input.assigneeId,
          assigned_by: auth.userId,
          assigned_at: new Date().toISOString(),
        } as never,
        { onConflict: "source,source_row_id" } as never,
      );
    if (error) return { ok: false, error: error.message };
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Assign failed." };
  }
}

export async function archiveInboxItem(input: ArchiveInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;
  if (!ARCHIVABLE_SOURCES.has(input.source)) {
    return { ok: false, error: "This inbox item must be resolved in its source system." };
  }

  const client = writeClient();
  try {
    const { error } = await client
      .from("admin_inbox_archives" as never)
      .upsert(
        {
          source: input.source,
          source_row_id: input.sourceRowId,
          archived_by: auth.userId,
          archived_at: new Date().toISOString(),
          reason: input.reason ?? null,
        } as never,
        { onConflict: "source,source_row_id" } as never,
      );
    if (error) return { ok: false, error: error.message };
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Archive failed." };
  }
}
