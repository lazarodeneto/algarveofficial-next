import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function RootPartnerPage() {
  await redirectToPreferredLocalePath("/partner");
}
