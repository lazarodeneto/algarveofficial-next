import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function TermsOfService() {
  await redirectToPreferredLocalePath("/terms");
}
