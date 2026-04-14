"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Pick<Tables<"profiles">, "id" | "full_name" | "email" | "phone" | "created_at" | "updated_at">;
type OwnerRole = Tables<"user_roles">["role"];
type ListingRow = Pick<Tables<"listings">, "id" | "owner_id" | "name" | "slug" | "status" | "tier" | "created_at" | "updated_at">;
type SubscriptionRow = Pick<
  Tables<"owner_subscriptions">,
  "owner_id" | "status" | "tier" | "billing_period" | "current_period_end" | "stripe_customer_id" | "updated_at" | "created_at"
>;
type NotificationRow = Pick<Tables<"admin_notifications">, "id" | "owner_id" | "type" | "is_read" | "created_at" | "data">;
type EmailContactRow = Pick<
  Tables<"email_contacts">,
  "id" | "email" | "full_name" | "status" | "user_id" | "emails_sent" | "emails_opened" | "last_email_sent_at" | "last_email_opened_at"
>;

export interface OwnerCrmSummary {
  ownerId: string;
  role: OwnerRole;
  fullName: string | null;
  email: string;
  phone: string | null;
  joinedAt: string;
  listingCount: number;
  publishedListingCount: number;
  activeThreadCount: number;
  totalThreadCount: number;
  lastMessageAt: string | null;
  subscriptionStatus: string | null;
  subscriptionTier: Tables<"owner_subscriptions">["tier"] | null;
  billingPeriod: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  hasEmailContact: boolean;
  unreadAlertsCount: number;
}

export interface OwnerCrmListing extends ListingRow {
  city?: { name: string | null } | null;
  category?: { name: string | null } | null;
}

export interface OwnerCrmDetail {
  profile: ProfileRow;
  roles: OwnerRole[];
  listings: OwnerCrmListing[];
  subscription: SubscriptionRow | null;
  notifications: NotificationRow[];
  emailContact: EmailContactRow | null;
}

interface EnsureEmailContactInput {
  ownerId: string;
  email: string;
  fullName: string | null;
}

