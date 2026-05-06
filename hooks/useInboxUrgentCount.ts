"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

interface InboxCounts {
  urgentCount: number;
  soonCount: number;
}

async function fetchInboxCounts(): Promise<InboxCounts> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return { urgentCount: 0, soonCount: 0 };

  const response = await fetch("/api/admin/inbox/urgent-count", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load inbox counts.");
  const body = (await response.json()) as { ok: boolean; urgentCount?: number; soonCount?: number };
  if (!body.ok) throw new Error("Failed to load inbox counts.");
  return {
    urgentCount: body.urgentCount ?? 0,
    soonCount: body.soonCount ?? 0,
  };
}

export function useInboxUrgentCount() {
  return useQuery({
    queryKey: ["admin", "inbox", "urgent-count"],
    queryFn: fetchInboxCounts,
    refetchInterval: 60_000,
    staleTime: 30_000,
    placeholderData: { urgentCount: 0, soonCount: 0 },
  });
}
