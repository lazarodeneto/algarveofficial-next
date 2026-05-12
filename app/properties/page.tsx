import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function PropertiesPage() {
  await redirectToPreferredLocalePath("/properties");
}
