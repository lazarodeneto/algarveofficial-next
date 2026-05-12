import type { Metadata } from "next";

import { ListingChangeRequestsClient } from "@/components/admin/listing-change-requests/ListingChangeRequestsClient";

export const metadata: Metadata = {
  title: "Listing Change Requests · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminListingChangeRequestsPage() {
  return <ListingChangeRequestsClient />;
}

