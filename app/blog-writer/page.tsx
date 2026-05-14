import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function BlogWriterRootPage() {
  await redirectToPreferredLocalePath("/blog-writer");
}
