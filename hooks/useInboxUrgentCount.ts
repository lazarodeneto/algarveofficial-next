"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

async function fetchUrgentCount(): Promise<number> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return 0;

  const response = await fetch("/api/admin/inbox/urgent-count", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return 0;
  const body = (await response.json()) as { ok: boolean; count?: number };
  return body.count ?? 0;
}

export function useInboxUrgentCount() {
  return useQuery({
    queryKey: ["admin", "inbox", "urgent-count"],
    queryFn: fetchUrgentCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
