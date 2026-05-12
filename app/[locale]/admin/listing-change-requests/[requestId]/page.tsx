import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingChangeRequestDetail } from "@/components/admin/listing-change-requests/ListingChangeRequestDetail";
import { getAdminListingChangeRequestById } from "@/lib/admin/listing-change-requests/queries";
import { isValidLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Listing Change Request · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LocaleAdminListingChangeRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; requestId: string }>;
}) {
  const { locale: rawLocale, requestId } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const request = await getAdminListingChangeRequestById(requestId);

  if (!request) notFound();

  return <ListingChangeRequestDetail request={request} locale={locale} />;
}

