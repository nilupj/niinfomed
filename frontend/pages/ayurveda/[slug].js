// pages/ayurveda/[slug].js
import { useRouter } from "next/router";
import Link from "next/link";
import SEO from "../../components/SEO";
import CommentSection from "../../components/CommentSection";
import ReferencesSection from "../../components/ReferencesSection";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
<<<<<<< HEAD
import { useMemo, useCallback } from "react";
=======
>>>>>>> 2ee6acc (update)
import {
  getProxiedImageUrl,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  extractHeadings,
  slugify,
  addHeadingIds,
  tryEndpoints,
  extractEmbedImageIds,
  fetchWagtailImageUrl,
  getSafeCMSUrl,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo
} from "../../utils/api";

/* =========================================================
   ✅ Date Functions with Fallbacks
========================================================= */

const createFallbackDates = () => {
  const now = new Date();
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 30);
  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 7);
  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 15);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true,
  };
};

const extractDatesFromTopic = (topic) => {
  if (!topic) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true,
    };
  }

  let publishedDate = null;
  let updatedDate = null;
  let lastReviewedDate = null;

  const possiblePublishedFields = [
    "first_published_at",
    "first_published_date",
    "published_date",
    "publish_date",
    "published_at",
    "publication_date",
    "created_at",
    "created_date",
    "date_published",
    "date",
  ];

  const possibleUpdatedFields = [
    "last_published_at",
    "last_published_date",
    "updated_at",
    "updated_date",
    "modified_at",
    "modified_date",
    "last_updated",
    "last_modified",
    "update_date",
  ];

  const possibleReviewedFields = [
    "last_reviewed",
    "last_reviewed_date",
    "reviewed_at",
    "review_date",
    "medical_review_date",
  ];

  for (const field of possiblePublishedFields) {
    if (topic[field]) {
      publishedDate = parseDateSafe(topic[field]);
      if (publishedDate) break;
    }
  }

  for (const field of possibleUpdatedFields) {
    if (topic[field]) {
      updatedDate = parseDateSafe(topic[field]);
      if (updatedDate) break;
    }
  }

  for (const field of possibleReviewedFields) {
    if (topic[field]) {
      lastReviewedDate = parseDateSafe(topic[field]);
      if (lastReviewedDate) break;
    }
  }

  if (!publishedDate && !updatedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true,
    };
  }

  if (!publishedDate && updatedDate) publishedDate = updatedDate;
  if (!updatedDate && publishedDate) updatedDate = publishedDate;
  if (!lastReviewedDate) lastReviewedDate = updatedDate || publishedDate;

  return {
    publishedDate,
    updatedDate,
    lastReviewedDate,
    isFallback: false,
  };
};

