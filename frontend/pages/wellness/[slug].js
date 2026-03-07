// pages/wellness/[slug].js
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import {
  fetchWellnessTopic,
  fetchWellnessTopics,
  getProxiedImageUrl,
  getSafeCMSUrl,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  extractHeadings,
  slugify,
  addHeadingIds,
  fixMediaUrls,
  tryEndpoints
} from "../../utils/api";
import SEO from "../../components/SEO";
import CommentSection from "../../components/CommentSection";
import ReferencesSection from "../../components/ReferencesSection";

/* =========================================================
   ✅ Image Component with Fallback
========================================================= */

const ImageWithFallback = ({ src, alt, className, width, height, priority = false, ...props }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(getProxiedImageUrl(src));

  useEffect(() => {
    setImageSrc(getProxiedImageUrl(src));
    setError(false);
  }, [src]);

  if (error || !imageSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || "Wellness image"}
      className={className}
      width={width}
      height={height}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...props}
    />
  );
};

/* =========================================================
   ✅ Date Functions
========================================================= */

const createFallbackDates = () => {
  const now = new Date();
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 60);
  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 30);
  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 45);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true
  };
};

const extractDatesFromTopic = (topic) => {
  if (!topic) {
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
      'first_published_at', 'first_published_date', 'published_date',
      'publish_date', 'published_at', 'publication_date', 'created_at',
      'created_date', 'date_published', 'date'
    ],
    updated: [
      'last_published_at', 'last_published_date', 'updated_at',
      'updated_date', 'modified_at', 'modified_date', 'last_updated',
      'last_modified', 'update_date'
    ],
    reviewed: [
      'last_reviewed', 'last_reviewed_date', 'reviewed_at',
      'review_date', 'medical_review_date'
    ]
  };

  const findDateFromFields = (fields) => {
    for (const field of fields) {
      if (topic[field]) {
        const date = parseDateSafe(topic[field]);
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
    
    return diffDays > 7;
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
            aria-label="This information has been updated"
          >
            Updated
          </span>
        )}

        {isFallback && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            aria-label="Estimated dates based on typical publication timelines"
          >
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Information timeline">
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
              <h4 className="font-semibold text-gray-900">Information Published</h4>
              <p className="text-xs text-gray-500">When this information was first published</p>
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
                This information was recently added to our database. The dates shown are estimated
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
   ✅ Table of Contents Component
========================================================= */

const TableOfContents = ({ headings = [] }) => {
  if (!headings.length) return null;

  const scrollToHeading = useCallback((id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 90;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
      <h3 className="text-lg font-bold mb-3">On this page</h3>
      <nav aria-label="Table of contents">
        <ul className="space-y-2 text-sm">
          {headings.map((h, idx) => (
            <li
              key={`${h.text}-${idx}`}
              className={h.level === 3 ? "ml-4" : ""}
            >
              <button
                onClick={() => scrollToHeading(h.id)}
                className="text-gray-700 hover:text-blue-600 hover:underline text-left w-full transition-colors"
                aria-label={`Scroll to ${h.text}`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

/* =========================================================
   ✅ Content Metadata Component
========================================================= */

const ContentMetadata = ({ 
  category, 
  difficultyLevel, 
  readingTime,
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {category && (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {category.name}
        </span>
      )}
      
      {difficultyLevel && (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {difficultyLevel}
        </span>
      )}
      
      {readingTime && (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readingTime} min read
        </span>
      )}
      
      <DateDisplay 
        publishedDate={publishedDate}
        updatedDate={updatedDate}
        lastReviewedDate={lastReviewedDate}
        isFallback={isFallback}
        compact={true}
        className="bg-gray-100 px-3 py-1.5 rounded-full"
      />
    </div>
  );
};

/* =========================================================
   ✅ HELPER FUNCTIONS
========================================================= */

const getAuthorDisplayName = (topic) => {
  return topic.author?.name || topic.author_name || "Niinfomed Staff";
};

const getAuthorSlug = (topic) => {
  if (topic.author?.slug) return topic.author.slug;
  if (topic.author?.name) {
    return topic.author.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

const getReviewerDisplayName = (topic) => {
  return topic.reviewer?.name || topic.reviewer_name || null;
};

const getReviewerSlug = (topic) => {
  if (topic.reviewer?.slug) return topic.reviewer.slug;
  if (topic.reviewer?.name) {
    return topic.reviewer.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

/* =========================================================
   ✅ PROCESS HTML CONTENT
========================================================= */

const processHtmlContent = async (html, safeBaseUrl) => {
  try {
    if (!html) return html;
    
    let processedHtml = html;
    
    // 1. Fix media URLs
    processedHtml = fixMediaUrls(processedHtml);
    
    // 2. Replace embed images
    processedHtml = await replaceEmbedImages(processedHtml, safeBaseUrl);
    
    // 3. Fix Wagtail internal links
    processedHtml = await fixWagtailInternalLinks(processedHtml, safeBaseUrl);
    
    return processedHtml;
  } catch (error) {
    console.error("Error processing HTML content:", error);
    return html;
  }
};

/* =========================================================
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="h-64 bg-gray-200 rounded mb-8"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */

export default function WellnessDetail({ 
  topic: initialTopic, 
  relatedTopics: initialRelated,
  processedBody: initialProcessedBody,
  processedReferences: initialProcessedReferences,
  processedBenefits: initialProcessedBenefits,
  processedTips: initialProcessedTips,
  mainImageUrl: initialMainImageUrl,
  error
}) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [relatedTopics, setRelatedTopics] = useState(initialRelated || []);
  const [loading, setLoading] = useState(!initialTopic);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  const [processedBody, setProcessedBody] = useState(initialProcessedBody || "");
  const [processedReferences, setProcessedReferences] = useState(initialProcessedReferences || "");
  const [processedBenefits, setProcessedBenefits] = useState(initialProcessedBenefits || "");
  const [processedTips, setProcessedTips] = useState(initialProcessedTips || "");

  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromTopic(topic),
    [topic]
  );

  const headings = useMemo(
    () => extractHeadings(processedBody),
    [processedBody]
  );

  const bodyWithIds = useMemo(
    () => addHeadingIds(processedBody, headings),
    [processedBody, headings]
  );

  // Process content client-side if not provided
  useEffect(() => {
    if (initialProcessedBody && initialProcessedReferences && 
        initialProcessedBenefits && initialProcessedTips) {
      setContentLoaded(true);
      return;
    }

    let mounted = true;

    const processAllContent = async () => {
      if (!topic) return;

      try {
        const sections = [
          { key: 'body', content: topic.body, setter: setProcessedBody },
          { key: 'references', content: topic.references, setter: setProcessedReferences },
          { key: 'benefits', content: topic.benefits, setter: setProcessedBenefits },
          { key: 'tips', content: topic.tips, setter: setProcessedTips }
        ];

        const results = await Promise.allSettled(
          sections.map(async ({ key, content }) => {
            if (content) {
              try {
                const processed = await processHtmlContent(content, safeCMS);
                return { key, content: processed };
              } catch (error) {
                console.error(`Error processing ${key}:`, error);
                return { key, content: fixMediaUrls(content || "") };
              }
            }
            return { key, content: "" };
          })
        );

        if (mounted) {
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              const { key, content } = result.value;
              const setter = sections.find(s => s.key === key)?.setter;
              if (setter) setter(content);
            }
          });
          setContentLoaded(true);
        }
      } catch (err) {
        console.error("Error processing content:", err);
        if (mounted) {
          if (topic.body) setProcessedBody(fixMediaUrls(topic.body));
          setContentLoaded(true);
        }
      }
    };

    if (topic) {
      processAllContent();
    }

    return () => {
      mounted = false;
    };
  }, [topic, safeCMS, initialProcessedBody, initialProcessedReferences, initialProcessedBenefits, initialProcessedTips, processedBody]);

  // Fetch topic if not provided
  useEffect(() => {
    if (!initialTopic && router.query.slug) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const topicData = await fetchWellnessTopic(router.query.slug);
          
          if (topicData) {
            setTopic(topicData);
            
            // Fetch related topics
            const topicsList = await fetchWellnessTopics(6);
            setRelatedTopics(topicsList.filter(t => t.slug !== router.query.slug).slice(0, 3));
          } else {
            throw new Error("Topic not found");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [router.query.slug, initialTopic]);

  // Mark content as loaded when hero image loads
  useEffect(() => {
    if (!topic?.image) {
      setHeroImageLoaded(true);
      setContentLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = getProxiedImageUrl(topic.image);
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
  }, [topic?.image]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-800 mb-3">Error Loading Wellness Topic</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/wellness"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Browse All Wellness Topics
          </Link>
        </div>
      </div>
    );
  }

  if (router.isFallback || loading) {
    return <SkeletonLoader />;
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">Wellness Topic Not Found</h1>
          <p className="text-yellow-700 mb-6">
            This wellness topic does not exist or may have been removed.
          </p>
          <Link
            href="/wellness"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Wellness Topics
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&h=630&q=75";
  const mainImageUrl = initialMainImageUrl || getProxiedImageUrl(topic.image) || fallbackImage;

  const authorDisplayName = getAuthorDisplayName(topic);
  const authorSlug = getAuthorSlug(topic);
  const reviewerDisplayName = getReviewerDisplayName(topic);
  const reviewerSlug = getReviewerSlug(topic);

  // SEO
  const pageTitle = `${topic.title} - Wellness - Niinfomed`;
  const pageDescription = topic.summary?.substring(0, 160) || topic.title;
  const pageUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://niinfomed.com/wellness/${topic.slug}`;

  // Critical CSS for LCP
  const criticalCSS = `
    .hero-container {
      content-visibility: auto;
      contain-intrinsic-size: 400px;
    }
    .above-fold {
      content-visibility: auto;
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
      </Head>

      <SEO
        title={pageTitle}
        description={pageDescription}
        image={mainImageUrl}
        url={pageUrl}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: publishedDate?.toISOString(),
            modifiedTime: updatedDate?.toISOString(),
            authors: authorDisplayName ? [authorDisplayName] : [],
            tags: ['wellness', 'health', 'lifestyle', topic.category?.name].filter(Boolean),
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
          <Link href="/wellness" className="hover:text-gray-800 transition-colors">
            Wellness
          </Link>
          {topic.category?.name && (
            <>
              <span className="mx-2" aria-hidden="true">/</span>
              <Link 
                href={`/wellness/categories/${topic.category.slug}`}
                className="hover:text-gray-800 transition-colors"
              >
                {topic.category.name}
              </Link>
            </>
          )}
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-700 font-medium" aria-current="page">
            {topic.title}
          </span>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Content */}
            <article className="above-fold">
              {/* Hero Image */}
              {topic.image && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
                  <ImageWithFallback
                    src={mainImageUrl}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={630}
                    priority={true}
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                {topic.title}
              </h1>

              {/* Subtitle */}
              {topic.subtitle && (
                <p className="text-xl text-gray-600 mb-4">
                  {topic.subtitle}
                </p>
              )}

              {/* Content Metadata */}
              <ContentMetadata 
                category={topic.category}
                difficultyLevel={topic.difficulty_level}
                readingTime={topic.reading_time}
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
              />

              {/* Author / Reviewer */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {authorDisplayName && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Author:</span>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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

              {/* Detailed Date Display */}
              <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Article Timeline
                </h3>
                <DateDisplay 
                  publishedDate={publishedDate}
                  updatedDate={updatedDate}
                  lastReviewedDate={lastReviewedDate}
                  isFallback={isFallback}
                />
              </div>

              {/* Summary */}
              {topic.summary && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>
              )}

              {/* Table of Contents */}
              {contentLoaded && headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}

              {/* Body Content */}
              {contentLoaded && bodyWithIds && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">About {topic.title}</h2>

                  <div
                    className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{
                      __html: bodyWithIds,
                    }}
                  />
                </div>
              )}

              {/* Additional Content Sections */}
              {contentLoaded && processedBenefits && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-green-800">Benefits</h3>
                  <div
                    className="prose prose-green max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: processedBenefits,
                    }}
                  />
                </div>
              )}

              {contentLoaded && processedTips && (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-yellow-800">Tips & Recommendations</h3>
                  <div
                    className="prose prose-yellow max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: processedTips,
                    }}
                  />
                </div>
              )}

              {/* References Section */}
              {contentLoaded && processedReferences && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold mb-4">References</h3>
                  <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: processedReferences,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Comments - Load last */}
              {contentLoaded && (
                <CommentSection
                  contentType="wellness"
                  contentSlug={topic.slug}
                  pageTitle={topic.title}
                />
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Article Info Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Article Info</h3>
                  
                  <div className="space-y-4">
                    {/* Dates */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Dates</h4>
                      <DateDisplay 
                        publishedDate={publishedDate}
                        updatedDate={updatedDate}
                        lastReviewedDate={lastReviewedDate}
                        isFallback={isFallback}
                        compact={true}
                      />
                    </div>
                    
                    {/* Stats */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Content Info</h4>
                      {topic.difficulty_level && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="font-medium">{topic.difficulty_level}</span>
                        </div>
                      )}
                      {topic.reading_time && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="font-medium">{topic.reading_time} minutes</span>
                        </div>
                      )}
                      {topic.category && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{topic.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {relatedTopics?.length > 0 && contentLoaded && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                    <h3 className="text-lg font-bold mb-4">Related Topics</h3>
                    <div className="space-y-4">
                      {relatedTopics.slice(0, 3).map((item) => (
                        <Link
                          key={item.id || item.slug}
                          href={`/wellness/${item.slug}`}
                          className="block group"
                          prefetch={false}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                width={80}
                                height={64}
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) || "Learn more about wellness"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Mobile Related Topics */}
          {relatedTopics?.length > 0 && contentLoaded && (
            <div className="mt-12 lg:hidden">
              <h2 className="text-2xl font-bold mb-6">Related Wellness Topics</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTopics.slice(0, 3).map((item) => (
                  <Link
                    key={item.id || item.slug}
                    href={`/wellness/${item.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    prefetch={false}
                  >
                    <div className="h-48 w-full overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={240}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
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
   ✅ STATIC GENERATION
========================================================= */

export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const response = await fetch(`${baseUrl}/api/wellness/topics/`);
    const data = await response.json();
    
    const topics = data.results || data.items || data;
    
    const paths = topics
      .filter(t => t && t.slug)
      .map((t) => ({
        params: { slug: t.slug },
      }));

    console.log(`✅ Generated ${paths.length} wellness paths`);
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error fetching wellness paths:", error.message);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const start = Date.now();
    const slug = params.slug;
    
    console.log(`📡 Fetching wellness topic: ${slug} from Oracle CMS`);

    const [topic, topicsList] = await Promise.allSettled([
      fetchWellnessTopic(slug),
      fetchWellnessTopics(6)
    ]);

    if (topic.status === 'rejected' || !topic.value) {
      console.log(`❌ Wellness topic not found: ${slug}`);
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    const relatedTopics = topicsList.status === 'fulfilled'
      ? topicsList.value.filter((t) => t.slug !== slug).slice(0, 3)
      : [];

    const safeCMS = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    // Process content on server-side for better performance
    let processedBody = "";
    let processedReferences = "";
    let processedBenefits = "";
    let processedTips = "";
    
    if (topic.value.body) {
      let processed = fixMediaUrls(topic.value.body || "");
      processed = await replaceEmbedImages(processed, safeCMS);
      processed = await fixWagtailInternalLinks(processed, safeCMS);
      processedBody = processed;
    }
    
    if (topic.value.references) {
      let processed = fixMediaUrls(topic.value.references || "");
      processed = await fixWagtailInternalLinks(processed, safeCMS);
      processedReferences = processed;
    }
    
    if (topic.value.benefits) {
      let processed = fixMediaUrls(topic.value.benefits || "");
      processed = await fixWagtailInternalLinks(processed, safeCMS);
      processedBenefits = processed;
    }
    
    if (topic.value.tips) {
      let processed = fixMediaUrls(topic.value.tips || "");
      processed = await fixWagtailInternalLinks(processed, safeCMS);
      processedTips = processed;
    }
    
    // Optimize main image URL
    const mainImageUrl = topic.value.image || null;
    
    console.log(`✅ Generated wellness article ${slug} in ${Date.now() - start}ms`);
    
    return {
      props: {
        topic: topic.value,
        relatedTopics,
        processedBody,
        processedReferences,
        processedBenefits,
        processedTips,
        mainImageUrl
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error("Error fetching wellness topic:", error.message);
    return {
      props: {
        error: 'Failed to load wellness topic. Please try again later.',
        topic: null,
        relatedTopics: [],
        processedBody: '',
        processedReferences: '',
        processedBenefits: '',
        processedTips: '',
        mainImageUrl: ''
      },
      revalidate: 60,
    };
  }
}