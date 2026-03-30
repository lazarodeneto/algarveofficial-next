import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function MapPage() {
  await redirectToPreferredLocalePath("/map");
}
