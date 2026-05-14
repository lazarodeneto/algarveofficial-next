import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface ClaimAdminNotificationInput {
  claimId: string;
  requestType: string;
  businessName: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string | null;
  claimantRole?: string | null;
  selectedTier?: string | null;
  message?: string | null;
  proof?: string | null;
  listingTitle?: string | null;
  listingUrl?: string | null;
  submittedAt?: string | null;
  adminUrl?: string | null;
}

export function claimAdminNotificationTemplate(input: ClaimAdminNotificationInput): EmailTemplateContent {
  const subject = `New claim request - ${input.businessName}`;
  const { html, text } = renderBaseEmail({
    preview: "A business claim request needs review.",
    title: "New business claim request",
    intro: "A claim request was submitted and is ready for admin review.",
    rows: [
      { label: "Claim reference", value: input.claimId },
      { label: "Request type", value: input.requestType },
      { label: "Business", value: input.businessName },
      { label: "Listing", value: input.listingTitle },
      { label: "Listing URL", value: input.listingUrl },
      { label: "Claimant name", value: input.claimantName },
      { label: "Claimant email", value: input.claimantEmail },
      { label: "Phone", value: input.claimantPhone },
      { label: "Claimed role", value: input.claimantRole },
      { label: "Selected tier", value: input.selectedTier },
      { label: "Submitted at", value: input.submittedAt },
      { label: "Proof", value: input.proof },
    ],
    body: input.message,
    action: input.adminUrl ? { label: "Review claim", url: absoluteUrl(input.adminUrl) } : null,
  });

  return { subject, html, text };
}
