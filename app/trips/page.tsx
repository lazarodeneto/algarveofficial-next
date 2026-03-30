import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function TripsPage() {
  await redirectToPreferredLocalePath("/trips");
}
