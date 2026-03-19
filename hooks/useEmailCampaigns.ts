"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("email_campaigns")
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.from_name || "AlgarveOfficial",
          from_email: campaign.from_email,
          reply_to: campaign.reply_to || null,
          template_id: campaign.template_id || null,
          segment_id: campaign.segment_id || null,
          scheduled_at: campaign.scheduled_at || null,
          status: campaign.scheduled_at ? "scheduled" : "draft",
          created_by: userData.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
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

      const { data, error } = await supabase
        .from("email_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
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

      const { error } = await supabase
        .from("email_campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
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

      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("Not authenticated");
      }

      try {
        const response = await fetch(
          `https://niylxpvafywjonrphddp.supabase.co/functions/v1/send-campaign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({ campaign_id: campaignId }),
            signal: AbortSignal.timeout(8000), // Vercel Hobby Timeout padding
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send campaign");
        }

        return response.json();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "TimeoutError") {
          throw new Error("Request to send campaign timed out. Please try again.");
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign sent", description: `Successfully sent to ${data.sent} contacts` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send campaign", description: error.message, variant: "destructive" });
    },
  });
}
