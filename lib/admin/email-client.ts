import { getValidAccessToken } from "@/lib/authToken";
import type { AdminEmailEntity } from "@/lib/admin/email-contract";

interface EmailApiResponse<T> {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
}

export async function callAdminEmailApi<T = unknown>(
  entity: AdminEmailEntity,
  method: "POST" | "PATCH" | "DELETE",
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(`/api/admin/email/${entity}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as EmailApiResponse<T> | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Failed to update email admin data.");
  }
  if (typeof data.data === "undefined") {
    throw new Error("Email admin API returned an empty response.");
  }

  return data.data;
}
