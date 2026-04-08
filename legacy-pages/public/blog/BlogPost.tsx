import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from "next/navigation";
import { m } from 'framer-motion';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { getSessionId } from '@/lib/sessionId';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Eye,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { 
  usePublishedBlogPost, 
  useIncrementBlogViews,
  blogCategoryLabels 
} from '@/hooks/useBlogPosts';

export default function BlogPost() {
  const { slug: rawSlug } = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const router = useRouter();
  const { t } = useTranslation();

  const { data: post, isLoading, error } = usePublishedBlogPost(slug);
  const { mutate: incrementViews } = useIncrementBlogViews();

  // Increment views on mount with session deduplication
  useEffect(() => {
    if (post?.id) {
      const sessionId = getSessionId();
      incrementViews({ postId: post.id, sessionId });
    }
  }, [post?.id, incrementViews]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">This article may have been removed or is not available.</p>
            <Button onClick={() => router.push('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://algarveofficial.com/" },
          { name: "Blog", url: "https://algarveofficial.com/blog" },
          { name: post.title, url: `https://algarveofficial.com/blog/${post.slug}` },
        ]}
      />
      <Header />
      
      <main className="pt-20">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={post.featured_image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Article Content */}
        <article className="container max-w-4xl mx-auto px-4 -mt-32 relative z-10">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back Link */}
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>

            {/* Article Header */}
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-10">
                <Badge variant="secondary" className="mb-4">
                  {blogCategoryLabels[post.category]}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-6">
                  {post.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-8">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.full_name || 'Author'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{post.author?.full_name || 'AlgarveOfficial'}</p>
                      <p className="text-xs">{t('blog.by', 'By')} AlgarveOfficial</p>
                    </div>
                  </div>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time} {t('blog.readTime', 'min read')}</span>
                  </div>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views.toLocaleString()} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article Body */}
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-10">
                <div 
                  className="prose prose-lg prose-invert max-w-none
                    prose-headings:font-serif prose-headings:font-semibold
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-li:marker:text-primary"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize((post.content || '').replace(/\n/g, '<br/>'), {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
                      ALLOW_DATA_ATTR: false
                    })
                  }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                {/* Share */}
                <Separator className="my-8" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    {t('blog.shareArticle', 'Share this article')}:
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </m.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
