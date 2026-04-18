"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { InboxSource } from "./types";

type Client = SupabaseClient<Database>;

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

export async function approveInboxItem(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };

  const client = writeClient();
  const { source, sourceRowId } = input;
  const nowIso = new Date().toISOString();

  try {
    if (source === "listing_moderation") {
      const { error } = await client
        .from("listings")
        .update({ status: "published", published_at: nowIso, rejection_reason: null })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
    } else if (source === "review_moderation") {
      const { error } = await client
        .from("listing_reviews")
        .update({
          status: "approved",
          approved_at: nowIso,
          moderated_at: nowIso,
          moderated_by: auth.userId,
          rejection_reason: null,
        })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
    } else if (source === "event_moderation") {
      const { error } = await client
        .from("events")
        .update({ status: "published", rejection_reason: null })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
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

  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "Rejection reason is required." };

  const client = writeClient();
  const { source, sourceRowId } = input;
  const nowIso = new Date().toISOString();

  try {
    if (source === "listing_moderation") {
      const { error } = await client
        .from("listings")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
    } else if (source === "review_moderation") {
      const { error } = await client
        .from("listing_reviews")
        .update({
          status: "rejected",
          rejection_reason: reason,
          moderated_at: nowIso,
          moderated_by: auth.userId,
        })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
    } else if (source === "event_moderation") {
      const { error } = await client
        .from("events")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", sourceRowId);
      if (error) return { ok: false, error: error.message };
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

  const client = writeClient();
  try {
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
