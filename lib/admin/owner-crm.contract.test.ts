import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(REPO_ROOT, relativePath), "utf8");
}

describe("admin owner CRM contract", () => {
  it("keeps CRM email contact writes behind the admin email API and consent-safe", () => {
    const source = read("hooks/useAdminOwnerCRM.ts");

    expect(source).toContain('callAdminEmailApi<EmailContactRow>("contacts", "POST"');
    expect(source).toContain('callAdminEmailApi<EmailContactRow>("contacts", "PATCH"');
    expect(source).toContain('status: "unsubscribed"');
    expect(source).toContain("marketing_consent: false");

    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*insert\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*update\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*upsert\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*delete\(/);
  });

  it("keeps admin chat replies behind an admin-guarded API route", () => {
    const source = read("app/api/admin/chat/message/route.ts");

    expect(source).toContain("export async function POST");
    expect(source).toContain("Only admins or editors can send admin chat messages.");
    expect(source).toContain('auditAction: "admin.chat.send-message"');
    expect(source).toContain('sender_type: "admin"');
  });

  it("keeps admin chat thread actions validated and error-safe", () => {
    const threadsRoute = read("app/api/admin/chat/threads/route.ts");
    const readRoute = read("app/api/admin/chat/read/route.ts");

    expect(threadsRoute).toContain("THREAD_STATUS_VALUES");
    expect(threadsRoute).toContain("CHAT_MESSAGES_LOOKUP_FAILED");
    expect(threadsRoute).toContain("CHAT_THREAD_ENRICHMENT_FAILED");
    expect(threadsRoute).toContain("threadId must be a valid UUID");
    expect(readRoute).toContain("All thread ids must be valid UUIDs");
  });

  it("keeps public listing links locale-aware from CRM", () => {
    const source = read("legacy-pages/admin/AdminOwnerCRM.tsx");

    expect(source).toContain('href={l(`/listing/${listing.slug}`)}');
  });

  it("invokes owner billing through the authenticated function helper", () => {
    const source = read("legacy-pages/admin/AdminOwnerCRM.tsx");

    expect(source).toMatch(/invokeFunctionWithAuthRetry<[^>]+>\("admin-owner-billing"/);
    expect(source).not.toContain('supabase.functions.invoke("admin-owner-billing"');
  });

  it("keeps owner CRM rollups backed by owners, listings, subscriptions, and messages", () => {
    const source = read("supabase/migrations/20260506164000_refine_admin_owner_crm_summaries.sql");

    expect(source).toContain("FROM public.owner_subscriptions os");
    expect(source).toContain("FROM public.chat_threads t");
    expect(source).toContain(")::INTEGER AS subscribed_owners");
    expect(source).toContain("COALESCE(oru.subscription_tier, 'unverified') IN ('verified', 'signature')");
    expect(source).toContain("COALESCE(oru.has_email_contact, FALSE) = FALSE");
  });
});
