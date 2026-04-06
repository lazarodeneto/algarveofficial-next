import { getValidAccessToken } from "@/lib/authToken";
import type { AdminTaxonomyEntity } from "@/lib/admin/taxonomy-contract";

interface TaxonomyApiResponse<T> {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
}

export async function callAdminTaxonomyApi<T = unknown>(
  entity: AdminTaxonomyEntity,
  method: "POST" | "PATCH" | "DELETE" | "PUT",
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(`/api/admin/taxonomy/${entity}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as TaxonomyApiResponse<T> | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Failed to update taxonomy item.");
  }

  return data.data;
}
