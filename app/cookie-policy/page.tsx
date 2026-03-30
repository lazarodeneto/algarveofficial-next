import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function CookiePolicyPage() {
  await redirectToPreferredLocalePath("/cookie-policy");
}
