import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BusinessClaimDetail } from "@/components/admin/business-claims/BusinessClaimDetail";
import { getAdminBusinessClaimById } from "@/lib/admin/business-claims/queries";
import { isValidLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Business Claim · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LocaleAdminBusinessClaimDetailPage({
  params,
}: {
  params: Promise<{ locale: string; claimId: string }>;
}) {
  const { locale: rawLocale, claimId } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const claim = await getAdminBusinessClaimById(claimId);

  if (!claim) notFound();

  return <BusinessClaimDetail claim={claim} locale={locale} />;
}

