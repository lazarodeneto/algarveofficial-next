"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailMarketingStats {
  totalContacts: number;
  subscribedContacts: number;
  unsubscribedContacts: number;
  totalCampaigns: number;
  campaignsSent30d: number;
  totalEmailsSent: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export function useEmailStats() {
  return useQuery({
    queryKey: ["email-stats"],
    queryFn: async () => {
      // Get contact stats
      const { data: contacts, error: contactsError } = await supabase
        .from("email_contacts")
        .select("status");

      if (contactsError) throw contactsError;

      const totalContacts = contacts.length;
      const subscribedContacts = contacts.filter(c => c.status === "subscribed").length;
      const unsubscribedContacts = contacts.filter(c => c.status === "unsubscribed").length;

      // Get campaign stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: campaigns, error: campaignsError } = await supabase
        .from("email_campaigns")
        .select("status, sent_at, total_sent, total_opened, total_clicked");

      if (campaignsError) throw campaignsError;

      const totalCampaigns = campaigns.length;
      const campaignsSent30d = campaigns.filter(
        c => c.status === "sent" && c.sent_at && new Date(c.sent_at) >= thirtyDaysAgo
      ).length;

      const sentCampaigns = campaigns.filter(c => c.status === "sent");
      const totalEmailsSent = sentCampaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
      const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
      const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0);

      const avgOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
      const avgClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;

      return {
        totalContacts,
        subscribedContacts,
        unsubscribedContacts,
        totalCampaigns,
        campaignsSent30d,
        totalEmailsSent,
        totalOpened,
        totalClicked,
        avgOpenRate,
        avgClickRate,
      } as EmailMarketingStats;
    },
  });
}

export function useRecentCampaignActivity() {
  return useQuery({
    queryKey: ["email-recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select(`
          id,
          name,
          status,
          sent_at,
          total_sent,
          total_opened,
          total_clicked
        `)
        .in("status", ["sent", "sending"])
        .order("sent_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
}

export function useCampaignReport(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaign-report", campaignId],
    queryFn: async () => {
      if (!campaignId) return null;

      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get events for this campaign
      const { data: events, error: eventsError } = await supabase
        .from("email_events")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;

      // Calculate rates
      const openRate = campaign.total_sent > 0 
        ? (campaign.total_opened / campaign.total_sent) * 100 
        : 0;
      const clickRate = campaign.total_sent > 0 
        ? (campaign.total_clicked / campaign.total_sent) * 100 
        : 0;
      const bounceRate = campaign.total_sent > 0 
        ? (campaign.total_bounced / campaign.total_sent) * 100 
        : 0;

      return {
        campaign,
        events,
        metrics: {
          openRate,
          clickRate,
          bounceRate,
        },
      };
    },
    enabled: !!campaignId,
  });
}
