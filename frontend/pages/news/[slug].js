// pages/news/[slug].js
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Head from "next/head";

import ShareButton from "../../components/ShareButton";
import CookieConsent from "../../components/CookieConsent";
import CommentSection from "../../components/CommentSection";
<<<<<<< HEAD
=======
import ImageWithFallback from "../../components/ImageWithFallback";
>>>>>>> 2ee6acc (update)
import {
  fetchNewsBySlug,
  fetchRelatedNews,
  getProxiedImageUrl,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  extractHeadings,
  slugify,
  addHeadingIds,
  getSafeCMSUrl,
  fixMediaUrls,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo,
  tryEndpoints
} from "../../utils/api";
<<<<<<< HEAD

/* =========================================================
   ✅ Date Display Functions (using shared utilities)
========================================================= */
=======
>>>>>>> 2ee6acc (update)

/* =========================================================
   ✅ Author/Reviewer Helper Functions
========================================================= */
const getAuthorDisplayName = (author) => {
  if (!author) return "Niinfomed Staff";
  return author.name || "Niinfomed Staff";
};

const getAuthorSlug = (author) => {
  if (!author) return null;
  if (author.slug) return author.slug;
  if (author.name) {
    return author.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

const getReviewerDisplayName = (reviewer) => {
  if (!reviewer) return null;
  return reviewer.name || null;
};

const getReviewerSlug = (reviewer) => {
  if (!reviewer) return null;
  if (reviewer.slug) return reviewer.slug;
  if (reviewer.name) {
    return reviewer.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

/* =========================================================
   ✅ REFERENCE SECTION HELPER FUNCTIONS
========================================================= */
const formatReferences = (referencesHtml) => {
  if (!referencesHtml) return "";
  
  // Add custom classes for citation styling
  let formatted = referencesHtml
    .replace(/<ul>/g, '<ul class="space-y-2 list-disc pl-5 mb-2">')
    .replace(/<ol>/g, '<ol class="space-y-2 list-decimal pl-5 mb-2">')
    .replace(/<li>/g, '<li class="text-gray-700 text-sm mb-1 leading-relaxed">')
    .replace(/<p>/g, '<p class="mb-2 text-sm text-gray-700 leading-relaxed">')
    .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline break-words font-medium" target="_blank" rel="noopener noreferrer" ');
  
  return formatted;
};

const extractReferenceCount = (referencesHtml) => {
  if (!referencesHtml) return 0;
  
  const listItems = referencesHtml.match(/<li>/g)?.length || 0;
  const paragraphs = referencesHtml.match(/<p>/g)?.length || 0;
  
  return Math.max(listItems, paragraphs);
};

/* =========================================================
   ✅ Skeleton Loader Component with References
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl mb-6"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      {/* References skeleton */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="bg-gray-100 p-6 rounded-r-2xl">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   ✅ Date Functions
========================================================= */

const createFallbackDates = () => {
  const now = new Date();
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 2);
  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 1);
  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 1);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true
  };
};

