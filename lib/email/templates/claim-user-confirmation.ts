import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface ClaimUserConfirmationInput {
  claimantName: string;
  businessName: string;
  claimId?: string | null;
  selectedTier?: string | null;
  listingUrl?: string | null;
}

export function claimUserConfirmationTemplate(input: ClaimUserConfirmationInput): EmailTemplateContent {
  const subject = "We received your AlgarveOfficial claim request";
  const { html, text } = renderBaseEmail({
    preview: "Your claim request has been received.",
    title: "Claim request received",
    intro: `Hi ${input.claimantName}, your request for ${input.businessName} has been received. The AlgarveOfficial team will review the details before making any changes to the listing.`,
    rows: [
      { label: "Business", value: input.businessName },
      { label: "Claim reference", value: input.claimId },
      { label: "Selected tier", value: input.selectedTier },
    ],
    body: "This confirmation does not guarantee approval. We review claim requests to protect business owners, visitors, and the quality of AlgarveOfficial listings.",
    action: input.listingUrl ? { label: "View listing", url: absoluteUrl(input.listingUrl) } : null,
  });

  return { subject, html, text };
}
