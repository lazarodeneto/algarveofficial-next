import { useState, useMemo } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Search, Clock, User, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("blog");
  const heroEnabled = isBlockEnabled("hero", true);
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

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);
  const showFeaturedPost = Boolean(!isLoading && featuredPost && isBlockEnabled("featured-post", true));

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
              {t('blog.label', 'Stories & Guides')}
            </m.span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-hero font-serif font-medium text-foreground"
            >
              {t('blog.title', 'Blog & Insights')}
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto readable"
            >
              {t('blog.subtitle', 'Discover the Algarve lifestyle, travel guides, and insider tips')}
            </m.p>
              
            {/* Search */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-xl mx-auto mt-10"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('blog.searchPlaceholder', 'Search articles...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card border-border"
              />
            </m.div>
          </div>

          {/* Category Filter */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-10 relative max-w-3xl mx-auto"
          >
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              {t('blog.allPosts', 'All Posts')}
            </Button>
            {categories.map(([key, label]) => (
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
          </CmsBlock>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={`flex justify-center ${heroEnabled ? 'py-20' : 'pb-20'}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Featured Post */}
        {showFeaturedPost && (
          <CmsBlock
            pageId="blog"
            blockId="featured-post"
            as="section"
            className={`${heroEnabled ? 'py-8' : 'pb-8'} app-container content-max`}
          >
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
                      <img
                        src={featuredPost.featured_image || '/placeholder.svg'}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-6 md:p-10 flex flex-col justify-center">
                      <Badge variant="secondary" className="w-fit mb-4">
                        {getCategoryLabel(featuredPost.category)}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {featuredPost.author?.avatar_url ? (
                            <img
                              src={featuredPost.author.avatar_url}
                              alt={featuredPost.author.full_name || 'Author'}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <span>{featuredPost.author?.full_name || 'AlgarveOfficial'}</span>
                        </div>
                        <span>•</span>
                        <span>{format(new Date(featuredPost.published_at || featuredPost.created_at), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{featuredPost.reading_time} {t('blog.readTime', 'min read')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </m.div>
          </CmsBlock>
        )}

        {/* Posts Grid */}
        {!isLoading && isBlockEnabled("posts-grid", true) && (
          <CmsBlock
            pageId="blog"
            blockId="posts-grid"
            as="section"
            className={`${heroEnabled || showFeaturedPost ? 'py-12' : 'pb-12'} app-container content-max`}
          >
            {remainingPosts.length === 0 && !featuredPost ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-serif font-medium text-foreground mb-4">{t('blog.noPostsTitle', 'No Articles Yet')}</h2>
                <p className="text-muted-foreground text-lg mb-2">{t('blog.noPostsFound', 'No posts found matching your criteria.')}</p>
                <p className="text-muted-foreground">{t('blog.noPostsSubtext', 'Check back soon for travel guides, lifestyle tips, and insider stories from across the Algarve.')}</p>
              </div>
            ) : (
              <div className="grid-adaptive">
                {remainingPosts.map((post, index) => (
                  <m.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="h-full overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featured_image || '/placeholder.svg'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <CardContent className="p-5">
                          <Badge variant="outline" className="mb-3 text-xs">
                            {getCategoryLabel(post.category)}
                          </Badge>
                          <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}</span>
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
