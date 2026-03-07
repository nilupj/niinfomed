// pages/homeopathy/[slug].js
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Head from "next/head";

import ShareButton from "../../components/ShareButton";
import CommentSection from "../../components/CommentSection";
import {
  getProxiedImageUrl,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  extractHeadings,
  slugify,
  addHeadingIds,
  getSafeCMSUrl,
  fixMediaUrls,
  tryEndpoints,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo
} from "../../utils/api";

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
   ✅ PROCESS HTML WITH INTERNAL LINKS
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
   ✅ TABLE OF CONTENTS COMPONENT
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
    <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
      <h3 className="text-lg font-bold mb-4">On this page</h3>
      <nav aria-label="Table of contents">
        <ul className="space-y-2 text-sm">
          {headings.map((h, idx) => (
            <li
              key={`${h.text}-${idx}`}
              className={h.level === 3 ? "ml-4" : ""}
            >
              <button
                onClick={() => scrollToHeading(slugify(h.text))}
                className="text-neutral-700 hover:text-green-600 hover:underline text-left w-full transition-colors"
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
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
      <div className="h-96 bg-neutral-200 rounded mb-8"></div>
    </div>
  </div>
);

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function HomeopathyTopicPage({ 
  topic: initialTopic, 
  relatedTopics: initialRelated,
  processedBody: initialProcessedBody,
  processedRemedyDetails: initialProcessedRemedyDetails,
  processedIndications: initialProcessedIndications,
  processedDosage: initialProcessedDosage,
  processedPrecautions: initialProcessedPrecautions,
  processedReferences: initialProcessedReferences,
  mainImageUrl: initialMainImageUrl,
  error
}) {
  const router = useRouter();
  const { slug } = router.query;

  const [pageTopic, setPageTopic] = useState(initialTopic);
  const [relatedTopics, setRelatedTopics] = useState(initialRelated || []);
  const [loading, setLoading] = useState(!initialTopic);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  /* ✅ Store processed HTML */
  const [finalBodyHtml, setFinalBodyHtml] = useState(initialProcessedBody || "");
  const [finalRemedyDetailsHtml, setFinalRemedyDetailsHtml] = useState(initialProcessedRemedyDetails || "");
  const [finalIndicationsHtml, setFinalIndicationsHtml] = useState(initialProcessedIndications || "");
  const [finalDosageHtml, setFinalDosageHtml] = useState(initialProcessedDosage || "");
  const [finalPrecautionsHtml, setFinalPrecautionsHtml] = useState(initialProcessedPrecautions || "");
  const [finalReferencesHtml, setFinalReferencesHtml] = useState(initialProcessedReferences || "");

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromTopic(pageTopic),
    [pageTopic]
  );

  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  /* ✅ Process all content sections with internal links */
  useEffect(() => {
    if (initialProcessedBody && initialProcessedRemedyDetails && 
        initialProcessedIndications && initialProcessedDosage && 
        initialProcessedPrecautions && initialProcessedReferences) {
      setContentLoaded(true);
      return;
    }

    let mounted = true;

    const processAllSections = async () => {
      if (!pageTopic) return;

      try {
        // Process all sections in parallel
        const sections = [
          { key: 'body', content: pageTopic.body, setter: setFinalBodyHtml },
          { key: 'remedy_details', content: pageTopic.remedy_details, setter: setFinalRemedyDetailsHtml },
          { key: 'indications', content: pageTopic.indications, setter: setFinalIndicationsHtml },
          { key: 'dosage', content: pageTopic.dosage, setter: setFinalDosageHtml },
          { key: 'precautions', content: pageTopic.precautions, setter: setFinalPrecautionsHtml },
          { key: 'references', content: pageTopic.references, setter: setFinalReferencesHtml }
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
              switch (key) {
                case 'body': setFinalBodyHtml(content); break;
                case 'remedy_details': setFinalRemedyDetailsHtml(content); break;
                case 'indications': setFinalIndicationsHtml(content); break;
                case 'dosage': setFinalDosageHtml(content); break;
                case 'precautions': setFinalPrecautionsHtml(content); break;
                case 'references': setFinalReferencesHtml(content); break;
              }
            }
          });
          setContentLoaded(true);
        }
      } catch (err) {
        console.error("Error processing content sections:", err);
        // Fallback to basic media URL fixes
        if (mounted) {
          if (pageTopic.body) setFinalBodyHtml(fixMediaUrls(pageTopic.body || ""));
          setContentLoaded(true);
        }
      }
    };

    processAllSections();

    return () => {
      mounted = false;
    };
  }, [pageTopic, safeCMS, initialProcessedBody, initialProcessedRemedyDetails, 
      initialProcessedIndications, initialProcessedDosage, initialProcessedPrecautions, 
      initialProcessedReferences]);

  /* ✅ Mark content as loaded when hero image loads */
  useEffect(() => {
    if (!pageTopic?.image) {
      setHeroImageLoaded(true);
      setContentLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = initialMainImageUrl || getProxiedImageUrl(pageTopic.image);
      imageLoader.src = imageUrl;
      imageLoader.onload = () => {
        setHeroImageLoaded(true);
        setContentLoaded(true);
      };
      imageLoader.onerror = () => {
        setHeroImageLoaded(true);
        setContentLoaded(true);
      };
    } else {
      setHeroImageLoaded(true);
      setContentLoaded(true);
    }
  }, [pageTopic?.image, initialMainImageUrl]);

  const headings = useMemo(
    () => extractHeadings(finalBodyHtml),
    [finalBodyHtml]
  );

  const bodyWithIds = useMemo(
    () => addHeadingIds(finalBodyHtml, headings),
    [finalBodyHtml, headings]
  );

  // Fetch topic if not provided
  useEffect(() => {
    if (!initialTopic && slug) {
      const fetchTopic = async () => {
        try {
          setLoading(true);
          const baseUrl = getSafeCMSUrl();
          const response = await fetch(`${baseUrl}/api/homeopathy/topics/${slug}/`);
          if (!response.ok) throw new Error("Topic not found");
          const data = await response.json();
          setPageTopic(data);
          
          // Also fetch related topics
          const relatedRes = await fetch(`${baseUrl}/api/homeopathy/topics/?limit=6`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            const filtered = (relatedData.results || relatedData.items || relatedData)
              .filter(t => t.slug !== slug)
              .slice(0, 3);
            setRelatedTopics(filtered);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchTopic();
    } else {
      setLoading(false);
    }
  }, [slug, initialTopic]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-800 mb-3">
            Error Loading Homeopathy Topic
          </h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/homeopathy"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Browse All Homeopathy Topics
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!pageTopic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Homeopathy Topic Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This homeopathy topic does not exist or may have been removed.
          </p>
          <Link
            href="/homeopathy"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Homeopathy Topics
          </Link>
        </div>
      </div>
    );
  }

  // SEO values
  const pageTitle = `${pageTopic.title} - Homeopathic Remedies | Niinfomed`;
  const pageDescription =
    pageTopic.summary || `Learn about ${pageTopic.title} homeopathic remedy, its uses, dosage, and precautions.`;

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || "https://niinfomed.com"}${router.asPath}`;

  const fallbackImage = "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=1200&h=630&q=75";
  const ogImage = initialMainImageUrl || getProxiedImageUrl(pageTopic.image) || fallbackImage;

  // Get author and reviewer info
  const authorDisplayName = getAuthorDisplayName(pageTopic.author);
  const authorSlug = getAuthorSlug(pageTopic.author);
  const reviewerDisplayName = getReviewerDisplayName(pageTopic.reviewer);
  const reviewerSlug = getReviewerSlug(pageTopic.reviewer);

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
        {/* ✅ Critical CSS for LCP */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* ✅ Preload LCP image */}
        <link 
          rel="preload" 
          as="image" 
          href={ogImage} 
          fetchPriority="high"
        />
        
        {/* ✅ Preconnect to image domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {ogImage.includes('localhost') && (
          <link rel="preconnect" href={new URL(ogImage).origin} />
        )}
      </Head>

      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          url: pageUrl,
          title: pageTitle,
          description: pageDescription,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: pageTopic.title,
            },
          ],
          siteName: "Niinfomed",
          type: "article",
          article: {
            publishedTime: publishedDate?.toISOString(),
            modifiedTime: updatedDate?.toISOString(),
            authors: pageTopic.author ? [pageTopic.author.name] : [],
            tags: ['homeopathy', 'alternative medicine', ...(pageTopic.category ? [pageTopic.category.name] : [])],
          },
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 mb-5 flex flex-wrap gap-1 above-fold" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-neutral-800 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/homeopathy" className="hover:text-neutral-800 transition-colors">
            Homeopathy
          </Link>
          {pageTopic.category?.name && (
            <>
              <span aria-hidden="true">/</span>
              <Link 
                href={`/homeopathy/categories/${pageTopic.category.slug}`}
                className="hover:text-neutral-800 transition-colors"
              >
                {pageTopic.category.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-neutral-700 font-medium" aria-current="page">
            {pageTopic.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* MAIN CONTENT */}
          <article className="min-w-0 above-fold">
            {/* Hero Image - CRITICAL FOR LCP */}
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
              <img
                src={ogImage}
                alt={pageTopic.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                width={1200}
                height={630}
                onLoad={() => setHeroImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              {pageTopic.title}
            </h1>

            {/* Subtitle */}
            {pageTopic.subtitle && (
              <p className="text-base sm:text-xl text-neutral-600 mb-4">
                {pageTopic.subtitle}
              </p>
            )}

            {/* Category and Potency */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {pageTopic.category && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {pageTopic.category.name}
                </span>
              )}
              {pageTopic.potency && (
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Potency: {pageTopic.potency}
                </span>
              )}
              
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
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 text-sm text-neutral-600 mb-6">
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
                    <span className="font-semibold text-neutral-700">
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
                    <span className="font-semibold text-neutral-700">
                      {reviewerDisplayName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="mb-6">
              <ShareButton
                title={pageTopic.title}
                url={pageUrl}
              />
            </div>

            {/* Summary */}
            {pageTopic.summary && (
              <div className="mb-8 p-5 sm:p-6 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                  {pageTopic.summary}
                </p>
              </div>
            )}

            {/* TOC Mobile */}
            {headings.length > 0 && heroImageLoaded && (
              <div className="mb-8 lg:hidden">
                <TableOfContents headings={headings} />
              </div>
            )}

            {/* Body - FIXED: Removed multiline className */}
            {contentLoaded && finalBodyHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  About {pageTopic.title}
                </h2>

                <div
<<<<<<< HEAD
                  className="prose prose-base sm:prose-lg max-w-none
                             prose-img:w-full prose-img:h-auto
                             prose-img:rounded-xl prose-img:shadow
                             prose-headings:scroll-mt-24
                             prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
=======
                  className="prose prose-base sm:prose-lg max-w-none prose-img:w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow prose-headings:scroll-mt-24 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
>>>>>>> 2ee6acc (update)
                  dangerouslySetInnerHTML={{ __html: bodyWithIds }}
                />
              </div>
            )}

            {/* Remedy Details */}
            {contentLoaded && finalRemedyDetailsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Remedy Details
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalRemedyDetailsHtml }}
                />
              </div>
            )}

            {/* Indications */}
            {contentLoaded && finalIndicationsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Indications
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalIndicationsHtml }}
                />
              </div>
            )}

            {/* Dosage */}
            {contentLoaded && finalDosageHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Dosage & Administration
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalDosageHtml }}
                />
              </div>
            )}

            {/* Precautions */}
            {contentLoaded && finalPrecautionsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Precautions & Safety
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalPrecautionsHtml }}
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

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Homeopathic Disclaimer:</strong> This information is for
                educational purposes only and not a substitute for medical
                advice. Always consult a qualified homeopathic practitioner
                before starting any treatment.
              </p>
            </div>

            {/* References */}
            {contentLoaded && finalReferencesHtml ? (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">References</h3>
                <div className="bg-neutral-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: finalReferencesHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">References</h3>
                <div className="bg-neutral-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <p className="text-sm text-neutral-600">
                    Compiled by the Niinfomed Homeopathy Team
                  </p>
                </div>
              </div>
            )}

            {/* Comments - Load last */}
            {contentLoaded && (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <CommentSection
                  contentType="homeopathy"
                  contentSlug={pageTopic.slug}
                  pageTitle={pageTopic.title}
                />
              </div>
            )}
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} />

              {relatedTopics?.length > 0 && contentLoaded && (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Related Remedies</h3>

                  <div className="space-y-4">
                    {relatedTopics.slice(0, 3).map((item) => {
                      const relatedImage = getProxiedImageUrl(item.image) || fallbackImage;

                      return (
                        <Link
                          key={item.id || item.slug}
                          href={`/homeopathy/${item.slug}`}
                          className="block group"
                          prefetch={false}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img
                                src={relatedImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                decoding="async"
                                width={80}
                                height={64}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = fallbackImage;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-neutral-800 group-hover:text-green-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) ||
                                  "Learn more about this remedy"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/homeopathy"
                      className="inline-flex w-full justify-center items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Homeopathy Remedies
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Topics */}
        {relatedTopics.length > 0 && contentLoaded && (
          <section className="mt-12 pt-12 border-t border-neutral-200">
            <h2 className="text-2xl font-bold mb-6">Related Remedies</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTopics.map((related) => {
                const relatedImage = getProxiedImageUrl(related.image) || fallbackImage;
                
                return (
                  <div key={related.id || related.slug} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/homeopathy/${related.slug}`} prefetch={false}>
                      <div className="relative h-40 w-full">
                        <img
                          src={relatedImage}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={240}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                          }}
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.summary || "Learn more about this remedy"}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        .prose a {
          color: #16a34a;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose a:hover {
          color: #15803d;
        }
        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      `}</style>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH PERFORMANCE OPTIMIZATIONS
========================================================= */

export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const response = await fetch(`${baseUrl}/api/homeopathy/topics/`);
    const data = await response.json();
    
    const topics = data.results || data.items || data;
    
    const paths = topics
      .filter(topic => topic && topic.slug)
      .map((topic) => ({
        params: { slug: topic.slug },
      }));
      
    return { 
      paths, 
      fallback: "blocking" 
    };
  } catch (error) {
    console.error("Error fetching homeopathy topics for paths:", error);
    return { 
      paths: [], 
      fallback: "blocking" 
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const start = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const [topicRes, allTopicsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/homeopathy/topics/${params.slug}/`),
      fetch(`${baseUrl}/api/homeopathy/topics/?limit=6`),
    ]);

    let topic = null;
    let allTopics = [];

    if (topicRes.status === "fulfilled") {
      topic = await topicRes.value.json();
    }

    if (allTopicsRes.status === "fulfilled") {
      const data = await allTopicsRes.value.json();
      allTopics = data.results || data.items || data;
    }

    if (!topic) {
      return { 
        notFound: true, 
        revalidate: 60 
      };
    }

    // Server-side URL for processing
    const safeCMS = baseUrl;
    
    // Process content on server-side for better performance
    let processedBody = "";
    let processedRemedyDetails = "";
    let processedIndications = "";
    let processedDosage = "";
    let processedPrecautions = "";
    let processedReferences = "";
    
    // Process all sections in parallel
    const sections = [
      { key: 'body', content: topic.body },
      { key: 'remedy_details', content: topic.remedy_details },
      { key: 'indications', content: topic.indications },
      { key: 'dosage', content: topic.dosage },
      { key: 'precautions', content: topic.precautions },
      { key: 'references', content: topic.references }
    ];

    const processingPromises = sections.map(async ({ key, content }) => {
      if (content) {
        try {
          let processed = content;
          // Fix media URLs
          processed = fixMediaUrls(processed);
          // Replace embed images
          processed = await replaceEmbedImages(processed, safeCMS);
          // Fix Wagtail internal links
          processed = await fixWagtailInternalLinks(processed, safeCMS);
          return { key, content: processed };
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          return { key, content: fixMediaUrls(content || "") };
        }
      }
      return { key, content: "" };
    });

    const results = await Promise.allSettled(processingPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { key, content } = result.value;
        switch (key) {
          case 'body': processedBody = content; break;
          case 'remedy_details': processedRemedyDetails = content; break;
          case 'indications': processedIndications = content; break;
          case 'dosage': processedDosage = content; break;
          case 'precautions': processedPrecautions = content; break;
          case 'references': processedReferences = content; break;
        }
      }
    });
    
    const relatedTopics = allTopics
      .filter((t) => t.slug !== params.slug)
      .slice(0, 3);
    
    // Optimize main image URL
    const mainImageUrl = getProxiedImageUrl(topic.image);

    console.log(`✅ Generated homeopathy article ${params.slug} in ${Date.now() - start}ms`);

    return { 
      props: { 
        topic, 
        relatedTopics,
        processedBody,
        processedRemedyDetails,
        processedIndications,
        processedDosage,
        processedPrecautions,
        processedReferences,
        mainImageUrl
      }, 
      revalidate: 3600 
    };
  } catch (error) {
    console.error("Error fetching homeopathy topic:", error);
    return { 
      props: { 
        topic: null, 
        relatedTopics: [],
        processedBody: "",
        processedRemedyDetails: "",
        processedIndications: "",
        processedDosage: "",
        processedPrecautions: "",
        processedReferences: "",
        mainImageUrl: "",
        error: "Failed to load homeopathy information. Please try again later."
      }, 
      revalidate: 60 
    };
  }
}
