import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function EventsPage() {
  await redirectToPreferredLocalePath("/events");
}
