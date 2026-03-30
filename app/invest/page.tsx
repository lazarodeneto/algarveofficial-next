import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function InvestPage() {
  await redirectToPreferredLocalePath("/real-estate");
}
