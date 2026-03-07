// pages/articles/[slug].js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { useState, useEffect, useMemo, useCallback } from 'react';
import ArticleCard from '../../components/ArticleCard';
import ShareButton from '../../components/ShareButton';
import AuthorCard from '../../components/AuthorCard';
import { 
  fetchArticle, 
  fetchArticlePaths, 
  fetchRelatedArticles,
  getProxiedImageUrl,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  extractHeadings,
  slugify,
  addHeadingIds,
  tryEndpoints
} from '../../utils/api';

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function ArticleDetail({ article: initialArticle, relatedArticles, error }) {
  const router = useRouter();
  
  // ✅ Safe state initialization with fallbacks
  const [pageArticle, setPageArticle] = useState(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);
  const [finalBodyHtml, setFinalBodyHtml] = useState("");
  const [finalReferencesHtml, setFinalReferencesHtml] = useState("");
  const [processingError, setProcessingError] = useState(null);

  // ✅ Safe CMS URL with validation
  const safeCMS = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    return url.replace(/\/$/, ''); // Remove trailing slash
  }, []);

  // ✅ Handle error state first
  if (error) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">Error Loading Article</h1>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  // ✅ Safe memo with null checks
  const rawBody = useMemo(() => {
    if (!pageArticle?.body) return "";
    return pageArticle.body;
  }, [pageArticle?.body]);

  const rawReferences = useMemo(() => {
    if (!pageArticle?.references) return "";
    return pageArticle.references;
  }, [pageArticle?.references]);

  /* =========================================================
     ✅ Body processing pipeline with error handling
  ========================================================= */
  useEffect(() => {
    let mounted = true;

    const processContent = async () => {
      // ✅ Skip if no content
      if (!rawBody || rawBody.trim() === '') {
        setFinalBodyHtml('');
        return;
      }

      setProcessingError(null);
      
      try {
        console.log("🔄 Processing article body...");
        
        // 1) Replace embed images with error handling
        let withImages = rawBody;
        try {
          withImages = await replaceEmbedImages(rawBody, safeCMS);
        } catch (imgErr) {
          console.error("Image replacement failed:", imgErr);
          withImages = rawBody; // Fallback to original
        }
        
        // 2) Fix internal links with error handling
        let withLinks = withImages;
        try {
          withLinks = await fixWagtailInternalLinks(withImages, safeCMS);
        } catch (linkErr) {
          console.error("Link fixing failed:", linkErr);
          withLinks = withImages; // Fallback
        }
        
        if (mounted) {
          setFinalBodyHtml(withLinks || '');
          console.log("✅ Article body processed");
        }
      } catch (err) {
        console.error("❌ Error processing article body:", err);
        if (mounted) {
          setProcessingError("Failed to process article content");
          setFinalBodyHtml(rawBody); // Fallback to raw content
        }
      }
    };

    processContent();

    return () => {
      mounted = false;
    };
  }, [rawBody, safeCMS]);

  /* ✅ References processing with error handling */
  useEffect(() => {
    let mounted = true;

    const processReferences = async () => {
      if (!rawReferences || rawReferences.trim() === '') {
        setFinalReferencesHtml('');
        return;
      }

      try {
        console.log("🔄 Processing references...");
        const withLinks = await fixWagtailInternalLinks(rawReferences, safeCMS);
        if (mounted) {
          setFinalReferencesHtml(withLinks || '');
          console.log("✅ References processed");
        }
      } catch (err) {
        console.error("❌ Error processing references:", err);
        if (mounted) {
          setFinalReferencesHtml(rawReferences); // Fallback
        }
      }
    };

    processReferences();

    return () => {
      mounted = false;
    };
  }, [rawReferences, safeCMS]);

  // ✅ Safe headings extraction
  const headings = useMemo(() => {
    if (!finalBodyHtml) return [];
    try {
      return extractHeadings(finalBodyHtml) || [];
    } catch (e) {
      console.error("Error extracting headings:", e);
      return [];
    }
  }, [finalBodyHtml]);

  // ✅ Safe body with IDs
  const bodyWithIds = useMemo(() => {
    if (!finalBodyHtml) return '';
    try {
      return addHeadingIds(finalBodyHtml, headings) || finalBodyHtml;
    } catch (e) {
      console.error("Error adding heading IDs:", e);
      return finalBodyHtml;
    }
  }, [finalBodyHtml, headings]);

  // ✅ Loading state
  if (router.isFallback || loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-neutral-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Not found state
  if (!pageArticle || Object.keys(pageArticle).length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">Article Not Found</h1>
        <p className="text-neutral-600 mb-6">The article you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  // ✅ Safe destructuring with fallbacks
  const {
    title = 'Untitled Article',
    subtitle = '',
    image = null,
    author = null,
    published_date = null,
    updated_date = null,
    tags = [],
    category = null,
    reviewer = null
  } = pageArticle;

  // ✅ Safe date formatting
  const formattedPublishedDate = useMemo(() => {
    if (!published_date) return null;
    try {
      return new Date(published_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return null;
    }
  }, [published_date]);

  const formattedUpdatedDate = useMemo(() => {
    if (!updated_date) return null;
    try {
      return new Date(updated_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return null;
    }
  }, [updated_date]);

  // ✅ SEO data
  const pageTitle = title ? `${title} - Niinfomed` : 'Article - Niinfomed';
  const pageDescription = subtitle || `Read about ${title || 'health topics'} on Niinfomed.`;
  const pageUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_SITE_URL || "https://niinfomed.com"}/articles/${router.query.slug || ''}`;

  const mainImageUrl = useMemo(() => {
    if (!image) return "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&h=630";
    try {
      return getProxiedImageUrl(image);
    } catch (e) {
      console.error("Image URL error:", e);
      return "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&h=630";
    }
  }, [image]);

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          title: pageTitle,
          description: pageDescription,
          url: pageUrl,
          images: [
            {
              url: mainImageUrl,
              width: 1200,
              height: 630,
              alt: title || 'Article image',
            },
          ],
          siteName: "Niinfomed",
          type: 'article',
          article: {
            publishedTime: published_date || undefined,
            modifiedTime: updated_date || undefined,
            authors: author?.name ? [author.name] : [],
            tags: Array.isArray(tags) ? tags : [],
          },
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
      />

      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex flex-wrap">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/articles" className="hover:text-primary transition-colors">
                Articles
              </Link>
              <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            {category && (
              <li className="flex items-center">
                <Link href={`/categories/${category.slug || ''}`} className="hover:text-primary transition-colors">
                  {category.name || 'Category'}
                </Link>
                <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
            )}
            <li>
              <span className="text-neutral-600">{title}</span>
            </li>
          </ol>
        </nav>

        {processingError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Some content may not display correctly. Please refresh or try again later.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <header className="p-6 pb-0">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">{title}</h1>
                {subtitle && <p className="text-xl text-neutral-600 mb-4">{subtitle}</p>}

                {/* Medical Reviewer */}
                {reviewer && (
                  <AuthorCard author={reviewer} label="Medically Reviewed by" isReviewer={true} />
                )}

                <div className="flex flex-wrap items-center justify-between text-sm text-neutral-500 mb-6">
                  <div className="flex flex-wrap items-center">
                    {author && (
                      <div className="flex items-center mr-6 mb-2">
                        <span className="font-medium">Written by {author.name || 'Author'}</span>
                        {author.credentials && <span>, {author.credentials}</span>}
                      </div>
                    )}
                    {formattedPublishedDate && (
                      <div className="mr-6 mb-2">
                        <time dateTime={published_date || ''}>Published: {formattedPublishedDate}</time>
                      </div>
                    )}
                    {formattedUpdatedDate && (
                      <div className="mb-2">
                        <time dateTime={updated_date || ''}>Updated: {formattedUpdatedDate}</time>
                      </div>
                    )}
                  </div>
                  <ShareButton title={title} url={pageUrl} />
                </div>
              </header>

              {image && (
                <div className="relative h-64 sm:h-80 md:h-96 w-full">
                  <Image
                    src={mainImageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized={mainImageUrl?.includes('cms-media') || mainImageUrl?.includes('127.0.0.1')}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&h=630";
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div className="mb-8 p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">On this page</h3>
                    <nav aria-label="Table of contents">
                      <ul className="space-y-2 text-sm">
                        {headings.map((h, idx) => (
                          <li
                            key={`${h?.text || idx}-${idx}`}
                            className={h?.level === 3 ? "ml-4" : ""}
                          >
                            <a
                              href={`#${slugify(h?.text || 'heading')}`}
                              className="text-neutral-700 hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(slugify(h?.text || 'heading'));
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                            >
                              {h?.text || 'Heading'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}

                {/* Body Content */}
                {bodyWithIds ? (
                  <div
                    className="prose prose-lg max-w-none article-content"
                    dangerouslySetInnerHTML={{ __html: bodyWithIds }}
                  />
                ) : (
                  <p className="text-neutral-600">No content available for this article.</p>
                )}

                {/* Tags */}
                {Array.isArray(tags) && tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-lg font-semibold mb-2">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Link
                          key={tag}
                          href={`/tags/${tag?.toLowerCase().replace(/\s+/g, '-') || ''}`}
                          className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm hover:bg-neutral-200 transition-colors"
                        >
                          {tag || 'Tag'}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author bio */}
                {author && author.bio && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <div className="flex items-start">
                      {author.image && (
                        <div className="flex-shrink-0 mr-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={getProxiedImageUrl(author.image)}
                              alt={author.name || 'Author'}
                              fill
                              className="object-cover"
                              unoptimized={true}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100";
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">About the Author</h3>
                        <p className="text-sm font-medium">{author.name || 'Author'}{author.credentials && `, ${author.credentials}`}</p>
                        <p className="text-sm text-neutral-600 mt-1">{author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical disclaimer */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Medical Disclaimer:</strong> The information provided in this article is for educational and
                    informational purposes only and should not be considered medical advice. Always consult with a
                    qualified healthcare provider for personalized medical advice.
                  </p>
                </div>

                {/* References Section */}
                {finalReferencesHtml && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-2xl font-bold mb-4">References</h3>
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <div
                        className="prose max-w-none text-sm references-list"
                        dangerouslySetInnerHTML={{ __html: finalReferencesHtml }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map(article => (
                    <div key={article?.id || Math.random()} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium mb-1">
                        <Link
                          href={`/articles/${article?.slug || ''}`}
                          className="text-primary hover:text-primary-light transition-colors"
                        >
                          {article?.title || 'Related Article'}
                        </Link>
                      </h4>
                      {article?.image && (
                        <div className="mb-2">
                          <img
                            src={getProxiedImageUrl(article.image)}
                            alt={article?.title || 'Article'}
                            className="w-full h-32 object-cover rounded"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500";
                            }}
                          />
                        </div>
                      )}
                      <p className="text-sm text-neutral-600 line-clamp-2">{article?.summary || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular topics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Popular Topics</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/conditions/diabetes"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Diabetes
                </Link>
                <Link
                  href="/conditions/hypertension"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Hypertension
                </Link>
                <Link
                  href="/conditions/arthritis"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Arthritis
                </Link>
                <Link
                  href="/conditions/anxiety"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Anxiety
                </Link>
                <Link
                  href="/drugs/metformin"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Metformin
                </Link>
                <Link
                  href="/drugs/lisinopril"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm text-center"
                >
                  Lisinopril
                </Link>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="bg-primary rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
              <p className="mb-4 text-white/90">
                Get the latest health news and information delivered straight to your inbox.
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 text-neutral-800 text-sm rounded border-0 focus:ring-2 focus:ring-white"
                  required
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-white text-primary text-sm font-medium rounded hover:bg-neutral-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* More From Niinfomed */}
        {(!relatedArticles || relatedArticles.length === 0) && (
          <div className="mt-12">
            <h2 className="section-title">More From Niinfomed</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ArticleCard
                article={{
                  id: 'featured-1',
                  title: 'Understanding Heart Health',
                  slug: 'understanding-heart-health',
                  summary: 'Learn about the key factors that contribute to heart health and how to maintain a healthy cardiovascular system.',
                  category: 'Cardiology',
                  created_at: new Date().toISOString(),
                }}
              />
              <ArticleCard
                article={{
                  id: 'featured-2',
                  title: 'Nutrition for Optimal Health',
                  slug: 'nutrition-for-optimal-health',
                  summary: 'Discover the essential nutrients your body needs and how to incorporate them into your daily diet.',
                  category: 'Nutrition',
                  created_at: new Date().toISOString(),
                }}
              />
              <ArticleCard
                article={{
                  id: 'featured-3',
                  title: 'Mental Wellness Strategies',
                  slug: 'mental-wellness-strategies',
                  summary: 'Practical tips and techniques for maintaining good mental health and emotional well-being.',
                  category: 'Mental Health',
                  created_at: new Date().toISOString(),
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .article-content a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .article-content a:hover {
          color: #1d4ed8;
        }
        .article-content h2 {
          scroll-margin-top: 2rem;
        }
        .article-content h3 {
          scroll-margin-top: 2rem;
        }
        .references-list a {
          word-break: break-word;
        }
      `}</style>
    </>
  );
}

// ✅ Generate static paths
export async function getStaticPaths() {
  try {
    console.log("🔍 Fetching article paths from Oracle CMS...");
    
    const paths = await fetchArticlePaths();
    
    // ✅ Safe paths formatting
    const formattedPaths = (Array.isArray(paths) ? paths : [])
      .map(slug => ({
        params: { slug: String(slug || '') }
      }))
      .filter(p => p.params.slug && p.params.slug !== '' && p.params.slug !== 'undefined');

    console.log(`✅ Generated ${formattedPaths.length} static paths for articles`);
    
    return {
      paths: formattedPaths,
      fallback: 'blocking', // 'blocking' instead of true for better SEO
    };
  } catch (error) {
    console.error('❌ Error fetching article paths:', error);
    return {
      paths: [],
      fallback: 'blocking', // Allow on-demand generation
    };
  }
}

// ✅ Get static props with error handling
export async function getStaticProps({ params, locale }) {
  // ✅ Validate params
  if (!params?.slug) {
    return { notFound: true };
  }

  try {
    console.log(`📡 Fetching article: ${params.slug} from Oracle CMS`);
    
    // ✅ Promise.all with error handling
    let article = null;
    let related = [];
    
    try {
      article = await fetchArticle(params.slug, locale || 'en');
    } catch (articleErr) {
      console.error(`Error fetching article ${params.slug}:`, articleErr);
      article = null;
    }
    
    try {
      related = await fetchRelatedArticles(params.slug, 3);
    } catch (relatedErr) {
      console.error(`Error fetching related articles:`, relatedErr);
      related = [];
    }

    // ✅ If no article found, return 404
    if (!article || Object.keys(article).length === 0) {
      console.warn(`Article not found for slug: ${params.slug}`);
      return { 
        notFound: true,
        revalidate: 60 
      };
    }

    return {
      props: {
        article: article || null,
        relatedArticles: Array.isArray(related) ? related : [],
        error: null
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`❌ Critical error fetching article ${params.slug}:`, error);
    
    // ✅ Return error state instead of throwing
    return {
      props: {
        article: null,
        relatedArticles: [],
        error: 'Failed to load article. Please try again later.'
      },
      revalidate: 60, // Try again after 1 minute
    };
  }
}