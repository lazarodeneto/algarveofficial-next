import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await redirectToPreferredLocalePath(`/blog/${slug}`);
}
