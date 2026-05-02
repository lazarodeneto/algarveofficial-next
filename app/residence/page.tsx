import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function ResidencePage() {
  await redirectToPreferredLocalePath("/relocation");
}
