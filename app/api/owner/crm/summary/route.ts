import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { crmCatch, crmError, privateNoStoreHeaders } from "@/lib/owner-crm/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function countQuery(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    const ownerId = auth.userId;
    const [
      contactCount,
      newLeadCount,
      openOpportunityCount,
      upcomingTaskCount,
      overdueTaskCount,
      unreadThreadResult,
      listingAlertCount,
      subscriptionResult,
    ] = await Promise.all([
      countQuery((client as any).from("crm_contacts").select("id", { count: "exact", head: true }).eq("owner_id", ownerId).is("archived_at", null)),
      countQuery((client as any).from("crm_opportunities").select("id", { count: "exact", head: true }).eq("owner_id", ownerId).eq("stage", "new_lead")),
      countQuery((client as any).from("crm_opportunities").select("id", { count: "exact", head: true }).eq("owner_id", ownerId).not("stage", "in", "(won,lost)")),
      countQuery(
        (client as any)
          .from("crm_tasks")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .eq("status", "open")
          .gte("due_at", new Date().toISOString()),
      ),
      countQuery(
        (client as any)
          .from("crm_tasks")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .eq("status", "open")
          .lt("due_at", new Date().toISOString()),
      ),
      (client as any).from("chat_threads").select("unread_owner_count").eq("owner_id", ownerId),
      countQuery(
        (client as any)
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .in("status", ["draft", "pending_review", "rejected"]),
      ),
      (client as any)
        .from("owner_subscriptions")
        .select("tier,status,current_period_end")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (unreadThreadResult.error) throw unreadThreadResult.error;
    if (subscriptionResult.error) throw subscriptionResult.error;

    const unreadMessages = (unreadThreadResult.data ?? []).reduce(
      (sum: number, thread: { unread_owner_count?: number | null }) => sum + (thread.unread_owner_count ?? 0),
      0,
    );

    return NextResponse.json(
      {
        summary: {
          contacts: contactCount,
          new_leads: newLeadCount,
          open_opportunities: openOpportunityCount,
          upcoming_tasks: upcomingTaskCount,
          overdue_tasks: overdueTaskCount,
          unread_messages: unreadMessages,
          listing_health_alerts: listingAlertCount,
          subscription: subscriptionResult.data
            ? {
                tier: subscriptionResult.data.tier,
                status: subscriptionResult.data.status,
                current_period_end: subscriptionResult.data.current_period_end,
              }
            : null,
        },
      },
      { headers: privateNoStoreHeaders },
    );
  } catch (error) {
    return crmCatch(error, "CRM_SUMMARY_FAILED", "Failed to load CRM summary.");
  }
}
