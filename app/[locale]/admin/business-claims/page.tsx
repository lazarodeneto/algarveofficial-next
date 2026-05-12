import type { Metadata } from "next";

import { BusinessClaimsClient } from "@/components/admin/business-claims/BusinessClaimsClient";

export const metadata: Metadata = {
  title: "Business Claims · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LocaleAdminBusinessClaimsPage() {
  return <BusinessClaimsClient />;
}

