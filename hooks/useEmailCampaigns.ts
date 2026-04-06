"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callAdminEmailApi } from "@/lib/admin/email-client";
import { toast } from "@/hooks/use-toast";

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  template_id: string | null;
  segment_id: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
  scheduled_at: string | null;
  sent_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_complained: number;
  total_unsubscribed: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  template?: { name: string } | null;
  segment?: { name: string } | null;
}

export interface EmailCampaignInsert {
  name: string;
  subject: string;
  from_name?: string;
  from_email: string;
  reply_to?: string;
  template_id?: string;
  segment_id?: string;
  scheduled_at?: string;
}

async function readFunctionError(error: unknown, fallback: string) {
  const err = error as { message?: string; context?: Response } | null;
  if (!err) return fallback;

  if (err.context instanceof Response) {
    try {
      const payload = (await err.context.clone().json()) as { error?: string; message?: string };
      if (payload.error) return payload.error;
      if (payload.message) return payload.message;
    } catch {
      try {
        const text = await err.context.clone().text();
        if (text?.trim()) return text.trim();
      } catch {
        // no-op
      }
    }
  }

  return err.message || fallback;
}

export function useEmailCampaigns(options?: { status?: string; limit?: number }) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["email-campaigns", options],
    queryFn: async () => {
      let query = supabase
        .from("email_campaigns")
        .select(`
          *,
          template:email_templates(name),
          segment:email_segments(name)
        `)
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        const validStatus = options.status as "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
        query = query.eq("status", validStatus);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmailCampaign[];
    },
    enabled: isBrowser,
    initialData: [] as EmailCampaign[],
  });
}

export function useEmailCampaign(id: string | undefined) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["email-campaign", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("email_campaigns")
        .select(`
          *,
          template:email_templates(*),
          segment:email_segments(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EmailCampaign;
    },
    enabled: isBrowser && !!id,
    initialData: null as EmailCampaign | null,
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (campaign: EmailCampaignInsert) => {
      if (!isBrowser) return null;
      const data = await callAdminEmailApi("campaigns", "POST", {
        name: campaign.name,
        subject: campaign.subject,
        from_name: campaign.from_name || "AlgarveOfficial",
        from_email: campaign.from_email,
        reply_to: campaign.reply_to || null,
        template_id: campaign.template_id || null,
        segment_id: campaign.segment_id || null,
        scheduled_at: campaign.scheduled_at || null,
        status: campaign.scheduled_at ? "scheduled" : "draft",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateEmailCampaign() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailCampaign> & { id: string }) => {
      if (!isBrowser) return null;
      const data = await callAdminEmailApi("campaigns", "PATCH", { id, ...updates });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update campaign", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteEmailCampaign() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;
      await callAdminEmailApi("campaigns", "DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!isBrowser) return null;
      const { data, error } = await supabase.functions.invoke("send-campaign", {
        body: { campaign_id: campaignId },
      });

      if (error) {
        throw new Error(await readFunctionError(error, "Failed to send campaign"));
      }

      if (data?.error) {
        throw new Error(data.error as string);
      }

      return data as { sent: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      const sentCount = data?.sent ?? 0;
      toast({ title: "Campaign sent", description: `Successfully sent to ${sentCount} contacts` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send campaign", description: error.message, variant: "destructive" });
    },
  });
}
