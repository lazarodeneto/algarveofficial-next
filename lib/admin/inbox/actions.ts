"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { INBOX_CACHE_TAG, type InboxItem, type InboxSource, type InboxStatus } from "./types";
import {
  encodeLegacySideTableReason,
  getLegacySideTableSource,
} from "./side-table-compat";

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

function isInboxSideTableSourceConstraintError(error: { message?: string; code?: string } | null): boolean {
  const message = error?.message ?? "";
  return (
    error?.code === "23514" ||
    message.includes("admin_inbox_archives_source_chk") ||
    message.includes("admin_inbox_assignments_source_chk")
  );
}

function formatInboxSideTableError(error: { message?: string; code?: string } | null): string | null {
  if (!isInboxSideTableSourceConstraintError(error)) return null;
  return [
    "Admin inbox action storage is out of date.",
    "Apply the latest admin inbox side-table source migrations and refresh the Supabase schema cache.",
  ].join(" ");
}

function isInboxHistorySchemaError(error: { message?: string; code?: string } | null): boolean {
  const message = error?.message ?? "";
  return (
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    message.includes("item_snapshot") ||
    message.includes("resolved_at") ||
    message.includes("dismissed_at") ||
    message.includes("admin_inbox_archives.status") ||
    message.includes("Could not find")
  );
}