const isContentUpdated = (publishedDate, updatedDate) => {
  if (!publishedDate || !updatedDate) return false;
  try {
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
  className = "",
}) => {
  const isUpdated = isContentUpdated(publishedDate, updatedDate);
  const publishedDisplay = formatDateDisplay(publishedDate);
  const updatedDisplay = formatDateDisplay(updatedDate);
  const lastReviewedDisplay = formatDateDisplay(lastReviewedDate);

  const publishedTimeAgo = getTimeAgo(publishedDate);
  const updatedTimeAgo = getTimeAgo(updatedDate);
  const reviewedTimeAgo = getTimeAgo(lastReviewedDate);

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
        <time dateTime={publishedDate?.toISOString() || ""}>
          {publishedDisplay}
        </time>

        {isUpdated && (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Updated
          </span>
        )}

        {isFallback && (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Published */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Published</h4>
              <p className="text-sm text-gray-500">Original publication date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {publishedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {publishedTimeAgo}
            </span>
          </div>
        </div>

        {/* Updated */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full ${
                isUpdated ? "bg-green-100" : "bg-gray-100"
              } flex items-center justify-center`}
            >
              <svg
                className={`w-5 h-5 ${
                  isUpdated ? "text-green-600" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {isUpdated ? "Updated" : "Last Updated"}
              </h4>
              <p className="text-sm text-gray-500">
                {isUpdated ? "Most recent update" : "Last modification"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {updatedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {updatedTimeAgo}
            </span>
          </div>
        </div>

        {/* Reviewed */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Reviewed</h4>
              <p className="text-sm text-gray-500">Medical review date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={lastReviewedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {lastReviewedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {reviewedTimeAgo}
            </span>
          </div>
        </div>
      </div>

      {isFallback && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-700">
            Dates are estimated because CMS did not provide publication timeline.
          </p>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ✅ TableOfContents Component
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <h3 className="text-lg font-bold mb-3">On this page</h3>
      <nav aria-label="Table of contents">
        <ul className="space-y-2 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
              <button
                onClick={() => scrollToHeading(h.id)}
                className="text-gray-700 hover:text-amber-600 hover:underline text-left w-full transition-colors"
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
   ✅ Author/Reviewer Helpers
========================================================= */

const getAuthorDisplayName = (author) => {
  if (!author) return null;
  return author.name || null;
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
   ✅ MAIN COMPONENT
========================================================= */

export default function AyurvedaDetail({ topic, relatedTopics, imageMap, error }) {
  const router = useRouter();
  const [processedBody, setProcessedBody] = useState("");
  const [processedReferences, setProcessedReferences] = useState("");
  const [processingError, setProcessingError] = useState(null);
  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromTopic(topic),
    [topic]
  );

  /* ✅ Content processing hooks */
  const rawBody = useMemo(
    () => topic?.body || "",
    [topic?.body]
  );

  const rawReferences = useMemo(
    () => topic?.references || "",
    [topic?.references]
  );

  /* =========================================================
     ✅ Body processing pipeline
  ========================================================= */
  useEffect(() => {
    let mounted = true;

    const processContent = async () => {
      if (!rawBody) {
        setProcessedBody('');
        return;
      }

      setProcessingError(null);
      
      try {
        console.log("🔄 Processing Ayurveda content...");
        
        // 1) Replace embed images
        const withImages = await replaceEmbedImages(rawBody, safeCMS);
        
        // 2) Fix internal links
        const withLinks = await fixWagtailInternalLinks(withImages, safeCMS);
        
        if (mounted) {
          setProcessedBody(withLinks);
          console.log("✅ Ayurveda content processed");
        }
      } catch (err) {
        console.error("❌ Error processing content:", err);
        if (mounted) {
          setProcessingError("Failed to process content");
          setProcessedBody(rawBody);
        }
      }
    };

    processContent();

    return () => {
      mounted = false;
    };
  }, [rawBody, safeCMS]);

  /* ✅ References processing */
  useEffect(() => {
    let mounted = true;

    const processReferences = async () => {
      if (!rawReferences) {
        setProcessedReferences('');
        return;
      }

      try {
        const withLinks = await fixWagtailInternalLinks(rawReferences, safeCMS);
        if (mounted) {
          setProcessedReferences(withLinks);
        }
      } catch (err) {
        console.error("❌ Error processing references:", err);
        if (mounted) {
          setProcessedReferences(rawReferences);
        }
      }
    };

    processReferences();

    return () => {
      mounted = false;
    };
  }, [rawReferences, safeCMS]);

  const headings = useMemo(() => extractHeadings(processedBody), [processedBody]);
  const bodyWithIds = useMemo(
    () => addHeadingIds(processedBody, headings),
    [processedBody, headings]
  );

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-800 mb-3">
            Error Loading Ayurveda Topic
          </h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/ayurveda"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Browse All Ayurveda Topics
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (router.isFallback) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Ayurveda Topic Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This Ayurveda topic does not exist or may have been removed.
          </p>
          <Link
            href="/ayurveda"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Ayurveda Topics
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=1200&h=630";

  const mainImageUrl = getProxiedImageUrl(topic.image) || fallbackImage;

  const authorDisplayName = getAuthorDisplayName(topic.author);
  const authorSlug = getAuthorSlug(topic.author);

  const reviewerDisplayName = getAuthorDisplayName(topic.reviewer);
  const reviewerSlug = getReviewerSlug(topic.reviewer);

  return (
    <>
      <SEO
        title={`${topic.title} - Ayurveda - Niinfomed`}
        description={topic.summary?.substring(0, 160) || topic.title}
        image={mainImageUrl}
        url={`https://niinfomed.com/ayurveda/${topic.slug}`}
<<<<<<< HEAD
=======
        openGraph={{
          type: 'article',
          article: {
            publishedTime: publishedDate?.toISOString(),
            modifiedTime: updatedDate?.toISOString(),
            authors: authorDisplayName ? [authorDisplayName] : [],
            tags: ['ayurveda', 'alternative medicine', topic.category?.name].filter(Boolean),
          },
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
>>>>>>> 2ee6acc (update)
      />

      {/* Processing error alert */}
      {processingError && (
        <div className="container mx-auto px-4 mt-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Some content may not display correctly. Please refresh or try again later.
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex flex-wrap gap-1" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/ayurveda" className="hover:text-gray-800 transition-colors">
            Ayurveda
          </Link>
          {topic.category?.name && (
            <>
              <span aria-hidden="true">/</span>
<<<<<<< HEAD
              <span className="text-gray-700 font-medium">
=======
              <Link 
                href={`/ayurveda/categories/${topic.category.slug}`}
                className="hover:text-gray-800 transition-colors"
              >
>>>>>>> 2ee6acc (update)
                {topic.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* ARTICLE */}
          <article className="min-w-0">
            {/* Image */}
<<<<<<< HEAD
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-100">
              <Image
                src={mainImageUrl}
                alt={topic.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                priority
                unoptimized={mainImageUrl?.includes('cms-media') || mainImageUrl?.includes('127.0.0.1')}
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </div>
=======
            {topic.image && (
              <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-100">
                <Image
                  src={mainImageUrl}
                  alt={topic.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-cover"
                  priority
                  unoptimized={mainImageUrl?.includes('cms-media') || mainImageUrl?.includes('127.0.0.1')}
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                />
              </div>
            )}
>>>>>>> 2ee6acc (update)

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              {topic.title}
            </h1>

            {/* Subtitle */}
            {topic.subtitle && (
              <p className="text-base sm:text-xl text-gray-600 mb-4">
                {topic.subtitle}
              </p>
            )}

            {/* Tags + Compact Published */}
            <div className="mb-4">
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
                compact={true}
              />
            </div>

            {/* Author / Reviewer */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 text-sm text-gray-600 mb-6">
              {authorDisplayName && (
                <div>
                  <span className="font-medium">Author:</span>{" "}
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
                <div>
                  <span className="font-medium">Reviewed by:</span>{" "}
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

            {/* Timeline */}
            <div className="mb-6 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl">
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
              <div className="mb-8 p-5 sm:p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {topic.summary}
                </p>
              </div>
            )}

            {/* TOC Mobile */}
            {headings.length > 0 && (
              <div className="mb-8 lg:hidden">
                <TableOfContents headings={headings} />
              </div>
            )}

<<<<<<< HEAD
            {/* Body */}
=======
            {/* Body - FIXED: Single line className */}
>>>>>>> 2ee6acc (update)
            {bodyWithIds && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  About {topic.title}
                </h2>

                <div
<<<<<<< HEAD
                  className="prose prose-base sm:prose-lg max-w-none
                             prose-img:w-full prose-img:h-auto
                             prose-img:rounded-xl prose-img:shadow
                             prose-headings:scroll-mt-24
                             prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
=======
                  className="prose prose-base sm:prose-lg max-w-none prose-img:w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow prose-headings:scroll-mt-24 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
>>>>>>> 2ee6acc (update)
                  dangerouslySetInnerHTML={{ __html: bodyWithIds }}
                />
              </div>
            )}

            {/* References */}
            {processedReferences && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <ReferencesSection references={processedReferences} />
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Ayurvedic Disclaimer:</strong> This information is for
                educational purposes only and not a substitute for medical
                advice. Consult a qualified practitioner before starting any
                treatment.
              </p>
            </div>

            {/* Comments */}
            <CommentSection
              contentType="ayurveda"
              contentSlug={topic.slug}
              pageTitle={topic.title}
            />
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} />

              {relatedTopics?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Related Topics</h3>

                  <div className="space-y-4">
                    {relatedTopics.slice(0, 3).map((item) => {
                      const relatedImage = getProxiedImageUrl(item.image) || fallbackImage;

                      return (
                        <Link
                          key={item.id || item.slug}
                          href={`/ayurveda/${item.slug}`}
                          className="block group"
                          prefetch={false}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={relatedImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = fallbackImage;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-amber-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) ||
                                  "Learn more about Ayurveda"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/ayurveda"
                      className="inline-flex w-full justify-center items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      View All Ayurveda Topics
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .prose a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .prose h2,
        .prose h3 {
          scroll-margin-top: 5rem;
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
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "https://api.niinfomed.com";
    
    const listEndpoints = [
      `${baseUrl}/api/ayurveda/topics/`,
      `${baseUrl}/api/ayurveda/`,
      `${baseUrl}/api/v2/pages/?type=ayurveda.AyurvedaPage&fields=slug`,
    ];

    console.log("🔍 Fetching Ayurveda paths from Oracle CMS...");
    const { data } = await tryEndpoints(listEndpoints, {
      timeout: 10000,
    });

    let topics = [];
    if (Array.isArray(data)) {
      topics = data;
    } else if (data?.items) {
      topics = data.items;
    } else if (data?.results) {
      topics = data.results;
    }

    console.log(`✅ Found ${topics.length} Ayurveda topics`);

    const paths = topics
      .filter(t => t && t.slug)
      .map((t) => ({
        params: { slug: String(t.slug) },
      }));

    return { 
      paths, 
      fallback: "blocking" 
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return { 
      paths: [], 
      fallback: "blocking" 
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const slug = params.slug;
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "https://api.niinfomed.com";
    
    console.log(`📡 Fetching Ayurveda topic: ${slug} from Oracle CMS`);

    const detailEndpoints = [
      `${baseUrl}/api/ayurveda/topics/${slug}/`,
      `${baseUrl}/api/ayurveda/${slug}/`,
      `${baseUrl}/api/v2/pages/?type=ayurveda.AyurvedaPage&slug=${slug}`,
    ];

    const listEndpoints = [
      `${baseUrl}/api/ayurveda/topics/`,
      `${baseUrl}/api/ayurveda/`,
      `${baseUrl}/api/v2/pages/?type=ayurveda.AyurvedaPage&fields=title,slug,image,summary&limit=6`,
    ];

    const [topicResponse, listResponse] = await Promise.allSettled([
      tryEndpoints(detailEndpoints, {
        timeout: 10000,
        params: { lang: "en" },
      }),
      tryEndpoints(listEndpoints, {
        timeout: 10000,
        params: { limit: 6, lang: "en" },
      }),
    ]);

    // Handle topic data
    let topicData = null;
    if (topicResponse.status === 'fulfilled' && topicResponse.value?.data) {
      const data = topicResponse.value.data;
      if (data.items && data.items.length > 0) {
        topicData = data.items[0];
      } else if (data.results && data.results.length > 0) {
        topicData = data.results[0];
      } else {
        topicData = data;
      }
    }

    if (!topicData) {
      console.log(`❌ Ayurveda topic not found: ${slug}`);
      return { 
        notFound: true, 
        revalidate: 60 
      };
    }

    // Handle related topics
    let relatedTopics = [];
    if (listResponse.status === 'fulfilled' && listResponse.value?.data) {
      const listData = listResponse.value.data;
      let allTopics = [];
      
      if (Array.isArray(listData)) {
        allTopics = listData;
      } else if (listData?.items) {
        allTopics = listData.items;
      } else if (listData?.results) {
        allTopics = listData.results;
      }

      relatedTopics = allTopics
        .filter((t) => t && t.slug && t.slug !== slug)
        .slice(0, 3);
    }

    // Extract image IDs for embed images
    const ids = extractEmbedImageIds(topicData.body || "");
    const imageMap = {};

    await Promise.allSettled(
      ids.map(async (id) => {
        const url = await fetchWagtailImageUrl(id, baseUrl);
        if (url) imageMap[id] = url;
      })
    );

    return {
      props: {
        topic: topicData,
        relatedTopics: relatedTopics || [],
        imageMap,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching Ayurveda topic ${params.slug}:`, error);
    return { 
      props: {
        error: 'Failed to load Ayurveda topic. Please try again later.',
        topic: null,
        relatedTopics: [],
        imageMap: {}
      },
      revalidate: 60 
    };
  }
}
