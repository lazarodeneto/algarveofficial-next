import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function LegacyRealEstatePage() {
  await redirectToPreferredLocalePath("/real-estate");
}
