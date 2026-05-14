import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/advanced/schema-builders";
import { BlogClient, type BlogPostRow } from "@/components/blog/BlogClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import {
  getPublicBlogAuthors,
  getPublicBlogPosts,
} from "@/lib/public-data/blog";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  CMS_PAGE_BUILDER_RUNTIME_KEYS,
  type CmsPageConfig,
} from "@/lib/cms/pageBuilderRegistry";
import { fetchCmsRuntimeSettings } from "@/lib/cms/runtime-settings";
import {
  getRuntimePageConfig,
  isRuntimeSectionEnabled,
} from "@/lib/cms/public-page-runtime";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

const BLOG_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Algarve Blog | Travel Tips, Guides & Local Inspiration",
    description:
      "Explore travel guides, local tips, food & wine stories and lifestyle inspiration from the Algarve — curated by people who live and breathe this coast.",
  },
  "pt-pt": {
    title: "Blog do Algarve | Dicas de Viagem, Guias e Inspiração Local",
    description:
      "Explore guias de viagem, dicas locais, histórias de gastronomia e inspiração de estilo de vida do Algarve.",
  },
  fr: {
    title: "Blog Algarve | Conseils de Voyage, Guides et Inspiration Locale",
    description:
      "Explorez des guides de voyage, des conseils locaux, des histoires culinaires et une inspiration de style de vie de l'Algarve.",
  },
  de: {
    title: "Algarve Blog | Reisetipps, Reiseführer und lokale Inspiration",
    description:
      "Entdecken Sie Reiseführer, lokale Tipps, Kulinarisches und Lifestyle-Inspiration aus der Algarve.",
  },
  es: {
    title: "Blog del Algarve | Consejos de Viaje, Guías e Inspiración Local",
    description:
      "Explora guías de viaje, consejos locales, historias de gastronomía e inspiración de estilo de vida del Algarve.",
  },
  it: {
    title: "Blog dell'Algarve | Consigli di Viaggio, Guide e Ispirazione Locale",
    description:
      "Esplora guide di viaggio, consigli locali, storie di gastronomia e ispirazione di lifestyle dall'Algarve.",
  },
  nl: {
    title: "Algarve Blog | Reistips, Gidsen en Lokale Inspiratie",
    description:
      "Ontdek reisgidsen, lokale tips, eten & wijn verhalen en lifestyle inspiratie uit de Algarve.",
  },
  sv: {
    title: "Algarve-bloggen | Resetips, Guider och Lokal Inspiration",
    description:
      "Utforska reseguider, lokala tips, mat- och vinhistorier och livsstilsinspiration från Algarve.",
  },
  no: {
    title: "Algarve-bloggen | Reisetips, Guider og Lokal Inspirasjon",
    description:
      "Utforsk reiseguider, lokale tips, mat- og vinhistorier og livsstilsinspirasjoner fra Algarve.",
  },
  da: {
    title: "Algarve-bloggen | Rejsetips, Guider og Lokal Inspiration",
    description:
      "Udforsk rejseguider, lokale tips, mad- og vinhistorier og livsstilsinspiration fra Algarve.",
  },
};

const BLOG_SERVER_KEYS = [
  "serverPages.blog.badge",
  "serverPages.blog.emptyTitle",
  "serverPages.blog.emptyDescription",
  "serverPages.blog.postsAria",
  "serverPages.blog.minRead",
] as const;

const BLOG_SERVER_FALLBACK: Record<(typeof BLOG_SERVER_KEYS)[number], string> = {
  "serverPages.blog.badge": "AlgarveOfficial blog",
  "serverPages.blog.emptyTitle": "No published articles yet",
  "serverPages.blog.emptyDescription": "Published AlgarveOfficial stories will appear here.",
  "serverPages.blog.postsAria": "Published blog posts",
  "serverPages.blog.minRead": "min read",
};

function blogCopy(copy: Record<string, string>, key: (typeof BLOG_SERVER_KEYS)[number]) {
  return copy[key] ?? BLOG_SERVER_FALLBACK[key];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = BLOG_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/blog",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve blog", "Algarve travel guide", "Algarve tips", "Portugal travel blog"],
  });
}