const extractDatesFromArticle = (article) => {
  if (!article) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  const dateFieldGroups = {
    published: [
      'publish_date', 'first_published_at', 'first_published_date', 
      'published_date', 'published_at', 'publication_date', 'created_at',
      'created_date', 'date_published', 'date'
    ],
    updated: [
      'updated_at', 'updated_date', 'last_published_at', 'last_published_date',
      'modified_at', 'modified_date', 'last_updated', 'last_modified', 'update_date'
    ],
    reviewed: [
      'last_reviewed', 'last_reviewed_date', 'reviewed_at',
      'review_date', 'medical_review_date'
    ]
  };

  const findDateFromFields = (fields) => {
    for (const field of fields) {
      if (article[field]) {
        const date = parseDateSafe(article[field]);
        if (date) return date;
      }
    }
    return null;
  };

  const publishedDate = findDateFromFields(dateFieldGroups.published);
  const updatedDate = findDateFromFields(dateFieldGroups.updated);
  const lastReviewedDate = findDateFromFields(dateFieldGroups.reviewed);

  if (!publishedDate && !updatedDate && !lastReviewedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  const finalPublishedDate = publishedDate || updatedDate || lastReviewedDate;
  const finalUpdatedDate = updatedDate || publishedDate || lastReviewedDate;
  const finalReviewedDate = lastReviewedDate || updatedDate || publishedDate;

  return {
    publishedDate: finalPublishedDate,
    updatedDate: finalUpdatedDate,
    lastReviewedDate: finalReviewedDate,
    isFallback: false
  };
};

const isContentUpdated = (publishedDate, updatedDate) => {
  if (!publishedDate || !updatedDate) return false;

  try {
    if (publishedDate.getTime() === updatedDate.getTime()) return false;
    
    const diffTime = Math.abs(updatedDate - publishedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0;
  } catch (error) {
    return false;
  }
};

/* =========================================================
   ✅ DateDisplay Component
========================================================= */

const DateDisplay = ({
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback = false,
  compact = false,
  className = ""
}) => {
  const isUpdated = isContentUpdated(publishedDate, updatedDate);

  if (compact) {
    return (
      <div 
        className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${className}`}
        aria-label="Publication dates"
      >
        <svg 
          className="w-4 h-4 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>

        <span className="font-medium">Published:</span>
        <time 
          dateTime={publishedDate?.toISOString() || ''}
          className="whitespace-nowrap"
        >
          {formatDateDisplay(publishedDate)}
        </time>

        {isUpdated && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"
            aria-label="This article has been updated"
          >
            Updated
          </span>
        )}

        {isFallback && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            aria-label="Estimated dates based on publication timeline"
          >
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Article timeline">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Published Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Publication information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Published</h4>
              <p className="text-xs text-gray-500">Original publication date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(publishedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(publishedDate)}
            </span>
          </div>
        </div>

        {/* Updated Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Update information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`w-10 h-10 rounded-full ${isUpdated ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}
              aria-hidden="true"
            >
              <svg 
                className={`w-5 h-5 ${isUpdated ? 'text-green-600' : 'text-gray-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {isUpdated ? 'Updated' : 'Last Updated'}
              </h4>
              <p className="text-xs text-gray-500">
                {isUpdated ? 'Most recent update' : 'Last modification'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(updatedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(updatedDate)}
            </span>
          </div>
        </div>

        {/* Reviewed Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Medical review information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Medically Reviewed</h4>
              <p className="text-xs text-gray-500">Last medical review date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={lastReviewedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(lastReviewedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(lastReviewedDate)}
            </span>
          </div>
        </div>
      </div>

      {isFallback && (
        <div 
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          role="alert"
          aria-label="Estimated dates notice"
        >
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-yellow-800 mb-1">Estimated Dates</h5>
              <p className="text-sm text-yellow-700">
                This article was recently added to our database. The dates shown are estimated
                based on typical publication timelines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function NewsArticle({ 
  article: initialArticle, 
  relatedArticles: initialRelated,
  processedBody: initialProcessedBody,
  processedReferences: initialProcessedReferences,
  headings: initialHeadings,
  mainImageUrl: initialMainImageUrl,
  error
}) {
  const router = useRouter();

  const [pageArticle, setPageArticle] = useState(initialArticle);
  const [relatedArticles, setRelatedArticles] = useState(initialRelated || []);
  const [loading, setLoading] = useState(!initialArticle);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [referencesExpanded, setReferencesExpanded] = useState(true);

  const [finalBodyHtml, setFinalBodyHtml] = useState(initialProcessedBody || "");
  const [finalReferencesHtml, setFinalReferencesHtml] = useState(initialProcessedReferences || "");
  const [headings, setHeadings] = useState(initialHeadings || []);

  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromArticle(pageArticle),
    [pageArticle]
  );

  /* ✅ Get raw content */
  const rawBody = useMemo(
    () => fixMediaUrls(pageArticle?.body || ""),
    [pageArticle?.body]
  );

  const rawReferences = useMemo(
    () => fixMediaUrls(pageArticle?.references || ""),
    [pageArticle?.references]
  );

  /* ✅ Calculate reference count */
  const referenceCount = useMemo(
    () => extractReferenceCount(pageArticle?.references || ""),
    [pageArticle?.references]
  );

  /* =========================================================
     ✅ PARALLEL PROCESSING: Combine all async operations
  ========================================================= */
  useEffect(() => {
    if (initialProcessedBody && initialProcessedReferences) {
      setContentLoaded(true);
      return;
    }

    let mounted = true;

    const processAllContent = async () => {
      try {
        const [processedBody, processedReferences] = await Promise.all([
          (async () => {
            const replaced = await replaceEmbedImages(rawBody, safeCMS);
            return await fixWagtailInternalLinks(replaced, safeCMS);
          })(),
          
          (async () => {
            const fixed = await fixWagtailInternalLinks(rawReferences, safeCMS);
            return formatReferences(fixed);
          })()
        ]);

        if (mounted) {
          const extractedHeadings = extractHeadings(processedBody);
          const bodyWithIds = addHeadingIds(processedBody, extractedHeadings);
          
          setFinalBodyHtml(bodyWithIds);
          setFinalReferencesHtml(processedReferences);
          setHeadings(extractedHeadings);
          setContentLoaded(true);
        }
      } catch (error) {
        console.error("Error processing content:", error);
        if (mounted) {
          setFinalBodyHtml(rawBody);
          setFinalReferencesHtml(formatReferences(rawReferences));
          setContentLoaded(true);
        }
      }
    };

    if (rawBody || rawReferences) {
      processAllContent();
    }

    return () => {
      mounted = false;
    };
  }, [rawBody, rawReferences, safeCMS, initialProcessedBody, initialProcessedReferences]);

  /* ✅ Mark content as loaded when hero image loads */
  useEffect(() => {
    if (!pageArticle?.image) {
      setHeroImageLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = initialMainImageUrl || getProxiedImageUrl(pageArticle.image);
      imageLoader.src = imageUrl;
      imageLoader.onload = () => {
        setHeroImageLoaded(true);
      };
      imageLoader.onerror = () => {
        setHeroImageLoaded(true);
      };
    } else {
      setHeroImageLoaded(true);
    }
  }, [pageArticle?.image, initialMainImageUrl]);

  /* ✅ Fetch article if not provided via props */
  useEffect(() => {
    if (!initialArticle && router.query.slug) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const articleData = await fetchNewsBySlug(router.query.slug);
          
          if (articleData) {
            setPageArticle(articleData);
            
            // Fetch related articles
            const related = await fetchRelatedNews(router.query.slug, 6);
            setRelatedArticles(related.filter(v => v.slug !== router.query.slug).slice(0, 3));
          } else {
            throw new Error("Article not found");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [router.query.slug, initialArticle]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-800 mb-3">
            Error Loading News Article
          </h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Browse All News Articles
          </Link>
        </div>
      </div>
    );
  }

  if (router.isFallback || loading) {
    return <SkeletonLoader />;
  }

  if (!pageArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            News Article Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This news article does not exist or may have been removed.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All News Articles
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data
  const authorDisplayName = getAuthorDisplayName(pageArticle.author);
  const authorSlug = getAuthorSlug(pageArticle.author);
  const reviewerDisplayName = getReviewerDisplayName(pageArticle.reviewer);
  const reviewerSlug = getReviewerSlug(pageArticle.reviewer);
  const sourceName = pageArticle.source || "Niinfomed News";

  const fallbackImage =
    "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&h=630&q=75";

  const mainImageUrl = initialMainImageUrl || getProxiedImageUrl(pageArticle.image) || fallbackImage;

  // SEO
  const pageTitle = `${pageArticle.title} - Niinfomed News`;
  const pageDescription =
    pageArticle.subtitle || pageArticle.summary || pageArticle.title;

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || "https://niinfomed.com"}${router.asPath}`;

  // Critical CSS for LCP
  const criticalCSS = `
    .hero-container {
      content-visibility: auto;
      contain-intrinsic-size: 400px;
    }
    .above-fold {
      content-visibility: auto;
    }
    .reference-section {
      content-visibility: auto;
      contain-intrinsic-size: 200px;
    }
  `;

  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        <link 
          rel="preload" 
          as="image" 
          href={mainImageUrl} 
          fetchPriority="high"
        />
        
        <link rel="preconnect" href="https://images.unsplash.com" />
        {mainImageUrl.includes('api.niinfomed.com') && (
          <link rel="preconnect" href="https://api.niinfomed.com" />
        )}
        
        {/* Schema.org markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": pageArticle.title,
              "description": pageDescription,
              "image": mainImageUrl,
              "datePublished": publishedDate?.toISOString() || new Date().toISOString(),
              "dateModified": updatedDate?.toISOString() || publishedDate?.toISOString() || new Date().toISOString(),
              "author": {
                "@type": "Person",
                "name": authorDisplayName
              },
              "publisher": {
                "@type": "Organization",
                "name": "Niinfomed",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://niinfomed.com/logo.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": pageUrl
              }
            })
          }}
        />
      </Head>

      <CookieConsent />

      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          url: pageUrl,
          title: pageArticle.title,
          description: pageDescription,
          images: [
            {
              url: mainImageUrl,
              width: 1200,
              height: 630,
              alt: pageArticle.title,
            },
          ],
          siteName: "Niinfomed",
          type: "article",
          article: {
            publishedTime: publishedDate?.toISOString(),
            modifiedTime: updatedDate?.toISOString(),
            authors: authorDisplayName ? [authorDisplayName] : [],
            tags: ["news", "health", pageArticle.category?.name].filter(Boolean),
          },
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 above-fold" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/news" className="hover:text-gray-800 transition-colors">
            News
          </Link>
          {pageArticle.category?.name && (
            <>
              <span className="mx-2" aria-hidden="true">/</span>
              <Link 
                href={`/news/categories/${pageArticle.category.slug}`}
                className="hover:text-gray-800 transition-colors"
              >
                {pageArticle.category.name}
              </Link>
            </>
          )}
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-700 font-medium" aria-current="page">
            {pageArticle.title}
          </span>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Content */}
            <article className="above-fold">
              {/* Hero Image */}
              <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
                <ImageWithFallback
                  src={mainImageUrl}
                  alt={pageArticle.title}
                  className="w-full h-full object-cover"
                  width={1200}
                  height={630}
                  priority={true}
                  fallbackSrc={fallbackImage}
                />
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                {pageArticle.title}
              </h1>

              {/* Subtitle */}
              {pageArticle.subtitle && (
                <p className="text-xl text-gray-600 mb-4">
                  {pageArticle.subtitle}
                </p>
              )}

              {/* Source Display */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-500">Source:</span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {sourceName}
                </span>
                
                {/* Compact Date Display */}
                <div className="ml-auto hidden sm:block">
                  <DateDisplay
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                    lastReviewedDate={lastReviewedDate}
                    isFallback={isFallback}
                    compact={true}
                  />
                </div>
              </div>

              {/* Mobile Compact Date Display */}
              <div className="sm:hidden mb-4">
                <DateDisplay
                  publishedDate={publishedDate}
                  updatedDate={updatedDate}
                  lastReviewedDate={lastReviewedDate}
                  isFallback={isFallback}
                  compact={true}
                />
              </div>

              {/* Author / Reviewer */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {authorDisplayName && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Written by:</span>
                    {authorSlug ? (
                      <Link
                        href={`/authors/${authorSlug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {authorDisplayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {authorDisplayName}
                      </span>
                    )}
                  </div>
                )}

                {reviewerDisplayName && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Reviewed by:</span>
                    {reviewerSlug ? (
                      <Link
                        href={`/reviewers/${reviewerSlug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {reviewerDisplayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {reviewerDisplayName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Share Button */}
              <div className="mb-6">
                <ShareButton title={pageArticle.title} url={pageUrl} />
              </div>

              {/* Summary */}
              {pageArticle.summary && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {pageArticle.summary}
                  </p>
                </div>
              )}

              {/* Table of Contents */}
              {headings.length > 0 && heroImageLoaded && (
                <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold mb-3">On this page</h3>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-2 text-sm">
                      {headings.map((h, idx) => (
                        <li
                          key={`${h.text}-${idx}`}
                          className={h.level === 3 ? "ml-4" : ""}
                        >
                          <a
                            href={`#${slugify(h.text)}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(slugify(h.text))?.scrollIntoView({
                                behavior: 'smooth'
                              });
                            }}
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Body Content */}
              {contentLoaded && pageArticle.body && (
                <div className="mb-12">
                  <div
                    className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: finalBodyHtml }}
                  />
                </div>
              )}

              {/* Timeline Section */}
              <div className="mb-12">
                <DateDisplay
                  publishedDate={publishedDate}
                  updatedDate={updatedDate}
                  lastReviewedDate={lastReviewedDate}
                  isFallback={isFallback}
                />
              </div>

              {/* ✅ ENHANCED REFERENCES SECTION */}
              {contentLoaded && pageArticle.references && (
                <div className="mt-10 pt-8 border-t border-gray-200 reference-section" id="references">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        📚 References & Sources
                      </h2>
                      {referenceCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                          {referenceCount} {referenceCount === 1 ? 'source' : 'sources'}
                        </span>
                      )}
                    </div>
                    
                    {/* Collapsible toggle */}
                    <button
                      onClick={() => setReferencesExpanded(!referencesExpanded)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                      aria-expanded={referencesExpanded}
                    >
                      {referencesExpanded ? (
                        <>
                          <span>Collapse</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Expand</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {referencesExpanded && (
                    <div className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-blue-500 p-6 rounded-r-2xl shadow-sm">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: finalReferencesHtml,
                        }}
                      />
                      
                      {/* Citation style note */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-start gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>Note:</strong> These references have been reviewed by our medical team for accuracy and relevance. 
                          Sources are cited in accordance with scientific citation standards.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Medical Disclaimer */}
              <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    <strong>Medical Disclaimer:</strong> The information provided
                    in this news article is for educational and informational
                    purposes only and should not be considered medical advice.
                    Always consult with a qualified healthcare provider for
                    personalized medical advice.
                  </p>
                </div>
              </div>

              {/* Comments */}
              {contentLoaded && (
                <CommentSection
                  contentType="news"
                  contentSlug={pageArticle.slug}
                  pageTitle={pageArticle.title}
                />
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-3">On this page</h3>
                    <nav aria-label="Table of contents">
                      <ul className="space-y-2 text-sm">
                        {headings.map((h, idx) => (
                          <li
                            key={`${h.text}-${idx}`}
                            className={h.level === 3 ? "ml-4" : ""}
                          >
                            <button
                              onClick={() => {
                                document.getElementById(slugify(h.text))?.scrollIntoView({
                                  behavior: 'smooth'
                                });
                              }}
                              className="text-gray-700 hover:text-blue-600 hover:underline text-left w-full"
                            >
                              {h.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}

                {/* Related News */}
                {relatedArticles?.length > 0 && contentLoaded && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                    <h3 className="text-lg font-bold mb-4">Related News</h3>
                    <div className="space-y-4">
                      {relatedArticles.slice(0, 5).map((related) => {
                        const relatedImage =
                          getProxiedImageUrl(related.image) || fallbackImage;

                        return (
                          <Link
                            key={related.id || related.slug}
                            href={`/news/${related.slug}`}
                            className="block group"
                            prefetch={false}
                          >
                            <div className="flex gap-3 items-start">
                              <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <ImageWithFallback
                                  src={relatedImage}
                                  alt={related.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  width={80}
                                  height={64}
                                  fallbackSrc={fallbackImage}
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                  {related.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {formatDateDisplay(
                                    related.publish_date || related.created_at
                                  )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Reference quick link widget */}
                {pageArticle.references && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="text-lg font-bold">Sources</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      This article cites <span className="font-semibold text-blue-600">{referenceCount}</span> scientific {referenceCount === 1 ? 'source' : 'sources'}.
                    </p>
                    <a
                      href="#references"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium group"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('references')?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }}
                    >
                      Jump to references
                      <svg className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Mobile Related Articles */}
          {relatedArticles?.length > 0 && contentLoaded && (
            <div className="mt-12 lg:hidden">
              <h2 className="text-2xl font-bold mb-6">Related News</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedArticles.slice(0, 4).map((related) => {
                  const relatedImage =
                    getProxiedImageUrl(related.image) || fallbackImage;

                  return (
                    <Link
                      key={related.id || related.slug}
                      href={`/news/${related.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      prefetch={false}
                    >
                      <div className="h-48 w-full overflow-hidden">
                        <ImageWithFallback
                          src={relatedImage}
                          alt={related.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          width={400}
                          height={240}
<<<<<<< HEAD
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                          }}
=======
                          fallbackSrc={fallbackImage}
>>>>>>> 2ee6acc (update)
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDateDisplay(
                            related.publish_date || related.created_at
                          )}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .prose a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      `}</style>
    </>
  );
}

/* =========================================================
   STATIC GENERATION
========================================================= */
export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const response = await fetch(`${baseUrl}/api/news/`);
    const data = await response.json();
    
    const articles = data.results || data.items || data;
    
    const paths = articles
      .filter(article => article && article.slug)
      .map((article) => ({
        params: { slug: article.slug },
      }));

    console.log(`✅ Found ${paths.length} news paths`);
    return { 
      paths, 
      fallback: "blocking" 
    };
  } catch (error) {
    console.error("Error fetching news paths:", error);
    return { 
      paths: [], 
      fallback: "blocking" 
    };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const start = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    const slug = params.slug;
    
    console.log(`📡 Fetching news article: ${slug} from Oracle CMS`);
    
    const [article, related] = await Promise.allSettled([
      fetchNewsBySlug(slug, locale || 'en'),
      fetchRelatedNews(slug, 6)
    ]);

    if (article.status === 'rejected' || !article.value) {
      console.warn(`Article not found for slug: ${slug}`);
      return { 
        notFound: true, 
        revalidate: 60 
      };
    }

    const safeCMS = baseUrl;
    
    let processedBody = "";
    let processedReferences = "";
    let headings = [];
    
    if (article.value.body) {
      const fixedMedia = fixMediaUrls(article.value.body || "");
      const replaced = await replaceEmbedImages(fixedMedia, safeCMS);
      const linked = await fixWagtailInternalLinks(replaced, safeCMS);
      headings = extractHeadings(linked);
      processedBody = addHeadingIds(linked, headings);
    }
    
    if (article.value.references) {
      const fixedRefs = fixMediaUrls(article.value.references || "");
      const linked = await fixWagtailInternalLinks(fixedRefs, safeCMS);
      processedReferences = formatReferences(linked);
    }
    
    const mainImageUrl = getProxiedImageUrl(article.value.image);
    
    const relatedArticles = related.status === 'fulfilled' 
      ? related.value.filter(v => v.slug !== slug).slice(0, 3)
      : [];
    
    console.log(`✅ Generated news article ${slug} in ${Date.now() - start}ms`);
    
    return {
      props: { 
        article: article.value,
        relatedArticles,
        processedBody,
        processedReferences,
        headings,
        mainImageUrl
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching news article ${params.slug}:`, error);
    return { 
      props: {
        error: 'Failed to load news article. Please try again later.',
        article: null,
        relatedArticles: [],
        processedBody: '',
        processedReferences: '',
        headings: [],
        mainImageUrl: ''
      },
      revalidate: 60 
    };
  }
}
