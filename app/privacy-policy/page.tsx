import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function PrivacyPolicy() {
  await redirectToPreferredLocalePath("/privacy-policy");
}
