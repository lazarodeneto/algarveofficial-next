import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function ContactPage() {
  await redirectToPreferredLocalePath("/contact");
}
