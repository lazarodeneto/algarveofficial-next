import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function AboutUsPage() {
  await redirectToPreferredLocalePath("/about-us");
}
