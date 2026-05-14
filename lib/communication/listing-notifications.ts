import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getAdminNotificationRecipients } from "@/lib/email/email-config";
import { sendEmail } from "@/lib/email/send-email";
import { adminAlertTemplate } from "@/lib/email/templates/admin-alert";
import { ownerNotificationTemplate } from "@/lib/email/templates/owner-notification";

type CommunicationClient = SupabaseClient<Database>;

export interface ListingNotificationResult {
  sent: boolean;
  skipped: boolean;
  reason: string | null;
}

interface ListingContext {
  id: string;
  name: string | null;
  slug: string | null;
  owner_id: string | null;
  status?: string | null;
  tier?: string | null;
}

interface ProfileContext {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface ListingClaimContext {
  id: string;
  listing_id: string | null;
  business_name: string | null;
  contact_name: string | null;
  email: string | null;
  status: string | null;
}

function result(overrides: Partial<ListingNotificationResult>): ListingNotificationResult {
  return {
    sent: false,
    skipped: false,
    reason: null,
    ...overrides,
  };
}

function listingUrl(listing: Pick<ListingContext, "id" | "slug"> | null | undefined) {
  if (!listing) return "/owner";
  return `/listing/${encodeURIComponent(listing.slug || listing.id)}`;
}

function ownerDashboardUrl(listingId?: string | null) {
  return listingId ? `/owner?listing=${encodeURIComponent(listingId)}` : "/owner";
}

async function loadListing(client: CommunicationClient, listingId: string) {
  const { data, error } = await client
    .from("listings")
    .select("id, name, slug, owner_id, status, tier")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ListingContext;
}

async function loadProfile(client: CommunicationClient, userId: string | null | undefined) {
  if (!userId) return null;
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileContext;
}

async function sendOwnerNotification(input: {
  to: string | null | undefined;
  ownerName?: string | null;
  listingTitle: string;
  headline: string;
  message: string;
  status?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  relatedEntityType: "listing" | "listing_claim" | "business_claim" | "admin_inbox";
  relatedEntityId?: string | null;
  idempotencyKey: string;
  metadata?: Record<string, unknown> | null;
}) {
  if (!input.to) return result({ skipped: true, reason: "owner_email_missing" });

  const content = ownerNotificationTemplate({
    ownerName: input.ownerName,
    listingTitle: input.listingTitle,
    headline: input.headline,
    message: input.message,
    status: input.status,
    actionLabel: input.actionLabel,
    actionUrl: input.actionUrl,
  });

  const email = await sendEmail({
    to: input.to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "owner_notification",
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId ?? null,
    idempotencyKey: input.idempotencyKey,
    metadata: input.metadata ?? null,
    tags: [
      { name: "template", value: "owner_notification" },
      { name: "source", value: "listing_lifecycle" },
    ],
    allowSkip: true,
  });

  return result({
    sent: email.success,
    skipped: email.skipped,
    reason: email.error ?? email.reason,
  });
}

export async function notifyListingStatusChanged(input: {
  client: CommunicationClient;
  listingId: string;
  status: string;
  previousStatus?: string | null;
  reason?: string | null;
}) {
  if (input.previousStatus && input.previousStatus === input.status) {
    return result({ skipped: true, reason: "status_unchanged" });
  }

  const listing = await loadListing(input.client, input.listingId);
  if (!listing) return result({ skipped: true, reason: "listing_not_found" });

  const owner = await loadProfile(input.client, listing.owner_id);
  return sendOwnerNotification({
    to: owner?.email,
    ownerName: owner?.full_name,
    listingTitle: listing.name ?? "Your listing",
    headline: "Listing status updated",
    message: `Your AlgarveOfficial listing status changed to ${input.status}.`,
    status: input.status,
    actionLabel: "Open listing",
    actionUrl: listingUrl(listing),
    relatedEntityType: "listing",
    relatedEntityId: listing.id,
    idempotencyKey: `listing/${listing.id}/status/${input.status}`,
    metadata: {
      previousStatus: input.previousStatus ?? null,
      reason: input.reason ?? null,
    },
  });
}

export async function notifyListingTierChanged(input: {
  client: CommunicationClient;
  listingId: string;
  tier: string;
  previousTier?: string | null;
}) {
  if (input.previousTier && input.previousTier === input.tier) {
    return result({ skipped: true, reason: "tier_unchanged" });
  }

  const listing = await loadListing(input.client, input.listingId);
  if (!listing) return result({ skipped: true, reason: "listing_not_found" });

  const owner = await loadProfile(input.client, listing.owner_id);
  return sendOwnerNotification({
    to: owner?.email,
    ownerName: owner?.full_name,
    listingTitle: listing.name ?? "Your listing",
    headline: "Listing tier updated",
    message: `Your AlgarveOfficial listing tier changed to ${input.tier}.`,
    status: input.tier,
    actionLabel: "Open Owner Dashboard",
    actionUrl: ownerDashboardUrl(listing.id),
    relatedEntityType: "listing",
    relatedEntityId: listing.id,
    idempotencyKey: `listing/${listing.id}/tier/${input.tier}`,
    metadata: {
      previousTier: input.previousTier ?? null,
    },
  });
}

export async function notifyOwnerListingContactReceived(input: {
  client: CommunicationClient;
  listingId: string;
  messageId: string;
  senderName: string;
  senderEmail: string;
  messagePreview: string;
}) {
  const listing = await loadListing(input.client, input.listingId);
  if (!listing) return result({ skipped: true, reason: "listing_not_found" });

  const owner = await loadProfile(input.client, listing.owner_id);
  return sendOwnerNotification({
    to: owner?.email,
    ownerName: owner?.full_name,
    listingTitle: listing.name ?? "Your listing",
    headline: "New contact received",
    message: `${input.senderName} sent a message about your listing. Reply from the Owner Dashboard or your admin inbox workflow.`,
    status: "new contact",
    actionLabel: "Open Owner Dashboard",
    actionUrl: ownerDashboardUrl(listing.id),
    relatedEntityType: "admin_inbox",
    relatedEntityId: input.messageId,
    idempotencyKey: `listing/${listing.id}/contact/${input.messageId}`,
    metadata: {
      listingId: listing.id,
      senderEmail: input.senderEmail,
      preview: input.messagePreview.slice(0, 240),
    },
  });
}

export async function notifyListingUpdateSubmittedToAdmin(input: {
  listingId: string;
  listingTitle: string;
  ownerEmail?: string | null;
  ownerName?: string | null;
  requestIds: string[];
  fieldNames: string[];
}) {
  const recipients = getAdminNotificationRecipients();
  if (recipients.length === 0) return result({ skipped: true, reason: "admin_recipients_not_configured" });

  const content = adminAlertTemplate({
    title: "Listing update submitted",
    intro: `${input.ownerName ?? input.ownerEmail ?? "An owner"} submitted listing changes for review.`,
    rows: [
      { label: "Listing", value: input.listingTitle },
      { label: "Owner", value: input.ownerEmail },
      { label: "Fields", value: input.fieldNames.join(", ") },
    ],
    actionLabel: "Review changes",
    actionUrl: "/admin/listing-change-requests",
  });

  const email = await sendEmail({
    to: recipients,
    replyTo: input.ownerEmail ?? null,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "admin_alert",
    relatedEntityType: "listing",
    relatedEntityId: input.listingId,
    idempotencyKey: `listing/${input.listingId}/change-request/${input.requestIds[0] ?? "submitted"}`,
    metadata: {
      requestIds: input.requestIds,
      fieldNames: input.fieldNames,
    },
    tags: [
      { name: "template", value: "admin_alert" },
      { name: "source", value: "listing_update" },
    ],
    allowSkip: true,
  });

  return result({ sent: email.success, skipped: email.skipped, reason: email.error ?? email.reason });
}

export async function notifyListingChangeRequestReviewed(input: {
  client: CommunicationClient;
  requestId: string;
  status: "approved" | "rejected";
  ownerEmail?: string | null;
  ownerName?: string | null;
  listingTitle?: string | null;
  listingId?: string | null;
  adminNote?: string | null;
}) {
  return sendOwnerNotification({
    to: input.ownerEmail,
    ownerName: input.ownerName,
    listingTitle: input.listingTitle ?? "Your listing",
    headline: input.status === "approved" ? "Listing update approved" : "Listing update rejected",
    message: input.status === "approved"
      ? "Your requested listing update has been approved."
      : "Your requested listing update was not approved. Review the admin note for details.",
    status: input.status,
    actionLabel: "Open Owner Dashboard",
    actionUrl: ownerDashboardUrl(input.listingId),
    relatedEntityType: "listing",
    relatedEntityId: input.listingId ?? input.requestId,
    idempotencyKey: `listing-change-request/${input.requestId}/${input.status}`,
    metadata: {
      requestId: input.requestId,
      adminNote: input.adminNote ?? null,
    },
  });
}

async function loadListingClaim(client: CommunicationClient, claimId: string) {
  const { data, error } = await client
    .from("listing_claims")
    .select("id, listing_id, business_name, contact_name, email, status")
    .eq("id", claimId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ListingClaimContext;
}

export async function notifyListingClaimReviewed(input: {
  client: CommunicationClient;
  claimId: string;
  status: "approved" | "rejected";
  listingId?: string | null;
  reason?: string | null;
}) {
  const claim = await loadListingClaim(input.client, input.claimId);
  if (!claim) return result({ skipped: true, reason: "claim_not_found" });

  const listing = input.listingId || claim.listing_id
    ? await loadListing(input.client, input.listingId ?? claim.listing_id!)
    : null;

  return sendOwnerNotification({
    to: claim.email,
    ownerName: claim.contact_name,
    listingTitle: listing?.name ?? claim.business_name ?? "your request",
    headline: input.status === "approved" ? "Partner request approved" : "Partner request rejected",
    message: input.status === "approved"
      ? "Your AlgarveOfficial partner request has been approved. You can continue from the Owner Dashboard."
      : "Your AlgarveOfficial partner request was not approved.",
    status: input.status,
    actionLabel: input.status === "approved" ? "Open Owner Dashboard" : "View AlgarveOfficial",
    actionUrl: input.status === "approved" ? ownerDashboardUrl(listing?.id ?? claim.listing_id) : "/",
    relatedEntityType: "listing_claim",
    relatedEntityId: claim.id,
    idempotencyKey: `claim/${claim.id}/${input.status}`,
    metadata: {
      listingId: listing?.id ?? claim.listing_id,
      reason: input.reason ?? null,
    },
  });
}
