import { createServiceRoleClient } from "@/lib/supabase/service";

export interface EnsureOwnerCrmLeadInput {
  ownerId: string;
  listingId?: string | null;
  viewerId?: string | null;
  threadId?: string | null;
  contact?: {
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  sourceTable?: string | null;
  sourceRecordId?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown>;
}

export async function ensureOwnerCrmLead({
  ownerId,
  listingId = null,
  viewerId = null,
  threadId = null,
  contact,
  sourceTable = null,
  sourceRecordId = null,
  summary = null,
  metadata = {},
}: EnsureOwnerCrmLeadInput) {
  const client = createServiceRoleClient();
  if (!client) throw new Error("CRM storage is not configured.");

  const { data, error } = await (client as any).rpc("ensure_owner_crm_lead", {
    p_owner_id: ownerId,
    p_listing_id: listingId,
    p_viewer_id: viewerId,
    p_thread_id: threadId,
    p_display_name: contact?.displayName ?? null,
    p_email: contact?.email ?? null,
    p_phone: contact?.phone ?? null,
    p_source_table: sourceTable,
    p_source_record_id: sourceRecordId,
    p_summary: summary,
    p_metadata: metadata,
  });

  if (error) throw error;
  return data as { contactId?: string; opportunityId?: string; activityId?: string } | null;
}
