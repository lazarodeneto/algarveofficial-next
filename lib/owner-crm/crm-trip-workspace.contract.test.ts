import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260519150000_add_owner_crm_and_trip_workspace.sql"),
  "utf8",
);
const chatHook = readFileSync(join(process.cwd(), "hooks/useChat.ts"), "utf8");
const tripHook = readFileSync(join(process.cwd(), "hooks/useTripPlanner.ts"), "utf8");
const tripServer = readFileSync(join(process.cwd(), "lib/trips/server.ts"), "utf8");
const chatThreadRoute = readFileSync(join(process.cwd(), "app/api/chat/threads/route.ts"), "utf8");
const conversationView = readFileSync(join(process.cwd(), "components/chat/ConversationView.tsx"), "utf8");
const ownerRoutePage = readFileSync(join(process.cwd(), "app/owner/[[...slug]]/page.tsx"), "utf8");
const ownerProxy = readFileSync(join(process.cwd(), "proxy.ts"), "utf8");
const tripsRoute = readFileSync(join(process.cwd(), "app/api/trips/route.ts"), "utf8");

describe("owner CRM and trip workspace contract", () => {
  it("creates the CRM and visitor trip tables without duplicate inbox or payment systems", () => {
    for (const table of [
      "crm_contacts",
      "crm_contact_channels",
      "crm_opportunities",
      "crm_activity_events",
      "crm_tasks",
      "user_trips",
      "user_trip_events",
    ]) {
      expect(migration).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
    }

    expect(migration).toContain("thread_id UUID NULL REFERENCES public.chat_threads");
    expect(migration).not.toContain("CREATE TABLE IF NOT EXISTS public.crm_messages");
    expect(migration).not.toContain("CREATE TABLE IF NOT EXISTS public.crm_payments");
  });

  it("has the required indexes, partial uniques, and text source idempotency key", () => {
    for (const index of [
      "idx_crm_contacts_owner_updated",
      "idx_crm_contacts_owner_normalized_email",
      "idx_crm_contacts_owner_normalized_phone",
      "idx_crm_opportunities_owner_stage_updated",
      "idx_crm_opportunities_owner_contact",
      "idx_crm_opportunities_owner_listing",
      "idx_crm_activity_events_owner_occurred",
      "idx_crm_activity_events_owner_contact_occurred",
      "idx_crm_tasks_owner_status_due",
      "idx_user_trips_user_updated",
      "idx_user_trip_events_trip_day_sort",
      "idx_user_trip_events_user_created",
      "idx_user_trips_local_draft_unique",
      "idx_user_trip_events_local_event_unique",
    ]) {
      expect(migration).toContain(index);
    }

    expect(migration).toContain("WHERE viewer_id IS NOT NULL");
    expect(migration).toContain("WHERE normalized_email IS NOT NULL");
    expect(migration).toContain("WHERE normalized_phone IS NOT NULL");
    expect(migration).toContain("source_record_id TEXT");
    expect(migration).toContain("idx_crm_activity_events_source_unique");
  });

  it("normalizes optional identity fields and blocks cross-owner CRM and trip writes", () => {
    expect(migration).toContain("NULLIF(lower(trim(value)), '')");
    expect(migration).toContain("NULLIF(regexp_replace(trim(value), '[^0-9+]', '', 'g'), '')");
    expect(migration).toContain("crm_validate_channel");
    expect(migration).toContain("crm_validate_opportunity");
    expect(migration).toContain("crm_validate_activity");
    expect(migration).toContain("crm_validate_task");
    expect(migration).toContain("user_trip_events_validate_owner");
    expect(migration).toContain("Trip event user mismatch");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.crm_has_owner_access");
    expect(migration).toContain("public.has_role(_user_id, 'owner'::public.app_role)");
    expect(migration).toContain("AND public.crm_has_owner_access(auth.uid())");
    expect(migration).not.toContain("USING (owner_id = auth.uid() OR public.has_role");
  });

  it("keeps lead creation atomic and idempotent inside Postgres", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.ensure_owner_crm_lead");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("ON CONFLICT DO NOTHING");
    expect(migration).toContain("stage NOT IN ('won', 'lost')");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.ensure_owner_crm_lead");
  });

  it("wires listing chat to the server lead creator and keeps trip drafts local for logged-out visitors", () => {
    expect(chatHook).toContain('fetch("/api/chat/threads"');
    expect(chatHook).toContain("Authorization: `Bearer ${sessionData.session.access_token}`");
    expect(chatHook).toContain("JSON.stringify({ listingId })");
    expect(chatHook).not.toContain("JSON.stringify({ listingId, ownerId })");
    expect(chatHook).not.toContain("ownerId?: string | null");
    expect(conversationView).not.toContain("ownerId: initialOwnerId");
    expect(chatThreadRoute).not.toContain("ownerId: z.string().uuid()");
    expect(chatThreadRoute).not.toContain("parsed.data.ownerId");
    expect(chatThreadRoute).toContain("const ownerId = listing.owner_id");
    expect(tripHook).toContain("saveLocalTrips(next)");
    expect(tripHook).toContain('apiRequest<{ trip: Trip }>("/api/trips", "POST"');
    expect(tripHook).toContain("clearLocalTrips()");
  });

  it("keeps trip snapshots public-safe and localStorage imports idempotent", () => {
    expect(tripServer).toContain('.eq("status", "published")');
    expect(tripServer).toContain("LISTING_NOT_PUBLIC");
    expect(tripServer).toContain("metadata: input.metadata ?? {}");
    expect(tripHook).toContain("localDraftId: trip.id");
    expect(tripHook).toContain("localEventId: event.id");
    expect(tripsRoute).toContain("fetchImportedTrip");
    expect(tripsRoute).toContain("fetchImportedEvent");
    expect(tripsRoute).toContain("tripErrorResponse");
  });

  it("server-guards unprefixed owner routes before serving the owner CRM shell", () => {
    expect(ownerRoutePage).toContain("guardDashboardRoute");
    expect(ownerRoutePage).toContain('basePath: "/owner"');
    expect(ownerRoutePage).toContain('allowedRoles: ["owner", "admin"]');
    expect(ownerRoutePage.indexOf("guardDashboardRoute")).toBeLessThan(
      ownerRoutePage.indexOf('await import("@/components/routes/OwnerDashboardPage")'),
    );
    expect(ownerRoutePage).not.toContain('import { OwnerDashboardPage } from "@/components/routes/OwnerDashboardPage"');
    expect(ownerProxy).toContain('strippedPathname.startsWith("/owner")');
    expect(ownerProxy).toContain("redirectAnonymousDashboardRequest");
  });
});
