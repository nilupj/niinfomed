import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextSeo } from "next-seo";
import ShareButton from "../../components/ShareButton";
import CookieConsent from "../../components/CookieConsent";
import CommentSection from "../../components/CommentSection";
import { fetchNewsBySlug, fetchRelatedNews } from "../../utils/api";
import Head from "next/head";

/* =========================================================
   ✅ FIXED: Use Oracle CMS URL instead of localhost
========================================================= */
const getSafeCMSUrl = () => {
  let base = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

  if (typeof window !== "undefined") {
    const frontendHost = window.location.hostname;
    
    // Only replace if the base contains localhost/127.0.0.1
    if (base.includes('localhost') || base.includes('127.0.0.1') || base.includes('0.0.0.0')) {
      base = base
        .replace("0.0.0.0", frontendHost)
        .replace("127.0.0.1", frontendHost)
        .replace("localhost", frontendHost);
    }
  }

  return base;
};

// ⚠️ For SSR/SSG use env directly (build time)
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

/* =========================================================
   ✅ Helper: Fix all CMS media URLs inside HTML (src + srcset)
   Updated to handle Oracle CMS URL
========================================================= */
const fixMediaUrls = (html) => {
  if (!html) return "";

  return html
    // Oracle CMS patterns
    .replace(/src="https?:\/\/161\.118\.167\.107\/media\//g, 'src="/cms-media/')
    .replace(/src='https?:\/\/161\.118\.167\.107\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/0\.0\.0\.0:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/0\.0\.0\.0:8001\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/127\.0\.0\.1:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/127\.0\.0\.1:8001\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/localhost:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/localhost:8001\/media\//g, "src='/cms-media/")
    .replace(/src="\/media\//g, 'src="/cms-media/')
    .replace(/src='\/media\//g, "src='/cms-media/")
    .replace(/srcset="\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="https?:\/\/161\.118\.167\.107\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='https?:\/\/161\.118\.167\.107\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/0\.0\.0\.0:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/0\.0\.0\.0:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/127\.0\.0\.1:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/127\.0\.0\.1:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/localhost:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/localhost:8001\/media\//g, "srcset='/cms-media/")
    .replace(/\/cms-media\/media\//g, "/cms-media/");
};

/* =========================================================
   ✅ IMAGE OPTIMIZATION HELPER
========================================================= */
const optimizeImageUrl = (url, width = 1200) => {
  if (!url) return null;
  
  if (url.includes('unsplash.com') || url.includes('cloudinary') || url.includes('imgix')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75&auto=format,compress`;
  }
  
  return getProxiedImageUrl(url);
};

/* =========================================================
   ✅ Helper: Single image URL fix
   Updated to handle Oracle CMS URL
========================================================= */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Handle Oracle CMS URL
  if (url.includes('161.118.167.107')) {
    return url
      .replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/')
      .replace('/cms-media/media/', '/cms-media/');
  }

  if (url.startsWith("http://0.0.0.0:8001")) {
    return url
      .replace("http://0.0.0.0:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("http://127.0.0.1:8001")) {
    return url
      .replace("http://127.0.0.1:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("http://localhost:8001")) {
    return url
      .replace("http://localhost:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("/media/")) {
    return `/cms-media${url.replace("/media/", "/")}`;
  }

  if (url.startsWith("/cms-media/")) {
    return url.replace("/cms-media/media/", "/cms-media/");
  }

  return url;
};

/* =========================================================
   ✅ Wagtail EMBED IMAGE FIX FUNCTIONS
========================================================= */
const extractEmbedImageIds = (html = "") => {
  if (!html) return [];
  const matches = [...html.matchAll(/embedtype="image"[^>]*id="(\d+)"/g)];
  return matches.map((m) => m[1]);
};

const fetchWagtailImageUrl = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/v2/images/${id}/`);
    if (!res.ok) throw new Error(`Image ${id} fetch failed`);

    const data = await res.json();

    const url =
      data?.meta?.download_url ||
      data?.meta?.preview_url ||
      data?.meta?.original?.url ||
      data?.original?.url ||
      null;

    if (!url) return null;

    if (url.startsWith("/")) return `${safeBaseUrl}${url}`;

    return url;
  } catch (err) {
    console.error("fetchWagtailImageUrl error:", err);
    return null;
  }
};

const replaceEmbedImages = async (html = "", safeBaseUrl = "") => {
  try {
    if (!html) return "";

    let updatedHtml = html;
    const ids = extractEmbedImageIds(updatedHtml);

    if (!ids.length) return updatedHtml;

    for (const id of ids) {
      const imgUrl = await fetchWagtailImageUrl(id, safeBaseUrl);

      if (!imgUrl) {
        updatedHtml = updatedHtml.replace(
          new RegExp(
            `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
            "g"
          ),
          ""
        );
        continue;
      }

      const proxiedUrl = getProxiedImageUrl(imgUrl);

      updatedHtml = updatedHtml.replace(
        new RegExp(
          `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
          "g"
        ),
        `<img src="${proxiedUrl}" alt="News Image" class="max-w-full h-auto rounded-xl" loading="lazy" width="800" height="450" />`
      );
    }

    return updatedHtml;
  } catch (err) {
    console.error("replaceEmbedImages error:", err);
    return html;
  }
};

/* =========================================================
   ✅ FIX WAGTAIL INTERNAL LINKS (CLICKABLE FIX)
========================================================= */
const extractInternalPageLinkIds = (html = "") => {
  if (!html) return [];
  const matches = [...html.matchAll(/<a[^>]*linktype="page"[^>]*id="(\d+)"[^>]*>/g)];
  return matches.map((m) => m[1]);
};

const fetchWagtailPageById = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/v2/pages/${id}/`);
    if (!res.ok) throw new Error("page fetch failed");
    return await res.json();
  } catch (err) {
    return null;
  }
};

const buildFrontendUrlFromWagtailPage = (pageData) => {
  if (!pageData) return "#";
  
  const type = (pageData?.meta?.type || "").toLowerCase();
  const slug = pageData?.meta?.slug || pageData?.slug;

  if (!slug) return "#";

  if (type.includes("news")) return `/news/${slug}`;
  if (type.includes("ayurveda")) return `/ayurveda/${slug}`;
  if (type.includes("homeopathy")) return `/homeopathy/${slug}`;
  if (type.includes("wellness")) return `/wellness/${slug}`;
  if (type.includes("yoga")) return `/yoga-exercise/${slug}`;
  if (type.includes("article")) return `/articles/${slug}`;
  if (type.includes("condition")) return `/conditions/${slug}`;
  if (type.includes("drug")) return `/drugs/${slug}`;

  return `/${slug}`;
};

const fixWagtailInternalLinks = async (html = "", safeBaseUrl = "") => {
  if (!html) return "";

  let updated = html;

  try {
    const ids = extractInternalPageLinkIds(updated);

    for (const id of ids) {
      const pageData = await fetchWagtailPageById(id, safeBaseUrl);
      const url = pageData ? buildFrontendUrlFromWagtailPage(pageData) : "#";

      updated = updated.replace(
        new RegExp(`<a([^>]*?)linktype="page"([^>]*?)id="${id}"([^>]*?)>`, "g"),
        `<a$1$2href="${url}"$3>`
      );
    }

    // Fix document links
    updated = updated.replace(
      /<a([^>]*?)linktype="document"([^>]*?)id="(\d+)"([^>]*?)>/g,
      `<a$1$2href="${CMS_API_URL}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
    );

    // Remove leftover wagtail attributes
    updated = updated.replace(/linktype="[^"]*"/g, "");
    updated = updated.replace(/\s?id="\d+"/g, "");

    // Make external links open in new tab
    updated = updated.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/g,
      `<a$1href="$2"$3 target="_blank" rel="noopener noreferrer">`
    );
  } catch (error) {
    console.error("Error fixing internal links:", error);
  }

  return updated;
};

/* =========================================================
   ✅ TOC Helpers
========================================================= */
const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractHeadings = (html) => {
  if (!html) return [];
  const matches = [...html.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
    id: slugify(m[2].replace(/<\/?[^>]+(>|$)/g, "").trim())
  }));
};

