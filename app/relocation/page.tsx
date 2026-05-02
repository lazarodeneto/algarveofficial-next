import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function RelocationPage() {
  await redirectToPreferredLocalePath("/relocation");
}
