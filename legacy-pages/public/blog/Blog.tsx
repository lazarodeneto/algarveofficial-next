"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RouteMessageState } from '@/components/layout/RouteMessageState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { CmsBlock } from '@/components/cms/CmsBlock';
import { useCmsPageBuilder } from '@/hooks/useCmsPageBuilder';
import { STANDARD_PUBLIC_NO_HERO_SPACER_CLASS } from "@/components/sections/hero-layout";
import { 
  usePublishedBlogPosts, 
  blogCategoryLabels, 
  type BlogCategory 
} from '@/hooks/useBlogPosts';

export default function Blog() {
  const { t } = useTranslation();
  const { isBlockEnabled } = useCmsPageBuilder("blog");
  const heroEnabled = isBlockEnabled("hero", true);
  const searchEnabled = isBlockEnabled("search", true);
  const featuredPostEnabled = isBlockEnabled("featured-post", false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

  const { data: posts = [], isLoading } = usePublishedBlogPosts(
    selectedCategory !== 'all' ? selectedCategory : undefined
  );

  const categories = Object.entries(blogCategoryLabels) as [BlogCategory, string][];

  // Helper to get translated category label
  const getCategoryLabel = (category: BlogCategory) => {
    const translationKeyMap: Record<string, string> = {
      'lifestyle': 'blog.blogCategories.lifestyle',
      'travel-guides': 'blog.blogCategories.travelGuides',
      'food-wine': 'blog.blogCategories.foodWine',
      'golf': 'blog.blogCategories.golf',
      'real-estate': 'categories.algarveServices',
      'events': 'blog.blogCategories.events',
      'wellness': 'blog.blogCategories.wellness',
      'insider-tips': 'blog.blogCategories.insiderTips',
    };
    return t(translationKeyMap[category] || category, blogCategoryLabels[category]);
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);
  const featuredPost = featuredPostEnabled ? filteredPosts[0] ?? null : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;
  const shouldRenderPostsGrid = isBlockEnabled("posts-grid", true) && (filteredPosts.length === 0 || gridPosts.length > 0);

  return (
    <div className="min-h-screen bg-background" data-cms-page="blog">
      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main>
        {/* Hero Section */}
        {heroEnabled && (
          <CmsBlock pageId="blog" blockId="hero" as="section" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
          <div className="relative app-container text-center">
            <m.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-6"
            >
              {t('blog.label')}
            </m.span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-hero font-serif font-medium text-foreground"
            >
              {t('blog.title')}
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto readable"
            >
              {t('blog.subtitle')}
            </m.p>
          </div>
          </CmsBlock>
        )}

        {/* Search */}
        {searchEnabled && (
          <CmsBlock pageId="blog" blockId="search" as="section" className={`${heroEnabled ? '-mt-10' : 'pt-8'} relative z-10 app-container content-max pb-6`}>
            <div className="rounded-md border border-border bg-card p-5 shadow-sm">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card border-border"
              />
            </m.div>

            {/* Category Filter */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2 mt-5 relative max-w-3xl mx-auto"
            >
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                {t('blog.allPosts')}
              </Button>
              {categories.map(([key]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {getCategoryLabel(key)}
                </Button>
              ))}
            </m.div>
            </div>
          </CmsBlock>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={`flex justify-center ${heroEnabled ? 'py-20' : 'pb-20'}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Featured Post */}
        {!isLoading && featuredPost && (
          <CmsBlock
            pageId="blog"
            blockId="featured-post"
            as="section"
            defaultEnabled={false}
            className="app-container content-max py-8"
          >
            <Link href={`/blog/${featuredPost.slug}`} className="block">
              <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="min-h-[17rem] overflow-hidden">
                    <img
                      src={featuredPost.featured_image || '/placeholder.svg'}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="flex flex-col justify-center p-6 sm:p-8">
                    <Badge variant="outline" className="mb-4 w-fit text-xs">
                      {getCategoryLabel(featuredPost.category)}
                    </Badge>
                    <h2 className="font-serif text-2xl font-light leading-tight text-foreground group-hover:text-primary transition-colors sm:text-3xl">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {featuredPost.excerpt}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {featuredPost.reading_time} min
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </CmsBlock>
        )}

        {/* Posts Grid */}
        {!isLoading && shouldRenderPostsGrid && (
          <CmsBlock
            pageId="blog"
            blockId="posts-grid"
            as="section"
            className={`${heroEnabled ? 'py-12' : 'pb-12'} app-container content-max`}
          >
            {filteredPosts.length === 0 ? (
              <RouteMessageState
                eyebrow={t('blog.label')}
                title={t('blog.noPostsTitle')}
                description={
                  searchQuery
                    ? t('blog.noPostsFound')
                    : t(
                        'blog.noPostsSubtext',
                      )
                }
                minHeightClassName="min-h-[22rem]"
              />
            ) : (
              <div className="grid-adaptive">
                {gridPosts.map((post, index) => (
                  <m.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="h-full"
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <Card className="h-full overflow-hidden bg-card border-border hover:border-primary/30 transition-all group flex flex-col">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featured_image || '/placeholder.svg'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <CardContent className="p-5 flex flex-col flex-1">
                          <Badge variant="outline" className="mb-3 text-xs">
                            {getCategoryLabel(post.category)}
                          </Badge>
                          <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2 min-h-[3.1rem] group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.75rem] flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-end text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.reading_time} min</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </m.div>
                ))}
              </div>
            )}
          </CmsBlock>
        )}
      </main>

      <Footer />
    </div>
  );
}