const addHeadingIds = (html, headings) => {
  if (!html || !headings?.length) return html;

  let updated = html;
  headings.forEach((h) => {
    if (!h.id) return;
    
    updated = updated.replace(
      new RegExp(`<h${h.level}([^>]*)>${h.text}</h${h.level}>`, "i"),
      `<h${h.level}$1 id="${h.id}">${h.text}</h${h.level}>`
    );
  });

  return updated;
};

/* =========================================================
   ✅ Date Display Functions
========================================================= */
const formatDisplayDate = (dateString, includeTime = false) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };

  return date.toLocaleDateString("en-US", options);
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

/* =========================================================
   ✅ Author/Reviewer Helper Functions
========================================================= */
const getAuthorDisplayName = (author) => {
  if (!author) return "HealthInfo Staff";
  return author.name || "HealthInfo Staff";
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
   ✅ MAIN COMPONENT
========================================================= */
export default function NewsArticle({ 
  article: initialArticle, 
  relatedArticles: initialRelated,
  processedBody: initialProcessedBody,
  processedReferences: initialProcessedReferences,
  headings: initialHeadings,
  mainImageUrl: initialMainImageUrl
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
        }
      } catch (error) {
        console.error("Error processing content:", error);
      }
    };

    if (rawBody || rawReferences) {
      processAllContent();
    }
  }, [rawBody, rawReferences, safeCMS, initialProcessedBody, initialProcessedReferences]);

  /* ✅ Mark content as loaded when hero image loads */
  useEffect(() => {
    if (!pageArticle?.image) {
      setHeroImageLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = getProxiedImageUrl(pageArticle.image);
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
  }, [pageArticle?.image]);

  /* ✅ Fetch article if not provided via props */
  useEffect(() => {
    if (!initialArticle && router.query.slug) {
      fetchArticle();
    }
  }, [router.query.slug, initialArticle]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${safeCMS}/api/news/${router.query.slug}/`);
      if (!res.ok) throw new Error("Article not found");
      const data = await res.json();
      setPageArticle(data);
      
      try {
        const relatedRes = await fetch(`${safeCMS}/api/news/?limit=6`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          const relatedList = Array.isArray(relatedData) ? relatedData : (relatedData.results || []);
          setRelatedArticles(relatedList.filter(v => v.slug !== router.query.slug).slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to fetch related articles:", e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (router.isFallback || loading) {
    return <SkeletonLoader />;
  }

  if (!pageArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
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
  const sourceName = pageArticle.source || "Health News";

  const publishedDate =
    pageArticle.publish_date ||
    pageArticle.first_published_at ||
    pageArticle.created_at;

  const updatedDate = pageArticle.updated_at || pageArticle.last_published_at;

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
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${
          router.asPath
        }`;

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
        {mainImageUrl.includes('161.118.167.107') && (
          <link rel="preconnect" href="http://161.118.167.107" />
        )}
        
        {/* Schema.org markup for citations */}
        {pageArticle.references && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": pageArticle.title,
                "datePublished": publishedDate,
                "dateModified": updatedDate || publishedDate,
                "author": {
                  "@type": "Person",
                  "name": authorDisplayName
                },
                "citation": pageArticle.references.replace(/<[^>]*>/g, '').slice(0, 500)
              })
            }}
          />
        )}
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
            publishedTime: publishedDate,
            modifiedTime: updatedDate,
            authors: authorDisplayName ? [authorDisplayName] : [],
            tags: ["news", "health", pageArticle.category?.name].filter(Boolean),
          },
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 above-fold">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-gray-800 transition-colors">
            News
          </Link>
          {pageArticle.category?.name && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">
                {pageArticle.category.name}
              </span>
            </>
          )}
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Content */}
            <article className="above-fold">
              {/* Hero Image */}
              <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
                <img
                  src={mainImageUrl}
                  alt={pageArticle.title}
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
              <h1 className="text-4xl font-extrabold tracking-tight mb-3">
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

              {/* Timeline */}
              <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Article Timeline
                </h3>
                <div className="space-y-2">
                  {publishedDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Published:</span>
                      <time dateTime={publishedDate} className="font-semibold">
                        {formatDisplayDate(publishedDate)}
                      </time>
                      <span className="text-gray-500">
                        ({getTimeAgo(publishedDate)})
                      </span>
                    </div>
                  )}
                  {updatedDate && updatedDate !== publishedDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Updated:</span>
                      <time dateTime={updatedDate} className="font-semibold">
                        {formatDisplayDate(updatedDate)}
                      </time>
                      <span className="text-gray-500">
                        ({getTimeAgo(updatedDate)})
                      </span>
                    </div>
                  )}
                </div>
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
                  <ul className="space-y-2 text-sm">
                    {headings.map((h, idx) => (
                      <li
                        key={`${h.text}-${idx}`}
                        className={h.level === 3 ? "ml-4" : ""}
                      >
                        <a
                          href={`#${slugify(h.text)}`}
                          className="text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Body Content */}
              {contentLoaded && pageArticle.body && (
                <div className="mb-12">
                  <div
                    className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto"
                    dangerouslySetInnerHTML={{ __html: finalBodyHtml }}
                  />
                </div>
              )}

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
                                <img
                                  src={relatedImage}
                                  alt={related.title}
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
                              <div>
                                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                  {related.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {formatDisplayDate(
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
                
                {/* ✅ Reference quick link widget */}
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
                        <img
                          src={relatedImage}
                          alt={related.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={240}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDisplayDate(
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
    </>
  );
}

/* =========================================================
   STATIC GENERATION WITH PERFORMANCE OPTIMIZATIONS
========================================================= */
export async function getStaticPaths() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    console.log("🔍 Fetching news paths from:", `${apiUrl}/api/news/paths`);

    const res = await fetch(`${apiUrl}/api/news/paths`);
    if (!res.ok) throw new Error(`Failed to fetch paths: ${res.status}`);

    const slugs = await res.json();
    const paths = slugs.map((slug) => ({ params: { slug } }));

    console.log(`✅ Found ${paths.length} news paths`);
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching news paths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const start = Date.now();
    console.log(`📡 Fetching news article: ${params.slug} from Oracle CMS`);
    
    const [article, relatedArticles] = await Promise.all([
      fetchNewsBySlug(params.slug, locale),
      fetchRelatedNews(params.slug).catch(() => [])
    ]);
    
    if (!article) return { notFound: true };
    
    const safeCMS = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    
    let processedBody = "";
    let processedReferences = "";
    let headings = [];
    
    if (article.body) {
      const fixedMedia = fixMediaUrls(article.body || "");
      const replaced = await replaceEmbedImages(fixedMedia, safeCMS);
      const linked = await fixWagtailInternalLinks(replaced, safeCMS);
      headings = extractHeadings(linked);
      processedBody = addHeadingIds(linked, headings);
    }
    
    if (article.references) {
      const fixedRefs = fixMediaUrls(article.references || "");
      const linked = await fixWagtailInternalLinks(fixedRefs, safeCMS);
      processedReferences = formatReferences(linked);
    }
    
    const mainImageUrl = getProxiedImageUrl(article.image);
    
    console.log(`✅ Generated news article ${params.slug} in ${Date.now() - start}ms`);
    
    return {
      props: { 
        article,
        relatedArticles: relatedArticles || [],
        processedBody,
        processedReferences,
        headings,
        mainImageUrl
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching news article ${params.slug}:`, error);
    return { notFound: true };
  }
}