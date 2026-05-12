import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BusinessClaimDetail } from "@/components/admin/business-claims/BusinessClaimDetail";
import { getAdminBusinessClaimById } from "@/lib/admin/business-claims/queries";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Business Claim · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessClaimDetailPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  const claim = await getAdminBusinessClaimById(claimId);

  if (!claim) notFound();

  return <BusinessClaimDetail claim={claim} locale={DEFAULT_LOCALE} />;
}

