import { supabase } from "@/integrations/supabase/client";
import type { AdminSettingsTable } from "@/lib/admin/settings-contract";
type WriteMode = "upsert" | "update";

interface UpdateAdminSettingsRowInput {
  table: AdminSettingsTable;
  id?: string;
  updates: Record<string, unknown>;
  mode?: WriteMode;
}

interface UpdateAdminSettingsRowResponse {
  ok?: boolean;
  data?: Record<string, unknown> | null;
  error?: { message?: string };
}

export async function updateAdminSettingsRow<T = Record<string, unknown>>(
  input: UpdateAdminSettingsRowInput,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("Missing authenticated session for admin settings update.");
  }

  const response = await fetch(`/api/admin/settings/${input.table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      id: input.id,
      updates: input.updates,
      mode: input.mode ?? "upsert",
    }),
  });

  const payload = (await response.json().catch(() => null)) as UpdateAdminSettingsRowResponse | null;
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error?.message || "Failed to update admin settings.");
  }

  return (payload.data ?? null) as T | null;
}
