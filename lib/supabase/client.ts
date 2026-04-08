import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabasePublicEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}