function toDateMs(date: string | null | undefined): number {
  if (!date) return 0;
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickLatestSubscription(rows: SubscriptionRow[]): SubscriptionRow | null {
  if (rows.length === 0) return null;
  return rows
    .slice()
    .sort((a, b) => toDateMs(b.updated_at || b.created_at) - toDateMs(a.updated_at || a.created_at))[0];
}

export type OwnerCrmSummarySort = "activity" | "listings" | "name";
export type OwnerCrmSummaryStatusFilter = "all" | "subscribed" | "inactive" | "attention";

export interface OwnerCrmSummariesParams {
  page: number;
  pageSize: number;
  search: string;
  sort: OwnerCrmSummarySort;
  statusFilter: OwnerCrmSummaryStatusFilter;
}

export interface OwnerCrmSummaryMetrics {
  totalOwners: number;
  totalListings: number;
  subscribedOwners: number;
  attentionOwners: number;
  ownersWithMessages: number;
}

export interface OwnerCrmSummariesPage {
  rows: OwnerCrmSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  metrics: OwnerCrmSummaryMetrics;
}

interface OwnerCrmRpcPayload {
  rows?: OwnerCrmSummary[];
  page?: number;
  page_size?: number;
  total_count?: number;
  total_pages?: number;
  metrics?: {
    total_owners?: number;
    total_listings?: number;
    subscribed_owners?: number;
    attention_owners?: number;
    owners_with_messages?: number;
  };
}

const DEFAULT_OWNER_CRM_METRICS: OwnerCrmSummaryMetrics = {
  totalOwners: 0,
  totalListings: 0,
  subscribedOwners: 0,
  attentionOwners: 0,
  ownersWithMessages: 0,
};

export function useAdminOwnerCrmSummaries(params: OwnerCrmSummariesParams) {
  return useQuery({
    queryKey: [
      "admin-owner-crm-summaries",
      params.page,
      params.pageSize,
      params.search,
      params.sort,
      params.statusFilter,
    ],
    queryFn: async () => {
      const normalizedPage = Math.max(1, Math.floor(params.page || 1));
      const normalizedPageSize = Math.min(200, Math.max(10, Math.floor(params.pageSize || 100)));
      const normalizedSearch = params.search.trim();

      const { data, error } = await supabase.rpc("admin_owner_crm_summaries", {
        p_page: normalizedPage,
        p_page_size: normalizedPageSize,
        p_search: normalizedSearch.length > 0 ? normalizedSearch : undefined,
        p_sort: params.sort,
        p_status_filter: params.statusFilter,
      });

      if (error) throw error;

      const payload = (data || {}) as OwnerCrmRpcPayload;
      const rows = (payload.rows || []) as OwnerCrmSummary[];
      const metrics = payload.metrics ?? {};

      return {
        rows,
        page: payload.page ?? normalizedPage,
        pageSize: payload.page_size ?? normalizedPageSize,
        totalCount: payload.total_count ?? 0,
        totalPages: payload.total_pages ?? 1,
        metrics: {
          totalOwners: metrics.total_owners ?? 0,
          totalListings: metrics.total_listings ?? 0,
          subscribedOwners: metrics.subscribed_owners ?? 0,
          attentionOwners: metrics.attention_owners ?? 0,
          ownersWithMessages: metrics.owners_with_messages ?? 0,
        },
      } satisfies OwnerCrmSummariesPage;
    },
    staleTime: 60_000,
    placeholderData: (previousData) =>
      previousData ||
      ({
        rows: [],
        page: 1,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 1,
        metrics: DEFAULT_OWNER_CRM_METRICS,
      } satisfies OwnerCrmSummariesPage),
  });
}

export function useAdminOwnerCrmDetail(ownerId: string | null) {
  return useQuery({
    queryKey: ["admin-owner-crm-detail", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      if (!ownerId) throw new Error("ownerId is required");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at, updated_at")
        .eq("id", ownerId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Owner profile not found");

      const [rolesResult, listingsResult, subscriptionsResult, notificationsResult, contactsResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", ownerId),
        supabase
          .from("listings")
          .select(`
            id,
            owner_id,
            name,
            slug,
            status,
            tier,
            created_at,
            updated_at,
            city:cities(name),
            category:categories(name)
          `)
          .eq("owner_id", ownerId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("owner_subscriptions")
          .select("owner_id, status, tier, billing_period, current_period_end, stripe_customer_id, updated_at, created_at")
          .eq("owner_id", ownerId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("admin_notifications")
          .select("id, owner_id, type, is_read, created_at, data")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("email_contacts")
          .select("id, email, full_name, status, user_id, emails_sent, emails_opened, last_email_sent_at, last_email_opened_at")
          .eq("user_id", ownerId)
          .order("updated_at", { ascending: false })
          .limit(1),
      ]);

      if (rolesResult.error) throw rolesResult.error;
      if (listingsResult.error) throw listingsResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (notificationsResult.error) throw notificationsResult.error;
      if (contactsResult.error) throw contactsResult.error;

      let emailContact = (contactsResult.data || [])[0] ?? null;
      if (!emailContact && profile.email) {
        const fallbackContactResult = await supabase
          .from("email_contacts")
          .select("id, email, full_name, status, user_id, emails_sent, emails_opened, last_email_sent_at, last_email_opened_at")
          .eq("email", profile.email)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (fallbackContactResult.error) throw fallbackContactResult.error;
        emailContact = (fallbackContactResult.data || [])[0] ?? null;
      }

      return {
        profile: profile as ProfileRow,
        roles: (rolesResult.data || []).map((role) => role.role as OwnerRole),
        listings: (listingsResult.data || []) as unknown as OwnerCrmListing[],
        subscription: pickLatestSubscription((subscriptionsResult.data || []) as SubscriptionRow[]),
        notifications: (notificationsResult.data || []) as NotificationRow[],
        emailContact: emailContact as EmailContactRow | null,
      } satisfies OwnerCrmDetail;
    },
    staleTime: 30_000,
  });
}

export function useEnsureOwnerEmailContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ownerId, email, fullName }: EnsureEmailContactInput) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        throw new Error("Owner email is required");
      }

      const { data: existingByUser, error: existingByUserError } = await supabase
        .from("email_contacts")
        .select("id, email, user_id")
        .eq("user_id", ownerId)
        .limit(1);

      if (existingByUserError) throw existingByUserError;
      if (existingByUser && existingByUser.length > 0) {
        return existingByUser[0];
      }

      const { data: existingByEmail, error: existingByEmailError } = await supabase
        .from("email_contacts")
        .select("id, email, user_id")
        .eq("email", cleanEmail)
        .limit(1);

      if (existingByEmailError) throw existingByEmailError;

      if (existingByEmail && existingByEmail.length > 0) {
        const existing = existingByEmail[0];
        const { data: updated, error: updateError } = await supabase
          .from("email_contacts")
          .update({
            user_id: existing.user_id ?? ownerId,
            full_name: fullName,
            tags: ["owner"],
            source: "owner_crm",
          })
          .eq("id", existing.id)
          .select("id, email, user_id")
          .single();

        if (updateError) throw updateError;
        return updated;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("email_contacts")
        .insert({
          email: cleanEmail,
          full_name: fullName,
          status: "subscribed",
          user_id: ownerId,
          source: "owner_crm",
          consent_given_at: new Date().toISOString(),
          tags: ["owner"],
        })
        .select("id, email, user_id")
        .single();

      if (insertError) throw insertError;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-owner-crm-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-owner-crm-detail"] });
    },
  });
}
