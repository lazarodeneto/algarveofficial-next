import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function FlightsPage() {
  await redirectToPreferredLocalePath("/flights");
}
