import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROUTE_PATH = join(process.cwd(), "app/api/enquiries/route.ts");
const CLIENT_PATH = join(process.cwd(), "lib/enquiries/client.ts");
const MESSAGE_POLLING_PATH = join(process.cwd(), "hooks/useAdminMessagePolling.ts");
const PUBLIC_MESSAGE_CALLERS = [
  "hooks/useContactForm.ts",
  "components/listing-details/InquiryDialog.tsx",
  "components/real-estate/RealEstateAgentContactCard.tsx",
  "components/real-estate/ConciergeContactDialog.tsx",
  "legacy-pages/public/RealEstateDetail.tsx",
  "legacy-pages/owner/OwnerSupport.tsx",
] as const;

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("public enquiry delivery", () => {
  it("persists public messages to chat and enqueues the forwarding copy", () => {
    const source = readFileSync(ROUTE_PATH, "utf8");

    expect(source).toContain("getContactNotificationRecipients");
    expect(source).toContain("contactAdminNotificationTemplate");
    expect(source).toContain("contactUserConfirmationTemplate");
    expect(source).toContain("sendEmail");
    expect(source).toContain('.from("chat_threads")');
    expect(source).toContain('.from("chat_messages")');
    expect(source).toContain('.from("external_outbox" as never)');
    expect(source).toContain('source: RESEND_OUTBOX_SOURCE');
    expect(source).toContain('revalidateTag(INBOX_CACHE_TAG');
  });

  it("routes all public message forms through the local API instead of the missing edge function", () => {
    const client = readFileSync(CLIENT_PATH, "utf8");

    expect(client).toContain('fetch("/api/enquiries"');

    for (const caller of PUBLIC_MESSAGE_CALLERS) {
      const source = read(caller);

      expect(source).toContain('from "@/lib/enquiries/client"');
      expect(source).toContain("sendEnquiry(");
      expect(source).not.toContain("send-enquiry");
      expect(source).not.toContain("functions.invoke");
    }
  });

  it("refreshes admin message and inbox queries from chat thread realtime events", () => {
    const source = readFileSync(MESSAGE_POLLING_PATH, "utf8");

    expect(source).toContain('table: "chat_threads"');
    expect(source).toContain("scheduleInvalidate()");
  });
});
