import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingChangeRequestDetail } from "@/components/admin/listing-change-requests/ListingChangeRequestDetail";
import { getAdminListingChangeRequestById } from "@/lib/admin/listing-change-requests/queries";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Listing Change Request · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminListingChangeRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getAdminListingChangeRequestById(requestId);

  if (!request) notFound();

  return <ListingChangeRequestDetail request={request} locale={DEFAULT_LOCALE} />;
}

