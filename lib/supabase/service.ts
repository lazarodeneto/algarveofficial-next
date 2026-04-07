import { createAdminClient } from "@/lib/server/admin-client";

export function createServiceRoleClient() {
  return createAdminClient();
}
