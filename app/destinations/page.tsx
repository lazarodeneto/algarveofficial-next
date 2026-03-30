import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function DestinationsPage() {
  await redirectToPreferredLocalePath("/destinations");
}
