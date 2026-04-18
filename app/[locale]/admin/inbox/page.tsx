import type { Metadata } from "next";

import { InboxClient } from "@/components/admin/inbox/InboxClient";
import { getInboxSnapshot } from "@/lib/admin/inbox/aggregator";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Inbox · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const [snapshot, supabase] = await Promise.all([
    getInboxSnapshot(),
    createClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <InboxClient initialSnapshot={snapshot} currentUserId={user?.id ?? null} />;
}
