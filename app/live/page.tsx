import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function LivePage() {
  await redirectToPreferredLocalePath("/live");
}