function BlogServerShell({
  locale,
  posts,
  title,
  description,
  copy,
  pageConfig,
}: {
  locale: Locale;
  posts: BlogPostRow[];
  title: string;
  description: string;
  copy: Record<string, string>;
  pageConfig: CmsPageConfig;
}) {
  const heroEnabled = isRuntimeSectionEnabled(pageConfig, "hero", true);
  const featuredPostEnabled = isRuntimeSectionEnabled(pageConfig, "featured-post", false);
  const postsGridEnabled = isRuntimeSectionEnabled(pageConfig, "posts-grid", true);
  const featuredPost = featuredPostEnabled ? posts[0] ?? null : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div id="blog-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        {heroEnabled ? (
          <section className="mb-8 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {blogCopy(copy, "serverPages.blog.badge")}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </section>
        ) : null}

        {featuredPost ? (
          <section className="mb-8" aria-label="Featured blog post">
            <Link
              href={buildLocalizedPath(locale, `/blog/${featuredPost.slug}`)}
              className="group grid overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:border-primary/40 lg:grid-cols-[1.05fr_0.95fr]"
            >
              {featuredPost.featured_image ? (
                <Image
                  src={featuredPost.featured_image}
                  alt={featuredPost.title}
                  className="h-full min-h-64 w-full object-cover"
                  width={960}
                  height={640}
                  priority={heroEnabled}
                  unoptimized
                />
              ) : null}
              <article className="flex flex-col justify-center p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {featuredPost.category}
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight group-hover:text-primary">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt ? (
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                ) : null}
                <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredPost.reading_time} {blogCopy(copy, "serverPages.blog.minRead")}
                </p>
              </article>
            </Link>
          </section>
        ) : null}

        {postsGridEnabled && posts.length === 0 ? (
          <section className="rounded-lg border border-border bg-card/80 p-8 text-center shadow-sm">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="font-serif text-2xl">{blogCopy(copy, "serverPages.blog.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {blogCopy(copy, "serverPages.blog.emptyDescription")}
            </p>
          </section>
        ) : postsGridEnabled && gridPosts.length > 0 ? (
          <section aria-label={blogCopy(copy, "serverPages.blog.postsAria")} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gridPosts.map((post) => (
              <Link
                key={post.id}
                href={buildLocalizedPath(locale, `/blog/${post.slug}`)}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:border-primary/40"
              >
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    className="h-44 w-full object-cover"
                    width={640}
                    height={352}
                    loading="lazy"
                    unoptimized
                  />
                ) : null}
                <article className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {post.category}
                  </p>
                  <h2 className="mt-2 font-serif text-xl leading-snug group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {post.reading_time} {blogCopy(copy, "serverPages.blog.minRead")}
                  </p>
                </article>
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}

async function loadBlogRuntimeSettings(locale: Locale) {
  try {
    const draft = await draftMode();
    return await fetchCmsRuntimeSettings({
      requestedKeys: CMS_PAGE_BUILDER_RUNTIME_KEYS,
      locale,
      includeDraft: draft.isEnabled,
    });
  } catch {
    return [];
  }
}

export default async function BlogPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;

  const [posts, authors, globalSettings, copy] = await Promise.all([
    getPublicBlogPosts({ locale, limit: 50 }),
    getPublicBlogAuthors(),
    loadBlogRuntimeSettings(locale),
    getServerTranslations(locale, [...BLOG_SERVER_KEYS]),
  ]);
  const pageConfig = getRuntimePageConfig(globalSettings, "blog");
  const meta = BLOG_META[locale];
  const localizedBlogPath = buildLocalizedPath(locale, "/blog");
  const itemListSchema = buildItemListSchema(
    meta.title,
    posts.map((post) => ({
      name: post.title,
      url: buildLocalizedPath(locale, `/blog/${post.slug}`),
      description: post.excerpt ?? undefined,
      image: post.featured_image ?? undefined,
    })),
    localizedBlogPath,
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: buildLocalizedPath(locale, "/") },
    { name: meta.title, url: localizedBlogPath },
  ]);

  return (
    <>
      <script
        id="schema-blog-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        id="schema-blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogServerShell
        locale={locale}
        posts={posts}
        title={meta.title}
        description={meta.description}
        copy={copy}
        pageConfig={pageConfig}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <BlogClient
          initialPosts={posts}
          initialAuthors={authors}
          initialGlobalSettings={globalSettings}
          pageConfig={pageConfig ?? undefined}
        />
      </Suspense>
    </>
  );
}