function formatInboxHistorySchemaError(): string {
  return [
    "Admin inbox history storage is out of date.",
    "Apply supabase/migrations/20260513133000_add_admin_inbox_status_history.sql and refresh the Supabase schema cache.",
  ].join(" ");
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

interface MarkReadInput extends ActionInput {
  reason?: string;
}

interface InboxStateOptions {
  status?: InboxStatus;
  itemSnapshot?: InboxItem | null;
  requiresHistoryColumns?: boolean;
}

const INBOX_SOURCES = new Set<InboxSource>([
  "billing_subscription",
  "external_outbox_alert",
  "listing_claim",
  "listing_moderation",
  "review_moderation",
  "event_moderation",
  "chat_message",
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
const TEXT_SOURCE_ROW_ID_PATTERN = /^[a-z0-9][a-z0-9:._-]{0,159}$/i;
const TEXT_SOURCE_ROW_ID_SOURCES = new Set<InboxSource>([
  "external_outbox_alert",
  "translation_job",
]);

function validateActionInput(input: ActionInput | null | undefined): InboxActionResult | null {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid inbox action payload." };
  }
  if (!INBOX_SOURCES.has(input.source)) {
    return { ok: false, error: "Invalid inbox source." };
  }
  if (TEXT_SOURCE_ROW_ID_SOURCES.has(input.source)) {
    if (!TEXT_SOURCE_ROW_ID_PATTERN.test(input.sourceRowId)) {
      return { ok: false, error: "sourceRowId must be a safe inbox item key." };
    }
    return null;
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

async function captureInboxItemSnapshot(input: ActionInput): Promise<InboxItem | null> {
  try {
    const { getFreshInboxSnapshot } = await import("./aggregator");
    const snapshot = await getFreshInboxSnapshot();
    return (
      snapshot.items.find(
        (item) => item.source === input.source && item.sourceRowId === input.sourceRowId,
      ) ?? null
    );
  } catch {
    return null;
  }
}

function buildInboxStatePayload(
  input: ArchiveInput,
  archivedBy: string,
  fallbackReason: string,
  options: InboxStateOptions,
  sourceOverride?: InboxSource,
) {
  const nowIso = new Date().toISOString();
  const status = options.status ?? "archived";
  const reason = input.reason ?? fallbackReason;
  const storedReason = sourceOverride ? encodeLegacySideTableReason(reason, input.source) : reason;

  return {
    source: sourceOverride ?? input.source,
    source_row_id: input.sourceRowId,
    archived_by: archivedBy,
    archived_at: nowIso,
    reason: storedReason,
    status,
    resolved_at: status === "resolved" ? nowIso : null,
    dismissed_at: status === "dismissed" ? nowIso : null,
    updated_at: nowIso,
    item_snapshot: options.itemSnapshot ?? null,
  };
}

function buildLegacyInboxStatePayload(
  input: ArchiveInput,
  archivedBy: string,
  fallbackReason: string,
  sourceOverride?: InboxSource,
) {
  const reason = input.reason ?? fallbackReason;
  return {
    source: sourceOverride ?? input.source,
    source_row_id: input.sourceRowId,
    archived_by: archivedBy,
    archived_at: new Date().toISOString(),
    reason: sourceOverride ? encodeLegacySideTableReason(reason, input.source) : reason,
  };
}

async function upsertInboxArchive(
  client: Client,
  input: ArchiveInput,
  archivedBy: string,
  fallbackReason: string,
  options: InboxStateOptions = {},
): Promise<InboxActionResult> {
  const { error } = await client
    .from("admin_inbox_archives" as never)
    .upsert(
      buildInboxStatePayload(input, archivedBy, fallbackReason, options) as never,
      { onConflict: "source,source_row_id" } as never,
    );
  if (error) {
    if (isInboxHistorySchemaError(error)) {
      if (options.requiresHistoryColumns) {
        return { ok: false, error: formatInboxHistorySchemaError() };
      }

      const legacy = await client
        .from("admin_inbox_archives" as never)
        .upsert(
          buildLegacyInboxStatePayload(input, archivedBy, fallbackReason) as never,
          { onConflict: "source,source_row_id" } as never,
        );
      if (!legacy.error) {
        invalidate();
        return { ok: true };
      }

      const fallbackSource = isInboxSideTableSourceConstraintError(legacy.error)
        ? getLegacySideTableSource(input.source)
        : null;
      if (fallbackSource) {
        const legacyRetry = await client
          .from("admin_inbox_archives" as never)
          .upsert(
            buildLegacyInboxStatePayload(input, archivedBy, fallbackReason, fallbackSource) as never,
            { onConflict: "source,source_row_id" } as never,
          );
        if (!legacyRetry.error) {
          invalidate();
          return { ok: true };
        }
      }
    }

    const legacySource = isInboxSideTableSourceConstraintError(error)
      ? getLegacySideTableSource(input.source)
      : null;
    if (!legacySource) {
      return { ok: false, error: formatInboxSideTableError(error) ?? error.message };
    }

    const retry = await client
      .from("admin_inbox_archives" as never)
      .upsert(
        buildInboxStatePayload(input, archivedBy, fallbackReason, options, legacySource) as never,
        { onConflict: "source,source_row_id" } as never,
      );
    if (retry.error) {
      if (isInboxHistorySchemaError(retry.error) && !options.requiresHistoryColumns) {
        const legacyRetry = await client
          .from("admin_inbox_archives" as never)
          .upsert(
            buildLegacyInboxStatePayload(input, archivedBy, fallbackReason, legacySource) as never,
            { onConflict: "source,source_row_id" } as never,
          );
        if (!legacyRetry.error) {
          invalidate();
          return { ok: true };
        }
      }
      return {
        ok: false,
        error: isInboxHistorySchemaError(retry.error)
          ? formatInboxHistorySchemaError()
          : formatInboxSideTableError(retry.error) ?? retry.error.message,
      };
    }
  }
  invalidate();
  return { ok: true };
}

export async function approveInboxItem(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  const { source, sourceRowId } = input;
  const nowIso = new Date().toISOString();
  const itemSnapshot = await captureInboxItemSnapshot(input);

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
    return await upsertInboxArchive(
      client,
      { ...input, reason: "approved_from_inbox" },
      auth.userId,
      "approved_from_inbox",
      { status: "resolved", itemSnapshot, requiresHistoryColumns: true },
    );
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
  const itemSnapshot = await captureInboxItemSnapshot(input);

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
    return await upsertInboxArchive(
      client,
      { ...input, reason: "rejected_from_inbox" },
      auth.userId,
      "rejected_from_inbox",
      { status: "resolved", itemSnapshot, requiresHistoryColumns: true },
    );
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
    if (error) {
      const legacySource = isInboxSideTableSourceConstraintError(error)
        ? getLegacySideTableSource(input.source)
        : null;
      if (!legacySource) {
        return { ok: false, error: formatInboxSideTableError(error) ?? error.message };
      }

      const retry = await client
        .from("admin_inbox_assignments" as never)
        .upsert(
          {
            source: legacySource,
            source_row_id: input.sourceRowId,
            assignee_id: input.assigneeId,
            assigned_by: auth.userId,
            assigned_at: new Date().toISOString(),
          } as never,
          { onConflict: "source,source_row_id" } as never,
        );
      if (retry.error) {
        return {
          ok: false,
          error: formatInboxSideTableError(retry.error) ?? retry.error.message,
        };
      }
    }
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
    const itemSnapshot = await captureInboxItemSnapshot(input);
    return await upsertInboxArchive(client, input, auth.userId, "archived", {
      status: "archived",
      itemSnapshot,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Archive failed." };
  }
}

export async function markInboxItemRead(input: MarkReadInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const itemSnapshot = await captureInboxItemSnapshot(input);
    return await upsertInboxArchive(client, input, auth.userId, input.reason ?? "marked_read", {
      status: "resolved",
      itemSnapshot,
      requiresHistoryColumns: true,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Mark as read failed." };
  }
}

export async function archiveInboxNotification(input: ArchiveInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const itemSnapshot = await captureInboxItemSnapshot(input);
    return await upsertInboxArchive(client, input, auth.userId, "archived_from_list", {
      status: "archived",
      itemSnapshot,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Archive failed." };
  }
}

export async function restoreInboxNotification(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const { error } = await client
      .from("admin_inbox_archives" as never)
      .delete()
      .eq("source", input.source)
      .eq("source_row_id", input.sourceRowId)
      .neq("reason", "read_from_list");
    if (error) return { ok: false, error: error.message };

    const legacySource = getLegacySideTableSource(input.source);
    if (legacySource) {
      const legacyDelete = await client
        .from("admin_inbox_archives" as never)
        .delete()
        .eq("source", legacySource)
        .eq("source_row_id", input.sourceRowId)
        .neq("reason", encodeLegacySideTableReason("read_from_list", input.source));
      if (legacyDelete.error) return { ok: false, error: legacyDelete.error.message };
    }

    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Restore failed." };
  }
}

export async function dismissInboxNotification(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const itemSnapshot = await captureInboxItemSnapshot(input);
    return await upsertInboxArchive(
      client,
      { ...input, reason: "dismissed_from_inbox" },
      auth.userId,
      "dismissed_from_inbox",
      { status: "dismissed", itemSnapshot },
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Dismiss failed." };
  }
}

export async function deleteInboxNotification(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const itemSnapshot = await captureInboxItemSnapshot(input);
    return await upsertInboxArchive(
      client,
      { ...input, reason: "deleted_from_inbox" },
      auth.userId,
      "deleted_from_inbox",
      { status: "dismissed", itemSnapshot },
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed." };
  }
}

export async function markInboxItemReadState(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    return await upsertInboxArchive(
      client,
      { ...input, reason: "read_from_list" },
      auth.userId,
      "read_from_list",
      { status: "open" },
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Mark as read failed." };
  }
}

export async function markInboxItemUnreadState(input: ActionInput): Promise<InboxActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  const invalid = validateActionInput(input);
  if (invalid) return invalid;

  const client = writeClient();
  try {
    const { error } = await client
      .from("admin_inbox_archives" as never)
      .delete()
      .eq("source", input.source)
      .eq("source_row_id", input.sourceRowId)
      .eq("reason", "read_from_list");
    if (error) return { ok: false, error: error.message };

    const legacySource = getLegacySideTableSource(input.source);
    if (legacySource) {
      const legacyDelete = await client
        .from("admin_inbox_archives" as never)
        .delete()
        .eq("source", legacySource)
        .eq("source_row_id", input.sourceRowId)
        .eq("reason", encodeLegacySideTableReason("read_from_list", input.source));
      if (legacyDelete.error) return { ok: false, error: legacyDelete.error.message };
    }

    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Mark as unread failed." };
  }
}
