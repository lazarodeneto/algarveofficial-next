import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function BlogPage() {
  await redirectToPreferredLocalePath("/blog");
}
